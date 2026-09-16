import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import resources from './resources.json'

const guideSources = import.meta.glob('./guides/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const stripQuotes = (value = '') => {
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const parseFrontmatter = (source, filePath) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) throw new Error(`Missing frontmatter in ${filePath}`)

  const metadata = {}
  match[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return
    const separator = line.indexOf(':')
    if (separator === -1) return
    const key = line.slice(0, separator).trim()
    metadata[key] = stripQuotes(line.slice(separator + 1))
  })

  return { metadata, body: source.slice(match[0].length).trim() }
}

const slugify = (value = '') => value
  .toLowerCase()
  .replace(/<[^>]*>/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const extractSections = (markdown = '') => Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match) => ({
  id: slugify(match[1]),
  title: match[1].replace(/[`*_]/g, '').trim()
}))

const createSearchText = (markdown = '') => markdown
  .replace(/```[\s\S]*?```/g, ' ')
  .replace(/<[^>]*>/g, ' ')
  .replace(/[#>*_`|\[\]()!-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const terminalLanguages = new Set(['bash', 'sh', 'shell', 'zsh'])

const formatTerminalCode = (code = '') => {
  const lines = code.split('\n')
  if (lines.at(-1) === '') lines.pop()

  let continuation = false
  let heredocEnd = ''
  let openQuote = ''

  return lines.map((line) => {
    const plainLine = line
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/^[\w.-]+@[\w.-]+:[^$]*\$\s?/, '')
    const trimmed = plainLine.trim()
    let isCommand = false

    if (heredocEnd) {
      if (trimmed === heredocEnd) heredocEnd = ''
    } else if (trimmed && !trimmed.startsWith('#') && !continuation && !openQuote) {
      isCommand = true
      const heredocMatch = plainLine.match(/<<-?\s*['"]?([A-Za-z_][A-Za-z0-9_-]*)['"]?/)
      if (heredocMatch) heredocEnd = heredocMatch[1]
    }

    let escaped = false
    for (const character of plainLine) {
      if (openQuote === "'") {
        if (character === "'") openQuote = ''
        continue
      }
      if (openQuote === '"') {
        if (escaped) {
          escaped = false
        } else if (character === '\\') {
          escaped = true
        } else if (character === '"') {
          openQuote = ''
        }
        continue
      }
      if (character === "'" || character === '"') openQuote = character
    }

    continuation = !heredocEnd && trimmed.endsWith('\\')

    return `<span class="terminal-line${isCommand ? ' is-command' : ''}">${plainLine}</span>`
  }).join('')
}

const jointDiagramMetadata = {
  'module-timer': {
    label: 'Interactive flow',
    hint: 'Drag a node—the connections follow it.',
    aria: 'hlquery main loop calls OnEveryOneMinute, which runs the configured task and updates logs and counters',
    caption: 'The server callback arrives once per wall-clock minute. The module runs its task only when the configured interval is reached.'
  },
  'php-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'PHP application uses the hlquery client and its services to call the hlquery HTTP API',
    caption: 'The PHP client keeps transport and authentication in one place while service objects organize collection, document, SQL, module, and operational requests.'
  },
  'perl-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'Perl application uses Hlquery Client and its services to call the hlquery HTTP API',
    caption: 'The Perl client keeps transport and authentication in one place while service objects organize collection, document, search, and operational requests.'
  },
  'cpp-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'C++ application uses hlquery Client and its services to call the hlquery HTTP API',
    caption: 'The C++ client keeps transport, authentication, and optional TLS in one place while service objects organize collection, document, search, and operational requests.'
  },
  'rust-api-client': {
    label: 'Interactive async client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'Rust application uses the asynchronous hlquery Client and its services to call the hlquery HTTP API',
    caption: 'The Rust client reuses one asynchronous reqwest transport while service objects organize collection, document, lexical search, vector search, and multi-search requests.'
  },
  'python-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'Python application uses the synchronous hlquery Client and its services to call the hlquery HTTP API',
    caption: 'The dependency-free Python client uses one synchronous standard-library transport while service objects organize collection, document, search, key, and operational requests.'
  },
  'installation-flow': {
    label: 'Flujo de instalación',
    hint: 'Arrastra un paso para inspeccionar la ruta.',
    aria: 'La instalación de DashCole va de requisitos a runtime y verificación local',
    caption: 'La instalación separa requisitos, dependencias, infraestructura y verificación para aislar fallos.'
  },
  'configuration-flow': {
    label: 'Flujo de configuración',
    hint: 'Arrastra una capa para inspeccionar la ruta.',
    aria: 'DashCole carga el .env antes de conectar MySQL, Redis y la API',
    caption: 'El archivo .env define MySQL, Redis, SMTP, respaldos y el plano de control antes de servir solicitudes.'
  },
  'vector-search-flow': {
    label: 'Interactive vector search flow',
    hint: 'Drag a layer to inspect the retrieval path.',
    aria: 'A query becomes an embedding, the vector index retrieves nearby documents, and hlquery ranks filtered results',
    caption: 'Your application creates the query embedding. hlquery retrieves nearby vectors, combines optional keyword and filter signals, and returns ranked documents.'
  },
  'go-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'Go application uses the hlquery Go client and its services to call the hlquery HTTP API',
    caption: 'The dependency-free Go client reuses one standard-library HTTP transport while grouped services organize collection, document, lexical search, vector search, and operational requests.'
  },
  'java-api-client': {
    label: 'Interactive client architecture',
    hint: 'Drag a layer to inspect the request path.',
    aria: 'Java application uses the hlquery Java client and its services to call the hlquery HTTP API',
    caption: 'The Java 11 client uses the native HttpClient and org.json while service objects organize collection, document, lexical search, vector search, and operational requests.'
  },
  'bm25-plus-flow': {
    label: 'Interactive BM25+ ranking flow',
    hint: 'Drag a stage to inspect the scoring path.',
    aria: 'A search query finds candidate documents, BM25+ combines rarity, term frequency, document length, and delta, then returns ranked results',
    caption: 'BM25+ turns lexical matches into an ordered result set by combining term rarity, saturated term frequency, document-length normalization, and the delta floor.'
  }
}

