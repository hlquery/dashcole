import { getSchoolContext, requirePermission } from './school-context.js';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { createUpload, safeUploadPath, persistUpload, tenantUploadKey } from './uploads.js';
import { clearDashboardCache, controlModels, models, pool, redis, sequelize, PLATFORM_BOOTSTRAP_EMAILS } from './database.js';
import { queueWelcome } from './services/mail.js';
import { databaseForTenant } from './database-routing.js';
import { sendPasswordForgot } from './mailer.js';
import { clearPresence, clearPresenceMany, touchPresence } from './services/session-presence.js';
import { linkTenantIdentity, setTenantMembershipAccess } from './tenant-identity.js';
import { attachIpGeo, lookupIpCountry } from './services/geoip.js';
import { applyDemoModeToUser, isDemoMode, isDashboardDemoRequest } from './demo-mode.js';

const SESSION_TTL = 60 * 60 * 12;
const SESSION_HISTORY_LIMIT = 30;
export const avatarUpload = createUpload({ kind: 'avatar' });

function sessionKey(token) { return `dashcole:session:${token}`; }
function sessionIndexKey(userId) { return `dashcole:user-sessions:${userId}`; }
function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function clientIp(req) {
  const forwarded = String(req.get('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || null;
}
function ownSessionWhere({ globalUserId, userId }) {
  if (globalUserId) return { [Op.or]: [{ globalUserId }, { userId }] };
  return { userId };
}

async function identityUserIds({ globalUserId, userId }) {
  const userIds = new Set();
  if (userId) userIds.add(userId);
  if (!globalUserId) return userIds;
  const memberships = await controlModels.TenantMembership.findAll({
    where: { globalUserId },
    attributes: ['userId'],
    raw: true,
  });
  for (const row of memberships) {
    const membershipUserId = row.userId ?? row.user_id;
    if (membershipUserId) userIds.add(membershipUserId);
  }
  return userIds;
}

/**
 * Hashes de tokens que siguen vivos en Redis.
 * El índice puede quedar sucio cuando el TTL del token caduca sin logout.
 */
async function liveSessionHashesForIdentity({ globalUserId, userId, currentToken }) {
  const live = new Set();
  if (currentToken) live.add(tokenHash(currentToken));
  if (!redis.isReady) return live;
  const userIds = await identityUserIds({ globalUserId, userId });
  for (const id of userIds) {
    const tokens = await redis.sMembers(sessionIndexKey(id));
    for (const token of tokens) {
      const exists = await redis.exists(sessionKey(token));
      if (!exists) {
        await redis.sRem(sessionIndexKey(id), token);
        await clearPresence(token);
        continue;
      }
      live.add(tokenHash(token));
    }
  }
  return live;
}

/** Marca como cerradas las filas MySQL cuya sesión Redis ya no existe. */
async function reconcileExpiredOwnSessions({ globalUserId, userId, currentToken }) {
  const live = await liveSessionHashesForIdentity({ globalUserId, userId, currentToken });
  const open = await controlModels.SessionRecord.findAll({
    where: { ...ownSessionWhere({ globalUserId, userId }), revokedAt: null },
    attributes: ['id', 'tokenHash'],
    raw: true,
  });
  const staleIds = open
    .filter((row) => {
      const hash = row.tokenHash || row.token_hash;
      return hash && !live.has(hash);
    })
    .map((row) => row.id)
    .filter(Boolean);
  if (staleIds.length) {
    await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { id: staleIds } });
  }
  return live;
}

async function pruneOwnSessionHistory({ globalUserId, userId }) {
  if (!userId && !globalUserId) return;
  const where = ownSessionWhere({ globalUserId, userId });
  const keep = await controlModels.SessionRecord.findAll({
    where,
    attributes: ['id'],
    order: [['lastSeenAt', 'DESC'], ['id', 'DESC']],
    limit: SESSION_HISTORY_LIMIT,
    raw: true,
  });
  const keepIds = keep.map((row) => row.id).filter(Boolean);
  if (!keepIds.length) return;
  await controlModels.SessionRecord.destroy({
    where: {
      ...where,
      id: { [Op.notIn]: keepIds },
    },
  });
}
function isReservedPlatformEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  if (!value) return false;
  const configured = String(process.env.PLATFORM_ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(configured && value === configured) || PLATFORM_BOOTSTRAP_EMAILS.has(value);
}
function canAssignPlatformRoles(user) {
  return user?.platformPermissions?.includes('platform.accounts.roles');
}
function isPlatformOnlySchoolUser(user) {
  return user?.role === 'super_admin' || isReservedPlatformEmail(user?.username);
}

async function ensureGlobalIdentity(user) {
  const { globalUser } = await linkTenantIdentity({
    email: user.username || user.email,
    schoolId: user.school_id || user.schoolId,
    userId: user.id,
    role: user.role,
    fullName: user.full_name || user.fullName,
    passwordHash: user.password_hash || user.passwordHash,
    phone: user.phone || null,
  });
  return globalUser;
}

export function publicUser(user, extras = {}) {
  const isDirector = user.role === 'director' || user.role === 'school_admin' || user.role === 'super_admin';
  const isUtp = user.role === 'utp';
  const isManager = user.role === 'manager';
  const isMonitor = user.role === 'monitor';
  const isFinancialAgent = ['finance', 'agente_finanzas'].includes(user.role);
  const isLearner = ['guardian', 'student'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const demoMode = Boolean(extras.demoMode) || (extras.req ? (isDemoMode() && isDashboardDemoRequest(extras.req)) : isDemoMode());
  const readOnly = Boolean(extras.readOnly) || demoMode;
  return {
    id: user.id,
    schoolId: user.school_id || user.schoolId,
    globalUserId: user.global_user_id || user.globalUserId || null,
    username: user.username,
    phone: user.phone || '',
    whatsappOptIn: Boolean(user.whatsapp_opt_in ?? user.whatsappOptIn),
    fullName: user.full_name || user.fullName,
    role: user.role,
    avatarKey: user.avatar_key || user.avatarKey || null,
    signatureKey: user.signature_key || user.signatureKey || null,
    hasSignature: Boolean(user.signature_key || user.signatureKey),
    demoMode,
    readOnly,
    accessMode: demoMode ? 'demo' : (readOnly ? 'historical' : 'full'),
    permissions: {
      manageUsers: !readOnly && !isMonitor && !isFinancialAgent && !isLearner && !isTeacher && (isDirector || isUtp || Boolean(user.can_manage_users ?? user.canManageUsers)),
      manageGrades: !readOnly && !isMonitor && !isFinancialAgent && !isLearner && (isDirector || isUtp || Boolean(user.can_manage_grades ?? user.canManageGrades)),
      viewReports: !isFinancialAgent && !isLearner && (isDirector || isUtp || isMonitor || Boolean(user.can_view_reports ?? user.canViewReports)),
      // Jefe UTP: casi admin académico, sin configuración institucional del colegio.
      manageSchool: !readOnly && !isUtp && !isMonitor && !isFinancialAgent && !isLearner && !isTeacher && (isDirector || Boolean(user.can_manage_school ?? user.canManageSchool)),
      manageHr: !readOnly && !isMonitor && !isLearner && !isTeacher && (isDirector || isUtp || isFinancialAgent || Boolean(user.can_manage_hr ?? user.canManageHr)),
      manageFinance: !readOnly && !isMonitor && !isLearner && !isTeacher && (isDirector || isUtp || isFinancialAgent || Boolean(user.can_manage_finance ?? user.canManageFinance)),
      approveLeave: !readOnly && !isMonitor && !isLearner && (
        isDirector || isUtp || isManager || isFinancialAgent
        || Boolean(user.can_approve_leave ?? user.canApproveLeave)
        || Boolean(user.can_manage_hr ?? user.canManageHr)
        || Boolean(user.can_manage_users ?? user.canManageUsers)
      ),
      'sige.view': isDirector || isUtp || Boolean(user.can_view_sige ?? user.canViewSige),
      'sige.configure': !readOnly && (isDirector || isUtp || Boolean(user.can_configure_sige ?? user.canConfigureSige)),
      'sige.sync': !readOnly && (isDirector || isUtp || Boolean(user.can_sync_sige ?? user.canSyncSige)),
      'sige.view_logs': isDirector || isUtp || Boolean(user.can_view_sige_logs ?? user.canViewSigeLogs),
    }
  };
}

/** Estudiantes con historial pueden entrar si su membresía del colegio sigue activa.
 *  Si se revocó el acceso, la membresía queda suspended y no llega aquí. */
function isLoginEligibleLocalUser(user) {
  if (!user) return false;
  if (user.active === false || user.active === 0) {
    // Solo estudiantes retirados con acceso histórico (membresía aún activa).
    return user.role === 'student';
  }
  return true;
}

async function resolveStudentReadOnly(tenantModels, user) {
  if (!user || user.role !== 'student') return false;
  if (user.active === false) return true;
  const student = await tenantModels.Student.findOne({
    where: { userId: user.id, schoolId: user.school_id || user.schoolId },
    attributes: ['id', 'active'],
    raw: true,
  });
  if (!student) return true;
  return student.active === false;
}

export function assertLearnerCanWrite(user) {
  if (user?.demoMode || user?.accessMode === 'demo') {
    const err = new Error('Modo demo: solo lectura. No puedes modificar datos en este entorno.');
    err.status = 403;
    err.code = 'DEMO_READ_ONLY';
    return err;
  }
  if (user?.readOnly || user?.accessMode === 'historical') {
    const err = new Error('Tu acceso a este colegio es solo historial. No puedes agregar ni modificar contenidos.');
    err.status = 403;
    return err;
  }
  return null;
}

const FORGOT_OK_MESSAGE = 'Si la cuenta existe y tiene acceso a un colegio, te enviamos un correo con una contraseña temporal.';

async function syncLocalPasswords(memberships, email, passwordHash) {
  for (const membership of memberships) {
    try {
      const database = await databaseForTenant(membership.schoolId, { activeOnly: false });
      await database.models.User.update({ passwordHash }, { where: { id: membership.userId, schoolId: membership.schoolId } });
    } catch {
      /* Colegio offline: seguir con el resto. */
    }
  }
  const username = String(email || '').trim().toLowerCase();
  if (!username) return;
  const tenants = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['schoolId'], raw: true });
  for (const tenant of tenants) {
    try {
      const database = await databaseForTenant(tenant.schoolId, { activeOnly: false });
      await database.models.User.update({ passwordHash }, { where: { schoolId: tenant.schoolId, username } });
    } catch {
      /* Colegio offline. */
    }
  }
}

