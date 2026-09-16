<template>
  <div class="signup-wrapper">
    <!-- Fixed background decorative shapes -->
    <div class="bg-bar blue-bar" ref="blueBar"></div>
    <div class="bg-bar light-blue-bar" ref="lightBlueBar"></div>
    <div class="bg-triangle light-blue-triangle" ref="lightBlueTriangle"></div>
    <div class="bg-triangle blue-triangle" ref="blueTriangle"></div>
    <div class="bg-circle light-blue-circle" ref="lightBlueCircle"></div>
    <div class="bg-hexagon blue-hexagon" ref="blueHexagon"></div>
    <div class="bg-diamond light-blue-diamond" ref="lightBlueDiamond"></div>

    <!-- Subtle white squares on blue side -->
    <div class="bg-square white-square white-square-1"></div>
    <div class="bg-square white-square white-square-2"></div>
    <div class="bg-square white-square white-square-3"></div>

    <!-- Additional subtle white circle decorative -->
    <div class="bg-disc white-disc white-disc-1"></div>

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
    <!-- Snackbar for signup error -->
    <div :class="['snackbar', 'snackbar-error', { 'snackbar-show': showSnackbar }]" @click="showSnackbar = false">
      <div class="snackbar-content">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="snackbar-icon" />
        <span class="snackbar-message">{{ snackbarMessage }}</span>
      </div>
    </div>

    <!-- Snackbar for signup success -->
    <div :class="['snackbar', 'snackbar-success', { 'snackbar-show': showSuccessSnackbar }]" @click="showSuccessSnackbar = false">
      <div class="snackbar-content">
        <font-awesome-icon :icon="['fas', 'check-circle']" class="snackbar-icon" />
        <span class="snackbar-message">{{ successMessage || $t('signup_success') }}</span>
      </div>
    </div>

    <div class="signup-content">
      <div class="signup-container">
        <!-- Left side - Join our platform -->
        <div class="signup-left">
          <div class="welcome-content">
            <div class="platform-header">
              <div class="title-with-icon">
                <h1 class="platform-title" :class="{ 'is-long-title': platformTitleText.length > 22 }">
                  {{ platformTitleText }}
                </h1>
              </div>
              <div class="title-separator"></div>
            </div>
            <p class="platform-description">{{ $t('join_platform_description') }}</p>
            
            <div class="features-list">
              <div class="feature-item">
                <font-awesome-icon icon="square-check" class="feature-icon" />
                <span>{{ $t('feature_1') }}</span>
              </div>
              <div class="feature-item">
                <font-awesome-icon icon="square-check" class="feature-icon" />
                <span>{{ $t('feature_2') }}</span>
              </div>
              <div class="feature-item">
                <font-awesome-icon icon="square-check" class="feature-icon" />
                <span>{{ $t('feature_3') }}</span>
              </div>
              <div class="feature-item">
                <font-awesome-icon icon="square-check" class="feature-icon" />
                <span>{{ $t('feature_4') }}</span>
              </div>
            </div>

            <div class="already-member">
              <span>{{ $t('already_member') }}</span>
              <RouterLink to="/login" class="link-btn sign-in-link">{{ $t('sign_in') }}</RouterLink>
            </div>
          </div>
        </div>

        <!-- Right side - Signup form -->
        <div class="signup-right">
          <div class="signup-card">
            <div class="card-inner">
              <div class="registration-closed registration-notice" role="status">
                <h2>{{ $t('signup_registration_closed') }}</h2>
              </div>
              <form v-if="false" @submit.prevent="signup">
                <div class="name-row">
                  <div class="name-field">
                    <label for="firstName">{{ $t('first_name') }}</label>
                    <div class="input-container">
                      <font-awesome-icon
                        icon="user"
                        class="input-icon"
                      />
                      <input
                        id="firstName"
                        type="text"
                        v-model="firstName"
                        :class="{ 'invalid-input': submitted && firstNameError, 'input-with-icon': true }"
                        autocomplete="given-name"
                        autocapitalize="words"
                        spellcheck="false"
                      />
                    </div>
                    <p v-if="submitted && firstNameError" class="input-error">{{ firstNameError }}</p>
                  </div>

                  <div class="name-field">
                    <label for="lastName">{{ $t('last_name') }}</label>
                    <div class="input-container">
                      <font-awesome-icon
                        icon="user"
                        class="input-icon"
                      />
                      <input
                        id="lastName"
                        type="text"
                        v-model="lastName"
                        :class="{ 'invalid-input': submitted && lastNameError, 'input-with-icon': true }"
                        autocomplete="family-name"
                        autocapitalize="words"
                        spellcheck="false"
                      />
                    </div>
                    <p v-if="submitted && lastNameError" class="input-error">{{ lastNameError }}</p>
                  </div>
                </div>

                <label for="email">{{ $t('email') }}</label>
                <div class="input-container">
                  <font-awesome-icon
                    icon="envelope"
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
                <p v-else-if="showRegisteredEmailHelp" class="input-help input-help-warning">
                  {{ $t('signup_registered_email_help') }}
                  <RouterLink to="/forgot" class="input-help-link">{{ $t('forgot_password') }}</RouterLink>
                </p>

                <label for="signupLanguage">{{ $t('signup_language_label') }}</label>
                <div class="input-container language-input-container">
                  <font-awesome-icon
                    icon="language"
                    class="input-icon"
                  />
                  <select
                    id="signupLanguage"
                    v-model="selectedLanguage"
                    class="input-with-icon language-select"
                  >
                    <option value="en">🇺🇸 {{ $t('language.english') }}</option>
                    <option value="es">🇪🇸 {{ $t('language.spanish') }}</option>
                    <option value="fr">🇫🇷 {{ $t('language.french') }}</option>
                    <option value="de">🇩🇪 {{ $t('language.german') }}</option>
                    <option value="hi">🇮🇳 {{ $t('language.hindi') }}</option>
                  </select>
                </div>

                <label for="password">{{ $t('password') }}</label>
                <div class="input-container password-input-container">
                  <font-awesome-icon
                    icon="lock"
                    class="input-icon"
                  />
                  <input
                    id="password"
                    :type="showPassword ? 'text' : 'password'"
                    v-model="password"
                    :class="{ 'invalid-input': submitted && passwordError, 'input-with-icon password-input': true }"
                    autocomplete="new-password"
                    autocapitalize="off"
                    spellcheck="false"
                  />
                  <font-awesome-icon
                    :icon="showPassword ? 'eye-slash' : 'eye'"
                    class="password-eye-icon"
                    @click="showPassword = !showPassword"
                    tabindex="0"
                    :aria-label="showPassword ? $t('hide_password') : $t('show_password')"
                    :title="showPassword ? $t('hide_password') : $t('show_password')"
                  />
                </div>
                <p v-if="submitted && passwordError" class="input-error">{{ passwordError }}</p>

                <label for="confirmPassword">{{ $t('confirm_password') }}</label>
                <div class="input-container password-input-container">
                  <font-awesome-icon
                    icon="lock"
                    class="input-icon"
                  />
                  <input
                    id="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="confirmPassword"
                    :class="{ 'invalid-input': submitted && confirmPasswordError, 'input-with-icon password-input': true }"
                    autocomplete="new-password"
                    autocapitalize="off"
                    spellcheck="false"
                  />
                  <font-awesome-icon
                    :icon="showConfirmPassword ? 'eye-slash' : 'eye'"
                    class="password-eye-icon"
                    @click="showConfirmPassword = !showConfirmPassword"
                    tabindex="0"
                    :aria-label="showConfirmPassword ? $t('hide_password') : $t('show_password')"
                    :title="showConfirmPassword ? $t('hide_password') : $t('show_password')"
                  />
                </div>
                <p v-if="submitted && confirmPasswordError" class="input-error">{{ confirmPasswordError }}</p>

                <div class="terms-row">
                  <label class="checkbox-wrapper">
                    <input type="checkbox" v-model="agreeToTerms" />
                    <span class="terms-text">
                      {{ $t('agree_to') }} <a :href="tosUrl" target="_blank" rel="noopener noreferrer" class="terms-link">{{ $t('terms_of_service') }}</a>
                    </span>
                  </label>
                </div>
                <p v-if="submitted && termsError" class="input-error">{{ termsError }}</p>

                <v-btn color="primary" type="submit" class="auth-btn main-btn signup-button" ref="signupButton" disabled>
                  {{ $t('sign_up') }}
                </v-btn>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faCircleCheck,
  faExclamationTriangle,
  faEye, 
  faEyeSlash,
  faUser,
  faEnvelope,
  faLanguage,
  faLock,
  faCheckCircle,
  faSquareCheck,
  faRocket
} from '@fortawesome/free-solid-svg-icons'
library.add(faCircleCheck, faExclamationTriangle, faEye, faEyeSlash, faUser, faEnvelope, faLanguage, faLock, faCheckCircle, faSquareCheck, faRocket)

