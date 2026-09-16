<script setup>
import { computed, onMounted, ref } from 'vue';
import { request } from '../api/client.js';
import { useClientPagination } from '../composables/pagination.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({ permissions: { type: Object, default: () => ({}) } });
const data = ref(null), logs = ref([]), errors = ref({ logs: [], conflicts: [] });
const rbd = ref(''), enabled = ref(false), busy = ref(false), error = ref(''), message = ref('');
const canConfigure = computed(() => Boolean(props.permissions['sige.configure']));
const canSync = computed(() => Boolean(props.permissions['sige.sync']));
const canViewLogs = computed(() => Boolean(props.permissions['sige.view_logs']));
const labels = { local_only: 'Solo hlquery', pending: 'Pendientes', syncing: 'Sincronizando', synced: 'Sincronizados', error: 'Con error' };

const {
  page: logsPage,
  pageCount: logsPageCount,
  paged: pagedLogs,
  rangeLabel: logsRangeLabel,
  show: showLogsPagination,
  goPrev: logsPrev,
  goNext: logsNext,
} = useClientPagination(logs, { pageSize: 15 });

async function load() {
  try {
    data.value = await request('/integrations/sige');
    rbd.value = data.value.integration.rbd || '';
    enabled.value = data.value.integration.enabled;
    if (canViewLogs.value) {
      [logs.value, errors.value] = await Promise.all([request('/integrations/sige/logs'), request('/integrations/sige/errors')]);
    }
    error.value = '';
  } catch (cause) { error.value = cause.message; }
}
async function save() {
  busy.value = true; error.value = ''; message.value = '';
  try { await request('/integrations/sige', { method: 'PUT', body: JSON.stringify({ rbd: rbd.value, enabled: enabled.value }) }); message.value = 'Configuración SIGE guardada sin credenciales.'; await load(); }
  catch (cause) { error.value = cause.message; } finally { busy.value = false; }
}
async function test() {
  busy.value = true; error.value = ''; message.value = '';
  try { await request('/integrations/sige/test', { method: 'POST', body: '{}' }); message.value = 'Conexión SIGE verificada.'; }
  catch (cause) { error.value = cause.message; } finally { busy.value = false; await load(); }
}
async function sync(entity) {
  busy.value = true; error.value = ''; message.value = '';
  try { const result = await request('/integrations/sige/sync', { method: 'POST', body: JSON.stringify({ entity }) }); message.value = `${result.queued} registros quedaron pendientes de sincronización.`; await load(); }
  catch (cause) { error.value = cause.message; } finally { busy.value = false; }
}
const statusLabel = computed(() => ({
  not_configured: 'No configurado', configured: 'Configurado', testing: 'Probando',
  connected: 'Conectado', error: 'Error', disabled: 'Deshabilitado',
})[data.value?.integration.connectionStatus] || 'No configurado');
const formatDate = value => value ? new Date(value).toLocaleString('es-CL') : 'Nunca';
onMounted(load);
</script>

<template>
  <section>
    <header><div><p class="eyebrow">CONFIGURACIÓN · INTEGRACIONES</p><h2>MINEDUC / SIGE</h2><p>hlquery sigue funcionando aunque SIGE no esté disponible. No se inventaron endpoints ni credenciales.</p></div><span v-if="data" :class="['connection',data.integration.connectionStatus]">{{ statusLabel }}</span></header>
    <p v-if="error" class="login-error" role="alert">{{ error }}</p><p v-if="message" class="success-message" role="status">{{ message }}</p>
    <div v-if="data" class="layout">
      <form class="panel config" @submit.prevent="save">
        <h3>Configuración del establecimiento</h3>
        <label class="field"><span>RBD</span><input v-model.trim="rbd" :disabled="!canConfigure" required maxlength="12" placeholder="12345-6" /><small class="field-help">Rol Base de Datos MINEDUC del establecimiento.</small></label>
        <label class="toggle"><input v-model="enabled" :disabled="!canConfigure" type="checkbox" /> Activar módulo SIGE</label>
        <dl><div><dt>Autenticación</dt><dd>No configurada</dd></div><div><dt>Último intento</dt><dd>{{ formatDate(data.integration.lastSyncAt) }}</dd></div><div><dt>Último éxito</dt><dd>{{ formatDate(data.integration.lastSuccessfulSyncAt) }}</dd></div></dl>
        <p class="notice">La autenticación SIGE aún no está configurada. No se guardarán usuarios, claves, tokens ni endpoints hasta contar con documentación oficial.</p>
        <div v-if="canConfigure" class="actions"><button class="primary-button" :disabled="busy">Guardar</button><button type="button" class="secondary-button" :disabled="busy || !enabled" @click="test">Probar conexión</button></div>
      </form>
      <div class="summary">
        <article v-for="(values,entity) in data.summary" :key="entity" class="panel"><h3>{{ entity==='students'?'Alumnos':entity==='courses'?'Cursos':'Matrículas' }}</h3><strong>{{ values.total }}</strong><div><span v-for="key in ['synced','local_only','pending','syncing','error']" :key="key">{{ values[key] }} {{ labels[key].toLowerCase() }}</span></div><button v-if="canSync" class="edit-button" :disabled="busy || !enabled" @click="sync(entity)">Sincronizar {{ entity==='students'?'alumnos':entity==='courses'?'cursos':'matrículas' }}</button></article>
      </div>
    </div>
    <section v-if="canViewLogs && data" class="logs">
      <h3>Errores e intentos recientes</h3>
      <p v-if="!logs.length">Todavía no hay intentos de sincronización.</p>
      <div v-else class="table-scroll">
        <table>
          <thead><tr><th>Fecha</th><th>Entidad</th><th>Operación</th><th>Estado</th><th>Detalle</th></tr></thead>
          <tbody>
            <tr v-for="row in pagedLogs" :key="row.id">
              <td>{{ formatDate(row.createdAt) }}</td>
              <td>{{ row.entityType }} #{{ row.entityId || '—' }}</td>
              <td>{{ row.operation }}</td>
              <td>{{ row.status }}</td>
              <td>{{ row.errorMessage || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <TablePagination
        v-if="logs.length"
        v-model:page="logsPage"
        :page-count="logsPageCount"
        :range-label="logsRangeLabel"
        :show="showLogsPagination"
      />
      <p v-if="errors.conflicts.length">{{ errors.conflicts.length }} conflictos requieren revisión manual.</p>
    </section>
  </section>
</template>

<style scoped>
header{display:flex;justify-content:space-between;gap:20px;align-items:start}header>div>p{color:#607184}.connection{padding:7px 12px;border-radius:999px;background:#eef2f6}.connection.connected{background:#dcfce7;color:#166534}.connection.error{background:#fee2e2;color:#991b1b}.layout{display:grid;grid-template-columns:minmax(300px,.9fr) minmax(420px,1.1fr);gap:18px}.config{padding:22px}.toggle{display:flex;gap:9px;margin:15px 0}.config dl{display:grid;gap:8px}.config dl div{display:flex;justify-content:space-between}.config dt{color:#607184}.notice{padding:12px;background:#fff8e6;color:#78550a;border-radius:10px}.actions{display:flex;gap:8px}.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}.summary article{padding:18px;display:grid;gap:10px}.summary article>strong{font-size:32px}.summary article div{display:grid;color:#607184;font-size:13px}.logs{margin-top:24px}@media(max-width:900px){.layout{grid-template-columns:1fr}}
</style>
