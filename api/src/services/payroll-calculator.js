import { ApiError } from '../http.js';
import { isValidDate } from '../validation.js';
import { CHILE_ISAPRES, CHILE_AFPS } from './previred.js';

const fail = message => { throw new ApiError(400, 'PAYROLL_VALIDATION', message); };
export const moneyFields = ['taxableBonus', 'nonTaxableBonus', 'viaticos', 'overtimeAmount', 'commissions', 'otherTaxable', 'deductions', 'advances', 'apv', 'isaprePlan'];
export const parameterFields = ['uf', 'utm', 'pensionCapUf', 'healthCapUf', 'afcCapUf', 'pensionRate', 'healthRate', 'healthTaxCapUf', 'apvMonthlyCapUf', 'salaryDays', 'employerPensionRate', 'sisRate', 'accidentRate', 'sannaRate'];
const optionalParameterFields = ['lifeExpectancyRate', 'protectedReturnRate'];
const rateFields = new Set(['pensionRate', 'healthRate', 'employerPensionRate', 'sisRate', 'accidentRate', 'sannaRate', ...optionalParameterFields]);
const contracts = ['Indefinido', 'Plazo fijo', 'Reemplazo'];
function number(value, label, max = 1e12) {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean' || !['number', 'string'].includes(typeof value)) fail(`Falta un valor numérico para ${label}.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > max) fail(`Valor inválido para ${label}.`);
  return n;
}
export function validatePeriod(period) {
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(period || '')) fail('Selecciona un período YYYY-MM válido.');
  return period;
}

