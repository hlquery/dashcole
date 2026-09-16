<template>
  <div
    class="header-flow-spacer"
    :style="{ backgroundColor: headerBackgroundColor }"
    aria-hidden="true"
  ></div>
  <teleport to="body">
    <header
      ref="headerRef"
      class="header"
      :class="[
        {
          'transparent-header': isTransparentRoute && !forceWhiteHeader,
          'white-header': forceWhiteHeader,
          scrolled: isScrolled,
          'pricing-route': isPricingRoute,
          'header-hidden': !isHeaderVisible,
          'header-visible': true
        },
        (isTransparentRoute && !forceWhiteHeader ? accentClass : '')
      ]"
      :data-accent="accentClass"
      :style="heroBgStyle"
    >
    <nav class="nav">
      <div class="nav-container">
        <!-- Logo -->
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
            <span class="logo-text">DashCole</span>
          </router-link>
        </div>

        <!-- Navigation Menu -->
        <div class="nav-menu" :class="{ 'has-active-dropdown': activeDropdown }">
          <div
            class="nav-item dropdown products-dropdown-wrapper"
            :class="{ 'is-open': activeDropdown === 'products' }"
            @mouseenter="openDropdown('products')"
            @mouseleave="closeDropdown('products')"
            @focusin="openDropdown('products')"
            @focusout="handleDropdownFocusOut($event, 'products')"
          >
            <button
              class="nav-link dropdown-toggle group inline-flex items-center gap-2 font-sohne font-weight-stripe text-stripe-base"
              :class="{ 'is-active-link': isProductsActive }"
              aria-haspopup="true"
              :aria-expanded="activeDropdown === 'products'"
              :aria-label="t('header.productsMenuAria')"
              @click.stop="toggleDropdown('products')"
            >
              <span class="nav-link-text">{{ t('header.products') }}</span>
              <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="dropdown-menu mega-dropdown products-dropdown" ref="productsMenu">
              <div class="dropdown-content mega-dropdown-content mega-dropdown-content-products">
                <div
                  v-for="group in productMenuGroups"
                  :key="group.title"
                  class="mega-dropdown-section"
                >
                  <div class="mega-section-header">
                    <h4>{{ group.title }}</h4>
                  </div>
                  <div class="mega-dropdown-grid mega-dropdown-grid-single">
                    <router-link
                      v-for="link in group.items"
                      :key="link.label"
                      :to="link.to"
                      class="dropdown-link mega-dropdown-link"
                      @click="clearActiveDropdown"
                    >
                      <span class="mega-link-icon" :class="link.iconClass">
                        <font-awesome-icon :icon="link.icon" aria-hidden="true" />
                      </span>
                      <div class="mega-link-copy">
                        <span class="mega-link-title">{{ link.label }}</span>
                        <span class="mega-link-description">{{ link.description }}</span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="nav-item dropdown solutions-dropdown"
            :class="{ 'is-open': activeDropdown === 'solutions' }"
            @mouseenter="openDropdown('solutions')"
            @mouseleave="closeDropdown('solutions')"
            @focusin="openDropdown('solutions')"
            @focusout="handleDropdownFocusOut($event, 'solutions')"
          >
            <button
              class="nav-link dropdown-toggle group inline-flex items-center gap-2 font-sohne font-weight-stripe text-stripe-base"
              :class="{ 'is-active-link': isSolutionsActive }"
              aria-haspopup="true"
              :aria-expanded="activeDropdown === 'solutions'"
              :aria-label="t('header.solutionsMenuAria')"
              @click.stop="toggleDropdown('solutions')"
            >
              <span class="nav-link-text">{{ t('header.solutions') }}</span>
              <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="dropdown-menu mega-dropdown solutions-mega-dropdown" ref="solutionsMenu">
              <div class="dropdown-content mega-dropdown-content mega-dropdown-content-solutions">
                <div
                  v-for="group in solutionMenuGroups"
                  :key="group.title"
                  class="mega-dropdown-section"
                >
                  <div class="mega-section-header">
                    <h4>{{ group.title }}</h4>
                  </div>
                  <div class="mega-dropdown-grid">
                    <router-link
                      v-for="link in group.items"
                      :key="link.label"
                      :to="link.to"
                      class="dropdown-link mega-dropdown-link"
                      @click="clearActiveDropdown"
                    >
                      <span class="mega-link-icon" :class="link.iconClass">
                        <font-awesome-icon :icon="link.icon" aria-hidden="true" />
                      </span>
                      <div class="mega-link-copy">
                        <span class="mega-link-title">{{ link.label }}</span>
                        <span class="mega-link-description">{{ link.description }}</span>
                      </div>
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="nav-item dropdown developers-dropdown-wrapper"
            :class="{ 'is-open': activeDropdown === 'developers' }"
            @mouseenter="openDropdown('developers')"
            @mouseleave="closeDropdown('developers')"
            @focusin="openDropdown('developers')"
            @focusout="handleDropdownFocusOut($event, 'developers')"
          >
            <button
              class="nav-link dropdown-toggle group inline-flex items-center gap-2 font-sohne font-weight-stripe text-stripe-base"
              :class="{ 'is-active-link': isDevelopersActive }"
              aria-haspopup="true"
              :aria-expanded="activeDropdown === 'developers'"
              :aria-label="t('header.developersMenuAria')"
              @click.stop="toggleDropdown('developers')"
            >
              <span class="nav-link-text">{{ t('header.developers') }}</span>
              <svg class="dropdown-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="dropdown-menu developers-dropdown developers-mega-dropdown" ref="developersMenu">
              <div class="dropdown-content developers-mega-content">
                <aside class="developers-why-panel">
                  <div class="developers-why-inner">
                    <h4>{{ t('header.developersWhyTitle') }}</h4>
                    <h5>{{ t('header.developersWhyHeadline') }}</h5>
                  </div>
                  <a
                    :href="getStartedUrl"
                    class="developers-why-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    @click="clearActiveDropdown"
                  >
                    <span>{{ t('header.developersWhyCta') }}</span>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                </aside>
                <div class="dropdown-section">
                  <div class="section-header">
                    <h4>{{ t('header.resources') }}</h4>
                  </div>
                  <div v-for="resource in developerResources" :key="resource.label">
                    <a
                      :href="resource.href"
                      class="dropdown-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      @click="clearActiveDropdown"
                    >
                      <span class="mega-link-icon" :class="resource.iconClass">
                        <font-awesome-icon :icon="resource.icon" aria-hidden="true" />
                      </span>
                      <div class="mega-link-copy">
                        <span class="mega-link-title">{{ resource.label }}</span>
                        <span class="mega-link-description">{{ resource.description }}</span>
                      </div>
                    </a>
                  </div>
                </div>
                <div class="dropdown-section">
                  <div class="section-header">
                    <h4>{{ t('header.support') }}</h4>
                  </div>
                  <div v-for="support in developerSupport" :key="support.label">
                    <component
                      :is="support.href ? 'a' : 'router-link'"
                      v-bind="support.href
                        ? { href: support.href, target: '_blank', rel: 'noopener noreferrer' }
                        : { to: support.to }"
                      class="dropdown-link"
                      :class="support.extraClass"
                      @click="clearActiveDropdown"
                    >
                      <span class="mega-link-icon" :class="support.iconClass">
                        <font-awesome-icon :icon="support.icon" aria-hidden="true" />
                      </span>
                      <div class="mega-link-copy">
                        <span class="mega-link-title">{{ support.label }}</span>
                        <span class="mega-link-description">{{ support.description }}</span>
                      </div>
                    </component>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="nav-item nav-item-direct">
            <router-link
              to="/que-hacemos"
              class="nav-link nav-link-direct"
              :class="{ 'is-active-link': route.path.startsWith('/que-hacemos') }"
            >
              <span class="nav-link-text">{{ t('header.pricing') }}</span>
              <svg class="nav-hover-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
          </div>
        </div>

        <!-- Auth Section -->
        <div class="nav-auth">
          <button
            class="mobile-menu-toggle"
            type="button"
            :aria-expanded="mobileMenuOpen"
            aria-controls="mobile-navigation"
            :aria-label="mobileMenuOpen ? t('close') : t('header.productsMenuAria')"
            @click.stop="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg v-if="!mobileMenuOpen" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <div class="auth-buttons">
            <a :href="dashboardLoginUrl" class="signin-link" :aria-label="t('header.demoAria')">
              {{ t('header.demo') }}
              <svg class="signin-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div v-if="mobileMenuOpen" id="mobile-navigation" class="mobile-navigation" @click.stop>
        <section class="mobile-navigation-section">
          <strong>{{ t('header.products') }}</strong>
          <router-link v-for="link in productLinks" :key="link.to" :to="link.to" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="link.icon" aria-hidden="true" />
            <span>{{ link.label }}</span>
          </router-link>
        </section>

        <section class="mobile-navigation-section">
          <strong>{{ t('header.solutions') }}</strong>
          <router-link v-for="link in solutionLinks" :key="link.to" :to="link.to" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="link.icon" aria-hidden="true" />
            <span>{{ link.label }}</span>
          </router-link>
        </section>

        <section class="mobile-navigation-section">
          <strong>{{ t('header.developers') }}</strong>
          <a :href="getStartedUrl" target="_blank" rel="noopener noreferrer" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="faRocket" aria-hidden="true" />
            <span>{{ t('header.getStarted') }}</span>
          </a>
          <a :href="guidesUrl" target="_blank" rel="noopener noreferrer" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="faBookOpen" aria-hidden="true" />
            <span>{{ t('header.guides') }}</span>
          </a>
          <router-link to="/faq" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="faCircleInfo" aria-hidden="true" />
            <span>{{ t('header.faq') }}</span>
          </router-link>
          <a href="https://github.com/hlquery/dashcole" target="_blank" rel="noopener noreferrer" @click="mobileMenuOpen = false">
            <font-awesome-icon :icon="faGithub" aria-hidden="true" />
            <span>{{ t('header.github') }}</span>
          </a>
        </section>

        <section class="mobile-navigation-section mobile-navigation-section--compact">
          <strong>{{ t('header.resources') }}</strong>
          <router-link to="/que-hacemos" @click="mobileMenuOpen = false">{{ t('header.pricing') }}</router-link>
          <router-link to="/contact" @click="mobileMenuOpen = false">{{ t('header.contactSupport') }}</router-link>
          <a :href="dashboardLoginUrl" class="mobile-login-link" @click="mobileMenuOpen = false">{{ t('header.demo') }}</a>
        </section>
      </div>
    </nav>
    </header>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, watchEffect, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { gsap } from 'gsap'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  forceWhiteHeader: {
    type: Boolean,
    default: false
  },
  forceTransparentHeader: {
    type: Boolean,
    default: false
  },
  forceHeaderBackgroundColor: {
    type: String,
    default: ''
  },
  heroBgColor: {
    type: String,
    default: ''
  }
})

