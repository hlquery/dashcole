const stripTrailingSlash = (value = '') => String(value).replace(/\/+$/, '')

const configuredApiUrl = stripTrailingSlash(import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.hlquery.com' : 'http://localhost:6666'))
const apiBaseUrl = configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`

const getSessionId = () => {
  const existing = document.cookie
    .split('; ')
    .find((item) => item.startsWith('session_id='))
    ?.split('=')[1]

  if (existing) return existing

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
  document.cookie = `session_id=${sessionId}; path=/; max-age=31536000; SameSite=Lax`
  return sessionId
}

export const trackGuideVisit = (route, referrer = document.referrer) => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return

  const token = window.localStorage.getItem('token')
  const body = JSON.stringify({
    route,
    path: route,
    referrer: referrer || null,
    user_agent: navigator.userAgent,
    session_id: getSessionId(),
    timestamp: new Date().toISOString(),
    source_app: 'guides'
  })

  fetch(`${apiBaseUrl}/track/visit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body,
    credentials: 'include',
    keepalive: true
  }).catch(() => {})
}