export async function forgotPassword(req, res) {
  const identifier = String(req.body.email || req.body.username || '').trim().toLowerCase();
  if (!identifier || identifier.length > 150 || !identifier.includes('@')) {
    return res.status(400).json({ message: 'Ingresá el correo de acceso de tu cuenta.' });
  }
  if (!redis.isReady) return res.status(503).json({ message: 'El servicio no está disponible. Intenta más tarde.' });

  const attemptKey = `dashcole:forgot:${req.ip}`;
  const emailKey = `dashcole:forgot-email:${identifier}`;
  const [ipAttempts, emailAttempts] = await Promise.all([redis.incr(attemptKey), redis.incr(emailKey)]);
  if (ipAttempts === 1) await redis.expire(attemptKey, 3600);
  if (emailAttempts === 1) await redis.expire(emailKey, 3600);
  if (ipAttempts > 8 || emailAttempts > 3) {
    return res.status(429).json({ message: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' });
  }

  const ok = () => res.json({ message: FORGOT_OK_MESSAGE });

  let globalUser = await controlModels.GlobalUser.findOne({ where: { email: identifier, status: 'active' } });
  if (!globalUser) {
    const [legacyRows] = await pool.query(
      `SELECT id, school_id FROM users WHERE username = ? AND active = TRUE LIMIT 1`,
      [identifier],
    );
    if (legacyRows[0]) {
      const membership = await controlModels.TenantMembership.findOne({
        where: { userId: legacyRows[0].id, schoolId: legacyRows[0].school_id },
        raw: true,
      });
      if (membership) globalUser = await controlModels.GlobalUser.findByPk(membership.globalUserId);
    }
  }
  if (!globalUser || globalUser.status !== 'active') return ok();

  const memberships = await controlModels.TenantMembership.findAll({
    where: { globalUserId: globalUser.id, status: 'active' },
    raw: true,
  });
  if (!memberships.length) return ok();

  const email = String(globalUser.email || '').trim().toLowerCase();
  if (!email.includes('@')) return ok();

  const password = crypto.randomBytes(12).toString('base64url');

  let delivery;
  try {
    delivery = await sendPasswordForgot({
      email,
      fullName: globalUser.fullName,
      password,
      messageId: `<forgot-${globalUser.id}-${Date.now()}@hlquery.com>`,
    });
  } catch (error) {
    return res.status(503).json({
      message: error.message || 'No pudimos enviar el correo de recuperación. Intenta más tarde o contactá a dirección.',
    });
  }
  if (!delivery?.sent) {
    return res.status(503).json({
      message: 'No pudimos enviar el correo de recuperación. Revisá la configuración SMTP o contactá a dirección.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await globalUser.update({ passwordHash });
  await syncLocalPasswords(memberships, email, passwordHash);
  await Promise.all(memberships.map(row => revokeUserSessions(row.userId)));
  await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { globalUserId: globalUser.id, revokedAt: null } });

  return ok();
}

export async function login(req, res) {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!username || username.length > 150 || !password) return res.status(400).json({ message: 'Ingresa usuario o correo y contraseña.' });
  if (!redis.isReady) return res.status(503).json({ message: 'El servicio de sesiones no está disponible.' });

  const attemptKey = `dashcole:login:${req.ip}`;
  const attempts = await redis.incr(attemptKey);
  if (attempts === 1) await redis.expire(attemptKey, 600);
  if (attempts > 8) return res.status(429).json({ message: 'Demasiados intentos. Espera unos minutos.' });

  let globalUser = await controlModels.GlobalUser.findOne({ where: { email: username, status: 'active' } });
  let memberships = globalUser
    ? await controlModels.TenantMembership.findAll({ where: { globalUserId: globalUser.id, status: 'active' }, order: [['id', 'ASC']], raw: true })
    : [];
  const requestedTenantId = Number(req.body.tenantId);
  const hasTenantRequest = req.body.tenantId !== undefined && req.body.tenantId !== null && String(req.body.tenantId).trim() !== '';
  const requestedMembership = Number.isSafeInteger(requestedTenantId) && requestedTenantId > 0
    ? memberships.find((row) => Number(row.schoolId) === requestedTenantId)
    : null;
  if (hasTenantRequest && !requestedMembership) {
    return res.status(403).json({ message: 'No tienes una membresía activa en ese colegio.' });
  }

  const candidates = requestedMembership ? [requestedMembership] : memberships;
  const viable = [];
  let passwordMatched = false;

  for (const candidate of candidates) {
    try {
      const tenantDatabase = await databaseForTenant(candidate.schoolId, { activeOnly: false });
      const candidateUser = await tenantDatabase.models.User.findOne({
        where: { id: candidate.userId, schoolId: candidate.schoolId },
        raw: true,
      });
      if (!candidateUser || !globalUser || !isLoginEligibleLocalUser(candidateUser)) continue;

      let validPassword = await bcrypt.compare(password, globalUser.passwordHash);
      if (!validPassword && await bcrypt.compare(password, candidateUser.passwordHash)) {
        validPassword = true;
        await globalUser.update({ passwordHash: candidateUser.passwordHash });
      }
      if (!validPassword) continue;
      passwordMatched = true;
      const readOnly = await resolveStudentReadOnly(tenantDatabase.models, candidateUser);
      viable.push({ membership: candidate, user: candidateUser, readOnly, database: tenantDatabase });
    } catch {
      /* Colegio suspendido u offline: seguir con otras membresías. */
    }
  }

  // Un solo colegio disponible: entrar directo. Varios: preguntar siempre.
  // Operadores de plataforma no eligen colegio al login: van a la consola.
  if (!hasTenantRequest && passwordMatched) {
    const platformRolesEarly = globalUser
      ? await controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true })
      : [];
    const isPlatformOperator = platformRolesEarly.some((row) => (row.permissions || []).includes('platform.accounts.read'));
    if (viable.length === 1) {
      // Sin conflicto: no preguntar.
    } else if (viable.length > 1 && !isPlatformOperator) {
      const preferredSchoolId = Number(globalUser.preferredSchoolId || globalUser.preferred_school_id || 0);
      const schoolRows = await controlModels.Tenant.findAll({
        where: { schoolId: viable.map((item) => item.membership.schoolId) },
        attributes: ['schoolId', 'name', 'slug', 'status'],
        raw: true,
      });
      const choiceList = viable.map((item) => {
        const row = item.membership;
        const school = schoolRows.find((entry) => Number(entry.schoolId) === Number(row.schoolId));
        return {
          id: row.id,
          schoolId: row.schoolId,
          role: row.role,
          available: true,
          readOnly: Boolean(item.readOnly),
          preferred: preferredSchoolId > 0 && Number(row.schoolId) === preferredSchoolId,
          school: school
            ? { schoolId: school.schoolId, name: school.name, slug: school.slug, status: school.status }
            : null,
        };
      });
      return res.json({
        needsSchoolChoice: true,
        message: 'Tu cuenta está asociada a más de un colegio. Elige a cuál quieres entrar.',
        preferredSchoolId: preferredSchoolId || null,
        askSchoolOnLogin: true,
        memberships: choiceList,
      });
    }
  }

  let membership = viable[0]?.membership || null;
  let user = viable[0]?.user || null;
  let readOnly = Boolean(viable[0]?.readOnly);
  let validPassword = passwordMatched;

  if (!user || !validPassword) {
    const [legacyRows] = await pool.query(
      `SELECT id, school_id, username, password_hash, full_name, role, active, can_manage_users,
        can_manage_grades, can_view_reports, can_manage_school, can_manage_hr, can_manage_finance, can_approve_leave,
        avatar_key, signature_key
       FROM users WHERE username = ? AND school_id IN (SELECT id FROM schools WHERE active = TRUE)
         AND (active = TRUE OR role = 'student')
       LIMIT 5`,
      [username]
    );
    for (const legacy of legacyRows) {
      if (!(await bcrypt.compare(password, legacy.password_hash))) continue;
      validPassword = true;
      passwordMatched = true;
      globalUser = await ensureGlobalIdentity(legacy);
      memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: globalUser.id, status: 'active' }, raw: true });
      if (!hasTenantRequest && memberships.length > 1) {
        const preferredSchoolId = Number(globalUser.preferredSchoolId || globalUser.preferred_school_id || 0);
        const schoolRows = await controlModels.Tenant.findAll({
          where: { schoolId: memberships.map((row) => row.schoolId) },
          attributes: ['schoolId', 'name', 'slug', 'status'],
          raw: true,
        });
        return res.json({
          needsSchoolChoice: true,
          message: 'Tu cuenta está asociada a más de un colegio. Elige a cuál quieres entrar.',
          preferredSchoolId: preferredSchoolId || null,
          askSchoolOnLogin: true,
          memberships: memberships.map((row) => ({
            id: row.id,
            schoolId: row.schoolId,
            role: row.role,
            available: Number(row.schoolId) === Number(legacy.school_id),
            readOnly: legacy.role === 'student' && legacy.active === 0,
            preferred: preferredSchoolId > 0 && Number(row.schoolId) === preferredSchoolId,
            school: schoolRows.find((item) => Number(item.schoolId) === Number(row.schoolId)) || null,
          })),
        });
      }
      if (hasTenantRequest && Number(legacy.school_id) !== requestedTenantId) continue;
      user = legacy;
      membership = memberships.find((row) => Number(row.schoolId) === Number(legacy.school_id)) || memberships[0] || null;
      readOnly = legacy.role === 'student' && (legacy.active === false || legacy.active === 0);
      if (globalUser.passwordHash !== legacy.password_hash) await globalUser.update({ passwordHash: legacy.password_hash });
      break;
    }
    if (!user) validPassword = false;
  }

  // Consola plataforma: si el colegio de la membresía está suspendido, igual permitir login con clave global.
  if ((!user || !validPassword) && globalUser && await bcrypt.compare(password, globalUser.passwordHash)) {
    const platformRolesEarly = await controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true });
    const platformPermissionsEarly = [...new Set(platformRolesEarly.flatMap((row) => row.permissions || []))];
    if (platformPermissionsEarly.includes('platform.accounts.read') && memberships[0]) {
      try {
        const tenantDatabase = await databaseForTenant(memberships[0].schoolId, { activeOnly: false });
        user = await tenantDatabase.models.User.findOne({ where: { id: memberships[0].userId, schoolId: memberships[0].schoolId, active: true }, raw: true });
        membership = memberships[0];
        readOnly = false;
        validPassword = Boolean(user);
      } catch { /* sin identidad local usable */ }
    }
    if (!user || !validPassword) {
      return res.status(403).json({
        message: 'La contraseña es correcta, pero esta cuenta no tiene un colegio activo asignado. Pedí a un administrador que te vincule a un establecimiento.',
      });
    }
  }
  if (!user || !validPassword) {
    return res.status(401).json({ message: 'Usuario, correo o contraseña incorrectos.' });
  }
  if (hasTenantRequest && !viable.length && membership && Number(membership.schoolId) !== requestedTenantId) {
    return res.status(403).json({ message: 'No pudimos abrir ese colegio. Prueba con otro o contacta a dirección.' });
  }

  await redis.del(attemptKey);
  const token = crypto.randomBytes(32).toString('hex');
  globalUser ||= await ensureGlobalIdentity(user);
  await globalUser.update({ lastLoginAt: new Date(), fullName: user.full_name || user.fullName });
  const [platformRoles, schools] = await Promise.all([
    controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true }),
    controlModels.Tenant.findAll({ where: { schoolId: memberships.map((row) => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true }),
  ]);
  const membershipList = memberships.map((row) => ({
    id: row.id,
    schoolId: row.schoolId,
    role: row.role,
    school: schools.find((school) => school.schoolId === row.schoolId),
  }));
  const platformPermissions = [...new Set(platformRoles.flatMap((row) => row.permissions || []))];
  const platformConsole = platformPermissions.includes('platform.accounts.read');
  if (user.role === 'student' && readOnly === false && viable[0]?.database) {
    readOnly = await resolveStudentReadOnly(viable[0].database.models, user);
  } else if (user.role === 'student' && !viable.length) {
    try {
      const db = await databaseForTenant(user.school_id || user.schoolId, { activeOnly: false });
      readOnly = await resolveStudentReadOnly(db.models, user);
    } catch { readOnly = user.active === false || user.active === 0; }
  }
  const safeUser = applyDemoModeToUser({
    ...publicUser(user, { readOnly, req }),
    globalUserId: globalUser.id,
    preferredSchoolId: Number(globalUser.preferredSchoolId || globalUser.preferred_school_id || 0) || null,
    askSchoolOnLogin: !(globalUser.askSchoolOnLogin === false || globalUser.ask_school_on_login === false || globalUser.askSchoolOnLogin === 0 || globalUser.ask_school_on_login === 0),
    platformRoles: platformRoles.map((row) => row.role),
    platformPermissions,
    memberships: membershipList,
    platformConsole,
  }, req);
  await redis.setEx(sessionKey(token), SESSION_TTL, JSON.stringify(safeUser));
  await redis.sAdd(sessionIndexKey(user.id), token);
  await redis.expire(sessionIndexKey(user.id), SESSION_TTL);
  await touchPresence(token);
  await controlModels.SessionRecord.create({
    tokenHash: tokenHash(token),
    globalUserId: globalUser.id,
    userId: user.id,
    schoolId: safeUser.schoolId,
    ip: clientIp(req),
    userAgent: String(req.get('user-agent') || '').slice(0, 255),
  });
  await pruneOwnSessionHistory({ globalUserId: globalUser.id, userId: user.id });
  res.json({ token, user: safeUser, memberships: membershipList, expiresIn: SESSION_TTL });
}

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return res.status(401).json({ message: 'Debes iniciar sesión.' });
  if (!redis.isReady) return res.status(503).json({ message: 'El servicio de sesiones no está disponible.' });

  const value = await redis.get(sessionKey(token));
  if (!value) return res.status(401).json({ message: 'Tu sesión venció. Inicia sesión nuevamente.' });
  req.authToken = token;
  let sessionUser;
  try { sessionUser = JSON.parse(value); req.user = sessionUser; getSchoolContext(req); }
  catch {
    await redis.del(sessionKey(token));
    await clearPresence(token);
    return res.status(401).json({ message: 'Tu sesión no es válida. Inicia sesión nuevamente.' });
  }

  let tenantDatabase = null;
  let current = null;
  let activeSchool = false;
  let tenantRoutable = false;
  try {
    tenantDatabase = await databaseForTenant(req.user.schoolId, { activeOnly: false });
    tenantRoutable = true;
    current = await tenantDatabase.models.User.findOne({ where: { id: req.user.id, schoolId: req.user.schoolId }, raw: true });
    if (current && !isLoginEligibleLocalUser(current)) current = null;
    activeSchool = Boolean(current && await tenantDatabase.models.School.count({ where: { id: req.user.schoolId, active: true } }));
  } catch {
    tenantRoutable = false;
  }

  let globalUser = null;
  if (current) globalUser = await ensureGlobalIdentity(current);
  else if (sessionUser.globalUserId) globalUser = await controlModels.GlobalUser.findByPk(sessionUser.globalUserId);
  if (!globalUser || globalUser.status !== 'active') {
    await redis.del(sessionKey(token));
    await clearPresence(token);
    return res.status(401).json({ message: 'Tu cuenta ya no tiene acceso.' });
  }

  const [platformRoles, memberships] = await Promise.all([
    controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true }),
    controlModels.TenantMembership.findAll({ where: { globalUserId: globalUser.id, status: 'active' }, raw: true }),
  ]);
  const platformPermissions = [...new Set(platformRoles.flatMap(row => row.permissions || []))];
  const hasPlatformAccess = platformPermissions.includes('platform.accounts.read');
  const schoolUnavailable = !tenantRoutable || !current || !activeSchool;

  if (schoolUnavailable && hasPlatformAccess) {
    try {
      tenantDatabase = await databaseForTenant(req.user.schoolId, { activeOnly: false });
      current = await tenantDatabase.models.User.findOne({ where: { id: req.user.id, schoolId: req.user.schoolId, active: true }, raw: true });
    } catch { tenantDatabase = null; }
    if (!current) {
      current = {
        id: sessionUser.id,
        schoolId: sessionUser.schoolId,
        username: sessionUser.username || globalUser.email,
        fullName: sessionUser.fullName || globalUser.fullName,
        role: sessionUser.role || 'super_admin',
        phone: sessionUser.phone || globalUser.phone || '',
        whatsappOptIn: false,
        avatarKey: sessionUser.avatarKey || null,
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
      };
    }
  } else if (schoolUnavailable) {
    await redis.del(sessionKey(token));
    return res.status(401).json({ message: 'Tu cuenta ya no tiene acceso.' });
  }

  const schools = await controlModels.Tenant.findAll({ where: { schoolId: memberships.map(row => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true });
  const impersonating = Boolean(sessionUser.impersonation);
  // Impersonation must never unlock the platform console, even if the target has global roles.
  const platformConsole = impersonating
    ? false
    : (Boolean(sessionUser.platformConsole) || (schoolUnavailable && hasPlatformAccess));
  let readOnly = Boolean(sessionUser.readOnly);
  if (tenantDatabase && current?.role === 'student') {
    readOnly = await resolveStudentReadOnly(tenantDatabase.models, current);
  } else if (current?.role === 'student' && current.active === false) {
    readOnly = true;
  }
  // Platform operators inside a school must see everything, regardless of the linked local role.
  // En modo demo no elevamos permisos de escritura.
  const elevatePlatformOperator = hasPlatformAccess && !platformConsole && !impersonating && !readOnly && !(isDemoMode() && isDashboardDemoRequest(req));
  const sessionBase = elevatePlatformOperator
    ? {
        ...current,
        role: ['super_admin', 'school_admin', 'director'].includes(current?.role) ? current.role : 'school_admin',
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        canViewSige: true,
        canConfigureSige: true,
        canSyncSige: true,
        canViewSigeLogs: true,
      }
    : current;
  req.user = applyDemoModeToUser({
    ...publicUser(sessionBase, { readOnly, req }),
    globalUserId: globalUser.id,
    preferredSchoolId: Number(globalUser.preferredSchoolId || globalUser.preferred_school_id || 0) || null,
    askSchoolOnLogin: !(globalUser.askSchoolOnLogin === false || globalUser.ask_school_on_login === false || globalUser.askSchoolOnLogin === 0 || globalUser.ask_school_on_login === 0),
    platformRoles: impersonating ? [] : platformRoles.map(row => row.role),
    platformPermissions: impersonating ? [] : platformPermissions,
    memberships: memberships.map(row => ({ id: row.id, schoolId: row.schoolId, role: row.role, school: schools.find(school => school.schoolId === row.schoolId) })),
    platformConsole,
    ...(impersonating ? { impersonation: sessionUser.impersonation } : {}),
  }, req);
  if (tenantDatabase) {
    const employee = await tenantDatabase.models.Employee.findOne({ where: { userId: req.user.id, schoolId: req.user.schoolId }, attributes: ['id', 'position'] }).catch(() => null);
    req.user.position = employee?.position || '';
    req.user.employeeId = employee?.id || null;
  } else {
    req.user.position = sessionUser.position || '';
    req.user.employeeId = sessionUser.employeeId || null;
  }
  await redis.setEx(sessionKey(token), SESSION_TTL, JSON.stringify(req.user));
  await redis.expire(sessionIndexKey(req.user.id), SESSION_TTL);
  await touchPresence(token);
  // Evita escribir MySQL en cada request: lastSeen cada ~60s basta para auditoría.
  const touchGate = `dashcole:session-db-touch:${token}`;
  const shouldTouchDb = await redis.set(touchGate, '1', { NX: true, EX: 60 });
  if (shouldTouchDb === 'OK') {
    const hash = tokenHash(token);
    const [touched] = await controlModels.SessionRecord.update(
      { lastSeenAt: new Date() },
      { where: { tokenHash: hash, revokedAt: null } },
    );
    if (!touched) {
      const revoked = await controlModels.SessionRecord.count({ where: { tokenHash: hash, revokedAt: { [Op.ne]: null } } });
      if (revoked) {
        await redis.del(sessionKey(token));
        await redis.sRem(sessionIndexKey(req.user.id), token);
        await clearPresence(token);
        return res.status(401).json({ message: 'Tu sesión fue cerrada. Inicia sesión nuevamente.' });
      }
    }
  }
  next();
}

export const requireDirector = requirePermission('manageUsers');
export const requireGradeAccess = requirePermission('manageGrades');

export async function listUsers(req, res) {
  const [users] = await pool.query(`
    SELECT id, school_id, username, full_name, role, active, team_active, created_at,
      avatar_key, can_manage_users, can_manage_grades, can_view_reports, can_manage_school, can_manage_hr, can_manage_finance,
      can_approve_leave, can_view_sige, can_configure_sige, can_sync_sige, can_view_sige_logs
    FROM users
    WHERE school_id = ?
      AND role <> 'super_admin'
    ORDER BY role, full_name
  `, [req.user.schoolId]);
  const employees = await models.Employee.findAll({ where: { schoolId: req.user.schoolId }, attributes: ['userId', 'position'], raw: true });
  const positions = new Map(employees.map(employee => [employee.userId, employee.position]));
  const schoolStaff = users.filter((user) => !isReservedPlatformEmail(user.username));
  res.json(schoolStaff.map((user) => ({
    ...publicUser(user),
    position: positions.get(user.id) || '',
    active: user.team_active !== false && user.team_active !== 0,
    teamActive: user.team_active !== false && user.team_active !== 0,
    platformAccess: Boolean(user.active),
    createdAt: user.created_at,
  })));
}

function permissionsFor(input, role) {
  const permissions = input || {};
  const isDirector = ['director', 'school_admin', 'super_admin'].includes(role);
  if (['finance', 'agente_finanzas'].includes(role)) {
    return { manageUsers: false, manageGrades: false, viewReports: false, manageSchool: false, manageHr: true, manageFinance: true, approveLeave: true, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false };
  }
  if (role === 'monitor') {
    return { manageUsers: false, manageGrades: false, viewReports: true, manageSchool: false, manageHr: false, manageFinance: false, approveLeave: false, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false };
  }
  if (['guardian', 'student'].includes(role)) {
    return { manageUsers: false, manageGrades: false, viewReports: false, manageSchool: false, manageHr: false, manageFinance: false, approveLeave: false, 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false };
  }
  if (role === 'teacher') {
    return { manageUsers: false, manageGrades: Boolean(permissions.manageGrades), viewReports: Boolean(permissions.viewReports), manageSchool: false, manageHr: false, manageFinance: false, approveLeave: Boolean(permissions.approveLeave), 'sige.view': false, 'sige.configure': false, 'sige.sync': false, 'sige.view_logs': false };
  }
  if (role === 'utp') {
    // Jefe UTP: mismo poder operativo que dirección, excepto configuración institucional del colegio.
    return {
      manageUsers: true,
      manageGrades: true,
      viewReports: true,
      manageSchool: false,
      manageHr: true,
      manageFinance: true,
      approveLeave: true,
      'sige.view': true,
      'sige.configure': true,
      'sige.sync': true,
      'sige.view_logs': true,
    };
  }
  if (role === 'manager') {
    return {
      manageUsers: Boolean(permissions.manageUsers),
      manageGrades: Boolean(permissions.manageGrades),
      viewReports: Boolean(permissions.viewReports),
      manageSchool: Boolean(permissions.manageSchool),
      manageHr: Boolean(permissions.manageHr),
      manageFinance: Boolean(permissions.manageFinance),
      approveLeave: permissions.approveLeave === undefined ? true : Boolean(permissions.approveLeave),
      'sige.view': Boolean(permissions['sige.view']),
      'sige.configure': Boolean(permissions['sige.configure']),
      'sige.sync': Boolean(permissions['sige.sync']),
      'sige.view_logs': Boolean(permissions['sige.view_logs']),
    };
  }
  return {
    manageUsers: isDirector || (role === 'manager' && Boolean(permissions.manageUsers)),
    manageGrades: isDirector || Boolean(permissions.manageGrades),
    viewReports: isDirector || Boolean(permissions.viewReports),
    manageSchool: isDirector || Boolean(permissions.manageSchool),
    manageHr: isDirector || Boolean(permissions.manageHr),
    manageFinance: isDirector || Boolean(permissions.manageFinance),
    approveLeave: isDirector || Boolean(permissions.approveLeave),
    'sige.view': isDirector || Boolean(permissions['sige.view']),
    'sige.configure': isDirector || Boolean(permissions['sige.configure']),
    'sige.sync': isDirector || Boolean(permissions['sige.sync']),
    'sige.view_logs': isDirector || Boolean(permissions['sige.view_logs'])
  };
}

function validateUserInput({ username, fullName, role, password, position }, passwordRequired) {
  if (position && (position.length < 2 || position.length > 100)) return 'El tipo de profesor debe tener entre 2 y 100 caracteres.';
  const validUsername = /^[a-z0-9][a-z0-9._@-]{2,149}$/.test(username);
  if (!validUsername) return 'Ingresa un usuario o correo válido de al menos 3 caracteres.';
  if (fullName.length < 3 || fullName.length > 120) return 'Ingresa el nombre completo.';
  if (!['director', 'manager', 'monitor', 'utp', 'agente_finanzas', 'teacher', 'guardian', 'student'].includes(role)) return 'Selecciona un cargo válido.';
  if ((passwordRequired || password) && (password.length < 6 || password.length > 128)) return 'La contraseña debe tener entre 6 y 128 caracteres.';
  return null;
}

export async function createUser(req, res) {
  const generatedPassword = req.body.generatePassword === true;
  const input = {
    username: String(req.body.username || '').trim().toLowerCase(),
    fullName: String(req.body.fullName || '').trim(),
    role: String(req.body.role || ''),
    position: String(req.body.position || '').trim(),
    password: generatedPassword ? crypto.randomBytes(12).toString('base64url') : String(req.body.password || ''),
    permissions: permissionsFor(req.body.permissions, String(req.body.role || ''))
  };
  const validationError = validateUserInput(input, true);
  if (validationError) return res.status(400).json({ message: validationError });
  if (isReservedPlatformEmail(input.username) && !canAssignPlatformRoles(req.user)) {
    return res.status(403).json({ message: 'Ese correo está reservado para la administración global.' });
  }
  if (['guardian', 'student'].includes(input.role)) {
    return res.status(400).json({ message: 'Crea estudiantes y apoderados desde el flujo de matrícula para mantener sus perfiles vinculados.' });
  }
  if (req.user.role === 'manager' && input.role !== 'teacher') return res.status(403).json({ message: 'Un manager solo puede crear cuentas de profesores.' });
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const user = await sequelize.transaction(async (transaction) => {
      const createdUser = await models.User.create({
        schoolId: req.user.schoolId, createdBy: req.user.id, username: input.username,
        passwordHash, fullName: input.fullName, role: input.role,
        canManageUsers: input.permissions.manageUsers, canManageGrades: input.permissions.manageGrades,
        canViewReports: input.permissions.viewReports, canManageSchool: input.permissions.manageSchool,
        canManageHr: input.permissions.manageHr, canManageFinance: input.permissions.manageFinance,
        canApproveLeave: input.permissions.approveLeave, active: true,
        teamActive: true,
        canViewSige: input.permissions['sige.view'], canConfigureSige: input.permissions['sige.configure'],
        canSyncSige: input.permissions['sige.sync'], canViewSigeLogs: input.permissions['sige.view_logs'],
      }, { transaction });
      if (['teacher', 'agente_finanzas', 'utp'].includes(input.role)) {
        await models.Employee.create({
          schoolId: req.user.schoolId, createdBy: req.user.id, userId: createdUser.id,
          fullName: input.fullName, position: input.role === 'teacher' ? (input.position || 'Profesor') : input.role === 'utp' ? 'Jefe/a de UTP' : 'Agente de finanzas', active: true,
        }, { transaction });
      }
      return createdUser;
    });
    const identity = await linkTenantIdentity({
      email: user.username || user.email,
      schoolId: user.school_id || user.schoolId || req.user.schoolId,
      userId: user.id,
      role: user.role,
      fullName: user.full_name || user.fullName,
      passwordHash: user.password_hash || user.passwordHash,
      phone: user.phone || null,
    });
    await clearDashboardCache();
    let emailStatus = { sent: false, reason: 'La cuenta no tiene un correo asociado' };
    const reusedExisting = Boolean(identity?.reusedExisting);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.username) && !reusedExisting) {
      try {
        const [schools] = await pool.query('SELECT name FROM schools WHERE id = ? LIMIT 1', [req.user.schoolId]);
        emailStatus = await queueWelcome(req.user, 'userWelcome', {
          email: input.username,
          fullName: input.fullName,
          password: input.password,
          schoolName: schools[0]?.name || 'tu colegio',
        }, user.id);
      } catch (error) {
        console.warn('No fue posible enviar el acceso de la nueva cuenta:', error.message);
        emailStatus = { sent: false, reason: 'No fue posible enviar el correo' };
      }
    } else if (reusedExisting) {
      emailStatus = { sent: false, reason: 'La cuenta ya existía en otro colegio; se reutilizó su acceso actual.' };
    }
    if (generatedPassword && !reusedExisting) res.set('Cache-Control', 'no-store');
    res.status(201).json({
      user: { id: user.id, username: input.username, fullName: input.fullName, role: input.role, permissions: input.permissions, active: true },
      email: emailStatus,
      linkedExistingAccount: reusedExisting,
      ...(generatedPassword && !reusedExisting ? { temporaryPassword: input.password } : {}),
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.original?.code === 'ER_DUP_ENTRY' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ese usuario o correo ya está registrado.' });
    }
    throw error;
  }
}

