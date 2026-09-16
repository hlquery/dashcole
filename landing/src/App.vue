<template>
  <div id="app" :class="{ 'app-loading': isInitializing }">
    <a href="#main-content" class="skip-link">{{ $t('app.skipToMainContent') }}</a>
    <p class="sr-only" aria-live="polite">{{ routeAnnouncement }}</p>

    <!-- Global Loading Overlay -->
    <transition name="fade">
      <div v-if="isInitializing" class="global-loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
      </div>
    </transition>

    <!-- Global Error Boundary -->
    <transition name="slide-down">
      <div v-if="globalError" class="global-error-banner">
        <div class="error-content">
          <svg class="error-banner-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.75a9.25 9.25 0 1 0 0 18.5a9.25 9.25 0 0 0 0-18.5Zm0 5.25c.41 0 .75.34.75.75v5.25a.75.75 0 0 1-1.5 0V8.75c0-.41.34-.75.75-.75Zm0 9a1 1 0 1 1 0-2a1 1 0 0 1 0 2Z" fill="currentColor" />
          </svg>
          <span class="error-message">{{ globalError }}</span>
          <button @click="dismissError" class="error-dismiss" :aria-label="$t('app.dismissError')">
            <svg class="error-dismiss-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </transition>

    <!-- Main Router View with Smooth Transitions -->
    <router-view v-slot="{ Component, route }">
      <transition 
        :name="routeTransition" 
        mode="out-in"
      >
        <main id="main-content" ref="mainContentRef" class="route-main" tabindex="-1">
          <component v-if="Component" :is="Component" :key="route.path" />
        </main>
      </transition>
    </router-view>

    <teleport to="body">
      <button
        v-show="showScrollTopButton"
        type="button"
        class="scroll-top-button"
        :aria-label="$t('app.scrollToTop')"
        @click="scrollToTop"
      >↑</button>
    </teleport>
    <GlobalSnackbar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, onErrorCaptured, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useSettingsStore } from './stores/settings'
import { useLanguageStore } from './stores/language'
import { useSnackbar } from './composables/snackbar'
import GlobalSnackbar from './components/GlobalSnackbar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const languageStore = useLanguageStore()
const snackbar = useSnackbar()
let nativeAlert = null

// Global state
const isInitializing = ref(true)
const globalError = ref(null)
const routeTransition = ref('fade')
const mainContentRef = ref(null)
const routeAnnouncement = ref('')
const showScrollTopButton = ref(false)
let lenisScrollHandler = null
let lenisAttachIntervalId = null
let accessibilityObserver = null
let accessibilityEnhanceScheduled = false
const MIN_SCROLL_TOP_VISIBLE = 32
const CLICKABLE_NON_NATIVE_SELECTOR = [
  '.elegant-header-cell',
  '.clickable',
  '[class*="clickable"]',
  '.sidebar-item',
  '.server-banner-content',
  '.chart-container'
].join(', ')

// Route transition based on route depth
const getRouteTransition = (to, from) => {
  if (!from.name) return 'fade'
  
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  
  if (toDepth < fromDepth) return 'slide-right'
  if (toDepth > fromDepth) return 'slide-left'
  return 'fade'
}

// Watch route changes for transitions
watch(() => route.path, (to, from) => {
  if (from) {
    routeTransition.value = getRouteTransition(route, { path: from })
  }
}, { immediate: false })

// Move focus to main content after route navigation for keyboard/screen reader users
watch(() => route.fullPath, async (newPath) => {
  if (newPath.includes('#')) return
  await nextTick()
  runAccessibilityEnhancements()
  updateScrollTopButton()
  mainContentRef.value?.focus?.({ preventScroll: true })
  routeAnnouncement.value = `Navegaste a ${route.name || 'la página'}`
})

const handleCrossAppLogout = async () => {
  if (route.query.logout !== '1') return
  await authStore.clearAuth()
  const nextQuery = { ...route.query }
  delete nextQuery.logout
  await router.replace({ path: route.path, query: nextQuery, hash: route.hash })
}

const shouldSkipKeyboardUpgrade = (el) => {
  if (!el) return true
  const tag = el.tagName
  return tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA'
}

const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim()

const deriveAccessibleLabel = (el) => {
  if (!el) return ''
  const title = normalizeText(el.getAttribute('title') || '')
  if (title) return title

  const text = normalizeText(el.textContent || '')
  const className = (el.className || '').toString().toLowerCase()
  if (text === '×' || text.toLowerCase() === 'x' || className.includes('close')) return 'Cerrar'
  if (text && text.length <= 120) return text
  return ''
}

