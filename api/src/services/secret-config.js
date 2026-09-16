import crypto from 'node:crypto';
import { ApiError } from '../http.js';

function key() {
  const raw = String(process.env.CONFIG_ENCRYPTION_KEY || '');
  const value = Buffer.from(raw, 'base64');
  if (value.length !== 32) throw new ApiError(503, 'ENCRYPTION_NOT_CONFIGURED', 'Configura CONFIG_ENCRYPTION_KEY con 32 bytes en base64.');
  return value;
}
export function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(secret), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
}
export function decryptSecret(payload) {
  const buffer = Buffer.from(String(payload), 'base64');
  const iv = buffer.subarray(0, 12), tag = buffer.subarray(12, 28), encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv); decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
