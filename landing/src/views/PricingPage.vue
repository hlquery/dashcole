<template>
  <div class="pricing-page">
    <Header
      :force-transparent-header="true"
      :force-header-background-color="'#f9fafc'"
      hero-bg-color="#f9fafc"
    />

    <main class="pricing-main">
      <section class="hero-block">
        <h1>{{ pricingI18n.heroTitle }}</h1>
        <p>{{ pricingI18n.heroDescription }}</p>
      </section>
      <section class="plan-block">
        <section class="plan-grid">
        <article class="plan-card plan-card-standard card-surface">
          <div class="plan-card-content">
            <div class="plan-card-copy">
              <p class="plan-label plan-label-with-icon plan-label-starter">
                <span class="plan-tier-emoji" aria-hidden="true">🚀</span>
                <span>{{ pricingI18n.plans.starter.label }}</span>
              </p>
              <h2>{{ pricingI18n.plans.starter.title }}</h2>
              <p class="plan-subcopy">{{ pricingI18n.plans.starter.description }}</p>
            </div>
            <div class="plan-card-cta">
              <a href="/contact" class="primary-cta">
                {{ pricingI18n.plans.starter.cta }}
                <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>
          <div class="plan-card-footer">
            <p class="price-number">Plataforma educativa esencial</p>
            <ul class="plan-highlights">
              <li v-for="item in starterHighlights" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>

        <article class="plan-card plan-card-growth card-surface">
          <div class="plan-card-content">
            <div class="plan-card-copy">
              <p class="plan-label plan-label-with-icon plan-label-growth">
                <span class="plan-tier-emoji" aria-hidden="true">🌱</span>
                <span>{{ pricingI18n.plans.growth.label }}</span>
              </p>
              <h2>{{ pricingI18n.plans.growth.title }}</h2>
              <p class="plan-subcopy">{{ pricingI18n.plans.growth.description }}</p>
            </div>
            <div class="plan-card-cta">
              <a href="/contact" class="secondary-cta">
                {{ pricingI18n.plans.growth.cta }}
                <span aria-hidden="true">›</span>
              </a>
            </div>
          </div>
          <div class="plan-card-footer">
            <p class="price-number">Implementación personalizada</p>
            <ul class="plan-highlights">
              <li v-for="item in growthHighlights" :key="item">{{ item }}</li>
            </ul>
          </div>
        </article>

        </section>
      </section>

    <section class="stripe-pricing-explorer">
        <div class="stripe-top-tabs">
          <button
            type="button"
            class="stripe-tab"
            :class="{ 'is-active': pricingTab === 'standard' }"
            @click="pricingTab = 'standard'"
          >
            <span>{{ pricingI18n.tabs.standard }}</span>
          </button>
          <button
            type="button"
            class="stripe-tab"
            :class="{ 'is-active': pricingTab === 'custom' }"
            @click="pricingTab = 'custom'"
          >
            <span>{{ pricingI18n.tabs.custom }}</span>
          </button>
          <a href="/contact" class="stripe-contact-btn">
            <font-awesome-icon :icon="faEnvelope" aria-hidden="true" />
            <span>Contactar</span>
          </a>
        </div>

        <p class="stripe-explorer-intro">{{ pricingI18n.explorerIntro }}</p>

        <div v-if="pricingTab === 'standard'" class="stripe-explorer-grid">
          <aside class="stripe-left-nav">
            <div v-for="group in stripeMenuGroups" :key="group.title" class="stripe-nav-group">
              <h4 v-if="group.title">{{ group.title }}</h4>
              <button
                v-for="item in group.items"
                :key="item.key"
                type="button"
                class="stripe-nav-item"
                :class="{ 'is-active': item.key === activeStripeItemKey }"
                @click="activeStripeItemKey = item.key"
              >
                <font-awesome-icon :icon="item.icon" class="stripe-nav-item-icon" />
                <span>{{ item.label }}</span>
              </button>
            </div>
          </aside>

          <div class="stripe-right-content">
            <article class="stripe-offer-card">
              <header class="stripe-right-header">
                <div>
                  <h3 class="stripe-right-header-title">
                    <font-awesome-icon
                      v-if="activeStripeItem.icon"
                      :icon="activeStripeItem.icon"
                      class="stripe-header-inline-icon"
                    />
                    <span>{{ activeStripeItem.panelTitle }}</span>
                  </h3>
                  <p>{{ activeStripeItem.panelCopy }}</p>
                </div>
              </header>

              <div v-if="activeStripeItemKey === 'global-search'" class="stripe-language-support">
                <span class="language-label">{{ pricingI18n.languageCoverageLabel }}</span>
                <span v-for="flag in globalSearchFlags" :key="flag.language" class="language-flag">
                  {{ flag.symbol }}
                  <span class="language-name">{{ flag.language }}</span>
                </span>
                <span class="language-note">{{ pricingI18n.languageCoverageNote }}</span>
              </div>

              <ul class="stripe-bullet-list">
                <li v-for="bullet in activeStripeItem.bullets" :key="bullet">{{ bullet }}</li>
              </ul>

              <table class="stripe-offer-table">
                <tbody>
                  <tr v-for="row in activeStripeItem.rows" :key="row.label || row.detail">
                    <td class="stripe-offer-label">
                      <strong v-if="row.label">{{ row.label }}</strong>
                      <p>{{ row.detail }}</p>
                    </td>
                    <td class="stripe-offer-value" v-html="row.value"></td>
                  </tr>
                </tbody>
              </table>
            </article>
          </div>
        </div>

      <section v-else class="custom-pricing-panel card-surface">
        <header class="custom-pricing-head">
          <div>
            <h3>{{ pricingI18n.customPanel.title }}</h3>
            <p>{{ pricingI18n.customPanel.subtitle }}</p>
          </div>
        </header>

          <div class="custom-pricing-grid">
            <article class="custom-pricing-block">
              <h4>{{ pricingI18n.customPanel.commercialTermsTitle }}</h4>
              <ul>
                <li>{{ pricingI18n.customPanel.commercialTerm1 }}</li>
                <li>{{ pricingI18n.customPanel.commercialTerm2 }}</li>
                <li>{{ pricingI18n.customPanel.commercialTerm3 }}</li>
              </ul>
            </article>
            <article class="custom-pricing-block">
              <h4>{{ pricingI18n.customPanel.technicalScopeTitle }}</h4>
              <ul>
                <li>{{ pricingI18n.customPanel.technicalScope1 }}</li>
                <li>{{ pricingI18n.customPanel.technicalScope2 }}</li>
                <li>{{ pricingI18n.customPanel.technicalScope3 }}</li>
              </ul>
            </article>
          </div>

          <table class="stripe-offer-table custom-summary-table">
            <tbody>
              <tr>
                <td class="stripe-offer-label">
                  <strong>{{ pricingI18n.customPanel.summaryPricingModelTitle }}</strong>
                  <p>{{ pricingI18n.customPanel.summaryPricingModelDescription }}</p>
                </td>
                <td class="stripe-offer-value">{{ pricingI18n.customPanel.summaryPricingModelValue }}</td>
              </tr>
              <tr>
                <td class="stripe-offer-label">
                  <strong>{{ pricingI18n.customPanel.summaryBestFitTitle }}</strong>
                  <p>{{ pricingI18n.customPanel.summaryBestFitDescription }}</p>
                </td>
                <td class="stripe-offer-value">{{ pricingI18n.customPanel.summaryBestFitValue }}</td>
              </tr>
            </tbody>
          </table>
      </section>
    </section>

    <section class="pricing-compare-section">
      <header class="pricing-compare-head">
        <h2>
          <font-awesome-icon :icon="faLayerGroup" class="pricing-compare-title-icon" aria-hidden="true" />
          <span>{{ pricingI18n.comparisonTitle }}</span>
        </h2>
      </header>
      <div class="pricing-compare-shell">
        <div class="pricing-compare-table-wrap">
          <table class="pricing-compare-table">
            <thead>
              <tr>
                <th>
                  <span class="pricing-compare-head-capability">
                    <span>{{ pricingI18n.capabilityHeader }}</span>
                    <span
                      class="pricing-compare-head-tooltip-wrap"
                      tabindex="0"
                      :aria-label="t('pricing_page.capabilityHeaderTooltip')"
                    >
                      <span class="pricing-compare-head-tooltip-trigger" aria-hidden="true">i</span>
                      <span class="pricing-compare-tooltip pricing-compare-head-tooltip">{{ t('pricing_page.capabilityHeaderTooltip') }}</span>
                    </span>
                  </span>
                </th>
                <th><span class="pricing-compare-head-plan"><span>Plan básico</span></span></th>
                <th><span class="pricing-compare-head-plan"><span>Plan a medida</span></span></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in offeringComparisonSections" :key="section.title">
                <tr class="pricing-compare-section-row">
                  <td colspan="3">
                    <span class="pricing-compare-section-title">
                      {{ section.title }}
                    </span>
                  </td>
                </tr>
                <tr v-for="row in section.rows" :key="`${section.title}-${row.label}`">
                  <td class="pricing-compare-label">
                    <span
                      class="pricing-compare-label-inner"
                      :class="{
                        'pricing-compare-tooltip-wrap': row.tooltip,
                        'is-bottom': row.tooltip && row.tooltipDirection === 'bottom',
                        'is-top': row.tooltip && row.tooltipDirection === 'top'
                      }"
                      :tabindex="row.tooltip ? 0 : undefined"
                      :aria-label="row.tooltip ? tooltipText(row.tooltip) : undefined"
                    >
                      <font-awesome-icon :icon="row.icon" class="pricing-compare-label-icon" aria-hidden="true" />
                      <span class="pricing-compare-label-text">{{ row.label }}</span>
                      <span v-if="row.tooltip" class="pricing-compare-tooltip">{{ tooltipText(row.tooltip) }}</span>
                    </span>
                  </td>
                  <td><div class="pricing-compare-cell"><span>{{ row.starter }}</span></div></td>
                  <td><div class="pricing-compare-cell"><span>{{ row.growth }}</span></div></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    </main>

  <Footer />
