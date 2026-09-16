import { models, sequelize } from './database.js';
import { ApiError } from './http.js';
import { Op } from 'sequelize';
import { isValidDate, isValidMoney } from './validation.js';
import {
  PayrollCalculator,
  validatePayrollConfig,
  validatePayrollProfile,
  validatePeriod,
} from './services/payroll-calculator.js';
import { defaultPayrollConfig } from './services/payroll-defaults.js';
import { createPreviredFile } from './services/previred.js';
import {
  assertBatchTransition, createPayrollBankFile, normalizeEmployeeBankInput, publicEmployeeBank, publicSchoolBank,
} from './services/payroll-banking.js';

const calculator = new PayrollCalculator();
const scope = req => ({ schoolId: req.user.schoolId });
const PERIOD_MISSING_MESSAGE = 'Falta configurar el período. Ve a Remuneraciones → Parámetros del período, elige el mes y pulsa «Crear período» (copia el mes anterior o carga valores base).';
const missing = () => { throw new ApiError(404, 'NOT_FOUND', PERIOD_MISSING_MESSAGE); };

async function savePeriodConfig(schoolId, periodKey, config, transaction) {
  const [period] = await models.PayrollPeriod.findOrCreate({ where: { schoolId, period: periodKey }, transaction });
  await period.reload({ transaction, lock: transaction.LOCK.UPDATE });
  if (await models.PayrollEmployeeResult.count({ where: { schoolId, periodId: period.id }, transaction })) {
    throw new ApiError(409, 'PERIOD_LOCKED', 'El período tiene liquidaciones históricas y sus parámetros están cerrados.');
  }
  const where = { schoolId, periodId: period.id };
  for (const Model of [models.PayrollParameter, models.PayrollAfpRate, models.PayrollTaxBracket, models.PayrollConcept]) {
    await Model.destroy({ where, transaction });
  }
  await models.PayrollParameter.create({ ...where, values: config.parameters }, { transaction });
  for (const [Model, rows] of [[models.PayrollAfpRate, config.afpRates], [models.PayrollTaxBracket, config.taxBrackets], [models.PayrollConcept, config.concepts]]) {
    await Model.bulkCreate(rows.map(row => ({ ...row, ...where })), { transaction });
  }
  return period;
}
const statusLabel = {
  draft: 'En revisión',
  approved: 'Aprobado',
  generated: 'Archivo generado',
  sent: 'Enviado al banco',
  paid: 'Pagado',
};
async function configFor(periodId, schoolId, transaction) {
  const where = { schoolId, periodId };
  const options = { where, transaction, raw: true };
  const [parameters, afpRates, taxBrackets, concepts] = await Promise.all([
    models.PayrollParameter.findOne(options), models.PayrollAfpRate.findAll(options), models.PayrollTaxBracket.findAll(options), models.PayrollConcept.findAll(options),
  ]);
  if (!parameters) missing();
  return {
    parameters: parameters.values,
    afpRates: afpRates.map(({ name, commission }) => ({ name, commission: Number(commission) })),
    taxBrackets: taxBrackets.map(({ lowerUtm, upperUtm, factor, deductionUtm }) => ({
      lowerUtm: Number(lowerUtm),
      upperUtm: upperUtm === null || upperUtm === undefined ? null : Number(upperUtm),
      factor: Number(factor),
      deductionUtm: Number(deductionUtm),
    })),
    concepts: concepts.map(({ code, label, taxable, pensionable }) => ({
      code,
      label,
      taxable: taxable === true || taxable === 1 || taxable === '1',
      pensionable: pensionable === true || pensionable === 1 || pensionable === '1',
    })),
  };
}
function publicBatch(batch, lines = []) {
  const data = batch.toJSON ? batch.toJSON() : batch;
  return {
    ...data,
    statusLabel: statusLabel[data.status] || data.status,
    destinationBanks: [...new Set(lines.map(line => line.bank).filter(Boolean))],
    lines: lines.map(line => ({
      ...line,
      accountNumberMasked: publicEmployeeBank(line).accountNumberMasked,
      accountNumberEncrypted: undefined,
    })),
  };
}
export function registerPayrollRoutes(app) {
  app.use('/api/payroll', (req,res,next) => {
    if (!req.user.permissions?.manageHr && !req.user.permissions?.manageSchool && !req.user.permissions?.manageUsers) return res.status(403).json({ message: 'No tienes permiso para gestionar remuneraciones.' });
    next();
  });
  app.get('/api/payroll/periods', async (req,res) => res.json(await models.PayrollPeriod.findAll({ where: scope(req), order: [['period','DESC']] })));
  app.get('/api/payroll/periods/:period', async (req,res) => {
    const period = await models.PayrollPeriod.findOne({ where: { ...scope(req), period: validatePeriod(req.params.period) } });
    if (!period) missing();
    res.json({ ...await configFor(period.id,req.user.schoolId), locked: Boolean(await models.PayrollEmployeeResult.count({ where: { ...scope(req), periodId: period.id } })) });
  });
  app.put('/api/payroll/periods/:period', async (req,res) => {
    const key = validatePeriod(req.params.period);
    const config = validatePayrollConfig(req.body);
    await sequelize.transaction(async transaction => {
      await models.School.findByPk(req.user.schoolId, { transaction, lock: transaction.LOCK.UPDATE });
      await savePeriodConfig(req.user.schoolId, key, config, transaction);
    });
    res.json({ saved: true });
  });

  /** Crea el período copiando el mes anterior configurado, o valores base de Chile si no hay ninguno. */
  app.post('/api/payroll/periods/:period/bootstrap', async (req, res) => {
    const key = validatePeriod(req.params.period);
    const result = await sequelize.transaction(async (transaction) => {
      await models.School.findByPk(req.user.schoolId, { transaction, lock: transaction.LOCK.UPDATE });
      const existing = await models.PayrollPeriod.findOne({ where: { ...scope(req), period: key }, transaction });
      if (existing) {
        const hasParams = await models.PayrollParameter.findOne({ where: { schoolId: req.user.schoolId, periodId: existing.id }, transaction });
        if (hasParams) throw new ApiError(409, 'PERIOD_EXISTS', 'Este período ya tiene parámetros. Ábrelo para editarlos.');
      }
      const previousRows = await models.PayrollPeriod.findAll({
        where: { ...scope(req), period: { [Op.lt]: key } },
        order: [['period', 'DESC']],
        limit: 24,
        transaction,
      });
      let previous = null;
      for (const row of previousRows) {
        const hasParams = await models.PayrollParameter.findOne({
          where: { schoolId: req.user.schoolId, periodId: row.id },
          transaction,
        });
        if (hasParams) {
          previous = row;
          break;
        }
      }
      let config = defaultPayrollConfig(key);
      let source = 'defaults';
      if (previous) {
        config = await configFor(previous.id, req.user.schoolId, transaction);
        config = {
          parameters: {
            ...config.parameters,
            source: `Copiado desde ${previous.period}. Verifica UF y UTM oficiales de ${key} antes de liquidar.`,
          },
          afpRates: config.afpRates.map(({ name, commission }) => ({ name, commission: Number(commission) })),
          taxBrackets: config.taxBrackets.map(({ lowerUtm, upperUtm, factor, deductionUtm }) => ({
            lowerUtm: Number(lowerUtm),
            upperUtm: upperUtm === null || upperUtm === undefined ? null : Number(upperUtm),
            factor: Number(factor),
            deductionUtm: Number(deductionUtm),
          })),
          concepts: config.concepts.map(({ code, label, taxable, pensionable }) => ({ code, label, taxable, pensionable })),
        };
        source = previous.period;
      }
      config = validatePayrollConfig(config);
      await savePeriodConfig(req.user.schoolId, key, config, transaction);
      return { period: key, source, ...config, locked: false };
    });
    res.status(201).json(result);
  });
  app.get('/api/payroll/employees/:id', async (req,res) => {
    const employee = await models.Employee.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!employee) throw new ApiError(404,'NOT_FOUND','Empleado no encontrado.');
    const page = Math.max(1, Number(req.query.page) || 1);
    const { rows, count } = await models.PayrollEmployeeResult.findAndCountAll({ where: { ...scope(req), employeeId: employee.id }, order: [['id','DESC']], limit: 10, offset: (Math.floor(page)-1)*10 });
    const json = employee.toJSON();
    delete json.accountNumberEncrypted;
    res.json({ employee: { ...json, banking: publicEmployeeBank(employee) }, results: rows, total: count });
  });
  app.put('/api/payroll/employees/:id', async (req,res) => {
    const employee = await models.Employee.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!employee) throw new ApiError(404,'NOT_FOUND','Empleado no encontrado.');
    const { monthlySalary, hiredOn, endedOn, contractType } = req.body;
    if (!isValidMoney(monthlySalary) || !isValidDate(hiredOn) || endedOn && (!isValidDate(endedOn) || endedOn < hiredOn) || !['Indefinido','Plazo fijo','Reemplazo','Honorarios'].includes(contractType)) throw new ApiError(400,'VALIDATION_ERROR','Revisa sueldo, contrato y fechas.');
    const payrollProfile = contractType === 'Honorarios'
      ? (employee.payrollProfile || null)
      : validatePayrollProfile(req.body.payrollProfile);
    const patch = { monthlySalary, hiredOn, endedOn: endedOn || null, contractType, payrollProfile };
    if (Object.prototype.hasOwnProperty.call(req.body, 'banking')) {
      Object.assign(patch, normalizeEmployeeBankInput(req.body.banking || {}));
    }
    await employee.update(patch);
    const json = employee.toJSON();
    delete json.accountNumberEncrypted;
    res.json({ employee: { ...json, banking: publicEmployeeBank(employee) } });
  });
  app.post('/api/payroll/employees/:id/calculate', async (req,res) => {
    const key = validatePeriod(req.body.period);
    const result = await sequelize.transaction(async transaction => {
      const period = await models.PayrollPeriod.findOne({ where: { ...scope(req), period:key }, transaction, lock:transaction.LOCK.UPDATE });
      if (!period) missing();
      const employee = await models.Employee.findOne({ where: { ...scope(req), id:req.params.id }, transaction, lock: transaction.LOCK.UPDATE });
      if (!employee) throw new ApiError(404,'NOT_FOUND','Empleado no encontrado.');
      const config = await configFor(period.id,req.user.schoolId,transaction);
      const calculated = calculator.calculate({ period:key, employee:employee.toJSON(), config, daysWorked:req.body.daysWorked });
      if (req.body.save !== true) return { ...calculated, preview:true };
      if (await models.PayrollEmployeeResult.count({ where: { ...scope(req), periodId:period.id, employeeId:employee.id }, transaction })) throw new ApiError(409,'PAYROLL_EXISTS','Ya existe una liquidación histórica para este empleado y mes.');
      const run = await models.PayrollRun.create({ ...scope(req), periodId:period.id, createdBy:req.user.id, snapshot:{ period:key, config } },{ transaction });
      const record = await models.PayrollEmployeeResult.create({ ...scope(req), periodId:period.id, runId:run.id, employeeId:employee.id, snapshot:{ period:key, employee:employee.toJSON(), config, daysWorked:calculated.totals.daysWorked }, totals:calculated.totals },{ transaction });
      await models.PayrollResultItem.bulkCreate(calculated.items.map(item => ({ ...item, ...scope(req), resultId:record.id })),{ transaction });
      return { ...calculated, id:record.id, preview:false };
    });
    res.status(req.body.save === true ? 201 : 200).json(result);
  });
  app.get('/api/payroll/results/:id', async (req,res) => {
    const record = await models.PayrollEmployeeResult.findOne({ where:{ ...scope(req), id:req.params.id } });
    if (!record) throw new ApiError(404,'NOT_FOUND','Liquidación no encontrada.');
    const items = await models.PayrollResultItem.findAll({ where:{ ...scope(req), resultId:record.id }, order:[['id','ASC']] });
    res.json({ ...record.toJSON(), items });
  });
  app.get('/api/payroll/periods/:period/previred', async (req,res) => {
    const key = validatePeriod(req.params.period);
    const period = await models.PayrollPeriod.findOne({where:{...scope(req),period:key}});
    if (!period) missing();
    const records = await models.PayrollEmployeeResult.findAll({where:{...scope(req),periodId:period.id},order:[['employeeId','ASC']]});
    const items = await models.PayrollResultItem.findAll({where:{...scope(req),resultId:records.map(record => record.id)},raw:true});
    const file = createPreviredFile(records.map(record => ({record:record.toJSON(),items:items.filter(item => item.resultId === record.id)})));
    if (req.query.validate === 'true') return res.json({version:file.version,valid:file.errors.length===0,records:file.lines.length,errors:file.errors});
    if (file.errors.length) return res.status(422).json({message:'Faltan datos obligatorios para generar Previred.',version:file.version,errors:file.errors});
    res.setHeader('Content-Type','text/plain; charset=utf-8');
    res.setHeader('Content-Disposition',`attachment; filename="previred-${key}.txt"`);
    res.send(file.content);
  });

  app.get('/api/payroll/payments', async (req, res) => {
    const batches = await models.PayrollPaymentBatch.findAll({ where: scope(req), order: [['periodId', 'DESC'], ['id', 'DESC']] });
    const periods = await models.PayrollPeriod.findAll({ where: { id: batches.map(batch => batch.periodId) }, raw: true });
    const periodMap = new Map(periods.map(period => [period.id, period.period]));
    const lines = batches.length
      ? await models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batches.map(batch => batch.id) }, raw: true })
      : [];
    res.json(batches.map(batch => {
      const batchLines = lines.filter(line => line.batchId === batch.id);
      const summary = publicBatch(batch, []);
      return {
        ...summary,
        period: periodMap.get(batch.periodId),
        destinationBank: [...new Set(batchLines.map(line => line.bank).filter(Boolean))].join(', ') || '—',
        destinationBanks: [...new Set(batchLines.map(line => line.bank).filter(Boolean))],
        lines: undefined,
      };
    }));
  });

  app.post('/api/payroll/payments', async (req, res) => {
    const key = validatePeriod(req.body.period);
    const batch = await sequelize.transaction(async (transaction) => {
      const period = await models.PayrollPeriod.findOne({ where: { ...scope(req), period: key }, transaction, lock: transaction.LOCK.UPDATE });
      if (!period) missing();
      const existing = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), periodId: period.id }, transaction });
      if (existing) throw new ApiError(409, 'PAYMENT_EXISTS', 'Ya existe un lote de pago para este período. Ábrelo para continuar el flujo.');
      const results = await models.PayrollEmployeeResult.findAll({ where: { ...scope(req), periodId: period.id }, transaction });
      if (!results.length) throw new ApiError(400, 'NO_RESULTS', 'Aún no hay liquidaciones guardadas. En Empleados activos abre cada trabajador, elige este mes, calcula el sueldo y guarda la liquidación.');
      const employees = await models.Employee.findAll({ where: { ...scope(req), id: results.map(result => result.employeeId) }, transaction });
      const employeeMap = new Map(employees.map(employee => [employee.id, employee]));
      const missingBank = [];
      const lineRows = results.map((result) => {
        const employee = employeeMap.get(result.employeeId);
        const amount = Number(result.totals?.sueldo_liquido || 0);
        if (!employee?.bank || !employee?.accountType || !employee?.accountNumberEncrypted || !employee?.holderRut) {
          missingBank.push(employee?.fullName || `#${result.employeeId}`);
        }
        return {
          ...scope(req),
          employeeId: result.employeeId,
          resultId: result.id,
          employeeName: employee?.fullName || `Empleado #${result.employeeId}`,
          amount,
          bank: employee?.bank || null,
          accountType: employee?.accountType || null,
          accountNumberEncrypted: employee?.accountNumberEncrypted || null,
          holderRut: employee?.holderRut || null,
          email: employee?.email || null,
          paymentMethod: employee?.paymentMethod || 'transferencia',
          status: 'included',
        };
      });
      if (missingBank.length) throw new ApiError(422, 'BANK_DATA_MISSING', `Faltan datos bancarios de: ${missingBank.join(', ')}.`);
      const netTotal = lineRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      const grossTotal = results.reduce((sum, result) => sum + Number(result.totals?.sueldo_bruto || 0), 0);
      const created = await models.PayrollPaymentBatch.create({
        ...scope(req),
        periodId: period.id,
        status: 'draft',
        workerCount: lineRows.length,
        netTotal,
        grossTotal,
        createdBy: req.user.id,
        snapshot: { period: key, createdFromResults: results.length },
      }, { transaction });
      await models.PayrollPaymentLine.bulkCreate(lineRows.map(row => ({ ...row, batchId: created.id })), { transaction });
      return created;
    });
    const lines = await models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, raw: true });
    res.status(201).json({ ...publicBatch(batch, lines), period: key });
  });

  app.get('/api/payroll/payments/:id', async (req, res) => {
    const batch = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!batch) throw new ApiError(404, 'NOT_FOUND', 'Lote de pago no encontrado.');
    const [period, lines, school] = await Promise.all([
      models.PayrollPeriod.findByPk(batch.periodId),
      models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, order: [['employeeName', 'ASC']], raw: true }),
      models.School.findByPk(req.user.schoolId),
    ]);
    res.json({
      ...publicBatch(batch, lines),
      period: period?.period,
      schoolBanking: publicSchoolBank(school),
    });
  });

  app.post('/api/payroll/payments/:id/approve', async (req, res) => {
    const batch = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!batch) throw new ApiError(404, 'NOT_FOUND', 'Lote de pago no encontrado.');
    assertBatchTransition(batch.status, 'approved');
    await batch.update({ status: 'approved', approvedBy: req.user.id, approvedAt: new Date() });
    const [period, lines] = await Promise.all([
      models.PayrollPeriod.findByPk(batch.periodId),
      models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, raw: true }),
    ]);
    res.json({ ...publicBatch(batch, lines), period: period?.period });
  });

  app.post('/api/payroll/payments/:id/generate', async (req, res) => {
    const batch = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!batch) throw new ApiError(404, 'NOT_FOUND', 'Lote de pago no encontrado.');
    if (!['approved', 'generated'].includes(batch.status)) throw new ApiError(409, 'INVALID_STATUS', 'Aprueba el lote antes de generar el archivo bancario.');
    const school = await models.School.findByPk(req.user.schoolId);
    if (!school?.originBank || !school?.originAccountType || !school?.originAccountNumberEncrypted || !school?.companyRut) {
      throw new ApiError(422, 'ORIGIN_BANK_MISSING', 'Configura los datos bancarios de origen del colegio antes de generar el archivo.');
    }
    const period = await models.PayrollPeriod.findByPk(batch.periodId);
    const fileName = `nomina-${period.period}.csv`;
    await batch.update({
      status: 'generated',
      fileName,
      fileGeneratedAt: new Date(),
      paidAt: req.body.paidAt || batch.paidAt || new Date().toISOString().slice(0, 10),
    });
    const lines = await models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, raw: true });
    res.json({
      ...publicBatch(batch, lines),
      period: period.period,
      schoolBanking: publicSchoolBank(school),
    });
  });

  app.get('/api/payroll/payments/:id/file', async (req, res) => {
    const batch = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!batch) throw new ApiError(404, 'NOT_FOUND', 'Lote de pago no encontrado.');
    if (!['generated', 'sent', 'paid'].includes(batch.status)) throw new ApiError(409, 'INVALID_STATUS', 'Genera el archivo bancario antes de descargarlo.');
    const [period, lines, school] = await Promise.all([
      models.PayrollPeriod.findByPk(batch.periodId),
      models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, order: [['employeeName', 'ASC']], raw: true }),
      models.School.findByPk(req.user.schoolId),
    ]);
    const file = createPayrollBankFile({
      school: school.toJSON(),
      lines,
      period: period.period,
      paidAt: batch.paidAt,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  });

  app.post('/api/payroll/payments/:id/status', async (req, res) => {
    const batch = await models.PayrollPaymentBatch.findOne({ where: { ...scope(req), id: req.params.id } });
    if (!batch) throw new ApiError(404, 'NOT_FOUND', 'Lote de pago no encontrado.');
    const next = String(req.body.status || '').trim();
    assertBatchTransition(batch.status, next);
    const patch = { status: next };
    if (next === 'sent') patch.sentAt = new Date();
    if (next === 'paid') patch.paidAt = req.body.paidAt || batch.paidAt || new Date().toISOString().slice(0, 10);
    if (next === 'draft') Object.assign(patch, { approvedBy: null, approvedAt: null, fileName: null, fileGeneratedAt: null, sentAt: null });
    await batch.update(patch);
    const [period, lines, school] = await Promise.all([
      models.PayrollPeriod.findByPk(batch.periodId),
      models.PayrollPaymentLine.findAll({ where: { ...scope(req), batchId: batch.id }, raw: true }),
      models.School.findByPk(req.user.schoolId),
    ]);
    res.json({ ...publicBatch(batch, lines), period: period?.period, schoolBanking: publicSchoolBank(school) });
  });
}