const enhanceKeyboardInteractions = () => {
  if (typeof document === 'undefined') return
  const elements = document.querySelectorAll(CLICKABLE_NON_NATIVE_SELECTOR)
  elements.forEach((el) => {
    if (shouldSkipKeyboardUpgrade(el)) return
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button')
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0')
    if (el.dataset.kbEnhanced === 'true') return
    el.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      el.click()
    })
    el.dataset.kbEnhanced = 'true'
  })
}

const enhanceAccessibleLabels = () => {
  if (typeof document === 'undefined') return
  const controls = document.querySelectorAll('button, a, [role="button"]')
  controls.forEach((el) => {
    if (el.dataset.a11yLabelEnhanced === 'true') return
    if (el.hasAttribute('aria-label')) {
      el.dataset.a11yLabelEnhanced = 'true'
      return
    }
    const label = deriveAccessibleLabel(el)
    if (label) el.setAttribute('aria-label', label)
    el.dataset.a11yLabelEnhanced = 'true'
  })
}

const normalizeButtonTypes = () => {
  if (typeof document === 'undefined') return
  const buttons = document.querySelectorAll('button:not([type])')
  buttons.forEach((button) => {
    // Keep native form behavior intact for form-contained buttons.
    if (button.closest('form')) return
    button.setAttribute('type', 'button')
  })
}

const runAccessibilityEnhancements = () => {
  normalizeButtonTypes()
  enhanceKeyboardInteractions()
  enhanceAccessibleLabels()
}

const scheduleAccessibilityEnhancements = () => {
  if (accessibilityEnhanceScheduled || typeof window === 'undefined') return
  accessibilityEnhanceScheduled = true
  window.requestAnimationFrame(() => {
    accessibilityEnhanceScheduled = false
    runAccessibilityEnhancements()
  })
}

const getActiveScrollY = () => {
  if (typeof window === 'undefined') return 0
  const lenis = window.__lenis
  const candidates = [
    Number(window.scrollY || 0),
    Number(document.documentElement?.scrollTop || 0),
    Number(document.body?.scrollTop || 0),
    Number(lenis?.animatedScroll ?? NaN),
    Number(lenis?.scroll ?? NaN),
    Number(lenis?.targetScroll ?? NaN)
  ].filter(value => Number.isFinite(value))
  return candidates.length ? Math.max(...candidates, 0) : 0
}

const setScrollTopVisibility = (scrollValue) => {
  if (typeof window === 'undefined') {
    showScrollTopButton.value = false
    return
  }
  showScrollTopButton.value = Number(scrollValue || 0) > MIN_SCROLL_TOP_VISIBLE
}

const updateScrollTopButton = () => {
  setScrollTopVisibility(getActiveScrollY())
}

const attachLenisScrollListener = () => {
  if (typeof window === 'undefined' || lenisScrollHandler) return false
  const lenis = window.__lenis
  if (!lenis || typeof lenis.on !== 'function') return false
  lenisScrollHandler = (event) => setScrollTopVisibility(event?.scroll ?? getActiveScrollY())
  lenis.on('scroll', lenisScrollHandler)
  updateScrollTopButton()
  return true
}

const scrollToTop = () => {
  if (typeof window === 'undefined') return
  const lenis = window.__lenis
  if (lenis && typeof lenis.scrollTo === 'function') {
    lenis.scrollTo(0)
    return
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const startAccessibilityObserver = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (accessibilityObserver) return
  accessibilityObserver = new MutationObserver(() => {
    scheduleAccessibilityEnhancements()
  })
  accessibilityObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'title', 'aria-label']
  })
}


// Global error handler
onErrorCaptured((err, instance, info) => {
  console.error('Global error captured:', err, info)
  globalError.value = err.message || 'An unexpected error occurred'
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (globalError.value === err.message) {
      dismissError()
    }
  }, 5000)
  
  return false // Prevent error from propagating
})

// Dismiss error
const dismissError = () => {
  globalError.value = null
}