const dashboardLoginUrl = import.meta.env.VITE_LOGIN_URL || 'https://dashboard.hlquery.com/login'
import { 
  faThLarge,           // Dashboard
  faGauge,             // Dashboard Classic
  faChartLine,         // Hanalyzer (analytics)
  faMobileScreen,      // Mobile
  faDatabase,          // dashcole
  faMagnifyingGlass,   // dashcole search
  faShoppingCart,      // E-commerce
  faCloud,             // SaaS
  faBuildingColumns,   // Finance
  faShirt,             // Fashion
  faClock,             // Status
  faNetworkWired,      // Web Manager
  faBookOpen,          // Guides
  faRocket,            // Get started
  faCircleInfo,        // FAQ
  faLifeRing,          // Help icon
  faEnvelope           // Community
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

library.add(
  faThLarge, faGauge, faChartLine, faMobileScreen, faDatabase, faMagnifyingGlass,
  faShoppingCart, faCloud, faBuildingColumns, faShirt, faClock, faNetworkWired,
  faBookOpen, faRocket, faCircleInfo, faLifeRing, faEnvelope, faGithub
)

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
const guidesUrl = import.meta.env.VITE_GUIDES_URL || 'https://guias.hlquery.com/'
const getStartedUrl = import.meta.env.VITE_GET_STARTED_URL || 'https://guias.hlquery.com/installation/como-instalar-dashcole'
const liveDemoUrl = import.meta.env.VITE_LIVE_DEMO_URL || 'https://dashboard.hlquery.com/login'

// Use storeToRefs to ensure reactivity
const { isAuthenticated, user } = storeToRefs(authStore)

const showUserDropdown = ref(false)
const activeDropdown = ref(null)
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const isHeaderVisible = ref(true)
const productsMenu = ref(null)
const solutionsMenu = ref(null)
const developersMenu = ref(null)
const headerRef = ref(null)

const productLinks = computed(() => [
  {
    to: '/productos/dashcole',
    label: t('header.productDashCole'),
    description: t('header.productDashColeDesc'),
    icon: faDatabase,
    iconClass: 'icon-dashcole-search'
  },
  {
    to: '/productos/integraciones',
    label: t('header.productApiGateway'),
    description: t('header.productApiGatewayDesc'),
    icon: faNetworkWired,
    iconClass: 'icon-api'
  }
])

const solutionLinks = computed(() => [
  {
    to: '/solutions/saas',
    label: t('header.solutionSaas'),
    description: t('header.solutionSaasDesc'),
    icon: faCloud,
    iconClass: 'icon-cloud'
  },
  {
    to: '/soluciones/gestion-educacional',
    label: t('header.solutionEcommerce'),
    description: t('header.solutionEcommerceDesc'),
    icon: faShoppingCart,
    iconClass: 'icon-commerce'
  },
  {
    to: '/solutions/finance',
    label: t('header.solutionFinance'),
    description: t('header.solutionFinanceDesc'),
    icon: faBuildingColumns,
    iconClass: 'icon-finance'
  },
  {
    to: '/soluciones/jardines',
    label: t('header.solutionFashion'),
    description: t('header.solutionFashionDesc'),
    icon: faShirt,
    iconClass: 'icon-fashion'
  }
])

const productMenuGroups = computed(() => [
  {
    title: t('header.products'),
    items: productLinks.value
  }
])

const solutionMenuGroups = computed(() => [
  {
    title: t('header.useCases'),
    items: solutionLinks.value
  }
])

const developerResources = computed(() => [
  {
    href: getStartedUrl,
    label: t('header.getStarted'),
    description: t('header.getStartedDesc'),
    icon: faRocket,
    iconClass: 'icon-get-started'
  },
  {
    href: guidesUrl,
    label: t('header.guides'),
    description: t('header.guidesDesc'),
    icon: faBookOpen,
    iconClass: 'icon-guides'
  }
])

const developerSupport = computed(() => [
  {
    href: 'https://github.com/hlquery/dashcole',
    label: t('header.github'),
    description: t('header.githubDesc'),
    icon: faGithub,
    iconClass: 'icon-github'
  },
  {
    to: '/faq',
    label: t('header.faq'),
    description: t('header.faqDesc'),
    extraClass: 'faq-link',
    icon: faCircleInfo,
    iconClass: 'icon-faq'
  },
  {
    href: liveDemoUrl,
    label: t('header.helpCenter'),
    description: t('header.helpCenterDesc'),
    extraClass: 'help-center-link',
    icon: faLifeRing,
    iconClass: 'icon-help'
  },
  {
    to: '/contact',
    label: t('header.contactSupport'),
    description: t('header.contactSupportDesc'),
    extraClass: 'contact-support-link',
    icon: faEnvelope,
    iconClass: 'icon-contact'
  }
])

const HEADER_DEFAULT_COLOR = '#f8fafc'
const ECOMMERCE_HEADER_BG = '#f7fbff'
const headerBackgroundColor = ref(HEADER_DEFAULT_COLOR)
const TRANSPARENT_VALUES = new Set(['', 'transparent', 'rgba(0, 0, 0, 0)', 'rgba(0,0,0,0)'])

let backgroundUpdateTimeout = null
let dropdownCloseTimer = null
let lenisScrollHandler = null
let lenisAttachIntervalId = null
let headerIdleHideTimer = null
let lastScrollY = 0
let lastTouchY = 0
let keepHeaderVisibleUntil = 0
const HEADER_SCROLL_DELTA = 6
const HEADER_UPWARD_INTENT_LOCK_MS = 900
const HEADER_IDLE_HIDE_MS = 1100

const normalizeColorValue = (value) => {
  if (!value) return ''
  const normalized = value.trim().toLowerCase()
  if (TRANSPARENT_VALUES.has(normalized)) return ''
  return value.trim()
}

const COLOR_TOKEN_REGEX = /(rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[0-9.]+)?\)|#[0-9a-fA-F]{3,8})/

const extractColorToken = (input) => {
  if (!input || input === 'none') return ''
  const match = input.match(COLOR_TOKEN_REGEX)
  if (match && match[1]) {
    return normalizeColorValue(match[1])
  }
  return ''
}

const parseColorChannels = (value) => {
  if (!value) return null
  const color = value.trim()
  if (color.startsWith('#')) {
    let hex = color.slice(1)
    if (![3, 4, 6, 8].includes(hex.length)) return null
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((char) => char + char).join('')
    }
    const hasAlpha = hex.length === 8
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    const a = hasAlpha ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1
    if ([r, g, b, a].some((channel) => Number.isNaN(channel))) return null
    return { r, g, b, a }
  }
  const match = color.match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)/i)
  if (!match) return null
  const r = Number(match[1])
  const g = Number(match[2])
  const b = Number(match[3])
  const a = match[4] !== undefined ? Number(match[4]) : 1
  if ([r, g, b, a].some((channel) => Number.isNaN(channel))) return null
  return { r, g, b, a }
}

const getPerceivedLuminance = (colorValue) => {
  const channels = parseColorChannels(colorValue)
  if (!channels) return null
  const { r, g, b } = channels
  return ((0.2126 * r) + (0.7152 * g) + (0.0722 * b)) / 255
}

const getActiveOutlineColor = (backgroundColor) => {
  const luminance = getPerceivedLuminance(backgroundColor)
  if (luminance === null) return 'rgba(255, 255, 255, 0.72)'
  if (luminance < 0.45) return 'rgba(255, 255, 255, 0.82)'
  if (luminance < 0.72) return 'rgba(255, 255, 255, 0.64)'
  return 'rgba(15, 23, 42, 0.20)'
}

const getActiveSurfaceColor = (backgroundColor) => {
  const luminance = getPerceivedLuminance(backgroundColor)
  if (luminance === null) return 'rgba(255, 255, 255, 0.76)'
  if (luminance < 0.45) return 'rgba(255, 255, 255, 0.18)'
  if (luminance < 0.72) return 'rgba(255, 255, 255, 0.62)'
  return 'rgba(255, 255, 255, 0.82)'
}

const getActiveShadowColor = (backgroundColor) => {
  const luminance = getPerceivedLuminance(backgroundColor)
  if (luminance === null) return 'rgba(15, 23, 42, 0.16)'
  if (luminance < 0.45) return 'rgba(0, 0, 0, 0.34)'
  if (luminance < 0.72) return 'rgba(15, 23, 42, 0.20)'
  return 'rgba(15, 23, 42, 0.14)'
}

const resolveElementBackground = (element) => {
  if (!element || typeof window === 'undefined') return ''
  const styles = window.getComputedStyle(element)
  if (!styles) return ''
  const bgColor = normalizeColorValue(styles.backgroundColor || '')
  if (bgColor) return bgColor
  const gradientColor = extractColorToken(styles.backgroundImage || '')
  if (gradientColor) return gradientColor
  return ''
}

const resolveBackgroundFromElement = (element) => {
  const color = resolveElementBackground(element)
  if (color) return color
  if (!element || !element.children) return ''
  for (const child of element.children) {
    const childColor = resolveElementBackground(child)
    if (childColor) return childColor
  }
  return ''
}

const findNearestBackgroundColor = () => {
  if (typeof window === 'undefined') return HEADER_DEFAULT_COLOR
  const headerEl = headerRef.value
  if (!headerEl) return HEADER_DEFAULT_COLOR

  const parent = headerEl.parentElement
  if (parent) {
    const parentColor = resolveBackgroundFromElement(parent)
    if (parentColor) return parentColor
  }

  if (parent) {
    const siblings = Array.from(parent.children)
    const headerIndex = siblings.indexOf(headerEl)
    if (headerIndex !== -1) {
      for (let i = headerIndex + 1; i < siblings.length; i++) {
        const siblingColor = resolveBackgroundFromElement(siblings[i])
        if (siblingColor) return siblingColor
      }
      for (let i = headerIndex - 1; i >= 0; i--) {
        const siblingColor = resolveBackgroundFromElement(siblings[i])
        if (siblingColor) return siblingColor
      }
    }
  }

  let ancestor = parent?.parentElement || null
  while (ancestor) {
    const ancestorColor = resolveBackgroundFromElement(ancestor)
    if (ancestorColor) return ancestorColor
    ancestor = ancestor.parentElement
  }

  const fallbackSelectors = ['#app', 'main', 'body']
  for (const selector of fallbackSelectors) {
    const element = document.querySelector(selector)
    const fallbackColor = resolveBackgroundFromElement(element)
    if (fallbackColor) return fallbackColor
  }

  return HEADER_DEFAULT_COLOR
}

const applyHeaderBackground = (color, priority = false) => {
  const headerEl = headerRef.value
  if (!headerEl) return
  const outlineColor = getActiveOutlineColor(color || HEADER_DEFAULT_COLOR)
  const surfaceColor = getActiveSurfaceColor(color || HEADER_DEFAULT_COLOR)
  const shadowColor = getActiveShadowColor(color || HEADER_DEFAULT_COLOR)
  headerEl.style.setProperty('--nav-active-outline', outlineColor)
  headerEl.style.setProperty('--nav-active-surface', surfaceColor)
  headerEl.style.setProperty('--nav-active-shadow', shadowColor)
  if (!color) {
    headerEl.style.removeProperty('background')
    return
  }
  try {
    headerEl.style.setProperty('background', color, priority ? 'important' : '')
  } catch (error) {
    headerEl.style.background = color
  }
}

const updateHeaderBackground = () => {
  if (typeof window === 'undefined') return
  if (props.forceHeaderBackgroundColor) {
    const forcedColor = props.forceHeaderBackgroundColor
    headerBackgroundColor.value = forcedColor
    if (headerRef.value?.dataset) {
      headerRef.value.dataset.headerBg = forcedColor
    }
    applyHeaderBackground(forcedColor, true)
    return
  }

  if (props.forceTransparentHeader) {
    headerBackgroundColor.value = 'transparent'
    if (headerRef.value?.dataset) {
      delete headerRef.value.dataset.headerBg
    }
    applyHeaderBackground('', false)
    return
  }

  if (props.forceWhiteHeader || !isTransparentRoute.value) {
    headerBackgroundColor.value = HEADER_DEFAULT_COLOR
    if (headerRef.value?.dataset) {
      delete headerRef.value.dataset.headerBg
    }
    applyHeaderBackground(HEADER_DEFAULT_COLOR, true)
    return
  }

  const isEcommerceTop = window.location.pathname.startsWith('/soluciones/gestion-educacional') && !isScrolled.value
  if (isEcommerceTop) {
    headerBackgroundColor.value = ECOMMERCE_HEADER_BG
    if (headerRef.value?.dataset) {
      headerRef.value.dataset.headerBg = ECOMMERCE_HEADER_BG
    }
    applyHeaderBackground(ECOMMERCE_HEADER_BG, true)
    return
  }

  const detectedColor = findNearestBackgroundColor() || HEADER_DEFAULT_COLOR
  headerBackgroundColor.value = detectedColor
  if (headerRef.value?.dataset) {
    headerRef.value.dataset.headerBg = detectedColor
  }
  applyHeaderBackground(detectedColor, true)
}

const scheduleHeaderBackgroundUpdate = (delay = 0) => {
  if (typeof window === 'undefined') return
  if (backgroundUpdateTimeout) {
    window.clearTimeout(backgroundUpdateTimeout)
  }
  backgroundUpdateTimeout = window.setTimeout(() => {
    backgroundUpdateTimeout = null
    updateHeaderBackground()
  }, Math.max(delay, 0))
}
const currentRoute = computed(() => router.currentRoute.value.path)
const isPricingRoute = computed(() => currentRoute.value.startsWith('/que-hacemos'))
const isTransparentRoute = computed(() => {
  if (props.forceWhiteHeader) return false
  return currentRoute.value === '/' || 
         currentRoute.value.startsWith('/que-hacemos') ||
         currentRoute.value.startsWith('/products/') ||
         currentRoute.value.startsWith('/productos/') ||
         currentRoute.value.startsWith('/solutions/') ||
         currentRoute.value.startsWith('/soluciones/') ||
         currentRoute.value.startsWith('/developers/') ||
         currentRoute.value === '/contact' ||
         currentRoute.value === '/contact-form'
})


const isDocs = computed(() => {
  return currentRoute.value === '/docs' || currentRoute.value.startsWith('/docs/')
})

const isDashboardRoute = computed(() => {
  return false
})

const isLandingPage = computed(() => {
  return currentRoute.value === '/' || currentRoute.value === ''
})

const isProductsActive = computed(() => {
  return currentRoute.value.startsWith('/products/') ||
    currentRoute.value.startsWith('/productos/')
})

const isSolutionsActive = computed(() => {
  return currentRoute.value.startsWith('/solutions/') ||
    currentRoute.value.startsWith('/soluciones/')
})

const isDevelopersActive = computed(() => {
  return currentRoute.value === '/docs' ||
    currentRoute.value.startsWith('/docs/') ||
    currentRoute.value.startsWith('/faq') ||
    currentRoute.value.startsWith('/contact')
})

const isDevelopment = computed(() => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.includes('dev')
})

