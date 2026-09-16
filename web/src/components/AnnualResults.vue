<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  AlertTriangle, Check, CheckCircle2, ChevronRight, ClipboardCheck, Download,
  FileSpreadsheet, FileText, History, Lock, Search, Settings2, Unlock, User,
  Users, X,
} from '@lucide/vue';
import { download, request } from '../api/client.js';

const ROLE_LABELS = {
  director: 'Dirección',
  utp: 'UTP',
  teacher: 'Profesor',
  school_admin: 'Administración',
  super_admin: 'Administración',
};

const ACTION_LABELS = {
  annual_results_finalized: 'Calificaciones finalizadas',
  annual_results_rectified: 'Rectificación registrada',
  annual_acta_closed: 'Acta cerrada',
  annual_acta_reopened: 'Acta reabierta',
  closure_teacher_submit: 'Enviado a UTP',
  closure_utp_approve: 'Aprobado por UTP',
  closure_utp_request_fix: 'Correcciones solicitadas',
  closure_director_approve: 'Autorizado por dirección',
  closure_locked: 'Cierre bloqueado',
  closure_reopened: 'Cierre reabierto',
  closure_student_resolution: 'Resolución de estudiante',
  closure_sige_codes_updated: 'Códigos SIGE actualizados',
};

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'promoted', label: 'Promovidos' },
  { key: 'not_promoted', label: 'Repitencia' },
  { key: 'review', label: 'Requieren análisis' },
  { key: 'pending', label: 'Pendientes' },
];

const options = ref({ years: [], courses: [], permissions: {} });
const yearId = ref('');
const courseKey = ref('');
const data = ref(null);
const rows = ref([]);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const message = ref('');
const tab = ref('students');
const filter = ref('all');
const search = ref('');
const rbd = ref('');
const comment = ref('');
const rectificationReason = ref('');
const sigeValidation = ref(null);
const editingSubjects = ref(false);
const drawerOpen = ref(false);
const activeStudentId = ref(null);
const decisionOpen = ref(false);
const lockOpen = ref(false);
const correctionsOpen = ref(false);
const reopenOpen = ref(false);
const lockConfirm = ref('');
const reopenReason = ref('');
const correctionNote = ref('');

const sigeCodes = reactive({
  sigeTeachingTypeCode: '',
  sigeGradeCode: '',
  sigeEvaluationDecreeCode: '',
  sigeStudyPlanCode: '',
  subjects: [],
});

const decisionForm = reactive({
  finalStatus: 'promoted',
  decisionBasis: '',
  decisionNotes: '',
  attendancePercentage: null,
  identifierType: 'rut',
  nationalId: '',
});

const courses = computed(() => options.value.courses.filter((c) => String(c.academicYearId) === String(yearId.value)));
const selection = computed(() => courses.value.find((c) => `${c.name}|${c.section}` === courseKey.value));
const perms = computed(() => data.value?.permissions || options.value.permissions || {});
const stage = computed(() => data.value?.stage || 'preparation');
const locked = computed(() => stage.value === 'closed' || Boolean(data.value?.actaClosedAt));
const counts = computed(() => data.value?.validation?.counts || {});
const validation = computed(() => data.value?.validation || {});
const workflow = computed(() => data.value?.workflow || []);
const yearName = computed(() => options.value.years.find((y) => String(y.id) === String(yearId.value))?.name || '');
const finalized = computed(() => rows.value.length > 0 && rows.value.every((r) => r.finalizedAt));

const activeRow = computed(() => rows.value.find((r) => r.studentId === activeStudentId.value) || null);

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return rows.value.filter((row) => {
    const sit = situationKey(row);
    if (filter.value === 'promoted' && sit !== 'promoted') return false;
    if (filter.value === 'not_promoted' && sit !== 'not_promoted') return false;
    if (filter.value === 'review' && sit !== 'review') return false;
    if (filter.value === 'pending' && sit !== 'pending') return false;
    if (!q) return true;
    const hay = `${row.lastName} ${row.firstName} ${row.nationalId || ''}`.toLowerCase();
    return hay.includes(q);
  });
});

const sigeCourseComplete = computed(() => (validation.value.courseFields || []).every((f) => f.ok) && Boolean(rbd.value));
const subjectCodeStats = computed(() => {
  const list = sigeCodes.subjects;
  const filled = list.filter((s) => String(s.sigeSubjectCode || '').trim()).length;
  return { filled, total: list.length };
});

watch(yearId, () => {
  courseKey.value = '';
  data.value = null;
  rows.value = [];
  sigeValidation.value = null;
});

onMounted(loadOptions);

async function loadOptions() {
  try {
    options.value = await request('/mineduc/options');
    yearId.value = String(options.value.years.find((y) => y.active)?.id || options.value.years[0]?.id || '');
  } catch (cause) {
    error.value = cause.message;
  }
}

function syncSige(payload) {
  Object.assign(sigeCodes, {
    sigeTeachingTypeCode: payload?.sigeCodes?.sigeTeachingTypeCode || '',
    sigeGradeCode: payload?.sigeCodes?.sigeGradeCode || '',
    sigeEvaluationDecreeCode: payload?.sigeCodes?.sigeEvaluationDecreeCode || '',
    sigeStudyPlanCode: payload?.sigeCodes?.sigeStudyPlanCode || '',
    subjects: (payload?.sigeCodes?.subjects || []).map((item) => ({ ...item, sigeSubjectCode: item.sigeSubjectCode || '' })),
  });
}

function applyPayload(payload) {
  data.value = payload;
  rows.value = (payload.rows || []).map((row) => ({
    ...row,
    nationalId: row.nationalId || '',
    identifierType: row.identifierType || 'rut',
    attendancePercentage: row.attendancePercentage ?? row.attendanceReference,
    finalStatus: row.finalStatus || (row.recommendedStatus === 'promoted' ? 'promoted' : ''),
    decisionBasis: row.decisionBasis || '',
    decisionNotes: row.decisionNotes || '',
  }));
  rbd.value = payload.school?.rbd || '';
  syncSige(payload);
  sigeValidation.value = null;
}

