import domainConfig from '@/config/domain'

const encodeHandoffPayload = (payload) => btoa(unescape(encodeURIComponent(JSON.stringify(payload))))

const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return ''
  return (localStorage.getItem('user_language') || '').toLowerCase()
}

export const appendLanguageToUrl = (url, language = getCurrentLanguage()) => {
  if (!language) return url

  try {
    const nextUrl = new URL(url, window.location.origin)
    nextUrl.searchParams.set('lang', language)
    return nextUrl.toString()
  } catch {
    const separator = String(url).includes('?') ? '&' : '?'
    return `${url}${separator}lang=${encodeURIComponent(language)}`
  }
}

export const buildAuthHandoffPayload = () => {
  if (typeof window === 'undefined') return null

  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('auth_user')
  if (!token || !storedUser) return null

  try {
    const storedServer = localStorage.getItem('server')

    return {
      token,
      user: JSON.parse(storedUser),
      root_flags: localStorage.getItem('admin_root_flags') === 'true',
      can_manage: localStorage.getItem('admin_can_manage') === 'true',
      language: getCurrentLanguage(),
      server: storedServer ? JSON.parse(storedServer) : null
    }
  } catch (error) {
    console.error('Failed to build auth handoff payload:', error)
    return null
  }
}

export const writeDashboardAuthHandoffCookie = (payload = buildAuthHandoffPayload()) => {
  if (typeof window === 'undefined' || !payload?.token) return false

  const encodedHandoff = encodeHandoffPayload(payload)
  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
  const hostname = window.location.hostname.toLowerCase()
  const sharedDomain = hostname === 'hlquery.com' || hostname.endsWith('.hlquery.com')
    ? '; Domain=.hlquery.com'
    : ''
  document.cookie = `hlq_handoff=${encodeURIComponent(encodedHandoff)}; path=/; max-age=180; SameSite=Lax${secureFlag}${sharedDomain}`
  return true
}

export const redirectToDashboard = (path = '') => {
  writeDashboardAuthHandoffCookie()

  const dashboardBaseUrl = domainConfig.getDashboardUrl().replace(/\/+$/, '')
  const normalizedPath = path ? `/${String(path).replace(/^\/+/, '')}` : ''
  window.location.replace(appendLanguageToUrl(`${dashboardBaseUrl}${normalizedPath}`))
}