// Accent color class per route, used only when header is transparent
const accentClass = computed(() => {
  const path = currentRoute.value
  if (path.startsWith('/solutions/finance')) return 'accent-finance'
  if (path.startsWith('/soluciones/gestion-educacional')) return 'accent-blue'
  if (path.startsWith('/products/dashcole') || path.startsWith('/productos/dashcole')) return 'accent-indigo'
  if (path.startsWith('/productos/integraciones') || path.startsWith('/products/integrations') || path.startsWith('/products/api-gateway')) return 'accent-indigo'
  if (path.startsWith('/products/mobile')) return 'accent-red'
  if (path === '/' || path.startsWith('/products/')) return 'accent-blue'
  if (path.startsWith('/solutions/')) return 'accent-sky'
  if (path.startsWith('/developers/')) return 'accent-sky'
  return 'accent-blue'
})

const heroBgStyle = computed(() => {
  const color = props.heroBgColor?.trim()
  return color ? { '--hero-bg-color': color } : {}
})

const isLoggedIn = computed(() => {
  return isAuthenticated.value && user.value !== null
})
const userEmail = computed(() => {
  return user.value?.email || ''
})
const userFullName = computed(() => {
  const firstName = user.value?.first_name || user.value?.first || ''
  const lastName = user.value?.last_name || user.value?.last || ''
  if (firstName && lastName) {
    return `${firstName} ${lastName}`.trim()
  } else if (firstName) {
    return firstName
  } else if (lastName) {
    return lastName
  }
  // Fallback to email username if no name available
  const email = userEmail.value
  if (!email) return 'User'
  const username = email.split('@')[0]
  return username.charAt(0).toUpperCase() + username.slice(1)
})
const userInitials = computed(() => {
  const email = userEmail.value
  if (!email) return 'U'
  return email.split('@')[0].substring(0, 2).toUpperCase()
})
const isAdmin = computed(() => {
  const userFlags = user.value?.flags || []
  const adminFlags = ['root', 'admin', 'content_manager']
  return userFlags.some(flag => adminFlags.includes(flag.flag_type))
})

const handleResize = () => {
  scheduleHeaderBackgroundUpdate(80)
}

const getCurrentScrollY = () => {
  if (typeof window === 'undefined') return
  const lenis = window.__lenis
  const lenisScroll = Number(lenis?.animatedScroll ?? lenis?.scroll ?? NaN)
  if (Number.isFinite(lenisScroll)) return Math.max(lenisScroll, 0)
  return Math.max(
    Number(window.scrollY || 0),
    Number(document.documentElement?.scrollTop || 0),
    Number(document.body?.scrollTop || 0),
    0
  )
}

const clearHeaderIdleHide = () => {
  if (!headerIdleHideTimer) return
  window.clearTimeout(headerIdleHideTimer)
  headerIdleHideTimer = null
}

const scheduleHeaderIdleHide = () => {
  clearHeaderIdleHide()
  if (getCurrentScrollY() <= 8 || activeDropdown.value) return

  headerIdleHideTimer = window.setTimeout(() => {
    if (getCurrentScrollY() > 8 && !activeDropdown.value) {
      isHeaderVisible.value = false
    }
    headerIdleHideTimer = null
  }, HEADER_IDLE_HIDE_MS)
}

const updateHeaderForScroll = (scrollValue = getCurrentScrollY()) => {
  const currentScrollY = Math.max(Number(scrollValue || 0), 0)
  const scrollDelta = currentScrollY - lastScrollY

  isScrolled.value = currentScrollY > 8

  if (currentScrollY <= 8) {
    clearHeaderIdleHide()
    isHeaderVisible.value = true
  } else if (activeDropdown.value) {
    clearHeaderIdleHide()
    isHeaderVisible.value = true
  } else if (scrollDelta <= -HEADER_SCROLL_DELTA) {
    showHeaderOnUpwardIntent()
  } else if (scrollDelta >= HEADER_SCROLL_DELTA) {
    clearHeaderIdleHide()
    isHeaderVisible.value = false
  } else if (Date.now() < keepHeaderVisibleUntil) {
    isHeaderVisible.value = true
  }

  lastScrollY = currentScrollY
}

const handleWindowScroll = () => {
  if (typeof window === 'undefined') return
  updateHeaderForScroll()
}

const showHeaderOnUpwardIntent = () => {
  keepHeaderVisibleUntil = Date.now() + HEADER_UPWARD_INTENT_LOCK_MS
  isHeaderVisible.value = true
  scheduleHeaderIdleHide()
}

const handleWindowWheel = (event) => {
  if (event.deltaY < 0) {
    showHeaderOnUpwardIntent()
  }
}

const handleWindowTouchStart = (event) => {
  lastTouchY = event.touches?.[0]?.clientY || 0
}

const handleWindowTouchMove = (event) => {
  const currentTouchY = event.touches?.[0]?.clientY || 0
  if (currentTouchY > lastTouchY) {
    showHeaderOnUpwardIntent()
  }
  lastTouchY = currentTouchY
}

const attachLenisScrollListener = () => {
  if (typeof window === 'undefined' || lenisScrollHandler) return false
  const lenis = window.__lenis
  if (!lenis || typeof lenis.on !== 'function') return false
  lenisScrollHandler = (event) => {
    updateHeaderForScroll(event?.scroll ?? getCurrentScrollY())
  }
  lenis.on('scroll', lenisScrollHandler)
  updateHeaderForScroll(getCurrentScrollY())
  return true
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const openDropdown = (name) => {
  if (dropdownCloseTimer) {
    clearTimeout(dropdownCloseTimer)
    dropdownCloseTimer = null
  }
  clearHeaderIdleHide()
  isHeaderVisible.value = true
  activeDropdown.value = name
}

const closeDropdown = (name) => {
  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer)
  dropdownCloseTimer = window.setTimeout(() => {
    if (activeDropdown.value === name) {
      activeDropdown.value = null
      scheduleHeaderIdleHide()
    }
    dropdownCloseTimer = null
  }, 80)
}

const toggleDropdown = (name) => {
  if (activeDropdown.value === name) {
    activeDropdown.value = null
    return
  }
  openDropdown(name)
}

const clearActiveDropdown = () => {
  if (dropdownCloseTimer) {
    clearTimeout(dropdownCloseTimer)
    dropdownCloseTimer = null
  }
  activeDropdown.value = null
}

const handleDropdownFocusOut = (event, name) => {
  const nextTarget = event.relatedTarget
  if (nextTarget instanceof Node && event.currentTarget?.contains(nextTarget)) return
  closeDropdown(name)
}

const handleClickOutside = (event) => {
  if (!headerRef.value?.contains(event.target)) {
    clearActiveDropdown()
    mobileMenuOpen.value = false
  }
}

const goToProfile = () => {
  router.push('/login')
  showUserDropdown.value = false
}

const goToSettings = () => {
  router.push('/login')
  showUserDropdown.value = false
}

const goToAdmin = () => {
  router.push('/login')
  showUserDropdown.value = false
}

const goToAdminUsers = () => {
  router.push('/login')
  showUserDropdown.value = false
}

const goToBlogManagement = () => {
  router.push('/login')
  showUserDropdown.value = false
}

const logout = () => {
  authStore.logout()
  router.push('/')
  showUserDropdown.value = false
}

// Watch for auth state changes to ensure reactivity
watchEffect(() => {
  // Force reactivity by accessing both values
  const authenticated = isAuthenticated.value
  const currentUser = user.value
  // This effect ensures the computed properties update when auth changes
  if (authenticated && currentUser) {
    // Auth state is ready
  }
})

watch(() => router.currentRoute.value.path, () => {
  mobileMenuOpen.value = false
  clearHeaderIdleHide()
  lastScrollY = getCurrentScrollY() || 0
  isHeaderVisible.value = lastScrollY <= 8
  scheduleHeaderBackgroundUpdate(80)
})

watch(isTransparentRoute, () => {
  scheduleHeaderBackgroundUpdate(0)
})

watch(() => props.forceWhiteHeader, () => {
  scheduleHeaderBackgroundUpdate(0)
})

onMounted(() => {
  // Restore authentication state from localStorage if present
  const token = localStorage.getItem('token')
  const storedAuthUser = localStorage.getItem('auth_user')
  
  // Always check and restore on mount, regardless of current state
  if (token && storedAuthUser) {
    try {
      const userData = JSON.parse(storedAuthUser)
      // Only set auth if we have valid user data and aren't already authenticated
      if (userData && userData.email && (!isAuthenticated.value || !user.value)) {
        const serverData = localStorage.getItem('server')
        authStore.setAuth(userData, token, serverData ? JSON.parse(serverData) : null)
        
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
      console.error('Error restoring auth:', e)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('token')
      localStorage.removeItem('server')
    }
  } else if (!token || !storedAuthUser) {
    // If no localStorage data, ensure auth is cleared
    if (isAuthenticated.value) {
      authStore.clearAuth()
    }
  }
  
  window.addEventListener('resize', handleResize, { passive: true })
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('wheel', handleWindowWheel, { passive: true })
  window.addEventListener('touchstart', handleWindowTouchStart, { passive: true })
  window.addEventListener('touchmove', handleWindowTouchMove, { passive: true })
  lastScrollY = getCurrentScrollY() || 0
  isHeaderVisible.value = lastScrollY <= 8
  handleWindowScroll()
  attachLenisScrollListener()
  lenisAttachIntervalId = window.setInterval(() => {
    if (attachLenisScrollListener() && lenisAttachIntervalId) {
      window.clearInterval(lenisAttachIntervalId)
      lenisAttachIntervalId = null
    }
  }, 250)
  scheduleHeaderBackgroundUpdate(0)
  document.addEventListener('click', handleClickOutside)

  // Setup dropdown animations with GSAP
  nextTick(() => {
    const dropdowns = [
      { ref: productsMenu, name: 'products' },
      { ref: solutionsMenu, name: 'solutions' },
      { ref: developersMenu, name: 'developers' }
    ]
    
    dropdowns.forEach(({ ref, name }) => {
      if (ref.value) {
        const menu = ref.value
        const links = menu.querySelectorAll('.dropdown-link')
        const sections = menu.querySelectorAll('.dropdown-section, .mega-dropdown-section')
        
        // Initial state: keep links visible.
        // Animations should never make the menu look "empty" on first hover.
        gsap.set(links, { opacity: 1 })
        
        // Watch for hover on parent dropdown
        const parent = menu.closest('.dropdown')
        if (parent) {
          let tl = null
          
          // Use a single event listener with proper event handling to avoid double triggers
          let isHovering = false
          let hoverTimeout = null
          
          parent.addEventListener('mouseenter', () => {
            // Clear any pending timeouts
            if (hoverTimeout) {
              clearTimeout(hoverTimeout)
              hoverTimeout = null
            }
            
            // Only animate if not already hovering
            if (isHovering) return
            isHovering = true
            
            // Kill any existing timeline
            if (tl) {
              tl.kill()
              tl = null
            }
            
            // Check if we're on landing page (transparent header)
            const isLandingPage = parent.closest('.header')?.classList.contains('transparent-header')
            
            // Always make links visible immediately to avoid the "double hover" / empty menu effect.
            gsap.killTweensOf(links)
            gsap.set(links, { opacity: 1, clearProps: 'all', immediateRender: true })

            // Optional: subtle stagger-in (opacity only). Keep it fast and non-blocking.
            tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
            
            // Animate sections first, then links within each section - use opacity only
            const animationSections = sections.length ? sections : [menu]
            animationSections.forEach((section, sectionIdx) => {
              const sectionLinks = section.querySelectorAll('.dropdown-link')
              // On landing page, use faster/simpler animation to prevent double hover
              const duration = isLandingPage ? 0.15 : 0.25
              const stagger = isLandingPage ? 0.01 : 0.025
              tl.fromTo(
                sectionLinks,
                { opacity: 0.92 },
                {
                  opacity: 1,
                  duration,
                  stagger,
                  delay: sectionIdx * (isLandingPage ? 0.03 : 0.05)
                },
                sectionIdx * (isLandingPage ? 0.05 : 0.08)
              )
            })
          }, { once: false, passive: true })
          
          // Stop animations when hovering over individual links - CRITICAL for landing page
          links.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
              e.stopPropagation() // Stop event from bubbling to parent
              e.stopImmediatePropagation() // Also stop any other handlers
              
              // Check if we're on landing page
              const isLandingPage = parent.closest('.header')?.classList.contains('transparent-header')
              
              // Kill GSAP timeline when hovering individual link
              if (tl) {
                tl.kill()
                tl = null
              }
              
              // Immediately set all links to fully visible to prevent double hover effect
              // CRITICAL: On landing page, we MUST stop all animations immediately
              if (isLandingPage) {
                gsap.killTweensOf(links) // Kill all tweens on links
                gsap.set(links, { 
                  opacity: 1, 
                  clearProps: 'all',
                  immediateRender: true
                })
              } else {
                gsap.set(links, { opacity: 1, clearProps: 'all' })
              }
            }, { passive: true })
          })
          
          parent.addEventListener('mouseleave', () => {
            // Use timeout to debounce hover state
            hoverTimeout = setTimeout(() => {
              isHovering = false
              // Don't fade links to 0 on leave; CSS already hides the menu.
              if (tl) {
                tl.kill()
                tl = null
              }
              gsap.killTweensOf(links)
              gsap.set(links, { opacity: 1, clearProps: 'transform' })
            }, 50)
          }, { passive: true })
        }
      }
    })
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('wheel', handleWindowWheel)
  window.removeEventListener('touchstart', handleWindowTouchStart)
  window.removeEventListener('touchmove', handleWindowTouchMove)
  document.removeEventListener('click', handleClickOutside)
  if (lenisAttachIntervalId) {
    window.clearInterval(lenisAttachIntervalId)
    lenisAttachIntervalId = null
  }
  const lenis = window.__lenis
  if (lenis && lenisScrollHandler && typeof lenis.off === 'function') {
    lenis.off('scroll', lenisScrollHandler)
  }
  lenisScrollHandler = null
  if (dropdownCloseTimer) {
    clearTimeout(dropdownCloseTimer)
    dropdownCloseTimer = null
  }
  clearHeaderIdleHide()
})
</script>

