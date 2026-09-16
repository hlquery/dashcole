import { marked } from 'marked'

const sources = import.meta.glob('./pages/*.md', { eager: true, query: '?raw', import: 'default' })

const escapeAttribute = (value = '') => value
  .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const decodeHtml = (value = '') => value
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

const slugify = (value = '') => value.toLowerCase().replace(/<[^>]*>/g, '').replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const parseFrontmatter = (source, filePath) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) throw new Error(`Missing frontmatter in ${filePath}`)
  const metadata = {}
  match[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return
    const separator = line.indexOf(':')
    if (separator === -1) return
    let value = line.slice(separator + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    metadata[line.slice(0, separator).trim()] = value
  })
  return { metadata, body: source.slice(match[0].length).trim() }
}

const renderMarkdown = (markdown) => {
  let html = marked.parse(markdown, { gfm: true })
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, depth, title) => `<h${depth} id="${slugify(title)}">${title}</h${depth}>`)
  html = html.replace(/<pre><code class="language-jointjs">([\s\S]*?)<\/code><\/pre>/g, (_match, encodedName) => {
    const name = decodeHtml(encodedName).trim().replace(/[^a-z0-9-]/gi, '') || 'api-client'
    return `<figure class="joint-diagram-shell" aria-label="Interactive architecture diagram"><div class="joint-diagram-toolbar"><span><i aria-hidden="true"></i> Interactive architecture</span><small>Drag a node to inspect the request path.</small></div><div class="joint-diagram-paper" data-joint-diagram="${name}" role="img" aria-label="Application connects through a client and services to the hlquery HTTP API"></div><figcaption>Move the nodes to explore how an application reaches the hlquery API.</figcaption></figure>`
  })
  html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_match, encodedDiagram) => `<div class="markdown-diagram" aria-label="Diagram"><pre class="mermaid">${encodedDiagram}</pre></div>`)
  return html.replace(/<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g, (_match, language = 'text', encodedCode) => {
    const code = decodeHtml(encodedCode)
    const isTerminal = ['bash', 'sh', 'shell', 'zsh'].includes(language.toLowerCase())
    let promptShown = false
    const terminalLines = encodedCode.replace(/\n$/, '').split('\n').map((line) => {
      const trimmed = decodeHtml(line).trim()
      const isCommand = Boolean(trimmed) && !trimmed.startsWith('#')
      const hasPrompt = isCommand && !promptShown
      if (hasPrompt) promptShown = true
      return `<span class="terminal-line${isCommand ? ' is-command' : ''}${hasPrompt ? ' has-prompt' : ''}">${line || ' '}</span>`
    }).join('')
    const renderedCode = isTerminal ? terminalLines : encodedCode
    return `<div class="code-block markdown-code-block${isTerminal ? ' is-terminal' : ''}"><div class="code-head"><span>${isTerminal ? 'Terminal' : 'Code'}</span><span>${language}</span></div><pre><code class="language-${language}${isTerminal ? ' terminal-code' : ''}">${renderedCode}</code></pre><button type="button" class="markdown-copy" data-copy="${escapeAttribute(code)}" aria-label="Copy code">Copy</button></div>`
  })
}

export const pages = Object.entries(sources).map(([filePath, source]) => {
  const { metadata, body } = parseFrontmatter(source, filePath)
  const id = metadata.id || filePath.split('/').pop().replace(/\.md$/, '')
  return { ...metadata, id, html: renderMarkdown(body), searchText: body.replace(/```[\s\S]*?```/g, ' ').replace(/[#>*_`|\[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim() }
}).sort((left, right) => Number(left.order || 0) - Number(right.order || 0))

export const pageById = (id) => pages.find((page) => page.id === id) || pages[0]
export const pageHeadings = (page) => Array.from(page.html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)).map((match) => ({ id: match[1], label: match[2].replace(/<[^>]*>/g, '') }))
