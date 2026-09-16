<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { RefreshCw, Search } from '@lucide/vue';
import { request } from '../api/client.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const emit = defineEmits(['navigate']);

/** Ventana de “sesión abierta”: alineada al TTL de presencia Redis (12 h). */
const OPEN_WITHIN_SEC = 60 * 60 * 12;

const loading = ref(false);
const error = ref('');
const query = ref('');
const payload = ref({ total: 0, withinSec: OPEN_WITHIN_SEC, rows: [] });
let timer;

const roleLabels = {
  director: 'Director',
  school_admin: 'Admin colegio',
  manager: 'Manager',
  utp: 'Jefe de UTP',
  teacher: 'Profesor',
  inspector: 'Inspector',
  finance: 'Finanzas',
  agente_finanzas: 'Agente finanzas',
  warehouse: 'Bodega',
  guardian: 'Apoderado',
  student: 'Estudiante',
  super_admin: 'Super admin',
};

function roleLabel(role) {
  return roleLabels[role] || role || '—';
}

function formatAgo(seconds) {
  const value = Number(seconds) || 0;
  if (value < 60) return `hace ${value}s`;
  if (value < 3600) return `hace ${Math.floor(value / 60)} min`;
  return `hace ${Math.floor(value / 3600)} h`;
}

function formatDateTime(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return value;
  }
}

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

const rows = computed(() => payload.value?.rows || []);
const filtered = computed(() => {
  const q = normalize(query.value);
  if (!q) return rows.value;
  return rows.value.filter((row) => normalize([
    row.fullName,
    row.email,
    row.role,
    roleLabel(row.role),
    row.schoolName,
    row.schoolId,
    row.platformConsole ? 'plataforma' : '',
  ].join(' ')).includes(q));
});

const recentCount = computed(() => rows.value.filter((row) => (Number(row.secondsAgo) || 0) <= 15 * 60).length);

const {
  page,
  pageCount,
  paged,
  rangeLabel,
  show: showPagination,
} = useClientPagination(filtered, { pageSize: 20, resetOn: [query] });

async function load() {
  loading.value = true;
  error.value = '';
  try {
    payload.value = await request(`/platform/sessions/online?withinSec=${OPEN_WITHIN_SEC}&limit=500`);
  } catch (cause) {
    error.value = cause.message || 'No se pudieron cargar las sesiones.';
  } finally {
    loading.value = false;
  }
}

function openAccount(row) {
  if (!row?.globalUserId) return;
  emit('navigate', 'Cuentas');
  window.history.replaceState({ view: 'Cuentas', accountId: row.globalUserId }, '', `/plataforma/cuentas/${row.globalUserId}`);
}

onMounted(() => {
  load();
  timer = setInterval(load, 10000);
});
onUnmounted(() => clearInterval(timer));
</script>

<template>
  <section class="sessions-page">
    <header class="sessions-header">
      <div>
        <h2>Sesiones</h2>
        <p>
          Sesiones abiertas en Redis · {{ payload.total }} abierta{{ payload.total === 1 ? '' : 's' }}
          · {{ recentCount }} con actividad en los últimos 15 min
        </p>
      </div>
      <button type="button" class="secondary-button" :disabled="loading" @click="load">
        <RefreshCw :size="15" />{{ loading ? 'Actualizando…' : 'Actualizar' }}
      </button>
    </header>

    <p v-if="error" class="login-error" role="alert">{{ error }}</p>

    <div class="sessions-toolbar">
      <label class="field sessions-search">
        <span class="sr-only">Buscar sesión</span>
        <Search :size="16" aria-hidden="true" />
        <input v-model.trim="query" type="search" placeholder="Buscar por persona, correo, rol o colegio" />
      </label>
      <span class="sessions-count">{{ filtered.length }} resultado{{ filtered.length === 1 ? '' : 's' }}</span>
    </div>

    <article class="panel sessions-panel">
      <div class="table-scroll">
        <table class="sessions-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Rol</th>
              <th>Colegio</th>
              <th>Última actividad</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paged"
              :key="`${row.tokenHint || row.userId}-${row.lastSeenAt}`"
              class="session-row"
              :class="{ recent: (Number(row.secondsAgo) || 0) <= 15 * 60 }"
              tabindex="0"
              role="link"
              @click="openAccount(row)"
              @keydown.enter.prevent="openAccount(row)"
            >
              <td>
                <strong>{{ row.fullName }}</strong>
                <small>{{ row.email || `Usuario #${row.userId}` }}</small>
              </td>
              <td>
                <span class="role-pill">{{ roleLabel(row.role) }}</span>
                <small v-if="row.platformConsole" class="platform-tag">Plataforma</small>
              </td>
              <td>{{ row.schoolName || (row.schoolId ? `Colegio #${row.schoolId}` : '—') }}</td>
              <td>
                <strong class="ago">{{ formatAgo(row.secondsAgo) }}</strong>
                <small>{{ formatDateTime(row.lastSeenAt) }}</small>
              </td>
            </tr>
            <tr v-if="!loading && !filtered.length">
              <td colspan="4" class="empty-sessions">
                {{ rows.length ? 'Ninguna sesión coincide con la búsqueda.' : 'No hay sesiones abiertas por ahora.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        v-model:page="page"
        :page-count="pageCount"
        :range-label="rangeLabel"
        :show="showPagination"
      />
    </article>
  </section>
</template>

<style scoped>
.sessions-page { display: grid; gap: 16px; }
.sessions-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: end;
}
.sessions-header h2 {
  margin: 0 0 4px;
  font-family: var(--font-display, "Plus Jakarta Sans", sans-serif);
  letter-spacing: -.02em;
}
.sessions-header p {
  margin: 0;
  color: var(--color-muted, #566b7b);
  font-size: 13.5px;
  line-height: 1.4;
}
.sessions-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.sessions-search {
  flex: 1 1 280px;
  position: relative;
  margin: 0;
}
.sessions-search :deep(span.sr-only) {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.sessions-search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted, #607184);
  pointer-events: none;
}
.sessions-search input {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px 10px 38px;
  border: 1px solid var(--color-border, #dfe7ee);
  border-radius: 10px;
  background: var(--color-surface, #fff);
  font: inherit;
}
.sessions-count {
  color: var(--color-muted, #607184);
  font-size: 13px;
  font-weight: 650;
}
.sessions-panel { padding: 0; overflow: hidden; }
.sessions-table { width: 100%; border-collapse: collapse; }
.sessions-table th {
  text-align: left;
  color: #607184;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
  padding: 12px 14px;
  border-bottom: 1px solid #e8edf2;
  background: #f8fafc;
}
.sessions-table td {
  padding: 14px;
  border-bottom: 1px solid #eef2f6;
  vertical-align: top;
}
.sessions-table td strong { display: block; color: #1d3348; }
.sessions-table td small { display: block; margin-top: 3px; color: #718195; font-size: 12px; }
.session-row { cursor: pointer; }
.session-row:hover { background: #f8fbfd; }
.session-row.recent .ago { color: #14705c; }
.role-pill {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  background: #e8f3fb;
  color: #0067b2;
  font-size: 11px;
  font-weight: 750;
}
.platform-tag {
  display: inline-block;
  margin-left: 6px;
  color: #97551c;
  font-size: 11px;
  font-weight: 700;
}
.ago { font-size: 13px; }
.empty-sessions {
  text-align: center;
  color: #718195;
  padding: 28px 12px !important;
}
</style>
