<script setup>
import { MessageCircle, CreditCard } from '@lucide/vue';
import WhatsAppSettings from './WhatsAppSettings.vue';
import WebpaySettings from './WebpaySettings.vue';

defineProps({
  tab: { type: String, default: 'whatsapp' },
});

const emit = defineEmits(['update:tab']);

function selectTab(next) {
  emit('update:tab', next === 'webpay' ? 'webpay' : 'whatsapp');
}
</script>

<template>
  <div class="account-shell integrations-shell">
    <div class="account-tabs" role="tablist" aria-label="Integraciones">
      <button
        type="button"
        role="tab"
        :aria-selected="tab !== 'webpay'"
        :class="{ active: tab !== 'webpay' }"
        @click="selectTab('whatsapp')"
      >
        <MessageCircle :size="14" />
        <span>WhatsApp<small>Meta for Developers</small></span>
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="tab === 'webpay'"
        :class="{ active: tab === 'webpay' }"
        @click="selectTab('webpay')"
      >
        <CreditCard :size="14" />
        <span>Webpay<small>Transbank · cobros con tarjeta</small></span>
      </button>
    </div>

    <div v-if="tab !== 'webpay'" role="tabpanel">
      <WhatsAppSettings />
    </div>
    <div v-else role="tabpanel">
      <WebpaySettings />
    </div>
  </div>
</template>
