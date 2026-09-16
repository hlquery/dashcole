import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/composables/api'
import { useAuthStore } from '@/stores/auth'

/**
 * Preferences Store
 * Manages user preferences including theme, timezone, notifications, etc.
 */
export const usePreferencesStore = defineStore('preferences', () => {
  // State
  const preferences = ref({
    theme: 'auto',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    email_notifications: true,
    push_notifications: true,
    sidebar_collapsed: false,
    items_per_page: 20,
    dashboard_layout: null,
    custom_settings: null,
    cloud_region: 'us-east',
    cloud_provider: 'linode',
    default_instance_size: 'shared-cpu-2gb',
    autoscaling_enabled: false,
    autoscaling_min_nodes: 1,
    autoscaling_max_nodes: 3,
    backup_policy: 'daily',
    deployment_channel: 'stable',
    monitoring_interval_seconds: 60,
    incident_notifications: true,
    billing_alert_usd: 200.00,
    dashboard_home_view: 'overview'
  })

  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(null)

  // Computed properties
  const isDarkMode = computed(() => {
    if (typeof window === 'undefined') return false
    
    const themeValue = preferences.value.theme
    if (themeValue === 'dark') return true
    if (themeValue === 'light') return false
    // If auto, check system preference
    if (themeValue === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const isSidebarCollapsed = computed(() => preferences.value.sidebar_collapsed ?? false)

  // Theme management
  const applyThemeToDOM = (shouldBeDark) => {
    if (typeof window === 'undefined') return
    
    const html = document.documentElement
    const body = document.body
    
    if (shouldBeDark) {
      html.classList.add('dark-mode')
      html.setAttribute('data-theme', 'dark')
      body.classList.add('dark-mode')
    } else {
      html.classList.remove('dark-mode')
      html.setAttribute('data-theme', 'light')
      body.classList.remove('dark-mode')
    }
    
    // Also update Vuetify theme if available
    if (window.$vuetify) {
      window.$vuetify.theme.global.name = shouldBeDark ? 'dark' : 'light'
    }
  }

  const applyThemeFromPreferences = () => {
    if (typeof window === 'undefined') return
    
    const themeValue = preferences.value.theme
    const shouldBeDark = themeValue === 'dark' || 
      (themeValue === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    
    applyThemeToDOM(shouldBeDark)
  }

  const toggleTheme = async () => {
    try {
      const currentTheme = preferences.value.theme
      let newTheme = 'light'
      
      if (currentTheme === 'light') {
        newTheme = 'dark'
      } else if (currentTheme === 'dark') {
        newTheme = 'auto'
      } else {
        newTheme = 'light'
      }
      
      await updatePreference('theme', newTheme)
    } catch (error) {
      console.error('Failed to toggle theme:', error)
      throw error
    }
  }

  // Load preferences from API
  const loadPreferences = async () => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      console.warn('Cannot load preferences: user not authenticated')
      // Still apply theme from localStorage if available
      loadFromLocalStorage()
      applyThemeFromPreferences()
      return
    }

    if (loading.value) {
      return // Already loading
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await api.getPreferences()
      
      // Handle both response formats: { success, data: { preferences } } or { success, preferences }
      const prefs = response?.data?.preferences || response?.preferences
      
      if (response?.success && prefs) {
        preferences.value = {
          ...preferences.value,
          ...prefs
        }
        loaded.value = true
        
        // Store in localStorage as fallback
        saveToLocalStorage()
        
        // Apply theme after loading
        applyThemeFromPreferences()
        
        return preferences.value
      }
      
      throw new Error('Invalid response from preferences API')
    } catch (err) {
      console.error('Failed to load preferences:', err)
      error.value = err.message || 'Failed to load preferences'
      
      // Try to load from localStorage as fallback
      loadFromLocalStorage()
      applyThemeFromPreferences()
      
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update preference(s)
  const updatePreference = async (key, value) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      console.warn('Cannot update preference: user not authenticated')
      // Still update locally
      if (typeof key === 'object') {
        preferences.value = { ...preferences.value, ...key }
      } else {
        preferences.value = { ...preferences.value, [key]: value }
      }
      saveToLocalStorage()
      
      // Apply theme if it changed
      if (typeof key === 'object' && key.theme !== undefined) {
        applyThemeFromPreferences()
      } else if (key === 'theme') {
        applyThemeFromPreferences()
      }
      
      return
    }

    // Update local state immediately (optimistic update)
    const oldPreferences = { ...preferences.value }
    
    if (typeof key === 'object') {
      preferences.value = { ...preferences.value, ...key }
    } else {
      preferences.value = { ...preferences.value, [key]: value }
    }

    // Store in localStorage as fallback
    saveToLocalStorage()

    // Apply theme if it changed
    if (typeof key === 'object' && key.theme !== undefined) {
      applyThemeFromPreferences()
    } else if (key === 'theme') {
      applyThemeFromPreferences()
    }

    // Save to API
    try {
      const updates = typeof key === 'object' ? key : { [key]: value }
      const response = await api.updatePreferences(updates)
      
      if (response?.success && response.preferences) {
        preferences.value = {
          ...preferences.value,
          ...response.preferences
        }
        saveToLocalStorage()
      }
    } catch (err) {
      console.error('Failed to update preference:', err)
      error.value = err.message || 'Failed to update preference'
      
      // Revert to old preferences on error
      preferences.value = oldPreferences
      saveToLocalStorage()
      
      throw err
    }
  }

  // Update multiple preferences at once
  const updatePreferences = async (updates) => {
    return updatePreference(updates, null)
  }

  // Sidebar management
  const setSidebarCollapsed = async (collapsed) => {
    return updatePreference('sidebar_collapsed', collapsed)
  }

  // Reset preferences to defaults
  const resetPreferences = async () => {
    const defaults = {
      theme: 'auto',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      email_notifications: true,
      push_notifications: true,
      sidebar_collapsed: false,
      items_per_page: 20,
      dashboard_layout: null,
      custom_settings: null,
      cloud_region: 'us-east',
      cloud_provider: 'linode',
      default_instance_size: 'shared-cpu-2gb',
      autoscaling_enabled: false,
      autoscaling_min_nodes: 1,
      autoscaling_max_nodes: 3,
      backup_policy: 'daily',
      deployment_channel: 'stable',
      monitoring_interval_seconds: 60,
      incident_notifications: true,
      billing_alert_usd: 200.00,
      dashboard_home_view: 'overview'
    }
    
    preferences.value = defaults
    await updatePreferences(defaults)
  }

  // Clear preferences (on logout)
  const clearPreferences = () => {
    preferences.value = {
      theme: 'auto',
      timezone: 'UTC',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      email_notifications: true,
      push_notifications: true,
      sidebar_collapsed: false,
      items_per_page: 20,
      dashboard_layout: null,
      custom_settings: null,
      cloud_region: 'us-east',
      cloud_provider: 'linode',
      default_instance_size: 'shared-cpu-2gb',
      autoscaling_enabled: false,
      autoscaling_min_nodes: 1,
      autoscaling_max_nodes: 3,
      backup_policy: 'daily',
      deployment_channel: 'stable',
      monitoring_interval_seconds: 60,
      incident_notifications: true,
      billing_alert_usd: 200.00,
      dashboard_home_view: 'overview'
    }
    loaded.value = false
    error.value = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_preferences')
    }
    
    // Reset theme
    applyThemeFromPreferences()
  }

  // Local storage helpers
  const saveToLocalStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('user_preferences', JSON.stringify(preferences.value))
    } catch (err) {
      console.warn('Failed to save preferences to localStorage:', err)
    }
  }

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return
    
    try {
      const cached = localStorage.getItem('user_preferences')
      if (cached) {
        const parsed = JSON.parse(cached)
        preferences.value = { ...preferences.value, ...parsed }
        loaded.value = true
      }
    } catch (err) {
      console.error('Failed to load preferences from localStorage:', err)
    }
  }

  // Initialize from localStorage on store creation
  if (typeof window !== 'undefined') {
    loadFromLocalStorage()
    
    // Apply theme on initialization
    applyThemeFromPreferences()
    
    // Listen for system theme changes when theme is 'auto'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = () => {
      if (preferences.value.theme === 'auto') {
        applyThemeFromPreferences()
      }
    }
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleThemeChange)
    }
  }

  return {
    // State
    preferences,
    loading,
    loaded,
    error,
    
    // Computed
    isDarkMode,
    isSidebarCollapsed,
    
    // Actions
    toggleTheme,
    loadPreferences,
    updatePreference,
    updatePreferences,
    setSidebarCollapsed,
    resetPreferences,
    clearPreferences,
    applyThemeFromPreferences
  }
}, {
  persist: {
    key: 'preferences-store',
    storage: localStorage,
    paths: ['preferences']
  }
})
