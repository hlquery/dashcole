import crypto from 'node:crypto';
import { DataTypes, Sequelize } from 'sequelize';
import { controlModels, defaultModels, models, primarySequelize, redis } from './database.js';
import { defineModels } from './models.js';
import { runMigrations } from './migrations.js';
import { decryptSecret, encryptSecret } from './services/secret-config.js';
import { ensureDefaultJobTitles } from './services/job-titles.js';
import { ApiError } from './http.js';

const pools = new Map();
const routingNamespace = crypto.createHash('sha256').update([
  process.env.CONTROL_MYSQL_HOST || process.env.MYSQL_HOST || 'localhost',
  process.env.CONTROL_MYSQL_PORT || process.env.MYSQL_PORT || '3306',
  process.env.CONTROL_MYSQL_DATABASE || process.env.MYSQL_DATABASE || 'dashcole',
].join(':')).digest('hex').slice(0, 16);
const cacheKey = id => `dashcole:routing:${routingNamespace}:tenant:${id}`;
const routingServer = ({ encryptedPassword: _encryptedPassword, secretSource: _secretSource, ...server }) => server;
const safeDatabase = value => {
  const database = String(value || '').trim();
  if (!/^[a-zA-Z0-9_$-]{1,64}$/.test(database)) throw new ApiError(400, 'INVALID_DATABASE', 'Nombre de base de datos inválido.');
  return database;
};
const sslOptions = value => value?.enabled ? { rejectUnauthorized: value.rejectUnauthorized !== false } : undefined;

export function databaseServerPassword(server, suppliedPassword = '') {
  if (suppliedPassword) return suppliedPassword;
  if (server.secretSource === 'env:MYSQL_PASSWORD') return process.env.MYSQL_PASSWORD || '';
  if (server.encryptedPassword) return decryptSecret(server.encryptedPassword);
  return '';
}

export async function testDatabaseServer(server, suppliedPassword = '', verifySchoolId = null) {
  const connection = new Sequelize(safeDatabase(server.databaseName || process.env.MYSQL_DATABASE), server.username, databaseServerPassword(server, suppliedPassword), {
    host: server.host, port: Number(server.port), dialect: 'mysql', logging: false, pool: { max: 1, min: 0, acquire: 8000, idle: 1000 },
    dialectOptions: sslOptions(server.ssl),
  });
  try {
    await connection.authenticate();
    if (verifySchoolId) {
      const [rows] = await connection.query('SELECT id FROM schools WHERE id = ? LIMIT 1', { replacements: [Number(verifySchoolId)] });
      if (!rows.length) return { ok: false, error: 'La base destino no contiene el colegio solicitado.' };
    }
    return { ok: true };
  }
  catch (error) { return { ok: false, error: String(error.original?.message || error.message).slice(0, 500) }; }
  finally { await connection.close().catch(() => {}); }
}