import { storeToRefs } from 'pinia'
import { api } from '@/composables/api'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useLanguageStore } from '@/stores/language'
import { redirectToDashboard } from '@/utils/authHandoff'
import { gsap } from 'gsap'

const router = useRouter()
const { t, locale } = useI18n()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const submitted = ref(false)
const signupError = ref('')
const isSigningUp = ref(false)
const showRegisteredEmailHelp = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const selectedLanguage = ref(locale.value || 'en')
const publicRegistrationOpen = false
const blueBar = ref(null)
const lightBlueBar = ref(null)
const lightBlueTriangle = ref(null)
const blueTriangle = ref(null)
const lightBlueCircle = ref(null)
const blueHexagon = ref(null)
const lightBlueDiamond = ref(null)
const signupButton = ref(null)
const platformTitle = ref(null)

const showSnackbar = ref(false)
const showSuccessSnackbar = ref(false)
const snackbarMessage = ref('')
const successMessage = ref('')
let snackbarTimeout = null

// Auto-hide snackbars after 4 seconds
watch(showSnackbar, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showSnackbar.value = false
    }, 4000)
  }
})

watch(showSuccessSnackbar, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      showSuccessSnackbar.value = false
    }, 4000)
  }
})

watch(email, () => {
  showRegisteredEmailHelp.value = false
})

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const languageStore = useLanguageStore()