</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBolt,
  faClock,
  faChartLine,
  faCloud,
  faCreditCard,
  faDatabase,
  faEnvelope,
  faFileLines,
  faHeadset,
  faGlobe,
  faLayerGroup,
  faMagic,
  faMagnifyingGlass,
  faRotate,
  faServer,
  faShieldHalved,
  faSatelliteDish,
  faSliders,
  faSpellCheck,
  faSync,
  faBullseye,
  faLanguage
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import { api } from '@/composables/api'
import esMessages from '@/locales/es.json'

library.add(
  faSatelliteDish,
  faBolt,
  faDatabase,
  faMagic,
  faSync,
  faBullseye,
  faSpellCheck,
  faChartLine,
  faLanguage,
  faCloud,
  faShieldHalved,
  faHeadset,
  faGlobe,
  faCreditCard,
  faFileLines,
  faMagnifyingGlass,
  faLayerGroup,
  faRotate,
  faClock,
  faServer,
  faEnvelope,
  faSliders,
  faBullseye
)

const plans = ref([])
const pricingDisplayEnabled = ref(true)
const { t, locale } = useI18n()
const pricingI18n = computed(() => esMessages.pricing_page)
const fallbackPlans = [
  {
    id: 'starter',
    name: t('pricing_page.plans.starter.label'),
    installations: 10,
    monthlyPrice: 49,
    overage: 0.08,
    features: [
      t('pricing_page.fallback_features.starter_1'),
      t('pricing_page.fallback_features.starter_2'),
      t('pricing_page.fallback_features.starter_3')
    ]
  },
  {
    id: 'growth',
    name: t('pricing_page.plans.growth.label'),
    installations: 50,
    monthlyPrice: 199,
    overage: 0.05,
    features: [
      t('pricing_page.fallback_features.growth_1'),
      t('pricing_page.fallback_features.growth_2'),
      t('pricing_page.fallback_features.growth_3')
    ]
  },
  {
    id: 'custom',
    name: t('pricing_page.plans.custom.label'),
    custom: true,
    installations: 0,
    monthlyPrice: 0,
    overage: 0,
    features: [
      t('pricing_page.fallback_features.custom_1'),
      t('pricing_page.fallback_features.custom_2'),
      t('pricing_page.fallback_features.custom_3')
    ]
  }
]

const normalizedPlans = computed(() => {
  const source = plans.value.length ? plans.value : fallbackPlans
  const byKey = new Map(
    source.map((item) => [String(item?.id || item?.name || '').toLowerCase(), item])
  )
  const starter = normalizePlan(byKey.get('starter') || byKey.get('plan starter') || fallbackPlans[0], 0)
  const growth = normalizePlan(byKey.get('growth') || byKey.get('plan growth') || fallbackPlans[1], 1)
  const custom = normalizePlan(byKey.get('custom') || byKey.get('custom enterprise') || fallbackPlans[2], 2)
  return [starter, growth, { ...custom, custom: true, installations: 0 }]
})

const standardPlan = computed(() => normalizedPlans.value.find((p) => String(p.id).toLowerCase().includes('starter')) || normalizedPlans.value[0])
const growthPlan = computed(() => normalizedPlans.value.find((p) => String(p.id).toLowerCase().includes('growth')) || normalizedPlans.value[1] || normalizedPlans.value[0])
const customPlan = computed(() => normalizedPlans.value.find((p) => p.custom) || normalizedPlans.value[2] || normalizedPlans.value[0])

