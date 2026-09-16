<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { Building2, Check, Copy, RefreshCw, X } from '@lucide/vue';
import { request } from '../api/client.js';

const props = defineProps({
  schoolId: { type: [Number, String], required: true },
});

const ADMISSION_LEVELS = [
  'Prekínder',
  'Kínder',
  '1° Básico',
  '2° Básico',
  '3° Básico',
  '4° Básico',
  '5° Básico',
  '6° Básico',
  '7° Básico',
  '8° Básico',
  '1° Medio',
  '2° Medio',
  '3° Medio',
  '4° Medio',
];

const apiBase = (import.meta.env?.VITE_API_URL || '/api').replace(/\/$/, '');
const config = ref(null);
const busy = ref(false);
const loading = ref(true);
const configError = ref('');
const formError = ref('');
const reference = ref('');
const mailQueued = ref(false);
const snackbar = ref(null);
let snackbarTimer = 0;
const form = reactive({
  schoolId: Number(props.schoolId),
  studentFirstName: '',
  studentLastName: '',
  studentRut: '',
  requestedLevel: '',
  guardianName: '',
  guardianEmail: '',
  guardianPhone: '',
  guardianRut: '',
  answers: {},
  consent: false,
  website: '',
});

const schoolName = computed(() => config.value?.school?.name || 'este colegio');
const logoUrl = computed(() => (
  config.value?.school?.hasLogo
    ? `${apiBase}/public/admissions/logo?schoolId=${encodeURIComponent(props.schoolId)}`
    : ''
));
const notFound = computed(() => !loading.value && !config.value && !!configError.value);

function showSnackbar(message, type = 'success', detail = '') {
  window.clearTimeout(snackbarTimer);
  snackbar.value = { message, type, detail };
  snackbarTimer = window.setTimeout(() => { snackbar.value = null; }, type === 'success' ? 7000 : 5000);
}

function dismissSnackbar() {
  window.clearTimeout(snackbarTimer);
  snackbar.value = null;
}

async function copyReference() {
  if (!reference.value) return;
  try {
    await navigator.clipboard.writeText(reference.value);
    showSnackbar('Número de seguimiento copiado', 'success');
  } catch {
    showSnackbar('No se pudo copiar el número', 'error');
  }
}

async function loadConfig() {
  loading.value = true;
  configError.value = '';
  formError.value = '';
  config.value = null;
  try {
    config.value = await request(`/public/admissions/config?schoolId=${encodeURIComponent(props.schoolId)}`);
    form.schoolId = Number(config.value?.school?.id || props.schoolId);
  } catch (cause) {
    configError.value = cause.message || 'Colegio no encontrado o no disponible para postular.';
  } finally {
    loading.value = false;
  }
}

async function submit() {
  if (!form.consent) {
    formError.value = 'Debes autorizar el tratamiento de datos para enviar la postulación.';
    showSnackbar('Falta autorizar el tratamiento de datos', 'error');
    return;
  }
  busy.value = true;
  formError.value = '';
  try {
    const data = await request('/public/admissions', {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        schoolId: Number(props.schoolId),
        answers: form.answers,
        consent: true,
      }),
    });
    reference.value = data.reference;
    mailQueued.value = Boolean(data.mailQueued);
    showSnackbar(
      mailQueued.value ? 'Postulación enviada. Revisa tu correo.' : 'Postulación enviada correctamente',
      'success',
      `Guarda tu número: ${data.reference}`,
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (cause) {
    formError.value = cause.message;
    showSnackbar(cause.message || 'No se pudo enviar la postulación', 'error');
  } finally {
    busy.value = false;
  }
}

onMounted(loadConfig);
onBeforeUnmount(() => window.clearTimeout(snackbarTimer));
</script>

