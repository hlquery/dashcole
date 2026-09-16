
<!--
 * User Login View
 *
 * Authentication form with email/password input, password visibility toggle,
 * and form validation. Handles user authentication flow
 * and redirects to appropriate dashboard or requested route after login.
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

    <div class="login-content">

      <div class="login-card">
        <div class="card-inner">
          <h1 class="welcome font-sohne">{{ $t('welcome') }}</h1>

          <!-- Removed inline error message -->

          <form v-if="!schoolChoices.length" @submit.prevent="login">
            <div class="email-field">
              <label for="email">Usuario o correo</label>
              <div class="input-container">
                <font-awesome-icon
                  :icon="['fas', 'envelope']"
                  class="input-icon"
                />
                <input
                  id="email"
                  type="text"
                  v-model="email"
                  :class="{ 'invalid-input': submitted && emailError, 'input-with-icon': true }"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                />
              </div>
              <p v-if="submitted && emailError" class="input-error">{{ emailError }}</p>
            </div>

            <div class="password-field">
              <label for="password">{{ $t('password') }}</label>
              <div class="input-container">
                <font-awesome-icon
                  :icon="['fas', 'lock']"
                  class="input-icon"
                />
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  :class="{ 'invalid-input': submitted && passwordError, 'input-with-icon': true, 'password-input': true }"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  tabindex="-1"
                >
                  <font-awesome-icon
                    :icon="showPassword ? ['fas', 'eye-slash'] : ['fas', 'eye']"
                    class="toggle-icon"
                  />
                </button>
              </div>
              <p v-if="submitted && passwordError" class="input-error">{{ passwordError }}</p>
            </div>

            <div class="options-row">
              <div class="remember-row">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="remember" />
                  <span class="remember-text">{{ $t('remember_me') }}</span>
                </label>
              </div>
              <RouterLink to="/forgot" class="forgot-password-link">
                {{ $t('forgot_password') }}
              </RouterLink>
            </div>

            <v-btn 
              color="primary" 
              type="submit" 
              size="large"
              block
              :disabled="isLoggingIn"
              :aria-busy="isLoggingIn ? 'true' : 'false'"
              ref="signinButton"
              class="mt-4 signin-button"
              :class="{ 'signin-button--loading': isLoggingIn }"
              elevation="2"
            >
              <span class="signin-text" v-if="!isLoggingIn">{{ $t('sign_in') }}</span>
              <span class="loading-dots" v-else>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </v-btn>
          </form>

          <div v-else class="school-choice-panel">
            <p class="school-choice-copy">{{ schoolChoiceMessage || 'Elige el colegio al que quieres ingresar.' }}</p>
            <button
              v-for="item in schoolChoices"
              :key="item.schoolId"
              type="button"
              class="school-choice-btn"
              :disabled="isLoggingIn || item.available === false"
              @click="chooseSchool(item.schoolId)"
            >
              <strong>{{ item.school?.name || `Colegio #${item.schoolId}` }}</strong>
              <small>{{ item.readOnly ? 'Solo historial' : (item.role || 'Cuenta') }}</small>
            </button>
            <button type="button" class="school-choice-back" :disabled="isLoggingIn" @click="clearSchoolChoice">Volver</button>
          </div>
        </div>

        <div class="bottom-fixed-card">
          <span>
            {{ $t('new_to', { brand: appName }) }}
            <RouterLink to="/contact" class="link-btn">{{ $t('create_account') }}</RouterLink>
          </span>
        </div>
      </div>
    </div>

    <!-- Custom Snackbar -->
    <div 
      v-if="showSnackbar" 
      class="custom-snackbar"
      :class="`snackbar-${snackbarColor}`"
    >
      <div class="snackbar-inner">
        <button class="snackbar-close" @click="showSnackbar = false" :aria-label="$t('close')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <span class="snackbar-text">{{ snackbarMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
library.add(faCircleCheck)
import {
  faExclamationTriangle,
  faEye, 
  faEyeSlash,
  faEnvelope,
  faLock,
  faSearch,
  faTimes,
  faSpinner
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faExclamationTriangle,
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faSearch,
  faTimes,
  faSpinner
)
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { api } from '@/composables/api'
import { redirectToDashboard } from '@/utils/authHandoff'
import { gsap } from 'gsap'
const { t } = useI18n()
const email = ref('')
const password = ref('')
const remember = ref(false)
const submitted = ref(false)
const loginError = ref('')
const isLoggingIn = ref(false)
const skyTriangle = ref(null)
const blueBar = ref(null)
const redBar = ref(null)
const greenTriangle = ref(null)
const orangeCircle = ref(null)
const pinkHexagon = ref(null)
const tealDiamond = ref(null)
const signinButton = ref(null)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('error') // 'success' or 'error'
const snackbarTimeout = ref(5000) // 5 seconds default
let snackbarTimer = null