const educationAreas = [
  ['global-search', 'Gestión académica', 'database', 'Estudiantes, matrículas y calificaciones', 'Centraliza estudiantes, matrículas, cursos, asignaturas, calificaciones, planificación y cierre anual MINEDUC.', ['Registro de estudiantes y matrículas.', 'Cursos, asignaturas y materiales pedagógicos.', 'Calificaciones, planificación y cierre anual.', 'Plan básico: operación diaria lista para usar.', 'Plan a medida: flujos, reportes e integraciones personalizadas.']],
  ['instant-search', 'Asistencia y convivencia', 'shield-halved', 'Libro de clases y seguimiento', 'Registra asistencia, observaciones e incidentes con trazabilidad para dirección, UTP e inspectoría.', ['Libro de clases digital.', 'Observaciones positivas y de seguimiento.', 'Incidentes con historial para el equipo.', 'Plan básico: registro y consulta cotidiana.', 'Plan a medida: protocolos adaptados al colegio.']],
  ['classroom', 'Aula digital', 'file-lines', 'Tareas, foros y contenido', 'Publica actividades, conversaciones moderadas y materiales del curso (PPT, PPTX y PDF).', ['Tareas con entregas y devoluciones.', 'Foros con moderación docente.', 'Contenido pedagógico por asignatura.', 'Plan básico: aula digital esencial.', 'Plan a medida: capacitación y flujos a la medida del equipo docente.']],
  ['finance', 'Finanzas escolares', 'credit-card', 'Cobros, pagos y rendición', 'Ordena ingresos, gastos, proveedores y documentos de cobro con exportes claros.', ['Documentos de cobro y pagos.', 'Gastos y proveedores.', 'Rendición de cuentas exportable.', 'Plan básico: operación financiera esencial.', 'Plan a medida: rendición e integraciones personalizadas.']],
  ['indexing-api', 'Equipo y permisos', 'sliders', 'Acceso según responsabilidades', 'Define roles y permisos para dirección, managers, profesores, finanzas y estudiantes.', ['Dirección con permisos completos.', 'Managers para ampliar la plantilla.', 'Flags independientes y accesos revocables.', 'Plan básico: roles estándar del colegio.', 'Plan a medida: perfiles y políticas institucionales.']],
  ['ranking-rules', 'RRHH y remuneraciones', 'chart-line', 'Personal y liquidaciones', 'Colaboradores, contratos, liquidaciones, Previred y métodos de pago institucionales.', ['Ficha de colaboradores y cargos.', 'Pagos de nómina y Previred.', 'Documentos laborales asociados.', 'Plan básico: registro y pagos esenciales.', 'Plan a medida: gestión administrativa ampliada.']],
  ['synonyms', 'Familias y comunicaciones', 'language', 'Comunidad informada', 'Comunicados, postulaciones, inbox de contacto y acceso ordenado por estudiante.', ['Comunicados por distintos canales.', 'Postulaciones e inbox de contacto.', 'Menos tareas duplicadas entre equipos.', 'Plan básico: comunicación centralizada.', 'Plan a medida: canales e integraciones personalizadas.']],
  ['analytics', 'Integraciones y respaldo', 'server', 'SIGE, WhatsApp y continuidad', 'Conecta SIGE/MINEDUC, WhatsApp, respaldos automáticos y control de acceso por roles.', ['Integraciones SIGE / MINEDUC.', 'Respaldos automáticos cada 12 horas.', 'Soporte según el plan contratado.', 'Plan básico: continuidad estándar.', 'Plan a medida: políticas, retención y acompañamiento dedicado.']],
  ['multi-school', 'Multi-colegio', 'layer-group', 'Varias sedes, una consola', 'Opera varios establecimientos con cuentas globales, planes y control centralizado desde plataforma.', ['Consola multi-colegio.', 'Cuentas globales y membresías por sede.', 'Planes y facturación por establecimiento.', 'Disponible principalmente en plan a medida.', 'Incluye diagnóstico, implementación guiada y capacitación al equipo.']]
]

const starterHighlights = [
  'Gestión académica, aula digital y asistencia',
  'Finanzas, RRHH y comunicaciones esenciales',
  'Integraciones SIGE y respaldos automáticos',
  'Onboarding guiado y soporte estándar'
]

const growthHighlights = [
  'Todo lo del plan básico, ampliado a tu colegio',
  'Multi-colegio, permisos e integraciones a medida',
  'Diagnóstico, implementación y capacitación',
  'Puesta en marcha, soporte dedicado y mejora continua'
]

const stripeMenuGroups = computed(() => [{ title: '', items: educationAreas.map(([key, label, icon]) => ({ key, label, icon: ['fas', icon] })) }])
const stripeMenuDetails = computed(() => Object.fromEntries(educationAreas.map(([key, label, icon, panelTitle, panelCopy, bullets]) => [key, {
  panelTitle, panelCopy, bullets, icon: ['fas', icon],
  rows: [
    { label: 'Incluye', detail: `Herramientas de ${label.toLowerCase()} listas para usar.`, value: 'Plan básico<br><small>funciones esenciales</small>' },
    { label: 'Ampliación', detail: 'Configuración, módulos y acompañamiento adaptados a la institución.', value: 'Plan a medida<br><small>alcance personalizado</small>' }
  ]
}])))

const globalSearchFlags = computed(() => [])

const activeStripeItemKey = ref('global-search')
const activeStripeItem = computed(() => stripeMenuDetails.value[activeStripeItemKey.value] || stripeMenuDetails.value['global-search'] || { bullets: [], rows: [] })
const pricingTab = ref('standard')

function normalizeComparisonValue(value) {
  return String(value || '').trim().toLowerCase()
}

const POSITIVE_COMPARISON_VALUES = new Set([
  'included',
  'available',
  'yes',
  'incluido',
  'disponible',
  'si',
  'sí',
  'inclus',
  'oui',
  'enthalten',
  'inbegriffen',
  'verfügbar',
  'ja',
  'incluso',
  'disponibile',
  'sì',
  'शामिल',
  'शामिल है',
  'उपलब्ध',
  'उपलब्ध है',
  'हाँ',
  'हां'
])

const EMPTY_COMPARISON_VALUES = new Set([
  'not included',
  'no',
  'empty',
  'none',
  'no incluido',
  'non inclus',
  'non disponible',
  'nicht enthalten',
  'nicht verfügbar',
  'nein',
  'non incluso',
  'non disponibile',
  'शामिल नहीं',
  'उपलब्ध नहीं',
  'नहीं',
  'कोई नहीं',
  'खाली'
])

function cellStateClass(value) {
  const normalized = normalizeComparisonValue(value)
  if (POSITIVE_COMPARISON_VALUES.has(normalized)) return 'is-positive'
  if (EMPTY_COMPARISON_VALUES.has(normalized)) return 'is-empty'
  return 'is-detail'
}

function cellIcon(value) {
  const normalized = normalizeComparisonValue(value)
  if (POSITIVE_COMPARISON_VALUES.has(normalized)) return '✓'
  if (EMPTY_COMPARISON_VALUES.has(normalized)) return ''
  return ''
}

function cellText(value) {
  const normalized = normalizeComparisonValue(value)
  if (POSITIVE_COMPARISON_VALUES.has(normalized)) return ''
  if (EMPTY_COMPARISON_VALUES.has(normalized)) return ''
  return value
}

function tooltipText(tooltipValue) {
  const key = String(tooltipValue || '').trim()
  if (!key) return ''
  if (key.startsWith('pricing_page.tooltips.')) return t(key)
  if (/^[a-z0-9_]+$/i.test(key)) return t(`pricing_page.tooltips.${key}`)
  return key
}

function comparisonPlanLabel(planKey) {
  if (planKey === 'starter') return t('pricing_page.plans.starter.label')
  if (planKey === 'growth') return t('pricing_page.plans.growth.label')
  if (planKey === 'enterprise') return t('pricing_page.plans.enterpriseLabel')
  return ''
}

function comparisonCellTooltip(row, planKey) {
  const value = row?.[planKey]
  const normalized = normalizeComparisonValue(value)
  if (!value || EMPTY_COMPARISON_VALUES.has(normalized)) return ''

  const detail = tooltipText(row?.tooltip)
  if (!detail) return ''

  return t('pricing_page.columnItemTooltipTemplate', {
    plan: comparisonPlanLabel(planKey),
    value: String(value).trim(),
    detail
  })
}

const comparisonIconByKey = {
  fileLines: faFileLines,
  magnifyingGlass: faMagnifyingGlass,
  cloud: faCloud,
  layerGroup: faLayerGroup,
  globe: faGlobe,
  sync: faSync,
  rotate: faRotate,
  language: faLanguage,
  sliders: faSliders,
  bullseye: faBullseye,
  spellCheck: faSpellCheck,
  chartLine: faChartLine,
  clock: faClock,
  shieldHalved: faShieldHalved,
  headset: faHeadset,
  magic: faMagic,
  server: faServer
}

