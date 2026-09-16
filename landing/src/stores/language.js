import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Language Store
 * Manages application language/locale settings
 */
export const useLanguageStore = defineStore('language', () => {
  // State
  const locale = ref('es')
  const availableLocales = ref(['en', 'es', 'fr', 'de', 'it', 'hi'])
  const loading = ref(false)

  // Computed properties
  const currentLocale = computed(() => locale.value)
  const isRTL = computed(() => {
    // Add RTL languages here if needed
    const rtlLocales = ['ar', 'he', 'fa']
    return rtlLocales.includes(locale.value)
  })

  // Set locale
  const setLocale = (newLocale) => {
    if (!availableLocales.value.includes(newLocale)) {
      console.warn(`Locale ${newLocale} is not available. Available locales:`, availableLocales.value)
      return
    }

    locale.value = newLocale
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_language', newLocale)
      
      // Update HTML lang attribute
      document.documentElement.lang = newLocale
      
      // Update HTML dir attribute for RTL
      if (isRTL.value) {
        document.documentElement.dir = 'rtl'
      } else {
        document.documentElement.dir = 'ltr'
      }
    }
  }

  // Initialize locale from storage or browser
  const initLocale = () => {
    if (typeof window === 'undefined') return

    // Try to get from localStorage first
    const stored = localStorage.getItem('user_language')
    if (stored && availableLocales.value.includes(stored)) {
      setLocale(stored)
      return
    }

    setLocale('es')
  }

  // Add a new locale to available locales
  const addLocale = (localeCode) => {
    if (!availableLocales.value.includes(localeCode)) {
      availableLocales.value.push(localeCode)
    }
  }

  // Remove a locale from available locales
  const removeLocale = (localeCode) => {
    const index = availableLocales.value.indexOf(localeCode)
    if (index > -1) {
      availableLocales.value.splice(index, 1)
    }
    
    // If current locale is removed, reset to the landing default
    if (locale.value === localeCode) {
      setLocale('es')
    }
  }

  // Initialize on store creation
  if (typeof window !== 'undefined') {
    initLocale()
  }

  return {
    // State
    locale,
    availableLocales,
    loading,
    
    // Computed
    currentLocale,
    isRTL,
    
    // Actions
    setLocale,
    initLocale,
    addLocale,
    removeLocale
  }
}, {
  persist: {
    key: 'language-store',
    storage: localStorage,
    paths: ['locale', 'availableLocales']
  }
})