export async function updateUser(req, res) {
  const userId = Number(req.params.id);
  const input = {
    username: String(req.body.username || '').trim().toLowerCase(),
    fullName: String(req.body.fullName || '').trim(),
    role: String(req.body.role || ''),
    position: String(req.body.position || '').trim(),
    password: String(req.body.password || ''),
    active: req.body.active !== false,
    teamActive: req.body.teamActive !== false && req.body.teamActive !== 0,
    permissions: permissionsFor(req.body.permissions, String(req.body.role || ''))
  };
  const validationError = validateUserInput(input, false);
  if (validationError) return res.status(400).json({ message: validationError });
  if (isReservedPlatformEmail(input.username) && input.username !== req.user.username && !canAssignPlatformRoles(req.user)) {
    return res.status(403).json({ message: 'Ese correo está reservado para la administración global.' });
  }
  if (req.user.role === 'manager' && input.role !== 'teacher') return res.status(403).json({ message: 'Un manager solo puede administrar cuentas de profesores.' });
  if (userId === req.user.id && (!input.active || !input.teamActive || !input.permissions.manageUsers)) {
    return res.status(400).json({ message: 'No puedes quitar el acceso administrativo de tu propia cuenta.' });
  }

  const [existing] = await pool.query('SELECT id, full_name, role, username, active, team_active FROM users WHERE id = ? AND school_id = ?', [userId, req.user.schoolId]);
  if (!existing.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  if (isPlatformOnlySchoolUser(existing[0])) {
    return res.status(403).json({ message: 'Las cuentas de administración global se gestionan en la consola de plataforma, no en el colegio.' });
  }
  if (req.user.role === 'manager' && existing[0].role !== 'teacher') return res.status(403).json({ message: 'Un manager no puede modificar cuentas administrativas.' });
  if (['guardian', 'student'].includes(existing[0].role) && input.role !== existing[0].role) {
    return res.status(400).json({ message: 'El cargo de estudiantes y apoderados se conserva para no desvincular su perfil académico.' });
  }
  if (!['guardian', 'student'].includes(existing[0].role) && ['guardian', 'student'].includes(input.role)) {
    return res.status(400).json({ message: 'Crea estudiantes y apoderados desde el flujo de matrícula.' });
  }
  const values = [input.username, input.fullName, input.role, input.active, input.teamActive, input.permissions.manageUsers,
    input.permissions.manageGrades, input.permissions.viewReports, input.permissions.manageSchool, input.permissions.manageHr,
    input.permissions.manageFinance, input.permissions.approveLeave, input.permissions['sige.view'], input.permissions['sige.configure'],
    input.permissions['sige.sync'], input.permissions['sige.view_logs']];
  let passwordSql = '';
  let passwordHash = null;
  if (input.password) {
    passwordSql = ', password_hash = ?';
    passwordHash = await bcrypt.hash(input.password, 12);
    values.push(passwordHash);
  }
  values.push(userId, req.user.schoolId);
  try {
    await pool.query(`UPDATE users SET username = ?, full_name = ?, role = ?, active = ?, team_active = ?,
      can_manage_users = ?, can_manage_grades = ?, can_view_reports = ?, can_manage_school = ?,
      can_manage_hr = ?, can_manage_finance = ?, can_approve_leave = ?, can_view_sige = ?, can_configure_sige = ?,
      can_sync_sige = ?, can_view_sige_logs = ?${passwordSql}
      WHERE id = ? AND school_id = ?`, values);
    const employeeRole = ['teacher', 'agente_finanzas', 'utp'].includes(input.role);
    const employee = await models.Employee.findOne({ where: { userId, schoolId: req.user.schoolId } });
    if (employeeRole) {
      const details = {
        fullName: input.fullName,
        position: input.role === 'teacher'
          ? (input.position || employee?.position || 'Profesor')
          : input.role === 'utp' ? 'Jefe/a de UTP' : 'Agente de finanzas',
        active: input.teamActive,
      };
      if (employee) await employee.update(details);
      else await models.Employee.create({ ...details, schoolId: req.user.schoolId, createdBy: req.user.id, userId });
    } else if (employee) {
      await employee.update({ fullName: input.fullName, active: input.teamActive });
    }
    const membership = await controlModels.TenantMembership.findOne({ where: { userId, schoolId: req.user.schoolId } });
    if (membership) {
      await membership.update({
        role: input.role,
        status: input.active ? 'active' : 'suspended',
      });
      await controlModels.GlobalUser.update({
        fullName: input.fullName,
        email: input.username,
        ...(passwordHash ? { passwordHash } : {}),
      }, { where: { id: membership.globalUserId } });
    }
    if (existing[0].role === 'teacher' && existing[0].full_name !== input.fullName) {
      await pool.query('UPDATE courses SET teacher = ? WHERE school_id = ? AND teacher = ?', [input.fullName, req.user.schoolId, existing[0].full_name]);
      const cacheKeys = await redis.keys('dashcole:cache:*');
      if (cacheKeys.length) await redis.del(cacheKeys);
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.original?.code === 'ER_DUP_ENTRY' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ese usuario o correo ya está registrado.' });
    }
    throw error;
  }

  const updatedUser = {
    id: userId,
    username: input.username,
    fullName: input.fullName,
    role: input.role,
    permissions: input.permissions,
    active: input.teamActive,
    teamActive: input.teamActive,
    platformAccess: input.active,
  };
  await clearDashboardCache();
  await revokeUserSessions(userId, req.authToken);
  if (userId === req.user.id) {
    const sessionUser = { ...req.user, id: userId, username: input.username, fullName: input.fullName, role: input.role, permissions: input.permissions };
    await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(sessionUser));
  }
  res.json({ user: updatedUser });
}

