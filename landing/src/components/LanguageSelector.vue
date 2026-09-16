<template>
  <details class="language-selector" ref="root">
    <summary class="language-trigger" :aria-label="t('language.current', { language: currentLanguage.label })">
      <span class="language-flag">{{ currentLanguage.flag }}</span>
      <span class="language-label">{{ currentLanguage.label }}</span>
      <svg class="language-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </summary>
    <div class="language-menu" role="menu" :aria-label="t('language.menu')">
      <button
        v-for="item in languages"
        :key="item.code"
        class="language-item"
        :class="{ active: currentCode === item.code }"
        type="button"
        role="menuitemradio"
        :aria-checked="currentCode === item.code"
        @click="selectLanguage(item.code)"
      >
        <span class="language-flag">{{ item.flag }}</span>
        <span class="language-name">{{ item.label }}</span>
        <span class="language-check" aria-hidden="true">{{ currentCode === item.code ? '✓' : '' }}</span>
      </button>
    </div>
  </details>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'

const root = ref(null)
const languageStore = useLanguageStore()
const { locale, t } = useI18n()
const languageFlags = {
  en: '🇺🇸',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  hi: '🇮🇳'
}
const languages = computed(() => [
  { code: 'en', label: t('language.english'), flag: languageFlags.en },
  { code: 'es', label: t('language.spanish'), flag: languageFlags.es },
  { code: 'fr', label: t('language.french'), flag: languageFlags.fr },
  { code: 'de', label: t('language.german'), flag: languageFlags.de },
  { code: 'it', label: t('language.italian'), flag: languageFlags.it },
  { code: 'hi', label: t('language.hindi'), flag: languageFlags.hi }
])

const currentCode = computed(() => languageStore.locale || locale.value || 'en')
const currentLanguage = computed(() => {
  return languages.value.find((item) => item.code === currentCode.value) || languages.value[0]
})

const selectLanguage = (code) => {
  const hasChanged = code !== currentCode.value
  languageStore.setLocale(code)
  locale.value = code
  root.value?.removeAttribute('open')
  if (hasChanged && typeof window !== 'undefined') {
    // Some pages precompute translated strings in setup; reload to apply locale everywhere.
    window.location.reload()
  }
}
</script>

<style scoped>
.language-selector {
  position: relative;
}

.language-trigger {
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 138px;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.82);
  color: #0f172a;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  user-select: none;
}

.language-trigger::-webkit-details-marker {
  display: none;
}

.language-label {
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1;
}

.language-chevron {
  margin-left: auto;
  opacity: 0.72;
  transition: transform 0.2s ease;
}

.language-selector[open] .language-chevron {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  min-width: 200px;
  border-radius: 14px;
  border: 1px solid #dbe4f0;
  background: #ffffff;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.14);
  padding: 6px;
  z-index: 40;
}

.language-item {
  width: 100%;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 11px;
  cursor: pointer;
  text-align: left;
}

.language-item:hover {
  background: #f1f5f9;
}

.language-item.active {
  background: #e0ebff;
}

.language-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.language-check {
  margin-left: auto;
  color: #1d4ed8;
  font-weight: 800;
}
</style>
