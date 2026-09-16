<template>
  <main v-if="guide" class="guide-page" :class="{ 'is-api-guide': isApiGuide }">
    <section class="article-hero" :class="{ 'is-installation-guide': guide.categorySlug === 'installation' }">
      <div class="page-width article-hero-inner">
        <nav class="article-breadcrumbs" aria-label="Ruta de navegación">
          <a href="/">Inicio</a>
          <span class="breadcrumb-separator" aria-hidden="true">&gt;</span>
          <RouterLink to="/">Guías</RouterLink>
          <span class="breadcrumb-separator" aria-hidden="true">&gt;</span>
          <RouterLink :to="`/guides/${guide.categorySlug}`">{{ guide.category }}</RouterLink>
          <span class="breadcrumb-separator" aria-hidden="true">&gt;</span>
          <span class="breadcrumb-current" aria-current="page">{{ guide.shortTitle || guide.title }}</span>
        </nav>

        <div class="article-hero-grid">
          <div class="article-hero-copy">
            <div class="article-eyebrow-row">
              <p class="eyebrow">{{ guide.eyebrow }}</p>
              <span v-if="isApiGuide" class="api-lab-badge"><i aria-hidden="true"></i> Laboratorio práctico</span>
            </div>
            <h1>{{ guide.title }}</h1>
            <p class="article-summary">
              <span>{{ guide.summary }}</span>
            </p>
            <div v-if="guide.secondaryUrl" class="article-hero-actions">
              <a v-if="guide.secondaryUrl" class="article-hero-cta is-secondary" :href="guide.secondaryUrl">
                {{ guide.secondaryLabel || 'Abrir la demo' }} <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>

        </div>
      </div>
      <div class="article-hero-slope" aria-hidden="true"></div>
      <div class="article-hero-ribbons" aria-hidden="true"><i></i><i></i><i></i></div>
    </section>

    <div class="page-width article-layout">
      <aside ref="tocElement" class="article-toc" aria-label="En esta página">
        <div v-if="isApiGuide" class="api-toc-progress">
          <span>Progreso del laboratorio</span>
          <strong>{{ completedLabChecks }}/{{ apiLabItems.length }}</strong>
        </div>
        <a
          v-for="section in guide.sections"
          :key="section.id"
          :href="`#${section.id}`"
          :data-section-id="section.id"
          :class="{ 'is-active': activeSectionId === section.id }"
          :aria-current="activeSectionId === section.id ? 'location' : undefined"
        >{{ section.title }}</a>
        <a v-if="guide.secondaryUrl" class="toc-cta toc-cta-secondary" :href="guide.secondaryUrl">{{ guide.secondaryLabel || 'Abrir la demo' }} <span aria-hidden="true">›</span></a>
      </aside>

      <article class="article-body" @click="handleMarkdownClick">
        <section v-if="isApiGuide" class="api-lab-panel" aria-labelledby="api-lab-title">
          <div class="api-lab-panel-head">
            <div>
              <span>Espacio de ejemplo</span>
              <h2 id="api-lab-title">Constrúyelo mientras lees</h2>
              <p>Prepara tu entorno local, copia cada ejemplo, ejecútalo y compara la respuesta antes de continuar.</p>
            </div>
            <button type="button" class="api-lab-start" @click="startApiLab">
              Empezar el laboratorio <span aria-hidden="true">↓</span>
            </button>
          </div>

          <div class="api-lab-meter" aria-hidden="true">
            <i :style="{ width: `${labProgress}%` }"></i>
          </div>

          <div class="api-lab-checks" aria-label="Lista de preparación del laboratorio">
            <button
              v-for="item in apiLabItems"
              :key="item.id"
              type="button"
              :class="{ 'is-complete': labChecks.has(item.id) }"
              :aria-pressed="labChecks.has(item.id)"
              @click="toggleLabCheck(item.id)"
            >
              <i aria-hidden="true">{{ labChecks.has(item.id) ? '✓' : '' }}</i>
              <span><strong>{{ item.label }}</strong><small>{{ item.hint }}</small></span>
            </button>
          </div>
        </section>

        <div class="markdown-body" v-html="guide.html"></div>

        <div class="article-end">
          <img :src="logoUrl" :srcset="logoSrcset" alt="" class="brand-logo" width="34" height="34" loading="lazy" decoding="async" />
          <div>
            <strong>{{ isApiGuide ? 'Completaste el laboratorio.' : 'Listo para continuar.' }}</strong>
            <p>{{ isApiGuide ? 'Adapta el ejemplo a tu entorno y mantén el manejo de errores.' : 'Guarda esta guía a mano mientras instalas o administras DashCole.' }}</p>
          </div>
        </div>

        <nav class="guide-pagination" aria-label="Paginación de guías">
          <div class="guide-pagination-heading">
            <span>Seguir aprendiendo</span>
            <strong>Guía {{ currentGuideIndex + 1 }} de {{ guides.length }}</strong>
          </div>

          <div class="guide-pagination-links" :class="{ 'has-next-only': !previousGuide, 'has-previous-only': !nextGuide }">
            <RouterLink v-if="previousGuide" class="guide-page-link is-previous" :to="previousGuide.path">
              <span class="guide-page-direction"><b aria-hidden="true">←</b><span>Guía anterior</span></span>
              <span class="guide-page-copy">
                <small>{{ previousGuide.category }} · {{ previousGuide.duration }} de lectura</small>
                <strong>{{ previousGuide.shortTitle || previousGuide.title }}</strong>
              </span>
            </RouterLink>

            <RouterLink v-if="nextGuide" class="guide-page-link is-next" :to="nextGuide.path">
              <span class="guide-page-direction"><span>Siguiente guía</span><b aria-hidden="true">→</b></span>
              <span class="guide-page-copy">
                <small>{{ nextGuide.category }} · {{ nextGuide.duration }} de lectura</small>
                <strong>{{ nextGuide.shortTitle || nextGuide.title }}</strong>
              </span>
            </RouterLink>
          </div>

        </nav>
      </article>
    </div>

    <button
      v-show="showBackToTop"
      type="button"
      class="back-to-top"
      aria-label="Volver arriba"
      @click="scrollToTop"
    >↑</button>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { guideByPath, guides } from '../content'
