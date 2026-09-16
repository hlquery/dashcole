<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CalendarDays, Check, Clock3, Save, Search, UserRoundX, Users } from '@lucide/vue';
import { request } from '../api/client.js';
import { useClientPagination } from '../composables/pagination.js';
import { useNotify } from '../composables/notify.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({
  canEdit: Boolean,
  learner: { type: Boolean, default: false },
  hideAbsences: { type: Boolean, default: false },
});
const notify = useNotify();
const courses = ref([]);
const courseId = ref('');
const date = ref(new Date().toISOString().slice(0, 10));
const rows = ref([]);
const loading = ref(false);
const saving = ref(false);
const dirty = ref(false);
const error = ref('');
const message = ref('');
const learnerStudents = ref([]);
const learnerStudentId = ref('');
const learnerFrom = ref('');
const learnerTo = ref(new Date().toISOString().slice(0, 10));
const learnerRecords = ref([]);
const learnerSummary = ref({ total: 0, present: 0, late: 0, absent: 0, percentage: null });
const sortBy = ref('name');
const sortDir = ref('ASC');
const page = ref(1);
const pageSize = 15;
const studentSearch = ref('');
const bulkAbsentOpen = ref(false);
const bulkAbsentJustification = ref('');
let saveTimer = null;
let loadToken = 0;

const STATUS_ORDER = { present: 0, late: 1, absent: 2 };

const summary = computed(() => {
  if (props.learner) return learnerSummary.value;
  return {
    total: rows.value.length,
    present: rows.value.filter((row) => row.status === 'present').length,
    late: rows.value.filter((row) => row.status === 'late').length,
    absent: rows.value.filter((row) => row.status === 'absent').length,
  };
});
const visibleLearnerRecords = computed(() => (
  props.hideAbsences
    ? learnerRecords.value.filter((row) => row.status === 'present')
    : learnerRecords.value
));
const {
  page: learnerPage,
  pageCount: learnerPageCount,
  paged: pagedLearnerRecords,
  rangeLabel: learnerRangeLabel,
  show: showLearnerPagination,
  goPrev: learnerGoPrev,
  goNext: learnerGoNext,
} = useClientPagination(visibleLearnerRecords, {
  pageSize: 15,
  resetOn: [learnerStudentId, learnerFrom, learnerTo, () => props.hideAbsences],
});
const learnerKpis = computed(() => {
  if (!props.hideAbsences) return summary.value;
  return {
    total: summary.value.total,
    present: summary.value.present,
    late: 0,
    absent: 0,
    percentage: summary.value.percentage,
  };
});

function detailSortValue(row) {
  if (row.status === 'present') return '';
  const parts = [];
  if (row.status === 'late') {
    if (row.arrivalTime) parts.push(String(row.arrivalTime));
    if (row.lateMinutes) parts.push(String(row.lateMinutes));
  }
  if (row.lateJustification) parts.push(String(row.lateJustification));
  return parts.join(' ').toLowerCase();
}

const sortedRows = computed(() => {
  const list = [...rows.value];
  const dir = sortDir.value === 'ASC' ? 1 : -1;
  list.sort((a, b) => {
    let cmp = 0;
    if (sortBy.value === 'status') {
      cmp = (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
    } else if (sortBy.value === 'detail') {
      cmp = detailSortValue(a).localeCompare(detailSortValue(b), 'es', { sensitivity: 'base' });
    } else {
      cmp = String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' });
    }
    if (cmp === 0) cmp = String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base' });
    return cmp * dir;
  });
  return list;
});

const filteredRows = computed(() => {
  const query = studentSearch.value.trim().toLowerCase();
  if (!query) return sortedRows.value;
  return sortedRows.value.filter((row) => String(row.name || '').toLowerCase().includes(query));
});

const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)));
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});
const pageRangeLabel = computed(() => {
  if (!filteredRows.value.length) {
    return studentSearch.value.trim() ? 'Sin coincidencias' : '0 estudiantes';
  }
  const from = (page.value - 1) * pageSize + 1;
  const to = Math.min(filteredRows.value.length, page.value * pageSize);
  return `${from}–${to} de ${filteredRows.value.length}`;
});

watch(studentSearch, () => {
  page.value = 1;
});

function sortGlyph(key) {
  return {
    active: sortBy.value === key,
    asc: sortBy.value === key && sortDir.value === 'ASC',
    desc: sortBy.value === key && sortDir.value === 'DESC',
  };
}

function sortAria(key) {
  if (sortBy.value !== key) return 'none';
  return sortDir.value === 'ASC' ? 'ascending' : 'descending';
}

