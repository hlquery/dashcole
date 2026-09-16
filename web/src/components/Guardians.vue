<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ArrowLeft, Check, Link2, Plus, Search, Send, Unlink, UserPlus, Users, X } from '@lucide/vue';
import { request } from '../api/client.js';
import { useNotify } from '../composables/notify.js';
import { useClientPagination } from '../composables/pagination.js';
import { DataTable, TablePagination } from './ui/index.js';

const emit = defineEmits(['open-student', 'open-communication', 'go-list', 'go-create', 'go-detail']);

const props = defineProps({
  focusId: { type: [Number, String], default: null },
  mode: { type: String, default: 'list' },
});
const notify = useNotify();

const rows = ref([]);
const detail = ref(null);
const summary = ref({ total: 0, withStudents: 0, withoutStudents: 0, links: 0 });
const search = ref('');
const error = ref('');
const message = ref('');
const loading = ref(false);
const busy = ref(false);
const unlinkTarget = ref(null);
const studentSearch = ref('');
const studentCandidates = ref([]);
const createStudentSearch = ref('');
const createStudentCandidates = ref([]);
const createForm = reactive({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  nationalId: '',
  studentId: '',
  studentLabel: '',
  relationshipKind: 'Mamá',
  relationshipOther: '',
});
const editForm = reactive({
  fullName: '',
  email: '',
  phone: '',
  nationalId: '',
});
const RELATIONSHIP_OPTIONS = ['Mamá', 'Papá', 'Hermano', 'Tío', 'Otro'];

const assignForm = reactive({
  studentId: '',
  relationshipKind: 'Mamá',
  relationshipOther: '',
});

const isCreateMode = computed(() => props.mode === 'create');
const isDetailMode = computed(() => props.mode === 'detail');
const selected = computed(() => (isDetailMode.value ? detail.value : null));
const {
  page: listPage,
  pageCount: listPageCount,
  paged: pagedRows,
  rangeLabel: listRangeLabel,
  show: showListPagination,
  reset: resetListPage,
} = useClientPagination(rows, { pageSize: 15, resetOn: search });

function resolveRelationship(kind, other) {
  if (kind === 'Otro') return String(other || '').trim() || 'Otro';
  return kind || 'Mamá';
}

