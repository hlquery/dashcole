<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import {
  ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ClipboardList, FileText, Layers3,
  MessageSquare, Pencil, Plus, Send, Sparkles, Target,
} from '@lucide/vue';
import { request } from '../api/client.js';
import { formatDate } from '../design/format.js';
import { EmptyState } from './ui/index.js';

const courses = ref([]);
const courseId = ref('');
const units = ref([]);
const pendingUnits = ref([]);
const academicYear = ref(null);
const canEdit = ref(false);
const canReview = ref(false);
const error = ref('');
const busy = ref(false);
const editing = ref(null);
const loading = ref(true);
const form = reactive({
  title: '',
  unitType: 'regular',
  objectives: [''],
  activities: [''],
  adaptations: '',
  status: 'draft',
  startsOn: '',
  endsOn: '',
  wholeYear: false,
});
const commentForId = ref(null);
const commentDraft = ref('');

const selectedCourse = computed(() =>
  courses.value.find((course) => String(course.id) === String(courseId.value)) || null,
);

const yearBounds = computed(() => {
  const year = academicYear.value;
  if (!year?.startsOn || !year?.endsOn) return null;
  return {
    name: year.name || 'Año escolar',
    startsOn: String(year.startsOn).slice(0, 10),
    endsOn: String(year.endsOn).slice(0, 10),
  };
});

const yearBoundsLabel = computed(() => {
  if (!yearBounds.value) return '';
  return `Año escolar ${yearBounds.value.name}: ${formatDate(yearBounds.value.startsOn)} — ${formatDate(yearBounds.value.endsOn)}`;
});

function matchesWholeYear(startsOn, endsOn) {
  if (!yearBounds.value || !startsOn || !endsOn) return false;
  return String(startsOn).slice(0, 10) === yearBounds.value.startsOn
    && String(endsOn).slice(0, 10) === yearBounds.value.endsOn;
}

function applyWholeYearDates() {
  if (!yearBounds.value) return;
  form.startsOn = yearBounds.value.startsOn;
  form.endsOn = yearBounds.value.endsOn;
}

function onWholeYearToggle() {
  if (form.wholeYear) {
    applyWholeYearDates();
    return;
  }
  form.startsOn = '';
  form.endsOn = '';
}

const summary = computed(() => ({
  total: units.value.length,
  draft: units.value.filter((unit) => unit.status === 'draft').length,
  review: units.value.filter((unit) => unit.status === 'review').length,
  approved: units.value.filter((unit) => unit.status === 'approved').length,
  diagnostic: units.value.filter((unit) => unit.unitType === 'diagnostic').length,
}));

const isEditorPage = computed(() => editing.value != null);
const pendingCount = computed(() => pendingUnits.value.length);

function statusLabel(status) {
  return ({ draft: 'Borrador', review: 'En revisión', approved: 'Aprobada' })[status] || status;
}

function typeLabel(unitType) {
  return unitType === 'diagnostic' ? 'Unidad 0 · Diagnóstico' : 'Unidad curricular';
}

function dateRange(unit) {
  if (!unit.startsOn && !unit.endsOn) return 'Sin fechas definidas';
  if (matchesWholeYear(unit.startsOn, unit.endsOn)) return 'Todo el año escolar';
  return `${formatDate(unit.startsOn)} — ${formatDate(unit.endsOn)}`;
}

function listPath() {
  return '/planificacion';
}

function editorPath(unitId = 'new') {
  if (unitId === 'new') {
    const params = new URLSearchParams();
    if (courseId.value) params.set('courseId', String(courseId.value));
    const query = params.toString();
    return query ? `/planificacion/nueva?${query}` : '/planificacion/nueva';
  }
  return `/planificacion/unidades/${unitId}`;
}

function pushEditorRoute(unitId = 'new') {
  const path = editorPath(unitId);
  const state = { view: 'Planificación', planning: unitId === 'new' ? 'nueva' : 'editar', unitId: unitId === 'new' ? null : Number(unitId) };
  if (`${window.location.pathname}${window.location.search}` !== path) {
    window.history.pushState(state, '', path);
  } else {
    window.history.replaceState(state, '', path);
  }
}

function pushListRoute() {
  if (window.location.pathname !== listPath() || window.location.search) {
    window.history.pushState({ view: 'Planificación' }, '', listPath());
  }
}