export async function deactivateStaffUser(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ message: 'Usuario inválido.' });
  if (userId === req.user.id) return res.status(400).json({ message: 'No puedes dar de baja tu propia cuenta.' });
  const [rows] = await pool.query(
    'SELECT id, full_name, role, username, active, team_active FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [userId, req.user.schoolId]
  );
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  const existing = rows[0];
  if (isPlatformOnlySchoolUser(existing)) {
    return res.status(403).json({ message: 'Las cuentas de administración global se gestionan en la consola de plataforma.' });
  }
  if (['guardian', 'student'].includes(existing.role)) {
    return res.status(400).json({ message: 'Da de baja a estudiantes y apoderados desde su ficha académica.' });
  }
  if (req.user.role === 'manager' && existing.role !== 'teacher') {
    return res.status(403).json({ message: 'Un manager solo puede dar de baja cuentas de profesores.' });
  }
  const revokeAccess = Boolean(req.body?.revokeAccess);
  await pool.query(
    'UPDATE users SET team_active = FALSE, active = ?, updated_at = NOW() WHERE id = ? AND school_id = ?',
    [revokeAccess ? 0 : 1, userId, req.user.schoolId]
  );
  const employee = await models.Employee.findOne({ where: { userId, schoolId: req.user.schoolId } });
  if (employee) await employee.update({ active: false });
  const membership = await controlModels.TenantMembership.findOne({ where: { userId, schoolId: req.user.schoolId } });
  if (membership) {
    // Sin revocar acceso se mantiene la membresía para poder entrar; con revocación se suspende.
    await membership.update({ status: revokeAccess ? 'suspended' : 'active' });
  }
  if (revokeAccess) await revokeUserSessions(userId, req.authToken);
  await models.AuditLog.create({
    schoolId: req.user.schoolId,
    createdBy: req.user.id,
    action: 'deactivate',
    entity: 'user',
    entityId: userId,
    payload: {
      fullName: existing.full_name,
      role: existing.role,
      username: existing.username,
      revokeAccess,
    },
  });
  await clearDashboardCache();
  res.json({
    saved: true,
    revokeAccess,
    user: {
      id: userId,
      active: false,
      teamActive: false,
      platformAccess: !revokeAccess,
    },
  });
}