const firstNameError = computed(() => {
  const val = firstName.value.trim()
  if (!val) return t('first_name_required')
  if (val.length < 2) return t('first_name_min')
  return ''
})

const lastNameError = computed(() => {
  const val = lastName.value.trim()
  if (!val) return t('last_name_required')
  if (val.length < 2) return t('last_name_min')
  return ''
})

const emailError = computed(() => {
  const val = email.value.trim()
  if (!val) return t('email_required')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(val)) return t('email_invalid')
  return ''
})

const passwordError = computed(() => {
  const val = password.value.trim()
  if (!val) return t('password_required')
  if (val.length < 6) return t('password_min_signup')
  return ''
})

const confirmPasswordError = computed(() => {
  const val = confirmPassword.value.trim()
  if (!val) return t('confirm_password_required')
  if (val !== password.value) return t('passwords_do_not_match')
  return ''
})

const termsError = computed(() => {
  if (!agreeToTerms.value) return t('must_agree_to_terms')
  return ''
})

// Form validation computed property
const isFormValid = computed(() => {
  return firstName.value.trim() && 
         lastName.value.trim() && 
         email.value.trim() && 
         password.value.trim() && 
         confirmPassword.value.trim() && 
         agreeToTerms.value &&
         !firstNameError.value &&
         !lastNameError.value &&
         !emailError.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// Computed properties for settings to ensure reactivity
const appName = computed(() => {
  return settingsStore.loaded ? (settingsStore.settings.storename || settingsStore.settings.name || 'DashCole') : 'dashcole'
})

const baseDomain = computed(() => {
  return settingsStore.settings.base_domain || window.location.hostname
})

const tosUrl = computed(() => {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
  const normalizedDomain = (baseDomain.value || '').replace(/^https?:\/\//, '')
  return `${protocol}://${normalizedDomain}/tos`
})

const platformTitleText = computed(() => t('join_our_platform'))

// Cool entrance animation for the title with amazing GSAP effects
const animateTitleEntrance = () => {
  if (!platformTitle.value) return
  
  // Set initial state
  gsap.set(platformTitle.value, {
    opacity: 0,
    y: 50,
    scale: 0.8
  })
  
  // Create the main entrance animation
  gsap.to(platformTitle.value, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 1.2,
    ease: "back.out(1.7)",
    delay: 0.3,
    onComplete: () => {
      // Start continuous effects after entrance
      startContinuousGlowEffects()
      createFloatingParticles()
    }
  })
}

// Create amazing glow effects around the title
const startContinuousGlowEffects = () => {
  if (!platformTitle.value) return
  
  // Create multiple glow orbs around the title
  for (let i = 0; i < 6; i++) {
    const glowOrb = document.createElement('div')
    glowOrb.className = 'glow-orb'
    glowOrb.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
      box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4);
    `
    
    platformTitle.value.parentElement.appendChild(glowOrb)
    
    // Position around title
    const angle = (i / 6) * Math.PI * 2
    const radius = 120
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    
    gsap.set(glowOrb, {
      left: '50%',
      top: '50%',
      x: x,
      y: y,
      scale: 0.5
    })
    
    // Animate orb in circular motion with pulsing
    gsap.to(glowOrb, {
      rotation: 360,
      duration: 10 + i * 2,
      ease: "none",
      repeat: -1,
      transformOrigin: `${-x}px ${-y}px`
    })
    
    gsap.to(glowOrb, {
      scale: 1.5,
      opacity: 0.7,
      duration: 2 + i * 0.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    })
  }
  
  // Create pulsing backdrop glow
  const backdrop = document.createElement('div')
  backdrop.className = 'title-backdrop'
  backdrop.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 80px;
    background: radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  `
  
  platformTitle.value.parentElement.appendChild(backdrop)
  
  gsap.to(backdrop, {
    scale: 1.3,
    opacity: 0.5,
    duration: 3,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  })
}

// Create floating light particles
const createFloatingParticles = () => {
  if (!platformTitle.value) return
  
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      const particle = document.createElement('div')
      particle.className = 'light-particle'
      particle.style.cssText = `
        position: absolute;
        width: 3px;
        height: 3px;
        background: rgba(255,255,255,0.9);
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
        box-shadow: 0 0 10px rgba(255,255,255,0.8);
      `
      
      platformTitle.value.parentElement.appendChild(particle)
      
      // Random starting position around title
      gsap.set(particle, {
        left: '50%',
        top: '50%',
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 100,
        scale: 0,
        opacity: 0
      })
      
      // Animate particle floating up and fading
      const tl = gsap.timeline({
        onComplete: () => particle.remove()
      })
      
      tl.to(particle, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(2)"
      })
      .to(particle, {
        y: "-=100",
        x: "+=" + (Math.random() - 0.5) * 100,
        opacity: 0,
        scale: 0.5,
        duration: 3,
        ease: "power2.out"
      }, 0.2)
    }
  }, 1500) // Create new particles every 1.5 seconds
}

