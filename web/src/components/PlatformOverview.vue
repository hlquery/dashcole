<script setup>
import { computed, onMounted, ref } from 'vue';
import { Building2, CreditCard, Inbox, Plus, Search, Users } from '@lucide/vue';
import { request } from '../api/client.js';
import PlatformChart from './PlatformChart.vue';

const props = defineProps({
  permissions: { type: Array, default: () => [] },
});
const emit = defineEmits(['navigate']);
const overview = ref(null);
const error = ref('');
const tenants = ref([]);
const showTech = ref(false);

const canWrite = computed(() => props.permissions.includes('platform.infrastructure.write'));

const serviceLabels = {
  connected: 'Conectado',
  ok: 'Conectado',
  degraded: 'Degradado',
  offline: 'Caído',
  error: 'Error',
  disconnected: 'Sin conexión',
};

function serviceTone(status) {
  const value = String(status || '').toLowerCase();
  if (['connected', 'ok', 'active', 'ready'].includes(value)) return 'ok';
  if (['degraded', 'warning', 'slow'].includes(value)) return 'warn';
  return 'bad';
}

function serviceLabel(status) {
  const value = String(status || '').toLowerCase();
  return serviceLabels[value] || (status ? String(status) : 'Desconocido');
}

const services = computed(() => ([
  { key: 'mysql', name: 'Base de datos', status: overview.value?.mysql },
  { key: 'control', name: 'Control', status: overview.value?.control },
  { key: 'redis', name: 'Caché', status: overview.value?.redis },
]));

const activeSchools = computed(() => tenants.value.filter((row) => (row.status || 'active') === 'active').length);
const suspendedSchools = computed(() => tenants.value.filter((row) => row.status === 'suspended').length);

async function load() {
  try {
    const [data, tenantRows] = await Promise.all([
      request('/platform/overview'),
      request('/platform/tenants'),
    ]);
    overview.value = data;
    tenants.value = tenantRows;
    error.value = '';
  } catch (cause) {
    error.value = cause.message;
  }
}

function openOnline() {
  emit('navigate', 'Sesiones');
}

function openColegios(tenant = null) {
  const path = tenant
    ? `/plataforma/colegios/${Number(tenant.id)}`
    : '/plataforma/colegios';
  emit('navigate', 'Colegios');
  window.history.replaceState({ view: 'Colegios', tenantId: tenant?.id || null }, '', path);
}

onMounted(load);
</script>