<style scoped>
/* Import Stripe-like fonts */

/* Header Styles */
.header {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  z-index: 10000 !important;
  background: transparent !important;
  backdrop-filter: blur(0px) !important;
  -webkit-backdrop-filter: blur(0px) !important;
  border-bottom: none;
  box-shadow: none;
  transition:
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    backdrop-filter 0.38s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.38s cubic-bezier(0.22, 1, 0.36, 1);
  font-family: var(--font-family-sohne);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  pointer-events: auto !important; /* CRITICAL: Header MUST receive events */
  isolation: isolate; /* Create stacking context to prevent page content interference */
  /* Force header to be on its own compositing layer */
  transform: translate3d(0, 0, 0) !important;
  will-change: transform;
}

.header.header-visible {
  transform: translate3d(0, 0, 0) !important;
}

.header.header-hidden {
  transform: translate3d(0, -100%, 0) !important;
}

.header.scrolled {
  background: rgba(255, 255, 255, 0.88) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-bottom: none !important;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06) !important;
}

/* Ensure landing page header is always transparent */
/* removed force rule to allow explicit states below */

/* White Header - Force white background and dark text */
.header.white-header {
  background: #ffffff !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: none !important;
  z-index: 10000 !important;
  position: fixed !important;
  top: 0 !important;
  isolation: isolate;
  pointer-events: auto !important;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.05) !important;
}

.header.white-header .logo-text {
  color: #1e293b !important;
}

.header.white-header .nav-link,
.header.white-header .nav-link span,
.header.white-header .nav-link-text {
  color: #1e293b !important;
}

.header.white-header .nav-link:hover,
.header.white-header .dropdown-link:hover {
  color: #3b82f6 !important;
}

.header.white-header .signin-link {
  color: #ffffff !important;
}

.header.white-header .signin-link:hover {
  color: #ffffff !important;
}

.header.white-header .signup-btn,
.header.white-header .signup-button {
  background: #3b82f6 !important;
  color: white !important;
}

.header.white-header .signup-btn:hover,
.header.white-header .signup-button:hover {
  background: #2563eb !important;
}

.header.white-header .dropdown-chevron {
  color: #1e293b !important;
}

.header.white-header.scrolled {
  background: #ffffff !important;
  border-bottom: none !important;
}

