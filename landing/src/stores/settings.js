import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/composables/api'

const defaultApiUrl = '/api'
const privateApiPattern = /^(?:https?:\/\/)?(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|[^/:]+\.local)(?::\d+)?(?:\/|$)/i
const safeApiUrl = (value) => {
  const candidate = String(value || '').trim()
  if (import.meta.env.PROD && privateApiPattern.test(candidate)) {
    return defaultApiUrl
  }
  return candidate || defaultApiUrl
}

/**
 * Settings Store
 * Manages application-wide settings (not user-specific preferences)
 */
export const useSettingsStore = defineStore('settings', () => {
  // State
  const settings = ref({
    base_domain: 'localhost:5173',
    app_name: 'DashCole',
    api_url: safeApiUrl(import.meta.env.VITE_API_URL),
    version: '1.0.0',
    dashcole_install_branch: '1.0',
    maintenance_mode: false,
    features: {}
  })

  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  // Computed properties
  const apiUrl = computed(() => safeApiUrl(settings.value.api_url || import.meta.env.VITE_API_URL))
  const baseDomain = computed(() => settings.value.base_domain || 'localhost:5173')
  const appName = computed(() => settings.value.app_name || 'DashCole')
  const isMaintenanceMode = computed(() => settings.value.maintenance_mode === true)

  // Fetch settings from API
  const fetchSettings = async (options = {}) => {
    if (loading.value && !options.force) {
      return settings.value
    }

    loading.value = true
    error.value = null

    try {
      // Try to fetch from API
      const response = await api.get('/settings')
      
      if (response?.success && response.data) {
        settings.value = {
          ...settings.value,
          ...response.data
        }
        loaded.value = true
        
        // Cache in localStorage
        saveToLocalStorage()
        
        return settings.value
      }
      
      // Fallback to defaults if API fails
      // Silently use defaults when API returns invalid response
      loaded.value = true
      return settings.value
    } catch (err) {
      // Silently handle settings fetch errors - don't log to reduce console noise
      // Settings errors are expected when API server is not running
      error.value = err.message || 'Failed to fetch settings'
      
      // Try to load from localStorage
      loadFromLocalStorage()
      
      // Don't throw - use defaults
      return settings.value
    } finally {
      loading.value = false
    }
  }

  // Update settings
  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    saveToLocalStorage()
  }

  // Get a specific setting
  const getSetting = (key, defaultValue = null) => {
    return settings.value[key] ?? defaultValue
  }

  // Check if a feature is enabled
  const isFeatureEnabled = (featureName) => {
    return settings.value.features?.[featureName] === true
  }

  // Local storage helpers
  const saveToLocalStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings.value))
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err)
    }
  }

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      const cached = localStorage.getItem('app_settings')
      if (cached) {
        const parsed = JSON.parse(cached)
        settings.value = { ...settings.value, ...parsed, api_url: safeApiUrl(parsed.api_url) }
        loaded.value = true
      }
    } catch {
      // Silently fail - localStorage errors are not critical
    }
  }

  // Initialize from localStorage on store creation
  if (typeof window !== 'undefined') {
    loadFromLocalStorage()
    
    // Try to fetch fresh settings
    fetchSettings().catch(() => {
      // Ignore errors on initialization
    })
  }

  return {
    // State
    settings,
    loading,
    loaded,
    error,
    
    // Computed
    apiUrl,
    baseDomain,
    appName,
    isMaintenanceMode,
    
    // Actions
    fetchSettings,
    updateSettings,
    getSetting,
    isFeatureEnabled
  }
}, {
  persist: {
    key: 'settings-store',
    storage: localStorage,
    paths: ['settings']
  }
})
