<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { download, request } from '../api/client.js';
import { formatCurrency } from '../design/format.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({ permissions: { type: Array, default: () => [] } });
const canConfigure = computed(() => props.permissions.includes('platform.infrastructure.write'));
const canPrice = computed(() => props.permissions.includes('platform.accounts.update') || canConfigure.value);

const tab = ref('precios');
const data = ref(null);
const schoolQuery = ref('');
const error = ref('');
const message = ref('');
const busy = ref(false);
const lastResult = ref(null);
const editingPlan = ref(null);
const chargeMonths = ref(1);
const bankForm = reactive({
  bank: '',
  accountType: 'Cuenta corriente',
  accountNumber: '',
  holderName: '',
  holderRut: '',
  email: '',
  branch: '',
  transferNote: '',
  accountNumberMasked: '',
  source: null,
  configured: false,
});
const tenantsSortBy = ref('name');
const tenantsSortDir = ref('ASC');
const ordersSortBy = ref('paidAt');
const ordersSortDir = ref('DESC');
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const filteredTenants = computed(() => {
  const q = normalize(schoolQuery.value);
  const rows = data.value?.tenants || [];
  if (!q) return rows;
  return rows.filter(tenant => normalize([tenant.name, tenant.slug, tenant.id, tenant.plan?.code].join(' ')).includes(q));
});

function planCodeLabel(code) {
  return ({ demo: 'Demo', free: 'Gratis', per_student: 'Por estudiante', custom: 'Personalizado' })[code] || code || 'Sin plan';
}

const sortedTenants = computed(() => {
  const rows = [...filteredTenants.value];
  const key = tenantsSortBy.value || 'name';
  const dir = tenantsSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    if (key === 'students' || key === 'monthlyAmount') {
      const diff = (Number(a[key]) || 0) - (Number(b[key]) || 0);
      if (diff) return diff * dir;
      return String(a.name || '').localeCompare(String(b.name || ''), 'es');
    }
    if (key === 'plan') {
      const cmp = planCodeLabel(a.plan?.code).localeCompare(planCodeLabel(b.plan?.code), 'es');
      if (cmp) return cmp * dir;
      return String(a.name || '').localeCompare(String(b.name || ''), 'es');
    }
    if (key === 'oneclick') {
      const av = a.oneclick ? `****${a.oneclick.cardLast4}` : 'Sin tarjeta';
      const bv = b.oneclick ? `****${b.oneclick.cardLast4}` : 'Sin tarjeta';
      const cmp = av.localeCompare(bv, 'es');
      if (cmp) return cmp * dir;
      return String(a.name || '').localeCompare(String(b.name || ''), 'es');
    }
    return String(a.name || '').localeCompare(String(b.name || ''), 'es') * dir;
  });
  return rows;
});

const {
  page: tenantsPage,
  pageCount: tenantsPageCount,
  paged: pagedTenants,
  rangeLabel: tenantsRangeLabel,
} = useClientPagination(sortedTenants, {
  pageSize: 15,
  resetOn: [schoolQuery, tenantsSortBy, tenantsSortDir],
});

const orders = computed(() => data.value?.orders || []);
const sortedOrders = computed(() => {
  const rows = [...orders.value];
  const key = ordersSortBy.value || 'paidAt';
  const dir = ordersSortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    if (key === 'amount' || key === 'schoolId') {
      const diff = (Number(a[key]) || 0) - (Number(b[key]) || 0);
      if (diff) return diff * dir;
      return String(a.buyOrder || '').localeCompare(String(b.buyOrder || ''), 'es');
    }
    if (key === 'paidAt') {
      const av = a.paidAt || a.created_at || a.createdAt || '';
      const bv = b.paidAt || b.created_at || b.createdAt || '';
      const cmp = String(av).localeCompare(String(bv));
      if (cmp) return cmp * dir;
      return String(a.buyOrder || '').localeCompare(String(b.buyOrder || ''), 'es');
    }
    const cmp = String(a[key] || '').localeCompare(String(b[key] || ''), 'es');
    if (cmp) return cmp * dir;
    return String(a.buyOrder || '').localeCompare(String(b.buyOrder || ''), 'es');
  });
  return rows;
});

