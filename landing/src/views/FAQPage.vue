<template>
  <div class="faq-page">
    <Header :force-header-background-color="'#f7f8fc'" />

    <main class="faq-main">
      <section class="faq-section-wrapper">
        <div class="faq-bg-shape faq-bg-triangle" aria-hidden="true"></div>
        <div class="faq-bg-shape faq-bg-circle" aria-hidden="true"></div>
        <div class="faq-bg-shape faq-bg-square" aria-hidden="true"></div>
        <div class="faq-section-shell-wrapper">
          <FaqSection
            :kicker="ti('faqPage.kicker', 'Frequently Asked Questions')"
            :title="ti('faqPage.sectionTitle', 'Frequently Asked Questions')"
            :subtitle="ti('faqPage.sectionSubtitle', 'Search, filter, and expand the topic you care about.')"
            :search-placeholder="ti('faqPage.searchPlaceholder', 'Search')"
            :clear-search-label="ti('faqPage.clearSearchLabel', 'Clear search')"
            :empty-state-text="ti('faqPage.emptyStateText', 'No FAQ entries match that filter yet.')"
            :showFilters="true"
            :entries="resolvedFaqEntries"
            :filters="resolvedFaqFilters"
          />
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import FaqSection from '@/components/FaqSection.vue'
import { faqEntries as fallbackFaqEntries, faqFilters as fallbackFaqFilters } from '@/data/faqContent'
import { useSettingsStore } from '@/stores/settings'
import domainConfig from '@/config/domain'
import { rewriteRuntimeLinksInHtml } from '@/utils/runtimeLinks'

const { t, tm } = useI18n()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const ti = (key, fallback) => {
  const value = t(key)
  return value === key ? fallback : value
}

const isLocalUrl = (value = '') => /^(https?:\/\/)?(localhost|127\.0\.0\.1|[^/]+\.local)(:\d+)?(\/|$)/i.test(String(value).trim())
const docsBaseUrl = computed(() => {
  const configuredUrl = String(settings.value?.docs_url || '').trim()
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }

  return 'http://guias.hlquery.com/'
})

const blogBaseUrl = computed(() => {
  const configuredUrl = String(settings.value?.blog_url || '').trim()
  if (configuredUrl && (!import.meta.env.DEV || isLocalUrl(configuredUrl))) {
    return configuredUrl.replace(/\/+$/, '')
  }

  return domainConfig.getBlogUrl('/').replace(/\/+$/, '')
})

const rewriteFaqEntryLinks = (entry) => {
  if (!entry || !entry.q || !entry.a) return null

  return {
    ...entry,
    a: rewriteRuntimeLinksInHtml(entry.a, {
      docsBaseUrl: docsBaseUrl.value,
      blogBaseUrl: blogBaseUrl.value,
      webBaseUrl: domainConfig.getWebUrl('/')
    })
  }
}

const localizedFaqEntries = computed(() => {
  const entries = tm('faqPage.entries')
  return Array.isArray(entries)
    ? entries
        .map(rewriteFaqEntryLinks)
        .filter((entry) => entry?.q && entry?.a)
    : []
})

const resolvedFaqEntries = computed(() =>
  localizedFaqEntries.value.length > 0
    ? localizedFaqEntries.value
    : fallbackFaqEntries.map(rewriteFaqEntryLinks).filter((entry) => entry?.q && entry?.a)
)

const resolvedFaqFilters = computed(() => fallbackFaqFilters.map((filter) => ({
  ...filter,
  label: ti(`faqPage.filters.${filter.value}`, filter.label)
})))
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fc;
}

.faq-main {
  width: min(1280px, calc(100% - 32px));
  margin: -14px auto 0;
  padding: 2px 0 72px;
  display: grid;
  gap: 18px;
}

.faq-section-wrapper {
  width: 100%;
  position: relative;
  isolation: isolate;
  overflow: visible;
  border-radius: 28px;
}

.faq-section-shell-wrapper {
  display: grid;
  gap: 18px;
  position: relative;
  z-index: 2;
}

.faq-bg-shape {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  transform-origin: center center;
}

.faq-bg-triangle {
  width: 0;
  height: 0;
  opacity: 0.12;
  border-left: 35px solid transparent;
  border-right: 35px solid transparent;
  border-bottom: 60px solid #22c55e;
  top: 390px;
  right: -56px;
  transform: translateY(-50%);
  opacity: 0.2;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.12)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
}

.faq-bg-circle {
  width: 150px;
  height: 150px;
  border-radius: 999px;
  opacity: 0.22;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  top: -28px;
  left: -42px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.faq-bg-square {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  opacity: 0.18;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  top: 92px;
  right: -42px;
  transform: rotate(15deg);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.faq-section-wrapper :deep(.faq-section-shell) {
  max-width: 100%;
  position: relative;
  z-index: 2;
  padding: 34px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 1), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(213, 223, 237, 0.95);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.94) inset,
    0 0 0 1px rgba(15, 23, 42, 0.025),
    0 18px 50px rgba(15, 23, 42, 0.065);
}

