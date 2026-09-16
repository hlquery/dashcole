<template>
  <main class="overview-page">
    <section class="guides-overview-hero">
      <div class="page-width overview-stage">
        <div class="hero-grid">
          <div class="hero-copy">
            <h1>Guías y recursos</h1>
            <p>
              Guías prácticas para instalar DashCole, configurar el entorno y administrar colegios, cuentas y despliegues.
            </p>
            <button class="overview-browse" type="button" aria-label="Ver todas las guías de DashCole" @click="browseGuides">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4h8M4 8h8M4 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              <span>Ver todas las guías</span>
            </button>
          </div>

          <div class="hero-cards-grid" aria-label="Guías y recursos destacados">
            <GuideLandingCard
              v-if="heroCards.length > 0"
              :category="heroCards[0].category"
              :title="heroCards[0].title"
              :to="heroCards[0].to"
              :href="heroCards[0].href"
              :tone="heroCards[0].tone"
              :size="heroCards[0].size"
              :figureType="heroCards[0].figureType"
              :seed="heroCards[0].seed"
              :sequenceIndex="0"
              class="hero-card-primary"
            />

            <div class="hero-card-cluster">
              <GuideLandingCard
                v-for="(card, index) in heroCards.slice(1)"
                :key="card.title"
                :category="card.category"
                :title="card.title"
                :to="card.to"
                :href="card.href"
                :tone="card.tone"
                :size="card.size"
                :figureType="card.figureType"
                :seed="card.seed"
                :sequenceIndex="index + 1"
                class="hero-card-secondary"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="overview-ribbons" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="overview-slope" aria-hidden="true"></div>
    </section>

    <section class="resource-shelf">
      <div class="page-width">
        <div class="shelf-heading">
          <h2>Primeros pasos</h2>
          <p>Todo lo necesario para instalar DashCole en local y dejar el colegio listo para operar.</p>
        </div>

        <div class="shelf-grid">
          <GuideLandingCard
            v-for="(card, index) in shelfCards"
            :key="card.title"
            :category="card.category"
            :title="card.title"
            :to="card.to"
            :href="card.href"
            :tone="card.tone"
            :size="card.size"
            :figureType="card.figureType"
            :seed="card.seed"
            :sequenceIndex="index"
          />
        </div>
      </div>
    </section>

    <section id="all-guides" class="all-guides-section">
      <div class="page-width">
        <div class="all-guides-heading">
          <div>
            <span>Biblioteca de guías</span>
            <h2>Aprende DashCole operándolo</h2>
            <p>Sigue rutas prácticas de instalación, administración, despliegue y operaciones.</p>
          </div>
          <strong>{{ filteredGuides.length }} {{ filteredGuides.length === 1 ? 'guía' : 'guías' }}</strong>
        </div>

        <div class="all-guides-controls">
          <GuideSearch
            class="library-guide-search"
            id-prefix="library-guide-search"
            placeholder="Buscar…"
          />

          <div class="guide-category-filter" aria-label="Filtrar guías por categoría">
            <button
              v-for="category in guideCategories"
              :key="category.value"
              type="button"
              class="guide-category-chip"
              :class="{ 'is-active': activeCategory === category.value }"
              :aria-pressed="String(activeCategory === category.value)"
              @click="selectCategory(category.value)"
            >
              <span
                class="guide-category-chip-icon"
                :class="`is-${category.icon}`"
                aria-hidden="true"
              ></span>
              <span>{{ category.label }}</span>
            </button>
          </div>
        </div>

        <div class="all-guides-grid">
          <GuideLandingCard
            v-for="(guide, index) in visibleGuides"
            :key="guide.path"
            :category="guide.category"
            :title="guide.shortTitle || guide.title"
            :to="guide.path"
            :tone="toneFor(guide.category)"
            :size="guide.cardSize"
            :figureType="figureFor(guide.category)"
            :seed="`library-${guide.path}`"
            :sequenceIndex="index"
          />
        </div>

        <nav v-if="totalPages > 1" class="overview-pagination" aria-label="Páginas de guías">
          <span v-if="currentPage === 1" class="is-disabled" aria-hidden="true">←</span>
          <RouterLink v-else :to="pageLink(currentPage - 1)" aria-label="Página anterior de guías">←</RouterLink>
          <RouterLink
            v-for="page in totalPages"
            :key="page"
            :class="{ 'is-current': page === currentPage }"
            :aria-label="`Open guides page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            :to="pageLink(page)"
          >{{ page }}</RouterLink>
          <span v-if="currentPage === totalPages" class="is-disabled" aria-hidden="true">→</span>
          <RouterLink v-else :to="pageLink(currentPage + 1)" aria-label="Página siguiente de guías">→</RouterLink>
        </nav>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import GuideLandingCard from '../components/GuideLandingCard.vue'
