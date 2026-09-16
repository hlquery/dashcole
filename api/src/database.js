import './config.js';
import { Sequelize, Op } from 'sequelize';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createClient } from 'redis';
import bcrypt from 'bcryptjs';
import { defineModels } from './models.js';
import { runMigrations } from './migrations.js';
import { defineControlModels } from './control-models.js';
import { DEFAULT_JOB_TITLES } from './services/job-titles.js';

export const primarySequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'dashcole',
  process.env.MYSQL_USER || 'dashcole',
  process.env.MYSQL_PASSWORD || 'dashcole',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    dialect: 'mysql',
    dialectOptions: process.env.MYSQL_SSL === 'true' ? { ssl: { rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false' } } : undefined,
    logging: process.env.SQL_LOGGING === 'true' ? console.log : false,
    define: { underscored: true, freezeTableName: true },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  },
);

export const defaultModels = defineModels(primarySequelize);
const tenantDatabaseContext = new AsyncLocalStorage();
const activeDatabase = () => tenantDatabaseContext.getStore();
export const sequelize = new Proxy(primarySequelize, {
  get(target, property) {
    const current = activeDatabase()?.sequelize || target;
    const value = Reflect.get(current, property, current);
    return typeof value === 'function' ? value.bind(current) : value;
  },
});
export const models = new Proxy(defaultModels, { get(target, property) { return (activeDatabase()?.models || target)[property]; } });
export const runWithTenantDatabase = (database, callback) => tenantDatabaseContext.run(database, callback);
const controlDatabaseName = String(process.env.CONTROL_MYSQL_DATABASE || '').trim();
export const controlSequelize = controlDatabaseName ? new Sequelize(
  controlDatabaseName,
  process.env.CONTROL_MYSQL_USER || process.env.MYSQL_USER || 'dashcole',
  process.env.CONTROL_MYSQL_PASSWORD || process.env.MYSQL_PASSWORD || 'dashcole',
  {
    host: process.env.CONTROL_MYSQL_HOST || process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.CONTROL_MYSQL_PORT || process.env.MYSQL_PORT || 3306),
    dialect: 'mysql',
    dialectOptions: process.env.CONTROL_MYSQL_SSL === 'true' ? { ssl: { rejectUnauthorized: process.env.CONTROL_MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false' } } : undefined,
    logging: process.env.SQL_LOGGING === 'true' ? console.log : false,
    define: { underscored: true, freezeTableName: true },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  },
) : primarySequelize;
export const controlModels = controlDatabaseName ? defineControlModels(controlSequelize) : defaultModels;
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000,
    reconnectStrategy: (retries) => Math.min(500 * retries, 5000),
  },
});

redis.on('error', (error) => console.warn('Redis:', error.message));
redis.on('reconnecting', () => console.warn('Redis: reconectando…'));
redis.on('ready', () => console.log('Redis: conectado'));

const PLATFORM_BOOTSTRAP_USERS = [
  { username: 'super@hlquery.com', fullName: 'Super Admin' },
];
const SCHOOL_DEMO_USERS = [
  { username: 'demo@hlquery.com', fullName: 'Cuenta Demo DashCole', role: 'director' },
];
/** Cuentas root antiguas que el instalador debe retirar (ya no se crean). */
const LEGACY_PLATFORM_EMAILS = [
  'asoto@nextedu.cl', 'asoto@dashcole.cl', 'asoto@hlquery.com',
  'cferry@nextedu.cl', 'cferry@dashcole.cl', 'cferry@hlquery.com',
  'akotesky@nextedu.cl', 'akotesky@dashcole.cl', 'akotesky@hlquery.com',
];
/** Renombra identidades *nextedu.cl / *dashcole.cl → *hlquery.com al arrancar. */
const LEGACY_DOMAIN_SUFFIXES = ['nextedu.cl', 'dashcole.cl'];
const CURRENT_DOMAIN_SUFFIX = 'hlquery.com';
export { PLATFORM_BOOTSTRAP_USERS, SCHOOL_DEMO_USERS };
export const PLATFORM_BOOTSTRAP_EMAILS = new Set(PLATFORM_BOOTSTRAP_USERS.map(account => account.username));

function rewriteEmailDomain(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email.includes('@')) return null;
  const at = email.lastIndexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  for (const legacy of LEGACY_DOMAIN_SUFFIXES) {
    if (domain === legacy || domain.endsWith(`.${legacy}`)) {
      return `${local}@${domain.slice(0, -legacy.length)}${CURRENT_DOMAIN_SUFFIX}`;
    }
  }
  return null;
}

