<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  ArrowLeft, CalendarDays, Check, ChevronDown, Copy, ExternalLink, GraduationCap, Link2, Mail, Phone,
  Save, Search, Send, Trash2, UserPlus, Users, X,
} from '@lucide/vue';
import { request } from '../api/client.js';
import { useNotify } from '../composables/notify.js';
import { TablePagination } from './ui/index.js';

const props = defineProps({
  schoolId: { type: [Number, String], required: true },
  canEnroll: { type: Boolean, default: false },
});
const emit = defineEmits(['notify']);
const notifyToast = useNotify();

function notify(text, type = 'success') {
  if (!text) return;
  message.value = type === 'success' ? text : '';
  error.value = type === 'error' ? text : '';
  emit('notify', text, type);
  notifyToast(text, type);
}

const rows = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 30;
const searchQuery = ref('');
const counts = reactive({ active: 0, rejected: 0 });
const courseGroups = ref([]);
const status = ref('');
const error = ref('');
const message = ref('');
const busy = ref(false);
const selectedId = ref(null);
const notesDraft = ref('');
const statusDraft = ref('');
const enrollResult = ref(null);
const enrollForm = reactive({
  courseId: '',
  username: '',
  password: '',
  generatePassword: true,
});
const rejectedOpen = ref(false);
const rejectedRows = ref([]);
const rejectedTotal = ref(0);
const rejectedPage = ref(1);
const rejectedQuery = ref('');
const rejectedBusy = ref(false);
const rejectedSelected = ref(null);
const publicFormUrl = computed(() => `${window.location.origin}/postular/${props.schoolId}`);

const answerLabels = {
  motivation: 'Motivo de la postulación',
  support: 'Antecedentes de aprendizaje o apoyos',
  expectations: 'Expectativas de la familia',
};

const statuses = [
  ['received', 'Recibida'],
  ['interview', 'Entrevista'],
  ['evaluated', 'Evaluada'],
  ['waiting', 'En espera'],
  ['accepted', 'Aceptada'],
  ['rejected', 'Rechazada'],
];
const inboxStatuses = statuses.filter(([value]) => value !== 'rejected');