// Button rejection animation
const animateButtonRejection = () => {
  if (!signupButton.value) return
  
  const button = signupButton.value.$el || signupButton.value
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

// Clear error messages
const clearError = () => {
  signupError.value = ''
  if (snackbarTimeout) clearTimeout(snackbarTimeout)
}

async function signup() {
  if (!publicRegistrationOpen) return
  if (isSigningUp.value) return; // Prevent multiple signup attempts
  
  submitted.value = true
  signupError.value = ''
  showRegisteredEmailHelp.value = false
  showSnackbar.value = false
  showSuccessSnackbar.value = false
  successMessage.value = ''
  
  if (firstNameError.value || lastNameError.value || emailError.value || passwordError.value || confirmPasswordError.value || termsError.value) {
    // Trigger button rejection animation for validation errors
    animateButtonRejection()
    return
  }

  isSigningUp.value = true
  try {
    await api.post('/auth/register', {
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email: email.value.trim().toLowerCase(),
      password: password.value,
      language: selectedLanguage.value || 'en'
    })
    
    // Auto-login after successful signup
    try {
      const loginData = await api.performLogin(email.value, password.value);
      if (loginData?.login?.token && loginData?.login?.user) {
        // Handle JWT token management and credentials storage
        api.handleLoginSuccess(email.value, password.value, loginData)
        
        // Set authentication
        await authStore.setAuth(loginData.login.user, loginData.login.token, loginData.server)
        
        redirectToDashboard()
        return
      }

      throw new Error(t('invalid_login_response'))
    } catch (loginErr) {
      console.log('Auto-login failed:', loginErr)
      // If auto-login fails, just redirect to login page
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }
    
    // Clear form (fallback if auto-login didn't work)
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    agreeToTerms.value = false
    submitted.value = false
    
  } catch (err) {
    console.log('Signup error:', err)
    console.log('Response data:', err.response?.data)
    console.log('Response status:', err.response?.status)
    
    // Check for specific error codes
    if (err.response?.data?.codes && err.response.data.codes.includes(6)) {
      showRegisteredEmailHelp.value = true
      snackbarMessage.value = t('email_already_exists')
    } else if (Array.isArray(err.response?.data?.errors) && err.response.data.errors.length > 0) {
      snackbarMessage.value = err.response.data.errors[0].message || t('signup_failed')
    } else if (err.response?.data?.error) {
      snackbarMessage.value = err.response.data.error
    } else if (err.message) {
      snackbarMessage.value = err.message
    } else if (err.response?.status === 405) {
      snackbarMessage.value = t('signup_failed')
    } else {
      snackbarMessage.value = t('signup_failed')
    }
    showSnackbar.value = true
    
    // Trigger button rejection animation
    animateButtonRejection()
  } finally {
    isSigningUp.value = false
  }
}

onMounted(() => {
  selectedLanguage.value = locale.value || languageStore.locale || 'en'

  // Start animations
  animateTitleEntrance()
  
  // Load settings
  settingsStore.fetchSettings({ nojwt: true }).then(() => {
    console.log('Settings loaded successfully')
  }).catch((error) => {
    console.error('Failed to load settings:', error)
  })
})

watch(selectedLanguage, (newLang) => {
  if (!newLang) return
  languageStore.setLocale(newLang)
  locale.value = newLang
})
</script>

<style scoped src="@/assets/auth-common.css"></style>
<style scoped>
.registration-closed {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.registration-closed-icon {
  margin-bottom: 1rem;
  color: #2563eb;
  font-size: 2rem;
}

.registration-closed h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.65rem;
}

.registration-closed p {
  max-width: 36ch;
  margin: 0.85rem 0 1.35rem;
  color: #64748b;
  line-height: 1.6;
}

.registration-login-link {
  display: inline-flex;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
  text-decoration: none;
}
/* Override wrapper styles for split screen */
.signup-wrapper {
  position: relative;
  min-height: 100vh;
  height: 100vh;
  background: #fafafa;
  overflow: hidden;
}

.signup-language-selector {
  position: absolute;
  top: 14px;
  right: 18px;
  z-index: 25;
}

@media (max-width: 900px) {
  .signup-language-selector {
    top: 12px;
    right: 12px;
  }
}

.signup-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  z-index: 10;
  min-height: 100vh;
}