import { logoSrcset, logoUrl } from '../brandAssets'

const route = useRoute()
const router = useRouter()
const guide = computed(() => guideByPath(route.params.category, route.params.slug))
const isApiGuide = computed(() => guide.value?.categorySlug === 'apis')
const apiLabItems = [
  { id: 'server', label: 'Servidor en marcha', hint: 'localhost responde' },
  { id: 'client', label: 'Cliente instalado', hint: 'el SDK importa o compila' },
  { id: 'workspace', label: 'Proyecto de prueba listo', hint: 'solo datos de prueba' }
]
const labChecks = ref(new Set())
const completedLabChecks = computed(() => labChecks.value.size)
const labProgress = computed(() => Math.round((completedLabChecks.value / apiLabItems.length) * 100))
const currentGuideIndex = computed(() => guides.findIndex((item) => item.path === guide.value?.path))
const activeSectionId = ref('')
const tocElement = ref(null)
const showBackToTop = ref(false)
let sectionHeadings = []
let sectionScrollFrame
const previousGuide = computed(() => currentGuideIndex.value > 0 ? guides[currentGuideIndex.value - 1] : null)
const nextGuide = computed(() => (
  currentGuideIndex.value >= 0 && currentGuideIndex.value < guides.length - 1
    ? guides[currentGuideIndex.value + 1]
    : null
))

const updateBackToTop = () => {
  showBackToTop.value = window.scrollY > 420
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  updateBackToTop()
  window.addEventListener('scroll', updateBackToTop, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateBackToTop)
})
let mermaidInstance
let jointDiagramCleanups = []

const toggleLabCheck = (id) => {
  const nextChecks = new Set(labChecks.value)
  if (nextChecks.has(id)) nextChecks.delete(id)
  else nextChecks.add(id)
  labChecks.value = nextChecks
}

