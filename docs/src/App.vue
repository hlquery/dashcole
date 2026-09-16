<template>
  <div class="docs-shell">
    <header class="google-header">
      <div class="google-header-main">
        <a class="google-brand" href="/" @click.prevent="go('overview')"><img :src="logoUrl" :srcset="logoSrcset" alt="" class="docs-brand-logo" width="34" height="34" decoding="async" /><span class="google-name">hlquery</span><span class="google-section">DOCS</span></a>
        <div class="developers-dropdown" :class="{ 'is-open': developersOpen }" @mouseenter="developersOpen = true" @mouseleave="developersOpen = false" @focusin="developersOpen = true" @focusout="closeDevelopersOnFocusOut">
          <button class="developers-trigger" type="button" aria-haspopup="true" :aria-expanded="developersOpen" @click="developersOpen = !developersOpen" @keydown.escape="developersOpen = false">
            <span>Developers</span><span class="developers-chevron">⌄</span>
          </button>
          <div class="developers-menu">
            <span class="developers-menu-label">Resources</span>
            <a href="https://www.hlquery.com/"><span class="developers-menu-icon is-home"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.5 9.5V20h13V9.5M9.5 20v-6h5v6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span><span><strong>Home</strong><small>Explore the hlquery platform</small></span></a>
            <a :href="guidesUrl"><span class="developers-menu-icon is-guides"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 5.5v15M9 7h6M9 10.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></span><span><strong>Guides</strong><small>Practical guides and workflows</small></span></a>
            <a href="https://github.com/hlquery/hlquery" target="_blank" rel="noreferrer"><span class="developers-menu-icon is-github"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.71c-2.73.59-3.31-1.16-3.31-1.16-.45-1.14-1.09-1.44-1.09-1.44-.89-.61.07-.6.07-.6.99.07 1.5 1.01 1.5 1.01.88 1.5 2.3 1.07 2.86.82.09-.63.34-1.07.62-1.32-2.18-.25-4.47-1.09-4.47-4.82 0-1.07.38-1.94 1.01-2.62-.1-.25-.44-1.24.1-2.58 0 0 .82-.26 2.68 1a9.3 9.3 0 0 1 4.88 0c1.86-1.26 2.68-1 2.68-1 .54 1.34.2 2.33.1 2.58.63.68.66.9.66 1.82v2.7c0 .26.18.57.67.47A9.75 9.75 0 0 0 12 2.5Z"/></svg></span><span><strong>GitHub</strong><small>Source code and releases</small></span></a>
            <a href="https://blog.hlquery.com" target="_blank" rel="noreferrer"><span class="developers-menu-icon is-blog"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><strong>Blog</strong><small>Product news and engineering</small></span></a>
            <a href="https://demo.hlquery.com/" target="_blank" rel="noreferrer"><span class="developers-menu-icon is-demo"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3 8h18" stroke="currentColor" stroke-width="1.8"/><path d="m10 11 5 3-5 3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></span><span><strong>Live demo</strong><small>Try hlquery in the browser</small></span></a>
            <a href="https://www.hlquery.com/faq" target="_blank" rel="noreferrer"><span class="developers-menu-icon is-faq"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M9.8 9.2a2.35 2.35 0 1 1 3.1 2.23c-.9.34-.9 1.02-.9 1.57" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.7" r="1" fill="currentColor"/></svg></span><span><strong>FAQ</strong><small>Answers from hlquery.com</small></span></a>
          </div>
        </div>
        <label class="search-box"><span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" stroke-width="2"/><path d="m16 16 4.6 4.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><input v-model="query" type="search" placeholder="Search" @focus="searchOpen = true" @input="searchSelection = 0" @keydown="handleSearchKeydown" /><kbd>⌘ K</kbd><div v-if="searchOpen && query.trim() && searchResults.length" class="search-suggestions"><span class="suggestions-label">Suggestions</span><button v-for="(result, index) in searchResults" :key="result.id" type="button" :class="{ 'is-selected': index === searchSelection }" @mouseenter="searchSelection = index" @click="go(result.id)"><strong>{{ result.title }}</strong><small>{{ result.summary }}</small></button></div></label>
        <button class="mobile-menu" type="button" aria-label="Toggle navigation" @click="mobileOpen = !mobileOpen">☰</button>
      </div>
    </header>

    <div class="docs-layout">
      <aside class="sidebar" :class="{ 'is-open': mobileOpen }">
        <div v-for="group in navGroups" :key="group.label" class="nav-group">
          <div class="nav-label">{{ group.label }}</div>
          <a v-for="item in group.items" :key="item.id" :href="`/${item.id}`" :class="{ active: pageId === item.id }" @click.prevent="go(item.id)">
            <span class="nav-icon">{{ item.icon }}</span>{{ item.label }}
          </a>
        </div>
      </aside>

      <main class="content">
        <div class="docs-page-card">
          <div class="docs-main-column">
            <section class="page-hero">
              <div class="breadcrumbs"><a href="/overview" @click.prevent="go('overview')">Home</a><b>›</b><span>hlquery</span><b>›</b><span>hlquery API</span><b>›</b><strong>{{ currentPage.label }}</strong></div>
              <div class="hero-grid"><div><span class="eyebrow">{{ currentPage.eyebrow }}</span><h1>{{ currentPage.title }}</h1><p>{{ currentPage.summary }}</p></div></div>
            </section>

            <div class="reading-layout">
              <article class="article" @click="copyFromClick">
                <div class="markdown-body" v-html="currentPage.html"></div>
                <footer class="article-footer"><span>hlquery Docs</span><span>Last updated July 2026</span></footer>
              </article>
            </div>
          </div>
          <aside class="on-page hero-on-page"><span>On this page</span><a v-for="heading in headings" :key="heading.id" :class="{ active: activeHeading === heading.id }" :href="`#${heading.id}`">{{ heading.label }}</a></aside>
        </div>
      </main>
    </div>
    <button v-if="showScrollTop" class="scroll-top" type="button" aria-label="Scroll up" @click="scrollToTop">↑<span>Top</span></button>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { pageById, pageHeadings, pages } from './content'
