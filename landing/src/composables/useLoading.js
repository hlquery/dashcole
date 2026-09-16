/**
 * Loading State Composable
 * Provides loading state management for Vue components
 */

import { ref, computed } from 'vue'

export function useLoading(initialState = false) {
  const loading = ref(initialState)
  const loadingMessage = ref('')
  const loadingTasks = ref(new Set())

  /**
   * Set loading state
   */
  const setLoading = (state, message = '') => {
    loading.value = state
    loadingMessage.value = message
  }

  /**
   * Start loading with optional message
   */
  const startLoading = (message = 'Loading...') => {
    loading.value = true
    loadingMessage.value = message
  }

  /**
   * Stop loading
   */
  const stopLoading = () => {
    loading.value = false
    loadingMessage.value = ''
  }

  /**
   * Add loading task
   */
  const addTask = (taskId, message = '') => {
    loadingTasks.value.add(taskId)
    if (message) {
      loadingMessage.value = message
    }
    loading.value = true
  }

  /**
   * Remove loading task
   */
  const removeTask = (taskId) => {
    loadingTasks.value.delete(taskId)
    if (loadingTasks.value.size === 0) {
      loading.value = false
      loadingMessage.value = ''
    }
  }

  /**
   * Execute async function with loading state
   */
  const withLoading = async (fn, message = 'Loading...') => {
    try {
      startLoading(message)
      const result = await fn()
      return result
    } finally {
      stopLoading()
    }
  }

  /**
   * Check if specific task is loading
   */
  const isTaskLoading = (taskId) => {
    return loadingTasks.value.has(taskId)
  }

  /**
   * Check if any task is loading
   */
  const hasActiveTasks = computed(() => {
    return loadingTasks.value.size > 0
  })

  return {
    loading,
    loadingMessage,
    loadingTasks,
    setLoading,
    startLoading,
    stopLoading,
    addTask,
    removeTask,
    withLoading,
    isTaskLoading,
    hasActiveTasks
  }
}