async function renameEmailInTenantDatabase(database) {
  if (!database?.sequelize) return 0;
  let changed = 0;
  for (const legacy of LEGACY_DOMAIN_SUFFIXES) {
    const legacyEmailDomain = `@${legacy}`;
    const [users] = await database.sequelize.query(
      "SELECT id, username FROM users WHERE username LIKE CONCAT('%', :domain) OR username LIKE :suffix",
      { replacements: { domain: legacyEmailDomain, suffix: `%.${legacy}` } },
    );
    for (const row of users) {
      const next = rewriteEmailDomain(row.username);
      if (!next) continue;
      const [clash] = await database.sequelize.query(
        'SELECT id FROM users WHERE username = :next AND id <> :id LIMIT 1',
        { replacements: { next, id: row.id } },
      );
      if (clash.length) continue;
      await database.sequelize.query(
        'UPDATE users SET username = :next, updated_at = NOW() WHERE id = :id',
        { replacements: { next, id: row.id } },
      );
      changed += 1;
    }
    for (const table of ['students', 'guardians', 'employees']) {
      try {
        const [rows] = await database.sequelize.query(
          `SELECT id, email FROM ${table} WHERE email LIKE CONCAT('%', :domain) OR email LIKE :suffix`,
          { replacements: { domain: legacyEmailDomain, suffix: `%.${legacy}` } },
        );
        for (const row of rows) {
          const next = rewriteEmailDomain(row.email);
          if (!next) continue;
          await database.sequelize.query(
            `UPDATE ${table} SET email = :next, updated_at = NOW() WHERE id = :id`,
            { replacements: { next, id: row.id } },
          ).catch(async () => {
            await database.sequelize.query(
              `UPDATE ${table} SET email = :next WHERE id = :id`,
              { replacements: { next, id: row.id } },
            );
          });
          changed += 1;
        }
      } catch {
        /* tabla sin email o sin updated_at */
      }
    }
  }
  return changed;
}

