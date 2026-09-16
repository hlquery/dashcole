<script setup>
import { computed, onMounted, ref } from 'vue';
import { X } from '@lucide/vue';
import { request } from '../api/client.js';

const SUBJECT_FALLBACK = {
  Matemática: '#0067b2',
  Matemáticas: '#0067b2',
  Lenguaje: '#F59E6D',
  Lengua: '#F59E6D',
  Ciencias: '#27A37D',
  Historia: '#8B6CCF',
  Inglés: '#0EA5E9',
  English: '#0EA5E9',
  Educación: '#14B8A6',
  Arte: '#EC4899',
  Música: '#A855F7',
  Tecnología: '#64748B',
  Religión: '#D97706',
  Orientación: '#0D9488',
};

const data = ref({ courses: [], slots: [], canEdit: false });
const selected = ref('');
const slots = ref([]);
const error = ref('');
const busy = ref(false);
const message = ref('');
const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function course(id) {
  return data.value.courses.find(item => item.id === id);
}

function matchSubjectFallback(subject) {
  const name = String(subject || '').trim();
  if (!name) return null;
  if (SUBJECT_FALLBACK[name]) return SUBJECT_FALLBACK[name];
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(SUBJECT_FALLBACK)) {
    if (lower.includes(key.toLowerCase())) return color;
  }
  return null;
}

function subjectColor(courseItem) {
  if (!courseItem) return '#0067b2';
  const fromCourse = String(courseItem.color || courseItem.Color || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(fromCourse)) return fromCourse;
  return matchSubjectFallback(courseItem.subject) || '#0067b2';
}

function slotStyle(slot) {
  const color = subjectColor(course(slot.courseId));
  return {
    '--slot-color': color,
    background: `linear-gradient(145deg, color-mix(in srgb, ${color} 18%, #fff), color-mix(in srgb, ${color} 8%, #fff))`,
    borderColor: `color-mix(in srgb, ${color} 45%, #fff)`,
    boxShadow: `inset 4px 0 0 ${color}, 0 4px 12px color-mix(in srgb, ${color} 14%, transparent)`,
  };
}

const weekdaySlots = computed(() => days.map((day, index) => ({
  day,
  index,
  slots: data.value.slots
    .filter(slot => slot.day === index + 1)
    .slice()
    .sort((a, b) => String(a.startsAt).localeCompare(String(b.startsAt))),
})));

const legend = computed(() => {
  const seen = new Map();
  for (const item of data.value.courses) {
    if (!seen.has(item.subject)) seen.set(item.subject, subjectColor(item));
  }
  return [...seen.entries()].map(([subject, color]) => ({ subject, color }));
});

async function load() {
  try {
    data.value = await request('/schedules');
  } catch (e) {
    error.value = e.message;
  }
}

function select() {
  slots.value = data.value.slots
    .filter(slot => slot.courseId === Number(selected.value))
    .map(slot => ({ ...slot, startsAt: slot.startsAt.slice(0, 5), endsAt: slot.endsAt.slice(0, 5) }));
}

