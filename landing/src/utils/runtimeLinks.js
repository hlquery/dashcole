const PLACEHOLDER_PROTOCOLS = ['hlq://', 'dashcole://']

const trimTrailingSlash = (value = '') => String(value).trim().replace(/\/+$/, '')

const parsePlaceholderUrl = (value = '') => {
  const normalized = String(value).trim()
  const protocol = PLACEHOLDER_PROTOCOLS.find((candidate) => normalized.toLowerCase().startsWith(candidate))
  if (!protocol) return null

  const remainder = normalized.slice(protocol.length)
  const slashIndex = remainder.search(/[/?#]/)
  const target = (slashIndex === -1 ? remainder : remainder.slice(0, slashIndex)).toLowerCase()
  const suffix = slashIndex === -1 ? '' : remainder.slice(slashIndex)

  if (!target) return null

  return { target, suffix }
}

export const resolveRuntimeUrl = (value, options = {}) => {
  const parsed = parsePlaceholderUrl(value)
  if (!parsed) return value

  const baseUrls = {
    docs: trimTrailingSlash(options.docsBaseUrl),
    blog: trimTrailingSlash(options.blogBaseUrl),
    web: trimTrailingSlash(options.webBaseUrl)
  }

  const baseUrl = baseUrls[parsed.target]
  if (!baseUrl) return value

  const suffix = parsed.suffix || '/'
  return `${baseUrl}${suffix.startsWith('/') ? suffix : `/${suffix}`}`
}

export const rewriteRuntimeLinksInHtml = (html, options = {}) => {
  if (!html) return html

  return String(html)
    .replace(/(href|src)=(['"])(hlq:\/\/[^'"]+)\2/gi, (_, attr, quote, url) => `${attr}=${quote}${resolveRuntimeUrl(url, options)}${quote}`)
    .replace(/(href|src)=(['"])(dashcole:\/\/[^'"]+)\2/gi, (_, attr, quote, url) => `${attr}=${quote}${resolveRuntimeUrl(url, options)}${quote}`)
    .replace(/https?:\/\/docs\.dashcole\.com/gi, trimTrailingSlash(options.docsBaseUrl))
    .replace(/http:\/\/localhost:5176/gi, trimTrailingSlash(options.docsBaseUrl))
    .replace(/https?:\/\/blog\.dashcole\.com/gi, trimTrailingSlash(options.blogBaseUrl))
    .replace(/https?:\/\/blog\.nexteduc?\.om/gi, trimTrailingSlash(options.blogBaseUrl))
    .replace(/https?:\/\/blog\.nextedu\.cl/gi, trimTrailingSlash(options.blogBaseUrl))
    .replace(/https?:\/\/blog\.dashcole\.cl/gi, trimTrailingSlash(options.blogBaseUrl))
    .replace(/http:\/\/localhost:5175/gi, trimTrailingSlash(options.blogBaseUrl))
}
