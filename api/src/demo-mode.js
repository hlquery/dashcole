import fs from 'node:fs';
import path from 'node:path';
import { demoGuidePayload } from './demo-guide.js';

const DEMO_MESSAGE = 'Entorno de demostración: puedes explorar el dashboard con datos de ejemplo. No es posible modificar, crear ni eliminar información; todo es solo lectura.';

function envFlag(name) {
  const raw = String(process.env[name] || '').trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function demoMarkerExists() {
  const candidates = [
    // Preferido: sync2 --demo deja el marcador solo en el dashboard publicado.
    path.resolve(process.cwd(), '../dashboard/.demo'),
    path.resolve(process.cwd(), 'dashboard/.demo'),
    // Compatibilidad con instalaciones anteriores.
    path.resolve(process.cwd(), '.demo'),
    path.resolve(process.cwd(), '../.demo'),
  ];
  return candidates.some((filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch {
      return false;
    }
  });
}

/** Modo demo global: DEMO_MODE=true o archivo `.demo` (dashboard/.demo o raíz). */
export function isDemoMode() {
  return envFlag('DEMO_MODE') || demoMarkerExists();
}

function parseHostname(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return url.hostname.toLowerCase();
  } catch {
    return '';
  }
}

function parseOriginParts(value) {
  const raw = String(value || '').trim();
  if (!raw) return { hostname: '', port: '' };
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return { hostname: url.hostname.toLowerCase(), port: url.port || '' };
  } catch {
    return { hostname: '', port: '' };
  }
}

function dashboardHostSet() {
  const hosts = new Set(['dashboard.hlquery.com']);
  for (const value of String(process.env.DASHBOARD_ORIGIN || process.env.VITE_DASHBOARD_URL || '').split(',')) {
    const hostname = parseHostname(value);
    if (hostname) hosts.add(hostname);
  }
  for (const value of String(process.env.WEB_ORIGIN || '').split(',')) {
    const hostname = parseHostname(value);
    if (hostname.startsWith('dashboard.')) hosts.add(hostname);
  }
  return hosts;
}

/** Solo dashboard.hlquery.com (y el Vite local :5174) reciben modo demo. */
export function isDashboardDemoRequest(req) {
  if (!req) return false;
  const origin = parseOriginParts(req.get?.('origin') || req.headers?.origin || '');
  const referer = parseOriginParts(req.get?.('referer') || req.headers?.referer || '');
  const hostname = origin.hostname || referer.hostname;
  const port = origin.port || referer.port;
  if (!hostname) return false;
  if (dashboardHostSet().has(hostname)) return true;
  if (hostname.startsWith('dashboard.')) return true;
  // Dashboard local (web/vite) vive en :5174; la landing en :5173.
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '5174') return true;
  return false;
}

export function demoModeInfo(req = null) {
  const enabled = isDemoMode();
  const forDashboard = !req || isDashboardDemoRequest(req);
  const active = enabled && forDashboard;
  return {
    demoMode: active,
    demo_mode: active,
    message: active ? DEMO_MESSAGE : null,
    demoGuide: active ? demoGuidePayload() : null,
  };
}

const WRITE_ALLOWLIST = new Set([
  'POST /api/auth/login',
  'POST /api/auth/logout',
  'POST /api/auth/switch-tenant',
  'POST /api/auth/forgot-password',
  'POST /api/public/demo-requests',
  'POST /api/public/admissions',
  'POST /api/public/demo-reset',
  'POST /api/contact/messages',
]);

function isAllowedDemoWrite(req) {
  const method = String(req.method || '').toUpperCase();
  const pathname = String(req.path || '').split('?')[0];
  if (WRITE_ALLOWLIST.has(`${method} ${pathname}`)) return true;
  if (method === 'POST' && pathname.startsWith('/api/track/')) return true;
  if (method === 'POST' && pathname.startsWith('/api/public/')) return true;
  return false;
}

/**
 * Bloquea mutaciones solo para clientes del dashboard cuando hay modo demo.
 * www.hlquery.com y guias.hlquery.com siguen pudiendo escribir en la API pública.
 */
export function blockDemoWrites(req, res, next) {
  if (!isDemoMode()) return next();
  if (!isDashboardDemoRequest(req)) return next();
  const method = String(req.method || '').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();
  if (isAllowedDemoWrite(req)) return next();
  return res.status(403).json({
    message: DEMO_MESSAGE,
    code: 'DEMO_READ_ONLY',
  });
}

export function applyDemoModeToUser(user, req = null) {
  if (!user || !isDemoMode()) return user;
  if (req && !isDashboardDemoRequest(req)) return user;
  const permissions = { ...(user.permissions || {}) };
  for (const key of Object.keys(permissions)) {
    if (key === 'viewReports' || key === 'sige.view' || key === 'sige.view_logs') continue;
    if (typeof permissions[key] === 'boolean') permissions[key] = false;
  }
  return {
    ...user,
    demoMode: true,
    readOnly: true,
    accessMode: 'demo',
    permissions,
  };
}

export { DEMO_MESSAGE };