function toggleSort(key) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'ASC' ? 'DESC' : 'ASC';
  } else {
    sortBy.value = key;
    sortDir.value = 'ASC';
  }
  page.value = 1;
}

function goToPage(target) {
  page.value = Math.min(pageCount.value, Math.max(1, target));
}

function daysAgoIso(days) {
  const stamp = new Date();
  stamp.setDate(stamp.getDate() - days);
  return stamp.toISOString().slice(0, 10);
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function avatarTone(name) {
  const palette = ['#0067b2', '#14705c', '#97551c', '#5b6abf', '#0f766e', '#8a3a4f'];
  const text = String(name || '');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash + text.charCodeAt(i) * (i + 1)) % palette.length;
  return palette[hash];
}

function statusLabel(status) {
  return ({ present: 'Presente', late: 'Atraso', absent: 'Ausente' })[status] || status;
}

function formatDate(value) {
  if (!value) return '—';
  const dateValue = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(dateValue.getTime())) return String(value).slice(0, 10);
  return dateValue.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nowTime() {
  const stamp = new Date();
  return `${String(stamp.getHours()).padStart(2, '0')}:${String(stamp.getMinutes()).padStart(2, '0')}`;
}

function clearLateFields(row) {
  Object.assign(row, {
    arrivalTime: '',
    lateMinutes: '',
    lateReason: '',
    lateJustification: '',
    lateObservation: '',
  });
}

function clearArrivalFields(row) {
  row.arrivalTime = '';
  row.lateMinutes = '';
}

function ensureLateDefaults(row) {
  if (!row.lateMinutes) row.lateMinutes = 5;
  if (!row.arrivalTime) row.arrivalTime = nowTime();
}

function markDirty() {
  dirty.value = true;
  message.value = '';
}

function queueSave(delay = 450) {
  if (!props.canEdit || !rows.value.length) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { save({ silent: true }); }, delay);
}

async function loadLearner() {
  const token = ++loadToken;
  loading.value = true;
  error.value = '';
  try {
    if (!learnerFrom.value) learnerFrom.value = daysAgoIso(90);
    if (!learnerTo.value) learnerTo.value = new Date().toISOString().slice(0, 10);
    const params = new URLSearchParams({
      from: learnerFrom.value,
      to: learnerTo.value,
    });
    if (learnerStudentId.value) params.set('studentId', learnerStudentId.value);
    const data = await request(`/attendance/me?${params}`);
    if (token !== loadToken) return;
    learnerStudents.value = data.students || [];
    learnerStudentId.value = data.selectedStudentId ? String(data.selectedStudentId) : '';
    learnerFrom.value = data.from || learnerFrom.value;
    learnerTo.value = data.to || learnerTo.value;
    learnerRecords.value = data.records || [];
    learnerSummary.value = data.summary || { total: 0, present: 0, late: 0, absent: 0, percentage: null };
  } catch (cause) {
    if (token !== loadToken) return;
    error.value = cause.message;
    learnerRecords.value = [];
  } finally {
    if (token === loadToken) loading.value = false;
  }
}

async function loadCourses() {
  try {
    const data = await request('/schedules');
    courses.value = data.courses || [];
    if (courses.value.length && !courseId.value) courseId.value = String(courses.value[0].id);
    await load();
  } catch (cause) {
    error.value = cause.message;
  }
}

async function load() {
  if (!courseId.value || !date.value) return;
  const token = ++loadToken;
  loading.value = true;
  error.value = '';
  try {
    const data = await request(`/courses/${courseId.value}/attendance?date=${encodeURIComponent(date.value)}`);
    if (token !== loadToken) return;
    rows.value = data.map((student) => ({
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      status: student.attendance?.status || 'present',
      arrivalTime: student.attendance?.arrivalTime?.slice(0, 5) || '',
      lateMinutes: student.attendance?.lateMinutes || '',
      lateReason: student.attendance?.lateReason || '',
      lateJustification: student.attendance?.lateJustification || student.attendance?.lateReason || '',
      lateObservation: student.attendance?.lateObservation || '',
    }));
    page.value = 1;
    studentSearch.value = '';
    dirty.value = false;
  } catch (cause) {
    if (token !== loadToken) return;
    error.value = cause.message;
    rows.value = [];
    page.value = 1;
  } finally {
    if (token === loadToken) loading.value = false;
  }
}

async function changeCourseOrDate() {
  if (dirty.value && props.canEdit) {
    const ok = window.confirm('Hay cambios sin guardar. ¿Guardar antes de cambiar?');
    if (ok) {
      const saved = await save({ silent: true });
      if (!saved) return;
    }
  }
  await load();
}

