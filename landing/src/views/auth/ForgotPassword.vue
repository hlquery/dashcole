
<!--
 * Forgot Password View
 *
 * Password reset form with email input and validation.
 * Based on login.vue design
-->

<template>
  <div class="login-wrapper">
    <!-- Fixed background decorative shapes -->
    <div class="bg-bar blue-bar" ref="blueBar"></div>
    <div class="bg-bar red-bar" ref="redBar"></div>
    <div class="bg-triangle green-triangle" ref="greenTriangle"></div>
    <div class="bg-triangle sky-triangle" ref="skyTriangle"></div>
    <div class="bg-circle orange-circle" ref="orangeCircle"></div>
    <div class="bg-hexagon pink-hexagon" ref="pinkHexagon"></div>
    <div class="bg-diamond teal-diamond" ref="tealDiamond"></div>

    <div class="auth-logo-container">
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <img
            src="/images/logos/high-appbar.png"
            srcset="/images/logos/high-appbar.png 1x, /images/logos/high-appbar@2x.png 2x, /images/logos/high-appbar@3x.png 3x"
            alt="DashCole"
            class="logo-icon"
            width="34"
            height="34"
            decoding="async"
          />
          <span class="logo-text">{{ appName }}</span>
        </router-link>
      </div>
    </div>

    <div class="login-content">
      <div class="login-card">
        <div class="card-inner">
          <h1 class="welcome font-sohne font-weight-stripe text-stripe-xl">
            {{ $t('forgot_password_title') }}
          </h1>

          <div v-if="emailSent" class="sent-message">
            <div class="sent-icon-wrapper">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="sent-icon" />
            </div>
            <h2 class="sent-title">{{ $t('forgot_password_sent_title') }}</h2>
            <p class="sent-text">{{ $t('forgot_password_sent_message') }}</p>
          </div>

          <form v-if="!emailSent" @submit.prevent="resetPassword">
            <div class="email-field">
              <label for="email">{{ $t('email') }}</label>
              <div class="input-container">
                <font-awesome-icon
                  :icon="['fas', 'envelope']"
                  class="input-icon"
                />
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  :class="{ 'invalid-input': submitted && emailError, 'input-with-icon': true }"
                  autocomplete="email"
                  autocapitalize="off"
                  spellcheck="false"
                />
              </div>
              <p v-if="submitted && emailError" class="input-error">{{ emailError }}</p>
            </div>

            <v-btn 
              color="primary" 
              type="submit" 
              size="large"
              block
              :loading="isResetting"
              :disabled="isResetting"
              ref="resetButton"
              class="mt-4 signin-button"
              elevation="2"
            >
              <span class="signin-text">{{ $t('forgot_password_send_link') }}</span>
            </v-btn>
          </form>
        </div>

        <div v-if="!emailSent" class="bottom-fixed-card">
          <span>
            {{ $t('forgot_password_remember') }}
            <RouterLink to="/login" class="link-btn">{{ $t('sign_in') }}</RouterLink>
          </span>
        </div>
      </div>
    </div>

    <!-- Enhanced Snackbar -->
    <transition name="snackbar">
      <div 
        v-if="showSnackbar" 
        :class="['snackbar', snackbarType === 'success' ? 'snackbar-success' : 'snackbar-error']" 
        @click="closeSnackbar"
        ref="snackbarElement"
      >
        <div class="snackbar-content">
          <font-awesome-icon 
            :icon="snackbarType === 'success' ? ['fas', 'check-circle'] : ['fas', 'triangle-exclamation']" 
            class="snackbar-icon" 
          />
          <span class="snackbar-message">{{ snackbarMessage }}</span>
        </div>
        <div class="snackbar-progress"></div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faEnvelope,
  faTriangleExclamation,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons'

library.add(faEnvelope, faTriangleExclamation, faCheckCircle)

import { storeToRefs } from 'pinia'
import { api } from '@/composables/api'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { gsap } from 'gsap'
import { makeLink } from '@/utils/linkUtils'