const offeringComparisonSections = computed(() => [
  {
    title: 'Gestión académica',
    rows: [
      { icon: faMagnifyingGlass, label: 'Estudiantes y matrículas', starter: 'Registro, búsqueda y ficha', growth: 'Flujos personalizados e integraciones' },
      { icon: faFileLines, label: 'Calificaciones y planificación', starter: 'Notas, seguimiento y cierre anual', growth: 'Reportes y reglas a medida' },
      { icon: faLayerGroup, label: 'Cursos y asignaturas', starter: 'Creación y gestión básica', growth: 'Estructura académica personalizada' },
      { icon: faCloud, label: 'Material pedagógico', starter: 'Archivos PPT, PPTX y PDF', growth: 'Capacidad y flujos ampliados' },
      { icon: faBolt, label: 'Aula (tareas y foros)', starter: 'Publicación, entregas y moderación', growth: 'Capacitación y flujos docentes a medida' }
    ]
  },
  {
    title: 'Administración y comunidad',
    rows: [
      { icon: faSliders, label: 'Roles y permisos', starter: 'Director, manager, profesor y estudiante', growth: 'Perfiles y políticas a medida' },
      { icon: faChartLine, label: 'RRHH y remuneraciones', starter: 'Colaboradores, liquidaciones y Previred', growth: 'Gestión administrativa ampliada' },
      { icon: faCreditCard, label: 'Finanzas escolares', starter: 'Cobros, pagos, gastos y proveedores', growth: 'Rendición e integraciones a medida' },
      { icon: faLanguage, label: 'Familias y comunicaciones', starter: 'Comunicados, postulaciones e inbox', growth: 'Canales e integraciones personalizadas' },
      { icon: faShieldHalved, label: 'Asistencia y convivencia', starter: 'Libro de clases, observaciones e incidentes', growth: 'Protocolos adaptados al colegio' }
    ]
  },
  {
    title: 'Implementación y acompañamiento',
    rows: [
      { icon: faServer, label: 'Despliegue e integraciones', starter: 'Instalación estándar + SIGE / WhatsApp', growth: 'Arquitectura, migración y multi-colegio' },
      { icon: faSync, label: 'Respaldos', starter: 'Automáticos cada 12 horas', growth: 'Políticas de retención a medida' },
      { icon: faMagic, label: 'Diagnóstico e implementación', starter: 'Onboarding guiado', growth: 'Diagnóstico, configuración y validación conjunta' },
      { icon: faHeadset, label: 'Capacitación y soporte', starter: 'Canal estándar', growth: 'Capacitación, go-live y seguimiento dedicado' },
      { icon: faBullseye, label: 'Adopción real', starter: 'Uso diario del equipo', growth: 'Mejora continua y módulos por etapa' }
    ]
  }
])

const comparisonSections = computed(() => (pricingI18n.value?.comparisonSections || []).map((section) => ({
  ...section,
  rows: (section.rows || [])
    .filter((row) => row?.tooltip !== 'compare_s4_r2')
    .map((row) => ({
      ...row,
      icon: comparisonIconByKey[row.icon] || faFileLines
    }))
})))

function normalizePlan(item, index) {
  const monthlyPrice = Number(item.monthlyPrice ?? item.monthly ?? item.priceMonthly ?? item.price ?? 0)
  const installations = Number(item.installations ?? item.maxInstallations ?? item.limit ?? 0)
  const features = Array.isArray(item.features) && item.features.length
    ? item.features
    : defaultFeaturesForIndex(index)

  return {
    id: item.id || `${item.name || 'plan'}-${index}`,
    name: item.name || item.title || `Plan ${index + 1}`,
    custom: Boolean(item.custom || item.isCustom || String(item.name || '').toLowerCase().includes('custom')),
    installations: installations > 0 ? installations : fallbackPlans[Math.min(index, fallbackPlans.length - 1)].installations,
    monthlyPrice: monthlyPrice > 0 ? monthlyPrice : fallbackPlans[Math.min(index, fallbackPlans.length - 1)].monthlyPrice,
    overage: Number(item.overage ?? item.overagePerInstall ?? 0),
    features
  }
}

function defaultFeaturesForIndex(index) {
  if (index === 0) return [
    t('pricing_page.fallback_features.starter_1'),
    t('pricing_page.fallback_features.starter_2'),
    t('pricing_page.fallback_features.starter_3')
  ]
  if (index === 1) return [
    t('pricing_page.fallback_features.growth_1'),
    t('pricing_page.fallback_features.growth_2'),
    t('pricing_page.fallback_features.growth_3')
  ]
  return [
    t('pricing_page.fallback_features.custom_1'),
    t('pricing_page.fallback_features.custom_2'),
    t('pricing_page.fallback_features.custom_3')
  ]
}

function formatInt(value) {
  return new Intl.NumberFormat(locale.value || 'en-US').format(Number(value || 0))
}

function currency(value) {
  return new Intl.NumberFormat(locale.value || 'en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function displayPrice(plan) {
  if (plan.custom) return t('pricing_page.custom_price_label')
  return `${currency(plan.monthlyPrice)}${t('pricing_page.per_month_suffix')}`
}

function displayOverage(plan) {
  if (plan.custom) return t('pricing_page.overage_custom')
  const overage = Number(plan.overage || 0)
  return overage > 0
    ? t('pricing_page.overage_per_install', { amount: overage.toFixed(2) })
    : t('pricing_page.overage_none')
}

async function fetchPlans() {
  const endpoints = ['/public/plans', '/pricing/plans', '/plans']

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint)
      const data = response?.data || response || {}
      const payload = data?.plans || response?.plans || data
      pricingDisplayEnabled.value = data?.pricingDisplayEnabled !== false
      if (Array.isArray(payload) && payload.length) {
        plans.value = payload
        return
      }
    } catch (_error) {
      // Try next endpoint
    }
  }

  // Keep fallback plans silently when pricing API is unavailable.
}

onMounted(() => {
  fetchPlans()
})
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background: #f9fafc;
}

.pricing-main {
  width: min(1260px, 100%);
  margin: 0 auto;
  padding: 26px 24px 84px;
  display: grid;
  gap: 6px;
}

.plan-block {
  position: relative;
  margin-top: -18px;
  padding-top: 0;
}

.hero-block h1 {
  margin: 0;
  color: #05070a;
  font-size: 36px;
  line-height: 1.1;
  letter-spacing: 0;
  max-width: 920px;
  white-space: nowrap;
}

.hero-block p {
  margin: 12px 0 0;
  color: #000000 !important;
  font-size: clamp(15px, 1.5vw, 20px);
  line-height: 1.3;
  max-width: 920px;
  font-weight: 400;
}

.offer-section,
.accompaniment-section {
  margin-top: 28px;
  padding: 8px 0 12px;
  display: grid;
  gap: 22px;
}

.offer-head,
.accompaniment-head {
  max-width: 760px;
  display: grid;
  gap: 8px;
}

.offer-head h2,
.accompaniment-head h2 {
  margin: 0;
  color: #05070a;
  font-size: clamp(24px, 2.4vw, 32px);
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.offer-head p,
.accompaniment-head p {
  margin: 0;
  color: #475569;
  font-size: 16px;
  line-height: 1.5;
}

.offer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.offer-card {
  padding: 20px 18px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 8px;
  min-height: 148px;
}

.offer-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 750;
}

.offer-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.accompaniment-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.accompaniment-step {
  padding: 22px 20px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  display: grid;
  gap: 10px;
  align-content: start;
}

.accompaniment-step-number {
  width: fit-content;
  padding: 4px 9px;
  border-radius: 999px;
  color: #1d4ed8;
  background: #eff6ff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.accompaniment-step h3,
.accompaniment-promise h3 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 750;
}

.accompaniment-step p,
.accompaniment-promise p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.accompaniment-promises {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.accompaniment-promise {
  padding: 20px 18px;
  border-radius: 16px;
  background: linear-gradient(160deg, #ffffff, #f8fbff);
  border: 1px solid rgba(37, 99, 235, 0.1);
  display: grid;
  gap: 8px;
}

.accompaniment-cta-wrap {
  display: flex;
  justify-content: flex-start;
}

.accompaniment-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
  overflow: visible;
}

.plan-card {
  position: relative;
  border-radius: 20px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  gap: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.03),
    0 4px 10px rgba(15, 23, 42, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.75) inset;
  transition: transform 0.24s ease, box-shadow 0.24s ease;
  isolation: isolate;
}

