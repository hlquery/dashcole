import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(new URL('../../api/package.json', import.meta.url));
const { parse } = require('dotenv');
const filename = process.argv[2] || '.env.production';
let env;
try { env = parse(readFileSync(filename === '-' ? 0 : filename)); }
catch { console.error(`Falta ${filename}; usa etc/deploy/production.env.example como base.`); process.exit(1); }

const value = (key) => String(env[key] ?? '').trim();
const required = ['MYSQL_HOST', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'REDIS_URL', 'WEB_ORIGIN'];
if (value('CONTROL_MYSQL_DATABASE')) {
  required.push('CONTROL_MYSQL_HOST', 'CONTROL_MYSQL_DATABASE', 'CONTROL_MYSQL_USER', 'CONTROL_MYSQL_PASSWORD');
}
if (value('WHATSAPP_TOKEN')) {
  required.push('WHATSAPP_SCHOOL_ID', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_API_VERSION', 'WHATSAPP_TEMPLATE', 'WHATSAPP_LANGUAGE');
}
// SMTP_* can be null/empty. Mail stays off until host (+ optional creds) are filled.
const invalid = required.filter((key) => !value(key) || /CHANGE_ME/.test(value(key)));
if (invalid.length) {
  console.error(`Completa estas variables de ${filename}: ${invalid.join(', ')}.`);
  process.exit(1);
}
for (const key of ['BACKUP_ROOT', 'UPLOAD_DIR']) {
  if (value(key) && !value(key).startsWith('/')) {
    console.error(`${key} debe usar una ruta absoluta en ${filename}.`);
    process.exit(1);
  }
}
const smtpHost = value('SMTP_HOST');
if (!smtpHost) {
  console.log('Correo desactivado: SMTP_HOST está vacío.');
} else {
  const smtpMissing = ['SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']
    .filter((key) => !value(key) || /CHANGE_ME/.test(value(key)));
  if (smtpMissing.length) {
    console.warn(`Aviso: SMTP incompleto (${smtpMissing.join(', ')}); el correo puede fallar hasta completarlos. Campos SMTP pueden quedar vacíos.`);
  } else {
    console.log(`Correo SMTP configurado (${smtpHost}).`);
  }
}
if (!value('CONFIG_ENCRYPTION_KEY')) {
  console.warn('Aviso: configura CONFIG_ENCRYPTION_KEY antes de guardar secretos de integraciones o servidores SQL.');
}
console.log('Configuración de producción validada.');