/** Días remunerados del mes según vigencia del contrato (Desde/Hasta). Mes completo usa salaryDays. */
export function remuneratedDaysInPeriod(period, hiredOn, endedOn, salaryDays) {
  validatePeriod(period);
  const first = `${period}-01`;
  const lastDay = new Date(Date.UTC(Number(period.slice(0, 4)), Number(period.slice(5)), 0)).toISOString().slice(0, 10);
  if (!isValidDate(hiredOn) || (endedOn && !isValidDate(endedOn))) fail('Revisa las fechas de ingreso y salida.');
  const start = hiredOn > first ? hiredOn : first;
  const end = endedOn && endedOn < lastDay ? endedOn : lastDay;
  if (end < start) fail('El contrato no está vigente en este período.');
  if (start === first && end === lastDay) return salaryDays;
  const days = Math.floor((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000) + 1;
  if (!Number.isInteger(days) || days < 1) fail('No hay días remunerados en este período.');
  return Math.min(days, salaryDays);
}
export function validatePayrollConfig(input) {
  if (!input || typeof input !== 'object') fail('Falta la configuración mensual.');
  const parameters = {};
  for (const key of parameterFields) parameters[key] = number(input.parameters?.[key], key, rateFields.has(key) ? 1 : 1e9);
  for (const key of optionalParameterFields) parameters[key] = number(input.parameters?.[key] ?? 0, key, 1);
  for (const key of ['uf', 'utm', 'pensionCapUf', 'healthCapUf', 'afcCapUf', 'salaryDays']) if (!parameters[key]) fail(`${key} debe ser mayor a cero.`);
  if (!Number.isInteger(parameters.salaryDays) || parameters.salaryDays > 31) fail('Los días base deben ser un entero entre 1 y 31.');
  parameters.afc = {};
  for (const contract of contracts) {
    const entry = input.parameters?.afc?.[contract];
    parameters.afc[contract] = { employee: number(entry?.employee, `AFC trabajador ${contract}`, 1), employer: number(entry?.employer, `AFC empleador ${contract}`, 1) };
  }
  parameters.source = String(input.parameters?.source || '').trim();
  if (!parameters.source || parameters.source.length > 2000) fail('Registra la fuente y vigencia de los parámetros mensuales.');
  if (!Array.isArray(input.afpRates) || !input.afpRates.length || input.afpRates.length > 30) fail('Agrega las comisiones AFP del período.');
  const afpRates = input.afpRates.map(a => ({ name: String(a.name || '').trim(), commission: number(a.commission, 'comisión AFP', 1) }));
  if (afpRates.some(a => !a.name || a.name.length > 80) || new Set(afpRates.map(a => a.name.toLowerCase())).size !== afpRates.length) fail('Las AFP deben tener nombres únicos.');
  if (!Array.isArray(input.taxBrackets) || !input.taxBrackets.length || input.taxBrackets.length > 30) fail('Carga la tabla de impuesto único del mes.');
  const taxBrackets = input.taxBrackets.map(b => ({ lowerUtm: number(b.lowerUtm, 'límite inferior'), upperUtm: b.upperUtm === null || b.upperUtm === '' ? null : number(b.upperUtm, 'límite superior'), factor: number(b.factor, 'factor IUSC', 1), deductionUtm: number(b.deductionUtm, 'rebaja UTM') })).sort((a,b) => a.lowerUtm-b.lowerUtm);
  if (taxBrackets[0].lowerUtm !== 0 || taxBrackets.at(-1).upperUtm !== null) fail('La tabla debe cubrir desde cero hasta un último tramo sin límite.');
  taxBrackets.forEach((b,i) => {
    if (b.upperUtm !== null && b.upperUtm <= b.lowerUtm || i > 0 && taxBrackets[i-1].upperUtm !== b.lowerUtm || b.upperUtm === null && i !== taxBrackets.length-1) fail('La tabla IUSC tiene huecos o tramos superpuestos.');
  });
  if (!Array.isArray(input.concepts ?? []) || (input.concepts || []).length > 50) fail('Conceptos inválidos.');
  const asBool = (value) => {
    if (value === true || value === 1 || value === '1') return true;
    if (value === false || value === 0 || value === '0') return false;
    fail('Revisa código, nombre y clasificación de conceptos.');
  };
  const concepts = (input.concepts || []).map(c => {
    const code = String(c.code || '').trim();
    const label = String(c.label || '').trim();
    if (!/^[a-z][a-z0-9_]{0,59}$/.test(code) || !label || label.length > 120) fail('Revisa código, nombre y clasificación de conceptos.');
    return { code, label, taxable: asBool(c.taxable), pensionable: asBool(c.pensionable) };
  });
  if (new Set(concepts.map(c => c.code)).size !== concepts.length) fail('Conceptos duplicados.');
  return { parameters, afpRates, taxBrackets, concepts };
}
export function validatePayrollProfile(input = {}) {
  const profile = {};
  for (const key of moneyFields) profile[key] = number(input[key] ?? 0, key);
  profile.afp = String(input.afp || '').trim();
  if (!CHILE_AFPS.some((row) => row.name === profile.afp)) fail('Selecciona una AFP de Chile.');
  profile.healthSystem = input.healthSystem || 'Fonasa';
  profile.apvRegime = input.apvRegime || 'A';
  // En Chile el plan Isapre se cotiza en UF.
  profile.isapreUnit = profile.healthSystem === 'Isapre' ? 'UF' : 'UF';
  if (!['Fonasa','Isapre'].includes(profile.healthSystem) || !['A','B'].includes(profile.apvRegime)) fail('Revisa salud y régimen APV.');
  if (profile.healthSystem === 'Fonasa' && profile.isaprePlan) fail('El plan adicional corresponde a Isapre.');
  if (profile.healthSystem === 'Isapre' && profile.isaprePlan < 0) fail('El plan Isapre en UF no puede ser negativo.');
  if (!Array.isArray(input.conceptAmounts ?? []) || (input.conceptAmounts || []).length > 50) fail('Conceptos inválidos.');
  profile.conceptAmounts = (input.conceptAmounts || []).map(c => ({ code: String(c.code || ''), amount: number(c.amount, 'monto del concepto') }));
  if (new Set(profile.conceptAmounts.map(c => c.code)).size !== profile.conceptAmounts.length) fail('Conceptos duplicados.');
  const previred = input.previred && typeof input.previred === 'object' ? input.previred : {};
  profile.previred = Object.fromEntries([
    'rut','paternalSurname','maternalSurname','givenNames','sex','nationality','paymentType','pensionRegime','workerType',
    'workdayType','personnelMovementCode','movementFrom','movementTo','familyAllowanceBracket','familyDependants',
    'afpCode','healthInstitutionCode','funNumber','rima','ccafCode','mutualCode','mutualBranch','costCenter',
  ].map(key => [key, String(previred[key] ?? '').trim()]));
  if (Object.values(profile.previred).some(value => value.length > 120)) fail('Los datos Previred son demasiado largos.');
  if (profile.healthSystem === 'Isapre' && !CHILE_ISAPRES.some((row) => row.code === profile.previred.healthInstitutionCode)) {
    fail('Selecciona una Isapre válida.');
  }
  if (profile.healthSystem === 'Fonasa') profile.previred.healthInstitutionCode = '07';
  return profile;
}
const round = value => Math.round(value + Number.EPSILON);
export class PayrollCalculator {
  calculate({ period, employee, config, daysWorked }) {
    validatePeriod(period);
    const { parameters: p, afpRates, taxBrackets, concepts } = validatePayrollConfig(config);
    const profile = validatePayrollProfile(employee.payrollProfile);
    if (!contracts.includes(employee.contractType)) fail('Selecciona un contrato dependiente válido. Honorarios requiere un cálculo distinto.');
    if (!isValidDate(employee.hiredOn) || employee.endedOn && (!isValidDate(employee.endedOn) || employee.endedOn < employee.hiredOn)) fail('Revisa las fechas de ingreso y salida.');
    const lastDay = new Date(Date.UTC(Number(period.slice(0,4)), Number(period.slice(5)), 0)).toISOString().slice(0,10);
    if (employee.hiredOn > lastDay || employee.endedOn && employee.endedOn < `${period}-01`) fail('El contrato no está vigente en este período.');
    const days = daysWorked === undefined || daysWorked === '' || daysWorked === null
      ? remuneratedDaysInPeriod(period, employee.hiredOn, employee.endedOn || null, p.salaryDays)
      : number(daysWorked, 'días remunerados', p.salaryDays);
    if (!Number.isInteger(days)) fail('Los días remunerados deben ser enteros.');
    const afpRate = afpRates.find(a => a.name === profile.afp)
      || afpRates.find(a => a.name.toLowerCase() === profile.afp.toLowerCase());
    if (!afpRate) fail(`Falta la comisión de ${profile.afp} en los parámetros del período.`);
    const items = [];
    let taxable = 0, pensionable = 0, nonPensionable = 0;
    const earning = (code, label, amount, pension = true, tax = true) => {
      amount = round(amount); items.push({ code, label, amount, kind: 'earning' });
      if (pension) pensionable += amount; else nonPensionable += amount;
      if (tax) taxable += amount;
    };
    earning('base', 'Sueldo base', number(employee.monthlySalary, 'sueldo base') * days / p.salaryDays);
    for (const [key,label] of [['taxableBonus','Bonos imponibles'],['overtimeAmount','Horas extra (monto)'],['commissions','Comisiones'],['otherTaxable','Otros imponibles']]) earning(key,label,profile[key]);
    earning('nonTaxableBonus','Bonos no imponibles',profile.nonTaxableBonus,false,false);
    earning('viaticos','Viáticos',profile.viaticos,false,false);
    for (const c of profile.conceptAmounts) {
      const concept = concepts.find(def => def.code === c.code);
      if (!concept) fail(`El concepto ${c.code} no está configurado para el período.`);
      earning('concept_' + c.code,concept.label,c.amount,concept.pensionable,concept.taxable);
    }
    const pensionBase = Math.min(pensionable, round(p.pensionCapUf*p.uf));
    const healthBase = Math.min(pensionable, round(p.healthCapUf*p.uf));
    const afcBase = Math.min(pensionable, round(p.afcCapUf*p.uf));
    const afp = round(pensionBase * (p.pensionRate + afpRate.commission));
    const mandatoryHealth = round(healthBase*p.healthRate);
    const health = profile.healthSystem === 'Isapre' ? Math.max(mandatoryHealth, round(profile.isaprePlan * p.uf)) : mandatoryHealth;
    const afc = round(afcBase*p.afc[employee.contractType].employee);
    const apv = round(profile.apv);
    const deductibleApv = profile.apvRegime === 'B' ? Math.min(apv,round(p.apvMonthlyCapUf*p.uf)) : 0;
    const acceptedHealth = Math.min(health,round(p.healthTaxCapUf*p.uf));
    const taxBase = Math.max(0,taxable-afp-acceptedHealth-afc-deductibleApv);
    const taxBracket = taxBrackets.find(b => taxBase >= b.lowerUtm*p.utm && (b.upperUtm === null || taxBase < b.upperUtm*p.utm));
    const tax = round(Math.max(0,taxBase*taxBracket.factor-taxBracket.deductionUtm*p.utm));
    for (const [code,label,amount] of [['afp','AFP',afp],['health','Salud',health],['afc','AFC trabajador',afc],['tax','Impuesto único',tax],['apv','APV',apv],['deductions','Otros descuentos',round(profile.deductions)],['advances','Anticipos',round(profile.advances)]]) items.push({ code,label,amount,kind:'deduction' });
    let employer = 0;
    for (const [code,label,base,rate] of [['employer_afc','AFC empleador',afcBase,p.afc[employee.contractType].employer],['employer_pension','Cotización previsional empleador',pensionBase,p.employerPensionRate],['sis','SIS',pensionBase,p.sisRate],['life_expectancy','Seguro Social · expectativa de vida',pensionBase,p.lifeExpectancyRate],['protected_return','Seguro Social · rentabilidad protegida',pensionBase,p.protectedReturnRate],['accident','Accidentes del trabajo',pensionBase,p.accidentRate],['sanna','SANNA',pensionBase,p.sannaRate]]) {
      const amount = round(base*rate); employer += amount; items.push({code,label,amount,kind:'employer'});
    }
    const gross = pensionable+nonPensionable;
    const deductions = items.filter(i => i.kind === 'deduction').reduce((sum,i) => sum+i.amount,0);
    if (deductions > gross) fail('Los descuentos exceden los haberes. Revisa los montos antes de guardar.');
    const totals = { total_haberes_imponibles:pensionable, base_previsional:pensionBase, renta_tributable:taxBase, total_haberes_tributables:taxable, descuentos_previsionales_tributariamente_aceptados:afp+acceptedHealth+afc+deductibleApv, sueldo_bruto:gross, total_imponible:pensionable,total_no_imponible:nonPensionable,total_descuentos_legales:afp+health+afc+tax,total_descuentos:deductions,impuesto:tax,sueldo_liquido:gross-deductions,costo_empresa:gross+employer,daysWorked:days };
    return { totals, items };
  }
}

/** Estima el sueldo base (bruto) que entrega un líquido objetivo, con AFP/salud del perfil. */
export function estimateGrossFromNet({
  targetNet,
  contractType,
  hiredOn,
  period,
  config,
  payrollProfile,
  daysWorked,
}) {
  const net = Math.round(Number(targetNet));
  if (!Number.isFinite(net) || net < 1) fail('Ingresa un sueldo líquido válido.');
  if (contractType === 'Honorarios') {
    return {
      monthlySalary: net,
      targetNet: net,
      achievedNet: net,
      items: [],
      totals: {
        sueldo_bruto: net,
        sueldo_liquido: net,
        total_descuentos: 0,
        total_descuentos_legales: 0,
        impuesto: 0,
        costo_empresa: net,
        daysWorked: 30,
      },
      honorarios: true,
    };
  }
  if (!['Indefinido', 'Plazo fijo', 'Reemplazo'].includes(contractType)) {
    fail('Selecciona un tipo de contrato válido.');
  }
  const calculator = new PayrollCalculator();
  const profile = validatePayrollProfile(payrollProfile);
  const employeeBase = {
    contractType,
    hiredOn: hiredOn || new Date().toISOString().slice(0, 10),
    endedOn: null,
    payrollProfile: profile,
  };
  const run = (gross) => calculator.calculate({
    period,
    employee: { ...employeeBase, monthlySalary: gross },
    config,
    daysWorked,
  });
  let lo = net;
  let hi = Math.max(net + 1, Math.round(net * 1.4));
  let result = run(hi);
  for (let guard = 0; result.totals.sueldo_liquido < net && guard < 24; guard += 1) {
    hi = Math.round(hi * 1.2);
    result = run(hi);
  }
  if (result.totals.sueldo_liquido < net) fail('No se pudo estimar el sueldo base para ese líquido.');
  for (let i = 0; i < 40; i += 1) {
    const mid = Math.round((lo + hi) / 2);
    result = run(mid);
    if (result.totals.sueldo_liquido < net) lo = mid + 1;
    else hi = mid;
  }
  result = run(hi);
  return {
    monthlySalary: hi,
    targetNet: net,
    achievedNet: result.totals.sueldo_liquido,
    items: result.items,
    totals: result.totals,
    honorarios: false,
  };
}

/** Perfil previsional vacío con AFP/salud recomendados (editables al contratar). */
export function defaultHirePayrollProfile({ afp = 'Uno', healthSystem = 'Fonasa' } = {}) {
  return validatePayrollProfile({
    afp,
    healthSystem,
    isaprePlan: 0,
    apvRegime: 'A',
    taxableBonus: 0,
    nonTaxableBonus: 0,
    viaticos: 0,
    overtimeAmount: 0,
    commissions: 0,
    otherTaxable: 0,
    deductions: 0,
    advances: 0,
    apv: 0,
    conceptAmounts: [],
    previred: {
      healthInstitutionCode: healthSystem === 'Fonasa' ? '07' : '',
      nationality: '0',
      workdayType: '1',
    },
  });
}