.header.transparent-header {
  background: var(--hero-bg-color, #f8fafc) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-bottom: none !important;
  z-index: 10000 !important; /* Keep above landing hero */
  position: fixed !important;
  top: 0 !important;
  isolation: isolate; /* Create new stacking context to prevent interference */
  pointer-events: auto !important; /* CRITICAL: Header MUST receive pointer events */
  transform: translate3d(0, 0, 0) !important;
  will-change: transform;
}

/* Ensure all header children can receive pointer events when transparent */
.header.transparent-header * {
  pointer-events: auto !important;
}

/* CRITICAL: Logo and nav-logo must receive events */
.header.transparent-header .nav-logo {
  z-index: 100002 !important; /* Above header base and nav-container */
  pointer-events: auto !important;
  position: relative;
}

.header.transparent-header .nav-logo .logo-link {
  pointer-events: auto !important;
  cursor: pointer !important;
  z-index: 100003 !important;
  position: relative;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
}

.header.transparent-header .nav-logo .logo-link .logo-text {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Accent color variables per route when transparent */
.header.transparent-header.accent-blue { --accent: #2563eb; }
.header.transparent-header.accent-indigo { --accent: #2563eb; }
.header.transparent-header.accent-emerald { --accent: #10b981; }
.header.transparent-header.accent-red { --accent: #ef4444; }
.header.transparent-header.accent-sky { --accent: #0ea5e9; }
.header.transparent-header.accent-finance { --accent: #0284c7; }

.header.transparent-header.accent-blue {
  --signup-from: #3b82f6;
  --signup-to: #2563eb;
  --signup-hover-from: #2563eb;
  --signup-hover-to: #1d4ed8;
}
.header.transparent-header.accent-indigo {
  --signup-from: #60a5fa;
  --signup-to: #2563eb;
  --signup-hover-from: #2563eb;
  --signup-hover-to: #1d4ed8;
}
.header.transparent-header.accent-emerald {
  --signup-from: #34d399;
  --signup-to: #10b981;
  --signup-hover-from: #10b981;
  --signup-hover-to: #059669;
}
.header.transparent-header.accent-red {
  --signup-from: #f87171;
  --signup-to: #ef4444;
  --signup-hover-from: #ef4444;
  --signup-hover-to: #dc2626;
}
.header.transparent-header.accent-sky {
  --signup-from: #60a5fa;
  --signup-to: #0ea5e9;
  --signup-hover-from: #0ea5e9;
  --signup-hover-to: #0369a1;
}
.header.transparent-header.accent-finance {
  --signup-from: #0ea5e9;
  --signup-to: #0284c7;
  --signup-hover-from: #0284c7;
  --signup-hover-to: #0369a1;
}

/* Keep logo consistent with login: black by default, blue on hover */
.header.transparent-header .logo-link {
  pointer-events: auto !important;
  cursor: pointer !important;
  z-index: 100001 !important;
  position: relative;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  text-decoration: none !important;
}

.header.transparent-header .logo-text {
  color: #1f2937 !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.transparent-header .logo-link:hover .logo-text { 
  color: #3b82f6 !important; 
  text-decoration: none !important;
}
.header.transparent-header .nav-link:hover { color: #000000; }
.header.transparent-header .nav-link:hover .dropdown-chevron { color: #000000; }
/* Keep dropdown link text black - no accent color */
.header.transparent-header .dropdown-link:hover .link-text {
  color: #000000 !important;
}
.header.transparent-header .signin-link:hover { color: #3b82f6; }

/* Finance route accent: match finance hero palette */
.header.transparent-header.accent-finance .logo-text,
.header.transparent-header.accent-finance .nav-link,
.header.transparent-header.accent-finance .nav-link span,
.header.transparent-header.accent-finance .nav-link-text,
.header.transparent-header.accent-finance .dropdown-chevron,
.header.transparent-header.accent-finance .signin-link {
  color: #000000 !important;
  font-weight: 900 !important;
}

.header.transparent-header.accent-finance .nav-link:hover,
.header.transparent-header.accent-finance .nav-link:hover .dropdown-chevron {
  color: #000000 !important;
}

.header.transparent-header.accent-finance .logo-link:hover .logo-text {
  color: #0284c7 !important;
}

.header.transparent-header.accent-finance .signin-link:hover {
  color: #0284c7 !important;
}

.header.transparent-header.accent-finance .signup-btn {
  background: linear-gradient(135deg, #0ea5e9, #0284c7) !important;
}

.header.transparent-header.accent-finance .signup-btn:hover {
  background: linear-gradient(135deg, #0284c7, #0369a1) !important;
}

/* Route-aware signup button accents (match hero/header accent mood) */
.header.transparent-header.accent-blue .signup-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.28) !important;
}

.header.transparent-header.accent-blue .signup-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
}

.header.transparent-header.accent-indigo .signup-btn {
  background: linear-gradient(135deg, #60a5fa, #2563eb) !important;
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.3) !important;
}

.header.transparent-header.accent-indigo .signup-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
}

.header.transparent-header.accent-emerald .signup-btn {
  background: linear-gradient(135deg, #34d399, #10b981) !important;
  box-shadow: 0 10px 22px rgba(16, 185, 129, 0.28) !important;
}

.header.transparent-header.accent-emerald .signup-btn:hover {
  background: linear-gradient(135deg, #10b981, #059669) !important;
}

.header.transparent-header.accent-red .signup-btn {
  background: linear-gradient(135deg, #f87171, #ef4444) !important;
  box-shadow: 0 10px 22px rgba(239, 68, 68, 0.28) !important;
}

.header.transparent-header.accent-red .signup-btn:hover {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
}

.header.transparent-header.accent-sky .signup-btn {
  background: linear-gradient(135deg, #60a5fa, #0ea5e9) !important;
  box-shadow: 0 10px 22px rgba(14, 165, 233, 0.3) !important;
}

.header.transparent-header.accent-sky .signup-btn:hover {
  background: linear-gradient(135deg, #0ea5e9, #0369a1) !important;
}

/* when scrolled, header becomes solid white for readability */
.header.transparent-header.scrolled {
  background: #ffffff !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08) !important;
  border-bottom: none !important;
}

.header.header-visible,
.header.transparent-header.header-visible,
.header.white-header.header-visible {
  transform: translate3d(0, 0, 0) !important;
}

.header.header-hidden,
.header.transparent-header.header-hidden,
.header.white-header.header-hidden {
  transform: translate3d(0, -100%, 0) !important;
}

.header-flow-spacer {
  height: 72px;
  min-height: 72px;
  width: 100%;
  flex: 0 0 72px;
}

.nav {
  width: 100%;
  padding: 0;
  display: flex;
  justify-content: flex-start;
}

.nav-container {
  width: min(1360px, 100%);
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 2vw, 1.75rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 72px;
  gap: 1rem;
}

/* CRITICAL: When header is transparent, ensure nav-container is above page content */
.header.transparent-header .nav-container {
  z-index: 100001 !important; /* Above header base */
  position: relative;
  /* Ensure nav-container and all children can receive pointer events */
  pointer-events: auto !important;
}

/* Blog page layout - search centered */
.nav-logo {
  position: relative;
  flex-shrink: 0;
  z-index: 100002 !important; /* Above header base and nav-container */
  pointer-events: auto !important; /* CRITICAL: Logo must receive events */
  margin: 0 0 0 clamp(-1.15rem, -1.8vw, -0.45rem);
}

.nav-logo .logo-link {
  text-decoration: none !important;
  color: inherit;
  pointer-events: auto !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
  position: relative;
  z-index: 100001 !important; /* Above header base */
  /* Ensure router-link is clickable */
  user-select: none;
  -webkit-user-select: none;
}

@media (max-width: 900px) {
  .nav-container {
    width: 100%;
    max-width: 100%;
    padding: 0 0.9rem;
  }

  .nav-logo {
    margin-left: 0;
  }
}

/* CRITICAL: Router-link must be clickable */
.nav-logo a.logo-link,
.nav-logo router-link {
  pointer-events: auto !important;
  cursor: pointer !important;
  z-index: 100001 !important;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 34px;
  height: 34px;
  object-fit: contain;
  image-rendering: auto;
  display: block;
  flex-shrink: 0;
  pointer-events: auto !important;
  transition: transform 0.2s ease;
}

.logo-text {
  font-size: 1.36rem;
  font-weight: 900;
  color: var(--color-stripe-title);
  font-family: var(--font-family-sohne);
  letter-spacing: -0.03em;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-decoration: none;
  pointer-events: auto !important;
  cursor: pointer !important;
}

.header .logo-text,
.header.transparent-header .logo-text {
  color: #050505 !important;
  font-weight: 900 !important;
  font-size: 1.22rem !important;
  letter-spacing: -.035em !important;
  font-family: var(--font-family-sohne) !important;
  font-variation-settings: 'wght' 900 !important;
  -webkit-text-stroke: .2px currentColor;
}

/* Logo hover - works in all states - same as login */
.logo-link {
  pointer-events: auto !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  position: relative;
  z-index: 100001 !important; /* Above header base */
  text-decoration: none !important;
  /* Ensure it's clickable */
  user-select: none;
  -webkit-user-select: none;
  line-height: 1;
}

.logo-link:hover {
  pointer-events: auto !important;
  cursor: pointer !important;
  text-decoration: none !important;
}

.logo-link:hover .logo-text {
  color: #3b82f6 !important;
  text-decoration: none !important;
}

/* Ensure logo link is clickable in all states - including router-link */
.logo-link,
.logo-link *,
a.logo-link,
router-link.logo-link {
  pointer-events: auto !important;
  cursor: pointer !important;
}

/* Ensure logo hover works when header is scrolled - same as login */
.header.scrolled .logo-link:hover .logo-text {
  color: #3b82f6 !important;
  text-decoration: none !important;
}

/* Ensure logo hover works when header is not scrolled - same as login */
.header:not(.scrolled) .logo-link:hover .logo-text {
  color: #3b82f6 !important;
  text-decoration: none !important;
}

/* Transparent header logo hover - same as login */
.header.transparent-header .logo-link:hover .logo-text {
  color: #3b82f6 !important;
  text-decoration: none !important;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  justify-content: flex-start;
  flex: 1;
  margin-left: clamp(1.5rem, 3vw, 3rem);
  position: relative;
  z-index: 1;
}

/* CRITICAL FIX: When header is transparent, ensure nav-menu doesn't interfere */
.header.transparent-header .nav-menu {
  z-index: 100002 !important; /* Above nav-container */
  position: relative;
  pointer-events: auto !important;
}

.nav-item {
  position: relative;
  z-index: 1;
}

/* CRITICAL: When header is transparent, ensure nav-item dropdowns work correctly */
.header.transparent-header .nav-item.dropdown {
  z-index: 100003 !important; /* Above nav-menu */
  position: relative;
  pointer-events: auto !important;
}

/* Bridge area between nav item and dropdown - CRITICAL: prevent hover interference */
.nav-item.dropdown::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 16px;
  background: transparent;
  z-index: 999;
  pointer-events: auto !important; /* Keep hover alive while crossing into the menu */
}

.nav-link {
  color: #050505 !important;
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  font-family: var(--font-family-sohne);
  font-weight: 900 !important;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  letter-spacing: -0.02em;
  transition: color .25s cubic-bezier(0.4, 0, 0.2, 1), transform .25s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  opacity: 1;
  background: transparent;
  box-shadow: none;
}

.nav-link:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59,130,246,.35);
}

/* Better contrast when header is transparent - Stripe style with enhanced styling */
.nav-link:hover {
  background: transparent;
  color: #050505 !important;
  opacity: 1 !important;
  transform: translateY(-1px);
  box-shadow: none;
}

.header .nav-link-text,
.header.transparent-header .nav-link-text {
  color: #050505 !important;
  font-weight: 900 !important;
}

.header.scrolled .nav-link:hover {
  background: transparent;
  color: var(--color-stripe-title) !important;
  opacity: 1 !important;
}

/* Ensure nav links are always black and visible - Stripe style */
.header .nav-link,
.header .nav-link span,
.header .nav-link-text {
  color: var(--color-stripe-text) !important;
  opacity: 1 !important;
}

.header.transparent-header .nav-link,
.header.transparent-header .nav-link span,
.header.transparent-header .nav-link-text {
  color: var(--color-stripe-text) !important;
  opacity: 1 !important;
}

/* Nav link text styling - clean and black like Stripe - BOLDER for landing */
.nav-link-text {
  color: var(--color-stripe-text) !important;
  font-weight: 900 !important;
  opacity: 1 !important;
  transition: color 0.15s ease;
  letter-spacing: -0.02em;
}

/* Make nav links even bolder on landing page */
.header.transparent-header .nav-link-text {
  font-weight: 900 !important;
  letter-spacing: -0.02em;
}

/* Ensure nav-link-text is always black, regardless of parent classes like text-stripe-base */
.nav-link .nav-link-text,
button.nav-link .nav-link-text,
.nav-link.text-stripe-base .nav-link-text,
.nav-link.font-weight-stripe .nav-link-text {
  color: #000000 !important;
}

.nav-link:hover .nav-link-text {
  color: #000000 !important;
  opacity: 1 !important;
}

/* CRITICAL FIX: Prevent double hover in transparent header - override with stronger specificity */
.header.transparent-header .dropdown-link {
  position: relative;
  z-index: 100005 !important; /* Above dropdown menu */
}

.header.transparent-header .dropdown-link:hover {
  color: #111827 !important;
  background: #f9fafb !important;
  transform: none !important;
  animation: none !important;
  z-index: 100005 !important; /* Above dropdown menu */
  pointer-events: auto !important; /* Ensure link can receive events */
}


.dropdown-toggle {
  position: relative;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  /* Prevent any visual duplication */
  contain: layout style paint;
}

.nav-category-icon {
  flex-shrink: 0;
  font-size: 0.78rem;
  opacity: 0.82;
  color: #4b5563 !important;
  transition: transform 0.18s ease, color 0.18s ease, opacity 0.18s ease;
}

.nav-link:hover .nav-category-icon,
.nav-link:focus-visible .nav-category-icon,
.nav-link.is-active-link .nav-category-icon {
  transform: translateY(-1px);
  opacity: 1;
  color: #374151 !important;
}

.nav-hover-chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.32rem;
  width: 0;
  opacity: 0;
  overflow: hidden;
  color: #000000;
  transform: translateX(-2px);
  transition: opacity 0.16s ease, transform 0.16s ease, width 0.16s ease;
  pointer-events: none;
}

.nav-link-direct {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
}

/* Keep the anchor aligned with the button-based nav items in Firefox. */
.nav-item-direct {
  display: flex;
  align-self: stretch;
  align-items: center;
}

.nav-menu > .nav-item > .nav-link {
  box-sizing: border-box;
  min-height: 44px;
}

.nav-link-direct:hover .nav-hover-chevron,
.nav-link-direct:focus-visible .nav-hover-chevron {
  width: 10px;
  opacity: 1;
  transform: translateX(0);
}

.dropdown-chevron {
  color: #000000;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  transform-origin: center;
}

/* Rotar chevron hacia arriba cuando el dropdown est? abierto (hover) */
.dropdown:hover .dropdown-chevron {
  transform: rotate(180deg);
}

/* Keep chevron black when dropdown is open - no accent color change */
.header.transparent-header .dropdown:hover .dropdown-chevron {
  color: #000000;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 580px;
  max-width: 640px;
  background: #ffffff;
  border: 1px solid rgba(229, 231, 235, 0.4);
  border-radius: 16px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px) scale(0.98);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000;
  padding: 0;
  overflow: visible;
  pointer-events: none;
  margin-top: 0;
}

/* CRITICAL: Increase z-index when header is transparent to prevent content overlay */
.header.transparent-header .dropdown-menu {
  z-index: 100004 !important; /* Above dropdown nav-item */
  isolation: isolate; /* Create new stacking context */
}

.header.transparent-header .dropdown:hover .dropdown-menu {
  z-index: 100004 !important;
  isolation: isolate;
}


.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.dropdown.is-open .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.nav-menu.has-active-dropdown .dropdown:not(.is-open) .dropdown-menu {
  opacity: 0 !important;
  visibility: hidden !important;
  transform: translateY(-4px) scale(0.98) !important;
  pointer-events: none !important;
}

/* CRITICAL: When header is transparent, ensure dropdown menu has proper z-index */
.header.transparent-header .dropdown:hover .dropdown-menu {
  z-index: 10000 !important;
  pointer-events: auto !important;
}

/* Prevent double hover - when hovering over a link, stop GSAP and CSS parent animations */
.dropdown:hover .dropdown-link:hover {
  /* Stop GSAP animations on parent when hovering link */
  opacity: 1 !important;
}

/* Critical: Stop dropdown menu transform when hovering links */
.dropdown:hover .dropdown-link:hover ~ *,
.dropdown:hover .dropdown-menu:has(.dropdown-link:hover) {
  transform: none !important;
}

/* CRITICAL FIX for landing page: Prevent double hover effect on transparent header */
.header.transparent-header .dropdown-link:hover {
  /* Force stop any GSAP animations */
  animation: none !important;
  transform: none !important;
}


/* Prevent GSAP opacity animations from interfering on landing page */
/* Note: Individual link hover takes precedence over parent hover */

.header.transparent-header .dropdown:hover .dropdown-link:hover {
  /* When hovering a specific link, ensure it's fully visible and all animations are stopped */
  opacity: 1 !important;
  animation: none !important;
  transform: none !important;
  pointer-events: auto !important;
}


.dropdown-content {
  padding: 24px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  position: relative;
  z-index: 1; /* Ensure content is above menu background */
}

.dropdown-section {
  display: flex;
  flex-direction: column;
  float: left;
  width: 100%;
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: 12px;
  float: left;
  width: 100%;
}

.section-header h4 {
  font-size: 11px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 12px 0;
  padding: 0;
  font-family: var(--font-family-sohne);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.4;
  text-align: left;
  float: left;
  clear: left;
}

.section-description {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  line-height: 1.5;
}

.dropdown-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  width: 100%;
  clear: both;
}

.dropdown-column {
  display: flex;
  flex-direction: column;
  float: left;
  width: 100%;
}

.dropdown-column .dropdown-link {
  width: 100%;
  clear: none;
}

.dropdown-link {
  display: flex;
  align-items: center;
  padding: 12px 40px 12px 14px;
  color: #000000 !important;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-family-sohne);
  font-weight: 700;
  letter-spacing: -0.01em;
  border-radius: 10px;
  margin: 0;
  position: relative;
  line-height: 1.5;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  clear: left;
  float: left;
  isolation: isolate; /* Create a new stacking context to prevent hover bubbling */
  pointer-events: auto !important; /* CRITICAL: Links must be clickable */
}

/* Old icon class - keeping for compatibility */
.link-icon-gray {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #000000 !important;
  margin: 0;
  padding: 0;
  border-radius: 4px;
  background: transparent;
  box-shadow: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 1;
}

.dropdown-link:hover .link-icon-gray {
  color: #000000 !important;
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
  opacity: 1;
}

/* Single hover rule to prevent double hover effect - stop propagation */
.dropdown-link {
  position: relative;
}

.dropdown-link:hover {
  color: #000000 !important;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.06) 100%) !important;
  transform: translateX(4px) !important;
  animation: none !important; /* Stop GSAP animations */
  z-index: 10005 !important; /* Layer above dropdown menu and bridge area */
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.12),
    0 2px 4px rgba(59, 130, 246, 0.08);
}


/* Special handling for transparent header - already handled above */

.dropdown-link:hover .link-content,
.dropdown-link:hover .link-text {
  transform: translateX(2px) !important;
  color: #000000 !important;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}



.dropdown-link:active {
  background: #f3f4f6;
}

/* No background change for Contact and Help even on active state */
a.dropdown-link[href="/contact"]:active,
.header.transparent-header a.dropdown-link[href="/contact"]:active {
  background: transparent !important;
  background-color: transparent !important;
}


.link-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  flex: 1;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.link-text {
  flex: 1;
  text-align: left;
  white-space: nowrap;
  color: #000000 !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-hover-chevron {
  margin-left: 0;
  width: 14px;
  opacity: 0;
  color: #000000;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translate(-4px, -50%);
  transition: opacity 0.16s ease, transform 0.16s ease;
  pointer-events: none;
}

.dropdown-link:hover .submenu-hover-chevron,
.dropdown-link:focus-visible .submenu-hover-chevron {
  opacity: 1;
  transform: translate(0, -50%);
}

.products-dropdown .dropdown-link {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  column-gap: 10px;
}

.mega-dropdown {
  min-width: 720px;
  max-width: 900px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow:
    0 30px 80px rgba(15, 23, 42, 0.18),
    0 12px 32px rgba(15, 23, 42, 0.1);
}

.products-dropdown.mega-dropdown {
  min-width: 560px;
  max-width: 620px;
}

.solutions-mega-dropdown.mega-dropdown {
  min-width: 760px;
  max-width: 860px;
}

.mega-dropdown-content {
  display: block;
  padding: 30px 34px 34px;
}

.mega-dropdown-section {
  display: block;
}

.mega-section-header {
  margin-bottom: 22px;
}

.mega-section-header h4 {
  margin: 0;
  color: #596170;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.2;
}

.mega-dropdown-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 28px;
}

.mega-dropdown-grid-single {
  grid-template-columns: 1fr;
}

.mega-dropdown-link {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 14px;
  background: transparent;
  border: none;
}

.mega-dropdown .dropdown-link:hover,
.mega-dropdown .dropdown-link:focus-visible {
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%) !important;
  border-color: rgba(148, 163, 184, 0.22);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: none !important;
}

.mega-dropdown .dropdown-link:hover .link-content,
.mega-dropdown .dropdown-link:hover .link-text {
  transform: none !important;
}

.mega-link-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.mega-link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 14px;
  min-width: 14px;
  margin-top: 3px;
  color: #1f2937;
  background: transparent;
  box-shadow: none;
  transition: transform 0.18s ease, color 0.18s ease, opacity 0.18s ease;
  opacity: 0.92;
}

.mega-link-icon svg {
  font-size: 0.8rem;
}

.mega-dropdown .dropdown-link:hover .mega-link-icon,
.mega-dropdown .dropdown-link:focus-visible .mega-link-icon {
  transform: none;
  color: #111827;
  opacity: 1;
}

.mega-link-title {
  display: block;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.015em;
  line-height: 1.28;
}

.mega-link-description {
  display: block;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  white-space: normal;
}

@media (max-width: 1240px) {
  .solutions-mega-dropdown.mega-dropdown {
    min-width: 680px;
  }
}

@media (max-width: 1120px) {
  .mega-dropdown {
    min-width: 520px;
    max-width: min(92vw, 680px);
  }

  .mega-dropdown-grid {
    grid-template-columns: 1fr;
  }
}

.link-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  line-height: 1.4;
}

.nav-auth {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-left: auto;
  flex-shrink: 0;
}

.header-language-selector {
  flex-shrink: 0;
}

/* Match language button to Sign in button visual style */
.header .header-language-selector:deep(.language-trigger),
.header.transparent-header .header-language-selector:deep(.language-trigger),
.header.white-header .header-language-selector:deep(.language-trigger) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  padding: 5px 10px !important;
  min-width: 0 !important;
  border-radius: 8px !important;
  background: #ffffff !important;
  color: #111827 !important;
  border: none !important;
  box-shadow: 0 5px 14px rgba(15, 23, 42, 0.10) !important;
  line-height: 1 !important;
}

.header .header-language-selector:deep(.language-trigger:hover),
.header.transparent-header .header-language-selector:deep(.language-trigger:hover),
.header.white-header .header-language-selector:deep(.language-trigger:hover) {
  background: #f9fafb !important;
  color: #111827 !important;
  border: none !important;
  transform: translateY(-1px) !important;
}

.header .header-language-selector:deep(.language-label) {
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  line-height: 1 !important;
}

.header .header-language-selector:deep(.language-flag) {
  font-size: 0.86rem !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
}

.header .header-language-selector:deep(.language-chevron) {
  margin-left: 2px !important;
  opacity: 1 !important;
}

@media (max-width: 980px) {
  .header .nav-auth {
    gap: 8px;
  }

  .header .header-language-selector:deep(.language-trigger) {
    padding: 6px 9px !important;
  }

  .header .header-language-selector:deep(.language-label) {
    display: none !important;
  }

  .header .header-language-selector:deep(.language-chevron) {
    margin-left: 0 !important;
  }
}

@media (max-width: 768px) {
  .header .nav-auth {
    margin-left: auto;
  }
}

/* Header Search Bar */
.header-search-wrapper {
  margin-right: 1rem;
  transition: all 0.3s ease;
}

/* Blog Search on Left Side */
.header-search-wrapper.header-search-left {
  margin: 0 auto;
  flex: 0 0 auto;
  max-width: 500px;
  justify-self: center;
}

.header-search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.header-search-icon {
  position: absolute;
  left: 12px;
  z-index: 1;
  color: #9ca3af;
  pointer-events: none;
  transition: color 0.2s ease;
}

.header-search-input {
  width: 240px;
  padding: 8px 36px 8px 36px;
  border: 1px solid rgba(209, 213, 219, 0.8);
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: var(--font-family-sohne);
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  color: #1f2937;
}

.header-search-input::placeholder {
  color: #9ca3af;
}

.header-search-input.focused,
.header-search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 
    0 0 0 3px rgba(59, 130, 246, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.05);
  width: 280px;
}

.header-search-input.focused ~ .header-search-icon,
.header-search-input:focus ~ .header-search-icon {
  color: #3b82f6;
}

.header-search-box.has-suggestions {
  z-index: 1000;
}

.header-search-wrapper {
  position: relative;
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  z-index: 1000;
  min-width: 400px;
  max-height: 500px;
  animation: fadeInDown 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.suggestions-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}

.suggestions-count {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  font-family: var(--font-family-sohne);
}

.suggestions-list {
  max-height: 320px;
  overflow-y: auto;
}

.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f9fafb;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: #f9fafb;
  padding-left: 20px;
}

.suggestion-item.selected {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(255, 255, 255, 0) 100%);
  border-left: 3px solid #2563eb;
}