const statusMeta = Object.fromEntries(statuses.map(([value, label]) => [value, label]));
const selected = computed(() => rows.value.find(row => row.id === selectedId.value) || null);
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
const rejectedPageCount = computed(() => Math.max(1, Math.ceil(rejectedTotal.value / 50)));
const alreadyEnrolled = computed(() => /Matriculado como estudiante #/.test(String(selected.value?.reviewerNotes || '')));
const canShowEnroll = computed(() => props.canEnroll && selected.value?.status === 'accepted');
const statusDirty = computed(() => selected.value && statusDraft.value && statusDraft.value !== selected.value.status);
const notesDirty = computed(() => selected.value && String(notesDraft.value || '') !== String(selected.value.reviewerNotes || ''));
const canSaveReview = computed(() => Boolean(selected.value) && (statusDirty.value || notesDirty.value));
const answerEntries = computed(() => {
  const answers = selected.value?.answers;
  if (!answers || typeof answers !== 'object') return [];
  return Object.entries(answers).filter(([, value]) => String(value || '').trim());
});
const pipelineIndex = computed(() => {
  const current = selected.value?.status;
  if (!current || current === 'rejected') return -1;
  return inboxStatuses.findIndex(([value]) => value === current);
});

function statusLabel(value) {
  return statusMeta[value] || value;
}

function formatWhen(value) {
  if (!value) return 'Sin fecha';
  try {
    return new Date(value).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(value);
  }
}

function initials(first = '', last = '') {
  return `${String(first).trim().charAt(0)}${String(last).trim().charAt(0)}`.toUpperCase() || '?';
}

function suggestUsername(firstName, lastName) {
  const base = `${firstName || ''}.${lastName || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '')
    .replace(/^\.+|\.+$/g, '');
  return (base || 'estudiante').slice(0, 40);
}

function resetEnrollForm(row = selected.value) {
  enrollResult.value = null;
  enrollForm.courseId = courseGroups.value[0]?.id ? String(courseGroups.value[0].id) : '';
  enrollForm.username = row ? suggestUsername(row.studentFirstName, row.studentLastName) : '';
  enrollForm.password = '';
  enrollForm.generatePassword = true;
}

async function loadCourses() {
  if (!props.canEnroll) return;
  try {
    const data = await request('/courses?grouped=true');
    courseGroups.value = Array.isArray(data) ? data : [];
    if (!enrollForm.courseId && courseGroups.value[0]?.id) enrollForm.courseId = String(courseGroups.value[0].id);
  } catch {
    courseGroups.value = [];
  }
}

async function load() {
  error.value = '';
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      pageSize: String(pageSize),
      excludeRejected: '1',
    });
    if (status.value) params.set('status', status.value);
    if (searchQuery.value.trim()) params.set('q', searchQuery.value.trim());
    const data = await request(`/admissions?${params}`);
    rows.value = data.rows || [];
    total.value = Number(data.total || 0);
    counts.active = Number(data.counts?.active ?? total.value);
    counts.rejected = Number(data.counts?.rejected || 0);
    if (selectedId.value && !rows.value.some(row => row.id === selectedId.value)) selectedId.value = null;
    if (!selectedId.value && rows.value.length) selectRow(rows.value[0]);
    else if (selected.value) {
      notesDraft.value = selected.value.reviewerNotes || '';
      statusDraft.value = selected.value.status;
    }
  } catch (e) {
    error.value = e.message;
  }
}

async function loadRejected() {
  rejectedBusy.value = true;
  try {
    const params = new URLSearchParams({
      status: 'rejected',
      page: String(rejectedPage.value),
      pageSize: '50',
    });
    if (rejectedQuery.value.trim()) params.set('q', rejectedQuery.value.trim());
    const data = await request(`/admissions?${params}`);
    rejectedRows.value = data.rows || [];
    rejectedTotal.value = Number(data.total || 0);
    counts.rejected = Number(data.counts?.rejected ?? rejectedTotal.value);
    counts.active = Number(data.counts?.active ?? counts.active);
    if (rejectedSelected.value && !rejectedRows.value.some(row => row.id === rejectedSelected.value.id)) {
      rejectedSelected.value = null;
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    rejectedBusy.value = false;
  }
}

function selectRow(row) {
  selectedId.value = row.id;
  notesDraft.value = row.reviewerNotes || '';
  statusDraft.value = row.status;
  message.value = '';
  error.value = '';
  resetEnrollForm(row);
}

async function saveReview() {
  if (!selected.value || !canSaveReview.value) return;
  const nextStatus = statusDraft.value || selected.value.status;
  const statusChanged = nextStatus !== selected.value.status;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    const data = await request(`/admissions/${selected.value.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus, reviewerNotes: notesDraft.value || '' }),
    });
    if (nextStatus === 'rejected') {
      selectedId.value = null;
      const rejectMessage = statusChanged && data.delivery?.queued
        ? `Postulación rechazada y notificada a ${data.application.guardianEmail}. Quedó en Lista rechazadas.`
        : statusChanged && data.mailWarning
          ? `Postulación rechazada. ${data.mailWarning} Quedó en Lista rechazadas.`
          : 'Postulación rechazada. Quedó en Lista rechazadas.';
      notify(rejectMessage);
      await load();
      return;
    }
    Object.assign(selected.value, data.application);
    notesDraft.value = selected.value.reviewerNotes || '';
    statusDraft.value = selected.value.status;
    if (statusChanged && data.delivery?.queued) {
      notify(`Estado actualizado a “${statusLabel(selected.value.status)}”. Se envió un correo a ${selected.value.guardianEmail}.`);
    } else if (statusChanged && data.mailWarning) {
      notify(`Estado actualizado a “${statusLabel(selected.value.status)}”. ${data.mailWarning}`);
    } else if (statusChanged) {
      notify(`Estado actualizado a “${statusLabel(selected.value.status)}”.`);
    } else {
      notify('Notas internas guardadas.');
    }
    if (nextStatus === 'accepted') resetEnrollForm(selected.value);
    await load();
  } catch (e) {
    notify(e.message || 'No se pudo actualizar la postulación.', 'error');
  } finally {
    busy.value = false;
  }
}

