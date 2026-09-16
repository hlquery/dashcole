import { ApiError } from '../http.js';

export const PREVIRED_FORMAT_VERSION = '98-2026-08';
/** Códigos Previred Tabla N°16 (institución de salud), Isapres activas. */
export const CHILE_ISAPRES = [
  { code: '01', name: 'Banmédica' },
  { code: '02', name: 'Consalud' },
  { code: '03', name: 'Vida Tres' },
  { code: '04', name: 'Colmena Golden Cross' },
  { code: '05', name: 'Cruz Blanca' },
  { code: '10', name: 'Nueva Masvida' },
  { code: '11', name: 'Isalud (Codelco)' },
  { code: '12', name: 'Fundación' },
  { code: '25', name: 'Cruz del Norte' },
  { code: '28', name: 'Esencial' },
];
/** AFP activas en Chile · códigos Previred Tabla N°7. */
export const CHILE_AFPS = [
  { code: '33', name: 'Capital' },
  { code: '03', name: 'Cuprum' },
  { code: '05', name: 'Habitat' },
  { code: '34', name: 'Modelo' },
  { code: '29', name: 'PlanVital' },
  { code: '08', name: 'Provida' },
  { code: '35', name: 'Uno' },
];
const ISAPRE_CODES = new Set(CHILE_ISAPRES.map((row) => row.code));
const afpCodes = new Map(CHILE_AFPS.map((row) => [row.name, row.code]));
const clean = value => String(value ?? '').replace(/[;\r\n]/g, ' ').trim();
const integer = value => String(Math.max(0, Math.round(Number(value) || 0)));

function identity(snapshot) {
  const data = snapshot.employee?.payrollProfile?.previred || {};
  const rut = clean(data.rut).replace(/\./g, '').toUpperCase().match(/^(\d{6,9})-?([\dK])$/);
  const errors = [];
  if (!rut) errors.push('RUT con dígito verificador');
  for (const [key, label] of [['paternalSurname', 'apellido paterno'], ['givenNames', 'nombres'], ['sex', 'sexo'], ['nationality', 'nacionalidad'], ['workdayType', 'tipo de jornada']]) if (!clean(data[key])) errors.push(label);
  if (data.sex && !['M','F'].includes(data.sex)) errors.push('código de sexo válido');
  if (data.nationality && !['0','1'].includes(data.nationality)) errors.push('código de nacionalidad válido');
  if (data.workdayType && !['1','2'].includes(data.workdayType)) errors.push('código de jornada válido');
  if (data.paymentType && !['01','02','03'].includes(data.paymentType)) errors.push('tipo de pago válido');
  return { data, rut, errors };
}

export function createPreviredLine(record, items) {
  const snapshot = record.snapshot || {};
  const { data, rut, errors } = identity(snapshot);
  if (errors.length) return { errors };
  const totals = record.totals || {};
  const byCode = new Map(items.map(item => [item.code, Number(item.amount) || 0]));
  const profile = snapshot.employee.payrollProfile;
  const alphaFields = new Set([2,3,4,5,6,11,14,16,17,18,25,35,36,37,41,46,51,52,53,54,56,57,76,104,105]);
  const fields = Array.from({ length: 105 }, (_, index) => alphaFields.has(index + 1) ? '' : '0');
  const set = (number, value) => { fields[number - 1] = clean(value) || (alphaFields.has(number) ? '' : '0'); };
  set(1, rut[1]); set(2, rut[2]); set(3, data.paternalSurname); set(4, data.maternalSurname || '');
  set(5, data.givenNames); set(6, data.sex); set(7, data.nationality); set(8, data.paymentType || '01');
  const [year, month] = snapshot.period.split('-'); set(9, `${month}${year}`); set(10, `${month}${year}`);
  set(11, data.pensionRegime || 'AFP'); set(12, data.workerType || '0'); set(13, totals.daysWorked || 30); set(14, '00');
  set(15, data.personnelMovementCode || '00'); set(16, data.movementFrom || ''); set(17, data.movementTo || '');
  set(18, data.familyAllowanceBracket || 'D'); set(19, data.familyDependants || 0); set(20, 0); set(21, 0);
  set(26, afpCodes.get(profile.afp) || data.afpCode || '00'); set(27, integer(totals.total_imponible)); set(28, integer(byCode.get('afp'))); set(29, integer(byCode.get('sis')));
  set(64, profile.healthSystem === 'Fonasa' ? integer(totals.base_previsional) : 0);
  set(70, profile.healthSystem === 'Fonasa' ? integer(byCode.get('health')) : 0);
  set(71, data.mutualCode ? 0 : integer((byCode.get('accident') || 0) + (byCode.get('sanna') || 0)));
  set(75, profile.healthSystem === 'Fonasa' ? '07' : data.healthInstitutionCode);
  set(76, profile.healthSystem === 'Isapre' ? data.funNumber : '');
  set(77, profile.healthSystem === 'Isapre' ? integer(totals.base_previsional) : 0);
  set(78, profile.healthSystem === 'Isapre' ? '2' : 0);
  set(79, profile.healthSystem === 'Isapre' ? Number(profile.isaprePlan || 0).toFixed(2).replace('.', ',') : 0);
  const mandatoryHealth = Math.round((Number(totals.base_previsional) || 0) * (Number(snapshot.config?.parameters?.healthRate) || 0));
  set(80, profile.healthSystem === 'Isapre' ? integer(Math.min(byCode.get('health') || 0, mandatoryHealth)) : 0);
  set(81, profile.healthSystem === 'Isapre' ? integer(Math.max(0, (byCode.get('health') || 0) - mandatoryHealth)) : 0);
  set(83, data.ccafCode || '00');
  set(92, integer(data.rima || 0)); set(93, data.workdayType);
  set(94, integer(byCode.get('life_expectancy'))); set(95, integer(byCode.get('protected_return')));
  set(96, data.mutualCode || '00'); set(97, data.mutualCode ? integer(totals.base_previsional) : 0);
  set(98, data.mutualCode ? integer((byCode.get('accident') || 0) + (byCode.get('sanna') || 0)) : 0); set(99, data.mutualBranch || 0);
  set(100, integer(totals.base_previsional)); set(101, integer(byCode.get('afc'))); set(102, integer(byCode.get('employer_afc')));
  set(105, data.costCenter || '');
  if (!afpCodes.has(profile.afp) && !data.afpCode) errors.push('código AFP');
  if (profile.healthSystem === 'Isapre' && (!ISAPRE_CODES.has(data.healthInstitutionCode) || !data.funNumber)) errors.push('Isapre válida y número FUN');
  if (fields.length !== 105) throw new ApiError(500, 'PREVIRED_FORMAT', 'El formato Previred no tiene 105 campos.');
  return { fields, line: fields.join(';'), errors };
}

export function createPreviredFile(recordsWithItems) {
  const errors = [];
  const lines = [];
  for (const { record, items } of recordsWithItems) {
    const result = createPreviredLine(record, items);
    if (result.errors.length) errors.push({ employeeId: record.employeeId, resultId: record.id, missing: result.errors });
    else lines.push(result.line);
  }
  return { version: PREVIRED_FORMAT_VERSION, lines, errors, content: lines.join('\r\n') + (lines.length ? '\r\n' : '') };
}