<template>
  <section class="public-admission" :class="{ 'is-missing': notFound }">
    <template v-if="notFound">
      <article class="admission-missing" role="alert">
        <div class="missing-visual" aria-hidden="true">
          <span class="missing-glow"></span>
          <div class="missing-icon"><Building2 :size="34" /></div>
        </div>
        <p class="eyebrow">ENLACE NO VÁLIDO</p>
        <h1>Colegio no encontrado</h1>
        <p class="missing-copy">
          Este enlace de postulación no corresponde a un colegio disponible.
          Revisa el código con el establecimiento o solicita un enlace actualizado.
        </p>
        <p class="missing-code">Referencia <code>#{{ schoolId }}</code></p>
        <div class="missing-actions">
          <button type="button" class="primary-button" :disabled="loading" @click="loadConfig">
            <RefreshCw :size="16" />Reintentar
          </button>
          <a class="secondary-button" href="/">Ir al inicio</a>
        </div>
        <p class="missing-detail">{{ configError }}</p>
      </article>
    </template>

    <template v-else>
      <header class="public-admission-brand">
        <img v-if="logoUrl" class="school-logo" :src="logoUrl" :alt="`Logo de ${schoolName}`" />
        <span>{{ loading ? 'Cargando…' : schoolName }}</span>
      </header>
      <div class="public-admission-copy">
        <p class="eyebrow">ADMISIÓN</p>
        <h1>{{ loading ? 'Preparando postulación' : (reference ? 'Postulación recibida' : `Postula a ${schoolName}`) }}</h1>
        <p>
          {{ reference
            ? (mailQueued
              ? 'Tu solicitud quedó registrada. Te enviamos un correo de confirmación con el número de seguimiento.'
              : 'Tu solicitud quedó registrada. Guarda el número de seguimiento para futuras consultas.')
            : 'No necesitas crear una cuenta. Completa los antecedentes y recibirás un número de seguimiento.' }}
        </p>
      </div>

      <article v-if="reference" class="panel admission-success-card" role="status">
        <div class="success-icon" aria-hidden="true"><Check :size="28" /></div>
        <div class="success-copy">
          <strong>¡Listo! Recibimos tu postulación</strong>
          <p>
            {{ mailQueued
              ? `Enviamos la confirmación a ${form.guardianEmail}. ${schoolName} revisará los antecedentes y te contactará si corresponde.`
              : `${schoolName} revisará los antecedentes y te contactará si corresponde.` }}
          </p>
        </div>
        <div class="success-reference">
          <span>Número de seguimiento</span>
          <code>{{ reference }}</code>
          <button type="button" class="secondary-button" @click="copyReference">
            <Copy :size="15" />Copiar
          </button>
        </div>
      </article>

      <form v-else class="panel public-admission-form" @submit.prevent="submit">
        <p v-if="formError" class="login-error" role="alert">{{ formError }}</p>
        <p v-if="loading" class="hint">Cargando formulario…</p>
        <fieldset v-else-if="config" :disabled="busy">
          <div class="form-grid">
            <label class="field"><span>Nombre del estudiante</span><input v-model.trim="form.studentFirstName" required maxlength="80" /></label>
            <label class="field"><span>Apellido</span><input v-model.trim="form.studentLastName" required maxlength="80" /></label>
            <label class="field"><span>RUT del estudiante <small>Opcional</small></span><input v-model.trim="form.studentRut" maxlength="20" placeholder="12345678-9" /></label>
            <label class="field">
              <span>Nivel al que postula</span>
              <select v-model="form.requestedLevel" required>
                <option value="" disabled>Selecciona un nivel</option>
                <option v-for="level in ADMISSION_LEVELS" :key="level" :value="level">{{ level }}</option>
              </select>
            </label>
            <label class="field"><span>Nombre del apoderado</span><input v-model.trim="form.guardianName" required maxlength="120" /></label>
            <label class="field"><span>RUT del apoderado <small>Opcional</small></span><input v-model.trim="form.guardianRut" maxlength="20" placeholder="12345678-9" /></label>
            <label class="field"><span>Correo del apoderado</span><input v-model.trim="form.guardianEmail" required type="email" maxlength="150" /></label>
            <label class="field"><span>Teléfono con código de país</span><input v-model.trim="form.guardianPhone" placeholder="+56912345678" maxlength="40" /></label>
          </div>
          <label v-for="question in config.questions || []" :key="question.id" class="field wide">
            <span>{{ question.label }}</span>
            <textarea v-model.trim="form.answers[question.id]" :required="question.required" maxlength="3000" rows="4" />
          </label>
          <input v-model="form.website" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
          <label class="consent">
            <input v-model="form.consent" type="checkbox" required />
            <span>Autorizo al colegio a tratar estos datos exclusivamente para gestionar esta postulación.</span>
          </label>
          <button type="submit" class="primary-button" :disabled="busy || !form.consent">
            {{ busy ? 'Enviando…' : 'Enviar postulación' }}
          </button>
        </fieldset>
      </form>
    </template>

    <Transition name="admission-snack">
      <div
        v-if="snackbar"
        class="admission-snackbar"
        :class="snackbar.type"
        role="status"
        aria-live="polite"
      >
        <span class="admission-snackbar-icon" aria-hidden="true">
          <Check v-if="snackbar.type === 'success'" :size="18" />
          <X v-else :size="18" />
        </span>
        <div class="admission-snackbar-copy">
          <strong>{{ snackbar.message }}</strong>
          <small v-if="snackbar.detail">{{ snackbar.detail }}</small>
        </div>
        <button type="button" class="admission-snackbar-close" aria-label="Cerrar aviso" @click="dismissSnackbar">
          <X :size="16" />
        </button>
      </div>
    </Transition>
  </section>
