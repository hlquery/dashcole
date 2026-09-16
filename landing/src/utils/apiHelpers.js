/**
 * API Helper Utilities
 * Provides utility functions for API interactions
 */

/**
 * Extract error message from API error
 */
export function getErrorMessage(error, defaultMessage = 'An error occurred') {
  if (!error) return defaultMessage

  // Handle API error format
  if (error.message) {
    return error.message
  }

  // Handle axios error format
  if (error.response?.data?.error) {
    return error.response.data.error
  }

  // Handle validation errors
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map(e => e.message || e.msg).join(', ')
  }

  // Handle network errors
  if (error.isNetworkError || error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your connection.'
  }

  return defaultMessage
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error) {
  return error?.code === 3 || 
         error?.status === 422 || 
         (error?.errors && Array.isArray(error.errors))
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error) {
  return error?.status === 401 || error?.code === 7 || error?.code === 8 || error?.code === 9
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
  return error?.isNetworkError || 
         error?.code === 'NETWORK_ERROR' || 
         !error?.response
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors) {
  if (!errors || !Array.isArray(errors)) {
    return []
  }

  return errors.map(err => ({
    field: err.field || err.param || 'unknown',
    message: err.message || err.msg || 'Invalid value'
  }))
}

/**
 * Retry function with exponential backoff
 */
export async function retry(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    condition = () => true
  } = options

  let lastError

  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Don't retry if condition is not met
      if (!condition(error)) {
        throw error
      }

      // Don't delay on last retry
      if (i < retries - 1) {
        const waitTime = delay * Math.pow(backoff, i)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
  }

  throw lastError
}
