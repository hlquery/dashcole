<template>
  <div class="contact-form-wrapper">
    <Header />
    <div class="contact-page">
      <v-container class="content" fluid>
        <div class="hero">
          <span class="contact-kicker">SOLICITA UNA DEMO</span>
          <h1>Tu colegio puede comenzar hoy</h1>
          <p>Hasta 10 estudiantes es gratis. Si tu comunidad crece, pagas por cada estudiante adicional con una tarifa clara o un acuerdo personalizado.</p>
          <div class="pricing-pills">
            <span>✓ 10 estudiantes gratis</span>
            <span>✓ Sin costo fijo obligatorio</span>
            <span>✓ Activación asistida</span>
          </div>
        </div>

        <div class="contact-layout">
          <v-card class="contact-form-card" elevation="0">
            <div class="contact-form-heading">
              <span class="contact-email-icon"><font-awesome-icon icon="inbox" /></span>
              <div>
                <small>ACTIVACIÓN DASHCOLE</small>
                <strong>Solicitar demo</strong>
                <p>Con estos datos podemos crear tu colegio y enviarte el acceso inmediatamente.</p>
              </div>
            </div>

            <v-form ref="contactForm" class="contact-form-fields" @submit.prevent="submitContactForm">
              <label class="contact-field">
                <span>Nombre</span>
                <v-text-field
                  v-model.trim="formData.name"
                  class="contact-input"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="Tu nombre completo"
                  :rules="nameRules"
                  maxlength="120"
                  required
                />
              </label>

              <label class="contact-field">
                <span>Correo</span>
                <v-text-field
                  v-model.trim="formData.email"
                  class="contact-input"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  type="email"
                  placeholder="tunombre@colegio.cl"
                  :rules="emailRules"
                  maxlength="150"
                  required
                />
              </label>

              <label class="contact-field">
                <span>Teléfono</span>
                <v-text-field
                  v-model.trim="formData.phone"
                  class="contact-input"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  type="tel"
                  inputmode="tel"
                  placeholder="+56912345678"
                  :rules="phoneRules"
                  maxlength="40"
                />
                <small class="contact-hint">Incluye código de país, por ejemplo +569…</small>
              </label>

              <label class="contact-field">
                <span>Colegio o institución</span>
                <v-text-field
                  v-model.trim="formData.organization"
                  class="contact-input"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  placeholder="Nombre del establecimiento"
                  maxlength="150"
                  required
                />
              </label>

              <label class="contact-field">
                <span>Estudiantes aproximados</span>
                <v-text-field
                  v-model.number="formData.studentCount"
                  class="contact-input"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  type="number"
                  min="1"
                  max="100000"
                  placeholder="Ej: 320"
                />
              </label>

              <label class="contact-field">
                <span>¿Qué necesitas implementar?</span>
                <v-textarea
                  v-model.trim="formData.message"
                  class="contact-input contact-textarea"
                  variant="solo"
                  density="comfortable"
                  hide-details="auto"
                  rows="4"
                  maxlength="5000"
                  counter
                  placeholder="Academia, finanzas, RRHH, familias…"
                />
              </label>

              <input v-model="formData.website" class="contact-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true" />
              <p v-if="submitStatus" :class="submitStatusType" role="status">{{ submitStatus }}</p>
              <button class="contact-email-button" :disabled="isSubmitting">
                <font-awesome-icon icon="inbox" />
                {{ isSubmitting ? 'Enviando…' : 'Solicitar mi demo' }}
              </button>
            </v-form>
          </v-card>
        </div>
      </v-container>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInbox } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/composables/api'

library.add(faInbox)

const { t } = useI18n()
const contactForm = ref(null)
const isSubmitting = ref(false)
const submitStatus = ref('')
const submitStatusType = ref('')

const formData = ref({
  name: '',
  email: '',
  phone: '',
  organization: '',
  studentCount: '',
  message: '',
  website: ''
})

const nameRules = computed(() => [
  v => !!v || t('contact_name_required'),
  v => (v && v.length >= 2) || t('contact_name_min')
])

const emailRules = computed(() => [
  v => !!v || t('contact_email_required'),
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '')) || t('contact_email_invalid')
])

const phoneRules = computed(() => [
  v => !v || /^\+[1-9]\d{7,14}$/.test(String(v)) || 'Usa código de país, por ejemplo +56912345678'
])