.plan-card::after {
  display: none;
}

.plan-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.05),
    0 8px 18px rgba(15, 23, 42, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.82) inset;
}

.plan-card-growth {
  box-shadow:
    0 0 0 1px rgba(37, 99, 235, 0.08),
    0 6px 14px rgba(37, 99, 235, 0.12),
    0 0 0 1px rgba(191, 219, 254, 0.75) inset;
}

.plan-card-growth:hover {
  transform: translateY(-3px);
}

.plan-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.plan-card-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-card-cta {
  margin-top: auto;
  display: flex;
}

.plan-card-standard .plan-card-cta {
  transform: translateY(-8px);
}

.plan-label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

.plan-label-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.plan-tier-icon {
  font-size: 0.95rem;
  line-height: 1;
}

.plan-tier-emoji {
  font-size: 0.96rem;
  line-height: 1;
  transform: translateY(-0.02em);
}

.plan-label-starter .plan-tier-icon {
  color: #0ea5e9;
  filter: drop-shadow(0 2px 6px rgba(14, 165, 233, 0.35));
}

.plan-label-growth .plan-tier-icon {
  color: #2563eb;
  filter: drop-shadow(0 2px 6px rgba(37, 99, 235, 0.28));
}

.plan-label-custom .plan-tier-icon {
  color: #fec76f;
  filter: none;
}

.plan-label-custom .enterprise-icon {
  color: #ffffff !important;
}

.plan-subcopy {
  margin: 0;
  color: #0b2a50 !important;
  font-size: 18px;
  line-height: 1.4;
}

.plan-card-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-number {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #0b2a50 !important;
}

.plan-highlights {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.plan-highlights li {
  position: relative;
  padding-left: 18px;
  color: #46607d;
  font-size: 13px;
  line-height: 1.45;
}

.plan-highlights li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2f6fed;
}

.plan-feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.plan-feature-list li {
  display: grid;
  grid-template-columns: 8px 1fr;
  align-items: start;
  gap: 8px;
  font-size: 18px;
  line-height: 1.4;
  color: #0f172a;
}

.plan-feature-list li::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #2563eb;
  align-self: start;
  margin-top: 0.58em;
}

.plan-card-custom.card-surface {
  background: #0d355a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #f8fbff;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06),
    0 6px 14px rgba(10, 29, 52, 0.2);
}

.plan-card-custom .plan-subcopy,
.plan-card-custom .plan-label {
  color: #ffffff !important;
}

.plan-card-custom .plan-card-content,
.plan-card-custom .plan-card-footer,
.plan-card-custom p,
.plan-card-custom li,
.plan-card-custom span,
.plan-card-custom a {
  color: #ffffff !important;
}

.plan-card-custom h2 {
  margin: 0;
  color: #f8fbff !important;
}

.plan-card-custom .plan-feature-list li {
  color: #ffffff !important;
}

.plan-card-custom .plan-feature-list-custom li {
  grid-template-columns: 6px 1fr;
  gap: 6px;
}

.plan-card-custom .plan-feature-list li::before {
  background: #67e8f9;
  align-self: start;
}

.plan-card-custom .plan-feature-list-custom li::before {
  width: 6px;
  height: 6px;
}

.plan-card-custom .price-number {
  color: #f8fbff !important;
}

.primary-cta,
.secondary-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  width: fit-content;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1;
  color: #ffffff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.primary-cta span,
.secondary-cta span {
  color: #ffffff;
  display: inline-flex;
  align-items: center;
}

.plan-card-custom .secondary-cta {
  color: #ffffff !important;
}

.primary-cta:hover,
.secondary-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.35);
}

.error-text {
  margin: 0;
  color: #0f172a;
  background: #e2e8f0;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
}

.card-surface {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
}

.inline-cta {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  align-self: flex-start;
}

.comparison-card {
  padding: 18px;
  display: grid;
  gap: 12px;
}

.offer-columns {
  padding: 24px;
  border-radius: 22px;
}

.offer-merged-divider {
  height: 1px;
  background: #e7edf8;
  margin: 18px 0;
}

.offer-matrix-merged {
  border-radius: 16px;
  box-shadow: none;
}

.stripe-pricing-explorer {
  order: 2;
  margin-top: -36px;
}

.stripe-explorer-intro {
  margin: 14px 0 22px;
  max-width: 760px;
  color: #000000 !important;
  font-size: 1rem;
  line-height: 1.55;
}

.stripe-top-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0 14px;
}

.stripe-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: transparent;
  color: #334155;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  padding: 7px 12px;
  border: 1px solid transparent;
  transition: background 0.18s ease, color 0.18s ease;
}

.stripe-tab span {
  color: inherit;
}

.stripe-tab:hover:not(.is-active) {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #e8f1ff;
}

.stripe-tab.is-active {
  color: #ffffff;
  border-color: #1d4ed8;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 8px 18px rgba(29, 78, 216, 0.35);
  transform: translateY(-1px);
}