import { trackDocsVisit } from './analytics'
import { logoSrcset, logoUrl } from './brandAssets'

const query = ref('')
const pageFromLocation = () => {
  const legacyId = window.location.hash.startsWith('#/') ? window.location.hash.slice(2) : ''
  const pathId = window.location.pathname.replace(/^\/+|\/+$/g, '')
  const id = pathId || legacyId || 'overview'
  if (legacyId && !pathId) window.history.replaceState({}, '', `/${legacyId}`)
  return id
}
const pageId = ref(pageFromLocation())
const mobileOpen = ref(false)
const developersOpen = ref(false)
const showScrollTop = ref(false)
const searchSelection = ref(0)
const searchOpen = ref(false)
const guidesUrl = import.meta.env.DEV ? 'http://localhost:5176/' : 'https://guias.hlquery.com/'
let mermaidInstance
let jointDiagramCleanups = []
const activeHeading = ref('')
let headingObserver

const currentPage = computed(() => pageById(pageId.value))
const headings = computed(() => pageHeadings(currentPage.value))
const searchResults = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return []
  return pages.filter((page) => `${page.title} ${page.summary} ${page.label} ${page.searchText}`.toLowerCase().includes(term)).slice(0, 6)
})
const navGroups = computed(() => [
  { label: 'Get started', items: pages.filter((page) => page.id === 'overview').map((page) => ({ ...page, icon: '⌂' })) },
  { label: 'API reference', items: pages.filter((page) => ['collections', 'documents', 'search'].includes(page.id)).map((page) => ({ ...page, icon: page.id === 'collections' ? '▦' : page.id === 'documents' ? '▤' : '⌕' })) },
  { label: 'How-to guides', items: pages.filter((page) => page.id === 'merge').map((page) => ({ ...page, icon: '✦' })) },
  { label: 'Operations', items: pages.filter((page) => page.id === 'operations').map((page) => ({ ...page, icon: '◌' })) }
].filter((group) => group.items.length))

