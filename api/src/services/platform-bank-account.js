import { controlModels } from '../database.js';
import { PLATFORM_BANK_ACCOUNT } from './webpay.js';

const KEY = 'platform.bank_account';
let cache = { at: 0, value: undefined };

function maskAccountNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `${'*'.repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}

function normalize(config = {}, source = 'platform') {
  const accountNumber = String(config.accountNumber || '').trim();
  return {
    bank: String(config.bank || '').trim(),
    accountType: String(config.accountType || 'Cuenta corriente').trim(),
    accountNumber,
    accountNumberMasked: String(config.accountNumberMasked || '').trim() || maskAccountNumber(accountNumber),
    holderName: String(config.holderName || '').trim(),
    holderRut: String(config.holderRut || '').trim(),
    email: String(config.email || '').trim(),
    branch: String(config.branch || '').trim(),
    transferNote: String(config.transferNote || '').trim(),
    source,
    configured: source === 'platform',
  };
}

function defaults() {
  return normalize(PLATFORM_BANK_ACCOUNT, 'default');
}

export function clearBankAccountCache() {
  cache = { at: 0, value: undefined };
}

export async function getPlatformBankAccount() {
  if (cache.value !== undefined && Date.now() - cache.at < 15000) return cache.value;
  let value = null;
  try {
    const row = await controlModels.PlatformSetting.findOne({ where: { key: KEY }, raw: true });
    if (row?.config?.bank && row?.config?.accountNumber) {
      value = normalize(row.config, 'platform');
    }
  } catch {
    value = null;
  }
  if (!value) value = defaults();
  cache = { at: Date.now(), value };
  return value;
}

export async function savePlatformBankAccount(body = {}, updatedBy) {
  const clear = body.clear === true;
  if (clear) {
    const existing = await controlModels.PlatformSetting.findOne({ where: { key: KEY } });
    if (existing) await existing.destroy();
    clearBankAccountCache();
    return defaults();
  }

  const bank = String(body.bank || '').trim();
  const accountType = String(body.accountType || 'Cuenta corriente').trim();
  const accountNumber = String(body.accountNumber || '').trim();
  const holderName = String(body.holderName || '').trim();
  const holderRut = String(body.holderRut || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const branch = String(body.branch || '').trim();
  const transferNote = String(body.transferNote || '').trim();

  if (!bank || bank.length > 120) throw new Error('Banco inválido.');
  if (!accountType || accountType.length > 80) throw new Error('Tipo de cuenta inválido.');
  if (!accountNumber || accountNumber.length > 64) throw new Error('Número de cuenta inválido.');
  if (!holderName || holderName.length > 180) throw new Error('Titular inválido.');
  if (!holderRut || holderRut.length > 32) throw new Error('RUT inválido.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Correo inválido.');
  if (branch.length > 120) throw new Error('Sucursal inválida.');
  if (transferNote.length > 500) throw new Error('Nota de transferencia demasiado larga.');

  const config = {
    bank,
    accountType,
    accountNumber,
    accountNumberMasked: maskAccountNumber(accountNumber),
    holderName,
    holderRut,
    email,
    branch,
    transferNote: transferNote || 'Usa el RUT y el número de cuenta. En el comentario indica el slug del colegio.',
  };

  const existing = await controlModels.PlatformSetting.findOne({ where: { key: KEY } });
  if (existing) await existing.update({ config, updatedBy: updatedBy || null });
  else await controlModels.PlatformSetting.create({ key: KEY, config, encryptedSecret: null, updatedBy: updatedBy || null });
  clearBankAccountCache();
  return getPlatformBankAccount();
}