.stripe-contact-btn {
  margin-left: auto;
  min-height: 38px;
  padding: 0.58rem 1rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  letter-spacing: -0.01em;
  font-size: 0.86rem;
  text-transform: none;
  color: #ffffff !important;
  background: linear-gradient(135deg, #0b2a50, #143787);
  box-shadow:
    0 10px 20px rgba(11, 42, 80, 0.24),
    0 4px 10px rgba(20, 55, 135, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-family: var(--font-family-sohne);
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.stripe-contact-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: none;
  opacity: 0;
  pointer-events: none;
}

.stripe-contact-btn:hover {
  background: linear-gradient(135deg, #143787, #0b2a50);
  box-shadow:
    0 12px 24px rgba(11, 42, 80, 0.28),
    0 6px 14px rgba(20, 55, 135, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.stripe-contact-btn:active {
  transform: translateY(0);
  box-shadow:
    0 8px 18px rgba(11, 42, 80, 0.22),
    0 4px 10px rgba(20, 55, 135, 0.16);
}

.stripe-contact-btn span {
  color: #ffffff !important;
  display: inline-flex;
  align-items: center;
}

.stripe-contact-btn .btn-chevron {
  font-size: 1rem;
  line-height: 1;
  margin-left: 0.05rem;
  transition: transform 0.2s ease;
}

.stripe-contact-btn:hover .btn-chevron {
  transform: translateX(4px);
}

.stripe-explorer-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  padding-top: 16px;
}

.stripe-left-nav {
  position: relative;
  align-self: start;
  border-right: none;
  padding-right: 30px;
  margin-right: 8px;
}

.stripe-left-nav::after {
  display: none;
}

.stripe-right-content {
  position: relative;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  border: 1px solid #d9e2f0;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.92) inset,
    0 0 0 1px rgba(15, 23, 42, 0.03),
    0 4px 12px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.stripe-right-content,
.stripe-right-content h3,
.stripe-right-content p,
.stripe-right-content li,
.stripe-right-content span,
.stripe-right-content strong,
.stripe-right-content td,
.stripe-right-content :deep(small),
.custom-pricing-panel,
.custom-pricing-panel h3,
.custom-pricing-panel h4,
.custom-pricing-panel p,
.custom-pricing-panel li,
.custom-pricing-panel span,
.custom-pricing-panel strong,
.custom-pricing-panel td,
.custom-pricing-panel :deep(small) {
  color: #000000 !important;
}

.stripe-right-content::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.stripe-nav-group + .stripe-nav-group {
  margin-top: 0;
}

.stripe-nav-group h4 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.1;
  text-transform: none;
  font-weight: 800;
}

.stripe-nav-item {
  border: none;
  background: transparent;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  line-height: 1.35;
  border-radius: 9px;
  transition: background-color 0.16s ease, color 0.16s ease;
}

.stripe-nav-item.is-active {
  color: #2563eb;
  background: #e8f1ff;
  font-weight: 700;
}

.stripe-nav-item-icon {
  color: #05070a;
  font-size: 14px;
  width: 18px;
  flex: 0 0 18px;
  transition: color 0.16s ease, transform 0.16s ease;
}

.stripe-nav-item.is-active .stripe-nav-item-icon {
  color: #2563eb;
  transform: translateX(1px);
}

.stripe-nav-item:hover {
  background: #f1f5fb;
}

.stripe-right-header {
  padding: 24px 26px 14px;
  border-bottom: 1px solid #e8edf6;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.stripe-right-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(26px, 2.2vw, 42px);
  line-height: 1.1;
  letter-spacing: -0.02em;
  font-weight: 700;
  max-width: 26ch;
}

.stripe-right-header-title {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
}

.stripe-right-header p {
  margin: 10px 0 0;
  color: #0f172a;
  font-size: clamp(15px, 1.15vw, 19px);
  line-height: 1.42;
  max-width: 68ch;
}

.stripe-header-inline-icon {
  font-size: clamp(20px, 2vw, 26px);
  color: #0f172a;
  margin-left: 0;
  margin-top: -0.08em;
  flex: 0 0 auto;
  vertical-align: top;
}

.stripe-offer-card {
  margin-top: 0;
  border: 0;
  border-radius: 0;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.stripe-language-support {
  padding: 12px 20px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: #0b2a50;
}

.ranking-highlight-list {
  padding: 12px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking-highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0b2a50;
}

.ranking-highlight-icon {
  font-size: 18px;
  color: #2563eb;
}

.ranking-highlight-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.language-label {
  font-weight: 800;
  margin-right: 4px;
}

.language-flag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5fb;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 16px;
  line-height: 1;
  color: #0b2a50;
}

.language-name {
  font-size: 12px;
  opacity: 1;
  color: #0b2a50;
}

.language-note {
  font-size: 12px;
  opacity: 1;
  margin-left: auto;
  color: #0b2a50;
}

.stripe-bullet-list {
  margin: 0;
  padding: 14px 20px 16px;
  list-style: none;
  display: grid;
  gap: 10px;
  border-bottom: 1px solid #e6edf8;
  background: #ffffff;
}

.stripe-bullet-list li {
  color: #0b2a50;
  font-size: clamp(14px, 1vw, 16px);
  line-height: 1.45;
  font-weight: 400;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.stripe-bullet-list li::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #9baeff;
  box-shadow: 0 0 0 3px rgba(155, 174, 255, 0.22);
  flex: 0 0 auto;
  align-self: center;
  margin-top: 0;
}

.stripe-offer-table {
  width: 100%;
  border-collapse: collapse;
}

.stripe-offer-table td {
  border-bottom: 1px solid #e6edf8;
  padding: 18px 20px;
  vertical-align: top;
  color: #0f172a;
}

.stripe-offer-table td + td {
  border-left: 1px solid #e6edf8;
  width: 40%;
}

.stripe-offer-table tr:last-child td {
  border-bottom: none;
}

.custom-pricing-panel {
  position: relative;
  margin-top: 14px;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #d9e2f0;
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.92) inset,
    0 0 0 1px rgba(15, 23, 42, 0.03),
    0 4px 12px rgba(15, 23, 42, 0.06);
}

.custom-pricing-panel::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0));
  pointer-events: none;
}

.custom-pricing-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}

.custom-pricing-head h3 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(25px, 2.2vw, 40px);
  line-height: 1.12;
  letter-spacing: -0.02em;
  font-weight: 700;
  max-width: 24ch;
}

.custom-pricing-head p {
  margin: 10px 0 0;
  color: #556173;
  font-size: clamp(14px, 1.02vw, 17px);
  line-height: 1.44;
  max-width: 62ch;
}

.custom-pricing-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.custom-pricing-block {
  background: #f8fbff;
  border: 1px solid #dce7f6;
  border-radius: 12px;
  padding: 14px;
}

.custom-pricing-block h4 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: clamp(19px, 1.45vw, 25px);
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.custom-pricing-block ul {
  margin: 0;
  padding-left: 18px;
  color: #2f3e54;
  font-size: clamp(14px, 0.98vw, 16px);
  line-height: 1.45;
  display: grid;
  gap: 8px;
}

.custom-summary-table {
  margin-top: 14px;
  border: 1px solid #dce4f2;
  border-radius: 12px;
  overflow: hidden;
}

.stripe-offer-label {
  width: 58%;
}

.stripe-offer-label strong,
.stripe-offer-label p {
  display: block;
  color: #0f172a;
  font-size: clamp(16px, 1.1vw, 18px);
  line-height: 1.45;
  letter-spacing: -0.01em;
}

.stripe-offer-label strong {
  font-weight: 800;
}

.stripe-offer-label p {
  margin: 8px 0 0;
  font-weight: 400;
}

.stripe-offer-value {
  color: #0f172a;
  font-size: clamp(16px, 1.1vw, 18px);
  line-height: 1.45;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.stripe-offer-value :deep(small) {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: clamp(16px, 1.1vw, 18px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.offer-columns-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(32px, 4.5vw, 52px);
  line-height: 1.04;
}

.offer-columns-header p {
  margin: 10px 0 0;
  color: #475569;
  font-size: 19px;
  max-width: 760px;
}

.offer-selector {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(230px, 290px) 1fr;
  gap: 18px;
}

.offer-nav {
  display: grid;
  gap: 16px;
  align-content: start;
}

.offer-nav-group-title {
  margin: 0 0 8px;
  color: #334155;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 700;
}

.offer-nav-item {
  border: none;
  background: transparent;
  color: #334155;
  border-radius: 8px;
  padding: 8px 0 8px 14px;
  display: flex;
  align-items: center;
  text-align: left;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, padding-left 0.2s ease;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.offer-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease;
}

.offer-nav-item:hover {
  color: #0f172a;
}

.offer-nav-item.is-active {
  color: #1d4ed8;
  padding-left: 16px;
}

.offer-nav-item.is-active::before {
  background: linear-gradient(180deg, #1d4ed8, #3b82f6);
}

.offer-detail {
  border: 1px solid #dfe7f3;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
}

.offer-detail-head {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #e8eef7;
  background: #f8fbff;
  position: relative;
}

.offer-detail-head::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #1d4ed8, #06b6d4);
}

.offer-detail h4 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(30px, 3.6vw, 46px);
  line-height: 1.2;
  letter-spacing: -0.03em;
}

.offer-detail p {
  margin: 4px 0 0;
  color: #475569;
  font-size: clamp(16px, 1.8vw, 22px);
  line-height: 1.28;
}

.offer-detail-cta {
  text-decoration: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 700;
  font-size: 15px;
}

.offer-detail-bullets {
  margin: 0;
  padding: 14px 20px;
  list-style: none;
  display: grid;
  gap: 8px;
  border-bottom: 1px solid #e8eef7;
  background: #ffffff;
}

.offer-detail-bullets li {
  color: #334155;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.offer-detail-bullets li::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #60a5fa;
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.2);
}

.offer-detail-table {
  width: 100%;
  border-collapse: collapse;
}

.offer-detail-table th,
.offer-detail-table td {
  padding: 14px 18px;
  border-bottom: 1px solid #e8eef7;
  text-align: left;
}