function go(id) {
  pageId.value = id
  query.value = ''
  searchOpen.value = false
  mobileOpen.value = false
  if (window.location.pathname !== `/${id}`) window.history.pushState({}, '', `/${id}`)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function jumpToResult() {
  if (searchResults.value[searchSelection.value]) go(searchResults.value[searchSelection.value].id)
}

function handleSearchKeydown(event) {
  if (!searchResults.value.length) {
    if (event.key === 'Enter') jumpToResult()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    searchSelection.value = Math.min(searchSelection.value + 1, searchResults.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    searchSelection.value = Math.max(searchSelection.value - 1, 0)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    jumpToResult()
  } else if (event.key === 'Escape') {
    searchOpen.value = false
    searchSelection.value = 0
  }
}

function closeSearchOnOutsideClick(event) {
  if (!event.target.closest('.search-box')) searchOpen.value = false
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 420
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function renderJointDiagrams() {
  jointDiagramCleanups.forEach((cleanup) => cleanup())
  jointDiagramCleanups = []
  const containers = document.querySelectorAll('.markdown-body .joint-diagram-paper[data-joint-diagram]')
  if (!containers.length) return

  const joint = await import('@joint/core')
  const { dia, shapes } = joint
  const cleanups = Array.from(containers, (container) => {
    const width = Math.max(560, Math.floor(container.clientWidth || 680))
    const canvas = document.createElement('div')
    canvas.className = 'joint-diagram-canvas'
    container.replaceChildren(canvas)
    const graph = new dia.Graph({}, { cellNamespace: shapes })
    const paper = new dia.Paper({
      el: canvas,
      model: graph,
      width,
      height: 300,
      gridSize: 10,
      drawGrid: { name: 'dot', args: { color: '#d8e2ec', thickness: 1 } },
      background: { color: '#fbfdff' },
      cellViewNamespace: shapes,
      interactive: { elementMove: true, linkMove: false, labelMove: false, arrowheadMove: false, vertexAdd: false, vertexMove: false, vertexRemove: false }
    })
    const makeNode = (title, detail, fill, stroke, text = '#0a2540') => {
      const node = new shapes.standard.Rectangle()
      node.resize(160, 76)
      node.attr({ body: { fill, stroke, strokeWidth: 1.5, rx: 14, ry: 14 }, label: { text: `${title}\n${detail}`, fill: text, fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 650, lineHeight: 18 } })
      node.addTo(graph)
      return node
    }
    const makeLink = (source, target, label) => {
      const link = new shapes.standard.Link({ source: { id: source.id }, target: { id: target.id }, attrs: { line: { stroke: '#8ca3b8', strokeWidth: 1.5, targetMarker: { type: 'path', d: 'M 8 -4 0 0 8 4 z' } } } })
      link.appendLabel({ attrs: { text: { text: label, fill: '#52677b', fontSize: 10, fontWeight: 650 }, rect: { fill: '#fff', stroke: 'none' } } })
      link.addTo(graph)
      link.toBack()
    }
    const app = makeNode('Application', 'your integration', '#0a2540', '#0a2540', '#fff')
    const client = makeNode('hlquery client', 'auth + transport', '#eaf2ff', '#6ea0eb')
    const services = makeNode('Client services', 'collections · documents\nsearch · operations', '#f1ebff', '#9b7ce8')
    const api = makeNode('hlquery HTTP API', 'JSON requests', '#effbf6', '#68c5a0')
    app.position(18, 100)
    client.position(Math.max(200, Math.floor(width / 3) - 70), 100)
    services.position(Math.max(370, Math.floor(width * .57)), 48)
    api.position(Math.max(370, Math.floor(width * .57)), 190)
    makeLink(app, client, 'uses')
    makeLink(client, services, 'delegates')
    makeLink(services, api, 'HTTP + JSON')
    const resizeObserver = new ResizeObserver(() => paper.setDimensions(Math.max(560, Math.floor(container.clientWidth || 680)), 300))
    resizeObserver.observe(container)
    return () => { resizeObserver.disconnect(); paper.stopListening(); graph.clear(); container.replaceChildren() }
  })
  jointDiagramCleanups.push(...cleanups)
}

async function renderDiagrams() {
  await nextTick()
  await renderJointDiagrams()
  const nodes = document.querySelectorAll('.markdown-body .mermaid:not([data-processed])')
  if (!nodes.length) return

  if (!mermaidInstance) {
    const { default: mermaid } = await import('mermaid')
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      flowchart: { curve: 'basis', htmlLabels: true },
      themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        primaryColor: '#eef5ff',
        primaryTextColor: '#0a2540',
        primaryBorderColor: '#8bb5ff',
        lineColor: '#71869a',
        secondaryColor: '#effbf6',
        tertiaryColor: '#f5f1ff',
        edgeLabelBackground: '#ffffff'
      }
    })
    mermaidInstance = mermaid
  }

  await mermaidInstance.run({ nodes, suppressErrors: true })
}

async function observeHeadings() {
  await nextTick()
  headingObserver?.disconnect()
  const nodes = Array.from(document.querySelectorAll('.markdown-body h2[id]'))
  activeHeading.value = nodes[0]?.id || ''
  if (!nodes.length || !('IntersectionObserver' in window)) return

  headingObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)
    if (visible[0]) activeHeading.value = visible[0].target.id
  }, { rootMargin: '-110px 0px -64% 0px', threshold: [0, 1] })
  nodes.forEach((node) => headingObserver.observe(node))
}

function onPathChange() {
  pageId.value = pageFromLocation()
  trackDocsVisit(window.location.pathname)
}

function closeDevelopersOnFocusOut(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return
  developersOpen.value = false
}

function copyFromClick(event) {
  const button = event.target.closest('[data-copy]')
  if (!button) return
  navigator.clipboard?.writeText(button.dataset.copy || '')
  button.textContent = 'Copied'
  setTimeout(() => { button.textContent = 'Copy' }, 1100)
}

onMounted(() => {
  trackDocsVisit(window.location.pathname)
  renderDiagrams()
  observeHeadings()
  window.addEventListener('popstate', onPathChange)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('pointerdown', closeSearchOnOutsideClick)
  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      document.querySelector('.search-box input')?.focus()
    }
  })
})

watch(pageId, () => {
  renderDiagrams()
  observeHeadings()
})

onUnmounted(() => {
  window.removeEventListener('popstate', onPathChange)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('pointerdown', closeSearchOnOutsideClick)
  headingObserver?.disconnect()
  jointDiagramCleanups.forEach((cleanup) => cleanup())
  jointDiagramCleanups = []
})
</script>