// Auto-hide snackbar after 5 seconds
watch(showSnackbar, (newValue) => {
  if (newValue) {
    // Clear any existing timer
    if (snackbarTimer) {
      clearTimeout(snackbarTimer)
    }
    // Set new timer for 5 seconds
    snackbarTimer = setTimeout(() => {
      showSnackbar.value = false
    }, 5000)
  } else {
    // Clear timer if snackbar is manually closed
    if (snackbarTimer) {
      clearTimeout(snackbarTimer)
      snackbarTimer = null
    }
  }
})

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const emailError = computed(() => {
  const val = email.value.trim()
  if (!val) return t('email_required')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/
  if (!emailRegex.test(val) && !usernameRegex.test(val)) return 'Ingresa un usuario o correo válido'
  return ''
})

const passwordError = computed(() => {
  const val = password.value.trim()
  if (!val) return t('password_required')
  if (val.length < 4) return t('password_min')
  return ''
})

// Computed properties for settings to ensure reactivity
const appName = computed(() => {
  return settingsStore.loaded ? (settingsStore.settings.storename || settingsStore.settings.name || 'DashCole') : 'dashcole'
})

const storeName = computed(() => {
  return settingsStore.loaded ? (settingsStore.settings.storename || 'App') : 'App'
})

const baseDomain = computed(() => {
  return settingsStore.settings.base_domain || window.location.hostname
})

const showPassword = ref(false)