const startApiLab = () => {
  const firstBuildSection = guide.value?.sections.find((section) => /^1\./.test(section.title))
  const target = firstBuildSection ? document.getElementById(firstBuildSection.id) : null
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const createJointNode = (shapes, graph, {
  title,
  detail,
  fill,
  stroke,
  text = '#0a2540'
}) => {
  const node = new shapes.standard.Rectangle()
  node.resize(180, 82)
  node.attr({
    body: {
      fill,
      stroke,
      strokeWidth: 1.5,
      rx: 14,
      ry: 14,
      filter: {
        name: 'dropShadow',
        args: { dx: 0, dy: 5, blur: 8, color: '#0a2540', opacity: 0.11 }
      }
    },
    label: {
      text: `${title}\n${detail}`,
      fill: text,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: 13,
      fontWeight: 750,
      lineHeight: 20,
      textVerticalAnchor: 'middle',
      textAnchor: 'middle'
    }
  })
  node.addTo(graph)
  return node
}

const createJointLink = (shapes, graph, source, target, label) => {
  const link = new shapes.standard.Link()
  link.source(source)
  link.target(target)
  link.router('orthogonal', { padding: 18 })
  link.connector('rounded', { radius: 10 })
  link.attr({
    line: {
      class: 'timer-flow-line',
      stroke: '#60758a',
      strokeWidth: 1.7,
      strokeDasharray: '7 5',
      sourceMarker: { type: 'none' },
      targetMarker: {
        type: 'path',
        d: 'M 9 -5 0 0 9 5 z',
        fill: '#60758a',
        stroke: 'none'
      }
    }
  })
  link.appendLabel({
    position: { distance: 0.5, offset: -15 },
    attrs: {
      rect: {
        fill: '#ffffff',
        stroke: '#d5e0ea',
        strokeWidth: 1,
        rx: 8,
        ry: 8
      },
      text: {
        text: label,
        fill: '#52677b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 9.5,
        fontWeight: 700,
        lineHeight: 11.5
      }
    }
  })
  link.addTo(graph)
  link.toBack()
  return link
}

const mountTimerDiagram = async (container, joint) => {
  const { dia, shapes } = joint
  const canvas = document.createElement('div')
  canvas.className = 'joint-diagram-canvas'
  container.replaceChildren(canvas)
  const graph = new dia.Graph({}, { cellNamespace: shapes })
  const paper = new dia.Paper({
    el: canvas,
    model: graph,
    width: container.clientWidth || 680,
    height: 330,
    gridSize: 10,
    drawGrid: {
      name: 'dot',
      args: { color: '#d8e2ec', thickness: 1 }
    },
    background: { color: '#fbfdff' },
    cellViewNamespace: shapes,
    async: false,
    interactive: {
      elementMove: true,
      linkMove: false,
      labelMove: false,
      arrowheadMove: false,
      vertexAdd: false,
      vertexMove: false,
      vertexRemove: false
    }
  })

  const mainLoop = createJointNode(shapes, graph, {
    title: 'hlquery main loop',
    detail: 'core scheduler',
    fill: '#0a2540',
    stroke: '#0a2540',
    text: '#ffffff'
  })
  const callback = createJointNode(shapes, graph, {
    title: 'OnEveryOneMinute()',
    detail: 'module callback',
    fill: '#eaf2ff',
    stroke: '#6ea0eb'
  })
  const runTask = createJointNode(shapes, graph, {
    title: 'RunTask()',
    detail: 'overlap guarded',
    fill: '#f1ebff',
    stroke: '#9b7ce8'
  })
  const writeLog = createJointNode(shapes, graph, {
    title: 'Write log',
    detail: 'observable run',
    fill: '#effbf6',
    stroke: '#68c5a0'
  })
  const counters = createJointNode(shapes, graph, {
    title: 'Update counters',
    detail: 'runs + last_run_ms',
    fill: '#fff6e9',
    stroke: '#e8ad5e'
  })

  const minuteLink = createJointLink(
    shapes,
    graph,
    mainLoop,
    callback,
    'once per\nwall-clock\nminute'
  )
  const intervalLink = createJointLink(
    shapes,
    graph,
    callback,
    runTask,
    'every\nconfigured\ninterval'
  )
  createJointLink(shapes, graph, runTask, writeLog, 'log')
  createJointLink(shapes, graph, runTask, counters, 'count')

  const applyLayout = () => {
    const width = Math.max(300, Math.floor(container.clientWidth || 680))
    const isCompact = width < 640

    if (isCompact) {
      const primaryWidth = Math.min(250, width - 32)
      const primaryX = Math.round((width - primaryWidth) / 2)
      const outputGap = 10
      const outputWidth = Math.floor((width - 32 - outputGap) / 2)

      paper.setDimensions(width, 550)
      mainLoop.resize(primaryWidth, 78).position(primaryX, 22)
      callback.resize(primaryWidth, 78).position(primaryX, 150)
      runTask.resize(primaryWidth, 78).position(primaryX, 278)
      writeLog.resize(outputWidth, 72).position(16, 445)
      counters.resize(outputWidth, 72).position(16 + outputWidth + outputGap, 445)
      minuteLink.label(0, { position: { distance: 0.5, offset: 0 } })
      intervalLink.label(0, { position: { distance: 0.5, offset: 0 } })
    } else {
      const primaryWidth = Math.min(185, Math.floor((width - 72) / 3))
      const gap = Math.floor((width - (primaryWidth * 3)) / 4)
      const outputWidth = Math.min(155, Math.floor((width - 52) / 2))

      paper.setDimensions(width, 330)
      mainLoop.resize(primaryWidth, 82).position(gap, 52)
      callback.resize(primaryWidth, 82).position((gap * 2) + primaryWidth, 52)
      runTask.resize(primaryWidth, 82).position((gap * 3) + (primaryWidth * 2), 52)
      writeLog.resize(outputWidth, 72).position(width - (outputWidth * 2) - 32, 220)
      counters.resize(outputWidth, 72).position(width - outputWidth - 16, 220)
      minuteLink.label(0, { position: { distance: 0.5, offset: -15 } })
      intervalLink.label(0, { position: { distance: 0.5, offset: -15 } })
    }
  }

  applyLayout()
  const resizeObserver = new ResizeObserver(applyLayout)
  resizeObserver.observe(container)

  return () => {
    resizeObserver.disconnect()
    paper.stopListening()
    graph.clear()
    container.replaceChildren()
  }
}

const mountApiClientDiagram = async (container, joint, diagramName) => {
  const { dia, shapes } = joint
  const diagram = {
    'php-api-client': {
      application: 'PHP application',
      client: 'Hlquery\\Client',
      services: 'collections()\ndocuments()\nsql() · modules()\nhealth() · stats()'
    },
    'perl-api-client': {
      application: 'Perl application',
      client: 'Hlquery::Client',
      services: 'Collections()\nDocuments()\nSearchAPI()\nHealth() · Stats()'
    },
    'cpp-api-client': {
      application: 'C++ application',
      client: 'hlquery::Client',
      services: 'collections()\ndocuments()\nsearchApi()\nhealth() · stats()'
    },
    'rust-api-client': {
      application: 'Async Rust service',
      client: 'hlquery_rust_client::Client',
      services: 'collections()\ndocuments()\nsearch_api()\nhealth() · stats()'
    },
    'python-api-client': {
      application: 'Python application',
      client: 'lib.Client',
      services: 'collections\ndocuments\nsearch_api() · keys_api()\nhealth() · stats()'
    },
    'go-api-client': {
      application: 'Go application',
      client: 'hlquery.NewClient',
      services: 'Collections()\nDocuments()\nSearch()\nHealth() · Stats()'
    },
    'java-api-client': {
      application: 'Java application',
      client: 'hlquery.Client',
      services: 'collections()\ndocuments()\nsearchApi()\nhealth() · stats()'
    },
    'bm25-plus-flow': {
      application: 'Search query',
      applicationDetail: 'running shoes',
      client: 'Candidate documents',
      clientDetail: 'lexical matches',
      services: 'IDF · term frequency\nlength normalization\ndelta floor',
      serviceTitle: 'BM25+ signals',
      apiTitle: 'Ranked results',
      apiDetail: 'score → order',
      linkLabels: ['matches', 'scores', 'ranks']
    },
    'installation-flow': {
      application: 'Source or Docker setup',
      applicationDetail: 'starting point',
      client: 'Build + runtime',
      clientDetail: 'dependencies + staging',
      serviceTitle: 'hlquery server',
      services: 'hlqueryd\nRocksDB\nrun/conf · run/data\nlogs · modules',
      apiTitle: 'Verified local service',
      apiDetail: 'health + index + search'
    },
    'configuration-flow': {
      application: 'hlquery.conf',
      applicationDetail: 'root configuration',
      client: 'Included files',
      clientDetail: 'loaded in order',
      serviceTitle: 'Runtime settings',
      services: 'search.conf\nmodules.conf\nlinks.conf\nlimits + storage',
      apiTitle: 'Running server',
      apiDetail: 'merged configuration'
    },
    'vector-search-flow': {
      application: 'Search query',
      applicationDetail: 'text + optional filters',
      client: 'Embedding model',
      clientDetail: 'query vector',
      serviceTitle: 'Vector index',
      services: 'float[] embeddings\nnearest neighbors\nkeyword + vector signals',
      apiTitle: 'Ranked results',
      apiDetail: 'similarity + filters',
      linkLabels: ['encodes', 'retrieves', 'ranks']
    }
  }[diagramName] || {
    application: 'Application',
    client: 'hlquery client',
    services: 'collections\ndocuments\nsearch\noperations'
  }
  const canvas = document.createElement('div')
  canvas.className = 'joint-diagram-canvas'
  container.replaceChildren(canvas)

  const graph = new dia.Graph({}, { cellNamespace: shapes })
  const paper = new dia.Paper({
    el: canvas,
    model: graph,
    width: container.clientWidth || 680,
    height: 390,
    gridSize: 10,
    drawGrid: {
      name: 'dot',
      args: { color: '#d8e2ec', thickness: 1 }
    },
    background: { color: '#fbfdff' },
    cellViewNamespace: shapes,
    async: false,
    interactive: {
      elementMove: true,
      linkMove: false,
      labelMove: false,
      arrowheadMove: false,
      vertexAdd: false,
      vertexMove: false,
      vertexRemove: false
    }
  })

  const application = createJointNode(shapes, graph, {
    title: diagram.application,
    detail: diagram.applicationDetail || 'your integration',
    fill: '#0a2540',
    stroke: '#0a2540',
    text: '#ffffff'
  })
  const client = createJointNode(shapes, graph, {
    title: diagram.client,
    detail: diagram.clientDetail || 'auth + transport',
    fill: '#eaf2ff',
    stroke: '#6ea0eb'
  })
  const services = createJointNode(shapes, graph, {
    title: diagram.serviceTitle || 'Client services',
    detail: diagram.services,
    fill: '#f1ebff',
    stroke: '#9b7ce8'
  })
  const httpApi = createJointNode(shapes, graph, {
    title: diagram.apiTitle || 'hlquery HTTP API',
    detail: diagram.apiDetail || 'JSON requests',
    fill: '#effbf6',
    stroke: '#68c5a0'
  })

  const linkLabels = diagram.linkLabels || ['uses', 'delegates', 'HTTP + JSON']
  const clientLink = createJointLink(shapes, graph, application, client, linkLabels[0])
  const servicesLink = createJointLink(shapes, graph, client, services, linkLabels[1])
  const apiLink = createJointLink(shapes, graph, services, httpApi, linkLabels[2])

  const applyLayout = () => {
    const width = Math.max(300, Math.floor(container.clientWidth || 680))
    const isCompact = width < 640

    if (isCompact) {
      const nodeWidth = Math.min(270, width - 40)
      const nodeX = Math.round((width - nodeWidth) / 2)

      paper.setDimensions(width, 590)
      application.resize(nodeWidth, 76).position(nodeX, 20)
      client.resize(nodeWidth, 76).position(nodeX, 138)
      services.resize(nodeWidth, 150).position(nodeX, 256)
      httpApi.resize(nodeWidth, 82).position(nodeX, 482)
      clientLink.label(0, { position: { distance: 0.5, offset: 0 } })
      servicesLink.label(0, { position: { distance: 0.5, offset: 0 } })
      apiLink.label(0, { position: { distance: 0.5, offset: 0 } })
    } else {
      const sidePadding = 18
      const appWidth = 160
      const clientWidth = 170
      const serviceWidth = 190
      const firstGap = Math.max(40, Math.floor((width - appWidth - clientWidth - serviceWidth - (sidePadding * 2)) / 2))
      const appX = sidePadding
      const clientX = appX + appWidth + firstGap
      const serviceX = width - serviceWidth - sidePadding

      paper.setDimensions(width, 390)
      application.resize(appWidth, 82).position(appX, 78)
      client.resize(clientWidth, 82).position(clientX, 78)
      services.resize(serviceWidth, 152).position(serviceX, 42)
      httpApi.resize(serviceWidth, 82).position(serviceX, 274)
      clientLink.label(0, { position: { distance: 0.5, offset: -15 } })
      servicesLink.label(0, { position: { distance: 0.5, offset: -15 } })
      apiLink.label(0, { position: { distance: 0.5, offset: 0 } })
    }
  }

  applyLayout()
  const resizeObserver = new ResizeObserver(applyLayout)
  resizeObserver.observe(container)

  return () => {
    resizeObserver.disconnect()
    paper.stopListening()
    graph.clear()
    container.replaceChildren()
  }
}

const renderJointDiagrams = async () => {
  jointDiagramCleanups.forEach((cleanup) => cleanup())
  jointDiagramCleanups = []

  const containers = document.querySelectorAll(
    '.article-body .joint-diagram-paper[data-joint-diagram]'
  )
  if (!containers.length) return

  const joint = await import('@joint/core')
  const cleanups = await Promise.all(
    Array.from(containers, (container) => {
      const diagramName = container.dataset.jointDiagram
      return diagramName === 'module-timer'
        ? mountTimerDiagram(container, joint)
        : mountApiClientDiagram(container, joint, diagramName)
    })
  )
  jointDiagramCleanups.push(...cleanups)
}

const renderDiagrams = async () => {
  await nextTick()

  await renderJointDiagrams()

  const nodes = document.querySelectorAll('.article-body .mermaid:not([data-processed])')
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

const stopSectionObserver = () => {
  window.removeEventListener('scroll', handleSectionScroll)
  window.removeEventListener('resize', handleSectionScroll)
  if (sectionScrollFrame) window.cancelAnimationFrame(sectionScrollFrame)
  sectionScrollFrame = undefined
  sectionHeadings = []
}

const updateActiveSection = () => {
  sectionScrollFrame = undefined
  if (!sectionHeadings.length) return

  const activationLine = 132
  let activeHeading = sectionHeadings[0]

  for (const heading of sectionHeadings) {
    if (heading.getBoundingClientRect().top > activationLine) break
    activeHeading = heading
  }

  activeSectionId.value = activeHeading.id
}

const handleSectionScroll = () => {
  if (sectionScrollFrame) return
  sectionScrollFrame = window.requestAnimationFrame(updateActiveSection)
}

const keepActiveTocLinkVisible = async (sectionId) => {
  await nextTick()
  const toc = tocElement.value
  if (!toc || window.matchMedia('(max-width: 720px)').matches) return

  const activeLink = Array.from(toc.querySelectorAll('[data-section-id]'))
    .find((link) => link.dataset.sectionId === sectionId)
  if (!activeLink) return

  const tocRect = toc.getBoundingClientRect()
  const linkRect = activeLink.getBoundingClientRect()
  const safeTop = tocRect.top + 24
  const safeBottom = tocRect.bottom - 24
  if (linkRect.top >= safeTop && linkRect.bottom <= safeBottom) return

  const targetTop = toc.scrollTop + linkRect.top - tocRect.top - (toc.clientHeight - linkRect.height) / 2
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  toc.scrollTo({ top: Math.max(0, targetTop), behavior: reduceMotion ? 'auto' : 'smooth' })
}

const observeGuideSections = async () => {
  stopSectionObserver()
  activeSectionId.value = guide.value?.sections[0]?.id || ''
  await nextTick()

  sectionHeadings = Array.from(document.querySelectorAll('.article-body .markdown-body > h2[id]'))
  if (!sectionHeadings.length) return

  window.addEventListener('scroll', handleSectionScroll, { passive: true })
  window.addEventListener('resize', handleSectionScroll, { passive: true })
  updateActiveSection()
}

watchEffect(() => {
  if (!guide.value) router.replace('/')
})

watch(guide, renderDiagrams, { immediate: true })
watch(guide, observeGuideSections, { immediate: true })
watch(activeSectionId, keepActiveTocLinkVisible)
watch(guide, () => {
  labChecks.value = new Set()
})

onBeforeUnmount(() => {
  stopSectionObserver()
  jointDiagramCleanups.forEach((cleanup) => cleanup())
  jointDiagramCleanups = []
})

const handleMarkdownClick = async (event) => {
  const button = event.target.closest('.markdown-copy')
  if (!button) return

  const codeElement = button.closest('.markdown-code-block')?.querySelector('code')
  const terminalLines = codeElement ? Array.from(codeElement.querySelectorAll('.terminal-line')) : []
  const code = terminalLines.length > 0
    ? terminalLines.map((line) => line.textContent || '').join('\n')
    : codeElement?.textContent
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    button.textContent = 'Copied'
    window.setTimeout(() => {
      button.textContent = 'Copy'
    }, 1600)
  } catch {
    button.textContent = 'Copy failed'
  }
}
</script>
