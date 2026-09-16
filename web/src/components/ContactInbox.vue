<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Archive, Inbox, MailOpen, RefreshCw, Search, Trash2 } from '@lucide/vue';
import { request } from '../api/client.js';
import { TablePagination } from './ui/index.js';

const rows = ref([]);
const selected = ref(null);
const selectedIds = ref(new Set());
const error = ref('');
const query = ref('');
const statusFilter = ref('all');
const busy = ref(false);
const selectAllEl = ref(null);
const page = ref(1);
const pageSize = ref(25);

const statusLabel = { new: 'Nuevo', read: 'Leído', closed: 'Cerrado' };

const counts = computed(() => ({
  all: rows.value.length,
  new: rows.value.filter((row) => row.status === 'new').length,
  read: rows.value.filter((row) => row.status === 'read').length,
  closed: rows.value.filter((row) => row.status === 'closed').length,
}));

const filteredRows = computed(() => {
  const q = query.value.trim().toLocaleLowerCase('es');
  return rows.value.filter((row) => {
    if (statusFilter.value !== 'all' && row.status !== statusFilter.value) return false;
    if (!q) return true;
    const haystack = [row.subject, row.name, row.email, row.organization, row.body]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('es');
    return haystack.includes(q);
  });
});

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});
const rangeLabel = computed(() => {
  if (!filteredRows.value.length) return '0 mensajes';
  const from = (page.value - 1) * pageSize.value + 1;
  const to = Math.min(filteredRows.value.length, page.value * pageSize.value);
  return `${from}–${to} de ${filteredRows.value.length}`;
});

const pageIds = computed(() => pagedRows.value.map((row) => Number(row.id)));
const selectedCount = computed(() => selectedIds.value.size);
const allPageSelected = computed(() => (
  pageIds.value.length > 0
  && pageIds.value.every((id) => selectedIds.value.has(id))
));
const somePageSelected = computed(() => (
  pageIds.value.some((id) => selectedIds.value.has(id))
  && !allPageSelected.value
));

function syncSelectAllCheckbox() {
  if (selectAllEl.value) selectAllEl.value.indeterminate = somePageSelected.value;
}

watch([somePageSelected, allPageSelected, pageIds], syncSelectAllCheckbox);
watch([query, statusFilter, pageSize], () => {
  page.value = 1;
});
watch(filteredRows, () => {
  if (page.value > pageCount.value) page.value = pageCount.value;
});

function goToPage(next) {
  page.value = Math.min(pageCount.value, Math.max(1, Number(next) || 1));
}

function formatWhen(value) {
  if (!value) return '';
  try {
    const date = new Date(value);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    const sameYear = date.getFullYear() === now.getFullYear();
    return date.toLocaleDateString('es-CL', sameYear
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: '2-digit' });
  } catch {
    return String(value).slice(0, 16);
  }
}

function preview(body) {
  return String(body || '').replace(/\s+/g, ' ').trim();
}

async function load() {
  try {
    rows.value = await request('/platform/contact-messages');
    error.value = '';
    const alive = new Set(rows.value.map((row) => Number(row.id)));
    selectedIds.value = new Set([...selectedIds.value].filter((id) => alive.has(id)));
    if (selected.value) {
      selected.value = rows.value.find((row) => Number(row.id) === Number(selected.value.id)) || null;
    }
  } catch (e) {
    error.value = e.message;
  }
}

function toggleSelectAll() {
  const next = new Set(selectedIds.value);
  if (allPageSelected.value) {
    pageIds.value.forEach((id) => next.delete(id));
  } else {
    pageIds.value.forEach((id) => next.add(id));
  }
  selectedIds.value = next;
}

function toggleRow(id, event) {
  event?.stopPropagation?.();
  const next = new Set(selectedIds.value);
  const key = Number(id);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedIds.value = next;
}

function isChecked(id) {
  return selectedIds.value.has(Number(id));
}