// Button rejection animation
const animateButtonRejection = () => {
  if (!signinButton.value) return
  
  const button = signinButton.value.$el || signinButton.value
  const originalBackground = '#1e3a8a'
  
  // Create a timeline for the rejection effect
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

// Shape spinning animations
let shapeSpinningTimeline = null

const startShapeSpinning = () => {
  if (shapeSpinningTimeline) return // Already spinning
  
  const shapes = [
    blueBar.value,
    redBar.value,
    greenTriangle.value,
    skyTriangle.value,
    orangeCircle.value,
    pinkHexagon.value,
    tealDiamond.value
  ].filter(Boolean)
  
  shapeSpinningTimeline = gsap.timeline({ repeat: -1 })
  
  shapes.forEach((shape, index) => {
    shapeSpinningTimeline.to(shape, {
      rotation: 360,
      duration: 2 + (index * 0.2), // Slightly different speeds
      ease: 'none'
    }, 0) // Start all at the same time
  })
}

const stopShapeSpinning = () => {
  if (shapeSpinningTimeline) {
    shapeSpinningTimeline.kill()
    shapeSpinningTimeline = null
  }
}

const startFastShapeSpinning = () => {
  if (shapeSpinningTimeline) {
    shapeSpinningTimeline.kill()
  }
  
  const shapes = [
    blueBar.value,
    redBar.value,
    greenTriangle.value,
    skyTriangle.value,
    orangeCircle.value,
    pinkHexagon.value,
    tealDiamond.value
  ].filter(Boolean)
  
  shapeSpinningTimeline = gsap.timeline({ repeat: -1 })
  
  shapes.forEach((shape, index) => {
    shapeSpinningTimeline.to(shape, {
      rotation: 360,
      duration: 0.5 + (index * 0.05), // Much faster spinning
      ease: 'none'
    }, 0)
  })
}

function showSnackbarMessage(message, type = 'error', timeout = 5000) {
  snackbarMessage.value = message || t('auth_generic_error')
  snackbarColor.value = type === 'success' ? 'success' : 'error'
  snackbarTimeout.value = timeout
  showSnackbar.value = true
}

const schoolChoices = ref([])
const schoolChoiceMessage = ref('')
const selectedTenantId = ref(null)

function clearSchoolChoice() {
  schoolChoices.value = []
  schoolChoiceMessage.value = ''
  selectedTenantId.value = null
}

async function chooseSchool(schoolId) {
  selectedTenantId.value = Number(schoolId)
  await login()
}

async function login() {
  if (isLoggingIn.value) return
  submitted.value = true
  loginError.value = ''

  if (!selectedTenantId.value && (emailError.value || passwordError.value)) {
    animateButtonRejection()
    showSnackbarMessage(t('login_invalid_credentials_input'), 'error', 5000)
    return
  }

  isLoggingIn.value = true
  try {
    const loginData = await api.performLogin(email.value, password.value, selectedTenantId.value)
    if (loginData?.needsSchoolChoice) {
      schoolChoices.value = (loginData.memberships || []).filter((row) => row.available !== false)
      schoolChoiceMessage.value = loginData.message || 'Elige el colegio al que quieres ingresar.'
      if (!schoolChoices.value.length) throw new Error('No hay colegios disponibles para esta cuenta.')
      return
    }
    if (!loginData?.login?.token || !loginData?.login?.user) {
      throw new Error(t('login_invalid_server_response'))
    }
    clearSchoolChoice()

    if (remember.value) {
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('rememberedEmail', email.value)
      localStorage.setItem('rememberedPassword', password.value)
    } else {
      localStorage.setItem('rememberMe', 'false')
      api.clearStoredCredentials()
    }

    api.storeTokenExpiration(loginData.login.token)
    api.startTokenCheck()
    await authStore.setAuth(loginData.login.user, loginData.login.token, loginData.server)

    redirectToDashboard()
  } catch (error) {
    animateButtonRejection()
    const message = error?.message || t('login_failed')
    loginError.value = message
    showSnackbarMessage(message, 'error', 5000)
  } finally {
    isLoggingIn.value = false
  }
}

onMounted(() => {
  // Background shapes are now static - no animations needed
  
  // Restore session from localStorage if present - but only set basic state
  const token = localStorage.getItem('token')
  const storedAuthUser = localStorage.getItem('auth_user')
  if (token && storedAuthUser && !authStore.isAuthenticated) {
    try {
      const userData = JSON.parse(storedAuthUser)
      // Only set auth if we have valid user data
      if (userData && userData.email) {
        authStore.setAuth(userData, token)
        
        // Restore admin flags from localStorage
        const storedRootFlags = localStorage.getItem('admin_root_flags')
        const storedCanManage = localStorage.getItem('admin_can_manage')
        if (storedRootFlags === 'true' && !authStore.root_flags) {
          authStore.setRootFlags(true)
        }
        if (storedCanManage === 'true' && !authStore.can_manage) {
          authStore.setCanManage(true)
        }
      }
    } catch (e) {
      // Clear corrupted data
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token')
    }
  }
  
  // Prefill email, password and remember from localStorage if available
  const remembered = localStorage.getItem('rememberMe') === 'true'
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  const rememberedPassword = localStorage.getItem('rememberedPassword')
  if (remembered && rememberedEmail) {
    email.value = rememberedEmail
    remember.value = true
    if (rememberedPassword) {
      password.value = rememberedPassword
    }
  }

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
  box-shadow: 
    0 22px 55px rgba(0,0,0,.22), 
    0 8px 22px rgba(0,0,0,.15),
    0 3px 10px rgba(0,0,0,.12),
    0 0 0 1px rgba(0,0,0,.06),
    inset 0 2px 5px rgba(255,255,255,.12),
    inset 0 -2px 5px rgba(0,0,0,.1);
}

/* Subtle moir? overlay for bars */
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
  /* animation: moireShift 18s linear infinite; */
}

.bg-triangle {
  position: fixed;
  width: 0;
  height: 0;
  opacity: 0.18;
  filter: drop-shadow(0 20px 35px rgba(0,0,0,.22)) drop-shadow(0 8px 15px rgba(0,0,0,.15)) drop-shadow(0 3px 6px rgba(0,0,0,.12));
}

/* Moir? ring accent on triangle tips */
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
  /* animation: moirePulse 6s ease-in-out infinite; */
}

.bg-hexagon {
  position: fixed;
  width: 280px;
  height: 280px;
  transform: rotate(15deg);
  opacity: 0.16;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 
    0 20px 45px rgba(0,0,0,.2), 
    0 10px 24px rgba(0,0,0,.15),
    0 4px 10px rgba(0,0,0,.12),
    inset 0 2px 5px rgba(255,255,255,.38),
    inset 0 -2px 5px rgba(0,0,0,.12);
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
  box-shadow: 
    0 20px 42px rgba(0,0,0,.2), 
    0 10px 22px rgba(0,0,0,.15),
    0 4px 10px rgba(0,0,0,.12),
    inset 0 2px 5px rgba(255,255,255,.38),
    inset 0 -2px 5px rgba(0,0,0,.12);
}

