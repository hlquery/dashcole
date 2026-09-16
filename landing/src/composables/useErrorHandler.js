/**
 * Composable for consistent error handling across Vue components
 */
import { ref } from 'vue'

export function useErrorHandler() {
  const error = ref(null)
  const isLoading = ref(false)

  /**
   * Handle API errors consistently
   */
  const handleError = (err, customMessage = null) => {
    console.error('API Error:', err)
    
    if (err.isApiError) {
      error.value = {
        message: customMessage || err.message || 'An error occurred',
        code: err.code,
        status: err.status,
        details: err.details,
        errors: err.errors
      }
    } else if (err.isNetworkError) {
      error.value = {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR',
        status: 0
      }
    } else {
      error.value = {
        message: customMessage || err.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        status: 0
      }
    }

    // Clear error after 5 seconds
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Execute async function with error handling
   */
  const execute = async (fn, options = {}) => {
    const { 
      loading = true, 
      errorMessage = null,
      onSuccess = null,
      onError = null
    } = options

    try {
      if (loading) isLoading.value = true
      clearError()
      
      const result = await fn()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      handleError(err, errorMessage)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      if (loading) isLoading.value = false
    }
  }

  return {
    error,
    isLoading,
    handleError,
    clearError,
    execute
  }
}