.signup-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}

/* Left side - Welcome content */
.signup-left {
  position: relative;
  flex: 1;
  background: linear-gradient(135deg, #10245f 0%, #020817 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: white;
  min-height: 100vh;
  overflow: hidden;
}

.signup-left * {
  color: white !important;
}

.signup-left .platform-title {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.welcome-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  text-align: center;
  margin-top: 1rem;
}

.platform-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title-icon {
  font-size: 2.2rem;
  color: #e5e7eb;
  opacity: 0.9;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
  animation: iconFloat 3s ease-in-out infinite;
}

.title-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #f3f4f6;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.platform-title {
  font-size: clamp(1rem, 1.55vw, 1.42rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 5;
  margin: 0;
  color: #ffffff !important;
  white-space: nowrap;
  overflow-wrap: normal;
  max-width: none;
  text-wrap: nowrap;
}

.platform-title.is-long-title {
  font-size: clamp(0.96rem, 1.45vw, 1.28rem);
  line-height: 1.08;
  max-width: none;
}

.title-separator {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%);
  margin: 0 auto;
  border-radius: 2px;
}

.platform-description {
  font-size: var(--font-size-lead);
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: var(--line-height-lead);
  padding-top: 0.5rem;
  color: #ffffff !important;
}

.features-list {
  margin-bottom: 2rem;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: #ffffff !important;
}

.feature-item span {
  color: #ffffff !important;
}

