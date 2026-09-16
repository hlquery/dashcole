import { ref, onUnmounted } from 'vue'
import { io } from 'socket.io-client'

const socketRef = ref(null)
const unreadCount = ref(0)
const isConnected = ref(false)
const isReconnecting = ref(false)
const isConnecting = ref(false) // Track if connection is in progress
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 10
const reconnectDelay = ref(1000) // Start with 1 second
const maxReconnectDelay = 30000 // Max 30 seconds
let reconnectTimer = null
let connectionCheckInterval = null
let hasAutoConnected = false // Track if auto-connect has been called
let eventListenersAttached = false // Track if event listeners are attached
let connectFunction = null // Reference to connect function

function getToken() {
  return localStorage.getItem('token') || ''
}

function getSocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http'
  const host = window.location.hostname
  const port = (host === 'localhost' || host === '127.0.0.1') ? ':7000' : ''
  return `${protocol}://${host}${port}`
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function scheduleReconnect() {
  clearReconnectTimer()
  
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    console.error('Socket.IO: Max reconnection attempts reached')
    isReconnecting.value = false
    return
  }
  
  isReconnecting.value = true
  reconnectAttempts.value++
  
  // Exponential backoff with jitter
  const delay = Math.min(
    reconnectDelay.value * Math.pow(2, reconnectAttempts.value - 1) + Math.random() * 1000,
    maxReconnectDelay
  )
  
  console.log(`Socket.IO: Scheduling reconnect attempt ${reconnectAttempts.value} in ${Math.round(delay)}ms`)
  
  reconnectTimer = setTimeout(() => {
    const token = getToken()
    if (token && connectFunction) {
      connectFunction()
    } else {
      isReconnecting.value = false
      reconnectAttempts.value = 0
    }
  }, delay)
}

function startConnectionCheck() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval)
  }
  
  connectionCheckInterval = setInterval(() => {
    if (socketRef.value && !socketRef.value.connected && !isReconnecting.value) {
      const token = getToken()
      if (token) {
        console.log('Socket.IO: Connection check - socket disconnected, attempting reconnect')
        scheduleReconnect()
      }
    }
  }, 5000) // Check every 5 seconds
}

// Global connection state to prevent multiple connections
let globalConnectionState = {
  isConnecting: false,
  isConnected: false,
  lastAttempt: 0,
  timeout: null
}
const CONNECT_DEBOUNCE_MS = 1000 // Wait 1 second between connection attempts

