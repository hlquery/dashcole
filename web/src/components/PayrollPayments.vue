<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { request, download } from '../api/client.js';
import { formatCurrency, formatDate } from '../design/format.js';
import { useClientPagination } from '../composables/pagination.js';
import { useNotify } from '../composables/notify.js';
import { TablePagination } from './ui/index.js';

const notify = useNotify();
const rows = ref([]);
const periods = ref([]);
const selected = ref(null);
const period = ref(new Date().toISOString().slice(0, 7));
const busy = ref(false);
const panel = ref('lotes');
const methodFilter = ref('all');
const periodConfig = ref(null);
const periodLocked = ref(false);
const periodMissing = ref(false);
const configBusy = ref(false);

const methodOptions = [
  { id: 'all', label: 'Todos los métodos' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'efectivo', label: 'Efectivo' },
];

const configForm = reactive({
  uf: 0,
  utm: 0,
  salaryDays: 30,
  source: '',
  afpRates: [],
});

const methodSummary = computed(() => {
  const lines = selected.value?.lines || [];
  const base = { transferencia: 0, cheque: 0, efectivo: 0, otros: 0, count: {} };
  for (const line of lines) {
    const key = ['transferencia', 'cheque', 'efectivo'].includes(line.paymentMethod) ? line.paymentMethod : 'otros';
    base[key] += Number(line.amount || 0);
    base.count[key] = (base.count[key] || 0) + 1;
  }
  return base;
});

const filteredLines = computed(() => {
  const lines = selected.value?.lines || [];
  if (methodFilter.value === 'all') return lines;
  return lines.filter(line => line.paymentMethod === methodFilter.value);
});

const {
  page: batchesPage,
  pageCount: batchesPageCount,
  paged: pagedRows,
  rangeLabel: batchesRangeLabel,
  show: showBatchesPagination,
  goPrev: batchesGoPrev,
  goNext: batchesGoNext,
} = useClientPagination(rows, { pageSize: 15 });

const {
  page: linesPage,
  pageCount: linesPageCount,
  paged: pagedLines,
  rangeLabel: linesRangeLabel,
  show: showLinesPagination,
  goPrev: linesGoPrev,
  goNext: linesGoNext,
} = useClientPagination(filteredLines, {
  pageSize: 15,
  resetOn: [methodFilter, () => selected.value?.id],
});

function applyConfig(data) {
  periodConfig.value = data;
  periodLocked.value = Boolean(data?.locked);
  periodMissing.value = false;
  configForm.uf = Number(data.parameters?.uf || 0);
  configForm.utm = Number(data.parameters?.utm || 0);
  configForm.salaryDays = Number(data.parameters?.salaryDays || 30);
  configForm.source = String(data.parameters?.source || '');
  configForm.afpRates = (data.afpRates || []).map((row) => ({
    name: row.name,
    commission: Number(row.commission || 0),
  }));
}

function clearConfig() {
  periodConfig.value = null;
  periodLocked.value = false;
  periodMissing.value = true;
  configForm.uf = 0;
  configForm.utm = 0;
  configForm.salaryDays = 30;
  configForm.source = '';
  configForm.afpRates = [];
}

async function loadPeriodConfig() {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period.value)) return;
  configBusy.value = true;
  try {
    const data = await request(`/payroll/periods/${period.value}`);
    applyConfig(data);
  } catch (err) {
    clearConfig();
    if (err.status !== 404) notify(err.message || 'No se pudo cargar el período.', 'error');
  } finally {
    configBusy.value = false;
  }
}

async function load() {
  try {
    const [payments, periodRows] = await Promise.all([
      request('/payroll/payments'),
      request('/payroll/periods'),
    ]);
    rows.value = payments;
    periods.value = periodRows;
  } catch (err) {
    notify(err.message || 'No se pudo cargar pagos.', 'error');
  }
}

async function perform(work) {
  if (busy.value) return;
  busy.value = true;
  try { await work(); }
  catch (err) {
    const message = err.message || 'No se pudo completar la acción.';
    notify(message, 'error');
    if (err.status === 404 && /parámetros del período|Crear período/i.test(message)) {
      panel.value = 'parametros';
      loadPeriodConfig();
    }
  }
  finally { busy.value = false; }
}