.offer-detail-table th {
  width: 38%;
  color: #334155;
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.offer-detail-table td {
  color: #0f172a;
  font-size: clamp(16px, 1.55vw, 21px);
  font-weight: 600;
  line-height: 1.2;
}

.offer-detail-table tr:last-child th,
.offer-detail-table tr:last-child td {
  border-bottom: none;
}

.feature-matrix-card {
  background: #ffffff;
  color: #1f2937;
  border-radius: 24px;
  padding: 0;
  overflow: hidden;
  position: relative;
  border: 1px solid #dbe3ef;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.feature-matrix-card::after {
  display: none;
}

.feature-matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 28px 32px 20px;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f6fd 100%);
  border-bottom: 1px solid #e2e8f0;
  gap: 12px;
}

.feature-matrix-header h3 {
  margin: 0;
  color: #0f172a;
  font-size: 40px;
}

.feature-matrix-header p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 24px;
  max-width: 480px;
  line-height: 1.35;
}

.feature-matrix-pill {
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 999px;
  background: #e9eef8;
  color: #4b5563;
  border: 1px solid #d7e0ef;
  font-weight: 700;
}

.comparison-wrap {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  text-align: left;
  padding: 15px 18px;
  border-bottom: 1px solid #e8eef7;
  color: #1f2937;
  white-space: nowrap;
}

.included-table td:nth-child(n + 2) {
  font-weight: 600;
}

.comparison-table th {
  color: #64748b;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #f7f9fd;
  font-weight: 700;
}

.feature-matrix-table thead th {
  color: #64748b;
}

.feature-matrix-table tbody tr {
  border-bottom: 1px solid #e8eef7;
  transition: background 0.3s ease;
}

.feature-matrix-table tbody tr:nth-child(odd) {
  background: #fcfdff;
}

.feature-matrix-table tbody tr:hover {
  background: #eef4ff;
}

.feature-matrix-table td {
  padding: 16px 16px;
  font-size: 20px;
  color: #1f2937;
  font-weight: 600;
}

.feature-matrix-table thead th,
.feature-matrix-table tbody td:first-child {
  text-align: left;
}

.feature-matrix-table tbody td:first-child {
  font-weight: 700;
  color: #0f172a;
}

.feature-matrix-table th:nth-child(4),
.feature-matrix-table td:nth-child(4) {
  background: #f3f7ff;
}

.pricing-compare-section {
  order: 3;
  margin-top: 0.65rem;
  padding-bottom: 2.2rem;
}

/* Pull the explorer and comparison closer to the cards above. */
#app .pricing-page .stripe-pricing-explorer {
  margin-top: -46px;
  padding-top: clamp(44px, 5vw, 72px) !important;
}

#app .pricing-page .pricing-compare-section {
  margin-top: 0;
  padding-top: clamp(44px, 5vw, 72px) !important;
}

.pricing-compare-shell {
  border: 1px solid #d9e2f0;
  border-radius: 8px;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.98), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.92) inset,
    0 0 0 1px rgba(15, 23, 42, 0.03),
    0 16px 42px rgba(15, 23, 42, 0.06);
  overflow: visible;
  isolation: isolate;
}

.pricing-compare-head {
  margin: 0 0 1.2rem;
  padding: 0 0.2rem;
}

.pricing-compare-head h2 {
  display: inline-flex;
  align-items: center;
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.9rem, 3vw, 2.75rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  font-weight: 800;
  max-width: none;
  gap: 0.7rem;
}

.pricing-compare-title-icon {
  display: inline-flex;
  flex: 0 0 auto;
  box-sizing: content-box;
  width: 0.72em;
  height: 0.72em;
  padding: 0.32em;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #e9eef5;
  color: #0a2540;
  font-size: 0.58em;
  box-shadow: 0 4px 12px rgba(10, 37, 64, 0.1);
}

.pricing-compare-table-wrap {
  overflow: visible;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin-top: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
}

.pricing-compare-table-wrap::-webkit-scrollbar {
  display: none;
}

.pricing-compare-table {
  width: 100%;
  min-width: 680px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: visible;
  border-top: 0;
}

.pricing-compare-table th,
.pricing-compare-table td {
  padding: 0.95rem 1.15rem;
  border: 0;
  text-align: left;
  vertical-align: top;
  overflow: visible;
}

.pricing-compare-table th:first-child,
.pricing-compare-table td:first-child {
  border: 0;
}

.pricing-compare-table th:nth-child(2),
.pricing-compare-table td:nth-child(2),
.pricing-compare-table th:nth-child(3),
.pricing-compare-table td:nth-child(3) {
  border: 0;
}

.pricing-compare-table th:last-child,
.pricing-compare-table td:last-child {
  border: 0;
}

.pricing-compare-table thead th {
  background: #0d3559;
  color: #f8fafc;
  font-size: clamp(0.95rem, 1.2vw, 1.08rem);
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  border-top: 0;
}

.pricing-compare-table thead th:first-child {
  width: 32%;
  text-align: center;
}

.pricing-compare-cell--unified {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  text-align: left;
}

.pricing-compare-table thead th:nth-child(n + 2) {
  text-align: center;
}

.pricing-compare-head-plan {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.38rem;
  color: #ffffff !important;
}

.pricing-compare-head-capability {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  color: #ffffff !important;
  font-weight: 800;
}

.pricing-compare-head-capability > span:first-child {
  color: #ffffff !important;
  font-weight: 800;
}

.pricing-compare-head-tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  outline: none;
  z-index: 1;
}

.pricing-compare-head-tooltip-wrap:hover,
.pricing-compare-head-tooltip-wrap:focus-visible {
  z-index: 220;
}

.pricing-compare-head-tooltip-trigger {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  border: 1px solid #bfd0ea;
  background: linear-gradient(155deg, #fdfefe 0%, #edf3fb 46%, #d7e3f3 100%);
  color: #43618b;
  font-size: 0.62rem;
  font-weight: 700;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(123, 151, 188, 0.24),
    0 1px 1px rgba(15, 23, 42, 0.08);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}

.pricing-compare-head-tooltip-wrap:hover .pricing-compare-head-tooltip-trigger,
.pricing-compare-head-tooltip-wrap:focus-visible .pricing-compare-head-tooltip-trigger {
  border-color: #9cb5d8;
  color: #264975;
}

.pricing-compare-head-plan span,
.pricing-compare-head-plan .pricing-compare-plan-icon {
  color: #ffffff !important;
}

.enterprise-icon {
  color: #fec76f !important;
}

.enterprise-label {
  color: #ffffff !important;
}

.pricing-compare-section-row td {
  padding: 0.7rem 1.15rem;
  background: #dfe9fb;
  color: #000000 !important;
  font-size: 0.8rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
}

.pricing-compare-section-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900 !important;
}

.pricing-compare-table thead th:nth-child(2),
.pricing-compare-table tbody td:nth-child(2) {
  border-left: 0;
}

.pricing-compare-table tbody td {
  border-bottom: 1px solid #e6edf8;
}

.pricing-compare-table tbody td:first-child {
  border-left: 1px solid #e6edf8;
}

.pricing-compare-table tbody td + td {
  border-left: 1px solid #d5dfed;
}

.pricing-compare-table tbody td:last-child {
  border-right: 1px solid #e6edf8;
}

.pricing-compare-table tbody tr:last-child td {
  border-bottom: 1px solid #e6edf8;
}

.pricing-compare-table tbody tr:last-child td:first-child {
  border-bottom-left-radius: 0;
}

.pricing-compare-table tbody tr:last-child td:last-child {
  border-bottom-right-radius: 0;
}

.pricing-compare-label {
  color: #000000;
  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.pricing-compare-label-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  position: relative;
  font-weight: 800;
}

.pricing-compare-label-inner > span:not(.pricing-compare-tooltip) {
  font-weight: 900 !important;
}

.pricing-compare-label-text {
  color: #000000 !important;
  font-weight: 900 !important;
}

.pricing-compare-label-icon {
  width: 1rem;
  min-width: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-size: 0.92rem;
  line-height: 1;
  font-weight: 700;
}

