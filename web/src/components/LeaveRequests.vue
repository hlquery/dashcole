<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronUp, ClipboardList, History, Plus, User } from '@lucide/vue';
import { request } from '../api/client.js';
import { formatDate } from '../design/format.js';
import { DataTable, EmptyState, FilterBar, SearchInput, TablePagination } from './ui/index.js';
import { useClientPagination } from '../composables/pagination.js';
import { useNotify } from '../composables/notify.js';

const props = defineProps({
  canApprove: { type: Boolean, default: false },
  mode: { type: String, default: 'list' },
});
const emit = defineEmits(['pending-change', 'go-create', 'go-list']);
const notify = useNotify();

const LEAVE_TYPE_OPTIONS = [
  { value: 'vacation', label: 'Vacaciones', hint: 'Descanso anual o feriado legal' },
  { value: 'permission', label: 'Permiso administrativo', hint: 'Ausencia con o sin goce de sueldo' },
  { value: 'medical', label: 'Licencia médica', hint: 'Reposo por salud o accidente' },
  { value: 'personal', label: 'Asunto personal', hint: 'Trámite o situación particular' },
  { value: 'bereavement', label: 'Duelo familiar', hint: 'Fallecimiento de un familiar' },
  { value: 'training', label: 'Capacitación', hint: 'Curso, taller o comisión de servicio' },
  { value: 'other', label: 'Otro', hint: 'Otro tipo de ausentismo' },
];

const TYPE_LABELS = Object.fromEntries(LEAVE_TYPE_OPTIONS.map((item) => [item.value, item.label]));

const STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  retracted: 'Retractado',
};

const panel = ref(props.canApprove ? 'inbox' : 'mine');
const rows = ref([]);
const meta = ref({ canRequest: true, canApprove: false, pendingCount: 0, employeeName: '' });
const error = ref('');
const message = ref('');
const busy = ref(false);
const reviewNotes = reactive({});
const form = reactive({
  type: 'vacation',
  startsOn: '',
  endsOn: '',
  reason: '',
});

const filters = reactive({
  q: '',
  type: '',
  status: '',
  from: '',
  to: '',
  minDays: '',
});

const sortBy = ref('createdAt');
const sortDir = ref('DESC');
const detailId = ref(null);
const detail = ref(null);
const detailLoading = ref(false);
const detailError = ref('');
const detailCanCancel = ref(false);
const detailCanReview = ref(false);
const statusDraft = ref('pending');

const isCreateMode = computed(() => props.mode === 'create');
const canApprove = computed(() => Boolean(meta.value.canApprove || props.canApprove));
const showPerson = computed(() => canApprove.value && panel.value !== 'mine');
const showingDetail = computed(() => Boolean(detailId.value) && !isCreateMode.value);
const detailStatusLabel = computed(() => STATUS_LABELS[detail.value?.status] || detail.value?.status || '—');
const detailReviewerLabel = computed(() => {
  if (!detail.value) return '—';
  if (detail.value.reviewerName) return detail.value.reviewerName;
  return detail.value.status === 'pending' ? 'Sin revisar' : '—';
});
const formDays = computed(() => {
  if (!form.startsOn || !form.endsOn || form.endsOn < form.startsOn) return 0;
  const start = new Date(`${form.startsOn}T12:00:00`);
  const end = new Date(`${form.endsOn}T12:00:00`);
  return Math.floor((end - start) / 86400000) + 1;
});
const selectedTypeOption = computed(() =>
  LEAVE_TYPE_OPTIONS.find((item) => item.value === form.type) || LEAVE_TYPE_OPTIONS[0]
);

function applyDetailResult(data = {}) {
  if (data.request) detail.value = data.request;
  if (data.canCancel != null) detailCanCancel.value = Boolean(data.canCancel);
  if (data.canReview != null) detailCanReview.value = Boolean(data.canReview);
  if (data.canApprove != null) meta.value.canApprove = Boolean(data.canApprove);
  if (data.canRequest != null) meta.value.canRequest = Boolean(data.canRequest);
  if (detail.value?.status) statusDraft.value = detail.value.status;
}