.feature-icon {
  color: #ffffff;
  margin-right: 0.75rem;
  font-size: 1.2rem;
  font-weight: 900;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.already-member {
  font-size: var(--font-size-base);
  opacity: 0.9;
  color: #ffffff !important;
  display: inline-flex;
  align-items: center;
}

.already-member span {
  color: #ffffff !important;
}

.already-member .sign-in-link {
  color: #0b2a6f !important;
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  margin-left: 0.55rem;
  transition: all 0.3s ease;
  padding: 8px 13px;
  border-radius: 999px;
  display: inline-block;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 5px 12px rgba(2, 6, 23, 0.12);
  transform: translateX(6px);
}

.already-member .sign-in-link:hover {
  color: #082d7e !important;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transform: translateX(6px);
}

.already-member .sign-in-link:focus,
.already-member .sign-in-link:active {
  color: #082d7e !important;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transform: translateX(6px);
  font-size: var(--font-size-base);
}

.input-help {
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  line-height: 1.45;
}

.input-help-warning {
  color: #92400e;
}

.input-help-link {
  margin-left: 0.35rem;
  color: #0f5ae0;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.input-help-link:hover,
.input-help-link:focus {
  color: #0b46b3;
}

/* Right side - Signup form */
.signup-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  min-height: 100vh;
  overflow-y: auto;
  background: #f3f4f6;
}

.registration-notice {
  text-align: center;
}

.registration-notice h2 {
  margin: 0;
  color: #111827;
  font-size: clamp(1.8rem, 4vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.035em;
}

.signup-card {
  width: 100%;
  max-width: 450px;
}

.card-inner {
  padding: 1.5rem;
}

.welcome {
  text-align: center;
  font-size: clamp(0.9rem, 1.6vw, 1.1rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  white-space: nowrap;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

/* Name fields in a row */
.name-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.name-field {
  flex: 1;
}

.name-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.name-field .input-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.name-field .input-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

/* Input styling */
.input-container {
  position: relative;
  margin-bottom: 0.5rem;
}

.language-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  min-height: 48px;
  padding-right: 2.55rem !important;
  border-radius: 10px;
  cursor: pointer;
  line-height: 1.2 !important;
  font-family: var(--font-family-sohne), "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}

.language-input-container::after {
  content: '';
  position: absolute;
  right: 0.95rem;
  top: 50%;
  width: 8px;
  height: 8px;
  border-right: 2px solid #334155;
  border-bottom: 2px solid #334155;
  transform: translateY(-60%) rotate(45deg);
  pointer-events: none;
  opacity: 0.85;
}

.language-select option {
  color: #0f172a;
  background: #ffffff;
  font-weight: 600;
  font-family: var(--font-family-sohne), "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
}

.language-select option:checked {
  background: #e8f0ff;
  color: #153f84;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 43%;
  transform: translateY(-50%);
  color: #000000;
  font-size: 1rem;
  z-index: 5;
  pointer-events: none;
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
  outline: none !important;
  background: #f1f3f4 !important;
  color: #000000 !important;
  box-shadow: none !important;
  font-size: 16px !important;
  line-height: 1.5 !important;
  font-weight: 400 !important;
  font-family: var(--font-family-sohne) !important;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background: #f1f3f4;
  border: none;
  outline: none !important;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  color: #000000;
  font-family: var(--font-family-sohne);
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

input:focus {
  border: none;
  outline: none !important;
  background: #f1f3f4;
  color: #000000;
  box-shadow: none !important;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  font-family: var(--font-family-sohne);
}

input:focus-visible {
  border: none;
  outline: none !important;
  box-shadow: none !important;
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

.password-eye-icon:hover {
  color: #374151;
}

/* Terms checkbox */
.terms-row {
  margin-bottom: 1.5rem;
  margin-top: 1rem;
}


.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-wrapper input[type="checkbox"] {
  margin: 0;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.terms-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.terms-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  flex: 1;
  color: var(--color-stripe-text);
  font-weight: var(--font-weight-normal);
}

.terms-text .terms-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.terms-text .terms-link:hover {
  text-decoration: underline;
}

/* Enhanced button with gradient and glow - matching login.vue */
button, .auth-btn {
  background: linear-gradient(135deg, #65a6ff 0%, #4f94ff 50%, #2563eb 100%);
  color: #ffffff !important;
  border-radius: 10px;
  box-shadow: 
    0 4px 15px rgba(101, 166, 255, 0.3),
    0 2px 8px rgba(101, 166, 255, 0.2),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  font-weight: 600;
  border: none;
  padding: 0.7rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  height: 44px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

button :deep(*),
.auth-btn :deep(*),
button :deep(.v-btn__content),
.auth-btn :deep(.v-btn__content),
button :deep(.v-btn__content *),
.auth-btn :deep(.v-btn__content *) {
  color: #ffffff !important;
}

button:hover, .auth-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
  color: #ffffff !important;
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.4),
    0 4px 15px rgba(37, 99, 235, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

button:hover :deep(*),
.auth-btn:hover :deep(*),
button:hover :deep(.v-btn__content),
.auth-btn:hover :deep(.v-btn__content),
button:hover :deep(.v-btn__content *),
.auth-btn:hover :deep(.v-btn__content *) {
  color: #ffffff !important;
}

button:focus, .auth-btn:focus, button:active, .auth-btn:active {
  outline: none;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
  color: #ffffff !important;
  box-shadow: 
    0 8px 25px rgba(37, 99, 235, 0.4),
    0 4px 15px rgba(37, 99, 235, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.3),
    0 0 0 3px rgba(37, 99, 235, 0.2);
}

button:focus :deep(*),
.auth-btn:focus :deep(*),
button:active :deep(*),
.auth-btn:active :deep(*) {
  color: #ffffff !important;
}

/* Subtle shimmer effect for button */
button::before, .auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 100%);
  
}

button:hover::before, .auth-btn:hover::before {
  left: 100%;
}

/* Button styling */
.auth-btn.main-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af !important;
}

/* Override Vuetify uppercase text transform */
.signup-button {
  text-transform: none !important;
  letter-spacing: normal !important;
}

/* Match login Sign In button style/size */
.signup-button {
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

.signup-button :deep(.v-btn__content),
.signup-button :deep(.v-btn__content *),
.signup-button :deep(span) {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.signup-button:hover {
  background: #1e40af !important;
  box-shadow: 0 6px 16px rgba(30, 64, 175, 0.32) !important;
  transform: none !important;
}

.signup-button:hover :deep(.v-btn__content),
.signup-button:hover :deep(.v-btn__content *),
.signup-button:hover :deep(span) {
  color: #ffffff !important;
  font-weight: 700 !important;
}

.signup-button:active {
  transform: translateY(0) !important;
  box-shadow: 0 2px 8px rgba(30, 58, 138, 0.26) !important;
}

/* Label styling */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

/* Enhanced snackbar with consistent styling */
.snackbar {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  transform: translateX(100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  z-index: 9999;
  opacity: 0;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  max-width: 400px;
  min-width: 300px;
  cursor: pointer;
}

.snackbar-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

.snackbar-success {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.snackbar.snackbar-show {
  transform: translateX(0);
  opacity: 1;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.snackbar-icon {
  font-size: 1.1rem;
  color: white;
}

.snackbar-message {
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
}

@media (max-width: 600px) {
  .snackbar {
    bottom: 1.2rem;
    right: 1.2rem;
    left: 1.2rem;
    transform: translateY(100%);
    min-width: auto;
    max-width: none;
  }
  .snackbar.snackbar-show {
    transform: translateY(0);
  }
}

/* Brand top styling - consistent with landing page */
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
  filter: drop-shadow(0 4px 10px rgba(255, 255, 255, 0.22));
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
  filter: drop-shadow(0 4px 10px rgba(255, 255, 255, 0.22));
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.logo-link:hover .logo-text {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}

.logo-link:hover {
  text-decoration: none !important;
}

/* Fixed background decorative shapes - same as login */
.bg-bar {
  position: fixed;
  width: 800px;
  height: 200px;
  transform: rotate(45deg);
  opacity: 0.12;
  border-radius: 30px;
  box-shadow: 0 20px 50px rgba(0,0,0,.18), 0 6px 18px rgba(0,0,0,.12);
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
  animation: moireShift 18s linear infinite;
}

.bg-triangle {
  position: fixed;
  width: 0;
  height: 0;
  opacity: 0.18;
  filter: drop-shadow(0 20px 35px rgba(0,0,0,.22)) drop-shadow(0 8px 15px rgba(0,0,0,.15)) drop-shadow(0 3px 6px rgba(0,0,0,.12));
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

@keyframes floatMicro {
  0%   { transform: translate3d(0, 0px, 0) rotate(45deg); }
  100% { transform: translate3d(0, 4px, 0) rotate(45deg); }
}

.blue-bar {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: 3vh;
  right: 1%;
  width: 300px;
}

.light-blue-bar {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  bottom: 3vh;
  right: 35%;
  width: 300px;
}

.light-blue-triangle {
  border-left: 65px solid transparent;
  border-right: 65px solid transparent;
  border-bottom: 113px solid #60a5fa;
  bottom: 8vh;
  right: 20%;
  opacity: 0.25;
}

.blue-triangle {
  border-left: 65px solid transparent;
  border-right: 65px solid transparent;
  border-top: 113px solid #3b82f6;
  top: 65vh;
  left: 15%;
  opacity: 0.25;
}

.blue-hexagon {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: 35vh;
  right: 10%;
  opacity: 0.33;
}

.light-blue-diamond {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  top: 8vh;
  right: 70%;
  opacity: 0.24;
}

.light-blue-circle {
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  bottom: 25%;
  left: -80px;
  transform: translateY(50%);
  opacity: 0.40;
}

/* Subtle white squares for blue side background */
.bg-square {
  position: fixed;
  width: 120px;
  height: 120px;
  background: #ffffff;
  opacity: 0.08; /* very faint */
  border-radius: 12px;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.14),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.18);
  z-index: 1; /* behind main content (which uses z-index: 10) */
}

/* Place squares on the left (blue) half, spaced and unobtrusive */
.white-square-1 { top: 14vh; left: -3%; transform: rotate(14deg); }
.white-square-2 { top: 62vh; left: 40%; transform: rotate(-10deg); }
.white-square-3 { bottom: 12vh; left: 4%; transform: rotate(5deg); }

/* Slight size variance for depth */
.white-square-1 { width: 170px; height: 170px; }
.white-square-2 { width: 140px; height: 140px; }
.white-square-3 { width: 95px; height: 95px; }

/* Subtle white circle (different shape) */
.bg-disc {
  position: fixed;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #ffffff;
  opacity: 0.07;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.14),
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.18);
  z-index: 1;
}

.white-disc-1 { top: 34vh; left: 18%; }

/* Responsive design */
@media (max-width: 768px) {
  .signup-wrapper {
    height: auto;
    min-height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .signup-container {
    flex-direction: column;
    width: 100vw;
    height: 100vh;
  }
  
  .signup-left {
    padding: 2rem;
    min-height: 40vh;
    flex: none;
  }

  .platform-title {
    font-size: clamp(0.96rem, 2.7vw, 1.2rem);
    line-height: 1.08;
  }
  
  .platform-title.is-long-title {
    font-size: clamp(0.92rem, 2.5vw, 1.12rem);
  }
  
  .signup-right {
    padding: 2rem;
    min-height: 60vh;
    flex: 1;
  }
  
  .name-row {
    flex-direction: column;
    gap: 0;
  }
  
  .name-field {
    margin-bottom: 0.5rem;
  }
  
  /* Adjust background shapes for mobile */
  .bg-bar {
    width: 600px;
    height: 150px;
  }
  
  .bg-hexagon {
    width: 200px;
    height: 200px;
  }
  
  .bg-diamond {
    width: 200px;
    height: 200px;
  }
  
  .bg-circle {
    width: 200px;
    height: 200px;
  }
  
  .blue-bar {
    top: -75px;
    left: -150px;
  }

  /* Reduce size/opacity on mobile so they don't interfere with text */
  .bg-square { opacity: 0.06; }
  .white-square-1, .white-square-2, .white-square-3 {
    left: 5%;
    transform: translateZ(0); /* ensure smooth */
  }
  .white-square-1 { width: 110px; height: 110px; top: 12vh; left: -4%; transform: rotate(14deg); }
  .white-square-2 { width: 100px; height: 100px; top: 55vh; left: 38%; }
  .white-square-3 { width: 70px; height: 70px; bottom: 10vh; }
  .bg-disc { opacity: 0.055; }
  .white-disc-1 { width: 90px; height: 90px; top: 30vh; left: 16%; }
}

@media (max-width: 480px) {
  .signup-container,
  .signup-left,
  .signup-right,
  .welcome-content,
  .platform-header,
  .title-with-icon,
  .features-list {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .platform-title,
  .platform-title.is-long-title {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    white-space: normal;
    text-wrap: balance;
    overflow-wrap: anywhere;
    transform: none !important;
  }

  .signup-left {
    overflow: hidden;
  }

  .signup-wrapper .bg-bar,
  .signup-wrapper .bg-circle,
  .signup-wrapper .bg-diamond,
  .signup-wrapper .bg-hexagon,
  .signup-wrapper .bg-square,
  .signup-wrapper .bg-disc {
    display: none;
  }

  .signup-content {
    padding: 0;
  }
  
  .signup-left {
    padding: 1.5rem;
    min-height: 35vh;
  }

  .platform-title {
    font-size: clamp(0.86rem, 4.7vw, 1.02rem);
    line-height: 1.08;
    max-width: none;
  }

  .platform-title.is-long-title {
    font-size: clamp(0.82rem, 4.4vw, 0.96rem);
  }
  
  .title-icon {
    font-size: 1.5rem;
  }
  
  .title-with-icon {
    gap: 0.5rem;
  }
  
  .platform-description {
    font-size: 1rem;
  }
  
  .signup-right {
    padding: 1.5rem;
  }
  
  .card-inner {
    padding: 1rem;
  }
  
  .welcome {
    font-size: clamp(0.9rem, 1.6vw, 1.1rem);
  }
}

@media (max-width: 768px) {
  .signup-container {
    height: auto;
    min-height: 100dvh;
  }

  .signup-left {
    display: none;
  }

  .signup-right {
    min-height: 100dvh;
    padding: 5rem 1rem 2rem;
    overflow: visible;
  }

  .signup-card {
    max-width: 420px;
  }

  .logo-text,
  .logo-link:hover .logo-text {
    color: #0a2540;
    text-shadow: none;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Email and Password labels bold */
label[for="email"],
label[for="password"] {
  font-weight: 700 !important;
}

/* Sign in link bold */
.already-member .sign-in-link {
  font-weight: 700 !important;
}
</style>