<template>
  <section class="platform-home">
    <header class="home-header">
      <div>
        <h2>¿Qué quieres hacer?</h2>
        <p>Administra colegios, da soporte a personas y revisa cobros desde un solo lugar.</p>
      </div>
    </header>
    <p v-if="error" class="login-error">{{ error }}</p>

    <div class="task-grid">
      <button type="button" class="panel task-card" @click="openColegios()">
        <Building2 :size="22" />
        <strong>Gestionar colegios</strong>
        <span>Planes, actividad y suspensión</span>
      </button>
      <button v-if="canWrite" type="button" class="panel task-card" @click="emit('navigate', 'Agregar colegio')">
        <Plus :size="22" />
        <strong>Crear colegio</strong>
        <span>Alta nueva con administrador y plan inicial</span>
      </button>
      <button type="button" class="panel task-card" @click="emit('navigate', 'Buscar gente')">
        <Search :size="22" />
        <strong>Buscar persona</strong>
        <span>Encuentra a alguien para dar soporte</span>
      </button>
      <button type="button" class="panel task-card" @click="emit('navigate', 'Cuentas')">
        <Users :size="22" />
        <strong>Cuentas de acceso</strong>
        <span>Directorio y “entrar como” una persona</span>
      </button>
      <button type="button" class="panel task-card" @click="emit('navigate', 'Inbox de contacto')">
        <Inbox :size="22" />
        <strong>Contacto</strong>
        <span>Consultas enviadas desde la web pública</span>
      </button>
      <button type="button" class="panel task-card" @click="emit('navigate', 'Plataforma pagos')">
        <CreditCard :size="22" />
        <strong>Suscripciones</strong>
        <span>Precios y cobros a colegios</span>
      </button>
    </div>

    <div v-if="overview" class="overview-grid">
      <article class="panel overview-stat" data-tone="schools"><strong>{{ overview.tenants ?? activeSchools }}</strong><span>Colegios</span></article>
      <article class="panel overview-stat" data-tone="accounts"><strong>{{ overview.accounts ?? '—' }}</strong><span>Cuentas de acceso</span></article>
      <button type="button" class="panel overview-stat overview-stat-button" data-tone="online" @click="openOnline">
        <strong>{{ overview.activeSessions ?? '—' }}</strong>
        <span>En línea ahora</span>
        <small>Ver sesiones · últimos {{ Math.round((overview.onlineWithinSec || 900) / 60) }} min</small>
      </button>
      <article class="panel overview-stat" data-tone="suspended"><strong>{{ suspendedSchools }}</strong><span>Suspendidos</span></article>
    </div>

    <div v-if="overview?.charts" class="charts-grid">
      <PlatformChart title="Colegios por estado" type="doughnut" :series="overview.charts.tenantsByStatus" />
      <PlatformChart title="Cuentas por estado" type="doughnut" :series="overview.charts.accountsByStatus" />
    </div>

    <details class="tech-panel panel" :open="showTech" @toggle="showTech = $event.target.open">
      <summary>Estado técnico del sistema</summary>
      <ul class="service-list">
        <li v-for="service in services" :key="service.key">
          <span class="service-name">{{ service.name }}</span>
          <span class="service-pill" :data-tone="serviceTone(service.status)">{{ serviceLabel(service.status) }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>

<style scoped>
.platform-home { display: grid; gap: 20px; }
.home-header h2 { margin: 0 0 6px; font-family: var(--font-display, "Plus Jakarta Sans", sans-serif); letter-spacing: -.02em; }
.home-header p { margin: 0; color: var(--color-muted, #566b7b); max-width: 56ch; line-height: 1.45; }
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}
.task-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  text-align: left;
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 14px;
  background: var(--color-surface, #fff);
  cursor: pointer;
  color: inherit;
  box-shadow: var(--shadow-sm, 0 2px 8px rgb(10 37 64 / 5%));
  transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease;
}
.task-card svg { color: var(--color-primary, #0067b2); }
.task-card strong { font-size: 15px; letter-spacing: -.01em; }
.task-card span { color: var(--color-muted, #566b7b); font-size: 13px; line-height: 1.35; }
.task-card:hover {
  border-color: color-mix(in srgb, var(--color-primary, #0067b2) 35%, var(--color-border, #dfe7ee));
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgb(10 37 64 / 8%);
}
.task-card.primary {
  border-color: color-mix(in srgb, var(--color-primary, #0067b2) 28%, var(--color-border, #dfe7ee));
  background: var(--color-primary-soft, #e9f4fb);
}
.overview-grid, .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.charts-grid { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.overview-grid .overview-stat,
.overview-stat-button {
  display: grid;
  gap: 4px;
  padding: 18px;
  text-align: left;
  border: 1px solid transparent;
}
.overview-grid strong { font-size: 20px; }
.overview-stat[data-tone='schools'] {
  background: #eef6fc;
  border-color: #c5dced;
  color: #0b4f7a;
}
.overview-stat[data-tone='accounts'] {
  background: #eef8f6;
  border-color: #c2e2db;
  color: #0f5f55;
}
.overview-stat[data-tone='online'] {
  background: #eef8ef;
  border-color: #c5e2c8;
  color: #1b5e2a;
}
.overview-stat[data-tone='suspended'] {
  background: #fdf3ee;
  border-color: #efd0bf;
  color: #8a3f1c;
}
.overview-stat span { color: inherit; opacity: .78; }
.overview-stat-button {
  border-radius: inherit;
  cursor: pointer;
  font: inherit;
}
.overview-stat-button small {
  color: inherit;
  font-size: 11px;
  font-weight: 700;
  opacity: .9;
}
.overview-stat-button:hover {
  outline: 2px solid color-mix(in srgb, currentColor 28%, transparent);
  filter: brightness(0.985);
}
.service-list { list-style: none; margin: 0 0 12px; padding: 0; display: grid; gap: 8px; }
.service-list li { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.service-name { color: #243447; font-size: 14px; font-weight: 650; }
.service-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.service-pill::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.service-pill[data-tone='ok'] { color: #166534; background: #dcfce7; }
.service-pill[data-tone='warn'] { color: #9a6700; background: #fef3c7; }
.service-pill[data-tone='bad'] { color: #991b1b; background: #fee2e2; }
.schools-table-panel { padding: 18px; }
.schools-table-heading { display: flex; justify-content: space-between; gap: 12px; align-items: end; margin-bottom: 14px; }
.schools-table-heading h3 { margin: 0 0 4px; }
.schools-table-heading p { margin: 0; color: #607184; font-size: 13px; }
.schools-table { width: 100%; border-collapse: collapse; }
.schools-table th { text-align: left; color: #607184; font-size: 11px; font-weight: 700; padding: 0; border-bottom: 1px solid #e8edf2; background: #f8fafc; }
.schools-table td { padding: 12px; border-bottom: 1px solid #eef2f6; vertical-align: middle; }
.sortable-th-button {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.sort-indicator { opacity: .45; }
.sortable-th.active .sort-indicator { opacity: 1; color: #0067b2; }
.school-row { cursor: pointer; }
.school-row:hover { background: #f8fbfd; }
.school-cell { display: flex; align-items: center; gap: 10px; }
.school-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #e8f3fb;
  color: #0067b2;
  font-size: 12px;
  font-weight: 800;
  flex: 0 0 auto;
}
.school-cell strong { display: block; }
.school-cell small { color: #718195; font-size: 12px; }
.metric { font-weight: 700; color: #1d3348; }
.plan-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  background: #eef2f6;
  color: #566b7b;
  font-size: 11px;
  font-weight: 750;
}
.tenant-status {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 750;
  background: #eef2f6;
  color: #566b7b;
}
.tenant-status[data-status='active'] { background: #e8f6ee; color: #166534; }
.tenant-status[data-status='suspended'] { background: #fef2f2; color: #991b1b; }
.empty-home { padding: 28px; display: grid; gap: 8px; justify-items: start; }
.tech-panel { padding: 16px 18px; }
.tech-panel summary { cursor: pointer; font-weight: 700; color: #1d3348; }
@media (max-width: 720px) {
  .online-heading, .schools-table-heading, .online-actions { align-items: stretch; }
  .online-actions > * { flex: 1; }
}
</style>