function onStatusChange(row) {
  if (!props.canEdit) return;
  if (row.status === 'late') ensureLateDefaults(row);
  else if (row.status === 'absent') clearArrivalFields(row);
  else clearLateFields(row);
  markDirty();
  queueSave(250);
}

function onLateFieldEdit() {
  if (!props.canEdit) return;
  markDirty();
  queueSave(700);
}

function markAll(status) {
  if (!props.canEdit) return;
  if (status === 'absent') {
    bulkAbsentJustification.value = '';
    bulkAbsentOpen.value = true;
    return;
  }
  applyMarkAll(status);
}

function applyMarkAll(status, justification = '') {
  if (!props.canEdit) return;
  const shared = String(justification || '').trim();
  rows.value.forEach((row) => {
    row.status = status;
    if (status === 'late') ensureLateDefaults(row);
    else if (status === 'absent') {
      clearArrivalFields(row);
      if (shared) {
        row.lateJustification = shared;
        row.lateReason = shared;
      }
    } else clearLateFields(row);
  });
  markDirty();
  queueSave(200);
}

function closeBulkAbsentModal() {
  bulkAbsentOpen.value = false;
  bulkAbsentJustification.value = '';
}

function confirmBulkAbsent({ withJustification = false } = {}) {
  const text = withJustification ? bulkAbsentJustification.value : '';
  if (withJustification && !String(text || '').trim()) {
    notify('Escribe la justificación para aplicarla a todos.', 'error');
    return;
  }
  closeBulkAbsentModal();
  applyMarkAll('absent', text);
}

