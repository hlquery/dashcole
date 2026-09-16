/**
 * Smart Link Utility Functions
 * Automatically handles protocol (http/https) based on environment
 */

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname.includes('dev') ||
         window.location.hostname.includes('local') ||
         process.env.NODE_ENV === 'development'
}

/**
 * Get the appropriate protocol for the current environment
 */
export const getProtocol = () => {
  return isDevelopment() ? 'http' : 'https'
}

/**
 * Resolve well-known destinations to internal routes (dev) or subdomains (prod)
 */
const DOMAIN = 'aquarelio.com'

const slugToConfig = {
  // Support/contact
  support: { devPath: '/help-center', subdomain: 'support' },
  help: { devPath: '/help-center', subdomain: 'support' },
  'help-center': { devPath: '/help-center', subdomain: 'support' },
  contact: { devPath: '/contact', subdomain: 'www', prodPath: '/contact' },

  // Docs removed

  // Brand/assets
  brand: { devPath: '/brand', subdomain: 'brand' },

  // Status page
  status: { devPath: '/status', subdomain: 'status' },

  // Community
  discord: { external: 'https://discord.aquarelio.com' },
}

function buildProdUrlForSlug(key) {
  const cfg = slugToConfig[key]
  if (!cfg) return null
  if (cfg.external) return cfg.external
  const protocol = getProtocol()
  const base = `${protocol}://${cfg.subdomain}.${DOMAIN}`
  const path = cfg.prodPath || ''
  const hash = cfg.prodHash || ''
  return `${base}${path}${hash}`
}

function buildDevUrlForSlug(key) {
  const cfg = slugToConfig[key]
  if (!cfg) return null
  if (cfg.external) return cfg.external
  return cfg.devPath || '/'
}

/**
 * Create a smart link that automatically uses the correct protocol
 * @param {string} path - The path to link to (e.g., '/dashboard', '/login')
 * @param {string} hostname - Optional custom hostname (defaults to current hostname)
 * @returns {string} - Complete URL with appropriate protocol
 */
export const makeLink = (keyOrPath = '', hostname = null) => {
  // If full URL provided, return as is
  if (typeof keyOrPath === 'string' && (keyOrPath.startsWith('http://') || keyOrPath.startsWith('https://'))) {
    return keyOrPath
  }

  // Slug mode: map well-known keys to environment-aware links
  const lowerKey = (keyOrPath || '').toString()
  if (slugToConfig[lowerKey]) {
    if (isDevelopment()) {
      return buildDevUrlForSlug(lowerKey)
    }
    return buildProdUrlForSlug(lowerKey)
  }

  // Path mode: treat input as an internal path (or api path)
  const protocol = getProtocol()
  const targetHostname = hostname || window.location.hostname
  const webPort = isDevelopment() ? ':5173' : ''

  const path = keyOrPath || ''
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // API shortcut
  if (path.startsWith('api/') || path.startsWith('/api/')) {
    const apiPort = isDevelopment() ? ':3000' : ''
    return `${protocol}://${targetHostname}${apiPort}/${cleanPath}`
  }

  return `${protocol}://${targetHostname}${webPort}/${cleanPath}`
}

/**
 * Create an API link with automatic protocol and port handling
 * @param {string} endpoint - API endpoint (e.g., 'auth/login', 'users/profile')
 * @param {string} hostname - Optional custom hostname
 * @returns {string} - Complete API URL
 */
export const makeApiLink = (endpoint, hostname = null) => {
  const protocol = getProtocol()
  const targetHostname = hostname || window.location.hostname
  const port = isDevelopment() ? ':3000' : '' // API port for development
  
  // Remove leading slash and api/ if present
  const cleanEndpoint = endpoint.replace(/^\/?(api\/)?/, '')
  
  return `${protocol}://${targetHostname}${port}/api/${cleanEndpoint}`
}

/**
 * Create a WebSocket link with automatic protocol handling
 * @param {string} path - WebSocket path (e.g., 'ws', 'socket.io')
 * @param {string} hostname - Optional custom hostname
 * @returns {string} - Complete WebSocket URL
 */
export const makeWsLink = (path = '', hostname = null) => {
  const wsProtocol = isDevelopment() ? 'ws' : 'wss'
  const targetHostname = hostname || window.location.hostname
  const port = isDevelopment() ? ':3000' : ''
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  
  return `${wsProtocol}://${targetHostname}${port}/${cleanPath}`
}

/**
 * Get the current domain with appropriate protocol
 * @param {string} hostname - Optional custom hostname
 * @returns {string} - Complete domain URL
 */
export const getCurrentDomain = (hostname = null) => {
  const protocol = getProtocol()
  const targetHostname = hostname || window.location.hostname
  const webPort = isDevelopment() ? ':5173' : ''
  
  return `${protocol}://${targetHostname}${webPort}`
}

/**
 * Check if a URL is external (different domain)
 * @param {string} url - URL to check
 * @returns {boolean} - True if external
 */
export const isExternalUrl = (url) => {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname !== window.location.hostname
  } catch {
    return false
  }
}

/**
 * Create a safe external link (opens in new tab with security attributes)
 * @param {string} url - External URL
 * @returns {object} - Link attributes for Vue router-link or <a> tag
 */
export const makeExternalLink = (url) => {
  return {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer'
  }
}

/**
 * Smart router link - handles internal vs external links
 * @param {string} path - Path or URL
 * @returns {object} - Router link configuration
 */
export const makeSmartLink = (path) => {
  // If it's already a full URL, check if it's external
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (isExternalUrl(path)) {
      return makeExternalLink(path)
    } else {
      // Internal full URL, extract path
      try {
        const url = new URL(path)
        return { to: url.pathname + url.search + url.hash }
      } catch {
        return { to: path }
      }
    }
  }
  
  // Internal path
  return { to: path }
}

// Export default object with all utilities
export default {
  isDevelopment,
  getProtocol,
  makeLink,
  makeApiLink,
  makeWsLink,
  getCurrentDomain,
  isExternalUrl,
  makeExternalLink,
  makeSmartLink
}