async function save() {
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await request(`/courses/${selected.value}/schedule`, { method: 'PUT', body: JSON.stringify({ slots: slots.value }) });
    await load();
    message.value = 'Horario guardado.';
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

function dragStart(event, slot) {
  if (!data.value.canEdit) return;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('application/json', JSON.stringify({ id: slot.id, courseId: slot.courseId }));
}

async function moveSlot(event, day) {
  if (!data.value.canEdit) return;
  event.preventDefault();
  try {
    const payload = JSON.parse(event.dataTransfer.getData('application/json') || '{}');
    const courseSlots = data.value.slots
      .filter(slot => slot.courseId === Number(payload.courseId))
      .map(slot => ({
        day: slot.id === payload.id ? day : slot.day,
        startsAt: slot.startsAt.slice(0, 5),
        endsAt: slot.endsAt.slice(0, 5),
        room: slot.room || '',
      }));
    await request(`/courses/${payload.courseId}/schedule`, { method: 'PUT', body: JSON.stringify({ slots: courseSlots }) });
    await load();
    message.value = 'Bloque movido y guardado.';
  } catch (e) {
    error.value = e.message || 'No se pudo mover el bloque.';
  }
}

async function removeSlot(slot) {
  if (!confirm(`¿Eliminar el bloque ${slot.startsAt.slice(0, 5)}–${slot.endsAt.slice(0, 5)}?`)) return;
  busy.value = true;
  error.value = '';
  try {
    const next = data.value.slots
      .filter(item => item.courseId === slot.courseId && item.id !== slot.id)
      .map(item => ({
        day: item.day,
        startsAt: item.startsAt.slice(0, 5),
        endsAt: item.endsAt.slice(0, 5),
        room: item.room || '',
      }));
    await request(`/courses/${slot.courseId}/schedule`, { method: 'PUT', body: JSON.stringify({ slots: next }) });
    await load();
    message.value = 'Bloque eliminado.';
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="panel schedule-panel">
    <h2>Horario de asignaturas</h2>
    <p v-if="data.canEdit">Arrastra un bloque a otro día para moverlo. Los cambios se validan y guardan inmediatamente.</p>
    <p v-if="error" class="login-error" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>

    <div v-if="legend.length" class="schedule-legend" aria-label="Colores por asignatura">
      <span
        v-for="item in legend"
        :key="item.subject"
        class="schedule-legend-item"
        :style="{ color: item.color, borderColor: `color-mix(in srgb, ${item.color} 28%, #dce4ee)` }"
      >
        <i :style="{ background: item.color }"></i>{{ item.subject }}
      </span>
    </div>

    <div class="schedule-week">
      <article
        v-for="column in weekdaySlots"
        :key="column.day"
        @dragover.prevent
        @drop="moveSlot($event, column.index + 1)"
      >
        <h3>{{ column.day }}</h3>
        <div
          v-for="slot in column.slots"
          :key="slot.id"
          class="schedule-class"
          :style="slotStyle(slot)"
          :draggable="data.canEdit"
          @dragstart="dragStart($event, slot)"
        >
          <header class="schedule-class-top">
            <strong :style="{ color: subjectColor(course(slot.courseId)) }">{{ slot.startsAt.slice(0, 5) }}–{{ slot.endsAt.slice(0, 5) }}</strong>
            <button
              v-if="data.canEdit"
              type="button"
              class="schedule-remove"
              :disabled="busy"
              :aria-label="`Eliminar bloque ${slot.startsAt.slice(0, 5)}`"
              title="Eliminar"
              @click.stop="removeSlot(slot)"
            >
              <X :size="14" />
            </button>
          </header>
          <span
            class="schedule-subject"
            :style="{ color: subjectColor(course(slot.courseId)) }"
          >{{ course(slot.courseId)?.subject }}</span>
          <small>
            {{ course(slot.courseId)?.name }} · {{ course(slot.courseId)?.section }}
            <br>
            {{ course(slot.courseId)?.teacher || 'Sin profesor' }} · {{ slot.room || 'Sala por definir' }}
          </small>
        </div>
        <p v-if="!column.slots.length" class="schedule-empty">Sin clases</p>
      </article>
    </div>

    <form v-if="data.canEdit" @submit.prevent="save">
      <h3>Asignar horario</h3>
      <label class="field">
        <span>Asignatura</span>
        <select v-model="selected" required @change="select">
          <option value="" disabled>Selecciona asignatura</option>
          <option v-for="c in data.courses" :key="c.id" :value="c.id">{{ c.name }} · {{ c.section }} · {{ c.subject }}</option>
        </select>
      </label>
      <div v-if="selected">
        <div v-for="(slot, i) in slots" :key="i" class="form-grid">
          <label class="field">
            <span>Día</span>
            <select v-model.number="slot.day">
              <option v-for="(day, d) in days" :key="day" :value="d + 1">{{ day }}</option>
            </select>
          </label>
          <label class="field">
            <span>Inicio</span>
            <input v-model="slot.startsAt" type="time" required>
          </label>
          <label class="field">
            <span>Término</span>
            <input v-model="slot.endsAt" type="time" required>
          </label>
          <label class="field">
            <span>Sala</span>
            <input v-model="slot.room" maxlength="80">
          </label>
          <button class="edit-button" type="button" @click="slots.splice(i, 1)">Quitar bloque</button>
        </div>
        <div class="modal-actions">
          <button class="secondary-button" type="button" @click="slots.push({ day: 1, startsAt: '08:00', endsAt: '08:45', room: '' })">Agregar bloque</button>
          <button class="primary-button" :disabled="busy">Guardar horario</button>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.schedule-panel { padding: 24px; }
.schedule-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 4px;
}
.schedule-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  padding: 0 10px 0 8px;
  border: 1px solid var(--color-border, #dce4ee);
  border-radius: 999px;
  background: #fff;
  font-size: 11px;
  font-weight: 750;
}
.schedule-legend-item i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 8%);
}
.schedule-week {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 12px;
  margin: 18px 0 24px;
}
.schedule-week article {
  min-height: 160px;
  padding: 12px;
  border: 1px solid var(--color-border, #dce4ee);
  border-radius: 14px;
  background: linear-gradient(180deg, #f7f9fc, #eef3f8);
}
.schedule-week h3 {
  margin: 0 0 4px;
  color: var(--color-text, #1f2a37);
  font-size: 13px;
}
.schedule-class {
  position: relative;
  display: grid;
  gap: 5px;
  margin-top: 10px;
  padding: 12px 12px 11px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--color-text, #1f2a37);
}
.schedule-class-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.schedule-class-top strong {
  font-size: 12px;
  letter-spacing: -.01em;
}
.schedule-subject {
  color: var(--slot-color, #0067b2);
  font-size: 13px;
  font-weight: 800;
}
.schedule-class small {
  color: color-mix(in srgb, var(--slot-color, #59687a) 35%, #59687a);
  font-size: 11px;
  line-height: 1.35;
}
.schedule-remove {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  margin: -2px -2px 0 0;
  border: 1px solid color-mix(in srgb, var(--slot-color, #b33535) 22%, #dce4ee);
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: #9f3a3a;
  background: color-mix(in srgb, #fff 78%, #fdeeee);
  cursor: pointer;
  transition: .16s ease;
}
.schedule-remove:hover:not(:disabled) {
  color: #fff;
  border-color: #a83d3d;
  background: linear-gradient(180deg, #c45454, #a83d3d);
}
.schedule-remove:disabled { opacity: .45; cursor: not-allowed; }
.schedule-class[draggable='true'] { cursor: grab; }
.schedule-class[draggable='true']:active { cursor: grabbing; opacity: .7; }
.schedule-empty {
  margin: 18px 0 8px;
  color: #8a97a8;
  font-size: 12px;
}
form {
  border-top: 1px solid #dce4ee;
  padding-top: 20px;
}
.form-grid { margin-top: 16px; }
p { color: #59687a; }
</style>