.bg-circle {
  position: fixed;
  width: 250px;
  height: 250px;
  opacity: 0.22;
  border-radius: 50%;
  box-shadow: 
    0 24px 52px rgba(0,0,0,.2), 
    0 12px 28px rgba(0,0,0,.15),
    0 5px 12px rgba(0,0,0,.12),
    inset 0 2px 6px rgba(255,255,255,.38),
    inset 0 -2px 6px rgba(0,0,0,.12);
}

/* Gentle float to avoid static look */
.bg-bar, .bg-triangle, .bg-hexagon, .bg-diamond, .bg-circle {
  will-change: transform, opacity, box-shadow, filter;
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

/* Animaci?n 3D con efectos de profundidad visual */
@keyframes floatMicro3D {
  0% { 
    transform: translate3d(0, 0px, 0);
  }
  100% { 
    transform: translate3d(0, 4px, 0);
  }
}

/* Animaci?n de profundidad para tri?ngulos (usan filter) - DESACTIVADA */

@keyframes depth3DTriangle {
  0% { 
    filter: drop-shadow(0 20px 35px rgba(0,0,0,.22)) drop-shadow(0 8px 15px rgba(0,0,0,.15)) drop-shadow(0 3px 6px rgba(0,0,0,.12));
  }
  100% { 
    filter: drop-shadow(0 20px 35px rgba(0,0,0,.22)) drop-shadow(0 8px 15px rgba(0,0,0,.15)) drop-shadow(0 3px 6px rgba(0,0,0,.12));
  }
}

/* Animaci?n de profundidad para formas con box-shadow - DESACTIVADA */

@keyframes depth3DBar {
  0% { 
    box-shadow: 
      0 22px 55px rgba(0,0,0,.22), 
      0 8px 22px rgba(0,0,0,.15),
      0 3px 10px rgba(0,0,0,.12),
      0 0 0 1px rgba(0,0,0,.06),
      inset 0 2px 5px rgba(255,255,255,.12),
      inset 0 -2px 5px rgba(0,0,0,.1);
  }
  100% { 
    box-shadow: 
      0 22px 55px rgba(0,0,0,.22), 
      0 8px 22px rgba(0,0,0,.15),
      0 3px 10px rgba(0,0,0,.12),
      0 0 0 1px rgba(0,0,0,.06),
      inset 0 2px 5px rgba(255,255,255,.12),
      inset 0 -2px 5px rgba(0,0,0,.1);
  }
}

@keyframes depth3DHexagon {
  0% { 
    box-shadow: 
      0 20px 45px rgba(0,0,0,.2), 
      0 10px 24px rgba(0,0,0,.15),
      0 4px 10px rgba(0,0,0,.12),
      inset 0 2px 5px rgba(255,255,255,.38),
      inset 0 -2px 5px rgba(0,0,0,.12);
  }
  100% { 
    box-shadow: 
      0 20px 45px rgba(0,0,0,.2), 
      0 10px 24px rgba(0,0,0,.15),
      0 4px 10px rgba(0,0,0,.12),
      inset 0 2px 5px rgba(255,255,255,.38),
      inset 0 -2px 5px rgba(0,0,0,.12);
  }
}

@keyframes depth3DDiamond {
  0% { 
    box-shadow: 
      0 20px 42px rgba(0,0,0,.2), 
      0 10px 22px rgba(0,0,0,.15),
      0 4px 10px rgba(0,0,0,.12),
      inset 0 2px 5px rgba(255,255,255,.38),
      inset 0 -2px 5px rgba(0,0,0,.12);
  }
  100% { 
    box-shadow: 
      0 20px 42px rgba(0,0,0,.2), 
      0 10px 22px rgba(0,0,0,.15),
      0 4px 10px rgba(0,0,0,.12),
      inset 0 2px 5px rgba(255,255,255,.38),
      inset 0 -2px 5px rgba(0,0,0,.12);
  }
}

@keyframes depth3DCircle {
  0% { 
    box-shadow: 
      0 24px 52px rgba(0,0,0,.2), 
      0 12px 28px rgba(0,0,0,.15),
      0 5px 12px rgba(0,0,0,.12),
      inset 0 2px 6px rgba(255,255,255,.38),
      inset 0 -2px 6px rgba(0,0,0,.12);
  }
  100% { 
    box-shadow: 
      0 24px 52px rgba(0,0,0,.2), 
      0 12px 28px rgba(0,0,0,.15),
      0 5px 12px rgba(0,0,0,.12),
      inset 0 2px 6px rgba(255,255,255,.38),
      inset 0 -2px 6px rgba(0,0,0,.12);
  }
}

.blue-bar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: 3vh;
  right: 1%;
  width: 300px;
}