function sortGlyph(key) {
  return {
    active: sortBy.value === key,
    asc: sortBy.value === key && sortDir.value === 'ASC',
    desc: sortBy.value === key && sortDir.value === 'DESC',
  };
}

const panelRows = computed(() => {
  if (panel.value === 'inbox') return rows.value.filter((row) => row.status === 'pending');
  if (panel.value === 'history') return rows.value.filter((row) => row.status !== 'pending');
  return rows.value;
});

const filteredRows = computed(() => {
  const q = filters.q.trim().toLowerCase();
  const minDays = Number(filters.minDays) || 0;
  let list = panelRows.value.filter((row) => {
    if (filters.type && row.type !== filters.type) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.from && String(row.endsOn || '') < filters.from) return false;
    if (filters.to && String(row.startsOn || '') > filters.to) return false;
    if (minDays > 0 && Number(row.days || 0) < minDays) return false;
    if (!q) return true;
    const haystack = [
      row.employeeName,
      row.employeePosition,
      row.requesterName,
      row.reviewerName,
      row.reason,
      row.reviewerNotes,
      TYPE_LABELS[row.type],
      STATUS_LABELS[row.status],
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  const key = sortBy.value;
  const dir = sortDir.value === 'ASC' ? 1 : -1;
  const valueOf = (row) => {
    if (key === 'employeeName') return String(row.employeeName || row.requesterName || '').toLowerCase();
    if (key === 'type') return String(TYPE_LABELS[row.type] || row.type || '').toLowerCase();
    if (key === 'status') return String(STATUS_LABELS[row.status] || row.status || '').toLowerCase();
    if (key === 'days') return Number(row.days) || 0;
    if (key === 'startsOn' || key === 'endsOn' || key === 'createdAt') return String(row[key] || '');
    return String(row[key] ?? '');
  };
  return [...list].sort((a, b) => {
    const av = valueOf(a);
    const bv = valueOf(b);
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return (Number(b.id) - Number(a.id)) * dir;
  });
});

const counts = computed(() => ({
  pending: rows.value.filter((row) => row.status === 'pending').length,
  mine: rows.value.length,
  history: rows.value.filter((row) => row.status !== 'pending').length,
}));

const hasActiveFilters = computed(() =>
  Boolean(filters.q || filters.type || filters.status || filters.from || filters.to || filters.minDays)
);

const {
  page,
  pageCount,
  paged,
  rangeLabel,
  show,
  goPrev,
  goNext,
} = useClientPagination(filteredRows, {
  pageSize: 15,
  resetOn: [panel, filters, sortBy, sortDir],
});

const statusOptions = computed(() => {
  if (panel.value === 'inbox') return [{ value: 'pending', label: 'Pendiente' }];
  if (panel.value === 'history') {
    return [
      { value: 'approved', label: 'Aprobada' },
      { value: 'rejected', label: 'Rechazada' },
      { value: 'retracted', label: 'Retractado' },
      { value: 'cancelled', label: 'Cancelada' },
    ];
  }
  return Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
});

function clearFilters() {
  Object.assign(filters, { q: '', type: '', status: '', from: '', to: '', minDays: '' });
}

function toggleSort(key) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === 'ASC' ? 'DESC' : 'ASC';
    return;
  }
  sortBy.value = key;
  sortDir.value = key === 'employeeName' || key === 'type' || key === 'status' ? 'ASC' : 'DESC';
}

function sortAria(key) {
  if (sortBy.value !== key) return 'none';
  return sortDir.value === 'ASC' ? 'ascending' : 'descending';
}

