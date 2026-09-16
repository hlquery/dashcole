import { ApiError } from '../http.js';
import { encryptSecret, decryptSecret } from './secret-config.js';

export const BANK_ACCOUNT_TYPES = ['corriente', 'vista', 'ahorro', 'rut'];
export const PAYMENT_METHODS = ['transferencia', 'cheque', 'efectivo'];
export const PAYMENT_BATCH_STATUSES = ['draft', 'approved', 'generated', 'sent', 'paid'];
export const CHILEAN_BANKS = [
  'Banco de Chile', 'Banco Estado', 'BCI', 'Banco Santander', 'Scotiabank', 'Itaú',
  'Banco Security', 'Banco Falabella', 'Banco Ripley', 'Banco Consorcio', 'BICE',
  'Banco Internacional', 'Banco BTG Pactual', 'Tenpo', 'Coopeuch', 'Otro',
];

export function maskAccountNumber(value) {
  const digits = String(value || '').replace(/\s+/g, '');
  if (!digits) return '';
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return `${'*'.repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}

export function encryptAccountNumber(value) {
  const normalized = String(value || '').replace(/\s+/g, '').trim();
  if (!normalized) return null;
  if (!/^\d{4,24}$/.test(normalized)) throw new ApiError(400, 'VALIDATION_ERROR', 'El número de cuenta debe tener entre 4 y 24 dígitos.');
  return encryptSecret(normalized);
}

export function decryptAccountNumber(payload) {
  if (!payload) return '';
  try { return decryptSecret(payload); }
  catch { throw new ApiError(500, 'DECRYPT_FAILED', 'No fue posible leer el número de cuenta cifrado.'); }
}

export function publicBankAccount(source = {}, { prefix = '' } = {}) {
  const get = (key) => source[`${prefix}${key}`] ?? source[key] ?? null;
  const encrypted = get('accountNumberEncrypted') || get('numeroCuentaEncrypted') || get('encryptedAccountNumber');
  const plainHint = get('accountNumber') || get('numeroCuenta');
  const masked = encrypted ? maskAccountNumber(decryptAccountNumber(encrypted)) : maskAccountNumber(plainHint || '');
  return {
    bank: get('bank') || get('banco') || '',
    accountType: get('accountType') || get('tipoCuenta') || '',
    accountNumberMasked: masked,
    hasAccountNumber: Boolean(encrypted || plainHint),
    holderRut: get('holderRut') || get('rutTitular') || '',
    email: get('email') || '',
    paymentMethod: get('paymentMethod') || get('metodoPago') || 'transferencia',
  };
}

export function normalizeEmployeeBankInput(body = {}) {
  const bank = String(body.bank || body.banco || '').trim();
  const accountType = String(body.accountType || body.tipoCuenta || '').trim().toLowerCase();
  const holderRut = String(body.holderRut || body.rutTitular || '').trim().toUpperCase();
  const email = String(body.email || '').trim().toLowerCase();
  const paymentMethod = String(body.paymentMethod || body.metodoPago || 'transferencia').trim().toLowerCase();
  const accountNumber = body.accountNumber ?? body.numeroCuenta;
  if (bank && bank.length > 80) throw new ApiError(400, 'VALIDATION_ERROR', 'Nombre de banco demasiado largo.');
  if (accountType && !BANK_ACCOUNT_TYPES.includes(accountType)) throw new ApiError(400, 'VALIDATION_ERROR', 'Tipo de cuenta inválido.');
  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) throw new ApiError(400, 'VALIDATION_ERROR', 'Método de pago inválido.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'VALIDATION_ERROR', 'Correo de pago inválido.');
  if (holderRut && !/^\d{7,8}-[\dkK]$/.test(holderRut)) throw new ApiError(400, 'VALIDATION_ERROR', 'RUT titular inválido. Usa formato 12345678-9.');
  const patch = {
    bank: bank || null,
    accountType: accountType || null,
    holderRut: holderRut || null,
    email: email || null,
    paymentMethod: paymentMethod || 'transferencia',
  };
  if (accountNumber !== undefined && accountNumber !== null && String(accountNumber).trim() !== '') {
    patch.accountNumberEncrypted = encryptAccountNumber(accountNumber);
  }
  return patch;
}

export function normalizeSchoolBankInput(body = {}) {
  const bank = String(body.originBank || body.bancoOrigen || body.bank || '').trim();
  const accountType = String(body.originAccountType || body.tipoCuentaOrigen || body.accountType || '').trim().toLowerCase();
  const companyRut = String(body.companyRut || body.rutEmpresa || '').trim().toUpperCase();
  const companyName = String(body.companyName || body.nombreEmpresa || '').trim();
  const accountNumber = body.originAccountNumber ?? body.numeroCuentaOrigen ?? body.accountNumber;
  if (bank && bank.length > 80) throw new ApiError(400, 'VALIDATION_ERROR', 'Banco de origen demasiado largo.');
  if (accountType && !BANK_ACCOUNT_TYPES.includes(accountType)) throw new ApiError(400, 'VALIDATION_ERROR', 'Tipo de cuenta de origen inválido.');
  if (companyName && companyName.length > 150) throw new ApiError(400, 'VALIDATION_ERROR', 'Nombre de empresa demasiado largo.');
  if (companyRut && !/^\d{7,8}-[\dkK]$/.test(companyRut)) throw new ApiError(400, 'VALIDATION_ERROR', 'RUT empresa inválido. Usa formato 12345678-9.');
  const patch = {
    originBank: bank || null,
    originAccountType: accountType || null,
    companyRut: companyRut || null,
    companyName: companyName || null,
  };
  if (accountNumber !== undefined && accountNumber !== null && String(accountNumber).trim() !== '') {
    patch.originAccountNumberEncrypted = encryptAccountNumber(accountNumber);
  }
  return patch;
}

export function publicSchoolBank(school) {
  const data = school?.toJSON ? school.toJSON() : school;
  let originAccountNumberMasked = '';
  let hasOriginAccountNumber = Boolean(data.originAccountNumberEncrypted);
  if (data.originAccountNumberEncrypted) {
    try {
      originAccountNumberMasked = maskAccountNumber(decryptAccountNumber(data.originAccountNumberEncrypted));
    } catch {
      originAccountNumberMasked = '';
      hasOriginAccountNumber = true;
    }
  }
  return {
    originBank: data.originBank || '',
    originAccountType: data.originAccountType || '',
    originAccountNumberMasked,
    hasOriginAccountNumber,
    companyRut: data.companyRut || '',
    companyName: data.companyName || data.name || '',
  };
}

export function publicEmployeeBank(employee) {
  const data = employee?.toJSON ? employee.toJSON() : employee;
  return publicBankAccount(data);
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** Archivo nómina multi-banco (CSV) usable en banca electrónica chilena. */
export function createPayrollBankFile({ school, lines, period, paidAt }) {
  const header = [
    'periodo', 'fecha_pago', 'rut_empresa', 'nombre_empresa', 'banco_origen', 'tipo_cuenta_origen', 'cuenta_origen',
    'rut_titular', 'nombre_trabajador', 'banco_destino', 'tipo_cuenta', 'numero_cuenta', 'email', 'metodo_pago', 'monto_liquido',
  ];
  const originAccount = school.originAccountNumberEncrypted ? decryptAccountNumber(school.originAccountNumberEncrypted) : '';
  const rows = lines.map((line) => {
    const account = line.accountNumberEncrypted ? decryptAccountNumber(line.accountNumberEncrypted) : '';
    return [
      period,
      paidAt || '',
      school.companyRut || '',
      school.companyName || school.name || '',
      school.originBank || '',
      school.originAccountType || '',
      originAccount,
      line.holderRut || '',
      line.employeeName || '',
      line.bank || '',
      line.accountType || '',
      account,
      line.email || '',
      line.paymentMethod || 'transferencia',
      Number(line.amount || 0).toFixed(0),
    ].map(csvEscape).join(';');
  });
  return {
    content: `\uFEFF${[header.join(';'), ...rows].join('\n')}\n`,
    filename: `nomina-${period}.csv`,
    count: lines.length,
    total: lines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
  };
}

export function assertBatchTransition(current, next) {
  const allowed = {
    draft: ['approved'],
    approved: ['generated', 'draft'],
    generated: ['sent', 'approved'],
    sent: ['paid', 'generated'],
    paid: [],
  };
  if (!(allowed[current] || []).includes(next)) {
    throw new ApiError(409, 'INVALID_STATUS', `No se puede pasar de ${current} a ${next}.`);
  }
}