.pricing-compare-tooltip-wrap {
  display: flex;
  width: 100%;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  cursor: help;
  outline: none;
  z-index: 1;
}

.pricing-compare-tooltip-wrap:hover,
.pricing-compare-tooltip-wrap:focus-visible {
  z-index: 500;
}

.pricing-compare-tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: -0.35rem;
  width: min(340px, calc(100vw - 48px));
  min-width: min(240px, calc(100vw - 48px));
  padding: 0.72rem 0.82rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #d9e2f0;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14);
  color: #0f172a;
  font-size: 0.82rem;
  line-height: 1.45;
  font-weight: 500;
  letter-spacing: -0.01em;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 600;
  overflow-wrap: anywhere;
}

.pricing-compare-tooltip::before {
  content: '';
  position: absolute;
  left: 0.85rem;
  top: 100%;
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-right: 1px solid #d9e2f0;
  border-bottom: 1px solid #d9e2f0;
  transform: translateY(-50%) rotate(45deg);
}

.pricing-compare-tooltip-wrap:hover .pricing-compare-tooltip,
.pricing-compare-tooltip-wrap:focus-visible .pricing-compare-tooltip {
  opacity: 1;
  visibility: visible;
}

.pricing-compare-head-tooltip-wrap:hover .pricing-compare-tooltip,
.pricing-compare-head-tooltip-wrap:focus-visible .pricing-compare-tooltip {
  opacity: 1;
  visibility: visible;
}

.pricing-compare-head-tooltip {
  left: 50%;
  transform: translateX(-50%);
  width: min(360px, calc(100vw - 48px));
}

.pricing-compare-head-tooltip::before {
  left: calc(50% - 5px);
}

.pricing-compare-tooltip-wrap.is-bottom .pricing-compare-tooltip {
  top: calc(100% + 0.5rem);
  bottom: auto;
}

.pricing-compare-tooltip-wrap.is-bottom .pricing-compare-tooltip::before {
  top: -6px;
  left: 0.85rem;
  transform: rotate(45deg);
  border-right: none;
  border-bottom: none;
  border-left: 1px solid #d9e2f0;
  border-top: 1px solid #d9e2f0;
}

.pricing-compare-tooltip-wrap.is-top .pricing-compare-tooltip {
  left: 0;
  bottom: calc(100% + 0.35rem);
}

.pricing-compare-table tbody td {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.55;
}

.pricing-compare-table tbody tr:nth-child(odd):not(.pricing-compare-section-row) {
  background: #ffffff;
}

.pricing-compare-table tbody tr:nth-child(even):not(.pricing-compare-section-row) {
  background: #f6f8fb;
}

.pricing-compare-plan-emoji {
  line-height: 1;
}

.pricing-compare-plan-icon {
  font-size: 0.86rem;
  line-height: 1;
}

.pricing-compare-cell {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  min-height: 1.4rem;
}

.pricing-compare-cell-tooltip-wrap {
  display: inline-flex;
  align-items: inherit;
  justify-content: center;
  gap: 0.55rem;
  position: relative;
  cursor: help;
  outline: none;
  z-index: 1;
}

.pricing-compare-cell-tooltip-wrap.is-disabled {
  cursor: default;
}

.pricing-compare-cell-tooltip-wrap:hover,
.pricing-compare-cell-tooltip-wrap:focus-visible {
  z-index: 520;
}

.pricing-compare-cell-tooltip-wrap:hover .pricing-compare-tooltip,
.pricing-compare-cell-tooltip-wrap:focus-visible .pricing-compare-tooltip {
  opacity: 1;
  visibility: visible;
}

.pricing-compare-cell-tooltip {
  left: 50%;
  transform: translateX(-50%);
  width: min(360px, calc(100vw - 48px));
}

.pricing-compare-cell-tooltip::before {
  left: calc(50% - 5px);
}

.pricing-compare-cell-icon {
  min-width: 1.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 800;
}

.pricing-compare-cell.is-positive .pricing-compare-cell-icon {
  color: #15803d;
}

.pricing-compare-cell.is-empty .pricing-compare-cell-icon {
  display: none;
}

.pricing-compare-cell.is-detail .pricing-compare-cell-icon {
  display: none;
}

.pricing-compare-cell.is-positive,
.pricing-compare-cell.is-empty {
  align-items: center;
}

@media (max-width: 1200px) {
  .offer-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stripe-tab,
  .stripe-tab-link {
    font-size: 22px;
  }

  .plan-card h2 {
    font-size: 40px;
  }

  .plan-subcopy {
    font-size: 16px;
  }
}

@media (max-width: 980px) {
  .stripe-tabs {
    flex-wrap: wrap;
    gap: 10px;
    min-height: auto;
    padding: 12px;
  }

  .plan-grid {
    grid-template-columns: 1fr;
  }

  .offer-grid,
  .accompaniment-steps,
  .accompaniment-promises {
    grid-template-columns: 1fr;
  }

  .plan-card {
    padding: 26px;
    transform: none;
  }

  .plan-card:hover,
  .plan-card-growth,
  .plan-card-growth:hover {
    transform: none;
  }

  .offer-selector {
    grid-template-columns: 1fr;
  }

  .offer-detail h4 {
    font-size: 32px;
  }

  .offer-detail p {
    font-size: 18px;
  }

  .offer-detail-table td {
    font-size: 20px;
  }

  .stripe-explorer-grid {
    grid-template-columns: 1fr;
  }

  .stripe-left-nav {
    border-right: none;
    padding-right: 0;
    padding-bottom: 12px;
  }

  .stripe-left-nav::after {
    display: none;
  }

  .stripe-nav-group h4 {
    font-size: 16px;
  }

  .stripe-nav-item {
    font-size: 16px;
  }

  .stripe-right-header h3 {
    font-size: 34px;
  }

  .stripe-right-header p,
  .stripe-bullet-list li,
  .stripe-offer-label p,
  .stripe-offer-value :deep(small) {
    font-size: 17px;
  }

  .stripe-offer-label strong,
  .stripe-offer-value {
    font-size: 26px;
  }

  .custom-pricing-grid {
    grid-template-columns: 1fr;
  }

  .custom-pricing-head {
    flex-direction: column;
  }

  .pricing-compare-head h2 {
    max-width: none;
  }

}

@media (max-width: 700px) {
  .pricing-main {
    width: 100%;
    max-width: 100vw;
    padding: 20px 16px 56px;
    overflow: hidden;
  }

  .pricing-main > *,
  .plan-block,
  .plan-grid,
  .plan-card,
  .offer-section,
  .accompaniment-section,
  .pricing-compare-section,
  .pricing-compare-shell,
  .pricing-compare-table-wrap {
    min-width: 0;
    max-width: 100%;
  }

  .hero-block h1 {
    font-size: 28px;
    white-space: normal;
  }

  .plan-block {
    margin-top: 4px;
    padding-top: 16px;
  }

  .plan-card {
    width: 100%;
    padding: 22px 18px;
    border-radius: 16px;
  }

  .plan-card h2 {
    font-size: 32px;
  }

  .pricing-compare-table-wrap {
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    -webkit-overflow-scrolling: touch;
  }

  .stripe-top-tabs {
    flex-wrap: wrap;
  }

  .stripe-contact-btn {
    margin-left: 0;
  }

  .pricing-compare-section {
    margin-top: 1.6rem;
    padding-bottom: 1.4rem;
  }

  #app .pricing-page .stripe-pricing-explorer {
    margin-top: -16px;
  }

  .pricing-compare-head {
    margin-bottom: 0.9rem;
    padding: 0;
  }

  .pricing-compare-table th,
  .pricing-compare-table td,
  .pricing-compare-section-row td {
    padding-left: 0.9rem;
    padding-right: 0.9rem;
  }
}
</style>
