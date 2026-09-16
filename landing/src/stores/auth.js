import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

/**
 * Auth Store
 * Manages user authentication, session, and authorization state
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const server = ref(null)
  const isAuthenticated = ref(false)
  const root_flags = ref(null)
  const can_manage = ref(false)
  
  // Session management
  const tokenExpiration = ref(null)
  const lastActivity = ref(null)
  const sessionId = ref(null)
  const inactivityTimeout = ref(30 * 60 * 1000) // 30 minutes
  
  // Private variables for timers
  let inactivityTimer = null
  let activityHandlers = []

  // Computed properties
  const isLoggedIn = computed(() => isAuthenticated.value)
  
  const isTokenExpired = computed(() => {
    if (!tokenExpiration.value) return false
    return Date.now() >= tokenExpiration.value
  })
  
  const timeUntilExpiration = computed(() => {
    if (!tokenExpiration.value) return null
    return Math.max(0, tokenExpiration.value - Date.now())
  })
  
  const isTokenExpiringSoon = computed(() => {
    // Token expiring in less than 5 minutes
    return timeUntilExpiration.value !== null && timeUntilExpiration.value < 5 * 60 * 1000
  })
  
  const isAdmin = computed(() => {
    return can_manage.value || root_flags.value || false
  })
  
  const isRoot = computed(() => {
    return root_flags.value || false
  })
  
  const userId = computed(() => {
    return user.value?.id || null
  })
  
  const userEmail = computed(() => {
    return user.value?.email || null
  })
  
  const userName = computed(() => {
    if (!user.value) return null
    const firstName = user.value.first_name || user.value.first || ''
    const lastName = user.value.last_name || user.value.last || ''
    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    return userEmail.value?.split('@')[0] || 'User'
  })

  // Session management helpers
  const updateLastActivity = () => {
    lastActivity.value = Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastActivity', lastActivity.value.toString())
    }
  }

  const startInactivityMonitoring = () => {
    if (typeof window === 'undefined') return
    
    stopInactivityMonitoring()
    
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    const handleActivity = () => {
      updateLastActivity()
    }
    
    // Store handlers for cleanup
    activityHandlers = events.map(event => {
      document.addEventListener(event, handleActivity, { passive: true })
      return { event, handler: handleActivity }
    })
    
    // Check inactivity periodically
    inactivityTimer = setInterval(() => {
      if (!isAuthenticated.value || !lastActivity.value) return
      
      const timeSinceActivity = Date.now() - lastActivity.value
      if (timeSinceActivity >= inactivityTimeout.value) {
        // Auto-logout on inactivity
        console.log('Session expired due to inactivity')
        clearAuth()
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login?inactive=true'
        }
      }
    }, 60000) // Check every minute
  }

  const stopInactivityMonitoring = () => {
    if (typeof window === 'undefined') return
    
    // Remove event listeners
    activityHandlers.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler)
    })
    activityHandlers = []
    
    // Clear interval
    if (inactivityTimer) {
      clearInterval(inactivityTimer)
      inactivityTimer = null
    }
  }

  // Sync auth state across browser tabs
  const syncAuthState = () => {
    if (typeof window === 'undefined') return
    
    // Broadcast auth state change to other tabs
    localStorage.setItem('authStateSync', JSON.stringify({
      isAuthenticated: isAuthenticated.value,
      timestamp: Date.now()
    }))
  }

  // Parse JWT token to extract expiration
  const parseTokenExpiration = (authToken) => {
    if (!authToken) return null
    
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]))
      return payload.exp ? payload.exp * 1000 : null
    } catch (error) {
      console.warn('Could not parse token expiration:', error)
      return null
    }
  }

  // Extract admin flags from user data
  const extractAdminFlags = (userData) => {
    if (!userData?.flags) {
      return { hasRoot: false, canManage: false }
    }
    
    const flags = Array.isArray(userData.flags) ? userData.flags : []
    const hasRootFlags = flags.some((flag) => {
      const flagType = flag.type || flag.flag_type
      return flagType === 'root'
    })
    const canManage = flags.some((flag) => {
      const flagType = flag.type || flag.flag_type
      return flagType === 'root' || flagType === 'admin' || flagType === 'manager'
    })
    
    return { hasRoot: hasRootFlags, canManage }
  }

  // Actions
  const setAuth = async (userData, authToken, serverData) => {
    try {
      user.value = userData
      token.value = authToken
      server.value = serverData
      isAuthenticated.value = true
      
      // Parse token expiration from JWT
      tokenExpiration.value = parseTokenExpiration(authToken)
      
      // Generate session ID
      sessionId.value = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Update last activity
      updateLastActivity()
      
      // Extract and set admin flags
      const { hasRoot, canManage } = extractAdminFlags(userData)
      root_flags.value = hasRoot
      can_manage.value = canManage
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(userData))
        localStorage.setItem('token', authToken)
        if (serverData) {
          localStorage.setItem('server', JSON.stringify(serverData))
        }
        if (tokenExpiration.value) {
          localStorage.setItem('tokenExpiration', tokenExpiration.value.toString())
        }
        localStorage.setItem('sessionId', sessionId.value)
        localStorage.setItem('admin_root_flags', root_flags.value ? 'true' : 'false')
        localStorage.setItem('admin_can_manage', can_manage.value ? 'true' : 'false')
      }
      
      // Start inactivity monitoring
      startInactivityMonitoring()
      
      // Sync across tabs
      syncAuthState()
      
      // Load user preferences after auth is set
      try {
        const { usePreferencesStore } = await import('@/stores/preferences')
        const preferencesStore = usePreferencesStore()
        if (!preferencesStore.loaded) {
          await preferencesStore.loadPreferences()
        }
      } catch (prefError) {
        console.warn('Failed to load preferences on login:', prefError)
      }
    } catch (error) {
      console.error('Error setting auth:', error)
      throw error
    }
  }

  const clearAuth = async () => {
    try {
      // Stop inactivity monitoring
      stopInactivityMonitoring()
      
      // Immediately clear auth state
      isAuthenticated.value = false
      user.value = null
      token.value = null
      server.value = null
      root_flags.value = null
      can_manage.value = false
      tokenExpiration.value = null
      lastActivity.value = null
      sessionId.value = null
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user')
        localStorage.removeItem('token')
        localStorage.removeItem('server')
        localStorage.removeItem('admin_root_flags')
        localStorage.removeItem('admin_can_manage')
        localStorage.removeItem('tokenExpiration')
        localStorage.removeItem('sessionId')
        localStorage.removeItem('lastActivity')
      }
      
      // Sync logout across tabs
      syncAuthState()
      
      // Clear preferences (non-blocking)
      try {
        const { usePreferencesStore } = await import('@/stores/preferences')
        const preferencesStore = usePreferencesStore()
        preferencesStore.clearPreferences()
      } catch (error) {
        // Ignore if preferences store not available
      }
    } catch (error) {
      console.error('Error clearing auth:', error)
    }
  }

  const setRootFlags = (flags) => {
    root_flags.value = !!flags
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_root_flags', root_flags.value ? 'true' : 'false')
    }
  }

  const setCanManage = (can) => {
    can_manage.value = !!can
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_can_manage', can_manage.value ? 'true' : 'false')
    }
  }
  
  const fetchUser = async () => {
    try {
      const { api } = await import('@/composables/api')
      const response = await api.getProfile()
      
      if (response.success && response.user) {
        user.value = response.user
        
        // Update admin flags from profile
        const { hasRoot, canManage } = extractAdminFlags(response.user)
        setRootFlags(hasRoot)
        setCanManage(canManage)
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(response.user))
        }
        
        // Load user preferences after profile is loaded
        try {
          const { usePreferencesStore } = await import('@/stores/preferences')
          const preferencesStore = usePreferencesStore()
          if (!preferencesStore.loaded) {
            await preferencesStore.loadPreferences()
          }
        } catch (prefError) {
          console.warn('Failed to load preferences:', prefError)
        }
        
        return response.user
      }
      
      throw new Error('Failed to fetch user profile')
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  const logout = () => {
    clearAuth()
  }

  // Initialize auth state from localStorage on store creation
  const initializeAuth = () => {
    if (typeof window === 'undefined') return
    
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('auth_user')
      const storedSessionId = localStorage.getItem('sessionId')
      const storedLastActivity = localStorage.getItem('lastActivity')
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser)
        const serverData = localStorage.getItem('server')
        
        // Check if token is expired
        const tokenExp = localStorage.getItem('tokenExpiration')
        if (tokenExp && Date.now() >= parseInt(tokenExp)) {
          // Token expired, clear auth
          clearAuth()
          return
        }
        
        // Restore session
        token.value = storedToken
        user.value = userData
        if (serverData) {
          server.value = JSON.parse(serverData)
        }
        isAuthenticated.value = true
        sessionId.value = storedSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        lastActivity.value = storedLastActivity ? parseInt(storedLastActivity) : Date.now()
        tokenExpiration.value = tokenExp ? parseInt(tokenExp) : null
        
        // Restore admin flags strictly from user flags persisted in auth_user
        const { hasRoot, canManage } = extractAdminFlags(userData)
        root_flags.value = hasRoot
        can_manage.value = canManage
        
        // Start inactivity monitoring
        if (isAuthenticated.value) {
          startInactivityMonitoring()
        }
        
        // Listen for auth state changes from other tabs
        window.addEventListener('storage', (e) => {
          if (e.key === 'authStateSync' && e.newValue) {
            try {
              const syncData = JSON.parse(e.newValue)
              if (!syncData.isAuthenticated && isAuthenticated.value) {
                // Another tab logged out, sync this tab
                clearAuth()
              }
            } catch (err) {
              console.warn('Error syncing auth state:', err)
            }
          }
        })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      clearAuth()
    }
  }

  // Initialize on store creation
  if (typeof window !== 'undefined') {
    initializeAuth()
  }

  return {
    // State
    user,
    token,
    server,
    isAuthenticated,
    root_flags,
    can_manage,
    tokenExpiration,
    lastActivity,
    sessionId,
    inactivityTimeout,
    
    // Computed
    isLoggedIn,
    isTokenExpired,
    timeUntilExpiration,
    isTokenExpiringSoon,
    isAdmin,
    isRoot,
    userId,
    userEmail,
    userName,
    
    // Actions
    setAuth,
    clearAuth,
    logout,
    setRootFlags,
    setCanManage,
    fetchUser,
    updateLastActivity,
    startInactivityMonitoring,
    stopInactivityMonitoring,
    initializeAuth
  }
}, {
  persist: {
    key: 'auth-store',
    storage: localStorage,
    paths: ['user', 'token', 'server', 'isAuthenticated', 'root_flags', 'can_manage', 'tokenExpiration', 'sessionId', 'lastActivity']
  }
})