function initials(...parts) {
  return parts
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

function studentsSummary(row) {
  const students = row?.students || [];
  if (!students.length) return 'Sin estudiantes';
  if (students.length === 1) return `${students[0].firstName} ${students[0].lastName}`.trim();
  return `${students[0].firstName} ${students[0].lastName} +${students.length - 1}`;
}

function syncEditForm() {
  const row = selected.value;
  Object.assign(editForm, {
    fullName: row?.fullName || '',
    email: row?.email || '',
    phone: row?.phone || '',
    nationalId: row?.nationalId || '',
  });
  assignForm.studentId = '';
  assignForm.relationshipKind = 'Mamá';
  assignForm.relationshipOther = '';
  studentSearch.value = '';
  studentCandidates.value = [];
}

async function loadList() {
  loading.value = true;
  error.value = '';
  try {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set('q', search.value.trim());
    const data = await request(`/guardians/directory${params.toString() ? `?${params}` : ''}`);
    rows.value = data.rows || [];
    summary.value = data.summary || { total: 0, withStudents: 0, withoutStudents: 0, links: 0 };
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}

async function loadDetail() {
  const id = Number(props.focusId);
  if (!Number.isSafeInteger(id) || id < 1) {
    error.value = 'Apoderado inválido.';
    detail.value = null;
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const data = await request(`/guardians/${id}`);
    detail.value = data.guardian || null;
    if (!detail.value) throw new Error('Apoderado no encontrado.');
    syncEditForm();
  } catch (cause) {
    detail.value = null;
    error.value = cause.message || 'No se pudo cargar el apoderado.';
  } finally {
    loading.value = false;
  }
}

async function load() {
  if (isCreateMode.value) return;
  if (isDetailMode.value) return loadDetail();
  return loadList();
}

function openGuardian(row) {
  emit('go-detail', row.id);
}

function resetCreateForm() {
  Object.assign(createForm, {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    nationalId: '',
    studentId: '',
    studentLabel: '',
    relationshipKind: 'Mamá',
    relationshipOther: '',
  });
  createStudentSearch.value = '';
  createStudentCandidates.value = [];
  error.value = '';
  message.value = '';
}

function openCreate() {
  resetCreateForm();
  emit('go-create');
}

async function searchStudentOptions(query, { excludeLinked = false } = {}) {
  const q = String(query || '').trim();
  if (q.length < 2) return [];
  try {
    const data = await request(`/students?q=${encodeURIComponent(q)}`);
    const list = Array.isArray(data) ? data : (data.data || data.rows || data.students || []);
    const linked = excludeLinked
      ? new Set((selected.value?.students || []).map((row) => Number(row.id)))
      : new Set();
    return list.filter((row) => !linked.has(Number(row.id))).slice(0, 8);
  } catch {
    return [];
  }
}

async function searchStudents() {
  studentCandidates.value = await searchStudentOptions(studentSearch.value, { excludeLinked: true });
}

async function searchCreateStudents() {
  createStudentCandidates.value = await searchStudentOptions(createStudentSearch.value);
}

function studentLabel(student) {
  return `${student.first_name || student.firstName || ''} ${student.last_name || student.lastName || ''}`.trim();
}

function pickStudent(student) {
  assignForm.studentId = String(student.id);
  studentSearch.value = studentLabel(student);
  studentCandidates.value = [];
}

function pickCreateStudent(student) {
  createForm.studentId = String(student.id);
  createForm.studentLabel = studentLabel(student);
  createStudentSearch.value = createForm.studentLabel;
  createStudentCandidates.value = [];
}

function clearCreateStudent() {
  createForm.studentId = '';
  createForm.studentLabel = '';
  createStudentSearch.value = '';
  createStudentCandidates.value = [];
}

async function createGuardian() {
  if (!String(createForm.fullName || '').trim() || !String(createForm.email || '').trim() || !createForm.password) {
    error.value = 'Completa nombre, correo y contraseña del apoderado.';
    return;
  }
  if (createForm.password.length < 6) {
    error.value = 'La contraseña temporal debe tener al menos 6 caracteres.';
    return;
  }
  if (createForm.relationshipKind === 'Otro' && createForm.studentId && !createForm.relationshipOther.trim()) {
    error.value = 'Especifica el parentesco con el estudiante.';
    return;
  }
  busy.value = true;
  error.value = '';
  try {
    const data = await request('/guardians', {
      method: 'POST',
      body: JSON.stringify({
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        phone: createForm.phone,
        nationalId: createForm.nationalId,
      }),
    });
    const guardianId = data.guardian?.id;
    if (guardianId && createForm.studentId) {
      await request(`/students/${createForm.studentId}/guardians`, {
        method: 'POST',
        body: JSON.stringify({
          guardianId,
          relationship: resolveRelationship(createForm.relationshipKind, createForm.relationshipOther),
        }),
      });
      notify('Apoderado creado y vinculado al estudiante.');
    } else {
      notify(createForm.studentId
        ? 'Apoderado creado, pero no se pudo obtener su ID para vincular.'
        : 'Apoderado creado. Puedes asignarle estudiantes cuando quieras.');
    }
    emit('go-list', guardianId || null);
  } catch (cause) {
    error.value = cause.message || 'No se pudo crear el apoderado.';
    notify(error.value, 'error');
  } finally {
    busy.value = false;
  }
}

async function saveGuardian() {
  if (!selected.value) return;
  busy.value = true;
  error.value = '';
  try {
    await request(`/guardians/${selected.value.id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    notify('Datos del apoderado actualizados.');
    await load();
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo guardar el apoderado.', 'error');
  } finally {
    busy.value = false;
  }
}

async function assignStudent() {
  if (!selected.value || !Number(assignForm.studentId)) {
    error.value = 'Busca y selecciona un estudiante de la lista antes de asignar.';
    notify(error.value, 'error');
    return;
  }
  if (assignForm.relationshipKind === 'Otro' && !assignForm.relationshipOther.trim()) {
    error.value = 'Especifica el parentesco.';
    return;
  }
  busy.value = true;
  error.value = '';
  try {
    await request(`/students/${assignForm.studentId}/guardians`, {
      method: 'POST',
      body: JSON.stringify({
        guardianId: selected.value.id,
        relationship: resolveRelationship(assignForm.relationshipKind, assignForm.relationshipOther),
      }),
    });
    notify('Estudiante vinculado al apoderado.');
    await load();
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo vincular al estudiante.', 'error');
  } finally {
    busy.value = false;
  }
}

function askUnlinkStudent(student) {
  if (!selected.value || busy.value) return;
  unlinkTarget.value = student;
  message.value = '';
  error.value = '';
}

function cancelUnlink() {
  if (busy.value) return;
  unlinkTarget.value = null;
}

async function confirmUnlinkStudent() {
  const student = unlinkTarget.value;
  if (!selected.value || !student) return;
  busy.value = true;
  error.value = '';
  try {
    await request(`/students/${student.id}/guardians/${selected.value.id}`, { method: 'DELETE' });
    unlinkTarget.value = null;
    notify('Vínculo eliminado.');
    await load();
  } catch (cause) {
    error.value = cause.message;
    notify(cause.message || 'No se pudo eliminar el vínculo.', 'error');
  } finally {
    busy.value = false;
  }
}

let searchTimer = null;
watch(search, () => {
  if (!isCreateMode.value && !isDetailMode.value) {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      resetListPage();
      loadList();
    }, 220);
  }
});

watch(() => [props.mode, props.focusId], () => {
  if (isCreateMode.value) resetCreateForm();
  else load();
});

onMounted(() => {
  if (isCreateMode.value) resetCreateForm();
  else load();
});
</script>

<template>
  <section v-if="isCreateMode" class="guardians-create-page">
    <div class="profile-page-toolbar">
      <button type="button" class="secondary-button" @click="emit('go-list')">
        <ArrowLeft :size="16" />Volver a apoderados
      </button>
    </div>

    <form class="panel standalone-form guardians-create-form" @submit.prevent="createGuardian">
      <div class="account-panel-heading">
        <span class="admin-icon"><UserPlus /></span>
        <div>
          <h2>Nuevo apoderado</h2>
          <p>Crea la cuenta familiar y, si quieres, asóciala a un estudiante en el mismo paso.</p>
        </div>
      </div>

      <p v-if="error" class="login-error account-error" role="alert">{{ error }}</p>

      <div class="form-grid">
        <label class="field wide">
          <span>Nombre completo</span>
          <input v-model.trim="createForm.fullName" required maxlength="120" placeholder="Nombre del apoderado" />
        </label>
        <label class="field">
          <span>Correo</span>
          <input v-model.trim="createForm.email" required type="email" maxlength="150" placeholder="correo@ejemplo.cl" />
        </label>
        <label class="field">
          <span>Contraseña temporal</span>
          <input v-model="createForm.password" required type="password" minlength="6" maxlength="128" autocomplete="new-password" />
        </label>
        <label class="field">
          <span>RUT <small>Opcional</small></span>
          <input v-model.trim="createForm.nationalId" maxlength="20" placeholder="12345678-9" />
        </label>
        <label class="field">
          <span>Teléfono <small>Opcional</small></span>
          <input v-model.trim="createForm.phone" maxlength="40" placeholder="+569…" />
        </label>

        <div class="guardians-create-link wide">
          <h3>Asociar a estudiante <small>Opcional</small></h3>
          <p>Busca y selecciona un estudiante de la lista para dejar el vínculo listo al crear.</p>
        </div>

        <label class="field wide">
          <span>Buscar estudiante</span>
          <input
            v-model.trim="createStudentSearch"
            type="search"
            placeholder="Nombre · mínimo 2 letras"
            autocomplete="off"
            @input="searchCreateStudents"
          />
        </label>
        <div v-if="createStudentCandidates.length" class="student-autocomplete wide">
          <button
            v-for="student in createStudentCandidates"
            :key="student.id"
            type="button"
            :class="{ selected: Number(createForm.studentId) === Number(student.id) }"
            @click="pickCreateStudent(student)"
          >
            <strong>{{ studentLabel(student) }}</strong>
            <small>{{ student.email || 'Sin correo' }}</small>
          </button>
        </div>
        <p v-else-if="createStudentSearch.trim().length >= 2 && !createForm.studentId" class="field-help wide">
          No encontramos estudiantes con ese criterio.
        </p>
        <div v-if="createForm.studentId" class="guardian-selected-chip wide">
          <div>
            <strong>{{ createForm.studentLabel }}</strong>
            <small>Listo para vincular al crear</small>
          </div>
          <button type="button" class="edit-button" @click="clearCreateStudent"><X :size="14" />Quitar</button>
        </div>
        <label v-if="createForm.studentId" class="field">
          <span>Parentesco</span>
          <select v-model="createForm.relationshipKind">
            <option v-for="option in RELATIONSHIP_OPTIONS" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label v-if="createForm.studentId && createForm.relationshipKind === 'Otro'" class="field">
          <span>Especificar</span>
          <input v-model.trim="createForm.relationshipOther" required maxlength="60" placeholder="Ej. Abuelo, Tutor…" />
        </label>
      </div>

      <div class="modal-actions">
        <button type="button" class="secondary-button" :disabled="busy" @click="emit('go-list')">Cancelar</button>
        <button type="submit" class="primary-button" :disabled="busy">
          <span v-if="busy" class="spinner"></span>
          <Plus v-else :size="18" />
          {{ busy ? 'Creando…' : (createForm.studentId ? 'Crear y asociar' : 'Crear apoderado') }}
        </button>
      </div>
    </form>
  </section>

  <section v-else-if="isDetailMode" class="guardians-detail-page">
    <div class="profile-page-toolbar">
      <button type="button" class="secondary-button" @click="emit('go-list')">
        <ArrowLeft :size="16" />Volver a apoderados
      </button>
    </div>

    <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    <p v-if="message" class="guardians-ok" role="status">{{ message }}</p>
    <div v-if="loading" class="guardians-loading panel">Cargando apoderado…</div>

    <div v-else-if="selected" class="guardians-detail panel">
      <header class="guardians-detail-head">
        <div>
          <p class="guardians-kicker">Ficha del apoderado</p>
          <h3>{{ selected.fullName }}</h3>
          <p>{{ selected.email || 'Sin correo' }} · {{ selected.nationalId || 'Sin RUT' }}</p>
        </div>
        <div class="guardians-detail-actions">
          <button
            v-if="selected.email"
            type="button"
            class="secondary-button"
            @click="emit('open-communication', { guardianId: selected.id, guardianName: selected.fullName, guardianEmail: selected.email })"
          >
            <Send :size="15" />Comunicado
          </button>
        </div>
      </header>

      <section class="guardians-block">
        <h4>Datos del apoderado</h4>
        <div class="form-grid">
          <label class="field wide"><span>Nombre completo</span><input v-model.trim="editForm.fullName" maxlength="120" /></label>
          <label class="field"><span>Correo</span><input v-model.trim="editForm.email" type="email" maxlength="150" /></label>
          <label class="field"><span>Teléfono</span><input v-model.trim="editForm.phone" maxlength="40" placeholder="+569…" /></label>
          <label class="field"><span>RUT</span><input v-model.trim="editForm.nationalId" maxlength="20" placeholder="12345678-9" /></label>
        </div>
        <button type="button" class="secondary-button" :disabled="busy" @click="saveGuardian"><Check :size="16" />Guardar datos</button>
      </section>

      <section class="guardians-block">
        <h4>Estudiantes vinculados</h4>
        <div v-if="selected.students.length" class="guardian-students">
          <article v-for="student in selected.students" :key="student.id">
            <div>
              <strong>{{ student.firstName }} {{ student.lastName }}</strong>
              <small>{{ student.relationship }} · {{ student.email || 'Sin correo' }}</small>
            </div>
            <div class="course-row-actions">
              <button type="button" class="edit-button" @click="emit('open-student', student.id)">Abrir ficha</button>
              <button type="button" class="edit-button danger-button" :disabled="busy" @click="askUnlinkStudent(student)"><Unlink :size="14" />Quitar</button>
            </div>
          </article>
        </div>
        <p v-else class="guardians-empty">Todavía no tiene estudiantes asignados.</p>
      </section>

      <section class="guardians-block">
        <h4>Asignar estudiante</h4>
        <div class="form-grid">
          <label class="field wide">
            <span>Buscar estudiante</span>
            <input v-model.trim="studentSearch" type="search" placeholder="Nombre · elige uno de la lista" @input="searchStudents" />
          </label>
          <div v-if="studentCandidates.length" class="student-autocomplete wide">
            <button
              v-for="student in studentCandidates"
              :key="student.id"
              type="button"
              :class="{ selected: Number(assignForm.studentId) === Number(student.id) }"
              @click="pickStudent(student)"
            >
              <strong>{{ studentLabel(student) }}</strong>
              <small>{{ student.email || 'Sin correo' }}</small>
            </button>
          </div>
          <p v-else-if="studentSearch.trim().length >= 2 && !assignForm.studentId" class="field-help wide">
            No encontramos estudiantes con ese criterio.
          </p>
          <p v-if="assignForm.studentId" class="field-help wide">Estudiante seleccionado. Confirma el parentesco y pulsa Asignar.</p>
          <label class="field">
            <span>Parentesco</span>
            <select v-model="assignForm.relationshipKind">
              <option v-for="option in RELATIONSHIP_OPTIONS" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <label v-if="assignForm.relationshipKind === 'Otro'" class="field">
            <span>Especificar</span>
            <input v-model.trim="assignForm.relationshipOther" required maxlength="60" placeholder="Ej. Abuelo, Tutor…" />
          </label>
        </div>
        <button type="button" class="primary-button" :disabled="busy || !assignForm.studentId" @click="assignStudent">
          <Link2 :size="16" />Asignar a estudiante
        </button>
      </section>
    </div>

    <div v-else-if="!loading" class="guardians-detail panel guardians-detail-empty">
      <Users :size="32" />
      <strong>Apoderado no encontrado</strong>
      <span>Vuelve al listado e intenta con otro registro.</span>
    </div>

    <div v-if="unlinkTarget" class="modal-wrap" role="dialog" aria-modal="true" aria-labelledby="unlink-title" @mousedown.self="cancelUnlink">
      <section class="modal unlink-modal">
        <div class="modal-heading">
          <div class="modal-title-icon unlink-title-icon"><Unlink :size="20" /></div>
          <div>
            <h2 id="unlink-title">Desvincular estudiante</h2>
            <p>Se quita la relación familiar, sin borrar cuentas.</p>
          </div>
          <button type="button" class="icon-button" :disabled="busy" @click="cancelUnlink"><X /></button>
        </div>

        <div class="unlink-body">
          <p class="unlink-lead">
            ¿Quitar a <strong>{{ unlinkTarget.firstName }} {{ unlinkTarget.lastName }}</strong>
            del apoderado <strong>{{ selected?.fullName }}</strong>?
          </p>

          <div class="unlink-parties">
            <article class="unlink-party">
              <span class="unlink-party-label">Apoderado</span>
              <strong>{{ selected?.fullName }}</strong>
              <small>{{ selected?.email || 'Sin correo' }}</small>
            </article>
            <div class="unlink-party-divider" aria-hidden="true">
              <span class="unlink-party-chip"><Unlink :size="14" /></span>
            </div>
            <article class="unlink-party">
              <span class="unlink-party-label">Estudiante</span>
              <strong>{{ unlinkTarget.firstName }} {{ unlinkTarget.lastName }}</strong>
              <small>
                <template v-if="unlinkTarget.relationship">{{ unlinkTarget.relationship }} · </template>
                {{ unlinkTarget.email || 'Sin correo' }}
              </small>
            </article>
          </div>

          <p class="unlink-note">Ambas cuentas siguen activas. Solo se elimina el vínculo entre ellas.</p>
        </div>

        <div class="modal-actions unlink-actions">
          <button type="button" class="secondary-button" :disabled="busy" @click="cancelUnlink">Cancelar</button>
          <button type="button" class="primary-button unlink-confirm" :disabled="busy" @click="confirmUnlinkStudent">
            <span v-if="busy" class="spinner"></span>
            <Unlink v-else :size="16" />
            {{ busy ? 'Quitando…' : 'Quitar vínculo' }}
          </button>
        </div>
      </section>
    </div>
  </section>

  <section v-else class="guardians-panel">
    <header class="guardians-hero">
      <div>
        <p class="guardians-kicker">Gestión familiar</p>
        <h2>Apoderados</h2>
        <p>Administra cuentas familiares, edita datos y asigna estudiantes desde un solo panel.</p>
      </div>
      <button type="button" class="primary-button" @click="openCreate"><UserPlus :size="17" />Nuevo apoderado</button>
    </header>

    <div class="guardians-kpis">
      <article><span>Apoderados</span><strong>{{ summary.total }}</strong></article>
      <article><span>Con estudiantes</span><strong>{{ summary.withStudents }}</strong></article>
      <article><span>Sin asignar</span><strong>{{ summary.withoutStudents }}</strong></article>
      <article><span>Vínculos</span><strong>{{ summary.links }}</strong></article>
    </div>

    <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    <p v-if="message" class="guardians-ok" role="status">{{ message }}</p>

    <div class="panel-with-pager">
      <article class="panel table-panel guardians-table-panel">
        <div class="panel-header student-directory-header">
          <div>
            <h2>Lista de apoderados</h2>
            <p>{{ rows.length }} apoderado{{ rows.length === 1 ? '' : 's' }} encontrado{{ rows.length === 1 ? '' : 's' }}</p>
          </div>
          <label class="student-directory-search">
            <span class="sr-only">Buscar apoderado</span>
            <Search :size="16" />
            <input v-model.trim="search" type="search" placeholder="Buscar por nombre, correo o estudiante" />
          </label>
        </div>

        <div v-if="loading" class="guardians-loading">Cargando apoderados…</div>
        <div v-else class="table-scroll">
          <DataTable>
            <thead>
              <tr>
                <th>Apoderado</th>
                <th>Correo</th>
                <th>RUT</th>
                <th>Estudiantes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in pagedRows"
                :key="row.id"
                class="guardian-table-row"
                tabindex="0"
                :aria-label="`Abrir ficha de ${row.fullName}`"
                @click="openGuardian(row)"
                @keydown.enter="openGuardian(row)"
                @keydown.space.prevent="openGuardian(row)"
              >
                <td>
                  <div class="student-cell">
                    <span class="avatar">{{ initials(row.fullName) }}</span>
                    <div>
                      <strong>{{ row.fullName }}</strong>
                      <small class="student-hover-hint">{{ row.phone || 'Haz clic para ver ficha →' }}</small>
                    </div>
                  </div>
                </td>
                <td>{{ row.email || '—' }}</td>
                <td>{{ row.nationalId || '—' }}</td>
                <td>
                  <strong>{{ row.studentCount }}</strong>
                  <small class="guardians-students-cell">{{ studentsSummary(row) }}</small>
                </td>
                <td>
                  <div class="course-row-actions">
                    <button type="button" class="edit-button" @click.stop="openGuardian(row)">Ver ficha</button>
                    <button
                      v-if="row.email"
                      type="button"
                      class="edit-button"
                      @click.stop="emit('open-communication', { guardianId: row.id, guardianName: row.fullName, guardianEmail: row.email })"
                    >
                      <Send :size="14" />Comunicado
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </DataTable>
        </div>
        <p v-if="!loading && !rows.length" class="guardians-empty guardians-table-empty">No hay apoderados con ese criterio.</p>
      </article>

      <TablePagination
        v-model:page="listPage"
        :page-count="listPageCount"
        :range-label="listRangeLabel"
        :show="showListPagination"
      />
    </div>
  </section>
</template>

<style scoped>
.guardians-panel { display: grid; gap: 18px; }
.guardians-create-page,
.guardians-detail-page { display: grid; gap: 12px; }
.guardians-create-form { width: min(720px, 100%); }
.guardians-create-link {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
  display: grid;
  gap: 4px;
}
.guardians-create-link h3 {
  margin: 0;
  font-size: 15px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.guardians-create-link h3 small,
.guardians-create-link p {
  margin: 0;
  color: var(--color-muted);
  font-weight: 500;
}
.guardians-create-link p { font-size: 13px; }
.guardian-selected-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  border-radius: 12px;
  background: var(--color-primary-soft);
}
.guardian-selected-chip strong { display: block; }
.guardian-selected-chip small { color: var(--color-muted); }
.guardians-hero {
  display: flex; flex-wrap: wrap; justify-content: space-between; gap: 16px; align-items: end;
  padding: 22px 24px; border: 1px solid var(--color-border); border-radius: 18px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 42%),
    var(--color-surface);
}
.guardians-kicker { margin: 0 0 6px; color: var(--color-primary); font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.guardians-hero h2 { margin: 0 0 6px; font-size: 28px; }
.guardians-hero p { margin: 0; max-width: 52ch; color: var(--color-muted); }
.guardians-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.guardians-kpis article {
  padding: 14px 16px; border: 1px solid var(--color-border); border-radius: 14px; background: var(--color-surface);
  display: grid; gap: 4px;
}
.guardians-kpis span { color: var(--color-muted); font-size: 11px; font-weight: 700; text-transform: uppercase; }
.guardians-kpis strong { font-size: 24px; }
.guardians-ok { margin: 0; color: color-mix(in srgb, #0f7a4b 85%, black); font-size: 12px; }
.guardians-table-panel { padding: 0; overflow: hidden; }
.guardians-table-panel .panel-header { padding: 18px 20px 12px; }
.guardian-table-row { cursor: pointer; }
.guardian-table-row:hover { background: var(--color-canvas); }
.guardians-students-cell {
  display: block;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 500;
}
.guardians-table-empty { padding: 24px 20px; }
.guardians-detail { padding: 18px 20px; display: grid; gap: 12px; align-content: start; }
.guardians-detail-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; flex-wrap: wrap; }
.guardians-detail-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.guardians-detail-head h3 { margin: 0 0 4px; }
.guardians-detail-head p { margin: 0; color: var(--color-muted); }
.guardians-block { display: grid; gap: 12px; padding-top: 8px; border-top: 1px solid var(--color-border); }
.guardians-block h4 { margin: 0; font-size: 14px; }
.guardian-students { display: grid; gap: 8px; }
.guardian-students article {
  padding: 12px 14px; border: 1px solid var(--color-border); border-radius: 12px;
  display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap;
}
.guardian-students small { display: block; color: var(--color-muted); }
.guardians-detail-empty {
  min-height: 180px; place-items: center; text-align: center; color: var(--color-muted);
  display: grid; gap: 6px; justify-items: center;
}
.guardians-detail-empty strong { color: var(--color-text); }
.guardians-loading { padding: 18px 20px; color: var(--color-muted); }
.guardians-empty { color: var(--color-muted); }
.wide { grid-column: 1 / -1; }
.unlink-modal {
  width: min(460px, 100%);
}
.unlink-title-icon {
  color: #b42318 !important;
  background: #fef3f2 !important;
  border: 1px solid #fecdca;
}
.unlink-body {
  display: grid;
  gap: 14px;
}
.unlink-lead {
  margin: 0;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.55;
}
.unlink-lead strong { font-weight: 750; }
.unlink-parties {
  display: grid;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-canvas);
}
.unlink-party {
  display: grid;
  gap: 3px;
  padding: 14px 16px;
  min-width: 0;
}
.unlink-party-label {
  color: var(--color-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.unlink-party strong {
  font-size: 14px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unlink-party small {
  color: var(--color-muted);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.unlink-party-divider {
  display: grid;
  place-items: center;
  padding: 0;
  border-top: 1px dashed var(--color-border);
  border-bottom: 1px dashed var(--color-border);
  background: var(--color-surface);
}
.unlink-party-chip {
  width: 28px;
  height: 28px;
  margin: 6px 0;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #b42318;
  background: #fef3f2;
  border: 1px solid #fecdca;
}
.unlink-note {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--color-muted);
  background: color-mix(in srgb, var(--color-canvas) 70%, white);
  border: 1px solid var(--color-border);
  font-size: 12px;
  line-height: 1.45;
}
.unlink-actions {
  border-top-color: #fecdca;
}
.unlink-confirm {
  background: #b42318 !important;
  border-color: #912018 !important;
  color: #fff !important;
  box-shadow: 0 8px 18px color-mix(in srgb, #b42318 28%, transparent) !important;
}
.unlink-confirm:hover:not(:disabled) {
  background: #912018 !important;
  border-color: #7a1514 !important;
}
@media (max-width: 980px) {
  .guardians-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
