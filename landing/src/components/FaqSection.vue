<template>
  <section class="faq-section">
    <div class="faq-section-shell">
      <header class="faq-section-header">
        <div>
          <p class="faq-section-kicker">{{ kicker }}</p>
          <h2 class="faq-section-title">
            <span class="faq-title-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.38 9a2.63 2.63 0 1 1 4.56 1.75c-.46.46-1.05.83-1.52 1.27c-.42.39-.67.83-.67 1.48"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M12 17h.01"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span>{{ title }}</span>
          </h2>
          <p class="faq-section-subtitle">
            {{ subtitle }}
          </p>
        </div>
      </header>

      <div class="faq-search-row">
        <div class="faq-search-shell">
          <span class="faq-search-icon-wrap" aria-hidden="true">
            <svg class="faq-search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path d="M20 20L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="searchTerm"
            type="text"
            :placeholder="searchPlaceholder"
            class="faq-search-input"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
          />
          <button
            v-if="searchTerm"
            type="button"
            class="faq-search-clear"
            :aria-label="clearSearchLabel"
            @click="searchTerm = ''"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showFilters" class="faq-filter-bar">
        <button
          v-for="filter in sourceFilters"
          :key="filter.value"
          type="button"
          :class="['faq-filter-chip', { 'is-active': filter.value === activeFaqFilter }]"
          :aria-pressed="String(filter.value === activeFaqFilter)"
          @click="activeFaqFilter = filter.value"
        >
          <span class="faq-filter-chip-icon" aria-hidden="true" v-html="iconForFilter(filter.value)"></span>
          {{ filter.label }}
        </button>
      </div>

      <div :class="['faq-panels', { 'is-searching': searchTerm.trim().length > 0 }]">
        <template v-if="paginatedFaq.length">
          <article
            v-for="(item, index) in paginatedFaq"
            :key="`${item.q}-${index}`"
            :class="['faq-panel', { 'is-active': expandedPanel === index }]"
          >
            <button
              type="button"
              class="faq-question"
              :aria-expanded="String(expandedPanel === index)"
              @click="togglePanel(index)"
            >
              <div class="faq-question-content">
                <span class="faq-bullet" aria-hidden="true"></span>
                <span v-html="highlightText(item.q)"></span>
              </div>
              <svg
                class="faq-chevron"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                :style="{ transform: expandedPanel === index ? 'rotate(180deg)' : 'rotate(0deg)' }"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div v-if="expandedPanel === index" class="faq-answer">
              <p v-html="highlightText(item.a)"></p>
            </div>
          </article>
        </template>
        <template v-else>
          <div class="faq-empty-state">
            {{ emptyStateText }}
          </div>
        </template>
      </div>

      <div v-if="pageCount > 1" class="faq-pagination-wrap">
        <div class="faq-pagination">
          <button
            type="button"
            class="faq-page-arrow"
            :disabled="currentPage === 1"
            @click="goPrevPage"
          >
            &lt;
          </button>

          <button
            v-for="token in faqPageButtons"
            :key="`faq-page-${token}`"
            type="button"
            class="faq-page-btn"
            :class="{ active: token === currentPage, ellipsis: token === '...' }"
            :disabled="token === '...'"
            @click="changePage(token)"
          >
            {{ token }}
          </button>

          <button
            type="button"
            class="faq-page-arrow"
            :disabled="currentPage === pageCount"
            @click="goNextPage"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { faqFilters, faqEntries } from '@/data/faqContent'