async function load() {
  if (!selection.value) return;
  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    const query = new URLSearchParams({
      academicYearId: yearId.value,
      courseName: selection.value.name,
      section: selection.value.section,
    });
    applyPayload(await request(`/mineduc/annual-results?${query}`));
  } catch (cause) {
    error.value = cause.message;
  } finally {
    loading.value = false;
  }
}

function situationKey(row) {
  if (row.finalStatus === 'promoted') return 'promoted';
  if (row.finalStatus === 'not_promoted') return 'not_promoted';
  if (row.recommendedStatus === 'review_required' && !row.finalStatus) return 'review';
  if (row.finalStatus === 'withdrawn') return 'withdrawn';
  return 'pending';
}

function situationLabel(row) {
  return {
    promoted: 'PROMOVIDO',
    not_promoted: 'REPITENCIA',
    review: 'REQUIERE ANÁLISIS',
    withdrawn: 'RETIRADO',
    pending: 'PENDIENTE',
  }[situationKey(row)];
}

function reviewLabel(row) {
  if (row.decisionAt) return 'Resuelto';
  if (situationKey(row) === 'review') return 'Pendiente UTP';
  if (row.finalizedAt) return 'Listo';
  return '—';
}

function roleLabel(role) {
  return ROLE_LABELS[role] || role || 'Usuario';
}

function historyTitle(item) {
  return ACTION_LABELS[item.action] || item.action;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(value);
  }
}

function fmtGrade(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toFixed(1);
}

function openDrawer(row) {
  activeStudentId.value = row.studentId;
  drawerOpen.value = true;
}

function closeDrawer() {
  drawerOpen.value = false;
  decisionOpen.value = false;
}

function openDecision() {
  const row = activeRow.value;
  if (!row) return;
  Object.assign(decisionForm, {
    finalStatus: row.finalStatus || 'promoted',
    decisionBasis: row.decisionBasis || '',
    decisionNotes: row.decisionNotes || '',
    attendancePercentage: row.attendancePercentage,
    identifierType: row.identifierType || 'rut',
    nationalId: row.nationalId || '',
  });
  decisionOpen.value = true;
}

function applyDecisionLocally() {
  const row = activeRow.value;
  if (!row) return;
  if (String(decisionForm.decisionBasis || '').trim().length < 20) {
    error.value = 'El fundamento debe tener al menos 20 caracteres.';
    return;
  }
  row.finalStatus = decisionForm.finalStatus;
  row.decisionBasis = decisionForm.decisionBasis.trim();
  row.decisionNotes = decisionForm.decisionNotes.trim();
  row.attendancePercentage = decisionForm.attendancePercentage;
  row.identifierType = decisionForm.identifierType;
  row.nationalId = decisionForm.nationalId;
  decisionOpen.value = false;
  message.value = 'Decisión aplicada localmente. Guarda o registra para persistir.';
}

async function saveStudentResolution() {
  if (!selection.value || !activeRow.value || locked.value) return;
  if (String(decisionForm.decisionBasis || '').trim().length < 20) {
    error.value = 'El fundamento debe tener al menos 20 caracteres.';
    return;
  }
  busy.value = true;
  error.value = '';
  try {
    applyPayload(await request('/mineduc/annual-results/student-resolution', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: Number(yearId.value),
        courseName: selection.value.name,
        section: selection.value.section,
        studentId: activeRow.value.studentId,
        finalStatus: decisionForm.finalStatus,
        decisionBasis: decisionForm.decisionBasis.trim(),
        decisionNotes: decisionForm.decisionNotes.trim() || undefined,
        attendancePercentage: decisionForm.attendancePercentage,
        identifierType: decisionForm.identifierType,
        nationalId: decisionForm.nationalId,
      }),
    }));
    decisionOpen.value = false;
    message.value = 'Resolución registrada.';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