async function openDetail(id, push = true) {
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId) || leaveId < 1) return;
  detailId.value = leaveId;
  detailLoading.value = true;
  detailError.value = '';
  detail.value = null;
  detailCanCancel.value = false;
  detailCanReview.value = false;
  if (push) {
    window.history.pushState({ view: 'Solicitudes', leaveId }, '', `/solicitudes/${leaveId}`);
  } else if (!window.location.pathname.endsWith(`/solicitudes/${leaveId}`)) {
    window.history.replaceState({ view: 'Solicitudes', leaveId }, '', `/solicitudes/${leaveId}`);
  }
  try {
    const data = await request(`/leave-requests/${leaveId}`);
    applyDetailResult(data);
    if (!detail.value) detailError.value = 'No se pudo abrir la solicitud.';
  } catch (err) {
    detailError.value = err.message || 'No se pudo abrir la solicitud.';
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail(push = true) {
  detailId.value = null;
  detail.value = null;
  detailError.value = '';
  if (push) {
    window.history.pushState({ view: 'Solicitudes' }, '', '/solicitudes');
  } else if (/^\/solicitudes\/\d+$/.test(window.location.pathname.replace(/\/$/, ''))) {
    window.history.replaceState({ view: 'Solicitudes' }, '', '/solicitudes');
  }
}

function onRowActivate(row, event) {
  if (event?.target?.closest?.('button, input, textarea, a, label')) return;
  openDetail(row.id);
}

async function syncDetailFromLocation() {
  const match = window.location.pathname.replace(/\/$/, '').match(/^\/solicitudes\/(\d+)$/);
  if (match) {
    await openDetail(Number(match[1]), false);
    return;
  }
  if (detailId.value) closeDetail(false);
}

async function load() {
  error.value = '';
  try {
    const scope = canApprove.value && panel.value !== 'mine' ? 'all' : 'mine';
    const [list, info] = await Promise.all([
      request(`/leave-requests?scope=${scope}`),
      request('/leave-requests/meta'),
    ]);
    rows.value = list.requests || [];
    meta.value = {
      canRequest: Boolean(list.canRequest ?? info.canRequest),
      canApprove: Boolean(list.canApprove ?? info.canApprove),
      pendingCount: info.pendingCount || 0,
      employeeId: info.employeeId || null,
      employeeName: info.employeeName || '',
    };
    emit('pending-change', Number(info.pendingCount) || 0);
    if (!canApprove.value && panel.value === 'inbox') panel.value = 'mine';
    if (!meta.value.canRequest && panel.value === 'mine') panel.value = canApprove.value ? 'inbox' : 'history';
  } catch (err) {
    error.value = err.message;
  }
}

async function perform(work) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await work();
  } catch (err) {
    error.value = err.message;
    notify(err.message || 'No se pudo completar la acción.', 'error');
  } finally {
    busy.value = false;
  }
}

function openCreate() {
  resetCreateForm();
  emit('go-create');
}

function resetCreateForm() {
  const today = new Date().toISOString().slice(0, 10);
  Object.assign(form, { type: 'vacation', startsOn: today, endsOn: today, reason: '' });
  error.value = '';
  message.value = '';
}

function createRequest() {
  if (!form.type) {
    error.value = 'Selecciona el tipo de solicitud.';
    return;
  }
  if (!form.startsOn || !form.endsOn) {
    error.value = 'Indica las fechas de la solicitud.';
    return;
  }
  if (form.endsOn < form.startsOn) {
    error.value = 'La fecha de término no puede ser anterior al inicio.';
    return;
  }
  return perform(async () => {
    await request('/leave-requests', {
      method: 'POST',
      body: JSON.stringify({
        type: form.type,
        startsOn: form.startsOn,
        endsOn: form.endsOn,
        reason: form.reason,
      }),
    });
    notify('Solicitud enviada.');
    panel.value = 'mine';
    emit('go-list');
    await load();
  });
}

function cancelRequest(row) {
  return perform(async () => {
    const result = await request(`/leave-requests/${row.id}/cancel`, { method: 'POST', body: '{}' });
    notify('Solicitud retractada.');
    if (detailId.value === row.id) applyDetailResult({
      request: result.request,
      canCancel: false,
      canReview: false,
    });
    await load();
  });
}