.suggestion-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  margin-top: 2px;
  transition: all 0.2s ease;
}

.suggestion-item:hover .suggestion-icon,
.suggestion-item.selected .suggestion-icon {
  color: #2563eb;
  transform: scale(1.1);
}

.suggestion-content {
  flex: 1;
  min-width: 0;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 6px;
  line-height: 1.4;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.suggestion-title mark {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(14, 165, 233, 0.2));
  color: #111827;
  font-weight: 600;
  padding: 0 2px;
  border-radius: 3px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: #6b7280;
  font-family: var(--font-family-sohne);
}

.suggestion-category {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #f3f4f6;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.suggestion-date {
  color: #9ca3af;
}

.suggestions-footer {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.view-all-results-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: var(--font-family-sohne);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.01em;
}

.view-all-results-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #4c42d1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.view-all-results-btn svg {
  transition: transform 0.2s ease;
}

.view-all-results-btn:hover svg {
  transform: translateX(2px);
}

.header-search-clear {
  position: absolute;
  right: 8px;
  z-index: 2;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.header-search-clear:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

@media (max-width: 968px) {
  .header-search-wrapper {
    display: none;
  }
  
  .header-search-input {
    width: 200px;
  }
  
  .header-search-input.focused,
  .header-search-input:focus {
    width: 240px;
  }
  
  .search-suggestions {
    min-width: 100%;
    right: 0;
  }
}

/* User Dropdown Styles */
.user-dropdown {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
  border: 1px solid #1d4ed8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.25);
}

.user-button:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
  border-color: #1e40af;
}

.user-button .dropdown-icon { color: #e5e7eb; }
.user-button.dropdown-open .dropdown-icon { color: #ffffff; }

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.user-name { color: #ffffff; font-weight: 600; }

.dropdown-icon.rotated {
  transform: rotate(180deg);
  color: #3b82f6;
}

.user-button:hover .dropdown-icon.rotated {
  transform: rotate(180deg) translateY(-1px);
  color: #3b82f6;
}

.user-button.dropdown-open .dropdown-icon {
  color: #3b82f6;
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  border-radius: 16px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 6px 20px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.01);
  min-width: 260px;
  max-width: 300px;
  z-index: 1000;
  padding: 0;
  animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-dropdown-menu:hover {
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.20),
    0 12px 32px rgba(0, 0, 0, 0.15),
    0 6px 16px rgba(0, 0, 0, 0.10),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  transform: translateY(-2px);
}

/* User Info Box at the top of dropdown */
.header-user-info-box {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.03) 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  padding: 20px 22px;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.header-user-info-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}

.header-user-info-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.header-user-full-name {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-bottom: 2px;
}

.header-user-email {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  font-weight: 500;
  font-family: var(--font-family-sohne);
  word-break: break-all;
  opacity: 0.9;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.header-dropdown-section {
  padding: 6px 0;
}

.header-dropdown-section-header {
  padding: 12px 18px 8px 18px;
  margin-bottom: 4px;
}

.header-dropdown-section-title {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.2;
  font-family: var(--font-family-sohne);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.header-dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(229, 231, 235, 0.6), transparent);
  margin: 8px 12px;
  border: none;
}

.header-dropdown-link {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 16px;
  margin: 4px 8px;
  border-radius: 12px;
  color: #1f2937;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-height: 44px;
  position: relative;
  overflow: hidden;
}

.header-dropdown-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #3b82f6, #1d4ed8);
  border-radius: 0 3px 3px 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-dropdown-link:hover::before {
  height: 60%;
  transform: translateY(-50%) scaleY(1);
}

.header-dropdown-link:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08));
  transform: translateX(4px);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.15),
    0 2px 4px rgba(59, 130, 246, 0.1);
}

.header-dropdown-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.08) 100%);
  border: 1px solid rgba(107, 114, 128, 0.15);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.header-dropdown-icon-wrapper svg {
  stroke: #6b7280;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 18px;
  height: 18px;
}

.header-dropdown-link:hover .header-dropdown-icon-wrapper {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.header-dropdown-link:hover .header-dropdown-icon-wrapper svg {
  stroke: #2563eb;
  transform: scale(1.1);
  filter: drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3));
}

.header-dropdown-link-text {
  flex: 1;
  white-space: nowrap;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  font-weight: 600;
}

.header-dropdown-link:hover .header-dropdown-link-text {
  color: #111827;
  font-weight: 700;
}

.header-dropdown-logout {
  margin-top: 6px;
}

.header-dropdown-logout::before {
  background: linear-gradient(180deg, #ef4444, #dc2626) !important;
}

.header-dropdown-logout:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08)) !important;
  box-shadow: 
    0 4px 12px rgba(220, 38, 38, 0.2),
    0 2px 4px rgba(220, 38, 38, 0.15) !important;
}

.header-dropdown-logout-icon {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%) !important;
  border: 1px solid rgba(220, 38, 38, 0.2) !important;
}

.header-dropdown-logout:hover .header-dropdown-logout-icon {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(220, 38, 38, 0.2) 100%) !important;
  border-color: rgba(220, 38, 38, 0.35) !important;
  transform: scale(1.05) translateY(-1px);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.25);
}

.header-dropdown-logout-icon svg {
  stroke: #dc2626 !important;
}

.header-dropdown-logout:hover .header-dropdown-logout-icon svg {
  stroke: #dc2626 !important;
  transform: scale(1.1);
  filter: drop-shadow(0 1px 2px rgba(220, 38, 38, 0.3));
}

.header-dropdown-logout-text {
  color: #dc2626 !important;
}

.header-dropdown-logout:hover .header-dropdown-logout-text {
  color: #dc2626 !important;
  font-weight: 700;
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Sign in Link - Clean single chevron with hover animation - BOLDER */
.signin-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0.375rem 0;
  color: var(--color-stripe-text);
  text-decoration: none !important;
  font-weight: 800;
  font-size: var(--font-size-base);
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: none;
}

.signin-link:hover {
  color: #2563eb;
  text-decoration: none !important;
}

.signin-chevron {
  color: var(--color-stripe-text);
  stroke: currentColor;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.signin-chevron path {
  stroke: currentColor;
  transition: stroke 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.signin-link:hover .signin-chevron {
  color: currentColor;
  transform: translateX(2px);
}

.signin-link:hover .signin-chevron path {
  stroke: currentColor;
}

/* Sign up Link - Same as signin with hover animation */
.signup-link {
  position: relative;
  padding: 0.375rem 0;
  color: var(--color-stripe-text);
  text-decoration: none !important;
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-base);
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: transparent;
  border: none;
}

.signup-link:hover {
  color: var(--color-stripe-title);
  text-decoration: none !important;
}

/* Sign up Button - Light blue background - BOLDER */
.signup-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff !important;
  text-decoration: none;
  font-weight: 800;
  font-size: var(--font-size-base);
  letter-spacing: -0.02em;
  box-shadow:
    0 8px 18px rgba(37, 99, 235, 0.18),
    0 4px 10px rgba(59, 130, 246, 0.18);
  border: 0;
  transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  position: relative;
  overflow: hidden;
}

.signup-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: none;
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}

.signup-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow:
    0 12px 24px rgba(29, 78, 216, 0.26),
    0 8px 16px rgba(37, 99, 235, 0.24);
  transform: translateY(-1px);
}

.signup-btn:hover::before {
  opacity: 0;
}

.signup-btn > * {
  position: relative;
  z-index: 1;
}

.signup-chevron {
  color: #ffffff;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.signup-btn:hover .signup-chevron {
  transform: translateX(2px);
  color: #ffffff;
}

.dashboard-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff !important;
  box-shadow:
    0 8px 18px rgba(37, 99, 235, 0.18),
    0 4px 10px rgba(59, 130, 246, 0.18);
}

.dashboard-btn span {
  color: inherit !important;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
}

/* Contact Sales Button - Dark blue background */
.contact-sales-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  background: #1e40af;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.8125rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  border-radius: 8px;
  border: 1px solid #1e40af;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.contact-sales-btn:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary:hover {
  background: #111827;
  border-color: #111827;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border-color: #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-outline:hover {
  background: #f9fafb;
  color: #1f2937;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}

/* Products dropdown like Solutions */
.products-dropdown {
  min-width: 260px;
  max-width: 280px;
  padding: 16px 20px;
}
.products-dropdown .dropdown-content {
  padding: 0;
}
.products-section .section-header h4 {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #000000;
  margin-bottom: 12px;
}
.products-dropdown .dropdown-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.products-dropdown .dropdown-link {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  width: 100% !important;
  min-height: 0;
  padding: 14px 16px !important;
  border-radius: 12px;
  font-weight: 700;
  box-sizing: border-box;
}
.products-dropdown .dropdown-link:hover {
  background: #f3f4f6 !important;
  border: none !important;
  box-shadow: none !important;
  transform: none !important;
}

/* Solutions dropdown like Stripe */
.solutions-dropdown .dropdown-menu { min-width: 640px; max-width: 820px; }
.solutions-dropdown .dropdown-content { grid-template-columns: 1fr; gap: 0; padding: 28px 28px; }
.solutions-dropdown .dropdown-columns { gap: 32px; }
.solutions-dropdown .section-header h4 { 
  font-size: 11px; 
  font-weight: 700;
  text-transform: uppercase; 
  letter-spacing: .06em; 
  color: #000000; 
  margin: 0 0 12px 0; 
  float: left;
  clear: left;
}
.solutions-dropdown .dropdown-link {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 10px;
  padding: 14px 16px !important;
  border-radius: 12px;
}
.solutions-dropdown .dropdown-link:hover { 
  background: #f3f4f6 !important;
  border: none !important;
  box-shadow: none !important;
}