async function save({ silent = false } = {}) {
  if (!props.canEdit || !courseId.value || !rows.value.length) return false;
  clearTimeout(saveTimer);
  saving.value = true;
  error.value = '';
  if (!silent) message.value = '';
  try {
    const payload = {
      date: date.value,
      records: rows.value.map((row) => {
        const needsDetail = row.status === 'late' || row.status === 'absent';
        return {
          studentId: row.studentId,
          status: row.status,
          arrivalTime: row.status === 'late' ? (row.arrivalTime || null) : null,
          lateMinutes: row.status === 'late' ? Number(row.lateMinutes) || 5 : null,
          lateReason: needsDetail ? row.lateReason : '',
          lateJustification: needsDetail ? row.lateJustification : '',
          lateObservation: needsDetail ? row.lateObservation : '',
        };
      }),
    };
    const data = await request(`/courses/${courseId.value}/attendance`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    dirty.value = false;
    const text = silent
      ? `Guardado automático · ${data.saved} estudiantes`
      : `Asistencia guardada: ${data.saved} estudiantes, ${data.late} atrasos.`;
    if (!silent) message.value = text;
    notify(text, silent ? 'info' : 'success');
    return true;
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo guardar la asistencia.', 'error');
    return false;
  } finally {
    saving.value = false;
  }
}

watch(() => props.canEdit, (value) => {
  if (!value) clearTimeout(saveTimer);
});

onMounted(() => {
  if (props.learner) loadLearner();
  else loadCourses();
});
onBeforeUnmount(() => clearTimeout(saveTimer));
</script>

<template>
  <section class="attendance-page">
    <template v-if="learner">
      <div class="panel attendance-toolbar">
        <label v-if="learnerStudents.length > 1" class="field attendance-course-field">
          <span>Estudiante</span>
          <select v-model="learnerStudentId" @change="loadLearner">
            <option v-for="student in learnerStudents" :key="student.id" :value="String(student.id)">
              {{ student.fullName }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>Desde</span>
          <input v-model="learnerFrom" type="date" @change="loadLearner" />
        </label>
        <label class="field">
          <span>Hasta</span>
          <input v-model="learnerTo" type="date" @change="loadLearner" />
        </label>
        <div class="attendance-toolbar-meta" aria-live="polite">
          <span class="attendance-toolbar-count">
            {{ summary.percentage != null ? `${summary.percentage}% de asistencia` : 'Sin registros' }}
          </span>
          <span class="attendance-toolbar-hint">Historial del período seleccionado</span>
        </div>
      </div>

      <div v-if="learnerKpis.total" class="attendance-kpis" :class="{ 'attendance-kpis-compact': hideAbsences }" aria-label="Resumen de asistencia">
        <article class="panel attendance-kpi" data-tone="present">
          <span><Check :size="16" /></span>
          <div><strong>{{ learnerKpis.present }}</strong><small>Presentes</small></div>
        </article>
        <article v-if="!hideAbsences" class="panel attendance-kpi" data-tone="late">
          <span><Clock3 :size="16" /></span>
          <div><strong>{{ learnerKpis.late }}</strong><small>Atrasos</small></div>
        </article>
        <article v-if="!hideAbsences" class="panel attendance-kpi" data-tone="absent">
          <span><UserRoundX :size="16" /></span>
          <div><strong>{{ learnerKpis.absent }}</strong><small>Ausentes</small></div>
        </article>
        <article class="panel attendance-kpi" data-tone="total">
          <span><Users :size="16" /></span>
          <div>
            <strong>{{ hideAbsences && learnerKpis.percentage != null ? `${learnerKpis.percentage}%` : learnerKpis.total }}</strong>
            <small>{{ hideAbsences ? 'Asistencia' : 'Registros' }}</small>
          </div>
        </article>
      </div>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <div v-if="loading" class="panel attendance-loading" role="status">
        <CalendarDays :size="18" />
        Cargando tu asistencia…
      </div>

      <div v-else-if="visibleLearnerRecords.length" class="panel-with-pager">
      <div class="panel attendance-board">
        <div class="attendance-board-head">
          <div>
            <h3>{{ hideAbsences ? 'Días presentes' : 'Tu historial' }}</h3>
            <p>{{ hideAbsences ? 'Registros de asistencia en el período seleccionado.' : 'Registros de presencia, atraso y ausencia por asignatura.' }}</p>
          </div>
        </div>
        <div class="attendance-table-wrap">
          <table class="attendance-table learner-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Asignatura</th>
                <th v-if="!hideAbsences">Estado</th>
                <th v-if="!hideAbsences">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in pagedLearnerRecords"
                :key="row.id"
                class="attendance-row"
                :data-status="hideAbsences ? 'present' : row.status"
              >
                <td>{{ formatDate(row.attendedOn) }}</td>
                <td>{{ row.courseLabel }}</td>
                <td v-if="!hideAbsences">
                  <span class="learner-status" :data-status="row.status">{{ statusLabel(row.status) }}</span>
                </td>
                <td v-if="!hideAbsences">
                  <template v-if="row.status === 'late'">
                    <span v-if="row.arrivalTime">Llegada {{ String(row.arrivalTime).slice(0, 5) }}</span>
                    <span v-if="row.lateMinutes"> · {{ row.lateMinutes }} min</span>
                    <span v-if="row.lateJustification"> · {{ row.lateJustification }}</span>
                  </template>
                  <template v-else-if="row.status === 'absent'">
                    {{ row.lateJustification || '—' }}
                  </template>
                  <template v-else>—</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
        <TablePagination
          v-model:page="learnerPage"
          :page-count="learnerPageCount"
          :range-label="learnerRangeLabel"
          :show="showLearnerPagination"
        />
      </div>

      <div v-else class="panel attendance-empty">
        <CalendarDays :size="28" />
        <strong>{{ hideAbsences ? 'Sin días presentes en este período' : 'Sin registros en este período' }}</strong>
        <span>Cuando el profesor pase lista, verás aquí tu asistencia.</span>
      </div>
    </template>

    <template v-else>
      <div class="panel attendance-toolbar">
        <label class="field attendance-course-field">
          <span>Curso / asignatura</span>
          <select v-model="courseId" @change="changeCourseOrDate">
            <option v-for="course in courses" :key="course.id" :value="String(course.id)">
              {{ course.name }} {{ course.section }} · {{ course.subject }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>Fecha</span>
          <input v-model="date" type="date" @change="changeCourseOrDate" />
        </label>
        <label class="field attendance-search-field">
          <span>Buscar estudiante</span>
          <div class="attendance-search-shell">
            <Search :size="16" aria-hidden="true" />
            <input
              v-model="studentSearch"
              type="search"
              placeholder="Nombre del estudiante…"
              aria-label="Buscar estudiante en la lista"
              :disabled="!rows.length"
            />
          </div>
        </label>
        <small
          class="attendance-save-state"
          :data-state="dirty ? 'dirty' : saving ? 'saving' : ''"
          aria-live="polite"
        >
          <template v-if="dirty">Cambios sin guardar</template>
          <template v-else-if="saving">Guardando…</template>
          <template v-else>&nbsp;</template>
        </small>
      </div>

      <p v-if="!canEdit" class="attendance-readonly" role="status">
        Solo lectura: tu cuenta puede ver la asistencia, pero no registrarla. Pide permiso de notas/colegio o entra como profesor del curso.
      </p>

      <div v-if="rows.length" class="attendance-kpis" aria-label="Resumen del día">
        <article class="panel attendance-kpi" data-tone="present">
          <span><Check :size="16" /></span>
          <div><strong>{{ summary.present }}</strong><small>Presentes</small></div>
        </article>
        <article class="panel attendance-kpi" data-tone="late">
          <span><Clock3 :size="16" /></span>
          <div><strong>{{ summary.late }}</strong><small>Atrasos</small></div>
        </article>
        <article class="panel attendance-kpi" data-tone="absent">
          <span><UserRoundX :size="16" /></span>
          <div><strong>{{ summary.absent }}</strong><small>Ausentes</small></div>
        </article>
        <article class="panel attendance-kpi" data-tone="total">
          <span><Users :size="16" /></span>
          <div><strong>{{ summary.total }}</strong><small>En lista</small></div>
        </article>
      </div>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <p v-if="message" class="success-message" role="status">{{ message }}</p>

      <div v-if="loading" class="panel attendance-loading" role="status">
        <CalendarDays :size="18" />
        Cargando lista de asistencia…
      </div>

      <div v-else-if="rows.length" class="panel-with-pager">
      <div class="panel attendance-board">
        <div class="attendance-board-head">
          <div>
            <h3>Lista de asistencia</h3>
            <p>
              <template v-if="studentSearch.trim() && !filteredRows.length">Ningún estudiante coincide con “{{ studentSearch.trim() }}”.</template>
              <template v-else>Cambia el estado en el menú. Se guarda solo. En atraso o ausente puedes agregar justificación.</template>
            </p>
          </div>
          <div v-if="canEdit" class="attendance-quick-actions">
            <button type="button" class="secondary-button" :disabled="saving" @click="markAll('present')">
              <Check :size="15" />Todos presentes
            </button>
            <button type="button" class="secondary-button" :disabled="saving" @click="markAll('absent')">
              <UserRoundX :size="15" />Todos ausentes
            </button>
          </div>
        </div>

        <div v-if="filteredRows.length" class="attendance-table-wrap">
          <table class="attendance-table">
            <thead>
              <tr>
                <th class="attendance-col-index">#</th>
                <th
                  class="attendance-col-student sortable-th"
                  :class="sortGlyph('name')"
                  :aria-sort="sortAria('name')"
                  scope="col"
                >
                  <button type="button" class="sortable-th-button" @click="toggleSort('name')">
                    <span>Estudiante</span>
                    <span class="sort-indicator" aria-hidden="true">
                      <span class="sort-bar sort-bar-up"></span>
                      <span class="sort-bar sort-bar-down"></span>
                    </span>
                  </button>
                </th>
                <th
                  class="attendance-col-status sortable-th"
                  :class="sortGlyph('status')"
                  :aria-sort="sortAria('status')"
                  scope="col"
                >
                  <button type="button" class="sortable-th-button" @click="toggleSort('status')">
                    <span>Estado</span>
                    <span class="sort-indicator" aria-hidden="true">
                      <span class="sort-bar sort-bar-up"></span>
                      <span class="sort-bar sort-bar-down"></span>
                    </span>
                  </button>
                </th>
                <th
                  class="attendance-col-detail sortable-th"
                  :class="sortGlyph('detail')"
                  :aria-sort="sortAria('detail')"
                  scope="col"
                >
                  <button type="button" class="sortable-th-button" @click="toggleSort('detail')">
                    <span>Detalle / justificación</span>
                    <span class="sort-indicator" aria-hidden="true">
                      <span class="sort-bar sort-bar-up"></span>
                      <span class="sort-bar sort-bar-down"></span>
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in pagedRows"
                :key="row.studentId"
                class="attendance-row"
                :data-status="row.status"
              >
                <td class="attendance-col-index">{{ (page - 1) * pageSize + index + 1 }}</td>
                <td class="attendance-col-student">
                  <div class="attendance-student">
                    <span class="attendance-avatar" :style="{ background: avatarTone(row.name) }">{{ initials(row.name) }}</span>
                    <div>
                      <strong>{{ row.name }}</strong>
                      <small>{{ statusLabel(row.status) }}</small>
                    </div>
                  </div>
                </td>
                <td class="attendance-col-status">
                  <label class="attendance-status-field">
                    <span class="sr-only">Estado de {{ row.name }}</span>
                    <select
                      v-model="row.status"
                      class="attendance-status-select"
                      :data-status="row.status"
                      :disabled="!canEdit || saving"
                      @change="onStatusChange(row)"
                    >
                      <option value="present">Presente</option>
                      <option value="late">Atraso</option>
                      <option value="absent">Ausente</option>
                    </select>
                  </label>
                </td>
                <td class="attendance-col-detail">
                  <div class="attendance-detail-slot" :data-status="row.status">
                    <div class="attendance-late-inline" :hidden="row.status !== 'late'">
                      <label>
                        <span class="sr-only">Llegada</span>
                        <input v-model="row.arrivalTime" type="time" aria-label="Hora de llegada" :disabled="!canEdit || saving || row.status !== 'late'" @change="onLateFieldEdit" @input="onLateFieldEdit" />
                      </label>
                      <label>
                        <span class="sr-only">Minutos</span>
                        <input v-model.number="row.lateMinutes" type="number" min="1" max="720" aria-label="Minutos de atraso" placeholder="Min" :disabled="!canEdit || saving || row.status !== 'late'" @change="onLateFieldEdit" @input="onLateFieldEdit" />
                      </label>
                      <label class="attendance-late-grow">
                        <span class="sr-only">Justificación (opcional)</span>
                        <input v-model.trim="row.lateJustification" maxlength="1000" aria-label="Justificación del atraso" placeholder="Justificación (opcional)" :disabled="!canEdit || saving || row.status !== 'late'" @change="onLateFieldEdit" @input="onLateFieldEdit" />
                      </label>
                    </div>
                    <div class="attendance-late-inline" :hidden="row.status !== 'absent'">
                      <label class="attendance-late-grow">
                        <span class="sr-only">Justificación (opcional)</span>
                        <input v-model.trim="row.lateJustification" maxlength="1000" aria-label="Justificación de la ausencia" placeholder="Justificación (opcional)" :disabled="!canEdit || saving || row.status !== 'absent'" @change="onLateFieldEdit" @input="onLateFieldEdit" />
                      </label>
                    </div>
                    <span class="attendance-dash" :hidden="row.status !== 'present'">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="attendance-search-empty">
          <Search :size="22" />
          <strong>Sin coincidencias</strong>
          <span>Prueba con otro nombre o limpia el buscador.</span>
        </div>

        <div v-if="canEdit" class="attendance-actions">
          <span>
            {{ summary.present }} presentes · {{ summary.late }} atrasos · {{ summary.absent }} ausentes
            <template v-if="dirty"> · pendientes de confirmar</template>
          </span>
          <button type="button" class="primary-button" :disabled="saving || !dirty" @click="save()">
            <span v-if="saving" class="spinner"></span>
            <Save v-else :size="16" />
            {{ saving ? 'Guardando…' : dirty ? 'Guardar ahora' : 'Guardado' }}
          </button>
        </div>
      </div>
        <TablePagination
          :page="page"
          :page-count="pageCount"
          :range-label="pageRangeLabel"
          @goto="goToPage"
        />
      </div>

      <div v-else-if="courseId" class="panel attendance-empty">
        <Users :size="28" />
        <strong>Sin estudiantes en este curso</strong>
        <span>Matricula alumnos en la asignatura para poder registrar asistencia.</span>
      </div>
      <div v-else class="panel attendance-empty">
        <CalendarDays :size="28" />
        <strong>Selecciona un curso</strong>
        <span>Elige una asignatura y fecha para comenzar el registro.</span>
      </div>
    </template>

    <div
      v-if="bulkAbsentOpen"
      class="attendance-bulk-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-bulk-absent-title"
      @keydown.esc.prevent="closeBulkAbsentModal"
    >
      <button type="button" class="attendance-bulk-backdrop" aria-label="Cerrar" @click="closeBulkAbsentModal" />
      <div class="attendance-bulk-card panel">
        <h3 id="attendance-bulk-absent-title">Marcar todos ausentes</h3>
        <p>¿Deseas agregar la misma justificación a todos por igual?</p>
        <label class="field">
          <span>Justificación compartida</span>
          <textarea
            v-model.trim="bulkAbsentJustification"
            rows="3"
            maxlength="1000"
            placeholder="Ej. Salida pedagógica / reunión de apoderados"
          />
        </label>
        <div class="attendance-bulk-actions">
          <button type="button" class="secondary-button" @click="closeBulkAbsentModal">Cancelar</button>
          <button type="button" class="secondary-button" @click="confirmBulkAbsent({ withJustification: false })">
            Sin justificación
          </button>
          <button type="button" class="primary-button" @click="confirmBulkAbsent({ withJustification: true })">
            Aplicar a todos
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.attendance-page { display: grid; gap: 14px; }
.attendance-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: end;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 16%, var(--color-border));
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-primary-soft) 55%, #fff), var(--color-surface));
  box-shadow: 0 1px 2px color-mix(in srgb, var(--color-dark) 4%, transparent);
}
.attendance-toolbar .field { margin: 0; min-width: 170px; }
.attendance-course-field { flex: 1 1 240px; min-width: min(100%, 240px); }
.attendance-search-field {
  flex: 1 1 220px;
  min-width: min(100%, 220px);
  max-width: 320px;
}
.attendance-search-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #dce2eb;
  border-radius: 11px;
  background: #f5f7fa;
  color: var(--color-muted);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.attendance-search-shell:focus-within {
  border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-text);
}
.attendance-search-shell svg { flex: 0 0 auto; opacity: .8; }
.attendance-search-shell input {
  min-width: 0;
  flex: 1;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: 8px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 14px;
  font-weight: 650;
}
.attendance-search-shell input:disabled {
  opacity: .55;
  cursor: not-allowed;
}
.attendance-search-shell input::placeholder {
  color: var(--color-subtle);
  font-weight: 550;
}
.attendance-toolbar-meta {
  margin-left: auto;
  display: grid;
  gap: 2px;
  text-align: right;
  min-width: 160px;
  align-content: end;
}
.attendance-toolbar-count {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: -.01em;
}
.attendance-toolbar-hint {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 550;
}
.attendance-save-state {
  margin-left: auto;
  display: block;
  min-height: 1.2em;
  align-self: end;
  padding-bottom: 10px;
  color: var(--color-muted);
  font-weight: 700;
  text-align: right;
}
.attendance-save-state[data-state='dirty'] { color: var(--color-warning); }
.attendance-save-state[data-state='saving'] { color: var(--color-primary); }
.attendance-readonly {
  margin: 0; padding: 12px 14px; border-radius: 12px;
  border: 1px solid var(--color-border); background: var(--color-canvas);
  color: var(--color-muted); font-size: 13px;
}
.attendance-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.attendance-kpis-compact { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.attendance-kpi { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.attendance-kpi > span { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; }
.attendance-kpi strong { display: block; font-size: 20px; line-height: 1; }
.attendance-kpi small { color: var(--color-muted); font-size: 11px; font-weight: 650; }
.attendance-kpi[data-tone='present'] > span { color: var(--color-success); background: var(--color-success-soft); }
.attendance-kpi[data-tone='late'] > span { color: var(--color-warning); background: var(--color-warning-soft); }
.attendance-kpi[data-tone='absent'] > span { color: var(--color-error); background: var(--color-error-soft); }
.attendance-kpi[data-tone='total'] > span { color: var(--color-primary); background: var(--color-primary-soft); }
.attendance-loading, .attendance-empty, .attendance-search-empty {
  min-height: 200px; display: grid; place-content: center; justify-items: center;
  gap: 8px; text-align: center; color: var(--color-muted); padding: 28px 18px;
}
.attendance-search-empty { min-height: 160px; }
.attendance-empty strong, .attendance-search-empty strong { color: var(--color-text); font-size: 15px; }
.attendance-board { padding: 0; overflow: hidden; }
.attendance-board-head {
  display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between;
  gap: 12px; padding: 16px 18px; border-bottom: 1px solid var(--color-border);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-canvas) 70%, #fff), color-mix(in srgb, var(--color-primary-soft) 22%, #fff));
}
.attendance-board-head h3 { margin: 0 0 4px; font-size: 15px; }
.attendance-board-head p { margin: 0; color: var(--color-muted); font-size: 12px; max-width: 58ch; }
.attendance-quick-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.attendance-table-wrap { overflow-x: auto; }
.attendance-table { width: 100%; border-collapse: collapse; min-width: 720px; white-space: normal; }
.learner-table { min-width: 640px; }
.attendance-table th {
  position: sticky; top: 0; z-index: 1; text-align: left; padding: 11px 14px;
  color: var(--color-muted); background: var(--color-surface); border-bottom: 1px solid var(--color-border);
  font-size: 10px; font-weight: 750; letter-spacing: .04em; text-transform: uppercase;
}
.attendance-table th.sortable-th { padding: 0; }
.attendance-table .sortable-th-button {
  padding: 11px 14px;
  color: inherit;
  font: inherit;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.attendance-table .sortable-th.active .sortable-th-button { color: var(--color-primary); }
.attendance-table td {
  padding: 10px 14px; border-bottom: 1px solid var(--color-border);
  vertical-align: top; background: var(--color-surface); white-space: normal;
}
.attendance-col-index {
  width: 42px; color: var(--color-subtle); font-variant-numeric: tabular-nums;
  font-size: 12px; font-weight: 650; vertical-align: middle;
}
.attendance-col-student,
.attendance-col-status,
.attendance-col-detail { vertical-align: middle; }
.attendance-col-detail { min-width: 320px; width: 46%; }
.attendance-row[data-status='late'] > td { background: color-mix(in srgb, var(--color-warning-soft) 42%, white); }
.attendance-row[data-status='absent'] > td { background: color-mix(in srgb, var(--color-error-soft) 42%, white); }
.attendance-student { display: flex; align-items: center; gap: 10px; min-width: 180px; }
.attendance-avatar {
  flex: 0 0 auto; width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center;
  color: #fff; font-size: 11px; font-weight: 750;
}
.attendance-student strong { display: block; font-size: 13px; line-height: 1.25; }
.attendance-student small { color: var(--color-muted); font-size: 11px; }
.learner-status {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
}
.learner-status[data-status='present'] { color: var(--color-success); background: var(--color-success-soft); }
.learner-status[data-status='late'] { color: var(--color-warning); background: var(--color-warning-soft); }
.learner-status[data-status='absent'] { color: var(--color-error); background: var(--color-error-soft); }
.attendance-status-field { display: block; margin: 0; min-width: 140px; }
.attendance-status-select {
  width: 100%; min-height: 38px; padding: 0 34px 0 12px; border: 1px solid var(--color-border);
  border-radius: 10px; color: var(--color-text); background-color: var(--color-surface);
  font: 700 13px/1 var(--font-primary, inherit); cursor: pointer; appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--color-muted) 50%),
    linear-gradient(135deg, var(--color-muted) 50%, transparent 50%);
  background-position: calc(100% - 16px) calc(50% - 2px), calc(100% - 11px) calc(50% - 2px);
  background-size: 5px 5px, 5px 5px; background-repeat: no-repeat;
}
.attendance-status-select:disabled { cursor: default; opacity: .75; }
.attendance-status-select[data-status='present'] {
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 28%, var(--color-border));
  background-color: var(--color-success-soft);
}
.attendance-status-select[data-status='late'] {
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 28%, var(--color-border));
  background-color: var(--color-warning-soft);
}
.attendance-status-select[data-status='absent'] {
  color: var(--color-error);
  border-color: color-mix(in srgb, var(--color-error) 28%, var(--color-border));
  background-color: var(--color-error-soft);
}
.attendance-detail-slot {
  position: relative;
  min-height: 38px;
  display: flex;
  align-items: center;
}
.attendance-detail-slot > [hidden] {
  display: none !important;
}
.attendance-dash {
  color: var(--color-border);
  line-height: 38px;
  padding-bottom: 0;
}
.attendance-late-inline {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  width: 100%;
  min-height: 38px;
}
.attendance-late-inline label { display: block; margin: 0; min-width: 0; }
.attendance-late-inline input {
  width: 100%;
  min-height: 38px; padding: 0 10px; border: 1px solid var(--color-border);
  border-radius: 10px; background: var(--color-surface); color: var(--color-text); font-size: 13px;
}
.attendance-late-inline input[type='number'] { width: 78px; }
.attendance-late-inline input[type='time'] { width: 110px; }
.attendance-late-grow { flex: 1 1 160px; min-width: 140px; }
@media (max-width: 900px) {
  .attendance-late-inline { flex-wrap: wrap; }
}
.attendance-actions {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 18px; border-top: 1px solid var(--color-border); background: var(--color-canvas);
}
.attendance-pagination {
  border-top: 1px solid var(--color-border);
  background: var(--color-canvas);
}
.attendance-pagination > span { color: var(--color-muted); font-size: 12px; font-weight: 650; }
.attendance-actions > span { color: var(--color-muted); font-size: 12px; font-weight: 650; }
@media (max-width: 900px) {
  .attendance-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .attendance-search-field { max-width: none; flex: 1 1 100%; }
  .attendance-save-state { margin-left: 0; width: 100%; text-align: left; padding-bottom: 0; }
}
@media (max-width: 640px) {
  .attendance-kpis { grid-template-columns: 1fr; }
  .attendance-actions { flex-direction: column; align-items: stretch; }
  .attendance-actions .primary-button { width: 100%; }
}
.attendance-bulk-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 20px;
}
.attendance-bulk-backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: color-mix(in srgb, var(--color-dark) 42%, transparent);
  cursor: pointer;
}
.attendance-bulk-card {
  position: relative;
  z-index: 1;
  width: min(440px, 100%);
  padding: 20px 22px;
  display: grid;
  gap: 12px;
  box-shadow: 0 18px 48px color-mix(in srgb, var(--color-dark) 22%, transparent);
}
.attendance-bulk-card h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -.02em;
}
.attendance-bulk-card > p {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
  line-height: 1.45;
}
.attendance-bulk-card .field { margin: 0; }
.attendance-bulk-card textarea {
  width: 100%;
  min-height: 84px;
  resize: vertical;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  background: #fff;
  color: var(--color-text);
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
}
.attendance-bulk-card textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 14%, transparent);
}
.attendance-bulk-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