export async function restoreStaffUser(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ message: 'Usuario inválido.' });
  const [rows] = await pool.query(
    'SELECT id, full_name, role, username FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [userId, req.user.schoolId]
  );
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  const existing = rows[0];
  if (isPlatformOnlySchoolUser(existing)) {
    return res.status(403).json({ message: 'Las cuentas de administración global se gestionan en la consola de plataforma.' });
  }
  if (['guardian', 'student'].includes(existing.role)) {
    return res.status(400).json({ message: 'Reactiva estudiantes y apoderados desde su ficha académica.' });
  }
  if (req.user.role === 'manager' && existing.role !== 'teacher') {
    return res.status(403).json({ message: 'Un manager solo puede reactivar cuentas de profesores.' });
  }
  const restoreAccess = req.body?.restoreAccess !== false;
  await pool.query(
    'UPDATE users SET team_active = TRUE, active = IF(?, TRUE, active), updated_at = NOW() WHERE id = ? AND school_id = ?',
    [restoreAccess ? 1 : 0, userId, req.user.schoolId]
  );
  const employee = await models.Employee.findOne({ where: { userId, schoolId: req.user.schoolId } });
  if (employee) await employee.update({ active: true });
  const membership = await controlModels.TenantMembership.findOne({ where: { userId, schoolId: req.user.schoolId } });
  if (membership) await membership.update({ status: 'active' });
  await models.AuditLog.create({
    schoolId: req.user.schoolId,
    createdBy: req.user.id,
    action: 'restore',
    entity: 'user',
    entityId: userId,
    payload: {
      fullName: existing.full_name,
      role: existing.role,
      username: existing.username,
      restoreAccess,
    },
  });
  await clearDashboardCache();
  const [[updated]] = await pool.query(
    'SELECT active, team_active FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [userId, req.user.schoolId]
  );
  res.json({
    saved: true,
    restoreAccess,
    user: {
      id: userId,
      active: Boolean(updated?.team_active),
      teamActive: Boolean(updated?.team_active),
      platformAccess: Boolean(updated?.active),
    },
  });
}

