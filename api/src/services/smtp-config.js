import { controlModels } from '../database.js';
import { decryptSecret, encryptSecret } from './secret-config.js';

const SMTP_KEY = 'smtp';
let cache = { at: 0, value: undefined };

function fromEnv() {
  const host = String(process.env.SMTP_HOST || '').trim();
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT || 587) || 587,
    secure: String(process.env.SMTP_SECURE || '').trim() === 'true',
    user: String(process.env.SMTP_USER || '').trim(),
    password: String(process.env.SMTP_PASSWORD || ''),
    from: String(process.env.SMTP_FROM || '').trim() || 'DashCole <no-reply@hlquery.com>',
    source: 'env',
    configured: true,
    hasPassword: Boolean(String(process.env.SMTP_PASSWORD || '').trim()),
  };
}

function publicView(config) {
  if (!config) return { configured: false, source: null, host: '', port: 587, secure: false, user: '', from: '', hasPassword: false };
  return {
    configured: true,
    source: config.source,
    host: config.host,
    port: config.port,
    secure: Boolean(config.secure),
    user: config.user || '',
    from: config.from || '',
    hasPassword: Boolean(config.hasPassword ?? config.password),
  };
}

export function clearSmtpCache() {
  cache = { at: 0, value: undefined };
}

export async function getSmtpConfig() {
  if (cache.value !== undefined && Date.now() - cache.at < 15000) return cache.value;
  let value = null;
  try {
    const row = await controlModels.PlatformSetting.findOne({ where: { key: SMTP_KEY }, raw: true });
    const host = String(row?.config?.host || '').trim();
    if (host) {
      value = {
        host,
        port: Number(row.config.port || 587) || 587,
        secure: Boolean(row.config.secure),
        user: String(row.config.user || '').trim(),
        password: row.encryptedSecret ? decryptSecret(row.encryptedSecret) : '',
        from: String(row.config.from || '').trim() || 'DashCole <no-reply@hlquery.com>',
        source: 'platform',
        configured: true,
        hasPassword: Boolean(row.encryptedSecret),
      };
    }
  } catch {
    value = null;
  }
  if (!value) value = fromEnv();
  cache = { at: Date.now(), value };
  return value;
}

export async function getSmtpPublicConfig() {
  return publicView(await getSmtpConfig());
}

export async function isSmtpConfigured() {
  return Boolean((await getSmtpConfig())?.host);
}

export async function saveSmtpConfig(body, updatedBy) {
  const host = String(body.host || '').trim();
  const clear = body.clear === true || body.enabled === false;
  if (clear || !host) {
    const existing = await controlModels.PlatformSetting.findOne({ where: { key: SMTP_KEY } });
    if (existing) await existing.destroy();
    clearSmtpCache();
    return publicView(fromEnv());
  }
  const port = Number(body.port || 587);
  const user = String(body.user || '').trim();
  const from = String(body.from || '').trim();
  const secure = body.secure === true || body.secure === 'true';
  const password = String(body.password || '');
  if (host.length > 253) throw new Error('Host SMTP inválido.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto SMTP inválido.');
  if (user.length > 150 || from.length > 180) throw new Error('Usuario o remitente SMTP inválido.');
  if (from) {
    const email = from.includes('<') ? from.slice(from.indexOf('<') + 1, from.indexOf('>')).trim() : from;
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Remitente SMTP inválido.');
  }
  const existing = await controlModels.PlatformSetting.findOne({ where: { key: SMTP_KEY } });
  let encryptedSecret = existing?.encryptedSecret || null;
  if (password) {
    try {
      encryptedSecret = encryptSecret(password);
    } catch (error) {
      if (error instanceof Error && /CONFIG_ENCRYPTION_KEY/.test(error.message)) {
        throw new Error('Configura CONFIG_ENCRYPTION_KEY (32 bytes en base64) para guardar la contraseña SMTP.');
      }
      throw error;
    }
  }
  const config = { host, port, secure, user, from: from || 'DashCole <no-reply@hlquery.com>' };
  if (existing) await existing.update({ config, encryptedSecret, updatedBy: updatedBy || null });
  else await controlModels.PlatformSetting.create({ key: SMTP_KEY, config, encryptedSecret, updatedBy: updatedBy || null });
  clearSmtpCache();
  return getSmtpPublicConfig();
}