/* Developers dropdown with Guides */
.developers-dropdown .dropdown-menu { 
  min-width: 580px; 
  max-width: 640px; 
}
.developers-dropdown .dropdown-content { 
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 24px 20px; 
}

.developers-mega-dropdown {
  min-width: 860px !important;
  max-width: 980px !important;
}

.developers-mega-content {
  display: grid !important;
  grid-template-columns: 280px minmax(0, 1fr) minmax(0, 1fr) !important;
  gap: 0 !important;
  padding: 0 !important;
}

.developers-why-panel {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.22);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
}

.developers-why-inner {
  display: grid;
  gap: 16px;
  align-content: start;
  width: 100%;
}

.developers-why-inner h4 {
  margin: 0;
  color: #5b6474;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.developers-why-inner h5 {
  margin: 0;
  color: #111827;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.developers-why-inner p {
  margin: 0;
  color: #111827;
  font-size: 0.9rem;
  line-height: 1.45;
}

.developers-why-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: #2563eb;
  font-size: 0.98rem;
  font-weight: 700;
  text-decoration: none;
}

.developers-why-link:hover {
  color: #1d4ed8;
}

.developers-why-link:hover span,
.developers-why-link:focus-visible span {
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1.5px;
}

.developers-why-link svg,
.developers-why-link:hover svg,
.developers-why-link:focus-visible svg {
  color: #000000;
  stroke: #000000;
}

.developers-mega-dropdown .dropdown-section {
  padding: 30px 26px 28px;
}

.developers-mega-dropdown .dropdown-link {
  display: grid !important;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 14px 14px !important;
  border-radius: 12px !important;
}

.dropdown-link:hover {
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%) !important;
  color: #111827 !important;
  transform: none !important;
  border-color: rgba(148, 163, 184, 0.22) !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
}


.home-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.home-icon-btn:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
}

/* 1) Prohibir carets generados por pseudo-elementos del trigger */
.dropdown-toggle::after,
.dropdown-toggle::before,
.nav-link.dropdown-toggle::after,
.nav-link.dropdown-toggle::before {
  content: none !important;
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

/* 2) Si alguna librer?a mete un .caret o un segundo svg, ocultarlo */
.dropdown-toggle .caret {
  display: none !important;
}

/* 3) Only the chevron should rotate on hover */
.dropdown-toggle > .dropdown-chevron {
  display: inline-block !important;
  transform-origin: 50% 50%;
}

/* 4) Hover consistente: texto m?s oscuro y caret animado */
.dropdown-toggle.group:hover .transition-colors { color: #111827 !important; }
.dropdown-toggle.group:hover > .dropdown-chevron { transform: rotate(180deg); }

/* 5) ?tems internos del dropdown: sin ::after y con ?nica flecha opcional */
.dropdown a::after,
.dropdown .menu-item::after {
  content: none !important;
  display: none !important;
}

/* Final sober dropdown pass */
.header .dropdown-link:hover,
.header .dropdown:hover .dropdown-link:hover {
  background: linear-gradient(180deg, #f8fbff 0%, #f3f7fd 100%) !important;
  color: #111827 !important;
  border-color: rgba(148, 163, 184, 0.22) !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
  transform: none !important;
}

.header .dropdown-link:hover .link-text {
  color: #111827 !important;
}

.header .dropdown-link:hover .link-icon-gray,
.header .dropdown:hover .dropdown-link:hover .link-icon-gray {
  background: transparent !important;
  color: #000000 !important;
  box-shadow: none !important;
  transform: none !important;
}

/* Stripe-inspired premium nav pass */
.header,
.header.transparent-header {
  transform: none !important;
  will-change: auto !important;
}

.header.scrolled,
.header.transparent-header.scrolled {
  background: rgba(255, 255, 255, 0.84) !important;
  backdrop-filter: saturate(165%) blur(16px) !important;
  -webkit-backdrop-filter: saturate(165%) blur(16px) !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
}

.header .nav-link {
  border-radius: 999px !important;
  font-weight: 700 !important;
  letter-spacing: -0.015em !important;
  background: transparent !important;
  box-shadow: none !important;
}

.header .nav-link:hover,
.header.transparent-header .nav-link:hover {
  background: transparent !important;
  transform: none !important;
  box-shadow: none !important;
}

.header .dropdown-menu {
  border: 1px solid rgba(203, 213, 225, 0.62) !important;
  border-radius: 20px !important;
  background: #ffffff !important;
  backdrop-filter: blur(12px) saturate(120%) !important;
  -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
  box-shadow: 0 26px 56px rgba(15, 23, 42, 0.16), 0 10px 24px rgba(15, 23, 42, 0.09) !important;
  transform: translateY(6px) scale(0.985) !important;
}

.header .dropdown:hover .dropdown-menu,
.header .dropdown.is-open .dropdown-menu {
  transform: translateY(0) scale(1) !important;
}

.header .dropdown-link {
  border-radius: 14px !important;
  transition: background-color 0.2s ease, transform 0.2s ease, color 0.2s ease !important;
}

.header .dropdown-link:hover {
  background: #f8fafc !important;
  transform: translateX(2px) !important;
}


.header .dropdown-link .link-text {
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
}

.header .dropdown-chevron {
  opacity: 0.82;
}

.header .dropdown:hover .dropdown-chevron {
  opacity: 1;
}

/* Final override: signup button MUST follow route accent on transparent/app headers */
.header.transparent-header .signup-btn {
  background: linear-gradient(135deg, var(--signup-from, #3b82f6), var(--signup-to, #2563eb)) !important;
  box-shadow: 0 10px 22px color-mix(in srgb, var(--signup-to, #2563eb) 42%, transparent) !important;
}

.header.transparent-header .signup-btn:hover {
  background: linear-gradient(135deg, var(--signup-hover-from, #2563eb), var(--signup-hover-to, #1d4ed8)) !important;
}

/* Coherence cleanup pass: sober, consistent app header */
.header .nav-container {
  gap: 1.3rem !important;
}

.header .signup-btn,
.header.transparent-header .signup-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.22) !important;
}

.header .signup-btn:hover,
.header.transparent-header .signup-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
  box-shadow: 0 10px 20px rgba(29, 78, 216, 0.26) !important;
  transform: translateY(-1px) !important;
}

/* Final header sanity: simple, clean, consistent */
.header {
  box-shadow: none !important;
}

.header.scrolled,
.header.transparent-header.scrolled {
  background: rgba(255, 255, 255, 0.92) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.07) !important;
}

.header .signup-btn,
.header.transparent-header .signup-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.2) !important;
}

.header .signup-btn:hover,
.header.transparent-header .signup-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
}

.header .nav-link:hover,
.header.transparent-header .nav-link:hover,
.header .nav-link.is-active-link {
  border-radius: 6px !important;
  background: rgba(100, 116, 139, 0.14) !important;
  box-shadow:
    0 8px 18px -10px rgba(15, 23, 42, 0.34),
    0 2px 4px rgba(15, 23, 42, 0.12) !important;
}

/* Final auth button lock: Sign in = white version of Sign up, both smaller and less rounded */
.header .auth-buttons .signin-link,
.header .auth-buttons .signup-btn,
.header.transparent-header .auth-buttons .signin-link,
.header.transparent-header .auth-buttons .signup-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
  padding: 6px 11px !important;
  border-radius: 8px !important;
  font-size: 0.86rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.01em !important;
  line-height: 1 !important;
  text-decoration: none !important;
  border-width: 1px !important;
  border-style: solid !important;
  transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
}

.header .auth-buttons .signin-link,
.header.transparent-header .auth-buttons .signin-link {
  background: #1976d3 !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(25, 118, 211, 0.28) !important;
}

.header .auth-buttons .signin-link:hover,
.header.transparent-header .auth-buttons .signin-link:hover {
  background: #1565c0 !important;
  color: #ffffff !important;
  border: none !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 14px rgba(25, 118, 211, 0.34) !important;
}

.header .auth-buttons .signin-chevron,
.header.transparent-header .auth-buttons .signin-chevron {
  color: currentColor !important;
}

.header .auth-buttons .signup-btn,
.header.transparent-header .auth-buttons .signup-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  color: #ffffff !important;
  border-color: rgba(59, 130, 246, 0.85) !important;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.24) !important;
}

.header .auth-buttons .signup-btn:hover,
.header.transparent-header .auth-buttons .signup-btn:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af) !important;
  border-color: rgba(37, 99, 235, 0.92) !important;
  box-shadow: 0 8px 16px rgba(29, 78, 216, 0.28) !important;
  transform: translateY(-1px) !important;
}

/* Hard override: Ingresar button stays brand blue across header states */
.header .auth-buttons a.signin-link,
.header .auth-buttons a.signin-link:visited,
.header.white-header .auth-buttons a.signin-link,
.header.white-header .auth-buttons a.signin-link:visited,
.header.transparent-header .auth-buttons a.signin-link,
.header.transparent-header .auth-buttons a.signin-link:visited {
  color: #ffffff !important;
  border: none !important;
  background: #1976d3 !important;
}

.header .auth-buttons a.signin-link:hover,
.header .auth-buttons a.signin-link:focus,
.header .auth-buttons a.signin-link:focus-visible,
.header .auth-buttons a.signin-link:active,
.header.white-header .auth-buttons a.signin-link:hover,
.header.white-header .auth-buttons a.signin-link:focus,
.header.white-header .auth-buttons a.signin-link:focus-visible,
.header.white-header .auth-buttons a.signin-link:active,
.header.transparent-header .auth-buttons a.signin-link:hover,
.header.transparent-header .auth-buttons a.signin-link:focus,
.header.transparent-header .auth-buttons a.signin-link:focus-visible,
.header.transparent-header .auth-buttons a.signin-link:active {
  color: #ffffff !important;
  border: none !important;
  background: #1565c0 !important;
}

.github-stars-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 34px;
  padding: 0 0.75rem;
  border-radius: 15px;
  border: 0;
  background: linear-gradient(180deg, #ffffff 0%, rgba(245, 247, 254, 0.95) 100%);
  color: #111827;
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.github-stars-badge .github-icon {
  font-size: 1rem;
}

.github-stars-text {
  color: #1f2937;
  font-weight: 700;
}

.github-stars-count {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  gap: 0.25rem;
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 700;
}

.github-star-icon {
  color: #facc15;
  font-size: 0.85rem;
}

.github-stars-number {
  letter-spacing: 0.02em;
}
.github-stars-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.25);
  background: #fefefe;
}

/* Slightly smaller nav dropdowns (Products, Solutions, Developers) */
.header .nav-item.dropdown:first-child .dropdown-menu {
  min-width: 280px !important;
  max-width: 320px !important;
}

.header .solutions-dropdown .dropdown-menu {
  min-width: 500px !important;
  max-width: 620px !important;
}

.header .developers-dropdown .dropdown-menu {
  min-width: 860px !important;
  max-width: 980px !important;
}

.header .dropdown-menu.developers-dropdown {
  left: 30% !important;
  transform: translateX(-30%) translateY(6px) scale(0.985) !important;
}

.header .dropdown-menu.developers-dropdown::before {
  left: 30% !important;
  transform: translateX(-30%);
}

.header .dropdown-menu.developers-dropdown::after {
  left: 30% !important;
  transform: translateX(-30%);
}

.header .nav-item.dropdown:first-child .dropdown-content,
.header .solutions-dropdown .dropdown-content {
  padding: 18px 18px !important;
  gap: 18px !important;
}

.header .developers-dropdown .dropdown-content {
  padding: 0 !important;
  gap: 0 !important;
}

.header .nav-item.dropdown:hover .dropdown-menu.developers-dropdown,
.header .nav-item.dropdown.is-open .dropdown-menu.developers-dropdown {
  transform: translateX(-30%) translateY(0) scale(1) !important;
}

.header .solutions-dropdown .dropdown-link,
.header .developers-dropdown .dropdown-link {
  padding: 16px 16px !important;
}

@media (max-width: 1240px) {
  .developers-mega-dropdown,
  .header .developers-dropdown .dropdown-menu {
    min-width: 720px !important;
    max-width: 860px !important;
  }

  .developers-mega-content {
    grid-template-columns: 240px minmax(0, 1fr) minmax(0, 1fr) !important;
  }
}

@media (max-width: 1120px) {
  .developers-mega-dropdown,
  .header .developers-dropdown .dropdown-menu {
    min-width: 560px !important;
    max-width: min(92vw, 720px) !important;
  }

  .developers-mega-content {
    grid-template-columns: 1fr !important;
  }

  .developers-why-panel {
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.22);
  }

  .developers-mega-dropdown .dropdown-section {
    padding: 20px 18px;
  }
}

/* Final products dropdown stretch fix */
.header .products-dropdown .dropdown-content {
  padding: 18px 18px !important;
}

.header .products-dropdown .dropdown-links {
  width: 100%;
}

.header .products-dropdown .dropdown-link {
  display: grid !important;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 12px;
  width: 100% !important;
  margin: 0 !important;
  min-height: 0;
  padding: 14px 16px 14px 10px !important;
  border-radius: 10px !important;
}

