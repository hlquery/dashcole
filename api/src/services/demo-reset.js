import bcrypt from 'bcryptjs';
import { Queue, Worker } from 'bullmq';
import { Op } from 'sequelize';
import { controlModels, models, primarySequelize, redis, PLATFORM_BOOTSTRAP_USERS, SCHOOL_DEMO_USERS, ensurePlatformRootAccounts } from '../database.js';
import { databaseForTenant, ensureDefaultDatabaseRouting, invalidateTenantRoute } from '../database-routing.js';
import { ApiError } from '../http.js';
import { SCHOOL_DEFINITIONS, seedSchool, syncTenantAccess } from '../seed-lib.js';

const queueName = 'dashcole-demo-reset';
const settingKey = 'demo_reset';
const DEMO_SCHOOL_SLUGS = SCHOOL_DEFINITIONS.map(definition => definition.slug);

const RESERVED_USERNAMES = new Set([
  ...PLATFORM_BOOTSTRAP_USERS.map(account => account.username.toLowerCase()),
  ...SCHOOL_DEMO_USERS.map(account => account.username.toLowerCase()),
]);

function redisConnection() {
  const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number(url.pathname.slice(1) || 0),
    maxRetriesPerRequest: null,
  };
}

function hoursIntervalMs() {
  const hours = Number(process.env.DEMO_RESET_EVERY_HOURS || 10);
  const safe = Number.isFinite(hours) && hours >= 1 ? hours : 10;
  return Math.round(safe * 60 * 60 * 1000);
}

export function demoResetEnabled() {
  return process.env.DEMO_RESET_ENABLED !== 'false';
}

async function listDemoTenants() {
  return controlModels.Tenant.findAll({
    where: { slug: DEMO_SCHOOL_SLUGS },
    attributes: ['id', 'schoolId', 'slug', 'name', 'status'],
    raw: true,
  });
}

function demoAccessSummary(tenants) {
  const active = tenants.filter((row) => row.status === 'active').length;
  const suspended = tenants.filter((row) => row.status === 'suspended').length;
  const enabled = tenants.length > 0 && active > 0;
  const fullyEnabled = tenants.length > 0 && suspended === 0;
  return {
    schools: DEMO_SCHOOL_SLUGS,
    tenants: tenants.map((row) => ({
      id: row.schoolId,
      slug: row.slug,
      name: row.name,
      status: row.status,
    })),
    total: tenants.length,
    active,
    suspended,
    enabled,
    fullyEnabled,
  };
}

export async function getDemoResetStatus() {
  const row = await controlModels.PlatformSetting.findOne({ where: { key: settingKey }, raw: true }).catch(() => null);
  const config = row?.config || {};
  const access = demoAccessSummary(await listDemoTenants());
  return {
    enabled: demoResetEnabled(),
    everyHours: Number(process.env.DEMO_RESET_EVERY_HOURS || 10),
    lastResetAt: config.lastResetAt || null,
    lastResetBy: config.lastResetBy || null,
    lastResetSource: config.lastResetSource || null,
    schools: DEMO_SCHOOL_SLUGS,
    schoolsEnabled: access.enabled,
    schoolsFullyEnabled: access.fullyEnabled,
    schoolsActive: access.active,
    schoolsSuspended: access.suspended,
    schoolsTotal: access.total,
    schoolTenants: access.tenants,
    lastAccessToggleAt: config.lastAccessToggleAt || null,
    lastAccessToggleBy: config.lastAccessToggleBy || null,
    lastAccessEnabled: typeof config.lastAccessEnabled === 'boolean' ? config.lastAccessEnabled : null,
  };
}