function createPayment() {
  return perform(async () => {
    const batch = await request('/payroll/payments', { method: 'POST', body: JSON.stringify({ period: period.value }) });
    notify(`Lote ${period.value} creado para revisión.`);
    panel.value = 'lotes';
    await load();
    await openBatch(batch.id);
  });
}

async function openBatch(id) {
  try {
    selected.value = await request(`/payroll/payments/${id}`);
    panel.value = 'lotes';
  } catch (err) {
    notify(err.message || 'No se pudo abrir el lote.', 'error');
  }
}

function approve() {
  return perform(async () => {
    selected.value = await request(`/payroll/payments/${selected.value.id}/approve`, { method: 'POST', body: '{}' });
    notify('Lote aprobado.');
    await load();
  });
}

function generateFile() {
  return perform(async () => {
    selected.value = await request(`/payroll/payments/${selected.value.id}/generate`, { method: 'POST', body: JSON.stringify({ paidAt: selected.value.paidAt || new Date().toISOString().slice(0, 10) }) });
    notify('Archivo bancario generado.');
    await load();
  });
}

function downloadFile() {
  return perform(async () => {
    const response = await download(`/payroll/payments/${selected.value.id}/file`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'No fue posible descargar el archivo.');
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = selected.value.fileName || `nomina-${selected.value.period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('Archivo descargado.');
  });
}

function setStatus(status) {
  return perform(async () => {
    selected.value = await request(`/payroll/payments/${selected.value.id}/status`, { method: 'POST', body: JSON.stringify({ status }) });
    notify(status === 'sent' ? 'Marcado como enviado al banco.' : status === 'paid' ? 'Marcado como pagado.' : 'Estado actualizado.');
    await load();
  });
}

function exportPrevired() {
  return perform(async () => {
    const validation = await request(`/payroll/periods/${period.value}/previred?validate=true`);
    if (!validation.valid) {
      notify(validation.errors.map(item => `Empleado #${item.employeeId}: ${item.missing.join(', ')}`).join(' · '), 'error');
      return;
    }
    const response = await download(`/payroll/periods/${period.value}/previred`);
    if (!response.ok) throw new Error('No fue posible descargar Previred.');
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = `previred-${period.value}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`Previred ${period.value} descargado.`);
  });
}

async function bootstrapPeriod() {
  if (configBusy.value) return;
  configBusy.value = true;
  try {
    const data = await request(`/payroll/periods/${period.value}/bootstrap`, { method: 'POST', body: '{}' });
    applyConfig(data);
    await load();
    notify(data.source === 'defaults'
      ? `Período ${period.value} creado con valores base. Revisa UF y UTM antes de liquidar.`
      : `Período ${period.value} creado copiando ${data.source}. Revisa UF y UTM.`);
  } catch (err) {
    notify(err.message || 'No se pudo crear el período.', 'error');
  } finally {
    configBusy.value = false;
  }
}

async function savePeriodConfig() {
  if (!periodConfig.value || periodLocked.value || configBusy.value) return;
  configBusy.value = true;
  try {
    const payload = {
      parameters: {
        ...periodConfig.value.parameters,
        uf: Number(configForm.uf),
        utm: Number(configForm.utm),
        salaryDays: Number(configForm.salaryDays),
        source: String(configForm.source || '').trim(),
      },
      afpRates: configForm.afpRates.map((row) => ({
        name: row.name,
        commission: Number(row.commission),
      })),
      taxBrackets: (periodConfig.value.taxBrackets || []).map(({ lowerUtm, upperUtm, factor, deductionUtm }) => ({
        lowerUtm: Number(lowerUtm),
        upperUtm: upperUtm === null || upperUtm === undefined || upperUtm === '' ? null : Number(upperUtm),
        factor: Number(factor),
        deductionUtm: Number(deductionUtm),
      })),
      concepts: (periodConfig.value.concepts || []).map(({ code, label, taxable, pensionable }) => ({
        code,
        label,
        taxable: taxable === true || taxable === 1 || taxable === '1',
        pensionable: pensionable === true || pensionable === 1 || pensionable === '1',
      })),
    };
    await request(`/payroll/periods/${period.value}`, { method: 'PUT', body: JSON.stringify(payload) });
    await loadPeriodConfig();
    await load();
    notify(`Parámetros de ${period.value} guardados.`);
  } catch (err) {
    notify(err.message || 'No se pudieron guardar los parámetros.', 'error');
  } finally {
    configBusy.value = false;
  }
}

watch(period, () => {
  if (panel.value === 'parametros') loadPeriodConfig();
});

watch(panel, (value) => {
  if (value === 'parametros') loadPeriodConfig();
});

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('panel') === 'previred') panel.value = 'previred';
  if (params.get('panel') === 'metodos') panel.value = 'metodos';
  if (params.get('panel') === 'parametros') panel.value = 'parametros';
  load();
  if (panel.value === 'parametros') loadPeriodConfig();
});
</script>

<template>
  <section class="payroll-payments">
    <header class="section-heading">
      <div>
        <h2>Archivos y Pagos</h2>
        <p>Primero configura el período (UF, UTM, AFP). Luego calcula liquidaciones en Empleados activos y genera el lote aquí.</p>
      </div>
    </header>

    <datalist id="payroll-periods"><option v-for="item in periods" :key="item.id" :value="item.period" /></datalist>

    <div class="billing-tabs">
      <button type="button" :class="{ active: panel === 'parametros' }" @click="panel = 'parametros'">Parámetros del período</button>
      <button type="button" :class="{ active: panel === 'lotes' }" @click="panel = 'lotes'">Lotes y archivo bancario</button>
      <button type="button" :class="{ active: panel === 'metodos' }" @click="panel = 'metodos'">Métodos por plataforma</button>
      <button type="button" :class="{ active: panel === 'previred' }" @click="panel = 'previred'">Previred</button>
    </div>

    <article v-if="panel === 'parametros'" class="panel payment-detail">
      <div class="section-title">
        <div>
          <h3>Parámetros del período</h3>
          <p>Sin estos datos no se pueden calcular liquidaciones ni generar lotes de pago.</p>
        </div>
      </div>
      <div class="payment-create">
        <label class="field"><span>Período</span><input v-model="period" type="month" required list="payroll-periods" /></label>
        <button type="button" class="secondary-button" :disabled="configBusy" @click="loadPeriodConfig">Recargar</button>
      </div>
      <ol class="period-steps">
        <li>Elige el mes y crea el período (copia el mes anterior o carga valores base de Chile).</li>
        <li>Revisa UF, UTM y comisiones AFP oficiales del mes.</li>
        <li>En Empleados activos, calcula y guarda la liquidación de cada trabajador.</li>
        <li>Vuelve aquí y genera el lote de pago.</li>
      </ol>
      <div v-if="configBusy && !periodConfig" class="empty-note">Cargando período…</div>
      <template v-else-if="periodMissing">
        <p class="empty-note">Este mes aún no está configurado.</p>
        <button type="button" class="primary-button" :disabled="configBusy" @click="bootstrapPeriod">Crear período</button>
        <p class="empty-note">Si ya configuraste un mes anterior, se copia automáticamente. Si no, se cargan valores base para que los ajustes.</p>
      </template>
      <form v-else-if="periodConfig" class="period-config-form" @submit.prevent="savePeriodConfig">
        <p v-if="periodLocked" class="empty-note">Este período ya tiene liquidaciones guardadas: los parámetros están cerrados.</p>
        <div class="form-grid">
          <label class="field"><span>UF del mes</span><input v-model.number="configForm.uf" type="number" min="0" step="0.01" required :disabled="periodLocked" /></label>
          <label class="field"><span>UTM del mes</span><input v-model.number="configForm.utm" type="number" min="0" step="0.01" required :disabled="periodLocked" /></label>
          <label class="field"><span>Días base</span><input v-model.number="configForm.salaryDays" type="number" min="1" max="31" required :disabled="periodLocked" /></label>
          <label class="field wide"><span>Fuente / vigencia</span><input v-model.trim="configForm.source" maxlength="2000" required :disabled="periodLocked" placeholder="Ej. Valores SII / SP vigentes para el mes" /></label>
        </div>
        <h4>Comisiones AFP</h4>
        <div class="form-grid">
          <label v-for="row in configForm.afpRates" :key="row.name" class="field">
            <span>{{ row.name }}</span>
            <input v-model.number="row.commission" type="number" min="0" max="1" step="0.0001" required :disabled="periodLocked" />
          </label>
        </div>
        <p class="empty-note">Tabla de impuesto: {{ periodConfig.taxBrackets?.length || 0 }} tramos · Conceptos extra: {{ periodConfig.concepts?.length || 0 }}</p>
        <div class="payment-actions">
          <button class="primary-button" :disabled="configBusy || periodLocked">{{ configBusy ? 'Guardando…' : 'Guardar parámetros' }}</button>
        </div>
      </form>
    </article>

    <template v-else-if="panel === 'lotes'">
      <form class="panel payment-create" @submit.prevent="createPayment">
        <label class="field"><span>Período a pagar</span><input v-model="period" type="month" required list="payroll-periods" /></label>
        <button class="primary-button" :disabled="busy">Generar lote de pago</button>
        <button type="button" class="secondary-button" @click="panel = 'parametros'">Configurar período</button>
      </form>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Trabajadores</th>
              <th>Líquido a pagar</th>
              <th>Total nómina</th>
              <th>Banco destino</th>
              <th>Estado</th>
              <th>Fecha pago</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagedRows" :key="row.id" class="clickable-row" @click="openBatch(row.id)">
              <td>{{ row.period }}</td>
              <td>{{ row.workerCount }}</td>
              <td>{{ formatCurrency(row.netTotal) }}</td>
              <td>{{ formatCurrency(row.grossTotal) }}</td>
              <td>{{ row.destinationBank || row.destinationBanks?.join(', ') || '—' }}</td>
              <td><span class="status-pill">{{ row.statusLabel }}</span></td>
              <td>{{ row.paidAt ? formatDate(row.paidAt) : '—' }}</td>
              <td><button class="edit-button" type="button" @click.stop="openBatch(row.id)">Abrir</button></td>
            </tr>
          </tbody>
        </table>
        <TablePagination
          v-model:page="batchesPage"
          :page-count="batchesPageCount"
          :range-label="batchesRangeLabel"
          :show="showBatchesPagination"
        />
        <p v-if="!rows.length" class="empty-note">Aún no hay lotes de pago. Configura el período, calcula liquidaciones del mes y genera el lote aquí.</p>
      </div>

      <article v-if="selected" class="panel payment-detail">
        <div class="section-title">
          <div>
            <h3>Pago {{ selected.period }}</h3>
            <p>{{ selected.workerCount }} trabajadores · {{ selected.statusLabel }} · líquido {{ formatCurrency(selected.netTotal) }}</p>
          </div>
          <button type="button" class="edit-button" @click="selected = null">Cerrar</button>
        </div>
        <div class="payment-actions">
          <button v-if="selected.status === 'draft'" class="primary-button" :disabled="busy" @click="approve">Aprobar</button>
          <button v-if="['approved','generated'].includes(selected.status)" class="primary-button" :disabled="busy" @click="generateFile">{{ selected.status === 'generated' ? 'Regenerar archivo' : 'Generar archivo bancario' }}</button>
          <button v-if="['generated','sent','paid'].includes(selected.status)" class="secondary-button" :disabled="busy" @click="downloadFile">Descargar archivo</button>
          <button v-if="selected.status === 'generated'" class="secondary-button" :disabled="busy" @click="setStatus('sent')">Marcar enviado</button>
          <button v-if="selected.status === 'sent'" class="primary-button" :disabled="busy" @click="setStatus('paid')">Marcar pagado</button>
        </div>
        <p v-if="selected.schoolBanking" class="origin-bank">Origen · {{ selected.schoolBanking.companyName || 'Empresa' }} · {{ selected.schoolBanking.originBank || 'Sin banco' }} · {{ selected.schoolBanking.originAccountNumberMasked || 'Sin cuenta' }}</p>
        <div class="method-chips">
          <button v-for="item in methodOptions" :key="item.id" type="button" :class="{ active: methodFilter === item.id }" @click="methodFilter = item.id">{{ item.label }}</button>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Trabajador</th><th>RUT</th><th>Banco</th><th>Cuenta</th><th>Método</th><th>Líquido</th></tr></thead>
            <tbody>
              <tr v-for="line in pagedLines" :key="line.id">
                <td>{{ line.employeeName }}</td>
                <td>{{ line.holderRut || '—' }}</td>
                <td>{{ line.bank || '—' }} · {{ line.accountType || '—' }}</td>
                <td>{{ line.accountNumberMasked || '—' }}</td>
                <td>{{ line.paymentMethod }}</td>
                <td>{{ formatCurrency(line.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <TablePagination
          v-model:page="linesPage"
          :page-count="linesPageCount"
          :range-label="linesRangeLabel"
          :show="showLinesPagination"
        />
      </article>
    </template>

    <article v-else-if="panel === 'metodos'" class="panel payment-detail">
      <div class="section-title">
        <div>
          <h3>Métodos por plataforma de pago</h3>
          <p>Resumen del lote abierto o del último seleccionado, agrupado por transferencia, cheque y efectivo.</p>
        </div>
      </div>
      <p v-if="!selected" class="empty-note">Abre un lote en “Lotes y archivo bancario” para ver el desglose por método.</p>
      <template v-else>
        <div class="overview-grid">
          <article class="panel"><strong>{{ formatCurrency(methodSummary.transferencia) }}</strong><span>Transferencia · {{ methodSummary.count.transferencia || 0 }}</span></article>
          <article class="panel"><strong>{{ formatCurrency(methodSummary.cheque) }}</strong><span>Cheque · {{ methodSummary.count.cheque || 0 }}</span></article>
          <article class="panel"><strong>{{ formatCurrency(methodSummary.efectivo) }}</strong><span>Efectivo · {{ methodSummary.count.efectivo || 0 }}</span></article>
        </div>
        <div class="payment-actions">
          <button class="primary-button" :disabled="busy || !['approved','generated'].includes(selected.status)" @click="generateFile">Archivo para transferencias</button>
          <button class="secondary-button" :disabled="busy || !['generated','sent','paid'].includes(selected.status)" @click="downloadFile">Descargar CSV bancario</button>
          <button class="edit-button" type="button" @click="panel = 'lotes'">Volver al lote</button>
        </div>
        <p class="empty-note">Transferencias usan el archivo bancario. Cheque y efectivo se marcan en el lote al pagar; no van al CSV de banca electrónica.</p>
      </template>
    </article>

    <article v-else class="panel payment-detail">
      <div class="section-title">
        <div>
          <h3>Previred</h3>
          <p>Exporta el archivo del período con las liquidaciones ya calculadas.</p>
        </div>
      </div>
      <form class="payment-create" @submit.prevent="exportPrevired">
        <label class="field"><span>Período</span><input v-model="period" type="month" required list="payroll-periods" /></label>
        <button class="primary-button" :disabled="busy">Validar y descargar Previred</button>
      </form>
    </article>
  </section>
</template>

<style scoped>
.payroll-payments { display: grid; gap: 18px; }
.billing-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.billing-tabs button, .method-chips button { border: 1px solid #d7e0e8; background: #fff; border-radius: 10px; padding: 8px 12px; font-weight: 700; cursor: pointer; }
.billing-tabs button.active, .method-chips button.active { background: #eef4f8; border-color: #9eb7cc; }
.method-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.payment-create { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; padding: 18px; }
.payment-create .field { margin: 0; min-width: 180px; }
.payment-detail { padding: 22px; display: grid; gap: 14px; }
.section-title, .payment-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; }
.payment-actions { justify-content: flex-start; }
.origin-bank, .empty-note { color: #607184; font-size: 13px; }
.status-pill { display: inline-flex; padding: 4px 8px; border-radius: 999px; background: #eef4f8; font-size: 11px; font-weight: 700; }
.overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.overview-grid article { padding: 14px; display: grid; gap: 4px; }
.overview-grid strong { font-size: 18px; }
.overview-grid span { color: #607184; font-size: 12px; }
.period-steps { margin: 0; padding-left: 18px; color: #405060; font-size: 13px; display: grid; gap: 6px; }
.period-config-form { display: grid; gap: 14px; }
.period-config-form h4 { margin: 0; font-size: 14px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 8px; border-bottom: 1px solid #e8edf2; text-align: left; font-size: 13px; }
</style>