export function useSocket() {
  const connect = () => {
    // Only connect if there's a token (user is logged in)
    const token = getToken()
    if (!token) {
      console.log('Socket.IO: No token found, skipping connection')
      isReconnecting.value = false
      isConnecting.value = false
      globalConnectionState.isConnecting = false
      return
    }
    
    // Check global connection state first
    if (globalConnectionState.isConnected && socketRef.value?.connected) {
      console.log('Socket.IO: Already connected (global check), skipping')
      isReconnecting.value = false
      isConnecting.value = false
      reconnectAttempts.value = 0
      return
    }
    
    // Don't reconnect if already connected
    if (socketRef.value?.connected) {
      console.log('Socket.IO: Already connected, skipping')
      globalConnectionState.isConnected = true
      isReconnecting.value = false
      isConnecting.value = false
      reconnectAttempts.value = 0
      return
    }
    
    // Don't connect if already connecting (check both local and global)
    if (globalConnectionState.isConnecting || isConnecting.value || (socketRef.value && socketRef.value.connecting)) {
      console.log('Socket.IO: Connection already in progress, skipping')
      return
    }
    
    // Debounce connection attempts (global debounce)
    const now = Date.now()
    if (now - globalConnectionState.lastAttempt < CONNECT_DEBOUNCE_MS) {
      console.log('Socket.IO: Connection attempt debounced (global)')
      if (globalConnectionState.timeout) clearTimeout(globalConnectionState.timeout)
      globalConnectionState.timeout = setTimeout(() => {
        connect()
      }, CONNECT_DEBOUNCE_MS - (now - globalConnectionState.lastAttempt))
      return
    }
    globalConnectionState.lastAttempt = now
    globalConnectionState.isConnecting = true
    
    // Clean up existing socket if disconnected
    if (socketRef.value && !socketRef.value.connected && !socketRef.value.connecting) {
      socketRef.value.removeAllListeners()
      socketRef.value.disconnect()
      socketRef.value = null
      eventListenersAttached = false
    }
    
    const url = getSocketUrl()
    console.log('Socket.IO: Connecting with token for authenticated user')
    isConnecting.value = true
    globalConnectionState.isConnecting = true
    
    try {
      socketRef.value = io(url, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: false,
        auth: { token },
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
        forceNew: false,
        // Add query parameter as fallback for token
        query: { token }
      })
      
      // Always attach event listeners to new socket instance
      // (they'll be removed when socket is cleaned up)
      attachEventListeners()
      eventListenersAttached = true
    } catch (error) {
      console.error('Socket.IO: Failed to create socket connection', error)
      isConnected.value = false
      isConnecting.value = false
      globalConnectionState.isConnected = false
      globalConnectionState.isConnecting = false
      scheduleReconnect()
    }
  }
  
  // Store connect function reference for module-level access
  connectFunction = connect
  
  const attachEventListeners = () => {
    if (!socketRef.value) return
    

    socketRef.value.on('connect', () => {
      console.log('Socket.IO: Connected successfully')
      isConnected.value = true
      isConnecting.value = false
      globalConnectionState.isConnected = true
      globalConnectionState.isConnecting = false
      isReconnecting.value = false
      reconnectAttempts.value = 0
      reconnectDelay.value = 1000 // Reset delay
      
      // Request unread count (server already sends it, but this ensures we get it)
      if (socketRef.value?.connected) {
        socketRef.value.emit('notifications:get', { limit: 0, offset: 0 })
      }
      
      // Start connection monitoring (only once)
      if (!connectionCheckInterval) {
        startConnectionCheck()
      }
    })

    socketRef.value.on('disconnect', (reason) => {
      console.log('Socket.IO: Disconnected', reason)
      isConnected.value = false
      isConnecting.value = false
      globalConnectionState.isConnected = false
      globalConnectionState.isConnecting = false
      
      // Only schedule reconnect if it's not a manual disconnect
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        scheduleReconnect()
      } else {
        isReconnecting.value = false
        reconnectAttempts.value = 0
      }
    })

    socketRef.value.on('connect_error', (error) => {
      console.error('Socket.IO: Connection error', error)
      isConnected.value = false
      isConnecting.value = false
      
      // Check if it's an authentication error
      if (error.message && (
        error.message.includes('Authentication') ||
        error.message.includes('token') ||
        error.message.includes('Token') ||
        error.message.includes('expired') ||
        error.message.includes('Invalid') ||
        error.message.includes('revoked') ||
        error.message.includes('banned')
      )) {
        console.error('Socket.IO: Authentication failed -', error.message)
        // Don't retry on authentication errors - user needs to re-login
        isReconnecting.value = false
        isConnecting.value = false
        reconnectAttempts.value = 0
        clearReconnectTimer()
        
        // Emit event for components to handle (e.g., redirect to login)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('socket-auth-error', { 
            detail: { message: error.message } 
          }))
        }
        return
      }
      
      scheduleReconnect()
    })

    socketRef.value.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket.IO: Reconnection attempt ${attemptNumber}`)
      isReconnecting.value = true
      isConnecting.value = true
    })

    socketRef.value.on('reconnect', (attemptNumber) => {
      console.log(`Socket.IO: Reconnected after ${attemptNumber} attempts`)
      isConnected.value = true
      isConnecting.value = false
      isReconnecting.value = false
      reconnectAttempts.value = 0
      reconnectDelay.value = 1000
    })

    socketRef.value.on('reconnect_failed', () => {
      console.error('Socket.IO: Reconnection failed after max attempts')
      isReconnecting.value = false
      isConnecting.value = false
      scheduleReconnect() // Try our custom reconnection logic
    })

    socketRef.value.on('notification:unread-count', (payload) => {
      if (payload && typeof payload.count === 'number') {
        unreadCount.value = payload.count
      }
    })

    socketRef.value.on('notification:new', (notification) => {
      // Increment unread count when new notification arrives
      unreadCount.value = Math.max(0, (unreadCount.value || 0) + 1)
      
      // Emit custom event for components to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification-received', { 
          detail: notification 
        }))
      }
    })

    socketRef.value.on('notification:mark-read', (payload) => {
      // Update unread count based on payload
      if (payload && typeof payload.count === 'number') {
        unreadCount.value = Math.max(0, payload.count)
      } else if (payload && payload.notificationId) {
        // Single notification marked as read - decrement count
        unreadCount.value = Math.max(0, (unreadCount.value || 0) - 1)
      } else if (payload && payload.all) {
        // All marked as read - set to 0
        unreadCount.value = 0
      }
    })
    
    // Listen for notification list updates
    socketRef.value.on('notifications:list', (notifications) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notifications-updated', { 
          detail: notifications 
        }))
      }
    })
    
    // Listen for notification updates
    socketRef.value.on('notifications:updated', (payload) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification-updated', { 
          detail: payload 
        }))
      }
    })
    
    // Listen for notification deletions
    socketRef.value.on('notifications:deleted', (payload) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification-deleted', { 
          detail: payload 
        }))
      }
    })
  }

  const disconnect = () => {
    clearReconnectTimer()
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval)
      connectionCheckInterval = null
    }
    
    if (socketRef.value) {
      socketRef.value.removeAllListeners()
      socketRef.value.disconnect()
      socketRef.value = null
      eventListenersAttached = false
      isConnected.value = false
      isConnecting.value = false
      isReconnecting.value = false
      reconnectAttempts.value = 0
    }
  }

  const reconnect = () => {
    clearReconnectTimer()
    reconnectAttempts.value = 0
    reconnectDelay.value = 1000
    if (socketRef.value) {
      socketRef.value.disconnect()
      socketRef.value = null
    }
    connect()
  }

  // Auto-connect when useSocket is called (if token exists) - only once
  if (typeof window !== 'undefined' && !hasAutoConnected) {
    const token = getToken()
    if (token) {
      hasAutoConnected = true
      connect()
    }
  }

  // Cleanup on unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      disconnect()
    })
  }

  return { 
    connect, 
    disconnect, 
    reconnect,
    unreadCount, 
    isConnected, 
    isConnecting,
    isReconnecting,
    reconnectAttempts,
    socket: socketRef 
  }
}
