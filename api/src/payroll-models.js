import { DataTypes as D } from 'sequelize';

export function definePayrollModels(sequelize) {
  const id = { type: D.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true };
  const scope = { id, schoolId: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' } };
  const periodId = { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'period_id' };
  const json = { type: D.JSON, allowNull: false };
  const opts = tableName => ({ tableName, underscored: true, timestamps: true });
  const PayrollPeriod = sequelize.define('PayrollPeriod', { ...scope, period: { type: D.STRING(7), allowNull: false } }, { ...opts('payroll_periods'), indexes: [{ unique: true, fields: ['school_id', 'period'] }] });
  const PayrollParameter = sequelize.define('PayrollParameter', { ...scope, periodId, values: json }, { ...opts('payroll_parameters'), indexes: [{ unique: true, fields: ['school_id', 'period_id'] }] });
  const PayrollAfpRate = sequelize.define('PayrollAfpRate', { ...scope, periodId, name: { type: D.STRING(80), allowNull: false }, commission: { type: D.DECIMAL(10, 8), allowNull: false } }, { ...opts('payroll_afp_rates'), indexes: [{ unique: true, fields: ['period_id', 'name'] }] });
  const PayrollTaxBracket = sequelize.define('PayrollTaxBracket', { ...scope, periodId, lowerUtm: { type: D.DECIMAL(16, 6), allowNull: false }, upperUtm: D.DECIMAL(16, 6), factor: { type: D.DECIMAL(10, 8), allowNull: false }, deductionUtm: { type: D.DECIMAL(16, 6), allowNull: false } }, opts('payroll_tax_brackets'));
  const PayrollConcept = sequelize.define('PayrollConcept', { ...scope, periodId, code: { type: D.STRING(60), allowNull: false }, label: { type: D.STRING(120), allowNull: false }, taxable: { type: D.BOOLEAN, allowNull: false }, pensionable: { type: D.BOOLEAN, allowNull: false } }, { ...opts('payroll_concepts'), indexes: [{ unique: true, fields: ['period_id', 'code'] }] });
  const PayrollRun = sequelize.define('PayrollRun', { ...scope, periodId, createdBy: { type: D.INTEGER.UNSIGNED, allowNull: false }, snapshot: json }, opts('payroll_runs'));
  const PayrollEmployeeResult = sequelize.define('PayrollEmployeeResult', { ...scope, periodId, runId: { type: D.INTEGER.UNSIGNED, allowNull: false }, employeeId: { type: D.INTEGER.UNSIGNED, allowNull: false }, snapshot: json, totals: json }, { ...opts('payroll_employee_results'), indexes: [{ unique: true, fields: ['school_id', 'period_id', 'employee_id'] }] });
  const PayrollResultItem = sequelize.define('PayrollResultItem', { ...scope, resultId: { type: D.INTEGER.UNSIGNED, allowNull: false }, code: { type: D.STRING(60), allowNull: false }, label: { type: D.STRING(120), allowNull: false }, amount: { type: D.DECIMAL(16, 2), allowNull: false }, kind: { type: D.STRING(20), allowNull: false } }, opts('payroll_result_items'));
  const PayrollPaymentBatch = sequelize.define('PayrollPaymentBatch', {
    ...scope,
    periodId,
    status: { type: D.ENUM('draft', 'approved', 'generated', 'sent', 'paid'), allowNull: false, defaultValue: 'draft' },
    workerCount: { type: D.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: 'worker_count' },
    netTotal: { type: D.DECIMAL(16, 2), allowNull: false, defaultValue: 0, field: 'net_total' },
    grossTotal: { type: D.DECIMAL(16, 2), allowNull: false, defaultValue: 0, field: 'gross_total' },
    paidAt: { type: D.DATEONLY, field: 'paid_at' },
    fileName: { type: D.STRING(180), field: 'file_name' },
    fileGeneratedAt: { type: D.DATE, field: 'file_generated_at' },
    notes: D.STRING(500),
    createdBy: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'created_by' },
    approvedBy: { type: D.INTEGER.UNSIGNED, field: 'approved_by' },
    approvedAt: { type: D.DATE, field: 'approved_at' },
    sentAt: { type: D.DATE, field: 'sent_at' },
    snapshot: json,
  }, { ...opts('payroll_payment_batches'), indexes: [{ unique: true, fields: ['school_id', 'period_id'] }] });
  const PayrollPaymentLine = sequelize.define('PayrollPaymentLine', {
    ...scope,
    batchId: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'batch_id' },
    employeeId: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'employee_id' },
    resultId: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'result_id' },
    employeeName: { type: D.STRING(120), allowNull: false, field: 'employee_name' },
    amount: { type: D.DECIMAL(16, 2), allowNull: false },
    bank: D.STRING(80),
    accountType: { type: D.STRING(20), field: 'account_type' },
    accountNumberEncrypted: { type: D.TEXT, field: 'account_number_encrypted' },
    holderRut: { type: D.STRING(20), field: 'holder_rut' },
    email: D.STRING(150),
    paymentMethod: { type: D.STRING(20), allowNull: false, defaultValue: 'transferencia', field: 'payment_method' },
    status: { type: D.ENUM('pending', 'included', 'paid', 'skipped'), allowNull: false, defaultValue: 'included' },
  }, { ...opts('payroll_payment_lines'), indexes: [{ unique: true, fields: ['batch_id', 'employee_id'] }] });
  for (const model of [PayrollParameter, PayrollAfpRate, PayrollTaxBracket, PayrollConcept, PayrollRun, PayrollEmployeeResult, PayrollPaymentBatch]) model.belongsTo(PayrollPeriod, { foreignKey: 'periodId', onDelete: 'RESTRICT' });
  PayrollEmployeeResult.belongsTo(PayrollRun, { foreignKey: 'runId', onDelete: 'RESTRICT' });
  PayrollResultItem.belongsTo(PayrollEmployeeResult, { foreignKey: 'resultId', onDelete: 'RESTRICT' });
  PayrollPaymentLine.belongsTo(PayrollPaymentBatch, { foreignKey: 'batchId', onDelete: 'CASCADE' });
  PayrollPaymentBatch.hasMany(PayrollPaymentLine, { foreignKey: 'batchId', as: 'lines' });
  const immutable = () => { throw new Error('Las liquidaciones históricas son inmutables.'); };
  for (const model of [PayrollRun, PayrollEmployeeResult, PayrollResultItem]) {
    for (const hook of ['beforeUpdate', 'beforeBulkUpdate', 'beforeDestroy', 'beforeBulkDestroy']) model.addHook(hook, immutable);
  }
  return {
    PayrollPeriod, PayrollParameter, PayrollAfpRate, PayrollTaxBracket, PayrollConcept,
    PayrollRun, PayrollEmployeeResult, PayrollResultItem, PayrollPaymentBatch, PayrollPaymentLine,
  };
}
