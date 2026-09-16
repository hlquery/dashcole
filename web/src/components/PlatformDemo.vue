<script setup>
import { computed, onMounted, ref } from 'vue';
import { RefreshCw } from '@lucide/vue';
import { request } from '../api/client.js';

const props = defineProps({
  permissions: { type: Array, default: () => [] },
});

const demoReset = ref(null);
const demoResetBusy = ref(false);
const demoAccessBusy = ref(false);
const demoResetMessage = ref('');
const demoResetError = ref('');

const canResetDemo = computed(() => props.permissions.includes('platform.infrastructure.write'));
const demoSchoolsTotal = computed(() => Number(demoReset.value?.schoolsTotal || 0));
const demoSchoolsActive = computed(() => Number(demoReset.value?.schoolsActive || 0));
const demoSchoolsSuspended = computed(() => Number(demoReset.value?.schoolsSuspended || 0));
/** ON si hay demos usables; el PUT siempre deja todas igual (on/off). */
const demoSchoolsEnabled = computed(() => demoSchoolsTotal.value > 0 && demoSchoolsActive.value > 0);
const demoSchoolsMixed = computed(() => demoSchoolsActive.value > 0 && demoSchoolsSuspended.value > 0);

function formatResetAt(value) {
  if (!value) return 'Nunca';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function load() {
  if (!canResetDemo.value) {
    demoReset.value = null;
    demoResetError.value = 'Necesitas permiso de infraestructura para gestionar colegios demo.';
    return;
  }
  try {
    demoReset.value = await request('/platform/demo/reset');
    demoResetError.value = '';
  } catch (cause) {
    demoReset.value = null;
    demoResetError.value = cause.message;
  }
}

async function onDemoAccessToggle(event) {
  const nextEnabled = Boolean(event.target.checked);
  // Revert visual until the API confirms; checkbox is controlled via :checked.
  event.target.checked = demoSchoolsEnabled.value;
  await setDemoAccess(nextEnabled);
}

async function setDemoAccess(nextEnabled) {
  demoResetError.value = '';
  demoResetMessage.value = '';
  if (!demoSchoolsTotal.value) {
    demoResetError.value = 'No hay colegios demo instalados.';
    return;
  }
  if (nextEnabled === demoSchoolsEnabled.value && !demoSchoolsMixed.value) return;

  const schools = (demoReset.value?.schools || []).join(', ') || 'colegios demo';
  const action = nextEnabled ? 'habilitar' : 'deshabilitar';
  if (!window.confirm(
    `¿${action.charAt(0).toUpperCase() + action.slice(1)} todas las demos?\n\n`
    + `Se ${nextEnabled ? 'activarán' : 'suspenderán'} de una: ${schools}.\n`
    + 'La cuenta root (super@hlquery.com) no se toca.',
  )) {
    return;
  }

  demoAccessBusy.value = true;
  try {
    const result = await request('/platform/demo/access', {
      method: 'PUT',
      body: JSON.stringify({ enabled: nextEnabled }),
    });
    demoResetMessage.value = nextEnabled
      ? `Demos habilitadas (${result.updated?.length || result.total || 0} colegios).`
      : `Demos deshabilitadas (${result.updated?.length || result.suspended || 0} colegios suspendidos).`;
    await load();
  } catch (cause) {
    demoResetError.value = cause.message;
  } finally {
    demoAccessBusy.value = false;
  }
}

async function reinstallDemo() {
  demoResetError.value = '';
  demoResetMessage.value = '';
  if (!demoReset.value?.enabled) {
    demoResetError.value = 'El reinicio de demo está deshabilitado en este entorno.';
    return;
  }
  const schools = (demoReset.value.schools || []).join(', ') || 'colegios demo';
  if (!window.confirm(
    `¿Reinstalar todas las demos?\n\nSe borran y vuelven a sembrar: ${schools}.\n`
    + 'La cuenta root (super@hlquery.com) no se toca.',
  )) {
    return;
  }
  demoResetBusy.value = true;
  try {
    const result = await request('/platform/demo/reset', { method: 'POST', body: '{}' });
    demoReset.value = {
      ...demoReset.value,
      lastResetAt: result.lastResetAt || new Date().toISOString(),
      lastResetBy: result.lastResetBy || null,
      lastResetSource: result.lastResetSource || 'platform',
      schools: result.seeded?.map(row => row.slug) || demoReset.value.schools,
    };
    demoResetMessage.value = `Todas las demos reinstaladas (${(result.seeded || []).length} colegios). Cuentas root intactas.`;
    await load();
  } catch (cause) {
    demoResetError.value = cause.message;
  } finally {
    demoResetBusy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <section class="demo-page">
    <header>
      <h2>Colegios de prueba</h2>
      <p>Reinicia o suspende los colegios demo de una sola vez. No afecta las cuentas de la plataforma.</p>
    </header>

    <article v-if="canResetDemo" class="panel demo-reset-panel">
      <div class="demo-reset-copy">
        <h3>Gestión de demos</h3>
        <p>
          Puedes reinstalar o activar/suspender todos los colegios de demostración
          <template v-if="demoReset?.schools?.length"> ({{ demoReset.schools.join(', ') }})</template>.
          Las cuentas de administración de plataforma se conservan.
        </p>
        <p v-if="demoReset" class="demo-reset-meta">
          Estado:
          <strong>{{ !demoSchoolsTotal ? 'no instalados' : (demoSchoolsEnabled ? 'habilitados' : 'deshabilitados') }}</strong>
          <template v-if="demoSchoolsTotal">
            · {{ demoSchoolsActive }} activos / {{ demoSchoolsSuspended }} suspendidos
          </template>
          <template v-if="demoReset.lastAccessToggleAt"> · cambio: {{ formatResetAt(demoReset.lastAccessToggleAt) }}</template>
        </p>
        <p v-if="demoSchoolsMixed" class="demo-reset-mixed">
          Hay colegios en distinto estado ({{ demoSchoolsSuspended }} suspendidos).
          <button type="button" class="sync-link" :disabled="demoAccessBusy || demoResetBusy" @click="setDemoAccess(true)">
            Habilitar todas
          </button>
        </p>
        <p v-if="demoReset" class="demo-reset-meta">
          Reinstalación automática cada {{ demoReset.everyHours || 10 }} h · Último: {{ formatResetAt(demoReset.lastResetAt) }}
          <template v-if="demoReset.lastResetBy"> · por {{ demoReset.lastResetBy }}</template>
        </p>
        <p v-if="demoReset && !demoReset.enabled" class="demo-reset-disabled">
          Reinicio deshabilitado en este entorno (<code>DEMO_RESET_ENABLED=false</code>).
        </p>
        <p v-if="demoResetMessage" class="demo-reset-ok" role="status">{{ demoResetMessage }}</p>
        <p v-if="demoResetError" class="login-error" role="alert">{{ demoResetError }}</p>
      </div>

      <div class="demo-reset-actions">
        <label
          class="switch-field demo-access-switch"
          :class="{ busy: demoAccessBusy, disabled: demoAccessBusy || demoResetBusy || !demoSchoolsTotal }"
        >
          <input
            type="checkbox"
            role="switch"
            :checked="demoSchoolsEnabled"
            :disabled="demoAccessBusy || demoResetBusy || !demoSchoolsTotal"
            :aria-checked="demoSchoolsMixed ? 'mixed' : demoSchoolsEnabled"
            @change="onDemoAccessToggle"
          />
          <span>
            <i></i>
            <strong>{{ demoSchoolsEnabled ? 'Demos habilitadas' : 'Demos deshabilitadas' }}</strong>
            <small>
              <template v-if="demoAccessBusy">{{ demoSchoolsEnabled ? 'Deshabilitando…' : 'Habilitando…' }}</template>
              <template v-else-if="!demoSchoolsTotal">No hay colegios demo instalados</template>
              <template v-else-if="demoSchoolsMixed">{{ demoSchoolsActive }} activos · {{ demoSchoolsSuspended }} suspendidos</template>
              <template v-else-if="demoSchoolsEnabled">Los colegios de prueba aceptan acceso</template>
              <template v-else>Los colegios de prueba están suspendidos</template>
            </small>
          </span>
        </label>

        <button
          type="button"
          class="secondary-button demo-reset-button"
          :disabled="demoResetBusy || demoAccessBusy || demoReset?.enabled === false"
          @click="reinstallDemo"
        >
          <span v-if="demoResetBusy" class="spinner"></span>
          <RefreshCw v-else :size="16" />
          {{ demoResetBusy ? 'Reinstalando…' : 'Reinstalar todas las demos' }}
        </button>
      </div>
    </article>

    <p v-else class="empty-note">Necesitas permiso de infraestructura para gestionar colegios demo.</p>
    <p v-if="!canResetDemo && demoResetError" class="login-error" role="alert">{{ demoResetError }}</p>
  </section>
</template>

<style scoped>
.demo-page { display: grid; gap: 16px; }
header p { margin: 0; color: var(--color-subtle, #607184); }
.demo-reset-panel {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px;
  flex-wrap: wrap;
}
.demo-reset-copy {
  display: grid;
  gap: 6px;
  min-width: min(420px, 100%);
  flex: 1;
}
.demo-reset-copy h3 { margin: 0; font-size: 15px; }
.demo-reset-copy > p {
  margin: 0;
  color: var(--color-subtle, #607184);
  font-size: 13px;
  line-height: 1.45;
}
.demo-reset-meta { font-size: 12px !important; }
.demo-reset-mixed { color: #8a5a00 !important; font-weight: 650; }
.sync-link {
  margin-left: 6px;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--color-primary, #0067b2);
  font: inherit;
  font-weight: 750;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}
.sync-link:disabled { opacity: .6; cursor: wait; }
.demo-reset-disabled { color: #9a6700 !important; }
.demo-reset-ok { color: #166534 !important; font-weight: 650; }
.demo-reset-actions {
  display: grid;
  gap: 10px;
  min-width: min(280px, 100%);
  align-content: start;
}
.demo-access-switch {
  margin: 0;
  grid-column: auto;
  min-width: 0;
  user-select: none;
}
.demo-access-switch.disabled {
  opacity: .7;
  cursor: not-allowed;
}
.demo-access-switch.busy {
  cursor: wait;
}
.demo-reset-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  white-space: nowrap;
}
.empty-note { color: var(--color-subtle, #607184); }
</style>