async function migrateLegacyEmailsToHlquery() {
  let changed = 0;
  const globals = await controlModels.GlobalUser.findAll();
  for (const row of globals) {
    const next = rewriteEmailDomain(row.email);
    if (!next) continue;
    const clash = await controlModels.GlobalUser.findOne({ where: { email: next } });
    if (clash && clash.id !== row.id) {
      await row.update({ status: 'suspended' });
      continue;
    }
    await row.update({ email: next });
    changed += 1;
  }

  // Primero renombra locales; después apaga solo los que siguen en dominios legacy.
  changed += await renameEmailInTenantDatabase({ sequelize: primarySequelize, models: defaultModels });

  try {
    const { databaseForTenant } = await import('./database-routing.js');
    const tenants = await controlModels.Tenant.findAll({ attributes: ['schoolId', 'databaseName'], raw: true });
    const primaryDb = process.env.MYSQL_DATABASE || 'dashcole';
    for (const tenant of tenants) {
      if (!tenant.databaseName || tenant.databaseName === primaryDb) continue;
      try {
        const database = await databaseForTenant(tenant.schoolId, { activeOnly: false });
        changed += await renameEmailInTenantDatabase(database);
      } catch {
        /* tenant offline */
      }
    }
  } catch {
    /* routing aún no listo */
  }

  for (const legacy of LEGACY_DOMAIN_SUFFIXES) {
    const legacyEmailDomain = `@${legacy}`;
    const [staleUsers] = await primarySequelize.query(
      "SELECT id, school_id, username FROM users WHERE username LIKE CONCAT('%', :domain) OR username LIKE :suffix",
      { replacements: { domain: legacyEmailDomain, suffix: `%.${legacy}` } },
    );
    for (const row of staleUsers) {
      await primarySequelize.query(
        'UPDATE users SET active = FALSE, updated_at = NOW() WHERE id = :id',
        { replacements: { id: row.id } },
      );
      changed += 1;
    }
    const staleGlobals = await controlModels.GlobalUser.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${legacyEmailDomain}` } },
          { email: { [Op.like]: `%.${legacy}` } },
        ],
      },
    });
    for (const row of staleGlobals) {
      if (row.status !== 'suspended') {
        await row.update({ status: 'suspended' });
        changed += 1;
      }
    }
  }

  if (changed) console.log(`DashCole: migrados ${changed} correos @nextedu.cl/@dashcole.cl → @hlquery.com`);
}

const PLATFORM_ADMIN_PERMISSIONS = [
  'platform.accounts.read', 'platform.accounts.update', 'platform.accounts.disable', 'platform.accounts.roles',
  'platform.accounts.sessions', 'platform.accounts.impersonate', 'platform.infrastructure.read', 'platform.infrastructure.write',
];

async function ensureLocalReservedUser(school, account, passwordHash, transaction) {
  const role = account.role || 'super_admin';
  const phone = account.phone ? String(account.phone).trim() : null;
  const [user] = await models.User.findOrCreate({
    where: { schoolId: school.id, username: account.username },
    defaults: {
      passwordHash,
      fullName: account.fullName,
      phone,
      role,
      canManageUsers: true,
      canManageGrades: true,
      canViewReports: true,
      canManageSchool: true,
      canManageHr: true,
      canManageFinance: true,
      active: true,
    },
    transaction,
  });
  const patch = {
    fullName: account.fullName,
    role,
    passwordHash,
    canManageUsers: true,
    canManageGrades: true,
    canViewReports: true,
    canManageSchool: true,
    canManageHr: true,
    canManageFinance: true,
    active: true,
  };
  if (phone) patch.phone = phone;
  await user.update(patch, { transaction });
  return user;
}

/** Reasegura roots de plataforma y demo@ para que sobrevivan wipe/reseed. */
export async function ensurePlatformRootAccounts({ resetPassword = false } = {}) {
  const defaultHash = await bcrypt.hash('admin', 12);
  let school = await models.School.findOne({ order: [['id', 'ASC']] });
  if (!school) {
    [school] = await models.School.findOrCreate({
      where: { slug: 'colegio-del-sur' },
      defaults: { name: process.env.SCHOOL_NAME || 'IDCE Unknown High School' },
    });
  }

  await sequelize.transaction(async (transaction) => {
    for (const account of [...PLATFORM_BOOTSTRAP_USERS, ...SCHOOL_DEMO_USERS]) {
      const existing = await models.User.findOne({
        where: { schoolId: school.id, username: account.username },
        transaction,
      });
      const hash = resetPassword || !existing?.passwordHash ? defaultHash : existing.passwordHash;
      await ensureLocalReservedUser(school, { ...account, role: account.role || 'super_admin' }, hash, transaction);
    }
  });

  for (const account of PLATFORM_BOOTSTRAP_USERS) {
    const localUser = await models.User.findOne({ where: { schoolId: school.id, username: account.username } });
    if (!localUser) continue;
    const phone = account.phone ? String(account.phone).trim() : null;
    const [globalUser] = await controlModels.GlobalUser.findOrCreate({
      where: { email: account.username },
      defaults: {
        email: account.username,
        fullName: account.fullName,
        phone,
        passwordHash: localUser.passwordHash,
        status: 'active',
      },
    });
    const globalPatch = {
      fullName: account.fullName,
      passwordHash: localUser.passwordHash,
      status: 'active',
    };
    if (phone) globalPatch.phone = phone;
    await globalUser.update(globalPatch);
    await controlModels.TenantMembership.findOrCreate({
      where: { globalUserId: globalUser.id, schoolId: school.id, userId: localUser.id },
      defaults: { role: 'super_admin', status: 'active' },
    });
    const membership = await controlModels.TenantMembership.findOne({
      where: { globalUserId: globalUser.id, schoolId: school.id },
    });
    if (membership) await membership.update({ userId: localUser.id, role: 'super_admin', status: 'active' });
    const [platformRole] = await controlModels.PlatformRole.findOrCreate({
      where: { globalUserId: globalUser.id, role: 'platform_admin' },
      defaults: { permissions: PLATFORM_ADMIN_PERMISSIONS },
    });
    if (PLATFORM_ADMIN_PERMISSIONS.some(permission => !platformRole.permissions.includes(permission))) {
      await platformRole.update({ permissions: [...new Set([...platformRole.permissions, ...PLATFORM_ADMIN_PERMISSIONS])] });
    }
  }

  for (const account of SCHOOL_DEMO_USERS) {
    const localUser = await models.User.findOne({ where: { schoolId: school.id, username: account.username } });
    if (!localUser) continue;
    const [globalUser] = await controlModels.GlobalUser.findOrCreate({
      where: { email: account.username },
      defaults: {
        email: account.username,
        fullName: account.fullName,
        passwordHash: localUser.passwordHash,
        status: 'active',
      },
    });
    await globalUser.update({
      fullName: account.fullName,
      passwordHash: localUser.passwordHash,
      status: 'active',
    });
    await controlModels.TenantMembership.findOrCreate({
      where: { globalUserId: globalUser.id, schoolId: school.id, userId: localUser.id },
      defaults: { role: account.role, status: 'active' },
    });
    const membership = await controlModels.TenantMembership.findOne({
      where: { globalUserId: globalUser.id, schoolId: school.id },
    });
    if (membership) await membership.update({ userId: localUser.id, role: account.role, status: 'active' });
  }

  await removeLegacyPlatformAccounts();
}

async function removeLegacyPlatformAccounts() {
  for (const email of LEGACY_PLATFORM_EMAILS) {
    const username = String(email).trim().toLowerCase();
    if (!username || PLATFORM_BOOTSTRAP_EMAILS.has(username)) continue;

    const localUsers = await models.User.findAll({ where: { username } });
    for (const user of localUsers) {
      await user.update({ active: false, role: 'super_admin' });
    }

    const globalUser = await controlModels.GlobalUser.findOne({ where: { email: username } });
    if (!globalUser) continue;
    await controlModels.PlatformRole.destroy({ where: { globalUserId: globalUser.id } });
    await controlModels.TenantMembership.destroy({ where: { globalUserId: globalUser.id } });
    await controlModels.SessionRecord.destroy({ where: { globalUserId: globalUser.id } }).catch(() => {});
    await globalUser.update({ status: 'suspended', fullName: globalUser.fullName || username });
  }
}

async function ensureDefaultInstallation() {
  const { School, User, JobTitle } = models;
  await sequelize.transaction(async (transaction) => {
    let school = await School.findOne({ order: [['id', 'ASC']], transaction });
    if (!school) {
      [school] = await School.findOrCreate({
        where: { slug: 'colegio-del-sur' },
        defaults: { name: process.env.SCHOOL_NAME || 'IDCE Unknown High School' },
        transaction,
      });
    }

    const passwordHash = await bcrypt.hash('admin', 12);

    await User.findOrCreate({
      where: { schoolId: school.id, username: 'admin@hlquery.com' },
      defaults: {
        passwordHash,
        fullName: 'Administrador DashCole',
        role: 'director',
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        active: true,
      },
      transaction,
    });
    const adminUser = await User.findOne({ where: { schoolId: school.id, username: 'admin@hlquery.com' }, transaction });
    if (adminUser) {
      await adminUser.update({
        passwordHash,
        fullName: 'Administrador DashCole',
        role: 'director',
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        active: true,
      }, { transaction });
    }

    for (const account of PLATFORM_BOOTSTRAP_USERS) {
      // Keep a local shell user so platform operators can enter a school when needed,
      // but they are not school staff: role stays super_admin and Administracion hides them.
      const [user] = await User.findOrCreate({
        where: { schoolId: school.id, username: account.username },
        defaults: {
          passwordHash,
          fullName: account.fullName,
          role: 'super_admin',
          canManageUsers: true,
          canManageGrades: true,
          canViewReports: true,
          canManageSchool: true,
          canManageHr: true,
          canManageFinance: true,
          active: true,
        },
        transaction,
      });
      // Preserve existing passwordHash so Mi cuenta / platform resets survive restarts.
      await user.update({
        fullName: account.fullName,
        role: 'super_admin',
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        active: true,
      }, { transaction });
    }

    for (const account of SCHOOL_DEMO_USERS) {
      const [user] = await User.findOrCreate({
        where: { schoolId: school.id, username: account.username },
        defaults: {
          passwordHash,
          fullName: account.fullName,
          role: account.role,
          canManageUsers: true,
          canManageGrades: true,
          canViewReports: true,
          canManageSchool: true,
          canManageHr: true,
          canManageFinance: true,
          active: true,
        },
        transaction,
      });
      await user.update({
        fullName: account.fullName,
        role: account.role,
        canManageUsers: true,
        canManageGrades: true,
        canViewReports: true,
        canManageSchool: true,
        canManageHr: true,
        canManageFinance: true,
        active: true,
      }, { transaction });
    }

    for (const entry of DEFAULT_JOB_TITLES) {
      await JobTitle.findOrCreate({
        where: { schoolId: school.id, name: entry.name },
        defaults: { active: true, hierarchy: entry.hierarchy },
        transaction,
      });
    }
  });
}

async function backfillGlobalIdentity() {
  const users = await models.User.findAll({ raw: true });
  const platformBootstrapEmails = new Set(PLATFORM_BOOTSTRAP_USERS.map(account => account.username));
  let hasPlatformAdmin = await controlModels.PlatformRole.count({ where: { role: 'platform_admin' } }) > 0;
  const configuredPlatformEmail = String(process.env.PLATFORM_ADMIN_EMAIL || '').trim().toLowerCase();
  for (const user of users) {
    const email = String(user.username).trim().toLowerCase();
    const [globalUser] = await controlModels.GlobalUser.findOrCreate({
      where: { email },
      defaults: { email, fullName: user.fullName, phone: user.phone || null, passwordHash: user.passwordHash, status: user.active ? 'active' : 'suspended' },
    });
    if (platformBootstrapEmails.has(email) || email === 'demo@hlquery.com') {
      await globalUser.update({
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        status: user.active ? 'active' : 'suspended',
      });
    }
    await controlModels.TenantMembership.findOrCreate({
      where: { globalUserId: globalUser.id, schoolId: user.schoolId, userId: user.id },
      defaults: { role: user.role, status: user.active ? 'active' : 'suspended' },
    });
    const existingPlatformRole = await controlModels.PlatformRole.findOne({ where: { globalUserId: globalUser.id, role: 'platform_admin' } });
    const canBootstrapPlatformRole = user.role === 'super_admin'
      || platformBootstrapEmails.has(email)
      || (!hasPlatformAdmin && configuredPlatformEmail && email === configuredPlatformEmail);
    if (existingPlatformRole || canBootstrapPlatformRole) {
      const [platformRole] = await controlModels.PlatformRole.findOrCreate({
        where: { globalUserId: globalUser.id, role: 'platform_admin' },
        defaults: { permissions: PLATFORM_ADMIN_PERMISSIONS },
      });
      if (PLATFORM_ADMIN_PERMISSIONS.some(permission => !platformRole.permissions.includes(permission))) await platformRole.update({ permissions: [...new Set([...platformRole.permissions, ...PLATFORM_ADMIN_PERMISSIONS])] });
      hasPlatformAdmin = true;
    }
  }
}

// Transitional adapter for the reporting queries. Schema lifecycle and installer
// writes are handled through Sequelize models.
export const pool = {
  async query(sql, replacements = []) {
    const result = await sequelize.query(sql, { replacements });
    if (/^\s*INSERT\b/i.test(sql) && Number.isInteger(result[0])) {
      return [{ insertId: result[0], affectedRows: result[1] }, result[1]];
    }
    return result;
  },
  end() {
    return sequelize.close();
  },
};

export async function initializeDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
  await runMigrations(sequelize);
  if (controlSequelize !== primarySequelize) {
    await controlSequelize.authenticate();
    await controlSequelize.sync();
    await runMigrations(controlSequelize);
    for (const name of ['GlobalUser','TenantMembership','PlatformRole','SessionRecord','Impersonation','TenantDomain','TenantPlan','DemoRequest','DatabaseServer','Tenant','PlatformSetting','PlatformBillingOrder']) {
      if (!defaultModels[name] || !controlModels[name] || await controlModels[name].count()) continue;
      const rows = await defaultModels[name].findAll({ raw: true });
      if (rows.length) await controlModels[name].bulkCreate(rows, { ignoreDuplicates: true });
    }
  }
  // Preferencias de ingreso multi-colegio en la identidad global.
  try {
    const globalColumns = await controlSequelize.getQueryInterface().describeTable('global_users');
    if (!globalColumns.preferred_school_id) {
      await controlSequelize.query('ALTER TABLE global_users ADD COLUMN preferred_school_id INTEGER UNSIGNED NULL');
    }
    if (!globalColumns.ask_school_on_login) {
      await controlSequelize.query('ALTER TABLE global_users ADD COLUMN ask_school_on_login BOOLEAN NOT NULL DEFAULT TRUE');
    }
  } catch (error) {
    console.warn('No se pudieron asegurar columnas de preferencia de colegio:', error.message);
  }
  // sync creates missing tables, but does not add fields to existing tables.
  // Add only the new reporting fields, preserving historical entries.
  const queryInterface = sequelize.getQueryInterface();
  const accountabilityColumns = await queryInterface.describeTable('accountability_entries');
  for (const name of ['pmeAction', 'pieCategory', 'complianceStatus', 'complianceIssues', 'reconciled']) {
    const attribute = models.AccountabilityEntry.getAttributes()[name];
    if (!accountabilityColumns[attribute.field]) {
      await queryInterface.addColumn('accountability_entries', attribute.field, attribute);
    }
  }
  const invoiceColumns = await sequelize.getQueryInterface().describeTable('invoices');
  if (!invoiceColumns.supplier_id) await sequelize.query('ALTER TABLE invoices ADD COLUMN supplier_id INTEGER UNSIGNED NULL');
  // Keep existing installations compatible without requiring a destructive reset.
  const [roleColumns] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'role'");
  if (!["'manager'", "'monitor'", "'agente_finanzas'", "'guardian'", "'student'"].every((role) => String(roleColumns[0]?.Type || '').includes(role))) {
    await sequelize.query(`ALTER TABLE users MODIFY role ENUM('super_admin','school_admin','director','manager','monitor','utp','finance','agente_finanzas','teacher','inspector','warehouse','guardian','student') NOT NULL`);
  }
  for (const [column, definition] of [
    ['can_manage_hr', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER can_manage_school'],
    ['can_manage_finance', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER can_manage_hr'],
    ['can_approve_leave', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER can_manage_finance'],
  ]) {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM users LIKE '${column}'`);
    if (!columns.length) {
      await sequelize.query(`ALTER TABLE users ADD COLUMN ${column} ${definition}`);
      if (column === 'can_approve_leave') {
        await sequelize.query(`
          UPDATE users
          SET can_approve_leave = TRUE
          WHERE role IN ('super_admin', 'school_admin', 'director', 'manager', 'utp', 'finance', 'agente_finanzas')
             OR can_manage_hr = TRUE
             OR can_manage_users = TRUE
        `);
      }
    }
  }
  const [usernameColumns] = await sequelize.query("SHOW COLUMNS FROM users LIKE 'username'");
  const usernameLength = Number(String(usernameColumns[0]?.Type || '').match(/varchar\((\d+)\)/i)?.[1] || 0);
  if (usernameLength && usernameLength < 150) await sequelize.query('ALTER TABLE users MODIFY username VARCHAR(150) NOT NULL');
  const [userIndexes] = await sequelize.query('SHOW INDEX FROM users');
  const indexColumns = new Map();
  for (const row of userIndexes) {
    if (Number(row.Non_unique) !== 0 || row.Key_name === 'PRIMARY') continue;
    if (!indexColumns.has(row.Key_name)) indexColumns.set(row.Key_name, []);
    indexColumns.get(row.Key_name).push([Number(row.Seq_in_index), row.Column_name]);
  }
  for (const [name, columns] of indexColumns) {
    const ordered = columns.sort((a,b) => a[0]-b[0]).map(([,column]) => column);
    if (ordered.length === 1 && ordered[0] === 'username') await sequelize.query(`ALTER TABLE users DROP INDEX \`${String(name).replace(/`/g, '')}\``);
  }
  const hasTenantUsername = [...indexColumns.values()].some(columns => columns.sort((a,b) => a[0]-b[0]).map(([,column]) => column).join(',') === 'school_id,username');
  if (!hasTenantUsername) await sequelize.query('ALTER TABLE users ADD UNIQUE INDEX users_school_username_unique (school_id, username)');
  const schoolFields = [
    ['address', 'VARCHAR(255) NULL AFTER slug'],
    ['phone', 'VARCHAR(40) NULL AFTER address'],
    ['email', 'VARCHAR(150) NULL AFTER phone'],
    ['website', 'VARCHAR(255) NULL AFTER email'],
    ['school_type', "ENUM('subvencionado','particular','publico') NOT NULL DEFAULT 'subvencionado' AFTER website"],
  ];
  for (const [column, definition] of schoolFields) {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM schools LIKE '${column}'`);
    if (!columns.length) await sequelize.query(`ALTER TABLE schools ADD COLUMN ${column} ${definition}`);
  }
  const [salaryColumns] = await sequelize.query("SHOW COLUMNS FROM employees LIKE 'monthly_salary'");
  if (!salaryColumns.length) await sequelize.query('ALTER TABLE employees ADD COLUMN monthly_salary DECIMAL(12,2) NULL AFTER hired_on');
  const [employeeNameColumns] = await sequelize.query("SHOW COLUMNS FROM employees LIKE 'full_name'");
  if (!employeeNameColumns.length) await sequelize.query('ALTER TABLE employees ADD COLUMN full_name VARCHAR(120) NULL AFTER school_id');
  await sequelize.query('UPDATE employees e LEFT JOIN users u ON u.id = e.user_id SET e.full_name = u.full_name WHERE e.full_name IS NULL AND u.id IS NOT NULL');
  const [courseTeacherColumns] = await sequelize.query("SHOW COLUMNS FROM courses LIKE 'teacher'");
  if (courseTeacherColumns.length) {
    const teacherType = String(courseTeacherColumns[0].Type || '').toLowerCase();
    if (courseTeacherColumns[0].Null !== 'YES' || !teacherType.includes('text')) {
      await sequelize.query('ALTER TABLE courses MODIFY teacher TEXT NULL');
    }
  }
  const [courseHeadTeacherColumns] = await sequelize.query("SHOW COLUMNS FROM courses LIKE 'head_teacher'");
  if (!courseHeadTeacherColumns.length) {
    await sequelize.query('ALTER TABLE courses ADD COLUMN head_teacher TEXT NULL AFTER teacher');
  } else {
    const headType = String(courseHeadTeacherColumns[0].Type || '').toLowerCase();
    if (!headType.includes('text')) {
      await sequelize.query('ALTER TABLE courses MODIFY head_teacher TEXT NULL');
    }
  }
  // Default profesor jefe: primer docente asignado del curso (clase), si aún no hay uno.
  await sequelize.query(`
    UPDATE courses c
    INNER JOIN (
      SELECT school_id, name, section, academic_year_id, MIN(NULLIF(TRIM(teacher), '')) AS head_name
      FROM courses
      WHERE teacher IS NOT NULL AND TRIM(teacher) <> ''
      GROUP BY school_id, name, section, academic_year_id
    ) src ON src.school_id = c.school_id
      AND src.name = c.name
      AND src.section = c.section
      AND (src.academic_year_id <=> c.academic_year_id)
    SET c.head_teacher = src.head_name
    WHERE (c.head_teacher IS NULL OR TRIM(c.head_teacher) = '')
      AND src.head_name IS NOT NULL
  `);
  // Demo fijo DashCole: Daniela jefe de 7° Básico; Javiera de 8° Básico; 1° Medio sin jefe fijo.
  await sequelize.query(`
    UPDATE courses c
    INNER JOIN users u ON u.school_id = c.school_id AND u.username = 'profesor@hlquery.com' AND u.role = 'teacher'
    SET c.head_teacher = CASE
      WHEN c.name = '7° Básico' THEN u.full_name
      WHEN c.name = '8° Básico' THEN (
        SELECT u2.full_name FROM users u2
        WHERE u2.school_id = c.school_id AND u2.username = 'profesora2@hlquery.com' AND u2.role = 'teacher'
        LIMIT 1
      )
      WHEN c.name = '1° Medio' THEN NULL
      ELSE c.head_teacher
    END
    WHERE c.school_id = u.school_id
      AND c.name IN ('7° Básico', '8° Básico', '1° Medio')
  `);
  // Demo fijo: no dejar a Daniela como profesora de ramos auto-creados; solo sus asignaturas + Javiera en lenguaje/historia.
  await sequelize.query(`
    UPDATE courses c
    INNER JOIN users u ON u.school_id = c.school_id AND u.username = 'profesor@hlquery.com' AND u.role = 'teacher'
    LEFT JOIN users u2 ON u2.school_id = c.school_id AND u2.username = 'profesora2@hlquery.com' AND u2.role = 'teacher'
    SET c.teacher = CASE
      WHEN c.subject IN (
        'Lenguaje', 'Lenguaje y Comunicación', 'Lengua y Literatura',
        'Historia', 'Historia, Geografía y Ciencias Sociales'
      ) THEN u2.full_name
      WHEN c.subject IN (
        'Matemática', 'Matemáticas',
        'Ciencias', 'Ciencias Naturales',
        'Biología', 'Física', 'Química'
      ) THEN u.full_name
      ELSE NULL
    END
    WHERE c.school_id = u.school_id
  `);
  const [communicationAudienceColumns] = await sequelize.query("SHOW COLUMNS FROM communications LIKE 'audience'");
  if (!communicationAudienceColumns.length) {
    await sequelize.query("ALTER TABLE communications ADD COLUMN audience ENUM('all','students','guardians','teachers','managers','student','guardian','course') NOT NULL DEFAULT 'all' AFTER channel");
  } else if (!["'teachers'", "'managers'", "'student'", "'guardian'", "'course'"].every((audience) => String(communicationAudienceColumns[0]?.Type || '').includes(audience))) {
    await sequelize.query("ALTER TABLE communications MODIFY audience ENUM('all','students','guardians','teachers','managers','student','guardian','course') NOT NULL DEFAULT 'all'");
  }
  const [communicationTargetColumns] = await sequelize.query("SHOW COLUMNS FROM communications LIKE 'target_student_id'");
  if (!communicationTargetColumns.length) {
    await sequelize.query('ALTER TABLE communications ADD COLUMN target_student_id INT UNSIGNED NULL AFTER audience');
  }
  const [communicationGuardianTargetColumns] = await sequelize.query("SHOW COLUMNS FROM communications LIKE 'target_guardian_id'");
  if (!communicationGuardianTargetColumns.length) {
    await sequelize.query('ALTER TABLE communications ADD COLUMN target_guardian_id INT UNSIGNED NULL AFTER target_student_id');
  }
  const [communicationCourseColumns] = await sequelize.query("SHOW COLUMNS FROM communications LIKE 'course_id'");
  if (!communicationCourseColumns.length) {
    await sequelize.query('ALTER TABLE communications ADD COLUMN course_id INT UNSIGNED NULL AFTER target_guardian_id');
  }
  for (const [column, definition] of [
    ['allow_students_create_forum', 'TINYINT(1) NOT NULL DEFAULT 0'],
    ['allow_students_reply_forum', 'TINYINT(1) NOT NULL DEFAULT 1'],
  ]) {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM courses LIKE '${column}'`);
    if (!columns.length) await sequelize.query(`ALTER TABLE courses ADD COLUMN ${column} ${definition}`);
  }
  const [communicationChannelColumns] = await sequelize.query("SHOW COLUMNS FROM communications LIKE 'channel'");
  if (communicationChannelColumns.length && (communicationChannelColumns[0]?.Default !== 'email' || !String(communicationChannelColumns[0]?.Type).includes("'whatsapp'"))) {
    await sequelize.query("ALTER TABLE communications MODIFY channel ENUM('notification','email','message','whatsapp') DEFAULT 'email'");
  }
  for (const table of ['invoices', 'observations']) {
    for (const column of ['attachment_name', 'attachment_key']) {
      const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
      if (!columns.length) await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} VARCHAR(255) NULL`);
    }
  }
  for (const [table, column, type] of [['students', 'avatar_key', 'VARCHAR(255)'], ['users', 'avatar_key', 'VARCHAR(255)'], ['users', 'signature_key', 'VARCHAR(255)'], ['schools', 'city', 'VARCHAR(120)'], ['documents', 'employee_id', 'INT UNSIGNED'], ['documents', 'user_id', 'INT UNSIGNED']]) {
    const [columns] = await sequelize.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`);
    if (!columns.length) await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type} NULL`);
  }
  for (const [model, fields] of [[models.School, ['monthlyFee', 'originBank', 'originAccountType', 'originAccountNumberEncrypted', 'companyRut', 'companyName', 'logoKey', 'showLogoInSidebar', 'sidebarCollapsible', 'sidebarPanelCollapsible', 'sidebarBgColor', 'sidebarTextColor', 'sidebarFontSize', 'educationStages', 'city']], [models.JobTitle, ['hierarchy']], [models.Course, ['monthlyFee', 'allowStudentsCreateForum', 'allowStudentsReplyForum', 'allowGuardiansReplyForum', 'forumGuidelines', 'sigeTeachingTypeCode', 'sigeGradeCode', 'sigeEvaluationDecreeCode', 'sigeStudyPlanCode']], [models.Subject, ['sigeSubjectCode']], [models.Employee, ['endedOn', 'payrollProfile', 'bank', 'accountType', 'accountNumberEncrypted', 'holderRut', 'email', 'paymentMethod', 'workModality']], [models.User, ['phone', 'whatsappOptIn', 'signatureKey']], [models.Communication, ['courseId']], [models.AnnualResult, ['actaClosedAt', 'actaClosedBy', 'decisionNotes', 'decisionBy', 'decisionAt']], [models.Assignment, ['originalName', 'mimeType', 'storageKey', 'size']], [models.Observation, ['courseId']]]) {
    const columns = await queryInterface.describeTable(model.tableName);
    for (const name of fields) {
      const attribute = model.getAttributes()[name];
      if (!columns[attribute.field]) await queryInterface.addColumn(model.tableName, attribute.field, attribute);
    }
  }
  try {
    await sequelize.query("ALTER TABLE annual_results MODIFY final_status ENUM('promoted','not_promoted','withdrawn') NOT NULL");
  } catch {
    /* enum already includes withdrawn or table missing in fresh sync */
  }
  try {
    await sequelize.query("ALTER TABLE leave_requests MODIFY status ENUM('pending','approved','rejected','cancelled','retracted') NOT NULL DEFAULT 'pending'");
  } catch {
    /* enum already includes retracted or table missing in fresh sync */
  }
  try {
    await sequelize.query("ALTER TABLE leave_requests MODIFY type ENUM('vacation','permission','medical','personal','bereavement','training','other') NOT NULL DEFAULT 'vacation'");
  } catch {
    /* enum already expanded or table missing in fresh sync */
  }
  await migrateLegacyEmailsToHlquery();
  await ensureDefaultInstallation();
  await ensurePlatformRootAccounts({ resetPassword: false });
  await backfillGlobalIdentity();
  const { ensureDefaultDatabaseRouting } = await import('./database-routing.js');
  await ensureDefaultDatabaseRouting();
  if (!redis.isOpen) {
    try { await redis.connect(); } catch { /* MySQL remains the source of truth. */ }
  }
}

export async function cached(key, ttl, loader) {
  if (redis.isReady) {
    const value = await redis.get(key);
    if (value) return JSON.parse(value);
  }
  const result = await loader();
  if (redis.isReady) await redis.setEx(key, ttl, JSON.stringify(result));
  return result;
}

export async function clearDashboardCache() {
  try {
    if (!redis.isReady) return;
    const keys = await redis.keys('dashcole:cache:*');
    if (keys.length) await redis.del(keys);
  } catch (error) {
    console.warn('clearDashboardCache:', error?.message || error);
  }
}