const router = useRouter()
const { t } = useI18n()
const email = ref('')
const submitted = ref(false)
const resetError = ref('')
const isResetting = ref(false)
const emailSent = ref(false)
const skyTriangle = ref(null)
const blueBar = ref(null)
const redBar = ref(null)
const greenTriangle = ref(null)
const orangeCircle = ref(null)
const pinkHexagon = ref(null)
const tealDiamond = ref(null)
const resetButton = ref(null)
const snackbarElement = ref(null)

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarType = ref('error') // 'success' or 'error'
let snackbarTimeout = null

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const emailError = computed(() => {
  const val = email.value.trim()
  if (!val) return t('email_required')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(val)) return t('email_invalid')
  return ''
})

const appName = computed(() => {
  return settingsStore.loaded ? (settingsStore.settings.storename || settingsStore.settings.name || 'DashCole') : 'dashcole'
})

// Button rejection animation
const animateButtonRejection = () => {
  if (!resetButton.value) return
  
  const button = resetButton.value.$el || resetButton.value
  const originalBackground = '#1e3a8a'
  
  const tl = gsap.timeline()
  
  tl.to(button, {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
    scale: 0.97,
    duration: 0.1,
    ease: 'power2.out'
  })
  .to(button, {
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
    scale: 0.94,
    duration: 0.1,
    ease: 'power2.out'
  })
  .to(button, {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
    scale: 0.97,
    duration: 0.1,
    ease: 'power2.out'
  })
  .to(button, {
    background: originalBackground,
    scale: 1,
    duration: 0.4,
    ease: 'elastic.out(1, 0.5)'
  })
}

// Shape spinning animations - DESACTIVADO (formas estáticas como en login)
// let shapeSpinningTimeline = null

// const startShapeSpinning = () => {
//   if (shapeSpinningTimeline) return
//   
//   const shapes = [
//     blueBar.value,
//     redBar.value,
//     greenTriangle.value,
//     skyTriangle.value,
//     orangeCircle.value,
//     pinkHexagon.value,
//     tealDiamond.value
//   ].filter(Boolean)
//   
//   shapeSpinningTimeline = gsap.timeline({ repeat: -1 })
//   
//   shapes.forEach((shape, index) => {
//     shapeSpinningTimeline.to(shape, {
//       rotation: 360,
//       duration: 2 + (index * 0.2),
//       ease: 'none'
//     }, 0)
//   })
// }

// const stopShapeSpinning = () => {
//   if (shapeSpinningTimeline) {
//     shapeSpinningTimeline.kill()
//     shapeSpinningTimeline = null
//   }
// }

function closeSnackbar() {
  if (snackbarElement.value) {
    gsap.to(snackbarElement.value, {
      x: '100%',
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        showSnackbar.value = false
        snackbarMessage.value = ''
      }
    })
  } else {
    showSnackbar.value = false
    snackbarMessage.value = ''
  }
  if (snackbarTimeout) clearTimeout(snackbarTimeout)
}

function showSnackbarWithAnimation(message, type = 'error') {
  snackbarMessage.value = message
  snackbarType.value = type
  showSnackbar.value = true
  
  nextTick(() => {
    if (snackbarElement.value) {
      gsap.fromTo(snackbarElement.value, 
        {
          x: '100%',
          opacity: 0,
          scale: 0.9
        },
        {
          x: '0%',
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.2)'
        }
      )
    }
  })
}

async function resetPassword() {
  if (isResetting.value) return
  
  submitted.value = true
  resetError.value = ''
  showSnackbar.value = false
  
  if (emailError.value) {
    animateButtonRejection()
    return
  }

  isResetting.value = true
  try {
    const response = await api.requestPasswordReset(email.value)
    
    if (response.success) {
      emailSent.value = true
      showSnackbarWithAnimation(t('forgot_password_reset_success'), 'success')
      
      if (snackbarTimeout) clearTimeout(snackbarTimeout)
      snackbarTimeout = setTimeout(() => {
        closeSnackbar()
      }, 5000)
    } else {
      throw new Error(response.message || t('forgot_password_reset_error'))
    }
  } catch (err) {
    // stopShapeSpinning() // DESACTIVADO - formas estáticas
    
    const apiMessage = err?.message || err?.response?.data?.error || t('forgot_password_reset_error')
    resetError.value = apiMessage
    
    animateButtonRejection()
    
    showSnackbarWithAnimation(resetError.value, 'error')
    
    if (snackbarTimeout) clearTimeout(snackbarTimeout)
    snackbarTimeout = setTimeout(() => {
      closeSnackbar()
      resetError.value = ''
    }, 7000)
  } finally {
    isResetting.value = false
  }
}