export async function setStaffPlatformAccess(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ message: 'Usuario inválido.' });
  if (userId === req.user.id && req.body?.active === false) {
    return res.status(400).json({ message: 'No puedes revocar el acceso de tu propia cuenta.' });
  }
  const [rows] = await pool.query(
    'SELECT id, full_name, role, username, team_active FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [userId, req.user.schoolId]
  );
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  const existing = rows[0];
  if (isPlatformOnlySchoolUser(existing)) {
    return res.status(403).json({ message: 'Las cuentas de administración global se gestionan en la consola de plataforma.' });
  }
  if (req.user.role === 'manager' && existing.role !== 'teacher') {
    return res.status(403).json({ message: 'Un manager solo puede gestionar el acceso de profesores.' });
  }
  const active = Boolean(req.body?.active);
  await pool.query(
    'UPDATE users SET active = ?, updated_at = NOW() WHERE id = ? AND school_id = ?',
    [active ? 1 : 0, userId, req.user.schoolId]
  );
  const membership = await controlModels.TenantMembership.findOne({ where: { userId, schoolId: req.user.schoolId } });
  if (membership) {
    await membership.update({ status: active ? 'active' : 'suspended' });
  }
  if (!active) await revokeUserSessions(userId, req.authToken);
  await models.AuditLog.create({
    schoolId: req.user.schoolId,
    createdBy: req.user.id,
    action: active ? 'restore_access' : 'revoke_access',
    entity: 'user',
    entityId: userId,
    payload: { username: existing.username, role: existing.role, active },
  });
  res.json({ saved: true, platformAccess: active });
}

export async function uploadUserAvatar(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) return res.status(400).json({ message: 'Usuario inválido.' });
  const [rows] = await pool.query('SELECT id, avatar_key FROM users WHERE id = ? AND school_id = ? LIMIT 1', [userId, req.user.schoolId]);
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  const data = req.file?.buffer;
  const png = data?.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = data?.[0] === 255 && data?.[1] === 216 && data?.[2] === 255;
  if (!png && !jpg) return res.status(400).json({ message: 'Selecciona una imagen JPG o PNG de hasta 5 MB.' });
  const key = tenantUploadKey(req.user.schoolId, `avatar-user-${crypto.randomUUID()}.${png ? 'png' : 'jpg'}`);
  await persistUpload(key, data, () => pool.query('UPDATE users SET avatar_key = ?, updated_at = NOW() WHERE id = ? AND school_id = ?', [key, userId, req.user.schoolId]));
  if (rows[0].avatar_key) await fs.unlink(safeUploadPath(rows[0].avatar_key)).catch(() => {});
  await revokeUserSessions(userId, req.authToken);
  if (userId === req.user.id) {
    const sessionUser = { ...req.user, avatarKey: key };
    await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(sessionUser));
  }
  res.json({ saved: true });
}

export async function getUserAvatar(req, res) {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId < 1) return res.status(400).end();
  const [rows] = await pool.query('SELECT avatar_key FROM users WHERE id = ? AND school_id = ? LIMIT 1', [userId, req.user.schoolId]);
  if (!rows.length || !rows[0].avatar_key) return res.status(404).end();
  res.sendFile(safeUploadPath(rows[0].avatar_key));
}