const {
  page: ordersPage,
  pageCount: ordersPageCount,
  paged: pagedOrders,
  rangeLabel: ordersRangeLabel,
} = useClientPagination(sortedOrders, {
  pageSize: 15,
  resetOn: [ordersSortBy, ordersSortDir],
});

function onTenantsSort(key) {
  if (!key) return;
  if (tenantsSortBy.value === key) {
    tenantsSortDir.value = tenantsSortDir.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    tenantsSortBy.value = key;
    tenantsSortDir.value = 'ASC';
  }
}

function onOrdersSort(key) {
  if (!key) return;
  if (ordersSortBy.value === key) {
    ordersSortDir.value = ordersSortDir.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    ordersSortBy.value = key;
    ordersSortDir.value = key === 'paidAt' ? 'DESC' : 'ASC';
  }
}

function sortThClass(activeKey, key, dir) {
  const active = activeKey === key;
  return {
    'sortable-th': true,
    active,
    asc: active && String(dir).toUpperCase() === 'ASC',
    desc: active && String(dir).toUpperCase() === 'DESC',
  };
}

function applyBank(account = {}) {
  Object.assign(bankForm, {
    bank: account.bank || '',
    accountType: account.accountType || 'Cuenta corriente',
    accountNumber: account.accountNumber || '',
    holderName: account.holderName || '',
    holderRut: account.holderRut || '',
    email: account.email || '',
    branch: account.branch || '',
    transferNote: account.transferNote || '',
    accountNumberMasked: account.accountNumberMasked || '',
    source: account.source || null,
    configured: Boolean(account.configured),
  });
}

async function load() {
  error.value = '';
  try {
    data.value = await request('/platform/billing');
    applyBank(data.value.bankAccount || {});
  } catch (cause) { error.value = cause.message; }
}

function copyText(value, label = 'Dato') {
  return perform(async () => {
    await navigator.clipboard.writeText(String(value || ''));
    message.value = `${label} copiado.`;
  });
}

function bankAccountExportText() {
  const lines = [
    'Cuenta corriente hlquery',
    'Datos para transferencia de suscripción',
    '',
    `Banco: ${bankForm.bank || '—'}`,
    `Tipo de cuenta: ${bankForm.accountType || '—'}`,
    `Número de cuenta: ${bankForm.accountNumber || '—'}`,
    `Titular: ${bankForm.holderName || '—'}`,
    `RUT: ${bankForm.holderRut || '—'}`,
    `Correo: ${bankForm.email || '—'}`,
    `Sucursal: ${bankForm.branch || '—'}`,
  ];
  if (bankForm.transferNote) {
    lines.push('', 'Nota para transferencias:', String(bankForm.transferNote));
  }
  return `${lines.join('\n')}\n`;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportBankText() {
  return perform(async () => {
    triggerBlobDownload(
      new Blob([bankAccountExportText()], { type: 'text/plain;charset=utf-8' }),
      'cuenta-corriente-hlquery.txt',
    );
    message.value = 'Cuenta corriente exportada como texto.';
  });
}

function exportBankPdf() {
  return perform(async () => {
    const response = await download('/platform/billing/bank-account/export.pdf');
    triggerBlobDownload(await response.blob(), 'cuenta-corriente-hlquery.pdf');
    message.value = 'Cuenta corriente exportada como PDF.';
  });
}

async function perform(work) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try { await work(); }
  catch (cause) { error.value = cause.message; }
  finally { busy.value = false; }
}