onMounted(() => {
  settingsStore.fetchSettings({ nojwt: true }).then(() => {
    console.log('Settings loaded successfully')
  }).catch((error) => {
    console.error('Failed to load settings:', error)
  })
})
</script>

<style scoped src="@/assets/auth-common.css"></style>
<style scoped>
/* Main wrapper with light gradient background */
.login-wrapper {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);
  overflow: hidden;
}

/* Fixed background decorative shapes */
.bg-bar {
  position: fixed;
  width: 800px;
  height: 200px;
  transform: rotate(45deg);
  opacity: 0.25;
  border-radius: 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,.18), 0 6px 18px rgba(0,0,0,.12);
}

.bg-bar::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.15) 0 1px, rgba(0,0,0,.04) 1px 2px);
  opacity: .06;
  mix-blend-mode: overlay;
  pointer-events: none;
  animation: moireShift 18s linear infinite;
}

.bg-triangle {
  position: fixed;
  width: 0;
  height: 0;
  opacity: 0.18;
  filter: drop-shadow(0 18px 28px rgba(0,0,0,.18)) drop-shadow(0 6px 12px rgba(0,0,0,.12));
}

.bg-triangle::after {
  content: '';
  position: absolute;
  left: -10px;
  top: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.25), rgba(0,0,0,.08) 70%, transparent 72%);
  opacity: .06;
  animation: moirePulse 6s ease-in-out infinite;
}

.bg-hexagon {
  position: fixed;
  width: 280px;
  height: 280px;
  transform: rotate(15deg);
  opacity: 0.16;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 18px 40px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.35);
}

.bg-hexagon::after,
.bg-diamond::after,
.bg-circle::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: inherit;
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,.18) 0 1px, rgba(0,0,0,.05) 1px 2px),
    repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 1px, rgba(0,0,0,.04) 1px 2px);
  opacity: .06;
  mix-blend-mode: overlay;
  pointer-events: none;
  /* animation: moireShift 20s linear infinite; */
}

.bg-diamond {
  position: fixed;
  width: 260px;
  height: 260px;
  transform: rotate(45deg);
  opacity: 0.19;
  box-shadow: 0 18px 36px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.35);
}

.bg-circle {
  position: fixed;
  width: 250px;
  height: 250px;
  opacity: 0.22;
  border-radius: 50%;
  box-shadow: 0 22px 48px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.35);
}

.bg-bar, .bg-triangle, .bg-hexagon, .bg-diamond, .bg-circle {
  will-change: transform, opacity;
  /* animation: floatMicro 14s ease-in-out infinite alternate; */
  transform-origin: center center;
}

@keyframes moireShift {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 160px 0, 0 160px; }
}

@keyframes moirePulse {
  0%,100% { transform: scale(1); opacity: .06; }
  50% { transform: scale(1.08); opacity: .1; }
}

@keyframes floatMicro {
  0%   { transform: translate3d(0, 0px, 0); }
  100% { transform: translate3d(0, 4px, 0); }
}

.blue-bar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: 3vh;
  right: 1%;
  width: 300px;
}

.red-bar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  bottom: 3vh;
  right: 35%;
  width: 300px;
}

.green-triangle {
  border-left: 65px solid transparent;
  border-right: 65px solid transparent;
  border-bottom: 113px solid #22c55e;
  bottom: 8vh;
  right: 20%;
  opacity: 0.25;
}

.sky-triangle {
  border-left: 65px solid transparent;
  border-right: 65px solid transparent;
  border-top: 113px solid #0ea5e9;
  top: 65vh;
  left: 15%;
  opacity: 0.25;
}

.pink-hexagon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  top: 35vh;
  right: 10%;
  opacity: 0.23;
}

.teal-diamond {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  top: 8vh;
  right: 70%;
  opacity: 0.24;
}

.orange-circle {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  bottom: 25%;
  left: -80px;
  transform: translateY(50%);
  opacity: 0.30;
}