function fillForm(unit = null) {
  if (!unit) {
    Object.assign(form, {
      title: '',
      unitType: 'regular',
      objectives: [''],
      activities: [''],
      adaptations: '',
      status: 'draft',
      startsOn: '',
      endsOn: '',
      wholeYear: false,
    });
    return;
  }
  const startsOn = unit.startsOn || unit.starts_on || '';
  const endsOn = unit.endsOn || unit.ends_on || '';
  Object.assign(form, {
    title: unit.title || '',
    unitType: unit.unitType || unit.unit_type || 'regular',
    objectives: unit.objectives?.length ? [...unit.objectives] : [''],
    activities: unit.activities?.length ? [...unit.activities] : [''],
    adaptations: unit.adaptations || '',
    status: unit.status || 'draft',
    startsOn,
    endsOn,
    wholeYear: matchesWholeYear(startsOn, endsOn),
  });
}

async function loadCourses() {
  loading.value = true;
  try {
    courses.value = await request('/courses');
    const queryCourseId = new URLSearchParams(window.location.search).get('courseId');
    if (queryCourseId && courses.value.some((course) => String(course.id) === String(queryCourseId))) {
      courseId.value = String(queryCourseId);
    } else if (courses.value.length && !courseId.value) {
      courseId.value = String(courses.value[0].id);
    }
    error.value = '';
    if (courses.value[0]) {
      const probe = await request(`/planning/units?courseId=${courses.value[0].id}`);
      canEdit.value = probe.canEdit;
      canReview.value = probe.canReview;
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function loadPending() {
  if (!canReview.value) {
    pendingUnits.value = [];
    return;
  }
  try {
    const data = await request('/planning/pending');
    pendingUnits.value = data.units || [];
  } catch {
    pendingUnits.value = [];
  }
}

async function load() {
  if (!courseId.value) {
    units.value = [];
    academicYear.value = null;
    await loadPending();
    return;
  }
  try {
    const data = await request(`/planning/units?courseId=${courseId.value}`);
    units.value = data.units;
    academicYear.value = data.academicYear || null;
    canEdit.value = data.canEdit;
    canReview.value = data.canReview;
    error.value = '';
    await loadPending();
  } catch (e) {
    error.value = e.message;
  }
}

function open(unit = null) {
  if (!canEdit.value && !unit) return;
  editing.value = unit?.id || 'new';
  fillForm(unit);
  commentForId.value = null;
  commentDraft.value = '';
  pushEditorRoute(editing.value);
}

function closeEditor({ replaceList = true } = {}) {
  editing.value = null;
  commentForId.value = null;
  commentDraft.value = '';
  if (replaceList) pushListRoute();
}

async function save(nextStatus = form.status) {
  busy.value = true;
  error.value = '';
  try {
    if (form.wholeYear) {
      if (!yearBounds.value) {
        throw new Error('No hay año escolar activo para asignar todo el año.');
      }
      applyWholeYearDates();
    }
    const path = editing.value === 'new' ? '/planning/units' : `/planning/units/${editing.value}`;
    await request(path, {
      method: editing.value === 'new' ? 'POST' : 'PUT',
      body: JSON.stringify({
        title: form.title,
        unitType: form.unitType || 'regular',
        status: nextStatus,
        courseId: Number(courseId.value),
        objectives: form.objectives.filter(Boolean),
        activities: form.activities.filter(Boolean),
        adaptations: form.adaptations,
        startsOn: form.startsOn || null,
        endsOn: form.endsOn || null,
      }),
    });
    closeEditor();
    await load();
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function setUnitStatus(unit, status) {
  if (!unit?.id || busy.value) return;
  busy.value = true;
  error.value = '';
  try {
    await request(`/planning/units/${unit.id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    await load();
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function openPendingUnit(unit) {
  if (!unit?.courseId) return;
  courseId.value = String(unit.courseId);
  await load();
  open(unit);
}

function comment(unit) {
  if (commentForId.value === unit.id) {
    commentForId.value = null;
    commentDraft.value = '';
    return;
  }
  commentForId.value = unit.id;
  commentDraft.value = '';
}

async function submitComment(unit) {
  const body = commentDraft.value.trim();
  if (!body) return;
  busy.value = true;
  error.value = '';
  try {
    await request(`/planning/units/${unit.id}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
    commentForId.value = null;
    commentDraft.value = '';
    await load();
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function syncFromLocation() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const newMatch = path === '/planificacion/nueva';
  const editMatch = path.match(/^\/planificacion\/unidades\/(\d+)$/);
  if (newMatch) {
    const queryCourseId = new URLSearchParams(window.location.search).get('courseId');
    if (queryCourseId) courseId.value = String(queryCourseId);
    if (!courseId.value && courses.value[0]) courseId.value = String(courses.value[0].id);
    if (courseId.value) await load();
    if (!canEdit.value) {
      closeEditor();
      return;
    }
    editing.value = 'new';
    fillForm(null);
    return;
  }
  if (editMatch) {
    const unitId = Number(editMatch[1]);
    if (!units.value.length && courseId.value) await load();
    let unit = units.value.find((row) => Number(row.id) === unitId) || null;
    if (!unit) {
      for (const course of courses.value) {
        if (String(course.id) === String(courseId.value) && units.value.some((row) => Number(row.id) === unitId)) continue;
        try {
          const data = await request(`/planning/units?courseId=${course.id}`);
          const found = (data.units || []).find((row) => Number(row.id) === unitId);
          if (found) {
            courseId.value = String(course.id);
            units.value = data.units;
            canEdit.value = data.canEdit;
            canReview.value = data.canReview;
            unit = found;
            break;
          }
        } catch {
          /* keep searching */
        }
      }
    }
    if (!unit) {
      error.value = 'No encontramos esa unidad de planificación.';
      closeEditor();
      return;
    }
    if (!canEdit.value) {
      closeEditor();
      return;
    }
    editing.value = unit.id;
    fillForm(unit);
    return;
  }
  if (editing.value) editing.value = null;
}

watch(courseId, async () => {
  commentForId.value = null;
  if (!editing.value) await load();
  else if (editing.value === 'new') pushEditorRoute('new');
});

watch(yearBounds, (bounds) => {
  if (!editing.value || !bounds) return;
  if (form.wholeYear) {
    applyWholeYearDates();
    return;
  }
  if (matchesWholeYear(form.startsOn, form.endsOn)) form.wholeYear = true;
});

onMounted(async () => {
  await loadCourses();
  await load();
  await syncFromLocation();
  window.addEventListener('popstate', syncFromLocation);
});
onUnmounted(() => {
  window.removeEventListener('popstate', syncFromLocation);
});
</script>

<template>
  <section class="planning">
    <template v-if="isEditorPage">
      <div class="profile-page-toolbar planning-page-toolbar">
        <button type="button" class="secondary-button" @click="closeEditor()">
          <ArrowLeft :size="16" />Volver a planificación
        </button>
      </div>

      <form class="panel editor planning-editor-page" @submit.prevent="save(canReview ? 'approved' : 'review')">
        <div class="editor-heading">
          <div>
            <span class="planning-eyebrow">{{ editing === 'new' ? 'Nueva unidad' : 'Editar unidad' }}</span>
            <h2>{{ form.title || (editing === 'new' ? 'Planifica la unidad' : 'Actualiza la unidad') }}</h2>
            <p v-if="selectedCourse">{{ selectedCourse.subject }} · {{ selectedCourse.name }} {{ selectedCourse.section }}</p>
          </div>
        </div>

        <p v-if="error" class="login-error" role="alert">{{ error }}</p>

        <div class="form-grid">
          <label class="field wide">
            <span>Asignatura y curso</span>
            <select v-model="courseId" :disabled="editing !== 'new'" required>
              <option v-for="course in courses" :key="course.id" :value="String(course.id)">
                {{ course.name }} {{ course.section }} · {{ course.subject }}
              </option>
            </select>
          </label>
          <label class="field wide"><span>Título de la unidad</span><input v-model="form.title" required maxlength="180" placeholder="Ej. Fracciones y números mixtos" /></label>
          <fieldset class="field wide planning-type-field">
            <legend>Tipo de unidad</legend>
            <div class="planning-type-grid" role="radiogroup" aria-label="Tipo de unidad">
              <label
                class="planning-type-option"
                :class="{ selected: form.unitType === 'regular' }"
              >
                <input v-model="form.unitType" type="radio" value="regular" name="planning-unit-type" />
                <span class="planning-type-icon"><BookOpen :size="18" /></span>
                <span>
                  <strong>Unidad curricular</strong>
                  <small>Unidad de aprendizaje del plan anual</small>
                </span>
              </label>
              <label
                class="planning-type-option"
                :class="{ selected: form.unitType === 'diagnostic' }"
              >
                <input v-model="form.unitType" type="radio" value="diagnostic" name="planning-unit-type" />
                <span class="planning-type-icon is-diagnostic"><Sparkles :size="18" /></span>
                <span>
                  <strong>Unidad 0 · Diagnóstico</strong>
                  <small>Evaluación inicial / nivelación</small>
                </span>
              </label>
            </div>
          </fieldset>
          <label class="field wide">
            <span>Estado</span>
            <select v-model="form.status" :disabled="!canReview && form.status === 'approved'">
              <option value="draft">Borrador</option>
              <option value="review">Enviar a revisión UTP</option>
              <option v-if="canReview" value="approved">Aprobada</option>
            </select>
          </label>
          <label class="switch-field planning-whole-year" :class="{ disabled: !yearBounds }">
            <input
              v-model="form.wholeYear"
              type="checkbox"
              :disabled="!yearBounds"
              @change="onWholeYearToggle"
            />
            <span>
              <i></i>
              <strong>Todo el año</strong>
              <small v-if="yearBoundsLabel">{{ yearBoundsLabel }}</small>
              <small v-else>No hay año escolar activo para usar esta opción.</small>
            </span>
          </label>
          <template v-if="!form.wholeYear">
            <label class="field">
              <span>Inicio de la unidad</span>
              <input
                v-model="form.startsOn"
                type="date"
                :min="yearBounds?.startsOn || undefined"
                :max="form.endsOn || yearBounds?.endsOn || undefined"
              />
            </label>
            <label class="field">
              <span>Término de la unidad</span>
              <input
                v-model="form.endsOn"
                type="date"
                :min="form.startsOn || yearBounds?.startsOn || undefined"
                :max="yearBounds?.endsOn || undefined"
              />
            </label>
            <p class="field-help wide planning-year-help">
              Tú defines las fechas de esta unidad.
              <template v-if="yearBoundsLabel"> {{ yearBoundsLabel }}.</template>
            </p>
          </template>
          <p v-else class="field-help wide planning-year-help">
            Esta unidad cubre todo el año escolar.
            <template v-if="yearBoundsLabel"> {{ yearBoundsLabel }}.</template>
          </p>
        </div>

        <section class="editor-block">
          <div class="editor-block-head">
            <h4><Target :size="16" />Objetivos de aprendizaje</h4>
            <p>Qué se espera que el estudiante logre al terminar la unidad.</p>
          </div>
          <div v-for="(_, i) in form.objectives" :key="'o' + i" class="editor-row">
            <label class="field grow"><span class="sr-only">Objetivo {{ i + 1 }}</span><input v-model="form.objectives[i]" required maxlength="500" :placeholder="`Objetivo ${i + 1}`" /></label>
            <button v-if="form.objectives.length > 1" type="button" class="edit-button" @click="form.objectives.splice(i, 1)">Quitar</button>
          </div>
          <button type="button" class="secondary-button" @click="form.objectives.push('')"><Plus :size="15" />Agregar objetivo</button>
        </section>

        <section class="editor-block">
          <div class="editor-block-head">
            <h4><ClipboardList :size="16" />Actividades</h4>
            <p>Secuencia de trabajo en aula, evaluación o práctica.</p>
          </div>
          <div v-for="(_, i) in form.activities" :key="'a' + i" class="editor-row">
            <label class="field grow"><span class="sr-only">Actividad {{ i + 1 }}</span><textarea v-model="form.activities[i]" maxlength="1000" :placeholder="`Actividad ${i + 1}`" /></label>
            <button type="button" class="edit-button" @click="form.activities.splice(i, 1)">Quitar</button>
          </div>
          <button type="button" class="secondary-button" @click="form.activities.push('')"><Plus :size="15" />Agregar actividad</button>
        </section>

        <section class="editor-block">
          <div class="editor-block-head">
            <h4><Sparkles :size="16" />Adecuaciones curriculares / PIE</h4>
            <p>Ajustes de acceso, metodología o evaluación para estudiantes con necesidades educativas.</p>
          </div>
          <label class="field">
            <span class="sr-only">Adecuaciones</span>
            <textarea v-model="form.adaptations" maxlength="10000" placeholder="Describe adecuaciones, apoyos o diferenciación…" />
          </label>
        </section>

        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="closeEditor()">Cancelar</button>
          <button type="button" class="secondary-button" :disabled="busy" @click="save('draft')">
            {{ busy ? 'Guardando…' : 'Guardar borrador' }}
          </button>
          <button
            v-if="canReview"
            type="button"
            class="primary-button"
            :disabled="busy"
            @click="save('approved')"
          >
            <CheckCircle2 v-if="!busy" :size="16" />
            {{ busy ? 'Guardando…' : 'Guardar y aprobar' }}
          </button>
          <button
            v-else
            type="button"
            class="primary-button"
            :disabled="busy"
            @click="save('review')"
          >
            <Send v-if="!busy" :size="16" />
            {{ busy ? 'Enviando…' : 'Enviar a UTP' }}
          </button>
        </div>
      </form>
    </template>

    <template v-else>
      <header class="planning-hero panel">
        <div class="planning-hero-copy">
          <span class="planning-eyebrow"><ClipboardList :size="14" />Planificación curricular</span>
          <h2>Unidades de aprendizaje</h2>
          <p>
            El docente envía la unidad a revisión y la UTP o administración la aprueba antes de implementarla en aula.
          </p>
        </div>
        <button v-if="canEdit && courses.length" type="button" class="primary-button" @click="open()">
          <Plus :size="16" />Nueva unidad
        </button>
      </header>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <div v-if="loading" class="panel planning-loading" role="status">
        <CalendarDays :size="18" />
        Cargando planificación…
      </div>

      <section v-if="!loading && canReview" class="panel planning-pending" aria-label="Planificaciones pendientes">
        <div class="planning-pending-head">
          <div>
            <span class="planning-eyebrow"><Send :size="14" />Bandeja UTP</span>
            <h3>Planificaciones pendientes</h3>
            <p>{{ pendingCount ? `${pendingCount} unidad${pendingCount === 1 ? '' : 'es'} esperando aprobación.` : 'No hay unidades en revisión por ahora.' }}</p>
          </div>
          <strong class="planning-pending-count">{{ pendingCount }}</strong>
        </div>
        <div v-if="pendingUnits.length" class="planning-pending-list">
          <article v-for="unit in pendingUnits" :key="`pending-${unit.id}`" class="planning-pending-card">
            <div class="planning-pending-copy">
              <strong>{{ unit.title }}</strong>
              <span>{{ unit.courseSubject }} · {{ unit.courseName }} {{ unit.courseSection }}</span>
              <small>{{ unit.authorName || 'Docente' }} · {{ dateRange(unit) }}</small>
            </div>
            <div class="planning-pending-actions">
              <button type="button" class="secondary-button" :disabled="busy" @click="openPendingUnit(unit)">
                <Pencil :size="14" />Revisar
              </button>
              <button type="button" class="secondary-button" :disabled="busy" @click="setUnitStatus(unit, 'draft')">
                Devolver
              </button>
              <button type="button" class="primary-button" :disabled="busy" @click="setUnitStatus(unit, 'approved')">
                <CheckCircle2 :size="14" />Aprobar
              </button>
            </div>
          </article>
        </div>
      </section>

      <template v-if="!loading && courses.length">
        <div class="panel planning-toolbar">
          <label class="field planning-course-field">
            <span>Asignatura y curso</span>
            <select v-model="courseId">
              <option v-for="course in courses" :key="course.id" :value="String(course.id)">
                {{ course.name }} {{ course.section }} · {{ course.subject }}
              </option>
            </select>
          </label>
          <div v-if="selectedCourse" class="planning-course-meta">
            <strong>{{ selectedCourse.subject }}</strong>
            <span>{{ selectedCourse.name }} {{ selectedCourse.section }} · {{ summary.total }} unidad{{ summary.total === 1 ? '' : 'es' }}</span>
          </div>
        </div>

        <div v-if="units.length" class="planning-kpis" aria-label="Resumen de planificación">
          <article class="panel planning-kpi" data-tone="total">
            <span><Layers3 :size="16" /></span>
            <div><strong>{{ summary.total }}</strong><small>Unidades</small></div>
          </article>
          <article class="panel planning-kpi" data-tone="draft">
            <span><FileText :size="16" /></span>
            <div><strong>{{ summary.draft }}</strong><small>Borrador</small></div>
          </article>
          <article class="panel planning-kpi" data-tone="review">
            <span><Send :size="16" /></span>
            <div><strong>{{ summary.review }}</strong><small>En revisión</small></div>
          </article>
          <article class="panel planning-kpi" data-tone="approved">
            <span><CheckCircle2 :size="16" /></span>
            <div><strong>{{ summary.approved }}</strong><small>Aprobadas</small></div>
          </article>
        </div>

        <div v-if="units.length" class="unit-grid">
          <article
            v-for="(unit, index) in units"
            :key="unit.id"
            class="panel unit"
            :data-type="unit.unitType"
            :data-status="unit.status"
          >
            <div class="unit-top">
              <div class="unit-badges">
                <span class="unit-type">
                  <Sparkles v-if="unit.unitType === 'diagnostic'" :size="12" />
                  <BookOpen v-else :size="12" />
                  {{ typeLabel(unit.unitType) }}
                </span>
                <span class="unit-status" :data-status="unit.status">{{ statusLabel(unit.status) }}</span>
              </div>
              <small class="unit-index">U{{ index + 1 }}</small>
            </div>

            <h3>{{ unit.title }}</h3>
            <p class="unit-dates"><CalendarDays :size="14" />{{ dateRange(unit) }}</p>

            <div class="unit-stats">
              <span><Target :size="13" />{{ unit.objectives?.length || 0 }} objetivo{{ (unit.objectives?.length || 0) === 1 ? '' : 's' }}</span>
              <span><ClipboardList :size="13" />{{ unit.activities?.length || 0 }} actividad{{ (unit.activities?.length || 0) === 1 ? '' : 'es' }}</span>
              <span v-if="unit.adaptations"><Sparkles :size="13" />Con adecuaciones PIE</span>
            </div>

            <ul v-if="unit.objectives?.length" class="unit-objectives">
              <li v-for="objective in unit.objectives.slice(0, 3)" :key="objective">{{ objective }}</li>
              <li v-if="unit.objectives.length > 3" class="unit-more">+{{ unit.objectives.length - 3 }} objetivo{{ unit.objectives.length - 3 === 1 ? '' : 's' }} más</li>
            </ul>

            <details v-if="unit.comments?.length" class="unit-comments">
              <summary>
                <MessageSquare :size="14" />
                {{ unit.comments.length }} comentario{{ unit.comments.length === 1 ? '' : 's' }} de retroalimentación
              </summary>
              <div class="unit-comment-list">
                <p v-for="entry in unit.comments" :key="entry.id">{{ entry.body }}</p>
              </div>
            </details>

            <div class="unit-actions">
              <button v-if="canEdit" type="button" class="edit-button" @click="open(unit)">
                <Pencil :size="14" />Editar
              </button>
              <button
                v-if="canEdit && unit.status === 'draft'"
                type="button"
                class="edit-button"
                :disabled="busy"
                @click="setUnitStatus(unit, 'review')"
              >
                <Send :size="14" />Enviar a UTP
              </button>
              <button
                v-if="canReview && unit.status === 'review'"
                type="button"
                class="edit-button"
                :disabled="busy"
                @click="setUnitStatus(unit, 'approved')"
              >
                <CheckCircle2 :size="14" />Aprobar
              </button>
              <button
                v-if="canReview && unit.status === 'review'"
                type="button"
                class="edit-button"
                :disabled="busy"
                @click="setUnitStatus(unit, 'draft')"
              >
                Devolver
              </button>
              <button v-if="canReview || canEdit" type="button" class="edit-button" @click="comment(unit)">
                <MessageSquare :size="14" />{{ commentForId === unit.id ? 'Cerrar' : 'Retroalimentar' }}
              </button>
            </div>

            <form v-if="commentForId === unit.id" class="unit-comment-form" @submit.prevent="submitComment(unit)">
              <label class="field">
                <span>Retroalimentación UTP / dirección</span>
                <textarea v-model.trim="commentDraft" required maxlength="2000" rows="3" placeholder="Indica ajustes, evidencias faltantes o aprobación con observaciones…" />
              </label>
              <button class="primary-button" type="submit" :disabled="busy || !commentDraft.trim()">
                <Send :size="15" />Enviar comentario
              </button>
            </form>
          </article>
        </div>

        <EmptyState v-else class="panel planning-empty">
          <BookOpen :size="28" />
          <strong>Sin unidades en esta asignatura</strong>
          <span>
            La planificación ordena el año: diagnóstico, unidades curriculares, actividades y adecuaciones.
            {{ canEdit ? ' Crea la primera unidad para comenzar.' : '' }}
          </span>
          <button v-if="canEdit" type="button" class="primary-button" @click="open()">
            <Plus :size="16" />Nueva unidad
          </button>
        </EmptyState>
      </template>

      <EmptyState v-else-if="!loading && !courses.length" class="panel planning-empty">
        <BookOpen :size="28" />
        <strong>No hay cursos para planificar</strong>
        <span>Crea un curso o pide que te asignen una asignatura para trabajar la planificación curricular.</span>
      </EmptyState>
    </template>
  </section>
</template>

<style scoped>
.planning { display: grid; gap: 14px; }
.planning-page-toolbar { margin-bottom: 2px; }
.planning-pending {
  padding: 18px 20px;
  display: grid;
  gap: 14px;
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
}
.planning-pending-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.planning-pending-head h3 { margin: 4px 0; font-size: 18px; }
.planning-pending-head p { margin: 0; color: var(--color-subtle); font-size: 13px; }
.planning-pending-count {
  min-width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--color-primary);
  color: white;
  font-size: 18px;
}
.planning-pending-list { display: grid; gap: 10px; }
.planning-pending-card {
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.planning-pending-copy { display: grid; gap: 2px; min-width: 0; }
.planning-pending-copy strong { color: var(--color-text); }
.planning-pending-copy span,
.planning-pending-copy small { color: var(--color-subtle); font-size: 12px; }
.planning-pending-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.planning-hero {
  display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between;
  gap: 16px; padding: 20px 22px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-primary-soft) 70%, white), var(--color-surface) 55%),
    var(--color-surface);
}
.planning-hero-copy { display: grid; gap: 6px; max-width: 62ch; }
.planning-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--color-primary); font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
}
.planning-hero h2, .editor-heading h2 { margin: 0; font-size: 22px; line-height: 1.2; }
.planning-hero p, .editor-heading p, .editor-block-head p { margin: 0; color: var(--color-muted); font-size: 13px; line-height: 1.45; }
.planning-toolbar {
  display: flex; flex-wrap: wrap; gap: 14px; align-items: end; padding: 16px 18px;
}
.planning-toolbar .field { margin: 0; }
.planning-course-field { flex: 1 1 280px; min-width: min(100%, 280px); }
.planning-course-meta { margin-left: auto; display: grid; gap: 2px; text-align: right; }
.planning-course-meta strong { font-size: 14px; }
.planning-course-meta span { color: var(--color-muted); font-size: 12px; }
.planning-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.planning-kpi { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
.planning-kpi > span { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; }
.planning-kpi strong { display: block; font-size: 20px; line-height: 1; }
.planning-kpi small { color: var(--color-muted); font-size: 11px; font-weight: 650; }
.planning-kpi[data-tone='total'] > span { color: var(--color-primary); background: var(--color-primary-soft); }
.planning-kpi[data-tone='draft'] > span { color: var(--color-muted); background: var(--color-canvas); }
.planning-kpi[data-tone='review'] > span { color: var(--color-warning); background: var(--color-warning-soft); }
.planning-kpi[data-tone='approved'] > span { color: var(--color-success); background: var(--color-success-soft); }
.planning-loading, .planning-empty {
  min-height: 200px; display: grid; place-content: center; justify-items: center;
  gap: 8px; text-align: center; color: var(--color-muted); padding: 28px 18px;
}
.planning-empty strong { color: var(--color-text); font-size: 15px; }
.unit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.unit {
  padding: 18px; display: grid; gap: 12px; align-content: start;
  border-top: 3px solid color-mix(in srgb, var(--color-primary) 55%, var(--color-border));
}
.unit[data-type='diagnostic'] {
  border-top-color: color-mix(in srgb, var(--color-warning) 70%, var(--color-border));
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-warning-soft) 45%, white), var(--color-surface) 38%);
}
.unit[data-status='approved'] {
  border-top-color: color-mix(in srgb, var(--color-success) 70%, var(--color-border));
}
.unit-top { display: flex; align-items: start; justify-content: space-between; gap: 10px; }
.unit-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.unit-type, .unit-status {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 8px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase;
}
.unit-type { color: var(--color-primary); background: var(--color-primary-soft); }
.unit[data-type='diagnostic'] .unit-type { color: #97551c; background: var(--color-warning-soft); }
.unit-status { background: var(--color-canvas); color: var(--color-muted); }
.unit-status[data-status='review'] { color: #97551c; background: var(--color-warning-soft); }
.unit-status[data-status='approved'] { color: var(--color-success); background: var(--color-success-soft); }
.unit-index { color: var(--color-subtle); font-size: 11px; font-weight: 750; }
.unit h3 { margin: 0; font-size: 17px; line-height: 1.3; }
.unit-dates {
  margin: 0; display: inline-flex; align-items: center; gap: 6px;
  color: var(--color-muted); font-size: 12px; font-weight: 650;
}
.unit-stats { display: flex; flex-wrap: wrap; gap: 8px; }
.unit-stats > span {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 8px; border-radius: 8px; background: var(--color-canvas);
  color: var(--color-muted); font-size: 11px; font-weight: 700;
}
.unit-objectives {
  margin: 0; padding: 0; list-style: none; display: grid; gap: 6px;
}
.unit-objectives li {
  position: relative; padding: 8px 10px 8px 14px; border-radius: 10px;
  background: var(--color-canvas); color: var(--color-text); font-size: 12px; line-height: 1.4;
}
.unit-objectives li::before {
  content: ''; position: absolute; left: 6px; top: 10px; bottom: 10px; width: 3px; border-radius: 99px;
  background: color-mix(in srgb, var(--color-primary) 55%, transparent);
}
.unit-more { color: var(--color-muted) !important; font-weight: 700; }
.unit-comments { border-top: 1px solid var(--color-border); padding-top: 10px; }
.unit-comments summary {
  cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
  color: var(--color-primary); font-size: 12px; font-weight: 750;
}
.unit-comment-list { display: grid; gap: 8px; margin-top: 10px; }
.unit-comment-list p {
  margin: 0; padding: 10px 12px; border-radius: 10px; background: var(--color-canvas);
  color: var(--color-text); font-size: 12px; line-height: 1.45;
}
.unit-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.unit-comment-form { display: grid; gap: 10px; padding-top: 4px; }
.unit-comment-form textarea { min-height: 84px; width: 100%; }
.planning-editor-page { padding: 22px; display: grid; gap: 18px; }
.planning-type-field {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.planning-type-field > legend {
  margin: 0 0 8px;
  padding: 0;
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 650;
}
.planning-type-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.planning-type-option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  min-height: 72px;
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
}
.planning-type-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.planning-type-option > span:last-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.planning-type-option strong {
  color: var(--color-text);
  font-size: 14px;
  font-weight: 750;
}
.planning-type-option small {
  color: var(--color-muted);
  font-size: 12px;
  line-height: 1.35;
}
.planning-type-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background: var(--color-primary-soft);
}
.planning-type-icon.is-diagnostic {
  color: #a16207;
  background: #fef3c7;
}
.planning-type-option:hover {
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
}
.planning-type-option.selected {
  border-color: color-mix(in srgb, var(--color-primary) 45%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary-soft) 70%, white);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent);
}
.planning-year-help {
  grid-column: 1 / -1;
  margin: -4px 0 0;
  color: var(--color-subtle);
  font-size: 12px;
  line-height: 1.4;
}
.planning-whole-year {
  grid-column: 1 / -1;
  margin: 0;
}
.planning-whole-year.disabled {
  opacity: .65;
  cursor: not-allowed;
}
.editor-heading { display: grid; gap: 4px; }
.editor-block {
  padding: 16px; border: 1px solid var(--color-border); border-radius: 14px;
  background: color-mix(in srgb, var(--color-canvas) 70%, white); display: grid; gap: 12px;
}
.editor-block-head { display: grid; gap: 4px; }
.editor-block-head h4 {
  margin: 0; display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; color: var(--color-text);
}
.editor-row { display: flex; gap: 8px; align-items: start; }
.editor-row .grow { flex: 1; margin: 0; }
.planning-editor-page textarea { min-height: 90px; width: 100%; }
@media (max-width: 900px) {
  .planning-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .planning-course-meta { margin-left: 0; width: 100%; text-align: left; }
}
@media (max-width: 640px) {
  .planning-kpis { grid-template-columns: 1fr; }
  .editor-row { flex-direction: column; }
  .planning-type-grid { grid-template-columns: 1fr; }
}
</style>