.header .products-dropdown .mega-link-icon,
.header .solutions-mega-dropdown .mega-link-icon,
.header .developers-mega-dropdown .mega-link-icon {
  width: 34px !important;
  min-width: 34px !important;
  height: 34px !important;
  margin-top: 1px !important;
  margin-left: -2px !important;
  border-radius: 9px;
  color: #ffffff !important;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0) 42%),
    linear-gradient(180deg, #5594e8 0%, #326fc5 100%);
  box-shadow:
    0 9px 18px rgba(50, 111, 197, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.34);
  opacity: 1;
}

.header .products-dropdown .mega-link-icon svg,
.header .solutions-mega-dropdown .mega-link-icon svg,
.header .developers-mega-dropdown .mega-link-icon svg {
  width: 16px !important;
  height: 16px !important;
  font-size: 0.98rem !important;
  color: #ffffff !important;
}

.header .products-dropdown .dropdown-link:hover .mega-link-icon,
.header .products-dropdown .dropdown-link:focus-visible .mega-link-icon,
.header .solutions-mega-dropdown .dropdown-link:hover .mega-link-icon,
.header .solutions-mega-dropdown .dropdown-link:focus-visible .mega-link-icon,
.header .developers-mega-dropdown .dropdown-link:hover .mega-link-icon,
.header .developers-mega-dropdown .dropdown-link:focus-visible .mega-link-icon {
  transform: translateY(-1px);
  box-shadow:
    0 12px 22px rgba(50, 111, 197, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.36);
}

.github-stars-badge:hover svg {
  transform: scale(1.05);
}

.github-stars-badge:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18), 0 10px 20px rgba(15, 23, 42, 0.14);
  border-color: rgba(37, 99, 235, 0.5);
}

.github-stars-badge:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.12);
}

@media (max-width: 1160px) {
  .github-stars-text {
    display: none;
  }
}

@media (max-width: 980px) {
  .github-stars-badge {
    display: none;
  }

  .nav-menu,
  .header .nav-menu {
    margin-left: 0 !important;
    gap: 0.9rem !important;
  }
}

/* Stronger bold emphasis across app header */
.header .nav-link,
.header .nav-link-text,
.header .nav-link .nav-link-text,
.header.white-header .nav-link,
.header.white-header .nav-link-text,
.header.transparent-header .nav-link,
.header.transparent-header .nav-link-text {
  font-weight: 900 !important;
}

.header .logo-text,
.header.white-header .logo-text,
.header.transparent-header .logo-text {
  font-weight: 900 !important;
  font-size: 1.22rem !important;
  letter-spacing: -.035em !important;
  font-family: var(--font-family-sohne) !important;
  position: relative;
  top: -1px;
}

.header .nav-link,
.header .nav-link span,
.header .nav-link-text {
  color: #050505 !important;
  letter-spacing: -0.02em;
}

.header .nav-menu {
  flex: 1 !important;
  margin-left: clamp(1.5rem, 3vw, 3rem) !important;
  gap: 1.2rem !important;
  justify-content: flex-start !important;
  position: relative;
  top: 2px;
}

.header .auth-buttons .signin-link,
.header .auth-buttons .signup-btn,
.header.white-header .auth-buttons .signin-link,
.header.white-header .auth-buttons .signup-btn,
.header.transparent-header .auth-buttons .signin-link,
.header.transparent-header .auth-buttons .signup-btn {
  font-weight: 900 !important;
}

.header .github-stars-badge,
.header .github-stars-text {
  font-weight: 900 !important;
}

.header .dropdown-link,
.header .dropdown-link .link-text,
.header.white-header .dropdown-link,
.header.white-header .dropdown-link .link-text,
.header.transparent-header .dropdown-link,
.header.transparent-header .dropdown-link .link-text,
.header .section-header h4,
.header.white-header .section-header h4,
.header.transparent-header .section-header h4 {
  font-weight: 800 !important;
}

/* Final lock: language trigger must match Sign in dimensions exactly */
.header .auth-buttons .signin-link,
.header.white-header .auth-buttons .signin-link,
.header.transparent-header .auth-buttons .signin-link,
.header .header-language-selector:deep(.language-trigger),
.header.white-header .header-language-selector:deep(.language-trigger),
.header.transparent-header .header-language-selector:deep(.language-trigger) {
  min-height: 38px !important;
  height: 38px !important;
  padding: 0 11px !important;
  font-size: 0.86rem !important;
  line-height: 1 !important;
}

.header .header-language-selector:deep(.language-label) {
  font-size: 0.86rem !important;
  line-height: 1 !important;
  font-weight: 900 !important;
}

.header .header-language-selector:deep(.language-flag) {
  font-size: 0.84rem !important;
  line-height: 1 !important;
}

/* Final lock: keep dashcole icon/text spacing identical on all routes */
.header .nav-logo .logo-link,
.header.white-header .nav-logo .logo-link,
.header.transparent-header .nav-logo .logo-link {
  gap: 0.55rem !important;
}

/* Final nav lock: keep hover/open/active visual state identical across locales/routes */
.header .nav-menu .nav-link:hover,
.header .nav-menu .nav-item.dropdown:hover > .nav-link,
.header .nav-menu .nav-item.dropdown.is-open > .nav-link,
.header.transparent-header .nav-menu .nav-link:hover,
.header.transparent-header .nav-menu .nav-item.dropdown:hover > .nav-link,
.header.transparent-header .nav-menu .nav-item.dropdown.is-open > .nav-link,
.header .nav-menu .nav-link.is-active-link,
.header.transparent-header .nav-menu .nav-link.is-active-link {
  border-radius: 6px !important;
  background: rgba(100, 116, 139, 0.14) !important;
  box-shadow:
    0 8px 18px -10px rgba(15, 23, 42, 0.34),
    0 2px 4px rgba(15, 23, 42, 0.12) !important;
  transform: none !important;
}

.header .nav-menu.has-active-dropdown .nav-item.dropdown:not(.is-open) > .nav-link {
  background: transparent !important;
  box-shadow: none !important;
}

.header .nav-menu.has-active-dropdown .nav-item.dropdown:not(.is-open) > .dropdown-menu {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transform: translateY(-4px) scale(0.98) !important;
}

.header .nav-menu.has-active-dropdown .nav-item.dropdown:not(.is-open) > .dropdown-menu.developers-dropdown {
  transform: translateX(-30%) translateY(6px) scale(0.985) !important;
}

.header.pricing-route .developers-why-inner p,
.header.pricing-route .developers-why-link,
.header.pricing-route .developers-why-link span,
.header.pricing-route .developers-why-link svg {
  color: #050505 !important;
  stroke: #050505 !important;
}

.header.pricing-route .developers-why-link:hover,
.header.pricing-route .developers-why-link:focus-visible {
  color: #000000 !important;
}

/* Keep navigation hierarchy calm: labels carry weight, descriptions stay light. */
.header .nav-link,
.header .nav-link-text,
.header .nav-link span {
  font-weight: 600 !important;
}

.header .dropdown-link {
  font-weight: 500 !important;
}

.header .mega-link-title {
  font-weight: 650 !important;
}

.header .mega-link-description {
  font-weight: 400 !important;
}

.header .section-header h4,
.header .mega-section-header h4 {
  font-weight: 600 !important;
}

/* Match the public Sign Up control to the Guides Start building CTA. */
.header .auth-buttons .signup-btn,
.header.white-header .auth-buttons .signup-btn,
.header.transparent-header .auth-buttons .signup-btn {
  border: 1px solid transparent !important;
  border-radius: 7px !important;
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.18), 0 4px 10px rgba(59, 130, 246, 0.18) !important;
}

.header .auth-buttons .signup-btn:hover,
.header.white-header .auth-buttons .signup-btn:hover,
.header.transparent-header .auth-buttons .signup-btn:hover {
  border-color: transparent !important;
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.26), 0 8px 16px rgba(37, 99, 235, 0.24) !important;
}

/* Hanalyzer uses a lighter sky palette in the top navigation. */
.header[data-accent="accent-emerald"] .products-dropdown .mega-link-icon,
.header[data-accent="accent-emerald"] .solutions-mega-dropdown .mega-link-icon,
.header[data-accent="accent-emerald"] .developers-mega-dropdown .mega-link-icon {
  color: #0284c7 !important;
  background: linear-gradient(145deg, #eff9ff 0%, #d7f0ff 100%) !important;
  box-shadow:
    0 9px 18px rgba(14, 165, 233, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
}

.header[data-accent="accent-emerald"] .products-dropdown .mega-link-icon svg,
.header[data-accent="accent-emerald"] .solutions-mega-dropdown .mega-link-icon svg,
.header[data-accent="accent-emerald"] .developers-mega-dropdown .mega-link-icon svg {
  color: #0284c7 !important;
}

.header[data-accent="accent-emerald"] .auth-buttons .signup-btn {
  border-color: #7dd3fc !important;
  background: linear-gradient(135deg, #bae6fd, #7dd3fc) !important;
  color: #050505 !important;
  box-shadow: 0 8px 18px rgba(14, 165, 233, 0.18) !important;
}

.header[data-accent="accent-emerald"] .auth-buttons .signup-btn > * {
  color: #050505 !important;
}

.header[data-accent="accent-emerald"] .auth-buttons .signup-btn:hover {
  border-color: #38bdf8 !important;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8) !important;
  color: #050505 !important;
  box-shadow: 0 12px 24px rgba(14, 165, 233, 0.24) !important;
}

.header .auth-buttons .signin-link,
.header.white-header .auth-buttons .signin-link,
.header.transparent-header .auth-buttons .signin-link,
.header .header-language-selector:deep(.language-trigger) {
  border-radius: 7px !important;
}

.mobile-menu-toggle,
.mobile-navigation {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: grid;
    flex: 0 0 38px;
    width: 38px;
    height: 38px;
    padding: 0;
    place-items: center;
    border: 1px solid rgba(15, 23, 42, 0.1);
    border-radius: 8px;
    color: #0f172a;
    background: #ffffff;
    box-shadow: 0 5px 14px rgba(15, 23, 42, 0.1);
    cursor: pointer;
  }

  .mobile-menu-toggle svg {
    width: 20px;
    height: 20px;
  }

  .mobile-navigation {
    position: fixed;
    z-index: 100006;
    top: 72px;
    right: 0.75rem;
    left: 0.75rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    max-height: calc(100dvh - 84px);
    padding: 0.85rem;
    overflow-y: auto;
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.2);
    -webkit-overflow-scrolling: touch;
  }

  .mobile-navigation-section {
    display: grid;
    align-content: start;
    gap: 0.3rem;
    min-width: 0;
    padding: 0.7rem;
    border-radius: 12px;
    background: #f8fafc;
  }

  .mobile-navigation-section > strong {
    margin-bottom: 0.25rem;
    color: #64748b;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .mobile-navigation-section > a {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    min-height: 40px;
    padding: 0.5rem 0.55rem;
    border-radius: 9px;
    color: #0f172a !important;
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.25;
    text-decoration: none;
  }

  .mobile-navigation-section > a:hover,
  .mobile-navigation-section > a:focus-visible,
  .mobile-navigation-section > a.router-link-active {
    color: #1d4ed8 !important;
    background: #eaf2ff;
  }

  .mobile-navigation-section > a svg {
    flex: 0 0 1rem;
    width: 1rem;
    color: #2563eb;
  }

  .mobile-navigation-section--compact {
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mobile-navigation-section--compact > strong {
    grid-column: 1 / -1;
  }
}

/* Keep the public header usable on phones without clipping actions. */
@media (max-width: 600px) {
  .header .nav-container {
    padding-inline: 0.75rem !important;
  }

  .header .nav-auth {
    min-width: 0 !important;
    gap: 0.45rem !important;
  }

  .header .auth-buttons {
    min-width: 0 !important;
    gap: 0 !important;
  }

  .header.header .nav-container .nav-auth .auth-buttons > a.signin-link {
    display: none !important;
  }

  .header .auth-buttons .signup-btn {
    min-width: 0 !important;
    max-width: 7.4rem !important;
    height: 38px !important;
    padding: 0 0.7rem !important;
    font-size: 0.82rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
}

@media (max-width: 350px) {
  .header.header .nav-container .nav-auth .auth-buttons > .signup-btn {
    display: none !important;
  }

  .header .logo-text {
    font-size: 1.15rem !important;
  }

  .header .nav-logo .logo-link {
    gap: 0.38rem !important;
  }

  .header .header-language-selector:deep(.language-trigger) {
    padding-inline: 0.5rem !important;
  }
}

/* Keep the school-platform login visible beside the mobile menu. */
@media (max-width: 768px) {
  .header.header .nav-container .nav-auth .auth-buttons > a.signin-link {
    display: inline-flex !important;
    min-width: 82px !important;
    height: 38px !important;
    padding: 0 0.75rem !important;
    font-size: 0.8rem !important;
  }
}

.mobile-navigation-section > .mobile-login-link {
  color: #ffffff !important;
  background: #1976d3 !important;
  font-weight: 800;
}
</style>