@media (max-width: 768px) {
  .login-wrapper {
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .bg-bar {
    width: 600px;
    height: 150px;
  }
  
  .bg-triangle {
    opacity: 0.15;
  }
  
  .bg-hexagon {
    width: 200px;
    height: 200px;
  }
  
  .bg-diamond {
    width: 180px;
    height: 180px;
  }
  
  .bg-circle {
    width: 180px;
    height: 180px;
  }
  
  .blue-bar {
    top: 25vh;
    left: 300px;
  }
  
  .red-bar {
    bottom: 20vh;
    right: 250px;
  }
  
  .green-triangle {
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-bottom: 138px solid #10b981;
    top: 78vh;
    right: 60px;
  }
  
  .sky-triangle {
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-top: 138px solid #0369a1;
    bottom: 78vh;
    left: 300px;
  }
  
  .pink-hexagon {
    top: 25vh;
    left: calc(50% + 150px);
  }
  
  .teal-diamond {
    bottom: 20vh;
    left: calc(50% - 380px);
  }
  
  .orange-circle {
    right: 60px;
  }
}

@media (max-width: 480px) {
  .bg-bar,
  .bg-triangle,
  .bg-hexagon,
  .bg-diamond,
  .bg-circle {
    display: none;
  }

  .bg-bar {
    width: 400px;
    height: 100px;
  }
  
  .bg-triangle {
    opacity: 0.12;
  }
  
  .bg-hexagon {
    width: 150px;
    height: 150px;
  }
  
  .bg-diamond {
    width: 130px;
    height: 130px;
  }
  
  .bg-circle {
    width: 120px;
    height: 120px;
  }
  
  .blue-bar {
    top: 30vh;
    left: 250px;
  }
  
  .red-bar {
    bottom: 25vh;
    right: 180px;
  }
  
  .green-triangle {
    border-left: 60px solid transparent;
    border-right: 60px solid transparent;
    border-bottom: 104px solid #10b981;
    top: 80vh;
    right: 40px;
  }
  
  .sky-triangle {
    border-left: 60px solid transparent;
    border-right: 60px solid transparent;
    border-top: 104px solid #0369a1;
    bottom: 80vh;
    left: 250px;
  }
  
  .pink-hexagon {
    top: 30vh;
    left: calc(50% + 100px);
  }
  
  .teal-diamond {
    bottom: 25vh;
    left: calc(50% - 280px);
  }
  
  .orange-circle {
    right: 40px;
  }
}

/* Enhanced snackbar with cool animations */
.snackbar {
  position: fixed !important;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 16px;
  box-shadow: 
    0 20px 40px rgba(239, 68, 68, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  z-index: 9999;
  font-weight: 500;
  font-size: 0.9rem;
  max-width: 400px;
  min-width: 300px;
  cursor: pointer;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.snackbar:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 25px 50px rgba(239, 68, 68, 0.5),
    0 15px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.snackbar.snackbar-info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
  box-shadow: 
    0 20px 40px rgba(59, 130, 246, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.snackbar.snackbar-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  box-shadow: 
    0 20px 40px rgba(239, 68, 68, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.snackbar.snackbar-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  box-shadow: 
    0 20px 40px rgba(16, 185, 129, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.snackbar.snackbar-success:hover {
  box-shadow: 
    0 25px 50px rgba(16, 185, 129, 0.5),
    0 15px 30px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.snackbar-icon {
  font-size: 1.2rem;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.snackbar-message {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.01em;
}

.snackbar-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  width: 100%;
  animation: progressBar 7s linear forwards;
  transform-origin: left;
}

@keyframes progressBar {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.snackbar-enter-active,
.snackbar-leave-active {
  transition: all 0.3s ease;
}

.snackbar-enter-from {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.snackbar-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

@media (max-width: 600px) {
  .snackbar {
    bottom: 1.2rem;
    right: 1.2rem;
    left: auto;
    min-width: auto;
    max-width: calc(100% - 2.4rem);
  }
  
  .snackbar-enter-from {
    transform: translateX(100%) scale(0.9);
  }
  
  .snackbar-leave-to {
    transform: translateX(100%) scale(0.9);
  }
}

.login-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-inner {
  position: relative;
  z-index: 2;
}

.login-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  transform: translateY(-2vh);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #000000;
  font-size: 1rem;
  z-index: 5;
  pointer-events: none;
}

input[type="email"], input[type="password"], input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  border-radius: 8px;
  border: none;
  background: #f1f3f4;
  color: #000000;
  transition: background-color 0.2s ease, color 0.2s ease;
  font-family: var(--font-family-sohne);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

input[type="email"]:focus, input[type="password"]:focus, input[type="text"]:focus {
  outline: none !important;
  border: none !important;
  background: #f1f3f4;
  color: #000000;
  box-shadow: none !important;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  font-family: var(--font-family-sohne);
}

input[type="email"]:focus-visible,
input[type="password"]:focus-visible,
input[type="text"]:focus-visible {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

input.invalid-input {
  border: none;
  background: #fef2f2;
}

input.invalid-input:focus {
  border: none !important;
  box-shadow: none !important;
}

.input-with-icon {
  padding-left: 2.5rem !important;
  color: #000000 !important;
  background: #f1f3f4 !important;
  border: none !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-weight: 400 !important;
  font-family: var(--font-family-sohne) !important;
}

.input-with-icon:focus {
  border: none !important;
  background: #f1f3f4 !important;
  color: #000000 !important;
  box-shadow: none !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-weight: 400 !important;
  font-family: var(--font-family-sohne) !important;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #f1f3f4 inset !important;
  box-shadow: 0 0 0 1000px #f1f3f4 inset !important;
  -webkit-text-fill-color: #000000 !important;
  caret-color: #000000 !important;
  border: none !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-family: var(--font-family-sohne) !important;
}

.email-field {
  margin-bottom: 1.5rem;
}

.email-field label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
  font-family: var(--font-family-sohne);
}

.input-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-family: var(--font-family-sohne);
}

/* Logo container matching Header structure */
.auth-logo-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  z-index: 10;
}

.nav-logo {
  position: absolute;
  left: 0;
  top: 0;
  height: 64px;
  display: flex;
  align-items: center;
}

.nav-logo .logo-link {
  text-decoration: none;
  color: inherit;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  line-height: 1;
}

.logo-image {
  height: 32px;
  width: auto;
  display: block;
  object-fit: contain;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-link:hover .logo-image {
  filter: drop-shadow(0 4px 10px rgba(59, 130, 246, 0.18));
}

.logo-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  image-rendering: auto;
  display: block;
  flex-shrink: 0;
  transition: filter 0.2s ease;
}

.logo-link:hover .logo-icon {
  filter: drop-shadow(0 4px 10px rgba(59, 130, 246, 0.18));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.logo-link:hover .logo-text {
  color: #3b82f6;
}

.welcome {
  text-align: center;
  width: 100%;
  font-size: 1.3em !important;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.signin-button {
  background: #1e3a8a !important;
  color: #ffffff !important;
  border-radius: 10px !important;
  height: 50px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;
  text-transform: none !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.28) !important;
  transition: all 0.3s ease !important;
}

.signin-button :deep(.v-btn__content),
.signin-button :deep(.v-btn__content *),
.signin-button :deep(span),
.signin-button :deep(.signin-text) {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.signin-button:hover {
  background: #1e40af !important;
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.32) !important;
  transform: none !important;
}

.signin-button:hover :deep(.v-btn__content),
.signin-button:hover :deep(.v-btn__content *),
.signin-button:hover :deep(span),
.signin-button:hover :deep(.signin-text) {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.signin-button:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.26) !important;
}

.signin-text {
  font-family: var(--font-family-sohne);
  font-size: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  color: #ffffff !important;
}

.signin-button:hover :deep(.signin-text),
.signin-button:focus :deep(.signin-text),
.signin-button:active :deep(.signin-text) {
  font-size: 16px !important;
  font-weight: 700 !important;
}

.signin-button.v-btn--disabled {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%) !important;
  box-shadow: none !important;
  transform: none !important;
}

.bottom-fixed-card {
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  font-size: 0.9rem;
  color: #6b7280;
  font-family: var(--font-family-sohne);
}

.bottom-fixed-card .link-btn {
  color: #2563eb;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.bottom-fixed-card .link-btn:hover {
  color: #1d4ed8;
  text-decoration: none;
}

.bottom-fixed-card .link-btn:focus,
.bottom-fixed-card .link-btn:active {
  color: #1d4ed8;
  text-decoration: none;
  font-size: 0.9rem;
}

.sent-message {
  text-align: center;
  padding: 2rem 1rem;
  margin: 1.5rem 0;
}

.sent-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.sent-icon {
  font-size: 4rem;
  color: #10b981;
  display: block;
  animation: checkmarkPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
}

@keyframes checkmarkPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.sent-title {
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-family-sohne);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.sent-text {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 400;
  font-family: var(--font-family-sohne);
  margin: 0;
  line-height: 1.6;
}
</style>
