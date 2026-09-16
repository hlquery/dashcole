import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const stripTrailingSlash = (value = '') => value.replace(/\/+$/, '')

const ensureApiPath = (value = '') => {
  const trimmed = stripTrailingSlash(value)
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

// Production is always same-origin; Vite proxies /api to the local API in development.
const defaultApiUrl = '/api'
const configuredApiUrl = String(import.meta.env.VITE_API_URL || '').trim()
const privateApiPattern = /^(?:https?:\/\/)?(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|[^/:]+\.local)(?::\d+)?(?:\/|$)/i
const productionApiUrl = import.meta.env.PROD && privateApiPattern.test(configuredApiUrl)
  ? defaultApiUrl
  : (configuredApiUrl || defaultApiUrl)
const API_BASE_URL = ensureApiPath(productionApiUrl)

// API connection status tracking
const isApiConnected = ref(true)

// Create axios instance with enhanced configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Include cookies for CORS
})

// Request interceptor for auth token and request logging
apiClient.interceptors.request.use(
  (config) => {
    // Always get the token fresh from localStorage
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // If no token, remove Authorization header to avoid sending stale token
      delete config.headers.Authorization
    }

    // Add request ID for tracking
    config.metadata = {
      startTime: Date.now(),
      requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and response transformation
apiClient.interceptors.response.use(
  (response) => {
    // Mark API as connected on successful response
    isApiConnected.value = true

    // Calculate request duration
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime
      if (duration > 1000) {
        console.warn(`Slow request: ${response.config.url} took ${duration}ms`)
      }
    }

    // Handle standardized API responses
    if (response.data && response.data.success !== undefined) {
      return response
    }

    // Transform legacy responses to standardized format
    if (response.data && !response.data.success) {
      return {
        ...response,
        data: {
          success: true,
          data: response.data
        }
      }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Network error
    if (!error.response) {
      isApiConnected.value = false
      const networkError = {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
        status: 0
      }
      // Silently handle network errors - don't log to reduce console noise
      // Network errors are expected when API server is not running
      return Promise.reject(networkError)
    }

    // If we got a response, API is connected (even if it's an error response)
    isApiConnected.value = true

    const { status, data } = error.response

    // Handle 401 Unauthorized
    if (status === 401) {
      // Don't redirect if we're already on the login page
      if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
        return Promise.reject(error)
      }
      
      // Only clear auth if we have a token (to avoid clearing during login process)
      const token = localStorage.getItem('token')
      if (token) {
        // Token expired or invalid - clear auth and redirect
        localStorage.removeItem('token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('tokenExpiration')
        
        // Clear auth store
        try {
          const { useAuthStore } = await import('@/stores/auth')
          const authStore = useAuthStore()
          authStore.clearAuth()
        } catch (e) {
          console.error('Failed to clear auth store:', e)
        }
        
        // Token expired or invalid - clear auth and send users to the dashboard login.
        if (window.location.pathname !== '/login') {
          const loginUrl = import.meta.env.VITE_LOGIN_URL || 'https://dashboard.hlquery.com/login'
          window.location.href = loginUrl.includes('?') ? `${loginUrl}&expired=true` : `${loginUrl}?expired=true`
        }
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.warn('Access forbidden:', data?.error || 'You do not have permission to access this resource')
    }

    // Handle 429 Rate Limit - DISABLED
    // if (status === 429) {
    //   const retryAfter = data?.details?.retryAfter || 60
    //   console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
    // }

    // Handle 500+ Server Errors
    if (status >= 500) {
      console.error('Server error:', {
        status,
        message: data?.error || 'Internal server error',
        url: originalRequest?.url
      })
    }

    // Transform error to standardized format
    const standardizedError = {
      message: data?.error || error.message || 'An error occurred',
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details || null,
      errors: data?.errors || null,
      response: error.response
    }

    return Promise.reject(standardizedError)
  }
)

/**
 * Retry configuration for failed requests
 */
const retryConfig = {
  retries: 2,
  retryDelay: 1000,
  retryCondition: (error) => {
    // Retry on network errors or 5xx errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600)
  }
}

/**
 * Enhanced API methods with error handling
 */
export const api = {
  // Generic HTTP methods with improved error handling
  get: async (url, config = {}) => {
    try {
      const response = await apiClient.get(url, config)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  post: async (url, data, config = {}) => {
    try {
      const response = await apiClient.post(url, data, config)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  put: async (url, data, config = {}) => {
    try {
      const response = await apiClient.put(url, data, config)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  delete: async (url, config = {}) => {
    try {
      const response = await apiClient.delete(url, config)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  patch: async (url, data, config = {}) => {
    try {
      const response = await apiClient.patch(url, data, config)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Format error for consistent handling
  formatError,

  async sendExternalQuery(payload = {}) {
    return this.post('/external/queries', {
      source: 'web',
      ...payload,
    })
  },

  // Login method
  async performLogin(email, password, tenantId = null) {
    try {
      const username = email.trim().toLowerCase()
      const body = {
        email: username,
        username,
        password
      }
      if (tenantId != null && tenantId !== '') body.tenantId = Number(tenantId)
      const response = await apiClient.post('/auth/login', body)
      // API returns { success: true, data: { login: {...} } }
      // Extract data property if it exists
      if (response.data && response.data.data) {
        const payload = response.data.data
        if (payload.needsSchoolChoice) return payload
        return payload.token && payload.user ? { login: payload, server: null } : payload
      }
      if (response.data?.needsSchoolChoice) return response.data
      return response.data?.token && response.data?.user ? { login: response.data, server: null } : response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Signup method
  async performSignup(email, password, language = 'en') {
    try {
      const response = await apiClient.post('/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        language
      })
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  async resendConfirmationEmail(email) {
    try {
      const response = await apiClient.post('/auth/resend-confirmation', {
        email: email.trim().toLowerCase()
      })
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      })
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Reset password with code
  async resetPasswordWithCode(email, code, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        new_password: newPassword
      })
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Close account
  async closeAccount(reason) {
    try {
      const payload = {}
      // Only include reason if it's provided and not empty
      if (reason && reason.trim()) {
        payload.reason = reason.trim()
      }
      const response = await apiClient.post('/auth/close-account', payload)
      return response.data
    } catch (error) {
      throw formatError(error)
    }
  },

  // Handle login success
  handleLoginSuccess(email, password, data) {
    if (data.login && data.login.token) {
      localStorage.setItem('rememberedEmail', email)
      localStorage.setItem('rememberedPassword', password)
      this.storeTokenExpiration(data.login.token)
      this.startTokenCheck()
    }
  },

  // Clear stored credentials
  clearStoredCredentials() {
    localStorage.removeItem('rememberedEmail')
    localStorage.removeItem('rememberedPassword')
  },

  // Store token expiration
  storeTokenExpiration(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      localStorage.setItem('tokenExpiration', expirationTime.toString())
    } catch (error) {
      console.warn('Could not parse token expiration:', error)
    }
  },

  // Start token check
  startTokenCheck() {
    // Clear any existing interval first
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval)
    }
    
    const checkToken = () => {
      const expirationTime = localStorage.getItem('tokenExpiration')
      const token = localStorage.getItem('token')
      
      // Only check if we have a token
      if (!token) {
        return
      }
      
      if (expirationTime && Date.now() >= parseInt(expirationTime)) {
        this.clearStoredCredentials()
        localStorage.removeItem('token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('tokenExpiration')
        
        // Clear auth store
        import('@/stores/auth').then(({ useAuthStore }) => {
          const authStore = useAuthStore()
          authStore.clearAuth()
        }).catch(() => {
          // Ignore errors during cleanup
        })
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          const loginUrl = import.meta.env.VITE_LOGIN_URL || 'https://dashboard.hlquery.com/login'
          window.location.href = loginUrl.includes('?') ? `${loginUrl}&expired=true` : `${loginUrl}?expired=true`
        }
      }
    }
    
    // Check every minute
    this.tokenCheckInterval = setInterval(checkToken, 60000)
  },

  // Documentation API methods
  async getDocsFile(filename) {
    return this.get(`/docs/${filename}`)
  },

  async listDocsFiles() {
    return this.get('/docs/list/all')
  },

  async getDocsTree() {
    return this.get('/docs/structure/tree')
  },

  async getDocsConfig() {
    return this.get('/docs/config')
  },

  // Blog API methods
  async getBlogEntries(page = 1, limit = 12, category = null, search = null, featured = false) {
    const params = { page, limit }
    if (category) params.category = category
    if (search) params.search = search
    if (featured) params.featured = featured
    return this.get('/blog/entries', { params })
  },

  async getBlogEntry(slug) {
    return this.get(`/blog/entries/${slug}`)
  },

  async getBlogCategories() {
    return this.get('/blog/categories')
  },

  // Contact API methods
  async submitContactMessage(payload) {
    return this.post('/contact/messages', payload)
  },

  async submitDemoRequest(payload) {
    return this.post('/public/demo-requests', payload)
  },

  async getFeaturedBlogEntries(limit = 3) {
    return this.get('/blog/featured', { params: { limit } })
  },

  // Admin Blog API methods
  async getAdminBlogEntries(page = 1, limit = 50, category_id = null, status = null, search = null) {
    const params = { page, limit }
    if (category_id) params.category_id = category_id
    if (status) params.status = status
    if (search) params.search = search
    return this.get('/blog/admin/entries', { params })
  },

  async getAdminBlogEntry(id) {
    return this.get(`/blog/admin/entries/${id}`)
  },

  async createBlogEntry(entryData) {
    return this.post('/blog/admin/entries', entryData)
  },

  async updateBlogEntry(id, entryData) {
    return this.put(`/blog/admin/entries/${id}`, entryData)
  },

  async deleteBlogEntry(id) {
    return this.delete(`/blog/admin/entries/${id}`)
  },

  // Admin Category API methods
  async getAdminCategories(search = null) {
    const params = {}
    if (search) params.search = search
    return this.get('/blog/admin/categories', { params })
  },

  async getAdminCategory(id) {
    return this.get(`/blog/admin/categories/${id}`)
  },

  async createCategory(categoryData) {
    return this.post('/blog/admin/categories', categoryData)
  },

  async updateCategory(id, categoryData) {
    return this.put(`/blog/admin/categories/${id}`, categoryData)
  },

  async deleteCategory(id) {
    return this.delete(`/blog/admin/categories/${id}`)
  },

  // Dashboard API methods
  async getDashboardStats() {
    return this.get('/dashboard/stats')
  },

  async getRecentProjects(limit = 5) {
    return this.get('/dashboard/recent-projects', { params: { limit } })
  },

  async getProjects() {
    return this.get('/dashboard/projects')
  },

  async createProject(projectData) {
    return this.post('/dashboard/projects', projectData)
  },

  async closeProject(projectId, reason) {
    return this.patch(`/dashboard/projects/${projectId}/close`, { reason })
  },

  async getDashboardActivity(limit = 10) {
    return this.get('/dashboard/activity', { params: { limit } })
  },

  async getDashboardTransactions(page = 1, limit = 20) {
    return this.get('/dashboard/transactions', { params: { page, limit } })
  },

  async getDashboardSummary() {
    return this.get('/dashboard/summary')
  },

  // Balance API methods
  async adjustBalance(userId, type, amount, note, description) {
    return this.post('/balances/adjust', {
      userId,
      type,
      amount,
      note,
      description
    })
  },

  async getUserBalance(userId) {
    return this.get(`/balances/user/${userId}`)
  },

  async getBalanceTransactions(params = {}) {
    return this.get('/balances/transactions', { params })
  },

  async getBalanceStats() {
    return this.get('/balances/stats')
  },

  // Bills/Invoices API methods
  async getBills(params = {}) {
    return this.get('/bills', { params })
  },

  async getBill(id) {
    return this.get(`/bills/${id}`)
  },

  async getBillStats() {
    return this.get('/bills/stats')
  },

  // Admin Bills API methods
  async getAdminBills(params = {}) {
    return this.get('/admin/bills', { params })
  },

  async getAdminBill(id) {
    return this.get(`/admin/bills/${id}`)
  },

  async createInvoice(invoiceData) {
    return this.post('/admin/bills', invoiceData)
  },

  async updateInvoice(id, invoiceData) {
    return this.put(`/admin/bills/${id}`, invoiceData)
  },

  async deleteInvoice(id) {
    return this.delete(`/admin/bills/${id}`)
  },

  async getUserBills(userId) {
    return this.get(`/admin/users/${userId}/bills`)
  },

  // Admin Projects API methods
  async getAdminProjects(params = {}) {
    return this.get('/admin/projects', { params })
  },

  async getAdminProject(id) {
    return this.get(`/admin/projects/${id}`)
  },

  async updateAdminProject(id, data) {
    return this.put(`/admin/projects/${id}`, data)
  },

  async updateProjectStatus(id, status) {
    return this.patch(`/admin/projects/${id}/status`, { status })
  },

  async cancelProject(id, reason) {
    return this.patch(`/admin/projects/${id}/cancel`, { reason })
  },

  async activateProject(id) {
    return this.patch(`/admin/projects/${id}/activate`)
  },

  async deactivateProject(id) {
    return this.patch(`/admin/projects/${id}/deactivate`)
  },

  async deleteAdminProject(id) {
    return this.delete(`/admin/projects/${id}`)
  },

  async getAdminProjectStats() {
    return this.get('/admin/projects/stats')
  },

  async getTodos() {
    try {
      const response = await this.get('/dashboard/todos')
      // this.get() already extracts response.data, so response is the data object
      
      // Strict return: ensure todos array with max 10 items
      if (response && response.success && Array.isArray(response.todos)) {
        return {
          success: true,
          todos: response.todos.slice(0, 10), // Strict limit to 10
          count: Math.min(response.todos.length, 10),
          limit: 10
        }
      }
      
      // Fallback if structure is different but has todos array
      if (response && Array.isArray(response.todos)) {
        return {
          success: true,
          todos: response.todos.slice(0, 10),
          count: Math.min(response.todos.length, 10),
          limit: 10
        }
      }
      
      return {
        success: false,
        todos: [],
        count: 0,
        limit: 10
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
      return {
        success: false,
        todos: [],
        count: 0,
        limit: 10
      }
    }
  },

  // Profile API methods
  async getProfile() {
    return this.get('/auth/profile')
  },

  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData)
  },

  // Settings/Preferences API methods
  async getPreferences() {
    return this.get('/settings/preferences')
  },

  async updatePreferences(preferences) {
    return this.put('/settings/preferences', preferences)
  },

  // Admin API methods
  async getAdminStats() {
    return this.get('/admin/stats')
  },

  async getAdminChartData(period = '7days') {
    return this.get('/admin/chart-data', { params: { period } })
  },

  async getAdminActivity(limit = 10) {
    return this.get('/admin/activity', { params: { limit } })
  },

  async getAdminHealth() {
    return this.get('/admin/health')
  },

  // Critical Events API methods
  async getCriticalEvents(params = {}) {
    return this.get('/admin/critical-events', { params })
  },

  async getCriticalEventsStatus() {
    return this.get('/admin/critical-events/status')
  },

  async acknowledgeCriticalEvent(eventId) {
    return this.post(`/admin/critical-events/${eventId}/acknowledge`)
  },

  async resolveCriticalEvent(eventId) {
    return this.post(`/admin/critical-events/${eventId}/resolve`)
  },

  // Admin Users API methods
  async getAdminUser(id) {
    return this.get(`/admin/users/${id}`)
  },

  async updateAdminUser(id, userData) {
    return this.put(`/admin/users/${id}`, userData)
  },

  async getAdminUserStripePayments(id, params = {}) {
    return this.get(`/admin/users/${id}/stripe-payments`, { params })
  },

  // Linode API methods
  async getLinodeServers() {
    return this.get('/dashboard/linode/servers')
  },

  async getOpenInstances() {
    return this.get('/dashboard/instances/open')
  },

  async getLinodeBalance() {
    return this.get('/dashboard/linode/balance')
  },

  async getLinodeOverview() {
    return this.get('/admin/linode/overview')
  },

  async getLinodeRegions() {
    return this.get('/admin/linode/regions')
  },

  async getLinodeInstanceTypes() {
    return this.get('/admin/linode/instance-types')
  },

  async getLatestDashColeVersion(ref = null) {
    const params = {}
    if (ref) params.ref = ref
    return this.get('/admin/dashcole/version/latest', { params })
  },

  async createAdminLinodeInstanceForUser(userId, payload) {
    return this.post(`/admin/users/${userId}/linode-instances`, payload)
  }
}

export { API_BASE_URL }

/**
 * Format error for consistent handling
 */
function formatError(error) {
  if (error.response) {
    // API error response
    const { status, data } = error.response
    return {
      message: data?.error || error.message || 'An error occurred',
      code: data?.code || `HTTP_${status}`,
      status,
      details: data?.details || null,
      errors: data?.errors || null,
      isApiError: true
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      status: 0,
      isNetworkError: true
    }
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
      isUnknownError: true
    }
  }
}

// Export axios instance for advanced usage
export { apiClient, isApiConnected }

// Export default api object
export default api
