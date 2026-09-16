/**
 * Form Validation Composable
 * Provides form validation utilities for Vue components
 */

import { ref, computed } from 'vue'

export function useFormValidation() {
  const errors = ref({})
  const touched = ref({})

  /**
   * Validate email format
   */
  const validateEmail = (email) => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Invalid email format'
    return null
  }

  /**
   * Validate password
   */
  const validatePassword = (password, minLength = 4) => {
    if (!password) return 'Password is required'
    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`
    }
    return null
  }

  /**
   * Validate required field
   */
  const validateRequired = (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`
    }
    return null
  }

  /**
   * Validate string length
   */
  const validateLength = (value, min = 0, max = null, fieldName = 'Field') => {
    if (min > 0 && (!value || value.length < min)) {
      return `${fieldName} must be at least ${min} characters`
    }
    if (max && value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters`
    }
    return null
  }

  /**
   * Validate URL format
   */
  const validateUrl = (url) => {
    if (!url) return null
    try {
      new URL(url)
      return null
    } catch {
      return 'Invalid URL format'
    }
  }

  /**
   * Set field error
   */
  const setError = (field, message) => {
    errors.value[field] = message
  }

  /**
   * Clear field error
   */
  const clearError = (field) => {
    delete errors.value[field]
  }

  /**
   * Clear all errors
   */
  const clearAllErrors = () => {
    errors.value = {}
    touched.value = {}
  }

  /**
   * Mark field as touched
   */
  const touchField = (field) => {
    touched.value[field] = true
  }

  /**
   * Check if field has error
   */
  const hasError = (field) => {
    return !!errors.value[field]
  }

  /**
   * Get field error message
   */
  const getError = (field) => {
    return errors.value[field] || null
  }

  /**
   * Check if form is valid
   */
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  /**
   * Validate entire form
   */
  const validateForm = (fields) => {
    clearAllErrors()
    let hasErrors = false

    for (const [field, validators] of Object.entries(fields)) {
      touchField(field)
      for (const validator of validators) {
        const error = validator()
        if (error) {
          setError(field, error)
          hasErrors = true
          break
        }
      }
    }

    return !hasErrors
  }

  return {
    errors,
    touched,
    validateEmail,
    validatePassword,
    validateRequired,
    validateLength,
    validateUrl,
    setError,
    clearError,
    clearAllErrors,
    touchField,
    hasError,
    getError,
    isValid,
    validateForm
  }
}