async function open(row) {
  selected.value = row;
  if (row.status !== 'new') return;
  try {
    const data = await request(`/platform/contact-messages/${row.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'read' }),
    });
    Object.assign(row, data.message || { status: 'read' });
  } catch (e) {
    error.value = e.message;
  }
}

async function setStatus(status) {
  if (!selected.value || busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    const data = await request(`/platform/contact-messages/${selected.value.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    Object.assign(selected.value, data.message || { status });
    const idx = rows.value.findIndex((row) => Number(row.id) === Number(selected.value.id));
    if (idx >= 0) Object.assign(rows.value[idx], selected.value);
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function deleteSelected() {
  const ids = [...selectedIds.value];
  if (!ids.length || busy.value) return;
  const label = ids.length === 1 ? 'este mensaje' : `estos ${ids.length} mensajes`;
  if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return;
  busy.value = true;
  error.value = '';
  try {
    if (ids.length === 1) {
      await request(`/platform/contact-messages/${ids[0]}`, { method: 'DELETE' });
    } else {
      await request('/platform/contact-messages/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    }
    const removed = new Set(ids);
    rows.value = rows.value.filter((row) => !removed.has(Number(row.id)));
    selectedIds.value = new Set();
    if (selected.value && removed.has(Number(selected.value.id))) selected.value = null;
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function deleteCurrent() {
  if (!selected.value || busy.value) return;
  selectedIds.value = new Set([Number(selected.value.id)]);
  await deleteSelected();
}

async function bulkStatus(status) {
  const ids = [...selectedIds.value];
  if (!ids.length || busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await request('/platform/contact-messages/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
    rows.value = rows.value.map((row) => (
      ids.includes(Number(row.id)) ? { ...row, status } : row
    ));
    if (selected.value && ids.includes(Number(selected.value.id))) {
      selected.value = { ...selected.value, status };
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="contact-inbox-page">
    <p v-if="error" class="login-error" role="alert">{{ error }}</p>

    <section class="gmail-inbox panel contact-gmail">
      <aside class="gmail-list-pane">
        <div class="gmail-list-tools">
          <div class="gmail-toolbar">
            <label class="gmail-select-all" title="Seleccionar página">
              <input
                ref="selectAllEl"
                type="checkbox"
                :checked="allPageSelected"
                :aria-checked="somePageSelected ? 'mixed' : allPageSelected"
                :disabled="!pagedRows.length"
                @change="toggleSelectAll"
              />
              <span class="sr-only">Seleccionar página</span>
            </label>
            <div v-if="selectedCount" class="gmail-bulk-actions">
              <span class="gmail-selected-count">{{ selectedCount }} seleccionado{{ selectedCount === 1 ? '' : 's' }}</span>
              <button type="button" class="gmail-tool-btn" :disabled="busy" title="Marcar como leído" @click="bulkStatus('read')">
                <MailOpen :size="16" /><span>Leído</span>
              </button>
              <button type="button" class="gmail-tool-btn" :disabled="busy" title="Marcar cerrado" @click="bulkStatus('closed')">
                <Archive :size="16" /><span>Cerrar</span>
              </button>
              <button type="button" class="gmail-tool-btn danger" :disabled="busy" title="Eliminar" @click="deleteSelected">
                <Trash2 :size="16" /><span>Eliminar</span>
              </button>
            </div>
            <div v-else class="gmail-bulk-actions muted">
              <button type="button" class="gmail-tool-btn" :disabled="busy" title="Actualizar" @click="load">
                <RefreshCw :size="16" /><span>Actualizar</span>
              </button>
            </div>
          </div>

          <label class="gmail-search">
            <Search :size="16" />
            <input v-model.trim="query" type="search" placeholder="Buscar en mensajes de contacto" aria-label="Buscar mensajes de contacto" />
          </label>

          <div class="gmail-channel-tabs" role="tablist" aria-label="Estado">
            <button type="button" role="tab" :aria-selected="statusFilter === 'all'" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
              Principal <em>{{ counts.all }}</em>
            </button>
            <button type="button" role="tab" :aria-selected="statusFilter === 'new'" :class="{ active: statusFilter === 'new' }" @click="statusFilter = 'new'">
              Nuevos <em>{{ counts.new }}</em>
            </button>
            <button type="button" role="tab" :aria-selected="statusFilter === 'read'" :class="{ active: statusFilter === 'read' }" @click="statusFilter = 'read'">
              Leídos <em>{{ counts.read }}</em>
            </button>
            <button type="button" role="tab" :aria-selected="statusFilter === 'closed'" :class="{ active: statusFilter === 'closed' }" @click="statusFilter = 'closed'">
              Cerrados <em>{{ counts.closed }}</em>
            </button>
          </div>
        </div>

        <div v-if="pagedRows.length" class="gmail-thread-list" role="listbox" aria-label="Lista de mensajes">
          <div
            v-for="row in pagedRows"
            :key="row.id"
            role="option"
            class="gmail-thread contact-thread"
            :class="{ active: selected?.id === row.id, unread: row.status === 'new', checked: isChecked(row.id) }"
            :aria-selected="selected?.id === row.id"
            tabindex="0"
            @click="open(row)"
            @keydown.enter.prevent="open(row)"
            @keydown.space.prevent="open(row)"
          >
            <label class="gmail-row-check" @click.stop>
              <input type="checkbox" :checked="isChecked(row.id)" :aria-label="`Seleccionar mensaje de ${row.name}`" @change="toggleRow(row.id, $event)" />
            </label>
            <span class="gmail-thread-main">
              <span class="gmail-thread-top">
                <strong>{{ row.name }}</strong>
                <time>{{ formatWhen(row.createdAt || row.created_at) }}</time>
              </span>
              <span class="gmail-thread-subject">{{ row.subject }}</span>
              <em>{{ preview(row.body) }}</em>
            </span>
          </div>
        </div>
        <div v-else class="gmail-list-empty">
          <Inbox :size="28" />
          <strong>Sin mensajes</strong>
          <span>{{ query || statusFilter !== 'all' ? 'No hay resultados con ese filtro.' : 'Todavía no llegan consultas desde el sitio.' }}</span>
        </div>

        <div v-if="filteredRows.length" class="contact-pager">
          <label class="contact-page-size">
            <span>Por página</span>
            <select v-model.number="pageSize" aria-label="Mensajes por página">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </label>
          <span class="contact-range">{{ rangeLabel }}</span>
          <div class="contact-pager-buttons">
            <TablePagination
              class="gmail-tool-pager"
              :page="page"
              :page-count="pageCount"
              @goto="goToPage"
            />
          </div>
        </div>
      </aside>

      <article class="gmail-read-pane">
        <template v-if="selected">
          <header class="gmail-read-header">
            <div class="gmail-read-toolbar">
              <button type="button" class="gmail-tool-btn danger" :disabled="busy" @click="deleteCurrent">
                <Trash2 :size="16" />Eliminar
              </button>
              <button v-if="selected.status !== 'closed'" type="button" class="gmail-tool-btn" :disabled="busy" @click="setStatus('closed')">
                <Archive :size="16" />Cerrar
              </button>
              <button v-else type="button" class="gmail-tool-btn" :disabled="busy" @click="setStatus('read')">
                <MailOpen :size="16" />Reabrir
              </button>
              <a class="gmail-tool-btn primary" :href="`mailto:${selected.email}?subject=Re:%20${encodeURIComponent(selected.subject || '')}`">Responder</a>
            </div>
            <div class="gmail-read-title">
              <h2>{{ selected.subject }}</h2>
              <span class="contact-status-pill" :data-status="selected.status">{{ statusLabel[selected.status] || selected.status }}</span>
            </div>
            <div class="gmail-sender-card">
              <div class="gmail-sender-avatar" aria-hidden="true">{{ (selected.name || '?').trim().charAt(0).toUpperCase() }}</div>
              <div class="gmail-sender-copy">
                <strong>{{ selected.name }}</strong>
                <span>&lt;{{ selected.email }}&gt;</span>
                <small v-if="selected.organization">{{ selected.organization }}</small>
              </div>
              <time>{{ formatWhen(selected.createdAt || selected.created_at) || '—' }}</time>
            </div>
          </header>
          <div class="gmail-read-body" data-channel="email">{{ selected.body }}</div>
        </template>
        <div v-else class="gmail-read-empty">
          <Inbox :size="40" />
          <strong>Ningún mensaje seleccionado</strong>
          <span>Elige un mensaje a la izquierda o marca varios para eliminarlos juntos.</span>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.contact-inbox-page { display: grid; gap: 10px; }
.contact-gmail {
  min-height: min(760px, calc(100vh - 120px));
  border: 1px solid #e3e6ea;
  box-shadow: 0 1px 2px color-mix(in srgb, #202124 6%, transparent);
}
.contact-gmail :deep(.gmail-list-pane) { background: #fff; }
.contact-thread.unread .gmail-thread-top strong,
.contact-thread.unread .gmail-thread-subject { font-weight: 800; color: #202124; }
.contact-thread.unread { background: #fff; }
.contact-thread.checked { background: #c2dbff; }
.contact-thread.active { background: #d3e3fd; box-shadow: inset 3px 0 0 #1a73e8; }
.contact-status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.contact-status-pill[data-status='new'] { color: #1967d2; background: #e8f0fe; }
.contact-status-pill[data-status='read'] { color: #3c4043; background: #f1f3f4; }
.contact-status-pill[data-status='closed'] { color: #166534; background: #dcfce7; }
.gmail-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
}
.gmail-select-all {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
}
.gmail-select-all:hover { background: #f1f3f4; }
.gmail-select-all input,
.gmail-row-check input {
  width: 16px;
  height: 16px;
  accent-color: #1a73e8;
  cursor: pointer;
}
.gmail-bulk-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.gmail-bulk-actions.muted { opacity: .92; }
.gmail-selected-count {
  margin-right: 4px;
  color: #1a73e8;
  font-size: 12px;
  font-weight: 700;
}
.gmail-tool-btn {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3c4043;
  background: transparent;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
}
.gmail-tool-btn:hover:not(:disabled) { background: #f1f3f4; }
.gmail-tool-btn:disabled { opacity: .45; cursor: not-allowed; }
.gmail-tool-btn.danger { color: #c5221f; }
.gmail-tool-btn.danger:hover:not(:disabled) { background: #fce8e6; }
.gmail-tool-btn.primary {
  color: #fff;
  background: #1a73e8;
}
.gmail-tool-btn.primary:hover { background: #1765cc; }
.gmail-row-check {
  width: 28px;
  height: 28px;
  margin-top: 2px;
  display: grid;
  place-items: center;
  border-radius: 6px;
}
.gmail-row-check:hover { background: #f1f3f4; }
.gmail-thread-subject {
  overflow: hidden;
  color: #202124;
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gmail-read-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.gmail-sender-card {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
}
.gmail-sender-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: #1a73e8;
  font-size: 16px;
  font-weight: 700;
}
.gmail-sender-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.gmail-sender-copy strong {
  overflow: hidden;
  color: #202124;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gmail-sender-copy span,
.gmail-sender-copy small {
  overflow: hidden;
  color: #5f6368;
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gmail-sender-card time {
  color: #5f6368;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}
.contact-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid #e3e6ea;
  background: #fafbfc;
}
.contact-page-size {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5f6368;
  font-size: 12px;
  font-weight: 650;
}
.contact-page-size select {
  min-height: 30px;
  padding: 0 8px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #fff;
  color: #202124;
  font: inherit;
}
.contact-range {
  color: #5f6368;
  font-size: 12px;
  font-weight: 650;
}
.contact-pager-buttons {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #3c4043;
  font-size: 12px;
  font-weight: 650;
}
@media (max-width: 720px) {
  .gmail-tool-btn span { display: none; }
  .gmail-sender-card { grid-template-columns: 40px minmax(0, 1fr); }
  .gmail-sender-card time { grid-column: 2; }
  .contact-pager { justify-content: center; }
}
</style>