.red-bar {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
  background: linear-gradient(135deg, #db2777 0%, #be185d 100%);
  top: 35vh;
  right: 10%;
  opacity: 0.33;
}

.teal-diamond {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  top: 8vh;
  right: 70%;
  opacity: 0.24;
}

.orange-circle {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  bottom: 25%;
  left: -80px;
  transform: translateY(50%);
  opacity: 0.40;
}

@media (max-width: 768px) {
  .login-wrapper {
    height: auto;
    min-height: 100vh;
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
    border-bottom: 138px solid #059669;
    top: 78vh;
    right: 60px;
  }
  
  .sky-triangle {
    border-left: 80px solid transparent;
    border-right: 80px solid transparent;
    border-top: 138px solid #0ea5e9;
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
    opacity: 0.22;
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
    border-bottom: 104px solid #059669;
    top: 80vh;
    right: 40px;
  }
  
  .sky-triangle {
    border-left: 60px solid transparent;
    border-right: 60px solid transparent;
    border-top: 104px solid #0ea5e9;
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

.password-eye-icon {
  position: absolute;
  right: 0.5rem;
  top: 57%;
  transform: translateY(-77%);
  cursor: pointer;
  color: #c0c4cc;
  font-size: 1.2rem;
  z-index: 10;
  
  outline: none;
  border: none;
  background: transparent;
  padding: 0.2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  min-height: 1.5rem;
}

.password-eye-icon:focus {
  color: #c0c4cc;

}

.password-eye-icon:hover {
  color: #888;
}

/* Options row alignment */
.options-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 1.5rem !important;
  margin-top: 0.5rem !important;
  gap: 1rem !important;
  flex-wrap: wrap !important;
}

.remember-row {
  margin: 0 !important;
  display: flex !important;
  align-items: center !important;
}

/* Signup-like checkbox styling for alignment */
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-wrapper input[type="checkbox"] {
  margin: 0;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.remember-text {
  color: var(--color-stripe-text) !important;
  font-size: var(--font-size-base) !important;
  font-weight: var(--font-weight-normal) !important;
  margin-left: 0.25rem !important;
  line-height: 1.2 !important;
  display: inline-flex !important;
  align-items: center !important;
}

.forgot-password {
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
  
}

.forgot-password:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.forgot-password-link {
  color: #2563eb !important;
  text-decoration: none !important;
  font-weight: var(--font-weight-medium) !important;
  font-size: var(--font-size-base) !important;
  transition: color 0.2s ease !important;
  align-self: center !important;
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1.2 !important;
  margin-top: -0.5rem !important;
}

.forgot-password-link:hover {
  color: #1d4ed8 !important;
  text-decoration: none !important;
}

.forgot-password-link:focus,
.forgot-password-link:active {
  color: #1d4ed8 !important;
  text-decoration: none !important;
  font-size: var(--font-size-base) !important;
  line-height: 1.2 !important;
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

/* Enhanced card inner content */
.card-inner {
  position: relative;
  z-index: 2;
}

/* Login content positioned for better balance */
.login-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
  transform: translateY(-2vh); /* Moved up from 1vh for higher positioning */
}

/* Input container and icon styling */
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

/* Input field styling to match signup */
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
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  outline: none;
  border: none;
  box-shadow: none;
}

input.invalid-input {
  border: none;
  background: #fef2f2;
}

input.invalid-input:focus {
  border: none !important;
  box-shadow: none !important;
}

/* Password input specific styling */
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

.input-with-icon.password-input {
  padding-left: 2.5rem !important;
  padding-right: 2.75rem !important;
}

/* Password toggle button - inside input */
.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
}

.password-toggle:focus {
  outline: none;
  color: #2563eb;
}

.toggle-icon {
  pointer-events: none;
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
  gap: 0.25rem !important;
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

/* Welcome text letter animation styles */
.welcome {
  text-align: center;
  width: 100%;
  font-size: 1.125rem !important;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

/* Enhanced Sign In Button Styling */
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

/* (Removed decorative hover backdrop per request) */

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
  font-size: var(--font-size-base) !important;
  font-weight: 700 !important;
  letter-spacing: 0.5px !important;
  color: #ffffff !important;
}

.signin-button:hover :deep(.signin-text),
.signin-button:focus :deep(.signin-text),
.signin-button:active :deep(.signin-text) {
  font-size: var(--font-size-base) !important;
  font-weight: 700 !important;
}

/* Loading dots animation */
.loading-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
  display: inline-block;
  animation: loadingDot 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0;
}

@keyframes loadingDot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.signin-button.v-btn--disabled {
  background: #1e3a8a !important;
  color: #ffffff !important;
  opacity: 1 !important;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2) !important;
  transform: none !important;
}

