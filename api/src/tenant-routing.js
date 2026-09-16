import path from 'node:path';
import { controlModels, defaultModels, primarySequelize, runWithTenantDatabase } from './database.js';
import { ApiError } from './http.js';
import { databaseForTenant } from './database-routing.js';

export class TenantResolver {
  async resolve(req) {
    const sessionTenantId = Number(req.user?.schoolId);
    const host = String(req.hostname || '').toLowerCase();
    const domain = host ? await controlModels.TenantDomain.findOne({ where: { hostname: host, active: true }, raw: true }) : null;
    if (domain && sessionTenantId && Number(domain.schoolId) !== sessionTenantId) throw new ApiError(403, 'TENANT_MISMATCH', 'La sesión no pertenece al dominio solicitado.');
    const id = Number(domain?.schoolId || sessionTenantId);
    if (!Number.isSafeInteger(id) || id < 1) throw new ApiError(403, 'TENANT_REQUIRED', 'No se pudo resolver el colegio.');
    const allowInactive = Boolean(req.user?.platformConsole);
    const tenant = await controlModels.Tenant.findOne({
      where: allowInactive ? { schoolId: id } : { schoolId: id, status: 'active' },
      raw: true,
    });
    if (!tenant || (!allowInactive && tenant.status !== 'active')) throw new ApiError(403, 'TENANT_UNAVAILABLE', 'El colegio no está disponible.');
    return {
      id,
      school: { id, name: tenant.name, slug: tenant.slug, active: tenant.status === 'active' },
      domain: domain || null,
      status: tenant.status,
    };
  }
}

export class DatabaseRouter {
  async forTenant(tenant) {
    const routed = await databaseForTenant(tenant.id, { activeOnly: tenant.status === 'active' });
    return { ...routed, scope: { schoolId: tenant.id } };
  }
}

export class StorageRouter {
  constructor(root = process.env.UPLOAD_DIR || new URL('../uploads', import.meta.url).pathname) { this.root = path.resolve(root); }
  forTenant(tenant) {
    return {
      root: this.root,
      avatars: path.join(this.root, 'avatars', `tenant-${tenant.id}`),
      files: path.join(this.root, 'files', `tenant-${tenant.id}`),
    };
  }
}

const resolver = new TenantResolver();
const databaseRouter = new DatabaseRouter();
const storageRouter = new StorageRouter();
export async function attachTenantContext(req, _res, next) {
  try {
    const tenant = await resolver.resolve(req);
    req.tenant = tenant;
    req.tenantDatabase = await databaseRouter.forTenant(tenant);
    req.tenantStorageRoot = storageRouter.forTenant(tenant);
    return runWithTenantDatabase(req.tenantDatabase, next);
  } catch (error) {
    // Consola plataforma: si el colegio de la sesión está caído, no tumbar /api/platform/*.
    if (req.user?.platformConsole && error instanceof ApiError && ['TENANT_UNAVAILABLE', 'TENANT_ROUTING_MISSING', 'TENANT_DATABASE_UNAVAILABLE'].includes(error.code)) {
      const id = Number(req.user.schoolId) || 1;
      req.tenant = { id, school: { id, name: 'Plataforma', slug: 'platform', active: false }, domain: null, status: 'suspended' };
      req.tenantDatabase = await databaseForTenant(id, { activeOnly: false }).catch(() => ({ sequelize: primarySequelize, models: defaultModels, route: null }));
      req.tenantStorageRoot = storageRouter.forTenant({ id });
      return runWithTenantDatabase(req.tenantDatabase, next);
    }
    throw error;
  }
}