async function saveSigeCodes() {
  if (!selection.value || locked.value) return;
  busy.value = true;
  error.value = '';
  try {
    const query = new URLSearchParams({
      academicYearId: yearId.value,
      courseName: selection.value.name,
      section: selection.value.section,
    });
    applyPayload(await request(`/mineduc/annual-results/sige-codes?${query}`, {
      method: 'PUT',
      body: JSON.stringify({
        sigeTeachingTypeCode: sigeCodes.sigeTeachingTypeCode,
        sigeGradeCode: sigeCodes.sigeGradeCode,
        sigeEvaluationDecreeCode: sigeCodes.sigeEvaluationDecreeCode,
        sigeStudyPlanCode: sigeCodes.sigeStudyPlanCode,
        subjects: sigeCodes.subjects,
      }),
    }));
    editingSubjects.value = false;
    message.value = 'Códigos SIGE guardados.';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

async function finalize(sendToUtp = true) {
  if (!selection.value || locked.value) return;
  busy.value = true;
  error.value = '';
  try {
    await request('/mineduc/annual-results/finalize', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: Number(yearId.value),
        courseName: selection.value.name,
        section: selection.value.section,
        rbd: rbd.value,
        replace: finalized.value,
        rectificationReason: rectificationReason.value || undefined,
        comment: comment.value || (sendToUtp ? 'Calificaciones enviadas a UTP' : undefined),
        rows: rows.value.map((row) => ({
          studentId: row.studentId,
          nationalId: row.nationalId,
          identifierType: row.identifierType,
          attendancePercentage: Number(row.attendancePercentage),
          finalStatus: row.finalStatus,
          decisionBasis: row.decisionBasis,
          decisionNotes: row.decisionNotes,
        })),
      }),
    });
    message.value = finalized.value ? 'Rectificación guardada.' : (sendToUtp ? 'Enviado a UTP.' : 'Calificaciones finalizadas.');
    rectificationReason.value = '';
    comment.value = '';
    await load();
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

async function runWorkflow(action, extra = {}) {
  if (!selection.value) return;
  busy.value = true;
  error.value = '';
  try {
    applyPayload(await request('/mineduc/annual-results/workflow', {
      method: 'POST',
      body: JSON.stringify({
        action,
        academicYearId: Number(yearId.value),
        courseName: selection.value.name,
        section: selection.value.section,
        comment: extra.comment || comment.value || undefined,
        confirm: extra.confirm,
      }),
    }));
    message.value = {
      request_corrections: 'Correcciones solicitadas al profesor.',
      approve_utp: 'Revisión UTP aprobada.',
      approve_director: 'Cierre autorizado por dirección.',
      lock: 'Cierre bloqueado.',
      reopen: 'Cierre reabierto.',
    }[action] || 'Acción completada.';
    comment.value = '';
    lockOpen.value = false;
    correctionsOpen.value = false;
    reopenOpen.value = false;
    lockConfirm.value = '';
    correctionNote.value = '';
    reopenReason.value = '';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

async function validateSige() {
  if (!selection.value) return;
  busy.value = true;
  error.value = '';
  try {
    sigeValidation.value = await request('/mineduc/annual-results/validate-sige', {
      method: 'POST',
      body: JSON.stringify({
        academicYearId: Number(yearId.value),
        courseName: selection.value.name,
        section: selection.value.section,
      }),
    });
    message.value = sigeValidation.value.message;
  } catch (cause) {
    error.value = cause.message;
    if (cause.details?.errors) {
      sigeValidation.value = { ready: false, message: cause.message, errors: cause.details.errors };
    }
  } finally {
    busy.value = false;
  }
}

async function downloadBlob(path, filename) {
  const query = new URLSearchParams({
    academicYearId: yearId.value,
    courseName: selection.value.name,
    section: selection.value.section,
  });
  const response = await download(`${path}?${query}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function exportFile(format, filename) {
  if (!selection.value) return;
  try {
    const base = `preacta-${selection.value.name}-${selection.value.section}`;
    await downloadBlob(`/mineduc/annual-results/export.${format}`, filename || `${base}.${format}`);
  } catch (cause) {
    error.value = cause.message;
  }
}

async function exportSigePair() {
  if (!selection.value) return;
  busy.value = true;
  error.value = '';
  try {
    await validateSige();
    if (!sigeValidation.value?.ready) return;
    await downloadBlob('/mineduc/annual-results/export.ex4.txt', 'calificaciones_ex4.txt');
    await downloadBlob('/mineduc/annual-results/export.ex5.txt', 'situacion_final_ex5.txt');
    message.value = 'Archivos EX4 y EX5 descargados (preparación para SIGE).';
  } catch (cause) {
    error.value = cause.message;
  } finally {
    busy.value = false;
  }
}

function submitCorrections() {
  if (!correctionNote.value.trim()) {
    error.value = 'Indica qué debe corregir el profesor.';
    return;
  }
  runWorkflow('request_corrections', { comment: correctionNote.value.trim() });
}

function submitLock() {
  runWorkflow('lock', { confirm: lockConfirm.value, comment: comment.value || 'Cierre anual bloqueado' });
}

function submitReopen() {
  if (reopenReason.value.trim().length < 20) {
    error.value = 'El fundamento de reapertura debe tener al menos 20 caracteres.';
    return;
  }
  runWorkflow('reopen', { comment: reopenReason.value.trim() });
}

function checkTone(check) {
  if (check.ok) return 'ok';
  return check.blocking ? 'error' : 'warn';
}
</script>

<template>
  <section class="ar">
    <header class="ar-header panel">
      <div class="ar-header-main">
        <div class="ar-title-block">
          <p class="ar-kicker">Decreto 67/2018 · MINEDUC</p>
          <h2>Cierre anual MINEDUC</h2>
          <p class="ar-sub">Prepara el cierre de curso, revisión pedagógica y exportación hacia SIGE.</p>
          <div class="ar-badges" v-if="data">
            <span class="badge year">{{ yearName || data.academicYear?.name }}</span>
            <span class="badge stage">{{ data.stageLabel }}</span>
            <span v-if="locked" class="badge locked"><Lock :size="12" /> Cerrado</span>
          </div>
        </div>
        <div class="ar-meta" v-if="data">
          <div><span>Curso</span><strong>{{ data.courseName }} {{ data.section }}</strong></div>
          <div><span>Profesor jefe</span><strong>{{ data.staff?.headTeacher || data.headTeacher || '—' }}</strong></div>
          <div><span>UTP</span><strong>{{ data.staff?.utp || '—' }}</strong></div>
          <div><span>Director</span><strong>{{ data.staff?.director || '—' }}</strong></div>
        </div>
      </div>
      <div class="ar-selectors">
        <label class="field"><span>Año</span>
          <select v-model="yearId">
            <option v-for="y in options.years" :key="y.id" :value="String(y.id)">{{ y.name }}</option>
          </select>
        </label>
        <label class="field"><span>Curso</span>
          <select v-model="courseKey">
            <option value="">Selecciona</option>
            <option v-for="c in courses" :key="`${c.name}|${c.section}`" :value="`${c.name}|${c.section}`">{{ c.name }} {{ c.section }}</option>
          </select>
        </label>
        <button class="primary-button" type="button" :disabled="!selection || loading" @click="load">
          {{ loading ? 'Cargando…' : 'Preparar cierre' }}
        </button>
      </div>
    </header>

    <p v-if="error" class="ar-alert error" role="alert">{{ error }}</p>
    <p v-if="message" class="ar-alert success" role="status">{{ message }}</p>

    <template v-if="data">
      <nav class="ar-workflow panel" aria-label="Flujo de cierre">
        <div
          v-for="(step, idx) in workflow"
          :key="step.key"
          class="wf-step"
          :class="{ done: step.done, current: !step.done && (idx === 0 || workflow[idx - 1]?.done) }"
        >
          <div class="wf-dot"><Check v-if="step.done" :size="14" /></div>
          <div class="wf-body">
            <strong>{{ step.title }}</strong>
            <small>{{ step.detail }}</small>
            <em v-if="step.by || step.at">{{ step.by || '' }}{{ step.at ? ` · ${formatDate(step.at)}` : '' }}</em>
          </div>
          <ChevronRight v-if="idx < workflow.length - 1" class="wf-arrow" :size="16" />
        </div>
      </nav>

      <div class="ar-summary">
        <article class="panel sum"><Users :size="16" /><strong>{{ counts.students ?? 0 }}</strong><span>Estudiantes</span></article>
        <article class="panel sum ok"><strong>{{ counts.promoted ?? 0 }}</strong><span>Promovidos</span></article>
        <article class="panel sum bad"><strong>{{ counts.notPromoted ?? 0 }}</strong><span>Repitencia</span></article>
        <article class="panel sum warn"><strong>{{ counts.reviewRequired ?? 0 }}</strong><span>Análisis</span></article>
        <article class="panel sum muted"><strong>{{ counts.unresolved ?? 0 }}</strong><span>Sin resolver</span></article>
        <article class="panel progress">
          <div class="progress-head"><span>Avance de validación</span><strong>{{ validation.percent ?? 0 }}%</strong></div>
          <div class="progress-bar"><i :style="{ width: `${validation.percent || 0}%` }" /></div>
          <small>{{ validation.completed ?? 0 }}/{{ validation.total ?? 0 }} controles</small>
        </article>
      </div>

      <div class="ar-tabs" role="tablist">
        <button type="button" role="tab" :class="{ active: tab === 'students' }" @click="tab = 'students'"><Users :size="14" /> Estudiantes</button>
        <button type="button" role="tab" :class="{ active: tab === 'subjects' }" @click="tab = 'subjects'"><ClipboardCheck :size="14" /> Asignaturas</button>
        <button type="button" role="tab" :class="{ active: tab === 'sige' }" @click="tab = 'sige'"><Settings2 :size="14" /> Configuración SIGE</button>
        <button type="button" role="tab" :class="{ active: tab === 'checks' }" @click="tab = 'checks'"><AlertTriangle :size="14" /> Validaciones</button>
        <button type="button" role="tab" :class="{ active: tab === 'history' }" @click="tab = 'history'"><History :size="14" /> Historial</button>
      </div>

      <!-- Estudiantes -->
      <section v-show="tab === 'students'" class="panel ar-tab-panel">
        <div class="table-toolbar">
          <div class="chips">
            <button
              v-for="f in FILTERS"
              :key="f.key"
              type="button"
              class="chip"
              :class="{ active: filter === f.key }"
              @click="filter = f.key"
            >{{ f.label }}</button>
          </div>
          <label class="search-field">
            <Search :size="14" />
            <input v-model.trim="search" type="search" placeholder="Buscar por nombre o RUN…" />
          </label>
        </div>
        <div class="table-wrap">
          <table class="ar-table">
            <thead>
              <tr>
                <th>RUN</th>
                <th>Estudiante</th>
                <th>Promedio</th>
                <th>Asistencia</th>
                <th>Reprobadas</th>
                <th>Situación</th>
                <th>Revisión</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredRows" :key="row.studentId">
                <td class="mono">{{ row.nationalId || '—' }}</td>
                <td><strong>{{ row.lastName }}, {{ row.firstName }}</strong></td>
                <td>{{ fmtGrade(row.annualAverage) }}</td>
                <td>{{ row.attendancePercentage != null ? `${row.attendancePercentage}%` : '—' }}</td>
                <td>{{ row.failedSubjects ?? 0 }}</td>
                <td><span class="sit" :class="situationKey(row)">{{ situationLabel(row) }}</span></td>
                <td><span class="rev" :class="{ pending: situationKey(row) === 'review' }">{{ reviewLabel(row) }}</span></td>
                <td class="actions">
                  <button type="button" class="link-btn" @click="openDrawer(row)">Ver</button>
                  <button
                    v-if="perms.canResolveStudent && !locked"
                    type="button"
                    class="link-btn"
                    @click="openDrawer(row); openDecision()"
                  >Revisar</button>
                </td>
              </tr>
              <tr v-if="!filteredRows.length"><td colspan="8" class="empty">Sin estudiantes para este filtro.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Asignaturas -->
      <section v-show="tab === 'subjects'" class="panel ar-tab-panel">
        <header class="panel-head">
          <div>
            <strong>Asignaturas del curso</strong>
            <p>Códigos SIGE e incidencia en promoción.</p>
          </div>
          <div class="panel-actions">
            <button v-if="perms.canConfigureSige && !locked" type="button" class="secondary-button" @click="editingSubjects = !editingSubjects">
              {{ editingSubjects ? 'Cancelar' : 'Editar códigos' }}
            </button>
            <button v-if="editingSubjects" type="button" class="primary-button" :disabled="busy" @click="saveSigeCodes">Guardar</button>
          </div>
        </header>
        <div class="table-wrap">
          <table class="ar-table">
            <thead><tr><th>Asignatura</th><th>Código SIGE</th><th>Incide</th><th>Estado</th></tr></thead>
            <tbody>
              <tr v-for="sub in sigeCodes.subjects" :key="sub.courseId">
                <td><strong>{{ sub.name }}</strong></td>
                <td>
                  <input
                    v-if="editingSubjects"
                    v-model.trim="sub.sigeSubjectCode"
                    class="code-input"
                    inputmode="numeric"
                    placeholder="Ej. 21220"
                  />
                  <span v-else class="mono">{{ sub.sigeSubjectCode || '—' }}</span>
                </td>
                <td>{{ sub.affectsPromotion !== false ? 'Sí' : 'No' }}</td>
                <td>
                  <span class="sit" :class="String(sub.sigeSubjectCode || '').trim() ? 'promoted' : 'review'">
                    {{ String(sub.sigeSubjectCode || '').trim() ? 'Completo' : 'Falta código' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Config SIGE -->
      <section v-show="tab === 'sige'" class="panel ar-tab-panel sige-config">
        <header class="panel-head">
          <div>
            <strong>Configuración SIGE del curso</strong>
            <p>RBD y códigos de enseñanza requeridos para EX4/EX5.</p>
          </div>
          <span class="sit" :class="sigeCourseComplete ? 'promoted' : 'review'">
            {{ sigeCourseComplete ? 'Completo' : 'Incompleto' }}
          </span>
        </header>
        <div class="sige-grid">
          <label class="field"><span>RBD</span><input v-model.trim="rbd" maxlength="12" :disabled="locked || !perms.canConfigureSige" placeholder="12345-6" /></label>
          <label class="field"><span>Tipo de enseñanza</span><input v-model.trim="sigeCodes.sigeTeachingTypeCode" :disabled="locked || !perms.canConfigureSige" /></label>
          <label class="field"><span>Grado</span><input v-model.trim="sigeCodes.sigeGradeCode" :disabled="locked || !perms.canConfigureSige" /></label>
          <label class="field"><span>Decreto / resolución</span><input v-model.trim="sigeCodes.sigeEvaluationDecreeCode" :disabled="locked || !perms.canConfigureSige" /></label>
          <label class="field"><span>Plan de estudio</span><input v-model.trim="sigeCodes.sigeStudyPlanCode" :disabled="locked || !perms.canConfigureSige" /></label>
        </div>
        <div class="sige-status-row">
          <span>Códigos de asignatura: <strong>{{ subjectCodeStats.filled }}/{{ subjectCodeStats.total }}</strong></span>
          <button v-if="perms.canConfigureSige && !locked" type="button" class="primary-button" :disabled="busy" @click="saveSigeCodes">
            {{ busy ? 'Guardando…' : 'Guardar configuración' }}
          </button>
        </div>
        <ul class="field-status">
          <li v-for="f in (validation.courseFields || [])" :key="f.key" :class="{ ok: f.ok }">
            <CheckCircle2 v-if="f.ok" :size="14" /><AlertTriangle v-else :size="14" /> {{ f.label }}
          </li>
        </ul>
      </section>

      <!-- Validaciones -->
      <section v-show="tab === 'checks'" class="panel ar-tab-panel">
        <header class="panel-head">
          <div>
            <strong>Validaciones de cierre</strong>
            <p>Controles bloqueantes y advertencias antes de exportar.</p>
          </div>
          <button type="button" class="primary-button" :disabled="busy" @click="validateSige">Validar cierre</button>
        </header>
        <ul class="check-list">
          <li v-for="check in (validation.checks || [])" :key="check.id" :class="checkTone(check)">
            <CheckCircle2 v-if="check.ok" :size="16" />
            <AlertTriangle v-else :size="16" />
            <span>{{ check.label }}</span>
            <em>{{ check.ok ? 'OK' : (check.blocking ? 'Bloqueante' : 'Advertencia') }}</em>
          </li>
        </ul>
        <div v-if="sigeValidation" class="sige-result" :class="{ ready: sigeValidation.ready }">
          <strong>{{ sigeValidation.message }}</strong>
          <ul v-if="sigeValidation.errors?.length"><li v-for="e in sigeValidation.errors" :key="e">{{ e }}</li></ul>
        </div>
      </section>

      <!-- Historial -->
      <section v-show="tab === 'history'" class="panel ar-tab-panel">
        <ol class="history-list">
          <li v-for="item in (data.history || [])" :key="item.id">
            <div class="hist-dot" />
            <div>
              <strong>{{ historyTitle(item) }}</strong>
              <p>{{ item.actor }} · {{ roleLabel(item.role) }} · {{ formatDate(item.at) }}</p>
              <small v-if="item.comment">{{ item.comment }}</small>
            </div>
          </li>
          <li v-if="!(data.history || []).length" class="empty">Sin eventos registrados.</li>
        </ol>
      </section>

      <footer class="ar-footer">
        <div class="footer-left">
          <span v-if="locked" class="sit locked"><Lock :size="12" /> Cierre bloqueado</span>
          <button v-if="locked && perms.canUnlock" type="button" class="secondary-button" @click="reopenOpen = true">
            <Unlock :size="14" /> Reabrir
          </button>
        </div>
        <div class="footer-actions" v-if="!locked">
          <template v-if="perms.canSubmitTeacher && (stage === 'preparation' || finalized)">
            <label v-if="finalized" class="field rect-field">
              <span>Fundamento rectificación</span>
              <input v-model.trim="rectificationReason" minlength="20" placeholder="Mín. 20 caracteres" />
            </label>
            <button type="button" class="secondary-button" :disabled="busy" @click="finalize(false)">Finalizar calificaciones</button>
            <button type="button" class="primary-button" :disabled="busy || (finalized && rectificationReason.length < 20)" @click="finalize(true)">
              Enviar a UTP
            </button>
          </template>

          <template v-if="perms.canReviewUtp && stage === 'teacher_ready'">
            <button type="button" class="secondary-button" @click="correctionsOpen = true">Solicitar correcciones</button>
            <button type="button" class="primary-button" :disabled="busy" @click="runWorkflow('approve_utp')">Aprobar revisión</button>
          </template>

          <template v-if="perms.canApproveDirector && stage === 'utp_approved'">
            <button type="button" class="primary-button" :disabled="busy" @click="runWorkflow('approve_director')">Autorizar cierre</button>
          </template>

          <template v-if="perms.canExport && ['director_approved', 'closed'].includes(stage)">
            <div class="export-block">
              <span class="export-label">Preparación para SIGE</span>
              <button type="button" class="secondary-button" :disabled="busy" @click="exportFile('csv', 'preacta.csv')"><FileSpreadsheet :size="14" /> CSV</button>
              <button type="button" class="secondary-button" :disabled="busy" @click="exportFile('pdf', 'preacta.pdf')"><FileText :size="14" /> PDF</button>
              <button type="button" class="secondary-button" :disabled="busy" @click="exportSigePair"><Download :size="14" /> EX4 / EX5</button>
            </div>
          </template>

          <template v-if="perms.canLock && stage === 'director_approved'">
            <button type="button" class="secondary-button" :disabled="busy" @click="validateSige">Preparar exportación</button>
            <button type="button" class="primary-button danger" @click="lockOpen = true"><Lock :size="14" /> Bloquear cierre</button>
          </template>
        </div>
        <div class="footer-actions" v-else-if="perms.canExport">
          <div class="export-block">
            <span class="export-label">Preparación para SIGE</span>
            <button type="button" class="secondary-button" @click="exportFile('csv')">CSV</button>
            <button type="button" class="secondary-button" @click="exportFile('pdf')">PDF</button>
            <button type="button" class="secondary-button" @click="exportSigePair">EX4 / EX5</button>
          </div>
        </div>
      </footer>
    </template>

    <!-- Drawer estudiante -->
    <aside v-if="drawerOpen && activeRow" class="drawer" role="dialog" aria-modal="true">
      <div class="drawer-backdrop" @click="closeDrawer" />
      <div class="drawer-panel">
        <header>
          <div>
            <strong>{{ activeRow.lastName }}, {{ activeRow.firstName }}</strong>
            <span class="sit" :class="situationKey(activeRow)">{{ situationLabel(activeRow) }}</span>
          </div>
          <button type="button" class="icon-btn" @click="closeDrawer"><X :size="18" /></button>
        </header>

        <section>
          <h4>Resumen</h4>
          <div class="drawer-grid">
            <label class="field"><span>Tipo ID</span>
              <select v-model="activeRow.identifierType" :disabled="locked"><option value="rut">RUT</option><option value="ipe">IPE</option></select>
            </label>
            <label class="field"><span>RUN / IPE</span><input v-model.trim="activeRow.nationalId" :disabled="locked" /></label>
            <label class="field"><span>Asistencia %</span><input v-model.number="activeRow.attendancePercentage" type="number" min="0" max="100" step="0.01" :disabled="locked" /></label>
            <label class="field"><span>Situación</span>
              <select v-model="activeRow.finalStatus" :disabled="locked">
                <option value="">Pendiente</option>
                <option value="promoted">Promovido</option>
                <option value="not_promoted">No promovido</option>
                <option value="withdrawn">Retirado</option>
              </select>
            </label>
          </div>
          <p class="muted">Promedio {{ fmtGrade(activeRow.annualAverage) }} · {{ activeRow.failedSubjects ?? 0 }} reprobadas · Ref. asistencia {{ activeRow.attendanceReference ?? '—' }}%</p>
        </section>

        <section>
          <h4>Calificaciones</h4>
          <table class="ar-table compact">
            <thead><tr><th>Asignatura</th><th>Nota</th><th>SIGE</th><th>Incide</th></tr></thead>
            <tbody>
              <tr v-for="s in activeRow.subjectResults" :key="s.courseId" :class="{ fail: s.finalGrade != null && s.finalGrade < 4 }">
                <td>{{ s.name }}</td>
                <td>{{ s.exempt ? 'EX' : fmtGrade(s.finalGrade) }}</td>
                <td class="mono">{{ s.sigeSubjectCode || '—' }}</td>
                <td>{{ s.affectsPromotion !== false ? 'Sí' : 'No' }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h4>Asistencia</h4>
          <div class="att-stats">
            <span>Días registrados: <b>{{ activeRow.attendanceStats?.daysWorked ?? '—' }}</b></span>
            <span>Presentes: <b>{{ activeRow.attendanceStats?.daysPresent ?? '—' }}</b></span>
            <span>Ausentes: <b>{{ activeRow.attendanceStats?.daysAbsent ?? '—' }}</b></span>
          </div>
        </section>

        <section>
          <h4>Criterios Decreto 67</h4>
          <ul class="criteria">
            <li :class="{ ok: activeRow.criteria?.averageOk }"><Check v-if="activeRow.criteria?.averageOk" :size="14" /><AlertTriangle v-else :size="14" /> Promedio / reprobadas</li>
            <li :class="{ ok: activeRow.criteria?.failedOk }"><Check v-if="activeRow.criteria?.failedOk" :size="14" /><AlertTriangle v-else :size="14" /> Máx. 2 reprobadas</li>
            <li :class="{ ok: activeRow.criteria?.attendanceOk }"><Check v-if="activeRow.criteria?.attendanceOk" :size="14" /><AlertTriangle v-else :size="14" /> Asistencia ≥ 85%</li>
          </ul>
        </section>

        <label v-if="!locked" class="field"><span>Fundamento</span>
          <textarea v-model.trim="activeRow.decisionBasis" rows="3" maxlength="5000" placeholder="Análisis deliberativo…" />
        </label>

        <footer v-if="!locked">
          <button v-if="perms.canResolveStudent" type="button" class="primary-button" @click="openDecision">
            <User :size="14" /> Registrar decisión
          </button>
        </footer>
      </div>
    </aside>

    <!-- Modal decisión -->
    <div v-if="decisionOpen" class="modal" role="dialog" aria-modal="true">
      <div class="modal-backdrop" @click="decisionOpen = false" />
      <div class="modal-card panel">
        <header><strong>Registrar decisión</strong><button type="button" class="icon-btn" @click="decisionOpen = false"><X :size="16" /></button></header>
        <label class="field"><span>Situación final</span>
          <select v-model="decisionForm.finalStatus">
            <option value="promoted">Promover</option>
            <option value="not_promoted">Repetir</option>
            <option value="withdrawn">Retirado</option>
          </select>
        </label>
        <label class="field"><span>Fundamento (mín. 20)</span>
          <textarea v-model.trim="decisionForm.decisionBasis" rows="4" maxlength="5000" />
        </label>
        <label class="field"><span>Notas adicionales</span>
          <textarea v-model.trim="decisionForm.decisionNotes" rows="2" />
        </label>
        <footer class="modal-actions">
          <button type="button" class="secondary-button" @click="applyDecisionLocally">Aplicar local</button>
          <button v-if="perms.canResolveStudent" type="button" class="primary-button" :disabled="busy" @click="saveStudentResolution">Guardar resolución</button>
        </footer>
      </div>
    </div>

    <!-- Modal correcciones -->
    <div v-if="correctionsOpen" class="modal" role="dialog">
      <div class="modal-backdrop" @click="correctionsOpen = false" />
      <div class="modal-card panel">
        <header><strong>Solicitar correcciones</strong><button type="button" class="icon-btn" @click="correctionsOpen = false"><X :size="16" /></button></header>
        <label class="field"><span>Indicaciones al profesor</span>
          <textarea v-model.trim="correctionNote" rows="4" placeholder="Describe qué debe corregirse…" />
        </label>
        <footer class="modal-actions">
          <button type="button" class="primary-button" :disabled="busy" @click="submitCorrections">Enviar</button>
        </footer>
      </div>
    </div>

    <!-- Modal lock -->
    <div v-if="lockOpen" class="modal" role="dialog">
      <div class="modal-backdrop" @click="lockOpen = false" />
      <div class="modal-card panel">
        <header><strong>Bloquear cierre</strong><button type="button" class="icon-btn" @click="lockOpen = false"><X :size="16" /></button></header>
        <p class="muted">Escribe <code>CERRAR CURSO</code> para confirmar. El acta oficial se firma en SIGE.</p>
        <label class="field"><span>Confirmación</span><input v-model.trim="lockConfirm" placeholder="CERRAR CURSO" /></label>
        <footer class="modal-actions">
          <button type="button" class="primary-button danger" :disabled="busy || lockConfirm.toUpperCase() !== 'CERRAR CURSO'" @click="submitLock">Bloquear</button>
        </footer>
      </div>
    </div>

    <!-- Modal reopen -->
    <div v-if="reopenOpen" class="modal" role="dialog">
      <div class="modal-backdrop" @click="reopenOpen = false" />
      <div class="modal-card panel">
        <header><strong>Reabrir cierre</strong><button type="button" class="icon-btn" @click="reopenOpen = false"><X :size="16" /></button></header>
        <label class="field"><span>Fundamento (mín. 20)</span><textarea v-model.trim="reopenReason" rows="3" /></label>
        <footer class="modal-actions">
          <button type="button" class="primary-button" :disabled="busy" @click="submitReopen">Reabrir</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ar{--ar-max:1400px;max-width:var(--ar-max);margin:0 auto;display:grid;gap:14px;padding-bottom:88px}
.ar-header{padding:18px 20px;display:grid;gap:16px}.ar-header-main{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
.ar-kicker{margin:0;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--color-muted)}
.ar-title-block h2{margin:4px 0 6px;font-size:22px;color:var(--color-text)}.ar-sub{margin:0;color:var(--color-subtle);font-size:13px;max-width:52ch}
.ar-badges{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.badge{display:inline-flex;align-items:center;gap:4px;padding:4px 9px;border-radius:999px;border:1px solid var(--color-border);font-size:11px;font-weight:750;background:var(--color-canvas)}
.badge.year{color:var(--color-primary);border-color:color-mix(in srgb,var(--color-primary) 30%,var(--color-border))}
.badge.stage{background:color-mix(in srgb,var(--color-primary) 8%,#fff);color:var(--color-primary)}
.badge.locked{color:#8a5a00;background:#fff8e8;border-color:#f0d48a}
.ar-meta{display:grid;grid-template-columns:repeat(2,minmax(120px,1fr));gap:8px 18px;min-width:min(420px,100%)}
.ar-meta span{display:block;font-size:10px;color:var(--color-muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700}.ar-meta strong{font-size:13px}
.ar-selectors{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end}
.ar-alert{margin:0;padding:10px 12px;border-radius:10px;font-size:13px}.ar-alert.error{color:var(--color-error);background:var(--color-error-soft)}.ar-alert.success{color:var(--color-success);background:var(--color-success-soft)}
.ar-workflow{padding:14px 16px;display:flex;gap:4px;overflow-x:auto}.wf-step{display:flex;align-items:center;gap:8px;min-width:140px;flex:1}
.wf-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--color-border);display:grid;place-items:center;background:var(--color-canvas);flex:0 0 auto;color:#fff}
.wf-step.done .wf-dot{background:var(--color-success);border-color:var(--color-success)}.wf-step.current .wf-dot{border-color:var(--color-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-primary) 20%,transparent)}
.wf-body{display:grid;gap:1px;min-width:0}.wf-body strong{font-size:12px}.wf-body small,.wf-body em{font-size:10px;color:var(--color-subtle);font-style:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wf-arrow{color:var(--color-border);flex:0 0 auto}
.ar-summary{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.sum{padding:12px 14px;display:grid;gap:2px;align-content:start}.sum svg{color:var(--color-muted)}.sum strong{font-size:20px;line-height:1.1}.sum span{font-size:11px;color:var(--color-subtle)}
.sum.ok strong{color:var(--color-success)}.sum.bad strong{color:var(--color-error)}.sum.warn strong{color:#8a5a00}
.progress{padding:12px 14px;display:grid;gap:6px}.progress-head{display:flex;justify-content:space-between;font-size:12px}
.progress-bar{height:8px;border-radius:999px;background:var(--color-canvas);border:1px solid var(--color-border);overflow:hidden}.progress-bar i{display:block;height:100%;background:var(--color-primary);border-radius:inherit}.progress small{color:var(--color-subtle);font-size:11px}
.ar-tabs{display:flex;gap:4px;flex-wrap:wrap;border-bottom:1px solid var(--color-border)}.ar-tabs button{display:inline-flex;align-items:center;gap:6px;padding:10px 12px;border:0;border-bottom:2px solid transparent;background:transparent;color:var(--color-muted);font:650 12px/1 inherit;cursor:pointer;margin-bottom:-1px}.ar-tabs button.active{color:var(--color-primary);border-bottom-color:var(--color-primary)}
.ar-tab-panel{padding:14px 16px;display:grid;gap:12px}.panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap}.panel-head p{margin:4px 0 0;color:var(--color-subtle);font-size:12px}.panel-actions{display:flex;gap:8px}
.table-toolbar{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{padding:5px 10px;border-radius:999px;border:1px solid var(--color-border);background:var(--color-canvas);font-size:11px;font-weight:650;cursor:pointer;color:var(--color-muted)}.chip.active{background:color-mix(in srgb,var(--color-primary) 12%,#fff);border-color:color-mix(in srgb,var(--color-primary) 35%,var(--color-border));color:var(--color-primary)}
.search-field{display:flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid var(--color-border);border-radius:10px;background:#fff;min-width:220px}.search-field input{border:0;outline:0;width:100%;font:inherit;background:transparent}
.table-wrap{overflow:auto}.ar-table{width:100%;border-collapse:collapse;font-size:12px}.ar-table th,.ar-table td{padding:8px 10px;border-bottom:1px solid var(--color-border);text-align:left;white-space:nowrap}.ar-table th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--color-muted)}.ar-table.compact th,.ar-table.compact td{padding:6px 8px}.ar-table tr.fail td{color:var(--color-error)}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px}.empty{text-align:center;color:var(--color-subtle);padding:20px!important}.actions{display:flex;gap:8px}.link-btn{border:0;background:none;color:var(--color-primary);font:650 12px/1 inherit;cursor:pointer;padding:0}
.sit{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:999px;font-size:10px;font-weight:800}.sit.promoted{color:var(--color-success);background:var(--color-success-soft)}.sit.not_promoted{color:var(--color-error);background:var(--color-error-soft)}.sit.review{color:#8a5a00;background:#fff2c7}.sit.pending,.sit.withdrawn{color:var(--color-muted);background:var(--color-canvas);border:1px solid var(--color-border)}.sit.locked{color:#8a5a00;background:#fff8e8}.rev{font-size:11px;color:var(--color-subtle)}.rev.pending{color:#1d4ed8;font-weight:700}
.code-input{width:110px;padding:6px 8px;border:1px solid var(--color-border);border-radius:8px;font:750 13px/1 ui-monospace,Menlo,monospace}
.sige-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.sige-status-row{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px}
.field-status{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}.field-status li{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:8px;border:1px solid var(--color-border);font-size:11px;color:var(--color-error)}.field-status li.ok{color:var(--color-success)}
.check-list{list-style:none;margin:0;padding:0;display:grid;gap:8px}.check-list li{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--color-border);border-radius:10px;font-size:13px}
.check-list li.ok{border-color:color-mix(in srgb,var(--color-success) 35%,var(--color-border));background:var(--color-success-soft);color:var(--color-success)}.check-list li.warn{border-color:#f0d48a;background:#fff8e8;color:#8a5a00}.check-list li.error{border-color:color-mix(in srgb,var(--color-error) 35%,var(--color-border));background:var(--color-error-soft);color:var(--color-error)}.check-list em{font-style:normal;font-size:10px;font-weight:800;text-transform:uppercase}
.sige-result{padding:12px;border-radius:10px;border:1px solid #e9a5a5;background:var(--color-error-soft);color:var(--color-error)}.sige-result.ready{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.sige-result ul{margin:8px 0 0;padding-left:18px;font-size:12px}
.history-list{list-style:none;margin:0;padding:0}.history-list>li{display:grid;grid-template-columns:16px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-border)}.hist-dot{width:10px;height:10px;margin-top:5px;border-radius:50%;background:var(--color-primary)}.history-list strong{font-size:13px}.history-list p{margin:2px 0;font-size:12px;color:var(--color-subtle)}.history-list small{color:var(--color-muted);font-size:12px}
.ar-footer{position:sticky;bottom:10px;z-index:20;padding:12px 14px;border:1px solid var(--color-border);border-radius:14px;background:color-mix(in srgb,var(--color-surface) 92%,#fff);box-shadow:0 10px 28px color-mix(in srgb,var(--color-text) 10%,transparent);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center}
.footer-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:end;justify-content:flex-end}.footer-left{display:flex;gap:8px;align-items:center}
.export-block{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px;border:1px dashed var(--color-border);border-radius:10px}.export-label{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--color-muted);margin-right:4px}.rect-field{min-width:220px;margin:0}.primary-button.danger{background:var(--color-error);border-color:var(--color-error)}
.drawer{position:fixed;inset:0;z-index:40}.drawer-backdrop{position:absolute;inset:0;background:#0a254040}
.drawer-panel{position:absolute;top:0;right:0;width:min(480px,100%);height:100%;overflow:auto;background:var(--color-surface,#fff);border-left:1px solid var(--color-border);padding:16px;display:grid;gap:14px;align-content:start}
.drawer-panel>header{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.drawer-panel h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--color-muted)}.drawer-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.att-stats{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--color-subtle)}.criteria{list-style:none;margin:0;padding:0;display:grid;gap:6px}.criteria li{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--color-error)}.criteria li.ok{color:var(--color-success)}
.muted{margin:8px 0 0;color:var(--color-subtle);font-size:12px}.icon-btn{border:0;background:transparent;cursor:pointer;color:var(--color-muted);padding:4px;display:grid;place-items:center}
.modal{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:16px}.modal-backdrop{position:absolute;inset:0;background:#0a254050}.modal-card{position:relative;width:min(440px,100%);padding:16px;display:grid;gap:12px}.modal-card>header{display:flex;justify-content:space-between;align-items:center}.modal-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
@media(max-width:960px){.ar-summary{grid-template-columns:repeat(3,1fr)}.ar-selectors,.sige-grid{grid-template-columns:1fr}.ar-workflow{flex-direction:column}.wf-arrow{display:none}}
@media(max-width:640px){.ar-summary{grid-template-columns:1fr 1fr}.progress{grid-column:1/-1}.drawer-grid{grid-template-columns:1fr}.ar-footer{position:static}}
</style>
