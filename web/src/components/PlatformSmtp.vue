<script setup>
import { onMounted, reactive, ref } from 'vue';
import { request } from '../api/client.js';

const props = defineProps({ permissions: { type: Array, default: () => [] } });
const can = permission => props.permissions.includes(permission);
const error = ref('');
const activeTab = ref('config');
const smtp = reactive({ configured: false, source: null, host: '', port: 587, secure: false, user: '', from: '', hasPassword: false, password: '', testTo: '', message: '' });
const smtpBusy = ref(false);

async function loadSmtp() {
  if (!can('platform.infrastructure.write')) return;
  try {
    const data = await request('/platform/smtp');
    Object.assign(smtp, { ...data, password: '', testTo: smtp.testTo, message: '' });
    error.value = '';
  } catch (cause) { error.value = cause.message; }
}
async function saveSmtp(clear = false) {
  smtpBusy.value = true;
  smtp.message = '';
  error.value = '';
  try {
    const body = clear
      ? { clear: true }
      : { host: smtp.host, port: smtp.port, secure: smtp.secure, user: smtp.user, from: smtp.from, ...(smtp.password ? { password: smtp.password } : {}) };
    const data = await request('/platform/smtp', { method: 'PUT', body: JSON.stringify(body) });
    Object.assign(smtp, { ...data, password: '', message: clear ? 'SMTP de plataforma desactivado.' : 'SMTP guardado.' });
  } catch (cause) { error.value = cause.message; }
  finally { smtpBusy.value = false; }
}
async function testSmtp() {
  smtpBusy.value = true;
  smtp.message = '';
  error.value = '';
  try {
    const data = await request('/platform/smtp/test', { method: 'POST', body: JSON.stringify({ to: smtp.testTo }) });
    smtp.message = `Correo de prueba enviado a ${data.to}.`;
  } catch (cause) { error.value = cause.message; }
  finally { smtpBusy.value = false; }
}

onMounted(loadSmtp);
</script>
<template>
  <section class="smtp-page">
    <header>
      <h2>Correo saliente</h2>
      <p>Correo que hlquery usa para avisos a todos los colegios (bienvenida, recuperaciones, etc.).</p>
    </header>
    <p v-if="error" class="login-error">{{ error }}</p>
    <p v-if="!can('platform.infrastructure.write')" class="empty-note">Necesitas permiso técnico para editar el correo de la plataforma.</p>
    <template v-else>
      <div class="smtp-tabs" role="tablist" aria-label="Correo saliente">
        <button type="button" role="tab" :aria-selected="activeTab === 'config'" :class="{ active: activeTab === 'config' }" @click="activeTab = 'config'">Configurar</button>
        <button type="button" role="tab" :aria-selected="activeTab === 'test'" :class="{ active: activeTab === 'test' }" @click="activeTab = 'test'">Enviar prueba</button>
      </div>

      <section v-if="activeTab === 'config'" class="panel smtp-panel" role="tabpanel">
        <div class="section-title">
          <div>
            <h3>Servidor de correo</h3>
            <p>Valores activos para envíos de la plataforma.</p>
          </div>
          <span class="smtp-status">{{ smtp.configured ? `Activo · ${smtp.source === 'platform' ? 'configurado aquí' : 'desde el servidor'}` : 'Sin configurar' }}</span>
        </div>
        <p v-if="smtp.message && activeTab === 'config'" role="status">{{ smtp.message }}</p>
        <form class="form-grid" @submit.prevent="saveSmtp(false)">
          <label class="field"><span>Host</span><input v-model.trim="smtp.host" required placeholder="smtp.mailgun.org" /></label>
          <label class="field"><span>Puerto</span><input v-model.number="smtp.port" type="number" min="1" max="65535" required /></label>
          <label class="field"><span>Usuario</span><input v-model.trim="smtp.user" autocomplete="username" placeholder="postmaster@…" /></label>
          <label class="field"><span>{{ smtp.hasPassword ? 'Nueva contraseña (opcional)' : 'Contraseña' }}</span><input v-model="smtp.password" type="password" autocomplete="new-password" :placeholder="smtp.hasPassword ? 'Dejar en blanco para conservar' : ''" /></label>
          <label class="field wide"><span>Remitente</span><input v-model.trim="smtp.from" required placeholder="hlquery &lt;no-reply@hlquery.com&gt;" /></label>
          <label class="check-field"><input v-model="smtp.secure" type="checkbox" /> Conexión segura (TLS/SSL)</label>
          <div class="smtp-actions wide">
            <button type="submit" class="primary-button" :disabled="smtpBusy || !smtp.host">Guardar SMTP</button>
            <button type="button" class="secondary-button" :disabled="smtpBusy" @click="saveSmtp(true)">Usar solo .env / desactivar</button>
          </div>
        </form>
      </section>

      <section v-else class="panel smtp-panel smtp-test-panel" role="tabpanel">
        <div class="section-title">
          <div>
            <h3>Enviar prueba</h3>
            <p>Manda un correo de prueba con la configuración activa.</p>
          </div>
          <span class="smtp-status">{{ smtp.configured ? 'Listo para probar' : 'Configura SMTP primero' }}</span>
        </div>
        <p v-if="smtp.message" role="status">{{ smtp.message }}</p>
        <div class="smtp-test">
          <label class="field"><span>Correo de prueba</span><input v-model.trim="smtp.testTo" type="email" placeholder="tu@correo.cl" /></label>
          <button class="primary-button" :disabled="smtpBusy || !smtp.testTo || !smtp.configured" @click="testSmtp">Enviar prueba</button>
        </div>
        <p v-if="!smtp.configured" class="empty-note">Guarda el servidor en la pestaña Configurar antes de enviar una prueba.</p>
      </section>
    </template>
  </section>
</template>
<style scoped>
.smtp-page { display: grid; gap: 14px; }
header p, .empty-note { color: #607184; margin: 0; }
.field { max-width: 600px; margin: 10px 0; }
.section-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.section-title h3, .section-title p { margin: 0; }
.section-title p { color: #607184; font-size: 12px; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 4px 16px; margin: 12px 0 18px; }
.check-field { display: flex; align-items: center; gap: 8px; }
.smtp-tabs {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--color-border, #e4e9ef);
  border-radius: 999px;
  background: var(--color-canvas, #f5f7fa);
  width: fit-content;
}
.smtp-tabs button {
  min-width: max-content;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  color: var(--color-subtle, #607184);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
.smtp-tabs button.active {
  color: var(--color-surface, #fff);
  background: var(--color-primary, #075f98);
}
.smtp-panel { padding: 22px; margin: 0; }
.smtp-status { color: #607184; font-size: 12px; font-weight: 700; }
.smtp-actions, .smtp-test { display: flex; flex-wrap: wrap; gap: 10px; align-items: end; }
.smtp-test { margin-top: 8px; }
.smtp-test .field { margin: 0; min-width: 260px; flex: 1; }
</style>
