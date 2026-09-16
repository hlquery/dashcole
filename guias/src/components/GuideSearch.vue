<template>
  <div class="guide-search" @focusin="searchOpen = true" @focusout="closeSearch">
    <span class="guide-search-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
        <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </span>
    <input
      ref="searchInput"
      v-model="searchQuery"
      type="search"
      :placeholder="placeholder"
      aria-label="Buscar guías"
      role="combobox"
      aria-autocomplete="list"
      :aria-controls="listboxId"
      :aria-expanded="showSearchResults"
      :aria-activedescendant="activeResultId"
      autocomplete="off"
      @keydown.down.prevent="moveSelection(1)"
      @keydown.up.prevent="moveSelection(-1)"
      @keydown.enter.prevent="openSelectedResult"
      @keydown.escape="clearSearch()"
    />
    <button
      v-if="searchQuery"
      type="button"
      class="guide-search-clear"
      aria-label="Borrar búsqueda"
      @mousedown.prevent
      @click="clearSearch(true)"
    >
      <span aria-hidden="true">×</span>
    </button>
    <div v-if="showSearchResults" :id="listboxId" class="guide-search-results" role="listbox">
      <div class="guide-search-results-label" aria-hidden="true">
        {{ searchQuery.trim() ? 'Mejores coincidencias' : 'Guías sugeridas' }}
      </div>
      <RouterLink
        v-for="(guide, index) in matchingGuides"
        :key="guide.slug"
        :id="resultId(index)"
        :to="guide.path"
        role="option"
        :class="{ 'is-keyboard-selected': index === activeResultIndex }"
        :aria-selected="index === activeResultIndex"
        @mouseenter="activeResultIndex = index"
        @click="selectGuide"
      >
        <i
          class="guide-search-result-icon"
          :class="`is-${categoryIcon(guide)}`"
          aria-hidden="true"
        >
          <span
            class="guide-category-chip-icon"
            :class="`is-${categoryIcon(guide)}`"
          ></span>
        </i>
        <span class="guide-search-result-copy">
          <strong>{{ guide.title }}</strong>
          <small>{{ guide.category }} · {{ guide.duration }}</small>
        </span>
      </RouterLink>
      <p v-if="matchingGuides.length === 0">Sin coincidencias rápidas.</p>
      <RouterLink
        class="guide-full-search"
        :class="{ 'is-keyboard-selected': activeResultIndex === matchingGuides.length }"
        :id="resultId(matchingGuides.length)"
        :to="fullSearchPath"
        role="option"
        :aria-selected="activeResultIndex === matchingGuides.length"
        @mouseenter="activeResultIndex = matchingGuides.length"
        @click="selectGuide"
      >
        <i class="guide-search-result-icon is-search-all" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" stroke-width="1.8" />
            <path d="m15 15 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </i>
        <span>
          <strong>{{ searchQuery.trim() ? 'Buscar en todas las guías' : 'Ver la biblioteca de guías' }}</strong>
          <small v-if="searchQuery.trim()">para “{{ searchQuery.trim() }}”</small>
          <small v-else>Ver todas las guías y categorías</small>
        </span>
        <b aria-hidden="true">→</b>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { guides } from '../content'

const props = defineProps({
  idPrefix: {
    type: String,
    default: 'guide-search'
  },
  placeholder: {
    type: String,
    default: 'Buscar guías'
  }
})
const emit = defineEmits(['selected'])

const searchOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)
const activeResultIndex = ref(-1)
const router = useRouter()

const matchingGuides = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return []

  const terms = query.split(/\s+/).filter(Boolean)

  return guides
    .map((guide) => {
      const title = guide.title.toLowerCase()
      const category = guide.category.toLowerCase()
      const content = `${title} ${category} ${guide.summary} ${guide.searchText}`.toLowerCase()
      if (!terms.every((term) => content.includes(term))) return null

      const score = title.startsWith(query) ? 0 : title.includes(query) ? 1 : category.includes(query) ? 2 : 3
      return { guide, score }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.guide.title.localeCompare(b.guide.title))
    .slice(0, 6)
    .map(({ guide }) => guide)
})

const showSearchResults = computed(() => searchOpen.value && Boolean(searchQuery.value.trim()))
const fullSearchPath = computed(() => ({ path: '/search', query: { q: searchQuery.value.trim() } }))
const listboxId = computed(() => `${props.idPrefix}-listbox`)
const resultId = (index) => `${props.idPrefix}-result-${index}`
const categoryIcon = (guide) => guide.categorySlug || 'development'
const activeResultId = computed(() => (
  activeResultIndex.value >= 0 ? resultId(activeResultIndex.value) : undefined
))

watch(searchQuery, () => {
  activeResultIndex.value = -1
})

const selectGuide = () => {
  searchQuery.value = ''
  searchOpen.value = false
  activeResultIndex.value = -1
  emit('selected')
}

const moveSelection = (direction) => {
  if (!searchQuery.value.trim()) return

  const optionCount = matchingGuides.value.length + 1

  searchOpen.value = true
  if (activeResultIndex.value === -1) {
    activeResultIndex.value = direction > 0 ? 0 : optionCount - 1
    return
  }

  activeResultIndex.value = (activeResultIndex.value + direction + optionCount) % optionCount
}

const openSelectedResult = () => {
  if (activeResultIndex.value === matchingGuides.value.length) {
    router.push(fullSearchPath.value)
    selectGuide()
    return
  }

  if (activeResultIndex.value === -1) {
    if (!searchQuery.value.trim()) return
    router.push(fullSearchPath.value)
    selectGuide()
    return
  }

  const selectedGuide = matchingGuides.value[activeResultIndex.value]
  if (!selectedGuide) return
  router.push(selectedGuide.path)
  selectGuide()
}

const clearSearch = (keepOpen = false) => {
  searchQuery.value = ''
  searchOpen.value = keepOpen
  activeResultIndex.value = -1
  if (keepOpen) searchInput.value?.focus()
}

const closeSearch = () => {
  window.setTimeout(() => {
    searchOpen.value = false
    activeResultIndex.value = -1
  }, 120)
}
</script>