export async function setDemoSchoolsAccess({ enabled, by = null } = {}) {
  if (typeof enabled !== 'boolean') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Indica si quieres habilitar o deshabilitar las demos.');
  }
  const status = enabled ? 'active' : 'suspended';
  const tenants = await listDemoTenants();
  if (!tenants.length) {
    throw new ApiError(404, 'DEMO_SCHOOLS_NOT_FOUND', 'No hay colegios demo instalados para cambiar.');
  }

  const updated = [];
  for (const tenant of tenants) {
    const row = await controlModels.Tenant.findOne({ where: { schoolId: tenant.schoolId } });
    if (!row) continue;
    if (status === 'suspended') {
      try {
        const database = await databaseForTenant(tenant.schoolId, { activeOnly: false });
        await database.models.School.update({ active: false }, { where: { id: tenant.schoolId } });
      } catch { /* El status del tenant basta para bloquear. */ }
      await row.update({ status });
    } else {
      await row.update({ status });
      try {
        const database = await databaseForTenant(tenant.schoolId);
        await database.models.School.update({ active: true }, { where: { id: tenant.schoolId } });
      } catch { /* El status del tenant basta para abrir. */ }
    }
    await invalidateTenantRoute(tenant.schoolId);
    updated.push({ id: tenant.schoolId, slug: tenant.slug, name: tenant.name, status });
  }

  // Cuentas demo de instalador (no roots de plataforma).
  const demoEmails = SCHOOL_DEMO_USERS.map((account) => account.username.toLowerCase());
  if (demoEmails.length) {
    await controlModels.GlobalUser.update(
      { status: enabled ? 'active' : 'suspended' },
      { where: { email: demoEmails } },
    );
  }

  const existing = await controlModels.PlatformSetting.findOne({ where: { key: settingKey } });
  const nextConfig = {
    ...(existing?.config || {}),
    lastAccessToggleAt: new Date().toISOString(),
    lastAccessToggleBy: by || null,
    lastAccessEnabled: enabled,
  };
  if (existing) await existing.update({ config: nextConfig, updatedBy: null });
  else await controlModels.PlatformSetting.create({ key: settingKey, config: nextConfig, updatedBy: null });

  return {
    enabled,
    updated,
    ...demoAccessSummary(await listDemoTenants()),
    lastAccessToggleAt: nextConfig.lastAccessToggleAt,
    lastAccessToggleBy: nextConfig.lastAccessToggleBy,
  };
}

async function rememberReset({ source, by }) {
  const payload = {
    lastResetAt: new Date().toISOString(),
    lastResetBy: by || null,
    lastResetSource: source || 'manual',
    schools: DEMO_SCHOOL_SLUGS,
  };
  const [row] = await controlModels.PlatformSetting.findOrCreate({
    where: { key: settingKey },
    defaults: { config: payload, updatedBy: null },
  });
  await row.update({ config: payload, updatedBy: null });
  if (redis.isReady) await redis.set('dashcole:demo-reset:last', JSON.stringify(payload));
  return payload;
}

async function resolveDemoSchoolIds(transaction) {
  const schools = await models.School.findAll({
    where: { slug: DEMO_SCHOOL_SLUGS },
    attributes: ['id', 'slug', 'name'],
    transaction,
    raw: true,
  });
  return schools;
}

async function wipeDemoSchoolRows(schoolIds, transaction) {
  if (!schoolIds.length) return;
  const sequelize = primarySequelize;
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
  try {
    await sequelize.query(
      `DELETE sg FROM student_guardians sg
       INNER JOIN students s ON s.id = sg.student_id
       WHERE s.school_id IN (:schoolIds)`,
      { replacements: { schoolIds }, transaction },
    );

    const tables = [
      'sige_conflicts', 'sige_sync_logs', 'sige_sync_jobs', 'sige_enrollment_mappings', 'sige_course_mappings', 'sige_student_mappings', 'sige_integrations',
      'whatsapp_deliveries', 'user_notifications', 'submissions', 'assignments', 'teaching_materials',
      'forum_posts', 'forums', 'grades', 'attendance', 'class_sessions', 'observations', 'enrollments',
      'course_schedules', 'courses', 'subjects', 'planning_comments', 'planning_units',
      'payments', 'invoices', 'expenses', 'suppliers', 'accountability_entries', 'funding_sources',
      'payroll_result_items', 'payroll_employee_results', 'payroll_runs', 'payroll_payment_lines', 'payroll_payment_batches',
      'payroll_periods', 'payroll_concepts', 'payroll_afp_rates', 'payroll_tax_brackets', 'payroll_parameters',
      'inventory_items', 'incidents', 'communications', 'mail_deliveries', 'documents', 'audit_logs',
      'admission_applications', 'annual_results', 'contact_messages', 'school_integrations',
      'employees', 'job_titles', 'students', 'guardians', 'campuses', 'academic_years',
    ];
    for (const table of tables) {
      await sequelize.query(`DELETE FROM \`${table}\` WHERE school_id IN (:schoolIds)`, {
        replacements: { schoolIds },
        transaction,
      }).catch(() => { /* Tabla ausente en instalaciones antiguas. */ });
    }

    const reserved = [...RESERVED_USERNAMES];
    await sequelize.query(
      `DELETE FROM users
       WHERE school_id IN (:schoolIds)
         AND LOWER(username) NOT IN (:reserved)`,
      { replacements: { schoolIds, reserved }, transaction },
    );
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
  }
}

