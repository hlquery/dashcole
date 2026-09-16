import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import 'animate.css'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Import GSAP and plugins
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

import App from './App.vue'
import './style.css'
import './assets/design-system.css'
import './assets/auth-background.css'
import './assets/theme-light.css'
import './assets/theme-dark.css'
import './assets/usability-fixes.css'
import '../../shared/stripe-typography.css'

// Import stores
import { useLanguageStore } from './stores/language'
import { usePreferencesStore } from './stores/preferences'
import { API_BASE_URL } from './composables/api'
import domainConfig from './config/domain'
import { redirectToDashboard } from './utils/authHandoff'

// Import views
import LandingPage from './views/landing/Home.vue'
import ContactView from './views/ContactForm.vue'
// Import locales
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import hi from './locales/hi.json'

// Store Lenis instance globally for router scroll behavior
let lenisInstance = null
const redirectToDashboardApp = (to) => {
  if (typeof window === 'undefined') return false
  const suffix = to.fullPath.startsWith('/dashboard') ? to.fullPath.slice('/dashboard'.length) : ''
  redirectToDashboard(suffix)
  return false
}
const DASHBOARD_LOGIN_URL = import.meta.env.VITE_LOGIN_URL || 'https://dashboard.hlquery.com/login'

const redirectToDashboardLogin = () => {
  if (typeof window === 'undefined') return true
  window.location.replace(DASHBOARD_LOGIN_URL)
  return false
}
const redirectToDashboardAdmission = (to) => {
  if (typeof window === 'undefined') return true
  const loginUrl = new URL(DASHBOARD_LOGIN_URL, window.location.origin)
  const schoolId = String(to.params.schoolId || '').trim()
  const querySchool = String(to.query.school || '').trim()
  const targetPath = schoolId
    ? `/postular/${encodeURIComponent(schoolId)}`
    : (/^\d+$/.test(querySchool) ? `/postular/${encodeURIComponent(querySchool)}` : '/login')
  window.location.replace(`${loginUrl.origin}${targetPath}`)
  return false
}
const redirectToBlogApp = (to) => {
  if (typeof window === 'undefined') return false
  const suffix = to.fullPath.startsWith('/blog') ? to.fullPath.slice('/blog'.length) : to.fullPath
  window.location.replace(domainConfig.getBlogUrl(suffix || '/'))
  return false
}
const redirectToDocsSite = (to) => {
  if (typeof window === 'undefined') return false
  const docsBaseUrl = String(import.meta.env.VITE_DOCS_URL || 'https://guias.hlquery.com/').replace(/\/+$/, '')
  window.location.replace(`${docsBaseUrl}${to.fullPath}`)
  return false
}