.faq-section-wrapper :deep(.faq-section-header) {
  align-items: end;
  gap: 18px;
  margin-bottom: 24px;
}

.faq-section-wrapper :deep(.faq-section-kicker) {
  display: block;
  margin: 0 0 14px !important;
  font-size: clamp(1.8rem, 4.2vw, 3.6rem) !important;
  line-height: 0.8 !important;
  letter-spacing: -0.045em !important;
  text-transform: none;
  font-weight: 900 !important;
  color: #000000 !important;
}

.faq-section-wrapper :deep(.faq-section-top-icon) {
  display: none;
}

.faq-section-wrapper :deep(.faq-section-title) {
  display: none;
}

.faq-section-wrapper :deep(.faq-section-subtitle) {
  color: #000000 !important;
  max-width: 56ch;
  font-size: 1.14rem;
  font-weight: 600;
  line-height: 1.5;
  margin-top: 12px;
}

.faq-section-wrapper :deep(.faq-search-shell) {
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(520px, 100%);
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  background: #edf2f8;
  box-shadow: none;
  border: none;
  overflow: hidden;
}

.faq-section-wrapper :deep(.faq-search-icon-wrap) {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
}

.faq-section-wrapper :deep(.faq-search-input) {
  flex: 1 1 auto;
  width: auto;
  min-height: 40px;
  padding: 0;
  color: #94a3b8;
  font-size: 0.92rem;
  font-weight: 400;
  background: transparent !important;
  border: none;
  outline: none;
  box-shadow: none;
  border-radius: 0;
  appearance: none;
  -webkit-appearance: none;
  display: block;
}

