<script setup>
import { onMounted, reactive, ref } from 'vue';
import { request } from '../api/client.js';
import { useNotify } from '../composables/notify.js';

const form = reactive({
  commerceCode: '',
  apiKey: '',
  environment: 'integration',
  active: true,
});
const configured = ref(false);
const commerceCodeMasked = ref('');
const error = ref('');
const message = ref('');
const busy = ref(false);
const notify = useNotify();

onMounted(async () => {
  try {
    const data = await request('/school/integrations/webpay');
    form.commerceCode = data.commerceCode || '';
    form.environment = data.environment === 'production' ? 'production' : 'integration';
    form.active = data.active !== false;
    form.apiKey = '';
    configured.value = Boolean(data.configured);
    commerceCodeMasked.value = data.commerceCodeMasked || '';
  } catch (e) {
    error.value = e.message;
  }
});

async function save() {
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    const payload = {
      commerceCode: form.commerceCode,
      environment: form.environment,
      active: form.active,
      ...(form.apiKey ? { apiKey: form.apiKey } : {}),
    };
    const saved = await request('/school/integrations/webpay', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    configured.value = true;
    form.apiKey = '';
    form.commerceCode = saved.commerceCode || form.commerceCode;
    commerceCodeMasked.value = saved.commerceCodeMasked || commerceCodeMasked.value;
    message.value = 'Integración Webpay guardada. La clave API quedó cifrada.';
    notify('Integración Webpay guardada.');
  } catch (e) {
    error.value = e.message;
    notify(e.message || 'No se pudo guardar Webpay.', 'error');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section class="panel integration">
    <h2>Webpay · Transbank</h2>
    <p>
      Configura el comercio Webpay Plus del colegio para cobrar mensualidades y otros pagos con tarjeta.
      La clave API se cifra en el servidor y nunca vuelve a mostrarse.
    </p>
    <p v-if="error" class="login-error">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <form @submit.prevent="save">
      <div class="form-grid">
        <label class="field">
          <span>Código de comercio</span>
          <input
            v-model.trim="form.commerceCode"
            required
            inputmode="numeric"
            autocomplete="off"
            :placeholder="configured && commerceCodeMasked ? commerceCodeMasked : 'Ej. 597055555532'"
          />
        </label>
        <label class="field">
          <span>Ambiente</span>
          <select v-model="form.environment">
            <option value="integration">Integración (pruebas)</option>
            <option value="production">Producción</option>
          </select>
        </label>
        <label class="field wide">
          <span>{{ configured ? 'Reemplazar clave API (opcional)' : 'Clave API' }}</span>
          <input
            v-model="form.apiKey"
            :required="!configured"
            type="password"
            autocomplete="new-password"
            placeholder="Clave secreta de Transbank"
          />
        </label>
        <label>
          <input v-model="form.active" type="checkbox" />
          Integración activa
        </label>
      </div>
      <p v-if="configured" class="field-help">
        Comercio configurado{{ commerceCodeMasked ? ` · ${commerceCodeMasked}` : '' }}.
        Deja la clave vacía si no quieres cambiarla.
      </p>
      <button class="primary-button" :disabled="busy">Guardar integración</button>
    </form>
  </section>
</template>

<style scoped>
.integration { padding: 24px; max-width: 850px; }
.integration > p { color: #607184; }
.integration button { margin-top: 18px; }
.field-help { margin: 8px 0 0; color: #607184; font-size: 12px; }
</style>
