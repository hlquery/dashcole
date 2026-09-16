<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { ArrowLeft, ClipboardList, History, Search } from '@lucide/vue';
import { request } from '../api/client.js';
import { useClientPagination } from '../composables/pagination.js';
import { DataTable, EmptyState, TablePagination } from './ui/index.js';

const props = defineProps({
  panel: { type: String, default: 'active' },
});
const emit = defineEmits(['open-task', 'open-panel']);

const loading = ref(false);
const error = ref('');
const assignments = ref([]);
const searchQuery = ref('');
const sortBy = ref('dueAt');
const sortDir = ref(props.panel === 'history' ? 'DESC' : 'ASC');

const isHistory = computed(() => props.panel === 'history');

async function load() {
  loading.value = true;
  error.value = '';
  try {
    const data = await request(`/assignments?panel=${isHistory.value ? 'history' : 'active'}`);
    assignments.value = data.assignments || [];
  } catch (cause) {
    error.value = cause.message || 'No fue posible cargar las tareas.';
    assignments.value = [];
  } finally {
    loading.value = false;
  }
}

watch(() => props.panel, () => {
  searchQuery.value = '';
  sortBy.value = 'dueAt';
  sortDir.value = props.panel === 'history' ? 'DESC' : 'ASC';
  load();
});

onMounted(load);

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es');
  if (!query) return assignments.value;
  return assignments.value.filter((row) => {
    const haystack = `${row.title || ''} ${row.courseLabel || ''} ${row.courseSubject || ''} ${row.instructions || ''} ${row.status || ''}`
      .toLocaleLowerCase('es');
    return haystack.includes(query);
  });
});

const sortedRows = computed(() => {
  const rows = [...filteredRows.value];
  const key = sortBy.value || 'dueAt';
  const dir = sortDir.value === 'DESC' ? -1 : 1;
  rows.sort((a, b) => {
    let cmp = 0;
    if (key === 'dueAt' || key === 'createdAt') {
      cmp = new Date(a[key] || 0).getTime() - new Date(b[key] || 0).getTime();
    } else if (key === 'submissionCount' || key === 'enrolled') {
      cmp = (Number(a.submissionCount) || 0) - (Number(b.submissionCount) || 0);
      if (!cmp) cmp = (Number(a.enrolled) || 0) - (Number(b.enrolled) || 0);
    } else if (key === 'courseLabel') {
      cmp = String(a.courseLabel || '').localeCompare(String(b.courseLabel || ''), 'es');
    } else if (key === 'status') {
      cmp = String(a.status || '').localeCompare(String(b.status || ''), 'es');
    } else {
      cmp = String(a.title || '').localeCompare(String(b.title || ''), 'es');
    }
    if (cmp) return cmp * dir;
    return String(a.title || '').localeCompare(String(b.title || ''), 'es');
  });
  return rows;
});

const {
  page,
  pageCount,
  paged,
  rangeLabel,
  show: showPagination,
} = useClientPagination(sortedRows, {
  pageSize: 20,
  resetOn: [searchQuery, sortBy, sortDir, () => props.panel],
});

const columns = [
  { key: 'title', label: 'Tarea' },
  { key: 'courseLabel', label: 'Curso' },
  { key: 'dueAt', label: 'Entrega' },
  { key: 'submissionCount', label: 'Entregas' },
  { key: 'status', label: 'Estado' },
];

function onSort({ key, dir }) {
  sortBy.value = key;
  sortDir.value = dir;
}