async function wipeDemoControlAccess(schoolIds) {
  if (!schoolIds.length) return;
  await controlModels.SessionRecord.destroy({ where: { schoolId: schoolIds } }).catch(() => {});
  const reservedGlobalIds = (
    await controlModels.GlobalUser.findAll({
      where: { email: reservedEmails() },
      attributes: ['id'],
      raw: true,
    })
  ).map(row => row.id);
  await controlModels.TenantMembership.destroy({
    where: {
      schoolId: schoolIds,
      ...(reservedGlobalIds.length ? { globalUserId: { [Op.notIn]: reservedGlobalIds } } : {}),
    },
  }).catch(() => {});

  // Evita identidades globales huérfanas (reset de clave sin poder iniciar sesión).
  const linked = await controlModels.TenantMembership.findAll({ attributes: ['globalUserId'], group: ['globalUserId'], raw: true });
  const linkedSet = new Set(linked.map(row => Number(row.globalUserId)).filter(id => Number.isSafeInteger(id) && id > 0));
  const candidates = await controlModels.GlobalUser.findAll({
    where: reservedGlobalIds.length ? { id: { [Op.notIn]: reservedGlobalIds } } : undefined,
    attributes: ['id'],
    raw: true,
  });
  const orphanIds = candidates.map(row => Number(row.id)).filter(id => !linkedSet.has(id));
  if (orphanIds.length) {
    await controlModels.PlatformRole.destroy({ where: { globalUserId: orphanIds } }).catch(() => {});
    await controlModels.SessionRecord.destroy({ where: { globalUserId: orphanIds } }).catch(() => {});
    await controlModels.GlobalUser.destroy({ where: { id: orphanIds } }).catch(() => {});
  }
}

function reservedEmails() {
  return [...RESERVED_USERNAMES];
}

export async function ensureDemoSchoolsInstalled({ source = 'startup' } = {}) {
  if (!demoResetEnabled()) return { skipped: true, reason: 'disabled' };
  const staleAvatarKeys = [];
  const seeded = [];
  let created = 0;
  for (const definition of SCHOOL_DEFINITIONS) {
    const existing = await models.School.findOne({ where: { slug: definition.slug }, attributes: ['id', 'slug', 'name'], raw: true });
    const studentCount = existing
      ? await models.Student.count({ where: { schoolId: existing.id } })
      : 0;
    const admissionCount = existing
      ? await models.AdmissionApplication.count({ where: { schoolId: existing.id } })
      : 0;
    const planningCount = existing
      ? await models.PlanningUnit.count({ where: { schoolId: existing.id } })
      : 0;
    const sessionCount = existing
      ? await models.ClassSession.count({ where: { schoolId: existing.id } })
      : 0;
    const expectedDirector = definition.fixedDemo
      ? 'admin@hlquery.com'
      : `director@${definition.slug}.demo.hlquery.com`;
    const hasCanonicalDirector = existing
      ? await models.User.count({ where: { schoolId: existing.id, username: expectedDirector } })
      : 0;
    const teacherCount = existing
      ? await models.User.count({ where: { schoolId: existing.id, role: 'teacher', active: true } })
      : 0;
    const courseCount = existing
      ? await models.Course.count({ where: { schoolId: existing.id } })
      : 0;
    const hasMaxTeachers = existing
      ? await models.User.count({
        where: {
          schoolId: existing.id,
          role: 'teacher',
          username: definition.fixedDemo ? 'profesor5@hlquery.com' : `profesor5@${definition.slug}.demo.hlquery.com`,
        },
      })
      : 0;
    const gradeCount = existing
      ? await models.Grade.count({ where: { schoolId: existing.id } })
      : 0;
    const stuckAt36 = existing && gradeCount
      ? await models.Grade.count({
        where: {
          schoolId: existing.id,
          score: { [Op.gte]: 3.55, [Op.lte]: 3.65 },
        },
      })
      : 0;
    // Old demo formula pinned almost every score at 3.6; refresh scores without a full wipe/seed.
    const gradesNeedRefresh = gradeCount >= 20 && stuckAt36 / gradeCount >= 0.35;
    const needsEnrichment = teacherCount < 5
      || courseCount < 40
      || studentCount < Number(definition.studentCount || 18)
      || hasMaxTeachers < 1;
    if (
      existing
      && studentCount > 0
      && admissionCount > 0
      && planningCount >= 12
      && sessionCount >= 20
      && hasCanonicalDirector > 0
      && !gradesNeedRefresh
      && !needsEnrichment
    ) {
      seeded.push(existing);
      continue;
    }
    if (existing && gradesNeedRefresh && studentCount > 0 && hasCanonicalDirector > 0 && !needsEnrichment) {
      // Lightweight score refresh: bump deterministic spread without recreating the whole school.
      await models.Grade.update(
        { score: primarySequelize.literal('LEAST(7, GREATEST(2, ROUND(2 + ((id * 37 + student_id * 13 + course_id * 7) % 50) / 10, 1)))') },
        { where: { schoolId: existing.id } },
      ).catch((error) => console.warn(`No se pudieron refrescar notas demo de colegio ${existing.id}:`, error.message));
      seeded.push(existing);
      continue;
    }
    const result = await seedSchool(definition, staleAvatarKeys);
    seeded.push(result.school);
    created += 1;
  }
  await ensureDefaultDatabaseRouting();
  for (const school of seeded) await syncTenantAccess(school);
  if (created) {
    await ensurePlatformRootAccounts({ resetPassword: false });
    await rememberReset({ source, by: 'system' });
    console.log(`Colegios demo instalados/enriquecidos al arranque (${created}).`);
  }
  for (const key of staleAvatarKeys) {
    try {
      const { safeUploadPath } = await import('../uploads.js');
      const fs = await import('node:fs/promises');
      await fs.unlink(safeUploadPath(key));
    } catch { /* Archivo ya ausente. */ }
  }
  return { skipped: false, created, schools: seeded.map(school => ({ id: school.id, slug: school.slug, name: school.name })) };
}

