<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { request } from '../api/client.js';

const props = defineProps({ studentId: { type: Number, required: true }, canSync: Boolean });
const status = ref(null);
const busy = ref(false);
const error = ref('');

const labels = {
  local_only: 'Solo hlquery',
  pending: 'Pendiente',
  syncing: 'Sincronizando…',
  synced: 'Al día',
  error: 'Con error'
};

const statusKey = computed(() => status.value?.status || '');
const lastSyncLabel = computed(() => {
  if (!status.value?.lastSyncedAt) return 'Sin sincronización previa';
  return `Última sync: ${new Date(status.value.lastSyncedAt).toLocaleString('es-CL')}`;
});

async function load() {
  try {
    status.value = await request(`/students/${props.studentId}/sige/status`);
    error.value = '';
  } catch (cause) {
    error.value = cause.message;
  }
}

async function sync() {
  busy.value = true;
  error.value = '';
  try {
    await request(`/students/${props.studentId}/sige/sync`, { method: 'POST', body: '{}' });
    await load();
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

onMounted(load);
watch(() => props.studentId, load);
</script>

<template>
  <div class="sige-inline" :data-status="statusKey || 'loading'">
    <span class="sige-badge">{{ labels[statusKey] || 'Consultando…' }}</span>
    <span class="sige-meta">{{ lastSyncLabel }}</span>
    <button
      v-if="canSync"
      type="button"
      class="sige-sync"
      :disabled="busy || !status?.configured"
      :title="status?.configured ? 'Sincronizar este estudiante con SIGE' : 'Configura primero la integración SIGE del establecimiento.'"
      @click="sync"
    >{{ busy ? 'Solicitando…' : 'Sincronizar' }}</button>
    <span v-if="status?.lastError || error" class="sige-error">{{ status?.lastError || error }}</span>
  </div>
</template>

<style scoped>
.sige-inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  margin: 4px 0 12px;
  padding: 0;
  border: 0;
  background: transparent;
}
.sige-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #334155;
  background: #eef2f6;
}
.sige-inline[data-status='synced'] .sige-badge {
  color: #166534;
  background: #e8f6ee;
}
.sige-inline[data-status='pending'] .sige-badge,
.sige-inline[data-status='syncing'] .sige-badge {
  color: #92400e;
  background: #fff7ed;
}
.sige-inline[data-status='error'] .sige-badge {
  color: #991b1b;
  background: #fef2f2;
}
.sige-inline[data-status='local_only'] .sige-badge {
  color: #475569;
  background: #f1f5f9;
}
.sige-meta {
  font-size: 12px;
  color: #64748b;
}
.sige-sync {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #0067b2;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.sige-sync:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.sige-error {
  flex: 1 1 100%;
  font-size: 12px;
  color: #b42318;
}
</style>