// Initialize app
onMounted(async () => {
  try {
    await handleCrossAppLogout()

    if (typeof window !== 'undefined') {
      nativeAlert = window.alert
      window.alert = (msg) => {
        const text = msg === undefined || msg === null ? 'Action completed' : String(msg)
        const lowered = text.toLowerCase()
        if (lowered.includes('success') || lowered.includes('saved') || lowered.includes('created')) {
          snackbar.success(text, 4000)
        } else if (lowered.includes('warning') || lowered.includes('attention')) {
          snackbar.warning(text, 4500)
        } else {
          snackbar.error(text, 5000)
        }
      }
    }

    // Initialize stores in parallel
    await Promise.all([
      settingsStore.initialize?.() || Promise.resolve(),
      languageStore.initialize?.() || Promise.resolve()
    ])
    
    // Small delay for smooth loading experience
    await new Promise(resolve => setTimeout(resolve, 300))

    runAccessibilityEnhancements()
    startAccessibilityObserver()
    updateScrollTopButton()
    window.addEventListener('scroll', updateScrollTopButton, { passive: true })
    window.addEventListener('resize', updateScrollTopButton, { passive: true })
    attachLenisScrollListener()
    lenisAttachIntervalId = window.setInterval(() => {
      if (attachLenisScrollListener() && lenisAttachIntervalId) {
        window.clearInterval(lenisAttachIntervalId)
        lenisAttachIntervalId = null
      }
    }, 250)
    isInitializing.value = false
  } catch (error) {
    console.error('Error initializing app:', error)
    globalError.value = 'Failed to initialize application'
    isInitializing.value = false
  }
})

watch(() => route.query.logout, () => {
  void handleCrossAppLogout()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && nativeAlert) {
    window.alert = nativeAlert
  }
  if (accessibilityObserver) {
    accessibilityObserver.disconnect()
    accessibilityObserver = null
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateScrollTopButton)
    window.removeEventListener('resize', updateScrollTopButton)
    if (lenisAttachIntervalId) {
      window.clearInterval(lenisAttachIntervalId)
      lenisAttachIntervalId = null
    }
    const lenis = window.__lenis
    if (lenis && lenisScrollHandler && typeof lenis.off === 'function') {
      lenis.off('scroll', lenisScrollHandler)
    }
    lenisScrollHandler = null
  }
})
</script>

<style>

#app {
  font-family: var(--font-family-sohne);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  color: var(--color-stripe-text);
  font-weight: var(--font-weight-normal);
  font-optical-sizing: auto;
  font-variation-settings: 'wght' var(--font-variation-weight);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.route-main {
  outline: none;
}

.skip-link {
  position: fixed;
  left: 12px;
  top: 10px;
  z-index: 100000;
  padding: 8px 12px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff !important;
  font-size: 14px;
  font-weight: 600;
  transform: translateY(-140%);
  transition: transform 0.2s ease;
}

.scroll-top-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 42px;
  height: 42px;
  border: 1px solid #0a2540;
  border-radius: 50%;
  background: #0a2540;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(10,37,64,.12);
  z-index: 2147483647 !important;
  visibility: visible !important;
  opacity: 1 !important;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
}

.scroll-top-button:hover {
  transform: translateY(-2px);
  background: #123b61;
  box-shadow: 0 9px 20px rgba(10,37,64,.17);
}

.scroll-top-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .scroll-top-button {
    right: 16px;
    bottom: 16px;
  }
}

.skip-link:focus-visible {
  transform: translateY(0);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Global Loading Overlay */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Global Error Banner */
.global-error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fee2e2;
  border-bottom: 2px solid #ef4444;
  z-index: 9998;
  padding: 12px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.error-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-banner-icon {
  width: 20px;
  height: 20px;
  color: #dc2626;
  flex: 0 0 auto;
}

.error-message {
  flex: 1;
  color: #991b1b;
  font-weight: 500;
  font-size: 14px;
  margin-left: 8px;
}

.error-dismiss {
  background: none;
  border: none;
  cursor: pointer;
  color: #991b1b;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.error-dismiss-icon {
  width: 18px;
  height: 18px;
}

.error-dismiss:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Route Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none !important;
  }

  .fade-enter-from,
  .fade-leave-to,
  .slide-left-enter-from,
  .slide-left-leave-to,
  .slide-right-enter-from,
  .slide-right-leave-to,
  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 1 !important;
    transform: none !important;
  }

  .scroll-top-button {
    transition: none !important;
  }
}

/* App Loading State */
.app-loading {
  overflow: hidden;
}

/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f8fafc !important;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  font-family: var(--font-family-sohne);
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-stripe-text);
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--font-family-sohne);
  color: var(--color-stripe-title);
}

p,
span,
label,
input,
button,
select,
textarea {
  font-family: var(--font-family-sohne);
  color: var(--color-stripe-text);
  line-height: var(--line-height-base);
}

/* Smooth Scrolling */
html {
  scroll-behavior: smooth;
}

/* Focus Styles for Accessibility */
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Selection Styles */
::selection {
  background: rgba(59, 130, 246, 0.2);
  color: inherit;
}

::-moz-selection {
  background: rgba(59, 130, 246, 0.2);
  color: inherit;
}
</style>
