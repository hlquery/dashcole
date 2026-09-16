<script setup>
import { onMounted, reactive, ref } from 'vue';
import { request } from '../api/client.js';
import { useNotify } from '../composables/notify.js';

const form = reactive({ phoneId: '', version: 'v23.0', template: '', language: 'es_CL', token: '', active: true });
const configured = ref(false);
const error = ref('');
const message = ref('');
const busy = ref(false);
const notify = useNotify();

onMounted(async () => {
  try {
    const data = await request('/school/integrations/whatsapp');
    Object.assign(form, data, { token: '' });
    configured.value = data.configured;
  } catch (e) {
    error.value = e.message;
  }
});

async function save() {
  busy.value = true;
  error.value = '';
  try {
    await request('/school/integrations/whatsapp', { method: 'PUT', body: JSON.stringify(form) });
    configured.value = true;
    form.token = '';
    message.value = 'Integración guardada. El token quedó cifrado.';
    notify('Integración de WhatsApp guardada.');
  } catch (e) {
    error.value = e.message;
    notify(e.message || 'No se pudo guardar WhatsApp.', 'error');
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <section class="panel integration">
    <h2>WhatsApp · Meta for Developers</h2>
    <p>Configura una plantilla aprobada con parámetros para asunto y mensaje. El token se cifra en el servidor y nunca vuelve a mostrarse.</p>
    <p v-if="error" class="login-error">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <form @submit.prevent="save">
      <div class="form-grid">
        <label class="field"><span>Phone Number ID</span><input v-model="form.phoneId" required inputmode="numeric" /></label>
        <label class="field"><span>Versión Graph API</span><input v-model="form.version" required placeholder="v23.0" /></label>
        <label class="field"><span>Plantilla aprobada</span><input v-model="form.template" required /></label>
        <label class="field"><span>Idioma</span><input v-model="form.language" required /></label>
        <label class="field wide"><span>{{ configured ? 'Reemplazar token (opcional)' : 'Token permanente' }}</span><input v-model="form.token" :required="!configured" type="password" autocomplete="new-password" /></label>
        <label><input v-model="form.active" type="checkbox" /> Integración activa</label>
      </div>
      <button class="primary-button" :disabled="busy">Guardar integración</button>
    </form>
  </section>
</template>
<style scoped>
.integration { padding: 24px; max-width: 850px; }
.integration > p { color: #607184; }
.integration button { margin-top: 18px; }
</style>