const enhanceMarkdown = (markdown = '') => {
  let html = marked.parse(markdown, { gfm: true })

  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, depth, content) => (
    `<h${depth} id="${slugify(content)}">${content}</h${depth}>`
  ))

  html = html.replace(
    /<pre><code class="language-jointjs">([\s\S]*?)<\/code><\/pre>/g,
    (_match, diagramName) => {
      const safeName = diagramName
        .replace(/&(?:amp|lt|gt|quot|#39);/g, '')
        .replace(/[^a-z0-9-]/gi, '')
      const metadata = jointDiagramMetadata[safeName] || jointDiagramMetadata['module-timer']

      return `
        <figure class="joint-diagram-shell" aria-label="${metadata.label}">
          <div class="joint-diagram-toolbar">
            <span><i aria-hidden="true"></i> ${metadata.label}</span>
            <small>${metadata.hint}</small>
          </div>
          <div class="joint-diagram-paper" data-joint-diagram="${safeName}" role="img" aria-label="${metadata.aria}"></div>
          <figcaption>${metadata.caption}</figcaption>
        </figure>
      `
    }
  )

  html = html.replace(
    /<pre><code class="language-math">([\s\S]*?)<\/code><\/pre>/g,
    (_match, formula) => `
      <div class="math-diagram" role="img" aria-label="BM25+ scoring formula">
        ${katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
          output: 'htmlAndMathml'
        })}
      </div>
    `
  )

  html = html.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_match, diagram) => `
      <div class="markdown-diagram" aria-label="Guide flow diagram">
        <pre class="mermaid">${diagram}</pre>
      </div>
    `
  )

  html = html.replace(
    /<pre><code(?: class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, language = 'text', code) => {
      const isTerminal = terminalLanguages.has(language.toLowerCase())
      const formattedCode = isTerminal ? formatTerminalCode(code) : code

      return `
      <div class="code-block markdown-code-block${isTerminal ? ' is-terminal' : ''}">
        <div class="code-head"><span>${isTerminal ? 'Terminal' : 'Code'}</span><span>${language}</span></div>
        <pre><code class="language-${language}${isTerminal ? ' terminal-code' : ''}">${formattedCode}</code></pre>
        <button type="button" class="markdown-copy" aria-label="Copy code">Copy</button>
      </div>
    `
    }
  )

  return html
}

const parseGuide = (source, filePath) => {
  const { metadata, body } = parseFrontmatter(source, filePath)
  const slug = metadata.slug || slugify(metadata.title)
  const categorySlug = metadata.categorySlug || slugify(metadata.category)

  if (!slug || !categorySlug || !metadata.title) {
    throw new Error(`Guide ${filePath} requires title, slug, and category metadata`)
  }

  return {
    ...metadata,
    slug,
    categorySlug,
    path: `/${categorySlug}/${slug}`,
    order: Number(metadata.order || 999),
    author: {
      name: metadata.authorName || 'Equipo DashCole',
      description: metadata.authorDescription || ''
    },
    sections: extractSections(body),
    searchText: createSearchText(body),
    html: enhanceMarkdown(body)
  }
}

export const guides = Object.entries(guideSources)
  .map(([filePath, source]) => parseGuide(source, filePath))
  .sort((left, right) => left.order - right.order)

export const guideBySlug = (slug) => guides.find((guide) => guide.slug === slug)
export const guideByPath = (categorySlug, slug) => guides.find((guide) => (
  guide.categorySlug === categorySlug && guide.slug === slug
))
export { resources }
