import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import fs from 'node:fs/promises';
import { Op } from 'sequelize';
import { controlModels, controlSequelize, defaultModels, models, redis } from './database.js';
import { publicUser, revokeUserSessions } from './auth.js';
import { ApiError } from './http.js';
import { uploadRoot } from './uploads.js';
import { closeDatabaseServerPools, databaseForTenant, encryptedDatabasePassword, invalidateTenantRoute, provisionTenantDatabase, selectDatabaseServer, testDatabaseServer } from './database-routing.js';
import {
  buyOrderId, oneclickChildCommerceCode, oneclickInscription, oneclickTransaction,
  webpayPublicConfig, webpayTransaction,
} from './services/webpay.js';
import { getSmtpConfig, getSmtpPublicConfig, saveSmtpConfig } from './services/smtp-config.js';
import { getPlatformBankAccount, savePlatformBankAccount } from './services/platform-bank-account.js';
import { bankAccountPlainText, streamBankAccountPdf } from './services/platform-bank-account-export.js';
import { pdfSignerSlot } from './services/pdf-signature.js';
import { getDemoResetStatus, resetDemoData, setDemoSchoolsAccess } from './services/demo-reset.js';
import { bootstrapSchoolCourses, normalizeCourseSections, normalizeSchoolLevels, SCHOOL_LEVELS } from './services/school-structure.js';
import { sendAccessReset } from './mailer.js';
import { countOnline, listOnline, ONLINE_WITHIN_SEC, touchPresence } from './services/session-presence.js';
import nodemailer from 'nodemailer';

const SESSION_TTL = 60 * 60 * 12;
const sessionKey = token => `dashcole:session:${token}`;
const sessionIndexKey = userId => `dashcole:user-sessions:${userId}`;
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
const publicDatabaseServer = value => {
  const server = value?.toJSON ? value.toJSON() : value;
  const { encryptedPassword: _encryptedPassword, ...safe } = server;
  return { ...safe, passwordConfigured: Boolean(server.encryptedPassword || server.secretSource) };
};
function tenantPlanInput(body = {}, current = null) {
  const money = (value, fallback = 0) => {
    const number = Number(value ?? fallback);
    if (!Number.isFinite(number) || number < 0 || number > 1e9) throw new ApiError(400, 'VALIDATION_ERROR', 'La tarifa del plan es inválida.');
    return Math.round(number);
  };
  const code = String(body.code ?? current?.code ?? 'free').trim().toLowerCase();
  const status = String(body.status ?? current?.status ?? 'active');
  const freeStudentLimit = code === 'custom'
    ? 0
    : Number(body.freeStudentLimit ?? current?.freeStudentLimit ?? 10);
  const currency = String(body.currency ?? current?.currency ?? 'CLP').trim().toUpperCase();
  if (!/^[a-z][a-z0-9_-]{1,39}$/.test(code) || !['trial', 'active', 'past_due', 'suspended'].includes(status) || !Number.isInteger(freeStudentLimit) || freeStudentLimit < 0 || freeStudentLimit > 100000 || !/^[A-Z]{3}$/.test(currency)) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa código, estado, moneda y tramo gratuito del plan.');
  const isComplimentary = code === 'free' || code === 'demo';
  return {
    code, status, freeStudentLimit, currency,
    baseMonthlyPrice: isComplimentary ? 0 : money(body.baseMonthlyPrice, current?.baseMonthlyPrice),
    // Personalizado = precio fijo total; no hay cobro por estudiante.
    perStudentPrice: isComplimentary || code === 'custom' ? 0 : money(body.perStudentPrice, current?.perStudentPrice),
    customPricing: body.customPricing === true || code === 'custom',
    limits: body.limits && typeof body.limits === 'object' && !Array.isArray(body.limits) ? body.limits : (current?.limits || {}),
  };
}
function planMonthlyAmount(plan, students = 0) {
  if (!plan) return null;
  const code = String(plan.code || '').toLowerCase();
  if (code === 'free' || code === 'demo') return 0;
  const base = Math.round(Number(plan.baseMonthlyPrice || 0));
  if (code === 'custom') return Math.max(0, base);
  const free = Number(plan.freeStudentLimit || 0);
  const per = Number(plan.perStudentPrice || 0);
  return Math.max(0, Math.round(base + Math.max(0, Number(students || 0) - free) * per));
}
function databaseServerInput(body, existing = null) {
  const value = {
    name: String(body.name ?? existing?.name ?? '').trim(), host: String(body.host ?? existing?.host ?? '').trim().toLowerCase(),
    port: Number(body.port ?? existing?.port ?? 3306), username: String(body.username ?? existing?.username ?? '').trim(),
    ssl: body.ssl && typeof body.ssl === 'object' ? { enabled: body.ssl.enabled === true, rejectUnauthorized: body.ssl.rejectUnauthorized !== false } : (existing?.ssl || { enabled: false, rejectUnauthorized: true }),
    region: String(body.region ?? existing?.region ?? '').trim() || null,
  };
  if (value.name.length < 3 || value.name.length > 100 || !/^[a-z0-9.:[\]-]{1,253}$/.test(value.host) || !Number.isInteger(value.port) || value.port < 1 || value.port > 65535 || value.username.length < 1 || value.username.length > 100) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa nombre, host, puerto y usuario SQL.');
  return value;
}

function requirePlatform(permission) {
  return (req, _res, next) => {
    if (!req.user.platformPermissions?.includes(permission)) throw new ApiError(403, 'PLATFORM_FORBIDDEN', 'No tienes el permiso global requerido.');
    next();
  };
}
function requirePlatformAny(...permissions) {
  return (req, _res, next) => {
    if (!permissions.some(permission => req.user.platformPermissions?.includes(permission))) throw new ApiError(403, 'PLATFORM_FORBIDDEN', 'No tienes el permiso global requerido.');
    next();
  };
}

const SCHOOL_HISTORY_SKIP_ACTIONS = new Set([
  'tenant_enter',
  'impersonation_start',
  'impersonation_stop',
]);

async function audit(req, action, entity, entityId, payload = {}) {
  // Ingreso / impersonación de plataforma no debe aparecer en el historial del colegio.
  if (SCHOOL_HISTORY_SKIP_ACTIONS.has(action)) return;
  const schoolId = Number(req.user.schoolId);
  if (!Number.isInteger(schoolId) || schoolId < 1) return;
  try {
    await models.AuditLog.create({
      schoolId,
      createdBy: req.user.id || null,
      action,
      entity,
      entityId,
      payload: { platform: true, ...payload },
    });
  } catch (cause) {
    console.error('[platform.audit]', action, cause?.message || cause);
  }
}
async function updateMembershipUsers(memberships, values) {
  for (const membership of memberships) {
    const database = await databaseForTenant(membership.schoolId);
    await database.models.User.update(values, { where: { id: membership.userId, schoolId: membership.schoolId } });
  }
}

async function syncPasswordByEmail(email, passwordHash) {
  const username = String(email || '').trim().toLowerCase();
  if (!username || !passwordHash) return 0;
  const tenants = await controlModels.Tenant.findAll({ where: { status: 'active' }, attributes: ['schoolId'], raw: true });
  const schoolIds = [...new Set(tenants.map(row => Number(row.schoolId)).filter(id => Number.isSafeInteger(id) && id > 0))];
  let updated = 0;
  for (const schoolId of schoolIds) {
    try {
      const database = await databaseForTenant(schoolId, { activeOnly: false });
      const [count] = await database.models.User.update({ passwordHash }, { where: { schoolId, username } });
      updated += Number(count) || 0;
    } catch {
      /* Colegio offline: seguir con el resto. */
    }
  }
  return updated;
}