function formatDue(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDueTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function openRow(row) {
  emit('open-task', row);
}
</script>

<template>
  <section class="teacher-tasks-page">
    <article class="panel table-panel teacher-tasks-panel">
      <div class="panel-header teacher-tasks-header">
        <div>
          <h2>{{ isHistory ? 'Historial de tareas' : 'Tareas activas' }}</h2>
          <p>
            {{ isHistory
              ? 'Tareas con fecha de entrega ya vencida en tus cursos.'
              : 'Todas tus tareas vigentes, aunque estén en distintos cursos.' }}
          </p>
        </div>
        <div class="teacher-tasks-header-actions">
          <label class="field teacher-tasks-search">
            <span class="visually-hidden">Buscar tareas</span>
            <div class="module-search-shell">
              <Search :size="16" aria-hidden="true" />
              <input
                v-model="searchQuery"
                type="search"
                :placeholder="isHistory ? 'Buscar en historial…' : 'Buscar tarea o curso…'"
                aria-label="Buscar tareas"
              />
            </div>
          </label>
          <button
            v-if="!isHistory"
            type="button"
            class="secondary-button"
            @click="emit('open-panel', 'history')"
          >
            <History :size="16" />Historial
          </button>
          <button
            v-else
            type="button"
            class="secondary-button"
            @click="emit('open-panel', 'active')"
          >
            <ArrowLeft :size="16" />Tareas activas
          </button>
        </div>
      </div>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <div v-if="loading" class="teacher-tasks-loading" role="status">
        <ClipboardList :size="18" />
        Cargando tareas…
      </div>

      <template v-else-if="paged.length">
        <div class="table-scroll">
          <DataTable
            class="teacher-tasks-table"
            :caption="isHistory ? 'Historial de tareas' : 'Tareas activas'"
            :rows="paged"
            :columns="columns"
            sortable
            :sort-by="sortBy"
            :sort-dir="sortDir"
            row-clickable
            @sort="onSort"
            @row-click="openRow"
          >
            <template #cell-title="{ row }">
              <strong class="teacher-task-title">{{ row.title }}</strong>
              <small class="teacher-task-preview">
                {{ String(row.instructions || '').slice(0, 90) }}{{ String(row.instructions || '').length > 90 ? '…' : '' }}
              </small>
            </template>
            <template #cell-courseLabel="{ row }">
              <strong>{{ row.courseName }} {{ row.courseSection }}</strong>
              <small>{{ row.courseSubject }}</small>
            </template>
            <template #cell-dueAt="{ row }">
              <strong>{{ formatDue(row.dueAt) }}</strong>
              <small>{{ formatDueTime(row.dueAt) }}</small>
            </template>
            <template #cell-submissionCount="{ row }">
              <span class="teacher-task-submissions">{{ row.submissionCount || 0 }}/{{ row.enrolled || 0 }}</span>
            </template>
            <template #cell-status="{ row }">
              <span class="teacher-task-state" :data-status="row.status === 'Vencida' ? 'overdue' : 'active'">
                {{ row.status }}
              </span>
            </template>
          </DataTable>
        </div>
        <TablePagination
          v-model:page="page"
          :page-count="pageCount"
          :range-label="rangeLabel"
          :show="showPagination"
        />
      </template>

      <EmptyState v-else class="module-empty">
        <ClipboardList :size="28" />
        <strong>{{ assignments.length ? 'Sin resultados' : (isHistory ? 'Sin tareas en el historial' : 'Sin tareas activas') }}</strong>
        <span>
          {{ assignments.length
            ? 'Prueba con otra búsqueda.'
            : (isHistory
              ? 'Cuando venza una tarea aparecerá aquí.'
              : 'Publica tareas desde el aula de cada curso.') }}
        </span>
      </EmptyState>
    </article>
  </section>
</template>

<style scoped>
.teacher-tasks-page { display: grid; gap: 14px; }
.teacher-tasks-panel { padding: 18px 20px 16px; }
.teacher-tasks-header {
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 14px;
}
.teacher-tasks-header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.teacher-tasks-search {
  margin: 0;
  flex: 0 1 280px;
  min-width: min(100%, 200px);
  max-width: 320px;
}
.teacher-tasks-search .module-search-shell {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 10px;
}
.teacher-tasks-search .module-search-shell input {
  min-height: 38px;
  padding: 8px 0;
  font-size: 13.5px;
  font-weight: 600;
}
.teacher-tasks-loading {
  min-height: 160px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  color: var(--color-muted);
  font-size: 14px;
  font-weight: 600;
}
.teacher-task-title { display: block; font-size: 13.5px; line-height: 1.3; }
.teacher-task-preview,
.teacher-tasks-table small {
  display: block;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 550;
  margin-top: 2px;
}
.teacher-task-submissions {
  font-variant-numeric: tabular-nums;
  font-weight: 750;
}
.teacher-task-state {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
}
.teacher-task-state[data-status='active'] {
  color: var(--color-success);
  background: var(--color-success-soft);
}
.teacher-task-state[data-status='overdue'] {
  color: var(--color-muted);
  background: var(--color-canvas);
}
@media (max-width: 720px) {
  .teacher-tasks-header { flex-direction: column; align-items: stretch; }
  .teacher-tasks-header-actions { justify-content: stretch; }
  .teacher-tasks-search { max-width: none; flex: 1 1 auto; }
  .teacher-tasks-header-actions .secondary-button { width: 100%; justify-content: center; }
}
</style>