const props = defineProps({
  title: {
    type: String,
    default: 'Frequently Asked Questions'
  },
  subtitle: {
    type: String,
    default: 'Find answers to common questions about dashcole'
  },
  kicker: {
    type: String,
    default: 'FAQ'
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  entries: {
    type: Array,
    default: () => faqEntries
  },
  filters: {
    type: Array,
    default: () => faqFilters
  },
  searchPlaceholder: {
    type: String,
    default: 'Search'
  },
  clearSearchLabel: {
    type: String,
    default: 'Clear search'
  },
  emptyStateText: {
    type: String,
    default: 'No FAQ entries match that filter yet.'
  }
})

const activeFaqFilter = ref('all')
const expandedPanel = ref(null)
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 8
const filterIcons = {
  all: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="7"/></svg>',
  installation: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.29a1 1 0 1 1 1.4 1.41l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.41L11 12.59V4a1 1 0 0 1 1-1Z"/><path d="M5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"/></svg>',
  support: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h2v-6H6v-1a6 6 0 1 1 12 0v1h-3v6h2a3 3 0 0 0 3-3v-4a8 8 0 0 0-8-8Z"/></svg>',
  security: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5 4.8 5.3v5.5c0 5 3.1 9.6 7.2 10.8 4.1-1.2 7.2-5.8 7.2-10.8V5.3L12 2.5Z"/></svg>',
  migration: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h8a2 2 0 0 1 2 2v3H2V6a2 2 0 0 1 2-2Zm-2 7h12v3H2v-3Zm2 5h8a2 2 0 0 1 2 2v2H4a2 2 0 0 1-2-2v-2Zm18-7-4 4V10h-5V8h5V5l4 4Zm0 6-4 4v-3h-5v-2h5v-3l4 4Z"/></svg>',
  billing: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 6.5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2v-11Zm2 2v2h15v-2h-15Zm0 5v4h6v-4h-6Z"/></svg>'
}

const sourceEntries = computed(() => props.entries || faqEntries)
const sourceFilters = computed(() => (props.filters && props.filters.length) ? props.filters : faqFilters)

const normalizeFilterToken = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const filterValueByToken = computed(() => {
  const values = new Map()

  sourceFilters.value.forEach((filter) => {
    if (!filter?.value) return
    values.set(normalizeFilterToken(filter.value), filter.value)
    values.set(normalizeFilterToken(filter.label), filter.value)
  })

  return values
})

const normalizeFaqTag = (tag) => (
  filterValueByToken.value.get(normalizeFilterToken(tag)) || tag
)

const filteredFaq = computed(() => {
  const base = activeFaqFilter.value === 'all'
    ? sourceEntries.value
    : sourceEntries.value.filter((entry) => (
      Array.isArray(entry.tags) &&
      entry.tags.some((tag) => normalizeFaqTag(tag) === activeFaqFilter.value)
    ))

  if (!searchTerm.value.trim()) {
    return base
  }

  const needle = searchTerm.value.trim().toLowerCase()
  return base.filter((entry) => (
    entry.q?.toLowerCase().includes(needle) ||
    entry.a?.toLowerCase().includes(needle)
  ))
})

const pageCount = computed(() => Math.max(1, Math.ceil(filteredFaq.value.length / itemsPerPage)))
const faqPageButtons = computed(() => {
  const current = Number(currentPage.value) || 1
  const total = pageCount.value

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('...')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < total - 1) pages.push('...')
  pages.push(total)

  return pages
})
const paginatedFaq = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredFaq.value.slice(start, start + itemsPerPage)
})