export async function resetDemoData({ source = 'manual', by = null } = {}) {
  if (!demoResetEnabled()) throw new ApiError(403, 'DEMO_RESET_DISABLED', 'El reinicio de datos demo está deshabilitado.');
  if (redis.isReady) {
    const lock = await redis.set('dashcole:demo-reset:lock', '1', { NX: true, EX: 900 });
    if (lock !== 'OK') throw new ApiError(409, 'DEMO_RESET_BUSY', 'Ya hay un reinicio de demo en curso.');
  }
  try {
    const staleAvatarKeys = [];
    const schools = await primarySequelize.transaction(async (transaction) => {
      const demoSchools = await resolveDemoSchoolIds(transaction);
      await wipeDemoSchoolRows(demoSchools.map(school => school.id), transaction);
      return demoSchools;
    });
    await wipeDemoControlAccess(schools.map(school => school.id));

    const seeded = [];
    for (const definition of SCHOOL_DEFINITIONS) {
      const result = await seedSchool(definition, staleAvatarKeys);
      seeded.push(result.school);
    }
    await ensureDefaultDatabaseRouting();
    for (const school of seeded) await syncTenantAccess(school);
    // Root de plataforma (super@hlquery.com) y demo@ siempre quedan presentes.
    await ensurePlatformRootAccounts({ resetPassword: false });

    const meta = await rememberReset({ source, by });
    return {
      ...meta,
      wiped: schools.map(school => ({ id: school.id, slug: school.slug, name: school.name })),
      seeded: seeded.map(school => ({ id: school.id, slug: school.slug, name: school.name })),
    };
  } finally {
    if (redis.isReady) await redis.del('dashcole:demo-reset:lock');
  }
}

export async function resetDemoDataWithAdminCredentials({ username, password }) {
  const email = String(username || '').trim().toLowerCase();
  const pass = String(password || '');
  if (!email || !pass) throw new ApiError(400, 'VALIDATION_ERROR', 'Ingresa correo y contraseña de administrador.');
  const allowed = new Set(PLATFORM_BOOTSTRAP_USERS.map(account => account.username.toLowerCase()));
  if (!allowed.has(email)) throw new ApiError(403, 'FORBIDDEN', 'Solo un administrador de plataforma puede reiniciar la demo.');
  const globalUser = await controlModels.GlobalUser.findOne({ where: { email, status: 'active' } });
  if (!globalUser || !(await bcrypt.compare(pass, globalUser.passwordHash))) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Credenciales de administrador incorrectas.');
  }
  return resetDemoData({ source: 'login', by: email });
}

export async function startDemoResetScheduler() {
  if (!demoResetEnabled()) return null;
  if (!redis.isReady) return null;
  const connection = redisConnection();
  const queue = new Queue(queueName, { connection });
  const every = hoursIntervalMs();
  await queue.upsertJobScheduler('every-demo-reset', { every }, { name: 'demo-reset' });
  const worker = new Worker(queueName, async () => resetDemoData({ source: 'scheduler', by: 'system' }), { connection, concurrency: 1 });
  worker.on('completed', (job) => console.log(`Demo reset ${job.id} completado`));
  worker.on('failed', (job, error) => console.error(`Falló demo reset ${job?.id}:`, error.message));
  console.log(`Demo reset automático cada ${Math.round(every / 3600000)} h`);
  return { queue, worker };
}

export async function stopDemoResetScheduler(scheduler) {
  if (!scheduler) return;
  await scheduler.worker.close().catch(() => {});
  await scheduler.queue.close().catch(() => {});
}
