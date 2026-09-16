// Pure contracts only; authorization and persistence stay in api/.
export const isPositiveId = value => /^(?:[1-9]\d*)$/.test(String(value)) && Number.isSafeInteger(Number(value));
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export const isValidString = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
export const isValidEnum = (value, values) => values.includes(value);
export const isValidMoney = (value, max = 9999999999.99) => /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value)) && Number(value) <= max && Number.isSafeInteger(Math.round(Number(value) * 100));
export function isValidRut(value) {
  const rut = String(value).replace(/\./g, '').toUpperCase();
  if (!/^\d{1,8}-[0-9K]$/.test(rut)) return false;
  const [body, digit] = rut.split('-');
  if (Number(body) === 0) return false;
  let sum = 0, factor = 2;
  for (const number of [...body].reverse()) { sum += Number(number) * factor; factor = factor === 7 ? 2 : factor + 1; }
  const remainder = 11 - sum % 11;
  return digit === (remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder));
}