// Create router
const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (e.g., browser back/forward), use it
    if (savedPosition) {
      return new Promise((resolve) => {
        if (lenisInstance) {
          lenisInstance.scrollTo(savedPosition.top, { immediate: false })
          setTimeout(() => resolve(savedPosition), 100)
        } else {
          window.scrollTo({
            top: savedPosition.top,
            behavior: 'smooth'
          })
          setTimeout(() => resolve(savedPosition), 100)
        }
      })
    }
    // Otherwise, scroll to top
    return new Promise((resolve) => {
      if (lenisInstance) {
        lenisInstance.scrollTo(0, { immediate: false })
        setTimeout(() => resolve({ top: 0 }), 100)
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
        setTimeout(() => resolve({ top: 0 }), 100)
      }
    })
  },
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: LandingPage
    },
    {
      path: '/docs',
      name: 'Docs',
      beforeEnter: redirectToDocsSite
    },
    {
      path: '/docs/:docPath*',
      name: 'DocsPage',
      beforeEnter: redirectToDocsSite
    },
    {
      path: '/guides',
      name: 'Guides',
      beforeEnter: redirectToDocsSite
    },
    {
      path: '/guides/:pathMatch(.*)*',
      name: 'GuideDetail',
      beforeEnter: redirectToDocsSite
    },
    {
      path: '/solutions/ecommerce',
      redirect: '/soluciones/gestion-educacional'
    },
    {
      path: '/solutions/gestion-educacional',
      redirect: '/soluciones/gestion-educacional'
    },
    {
      path: '/soluciones/gestion-educacional',
      name: 'SolutionsEducationalManagement',
      component: () => import(/* webpackChunkName: "solutions-ecommerce" */ './views/solutions/Ecommerce.vue')
    },
    {
      path: '/solutions/saas',
      name: 'SolutionsSaaS',
      component: () => import(/* webpackChunkName: "solutions-saas" */ './views/solutions/SaaS.vue')
    },
    {
      path: '/faq',
      name: 'FaqPage',
      component: () => import(/* webpackChunkName: "faq" */ './views/FAQPage.vue')
    },
    { path: '/what-we-do', redirect: '/que-hacemos' },
    { path: '/que-haceos', redirect: '/que-hacemos' },
    {
      path: '/que-hacemos',
      name: 'WhatWeDo',
      component: () => import(/* webpackChunkName: "pricing" */ './views/PricingPage.vue')
    },
    {
      path: '/pricing',
      redirect: '/que-hacemos'
    },
    {
      path: '/what-we-offer',
      redirect: '/que-hacemos'
    },
    {
      path: '/contact-form',
      redirect: '/contact'
    },
    {
      path: '/logos',
      name: 'Logos',
      component: () => import(/* webpackChunkName: "logos" */ './views/landing/Logos.vue')
    },
    {
      path: '/products/dashboard',
      name: 'ProductDashboard',
      component: () => import(/* webpackChunkName: "products-dashboard" */ './views/products/Dashboard.vue')
    },
    {
      path: '/products/fashion',
      redirect: '/soluciones/jardines'
    },
    {
      path: '/solutions/fashion',
      redirect: '/soluciones/jardines'
    },
    {
      path: '/solutions/jardines',
      redirect: '/soluciones/jardines'
    },
    {
      path: '/soluciones/jardines',
      name: 'SolutionsGardens',
      component: () => import(/* webpackChunkName: "solutions-fashion" */ './views/solutions/Fashion.vue')
    },
    {
      path: '/productos/integraciones',
      name: 'ProductIntegrations',
      component: () => import(/* webpackChunkName: "products-integrations" */ './views/products/ApiGateway.vue')
    },
    {
      path: '/products/integrations',
      redirect: '/productos/integraciones'
    },
    {
      path: '/products/api-gateway',
      redirect: '/productos/integraciones'
    },
    {
      path: '/productos/dashcole',
      name: 'ProductDashCole',
      component: () => import(/* webpackChunkName: "products-dashcole" */ './views/products/DashCole.vue')
    },
    {
      path: '/products/dashcole',
      redirect: '/productos/dashcole'
    },
    {
      path: '/products/nextedu',
      redirect: '/productos/dashcole'
    },
    {
      path: '/products/dashschool',
      redirect: '/productos/dashcole'
    },
    {
      path: '/products/mobile',
      name: 'ProductMobile',
      component: () => import(/* webpackChunkName: "products-mobile" */ './views/products/Mobile.vue')
    },
    {
      path: '/solutions/data-visualization',
      redirect: '/soluciones/gestion-educacional'
    },
    {
      path: '/solutions/startups',
      name: 'Startups',
      component: () => import(/* webpackChunkName: "solutions-startups" */ './views/solutions/Startups.vue')
    },
    {
      path: '/solutions/crypto',
      name: 'Crypto',
      component: () => import(/* webpackChunkName: "solutions-crypto" */ './views/solutions/Crypto.vue')
    },
    {
      path: '/solutions/finance',
      name: 'Finance',
      component: () => import(/* webpackChunkName: "solutions-finance" */ './views/solutions/Finance.vue')
    },
    {
      path: '/tos',
      name: 'TermsOfService',
      component: () => import(/* webpackChunkName: "tos" */ './views/landing/TermsOfService.vue')
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import(/* webpackChunkName: "analytics" */ './views/Analytics.vue')
    },
    {
      path: '/blog/:pathMatch(.*)*',
      name: 'BlogAppRedirect',
      beforeEnter: redirectToBlogApp
    },
    {
      path: '/login',
      name: 'Login',
      component: {
        setup() {
          if (typeof window !== 'undefined') {
            window.location.replace(DASHBOARD_LOGIN_URL)
          }
          return () => null
        },
      },
      beforeEnter: redirectToDashboardLogin,
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactView
    },
    {
      path: '/postular/:schoolId?',
      name: 'Admission',
      component: { render: () => null },
      beforeEnter: redirectToDashboardAdmission
    },
    {
      path: '/signup',
      redirect: '/contact'
    },
    {
      path: '/forgot',
      name: 'ForgotPassword',
      component: () => import(/* webpackChunkName: "forgot-password" */ './views/auth/ForgotPassword.vue')
    },
    {
      path: '/dashboard/:pathMatch(.*)*',
      name: 'DashboardAppRedirect',
      beforeEnter: redirectToDashboardApp
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
        component: () => import(/* webpackChunkName: "not-found" */ './views/landing/NotFound.vue')
    }
  ]
})

