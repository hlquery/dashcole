<script setup>
import { ref, reactive, watch, computed } from 'vue';
import { request, download } from '../api/client.js';
import { formatCurrency, formatDate } from '../design/format.js';
import { useNotify } from '../composables/notify.js';
import { TablePagination } from './ui/index.js';
const notify = useNotify();
const props = defineProps({ employeeId: { type:Number, required:true } });
const employee = ref(null), history = ref([]), total = ref(0), page = ref(1), result = ref(null), busy = ref(false);
const payrollPageCount = computed(() => Math.max(1, Math.ceil(total.value / 10)));
const now = new Date();
const periodYear = ref(now.getFullYear());
const periodMonth = ref(String(now.getMonth() + 1).padStart(2, '0'));
const period = computed({
  get: () => `${periodYear.value}-${periodMonth.value}`,
  set: (value) => {
    const match = String(value || '').match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
    if (!match) return;
    periodYear.value = Number(match[1]);
    periodMonth.value = match[2];
  },
});
const periodYears = Array.from({ length: 12 }, (_, index) => now.getFullYear() - 5 + index);
const periodMonths = [
  ['01', 'Enero'], ['02', 'Febrero'], ['03', 'Marzo'], ['04', 'Abril'], ['05', 'Mayo'], ['06', 'Junio'],
  ['07', 'Julio'], ['08', 'Agosto'], ['09', 'Septiembre'], ['10', 'Octubre'], ['11', 'Noviembre'], ['12', 'Diciembre'],
];
const concepts = ref([]);
const chileAfps = ['Capital', 'Cuprum', 'Habitat', 'Modelo', 'PlanVital', 'Provida', 'Uno'];
const banking = reactive({ bank: '', accountType: '', accountNumber: '', accountNumberMasked: '', holderRut: '', email: '', paymentMethod: 'transferencia' });
const banks = ['Banco de Chile', 'Banco Estado', 'BCI', 'Banco Santander', 'Scotiabank', 'Itaú', 'Banco Security', 'Banco Falabella', 'Banco Ripley', 'Banco Consorcio', 'BICE', 'Banco Internacional', 'Otro'];
/** Códigos Previred Tabla N°16 — Isapres de Chile. */
const chileIsapres = [
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
const amounts = [['taxableBonus','Bonos imponibles'],['nonTaxableBonus','Bonos no imponibles'],['viaticos','Viáticos'],['overtimeAmount','Horas extra · monto CLP'],['commissions','Comisiones'],['otherTaxable','Otros imponibles'],['deductions','Descuentos'],['advances','Anticipos'],['apv','APV']];
const contracts = ['Indefinido','Plazo fijo','Reemplazo'];
async function load() {
  try {
    const data = await request(`/payroll/employees/${props.employeeId}?page=${page.value}`);
    employee.value = data.employee; history.value = data.results; total.value = data.total;
    employee.value.payrollProfile = { afp:'', healthSystem:'Fonasa', isapreUnit:'UF', isaprePlan:0, apvRegime:'A', conceptAmounts:[], ...Object.fromEntries(amounts.map(([key]) => [key,0])), ...employee.value.payrollProfile };
    if (employee.value.payrollProfile.healthSystem === 'Isapre') employee.value.payrollProfile.isapreUnit = 'UF';
    employee.value.payrollProfile.previred = { rut:'',paternalSurname:'',maternalSurname:'',givenNames:'',sex:'',nationality:'0',workdayType:'1',healthInstitutionCode:'',funNumber:'', ...employee.value.payrollProfile.previred };
    Object.assign(banking, {
      bank: data.employee.banking?.bank || '',
      accountType: data.employee.banking?.accountType || '',
      accountNumber: '',
      accountNumberMasked: data.employee.banking?.accountNumberMasked || '',
      holderRut: data.employee.banking?.holderRut || '',
      email: data.employee.banking?.email || '',
      paymentMethod: data.employee.banking?.paymentMethod || 'transferencia',
    });
  } catch (err) { notify(err.message || 'No se pudo cargar la remuneración.', 'error'); }
}
async function loadConfig() {
  concepts.value = []; result.value = null;
  try {
    const data = await request(`/payroll/periods/${period.value}`);
    concepts.value = data.concepts;
  } catch (err) {
    if (err.status !== 404) notify(err.message || 'No se pudo cargar el período.', 'error');
  }
}
async function perform(work) {
  if (busy.value) return;
  busy.value = true;
  try { await work(); } catch (err) { notify(err.message || 'No se pudo completar la acción.', 'error'); } finally { busy.value = false; }
}
async function applyEmployeeUpdate(payload) {
  const data = await request(`/payroll/employees/${props.employeeId}`, { method: 'PUT', body: JSON.stringify(payload) });
  employee.value = {
    ...employee.value,
    ...data.employee,
    payrollProfile: {
      ...employee.value.payrollProfile,
      ...(data.employee.payrollProfile || {}),
      previred: {
        ...employee.value.payrollProfile?.previred,
        ...(data.employee.payrollProfile?.previred || {}),
      },
    },
  };
  if (data.employee.banking) {
    Object.assign(banking, {
      bank: data.employee.banking.bank || '',
      accountType: data.employee.banking.accountType || '',
      accountNumber: '',
      accountNumberMasked: data.employee.banking.accountNumberMasked || '',
      holderRut: data.employee.banking.holderRut || '',
      email: data.employee.banking.email || '',
      paymentMethod: data.employee.banking.paymentMethod || 'transferencia',
    });
  }
  return data;
}
async function saveProfile() {
  if (employee.value?.payrollProfile) employee.value.payrollProfile.isapreUnit = 'UF';
  await applyEmployeeUpdate({
    monthlySalary: employee.value.monthlySalary,
    hiredOn: employee.value.hiredOn,
    endedOn: employee.value.endedOn || null,
    contractType: employee.value.contractType,
    payrollProfile: employee.value.payrollProfile,
  });
}
async function saveBanking() {
  await applyEmployeeUpdate({
    monthlySalary: employee.value.monthlySalary,
    hiredOn: employee.value.hiredOn,
    endedOn: employee.value.endedOn || null,
    contractType: employee.value.contractType,
    payrollProfile: employee.value.payrollProfile,
    banking: {
      bank: banking.bank,
      accountType: banking.accountType,
      holderRut: banking.holderRut,
      email: banking.email,
      paymentMethod: banking.paymentMethod || 'transferencia',
      ...(banking.accountNumber ? { accountNumber: banking.accountNumber } : {}),
    },
  });
}
function calculate(save = false) {
  return perform(async () => {
    await saveProfile();
    if (!employee.value.active && save) {
      notify('Reintegra al trabajador para guardar liquidaciones históricas.', 'error');
      return;
    }
    result.value = await request(`/payroll/employees/${props.employeeId}/calculate`,{method:'POST',body:JSON.stringify({ period:period.value, save })});
    if (save) { notify('Liquidación histórica guardada.'); await load(); }
  });
}
function onHealthSystemChange() {
  if (!employee.value?.payrollProfile) return;
  if (employee.value.payrollProfile.healthSystem === 'Fonasa') {
    employee.value.payrollProfile.isaprePlan = 0;
    employee.value.payrollProfile.isapreUnit = 'UF';
    employee.value.payrollProfile.previred.healthInstitutionCode = '07';
    employee.value.payrollProfile.previred.funNumber = '';
  } else {
    employee.value.payrollProfile.isapreUnit = 'UF';
    if (!chileIsapres.some((row) => row.code === employee.value.payrollProfile.previred.healthInstitutionCode)) {
      employee.value.payrollProfile.previred.healthInstitutionCode = '';
    }
  }
}
function viewResult(id) { return perform(async () => { result.value = await request(`/payroll/results/${id}`); }); }
function exportPrevired() { return perform(async () => {
  const validation = await request(`/payroll/periods/${period.value}/previred?validate=true`);
  if (!validation.valid) {
    notify(validation.errors.map(item => `Empleado #${item.employeeId}: ${item.missing.join(', ')}`).join(' · '), 'error');
    return;
  }
  const response = await download(`/payroll/periods/${period.value}/previred`);
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = `previred-${period.value}.txt`; link.click();
  URL.revokeObjectURL(url);
  notify(`Previred ${period.value} descargado.`);
}); }
watch(() => props.employeeId, () => { page.value = 1; result.value = null; load(); loadConfig(); },{immediate:true});
watch(period, loadConfig);
watch(page, load);
</script>
<template>
  <section class="payroll-panel">
    <h3>Remuneración mensual</h3>
    <div class="form-grid">
      <label class="field">
        <span>Mes</span>
        <div class="payroll-period-pickers">
          <select v-model.number="periodYear" aria-label="Año del mes" required>
            <option v-for="year in periodYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="periodMonth" aria-label="Mes" required>
            <option v-for="[value, label] in periodMonths" :key="value" :value="value">{{ label }}</option>
          </select>
        </div>
        <small class="field-help">Mes de la liquidación.</small>
      </label>
    </div>
    <form v-if="employee" @submit.prevent="calculate(false)">
      <fieldset :disabled="busy"><div class="form-grid">
        <label class="field"><span>Sueldo base CLP</span><input v-model.number="employee.monthlySalary" type="number" min="0" step="1" required /></label>
        <label class="field"><span>AFP</span><select v-model="employee.payrollProfile.afp" required><option value="" disabled>Selecciona AFP</option><option v-for="afp in chileAfps" :key="afp" :value="afp">{{ afp }}</option></select></label>
        <label class="field"><span>Contrato</span><select v-model="employee.contractType"><option v-for="contract in [...contracts,'Honorarios']" :key="contract">{{ contract }}</option></select></label>
        <label class="field"><span>Desde</span><input v-model="employee.hiredOn" type="date" required /><small class="field-help">Inicio de vigencia para prorratear el mes.</small></label>
        <label class="field"><span>Hasta</span><input v-model="employee.endedOn" type="date" /><span v-if="!employee.endedOn" class="status-pill payroll-ended-pill"><i></i>Actualmente empleado</span><small v-else class="field-help">Vigente hasta {{ formatDate(employee.endedOn) }}.</small></label>
        <label class="field"><span>Salud</span><select v-model="employee.payrollProfile.healthSystem" @change="onHealthSystemChange"><option>Fonasa</option><option>Isapre</option></select></label>
        <template v-if="employee.payrollProfile.healthSystem === 'Isapre'">
          <label class="field"><span>Isapre</span>
            <select v-model="employee.payrollProfile.previred.healthInstitutionCode" required>
              <option value="" disabled>Selecciona Isapre</option>
              <option v-for="isapre in chileIsapres" :key="isapre.code" :value="isapre.code">{{ isapre.name }}</option>
            </select>
          </label>
          <label class="field"><span>Número FUN</span><input v-model="employee.payrollProfile.previred.funNumber" maxlength="16" required placeholder="N° contrato Isapre" /></label>
          <label class="field"><span>Plan Isapre (UF)</span><input v-model.number="employee.payrollProfile.isaprePlan" type="number" min="0" step="0.01" placeholder="Ej. 4,2" /><small class="field-help">El plan Isapre siempre se expresa en UF.</small></label>
        </template>
        <label v-for="[key,label] in amounts" :key="key" class="field"><span>{{ label }}</span><input v-model.number="employee.payrollProfile[key]" type="number" min="0" step="1" /></label>
        <label class="field"><span>Régimen APV</span><select v-model="employee.payrollProfile.apvRegime"><option value="A">A · sin rebaja mensual</option><option value="B">B · rebaja con tope mensual</option></select></label>
        <div v-for="(entry,i) in employee.payrollProfile.conceptAmounts" :key="i" class="field"><select v-model="entry.code" aria-label="Concepto"><option v-for="c in concepts" :key="c.code" :value="c.code">{{ c.label }}</option></select><input v-model.number="entry.amount" aria-label="Monto del concepto" type="number" min="0" step="1" /><button type="button" class="edit-button" @click="employee.payrollProfile.conceptAmounts.splice(i,1)">Quitar</button></div>
      </div><h4>Datos para Previred</h4><div class="form-grid">
        <label class="field"><span>RUT</span><input v-model="employee.payrollProfile.previred.rut" placeholder="12345678-9" /></label>
        <label class="field"><span>Apellido paterno</span><input v-model="employee.payrollProfile.previred.paternalSurname" /></label>
        <label class="field"><span>Apellido materno</span><input v-model="employee.payrollProfile.previred.maternalSurname" /></label>
        <label class="field"><span>Nombres</span><input v-model="employee.payrollProfile.previred.givenNames" /></label>
        <label class="field"><span>Sexo Previred</span><select v-model="employee.payrollProfile.previred.sex"><option value="" disabled>Selecciona</option><option value="M">Masculino</option><option value="F">Femenino</option></select></label>
        <label class="field"><span>Nacionalidad</span><select v-model="employee.payrollProfile.previred.nationality"><option value="0">Chilena</option><option value="1">Extranjera</option></select></label>
        <label class="field"><span>Jornada</span><select v-model="employee.payrollProfile.previred.workdayType"><option value="1">Completa</option><option value="2">Parcial</option></select></label>
        <label class="field"><span>Código CCAF</span><input v-model="employee.payrollProfile.previred.ccafCode" maxlength="2" placeholder="00" /></label>
        <label class="field"><span>Código mutualidad</span><input v-model="employee.payrollProfile.previred.mutualCode" maxlength="2" placeholder="00 = ISL" /></label>
        <label class="field"><span>Sucursal mutual</span><input v-model="employee.payrollProfile.previred.mutualBranch" maxlength="3" placeholder="000" /></label>
        <label class="field"><span>Centro de costo</span><input v-model="employee.payrollProfile.previred.costCenter" maxlength="20" /></label>
      </div>
      <button v-if="concepts.length" type="button" class="secondary-button" @click="employee.payrollProfile.conceptAmounts.push({code:concepts[0].code,amount:0})">Agregar haber</button></fieldset>
      <p v-if="!employee.active" class="field-help">Este trabajador está en el historial: puedes corregir los datos y luego reintegrarlo desde la ficha.</p>
      <p>Los días del mes se calculan solos con <strong>Desde</strong> y <strong>Hasta</strong>. Las horas extra se ingresan como monto ya valorizado.</p>
      <div class="modal-actions"><button type="button" class="secondary-button" :disabled="busy" @click="perform(async () => { await saveProfile(); notify(employee.active ? 'Datos guardados.' : 'Datos del historial actualizados.'); })">Guardar datos</button><button class="primary-button" :disabled="busy || !employee.active">Calcular sueldo</button></div>
    </form>
    <form v-if="employee" class="payroll-banking" @submit.prevent="perform(async () => { await saveBanking(); notify('Datos bancarios guardados.'); })">
      <h4>Datos bancarios para pago <small>Opcional</small></h4>
      <p>{{ employee.active ? 'No son obligatorios al crear al trabajador. Puedes completarlos o cambiarlos cuando quieras en esta ficha.' : 'Puedes actualizar la cuenta aunque el trabajador esté en el historial; al reintegrarlo quedan listos para el pago.' }}</p>
      <fieldset :disabled="busy">
        <div class="form-grid">
          <label class="field"><span>Banco</span><select v-model="banking.bank"><option value="">Sin definir</option><option v-for="bank in banks" :key="bank" :value="bank">{{ bank }}</option></select></label>
          <label class="field"><span>Tipo de cuenta</span><select v-model="banking.accountType"><option value="">Sin definir</option><option value="corriente">Corriente</option><option value="vista">Vista</option><option value="ahorro">Ahorro</option><option value="rut">CuentaRUT</option></select></label>
          <label class="field"><span>Número de cuenta</span><input v-model="banking.accountNumber" inputmode="numeric" :placeholder="banking.accountNumberMasked || 'Solo dígitos'" /><small v-if="banking.accountNumberMasked && !banking.accountNumber">Guardada: {{ banking.accountNumberMasked }}</small></label>
          <label class="field"><span>RUT titular</span><input v-model="banking.holderRut" placeholder="12345678-9" /></label>
          <label class="field"><span>Correo de pago</span><input v-model="banking.email" type="email" /></label>
          <label class="field"><span>Método de pago</span><select v-model="banking.paymentMethod"><option value="transferencia">Transferencia</option><option value="cheque">Cheque</option><option value="efectivo">Efectivo</option></select></label>
        </div>
      </fieldset>
      <div class="modal-actions"><button class="secondary-button" :disabled="busy">Guardar datos bancarios</button></div>
    </form>
    <article v-if="result" class="payroll-breakdown panel"><h3>{{ result.preview ? 'Vista previa' : 'Liquidación histórica' }} · {{ result.snapshot?.period || period }}</h3>
      <p v-if="result.totals?.daysWorked" class="payroll-days-note">Días remunerados calculados: {{ result.totals.daysWorked }}</p>
      <dl><div v-for="item in result.items.filter(i => i.kind !== 'employer' && Number(i.amount))" :key="item.code"><dt>{{ item.label }}</dt><dd>{{ item.kind === 'deduction' ? '−' : '' }}{{ formatCurrency(item.amount) }}</dd></div><div><dt>Total imponible</dt><dd>{{ formatCurrency(result.totals.total_imponible) }}</dd></div><div><dt>Total no imponible</dt><dd>{{ formatCurrency(result.totals.total_no_imponible) }}</dd></div><div><dt>Renta tributable</dt><dd>{{ formatCurrency(result.totals.renta_tributable) }}</dd></div><div class="payroll-net"><dt>LÍQUIDO A PAGAR</dt><dd>{{ formatCurrency(result.totals.sueldo_liquido) }}</dd></div><div><dt>Costo empresa</dt><dd>{{ formatCurrency(result.totals.costo_empresa) }}</dd></div></dl>
      <details><summary>Aportes del empleador</summary><dl><div v-for="item in result.items.filter(i => i.kind === 'employer')" :key="item.code"><dt>{{ item.label }}</dt><dd>{{ formatCurrency(item.amount) }}</dd></div></dl></details>
      <button v-if="result.preview" class="primary-button" :disabled="busy" @click="calculate(true)">Guardar liquidación histórica</button>
    </article>
    <h4>Liquidaciones guardadas</h4><p v-if="!history.length">Todavía no hay liquidaciones.</p><button v-for="entry in history" :key="entry.id" class="secondary-button" @click="viewResult(entry.id)">{{ entry.snapshot.period }} · {{ formatCurrency(entry.totals.sueldo_liquido) }}</button><button v-if="history.length" class="secondary-button" :disabled="busy" @click="exportPrevired">Exportar Previred TXT</button>
    <TablePagination
      v-model:page="page"
      :page-count="payrollPageCount"
      :show="total > 10"
    />
  </section>
</template>
<style scoped>
.payroll-panel { margin-top:24px; border-top:1px solid #dce4ee; padding-top:20px; }
fieldset { border:0; padding:0; margin:16px 0; min-width:0; }
.payroll-breakdown { padding:20px; margin:16px 0; }
.payroll-period-pickers { display:grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); gap:8px; }
.payroll-period-pickers select { width:100%; border:0; border-radius:9px; padding:10px 11px; outline:0; color:var(--color-text); background:#f2f3f5; font:inherit; }
.payroll-period-pickers select:focus,
.payroll-period-pickers select:focus-visible { background:#eceef1; box-shadow:none; outline:none; }
.payroll-days-note { margin:0 0 12px; color:#56677b; font-size:13px; }
.payroll-banking { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #dce4ee; }
.payroll-banking h4 small { margin-left: 8px; color: #718195; font-size: 12px; font-weight: 600; }
.payroll-ended-pill { margin-top: 8px; width: fit-content; }
h4 { margin:24px 0 12px; }
p { color:#56677b; margin:12px 0; line-height:1.5; }
dl > div { display:flex; justify-content:space-between; gap:16px; padding:9px 0; border-bottom:1px solid #eef1f5; } dd { font-variant-numeric:tabular-nums; font-weight:600; } .payroll-net { color:#174b89; font-size:1.15rem; font-weight:700; }
</style>
