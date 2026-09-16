<template>
  <div class="site-header-spacer" aria-hidden="true"></div>
  <header
    class="site-header"
    :class="{
      'is-scrolled': isScrolled,
      'is-hidden': !isHeaderVisible
    }"
  >
    <div class="header-inner">
      <a class="brand" :href="guidesHomeUrl" aria-label="Inicio de guías DashCole">
        <img :src="logoUrl" :srcset="logoSrcset" alt="" class="brand-logo" width="34" height="34" decoding="async" />
        <span class="brand-name">DashCole</span>
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="guide-navigation"
        aria-label="Abrir menú"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span>
      </button>

      <nav id="guide-navigation" class="header-nav" :class="{ open: menuOpen }" aria-label="Navegación principal">
        <GuideSearch id-prefix="header-guide-search" placeholder="Buscar…" @selected="menuOpen = false" />
        <div
          class="developers-dropdown"
          :class="{ 'is-open': developersOpen }"
          @mouseenter="developersOpen = true"
          @mouseleave="developersOpen = false"
          @focusin="developersOpen = true"
          @focusout="closeDevelopersOnFocusOut"
        >
          <button
            class="developers-trigger"
            type="button"
            aria-haspopup="true"
            :aria-expanded="developersOpen"
            aria-controls="developers-menu"
            @click="developersOpen = !developersOpen"
            @keydown.escape="developersOpen = false"
          >
            <span>Explorar</span>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>

          <div id="developers-menu" class="developers-menu">
            <span class="developers-menu-label">Recursos</span>
            <RouterLink to="/" @click="closeDevelopers">
              <span class="developers-menu-icon is-home">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
              </span>
              <span><strong>Guías</strong><small>Instalar y administrar DashCole</small></span>
            </RouterLink>
            <a :href="docsUrl" @click="closeDevelopers">
              <span class="developers-menu-icon is-docs">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </span>
              <span><strong>Documentación</strong><small>Referencia del producto</small></span>
            </a>
            <RouterLink to="/installation/como-instalar-dashcole" @click="closeDevelopers">
              <span class="developers-menu-icon is-demo">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3 8h18" stroke="currentColor" stroke-width="1.8"/><path d="m10 11 5 3-5 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
              </span>
              <span><strong>Instalación</strong><small>Primer arranque local</small></span>
            </RouterLink>
            <RouterLink to="/administration/cuentas-roles-y-permisos" @click="closeDevelopers">
              <span class="developers-menu-icon is-faq">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M9.8 9.2a2.35 2.35 0 1 1 3.1 2.23c-.9.34-.9 1.02-.9 1.57" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1" fill="currentColor"/></svg>
              </span>
              <span><strong>Administración</strong><small>Cuentas, roles y plataforma</small></span>
            </RouterLink>
          </div>
        </div>
        <a class="header-cta" :href="docsUrl">
          <span>Documentación</span>
          <svg class="header-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import GuideSearch from './GuideSearch.vue'
import { logoSrcset, logoUrl } from '../brandAssets'
import { guidesHomeUrl } from '../siteLinks'

const docsUrl = import.meta.env.DEV ? 'http://localhost:5177/' : 'https://guias.hlquery.com/'

const menuOpen = ref(false)
const developersOpen = ref(false)
const isScrolled = ref(false)
const isHeaderVisible = ref(true)

let lastScrollY = 0
const scrollDelta = 6

const updateHeader = () => {
  const currentY = window.scrollY
  isScrolled.value = currentY > 8
  if (Math.abs(currentY - lastScrollY) < scrollDelta) return
  isHeaderVisible.value = currentY < 48 || currentY < lastScrollY
  lastScrollY = currentY
}

const closeDevelopers = () => {
  developersOpen.value = false
  menuOpen.value = false
}

const closeDevelopersOnFocusOut = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) developersOpen.value = false
}

onMounted(() => {
  lastScrollY = window.scrollY
  updateHeader()
  window.addEventListener('scroll', updateHeader, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateHeader)
})
</script>