export async function uploadOwnSignature(req, res) {
  const data = req.file?.buffer;
  const png = data?.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpg = data?.[0] === 255 && data?.[1] === 216 && data?.[2] === 255;
  if (!png && !jpg) return res.status(400).json({ message: 'Selecciona una imagen JPG o PNG de hasta 5 MB.' });
  const [rows] = await pool.query(
    'SELECT id, signature_key FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [req.user.id, req.user.schoolId],
  );
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  const key = tenantUploadKey(req.user.schoolId, `signature-user-${crypto.randomUUID()}.${png ? 'png' : 'jpg'}`);
  await persistUpload(
    key,
    data,
    () => pool.query(
      'UPDATE users SET signature_key = ?, updated_at = NOW() WHERE id = ? AND school_id = ?',
      [key, req.user.id, req.user.schoolId],
    ),
  );
  if (rows[0].signature_key) await fs.unlink(safeUploadPath(rows[0].signature_key)).catch(() => {});
  const sessionUser = { ...req.user, signatureKey: key, hasSignature: true };
  await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(sessionUser));
  res.json({ saved: true, signatureKey: key, hasSignature: true });
}

export async function getOwnSignature(req, res) {
  const [rows] = await pool.query(
    'SELECT signature_key FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [req.user.id, req.user.schoolId],
  );
  if (!rows.length || !rows[0].signature_key) return res.status(404).end();
  res.sendFile(safeUploadPath(rows[0].signature_key));
}

export async function deleteOwnSignature(req, res) {
  const [rows] = await pool.query(
    'SELECT id, signature_key FROM users WHERE id = ? AND school_id = ? LIMIT 1',
    [req.user.id, req.user.schoolId],
  );
  if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
  await pool.query(
    'UPDATE users SET signature_key = NULL, updated_at = NOW() WHERE id = ? AND school_id = ?',
    [req.user.id, req.user.schoolId],
  );
  if (rows[0].signature_key) await fs.unlink(safeUploadPath(rows[0].signature_key)).catch(() => {});
  const sessionUser = { ...req.user, signatureKey: null, hasSignature: false };
  await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(sessionUser));
  res.json({ saved: true, signatureKey: null, hasSignature: false });
}

export async function changePassword(req, res) {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  if (!currentPassword) return res.status(400).json({ message: 'Ingresa tu contraseña actual.' });
  if (newPassword.length < 6 || newPassword.length > 128) {
    return res.status(400).json({ message: 'La nueva contraseña debe tener entre 6 y 128 caracteres.' });
  }

  const globalUserId = Number(req.user.globalUserId) || null;
  let currentHash = null;

  // Plataforma / multi-colegio: la clave canónica vive en global_users.
  if (globalUserId) {
    const globalUser = await controlModels.GlobalUser.findByPk(globalUserId, {
      attributes: ['id', 'passwordHash'],
      raw: true,
    });
    if (globalUser?.passwordHash) currentHash = globalUser.passwordHash;
  }

  if (!currentHash) {
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ? AND school_id = ? AND active = TRUE LIMIT 1',
      [req.user.id, req.user.schoolId],
    );
    if (rows[0]?.password_hash) currentHash = rows[0].password_hash;
  }

  // Consola plataforma con sesión sintética: buscar por correo en el colegio de la sesión.
  if (!currentHash && req.user.username) {
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE username = ? AND school_id = ? AND active = TRUE LIMIT 1',
      [String(req.user.username).trim().toLowerCase(), req.user.schoolId],
    );
    if (rows[0]?.password_hash) currentHash = rows[0].password_hash;
  }

  let currentOk = false;
  let sameAsNew = false;
  try {
    currentOk = Boolean(currentHash && await bcrypt.compare(currentPassword, currentHash));
    sameAsNew = Boolean(currentHash && await bcrypt.compare(newPassword, currentHash));
  } catch {
    currentOk = false;
  }
  if (!currentOk) return res.status(400).json({ message: 'La contraseña actual no es correcta.' });
  if (sameAsNew) return res.status(400).json({ message: 'La nueva contraseña debe ser diferente a la actual.' });

  const passwordHash = await bcrypt.hash(newPassword, 12);

  if (globalUserId) {
    await controlModels.GlobalUser.update({ passwordHash }, { where: { id: globalUserId } });
    const memberships = await controlModels.TenantMembership.findAll({
      where: { globalUserId, status: 'active' },
      raw: true,
    });
    await syncLocalPasswords(memberships, req.user.username, passwordHash);
    await Promise.all(memberships.map(async (row) => {
      try {
        await revokeUserSessions(row.userId, Number(row.userId) === Number(req.user.id) ? req.authToken : undefined);
      } catch {
        /* no bloquear el cambio de clave si falla el cierre de sesión */
      }
    }));
    if (!memberships.some((row) => Number(row.userId) === Number(req.user.id))) {
      try { await revokeUserSessions(req.user.id, req.authToken); } catch { /* ignore */ }
    }
  } else {
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ? AND school_id = ?',
      [passwordHash, req.user.id, req.user.schoolId],
    );
    try { await revokeUserSessions(req.user.id, req.authToken); } catch { /* ignore */ }
  }

  res.status(204).end();
}

export async function updateOwnProfile(req, res) {
  const fullName = String(req.body.fullName || '').trim();
  const username = String(req.body.username ?? req.user.username).trim().toLowerCase();
  const position = String(req.body.position || '').trim();
  const phone = String(req.body.phone || '').trim();
  const whatsappOptIn = req.body.whatsappOptIn === true;
  const hasLoginSchoolPrefs = Object.prototype.hasOwnProperty.call(req.body, 'askSchoolOnLogin')
    || Object.prototype.hasOwnProperty.call(req.body, 'preferredSchoolId');
  const preferredSchoolIdRaw = req.body.preferredSchoolId;
  const preferredSchoolId = preferredSchoolIdRaw == null || preferredSchoolIdRaw === ''
    ? null
    : Number(preferredSchoolIdRaw);
  if (fullName.length < 3 || fullName.length > 120 || !/^[a-z0-9][a-z0-9._@-]{2,149}$/.test(username) || position.length > 100 || phone && !/^\+[1-9]\d{7,14}$/.test(phone) || whatsappOptIn && !phone) {
    return res.status(400).json({ message: 'Revisa nombre, correo de acceso, cargo y teléfono con código de país.' });
  }
  if (isReservedPlatformEmail(username) && username !== String(req.user.username || '').toLowerCase() && !canAssignPlatformRoles(req.user)) {
    return res.status(403).json({ message: 'Ese correo está reservado para la administración global.' });
  }

  const globalUserId = Number(req.user.globalUserId) || null;
  const isPlatformOperator = Boolean(req.user.platformPermissions?.includes('platform.accounts.read'));

  let account = await models.User.findOne({
    where: {
      id: req.user.id,
      schoolId: req.user.schoolId,
      ...(req.user.role === 'student' ? {} : { active: true }),
    },
  });
  // Sesión de plataforma / id sintético: resolver por correo o por membresía.
  if (!account && req.user.username) {
    account = await models.User.findOne({
      where: {
        username: String(req.user.username).trim().toLowerCase(),
        schoolId: req.user.schoolId,
        active: true,
      },
    });
  }
  if (!account && globalUserId) {
    const membershipHint = await controlModels.TenantMembership.findOne({
      where: { globalUserId, schoolId: req.user.schoolId, status: 'active' },
      raw: true,
    });
    if (membershipHint?.userId) {
      account = await models.User.findOne({
        where: { id: membershipHint.userId, schoolId: req.user.schoolId },
      });
    }
  }

  if ((!account || (account.active === false && account.role !== 'student')) && !(isPlatformOperator && globalUserId)) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  let membership = account
    ? await controlModels.TenantMembership.findOne({ where: { userId: account.id, schoolId: req.user.schoolId } })
    : null;
  if (!membership && globalUserId) {
    membership = await controlModels.TenantMembership.findOne({ where: { globalUserId, schoolId: req.user.schoolId } });
  }

  if (hasLoginSchoolPrefs && (membership || globalUserId) && !isPlatformOperator) {
    const memberships = await controlModels.TenantMembership.findAll({
      where: { globalUserId: membership?.globalUserId || globalUserId, status: 'active' },
      raw: true,
    });
    if (preferredSchoolId != null) {
      if (!Number.isSafeInteger(preferredSchoolId) || preferredSchoolId < 1) {
        return res.status(400).json({ message: 'Selecciona un colegio válido como preferido.' });
      }
      if (!memberships.some((row) => Number(row.schoolId) === preferredSchoolId)) {
        return res.status(400).json({ message: 'Ese colegio no está vinculado a tu cuenta.' });
      }
    }
  }

  if (account) {
    const oldName = account.fullName;
    try {
      await sequelize.transaction(async (transaction) => {
        await account.update({ fullName, username, phone: phone || null, whatsappOptIn }, { transaction });
        await models.Employee.update(
          { fullName, ...(position ? { position } : {}) },
          { where: { userId: account.id, schoolId: req.user.schoolId }, transaction },
        );
        await models.Student.update(
          { email: username.includes('@') ? username : null },
          { where: { userId: account.id, schoolId: req.user.schoolId }, transaction },
        );
        await models.Guardian.update(
          { fullName, email: username.includes('@') ? username : null, phone: phone || null },
          { where: { userId: account.id, schoolId: req.user.schoolId }, transaction },
        );
        if (account.role === 'teacher' && oldName !== fullName) {
          await models.Course.update(
            { teacher: fullName },
            { where: { schoolId: req.user.schoolId, teacher: oldName }, transaction },
          );
        }
        try {
          await models.AuditLog.create({
            schoolId: req.user.schoolId,
            createdBy: account.id,
            entity: 'user',
            entityId: account.id,
            action: 'update_profile',
            payload: { fullName, username, position },
          }, { transaction });
        } catch {
          /* auditoría no debe bloquear el perfil */
        }
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ese correo o usuario ya está en uso en este colegio.' });
      }
      throw error;
    }
  }

  const targetGlobalId = Number(membership?.globalUserId || globalUserId) || null;
  if (targetGlobalId) {
    const globalUpdate = { fullName, email: username, phone: phone || null };
    if (hasLoginSchoolPrefs && !isPlatformOperator) {
      globalUpdate.askSchoolOnLogin = true;
      globalUpdate.preferredSchoolId = preferredSchoolId || null;
    }
    try {
      await controlModels.GlobalUser.update(globalUpdate, { where: { id: targetGlobalId } });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError' || error.original?.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Ese correo ya está registrado en otra cuenta.' });
      }
      throw error;
    }
    // Propagar nombre/correo a otras membresías locales cuando es operador de plataforma.
    if (isPlatformOperator) {
      const memberships = await controlModels.TenantMembership.findAll({
        where: { globalUserId: targetGlobalId, status: 'active' },
        raw: true,
      });
      for (const row of memberships) {
        try {
          const database = await databaseForTenant(row.schoolId, { activeOnly: false });
          await database.models.User.update(
            { fullName, username, phone: phone || null, whatsappOptIn },
            { where: { id: row.userId, schoolId: row.schoolId } },
          );
        } catch {
          /* colegio offline */
        }
      }
    }
  }

  try { await clearDashboardCache(); } catch { /* ignore */ }

  const user = {
    ...req.user,
    id: account?.id || req.user.id,
    fullName,
    username,
    position: position || req.user.position || '',
    phone,
    whatsappOptIn,
    ...(hasLoginSchoolPrefs && !isPlatformOperator ? {
      askSchoolOnLogin: true,
      preferredSchoolId: preferredSchoolId || null,
    } : {}),
  };
  try { await revokeUserSessions(user.id, req.authToken); } catch { /* ignore */ }
  await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(user));
  res.json({ user });
}