const highlightText = (text = '') => {
  if (!searchTerm.value.trim()) return text
  const escaped = searchTerm.value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

const iconForFilter = (filterValue) => (
  filterIcons[filterValue] ||
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12 12 3l9 9-9 9-9-9Z"/></svg>'
)

const changePage = (token) => {
  if (token === '...') return
  const nextPage = Number(token)
  if (!Number.isFinite(nextPage)) return
  currentPage.value = Math.min(pageCount.value, Math.max(1, nextPage))
}

const goPrevPage = () => {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
}

const goNextPage = () => {
  if (currentPage.value >= pageCount.value) return
  currentPage.value += 1
}

const togglePanel = (index) => {
  expandedPanel.value = expandedPanel.value === index ? null : index
}

watch([activeFaqFilter, searchTerm, sourceEntries], () => {
  currentPage.value = 1
  expandedPanel.value = null
})

watch(pageCount, (value) => {
  if (currentPage.value > value) currentPage.value = value
})

watch(currentPage, () => {
  expandedPanel.value = null
})
</script>

<style scoped>
.faq-section {
  width: 100%;
  background: transparent;
  padding: 0;
}

.faq-section-shell {
  background: #ffffff;
  border-radius: 28px;
  padding: clamp(30px, 3vw, 42px);
  box-shadow: 0 18px 40px rgba(16, 32, 61, 0.06);
  border: 1px solid #dbe4f0;
}

.faq-section-header {
  margin-bottom: 20px;
}

.faq-section-kicker {
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.72rem;
  margin: 0 0 8px;
  color: #315da8;
  font-weight: 800;
}

.faq-section-title {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: clamp(1.9rem, 3vw, 2.5rem);
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #10203d;
}

.faq-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(180deg, #eef5ff 0%, #d7e8ff 100%);
  color: #1d4ed8;
  border: 1px solid rgba(147, 197, 253, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 10px 20px rgba(37, 99, 235, 0.12);
  flex: 0 0 auto;
}

.faq-section-subtitle {
  margin: 8px 0 0;
  font-size: 1rem;
  color: #5b6d8a;
  max-width: 520px;
  line-height: 1.6;
}

.faq-search-row {
  width: 100%;
  margin-bottom: 16px;
}

.faq-search-shell {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.faq-search-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.faq-search-input {
  flex: 1 1 auto;
  width: 100%;
}

.faq-search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  padding: 0;
}

.faq-search-clear:hover {
  background: rgba(100, 116, 139, 0.12);
  color: #334155;
}

.faq-search-icon {
  flex: 0 0 auto;
  pointer-events: none;
}

.faq-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.faq-filter-chip {
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.faq-filter-chip-icon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  color: #1e293b;
}

.faq-filter-chip-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.faq-panels {
  width: 100%;
}

.faq-panel {
  border-radius: 18px;
  border: 1px solid #dbe4f0;
  background: #ffffff;
  margin-bottom: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: none;
}

.faq-panel:hover {
  border-color: #bfd0e7;
  box-shadow: 0 10px 24px rgba(16, 32, 61, 0.06);
}

.faq-question {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0 20px;
  min-height: 70px;
  display: flex;
  align-items: center;
  text-align: left;
  cursor: pointer;
}

.faq-question-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 800;
  font-size: 1rem;
  color: #10203d;
}

.faq-bullet {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #4f7fd1;
  flex: 0 0 auto;
}

.faq-chevron {
  color: rgba(36, 89, 182, 0.72);
  margin-left: auto;
  transition: transform 0.22s ease;
}

.faq-answer {
  padding: 6px 20px 20px;
  color: #50627b;
  line-height: 1.7;
  border-top: 1px solid #e5edf7;
  background: #fbfdff;
}

.faq-answer mark,
.faq-question-content mark {
  background: rgba(135, 180, 255, 0.42);
  color: #10203d;
  font-weight: 700;
  padding: 0;
  border-radius: 3px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  box-shadow: inset 0 -0.55em 0 rgba(135, 180, 255, 0.42);
}

.faq-empty-state {
  margin: 24px auto 8px;
  padding: 24px 16px;
  border-radius: 16px;
  background: #f5f8fc;
  color: #475569;
  text-align: center;
  font-weight: 600;
}

.faq-pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.faq-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: #4f483d;
}

.faq-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.faq-page-arrow,
.faq-page-btn {
  border: none;
  background: #f3f4f6;
  color: #111827;
  border-radius: 8px;
  min-width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.faq-page-btn.active {
  background: #ffffff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
}

.faq-page-btn.ellipsis {
  background: transparent;
  box-shadow: none;
  min-width: 28px;
}

@media (max-width: 768px) {
  .faq-section-shell {
    padding: 22px;
  }

  .faq-question {
    padding: 0 16px;
  }
}
</style>