function saveBank(clear = false) {
  return perform(async () => {
    const body = clear
      ? { clear: true }
      : {
          bank: bankForm.bank,
          accountType: bankForm.accountType,
          accountNumber: bankForm.accountNumber,
          holderName: bankForm.holderName,
          holderRut: bankForm.holderRut,
          email: bankForm.email,
          branch: bankForm.branch,
          transferNote: bankForm.transferNote,
        };
    const saved = await request('/platform/billing/bank-account', { method: 'PUT', body: JSON.stringify(body) });
    applyBank(saved);
    if (data.value) data.value.bankAccount = saved;
    message.value = clear ? 'Cuenta corriente restaurada a valores por defecto.' : 'Cuenta corriente guardada.';
  });
}

function openPlan(tenant) {
  const code = tenant.plan?.code || 'free';
  const status = tenant.plan?.status === 'suspended' ? 'past_due' : (tenant.plan?.status || 'active');
  const normalized = ['demo', 'free', 'per_student', 'custom'].includes(code) ? code : 'custom';
  editingPlan.value = {
    tenant,
    code: normalized,
    status: ['active', 'trial', 'past_due'].includes(status) ? status : 'active',
    freeStudentLimit: normalized === 'custom' ? 0 : Number(tenant.plan?.freeStudentLimit ?? 10),
    baseMonthlyPrice: Number(tenant.plan?.baseMonthlyPrice || 0),
    perStudentPrice: normalized === 'custom' ? 0 : Number(tenant.plan?.perStudentPrice || 0),
    currency: tenant.plan?.currency || 'CLP',
    customPricing: Boolean(tenant.plan?.customPricing) || normalized === 'custom',
  };
}

function onPlanCodeChange() {
  if (!editingPlan.value) return;
  if (editingPlan.value.code === 'custom') {
    editingPlan.value.perStudentPrice = 0;
    editingPlan.value.freeStudentLimit = 0;
    editingPlan.value.customPricing = true;
  } else if (editingPlan.value.code === 'free' || editingPlan.value.code === 'demo') {
    editingPlan.value.baseMonthlyPrice = 0;
    editingPlan.value.perStudentPrice = 0;
    editingPlan.value.customPricing = false;
  } else if (editingPlan.value.code === 'per_student') {
    editingPlan.value.customPricing = false;
    if (!editingPlan.value.freeStudentLimit) editingPlan.value.freeStudentLimit = 10;
  }
}

function planSummary(plan) {
  if (!plan) return '';
  if (plan.code === 'custom') return `precio fijo ${formatCurrency(plan.baseMonthlyPrice || 0)}/mes`;
  if (plan.code === 'free' || plan.code === 'demo') return 'sin cobro';
  return `${plan.freeStudentLimit} gratis · base ${formatCurrency(plan.baseMonthlyPrice || 0)} · +${formatCurrency(plan.perStudentPrice || 0)}/alumno`;
}

function statusLabel(status) {
  return ({ active: 'Activo', suspended: 'Suspendido', trial: 'Prueba', past_due: 'Pago pendiente' })[status] || status || 'Activo';
}