import GuideSearch from '../components/GuideSearch.vue'
import { guides, resources } from '../content'

const updatedForPath = (path) => guides.find((guide) => guide.path === path)?.updated || 'septiembre 2026'

const figureFor = (category) => ({
  Instalación: 'circles',
  Installation: 'circles',
  Operaciones: 'nodes',
  Operations: 'nodes',
  Administración: 'stairs',
  Administration: 'stairs',
  Despliegue: 'tunnel',
  Deployment: 'tunnel',
  Configuration: 'grid'
})[category] || 'orbit'

const toneFor = (category) => ({
  Instalación: 'coral',
  Installation: 'coral',
  Operaciones: 'mint',
  Operations: 'mint',
  Administración: 'purple',
  Administration: 'purple',
  Despliegue: 'blue',
  Deployment: 'blue',
  Configuration: 'blue'
})[category] || 'blue'

const heroCards = [
  {
    category: guides[0].category,
    title: guides[0].title,
    to: guides[0].path,
    tone: 'orange',
    figureType: 'install',
    size: 'tall',
    seed: `hero-${guides[0].path}`
  },
  ...resources
    .slice(0, 5)
    .map((resource, index) => ({
    category: resource.category,
    title: resource.title,
    href: resource.href,
    tone: toneFor(resource.category),
    figureType: figureFor(resource.category),
    size: ['medium', 'short', 'medium', 'tall', 'short'][index] || 'medium',
    seed: `hero-${resource.title}`
    }))
]

const shelfCards = [
  {
    category: guides[0].category,
    title: guides[0].title,
    to: guides[0].path,
    tone: toneFor(guides[0].category),
    figureType: 'install',
    size: 'tall',
    seed: `shelf-${guides[0].path}`
  },
  ...resources.slice(0, 3).map((resource, index) => ({
    category: resource.category,
    title: resource.title,
    href: resource.href,
    tone: toneFor(resource.category),
    figureType: figureFor(resource.category),
    size: ['medium', 'tall', 'short'][index] || 'medium',
    seed: `shelf-${resource.title}`
  }))
]

const guidesPerPage = 18
const route = useRoute()
const router = useRouter()
const currentPage = ref(Math.max(1, Number(route.params.page) || 1))
const activeCategory = ref(String(route.params.category || route.query.category || 'all'))

watch(() => [route.params.page, route.params.category, route.query.category], ([page, category, queryCategory]) => {
  currentPage.value = Math.max(1, Number(page) || 1)
  activeCategory.value = String(category || queryCategory || 'all')
})

const categoryDetails = [
  { value: 'all', label: 'Todas', icon: 'all' },
  { value: 'installation', label: 'Instalación', icon: 'installation' },
  { value: 'administration', label: 'Administración', icon: 'development' },
  { value: 'deployment', label: 'Despliegue', icon: 'configuration' },
  { value: 'operations', label: 'Operaciones', icon: 'operations' }
]

const guideCategories = computed(() => categoryDetails.filter((category) => (
  category.value === 'all' || guides.some((guide) => (
    (category.categories || [category.value]).includes(guide.categorySlug)
  ))
)))

const filteredGuides = computed(() => {
  if (activeCategory.value === 'all') return guides
  const category = categoryDetails.find((item) => item.value === activeCategory.value)
  const categorySlugs = category?.categories || [activeCategory.value]
  return guides.filter((guide) => categorySlugs.includes(guide.categorySlug))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGuides.value.length / guidesPerPage)))
const visibleGuides = computed(() => {
  const start = (currentPage.value - 1) * guidesPerPage
  const sizeSequence = ['medium', 'short', 'tall', 'medium', 'short']
  return filteredGuides.value.slice(start, start + guidesPerPage).map((guide, index) => ({
    ...guide,
    cardSize: sizeSequence[index % sizeSequence.length]
  }))
})

const selectCategory = (category) => {
  activeCategory.value = category
  currentPage.value = 1
  if (route.name !== 'guides') router.push({ name: 'guides' })
}

const browseGuides = () => {
  const section = document.getElementById('all-guides')
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const pageLink = (page) => ({
  path: page === 1 ? '/' : `/page/${page}`,
  hash: '#all-guides'
})
</script>