export async function provisionTenantDatabase(server, databaseName, school) {
  const database = safeDatabase(databaseName);
  const admin = new Sequelize('', server.username, databaseServerPassword(server), {
    host: server.host, port: Number(server.port), dialect: 'mysql', logging: false, dialectOptions: sslOptions(server.ssl),
  });
  try { await admin.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`); }
  finally { await admin.close(); }
  const connection = new Sequelize(database, server.username, databaseServerPassword(server), {
    host: server.host, port: Number(server.port), dialect: 'mysql', logging: false, dialectOptions: sslOptions(server.ssl),
    define: { underscored: true, freezeTableName: true },
  });
  try {
    const tenantModels = defineModels(connection);
    await connection.sync();
    await runMigrations(connection);
    await tenantModels.School.findOrCreate({
      where: { id: school.id },
      defaults: { id: school.id, name: school.name, slug: school.slug, active: true },
    });
    await tenantModels.School.update(
      { name: school.name, slug: school.slug, active: true },
      { where: { id: school.id } },
    );
    await ensureDefaultJobTitles(tenantModels.JobTitle, school.id);
  } finally { await connection.close(); }
}

export async function ensureDefaultDatabaseRouting() {
  let server = await controlModels.DatabaseServer.findOne({ where: { isDefault: true } });
  if (!server) server = await controlModels.DatabaseServer.create({
    name: 'Current / Default', host: process.env.MYSQL_HOST || 'localhost', port: Number(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER || 'dashcole', secretSource: 'env:MYSQL_PASSWORD',
    ssl: { enabled: process.env.MYSQL_SSL === 'true', rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false' },
    region: process.env.DATABASE_REGION || 'current', status: 'active', isDefault: true,
  });
  else await server.update({
    host: process.env.MYSQL_HOST || 'localhost', port: Number(process.env.MYSQL_PORT || 3306), username: process.env.MYSQL_USER || 'dashcole',
    secretSource: 'env:MYSQL_PASSWORD', encryptedPassword: null, status: 'active',
    ssl: { enabled: process.env.MYSQL_SSL === 'true', rejectUnauthorized: process.env.MYSQL_SSL_REJECT_UNAUTHORIZED !== 'false' },
    lastCheckedAt: new Date(), lastError: null,
  });
  const schools = await models.School.findAll({ attributes: ['id', 'name', 'slug'], raw: true });
  for (const school of schools) {
    const [tenant] = await controlModels.Tenant.findOrCreate({
      where: { schoolId: school.id },
      defaults: { schoolId: school.id, name: school.name, slug: school.slug, databaseServerId: server.id, databaseName: process.env.MYSQL_DATABASE || 'dashcole', status: 'active' },
    });
    if (!tenant.name || tenant.slug !== school.slug) await tenant.update({ name: school.name, slug: school.slug });
  }
  return server;
}

export async function selectDatabaseServer() {
  const servers = await controlModels.DatabaseServer.findAll({ where: { status: 'active' }, raw: true });
  if (!servers.length) throw new ApiError(503, 'NO_DATABASE_SERVER', 'No hay servidores SQL disponibles.');
  const tenants = await controlModels.Tenant.findAll({ attributes: ['databaseServerId'], raw: true });
  return servers.sort((a, b) => tenants.filter(row => row.databaseServerId === a.id).length - tenants.filter(row => row.databaseServerId === b.id).length || Number(b.isDefault) - Number(a.isDefault))[0];
}

export async function resolveTenantDatabase(tenantId, { activeOnly = true } = {}) {
  const id = Number(tenantId);
  if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(403, 'TENANT_REQUIRED', 'Tenant inválido.');
  let route;
  if (activeOnly && redis.isReady) {
    const cached = await redis.get(cacheKey(id));
    if (cached) {
      route = JSON.parse(cached);
      route.server = routingServer(route.server);
      await redis.setEx(cacheKey(id), 300, JSON.stringify(route));
    }
  }
  if (!route) {
    const where = { schoolId: id };
    if (activeOnly) where.status = 'active';
    const tenant = await controlModels.Tenant.findOne({ where, raw: true });
    if (!tenant || (activeOnly && tenant.status !== 'active')) throw new ApiError(503, 'TENANT_ROUTING_MISSING', 'El colegio no tiene routing SQL activo.');
    const server = await controlModels.DatabaseServer.findOne({ where: { id: tenant.databaseServerId }, raw: true });
    if (!server || server.status !== 'active') throw new ApiError(503, 'DATABASE_SERVER_OFFLINE', 'El servidor SQL del colegio no está disponible.');
    route = { tenant, server: routingServer(server) };
    if (activeOnly && tenant.status === 'active' && redis.isReady) await redis.setEx(cacheKey(id), 300, JSON.stringify(route));
  }
  return route;
}

export async function databaseForTenant(tenantId, options = {}) {
  const route = await resolveTenantDatabase(tenantId, options);
  if (route.server.isDefault && route.tenant.databaseName === (process.env.MYSQL_DATABASE || 'dashcole')) return { sequelize: primarySequelize, models: defaultModels, route };
  const key = `${route.server.id}:${route.tenant.databaseName}`;
  if (!pools.has(key)) {
    const secret = await controlModels.DatabaseServer.findOne({
      where: { id: route.server.id, status: 'active' },
      attributes: ['encryptedPassword', 'secretSource'],
      raw: true,
    });
    if (!secret) throw new ApiError(503, 'DATABASE_SERVER_OFFLINE', 'El servidor SQL del colegio no está disponible.');
    const server = { ...route.server, ...secret };
    const connection = new Sequelize(safeDatabase(route.tenant.databaseName), server.username, databaseServerPassword(server), {
      host: server.host, port: Number(server.port), dialect: 'mysql', logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }, dialectOptions: sslOptions(server.ssl),
      define: { underscored: true, freezeTableName: true },
    });
    try {
      await connection.authenticate();
      await runMigrations(connection);
      // Columnas que a veces solo existen en el ensure del primary: reforzar en tenants.
      const qi = connection.getQueryInterface();
      try {
        const employeeCols = await qi.describeTable('employees');
        if (!employeeCols.work_modality) {
          await qi.addColumn('employees', 'work_modality', { type: DataTypes.STRING(40), allowNull: true });
        }
      } catch { /* tabla ausente en bootstrap temprano */ }
      pools.set(key, { sequelize: connection, models: defineModels(connection) });
    } catch (error) {
      await connection.close().catch(() => {});
      await controlModels.DatabaseServer.update({ lastCheckedAt: new Date(), lastError: String(error.original?.message || error.message).slice(0, 500) }, { where: { id: route.server.id } });
      await invalidateTenantRoute(tenantId);
      throw new ApiError(503, 'TENANT_DATABASE_UNAVAILABLE', 'La base de datos del colegio no responde.');
    }
  }
  return { ...pools.get(key), route };
}

export async function invalidateTenantRoute(tenantId) {
  if (redis.isReady) await redis.del(cacheKey(Number(tenantId)));
}
export async function closeDatabaseServerPools(serverId) {
  for (const [key, database] of pools) {
    if (!key.startsWith(`${Number(serverId)}:`)) continue;
    await database.sequelize.close().catch(() => {});
    pools.delete(key);
  }
  const tenants = await controlModels.Tenant.findAll({ where: { databaseServerId: Number(serverId) }, attributes: ['schoolId'], raw: true });
  await Promise.all(tenants.map(tenant => invalidateTenantRoute(tenant.schoolId)));
}

export async function markTenantDatabaseOffline(tenantId, error) {
  const route = await resolveTenantDatabase(tenantId).catch(() => null);
  if (!route) return;
  await controlModels.DatabaseServer.update({ lastCheckedAt: new Date(), lastError: String(error.original?.message || error.message).slice(0, 500) }, { where: { id: route.server.id } });
  await invalidateTenantRoute(tenantId);
}

export function encryptedDatabasePassword(password) {
  const value = String(password || '');
  if (value.length < 8 || value.length > 500) throw new ApiError(400, 'INVALID_PASSWORD', 'La contraseña SQL debe tener entre 8 y 500 caracteres.');
  return encryptSecret(value);
}