</template>

<style scoped>
.public-admission {
  min-height: 100vh;
  padding: 36px 20px 72px;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 22px;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 42%),
    linear-gradient(180deg, #f4f8fb 0%, #eef4f8 100%);
}
.public-admission.is-missing {
  align-content: center;
  background:
    radial-gradient(ellipse 70% 45% at 50% 18%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 70%),
    linear-gradient(165deg, #eef5f9 0%, #f7fafc 48%, #e8f0f5 100%);
}
.admission-missing {
  width: min(520px, 100%);
  padding: 40px 32px 34px;
  border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
  border-radius: 22px;
  display: grid;
  justify-items: center;
  gap: 12px;
  text-align: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .96), rgba(255, 255, 255, .9));
  box-shadow:
    0 1px 0 rgba(255, 255, 255, .8) inset,
    0 24px 48px color-mix(in srgb, #1a2b3c 8%, transparent);
}
.missing-visual {
  position: relative;
  width: 92px;
  height: 92px;
  margin-bottom: 8px;
  display: grid;
  place-items: center;
}
.missing-glow {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 18%, transparent), transparent 70%);
}
.missing-icon {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  color: var(--color-primary);
  background:
    linear-gradient(145deg, #fff, color-mix(in srgb, var(--color-primary-soft) 70%, #fff));
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  box-shadow: 0 10px 24px color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.admission-missing .eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .16em;
}
.admission-missing h1 {
  margin: 0;
  color: var(--color-text);
  font: 800 clamp(26px, 4vw, 34px) var(--font-primary);
  letter-spacing: -.03em;
  line-height: 1.15;
}
.missing-copy {
  margin: 0;
  max-width: 38ch;
  color: var(--color-subtle);
  font-size: 14px;
  line-height: 1.55;
}
.missing-code {
  margin: 4px 0 2px;
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 600;
}
.missing-code code {
  margin-left: 6px;
  padding: 3px 8px;
  border-radius: 999px;
  color: var(--color-text);
  background: var(--color-canvas);
  border: 1px solid var(--color-border);
  font: 700 12px var(--font-primary);
}
.missing-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
.missing-actions .primary-button,
.missing-actions .secondary-button {
  min-height: 42px;
  padding: 0 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}
.missing-detail {
  margin: 10px 0 0;
  max-width: 42ch;
  color: var(--color-subtle);
  font-size: 11px;
  line-height: 1.45;
}
.public-admission-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  max-width: min(850px, 100%);
}
.public-admission-brand > span {
  color: var(--color-text);
  font: 800 22px var(--font-primary);
  letter-spacing: -.02em;
  line-height: 1.2;
}
.school-logo {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--color-border);
  padding: 4px;
}
.public-admission-copy {
  width: min(850px, 100%);
  display: grid;
  gap: 8px;
  text-align: center;
}
.public-admission-copy .eyebrow {
  margin: 0;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .14em;
}
.public-admission-copy h1 {
  margin: 0;
  font: 800 clamp(28px, 5vw, 42px) var(--font-primary);
  letter-spacing: -.03em;
}
.public-admission-copy p { margin: 0; color: var(--color-subtle); }
.public-admission-form {
  width: min(850px, 100%);
  padding: 28px;
  display: grid;
  gap: 16px;
}
.admission-success-card {
  width: min(850px, 100%);
  padding: 28px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px 18px;
  align-items: center;
  border-color: #bbf7d0;
  background:
    linear-gradient(180deg, #f0fdf4, #fff 42%);
  box-shadow: 0 18px 40px color-mix(in srgb, #166534 8%, transparent);
}
.success-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #16a34a;
  box-shadow: 0 10px 22px color-mix(in srgb, #16a34a 28%, transparent);
}
.success-copy {
  display: grid;
  gap: 4px;
}
.success-copy strong {
  color: #14532d;
  font-size: 18px;
  letter-spacing: -.02em;
}
.success-copy p {
  margin: 0;
  color: #3f6212;
  font-size: 14px;
  line-height: 1.45;
}
.success-reference {
  grid-column: 1 / -1;
  padding: 14px 16px;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  background: #fff;
}
.success-reference span {
  color: var(--color-subtle);
  font-size: 11px;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: .04em;
}
.success-reference code {
  flex: 1 1 auto;
  min-width: 0;
  color: var(--color-text);
  font: 800 18px/1.2 var(--font-primary);
  letter-spacing: .02em;
}
.success-reference .secondary-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}
fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}
.field.wide, .consent { grid-column: 1 / -1; }
.hint { margin: 0; color: var(--color-subtle); }
.consent {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
}
.honeypot { position: absolute; left: -10000px; }
.admission-snackbar {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 80;
  width: min(440px, calc(100vw - 28px));
  padding: 14px 14px 14px 12px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  transform: translateX(-50%);
  color: #fff;
  background: #0f766e;
  box-shadow:
    0 18px 40px color-mix(in srgb, #0f172a 22%, transparent),
    0 1px 0 color-mix(in srgb, #fff 18%, transparent) inset;
}
.admission-snackbar.success {
  background: linear-gradient(135deg, #15803d, #0f766e);
}
.admission-snackbar.error {
  background: linear-gradient(135deg, #b91c1c, #9f1239);
}
.admission-snackbar-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, #fff 16%, transparent);
}
.admission-snackbar-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.admission-snackbar-copy strong {
  font-size: 13px;
  font-weight: 750;
  line-height: 1.3;
}
.admission-snackbar-copy small {
  color: color-mix(in srgb, #fff 82%, transparent);
  font-size: 12px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.admission-snackbar-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: inherit;
  background: color-mix(in srgb, #fff 10%, transparent);
  cursor: pointer;
}
.admission-snackbar-close:hover {
  background: color-mix(in srgb, #fff 18%, transparent);
}
.admission-snack-enter-active,
.admission-snack-leave-active {
  transition: opacity .22s ease, transform .22s ease;
}
.admission-snack-enter-from,
.admission-snack-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
@media (max-width: 650px) {
  .form-grid { grid-template-columns: 1fr; }
  .admission-missing { padding: 32px 22px 28px; }
  .admission-success-card {
    grid-template-columns: 1fr;
    justify-items: start;
  }
}
</style>