export async function revokeUserSessions(userId, exceptToken) {
  const tokens = await redis.sMembers(sessionIndexKey(userId));
  const staleTokens = tokens.filter(token => token !== exceptToken);
  if (staleTokens.length) {
    await redis.del(staleTokens.map(sessionKey));
    await clearPresenceMany(staleTokens);
    await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { tokenHash: staleTokens.map(tokenHash), revokedAt: null } });
    await redis.sRem(sessionIndexKey(userId), staleTokens);
  }
}

export function currentUser(req, res) { res.json({ user: applyDemoModeToUser(req.user, req) }); }

function mapOwnSession(row, currentHash) {
  const createdAt = row.created_at || row.createdAt || null;
  const lastSeenAt = row.last_seen_at || row.lastSeenAt || null;
  const revokedAt = row.revoked_at || row.revokedAt || null;
  const hash = row.token_hash || row.tokenHash || null;
  const ip = row.ip || null;
  return attachIpGeo({
    id: row.id,
    ip,
    userAgent: row.user_agent || row.userAgent || null,
    schoolId: row.schoolId || row.school_id || row.tenant_id || null,
    createdAt,
    lastSeenAt,
    revokedAt,
    active: !revokedAt,
    current: Boolean(currentHash && hash === currentHash),
  }, ip);
}

export async function listOwnSessions(req, res) {
  const currentHash = tokenHash(req.authToken);
  const globalUserId = req.user.globalUserId || null;
  const where = ownSessionWhere({ globalUserId, userId: req.user.id });
  await reconcileExpiredOwnSessions({
    globalUserId,
    userId: req.user.id,
    currentToken: req.authToken,
  });
  await pruneOwnSessionHistory({ globalUserId, userId: req.user.id });
  const rows = await controlModels.SessionRecord.findAll({
    where,
    order: [['lastSeenAt', 'DESC'], ['id', 'DESC']],
    limit: SESSION_HISTORY_LIMIT,
    raw: true,
  });
  const sessions = rows.map((row) => mapOwnSession(row, currentHash));
  const current = sessions.find((row) => row.current) || null;
  const active = sessions.filter((row) => row.active);
  const currentIp = clientIp(req);
  const currentGeo = lookupIpCountry(currentIp);
  res.set('Cache-Control', 'no-store');
  res.json({
    currentIp,
    currentCountry: currentGeo?.country || null,
    currentCountryCode: currentGeo?.countryCode || null,
    currentFlag: currentGeo?.flag || '',
    currentUserAgent: String(req.get('user-agent') || '').slice(0, 255) || null,
    currentSession: current,
    activeCount: active.length,
    sessionLimit: SESSION_HISTORY_LIMIT,
    sessions,
  });
}

export async function revokeOwnOtherSessions(req, res) {
  const currentHash = tokenHash(req.authToken);
  const globalUserId = req.user.globalUserId || null;
  await reconcileExpiredOwnSessions({
    globalUserId,
    userId: req.user.id,
    currentToken: req.authToken,
  });
  const where = {
    revokedAt: null,
    tokenHash: { [Op.ne]: currentHash },
    ...(globalUserId
      ? { [Op.or]: [{ globalUserId }, { userId: req.user.id }] }
      : { userId: req.user.id }),
  };
  const open = await controlModels.SessionRecord.findAll({ where, attributes: ['id'], raw: true });
  const ids = open.map((row) => row.id).filter(Boolean);
  if (ids.length) {
    await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { id: ids } });
  }
  // Cierra tokens Redis de todos los userIds de la identidad, salvo el actual.
  const userIds = await identityUserIds({ globalUserId, userId: req.user.id });
  let staleCount = 0;
  for (const userId of userIds) {
    const tokens = await redis.sMembers(sessionIndexKey(userId));
    const stale = tokens.filter((token) => token !== req.authToken);
    if (!stale.length) continue;
    staleCount += stale.length;
    await redis.del(stale.map(sessionKey));
    await redis.sRem(sessionIndexKey(userId), stale);
    await clearPresenceMany(stale);
  }
  res.json({ revoked: Math.max(ids.length, staleCount) });
}

export async function switchTenant(req, res) {
  if (req.user.impersonation) return res.status(403).json({ message: 'Termina la impersonación antes de cambiar de colegio.' });
  const schoolId = Number(req.body.schoolId);
  const membership = await controlModels.TenantMembership.findOne({ where: { globalUserId: req.user.globalUserId, schoolId, status: 'active' }, raw: true });
  if (!membership) return res.status(404).json({ message: 'No tienes una membresía activa en ese colegio.' });
  const tenantDatabase = await databaseForTenant(schoolId, { activeOnly: false });
  const target = await tenantDatabase.models.User.findOne({ where: { id: membership.userId, schoolId }, raw: true });
  if (!target || !isLoginEligibleLocalUser(target)) return res.status(404).json({ message: 'La cuenta del colegio no está disponible.' });
  const readOnly = await resolveStudentReadOnly(tenantDatabase.models, target);
  const platformRoles = await controlModels.PlatformRole.findAll({ where: { globalUserId: req.user.globalUserId }, raw: true });
  const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: req.user.globalUserId, status: 'active' }, raw: true });
  const schools = await controlModels.Tenant.findAll({ where: { schoolId: memberships.map(row => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true });
  const user = {
    ...publicUser(target, { readOnly }),
    globalUserId: req.user.globalUserId,
    preferredSchoolId: req.user.preferredSchoolId || null,
    askSchoolOnLogin: req.user.askSchoolOnLogin !== false,
    platformRoles: platformRoles.map(row => row.role),
    platformPermissions: [...new Set(platformRoles.flatMap(row => row.permissions || []))],
    memberships: memberships.map(row => ({ id: row.id, schoolId: row.schoolId, role: row.role, school: schools.find(school => school.schoolId === row.schoolId) })),
    platformConsole: false,
  };
  await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(user));
  await redis.sRem(sessionIndexKey(req.user.id), req.authToken);
  await redis.sAdd(sessionIndexKey(target.id), req.authToken);
  await touchPresence(req.authToken);
  await controlModels.SessionRecord.update({ userId: target.id, schoolId, lastSeenAt: new Date() }, { where: { tokenHash: tokenHash(req.authToken), revokedAt: null } });
  res.json({ user });
}

export async function logout(req, res) {
  await redis.del(sessionKey(req.authToken));
  await redis.sRem(sessionIndexKey(req.user.id), req.authToken);
  await clearPresence(req.authToken);
  await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { tokenHash: tokenHash(req.authToken), revokedAt: null } });
  res.status(204).end();
}