async function restoreRejected(row) {
  if (!row) return;
  rejectedBusy.value = true;
  error.value = '';
  try {
    await request(`/admissions/${row.id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'received', reviewerNotes: row.reviewerNotes || '' }),
    });
    notify(`${row.studentFirstName} ${row.studentLastName} volvió a la bandeja como Recibida.`);
    rejectedSelected.value = null;
    await Promise.all([loadRejected(), load()]);
  } catch (e) {
    notify(e.message || 'No se pudo reabrir la postulación.', 'error');
  } finally {
    rejectedBusy.value = false;
  }
}

async function enrollApplicant() {
  if (!selected.value || !canShowEnroll.value || alreadyEnrolled.value) return;
  if (!enrollForm.courseId) {
    notify('Selecciona un curso para matricular.', 'error');
    return;
  }
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    const data = await request(`/admissions/${selected.value.id}/enroll`, {
      method: 'POST',
      body: JSON.stringify({
        courseIds: [Number(enrollForm.courseId)],
        username: enrollForm.username,
        generatePassword: enrollForm.generatePassword,
        password: enrollForm.generatePassword ? undefined : enrollForm.password,
      }),
    });
    enrollResult.value = {
      studentId: data.student?.id,
      username: enrollForm.username,
      temporaryPassword: data.temporaryPassword,
      guardianUsername: data.guardianUsername,
      guardianTemporaryPassword: data.guardianTemporaryPassword,
      enrolledModules: data.enrolledModules,
    };
    await load();
    const refreshed = rows.value.find(row => row.id === selectedId.value);
    if (refreshed) {
      notesDraft.value = refreshed.reviewerNotes || '';
      statusDraft.value = refreshed.status;
    }
    const courseName = courseGroups.value.find((c) => Number(c.id) === Number(enrollForm.courseId))?.name || 'el curso';
    notify(`Estudiante matriculado en ${courseName}.`);
  } catch (e) {
    notify(e.message || 'No se pudo matricular al estudiante.', 'error');
  } finally {
    busy.value = false;
  }
}

async function copyPublicLink() {
  try {
    await navigator.clipboard.writeText(publicFormUrl.value);
    notify('Enlace público copiado.');
  } catch {
    notify('No se pudo copiar el enlace.', 'error');
  }
}

async function copyText(value, label) {
  try {
    await navigator.clipboard.writeText(value);
    notify(`${label} copiado.`);
  } catch {
    notify(`No se pudo copiar ${label.toLowerCase()}.`, 'error');
  }
}

function setFilter(value) {
  status.value = value === 'rejected' ? '' : value;
  page.value = 1;
  load();
}

function changePage(delta) {
  goToAdmissionsPage(page.value + delta);
}

function goToAdmissionsPage(target) {
  const next = Math.min(pageCount.value, Math.max(1, Number(target) || 1));
  if (next === page.value) return;
  page.value = next;
  load();
}

function changeRejectedPage(delta) {
  goToRejectedPage(rejectedPage.value + delta);
}

function goToRejectedPage(target) {
  const next = Math.min(rejectedPageCount.value, Math.max(1, Number(target) || 1));
  if (next === rejectedPage.value) return;
  rejectedPage.value = next;
  loadRejected();
}

async function openRejectedList() {
  rejectedOpen.value = true;
  rejectedPage.value = 1;
  rejectedQuery.value = '';
  rejectedSelected.value = null;
  await loadRejected();
}

function closeRejectedList() {
  rejectedOpen.value = false;
  rejectedSelected.value = null;
}

let searchTimer = 0;
watch(searchQuery, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    page.value = 1;
    load();
  }, 280);
});

let rejectedSearchTimer = 0;
watch(rejectedQuery, () => {
  window.clearTimeout(rejectedSearchTimer);
  rejectedSearchTimer = window.setTimeout(() => {
    rejectedPage.value = 1;
    loadRejected();
  }, 280);
});

watch(() => props.canEnroll, (value) => { if (value) loadCourses(); }, { immediate: true });

onMounted(() => {
  load();
  loadCourses();
});
</script>

<template>
  <section class="admissions-page">
    <div class="admissions-top">
      <div class="admissions-link">
        <Link2 :size="16" />
        <div>
          <strong>Formulario público</strong>
          <code>{{ publicFormUrl }}</code>
        </div>
      </div>
      <div class="admissions-top-actions">
        <button type="button" class="secondary-button rejected-list-button" @click="openRejectedList">
          <Trash2 :size="15" />Lista rechazadas
          <em v-if="counts.rejected">{{ counts.rejected }}</em>
        </button>
        <a class="secondary-button" :href="publicFormUrl" target="_blank" rel="noopener noreferrer">
          <ExternalLink :size="15" />Abrir
        </a>
        <button type="button" class="secondary-button" @click="copyPublicLink">
          <Copy :size="15" />Copiar enlace
        </button>
      </div>
    </div>

    <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    <p v-else-if="message" class="success-message" role="status">{{ message }}</p>

    <div class="admissions-layout">
      <aside class="panel admissions-list">
        <header class="list-heading">
          <div>
            <strong>Bandeja activa</strong>
            <span>{{ total }} en proceso · {{ counts.active }} activas</span>
          </div>
        </header>

        <label class="admissions-search">
          <Search :size="15" />
          <input v-model.trim="searchQuery" type="search" placeholder="Buscar por nombre, RUT o correo…" />
        </label>

        <div class="status-filter" role="tablist" aria-label="Filtrar por estado">
          <button type="button" role="tab" :aria-selected="!status" :class="{ active: !status }" @click="setFilter('')">Activas</button>
          <button
            v-for="[value, label] in inboxStatuses"
            :key="value"
            type="button"
            role="tab"
            :aria-selected="status === value"
            :class="{ active: status === value }"
            @click="setFilter(value)"
          >
            {{ label }}
          </button>
        </div>

        <div v-if="rows.length" class="admission-rows">
          <button
            v-for="row in rows"
            :key="row.id"
            type="button"
            class="admission-row"
            :class="{ active: selected?.id === row.id }"
            @click="selectRow(row)"
          >
            <span class="admission-avatar">{{ initials(row.studentFirstName, row.studentLastName) }}</span>
            <span class="admission-row-body">
              <strong>{{ row.studentFirstName }} {{ row.studentLastName }}</strong>
              <small>{{ row.requestedLevel }} · {{ row.guardianName }}</small>
              <em>{{ formatWhen(row.createdAt) }}</em>
            </span>
            <span class="status-pill" :data-status="row.status">{{ statusLabel(row.status) }}</span>
          </button>
        </div>

        <div v-else class="admissions-empty">
          <UserPlus :size="28" />
          <strong>{{ searchQuery ? 'Sin resultados' : 'Sin postulaciones activas' }}</strong>
          <span>{{ searchQuery ? 'Prueba otro término de búsqueda.' : 'Las rechazadas salen de esta bandeja y quedan en Lista rechazadas.' }}</span>
        </div>

        <TablePagination
          class="admissions-pagination"
          :page="page"
          :page-count="pageCount"
          @goto="goToAdmissionsPage"
        />
      </aside>

      <article class="panel admissions-detail">
        <template v-if="selected">
          <header class="detail-hero" :data-status="selected.status">
            <div class="detail-hero-main">
              <span class="detail-avatar">{{ initials(selected.studentFirstName, selected.studentLastName) }}</span>
              <div>
                <span class="detail-kicker">Postulación #{{ selected.id }} · {{ selected.requestedLevel }}</span>
                <h3>{{ selected.studentFirstName }} {{ selected.studentLastName }}</h3>
                <p>
                  <CalendarDays :size="14" />
                  Ingresada {{ formatWhen(selected.createdAt) }}
                </p>
              </div>
            </div>
            <span class="status-pill large" :data-status="selected.status">{{ statusLabel(selected.status) }}</span>
          </header>

          <ol class="status-pipeline" aria-label="Progreso de la postulación">
            <li
              v-for="([value, label], index) in inboxStatuses"
              :key="value"
              :class="{
                done: pipelineIndex > index,
                current: selected.status === value,
              }"
            >
              <i>{{ index + 1 }}</i>
              <span>{{ label }}</span>
            </li>
          </ol>

          <div class="detail-grid">
            <section class="info-card">
              <header>
                <Users :size="16" />
                <strong>Estudiante</strong>
              </header>
              <dl>
                <div>
                  <dt>Nombre</dt>
                  <dd>{{ selected.studentFirstName }} {{ selected.studentLastName }}</dd>
                </div>
                <div>
                  <dt>RUT</dt>
                  <dd>{{ selected.studentRut || 'No informado' }}</dd>
                </div>
                <div>
                  <dt>Nivel solicitado</dt>
                  <dd>{{ selected.requestedLevel }}</dd>
                </div>
              </dl>
            </section>

            <section class="info-card">
              <header>
                <Mail :size="16" />
                <strong>Apoderado</strong>
              </header>
              <dl>
                <div>
                  <dt>Nombre</dt>
                  <dd>{{ selected.guardianName }}</dd>
                </div>
                <div>
                  <dt>RUT</dt>
                  <dd>{{ selected.guardianRut || 'No informado' }}</dd>
                </div>
                <div>
                  <dt>Correo</dt>
                  <dd>
                    <a :href="`mailto:${selected.guardianEmail}`">{{ selected.guardianEmail }}</a>
                  </dd>
                </div>
                <div v-if="selected.guardianPhone">
                  <dt>Teléfono</dt>
                  <dd>
                    <a :href="`tel:${selected.guardianPhone}`"><Phone :size="13" />{{ selected.guardianPhone }}</a>
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section class="answers-block">
            <h4>Respuestas de la familia</h4>
            <div v-if="answerEntries.length" class="answer-cards">
              <article v-for="[key, answer] in answerEntries" :key="key" class="answer-card">
                <strong>{{ answerLabels[key] || key }}</strong>
                <p>{{ answer }}</p>
              </article>
            </div>
            <p v-else class="empty-note">Esta postulación no incluye respuestas adicionales.</p>
          </section>

          <section class="review-card">
            <header>
              <div>
                <strong>Revisión</strong>
                <p>Al cambiar el estado se notifica por correo a {{ selected.guardianEmail }}.</p>
              </div>
              <span v-if="statusDirty" class="review-hint"><Send :size="13" />Se enviará correo</span>
            </header>
            <div class="review-grid">
              <label class="field">
                <span>Estado</span>
                <div class="field-select">
                  <select v-model="statusDraft" :disabled="busy || alreadyEnrolled">
                    <option v-for="[value, label] in statuses" :key="value" :value="value">
                      {{ value === 'rejected' ? 'Rechazada (sale de bandeja)' : label }}
                    </option>
                  </select>
                  <ChevronDown :size="16" />
                </div>
              </label>
              <label class="field wide">
                <span>Notas internas</span>
                <textarea
                  v-model="notesDraft"
                  maxlength="5000"
                  rows="4"
                  placeholder="Observaciones de entrevista, documentación pendiente, etc."
                />
              </label>
            </div>
            <div class="detail-actions">
              <button type="button" class="primary-button" :disabled="busy || !canSaveReview || alreadyEnrolled" @click="saveReview">
                <Save :size="16" />
                {{ busy ? 'Guardando…' : (statusDraft === 'rejected' && statusDirty ? 'Rechazar y archivar' : (statusDirty ? 'Guardar y notificar' : 'Guardar notas')) }}
              </button>
            </div>
          </section>

          <section v-if="canShowEnroll" class="enroll-panel">
            <header class="enroll-heading">
              <span class="enroll-icon"><GraduationCap :size="18" /></span>
              <div>
                <strong>Matricular estudiante</strong>
                <p>Crea la ficha, el apoderado y la matrícula en el curso elegido.</p>
              </div>
            </header>

            <div v-if="alreadyEnrolled" class="enroll-done">
              <Check :size="16" />
              <span>Esta postulación ya fue matriculada. Revisa las notas internas para el ID del estudiante.</span>
            </div>

            <div v-else-if="enrollResult" class="enroll-credentials">
              <p>Matrícula creada. Guarda estas credenciales temporales:</p>
              <div class="credential-grid">
                <div>
                  <span>Usuario estudiante</span>
                  <strong>{{ enrollResult.username }}</strong>
                  <button type="button" class="edit-button" @click="copyText(enrollResult.username, 'Usuario')">Copiar</button>
                </div>
                <div>
                  <span>Contraseña estudiante</span>
                  <strong>{{ enrollResult.temporaryPassword }}</strong>
                  <button type="button" class="edit-button" @click="copyText(enrollResult.temporaryPassword, 'Contraseña')">Copiar</button>
                </div>
                <div v-if="enrollResult.guardianUsername && enrollResult.guardianTemporaryPassword">
                  <span>Usuario apoderado</span>
                  <strong>{{ enrollResult.guardianUsername }}</strong>
                  <button type="button" class="edit-button" @click="copyText(enrollResult.guardianUsername, 'Usuario apoderado')">Copiar</button>
                </div>
                <div v-if="enrollResult.guardianTemporaryPassword">
                  <span>Contraseña apoderado</span>
                  <strong>{{ enrollResult.guardianTemporaryPassword }}</strong>
                  <button type="button" class="edit-button" @click="copyText(enrollResult.guardianTemporaryPassword, 'Contraseña apoderado')">Copiar</button>
                </div>
              </div>
            </div>

            <form v-else class="enroll-form" @submit.prevent="enrollApplicant">
              <label class="field wide">
                <span>Curso</span>
                <div class="field-select">
                  <select v-model="enrollForm.courseId" required>
                    <option value="" disabled>Selecciona un curso</option>
                    <option v-for="course in courseGroups" :key="course.id" :value="String(course.id)">
                      {{ course.name }} · {{ course.section }}
                    </option>
                  </select>
                  <ChevronDown :size="16" />
                </div>
              </label>
              <label class="field">
                <span>Usuario de acceso</span>
                <input v-model.trim="enrollForm.username" required minlength="3" maxlength="150" autocomplete="off" placeholder="ej. camila.soto" />
              </label>
              <label class="switch-field">
                <input v-model="enrollForm.generatePassword" type="checkbox" />
                <span><i></i><strong>Generar contraseña segura</strong><small>Se mostrará al matricular.</small></span>
              </label>
              <label v-if="!enrollForm.generatePassword" class="field wide">
                <span>Contraseña temporal</span>
                <input v-model="enrollForm.password" required minlength="6" maxlength="128" type="password" autocomplete="new-password" />
              </label>
              <button type="submit" class="primary-button" :disabled="busy || !courseGroups.length">
                <UserPlus :size="16" />{{ busy ? 'Matriculando…' : 'Matricular ahora' }}
              </button>
              <p v-if="!courseGroups.length" class="empty-note">Crea un curso antes de matricular postulantes.</p>
            </form>
          </section>
        </template>

        <div v-else class="admissions-empty detail-empty">
          <Users :size="34" />
          <strong>Selecciona una postulación</strong>
          <span>Verás aquí los datos del estudiante, del apoderado y las respuestas.</span>
        </div>
      </article>
    </div>

    <div v-if="rejectedOpen" class="rejected-fullscreen" role="dialog" aria-modal="true" aria-label="Lista de postulaciones rechazadas">
      <header class="rejected-toolbar">
        <button type="button" class="secondary-button" @click="closeRejectedList">
          <ArrowLeft :size="16" />Volver a bandeja
        </button>
        <div class="rejected-toolbar-copy">
          <strong>Lista rechazadas</strong>
          <span>{{ rejectedTotal }} postulaciones archivadas fuera de la bandeja activa</span>
        </div>
        <button type="button" class="icon-button" aria-label="Cerrar" @click="closeRejectedList"><X :size="18" /></button>
      </header>

      <div class="rejected-body">
        <label class="admissions-search rejected-search">
          <Search :size="15" />
          <input v-model.trim="rejectedQuery" type="search" placeholder="Buscar rechazadas por nombre, RUT o correo…" />
        </label>

        <div class="rejected-layout">
          <div class="panel rejected-table-panel">
            <div v-if="rejectedBusy && !rejectedRows.length" class="admissions-empty">Cargando historial…</div>
            <div v-else-if="!rejectedRows.length" class="admissions-empty">
              <Trash2 :size="28" />
              <strong>Sin rechazadas</strong>
              <span>Cuando rechaces una postulación aparecerá aquí como historial.</span>
            </div>
            <div v-else class="rejected-table-scroll">
              <table class="rejected-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Nivel</th>
                    <th>Apoderado</th>
                    <th>Correo</th>
                    <th>Actualizada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in rejectedRows"
                    :key="row.id"
                    :class="{ active: rejectedSelected?.id === row.id }"
                    @click="rejectedSelected = row"
                  >
                    <td>
                      <strong>{{ row.studentFirstName }} {{ row.studentLastName }}</strong>
                      <small>#{{ row.id }} · {{ row.studentRut || 'Sin RUT' }}</small>
                    </td>
                    <td>{{ row.requestedLevel }}</td>
                    <td>{{ row.guardianName }}</td>
                    <td>{{ row.guardianEmail }}</td>
                    <td>{{ formatWhen(row.updatedAt || row.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <TablePagination
              class="admissions-pagination"
              :page="rejectedPage"
              :page-count="rejectedPageCount"
              @goto="goToRejectedPage"
            />
          </div>

          <aside class="panel rejected-detail">
            <template v-if="rejectedSelected">
              <header>
                <span class="status-pill" data-status="rejected">Rechazada</span>
                <h3>{{ rejectedSelected.studentFirstName }} {{ rejectedSelected.studentLastName }}</h3>
                <p>{{ rejectedSelected.requestedLevel }} · {{ formatWhen(rejectedSelected.updatedAt || rejectedSelected.createdAt) }}</p>
              </header>
              <dl>
                <div><dt>Apoderado</dt><dd>{{ rejectedSelected.guardianName }}</dd></div>
                <div><dt>Correo</dt><dd>{{ rejectedSelected.guardianEmail }}</dd></div>
                <div v-if="rejectedSelected.guardianPhone"><dt>Teléfono</dt><dd>{{ rejectedSelected.guardianPhone }}</dd></div>
                <div><dt>Notas</dt><dd>{{ rejectedSelected.reviewerNotes || 'Sin notas internas.' }}</dd></div>
              </dl>
              <button type="button" class="primary-button" :disabled="rejectedBusy" @click="restoreRejected(rejectedSelected)">
                <ArrowLeft :size="15" />{{ rejectedBusy ? 'Reabriendo…' : 'Reabrir en bandeja' }}
              </button>
            </template>
            <div v-else class="admissions-empty">
              <Users :size="28" />
              <strong>Selecciona una rechazada</strong>
              <span>Consulta el historial completo sin mezclarlo con la bandeja activa.</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admissions-page {
  display: grid;
  gap: 14px;
}
.admissions-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
}
.admissions-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--color-primary);
}
.admissions-link > div {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.admissions-link strong {
  color: var(--color-text);
  font-size: 13px;
}
.admissions-link code {
  overflow: hidden;
  color: var(--color-subtle);
  font-size: 11px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.admissions-top-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.admissions-top-actions .secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.success-message {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  color: #166534;
  background: #f0fdf4;
  font-size: 13px;
  font-weight: 600;
}
.admissions-layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
  min-height: 560px;
}
.admissions-list,
.admissions-detail {
  min-width: 0;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.list-heading {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.list-heading strong {
  display: block;
  color: var(--color-text);
  font-size: 15px;
}
.list-heading span {
  color: var(--color-subtle);
  font-size: 12px;
}
.status-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.status-filter button {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-subtle);
  background: var(--color-canvas);
  font: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.status-filter button:hover {
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
}
.status-filter button.active {
  color: #fff;
  border-color: var(--color-primary);
  background: var(--color-primary);
}
.admission-rows {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  max-height: min(62vh, 640px);
  padding-right: 2px;
}
.admission-row {
  width: 100%;
  padding: 11px;
  border: 1px solid var(--color-border);
  border-radius: 11px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
}
.admission-row:hover,
.admission-row.active {
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  background: var(--color-canvas);
}
.admission-avatar,
.detail-avatar {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--color-primary);
  font-size: 12px;
  font-weight: 800;
}
.detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  font-size: 18px;
}
.admission-row-body {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.admission-row-body strong {
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.admission-row-body small,
.admission-row-body em {
  overflow: hidden;
  color: var(--color-subtle);
  font-size: 11px;
  font-style: normal;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.status-pill {
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  color: #334155;
  background: #e2e8f0;
  white-space: nowrap;
}
.status-pill.large {
  padding: 6px 10px;
  font-size: 11px;
}
.status-pill[data-status='received'] { color: #1d4ed8; background: #dbeafe; }
.status-pill[data-status='interview'] { color: #7c3aed; background: #ede9fe; }
.status-pill[data-status='evaluated'] { color: #0369a1; background: #e0f2fe; }
.status-pill[data-status='waiting'] { color: #9a6700; background: #fef3c7; }
.status-pill[data-status='accepted'] { color: #166534; background: #dcfce7; }
.status-pill[data-status='rejected'] { color: #991b1b; background: #fee2e2; }
.admissions-empty {
  flex: 1;
  min-height: 220px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--color-subtle);
  text-align: center;
}
.admissions-empty strong { color: var(--color-text); }
.detail-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, #fff), var(--color-canvas) 55%, #fff);
}
.detail-hero-main {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}
.detail-kicker {
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.detail-hero h3 {
  margin: 6px 0 6px;
  font-size: 22px;
  letter-spacing: -.02em;
}
.detail-hero p {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-subtle);
  font-size: 12px;
}
.status-pipeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}
.status-pipeline li {
  min-width: 0;
  padding: 10px 8px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  display: grid;
  gap: 6px;
  justify-items: center;
  text-align: center;
  color: var(--color-subtle);
  background: var(--color-canvas);
}
.status-pipeline li i {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 11px;
  font-weight: 800;
  background: #e2e8f0;
  color: #475569;
}
.status-pipeline li span {
  font-size: 10px;
  font-weight: 700;
  line-height: 1.25;
}
.status-pipeline li.done {
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary-soft) 55%, #fff);
  color: var(--color-primary);
}
.status-pipeline li.done i {
  color: #fff;
  background: var(--color-primary);
}
.status-pipeline li.current {
  border-color: var(--color-primary);
  color: var(--color-text);
  background: #fff;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
.status-pipeline li.current i {
  color: #fff;
  background: var(--color-primary);
}
.status-pipeline li.rejected {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
  grid-column: 1 / -1;
}
.status-pipeline li.rejected i {
  background: #fee2e2;
  color: #991b1b;
}
.status-pipeline li.muted {
  opacity: .45;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.info-card,
.review-card {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fff;
  display: grid;
  gap: 12px;
}
.info-card header,
.review-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.info-card header {
  justify-content: flex-start;
  color: var(--color-primary);
}
.info-card header strong,
.review-card header strong {
  color: var(--color-text);
  font-size: 13px;
}
.review-card header p {
  margin: 4px 0 0;
  color: var(--color-subtle);
  font-size: 12px;
  line-height: 1.4;
}
.review-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 999px;
  color: #1d4ed8;
  background: #dbeafe;
  font-size: 11px;
  font-weight: 750;
  white-space: nowrap;
}
.info-card dl {
  margin: 0;
  display: grid;
  gap: 10px;
}
.info-card dl > div {
  display: grid;
  gap: 2px;
}
.info-card dt {
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 700;
}
.info-card dd {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}
.info-card a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  text-decoration: none;
}
.review-grid {
  display: grid;
  gap: 12px;
}
.review-grid .field { margin: 0; }
.answers-block h4 {
  margin: 0 0 10px;
  font-size: 14px;
}
.answer-cards {
  display: grid;
  gap: 10px;
}
.answer-card {
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-canvas);
  display: grid;
  gap: 6px;
}
.answer-card strong {
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 750;
}
.answer-card p {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.empty-note {
  margin: 0;
  color: var(--color-subtle);
  font-size: 13px;
}
.detail-actions {
  display: flex;
  gap: 8px;
}
.detail-actions .primary-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.enroll-panel {
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-primary-soft) 55%, #fff), #fff);
  display: grid;
  gap: 14px;
}
.enroll-heading {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
}
.enroll-icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: #fff;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
}
.enroll-heading strong {
  display: block;
  color: var(--color-text);
  font-size: 15px;
}
.enroll-heading p {
  margin: 4px 0 0;
  color: var(--color-subtle);
  font-size: 12px;
  line-height: 1.45;
}
.enroll-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.enroll-form .field.wide,
.enroll-form .switch-field,
.enroll-form .primary-button,
.enroll-form .empty-note {
  grid-column: 1 / -1;
}
.enroll-form .primary-button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.field-select {
  position: relative;
  display: flex;
  align-items: center;
}
.field-select select {
  width: 100%;
  appearance: none;
  padding-right: 36px;
}
.field-select svg {
  position: absolute;
  right: 12px;
  pointer-events: none;
  color: var(--color-subtle);
}
.enroll-done,
.enroll-credentials {
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}
.enroll-done {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
}
.enroll-credentials p {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
}
.credential-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.credential-grid > div {
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #bbf7d0;
  display: grid;
  gap: 6px;
}
.credential-grid span {
  color: var(--color-subtle);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.credential-grid strong {
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-size: 13px;
}
.credential-grid .edit-button {
  justify-self: start;
}
.detail-empty { min-height: 360px; }
.rejected-list-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
.rejected-list-button em {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  font-style: normal;
  font-size: 11px;
  font-weight: 800;
  color: #991b1b;
  background: #fee2e2;
}
.admissions-search {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-subtle);
  background: var(--color-canvas);
}
.admissions-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: 13px;
}
.admissions-pagination {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-subtle);
  font-size: 12px;
  font-weight: 650;
}
.rejected-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  grid-template-rows: auto 1fr;
  background: #f4f7fa;
}
.rejected-toolbar {
  padding: 14px 18px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
}
.rejected-toolbar-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 2px;
}
.rejected-toolbar-copy strong {
  color: var(--color-text);
  font-size: 16px;
}
.rejected-toolbar-copy span {
  color: var(--color-subtle);
  font-size: 12px;
}
.rejected-body {
  min-height: 0;
  padding: 16px 18px 20px;
  display: grid;
  gap: 12px;
  grid-template-rows: auto 1fr;
}
.rejected-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 360px);
  gap: 14px;
}
.rejected-table-panel,
.rejected-detail {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}
.rejected-table-scroll {
  min-height: 0;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}
.rejected-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.rejected-table th,
.rejected-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
}
.rejected-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--color-subtle);
  background: var(--color-canvas);
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.rejected-table tbody tr {
  cursor: pointer;
}
.rejected-table tbody tr:hover,
.rejected-table tbody tr.active {
  background: color-mix(in srgb, var(--color-primary-soft) 45%, #fff);
}
.rejected-table td strong {
  display: block;
  color: var(--color-text);
}
.rejected-table td small {
  display: block;
  margin-top: 2px;
  color: var(--color-subtle);
  font-size: 11px;
}
.rejected-detail header {
  display: grid;
  gap: 6px;
}
.rejected-detail h3 {
  margin: 0;
  font-size: 20px;
}
.rejected-detail p {
  margin: 0;
  color: var(--color-subtle);
  font-size: 12px;
}
.rejected-detail dl {
  margin: 0;
  display: grid;
  gap: 10px;
}
.rejected-detail dl > div {
  display: grid;
  gap: 2px;
}
.rejected-detail dt {
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 700;
}
.rejected-detail dd {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.rejected-detail .primary-button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
@media (max-width: 980px) {
  .admissions-layout,
  .detail-grid,
  .enroll-form,
  .credential-grid,
  .status-pipeline,
  .rejected-layout {
    grid-template-columns: 1fr;
  }
  .admissions-layout { min-height: 0; }
  .admission-rows { max-height: 360px; }
  .rejected-fullscreen { inset: 0; }
}
</style>