// Keep router guard permissive for dashboard and app routes.
router.beforeEach((to) => {
  return true
})

const detectInitialLocale = () => {
  return 'es'
}

// Create i18n
const i18n = createI18n({
  legacy: false, // Enable Composition API mode
  locale: detectInitialLocale(),
  fallbackLocale: 'es',
  messages: {
    en,
    es,
    fr,
    de,
    it,
    hi
  }
})

// Create Vuetify
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#f59e0b',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#10b981'
        }
      }
    }
  }
})

// Create app
const app = createApp(App)

// Use plugins
// Create and configure Pinia
const pinia = createPinia()

// Note: Stores handle persistence manually via localStorage
// If pinia-plugin-persistedstate is installed, it will be used automatically
// Otherwise, stores fall back to manual localStorage persistence

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(vuetify)

// Sync i18n locale with language store after app is created
if (typeof window !== 'undefined') {
  const languageStore = useLanguageStore()
  watch(() => languageStore.locale, (newLocale) => {
    if (newLocale && i18n.global.locale.value !== newLocale) {
      i18n.global.locale.value = newLocale
    }
  }, { immediate: true })
  languageStore.setLocale('es')
  i18n.global.locale.value = 'es'
}

// Track page visits
router.afterEach((to, from) => {
  // Skip tracking for certain routes
  const skipRoutes = ['/login', '/contact', '/signup', '/forgot', '/dashboard/admin']
  
  if (skipRoutes.some(route => to.path.startsWith(route))) {
    return
  }
  
  // Track page visit asynchronously (don't block navigation)
  setTimeout(() => {
    try {
      const token = localStorage.getItem('token')
      // Dashboard sessions are opaque Bearer tokens, not client-decodable JWTs.
      const userId = null
      
      // Get session ID from cookie or create one
      let sessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_id='))
        ?.split('=')[1]
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        document.cookie = `session_id=${sessionId}; path=/; max-age=31536000` // 1 year
      }
      
      // Get user agent and other info
      const userAgent = navigator.userAgent
      const referrer = from.fullPath !== to.fullPath ? document.referrer : null
      
      // Send tracking data to API
      if (import.meta.env.VITE_TRACK_VISITS === 'true') fetch(`${API_BASE_URL}/track/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          route: to.fullPath,
          path: to.path,
          referrer: referrer,
          user_agent: userAgent,
          session_id: sessionId,
          user_id: userId,
          timestamp: new Date().toISOString(),
          source_app: 'web'
        }),
        keepalive: true // Don't block page unload
      }).catch(() => {
        // Silently fail - don't block user experience
        // Network errors are expected when API server is not running
      })
    } catch {
      // Silently fail - network errors are expected when API server is not running
    }
  }, 100)
})

// Mount app
app.mount('#app')

// Apply initial theme on mount
setTimeout(() => {
  const preferencesStore = usePreferencesStore()
  
  // Get theme from localStorage or use default
  const cachedPrefs = localStorage.getItem('user_preferences')
  if (cachedPrefs) {
    try {
      const prefs = JSON.parse(cachedPrefs)
      if (prefs.theme) {
        preferencesStore.preferences.theme = prefs.theme
        // Apply theme
        if (preferencesStore.applyThemeFromPreferences) {
          preferencesStore.applyThemeFromPreferences()
        }
      }
    } catch (e) {
      console.error('Failed to parse cached preferences:', e)
    }
  }
  
  // Also listen for system theme changes if theme is 'auto'
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (preferencesStore.preferences.theme === 'auto') {
      if (preferencesStore.applyThemeFromPreferences) {
        preferencesStore.applyThemeFromPreferences()
      }
    }
  })
}, 0)

// Initialize Lenis only if user does not prefer reduced motion
const prefersReducedMotion = typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!prefersReducedMotion) {
  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    // Enhanced settings for better performance
    lerp: 0.1,
    wheelMultiplier: 1,
    normalizeWheel: true,
    // Sync with GSAP ScrollTrigger
    syncTouch: true
  })

  // Sync Lenis with GSAP ScrollTrigger
  lenisInstance.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenisInstance.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  // Expose Lenis globally for app-level UI features (e.g., scroll-to-top button state)
  window.__lenis = lenisInstance
}
