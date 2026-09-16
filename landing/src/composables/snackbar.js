import { ref } from 'vue'

// Global snackbar state
const snackbar = ref(false)
const message = ref('')
const color = ref('success')
const timeout = ref(3000)
let closeTimer = null
const queue = []

function showNow(msg, type, duration) {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  message.value = msg
  color.value = type
  timeout.value = duration
  snackbar.value = true
  closeTimer = setTimeout(() => {
    snackbar.value = false
    closeTimer = null
    if (queue.length > 0) {
      const next = queue.shift()
      showNow(next.msg, next.type, next.duration)
    }
  }, Math.max(Number(duration) || 0, 800))
}

export function useSnackbar() {
  const show = (msg, type = 'success', duration = 3000) => {
    const next = {
      msg: String(msg ?? ''),
      type,
      duration
    }
    if (snackbar.value) {
      queue.push(next)
      return
    }
    showNow(next.msg, next.type, next.duration)
  }

  const success = (msg, duration = 3000) => {
    show(msg, 'success', duration)
  }

  const error = (msg, duration = 5000) => {
    show(msg, 'error', duration)
  }

  const info = (msg, duration = 3000) => {
    show(msg, 'info', duration)
  }

  const warning = (msg, duration = 4000) => {
    show(msg, 'warning', duration)
  }

  const close = () => {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    snackbar.value = false
    if (queue.length > 0) {
      const next = queue.shift()
      showNow(next.msg, next.type, next.duration)
    }
  }

  return {
    snackbar,
    message,
    color,
    timeout,
    show,
    success,
    error,
    info,
    warning,
    close
  }
}