.faq-section-wrapper :deep(.faq-search-input:focus),
.faq-section-wrapper :deep(.faq-search-input:focus-visible) {
  outline: none !important;
  border: none !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.faq-section-wrapper :deep(.faq-search-input::-webkit-search-decoration),
.faq-section-wrapper :deep(.faq-search-input::-webkit-search-cancel-button),
.faq-section-wrapper :deep(.faq-search-input::-webkit-search-results-button),
.faq-section-wrapper :deep(.faq-search-input::-webkit-search-results-decoration) {
  -webkit-appearance: none;
  display: none;
}

.faq-section-wrapper :deep(.faq-search-input::-webkit-clear-button) {
  -webkit-appearance: none;
  display: none;
}

.faq-section-wrapper :deep(.faq-search-input::-ms-clear),
.faq-section-wrapper :deep(.faq-search-input::-ms-reveal) {
  display: none;
  width: 0;
  height: 0;
}

.faq-section-wrapper :deep(.faq-search-input:-webkit-autofill),
.faq-section-wrapper :deep(.faq-search-input:-webkit-autofill:hover),
.faq-section-wrapper :deep(.faq-search-input:-webkit-autofill:focus) {
  -webkit-text-fill-color: #94a3b8;
  transition: background-color 9999s ease-out 0s;
  -webkit-box-shadow: 0 0 0 1000px transparent inset;
}

.faq-section-wrapper :deep(.faq-search-icon) {
  color: #000000;
  opacity: 1;
  font-size: 15px;
}

.faq-section-wrapper :deep(.faq-search-clear) {
  color: #6b7280;
}

.faq-section-wrapper :deep(.faq-search-clear:hover) {
  background: rgba(107, 114, 128, 0.14);
  color: #111827;
}

.faq-section-wrapper :deep(.faq-search-input::placeholder) {
  color: #a8b2c1;
  opacity: 1;
}

.faq-section-wrapper :deep(.faq-search-shell:focus-within) {
  background: #f2f6fb;
  box-shadow: none;
}

.faq-section-wrapper :deep(.faq-filter-bar) {
  gap: 0.7rem;
  margin-top: 1.3rem;
  margin-bottom: 18px;
}

.faq-section-wrapper :deep(.faq-filter-chip) {
  border: none;
  background: #dce4ee;
  color: #0f172a;
  border-radius: 8px;
  padding: 0.56rem 1rem;
  min-height: auto;
  font: inherit;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
  transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.faq-section-wrapper :deep(.faq-filter-chip:hover) {
  background: #d2dbe8;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.faq-section-wrapper :deep(.faq-filter-chip.is-active) {
  border: none;
  background: #cdd8e8;
  color: #102033;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.1);
}

.faq-section-wrapper :deep(.faq-filter-chip-icon) {
  color: #1e293b;
}

.faq-section-wrapper :deep(.faq-filter-chip:hover .faq-filter-chip-icon),
.faq-section-wrapper :deep(.faq-filter-chip.is-active .faq-filter-chip-icon) {
  color: #1e293b;
}

.faq-section-wrapper :deep(.faq-panels) {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  margin-top: 52px !important;
}

.faq-section-wrapper :deep(.faq-panels .v-expansion-panel) {
  margin-top: 0 !important;
}

.faq-section-wrapper :deep(.faq-panels .v-expansion-panel::after) {
  display: none;
}

.faq-section-wrapper :deep(.faq-panel) {
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #edf2f8;
  margin-bottom: 0 !important;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.02),
    0 2px 6px rgba(15, 23, 42, 0.045),
    0 0 0 1px rgba(255, 255, 255, 0.75) inset;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.faq-section-wrapper :deep(.faq-panel:hover) {
  border-color: rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.035),
    0 5px 12px rgba(15, 23, 42, 0.055),
    0 0 0 1px rgba(255, 255, 255, 0.82) inset;
}

.faq-section-wrapper :deep(.faq-panel.v-expansion-panel--active) {
  border-color: rgba(15, 23, 42, 0.08);
  background: #eef3f9;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.035),
    0 5px 12px rgba(15, 23, 42, 0.055),
    0 0 0 1px rgba(255, 255, 255, 0.82) inset;
}

.faq-section-wrapper :deep(.faq-question) {
  background: #edf2f8;
  min-height: 58px;
  padding: 0 18px;
}

.faq-section-wrapper :deep(.faq-answer) {
  padding: 24px 18px 18px;
  color: #000000;
  line-height: 1.65;
  background: #f6f9fd;
}

.faq-section-wrapper :deep(.faq-answer),
.faq-section-wrapper :deep(.faq-answer *:not(a)) {
  color: #000000 !important;
}

.faq-section-wrapper :deep(.faq-panel.v-expansion-panel--active .faq-answer) {
  background: #f0f5fb;
}

.faq-section-wrapper :deep(.faq-question-content) {
  gap: 12px;
  font-size: 1rem;
  font-weight: 800;
  color: #10203d;
}

.faq-section-wrapper :deep(.faq-bullet) {
  width: 9px;
  height: 9px;
  background: #4d7fcb;
}

.faq-section-wrapper :deep(.faq-chevron) {
  color: #5478b7;
  opacity: 0.92;
  margin-left: 18px;
}

.faq-section-wrapper :deep(.faq-panel .v-expansion-panel-title--active .faq-chevron) {
  color: #214f9b;
}

.faq-section-wrapper :deep(.faq-answer p) {
  margin: 0;
  color: #000000;
}

.faq-section-wrapper :deep(.faq-answer a) {
  color: #173b79;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px solid rgba(23, 59, 121, 0.25);
  padding-bottom: 1px;
}

.faq-section-wrapper :deep(.faq-answer a:hover) {
  color: #0f2d62;
  border-bottom-color: rgba(15, 45, 98, 0.45);
}

.faq-section-wrapper :deep(.faq-question-content mark),
.faq-section-wrapper :deep(.faq-answer mark) {
  background: rgba(125, 170, 255, 0.28);
  color: #0f172a;
  border-radius: 3px;
  padding: 0;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  box-shadow: inset 0 -0.5em 0 rgba(125, 170, 255, 0.28);
}

@media (max-width: 720px) {
  .faq-main {
    width: min(100% - 18px, 1280px);
    padding: 12px 0 64px;
  }

  .faq-section-wrapper :deep(.faq-section-shell) {
    padding: 20px 18px;
    border-radius: 24px;
  }

  .faq-section-wrapper :deep(.faq-section-title) {
    font-size: clamp(2.5rem, 12vw, 3.6rem);
  }

  .faq-section-wrapper :deep(.faq-section-subtitle) {
    font-size: 1rem;
  }

  .faq-section-wrapper :deep(.faq-section-kicker) {
    font-size: clamp(2.2rem, 13vw, 4rem);
  }

  .faq-section-wrapper :deep(.faq-search-shell) {
    width: 100%;
    min-height: 40px;
    border-radius: 12px;
    padding: 0 12px;
  }

  .faq-section-wrapper :deep(.faq-search-input) {
    min-height: 40px;
    padding: 0;
    font-size: 0.9rem;
  }

  .faq-section-wrapper :deep(.faq-search-icon-wrap) {
    width: 16px;
    height: 16px;
  }

  .faq-section-wrapper :deep(.faq-search-icon) {
    font-size: 15px;
  }

  .faq-section-wrapper :deep(.faq-question) {
    min-height: 58px;
    padding: 0 14px;
  }

  .faq-section-wrapper :deep(.faq-answer) {
    padding: 0 14px 14px;
  }

  .faq-section-wrapper,
  .faq-section-shell-wrapper,
  .faq-section-wrapper :deep(.faq-section),
  .faq-section-wrapper :deep(.faq-section-shell) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }

  .faq-bg-circle {
    width: 96px;
    height: 96px;
    top: -18px;
    left: -26px;
  }

  .faq-bg-triangle {
    border-left-width: 26px;
    border-right-width: 26px;
    border-bottom-width: 44px;
    top: 310px;
    right: -36px;
    transform: translateY(-50%);
  }

  .faq-bg-square {
    width: 82px;
    height: 82px;
    top: 72px;
    right: -24px;
  }
}

@media (max-width: 480px) {
  .faq-bg-shape {
    display: none;
  }
}
</style>