function approveRequest(row) {
  return perform(async () => {
    const result = await request(`/leave-requests/${row.id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes: reviewNotes[row.id] || '' }),
    });
    notify('Solicitud aprobada.');
    if (detailId.value === row.id) applyDetailResult(result);
    await load();
  });
}

function rejectRequest(row) {
  return perform(async () => {
    const result = await request(`/leave-requests/${row.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes: reviewNotes[row.id] || '' }),
    });
    notify('Solicitud rechazada.');
    if (detailId.value === row.id) applyDetailResult(result);
    await load();
  });
}

function saveDetailStatus() {
  if (!detail.value) return;
  return perform(async () => {
    const next = String(statusDraft.value || '').trim();
    if (!['pending', 'approved', 'rejected'].includes(next)) {
      throw new Error('Selecciona un estado válido.');
    }
    if (next === detail.value.status && !(reviewNotes[detail.value.id] || '').trim()) {
      notify('El estado ya está actualizado.');
      return;
    }
    const result = await request(`/leave-requests/${detail.value.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: next,
        notes: reviewNotes[detail.value.id] || '',
      }),
    });
    applyDetailResult(result);
    notify(next === 'approved' ? 'Solicitud aprobada.' : next === 'rejected' ? 'Solicitud rechazada.' : 'Solicitud reabierta como pendiente.');
    await load();
  });
}

function switchPanel(next) {
  panel.value = next;
  filters.status = '';
  load();
}

watch(panel, () => {
  if (panel.value === 'inbox' && sortBy.value === 'status') {
    sortBy.value = 'startsOn';
  }
});

watch(isCreateMode, (create) => {
  if (create) resetCreateForm();
});

onMounted(async () => {
  if (isCreateMode.value) {
    resetCreateForm();
    try {
      const info = await request('/leave-requests/meta');
      meta.value = {
        ...meta.value,
        canRequest: Boolean(info.canRequest),
        canApprove: Boolean(info.canApprove),
        pendingCount: info.pendingCount || 0,
        employeeId: info.employeeId || null,
        employeeName: info.employeeName || '',
      };
      emit('pending-change', Number(info.pendingCount) || 0);
      if (!meta.value.canRequest) {
        error.value = 'No puedes enviar solicitudes con esta cuenta.';
      }
    } catch (err) {
      error.value = err.message;
    }
    return;
  }
  await load();
  await syncDetailFromLocation();
});
</script>

<template>
  <section class="leave-requests">
    <template v-if="isCreateMode">
      <div class="profile-page-toolbar">
        <button type="button" class="secondary-button" @click="emit('go-list')">
          <ArrowLeft :size="16" />Volver a solicitudes
        </button>
      </div>

      <form class="panel standalone-form leave-create-page" @submit.prevent="createRequest">
        <div class="account-panel-heading">
          <span class="admin-icon"><CalendarDays /></span>
          <div>
            <h2>Nueva solicitud</h2>
            <p>Elige el tipo, las fechas y el motivo. Dirección o RRHH la revisarán.</p>
          </div>
        </div>

        <p v-if="error" class="login-error account-error" role="alert">{{ error }}</p>

        <div class="leave-type-picker" role="radiogroup" aria-label="Tipo de solicitud">
          <p class="leave-type-picker-label">Tipo de solicitud</p>
          <div class="leave-type-grid">
            <button
              v-for="option in LEAVE_TYPE_OPTIONS"
              :key="option.value"
              type="button"
              role="radio"
              class="leave-type-card"
              :class="{ active: form.type === option.value }"
              :aria-checked="form.type === option.value"
              @click="form.type = option.value"
            >
              <strong>{{ option.label }}</strong>
              <small>{{ option.hint }}</small>
            </button>
          </div>
        </div>

        <div class="form-grid leave-create-dates">
          <label class="field">
            <span>Desde</span>
            <input v-model="form.startsOn" type="date" required />
          </label>
          <label class="field">
            <span>Hasta</span>
            <input v-model="form.endsOn" type="date" required :min="form.startsOn || undefined" />
          </label>
          <div class="leave-days-preview">
            <small>Duración</small>
            <strong>{{ formDays > 0 ? `${formDays} ${formDays === 1 ? 'día' : 'días'}` : '—' }}</strong>
            <span>{{ selectedTypeOption.label }}</span>
          </div>
          <label class="field wide">
            <span>Motivo <small>Opcional</small></span>
            <textarea v-model.trim="form.reason" rows="4" maxlength="500" placeholder="Ej. Vacaciones familiares, control médico, trámite personal…" />
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" class="secondary-button" :disabled="busy" @click="emit('go-list')">Cancelar</button>
          <button type="submit" class="primary-button" :disabled="busy || !meta.canRequest">
            <span v-if="busy" class="spinner"></span>
            <Check v-else :size="17" />
            {{ busy ? 'Enviando…' : 'Enviar solicitud' }}
          </button>
        </div>
      </form>
    </template>

    <template v-else-if="showingDetail">
      <div class="profile-page-toolbar leave-detail-toolbar">
        <button type="button" class="secondary-button" @click="closeDetail()"><ArrowLeft :size="16" />Volver a solicitudes</button>
      </div>

      <section class="panel leave-detail-page">
        <div v-if="detailLoading" class="leave-detail-loading">Cargando solicitud…</div>
        <div v-else-if="detailError" class="error-banner">{{ detailError }}</div>
        <template v-else-if="detail">
          <header class="leave-detail-hero">
            <div>
              <span class="leave-detail-eyebrow">{{ TYPE_LABELS[detail.type] || detail.type }}</span>
              <h2>{{ detail.employeeName || detail.requesterName || 'Solicitud' }}</h2>
              <p>
                {{ formatDate(detail.startsOn) }} → {{ formatDate(detail.endsOn) }}
                · {{ detail.days }} {{ detail.days === 1 ? 'día' : 'días' }}
              </p>
            </div>
            <span class="status-badge" :class="`status-${detail.status}`">{{ detailStatusLabel }}</span>
          </header>

          <div class="leave-detail-grid">
            <article>
              <small>Persona</small>
              <strong>{{ detail.employeeName || detail.requesterName || '—' }}</strong>
              <span v-if="detail.employeePosition">{{ detail.employeePosition }}</span>
            </article>
            <article>
              <small>Tipo</small>
              <strong>{{ TYPE_LABELS[detail.type] || detail.type }}</strong>
            </article>
            <article>
              <small>Creada</small>
              <strong>{{ detail.createdAt ? formatDate(String(detail.createdAt).slice(0, 10)) : '—' }}</strong>
            </article>
            <article>
              <small>Revisor</small>
              <strong>{{ detailReviewerLabel }}</strong>
            </article>
            <article>
              <small>Estado</small>
              <strong>{{ detailStatusLabel }}</strong>
            </article>
          </div>

          <div class="leave-detail-notes">
            <article class="leave-note-box leave-note-reason">
              <header>
                <small>Motivo de la solicitud</small>
              </header>
              <p>{{ detail.reason || 'Sin motivo indicado.' }}</p>
            </article>
            <article v-if="detail.reviewerNotes" class="leave-note-box leave-note-review">
              <header>
                <small>Nota de revisión</small>
              </header>
              <p>{{ detail.reviewerNotes }}</p>
            </article>
          </div>

          <div v-if="canApprove && !['cancelled', 'retracted'].includes(detail.status)" class="leave-detail-actions leave-detail-status">
            <label class="field">
              <span>Cambiar estado</span>
              <select v-model="statusDraft">
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobada</option>
                <option value="rejected">Rechazada</option>
              </select>
            </label>
            <input
              v-model="reviewNotes[detail.id]"
              class="leave-notes"
              maxlength="500"
              placeholder="Nota (opcional)"
            />
            <button type="button" class="primary-button" :disabled="busy" @click="saveDetailStatus">
              <Check :size="15" />Guardar estado
            </button>
          </div>
          <div v-else-if="detailCanCancel" class="leave-detail-actions">
            <button type="button" class="secondary-button" :disabled="busy" @click="cancelRequest(detail)">
              Retractar solicitud
            </button>
          </div>
        </template>
      </section>
    </template>

    <template v-else>
    <header class="section-heading leave-heading">
      <div>
        <h2>Solicitudes</h2>
        <p>Los trabajadores envían solicitudes; dirección y administración las aprueban o rechazan.</p>
      </div>
      <button v-if="meta.canRequest" type="button" class="primary-button" :disabled="busy" @click="openCreate">
        <Plus :size="17" />Nueva solicitud
      </button>
    </header>

    <p v-if="!meta.canRequest && !canApprove" class="leave-success">
      Para enviar vacaciones o permisos necesitas una ficha de empleado vinculada a tu cuenta. Pide a RRHH que te agregue en Empleados.
    </p>

    <div class="leave-tabs" role="tablist" aria-label="Vistas de solicitudes">
      <button
        v-if="canApprove"
        type="button"
        role="tab"
        :aria-selected="panel === 'inbox'"
        :class="{ active: panel === 'inbox' }"
        data-tone="inbox"
        @click="switchPanel('inbox')"
      >
        <ClipboardList :size="18" aria-hidden="true" />
        <span>
          Por aprobar
          <small>Pendientes de revisión</small>
        </span>
        <em v-if="counts.pending" class="leave-count">{{ counts.pending }}</em>
      </button>
      <button
        v-if="meta.canRequest"
        type="button"
        role="tab"
        :aria-selected="panel === 'mine'"
        :class="{ active: panel === 'mine' }"
        data-tone="mine"
        @click="switchPanel('mine')"
      >
        <User :size="18" aria-hidden="true" />
        <span>
          Mis solicitudes
          <small>Las que tú enviaste</small>
        </span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="panel === 'history'"
        :class="{ active: panel === 'history' }"
        data-tone="history"
        @click="switchPanel('history')"
      >
        <History :size="18" aria-hidden="true" />
        <span>
          Historial
          <small>Aprobadas y cerradas</small>
        </span>
        <em v-if="counts.history" class="leave-count leave-count--muted">{{ counts.history }}</em>
      </button>
    </div>

    <FilterBar class="leave-filters">
      <SearchInput
        v-model="filters.q"
        label="Buscar"
        :placeholder="showPerson ? 'Persona, cargo o motivo' : 'Motivo o revisor'"
      />
      <label class="field">
        <span>Tipo</span>
        <select v-model="filters.type">
          <option value="">Todos</option>
          <option v-for="option in LEAVE_TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label v-if="panel !== 'inbox'" class="field">
        <span>Estado</span>
        <select v-model="filters.status">
          <option value="">Todos</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </label>
      <label class="field">
        <span>Desde</span>
        <input v-model="filters.from" type="date" />
      </label>
      <label class="field">
        <span>Hasta</span>
        <input v-model="filters.to" type="date" />
      </label>
      <label class="field leave-days-filter">
        <span>Días mín.</span>
        <input v-model="filters.minDays" type="number" min="1" max="365" placeholder="—" />
      </label>
      <button v-if="hasActiveFilters" type="button" class="secondary-button" @click="clearFilters">Limpiar filtros</button>
    </FilterBar>

    <p v-if="error" class="error-banner">{{ error }}</p>
    <p v-else-if="message" class="leave-success">{{ message }}</p>
    <p v-else-if="panelRows.length && !filteredRows.length" class="leave-success">
      Ninguna solicitud coincide con los filtros.
    </p>

    <div class="panel-with-pager">
          <article class="panel table-panel">
      <div class="table-scroll">
        <DataTable>
          <thead>
            <tr>
              <th
                v-if="showPerson"
                class="sortable-th"
                :class="sortGlyph('employeeName')"
                :aria-sort="sortAria('employeeName')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('employeeName')">
                  <span>Persona</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('type')"
                :aria-sort="sortAria('type')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('type')">
                  <span>Tipo</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('startsOn')"
                :aria-sort="sortAria('startsOn')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('startsOn')">
                  <span>Desde</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('endsOn')"
                :aria-sort="sortAria('endsOn')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('endsOn')">
                  <span>Hasta</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('days')"
                :aria-sort="sortAria('days')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('days')">
                  <span>Días</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('status')"
                :aria-sort="sortAria('status')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('status')">
                  <span>Estado</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th
                class="sortable-th"
                :class="sortGlyph('createdAt')"
                :aria-sort="sortAria('createdAt')"
                scope="col"
              >
                <button type="button" class="sortable-th-button" @click="toggleSort('createdAt')">
                  <span>Creada</span>
                  <span class="sort-indicator" aria-hidden="true">
                    <ChevronUp class="sort-arrow sort-arrow-up" :size="12" />
                    <ChevronDown class="sort-arrow sort-arrow-down" :size="12" />
                  </span>
                </button>
              </th>
              <th scope="col">Motivo</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in paged"
              :key="row.id"
              class="leave-row"
              tabindex="0"
              role="link"
              @click="onRowActivate(row, $event)"
              @keydown.enter.prevent="openDetail(row.id)"
              @keydown.space.prevent="openDetail(row.id)"
            >
              <td v-if="showPerson">
                <strong>{{ row.employeeName }}</strong>
                <small v-if="row.employeePosition" class="leave-meta">{{ row.employeePosition }}</small>
              </td>
              <td>{{ TYPE_LABELS[row.type] || row.type }}</td>
              <td>{{ formatDate(row.startsOn) }}</td>
              <td>{{ formatDate(row.endsOn) }}</td>
              <td>{{ row.days }}</td>
              <td><span class="status-badge" :class="`status-${row.status}`">{{ STATUS_LABELS[row.status] || row.status }}</span></td>
              <td>{{ formatDate(row.createdAt) }}</td>
              <td>
                <span class="leave-reason">{{ row.reason || '—' }}</span>
                <small v-if="row.reviewerName" class="leave-meta">
                  Revisó {{ row.reviewerName }}{{ row.reviewerNotes ? `: ${row.reviewerNotes}` : '' }}
                </small>
              </td>
              <td @click.stop>
                <button
                  v-if="panel === 'mine' && ['pending', 'approved'].includes(row.status)"
                  type="button"
                  class="edit-button"
                  :disabled="busy"
                  @click="cancelRequest(row)"
                >
                  Retractar
                </button>
                <button type="button" class="edit-button" @click="openDetail(row.id)">
                  Abrir
                </button>
              </td>
            </tr>
          </tbody>
        </DataTable>
      </div><EmptyState v-if="!panelRows.length" class="module-empty">
        <CalendarDays :size="28" />
        <strong>{{ panel === 'inbox' ? 'Nada por aprobar' : panel === 'history' ? 'Sin historial' : 'Sin solicitudes' }}</strong>
        <span>
          {{
            panel === 'inbox'
              ? 'Cuando un trabajador envíe vacaciones o un permiso, aparecerá aquí.'
              : panel === 'history'
                ? 'Las aprobadas, rechazadas o retractadas se listan en este historial.'
                : 'Crea una solicitud de vacaciones o permiso para enviarla a revisión.'
          }}
        </span>
        <button v-if="meta.canRequest && panel === 'mine'" type="button" class="primary-button" @click="openCreate">
          <Plus :size="16" />Nueva solicitud
        </button>
      </EmptyState>
              </article>

      <TablePagination
        v-model:page="page"
        :page-count="pageCount"
        :range-label="rangeLabel"
        :show="show"
      />
      
          </div>
    </template>
  </section>
</template>