.signin-button.v-btn--disabled :deep(.v-btn__content),
.signin-button.v-btn--disabled :deep(.v-btn__content *),
.signin-button.signin-button--loading :deep(.v-btn__content),
.signin-button.signin-button--loading :deep(.v-btn__content *) {
  color: #ffffff !important;
  opacity: 1 !important;
}

/* Icon Field Styling */
.icon-field :deep(.v-field) {
  border-width: 1px !important;
  border-color: #e5e7eb !important;
  border-radius: 8px !important;
}

.icon-field :deep(.v-field--focused) {
  border-color: #2563eb !important;
  border-width: 2px !important;
}

.icon-field :deep(.v-field__outline) {
  border-width: 1px !important;
}

.icon-field :deep(.v-field--focused .v-field__outline) {
  border-width: 2px !important;
}

.icon-field :deep(.v-field__input) {
  padding-left: 2.5rem !important;
}

.icon-field :deep(.v-field__prepend-inner) {
  color: #6b7280 !important;
  margin-left: 0.75rem !important;
}

.icon-field :deep(.v-field__append-inner) {
  color: #6b7280 !important;
  margin-right: 0.75rem !important;
}

.icon-field :deep(.v-label) {
  color: #374151 !important;
  font-weight: 500 !important;
}

.icon-field :deep(.v-field--error .v-field__outline) {
  border-color: #ef4444 !important;
}

.icon-field :deep(.v-field--error .v-field) {
  border-color: #ef4444 !important;
}

/* Remember Me Checkbox Styling */
.remember-checkbox {
  margin: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  padding: 0 !important;
  height: auto !important;
  vertical-align: middle !important;
}

.remember-checkbox :deep(.v-label) {
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1.2 !important;
  vertical-align: middle !important;
}

.remember-checkbox :deep(.v-selection-control) {
  min-height: auto !important;
  display: inline-flex !important;
  align-items: center !important;
  padding: 0 !important;
  margin: 0 !important;
  vertical-align: middle !important;
}

.remember-checkbox :deep(.v-selection-control__input) {
  margin-right: 0.5rem !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
  margin-bottom: 0 !important;
  margin-top: 0 !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__wrapper) {
  color: #2563eb !important;
  display: inline-flex !important;
  align-items: center !important;
  height: auto !important;
  min-height: auto !important;
  vertical-align: middle !important;
  margin: 0 !important;
  padding: 0 !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input) {
  color: #2563eb !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input .v-icon) {
  color: #2563eb !important;
  font-size: 16px !important;
  width: 16px !important;
  height: 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  visibility: visible !important;
  vertical-align: middle !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input .v-icon--checkbox) {
  color: #2563eb !important;
  display: block !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input .v-icon--checkbox-on) {
  color: #2563eb !important;
  display: block !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input .v-icon--checkbox-off) {
  color: #6b7280 !important;
  display: block !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input .v-icon--checkbox-indeterminate) {
  color: #2563eb !important;
  display: block !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-selection-control__wrapper) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-selection-control__input) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__input) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

.remember-checkbox :deep(.v-checkbox .v-selection-control__wrapper) {
  opacity: 1 !important;
  display: flex !important;
  visibility: visible !important;
}

/* Add visible checkbox border/background */
.remember-checkbox :deep(.v-selection-control__input) {
  border: 2px solid #d1d5db !important;
  border-radius: 4px !important;
  background-color: white !important;
}

.remember-checkbox :deep(.v-selection-control__input[aria-checked="true"]) {
  border-color: #2563eb !important;
  background-color: #2563eb !important;
}