export function registerPlatformRoutes(app) {
  app.post('/api/platform/impersonations/stop', async (req, res) => {
    const id = Number(req.user.impersonation?.id);
    const actorGlobalUserId = Number(req.user.impersonation?.actorGlobalUserId);
    if (!Number.isSafeInteger(id)) throw new ApiError(400, 'NOT_IMPERSONATING', 'La sesión no está en modo impersonación.');
    await controlModels.Impersonation.update({ endedAt: new Date() }, { where: { id, targetUserId: req.user.id, endedAt: null } });
    await redis.del(sessionKey(req.authToken));
    await redis.sRem(sessionIndexKey(req.user.id), req.authToken);
    await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { tokenHash: hash(req.authToken), revokedAt: null } });

    // Prefer the saved admin token; otherwise rebuild a fresh platform session for the actor.
    const adminToken = String(req.body?.adminToken || '').trim();
    let restored = null;
    if (/^[a-f0-9]{64}$/.test(adminToken)) {
      const raw = await redis.get(sessionKey(adminToken));
      if (raw) {
        try {
          const adminSession = JSON.parse(raw);
          if (Number(adminSession.globalUserId) === actorGlobalUserId) {
            adminSession.platformConsole = true;
            adminSession.impersonation = undefined;
            delete adminSession.impersonation;
            await redis.setEx(sessionKey(adminToken), SESSION_TTL, JSON.stringify(adminSession));
            await redis.sAdd(sessionIndexKey(adminSession.id), adminToken);
            await redis.expire(sessionIndexKey(adminSession.id), SESSION_TTL);
            await controlModels.SessionRecord.update({ lastSeenAt: new Date(), revokedAt: null }, { where: { tokenHash: hash(adminToken) } });
            restored = { token: adminToken, user: adminSession };
          }
        } catch { /* fall through to rebuild */ }
      }
    }
    if (!restored && Number.isSafeInteger(actorGlobalUserId) && actorGlobalUserId > 0) {
      const globalUser = await controlModels.GlobalUser.findByPk(actorGlobalUserId);
      if (globalUser && globalUser.status === 'active') {
        const platformRoles = await controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true });
        const platformPermissions = [...new Set(platformRoles.flatMap(row => row.permissions || []))];
        if (platformPermissions.includes('platform.accounts.read')) {
          const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: globalUser.id, status: 'active' }, order: [['id', 'ASC']], raw: true });
          const schools = await controlModels.Tenant.findAll({ where: { schoolId: memberships.map(row => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true });
          let localUser = null;
          let schoolId = null;
          for (const membership of memberships) {
            try {
              const database = await databaseForTenant(membership.schoolId, { activeOnly: false });
              localUser = await database.models.User.findOne({ where: { id: membership.userId, schoolId: membership.schoolId, active: true }, raw: true });
              if (localUser) { schoolId = membership.schoolId; break; }
            } catch { /* try next membership */ }
          }
          if (!localUser) {
            localUser = {
              id: globalUser.id,
              schoolId: memberships[0]?.schoolId || 1,
              username: globalUser.email,
              fullName: globalUser.fullName,
              role: 'super_admin',
              phone: globalUser.phone || '',
              whatsappOptIn: false,
              canManageUsers: true,
              canManageGrades: true,
              canViewReports: true,
              canManageSchool: true,
              canManageHr: true,
              canManageFinance: true,
            };
            schoolId = localUser.schoolId;
          }
          const token = crypto.randomBytes(32).toString('hex');
          const user = {
            ...publicUser(localUser),
            globalUserId: globalUser.id,
            platformRoles: platformRoles.map(row => row.role),
            platformPermissions,
            memberships: memberships.map(row => ({ id: row.id, schoolId: row.schoolId, role: row.role, school: schools.find(school => school.schoolId === row.schoolId) })),
            platformConsole: true,
          };
          await redis.setEx(sessionKey(token), SESSION_TTL, JSON.stringify(user));
          await redis.sAdd(sessionIndexKey(user.id), token);
          await redis.expire(sessionIndexKey(user.id), SESSION_TTL);
          await touchPresence(token);
          await controlModels.SessionRecord.create({
            tokenHash: hash(token),
            globalUserId: globalUser.id,
            userId: user.id,
            schoolId,
            ip: String(req.get('x-forwarded-for') || '').split(',')[0].trim() || req.ip,
            userAgent: String(req.get('user-agent') || '').slice(0, 255),
          });
          restored = { token, user };
        }
      }
    }
    await audit(req, 'impersonation_stop', 'user', req.user.id, { impersonationId: id, actorGlobalUserId });
    res.json(restored || { restored: false });
  });
  app.get('/api/platform/accounts', requirePlatform('platform.accounts.read'), async (req, res) => {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize) || 25));
    const membershipWhere = {};
    if (Number.isSafeInteger(Number(req.query.tenantId)) && Number(req.query.tenantId) > 0) membershipWhere.schoolId = Number(req.query.tenantId);
    if (req.query.role) membershipWhere.role = String(req.query.role);
    let membershipIds;
    if (Object.keys(membershipWhere).length) {
      membershipIds = (await controlModels.TenantMembership.findAll({ where: membershipWhere, attributes: ['globalUserId'], raw: true })).map(row => row.globalUserId);
      if (!membershipIds.length) return res.json({ rows: [], total: 0, page, pageSize });
    }
    const dateRange = (from, to) => ({ ...( /^\d{4}-\d{2}-\d{2}$/.test(String(from||'')) ? { [Op.gte]: new Date(`${from}T00:00:00.000Z`) } : {}), ...( /^\d{4}-\d{2}-\d{2}$/.test(String(to||'')) ? { [Op.lte]: new Date(`${to}T23:59:59.999Z`) } : {}) });
    const createdAt = dateRange(req.query.createdFrom, req.query.createdTo), lastLoginAt = dateRange(req.query.loginFrom, req.query.loginTo);
    const where = {
      ...(q ? { [Op.or]: [{ id: /^\d+$/.test(q) ? Number(q) : -1 }, { email: { [Op.like]: `%${q}%` } }, { fullName: { [Op.like]: `%${q}%` } }, { identifier: { [Op.like]: `%${q}%` } }] } : {}),
      ...(req.query.status ? { status: String(req.query.status) } : {}),
      ...(membershipIds ? { id: { [Op.in]: membershipIds } } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
      ...(Object.keys(lastLoginAt).length ? { lastLoginAt } : {}),
    };
    const sortAllow = {
      fullName: 'full_name',
      email: 'email',
      status: 'status',
      lastLoginAt: 'last_login_at',
      createdAt: 'created_at',
      id: 'id',
    };
    const sortBy = sortAllow[String(req.query.sortBy || '')] || 'full_name';
    const sortDir = String(req.query.sortDir || 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const { rows, count } = await controlModels.GlobalUser.findAndCountAll({
      where,
      order: [[sortBy, sortDir], ['id', 'ASC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      raw: true,
    });
    const ids = rows.map(row => row.id);
    const memberships = ids.length ? await controlModels.TenantMembership.findAll({ where: { globalUserId: ids }, raw: true }) : [];
    const schools = await controlModels.Tenant.findAll({ where: { schoolId: [...new Set(memberships.map(row => row.schoolId))] }, attributes: ['schoolId', 'name', 'slug'], raw: true });
    const schoolById = new Map(schools.map(row => [row.schoolId, { id: row.schoolId, name: row.name, slug: row.slug }]));
    res.json({
      rows: rows.map(row => ({ ...row, memberships: memberships.filter(item => item.globalUserId === row.id).map(item => ({ ...item, school: schoolById.get(item.schoolId) })) })),
      total: count,
      page,
      pageSize,
      sortBy: Object.keys(sortAllow).find(key => sortAllow[key] === sortBy) || 'fullName',
      sortDir,
    });
  });

  app.get('/api/platform/people', requirePlatform('platform.accounts.read'), async (req, res) => {
    const q = String(req.query.q || '').trim();
    const schoolId = Number(req.query.schoolId || 0);
    const browse = ['1', 'true', 'yes'].includes(String(req.query.browse || '').toLowerCase());
    const limit = Math.min(browse ? 100 : 40, Math.max(5, Number(req.query.limit) || (browse ? 50 : 20)));
    const hasSchool = Number.isSafeInteger(schoolId) && schoolId > 0;
    if (q.length < 2 && !browse && !hasSchool) {
      return res.json({ rows: [], total: 0, scope: 'global' });
    }

    const tenantRows = await controlModels.Tenant.findAll({
      where: hasSchool ? { schoolId } : { status: 'active' },
      attributes: ['schoolId', 'name', 'slug', 'status'],
      raw: true,
    });
    const schoolById = new Map(tenantRows.map(row => [row.schoolId, { id: row.schoolId, name: row.name, slug: row.slug, status: row.status }]));

    let membershipScopeIds = null;
    if (hasSchool) {
      membershipScopeIds = (await controlModels.TenantMembership.findAll({
        where: { schoolId },
        attributes: ['globalUserId'],
        raw: true,
      })).map(row => row.globalUserId);
    }

    const globalWhere = {
      ...(q.length >= 2 ? {
        [Op.or]: [
          { id: /^\d+$/.test(q) ? Number(q) : -1 },
          { email: { [Op.like]: `%${q}%` } },
          { fullName: { [Op.like]: `%${q}%` } },
          { identifier: { [Op.like]: `%${q}%` } },
          { phone: { [Op.like]: `%${q}%` } },
        ],
      } : {}),
      ...(membershipScopeIds ? { id: { [Op.in]: membershipScopeIds.length ? membershipScopeIds : [-1] } } : {}),
    };
    const globalUsers = await controlModels.GlobalUser.findAll({
      where: Object.keys(globalWhere).length ? globalWhere : {},
      order: [['fullName', 'ASC']],
      limit,
      raw: true,
    });

    const globalIds = globalUsers.map(row => row.id);
    const memberships = globalIds.length
      ? await controlModels.TenantMembership.findAll({ where: { globalUserId: { [Op.in]: globalIds } }, raw: true })
      : [];

    const people = new Map();
    for (const account of globalUsers) {
      const accountMemberships = memberships
        .filter(item => item.globalUserId === account.id)
        .filter(item => !(Number.isSafeInteger(schoolId) && schoolId > 0) || item.schoolId === schoolId)
        .map(item => ({
          schoolId: item.schoolId,
          role: item.role,
          status: item.status,
          userId: item.userId,
          school: schoolById.get(item.schoolId) || null,
        }));
      people.set(`global:${account.id}`, {
        key: `global:${account.id}`,
        kind: 'global',
        globalUserId: account.id,
        fullName: account.fullName,
        email: account.email,
        phone: account.phone || null,
        identifier: account.identifier || null,
        status: account.status,
        lastLoginAt: account.lastLoginAt,
        memberships: accountMemberships,
        schoolsLabel: accountMemberships.map(item => item.school?.name || `Colegio #${item.schoolId}`).join(', ') || 'Sin colegio',
        rolesLabel: [...new Set(accountMemberships.map(item => item.role))].join(', ') || 'Sin rol escolar',
      });
    }

    if (Number.isSafeInteger(schoolId) && schoolId > 0 && q.length >= 2) {
      try {
        const database = await databaseForTenant(schoolId);
        const like = { [Op.like]: `%${q}%` };
        const [localUsers, localStudents] = await Promise.all([
          database.models.User.findAll({
            where: { schoolId, active: true, [Op.or]: [{ fullName: like }, { username: like }] },
            attributes: ['id', 'fullName', 'username', 'role', 'phone', 'active'],
            limit: 20,
            raw: true,
          }),
          database.models.Student.findAll({
            where: {
              schoolId,
              active: true,
              [Op.or]: [
                { firstName: like },
                { lastName: like },
                { email: like },
                { nationalId: like },
                ...( /^\d+$/.test(q) ? [{ id: Number(q) }] : []),
              ],
            },
            attributes: ['id', 'userId', 'firstName', 'lastName', 'email', 'nationalId', 'active'],
            limit: 20,
            raw: true,
          }),
        ]);
        const school = schoolById.get(schoolId);
        const membershipByUserId = new Map(
          (await controlModels.TenantMembership.findAll({
            where: { schoolId, userId: { [Op.in]: localUsers.map(row => row.id) } },
            raw: true,
          })).map(row => [row.userId, row])
        );
        for (const user of localUsers) {
          const membership = membershipByUserId.get(user.id);
          const key = membership ? `global:${membership.globalUserId}` : `local-user:${schoolId}:${user.id}`;
          if (people.has(key)) continue;
          people.set(key, {
            key,
            kind: membership ? 'global' : 'local_user',
            globalUserId: membership?.globalUserId || null,
            localUserId: user.id,
            schoolId,
            fullName: user.fullName,
            email: user.username,
            phone: user.phone || null,
            identifier: null,
            status: user.active ? 'active' : 'inactive',
            lastLoginAt: null,
            memberships: [{ schoolId, role: user.role, status: membership?.status || 'active', userId: user.id, school }],
            schoolsLabel: school?.name || `Colegio #${schoolId}`,
            rolesLabel: user.role,
          });
        }
        for (const student of localStudents) {
          const key = student.userId ? `local-student-user:${schoolId}:${student.userId}` : `local-student:${schoolId}:${student.id}`;
          if ([...people.values()].some(row => row.localUserId === student.userId || (row.studentId === student.id))) continue;
          const linked = student.userId
            ? [...people.values()].find(row => row.localUserId === student.userId || row.memberships?.some(item => item.userId === student.userId))
            : null;
          if (linked) {
            linked.studentId = student.id;
            continue;
          }
          people.set(key, {
            key,
            kind: 'student',
            globalUserId: null,
            studentId: student.id,
            localUserId: student.userId || null,
            schoolId,
            fullName: `${student.firstName} ${student.lastName}`.trim(),
            email: student.email || null,
            phone: null,
            identifier: student.nationalId || null,
            status: student.active ? 'active' : 'inactive',
            lastLoginAt: null,
            memberships: [{ schoolId, role: 'student', status: 'active', userId: student.userId || null, school }],
            schoolsLabel: school?.name || `Colegio #${schoolId}`,
            rolesLabel: 'student',
          });
        }
      } catch (cause) {
        console.warn('Platform people school search failed:', cause.message);
      }
    }

    const rows = [...people.values()].slice(0, limit);
    res.json({
      rows,
      total: rows.length,
      scope: Number.isSafeInteger(schoolId) && schoolId > 0 ? 'school' : 'global',
      school: Number.isSafeInteger(schoolId) && schoolId > 0 ? (schoolById.get(schoolId) || null) : null,
    });
  });
  app.get('/api/platform/overview', requirePlatform('platform.accounts.read'), async (_req, res) => {
    const [accounts, tenantRows, activeSessions, storage, servers, plans, demoRequests] = await Promise.all([
      controlModels.GlobalUser.findAll({ attributes: ['id', 'status'], raw: true }),
      controlModels.Tenant.findAll({ attributes: ['id', 'schoolId', 'name', 'status', 'databaseServerId', 'created_at', 'updated_at'], raw: true }),
      countOnline({ withinSec: ONLINE_WITHIN_SEC }),
      fs.statfs(uploadRoot).then(stat => ({ freeBytes: Number(stat.bavail) * Number(stat.bsize), totalBytes: Number(stat.blocks) * Number(stat.bsize) })).catch(() => null),
      controlModels.DatabaseServer.findAll({ attributes: ['id', 'name', 'status', 'isDefault', 'region'], raw: true }),
      controlModels.TenantPlan.findAll({ attributes: ['code', 'status', 'schoolId'], raw: true }),
      controlModels.DemoRequest.findAll({ attributes: ['status'], raw: true }),
    ]);

    const countBy = (rows, key) => rows.reduce((map, row) => {
      const value = String(row[key] || 'unknown');
      map[value] = (map[value] || 0) + 1;
      return map;
    }, {});

    const serverNameById = new Map(servers.map(row => [row.id, row.name]));
    const tenantsByServer = {};
    for (const tenant of tenantRows) {
      const label = serverNameById.get(tenant.databaseServerId) || `Servidor #${tenant.databaseServerId}`;
      tenantsByServer[label] = (tenantsByServer[label] || 0) + 1;
    }

    res.json({
      accounts: accounts.length,
      tenants: tenantRows.filter(row => row.status === 'active').length,
      activeSessions,
      onlineWithinSec: ONLINE_WITHIN_SEC,
      mysql: 'connected',
      control: 'connected',
      redis: redis.isReady ? 'connected' : 'degraded',
      storage,
      charts: {
        accountsByStatus: countBy(accounts, 'status'),
        tenantsByStatus: countBy(tenantRows, 'status'),
        tenantsByServer,
        serversByStatus: countBy(servers, 'status'),
        plansByCode: countBy(plans, 'code'),
        plansByStatus: countBy(plans, 'status'),
        demosByStatus: countBy(demoRequests, 'status'),
      },
      infrastructure: {
        servers: servers.map(server => ({
          id: server.id,
          name: server.name,
          status: server.status,
          isDefault: server.isDefault,
          region: server.region,
          tenants: tenantRows.filter(row => row.databaseServerId === server.id).length,
        })),
      },
    });
  });

  app.get('/api/platform/sessions/online', requirePlatform('platform.accounts.read'), async (req, res) => {
    const withinSec = Math.min(60 * 60 * 12, Math.max(60, Number(req.query.withinSec) || ONLINE_WITHIN_SEC));
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
    const schoolId = Number(req.query.schoolId);
    const payload = await listOnline({
      withinSec,
      limit,
      schoolId: Number.isSafeInteger(schoolId) && schoolId > 0 ? schoolId : null,
    });
    res.set('Cache-Control', 'no-store').json(payload);
  });

  app.get('/api/platform/notifications', requirePlatform('platform.accounts.read'), async (_req, res) => {
    const [tenantRows, accounts, sessions, servers, demos] = await Promise.all([
      controlModels.Tenant.findAll({ attributes: ['id', 'name', 'status', 'updated_at', 'created_at'], order: [['updated_at', 'DESC']], raw: true }),
      controlModels.GlobalUser.count(),
      countOnline({ withinSec: ONLINE_WITHIN_SEC }),
      controlModels.DatabaseServer.findAll({ attributes: ['id', 'name', 'status', 'lastError', 'lastCheckedAt'], raw: true }),
      controlModels.DemoRequest.findAll({ where: { status: 'new' }, attributes: ['id', 'organization', 'created_at'], order: [['created_at', 'DESC']], limit: 5, raw: true }),
    ]);
    const activeTenants = tenantRows.filter(row => row.status === 'active').length;
    const suspended = tenantRows.filter(row => row.status === 'suspended');
    const offlineServers = servers.filter(row => row.status !== 'active');
    const now = new Date().toISOString();
    const items = [
      {
        id: 900001,
        channel: 'platform',
        target: '/plataforma/colegios',
        subject: 'Red de colegios',
        body: `${activeTenants} colegios activos · ${accounts} identidades globales · ${sessions} en línea ahora`,
        sentAt: now,
      },
      ...offlineServers.map((server, index) => ({
        id: 900100 + index,
        channel: 'platform',
        target: '/plataforma',
        subject: `Servidor SQL ${server.status}`,
        body: `${server.name}: ${server.lastError || 'Revisa la conexión de infraestructura.'}`,
        sentAt: server.lastCheckedAt || now,
      })),
      ...suspended.slice(0, 3).map((tenant, index) => ({
        id: 900200 + index,
        channel: 'platform',
        target: '/plataforma/colegios',
        subject: 'Colegio suspendido',
        body: `${tenant.name} está suspendido en la plataforma.`,
        sentAt: tenant.updated_at || tenant.updatedAt || now,
      })),
      ...demos.map((demo, index) => ({
        id: 900300 + index,
        channel: 'platform',
        target: '/plataforma',
        subject: 'Nueva solicitud de demo',
        body: `${demo.organization} pidió una demostración de DashCole.`,
        sentAt: demo.created_at || demo.createdAt || now,
      })),
    ];
    res.json(items.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 10));
  });
  app.get('/api/platform/database-servers', requirePlatform('platform.infrastructure.read'), async (_req, res) => {
    const [servers, tenants] = await Promise.all([controlModels.DatabaseServer.findAll({ order: [['isDefault', 'DESC'], ['name', 'ASC']] }), controlModels.Tenant.findAll({ attributes: ['databaseServerId'], raw: true })]);
    res.json(servers.map(server => ({ ...publicDatabaseServer(server), tenants: tenants.filter(row => row.databaseServerId === server.id).length })));
  });
  app.post('/api/platform/database-servers/test', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const existing = req.body.id ? await controlModels.DatabaseServer.findByPk(req.body.id) : null;
    const input = databaseServerInput(req.body, existing);
    const result = await testDatabaseServer({ ...input, databaseName: req.body.databaseName || process.env.MYSQL_DATABASE, encryptedPassword: existing?.encryptedPassword, secretSource: existing?.secretSource }, String(req.body.password || ''));
    if (!result.ok) throw new ApiError(422, 'CONNECTION_FAILED', result.error || 'No se pudo conectar al servidor SQL.');
    res.json({ ok: true, message: 'Conexión SQL verificada correctamente.' });
  });
  app.post('/api/platform/database-servers', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const input = databaseServerInput(req.body);
    const password = String(req.body.password || '');
    const result = await testDatabaseServer({ ...input, databaseName: req.body.databaseName || process.env.MYSQL_DATABASE }, password);
    if (!result.ok) throw new ApiError(422, 'CONNECTION_FAILED', result.error);
    const server = await controlModels.DatabaseServer.create({ ...input, encryptedPassword: encryptedDatabasePassword(password), secretSource: 'encrypted', status: 'active', isDefault: false, lastCheckedAt: new Date(), lastError: null });
    await audit(req, 'database_server_create', 'database_server', server.id, { name: server.name, host: server.host, region: server.region });
    res.status(201).json({ server: publicDatabaseServer(server) });
  });
  app.put('/api/platform/database-servers/:id', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const server = await controlModels.DatabaseServer.findByPk(req.params.id);
    if (!server) throw new ApiError(404, 'NOT_FOUND', 'Servidor SQL no encontrado.');
    const input = databaseServerInput(req.body, server);
    if (server.isDefault && (input.host !== server.host || input.port !== server.port || input.username !== server.username || req.body.password)) throw new ApiError(409, 'DEFAULT_SERVER_USES_ENV', 'Current / Default usa las variables MYSQL_*; actualiza el entorno y reinicia la API.');
    const password = String(req.body.password || '');
    const candidate = { ...server.toJSON(), ...input, databaseName: req.body.databaseName || process.env.MYSQL_DATABASE };
    const result = await testDatabaseServer(candidate, password);
    await server.update({ ...input, ...(password ? { encryptedPassword: encryptedDatabasePassword(password), secretSource: 'encrypted' } : {}), status: result.ok ? 'active' : 'offline', lastCheckedAt: new Date(), lastError: result.ok ? null : result.error });
    await closeDatabaseServerPools(server.id);
    await audit(req, 'database_server_update', 'database_server', server.id, { status: server.status, host: server.host });
    if (!result.ok) throw new ApiError(422, 'CONNECTION_FAILED', result.error);
    res.json({ server: publicDatabaseServer(server) });
  });
  app.post('/api/platform/database-servers/:id/test', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const server = await controlModels.DatabaseServer.findByPk(req.params.id);
    if (!server) throw new ApiError(404, 'NOT_FOUND', 'Servidor SQL no encontrado.');
    const tenant = await controlModels.Tenant.findOne({ where: { databaseServerId: server.id }, raw: true });
    const result = await testDatabaseServer({ ...server.toJSON(), databaseName: req.body.databaseName || tenant?.databaseName || process.env.MYSQL_DATABASE }, String(req.body.password || ''));
    await server.update({ status: result.ok ? 'active' : 'offline', lastCheckedAt: new Date(), lastError: result.ok ? null : result.error });
    if (!result.ok) {
      await closeDatabaseServerPools(server.id);
      throw new ApiError(422, 'CONNECTION_FAILED', result.error || `No se pudo conectar a ${server.name}.`);
    }
    res.json({ ok: true, message: `${server.name}: conexión verificada.`, status: 'active' });
  });
  app.delete('/api/platform/database-servers/:id', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const server = await controlModels.DatabaseServer.findByPk(req.params.id);
    if (!server) throw new ApiError(404, 'NOT_FOUND', 'Servidor SQL no encontrado.');
    if (server.isDefault || await controlModels.Tenant.count({ where: { databaseServerId: server.id } })) throw new ApiError(409, 'SERVER_IN_USE', 'No puedes eliminar el servidor por defecto ni uno con colegios asignados.');
    await closeDatabaseServerPools(server.id); await server.destroy(); await audit(req, 'database_server_delete', 'database_server', Number(req.params.id), { name: server.name });
    res.json({ removed: true });
  });
  app.get('/api/platform/tenants', requirePlatformAny('platform.accounts.read', 'platform.infrastructure.read'), async (_req, res) => {
    const schools = await controlModels.Tenant.findAll({ order: [['name', 'ASC']], raw: true });
    const [domains, plans, memberships] = await Promise.all([
      controlModels.TenantDomain.findAll({ raw: true }), controlModels.TenantPlan.findAll({ raw: true }), controlModels.TenantMembership.findAll({ attributes: ['schoolId'], raw: true }),
    ]);
    const studentCounts = new Map(await Promise.all(schools.map(async tenant => {
      try { return [tenant.schoolId, await (await databaseForTenant(tenant.schoolId)).models.Student.count({ where: { schoolId: tenant.schoolId, active: true } })]; }
      catch { return [tenant.schoolId, null]; }
    })));
    res.json(schools.map(tenant => {
      const plan = plans.find(row => row.schoolId === tenant.schoolId) || null, students = studentCounts.get(tenant.schoolId);
      const estimatedMonthlyPrice = plan && students !== null ? planMonthlyAmount(plan, students) : null;
      return { ...tenant, id: tenant.schoolId, routeId: tenant.id, domains: domains.filter(row => row.schoolId === tenant.schoolId), plan, students, estimatedMonthlyPrice, accounts: memberships.filter(row => row.schoolId === tenant.schoolId).length };
    }));
  });
  app.post('/api/platform/tenants', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    try {
    const name = String(req.body.name || '').trim();
    const ownerName = String(req.body.ownerName || '').trim();
    const ownerEmail = String(req.body.ownerEmail || '').trim().toLowerCase();
    const slugifyTenant = (value) => String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      .slice(0, 80);
    let slug = slugifyTenant(req.body.slug) || slugifyTenant(name);
    if (name.length < 3 || name.length > 150 || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || ownerName.length < 3 || ownerName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa el nombre del colegio y los datos de la persona administradora.');
    }
    const baseSlug = slug;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`.slice(0, 80);
      const taken = await controlModels.Tenant.findOne({ where: { slug: candidate }, attributes: ['id'] });
      if (!taken) {
        slug = candidate;
        break;
      }
      if (attempt === 19) throw new ApiError(409, 'SLUG_TAKEN', 'No se pudo generar un identificador único para el colegio. Cambia el nombre e intenta de nuevo.');
    }
    const existingGlobalUser = await controlModels.GlobalUser.findOne({ where: { email: ownerEmail } });
    const requestedPassword = String(req.body.ownerPassword || '');
    const generatePassword = Boolean(req.body.generateOwnerPassword);
    let temporaryPassword = null;
    let passwordHash = existingGlobalUser?.passwordHash || null;
    if (!existingGlobalUser) {
      if (generatePassword) {
        temporaryPassword = `Ne!${crypto.randomBytes(9).toString('base64url')}`;
        passwordHash = await bcrypt.hash(temporaryPassword, 12);
      } else {
        if (requestedPassword.length < 8 || requestedPassword.length > 128) throw new ApiError(400, 'VALIDATION_ERROR', 'La contraseña del administrador debe tener entre 8 y 128 caracteres.');
        passwordHash = await bcrypt.hash(requestedPassword, 12);
      }
    } else if (requestedPassword || generatePassword) {
      throw new ApiError(409, 'OWNER_EXISTS', 'Ese correo ya tiene cuenta global. Déjalo sin contraseña para reutilizar su acceso actual.');
    }
    if (!passwordHash) throw new ApiError(400, 'VALIDATION_ERROR', 'No hay una contraseña válida para la cuenta administradora.');
    const selectedServer = req.body.databaseServerId
      ? await controlModels.DatabaseServer.findOne({ where: { id: req.body.databaseServerId, status: 'active' } })
      : await selectDatabaseServer();
    if (!selectedServer) throw new ApiError(503, 'NO_DATABASE_SERVER', 'El servidor SQL seleccionado no está activo.');
    // selectDatabaseServer() returns a raw object; findOne returns a model instance.
    const server = typeof selectedServer.toJSON === 'function' ? selectedServer.toJSON() : selectedServer;
    const maxSchoolId = Number(await controlModels.Tenant.max('schoolId')) || 0;
    const schoolId = maxSchoolId + 1, databaseName = String(req.body.databaseName || `dashcole_tenant_${schoolId}`);
    try {
      await provisionTenantDatabase(server, databaseName, { id: schoolId, name, slug });
    } catch (cause) {
      console.error('[tenant_create] provision failed', cause);
      throw new ApiError(500, 'TENANT_PROVISION_FAILED', `No se pudo preparar la base del colegio: ${String(cause?.original?.message || cause?.message || cause).slice(0, 220)}`);
    }
    // Control-plane tables (tenant_plans, etc.) FK to the shared schools.id row.
    await defaultModels.School.findOrCreate({
      where: { id: schoolId },
      defaults: { id: schoolId, name, slug, active: true },
    });
    await defaultModels.School.update({ name, slug, active: true }, { where: { id: schoolId } });
    let tenant = await controlModels.Tenant.findOne({ where: { schoolId } });
    if (!tenant) {
      tenant = await controlModels.Tenant.create({ schoolId, name, slug, databaseServerId: server.id, databaseName, status: 'active' });
    } else {
      await tenant.update({ name, slug, databaseServerId: server.id, databaseName, status: 'active' });
    }
    const plan = tenantPlanInput(req.body.plan);
    const existingPlan = await controlModels.TenantPlan.findOne({ where: { schoolId } });
    if (existingPlan) await existingPlan.update(plan);
    else await controlModels.TenantPlan.create({ schoolId, ...plan });
    const database = await databaseForTenant(schoolId);
    const localUser = await database.models.User.create({ schoolId, username: ownerEmail, passwordHash, fullName: ownerName, phone: String(req.body.ownerPhone || '').trim() || null, role: 'director', canManageUsers: true, canManageGrades: true, canViewReports: true, canManageSchool: true, canManageFinance: true, canManageHr: true, canApproveLeave: true, active: true });
    const globalUser = existingGlobalUser || await controlModels.GlobalUser.create({ email: ownerEmail, fullName: ownerName, phone: localUser.phone, passwordHash, status: 'active' });
    await controlModels.TenantMembership.create({ globalUserId: globalUser.id, schoolId, userId: localUser.id, role: 'director', status: 'active' });
    let courseBootstrap = null;
    const wantsCourses = req.body.createCourses !== false && req.body.createCourses !== 'false';
    const selectedLevels = normalizeSchoolLevels(req.body.levels);
    const selectedSections = normalizeCourseSections(
      req.body.courseSections != null ? req.body.courseSections : req.body.courseSection,
      req.body.courseSection || 'A',
    );
    if (wantsCourses && selectedLevels.length) {
      try {
        courseBootstrap = await bootstrapSchoolCourses({
          models: database.models,
          sequelize: database.sequelize,
          schoolId,
          createdBy: localUser.id,
          levels: selectedLevels.map((level) => level.id),
          sections: selectedSections,
        });
      } catch (cause) {
        console.error('[tenant_create] course bootstrap failed', cause);
        courseBootstrap = {
          error: String(cause?.message || cause).slice(0, 300),
          levels: selectedLevels.length,
          courses: 0,
          subjects: 0,
          sections: selectedSections,
        };
      }
    }
    if (req.body.demoRequestId) await controlModels.DemoRequest.update({ status: 'converted', convertedSchoolId: schoolId }, { where: { id: Number(req.body.demoRequestId), status: { [Op.in]: ['new', 'contacted'] } } });
    await audit(req, 'tenant_create', 'school', schoolId, { name, slug, databaseServerId: server.id, databaseName, plan, courseBootstrap });
    res.status(201).json({
      tenant,
      plan,
      owner: { id: globalUser.id, email: ownerEmail },
      temporaryPassword,
      courseBootstrap,
      availableLevels: SCHOOL_LEVELS,
    });
    } catch (cause) {
      if (cause instanceof ApiError) throw cause;
      if (cause?.name === 'SequelizeUniqueConstraintError' || cause?.original?.code === 'ER_DUP_ENTRY') {
        throw new ApiError(409, 'TENANT_CONFLICT', 'Ese colegio o correo ya existe. Cambia el nombre o el correo e intenta de nuevo.');
      }
      console.error('[tenant_create]', cause);
      throw new ApiError(500, 'TENANT_CREATE_FAILED', `No se pudo crear el colegio: ${String(cause?.original?.message || cause?.message || cause).slice(0, 220)}`);
    }
  });
  app.get('/api/platform/school-levels', requirePlatform('platform.infrastructure.write'), (_req, res) => {
    res.json({ levels: SCHOOL_LEVELS });
  });
  app.post('/api/platform/tenants/:id/enter', requirePlatform('platform.accounts.read'), async (req, res) => {
    if (req.user.impersonation) throw new ApiError(403, 'IMPERSONATION_ACTIVE', 'Termina la impersonación antes de entrar a un colegio.');
    const schoolId = Number(req.params.id);
    const tenant = await controlModels.Tenant.findOne({ where: { schoolId, status: 'active' } });
    if (!tenant) throw new ApiError(404, 'TENANT_NOT_FOUND', 'Colegio no encontrado.');
    const globalUser = await controlModels.GlobalUser.findByPk(req.user.globalUserId);
    if (!globalUser) throw new ApiError(401, 'UNAUTHORIZED', 'Identidad global no disponible.');
    const database = await databaseForTenant(schoolId);
    let membership = await controlModels.TenantMembership.findOne({ where: { globalUserId: globalUser.id, schoolId, status: 'active' } });
    let localUser = membership
      ? await database.models.User.findOne({ where: { id: membership.userId, schoolId, active: true } })
      : await database.models.User.findOne({ where: { schoolId, username: globalUser.email, active: true } });
    if (!localUser) {
      localUser = await database.models.User.create({
        schoolId,
        username: globalUser.email,
        passwordHash: globalUser.passwordHash,
        fullName: globalUser.fullName,
        phone: globalUser.phone || null,
        role: 'school_admin',
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
        active: true,
      });
    }
    if (!membership) {
      membership = await controlModels.TenantMembership.create({
        globalUserId: globalUser.id,
        schoolId,
        userId: localUser.id,
        role: localUser.role,
        status: 'active',
      });
    } else if (Number(membership.userId) !== Number(localUser.id)) {
      await membership.update({ userId: localUser.id, role: localUser.role, status: 'active' });
    }
    const platformRoles = await controlModels.PlatformRole.findAll({ where: { globalUserId: globalUser.id }, raw: true });
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: globalUser.id, status: 'active' }, raw: true });
    const schools = await controlModels.Tenant.findAll({ where: { schoolId: memberships.map(row => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true });
    const plainLocal = localUser.get ? localUser.get({ plain: true }) : localUser;
    // Session elevation only: platform staff must see the whole school without rewriting the local role.
    const elevatedLocal = {
      ...plainLocal,
      role: ['super_admin', 'school_admin', 'director'].includes(plainLocal.role) ? plainLocal.role : 'school_admin',
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
    };
    const user = {
      ...publicUser(elevatedLocal),
      globalUserId: globalUser.id,
      platformRoles: platformRoles.map(row => row.role),
      platformPermissions: [...new Set(platformRoles.flatMap(row => row.permissions || []))],
      memberships: memberships.map(row => ({ id: row.id, schoolId: row.schoolId, role: row.role, school: schools.find(school => school.schoolId === row.schoolId) })),
      platformConsole: false,
    };
    await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(user));
    await redis.sRem(sessionIndexKey(req.user.id), req.authToken);
    await redis.sAdd(sessionIndexKey(user.id), req.authToken);
    await controlModels.SessionRecord.update({ userId: user.id, schoolId, lastSeenAt: new Date() }, { where: { tokenHash: hash(req.authToken), revokedAt: null } });
    await audit(req, 'tenant_enter', 'school', schoolId, { tenant: tenant.name });
    res.json({ user, tenant: { id: schoolId, name: tenant.name, slug: tenant.slug } });
  });
  app.post('/api/platform/console', requirePlatform('platform.accounts.read'), async (req, res) => {
    if (req.user.impersonation) throw new ApiError(403, 'IMPERSONATION_ACTIVE', 'Termina la impersonación antes de volver a la consola.');
    const user = { ...req.user, platformConsole: true };
    await redis.setEx(sessionKey(req.authToken), SESSION_TTL, JSON.stringify(user));
    res.json({ user });
  });
  app.get('/api/platform/tenants/:id', requirePlatformAny('platform.accounts.read', 'platform.infrastructure.read'), async (req, res) => {
    const schoolId = Number(req.params.id);
    if (!Number.isInteger(schoolId) || schoolId < 1) throw new ApiError(400, 'VALIDATION_ERROR', 'Colegio inválido.');
    const tenant = await controlModels.Tenant.findOne({ where: { schoolId }, raw: true });
    if (!tenant) throw new ApiError(404, 'TENANT_NOT_FOUND', 'Colegio no encontrado.');
    const [domains, plan, memberships, online] = await Promise.all([
      controlModels.TenantDomain.findAll({ where: { schoolId }, raw: true }),
      controlModels.TenantPlan.findOne({ where: { schoolId }, raw: true }),
      controlModels.TenantMembership.findAll({ where: { schoolId }, raw: true }),
      listOnline({ withinSec: ONLINE_WITHIN_SEC, limit: 100, schoolId }),
    ]);
    const globalUsers = memberships.length
      ? await controlModels.GlobalUser.findAll({ where: { id: memberships.map(row => row.globalUserId) }, attributes: ['id', 'email', 'fullName', 'status', 'lastLoginAt'], raw: true })
      : [];
    const accountById = new Map(globalUsers.map(user => [Number(user.id), user]));
    const globalByLocalUser = new Map(memberships.map(row => [Number(row.userId), Number(row.globalUserId)]));
    let students = null;
    let employees = null;
    let users = null;
    let auditLogs = [];
    let studentRows = [];
    try {
      const database = await databaseForTenant(schoolId, { activeOnly: false });
      const [studentCount, employeeCount, userCount, studentList] = await Promise.all([
        database.models.Student.count({ where: { schoolId, active: true } }),
        database.models.Employee.count({ where: { schoolId, active: true } }),
        database.models.User.count({ where: { schoolId, active: true } }),
        database.models.Student.findAll({
          where: { schoolId, active: true },
          attributes: ['id', 'firstName', 'lastName', 'userId', 'nationalId', 'email'],
          order: [['lastName', 'ASC'], ['firstName', 'ASC']],
          limit: 150,
          raw: true,
        }),
      ]);
      students = studentCount;
      employees = employeeCount;
      users = userCount;
      studentRows = studentList.map(row => {
        const globalUserId = row.userId ? globalByLocalUser.get(Number(row.userId)) || null : null;
        const account = globalUserId ? accountById.get(Number(globalUserId)) : null;
        return {
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName,
          nationalId: row.nationalId || null,
          userId: row.userId || null,
          globalUserId,
          email: account?.email || row.email || null,
          fullName: `${row.firstName || ''} ${row.lastName || ''}`.trim(),
        };
      });
      try {
        auditLogs = await database.models.AuditLog.findAll({
          where: { schoolId },
          order: [['created_at', 'DESC']],
          limit: 100,
          raw: true,
        });
      } catch {
        auditLogs = [];
      }
    } catch { /* Tenant sin base o inaccesible. */ }
    res.json({
      tenant: {
        ...tenant,
        id: tenant.schoolId,
        routeId: tenant.id,
        domains,
        plan,
        students,
        employees,
        users,
        accounts: memberships.length,
      },
      memberships: memberships.map(row => ({
        ...row,
        account: accountById.get(Number(row.globalUserId)) || null,
      })),
      sessions: online.rows,
      onlineWithinSec: online.withinSec,
      studentProfiles: studentRows,
      activity: auditLogs.map(row => ({
        id: row.id,
        action: row.action,
        entity: row.entity,
        entityId: row.entityId ?? row.entity_id,
        createdAt: row.createdAt || row.created_at,
        createdBy: row.createdBy || row.created_by,
        payload: row.payload,
      })),
    });
  });

  app.put('/api/platform/tenants/:id/status', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const schoolId = Number(req.params.id);
    const status = String(req.body.status || '').trim();
    if (!['active', 'suspended'].includes(status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado de colegio inválido.');
    const tenant = await controlModels.Tenant.findOne({ where: { schoolId } });
    if (!tenant) throw new ApiError(404, 'TENANT_NOT_FOUND', 'Colegio no encontrado.');
    // Al suspender: marcar School primero mientras el routing sigue activo; luego status del tenant.
    // Al reactivar: status del tenant primero para recuperar routing.
    if (status === 'suspended') {
      try {
        const database = await databaseForTenant(schoolId, { activeOnly: false });
        await database.models.School.update({ active: false }, { where: { id: schoolId } });
      } catch { /* La marca de tenant basta para bloquear el acceso. */ }
      await tenant.update({ status });
    } else {
      await tenant.update({ status });
      try {
        const database = await databaseForTenant(schoolId);
        await database.models.School.update({ active: true }, { where: { id: schoolId } });
      } catch { /* La marca de tenant basta para abrir el acceso. */ }
    }
    await invalidateTenantRoute(schoolId);
    await audit(req, status === 'suspended' ? 'tenant_suspend' : 'tenant_activate', 'school', schoolId, { status });
    res.json({ tenant });
  });
  app.put('/api/platform/tenants/:id/database', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const schoolId = Number(req.params.id), server = await controlModels.DatabaseServer.findOne({ where: { id: req.body.databaseServerId, status: 'active' } });
    const tenant = await controlModels.Tenant.findOne({ where: { schoolId } });
    const databaseName = String(req.body.databaseName || '').trim();
    if (!tenant || !server || !databaseName) throw new ApiError(400, 'VALIDATION_ERROR', 'Tenant, servidor o base de destino inválidos.');
    const test = await testDatabaseServer({ ...server.toJSON(), databaseName }, '', schoolId);
    if (!test.ok) throw new ApiError(422, 'DESTINATION_NOT_READY', test.error);
    await tenant.update({ databaseServerId: server.id, databaseName, status: 'active' });
    await invalidateTenantRoute(schoolId);
    await audit(req, 'tenant_database_move', 'school', schoolId, { databaseServerId: server.id, databaseName });
    res.json({ tenant });
  });
  app.put('/api/platform/tenants/:id/plan', requirePlatform('platform.accounts.update'), async (req, res) => {
    const schoolId = Number(req.params.id), current = await controlModels.TenantPlan.findOne({ where: { schoolId }, raw: true });
    if (!await controlModels.Tenant.count({ where: { schoolId } })) throw new ApiError(404, 'NOT_FOUND', 'Colegio no encontrado.');
    const plan = tenantPlanInput(req.body, current);
    await controlModels.TenantPlan.upsert({ schoolId, ...plan });
    await audit(req, 'tenant_plan_update', 'school', schoolId, plan);
    res.json({ saved: true, plan });
  });
  app.get('/api/platform/demo-requests', requirePlatform('platform.accounts.read'), async (req, res) => {
    const where = ['new', 'contacted', 'converted', 'closed'].includes(req.query.status) ? { status: req.query.status } : {};
    res.json(await controlModels.DemoRequest.findAll({ where, order: [['id', 'DESC']], limit: 200 }));
  });
  app.get('/api/platform/contact-messages', requirePlatform('platform.accounts.read'), async (_req, res) => {
    const rows = await defaultModels.ContactMessage.findAll({ order: [['created_at', 'DESC']], limit: 200 });
    res.json(rows);
  });
  app.put('/api/platform/contact-messages/:id/status', requirePlatform('platform.accounts.read'), async (req, res) => {
    if (!['new', 'read', 'closed'].includes(req.body.status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado inválido.');
    const message = await defaultModels.ContactMessage.findByPk(req.params.id);
    if (!message) throw new ApiError(404, 'NOT_FOUND', 'Mensaje no encontrado.');
    await message.update({ status: req.body.status });
    res.json({ message });
  });
  app.delete('/api/platform/contact-messages/:id', requirePlatform('platform.accounts.read'), async (req, res) => {
    const message = await defaultModels.ContactMessage.findByPk(req.params.id);
    if (!message) throw new ApiError(404, 'NOT_FOUND', 'Mensaje no encontrado.');
    await message.destroy();
    await audit(req, 'contact_message_delete', 'contact_message', Number(req.params.id));
    res.json({ deleted: true, id: Number(req.params.id) });
  });
  app.post('/api/platform/contact-messages/bulk-delete', requirePlatform('platform.accounts.read'), async (req, res) => {
    const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0))];
    if (!ids.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona al menos un mensaje.');
    if (ids.length > 200) throw new ApiError(400, 'VALIDATION_ERROR', 'Demasiados mensajes para eliminar de una vez.');
    const deleted = await defaultModels.ContactMessage.destroy({ where: { id: { [Op.in]: ids } } });
    await audit(req, 'contact_message_bulk_delete', 'contact_message', null, { ids, deleted });
    res.json({ deleted, ids });
  });
  app.post('/api/platform/contact-messages/bulk-status', requirePlatform('platform.accounts.read'), async (req, res) => {
    const status = req.body?.status;
    if (!['new', 'read', 'closed'].includes(status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado inválido.');
    const ids = [...new Set((Array.isArray(req.body?.ids) ? req.body.ids : [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0))];
    if (!ids.length) throw new ApiError(400, 'VALIDATION_ERROR', 'Selecciona al menos un mensaje.');
    if (ids.length > 200) throw new ApiError(400, 'VALIDATION_ERROR', 'Demasiados mensajes para actualizar de una vez.');
    const [updated] = await defaultModels.ContactMessage.update({ status }, { where: { id: { [Op.in]: ids } } });
    await audit(req, 'contact_message_bulk_status', 'contact_message', null, { ids, status, updated });
    res.json({ updated, ids, status });
  });
  app.get('/api/platform/demo/reset', requirePlatform('platform.infrastructure.write'), async (_req, res) => {
    res.json(await getDemoResetStatus());
  });
  app.post('/api/platform/demo/reset', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const result = await resetDemoData({ source: 'platform', by: req.user.username || req.user.fullName || `global:${req.user.globalUserId}` });
    await audit(req, 'demo_reset', 'platform', null, { schools: result.seeded?.map(row => row.slug) || [] });
    res.json(result);
  });
  app.put('/api/platform/demo/access', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const enabled = req.body?.enabled;
    if (typeof enabled !== 'boolean') throw new ApiError(400, 'VALIDATION_ERROR', 'Indica enabled true o false.');
    const result = await setDemoSchoolsAccess({
      enabled,
      by: req.user.username || req.user.fullName || `global:${req.user.globalUserId}`,
    });
    await audit(req, enabled ? 'demo_schools_enable' : 'demo_schools_disable', 'platform', null, {
      schools: result.updated?.map((row) => row.slug) || [],
      count: result.updated?.length || 0,
    });
    res.json(result);
  });
  app.put('/api/platform/demo-requests/:id/status', requirePlatform('platform.accounts.update'), async (req, res) => {
    if (!['new', 'contacted', 'converted', 'closed'].includes(req.body.status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado inválido.');
    const [updated] = await controlModels.DemoRequest.update({ status: req.body.status }, { where: { id: Number(req.params.id) } });
    if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Solicitud no encontrada.');
    res.json({ saved: true });
  });
  app.post('/api/platform/tenants/:id/domains', requirePlatform('platform.accounts.update'), async (req, res) => {
    const schoolId = Number(req.params.id), hostname = String(req.body.hostname || '').trim().toLowerCase();
    if (!await controlModels.Tenant.count({ where: { schoolId } }) || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(hostname)) throw new ApiError(400, 'VALIDATION_ERROR', 'Dominio o colegio inválido.');
    const domain = await controlModels.TenantDomain.create({ schoolId, hostname, active: true });
    await audit(req, 'tenant_domain_create', 'school', schoolId, { hostname });
    res.status(201).json({ domain });
  });

  app.get('/api/platform/accounts/:id', requirePlatform('platform.accounts.read'), async (req, res) => {
    const account = await controlModels.GlobalUser.findByPk(req.params.id, { raw: true });
    if (!account) throw new ApiError(404, 'NOT_FOUND', 'Cuenta global no encontrada.');
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: account.id }, raw: true });
    const [roles, sessions, impersonations] = await Promise.all([
      controlModels.PlatformRole.findAll({ where: { globalUserId: account.id }, raw: true }),
      controlModels.SessionRecord.findAll({ where: { globalUserId: account.id }, order: [['lastSeenAt', 'DESC'], ['id', 'DESC']], limit: 200, raw: true }),
      controlModels.Impersonation.findAll({
        where: {
          [Op.or]: [
            { actorGlobalUserId: account.id },
            ...(memberships.length ? [{ targetUserId: { [Op.in]: memberships.map(row => row.userId) } }] : []),
          ],
        },
        order: [['startedAt', 'DESC']],
        limit: 50,
        raw: true,
      }),
    ]);
    const schoolIds = [...new Set([
      ...memberships.map(row => row.schoolId),
      ...sessions.map(row => row.schoolId),
      ...impersonations.map(row => row.schoolId).filter(Boolean),
    ].filter(Boolean))];
    const tenantRows = schoolIds.length
      ? await controlModels.Tenant.findAll({ where: { schoolId: schoolIds }, attributes: ['schoolId', 'name', 'slug'], raw: true })
      : [];
    const schools = tenantRows.map(row => ({ id: row.schoolId, name: row.name, slug: row.slug }));
    const schoolById = new Map(schools.map(row => [row.id, row]));
    const students = [], enrollments = [], auditLogs = [];
    const enrichedMemberships = [];
    for (const membership of memberships) {
      let database;
      try {
        database = await databaseForTenant(membership.schoolId);
      } catch (cause) {
        console.error('[platform.accounts.detail] tenant db', membership.schoolId, cause?.message || cause);
        enrichedMemberships.push({
          ...membership,
          school: schoolById.get(membership.schoolId) || null,
          localUser: null,
          employee: null,
          guardian: null,
          error: 'No se pudo abrir la base del colegio.',
        });
        continue;
      }
      const [localUser, employee, guardian, localStudents] = await Promise.all([
        database.models.User.findOne({
          where: { id: membership.userId, schoolId: membership.schoolId },
          attributes: ['id', 'username', 'fullName', 'phone', 'role', 'active', 'canManageUsers', 'canManageGrades', 'canViewReports', 'canManageSchool', 'canManageFinance', 'canManageHr', 'canApproveLeave', 'created_at', 'updated_at'],
          raw: true,
        }),
        database.models.Employee.findOne({ where: { userId: membership.userId, schoolId: membership.schoolId }, raw: true }),
        database.models.Guardian.findOne({ where: { userId: membership.userId, schoolId: membership.schoolId }, raw: true }),
        database.models.Student.findAll({ where: { userId: membership.userId }, raw: true }),
      ]);
      enrichedMemberships.push({
        ...membership,
        school: schoolById.get(membership.schoolId) || null,
        localUser: localUser ? {
          ...localUser,
          createdAt: localUser.created_at || localUser.createdAt,
          updatedAt: localUser.updated_at || localUser.updatedAt,
        } : null,
        employee,
        guardian,
      });
      students.push(...localStudents.map(row => ({ ...row, schoolId: membership.schoolId, school: schoolById.get(membership.schoolId) || null })));
      if (localStudents.length) {
        enrollments.push(...await database.models.Enrollment.findAll({
          where: { studentId: localStudents.map(row => row.id) },
          order: [['created_at', 'DESC']],
          raw: true,
        }));
      }
      const logs = await database.models.AuditLog.findAll({
        where: { [Op.or]: [{ entity: 'global_user', entityId: account.id }, { entity: 'user', entityId: membership.userId }] },
        order: [['created_at', 'DESC']],
        limit: 100,
        raw: true,
      });
      auditLogs.push(...logs.map(row => ({
        ...row,
        schoolId: membership.schoolId,
        school: schoolById.get(membership.schoolId) || null,
        createdAt: row.created_at || row.createdAt,
      })));
    }
    const activeSessions = sessions.filter(row => !row.revokedAt);
    const lastSession = sessions[0] || null;
    res.json({
      account: {
        ...account,
        createdAt: account.created_at || account.createdAt,
        updatedAt: account.updated_at || account.updatedAt,
      },
      memberships: enrichedMemberships,
      roles,
      sessions: sessions.map(row => ({
        ...row,
        school: schoolById.get(row.schoolId) || null,
        createdAt: row.created_at || row.createdAt,
        lastSeenAt: row.last_seen_at || row.lastSeenAt,
        revokedAt: row.revoked_at || row.revokedAt,
        active: !row.revokedAt && !row.revoked_at,
      })),
      impersonations: impersonations.map(row => ({
        ...row,
        school: schoolById.get(row.schoolId) || null,
        startedAt: row.started_at || row.startedAt,
        endedAt: row.ended_at || row.endedAt,
      })),
      schools,
      accessSummary: {
        lastLoginAt: account.lastLoginAt || account.last_login_at || null,
        lastSeenAt: lastSession?.lastSeenAt || lastSession?.last_seen_at || null,
        lastIp: lastSession?.ip || null,
        lastUserAgent: lastSession?.userAgent || lastSession?.user_agent || null,
        lastSchoolId: lastSession?.schoolId || null,
        lastSchool: lastSession ? (schoolById.get(lastSession.schoolId) || null) : null,
        activeSessions: activeSessions.length,
        totalSessions: sessions.length,
        membershipCount: memberships.length,
      },
      studentProfiles: students.map(student => ({
        ...student,
        enrollments: enrollments.filter(row => row.studentId === student.id && row.schoolId === student.schoolId),
      })),
      auditLogs: auditLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100),
    });
  });
  app.put('/api/platform/accounts/:id', requirePlatform('platform.accounts.update'), async (req, res) => {
    const account = await controlModels.GlobalUser.findByPk(req.params.id);
    const fullName = String(req.body.fullName || '').trim(), email = String(req.body.email || '').trim().toLowerCase(), phone = String(req.body.phone || '').trim(), identifier = String(req.body.identifier || '').trim().toUpperCase();
    if (!account || fullName.length < 3 || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone && !/^\+[1-9]\d{7,14}$/.test(phone) || identifier.length > 40) throw new ApiError(400, 'VALIDATION_ERROR', 'Revisa nombre, correo, teléfono e identificador.');
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: account.id }, raw: true });
    await controlSequelize.transaction(async transaction => {
      await account.update({ fullName, email, phone: phone || null, identifier: identifier || null }, { transaction });
    });
    await updateMembershipUsers(memberships, { fullName, username: email, phone: phone || null });
    await audit(req, 'platform_account_update', 'global_user', account.id, { fullName, email, phone, identifier });
    res.json({ account });
  });
  app.put('/api/platform/memberships/:id', requirePlatform('platform.accounts.roles'), async (req, res) => {
    const membership = await controlModels.TenantMembership.findByPk(req.params.id);
    const role = String(req.body.role || membership?.role || ''), schoolId = Number(req.body.schoolId || membership?.schoolId), status = String(req.body.status || membership?.status || '');
    const allowedRoles = ['super_admin','school_admin','director','manager','monitor','utp','finance','agente_finanzas','teacher','inspector','warehouse','guardian','student'];
    if (!membership || !await controlModels.Tenant.count({ where: { schoolId } }) || !['active', 'suspended', 'left'].includes(status) || !allowedRoles.includes(role)) throw new ApiError(400, 'VALIDATION_ERROR', 'Membresía inválida.');
    const sourceDatabase = membership ? await databaseForTenant(membership.schoolId) : null;
    const previousUserId = membership.userId;
    if (schoolId !== membership.schoolId) {
      const linked = await Promise.all([sourceDatabase.models.Employee, sourceDatabase.models.Student, sourceDatabase.models.Guardian].map(model => model.count({ where: { userId: membership.userId } })));
      if (linked.some(Boolean)) throw new ApiError(409, 'MEMBERSHIP_HAS_PROFILE', 'Traslada primero el perfil académico o laboral; no se moverán datos relacionados implícitamente.');
      const sourceUser = await sourceDatabase.models.User.findByPk(membership.userId, { raw: true });
      if (!sourceUser) throw new ApiError(409, 'MEMBERSHIP_USER_MISSING', 'La membresía no tiene una cuenta local válida.');
      const targetDatabase = await databaseForTenant(schoolId);
      const { id: _id, schoolId: _schoolId, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = sourceUser;
      const targetUser = await targetDatabase.models.User.create({ ...copy, schoolId, role, active: status === 'active' });
      try {
        await membership.update({ userId: targetUser.id, role, schoolId, status, leftAt: status === 'left' ? new Date() : null });
        await sourceDatabase.models.User.destroy({ where: { id: previousUserId } });
      } catch (error) {
        await targetUser.destroy().catch(() => {});
        throw error;
      }
    } else {
      await membership.update({ role, status, leftAt: status === 'left' ? new Date() : null });
      await sourceDatabase.models.User.update({ role, active: status === 'active' }, { where: { id: membership.userId } });
    }
    await revokeUserSessions(previousUserId);
    await audit(req, 'platform_membership_update', 'tenant_membership', membership.id, { role, schoolId, status });
    res.json({ membership });
  });
  app.post('/api/platform/accounts/:id/memberships', requirePlatform('platform.accounts.roles'), async (req, res) => {
    const account = await controlModels.GlobalUser.findByPk(req.params.id);
    if (!account) throw new ApiError(404, 'NOT_FOUND', 'Cuenta global no encontrada.');
    if (account.status !== 'active') throw new ApiError(409, 'ACCOUNT_INACTIVE', 'Reactiva la cuenta antes de asignarla a un colegio.');
    const schoolId = Number(req.body.schoolId);
    const role = String(req.body.role || 'teacher').trim();
    const assignableRoles = ['super_admin', 'school_admin', 'director', 'manager', 'monitor', 'utp', 'finance', 'agente_finanzas', 'teacher', 'inspector', 'warehouse', 'student', 'guardian'];
    if (!Number.isSafeInteger(schoolId) || schoolId < 1 || !assignableRoles.includes(role)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Indica un colegio y un rol válidos.');
    }
    const tenant = await controlModels.Tenant.findOne({ where: { schoolId }, raw: true });
    if (!tenant) throw new ApiError(404, 'TENANT_NOT_FOUND', 'Colegio no encontrado.');
    const existing = await controlModels.TenantMembership.findOne({ where: { globalUserId: account.id, schoolId }, raw: true });
    if (existing) throw new ApiError(409, 'MEMBERSHIP_EXISTS', 'Esta persona ya tiene acceso a ese colegio.');
    const database = await databaseForTenant(schoolId);
    const email = String(account.email || '').trim().toLowerCase();
    let localUser = await database.models.User.findOne({ where: { schoolId, username: email } });
    const isLeadership = ['director', 'school_admin', 'super_admin', 'manager'].includes(role);
    const isUtp = role === 'utp';
    const isFinance = ['finance', 'agente_finanzas'].includes(role);
    if (!localUser) {
      localUser = await database.models.User.create({
        schoolId,
        username: email,
        passwordHash: account.passwordHash,
        fullName: account.fullName,
        phone: account.phone || null,
        role,
        canManageUsers: isLeadership || isUtp,
        canManageGrades: isLeadership || isUtp || role === 'teacher',
        canViewReports: isLeadership || isUtp || role === 'monitor' || isFinance,
        canManageSchool: isLeadership,
        canManageHr: isLeadership || isUtp || isFinance,
        canManageFinance: isLeadership || isUtp || isFinance,
        canApproveLeave: isLeadership || isUtp || isFinance,
        canViewSige: isLeadership || isUtp,
        canConfigureSige: isLeadership || isUtp,
        canSyncSige: isLeadership || isUtp,
        canViewSigeLogs: isLeadership || isUtp,
        active: true,
      });
    } else {
      const otherMembership = await controlModels.TenantMembership.findOne({
        where: { schoolId, userId: localUser.id, globalUserId: { [Op.ne]: account.id } },
      });
      if (otherMembership) throw new ApiError(409, 'USERNAME_TAKEN', 'Ese correo ya está vinculado a otra identidad en el colegio.');
      await localUser.update({
        fullName: account.fullName,
        phone: account.phone || null,
        passwordHash: account.passwordHash,
        role,
        active: true,
        canManageUsers: isLeadership || isUtp,
        canManageGrades: isLeadership || isUtp || role === 'teacher',
        canViewReports: isLeadership || isUtp || role === 'monitor' || isFinance,
        canManageSchool: isLeadership,
        canManageHr: isLeadership || isUtp || isFinance,
        canManageFinance: isLeadership || isUtp || isFinance,
        canApproveLeave: isLeadership || isUtp || isFinance,
        canViewSige: isLeadership || isUtp,
        canConfigureSige: isLeadership || isUtp,
        canSyncSige: isLeadership || isUtp,
        canViewSigeLogs: isLeadership || isUtp,
      });
    }
    if (['teacher', 'agente_finanzas', 'finance', 'utp'].includes(role)) {
      const employee = await database.models.Employee.findOne({ where: { userId: localUser.id, schoolId } });
      if (!employee) {
        await database.models.Employee.create({
          schoolId,
          userId: localUser.id,
          fullName: account.fullName,
          position: role === 'teacher' ? 'Profesor' : role === 'utp' ? 'Jefe/a de UTP' : 'Agente de finanzas',
          active: true,
        });
      }
    }
    if (role === 'student') {
      const existingStudent = await database.models.Student.findOne({ where: { userId: localUser.id, schoolId } });
      if (!existingStudent) {
        const parts = String(account.fullName || '').trim().split(/\s+/).filter(Boolean);
        const firstName = parts[0] || account.fullName || email.split('@')[0] || 'Estudiante';
        const lastName = parts.slice(1).join(' ') || 'Sin apellido';
        await database.models.Student.create({
          schoolId,
          userId: localUser.id,
          firstName: firstName.slice(0, 80),
          lastName: lastName.slice(0, 80),
          email: email || null,
          nationalId: account.identifier || null,
          identifierType: 'rut',
          active: true,
        });
      }
    }
    if (role === 'guardian') {
      const existingGuardian = await database.models.Guardian.findOne({ where: { userId: localUser.id, schoolId } });
      if (!existingGuardian) {
        await database.models.Guardian.create({
          schoolId,
          userId: localUser.id,
          fullName: account.fullName,
          email: email || null,
          phone: account.phone || null,
          nationalId: account.identifier || null,
        });
      }
    }
    const membership = await controlModels.TenantMembership.create({
      globalUserId: account.id,
      schoolId,
      userId: localUser.id,
      role,
      status: 'active',
    });
    await audit(req, 'platform_membership_create', 'tenant_membership', membership.id, { schoolId, role, globalUserId: account.id });
    res.status(201).json({
      membership: {
        ...membership.get({ plain: true }),
        school: { id: schoolId, schoolId, name: tenant.name, slug: tenant.slug },
      },
    });
  });
  app.post('/api/platform/accounts/:id/reset-access', requirePlatform('platform.accounts.update'), async (req, res) => {
    const password = String(req.body.password || crypto.randomBytes(12).toString('base64url'));
    if (password.length < 10 || password.length > 128) throw new ApiError(400, 'VALIDATION_ERROR', 'La contraseña temporal debe tener al menos 10 caracteres.');
    const account = await controlModels.GlobalUser.findByPk(req.params.id);
    if (!account) throw new ApiError(404, 'NOT_FOUND', 'Cuenta global no encontrada.');
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: account.id }, raw: true });
    const email = String(account.email || '').trim().toLowerCase();
    if (!memberships.length) {
      throw new ApiError(
        409,
        'NO_SCHOOL_ACCESS',
        'Esta identidad no tiene colegio asignado, así que no puede iniciar sesión. Primero asignala a un colegio en la pestaña Colegios y después restablecé el acceso.',
      );
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await controlSequelize.transaction(async transaction => {
      await account.update({ passwordHash }, { transaction });
    });
    await updateMembershipUsers(memberships, { passwordHash });
    await syncPasswordByEmail(email, passwordHash);
    await Promise.all(memberships.map(row => revokeUserSessions(row.userId)));
    await controlModels.SessionRecord.update({ revokedAt: new Date() }, { where: { globalUserId: account.id, revokedAt: null } });
    await audit(req, 'platform_access_reset', 'global_user', account.id);
    const sendEmail = req.body.sendEmail !== false && req.body.sendEmail !== 'false' && req.body.sendEmail !== 0;
    let emailDelivery = { sent: false, reason: 'Sin correo en la cuenta', skipped: !sendEmail };
    if (sendEmail && email) {
      try {
        emailDelivery = await sendAccessReset({
          email,
          fullName: account.fullName,
          password,
          messageId: `<platform-reset-${account.id}-${Date.now()}@hlquery.com>`,
        });
      } catch (error) {
        emailDelivery = { sent: false, reason: error.message || 'No se pudo enviar el correo' };
      }
    } else if (!sendEmail) {
      emailDelivery = { sent: false, reason: 'Envío de correo omitido', skipped: true };
    }
    await audit(req, 'platform_access_reset_email', 'global_user', account.id, {
      sent: Boolean(emailDelivery.sent),
      skipped: Boolean(emailDelivery.skipped),
      reason: emailDelivery.reason || null,
    });
    res.set('Cache-Control', 'no-store').json({
      temporaryPassword: password,
      emailSent: Boolean(emailDelivery.sent),
      emailSkipped: Boolean(emailDelivery.skipped),
      emailReason: emailDelivery.sent ? null : (emailDelivery.reason || 'No se pudo enviar el correo'),
    });
  });

  app.put('/api/platform/accounts/:id/status', requirePlatform('platform.accounts.disable'), async (req, res) => {
    const status = String(req.body.status || '');
    if (!['active', 'blocked', 'suspended'].includes(status)) throw new ApiError(400, 'VALIDATION_ERROR', 'Estado global inválido.');
    const account = await controlModels.GlobalUser.findByPk(req.params.id);
    if (!account) throw new ApiError(404, 'NOT_FOUND', 'Cuenta global no encontrada.');
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: account.id }, raw: true });
    await controlSequelize.transaction(async transaction => {
      await account.update({ status }, { transaction });
      await controlModels.TenantMembership.update({ status: status === 'active' ? 'active' : 'suspended' }, { where: { globalUserId: account.id }, transaction });
    });
    await updateMembershipUsers(memberships, { active: status === 'active' });
    await Promise.all(memberships.map(row => revokeUserSessions(row.userId)));
    await audit(req, 'platform_account_status', 'global_user', account.id, { status });
    res.json({ saved: true });
  });

  app.put('/api/platform/accounts/:id/roles', requirePlatform('platform.accounts.roles'), async (req, res) => {
    const role = String(req.body.role || '').trim();
    const permissions = Array.isArray(req.body.permissions) ? [...new Set(req.body.permissions.map(String))] : [];
    if (!['platform_admin', 'support_agent', 'sales_admin', 'billing_admin', 'technical_admin'].includes(role) || permissions.some(value => !/^platform\.[a-z.]+$/.test(value))) throw new ApiError(400, 'VALIDATION_ERROR', 'Rol o permisos globales inválidos.');
    await controlModels.PlatformRole.upsert({ globalUserId: Number(req.params.id), role, permissions });
    await audit(req, 'platform_role_update', 'global_user', Number(req.params.id), { role, permissions });
    res.json({ saved: true });
  });
  app.delete('/api/platform/accounts/:id/roles/:role', requirePlatform('platform.accounts.roles'), async (req, res) => {
    const role = String(req.params.role);
    const removed = await controlModels.PlatformRole.destroy({ where: { globalUserId: req.params.id, role } });
    if (!removed) throw new ApiError(404, 'NOT_FOUND', 'Rol de plataforma no encontrado.');
    await audit(req, 'platform_role_remove', 'global_user', Number(req.params.id), { role });
    res.json({ removed: true });
  });

  app.delete('/api/platform/accounts/:id/sessions', requirePlatform('platform.accounts.sessions'), async (req, res) => {
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: req.params.id }, raw: true });
    await Promise.all(memberships.map(row => revokeUserSessions(row.userId)));
    await audit(req, 'platform_sessions_revoke', 'global_user', Number(req.params.id));
    res.status(204).end();
  });

  app.post('/api/platform/impersonations', requirePlatform('platform.accounts.impersonate'), async (req, res) => {
    if (req.user.impersonation) throw new ApiError(403, 'IMPERSONATION_ACTIVE', 'Ya estás viendo el sistema como otra persona. Salí de esa sesión primero.');
    const userId = Number(req.body.userId);
    const schoolId = Number(req.body.schoolId);
    const reason = String(req.body.reason || 'Soporte plataforma').trim().slice(0, 500) || 'Soporte plataforma';
    if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(schoolId) || schoolId < 1) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Indica usuario y colegio válidos.');
    }
    if (Number(req.user.id) === userId && Number(req.user.schoolId) === schoolId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'No puedes entrar como tu propia sesión actual.');
    }
    const membership = await controlModels.TenantMembership.findOne({ where: { userId, schoolId, status: 'active' }, raw: true });
    if (!membership) throw new ApiError(409, 'IDENTITY_NOT_READY', 'La identidad global del usuario aún no está sincronizada.');
    const targetDatabase = await databaseForTenant(schoolId);
    const target = await targetDatabase.models.User.findOne({ where: { id: userId, schoolId, active: true }, raw: true });
    if (!target) throw new ApiError(404, 'NOT_FOUND', 'Usuario objetivo no encontrado.');
    const record = await controlModels.Impersonation.create({ actorGlobalUserId: req.user.globalUserId, targetUserId: userId, schoolId, reason, ip: req.ip });
    const token = crypto.randomBytes(32).toString('hex');
    const memberships = await controlModels.TenantMembership.findAll({ where: { globalUserId: membership.globalUserId, status: 'active' }, raw: true });
    const schools = await controlModels.Tenant.findAll({ where: { schoolId: memberships.map(row => row.schoolId), status: 'active' }, attributes: ['schoolId', 'name', 'slug'], raw: true });
    const safe = {
      ...publicUser(target),
      globalUserId: membership.globalUserId,
      platformRoles: [],
      platformPermissions: [],
      memberships: memberships.map(row => ({ id: row.id, schoolId: row.schoolId, role: row.role, school: schools.find(school => school.schoolId === row.schoolId) })),
      platformConsole: false,
      impersonation: { id: record.id, actorGlobalUserId: req.user.globalUserId, reason },
    };
    // Keep the administrator session alive while support is impersonating.
    if (req.authToken) {
      await redis.expire(sessionKey(req.authToken), SESSION_TTL);
      await redis.expire(sessionIndexKey(req.user.id), SESSION_TTL);
    }
    await redis.setEx(sessionKey(token), SESSION_TTL, JSON.stringify(safe));
    await redis.sAdd(sessionIndexKey(userId), token);
    await redis.expire(sessionIndexKey(userId), SESSION_TTL);
    await touchPresence(token);
    await controlModels.SessionRecord.create({ tokenHash: hash(token), globalUserId: membership.globalUserId, userId, schoolId, ip: String(req.get('x-forwarded-for') || '').split(',')[0].trim() || req.ip, userAgent: String(req.get('user-agent') || '').slice(0, 255) });
    await audit(req, 'impersonation_start', 'user', userId, { impersonationId: record.id, reason });
    res.status(201).json({ token, user: safe, expiresIn: SESSION_TTL });
  });

  app.get('/api/platform/smtp', requirePlatform('platform.infrastructure.write'), async (_req, res) => {
    res.json(await getSmtpPublicConfig());
  });

  app.put('/api/platform/smtp', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    try {
      const smtp = await saveSmtpConfig(req.body || {}, req.user.globalUserId || req.user.id);
      await audit(req, 'platform_smtp_update', 'platform_setting', 0, { host: smtp.host || null, configured: smtp.configured });
      res.json(smtp);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'VALIDATION_ERROR', error.message || 'No se pudo guardar SMTP.');
    }
  });

  app.post('/api/platform/smtp/test', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    const to = String(req.body?.to || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(to)) throw new ApiError(400, 'VALIDATION_ERROR', 'Indica un correo de prueba válido.');
    const config = await getSmtpConfig();
    if (!config?.host) throw new ApiError(502, 'MAIL_UNAVAILABLE', 'SMTP no configurado.');
    const transport = nodemailer.createTransport({
      host: config.host,
      port: Number(config.port || 587),
      secure: Boolean(config.secure),
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      auth: config.user ? { user: config.user, pass: config.password || '' } : undefined,
    });
    await transport.verify();
    await transport.sendMail({
      from: config.from || 'DashCole <no-reply@hlquery.com>',
      to,
      subject: 'Prueba SMTP DashCole',
      text: 'Este mensaje confirma que la configuración SMTP de DashCole funciona.',
    });
    await audit(req, 'platform_smtp_test', 'platform_setting', 0, { to });
    res.json({ sent: true, to });
  });

  async function estimatedAmount(schoolId, months = 1) {
    const plan = await controlModels.TenantPlan.findOne({ where: { schoolId }, raw: true });
    let students = 0;
    try {
      students = await (await databaseForTenant(schoolId)).models.Student.count({ where: { schoolId, active: true } });
    } catch { students = 0; }
    const monthly = planMonthlyAmount(plan, students) ?? 0;
    const chargeable = String(plan?.code || '').toLowerCase() === 'custom'
      ? Math.max(0, monthly)
      : Math.max(monthly > 0 ? 1000 : 0, monthly);
    return { amount: chargeable * Math.max(1, months), monthly: chargeable, students, plan };
  }

  app.get('/api/platform/billing', requirePlatform('platform.accounts.read'), async (_req, res) => {
    const tenants = await controlModels.Tenant.findAll({ order: [['name', 'ASC']], raw: true });
    const plans = await controlModels.TenantPlan.findAll({ raw: true });
    const cardKeys = tenants.map(tenant => `oneclick.card.${tenant.schoolId}`);
    const cards = cardKeys.length
      ? await controlModels.PlatformSetting.findAll({ where: { key: { [Op.in]: cardKeys } }, raw: true })
      : [];
    const orders = controlModels.PlatformBillingOrder
      ? await controlModels.PlatformBillingOrder.findAll({ order: [['id', 'DESC']], limit: 40, raw: true })
      : [];
    const rows = [];
    for (const tenant of tenants) {
      const estimate = await estimatedAmount(tenant.schoolId, 1);
      const card = cards.find(row => row.key === `oneclick.card.${tenant.schoolId}`)?.config || null;
      rows.push({
        id: tenant.schoolId,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: plans.find(row => row.schoolId === tenant.schoolId) || null,
        students: estimate.students,
        monthlyAmount: estimate.monthly,
        oneclick: card ? { username: card.username, cardLast4: card.cardLast4, enrolledAt: card.enrolledAt } : null,
      });
    }
    res.json({
      bankAccount: await getPlatformBankAccount(),
      webpay: webpayPublicConfig(),
      tenants: rows,
      orders,
    });
  });

  app.put('/api/platform/billing/bank-account', requirePlatform('platform.infrastructure.write'), async (req, res) => {
    try {
      const bankAccount = await savePlatformBankAccount(req.body || {}, req.user.globalUserId || req.user.id);
      await audit(req, 'platform_bank_account_update', 'platform_setting', 0, {
        bank: bankAccount.bank,
        accountType: bankAccount.accountType,
        holderRut: bankAccount.holderRut,
        configured: bankAccount.configured,
        cleared: req.body?.clear === true,
      });
      res.json(bankAccount);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'VALIDATION_ERROR', error.message || 'No se pudo guardar la cuenta corriente.');
    }
  });

  app.get('/api/platform/billing/bank-account/export.txt', requirePlatform('platform.accounts.read'), async (_req, res) => {
    const bankAccount = await getPlatformBankAccount();
    const body = bankAccountPlainText(bankAccount);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cuenta-corriente-dashcole.txt"');
    res.send(body);
  });

  app.get('/api/platform/billing/bank-account/export.pdf', requirePlatform('platform.accounts.read'), async (req, res) => {
    const bankAccount = await getPlatformBankAccount();
    streamBankAccountPdf(res, bankAccount, {
      generatedBy: req.user.fullName || req.user.username || 'plataforma',
      signer: pdfSignerSlot(req.user),
    });
  });

  app.post('/api/platform/billing/webpay/init', requirePlatformAny('platform.accounts.update', 'platform.infrastructure.write'), async (_req, res) => {
    throw new ApiError(400, 'PLATFORM_DOES_NOT_PAY', 'La cuenta plataforma no paga Webpay. Asigna el precio al colegio; el colegio paga su propia suscripción.');
  });

  app.post('/api/platform/billing/webpay/commit', requirePlatformAny('platform.accounts.update', 'platform.infrastructure.write', 'platform.accounts.read'), async (req, res) => {
    const token = String(req.body.token || req.body.token_ws || '').trim();
    if (!token) throw new ApiError(400, 'VALIDATION_ERROR', 'Falta token_ws de Webpay.');
    const order = await controlModels.PlatformBillingOrder.findOne({ where: { token, kind: 'webpay_plus' } });
    if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'No encontramos la orden de pago Webpay.');
    if (order.status === 'authorized') return res.json({ order, alreadyCommitted: true });
    const result = await webpayTransaction().commit(token);
    const ok = Number(result.response_code) === 0;
    await order.update({
      status: ok ? 'authorized' : 'failed',
      authorizationCode: result.authorization_code || null,
      responseCode: result.response_code,
      cardLast4: result.card_detail?.card_number?.slice(-4) || null,
      paidAt: ok ? new Date() : null,
      payload: { ...(order.payload || {}), commit: result },
    });
    if (ok) {
      const plan = await controlModels.TenantPlan.findOne({ where: { schoolId: order.schoolId } });
      if (plan) {
        const limits = { ...(plan.limits || {}) };
        const paidUntil = new Date();
        paidUntil.setMonth(paidUntil.getMonth() + Number(order.months || 1));
        limits.subscriptionPaidUntil = paidUntil.toISOString().slice(0, 10);
        limits.lastWebpayBuyOrder = order.buyOrder;
        await plan.update({ status: 'active', limits });
      }
      await audit(req, 'billing_webpay_paid', 'school', order.schoolId, { buyOrder: order.buyOrder, amount: order.amount });
    }
    res.json({ order, result, paid: ok });
  });

  app.post('/api/platform/billing/oneclick/inscribe', requirePlatformAny('platform.accounts.update', 'platform.infrastructure.write'), async (_req, res) => {
    throw new ApiError(400, 'PLATFORM_DOES_NOT_PAY', 'La cuenta plataforma no inscribe tarjetas. El colegio paga e inscribe su medio de pago; root solo asigna precios o cobra Oneclick si ya hay tarjeta.');
  });

  app.post('/api/platform/billing/oneclick/finish', requirePlatformAny('platform.accounts.update', 'platform.infrastructure.write', 'platform.accounts.read'), async (req, res) => {
    const token = String(req.body.token || req.body.TBK_TOKEN || '').trim();
    if (!token) throw new ApiError(400, 'VALIDATION_ERROR', 'Falta TBK_TOKEN de Oneclick.');
    const order = await controlModels.PlatformBillingOrder.findOne({ where: { token, kind: 'oneclick_inscription' } });
    if (!order) throw new ApiError(404, 'ORDER_NOT_FOUND', 'No encontramos la inscripción Oneclick.');
    const finished = await oneclickInscription().finish(token);
    const ok = Number(finished.response_code) === 0 && finished.tbk_user;
    await order.update({
      status: ok ? 'authorized' : 'failed',
      responseCode: finished.response_code,
      tbkUser: finished.tbk_user || null,
      cardLast4: finished.card_number?.slice(-4) || null,
      paidAt: ok ? new Date() : null,
      payload: { ...(order.payload || {}), finish: finished },
    });
    if (ok) {
      const key = `oneclick.card.${order.schoolId}`;
      const [setting] = await controlModels.PlatformSetting.findOrCreate({
        where: { key },
        defaults: { config: {}, updatedBy: req.user.globalUserId || req.user.id },
      });
      await setting.update({
        config: {
          username: finished.username || order.username,
          tbkUser: finished.tbk_user,
          cardLast4: finished.card_number?.slice(-4) || null,
          enrolledAt: new Date().toISOString(),
        },
        updatedBy: req.user.globalUserId || req.user.id,
      });
      await audit(req, 'billing_oneclick_inscribed', 'school', order.schoolId, { cardLast4: finished.card_number?.slice(-4) });
    }
    res.json({ order, result: finished, enrolled: ok });
  });

  app.post('/api/platform/billing/oneclick/charge', requirePlatformAny('platform.accounts.update', 'platform.infrastructure.write'), async (req, res) => {
    const schoolId = Number(req.body.schoolId);
    const months = Math.min(12, Math.max(1, Number(req.body.months) || 1));
    const setting = await controlModels.PlatformSetting.findOne({ where: { key: `oneclick.card.${schoolId}` } });
    if (!setting?.config?.tbkUser || !setting.config?.username) {
      throw new ApiError(422, 'ONECLICK_MISSING', 'Primero inscribe una tarjeta Oneclick para este colegio.');
    }
    const { amount } = await estimatedAmount(schoolId, months);
    const buyOrder = buyOrderId('CH');
    const details = [{
      commerce_code: oneclickChildCommerceCode(),
      buy_order: `${buyOrder}C`.slice(0, 26),
      amount,
      installments_number: 1,
    }];
    const authorized = await oneclickTransaction().authorize(setting.config.username, setting.config.tbkUser, buyOrder, details);
    const detail = authorized.details?.[0] || {};
    const ok = Number(detail.response_code) === 0;
    const order = await controlModels.PlatformBillingOrder.create({
      schoolId,
      buyOrder,
      kind: 'oneclick_charge',
      status: ok ? 'authorized' : 'failed',
      amount,
      months,
      currency: 'CLP',
      authorizationCode: detail.authorization_code || null,
      responseCode: detail.response_code,
      cardLast4: setting.config.cardLast4 || null,
      tbkUser: setting.config.tbkUser,
      username: setting.config.username,
      paidAt: ok ? new Date() : null,
      createdBy: req.user.id,
      payload: { authorize: authorized },
    });
    if (ok) {
      const plan = await controlModels.TenantPlan.findOne({ where: { schoolId } });
      if (plan) {
        const limits = { ...(plan.limits || {}) };
        const paidUntil = new Date();
        paidUntil.setMonth(paidUntil.getMonth() + months);
        limits.subscriptionPaidUntil = paidUntil.toISOString().slice(0, 10);
        limits.lastOneclickBuyOrder = buyOrder;
        await plan.update({ status: 'active', limits });
      }
      await audit(req, 'billing_oneclick_charged', 'school', schoolId, { buyOrder, amount, months });
    }
    res.status(ok ? 201 : 422).json({ order, result: authorized, paid: ok });
  });
}