function savePlan() {
  return perform(async () => {
    const body = editingPlan.value;
    await request(`/platform/tenants/${body.tenant.id}/plan`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    message.value = `Precio actualizado para ${body.tenant.name}.`;
    editingPlan.value = null;
    await load();
  });
}

function chargeOneclick(tenant) {
  return perform(async () => {
    const result = await request('/platform/billing/oneclick/charge', {
      method: 'POST',
      body: JSON.stringify({ schoolId: Number(tenant.id), months: Number(chargeMonths.value) }),
    });
    lastResult.value = result;
    message.value = result.paid
      ? `Cobro al colegio autorizado (${formatCurrency(result.order.amount)}).`
      : 'El cobro Oneclick al colegio fue rechazado.';
    await load();
  });
}

async function handleReturn() {
  const params = new URLSearchParams(window.location.search);
  const flow = params.get('flow');
  if (params.get('token_ws') || params.get('TBK_TOKEN')) {
    tab.value = 'comercio';
    message.value = 'Retorno de Transbank recibido. En plataforma root no se pagan suscripciones: solo se configuran precios y cobros al colegio.';
    window.history.replaceState({}, '', '/plataforma/pagos');
    await load();
  }
}

onMounted(async () => {
  await load();
  await handleReturn();
});
</script>

<template>
  <section class="platform-billing">
    <header class="section-heading">
      <div>
        <h2>Suscripciones y cobros</h2>
        <p>Define el precio de cada colegio y registra cobros. El colegio paga su suscripción; la cuenta de plataforma no.</p>
      </div>
    </header>
    <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>

    <div class="billing-tabs">
      <button type="button" :class="{ active: tab === 'precios' }" @click="tab = 'precios'">Precios por colegio</button>
      <button type="button" :class="{ active: tab === 'cuenta' }" @click="tab = 'cuenta'">Cuenta para transferencias</button>
      <button type="button" :class="{ active: tab === 'comercio' }" @click="tab = 'comercio'">Cobros con tarjeta</button>
    </div>

    <div v-if="tab === 'precios'" class="panel-with-pager">
    <article class="panel webpay-panel">
      <div class="section-title">
        <div>
          <h3>Precios de suscripción</h3>
          <p>Elige el plan y la tarifa de cada colegio. También puedes editar el plan desde Colegios.</p>
        </div>
        <label class="field search-inline">
          <span>Buscar colegio</span>
          <input v-model.trim="schoolQuery" type="search" placeholder="Nombre o ID" />
        </label>
      </div>

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col" :class="sortThClass(tenantsSortBy, 'name', tenantsSortDir)" :aria-sort="tenantsSortBy === 'name' ? (tenantsSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onTenantsSort('name')">
                  <span>Colegio</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(tenantsSortBy, 'plan', tenantsSortDir)" :aria-sort="tenantsSortBy === 'plan' ? (tenantsSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onTenantsSort('plan')">
                  <span>Plan</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(tenantsSortBy, 'students', tenantsSortDir)" :aria-sort="tenantsSortBy === 'students' ? (tenantsSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onTenantsSort('students')">
                  <span>Estudiantes</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(tenantsSortBy, 'monthlyAmount', tenantsSortDir)" :aria-sort="tenantsSortBy === 'monthlyAmount' ? (tenantsSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onTenantsSort('monthlyAmount')">
                  <span>Mensual estimado</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(tenantsSortBy, 'oneclick', tenantsSortDir)" :aria-sort="tenantsSortBy === 'oneclick' ? (tenantsSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onTenantsSort('oneclick')">
                  <span>Tarjeta guardada</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in pagedTenants" :key="tenant.id">
              <td>
                <strong>{{ tenant.name }}</strong>
                <small>Colegio #{{ tenant.id }} · {{ statusLabel(tenant.status) }}</small>
              </td>
              <td>
                <strong>{{ planCodeLabel(tenant.plan?.code) }}</strong>
                <small v-if="tenant.plan">{{ planSummary(tenant.plan) }}</small>
              </td>
              <td>{{ tenant.students ?? '—' }}</td>
              <td><strong>{{ formatCurrency(tenant.monthlyAmount) }}</strong></td>
              <td>{{ tenant.oneclick ? `****${tenant.oneclick.cardLast4}` : 'Sin tarjeta' }}</td>
              <td>
                <div class="tenant-actions">
                  <button v-if="canPrice" type="button" class="primary-button" @click="openPlan(tenant)">Editar precio</button>
                  <button
                    v-if="canPrice && tenant.oneclick"
                    type="button"
                    class="edit-button"
                    :disabled="busy"
                    @click="chargeOneclick(tenant)"
                  >
                    Cobrar al colegio
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredTenants.length"><td colspan="6">No hay colegios con ese criterio.</td></tr>
          </tbody>
        </table>
      </div>

      <form v-if="editingPlan" class="panel plan-editor" @submit.prevent="savePlan">
        <div class="section-title">
          <div>
            <h3>Precio de {{ editingPlan.tenant.name }}</h3>
            <p>Esto define cuánto debe pagar el colegio cada mes.</p>
          </div>
          <button type="button" class="edit-button" @click="editingPlan = null">Cancelar</button>
        </div>
        <div class="form-grid">
          <label class="field"><span>Plan</span>
            <select v-model="editingPlan.code" @change="onPlanCodeChange">
              <option value="demo">Demo</option>
              <option value="free">Gratis</option>
              <option value="per_student">Por estudiante</option>
              <option value="custom">Personalizado</option>
            </select>
          </label>
          <label class="field"><span>Estado de facturación</span>
            <select v-model="editingPlan.status">
              <option value="active">Activo</option>
              <option value="trial">Prueba</option>
              <option value="past_due">Pago pendiente</option>
            </select>
          </label>
          <label v-if="editingPlan.code === 'per_student'" class="field"><span>Estudiantes incluidos gratis</span><input v-model.number="editingPlan.freeStudentLimit" type="number" min="0" required /></label>
          <label v-if="editingPlan.code === 'custom' || editingPlan.code === 'per_student'" class="field">
            <span>{{ editingPlan.code === 'custom' ? 'Precio fijo mensual' : 'Tarifa base mensual' }}</span>
            <input v-model.number="editingPlan.baseMonthlyPrice" type="number" min="0" required />
          </label>
          <label v-if="editingPlan.code === 'per_student'" class="field"><span>Tarifa por estudiante adicional</span><input v-model.number="editingPlan.perStudentPrice" type="number" min="0" required /></label>
          <label v-if="editingPlan.code !== 'free' && editingPlan.code !== 'demo'" class="field"><span>Moneda</span><select v-model="editingPlan.currency"><option>CLP</option><option>USD</option></select></label>
          <p v-if="editingPlan.code === 'custom'" class="plan-hint">Personalizado cobra un monto fijo por todo el colegio, sin tarifa por estudiante.</p>
        </div>
        <button class="primary-button" :disabled="busy">Guardar precio</button>
      </form>
    </article>
    <TablePagination
      v-if="filteredTenants.length"
      v-model:page="tenantsPage"
      :page-count="tenantsPageCount"
      :range-label="tenantsRangeLabel"
      :show="true"
    />
    </div>

    <article v-else-if="tab === 'cuenta'" class="panel bank-panel">
      <div class="section-title">
        <div>
          <h3>Cuenta corriente hlquery</h3>
          <p>Datos para que los colegios transfieran su suscripción.</p>
        </div>
        <span class="smtp-status">{{ bankForm.configured ? `Activa · ${bankForm.source === 'platform' ? 'guardada en plataforma' : 'configuración'}` : 'Valores por defecto' }}</span>
      </div>

      <form v-if="canConfigure" class="form-grid" @submit.prevent="saveBank(false)">
        <label class="field"><span>Banco</span><input v-model.trim="bankForm.bank" required maxlength="120" placeholder="Banco de Chile" /></label>
        <label class="field"><span>Tipo de cuenta</span>
          <select v-model="bankForm.accountType">
            <option>Cuenta corriente</option>
            <option>Cuenta vista</option>
            <option>Cuenta de ahorro</option>
          </select>
        </label>
        <label class="field"><span>Número de cuenta</span><input v-model.trim="bankForm.accountNumber" required maxlength="64" placeholder="00-123-45678-09" /></label>
        <label class="field"><span>Titular</span><input v-model.trim="bankForm.holderName" required maxlength="180" placeholder="hlquery SpA" /></label>
        <label class="field"><span>RUT</span><input v-model.trim="bankForm.holderRut" required maxlength="32" placeholder="76.543.210-K" /></label>
        <label class="field"><span>Correo</span><input v-model.trim="bankForm.email" type="email" maxlength="180" placeholder="pagos@hlquery.com" /></label>
        <label class="field"><span>Sucursal</span><input v-model.trim="bankForm.branch" maxlength="120" placeholder="Casa Matriz Santiago" /></label>
        <label class="field wide"><span>Nota para transferencias</span><textarea v-model.trim="bankForm.transferNote" maxlength="500" rows="3" placeholder="Usa el RUT y el número de cuenta. En el comentario indica el slug del colegio." /></label>
        <div class="tenant-actions wide">
          <button type="submit" class="primary-button" :disabled="busy">Guardar cuenta corriente</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="saveBank(true)">Restaurar valores por defecto</button>
          <button type="button" class="secondary-button" @click="copyText(`${bankForm.bank}\n${bankForm.accountType}\n${bankForm.accountNumber}\n${bankForm.holderName}\n${bankForm.holderRut}`, 'Ficha completa')">Copiar ficha completa</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="exportBankText">Exportar texto</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="exportBankPdf">Exportar PDF</button>
        </div>
      </form>

      <template v-else>
        <dl class="bank-grid">
          <div><dt>Banco</dt><dd>{{ bankForm.bank }}</dd></div>
          <div><dt>Tipo de cuenta</dt><dd>{{ bankForm.accountType }}</dd></div>
          <div><dt>Número</dt><dd>{{ bankForm.accountNumber }} <button type="button" class="edit-button" @click="copyText(bankForm.accountNumber, 'Número de cuenta')">Copiar</button></dd></div>
          <div><dt>Enmascarado</dt><dd>{{ bankForm.accountNumberMasked }}</dd></div>
          <div><dt>Titular</dt><dd>{{ bankForm.holderName }}</dd></div>
          <div><dt>RUT</dt><dd>{{ bankForm.holderRut }} <button type="button" class="edit-button" @click="copyText(bankForm.holderRut, 'RUT')">Copiar</button></dd></div>
          <div><dt>Correo</dt><dd>{{ bankForm.email }} <button type="button" class="edit-button" @click="copyText(bankForm.email, 'Correo')">Copiar</button></dd></div>
          <div><dt>Sucursal</dt><dd>{{ bankForm.branch }}</dd></div>
        </dl>
        <div class="tenant-actions">
          <button type="button" class="secondary-button" @click="copyText(`${bankForm.bank}\n${bankForm.accountType}\n${bankForm.accountNumber}\n${bankForm.holderName}\n${bankForm.holderRut}`, 'Ficha completa')">Copiar ficha completa</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="exportBankText">Exportar texto</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="exportBankPdf">Exportar PDF</button>
        </div>
      </template>
      <p class="empty-note">{{ bankForm.transferNote }}</p>
    </article>

    <article v-else-if="tab === 'comercio'" class="panel webpay-panel">
      <div class="section-title">
        <div>
          <h3>Comercio Transbank</h3>
          <p>
            Ambiente {{ data?.webpay?.environment || 'integration' }}
            · {{ data?.webpay?.usingIntegrationCredentials ? 'credenciales de integración' : 'comercio configurado' }}.
            Aquí configuras cómo cobras a los colegios; root no paga suscripciones.
          </p>
        </div>
      </div>

      <div class="estimate">
        <strong>Regla de cobro</strong>
        <span>1) Asigna el precio en la pestaña Precios. 2) El colegio paga por transferencia a la cuenta corriente o con tarjeta inscrita. 3) Si hay Oneclick, puedes cobrarle al colegio desde Precios.</span>
      </div>

      <label class="field"><span>Meses al cobrar Oneclick</span>
        <input v-model.number="chargeMonths" type="number" min="1" max="12" />
      </label>


      <div v-if="lastResult" class="result-box">
        <strong>Último cobro</strong>
        <pre>{{ JSON.stringify(lastResult, null, 2) }}</pre>
      </div>

      <h4>Pagos recibidos de colegios</h4>
      <div class="panel-with-pager">
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col" :class="sortThClass(ordersSortBy, 'buyOrder', ordersSortDir)" :aria-sort="ordersSortBy === 'buyOrder' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('buyOrder')">
                  <span>Orden</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(ordersSortBy, 'schoolId', ordersSortDir)" :aria-sort="ordersSortBy === 'schoolId' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('schoolId')">
                  <span>Colegio</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(ordersSortBy, 'kind', ordersSortDir)" :aria-sort="ordersSortBy === 'kind' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('kind')">
                  <span>Tipo</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(ordersSortBy, 'amount', ordersSortDir)" :aria-sort="ordersSortBy === 'amount' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('amount')">
                  <span>Monto</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(ordersSortBy, 'status', ordersSortDir)" :aria-sort="ordersSortBy === 'status' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('status')">
                  <span>Estado</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
              <th scope="col" :class="sortThClass(ordersSortBy, 'paidAt', ordersSortDir)" :aria-sort="ordersSortBy === 'paidAt' ? (ordersSortDir === 'DESC' ? 'descending' : 'ascending') : 'none'">
                <button type="button" class="sortable-th-button" @click="onOrdersSort('paidAt')">
                  <span>Fecha</span>
                  <span class="sort-indicator" aria-hidden="true"><i class="sort-bar sort-bar-up sort-arrow sort-arrow-up"></i><i class="sort-bar sort-bar-down sort-arrow sort-arrow-down"></i></span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in pagedOrders" :key="order.id">
              <td>{{ order.buyOrder }}</td>
              <td>#{{ order.schoolId }}</td>
              <td>{{ order.kind }}</td>
              <td>{{ order.amount ? formatCurrency(order.amount) : '—' }}</td>
              <td>{{ order.status }}</td>
              <td>{{ order.paidAt || order.created_at || order.createdAt || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!orders.length" class="empty-note">Aún no hay pagos de colegios registrados.</p>
      </div>
      <TablePagination
        v-if="orders.length"
        v-model:page="ordersPage"
        :page-count="ordersPageCount"
        :range-label="ordersRangeLabel"
        :show="true"
      />
      </div>
    </article>
  </section>
</template>

<style scoped>
.platform-billing { display: grid; gap: 18px; }
.billing-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.billing-tabs button { border: 1px solid #d7e0e8; background: #fff; border-radius: 10px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
.billing-tabs button.active { background: #eef4f8; border-color: #9eb7cc; }
.bank-panel, .webpay-panel { padding: 22px; display: grid; gap: 14px; }
.bank-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 0; }
.bank-grid dt { color: #607184; font-size: 12px; }
.bank-grid dd { margin: 2px 0 0; font-weight: 700; }
.section-title { display: flex; justify-content: space-between; gap: 12px; align-items: start; flex-wrap: wrap; }
.smtp-status { color: #607184; font-size: 12px; font-weight: 700; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.form-grid .wide, .form-span { grid-column: 1 / -1; }
.form-grid textarea { min-height: 84px; resize: vertical; }
.plan-hint { grid-column: 1 / -1; margin: 0; color: #607184; font-size: 13px; }
.estimate { display: grid; gap: 4px; padding: 12px 0; border-top: 1px solid #e8edf2; border-bottom: 1px solid #e8edf2; }
.estimate span, .estimate small, .empty-note { color: #607184; font-size: 13px; }
.tenant-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.result-box { background: #f7fafc; border: 1px solid #e8edf2; border-radius: 12px; padding: 12px; overflow: auto; }
.result-box pre { margin: 8px 0 0; font-size: 11px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 8px; border-bottom: 1px solid #e8edf2; text-align: left; font-size: 13px; vertical-align: top; }
td small { display: block; color: #718195; margin-top: 2px; }
.search-inline { margin: 0; min-width: 220px; }
.plan-editor { margin-top: 8px; padding: 18px; border: 1px solid #d7e2ea; }
.check-field { display: flex; align-items: center; gap: 8px; }
</style>