/* Focus states */
.remember-checkbox :deep(.v-checkbox .v-selection-control__input:focus) {
  outline: 2px solid #2563eb !important;
  outline-offset: 2px !important;
}

/* Hover states */
.remember-checkbox :deep(.v-checkbox:hover .v-selection-control__input .v-icon) {
  color: #1d4ed8 !important;
}

/* Custom Snackbar Styling */
.custom-snackbar {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 99999;
  min-width: 280px;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease-out;
  overflow: hidden;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.snackbar-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.snackbar-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.snackbar-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
}

.snackbar-text {
  color: white;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-base);
  flex: 1;
  font-family: var(--font-family-sohne);
}

.snackbar-close {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  padding: 0;
  margin-right: 0;
}

.snackbar-close:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.snackbar-close:active {
  transform: scale(0.95);
}

.snackbar-close svg {
  width: 14px;
  height: 14px;
}

/* Email and Password labels bold */
.email-field label,
.password-field label {
  font-weight: 700 !important;
}

/* Create account link bold and blue */
.bottom-fixed-card .link-btn {
  font-weight: 700 !important;
  color: #2563eb !important;
}

.bottom-fixed-card .link-btn:hover {
  color: #1d4ed8 !important;
  font-size: var(--font-size-base) !important;
}

.bottom-fixed-card .link-btn:focus,
.bottom-fixed-card .link-btn:active {
  color: #1d4ed8 !important;
  font-size: var(--font-size-base) !important;
  text-decoration: none !important;
}

/* Hard lock input typography to prevent visual switching after interaction */
.login-wrapper input[type="email"],
.login-wrapper input[type="password"],
.login-wrapper input[type="text"],
.login-wrapper input[type="email"]:focus,
.login-wrapper input[type="password"]:focus,
.login-wrapper input[type="text"]:focus,
.login-wrapper input[type="email"]:active,
.login-wrapper input[type="password"]:active,
.login-wrapper input[type="text"]:active,
.login-wrapper input[type="email"]:focus-visible,
.login-wrapper input[type="password"]:focus-visible,
.login-wrapper input[type="text"]:focus-visible {
  font-family: var(--font-family-sohne) !important;
  font-size: 16px !important;
  font-weight: 400 !important;
  line-height: 1.5 !important;
  letter-spacing: -0.01em !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  text-rendering: optimizeLegibility !important;
}

/* Absolute typography lock for login interactive states */
.login-wrapper .welcome,
.login-wrapper .email-field label,
.login-wrapper .password-field label,
.login-wrapper .remember-text,
.login-wrapper .forgot-password-link,
.login-wrapper .bottom-fixed-card,
.login-wrapper .bottom-fixed-card .link-btn,
.login-wrapper .signin-text,
.login-wrapper .signin-button :deep(.v-btn__content),
.login-wrapper .signin-button :deep(.v-btn__content *) {
  font-family: var(--font-family-sohne) !important;
  text-transform: none !important;
}

.login-wrapper .forgot-password-link,
.login-wrapper .forgot-password-link:hover,
.login-wrapper .forgot-password-link:focus,
.login-wrapper .forgot-password-link:active,
.login-wrapper .bottom-fixed-card .link-btn,
.login-wrapper .bottom-fixed-card .link-btn:hover,
.login-wrapper .bottom-fixed-card .link-btn:focus,
.login-wrapper .bottom-fixed-card .link-btn:active {
  font-size: 16px !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  letter-spacing: 0 !important;
}

.login-wrapper .signin-text,
.login-wrapper .signin-button:hover :deep(.signin-text),
.login-wrapper .signin-button:focus :deep(.signin-text),
.login-wrapper .signin-button:active :deep(.signin-text) {
  font-size: 16px !important;
  font-weight: 700 !important;
  letter-spacing: 0.2px !important;
}

:global(html body #app .login-wrapper h1.welcome) {
  font-size: 1.5rem !important;
  font-weight: 650 !important;
  line-height: 1.2 !important;
  letter-spacing: -0.025em !important;
}

:global(html body #app .login-wrapper .bottom-fixed-card .link-btn),
:global(html body #app .login-wrapper .bottom-fixed-card .link-btn:hover),
:global(html body #app .login-wrapper .bottom-fixed-card .link-btn:focus),
:global(html body #app .login-wrapper .bottom-fixed-card .link-btn:active) {
  display: inline !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  color: #2563eb !important;
  filter: none !important;
  transform: none !important;
}

</style>
