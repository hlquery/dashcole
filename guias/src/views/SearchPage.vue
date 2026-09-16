<template>
  <main class="search-page">
    <div class="page-width search-page-inner">
      <p class="eyebrow">Búsqueda de guías</p>
      <h1>Buscar en todas las guías</h1>
      <p class="search-page-intro">Busca títulos, resúmenes, categorías y el texto completo de las guías de DashCole.</p>

      <form class="full-search-form" role="search" @submit.prevent="submitSearch">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </span>
        <input v-model="searchInput" type="search" aria-label="Buscar en todas las guías" placeholder="Buscar instalación, entorno, respaldos…" autocomplete="off" />
        <button type="submit">Buscar guías</button>
      </form>

      <template v-if="query">
        <div class="search-result-summary" aria-live="polite">
          <span>Unos {{ results.length }} {{ results.length === 1 ? 'resultado' : 'resultados' }} para “{{ query }}”</span>
        </div>

        <div v-if="results.length" class="search-results-list">
          <RouterLink v-for="guide in results" :key="guide.path" class="search-result-card" :to="guide.path">
            <div class="search-result-card-copy">
              <h2 class="search-result-route">
                <span>{{ guide.category }}</span>
                <b aria-hidden="true">›</b>
                <span>{{ guide.shortTitle || guide.title }}</span>
              </h2>
              <p>{{ guide.summary }}</p>
              <div class="search-result-card-meta">
                <span>{{ guide.duration }} de lectura</span>
              </div>
            </div>
          </RouterLink>
        </div>

        <div v-else class="search-empty">
          <strong>Ninguna guía coincide con “{{ query }}”</strong>
          <p>Prueba una frase más corta o un tema como instalación, configuración, despliegue, cuentas o respaldos.</p>
        </div>
      </template>

      <div v-else class="search-empty">
        <strong>¿Qué quieres encontrar?</strong>
        <p>Escribe un tema arriba para buscar en toda la biblioteca de guías.</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { guides } from '../content'

const route = useRoute()
const router = useRouter()
const query = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const searchInput = ref(query.value)

watch(query, (value) => {
  searchInput.value = value
})

const results = computed(() => {
  const terms = query.value.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []

  return guides
    .map((guide) => {
      const title = guide.title.toLowerCase()
      const category = guide.category.toLowerCase()
      const summary = guide.summary.toLowerCase()
      const content = guide.searchText.toLowerCase()
      const haystack = `${title} ${category} ${summary} ${content}`
      if (!terms.every((term) => haystack.includes(term))) return null

      const score = terms.reduce((total, term) => (
        total
        + (title.includes(term) ? 8 : 0)
        + (category.includes(term) ? 4 : 0)
        + (summary.includes(term) ? 3 : 0)
        + (content.includes(term) ? 1 : 0)
      ), 0)

      return { guide, score }
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.guide.order - right.guide.order)
    .map(({ guide }) => guide)
})

const submitSearch = () => {
  const value = searchInput.value.trim()
  router.replace(value ? { path: '/search', query: { q: value } } : { path: '/search' })
}
</script>
