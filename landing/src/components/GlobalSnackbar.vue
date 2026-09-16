<template>
  <teleport to="body">
    <transition name="global-snackbar-fade">
      <div
        v-if="snackbar"
        class="global-snackbar"
        :class="[`global-snackbar-${variantClass}`]"
        role="status"
        aria-live="polite"
      >
        <div class="global-snackbar-icon-wrap">
          <font-awesome-icon :icon="iconName" class="global-snackbar-icon" />
        </div>
        <div class="global-snackbar-content">
          <div class="global-snackbar-title">{{ titleText }}</div>
          <div class="global-snackbar-message">{{ message }}</div>
        </div>
        <button type="button" class="global-snackbar-close" @click="close" aria-label="Close notification">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
        <div class="global-snackbar-progress" :style="{ animationDuration: `${timeout}ms` }"></div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faXmark, faCircleInfo, faCircleExclamation, faTriangleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { useSnackbar } from '@/composables/snackbar'

library.add(faXmark, faCircleInfo, faCircleExclamation, faTriangleExclamation, faCircleCheck)

const { snackbar, message, color, timeout, close } = useSnackbar()

const variantClass = computed(() => {
  const current = String(color.value || 'info').toLowerCase()
  if (['success', 'error', 'warning', 'info'].includes(current)) return current
  return 'info'
})

const iconName = computed(() => {
  switch (variantClass.value) {
    case 'success':
      return ['fas', 'circle-check']
    case 'error':
      return ['fas', 'triangle-exclamation']
    case 'warning':
      return ['fas', 'circle-exclamation']
    default:
      return ['fas', 'circle-info']
  }
})

const titleText = computed(() => {
  switch (variantClass.value) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Action Failed'
    case 'warning':
      return 'Attention'
    default:
      return 'Notice'
  }
})
</script>

<style scoped>
.global-snackbar {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 20000;
  width: min(460px, calc(100vw - 32px));
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: 14px;
  border: 1px solid #dbe3f2;
  padding: 14px 14px 14px 12px;
  box-shadow: 0 18px 40px rgba(2, 8, 23, 0.18);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.global-snackbar-success {
  background: linear-gradient(140deg, rgba(240, 253, 244, 0.98), rgba(220, 252, 231, 0.95));
}

.global-snackbar-error {
  background: linear-gradient(140deg, rgba(254, 242, 242, 0.98), rgba(254, 226, 226, 0.95));
}

.global-snackbar-warning {
  background: linear-gradient(140deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.95));
}

.global-snackbar-info {
  background: linear-gradient(140deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.95));
}

.global-snackbar-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: rgba(15, 23, 42, 0.06);
}

.global-snackbar-icon {
  font-size: 0.95rem;
}

.global-snackbar-success .global-snackbar-icon { color: #15803d; }
.global-snackbar-error .global-snackbar-icon { color: #b91c1c; }
.global-snackbar-warning .global-snackbar-icon { color: #b45309; }
.global-snackbar-info .global-snackbar-icon { color: #1d4ed8; }

.global-snackbar-content {
  flex: 1;
  min-width: 0;
}

.global-snackbar-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.global-snackbar-message {
  margin-top: 2px;
  font-size: 0.88rem;
  color: #334155;
  line-height: 1.45;
  word-break: break-word;
}

.global-snackbar-close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.global-snackbar-close:hover {
  background: rgba(15, 23, 42, 0.14);
  color: #0f172a;
}

.global-snackbar-fade-enter-active,
.global-snackbar-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.global-snackbar-fade-enter-from,
.global-snackbar-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.global-snackbar-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: rgba(15, 23, 42, 0.12);
  transform-origin: left center;
  animation-name: snackbarProgress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

.global-snackbar-success .global-snackbar-progress { background: #22c55e; }
.global-snackbar-error .global-snackbar-progress { background: #ef4444; }
.global-snackbar-warning .global-snackbar-progress { background: #f59e0b; }
.global-snackbar-info .global-snackbar-progress { background: #3b82f6; }

@keyframes snackbarProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

@media (max-width: 768px) {
  .global-snackbar {
    left: 12px;
    right: 12px;
    width: auto;
    top: 12px;
  }
}
</style>