const submitContactForm = async () => {
  const { valid } = await contactForm.value.validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    const response = await api.submitDemoRequest({
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      organization: formData.value.organization,
      studentCount: formData.value.studentCount,
      message: formData.value.message,
      website: formData.value.website
    })

    formData.value = {
      name: '',
      email: '',
      phone: '',
      organization: '',
      studentCount: '',
      message: '',
      website: ''
    }
    contactForm.value.resetValidation()
    submitStatus.value = response.message || 'Recibimos tu solicitud. Prepararemos el acceso para tu colegio.'
    submitStatusType.value = 'contact-success'
  } catch (error) {
    submitStatus.value = error.message || t('contact_error')
    submitStatusType.value = 'contact-error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.contact-form-wrapper { display: contents; }

.contact-page {
  min-height: 100vh;
  width: 100%;
  background: #f5f9fc !important;
  overflow-x: hidden;
}

.contact-page .content {
  max-width: 980px;
  margin: 0 auto;
  padding: 56px 28px 48px !important;
}

.contact-page .hero {
  max-width: 680px;
  margin: 0 auto 16px;
  padding: 0;
  text-align: center;
}

.contact-kicker {
  color: #0067b2;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .16em;
}

.contact-page .hero h1 {
  margin: 6px 0 8px;
  color: #0a2540;
  font-size: clamp(28px, 4.5vw, 42px);
  letter-spacing: -.04em;
  line-height: 1.1;
}

.contact-page .hero p {
  margin: 0;
  color: #526b7e;
  font-size: 15px;
  line-height: 1.5;
  font-weight: 500;
}

.pricing-pills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.pricing-pills span {
  padding: 8px 12px;
  border: 1px solid #c9e3f3;
  border-radius: 999px;
  color: #075f98;
  background: #eef8ff;
  font-size: 12px;
  font-weight: 750;
}

.contact-layout {
  display: block;
  max-width: 720px;
  margin: 0 auto 40px;
}

.contact-form-card {
  display: block !important;
  padding: 34px !important;
  border: 0 !important;
  border-radius: 20px !important;
  background: #fff !important;
  box-shadow:
    0 18px 50px rgba(10, 37, 64, .10),
    0 4px 14px rgba(10, 37, 64, .05) !important;
}

.contact-form-heading {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 14px !important;
  margin-bottom: 28px;
}

.contact-email-icon {
  flex: 0 0 auto;
  width: 52px;
  height: 52px;
  border: 0;
  border-radius: 14px;
  display: grid;
  place-items: center;
  color: #0067b2;
  background: #eaf5fc;
}

.contact-form-heading > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.contact-form-heading small {
  color: #5f7587;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
}

.contact-form-heading strong {
  color: #0a2540;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -.02em;
}

.contact-form-heading p {
  margin: 0;
  color: #607687;
  font-size: 14px;
  line-height: 1.45;
}

.contact-form-fields {
  display: grid;
  gap: 18px;
}

.contact-field {
  display: grid;
  gap: 8px;
}

.contact-field > span {
  color: #0a2540;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -.01em;
}

.contact-hint {
  margin-top: -2px;
  color: #6b7f90;
  font-size: 12px;
  font-weight: 600;
}

.contact-input :deep(.v-input__details) {
  padding-inline: 2px;
  min-height: 18px;
  padding-top: 4px;
}

.contact-input :deep(.v-messages__message) {
  color: #b42318;
  font-size: 12px;
  font-weight: 650;
}

.contact-input :deep(.v-field) {
  --v-field-padding-start: 14px;
  --v-field-padding-end: 14px;
  border: 1px solid #d0dbe5 !important;
  border-radius: 12px !important;
  background: #fff !important;
  box-shadow: none !important;
  min-height: 50px;
  transition: border-color .15s ease, background-color .15s ease;
}

.contact-input :deep(.v-field__overlay),
.contact-input :deep(.v-field__outline) {
  display: none !important;
}

.contact-input :deep(.v-field--focused),
.contact-input :deep(.v-field--focused.v-field--active) {
  background: #fff !important;
  border-color: #8fa3b4 !important;
  box-shadow: none !important;
  outline: none !important;
}

.contact-input :deep(.v-field--error) {
  border-color: #d64545 !important;
}

.contact-input :deep(.v-field__input) {
  min-height: 50px;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  color: #0a2540 !important;
  font-size: 15px !important;
  font-weight: 650 !important;
  letter-spacing: -.01em;
  outline: none !important;
  box-shadow: none !important;
}

.contact-input :deep(input),
.contact-input :deep(textarea) {
  color: #0a2540 !important;
  font-weight: 650 !important;
  -webkit-font-smoothing: antialiased;
  outline: none !important;
  box-shadow: none !important;
}

.contact-input :deep(input:focus),
.contact-input :deep(input:focus-visible),
.contact-input :deep(textarea:focus),
.contact-input :deep(textarea:focus-visible) {
  outline: none !important;
  box-shadow: none !important;
}

.contact-input :deep(input::placeholder),
.contact-input :deep(textarea::placeholder) {
  color: #7a8c9b !important;
  opacity: 1 !important;
  font-weight: 550 !important;
}

.contact-textarea :deep(.v-field) {
  min-height: 140px;
  align-items: stretch;
  padding: 2px 0;
}

.contact-textarea :deep(.v-field__input) {
  min-height: 120px;
  padding-top: 14px !important;
  padding-bottom: 14px !important;
  line-height: 1.5 !important;
}

.contact-textarea :deep(.v-counter) {
  color: #7a8c9b;
  font-weight: 650;
}

.contact-honeypot {
  position: absolute;
  left: -10000px;
}

.contact-success { color: #087443; font-weight: 700; }
.contact-error { color: #b42318; font-weight: 700; }

.contact-email-button {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  padding: 13px 18px;
  border: 0;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(180deg, #0a78c7, #0067b2);
  box-shadow: 0 8px 20px rgba(0, 103, 178, .22);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: .16s ease;
}

.contact-email-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 103, 178, .28);
}

.contact-email-button:disabled {
  opacity: .65;
  cursor: not-allowed;
}

@media (max-width: 650px) {
  .contact-page .content { padding: 52px 16px 40px !important; }
  .contact-form-card { padding: 22px !important; }
  .contact-form-heading strong { font-size: 21px; }
  .contact-email-button { width: 100%; justify-content: center; }
}
</style>
