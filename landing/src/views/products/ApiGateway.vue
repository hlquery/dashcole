<template>
  <div class="landing-page-wrapper">
    <FlowLines />
    <Header :force-header-background-color="'#f7fbff'" />
    <div class="landing-page ecommerce-page">
    <!-- Background Vertical Line - Stripe Style -->
    
    <!-- Hero Section -->
    <section class="hero-section ecommerce-hero">
      <div class="hero-background">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <span class="hero-eyebrow">{{ $t('products_integrations_hero_eyebrow') }}</span>
          <div class="integrations-guide-ribbons" aria-hidden="true"><i></i><i></i><i></i></div>
          <h1 class="hero-title ecommerce-hero-title">{{ $t('products_integrations_hero_title') }}</h1>

          <p class="hero-description animate__animated animate__fadeInUp animate__faster">
            {{ $t('products_integrations_hero_subtitle') }}
          </p>

          <div class="hero-actions animate__animated animate__fadeInUp animate__faster">
            <router-link to="/contact" class="btn-primary" aria-label="Solicitar integración educativa">
              <font-awesome-icon :icon="['fas', 'plug']" class="btn-icon" />
              <span>Solicitar integración</span>
              <span class="btn-chevron">›</span>
            </router-link>

            <a
              :href="docsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary"
              :aria-label="$t('common_read_docs_aria')"
            >
              <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 3h9l3 3v15H6V3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M15 3v4h4" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                <path d="M9 11h6M9 15h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
              <span>{{ $t('common_read_docs') }}</span>
              <span class="btn-chevron">›</span>
            </a>
          </div>

        </div>

        <div class="vertical-divider"></div>

        <div class="hero-visual animate__animated animate__fadeInRight animate__faster">
          <img
            src="/images/banners/integrations.png"
            alt="dashcole integrations"
            class="gateway-integrations-hero-image"
            width="1256"
            height="1256"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>

    <section class="integrations-banner-section" :aria-label="$t('products_api_integrations_aria')">
      <div class="integrations-banner-container">
        <div class="integrations-stack-head">
          <span>{{ $t('products_integrations_stack_eyebrow') }}</span>
          <h2>{{ $t('products_integrations_stack_title') }}</h2>
          <p>{{ $t('products_integrations_stack_description') }}</p>
        </div>
        <div class="integrations-banner-grid integrations-banner-grid-stack">
          <a class="integrations-banner-item" href="https://github.com/dashcole/php-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-php" :icon="['fab', 'php']" />
            <span>PHP</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/perl-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-perl" :icon="['fas', 'terminal']" />
            <span>Perl</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/java-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-java" :icon="['fab', 'java']" />
            <span>Java</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/cpp-api" target="_blank" rel="noopener noreferrer">
            <img src="/images/etc/cplusplus-original.svg" alt="C++" class="integration-logo integration-cpp-img" />
            <span>C++</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/node-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-js" :icon="['fab', 'js']" />
            <span>JavaScript</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/rust-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-rust" :icon="['fab', 'rust']" />
            <span>Rust</span>
          </a>
          <a class="integrations-banner-item" href="https://github.com/dashcole/python-api" target="_blank" rel="noopener noreferrer">
            <font-awesome-icon class="integration-logo integration-python" :icon="['fab', 'python']" />
            <span>Python</span>
          </a>
        </div>
      </div>
    </section>

    <section class="hlog-stream-section" aria-labelledby="hlog-stream-title">
      <div class="hlog-stream-container">
        <article class="hlog-ingest-panel" :aria-label="$t('products_integrations_search_demo_demo_aria')">
          <div class="hlog-ingest-copy">
            <h2 id="hlog-stream-title">{{ $t('products_integrations_search_demo_title') }}</h2>
            <p>{{ $t('products_integrations_search_demo_description') }}</p>
          </div>
          <div class="hlog-ingest-visual" aria-hidden="true">
            <div class="hlog-js-stream-card integration-search-search-card">
              <div class="hlog-js-stream-header integration-live-header">
                <div class="integration-live-brand">
                  <span class="integration-live-mark">h</span>
                  <strong>Live queries</strong>
                </div>
                <span class="integration-live-status"><i></i> Live</span>
              </div>
              <div class="hlog-js-stream-body integration-search-search-body">
                <div class="integration-search-search-input">
                  <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                  <span class="integration-search-query-text">{{ $t('products_integrations_search_demo_query') }}</span>
                  <i class="integration-search-caret"></i>
                  <kbd>⌘ K</kbd>
                </div>
                <div class="integration-search-tabs">
                  <span class="is-active">All</span>
                  <span>Products</span>
                  <span>Images</span>
                </div>
                <p class="integration-search-search-summary">{{ $t('products_integrations_search_demo_search_summary') }}</p>
                <div class="integration-search-search-results">
                  <div class="integration-search-search-result">
                    <div class="integration-search-result-source">
                      <span class="integration-search-result-favicon">S</span>
                      <span><strong>Colegio</strong><small>colegio › evaluaciones</small></span>
                      <i>⋮</i>
                    </div>
                    <h3>{{ $t('products_integrations_search_demo_result_1_title') }}</h3>
                    <p>{{ $t('products_integrations_search_demo_result_1_meta') }}</p>
                  </div>
                  <div class="integration-search-search-result">
                    <div class="integration-search-result-source">
                      <span class="integration-search-result-favicon">S</span>
                      <span><strong>Colegio</strong><small>colegio › materiales</small></span>
                      <i>⋮</i>
                    </div>
                    <h3>{{ $t('products_integrations_search_demo_result_2_title') }}</h3>
                    <p>{{ $t('products_integrations_search_demo_result_2_meta') }}</p>
                  </div>
                  <div class="integration-search-search-result">
                    <div class="integration-search-result-source">
                      <span class="integration-search-result-favicon">S</span>
                      <span><strong>Colegio</strong><small>colegio › comunicaciones</small></span>
                      <i>⋮</i>
                    </div>
                    <h3>{{ $t('products_integrations_search_demo_result_3_title') }}</h3>
                    <p>{{ $t('products_integrations_search_demo_result_3_meta') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section class="hlog-benefits-section" aria-labelledby="hlog-benefits-title">
          <div class="hlog-benefits-copy">
            <div>
              <span class="hlog-benefits-eyebrow">{{ $t('products_integrations_benefits_eyebrow') }}</span>
              <h2 id="hlog-benefits-title">{{ $t('products_integrations_benefits_title') }}</h2>
            </div>
            <p>{{ $t('products_integrations_benefits_description') }}</p>
          </div>
          <div class="hlog-benefits-grid">
            <article class="hlog-benefit-item finance-included-card">
              <div class="finance-included-card-head">
                <span class="finance-included-card-icon finance-included-card-icon-search" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'database']" />
                </span>
                <h3 class="finance-included-card-title">{{ $t('products_integrations_benefit_connect_title') }}</h3>
              </div>
              <ul>
                <li>{{ $t('products_integrations_benefit_connect_item1') }}</li>
                <li>{{ $t('products_integrations_benefit_connect_item2') }}</li>
              </ul>
              <div class="hlog-benefit-flow" aria-hidden="true"></div>
            </article>
            <article class="hlog-benefit-item finance-included-card">
              <div class="finance-included-card-head">
                <span class="finance-included-card-icon finance-included-card-icon-risk" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                </span>
                <h3 class="finance-included-card-title">{{ $t('products_integrations_benefit_search_title') }}</h3>
              </div>
              <ul>
                <li>{{ $t('products_integrations_benefit_search_item1') }}</li>
                <li>{{ $t('products_integrations_benefit_search_item2') }}</li>
              </ul>
              <div class="hlog-benefit-flow" aria-hidden="true"></div>
            </article>
            <article class="hlog-benefit-item finance-included-card">
              <div class="finance-included-card-head">
                <span class="finance-included-card-icon finance-included-card-icon-reporting" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'sliders']" />
                </span>
                <h3 class="finance-included-card-title">{{ $t('products_integrations_benefit_relevance_title') }}</h3>
              </div>
              <ul>
                <li>{{ $t('products_integrations_benefit_relevance_item1') }}</li>
                <li>{{ $t('products_integrations_benefit_relevance_item2') }}</li>
              </ul>
              <div class="hlog-benefit-flow" aria-hidden="true"></div>
            </article>
            <article class="hlog-benefit-item finance-included-card">
              <div class="finance-included-card-head">
                <span class="finance-included-card-icon finance-included-card-icon-data" aria-hidden="true">
                  <font-awesome-icon :icon="['fas', 'server']" />
                </span>
                <h3 class="finance-included-card-title">{{ $t('products_integrations_benefit_operations_title') }}</h3>
              </div>
              <ul>
                <li>{{ $t('products_integrations_benefit_operations_item1') }}</li>
                <li>{{ $t('products_integrations_benefit_operations_item2') }}</li>
              </ul>
              <div class="hlog-benefit-flow" aria-hidden="true"></div>
            </article>
          </div>
        </section>
      </div>
    </section>

    <!-- Developer Section moved to Products ? Integrations -->
    <section class="stripe-dev-section" v-if="false">
      <!-- Diagonal Geometric Shapes (Top Right) -->
      <div class="stripe-diagonals">
        <div class="stripe-diagonal stripe-diag-1"></div>
        <div class="stripe-diagonal stripe-diag-2"></div>
      </div>

      <div class="stripe-container">
        <div class="stripe-main-content">
          <!-- Left: Text Content -->
          <div class="stripe-left-content">
            <div class="stripe-badge">Designed for API engineers</div>
            <h2 class="stripe-main-title">Ship faster with powerful, manageable APIs</h2>
            <p class="stripe-main-desc">
              Save engineering time with unified routing, connector orchestration, and visibility that keep traffic predictable while you innovate.
            </p>
          </div>

          <!-- Right: Code + Terminal -->
          <div class="stripe-right-content">
            <!-- Code Block -->
            <div class="stripe-code-editor">
              <pre class="stripe-code-lines"><code><span class="stripe-line-num">1</span><span class="stripe-code-line"> <span class="stripe-kw">const</span> <span class="stripe-var">stripe</span> = <span class="stripe-kw">require</span>(<span class="stripe-str">'stripe'</span>)(<span class="stripe-str">'sk_test_BQokikJ0vB12H14'</span>);</span>
<span class="stripe-line-num">2</span><span class="stripe-code-line"></span>
<span class="stripe-line-num">3</span><span class="stripe-code-line"> <span class="stripe-kw">await</span> <span class="stripe-var">stripe</span>.<span class="stripe-var">paymentIntents</span>.<span class="stripe-fn">create</span>({</span>
<span class="stripe-line-num">4</span><span class="stripe-code-line">   <span class="stripe-prop">amount</span>: <span class="stripe-num">2000</span>,</span>
<span class="stripe-line-num">5</span><span class="stripe-code-line">   <span class="stripe-prop">currency</span>: <span class="stripe-str">'usd'</span></span>
<span class="stripe-line-num">6</span><span class="stripe-code-line"> });</span></code></pre>
            </div>
            
            <!-- File Tab -->
            <div class="stripe-file-tab">
              <span class="stripe-tab-text">NORMAL server.js</span>
            </div>
            
            <!-- Terminal Output -->
            <div class="stripe-terminal-output">
              <div class="stripe-term-line">
                <span class="stripe-term-prompt">$</span> node server.js && stripe listen
              </div>
              <div class="stripe-term-line">
                <span class="stripe-term-ready">> Ready! Waiting for requests...</span>
              </div>
              <div class="stripe-term-line">
                <span class="stripe-term-date">2025-10-03 12:24:29</span> <span class="stripe-status-200">[200]</span> <span class="stripe-term-event">payment_intent.created</span>
              </div>
              <div class="stripe-term-line">
                <span class="stripe-term-date">2025-10-03 12:24:29</span> <span class="stripe-status-208">[208]</span> <span class="stripe-term-event">charge.succeeded</span>
              </div>
              <div class="stripe-term-line">
                <span class="stripe-term-date">2025-10-03 12:24:29</span> <span class="stripe-status-200">[200]</span> <span class="stripe-term-event">payment_intent.succeeded</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Cards Row (4 Columns) -->
        <div class="stripe-features-grid">
          <div class="stripe-feature-card">
            <div class="stripe-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="url(#stripeGrad1)" stroke-width="2"/>
                <rect x="7" y="7" width="10" height="10" rx="1" fill="url(#stripeGrad1)"/>
              </svg>
              <defs>
                <linearGradient id="stripeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#60a5fa;stop-opacity:1" />
                </linearGradient>
              </defs>
            </div>
            <h3 class="stripe-feature-title">Deploy APIs in every runtime</h3>
            <p class="stripe-feature-description">
              SDKs for React, Go, Python, and mobile keep routing consistent across your entire stack.
            </p>
          </div>

          <div class="stripe-feature-card">
            <div class="stripe-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="url(#stripeGrad2)" stroke-width="2"/>
                <path d="M12 8V12L15 15" stroke="url(#stripeGrad2)" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="2" fill="url(#stripeGrad2)"/>
              </svg>
              <defs>
                <linearGradient id="stripeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
                </linearGradient>
              </defs>
            </div>
            <h3 class="stripe-feature-title">Build intelligent routing</h3>
            <p class="stripe-feature-description">
              Layer semantic search and context into every request for smarter defaults.
            </p>
          </div>

          <div class="stripe-feature-card">
            <div class="stripe-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="url(#stripeGrad3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <defs>
                <linearGradient id="stripeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
                </linearGradient>
              </defs>
            </div>
            <h3 class="stripe-feature-title">Ship ready-to-use connectors</h3>
            <p class="stripe-feature-description">
              Integrations for databases, platform connectors, and observability tools.
            </p>
            <a href="/marketplace" class="stripe-feature-link">
              Browse integration catalog
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>

          <div class="stripe-feature-card">
            <div class="stripe-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#stripeGrad4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="url(#stripeGrad4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="url(#stripeGrad4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <defs>
                <linearGradient id="stripeGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
                </linearGradient>
              </defs>
            </div>
            <h3 class="stripe-feature-title">Build on the dashcole integrations layer</h3>
            <p class="stripe-feature-description">
              Extend the control plane with custom middleware, automations, and branded query experiences.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section: Ready to get started? -->
    <section class="cta-section">
      <div class="cta-light-ray"></div>
      <div class="cta-container">
        <div class="cta-left">
          <h2 class="cta-title">{{ $t('products_api_cta_title') }}</h2>
          <p class="cta-sub">{{ $t('products_api_cta_subtitle') }}</p>
          <div class="cta-actions integrations-cta-actions">
            <router-link to="/contact" class="cta-primary btn-primary">
              <span class="cta-btn-left-icon" aria-hidden="true">
                <font-awesome-icon :icon="['fas', 'envelope']" />
              </span>
              <span>{{ $t('landing_home_cta_contact') }}</span>
              <span class="btn-chevron">›</span>
            </router-link>
          </div>
        </div>
        <div class="cta-right">
          <div class="cta-promo-grid">
            <div class="cta-promo-column">
              <div class="cta-promo-icon">
                  <font-awesome-icon :icon="['fas', 'bolt']" />
              </div>
              <h3 class="cta-promo-title">{{ $t('products_api_cta_col1_title') }}</h3>
              <p class="cta-promo-text">{{ $t('products_api_cta_col1_text1') }}</p>
              <p class="cta-promo-text">{{ $t('products_api_cta_col1_text2') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <teleport to="body">
      <div
        v-if="activeIntegrationKey"
        :style="`position:absolute; left:0; right:0; top:${modalViewportTop}px; height:100vh; z-index:999999; background:#e2e8f0;`"
      >
        <article
          role="dialog"
          aria-modal="true"
          :aria-label="`${integrationModalData.title} guide`"
          style="position:fixed; inset:0; overflow:hidden; background:#e2e8f0; color:#0f172a; font-size:16px; font-family:var(--font-family-sohne, sans-serif); display:flex; align-items:center; justify-content:center; padding:24px;"
        >
          <div class="modal-3d-card" style="width:min(920px, 100%); max-height:calc(100vh - 48px); overflow-y:auto; overflow-x:hidden; background:#ffffff; border:1px solid rgba(148,163,184,.32); border-radius:18px; box-shadow:0 26px 80px rgba(15,23,42,.22);">
            <div style="position:sticky; top:0; z-index:2; display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:22px 24px 18px 24px; min-height:108px; border-bottom:1px solid rgba(148,163,184,.32); background:linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);">
              <div style="min-width:0; padding-top:2px;">
                <p style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; font-weight:700; color:#2563eb; margin:0 0 5px 0;">{{ integrationModalData.badge }}</p>
                <h3 style="font-size:clamp(26px,3vw,36px); line-height:1.2; margin:0; color:#0f172a;">{{ integrationModalData.title }}</h3>
              </div>
              <button
                class="modal-close-btn"
                type="button"
                :aria-label="$t('common_close_integration_guide')"
                @click="closeIntegrationModal"
                style="flex:0 0 auto; width:28px; height:28px; border:none; background:transparent; color:#475569; font-size:20px; line-height:1; font-weight:500; display:inline-flex; align-items:center; justify-content:center; padding:0; border-radius:6px;"
              >×</button>
            </div>
            <div style="max-width:900px; margin:0 auto; padding:20px 24px 28px 24px;">
              <p style="margin:0; color:#334155; line-height:1.7; font-size:17px;">{{ integrationModalData.summary }}</p>
              <p style="margin:18px 0 10px 0; font-weight:700; color:#0f172a;">{{ $t('common_how_teams_ship') }}</p>
              <ul style="margin:0; padding-left:20px; list-style:disc; display:grid; gap:10px;">
                <li
                  v-for="(step, idx) in integrationModalData.steps"
                  :key="`${integrationModalData.title}-${idx}`"
                  style="color:#1e293b; line-height:1.65; padding-left:4px;"
                >
                  {{ step }}
                </li>
              </ul>
              <p style="margin:14px 0 0 0; color:#0f172a; font-weight:400;">{{ integrationModalData.cta }}</p>
            </div>
          </div>
        </article>
      </div>
    </teleport>
    </div>
    <Footer />
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch, ref, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuthStore } from '@/stores/auth'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import FlowLines from '@/components/FlowLines.vue'
import Typed from 'typed.js'
import { 
  faHandPointer, 
  faPlug, 
  faSyncAlt, 
  faShareNodes, 
  faChartLine, 
  faMobileScreen,
  faChartBar,
  faUsers,
  faGear,
  faFileInvoice,
  faBolt,
  faShield,
  faMagnifyingGlass,
  faCircleInfo,
  faCode,
  faImage,
  faTerminal,
  faShoppingCart,
  faInbox,
  faEnvelope,
  faSliders
} from '@fortawesome/free-solid-svg-icons'
import {
  faStripe,
  faGithub,
  faPhp,
  faJava,
  faJs,
  faPython,
  faRust,
  faAws,
  faNodeJs,
  faGolang
} from '@fortawesome/free-brands-svg-icons'
import {
  faDatabase,
  faServer
} from '@fortawesome/free-solid-svg-icons'
library.add(faShoppingCart, faInbox, faEnvelope, faMagnifyingGlass, faUsers, faCircleInfo, faBolt, faShield, faTerminal, faStripe, faGithub, faPhp, faJava, faJs, faPython, faRust, faAws, faNodeJs, faGolang, faDatabase, faServer, faShareNodes, faChartBar, faPlug, faSliders)

export default {
  name: 'LandingPage',
  components: {
    FontAwesomeIcon,
    Header,
    Footer,
    FlowLines
  },
  setup() {
    const { t, locale } = useI18n()
    const authStore = useAuthStore()
    const router = useRouter()
    const docsUrl = 'https://guias.hlquery.com/api-clients/overview'
    const scrollTriggers = []
    const showAdminMenu = ref(false)
    const selectedCountry = ref('us')
    const selectedFinancialTab = ref('transactions')
    const currentDashboardView = ref('dashboard')
    const apiGatewayLanguages = computed(() => [
      {
        key: 'nodejs',
        label: 'Node',
        icon: ['fab', 'node-js'],
        title: t('products_api_example_title'),
        subtitle: t('products_api_example_node_subtitle'),
        badge: 'POST /gateway/printshop/query',
        requestMeta: t('products_api_example_node_request_meta'),
        responseMeta: t('products_api_example_response_meta'),
        heroRequestCode: `const client = new Client('http://localhost:9200', {
  token: process.env.DASHCOLE_TOKEN,
  auth_method: 'bearer'
})

const result = await client.search('printshop_knowledge', {
  q: 'wedding invitation paper',
  query_by: 'title,summary,body',
  filter_by: 'department:prepress && status:published',
  per_page: 2
})`,
        heroResponseCode: `{
  "query": "wedding invitation paper",
  "hits": [
    {
      "id": "print_184",
      "title": "Choosing invitation cardstock",
      "summary": "For wedding invitations, 120 lb cover stock gives a premium feel while staying compatible with most digital presses.",
      "score": 99
    },
    {
      "id": "print_221",
      "title": "Paper weights for formal stationery",
      "summary": "Use 100 lb cover for easier folding and 130 lb cover when rigidity matters more than mailing cost.",
      "score": 96
    }
  ]
}`
      },
      {
        key: 'python',
        label: 'Python',
        icon: ['fab', 'python'],
        title: t('products_api_example_title'),
        subtitle: t('products_api_example_python_subtitle'),
        badge: 'POST /gateway/printshop/query',
        requestMeta: t('products_api_example_python_request_meta'),
        responseMeta: t('products_api_example_response_meta'),
        heroRequestCode: `client = Client('http://localhost:9200', {
    'token': os.environ['DASHCOLE_TOKEN'],
    'auth_method': 'bearer'
})

result = client.search('printshop_knowledge', {
    'q': 'offset ghosting coated stock',
    'query_by': 'title,summary,body',
    'filter_by': 'department:pressroom && status:published',
    'per_page': 2
})`,
        heroResponseCode: `{
  "query": "offset ghosting coated stock",
  "hits": [
    {
      "id": "print_421",
      "title": "Reducing ghosting on offset presses",
      "summary": "Balance ink density, check roller settings, and add solids or screen adjustments to stabilize heavy image areas on coated sheets.",
      "score": 98
    },
    {
      "id": "print_204",
      "title": "Coated stock troubleshooting guide",
      "summary": "Ghosting often improves when water balance is reduced and adjacent non-image areas are reworked in prepress.",
      "score": 95
    }
  ]
}`
      },
      {
        key: 'php',
        label: 'PHP',
        icon: ['fab', 'php'],
        title: t('products_api_example_title'),
        subtitle: t('products_api_example_php_subtitle'),
        badge: 'POST /gateway/printshop/query',
        requestMeta: t('products_api_example_php_request_meta'),
        responseMeta: t('products_api_example_response_meta'),
        heroRequestCode: `$client = new Client('http://localhost:9200', [
    'token' => getenv('DASHCOLE_TOKEN'),
    'auth_method' => 'bearer',
]);

$result = $client->search('printshop_knowledge', [
    'q' => 'cmyk profile uncoated flyers',
    'query_by' => 'title,summary,body',
    'filter_by' => 'department:prepress && status:published',
    'per_page' => 2,
]);`,
        heroResponseCode: `{
  "query": "cmyk profile uncoated flyers",
  "hits": [
    {
      "id": "print_114",
      "title": "Color profiles for uncoated stock",
      "summary": "GRACoL or PSO Uncoated profiles usually produce more reliable ink limits and less muddy color on uncoated flyers.",
      "score": 98
    },
    {
      "id": "print_287",
      "title": "Prepress setup for flyer runs",
      "summary": "Set total ink coverage conservatively and proof skin tones separately before sending uncoated jobs to press.",
      "score": 95
    }
  ]
}`
      },
      {
        key: 'go',
        label: 'Go',
        icon: ['fab', 'golang'],
        title: t('products_api_example_title'),
        subtitle: t('products_api_example_go_subtitle'),
        badge: 'POST /gateway/printshop/query',
        requestMeta: t('products_api_example_go_request_meta'),
        responseMeta: t('products_api_example_response_meta'),
        heroRequestCode: `client := dashcole.NewClient("http://localhost:9200", dashcole.ClientOptions{
    Token:      os.Getenv("DASHCOLE_TOKEN"),
    AuthMethod: "bearer",
})

result, _ := client.Search("printshop_knowledge", map[string]string{
    "q": "tri-fold brochure bleed",
    "query_by": "title,summary,body",
    "filter_by": "department:prepress && status:published",
    "per_page": "2",
})`,
        heroResponseCode: `{
  "query": "tri-fold brochure bleed",
  "hits": [
    {
      "id": "print_884",
      "title": "Bleed and safety margins for brochures",
      "summary": "Use 0.125 inch bleed on all sides and keep text at least 0.1875 inch inside fold and trim lines.",
      "score": 98
    },
    {
      "id": "print_118",
      "title": "Tri-fold layout checklist",
      "summary": "Inside panels should be slightly narrower to fold cleanly, with image backgrounds extended through the bleed.",
      "score": 94
    }
  ]
}`
      },
      {
        key: 'rust',
        label: 'Rust',
        icon: ['fab', 'rust'],
        title: t('products_api_example_title'),
        subtitle: t('products_api_example_rust_subtitle'),
        badge: 'POST /gateway/printshop/query',
        requestMeta: t('products_api_example_rust_request_meta'),
        responseMeta: t('products_api_example_response_meta'),
        heroRequestCode: `let client = Client::new("http://localhost:9200", Some(options))?;
let result = client.search("printshop_knowledge", hashmap! {
    "q".to_string() => "rich black text".to_string(),
    "query_by".to_string() => "title,summary,body".to_string(),
    "filter_by".to_string() => "department:prepress && status:published".to_string(),
    "per_page".to_string() => "2".to_string(),
}).await?;`,
        heroResponseCode: `{
  "query": "rich black text",
  "hits": [
    {
      "id": "print_302",
      "title": "Rich black vs 100K for small text",
      "summary": "Small text should usually be 100K only, because rich black can cause registration issues and fuzzy edges.",
      "score": 99
    },
    {
      "id": "print_119",
      "title": "Preflight rules for typography",
      "summary": "Flag body copy built with multiple CMYK channels so operators can correct it before plates or digital output.",
      "score": 96
    }
  ]
}`
      }
    ])
    const activeApiLanguage = ref(apiGatewayLanguages.value[0].key)
    const activeApiExample = computed(() => {
      return apiGatewayLanguages.value.find((language) => language.key === activeApiLanguage.value) || apiGatewayLanguages.value[0]
    })
    const activeIntegrationKey = ref(null)
    const modalViewportTop = ref(0)
    const integrationModalContent = {
      shopify: {
        badge: 'Search + Delivery',
        title: 'Integrations + dashcole',
        summary: 'Use Integrations and hlog to ingest operational data, enrich metadata, and deliver relevance-tuned responses through one managed dashcole layer.',
        steps: [
          'Use hlog to capture logs, events, and traffic sources as structured ingest payloads.',
          'Map policies, roles, and metadata into searchable schema for each route.',
          'Use webhook events to refresh indexes as services evolve.'
        ],
        cta: 'Launch a secure ingestion and search layer with production-ready routing, policy, and relevance.'
      },
      woocommerce: {
        badge: 'Support + Knowledge',
        title: 'Documentation + dashcole',
        summary: 'Index docs, runbooks, and incidents so operators can find context directly through the integrations layer.',
        steps: [
          'Connect documentation sources, runbooks, and incident channels.',
          'Normalize metadata to keep environment and ownership context searchable.',
          'Schedule incremental syncs so new logs, alerts, and notes show up instantly.'
        ],
        cta: 'Deliver reliable, low-latency answers to developers and operators from one integration surface.'
      },
      magento: {
        badge: 'Cloud Observability',
        title: 'AWS + dashcole',
        summary: 'Unify logs, metrics, and deployment events inside Integrations for relevance-aware incident response.',
        steps: [
          'Ingest CloudWatch, ECS, Lambda, and logging streams into structured collections.',
          'Configure environment-aware ranking so production issues surface first.',
          'Automate retention windows and alert-driven indexing for high-volume systems.'
        ],
        cta: 'Turn cloud operational data into fast, actionable intelligence.'
      },
      bigcommerce: {
        badge: 'Backend Platform',
        title: 'Node.js + dashcole',
        summary: 'Power backend search with flexible ranking controls and low-latency APIs inside Integrations.',
        steps: [
          'Connect Node services and ingest telemetry, events, and documents.',
          'Tune ranking for SLA, latency, and reliability priorities using query-level controls.',
          'Expose one query layer across backend, support tooling, and dashboards.'
        ],
        cta: 'Ship one search and automation platform that scales with your API architecture.'
      },
      squarespace: {
        badge: 'Frontend Experience',
        title: 'Vue + dashcole',
        summary: 'Combine app UI, docs, and internal knowledge so the integrations surface feels native to every channel.',
        steps: [
          'Pull docs, account data, and product content into shared search indexes.',
          'Blend ranking between product intent and documentation relevance signals.',
          'Deploy lightweight Vue components for branded search without a full rewrite.'
        ],
        cta: 'Bridge product and knowledge in a single high-performance integration flow.'
      },
      fallback: {
        badge: 'Integration Guide',
        title: 'dashcole Integration',
        summary: 'Connect your API stack to dashcole with secure indexing, routing, and fast retrieval.',
        steps: [
          'Connect credentials and select scope.',
          'Map fields into searchable schema.',
          'Enable sync and tune relevance.'
        ],
        cta: 'Launch searchable integration experiences quickly with a production-ready query layer.'
      }
    }
    const enrichStep = (step) => {
      const value = String(step || '').trim()
      if (!value) return ''
      if (value.length > 120) return value
      return `${value} This gives your team dependable sync workflows, stronger relevance control, and cleaner search operations as your connector footprint grows.`
    }
    const integrationModalData = computed(() => {
      const modal = integrationModalContent[activeIntegrationKey.value] || integrationModalContent.fallback
      const fallback = integrationModalContent.fallback
      const steps = (Array.isArray(modal.steps) && modal.steps.length ? modal.steps : fallback.steps)
        .map(enrichStep)
      return {
        badge: modal.badge || fallback.badge,
        title: modal.title || fallback.title,
        summary: modal.summary || fallback.summary,
        steps,
        cta: modal.cta || fallback.cta
      }
    })
    const modalScrollKeys = new Set([
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      ' ',
      'Spacebar'
    ])

    const preventModalScroll = (event) => {
      if (!activeIntegrationKey.value) return
      if (event.type === 'keydown' && !modalScrollKeys.has(event.key)) return
      event.preventDefault()
    }

    const lockModalScroll = () => {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      window.addEventListener('wheel', preventModalScroll, { passive: false })
      window.addEventListener('touchmove', preventModalScroll, { passive: false })
      window.addEventListener('keydown', preventModalScroll, { passive: false })
      const lenis = window.__lenis
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop()
      }
    }

    const unlockModalScroll = () => {
      document.body.style.removeProperty('overflow')
      document.documentElement.style.removeProperty('overflow')
      window.removeEventListener('wheel', preventModalScroll)
      window.removeEventListener('touchmove', preventModalScroll)
      window.removeEventListener('keydown', preventModalScroll)
      const lenis = window.__lenis
      if (lenis && typeof lenis.start === 'function') {
        lenis.start()
      }
    }
    const searchQueries = [
      'integration onboarding metrics',
      'search docs api changelog',
      'semantic snippets customer support',
      'integration traffic events'
    ]
    const searchResultPools = [
      [
        { title: 'Vector Search Ranking Pipeline', snippet: 'Semantic ranking with low-latency results.', tag: 'API', source: 'Search Core', kind: 'Realtime', score: '98%', icon: ['fas', 'plug'] },
        { title: 'API Indexing Guide for Incremental Updates', snippet: 'Incremental sync and fast indexing workers.', tag: 'Docs', source: 'Developer Docs', kind: 'Guide', score: '96%', icon: ['fas', 'file-invoice'] }
      ],
      [
        { title: 'Search Docs + APIs in One Endpoint', snippet: 'One request with unified ranking.', tag: 'API', source: 'Gateway', kind: 'Unified', score: '97%', icon: ['fas', 'plug'] },
        { title: 'Keyword + Semantic Matching', snippet: 'Blend lexical and semantic retrieval.', tag: 'Docs', source: 'Ranking', kind: 'Hybrid', score: '95%', icon: ['fas', 'file-invoice'] }
      ],
      [
        { title: 'Semantic Snippet Generation', snippet: 'Concise snippets with highlighted matches.', tag: 'Docs', source: 'AI Search', kind: 'Snippets', score: '96%', icon: ['fas', 'file-invoice'] },
        { title: 'Developer Knowledge Index', snippet: 'Runbooks and docs in milliseconds.', tag: 'Database', source: 'Knowledge Base', kind: 'Search', score: '94%', icon: ['fas', 'database'] }
      ],
      [
        { title: 'Gateway Event Search', snippet: 'Realtime event indexing for operational flows.', tag: 'API', source: 'Gateway', kind: 'JSON', score: '97%', icon: ['fas', 'plug'] },
        { title: 'Account + Usage Retrieval', snippet: 'Usage and account metadata in one query.', tag: 'Data', source: 'Tenant Index', kind: 'Hybrid', score: '93%', icon: ['fas', 'image'] }
      ]
    ]
    const currentSearchQuery = ref(searchQueries[0])
    const typedSearchQuery = ref('')
    const displayedSearchResults = ref(searchResultPools[0].slice(0, 2))
    const searchLatency = ref(12)
    const searchResultCount = ref(2)
    const activeSourceIndex = ref(0)
    let searchDemoTimer = null
    let searchTypingTimer = null
    let searchLatencyTimer = null
    let activeSearchQueryIndex = 0

    const highlightSearchText = (input) => {
      const text = String(input || '')
      const terms = currentSearchQuery.value
        .split(/\s+/)
        .map(term => term.trim())
        .filter(term => term.length > 3)
      if (!terms.length) return text

      let highlighted = text
      terms.forEach(term => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        highlighted = highlighted.replace(new RegExp(`(${escaped})`, 'ig'), '<mark>$1</mark>')
      })
      return highlighted
    }

    const openIntegrationModal = (integrationKey) => {
      modalViewportTop.value = Number(
        window.scrollY ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0
      )
      activeIntegrationKey.value = integrationModalContent[integrationKey] ? integrationKey : 'fallback'
      lockModalScroll()
    }

    const closeIntegrationModal = () => {
      activeIntegrationKey.value = null
      unlockModalScroll()
    }

    const runSearchDemoCycle = (index) => {
      const query = searchQueries[index]
      currentSearchQuery.value = query
      typedSearchQuery.value = ''
      displayedSearchResults.value = searchResultPools[index].slice(0, 2)
      searchResultCount.value = 2
      activeSourceIndex.value = index % 2

      let charIndex = 0
      if (searchTypingTimer) clearInterval(searchTypingTimer)
      searchTypingTimer = setInterval(() => {
        if (charIndex < query.length) {
          typedSearchQuery.value += query.charAt(charIndex)
          charIndex += 1
          return
        }

        clearInterval(searchTypingTimer)
        searchTypingTimer = null
        searchLatency.value = 10 + Math.floor(Math.random() * 7)
        searchDemoTimer = setTimeout(() => {
          activeSearchQueryIndex = (index + 1) % searchQueries.length
          runSearchDemoCycle(activeSearchQueryIndex)
        }, 4900)
      }, 44)
    }

    // Terminal Typed.js instance
    const terminalTyped = ref(null)
    let typedInstance = null
    
    const getTerminalContent = () => ([
      `<span class="terminal-prompt">$</span> curl https://api.hlquery.com/v1/subscriptions \\<br>&nbsp;&nbsp;&nbsp;&nbsp;-u vk_live_...:<br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"data": [{<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "sub_123",<br>&nbsp;&nbsp;&nbsp;&nbsp;"plan": "${t('products_api_terminal_plan_growth')}",<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "${t('products_api_terminal_status_active')}"<br>&nbsp;&nbsp;}],<br>&nbsp;&nbsp;"has_more": false<br>}</span>`,
      `<span class="terminal-prompt">$</span> curl https://api.hlquery.com/v1/accounts \\<br>&nbsp;&nbsp;&nbsp;&nbsp;-u vk_live_...:<br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"data": [{<br>&nbsp;&nbsp;&nbsp;&nbsp;"id": "acct_456",<br>&nbsp;&nbsp;&nbsp;&nbsp;"seats": 28,<br>&nbsp;&nbsp;&nbsp;&nbsp;"status": "${t('products_api_terminal_status_trialing')}"<br>&nbsp;&nbsp;}],<br>&nbsp;&nbsp;"has_more": false<br>}</span>`,
      `<span class="terminal-prompt">$</span> curl https://api.hlquery.com/v1/analytics/mrr \\<br>&nbsp;&nbsp;&nbsp;&nbsp;-u vk_live_...:<br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"${t('products_api_terminal_key_mrr')}": 1254305,<br>&nbsp;&nbsp;"${t('products_api_terminal_key_active_subscriptions')}": 892,<br>&nbsp;&nbsp;"${t('products_api_terminal_key_net_revenue_retention')}": 114.2<br>}</span>`
    ])

    const destroyTerminalTyped = () => {
      if (!typedInstance) return
      typedInstance.destroy()
      typedInstance = null
      if (terminalTyped.value) {
        terminalTyped.value.innerHTML = ''
      }
    }

    const initTerminalTyped = () => {
      if (!terminalTyped.value || typedInstance) return

      typedInstance = new Typed(terminalTyped.value, {
        strings: getTerminalContent(),
        typeSpeed: 25,
        backSpeed: 0,
        backDelay: 1500,
        startDelay: 800,
        loop: true,
        loopCount: Infinity,
        showCursor: true,
        cursorChar: '▋',
        autoInsertCss: false,
        contentType: 'html',
        fadeOut: false,
        fadeOutClass: 'typed-fade-out',
        fadeOutDelay: 0
      })
    }

    watch(() => locale.value, () => {
      destroyTerminalTyped()
      nextTick(() => {
        initTerminalTyped()
      })
    })
    
    // Timer for country rotation
    let countryTimer = null
    let typingInterval = null
    let terminalAnimationTimer = null
    const countries = ['us', 'nl', 'cl', 'jp']
    const countryTabLabels = {
      us: 'USA',
      nl: 'Netherlands',
      cl: 'Chile',
      jp: 'Japan'
    }
    let currentCountryIndex = 0
    
    const rotateCountry = () => {
      currentCountryIndex = (currentCountryIndex + 1) % countries.length
      selectedCountry.value = countries[currentCountryIndex]
    }
    
    // Invoices data for each country
    const invoicesData = {
      us: [
        { number: 'INV-001', date: 'Jan 15, 2024', client: 'Acme Corp', amount: '$1,250.00' },
        { number: 'INV-002', date: 'Jan 20, 2024', client: 'Tech Solutions', amount: '$3,450.00' },
        { number: 'INV-003', date: 'Feb 1, 2024', client: 'Global Inc', amount: '$2,100.00' }
      ],
      nl: [
        { number: 'INV-101', date: '15 Jan 2024', client: 'Euro Corp', amount: '?1,150.00' },
        { number: 'INV-102', date: '20 Jan 2024', client: 'Dutch Tech', amount: '?3,200.00' },
        { number: 'INV-103', date: '1 Feb 2024', client: 'Netherlands Co', amount: '?1,950.00' }
      ],
      cl: [
        { number: 'INV-201', date: '15.01.2024', client: 'Chile Corp', amount: '$450,000 CLP' },
        { number: 'INV-202', date: '20.01.2024', client: 'Tech Chile', amount: '$820,000 CLP' },
        { number: 'INV-203', date: '01.02.2024', client: 'Global CL', amount: '$610,000 CLP' }
      ],
      jp: [
        { number: 'INV-301', date: '2024/01/15', client: 'Tokyo Corp', amount: '?180,000' },
        { number: 'INV-302', date: '2024/01/20', client: 'Osaka Tech', amount: '?450,000' },
        { number: 'INV-303', date: '2024/02/01', client: 'Japan Co', amount: '?320,000' }
      ]
    }
    
    const getInvoicesForCountry = (countryCode) => {
      return invoicesData[countryCode] || invoicesData.us
    }
    
    // Financial Accounts data for each country
    const financialAccountsData = {
      us: {
        balance: '$407,527.32',
        currency: 'USD',
        transactions: [
          { merchant: 'Walmart', date: 'Nov 15', amount: '-$84.84', crypto: '4242.42 USDC' },
          { merchant: 'Kaufland', date: 'Nov 14', amount: '-?72.74', crypto: '4,327.57 USDC' },
          { merchant: 'Tesco', date: 'Nov 13', amount: '-?63.50', crypto: '4,413.80 USDC' },
          { merchant: 'Konbini', date: 'Nov 12', amount: '?12,493.24', crypto: '4,498.59 USDC' }
        ],
        routingNumber: '424242424',
        accountNumber: '???????? 4242',
        cryptoWallet: '0x ???? dE10'
      },
      nl: {
        balance: '?347,892.18',
        currency: 'EUR',
        transactions: [
          { merchant: 'Albert Heijn', date: '15 Nov', amount: '-?84.50', crypto: '3,625.42 USDC' },
          { merchant: 'Jumbo', date: '14 Nov', amount: '-?72.30', crypto: '3,712.18 USDC' },
          { merchant: 'Lidl', date: '13 Nov', amount: '-?65.20', crypto: '3,798.50 USDC' },
          { merchant: 'HEMA', date: '12 Nov', amount: '-?45.90', crypto: '3,884.25 USDC' }
        ],
        routingNumber: 'NL91ABNA0417164300',
        accountNumber: '???????? 4300',
        cryptoWallet: '0x ???? aB12'
      },
      cl: {
        balance: '$28,450,000 CLP',
        currency: 'CLP',
        transactions: [
          { merchant: 'Lider', date: '15 Nov', amount: '-$84,500', crypto: '3,625.42 USDC' },
          { merchant: 'Jumbo', date: '14 Nov', amount: '-$72,300', crypto: '3,712.18 USDC' },
          { merchant: 'Unimarc', date: '13 Nov', amount: '-$65,200', crypto: '3,798.50 USDC' },
          { merchant: 'Tottus', date: '12 Nov', amount: '-$45,900', crypto: '3,884.25 USDC' }
        ],
        routingNumber: 'CL123456789',
        accountNumber: '???????? 7890',
        cryptoWallet: '0x ???? cD34'
      },
      jp: {
        balance: '?52,340,000',
        currency: 'JPY',
        transactions: [
          { merchant: '7-Eleven', date: '11/15', amount: '-?8,450', crypto: '3,625.42 USDC' },
          { merchant: 'FamilyMart', date: '11/14', amount: '-?7,230', crypto: '3,712.18 USDC' },
          { merchant: 'Lawson', date: '11/13', amount: '-?6,520', crypto: '3,798.50 USDC' },
          { merchant: 'AEON', date: '11/12', amount: '-?4,590', crypto: '3,884.25 USDC' }
        ],
        routingNumber: 'JP1234567',
        accountNumber: '???????? 5678',
        cryptoWallet: '0x ???? eF56'
      }
    }
    
    const getFinancialAccountData = (countryCode) => {
      return financialAccountsData[countryCode] || financialAccountsData.us
    }
    
    // Accounting data by country
    const accountingData = {
      us: {
        currency: '$',
        currencyCode: 'USD',
        totalRevenue: 127450,
        totalExpenses: 89320,
        netProfit: 38130,
          transactions: [
            { date: '2024-11-15', description: 'Catalog sync - products index', category: 'success', amount: 12500 },
            { date: '2024-11-14', description: 'Connector timeout retry', category: 'issue', amount: 3200 },
            { date: '2024-11-13', description: 'API ingest - documents batch', category: 'success', amount: 8750 },
            { date: '2024-11-12', description: 'Schema validation warnings', category: 'issue', amount: 450 }
          ]
      },
      nl: {
        currency: '€',
        currencyCode: 'EUR',
        totalRevenue: 115230.5,
        totalExpenses: 82145.75,
        netProfit: 33084.75,
          transactions: [
            { date: '2024-11-15', description: 'Catalog sync - products index', category: 'success', amount: 11250 },
            { date: '2024-11-14', description: 'Connector timeout retry', category: 'issue', amount: 2850 },
            { date: '2024-11-13', description: 'API ingest - documents batch', category: 'success', amount: 8420.5 },
            { date: '2024-11-12', description: 'Schema validation warnings', category: 'issue', amount: 380 }
          ]
      },
      cl: {
        currency: '$',
        currencyCode: 'CLP',
        totalRevenue: 108450000,
        totalExpenses: 76320000,
        netProfit: 32130000,
          transactions: [
            { date: '2024-11-15', description: 'Catalog sync - products index', category: 'success', amount: 12500000 },
            { date: '2024-11-14', description: 'Connector timeout retry', category: 'issue', amount: 3200000 },
            { date: '2024-11-13', description: 'API ingest - documents batch', category: 'success', amount: 8750000 },
            { date: '2024-11-12', description: 'Schema validation warnings', category: 'issue', amount: 450000 }
          ]
      },
      jp: {
        currency: '¥',
        currencyCode: 'JPY',
        totalRevenue: 18450000,
        totalExpenses: 12980000,
        netProfit: 5470000,
          transactions: [
            { date: '2024-11-15', description: 'Catalog sync - products index', category: 'success', amount: 2500000 },
            { date: '2024-11-14', description: 'Connector timeout retry', category: 'issue', amount: 650000 },
            { date: '2024-11-13', description: 'API ingest - documents batch', category: 'success', amount: 1750000 },
            { date: '2024-11-12', description: 'Schema validation warnings', category: 'issue', amount: 80000 }
          ]
      }
    }

    const accountingLocaleConfig = {
      us: {
        locale: 'en-US',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        dateOptions: { year: 'numeric', month: 'short', day: 'numeric' }
      },
      nl: {
        locale: 'nl-NL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        dateOptions: { day: '2-digit', month: 'long', year: 'numeric' }
      },
      cl: {
        locale: 'es-CL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        dateOptions: { day: '2-digit', month: '2-digit', year: 'numeric' }
      },
      jp: {
        locale: 'ja-JP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        dateOptions: { year: 'numeric', month: 'long', day: 'numeric' }
      }
    }
    
    const getAccountingData = (countryCode) => {
      return accountingData[countryCode] || accountingData.us
    }

    const getAccountingLocale = (countryCode) => {
      return accountingLocaleConfig[countryCode] || accountingLocaleConfig.us
    }

    const formatCurrencyForCountry = (countryCode, value, options = {}) => {
      const data = getAccountingData(countryCode)
      const localeConfig = getAccountingLocale(countryCode)

      const formatter = new Intl.NumberFormat(localeConfig.locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        signDisplay: options.signDisplay || 'auto'
      })

      return formatter.format(Number(value) || 0)
    }

    const parseISODate = (value) => {
      if (typeof value !== 'string') return new Date()
      const parts = value.split('-').map(Number)
      if (parts.length === 3) {
        const [year, month, day] = parts
        return new Date(year, month - 1, day)
      }
      return new Date(value)
    }

    const formatAccountingDate = (countryCode, value) => {
      const localeConfig = getAccountingLocale(countryCode)
      const date = parseISODate(value)
      return new Intl.DateTimeFormat(localeConfig.locale, localeConfig.dateOptions).format(date)
    }

    const formatTransactionAmount = (countryCode, amount, category) => {
      const numericAmount = Number(amount) || 0
      const signedAmount = category === 'issue' ? -Math.abs(numericAmount) : Math.abs(numericAmount)
      return formatCurrencyForCountry(countryCode, signedAmount, { signDisplay: 'always' })
    }
    
    // Live analytics data
    const liveSales = ref(245)
    const activeUsers = ref(128)
    let liveDataTimer = null
    let chartAnimationTimer = null
    let analyticsBoxTimer = null
    
    // Chart data for live animation
    const chartPoints = ref([])
    const chartPath = ref('')
    const chartAreaPath = ref('')
    
    // Initialize chart points
    const initChart = () => {
      const points = []
      const width = 400
      const height = 200
      const spacing = 40
      const baseY = 100
      
      for (let i = 0; i < 10; i++) {
        const x = 20 + (i * spacing)
        const y = baseY + (Math.random() * 60 - 30)
        points.push({ x, y })
      }
      chartPoints.value = points
      updateChartPath()
    }
    
    // Update chart path
    const updateChartPath = () => {
      if (chartPoints.value.length === 0) return
      
      let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
      for (let i = 1; i < chartPoints.value.length; i++) {
        const prev = chartPoints.value[i - 1]
        const curr = chartPoints.value[i]
        const midX = (prev.x + curr.x) / 2
        path += ` Q ${prev.x} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2}`
        path += ` T ${curr.x} ${curr.y}`
      }
      chartPath.value = path
      
      // Area path
      const lastPoint = chartPoints.value[chartPoints.value.length - 1]
      const firstPoint = chartPoints.value[0]
      chartAreaPath.value = `${path} L ${lastPoint.x} 200 L ${firstPoint.x} 200 Z`
    }
    
    // Animate chart - move from right to left (more realistic, less movement)
    const animateChart = () => {
      // Shift all points to the left (slower)
      chartPoints.value.forEach(point => {
        point.x -= 0.5
      })
      
      // Add new point on the right (less frequent)
      if (chartPoints.value[0].x < -20) {
        chartPoints.value.shift()
        const newY = 100 + (Math.random() * 40 - 20)
        chartPoints.value.push({ x: 400, y: newY })
      }
      
      // Update Y values slightly for animation (much less variation)
      chartPoints.value.forEach(point => {
        point.y += (Math.random() * 0.5 - 0.25)
        point.y = Math.max(50, Math.min(150, point.y))
      })
      
      updateChartPath()
    }
    
    // Update live numbers
    const updateLiveNumbers = () => {
      // Cambios m?s lentos y realistas
      const salesChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0
      liveSales.value += salesChange
      liveSales.value = Math.max(200, Math.min(300, liveSales.value))
      
      // Cambios m?s lentos para usuarios tambi?n
      const usersChange = Math.random() > 0.75 ? (Math.random() > 0.5 ? 1 : -1) : 0
      activeUsers.value += usersChange
      activeUsers.value = Math.max(100, Math.min(200, activeUsers.value))
    }
    
    // Generate random heights for chart bars with specific higher values for Mon, Tue, and Fri
    const generateRandomHeights = () => {
      const heights = []
      // Mon - higher (60-85%)
      heights[0] = Math.floor(Math.random() * (85 - 60 + 1)) + 60
      // Tue - highest (75-95%)
      heights[1] = Math.floor(Math.random() * (95 - 75 + 1)) + 75
      // Wed - medium (30-60%)
      heights[2] = Math.floor(Math.random() * (60 - 30 + 1)) + 30
      // Thu - medium (35-65%)
      heights[3] = Math.floor(Math.random() * (65 - 35 + 1)) + 35
      // Fri - high (70-90%)
      heights[4] = Math.floor(Math.random() * (90 - 70 + 1)) + 70
      // Sat - low-medium (25-50%)
      heights[5] = Math.floor(Math.random() * (50 - 25 + 1)) + 25
      // Sun - low (15-35%)
      heights[6] = Math.floor(Math.random() * (35 - 15 + 1)) + 15
      return heights
    }
    
    const randomHeights = ref(generateRandomHeights())
    
    // Growth chart live animation
    const growthChartPoints = ref([
      { x: 0, y: 28 },
      { x: 10, y: 26 },
      { x: 20, y: 27 },
      { x: 30, y: 25 },
      { x: 40, y: 23 },
      { x: 50, y: 21 },
      { x: 60, y: 19 },
      { x: 70, y: 17 },
      { x: 80, y: 15 },
      { x: 90, y: 13 },
      { x: 100, y: 12 }
    ])
    const growthChartPath = ref('')
    const growthChartAreaPath = ref('')
    const growthPercentage = ref(18.0)
    let growthChartTimer = null
    let growthPercentageTimer = null
    let percentageUpdateCounter = 0
    
    // Generate smooth path for growth chart
    const updateGrowthChartPath = () => {
      if (growthChartPoints.value.length === 0) return
      
      const points = growthChartPoints.value
      let path = `M ${points[0].x} ${points[0].y}`
      
      // Create smooth curve using quadratic bezier
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        const midX = (prev.x + curr.x) / 2
        path += ` Q ${prev.x} ${prev.y}, ${midX} ${(prev.y + curr.y) / 2}`
        path += ` T ${curr.x} ${curr.y}`
      }
      
      growthChartPath.value = path
      
      // Area path (fill from baseline at y=40)
      const lastPoint = points[points.length - 1]
      const firstPoint = points[0]
      growthChartAreaPath.value = `${path} L ${lastPoint.x} 40 L ${firstPoint.x} 40 Z`
    }
    
    // Animate growth chart - always keep points visible from 0 to 100
    const animateGrowthChart = () => {
      // Shift all points to the left very slowly
      growthChartPoints.value.forEach(point => {
        point.x -= 0.08
      })
      
      // Always ensure we have points covering 0-100 range
      const firstVisiblePoint = growthChartPoints.value.find(p => p.x >= 0)
      const lastVisiblePoint = growthChartPoints.value[growthChartPoints.value.length - 1]
      
      // If we're running out of points on the left, shift all points to start from 0
      if (!firstVisiblePoint || firstVisiblePoint.x > 5) {
        // Reset all points to start from 0, maintaining relative spacing
        const minX = Math.min(...growthChartPoints.value.map(p => p.x))
        const offset = 0 - minX
        growthChartPoints.value.forEach(point => {
          point.x += offset
        })
      }
      
      // Always ensure we have a point at or near 100
      if (!lastVisiblePoint || lastVisiblePoint.x < 95) {
        // Add new point at 100 with slight variation from previous point
        const prevLast = growthChartPoints.value[growthChartPoints.value.length - 1]
        const baseY = prevLast ? prevLast.y : 12
        const newY = Math.max(10, Math.min(35, baseY + (Math.random() * 2 - 1)))
        growthChartPoints.value.push({ x: 100, y: newY })
      }
      
      // Remove points that are far off screen (more than 10 units to the left)
      growthChartPoints.value = growthChartPoints.value.filter(p => p.x > -10)
      
      // Keep reasonable number of points (15-20 for smooth curve)
      if (growthChartPoints.value.length > 20) {
        // Remove oldest points (leftmost)
        growthChartPoints.value.sort((a, b) => a.x - b.x)
        growthChartPoints.value.shift()
      }
      
      // Very subtle variation in Y values for natural movement (much slower)
      growthChartPoints.value.forEach(point => {
        if (point.x >= 0 && point.x <= 100) {
          point.y += (Math.random() * 0.08 - 0.04) // Much smaller variation
          point.y = Math.max(10, Math.min(35, point.y))
        }
      })
      
      // Sort points by x to maintain order
      growthChartPoints.value.sort((a, b) => a.x - b.x)
      
      updateGrowthChartPath()
    }
    
    // Update percentage slowly and naturally (separate timer)
    const updateGrowthPercentage = () => {
      percentageUpdateCounter++
      // Update every 50 calls (about every 10 seconds at 200ms interval)
      if (percentageUpdateCounter >= 50) {
        percentageUpdateCounter = 0
        // Small, natural variation around 18%
        const baseValue = 18.0
        const variation = (Math.random() * 0.5 - 0.25) // ±0.25 variation (más pequeña)
        growthPercentage.value = parseFloat((baseValue + variation).toFixed(1))
      }
    }
    
    // Initialize growth chart path
    updateGrowthChartPath()
    
    // Live dashboard stats
    const liveRevenue = ref(24580)
    const liveUsers = ref(1429)
    const liveOrders = ref(342)
    const revenueChange = ref(12.5)
    const usersChange = ref(8.2)
    const ordersChange = ref(-3.1)
    let dashboardStatsTimer = null
    let chartBarsTimer = null
    
    // Update dashboard stats dynamically
    const updateDashboardStats = () => {
      // Revenue changes
      const revenueDelta = Math.floor(Math.random() * 200 - 100)
      liveRevenue.value = Math.max(20000, Math.min(30000, liveRevenue.value + revenueDelta))
      revenueChange.value = parseFloat((Math.random() * 5 + 10).toFixed(1))
      
      // Users changes
      const usersDelta = Math.floor(Math.random() * 20 - 10)
      liveUsers.value = Math.max(1200, Math.min(1600, liveUsers.value + usersDelta))
      usersChange.value = parseFloat((Math.random() * 3 + 7).toFixed(1))
      
      // Orders changes
      const ordersDelta = Math.floor(Math.random() * 10 - 5)
      liveOrders.value = Math.max(300, Math.min(400, liveOrders.value + ordersDelta))
      ordersChange.value = parseFloat((Math.random() * 6 - 3).toFixed(1))
    }
    
    // Animate chart bars
    const animateChartBars = () => {
      randomHeights.value = generateRandomHeights()
    }
    
    // Format currency for dashboard
    const formatDashboardCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
    
    // Watch for auth changes
    watch(() => authStore.isAuthenticated, (newVal) => {
      // Force reactivity update if auth state changes
    })
    // Helper function to safely create animations with element checks
    const safeGsapFrom = (selector, options) => {
      if (!selector || selector.trim() === '') return null
      
      const elements = document.querySelectorAll(selector)
      if (elements.length === 0) return null
      
      const animation = gsap.from(selector, options)
      if (options.scrollTrigger && animation.scrollTrigger) {
        scrollTriggers.push(animation.scrollTrigger)
      }
      return animation
    }
    
    // CRITICAL FIX: Handle header transparent state - ensure hero doesn't block header
    const handleScrollForHeader = () => {
      const header = document.querySelector('.header.transparent-header')
      const heroSection = document.querySelector('.hero-section')
      
      if (!heroSection) return
      
      if (header) {
        const isAtTop = window.scrollY < 100
        const isHeaderScrolled = header.classList.contains('scrolled')
        
        if (isAtTop && !isHeaderScrolled) {
          // When at top with transparent header (not scrolled), disable ALL hero pointer events
          // This ensures header has absolute priority - hero cannot intercept
          heroSection.style.setProperty('pointer-events', 'none', 'important')
        } else {
          // When scrolled down OR header is scrolled (becomes solid),
          // enable hero events normally so interactive content works
          heroSection.style.removeProperty('pointer-events')
        }
      } else {
        // Header is not transparent, enable hero events normally
        heroSection.style.removeProperty('pointer-events')
      }
    }
    
    onMounted(() => {
      // Initialize terminal Typed.js animation
      nextTick(() => {
        initTerminalTyped()
      })
      
      // Start country rotation timer
      countryTimer = setInterval(rotateCountry, 3000) // Change every 3 seconds
      runSearchDemoCycle(activeSearchQueryIndex)
      searchLatencyTimer = setInterval(() => {
        const jitter = Math.floor(Math.random() * 5) - 2
        const nextLatency = searchLatency.value + jitter
        searchLatency.value = Math.max(9, Math.min(19, nextLatency))
      }, 1200)
      
      // Initialize live chart
      initChart()
      
      // Animate chart every 200ms (slower, more realistic)
      chartAnimationTimer = setInterval(animateChart, 200)
      
      // Update live numbers every 2 seconds
      liveDataTimer = setInterval(updateLiveNumbers, 8000)
      
      // Update dashboard stats every 3 seconds
      dashboardStatsTimer = setInterval(updateDashboardStats, 3000)
      
      // Animate chart bars every 4 seconds
      chartBarsTimer = setInterval(animateChartBars, 4000)
      
      // Animate growth chart continuously (slow and smooth)
      growthChartTimer = setInterval(() => {
        animateGrowthChart()
        updateGrowthPercentage()
      }, 200)
      
      // Restore session from localStorage if present
      const token = localStorage.getItem('token')
      const storedAuthUser = localStorage.getItem('auth_user')
      if (token && storedAuthUser) {
        try {
          const userData = JSON.parse(storedAuthUser)
          // Only set auth if we have valid user data
          if (userData && userData.email) {
            const serverData = localStorage.getItem('server')
            authStore.setAuth(userData, token, serverData ? JSON.parse(serverData) : null)
          }
        } catch (e) {
          // Clear corrupted data
          localStorage.removeItem('auth_user')
          localStorage.removeItem('token')
          localStorage.removeItem('server')
        }
      }
      
      // CRITICAL: Set up scroll listener and MutationObserver for header fix
      const scrollHandler = () => {
        handleScrollForHeader()
      }
      window.addEventListener('scroll', scrollHandler, { passive: true })
      
      // Watch for header class changes (transparent-header, scrolled)
      const header = document.querySelector('.header')
      if (header) {
        const headerObserver = new MutationObserver(() => {
          handleScrollForHeader()
        })
        headerObserver.observe(header, {
          attributes: true,
          attributeFilter: ['class']
        })
        // Store observer for cleanup
        window._landingHeaderObserver = headerObserver
      }
      
      // Store handler for cleanup
      window._landingScrollHandler = scrollHandler
      
      // Check initial state
      setTimeout(() => {
        handleScrollForHeader()
      }, 100)
      
      // Register GSAP ScrollTrigger plugin
      gsap.registerPlugin(ScrollTrigger)
      
      // Hero animations
      gsap.from('.hero-title', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: 'power3.out'
      })
      
      gsap.from('.hero-description', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.3,
        ease: 'power3.out'
      })
      
      gsap.from('.hero-actions', {
        duration: 1,
        y: 30,
        opacity: 0,
        delay: 0.6,
        ease: 'power3.out'
      })
      
      // Floating orbs animation
      gsap.to('.orb-1', {
        duration: 20,
        x: 100,
        y: -100,
        rotation: 360,
        repeat: -1,
        ease: 'none'
      })
      
      gsap.to('.orb-2', {
        duration: 25,
        x: -150,
        y: 80,
        rotation: -360,
        repeat: -1,
        ease: 'none'
      })
      
      gsap.to('.orb-3', {
        duration: 30,
        x: 200,
        y: -50,
        rotation: 180,
        repeat: -1,
        ease: 'none'
      })
      
      // Feature cards - NO animations, appear automatically
      const featureCards = gsap.utils.toArray('.feature-card')
      
      // Set cards to be immediately visible with no animations
      if (featureCards.length > 0) {
        gsap.set(featureCards, { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          visibility: 'visible'
        })
        
        // Icons appear immediately with cards - no animations
        featureCards.forEach((card) => {
          const icon = card.querySelector('.feature-icon')
          if (icon) {
            gsap.set(icon, { 
              opacity: 1, 
              scale: 1, 
              rotation: 0,
              visibility: 'visible'
            })
          }
        })
      }
      
      // Hero terminal animation
      gsap.from('.gateway-terminal-preview', {
        duration: 1.5,
        scale: 0.8,
        opacity: 0,
        delay: 0.5,
        ease: 'power3.out'
      })
      
      // Chart bars animation - crecer de abajo hacia arriba usando height
      const chartBars = document.querySelectorAll('.chart-bar')
      if (chartBars.length > 0) {
        chartBars.forEach((bar, index) => {
          // Obtener la altura original del HTML
          const styleAttr = bar.getAttribute('style') || ''
          const heightMatch = styleAttr.match(/height:\s*(\d+%)/)
          const originalHeightPercent = heightMatch ? heightMatch[1] : null
          
          if (originalHeightPercent) {
            // Iniciar desde altura 0 (las barras est?n en flex-end, as? que crecen desde abajo)
            bar.style.height = '0'
            bar.style.opacity = '0'
            
            // Animar a altura final (crece desde abajo porque el contenedor tiene justify-content: flex-end)
            setTimeout(() => {
              bar.style.transition = 'height 0.6s ease-out, opacity 0.3s ease-out'
              bar.style.height = originalHeightPercent
              bar.style.opacity = '1'
            }, 100 + (index * 80))
          }
        })
      }

      // Global scale section animations - only if elements exist
      const globalScaleSection = document.querySelector('.global-scale-section')
      if (globalScaleSection) {
        // Check if section is already in view (for immediate animation)
        const rect = globalScaleSection.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight * 0.8
        
        const animateElement = (selector, options) => {
          const elements = document.querySelectorAll(selector)
          if (elements.length === 0) return null
          
          // If already in view, animate immediately, otherwise use scroll trigger
          if (isInView) {
            return gsap.from(selector, {
              ...options,
              scrollTrigger: undefined
            })
          } else {
            const animation = gsap.from(selector, options)
            if (options.scrollTrigger && animation.scrollTrigger) {
              scrollTriggers.push(animation.scrollTrigger)
            }
            return animation
          }
        }

        animateElement('.global-scale-label', {
          duration: 0.8,
          y: 20,
          opacity: 0,
          scrollTrigger: {
            trigger: '.global-scale-section',
            start: 'top 80%'
          }
        })

        animateElement('.global-scale-title', {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.2,
          scrollTrigger: {
            trigger: '.global-scale-section',
            start: 'top 80%'
          },
          ease: 'power3.out'
        })

        animateElement('.global-scale-description', {
          duration: 0.8,
          y: 30,
          opacity: 0,
          delay: 0.4,
          scrollTrigger: {
            trigger: '.global-scale-section',
            start: 'top 80%'
          },
          ease: 'power2.out'
        })

        // Animate dashboard card
        animateElement('.dashboard-card', {
          duration: 1.2,
          y: 50,
          opacity: 0,
          delay: 0.3,
          scrollTrigger: {
            trigger: '.global-data-section',
            start: 'top 80%'
          },
          ease: 'power3.out'
        })

        // Animate dashboard metrics
        const metricCards = gsap.utils.toArray('.metric-card')
        if (metricCards.length > 0) {
          metricCards.forEach((card, index) => {
            const animation = gsap.from(card, {
              duration: 0.6,
              scale: 0.8,
              opacity: 0,
              delay: 0.5 + index * 0.1,
              scrollTrigger: {
                trigger: '.global-data-section',
                start: 'top 80%'
              },
              ease: 'back.out(1.7)'
            })
            if (animation.scrollTrigger) {
              scrollTriggers.push(animation.scrollTrigger)
            }
          })
        }
        
        // Animate metric numbers from current value to target value
        const metricNumbers = gsap.utils.toArray('.metric-number')
        metricNumbers.forEach((element) => {
          const currentValue = parseFloat(element.textContent) || 0
          const targetValue = parseFloat(element.getAttribute('data-target') || '0')
          const unitElement = element.nextElementSibling
          const unit = unitElement ? unitElement.textContent : ''
          
          if (targetValue > currentValue) {
            const counter = { value: currentValue }
            gsap.to(counter, {
              value: targetValue,
              duration: 2.5,
              delay: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: '.global-data-section',
                start: 'top 80%',
                once: true
              },
              onUpdate: function() {
                // Format the number based on the unit
                if (unit === 'M+') {
                  element.textContent = Math.round(counter.value)
                } else if (unit === '%') {
                  element.textContent = counter.value.toFixed(1)
                } else {
                  element.textContent = Math.round(counter.value)
                }
              }
            })
          }
        })
        // Chart points are static - no animation for professional look
        
        // Animate bar chart
        const bars = gsap.utils.toArray('.bar')
        if (bars.length > 0) {
          bars.forEach((bar, index) => {
            const animation = gsap.from(bar, {
              duration: 0.8,
              scaleY: 0,
              opacity: 0,
              transformOrigin: 'bottom',
              delay: 1.2 + index * 0.1,
              scrollTrigger: {
                trigger: '.global-data-section',
                start: 'top 80%'
              },
              ease: 'power2.out'
            })
            if (animation.scrollTrigger) {
              scrollTriggers.push(animation.scrollTrigger)
            }
          })
        }

        // Animate global background orbs - only if section exists
        gsap.to('.global-orb-1', {
          duration: 15,
          x: 200,
          y: -150,
          scale: 1.2,
          rotation: 360,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        gsap.to('.global-orb-2', {
          duration: 20,
          x: -180,
          y: 120,
          scale: 0.8,
          rotation: -360,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        gsap.to('.global-orb-3', {
          duration: 18,
          x: 150,
          y: 200,
          scale: 1.1,
          rotation: 240,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        gsap.to('.global-orb-4', {
          duration: 22,
          x: -120,
          y: -100,
          scale: 0.9,
          rotation: -240,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })

        gsap.to('.global-orb-5', {
          duration: 25,
          x: 100,
          y: 150,
          scale: 1.3,
          rotation: 180,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        })
      }

      // Setup click outside handler for admin menu
      clickOutsideHandler = (event) => {
        const adminSection = document.querySelector('.sidebar-admin-section')
        if (adminSection && !adminSection.contains(event.target)) {
          showAdminMenu.value = false
        }
      }
      document.addEventListener('click', clickOutsideHandler)

      modalKeydownHandler = (event) => {
        if (event.key === 'Escape' && activeIntegrationKey.value) {
          closeIntegrationModal()
        }
      }
      document.addEventListener('keydown', modalKeydownHandler)
    })
    // Cleanup ScrollTrigger instances when component unmounts
    onUnmounted(() => {
      // Clear terminal animation
      if (typingInterval) {
        clearInterval(typingInterval)
        typingInterval = null
      }
      if (terminalAnimationTimer) {
        clearTimeout(terminalAnimationTimer)
        terminalAnimationTimer = null
      }
      destroyTerminalTyped()
      
      // Clear country rotation timer
      if (countryTimer) {
        clearInterval(countryTimer)
        countryTimer = null
      }
      if (searchDemoTimer) {
        clearTimeout(searchDemoTimer)
        searchDemoTimer = null
      }
      if (searchTypingTimer) {
        clearInterval(searchTypingTimer)
        searchTypingTimer = null
      }
      if (searchLatencyTimer) {
        clearInterval(searchLatencyTimer)
        searchLatencyTimer = null
      }
      
      // Clear analytics boxes rotation timer
      if (analyticsBoxTimer) {
        clearInterval(analyticsBoxTimer)
        analyticsBoxTimer = null
      }
      
      // Clear dashboard stats timer
      if (dashboardStatsTimer) {
        clearInterval(dashboardStatsTimer)
        dashboardStatsTimer = null
      }
      
      // Clear chart bars animation timer
      if (chartBarsTimer) {
        clearInterval(chartBarsTimer)
        chartBarsTimer = null
      }
      
      // Clear live data timer
      if (liveDataTimer) {
        clearInterval(liveDataTimer)
        liveDataTimer = null
      }
      
      // Clear chart animation timer
      if (chartAnimationTimer) {
        clearInterval(chartAnimationTimer)
        chartAnimationTimer = null
      }
      
      // Clear growth chart animation timer
      if (growthChartTimer) {
        clearInterval(growthChartTimer)
        growthChartTimer = null
      }
      
      // Kill only the ScrollTrigger instances we created
      scrollTriggers.forEach(trigger => {
        if (trigger && trigger.kill) {
          trigger.kill()
        }
      })
      scrollTriggers.length = 0
      
      // Refresh ScrollTrigger to clean up any orphaned instances
      ScrollTrigger.refresh()

      // Remove click outside handler
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler)
      }
      if (modalKeydownHandler) {
        document.removeEventListener('keydown', modalKeydownHandler)
      }
      unlockModalScroll()
    })

    // Admin menu functions
    const toggleAdminMenu = () => {
      showAdminMenu.value = !showAdminMenu.value
    }

    const goToGateway = () => {
      router.push('/productos/integraciones')
    }

    const goToAdmin = () => {
      router.push('/login')
      showAdminMenu.value = false
    }

    const goToAdminUsers = () => {
      router.push('/login')
      showAdminMenu.value = false
    }

    const goToAdminBalances = () => {
      router.push('/login')
      showAdminMenu.value = false
    }

    const goToBlogManagement = () => {
      router.push('/login')
      showAdminMenu.value = false
    }

    // Close admin menu when clicking outside
    let clickOutsideHandler = null
    let modalKeydownHandler = null
    
    return {
      docsUrl,
      randomHeights,
      showAdminMenu,
      selectedCountry,
      countryTabLabels,
      terminalTyped,
      currentDashboardView,
      apiGatewayLanguages,
      activeApiLanguage,
      activeApiExample,
      currentSearchQuery,
      typedSearchQuery,
      displayedSearchResults,
      searchLatency,
      searchResultCount,
      activeSourceIndex,
      highlightSearchText,
      getInvoicesForCountry,
      getFinancialAccountData,
      getAccountingData,
      selectedFinancialTab,
      toggleAdminMenu,
      goToGateway,
      goToAdmin,
      goToAdminUsers,
      goToAdminBalances,
      goToBlogManagement,
      liveSales,
      activeUsers,
      chartPoints,
      chartPath,
      chartAreaPath,
      formatCurrencyForCountry,
      formatAccountingDate,
      formatTransactionAmount,
      liveRevenue,
      liveUsers,
      liveOrders,
      revenueChange,
      usersChange,
      ordersChange,
      formatDashboardCurrency,
      growthChartPath,
      growthChartAreaPath,
      growthPercentage,
      activeIntegrationKey,
      integrationModalData,
      modalViewportTop,
      openIntegrationModal,
      closeIntegrationModal
    }
  }
}
</script>

<style scoped>
/* Wrapper to ensure single root element for transitions */
.landing-page-wrapper {
  display: contents;
}

/* Import TailwindCSS */
/* TailwindCSS is imported globally in main.js */
/* Animate.css is imported globally in main.js */

/* Import Stripe-like fonts */

.landing-page {
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
  overflow-x: hidden;
  font-family: var(--font-family-sohne);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

/* Background Vertical Dashed Line - Stripe Style */
.landing-vertical-line {
  position: absolute;
  left: 50%;
  top: 80px; /* Start after header */
  width: 1px;
  height: calc(100% - 80px);
  transform: translateX(-50%);
  z-index: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 4px,
    rgba(203, 213, 225, 0.3) 4px,
    rgba(203, 213, 225, 0.3) 8px
  );
  background-size: 1px 8px;
  background-repeat: repeat-y;
}

.landing-vertical-line::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 4px,
    rgba(226, 232, 240, 0.4) 4px,
    rgba(226, 232, 240, 0.4) 8px
  );
  background-size: 1px 8px;
  background-repeat: repeat-y;
  opacity: 0.8;
}

/* Ensure all sections are above the background line */
.landing-page > section {
  position: relative;
  z-index: 1;
  background: inherit;
}

.landing-page > section.global-data-section {
  background: #021C34 !important; /* Override inherit for dark blue background */
}

.landing-page > section.sdk-showcase-section {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.12), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%);
}

/* Header z-index is managed by Header component itself */
/* CRITICAL FIX: Ensure no hero content overlaps header area (0-80px from top) */
.hero-section > * {
  position: relative;
  z-index: 1 !important;
}

.hero-section::before,
.hero-section::after,
.hero-background,
.hero-container,
.hero-content,
.hero-visual {
  z-index: 1 !important;
}

/* CRITICAL: Ensure hero section and all children stay BELOW header */
.landing-page {
  position: relative;
  /* Ensure landing page content cannot interfere with header */
}

/* Header zone protection handled by header z-index */

/* Hero Section */
.hero-section {
  min-height: 94vh;
  display: flex;
  align-items: center;
  position: relative;
  padding: 2.2rem 0 2.5rem 0;
  margin-top: 0;
  background:
    radial-gradient(circle at 5% 5%, rgba(37, 99, 235, 0.075), transparent 32%),
    linear-gradient(145deg, #ffffff 0%, #f7f8fa 100%);
  color: #1e293b;
  font-family: var(--font-family-sohne);
  z-index: 1 !important; /* MUCH lower than header (100000) - hero must stay below */
  overflow: hidden;
  isolation: isolate; /* Create stacking context - ensures it stays below header */
  /* CRITICAL: Disable pointer events on the entire hero section - header has priority */
  pointer-events: none !important;
}

/* Hero children - normal z-index, they stay below header */
.hero-section > * {
  position: relative;
  z-index: 1 !important;
}

/* CRITICAL: hero-background is at top - must NOT intercept header events */
.hero-background {
  pointer-events: none !important; /* Background is decorative only - never intercepts */
  z-index: -1 !important; /* Well below everything */
}
/* CRITICAL FIX: Exclusion zone - ensure nothing in hero intercepts header events */
/* The hero-section already has pointer-events: none, so nothing can intercept */
/* This ::before is just for visual backup - must NOT capture events */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px; /* Cover header zone completely */
  z-index: 1 !important; /* Low z-index - well below header */
  pointer-events: none !important; /* CRITICAL: Must NOT capture events - let header receive them */
  background: transparent;
}

/* hero-container is at padding-top: 6rem (96px) - below header, so it's safe */
.hero-container {
  position: relative;
  z-index: 1 !important;
  /* Re-enable pointer events for container since it's below header zone */
  pointer-events: auto !important;
}

/* Re-enable pointer events for all interactive elements inside container */
.hero-container * {
  pointer-events: auto !important;
}


/* Gradient overlay on hero section - must not block header */
.hero-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  pointer-events: none !important; /* CRITICAL: Never block header */
  z-index: 0 !important;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none !important; /* CRITICAL: Ensure background elements don't interfere with header */
}

/* CRITICAL: Ensure all absolute positioned elements in hero stay below header */
.hero-section *[style*="position: absolute"],
.hero-section *[style*="position:fixed"] {
  z-index: 1 !important;
  /* pointer-events handled per element */
}

/* Specifically disable pointer events for gradient orbs - they're decorative */
.hero-background .gradient-orb {
  pointer-events: none !important;
}

/* Note: ::before, ::after, and .hero-background already have correct z-index and pointer-events set above */

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0;
  display: none;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(45deg, #e5e7eb, #d1d5db);
  top: 10%;
  left: 10%;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
  top: 60%;
  right: 10%;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: linear-gradient(45deg, #1e40af, #1d4ed8);
  bottom: 20%;
  left: 50%;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 3rem;
  align-items: center;
  position: relative;
  z-index: 1; /* Lower z-index to ensure it stays below header (which is z-index: 10000) */
  /* CRITICAL: Ensure container content doesn't extend into header area */
  margin-top: 0;
  padding-top: 0;
  /* CRITICAL FIX: Re-enable pointer events only for interactive content */
  pointer-events: auto !important;
}

.hero-content {
  color: #1e293b;
  margin-top: 0;
  align-self: center;
  padding-top: 0;
  max-width: 720px;
  text-align: left;
}

.hero-visual {
  align-self: center;
  margin-top: 0;
  padding-top: 0;
}
.summary-divider {
  height: 1px;
  background: rgba(15, 23, 42, 0.06);
  margin: 6px 0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.payment-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.payment-type {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.payment-number {
  font-size: 13px;
  color: #6b7280;
  letter-spacing: 0.08em;
}

.payment-arrow {
  color: #94a3b8;
}

.purchase-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  font-family: var(--font-family-sohne);
}

.purchase-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
}

.phone-nav-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 18px;
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #64748b;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.nav-item svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 1200px) {
  .hero-device-stack {
    max-width: 720px;
    margin: 0 auto;
  }

  .dashboard-preview-secondary {
    left: -10%;
    transform: scale(0.84) rotate(-3deg);
  }
}

@media (max-width: 1024px) {
  .hero-device-stack {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: auto;
    gap: 1.5rem;
  }

  .dashboard-preview {
    position: relative;
    transform: none;
    max-width: 440px;
    flex: initial;
  }

  .dashboard-preview-secondary {
    position: relative;
    top: 0;
    right: auto;
    left: auto;
    transform: scale(0.9) rotate(-2deg);
    margin-bottom: -1.75rem;
    opacity: 0.95;
    z-index: 1;
    width: 100%;
    max-width: 420px;
  }

  .android-phone-container {
    justify-content: center;
    transform: none;
    max-width: 400px;
  }

  .android-phone {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .hero-device-stack {
    max-width: 100%;
    gap: 1rem;
  }

  .dashboard-preview,
  .dashboard-preview-secondary {
    max-width: 100%;
  }

  .dashboard-preview-secondary {
    transform: scale(0.92) rotate(-1deg);
    margin-bottom: -1.25rem;
  }

  .android-phone-container,
  .android-phone {
    max-width: 100%;
    transform: none;
  }
}

.hero-badge {
  display: inline-block;
  background: rgba(30, 64, 175, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(30, 64, 175, 0.2);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
}

.badge-text {
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  color: #1e40af;
}
.hero-title {
  position: relative;
  display: block;
  font-family: var(--font-family-sohne);
  font-weight: 700;
  font-size: clamp(5rem, 9.4vw, 7.4rem) !important;
  line-height: 0.95 !important;
  margin: 0 0 1.2rem 0 !important;
  letter-spacing: -0.03em;
  color: #0f172a;
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  text-wrap: pretty;
  word-spacing: 0;
  white-space: normal;
  opacity: 0;
  animation: heroTitleReveal 0.75s cubic-bezier(0.25, 0.85, 0.35, 1) forwards;
}

.hero-title::after {
  display: none;
}

.hero-line {
  display: block;
  line-height: inherit;
  white-space: normal;
  margin-bottom: 0;
}
.hero-line:last-child {
  margin-bottom: 0;
  margin-top: -0.02em;
}
.hero-line > span {
  display: inline-block;
  margin-right: 0.16em;
}
.hero-line > span:last-child {
  margin-right: 0;
}

.hero-title-base {
  color: #0f172a;
  text-shadow: none;
  font-weight: 700;
  letter-spacing: -0.028em;
  font-size: 1em;
}

.hero-title-emphasis {
  background: linear-gradient(115deg, #1d4ed8 0%, #2563eb 52%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  text-shadow: none;
  font-weight: 700;
  letter-spacing: -0.028em;
  font-size: 1em;
}

.hero-title-clients {
  color: #0f172a;
  font-size: 1em;
  font-weight: 700;
  letter-spacing: -0.028em;
}

@keyframes heroTitleReveal {
  0% {
    opacity: 0;
    transform: translate3d(0, 36px, -60px) rotateX(12deg);
    filter: saturate(0.8);
  }
  55% {
    opacity: 1;
    transform: translate3d(0, -4px, 8px) rotateX(-2deg);
    filter: saturate(1.1);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotateX(0deg);
    filter: saturate(1);
  }
}

@keyframes heroTitleIdle {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotateX(0deg);
  }
  50% {
    transform: translate3d(0, -5px, 12px) rotateX(-0.6deg);
  }
}

@keyframes heroTitleSheen {
  0%, 35% {
    opacity: 0;
    transform: translateX(-85%) skewX(-14deg);
  }
  45% {
    opacity: 0.8;
  }
  60% {
    opacity: 0;
    transform: translateX(120%) skewX(-14deg);
  }
  100% {
    opacity: 0;
    transform: translateX(120%) skewX(-14deg);
  }
}

.gradient-text {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% 100%;
  animation: gradient-shift 5s ease infinite;
  letter-spacing: -0.025em;
  overflow: visible !important;
  text-overflow: clip;
  padding: 0 !important;
  margin: 0 !important;
  word-spacing: 0.02em;
  white-space: nowrap;
}

/* Efecto appear suave en Custom */
.custom-appear {
  opacity: 1;
  animation: none;
}

@keyframes customAppear {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glow sweep effect - solo en shimmer-text (Beautiful/Custom) */
.shimmer-text {
  position: relative;
}

.shimmer-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(59, 130, 246, 0.9) 25%,
    rgba(14, 165, 233, 1) 50%,
    rgba(236, 72, 153, 1) 75%,
    rgba(59, 130, 246, 0.9) 100%,
    transparent 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: glow-sweep-improved 1.5s ease-out forwards;
  animation-delay: 0.4s;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  filter: blur(0.3px);
}

.shimmer-text::after {
  content: '';
  position: absolute;
  top: 0;
  left: -150%;
  width: 70%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.8),
    rgba(59, 130, 246, 1),
    rgba(14, 165, 233, 1),
    rgba(236, 72, 153, 1),
    rgba(59, 130, 246, 1),
    rgba(255, 255, 255, 0.8),
    transparent
  );
  animation: glow-sweep-fast 1s ease-out forwards;
  animation-delay: 0.5s;
  z-index: 2;
  opacity: 0;
  filter: blur(1px);
  pointer-events: none;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes stripeGlowIntro {
  0% {
    opacity: 0;
    transform: translate3d(-24px, 16px, 0) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes stripeGlowDrift {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(14px, -10px, 0) scale(1.04);
  }
}
@keyframes stripeGlowSweep {
  0% {
    opacity: 0;
    transform: translateX(-65%) skewX(-10deg);
  }
  20% {
    opacity: 0.85;
  }
  100% {
    opacity: 0;
    transform: translateX(115%) skewX(-10deg);
  }
}

@keyframes glow-sweep-improved {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes glow-sweep-fast {
  0% {
    left: -150%;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    left: 150%;
    opacity: 0;
  }
}

.hero-description {
  font-size: 1.08rem;
  line-height: 1.68;
  margin-bottom: 2rem;
  opacity: 0.92;
  color: #334155;
  font-weight: 400;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  max-width: 40rem;
  margin-left: 0;
  margin-right: 0;
}

.hero-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, max-content));
  gap: 1rem;
  margin-bottom: 3rem;
  width: auto;
  max-width: none;
  margin-left: 0;
  margin-right: 0;
  justify-items: start;
  align-items: stretch;
  margin-left: 0;
  margin-right: 0;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.9rem 1.9rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  cursor: pointer;
  border: none;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  text-decoration: none;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff !important;
  box-shadow:
    0 14px 30px rgba(37, 99, 235, 0.28),
    0 6px 16px rgba(29, 78, 216, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.btn-primary *,
.btn-primary span,
.btn-primary svg {
  color: #ffffff !important;
  fill: #ffffff !important;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: none;
  opacity: 0;
  pointer-events: none;
}

.btn-chevron {
  font-size: 1.2rem;
  line-height: 1;
  transition: transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  margin-left: 0.15rem;
}

.btn-primary:hover .btn-chevron,
.btn-secondary:hover .btn-chevron {
  transform: translateX(4px);
}

.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  box-shadow:
    0 18px 36px rgba(30, 64, 175, 0.34),
    0 12px 24px rgba(29, 78, 216, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.btn-primary:hover::before {
  opacity: 0;
}

.btn-secondary {
  background: linear-gradient(145deg, #f4f6fb 0%, #e2e6f0 100%);
  color: #1f2a44;
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.16),
    0 6px 16px rgba(148, 163, 184, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.btn-secondary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0) 65%);
  opacity: 1;
  pointer-events: none;
}

.btn-secondary:hover {
  transform: translateY(-3px) scale(1.015);
  box-shadow:
    0 18px 34px rgba(15, 23, 42, 0.22),
    0 10px 20px rgba(148, 163, 184, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.92);
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
  align-items: start;
  width: 100%;
  max-width: 640px;
  margin: 0;
}

.hero-stats .stat-item {
  text-align: center;
  min-width: 0;
  padding: 0;
}

.stat-icon-wrap {
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.38rem;
  background: transparent;
}

.stat-icon {
  font-size: 0.82rem;
  color: #0f172a;
}

.hero-stats .stat-number {
  font-size: 1.62rem;
  font-weight: 780;
  color: #111827;
  margin-bottom: 0.12rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.03em;
  line-height: 1;
}

.hero-stats .stat-label {
  font-size: 0.76rem;
  opacity: 0.92;
  color: #475569;
  font-family: var(--font-family-sohne);
  font-weight: 650;
  letter-spacing: 0;
  text-transform: none;
}

/* Dashboard Preview - Modern Stripe-like Style */
.hero-visual {
  display: flex !important;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 1; /* Lower z-index to ensure it stays below header */
  min-height: 450px;
  padding: 0;
  align-self: start;
  margin-top: 0;
}

.dashboard-preview {
  background: linear-gradient(160deg, #ffffff 0%, #f8fafc 62%, #eff6ff 100%) !important;
  border: 1px solid rgba(148, 163, 184, 0.28) !important;
  border-radius: 20px !important;
  box-shadow: 0 34px 72px rgba(15, 23, 42, 0.16), 0 10px 28px rgba(15, 23, 42, 0.08) !important;
  position: relative !important;
  overflow: hidden !important;
  max-width: 760px;
  width: 100%;
  transform: scale(0.99) !important;
}


/* tone down animated borders */
.dashboard-preview::before,
.dashboard-preview::after { display: none !important; }

.preview-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  padding: 0;
}

/* make links look like items */
.preview-sidebar a.sidebar-item { text-decoration: none; color: inherit; }

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding: 0.62rem 0.9rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.24);
  background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
}

.preview-toolbar-left {
  display: inline-flex;
  align-items: center;
  gap: 0.44rem;
}

.toolbar-brand {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #0f172a;
}

.toolbar-status {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
  background: #ccfbf1;
  border: 1px solid #5eead4;
  border-radius: 999px;
  padding: 0.12rem 0.34rem;
}

.preview-toolbar-right {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}

.toolbar-tab {
  font-size: 0.58rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-weight: 700;
  color: #64748b;
  border-radius: 999px;
  padding: 0.14rem 0.38rem;
  border: 1px solid transparent;
  background: transparent;
}

.toolbar-tab.active {
  color: #1e3a8a;
  border-color: #c7d2fe;
  background: #eff6ff;
}

.preview-title { display: none; }

.preview-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  padding: 1rem 0.75rem;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #1e293b 100%);
  border-radius: 0;
  border: none;
  width: 200px;
  margin: 0;
}

.sidebar-item {
  min-height: 36px;
  background: transparent;
  border-radius: 6px;
  border: none;
  transition: none;
  position: relative;
  overflow: hidden;
  box-shadow: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.5rem;
}

.sidebar-item.active {
  background: rgba(75, 85, 99, 0.25);
  border: 1px solid rgba(107, 114, 128, 0.3);
  box-shadow: 0 2px 8px rgba(75, 85, 99, 0.15);
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  color: rgba(156, 163, 175, 0.8);
  flex-shrink: 0;
}

.sidebar-item.active .sidebar-icon {
  color: rgba(209, 213, 219, 0.9);
  filter: drop-shadow(0 0 4px rgba(147, 197, 253, 0.4));
}

/* Favicon support for sidebar icons */
.sidebar-favicon {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: contain;
  filter: brightness(0.7) contrast(0.9);
  transition: all 0.2s ease;
}

.sidebar-item.active .sidebar-favicon {
  filter: brightness(1.1) contrast(1.1);
  opacity: 1;
}

.sidebar-item:hover .sidebar-favicon {
  filter: brightness(0.9) contrast(1);
}

.sidebar-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(156, 163, 175, 0.85);
  text-align: left;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  line-height: 1.2;
  position: relative;
  z-index: 1;
  margin-top: 0;
}
.sidebar-item.active .sidebar-label {
  color: rgba(209, 213, 219, 0.95);
  font-weight: 600;
  text-shadow: 0 0 8px rgba(147, 197, 253, 0.3);
}

/* Admin Menu - Inside Sidebar */
.sidebar-admin-section {
  margin-top: auto;
  padding-top: 0.75rem;
  padding-bottom: 0.5rem;
  position: relative;
  z-index: 10; /* Ensure it's above revenue banner */
}

.sidebar-admin-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.3), transparent);
  margin: 0 0 0.75rem 0;
}

.sidebar-admin-item {
  cursor: default !important; /* Not clickeable */
  pointer-events: none !important; /* Disable all interactions */
}

.sidebar-admin-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 240px;
  background: #ffffff;
  border: 2px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4),
              0 4px 8px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  animation: sidebarAdminDropdownSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

@keyframes sidebarAdminDropdownSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-admin-dropdown-header {
  padding: 14px 16px 12px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #ffffff;
  border-bottom: 2px solid #1e40af;
}

.sidebar-admin-dropdown-title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.sidebar-admin-dropdown-subtitle {
  font-size: 10px;
  opacity: 0.9;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 500;
}

.sidebar-admin-dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  margin: 0;
}

.sidebar-admin-dropdown-items {
  padding: 6px;
  background: #ffffff;
}

.sidebar-admin-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: #1f2937;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.sidebar-admin-dropdown-item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  transform: translateX(3px);
  box-shadow: 0 1px 3px rgba(30, 64, 175, 0.1);
}

.sidebar-admin-dropdown-item:active {
  transform: translateX(2px);
}

.sidebar-admin-dropdown-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(30, 64, 175, 0.1);
  border-radius: 5px;
  color: #1e40af;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sidebar-admin-dropdown-item:hover .sidebar-admin-dropdown-item-icon {
  background: rgba(30, 64, 175, 0.15);
  transform: scale(1.1);
}

.sidebar-admin-dropdown-item-icon svg {
  width: 16px;
  height: 16px;
}

.preview-main {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 0.88rem;
  background: #ffffff;
  border-radius: 0;
}

.search-engine-preview {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  background: linear-gradient(160deg, #ffffff 0%, #f8fafc 56%, #eff6ff 100%);
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 16px;
  padding: 1.05rem;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.82);
  min-height: 346px;
  height: 346px;
  max-height: 346px;
  overflow: hidden;
  contain: layout paint;
}

.search-engine-bar {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.68rem;
  border: 1px solid rgba(100, 116, 139, 0.32);
  border-radius: 999px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 0.68rem 0.74rem 0.68rem 0.92rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  min-height: 54px;
}

.search-engine-icon {
  color: #0f172a;
  font-size: 0.85rem;
}

.search-engine-bar span {
  flex: 1;
  font-size: 0.82rem;
  color: #334155;
  letter-spacing: -0.01em;
  min-width: 0;
}

.search-shortcut {
  flex: 0 0 auto !important;
  font-size: 0.58rem !important;
  font-weight: 700;
  color: #64748b !important;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.1rem 0.34rem;
  background: #f8fafc;
}

.search-engine-source-icons {
  display: inline-flex;
  gap: 0.3rem;
  align-items: center;
}

.source-icon-chip {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.66rem;
  transition: all 0.2s ease;
}

.source-icon-chip.active {
  background: linear-gradient(145deg, #111827 0%, #0f172a 100%);
  border-color: #0f172a;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.35);
}

.search-engine-btn {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
}

.search-filter-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
}

.search-engine-filters {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.engine-filter {
  border: 1px solid #dbe3ee;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.52rem;
  color: #475569;
  background: #f8fafc;
}

.engine-filter.active {
  color: #1e3a8a;
  background: #eff6ff;
  border-color: #c7d2fe;
}

.search-engine-results {
  display: grid;
  gap: 0.75rem;
  grid-template-rows: repeat(2, minmax(102px, 1fr));
  min-height: 222px;
  max-height: 222px;
  overflow: hidden;
  padding-right: 0.15rem;
  align-content: start;
}

.engine-result {
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 0.68rem 0.75rem;
  min-height: 102px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.engine-result:hover {
  background: #ffffff;
  border-color: #94a3b8;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.engine-result h4 {
  margin: 0 0 0.22rem 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #0f172a;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.engine-result-title-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.4rem;
  align-items: center;
}

.engine-result-type {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
  color: #0c4a6e;
  font-size: 0.62rem;
}

.engine-score {
  font-size: 0.6rem;
  color: #111827;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  border-radius: 999px;
  padding: 0.14rem 0.38rem;
}

.engine-result p {
  margin: 0;
  font-size: 0.67rem;
  color: #475569;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.search-engine-results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.67rem;
  color: #64748b;
  margin-top: -0.05rem;
}

.search-latency {
  min-width: 44px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.search-engine-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.engine-meta-live {
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #166534;
  font-weight: 700;
  background: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: 999px;
  padding: 0.1rem 0.35rem;
}

.engine-meta-pill {
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #334155;
  font-weight: 700;
  background: #f8fafc;
  border: 1px solid #dbe3ee;
  border-radius: 999px;
  padding: 0.1rem 0.35rem;
}

.search-suggestion {
  font-size: 0.66rem;
  color: #64748b;
  margin-top: -0.1rem;
  line-height: 1.2;
  min-height: 0.8rem;
  height: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-query-text {
  display: block;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-cursor {
  color: #111827;
  font-weight: 700;
  animation: searchCursorBlink 0.95s steps(1, end) infinite;
}

mark {
  background: #dbeafe;
  color: #1e3a8a;
  border-radius: 4px;
  padding: 0 2px;
}

@keyframes searchCursorBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.engine-result-meta {
  display: flex;
  gap: 0.32rem;
  margin-top: 0.4rem;
  flex-wrap: nowrap;
  min-width: 0;
  overflow: hidden;
}

.engine-result-meta span {
  border: 1px solid #dbe3ee;
  background: #f8fafc;
  border-radius: 999px;
  padding: 0.13rem 0.38rem;
  font-size: 0.58rem;
  color: #334155;
  font-weight: 700;
}

.preview-feature-banner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  border: 1px solid rgba(59, 130, 246, 0.18);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.05) 100%);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.08);
  position: relative;
  overflow: hidden;
}

.preview-feature-banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.preview-feature-banner.is-positive::after {
  opacity: 1;
}

.banner-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-size: 1rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.preview-feature-banner.is-positive .banner-icon {
  background: rgba(34, 197, 94, 0.18);
  color: #16a34a;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.banner-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.banner-subtitle {
  font-size: 0.72rem;
  color: #475569;
  line-height: 1.3;
  letter-spacing: -0.005em;
}

.banner-metric {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  font-weight: 600;
}

.metric-value {
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  color: #1d4ed8;
}

.metric-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(15, 23, 42, 0.65);
}

.preview-feature-banner.is-positive .metric-value {
  color: #16a34a;
}

.banner-progress {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.25rem;
  margin-top: -0.1rem;
}

.progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.5);
  transition: all 0.2s ease;
}

.progress-dot.active {
  background: #2563eb;
  width: 16px;
}

/* Stats Row */
.preview-stats-row {
  display: flex;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
  position: relative;
  align-items: flex-start;
}

.preview-main .preview-stat-item,
.dashboard-preview .preview-stat-item,
.preview-content .preview-stat-item {
  flex: 1;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
  background-color: #f3f4f6 !important;
  border: 1px solid #d1d5db !important;
  border-color: #d1d5db !important;
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
  position: relative;
  transform: translateY(0) perspective(1000px) rotateX(0deg);
}

.preview-stat-item:first-child {
  z-index: 3;
}

.preview-stat-item:nth-child(2) {
  z-index: 2;
}

.preview-stat-item:nth-child(3) {
  z-index: 1;
}

.preview-stat-item:hover {
  transform: translateY(-4px) perspective(1000px) rotateX(2deg) scale(1.02);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  border-color: #9ca3af !important;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%) !important;
}

.preview-stat-item .stat-label {
  font-size: 0.625rem;
  color: #6b7280 !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.375rem;
  font-family: var(--font-family-sohne);
}

.preview-stat-item .stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: #374151 !important;
  margin-bottom: 0.25rem;
  font-family: var(--font-family-sohne);
}

.preview-stat-item .stat-value.live-number {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  letter-spacing: -0.02em;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.preview-stat-item .stat-value.live-number:hover {
  transform: scale(1.05);
}

.stat-change {
  font-size: 0.625rem;
  font-weight: 600;
  font-family: var(--font-family-sohne);
}

.stat-change.positive {
  color: #3b82f6;
  font-weight: 700;
}

.stat-change.negative {
  color: #ef4444;
}

/* Chart Container */
.preview-chart-container {
  margin-bottom: 0.75rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
  padding: 0 0.25rem;
}

.chart-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #0f172a;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.chart-filter {
  font-size: 0.6875rem;
  color: #64748b;
  font-weight: 500;
  padding: 0.25rem 0.625rem;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 6px;
  font-family: var(--font-family-sohne);
}

.preview-chart {
  height: 160px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%);
  border: 1.5px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  padding: 0.875rem 1rem 0.5rem 1rem;
  position: relative;
  overflow: visible;
  box-shadow: 
    inset 0 1px 2px rgba(255, 255, 255, 0.8),
    0 1px 3px rgba(59, 130, 246, 0.08);
  display: flex;
  flex-direction: column;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 0;
  margin: 0;
  margin-top: auto;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  height: 100%;
  position: relative;
  padding: 0;
  margin: 0;
}
.chart-bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #2563eb, #1d4ed8) !important;
  border-radius: 6px 6px 0 0 !important;
  min-height: 4px !important;
  position: relative !important;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease !important;
  box-shadow: 
    0 2px 8px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(59, 130, 246, 0.25);
  cursor: pointer;
  overflow: visible !important;
  opacity: 1 !important;
  align-self: flex-end;
  padding: 0 !important;
  margin: 0 !important;
  transform-origin: bottom center;
}

.chart-bar:hover {
  transform: scaleY(1.05);
  box-shadow: 
    0 4px 12px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
}

@keyframes barGrow {
  from {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: bottom center;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: bottom center;
  }
}

.chart-bar-label {
  font-size: 0.5625rem;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  font-family: var(--font-family-sohne);
  margin: 0;
  padding: 0;
}
.chart-line-overlay {
  position: absolute;
  bottom: 1.5rem;
  left: 1rem;
  right: 1rem;
  height: 60%;
  z-index: 1;
  pointer-events: none;
}

.chart-line-path {
  animation: lineDraw 1.2s ease-out forwards;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke: #3b82f6;
}

@keyframes lineDraw {
  to {
    stroke-dashoffset: 0;
  }
}

.chart-area-path {
  animation: areaFill 1.5s ease-out forwards;
  opacity: 0;
  animation-delay: 0.5s;
}

@keyframes areaFill {
  to {
    opacity: 1;
  }
}

/* Different colors for each bar */
.chart-bar.bar-1 { 
  background: linear-gradient(to top, #ef4444, #dc2626, #b91c1c) !important;
  border-color: rgba(239, 68, 68, 0.25) !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-2 { 
  background: linear-gradient(to top, #3b82f6, #2563eb, #1d4ed8) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-3 { 
  background: linear-gradient(to top, #10b981, #059669, #047857) !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-4 { 
  background: linear-gradient(to top, #f59e0b, #d97706, #b45309) !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-5 { 
  background: linear-gradient(to top, #3b82f6, #2563eb, #1e40af) !important;
  border-color: rgba(14, 165, 233, 0.25) !important;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-6 { 
  background: linear-gradient(to top, #ec4899, #db2777, #be185d) !important;
  border-color: rgba(236, 72, 153, 0.25) !important;
  box-shadow: 0 2px 8px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar.bar-7 { 
  background: linear-gradient(to top, #06b6d4, #0891b2, #0e7490) !important;
  border-color: rgba(6, 182, 212, 0.25) !important;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.chart-bar:hover {
  transform: translateY(-4px) scaleY(1.05) !important;
  box-shadow: 
    0 6px 16px rgba(59, 130, 246, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
  border-color: rgba(59, 130, 246, 0.5);
}

.chart-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, transparent, rgba(255, 255, 255, 0.4));
  border-radius: 6px 6px 0 0;
  pointer-events: none;
}

.chart-bar::after {
  content: '';
  position: absolute;
  top: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chart-bar:hover::after {
  opacity: 1;
}

/* Mini Charts */
.preview-mini-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.mini-chart-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  padding: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.mini-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.mini-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
}

.mini-chart-title {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}

.mini-chart-badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  background: rgba(241, 245, 249, 0.8);
  color: #64748b;
  font-family: var(--font-family-sohne);
}

.mini-chart-badge.positive {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.mini-line-chart {
  height: 50px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 0;
}

.mini-line-chart svg {
  width: 100%;
  height: 100%;
  display: block;
}

.growth-chart-line {
  transition: d 0.5s ease-out;
  vector-effect: non-scaling-stroke;
}

.growth-chart-area {
  transition: d 0.5s ease-out;
}

.live-percentage {
  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-block;
  min-width: 3.5em;
  text-align: right;
}

.mini-pie-chart {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-pie-chart svg {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.pie-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.625rem;
  color: #64748b;
  font-weight: 600;
  font-family: var(--font-family-sohne);
}

.pie-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}

/* Activity Feed */
.preview-activity {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1.5px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  padding: 0.75rem;
}

.activity-header {
  font-size: 0.6875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  flex-shrink: 0;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.125rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.activity-time {
  font-size: 0.5625rem;
  color: #94a3b8;
  font-weight: 500;
  font-family: var(--font-family-sohne);
}

/* Analytics View Styles */
.analytics-main {
  padding: 1.5rem !important;
  background: #ffffff;
  overflow-y: auto;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.analytics-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.analytics-period {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.analytics-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.analytics-stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.analytics-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.analytics-stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.analytics-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
  letter-spacing: -0.02em;
}

.analytics-stat-change {
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.analytics-stat-change.positive {
  color: #10b981;
}

.analytics-stat-change.negative {
  color: #ef4444;
}

.analytics-stat-chart {
  height: 30px;
  margin-top: 0.5rem;
}

.analytics-stat-chart svg {
  width: 100%;
  height: 100%;
}

.analytics-charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
}

.analytics-chart-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.analytics-chart-card.large {
  grid-column: span 2;
}

.analytics-chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.analytics-chart-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.analytics-chart-legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.analytics-chart-content {
  height: 200px;
}

.analytics-chart-content svg {
  width: 100%;
  height: 100%;
}

.sales-channel-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sales-channel-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.channel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.channel-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
}

.channel-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.channel-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.channel-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.channel-percent {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.product-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.product-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.product-sales {
  font-size: 0.75rem;
  color: #64748b;
}

.product-revenue {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
}

.preview-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.preview-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%) !important;
  border: 1.5px solid rgba(226, 232, 240, 0.6) !important;
  border-radius: 14px !important;
  padding: 1.125rem !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.875rem !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  overflow: hidden !important;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
}

.preview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.08), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-card:hover::before {
  left: 100%;
}

.preview-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-card:hover::after {
  transform: scaleY(1);
}

.preview-card:hover {
  transform: translateY(-3px) !important;
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

.card-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.preview-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
}

.card-content {
  color: #0f172a;
  flex: 1;
}

.card-title {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.375rem;
  font-family: var(--font-family-sohne);
  font-weight: 500;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card-value {
  font-size: 1.25rem !important;
  font-weight: 700 !important;
  font-family: var(--font-family-sohne) !important;
  letter-spacing: -0.02em !important;
  background: linear-gradient(135deg, #3b82f6, #2563eb, #1d4ed8) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  line-height: 1.2 !important;
}

/* Beautiful Dividers */
.gradient-divider {
  height: 120px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

.divider-wave {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #3b82f6 20%, 
    #2563eb 40%, 
    #10b981 60%, 
    #f59e0b 80%, 
    transparent 100%
  );
  transform: translateY(-50%);
}

.divider-wave::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(59, 130, 246, 0.3) 20%, 
    rgba(37, 99, 235, 0.3) 40%, 
    rgba(16, 185, 129, 0.3) 60%, 
    rgba(245, 158, 11, 0.3) 80%, 
    transparent 100%
  );
  filter: blur(2px);
}
.animated-divider {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 0 2rem;
}

.divider-dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.divider-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  animation: pulse-dot 2s ease-in-out infinite;
}

.divider-dots .dot:nth-child(2) {
  animation-delay: 0.3s;
}

.divider-dots .dot:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.geometric-divider {
  height: 100px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.geometric-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  top: 20px;
  left: 20%;
  animation: float-shape 6s ease-in-out infinite;
}

.shape-2 {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #10b981, #059669);
  top: 40px;
  right: 25%;
  animation: float-shape 8s ease-in-out infinite reverse;
}

.shape-3 {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  top: 10px;
  right: 10%;
  animation: float-shape 10s ease-in-out infinite;
}

@keyframes float-shape {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Features Section */
.features-section {
  padding: 3.2rem 0 20rem 0;
  background: #f9fafc;
  position: relative;
  z-index: 1;
  margin-top: 0;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: clamp(2.5rem, 5vw, 3.4rem);
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.1rem;
  letter-spacing: -0.025em;
  font-family: var(--font-family-sohne);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

.section-description {
  font-size: clamp(1.06rem, 2vw, 1.2rem);
  color: #475569;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  opacity: 0.9;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* Title Decoration */
.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.decoration-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  max-width: 80px;
}

.decoration-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.decoration-icon:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: scale(1.05);
}

.decoration-icon svg {
  transition: all 0.2s ease;
}

.decoration-icon:hover svg {
  transform: rotate(5deg);
}

/* Feature Icons */
.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 1.25rem;
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(248, 250, 252, 0.95) 0%, rgba(226, 232, 240, 0.95) 100%);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.9),
    inset -1px -1px 2px rgba(148, 163, 184, 0.35),
    8px 12px 24px rgba(148, 163, 184, 0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  position: relative;
}

.feature-icon::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 11px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.65) 0%, rgba(226, 232, 240, 0.2) 100%);
  opacity: 0.85;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.feature-icon:hover {
  transform: translateY(-3px);
  box-shadow:
    inset 1px 1px 2px rgba(255, 255, 255, 0.9),
    inset -1px -1px 2px rgba(148, 163, 184, 0.4),
    12px 18px 30px rgba(71, 85, 105, 0.2);
}

.feature-icon:hover::after {
  opacity: 1;
}

.feature-icon svg {
  width: 28px;
  height: 28px;
  color: #1f2937;
  filter: drop-shadow(0 6px 10px rgba(15, 23, 42, 0.2));
  transition: transform 0.25s ease, filter 0.25s ease, color 0.25s ease;
  shape-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
  position: relative;
  z-index: 1;
}

.feature-card {
  background: linear-gradient(165deg, #ffffff 0%, #f8fafc 100%) !important;
  border: 1px solid rgba(148, 163, 184, 0.22) !important;
  border-top: none !important;
  border-radius: 16px !important;
  padding: 42px !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  /* More prominent shadow like Stripe cards - deeper and more visible */
  box-shadow: 
    0 16px 38px rgba(15, 23, 42, 0.08),
    0 6px 16px rgba(15, 23, 42, 0.05),
    0 1px 2px rgba(15, 23, 42, 0.04) !important;
  /* Make them appear elevated/raised */
  transform: translateY(0);
  /* Ensure visibility */
  opacity: 1;
  visibility: visible;
  display: block;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 22px 44px rgba(15, 23, 42, 0.12),
    0 10px 22px rgba(15, 23, 42, 0.08),
    0 2px 8px rgba(15, 23, 42, 0.06) !important;
  border-color: rgba(100, 116, 139, 0.32) !important;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0f172a 0%, #334155 100%);
  border-radius: 16px 16px 0 0;
}

.feature-card:nth-child(3n + 1) {
  background: linear-gradient(165deg, #ffffff 0%, #eff6ff 100%) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
}

.feature-card:nth-child(3n + 1)::before {
  background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
}

.feature-card:nth-child(3n + 2) {
  background: linear-gradient(165deg, #ffffff 0%, #eff6ff 100%) !important;
  border-color: rgba(37, 99, 235, 0.25) !important;
}

.feature-card:nth-child(3n + 2)::before {
  background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%);
}

.feature-card:nth-child(3n + 3) {
  background: linear-gradient(165deg, #ffffff 0%, #ecfeff 100%) !important;
  border-color: rgba(20, 184, 166, 0.24) !important;
}

.feature-card:nth-child(3n + 3)::before {
  background: linear-gradient(90deg, #0d9488 0%, #14b8a6 100%);
}

.feature-icon {
  margin-bottom: 1.25rem;
}

.feature-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 6px;
  position: relative;
  z-index: 1;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.feature-card:hover .feature-icon {
  transform: translateY(-4px);
  background: linear-gradient(160deg, rgba(248, 250, 252, 1) 0%, rgba(226, 232, 240, 0.95) 100%);
}

.feature-card:hover .feature-icon svg,
.feature-card:hover .feature-icon-img {
  transform: translateY(-1px) scale(1.04);
  filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.22));
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  opacity: 0.9;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

/* Global Scale Section */
.global-scale-section {
  padding: 8rem 0;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}
.global-scale-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.global-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.8;
  will-change: transform;
  animation: global-orb-pulse 4s ease-in-out infinite;
}

.global-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(14, 165, 233, 0.4) 50%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.global-orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 70%);
  top: 50%;
  right: 15%;
  animation-delay: 0.8s;
}

.global-orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 70%);
  bottom: 15%;
  left: 20%;
  animation-delay: 1.6s;
}

.global-orb-4 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.3) 50%, transparent 70%);
  top: 20%;
  right: 30%;
  animation-delay: 2.4s;
}

.global-orb-5 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(3, 105, 161, 0.3) 50%, transparent 70%);
  bottom: 25%;
  right: 10%;
  animation-delay: 3.2s;
}

@keyframes global-orb-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
}

/* Step flow styles */
.global-step-flow {
  margin-top: 2.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 2;
}

.step-card {
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(226,232,240,0.9);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05);
}

.step-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.step-title {
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.step-text {
  margin-left: auto;
  font-size: 0.875rem;
  color: #64748b;
}

.step-arrow { opacity: 0.9; }

@media (max-width: 900px) {
  .global-step-flow { grid-template-columns: 1fr; }
  .step-arrow { display: none; }
}

.global-scale-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.global-scale-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.global-scale-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  font-family: var(--font-family-sohne);
  opacity: 1 !important; /* Ensure visibility even if GSAP animation hasn't fired */
}

.global-scale-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: white;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
  font-family: var(--font-family-sohne);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  opacity: 1 !important; /* Ensure visibility even if GSAP animation hasn't fired */
}

.global-scale-title-big {
  display: block;
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.global-scale-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #cbd5e1;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  max-width: 500px;
  opacity: 1 !important; /* Ensure visibility even if GSAP animation hasn't fired */
}

/* Step Flow */
.step-flow {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.step-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%);
  box-shadow: inset 0 0 0 1px rgba(148,163,184,0.25);
}

.step-title {
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.01em;
}

.step-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

.step-arrow {
  opacity: 0.8;
}

@media (max-width: 960px) {
  .step-flow {
    grid-template-columns: 1fr;
  }
  .step-arrow { display: none; }
}

.global-scale-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.globe-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
}

.globe-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  opacity: 1 !important; /* Ensure visibility even if GSAP animation hasn't fired */
}

.connection-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 3s ease-in-out forwards;
}

.line-1 {
  animation-delay: 0.5s;
}

.line-2 {
  animation-delay: 1s;
}

.line-3 {
  animation-delay: 1.5s;
}

.line-4 {
  animation-delay: 2s;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

.marker-point {
  animation: pulse-marker 2s ease-in-out infinite;
}

.marker-point-inner {
  animation: pulse-inner 2s ease-in-out infinite;
}

@keyframes pulse-marker {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes pulse-inner {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.globe-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* Use Cases Section */
.use-cases-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.use-cases-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}
.use-case-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.use-case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.use-case-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.use-case-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.use-case-description {
  color: #64748b;
  line-height: 1.6;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.use-case-link {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.use-case-link:hover {
  color: #2563eb;
  transform: translateX(4px);
}

.use-case-link svg {
  transition: transform 0.2s ease;
}

.use-case-link:hover svg {
  transform: translateX(2px);
}

/* Stripe-style Divisors (Overlapping Rectangles) */
.section-divisors {
  position: relative;
  width: 100%;
  height: 200px;
  margin-top: -100px;
  margin-bottom: -100px;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

.divisor-rectangle {
  position: absolute;
  width: 100%;
  height: 150px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.divisor-1 {
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.08) 0%,
    rgba(59, 130, 246, 0.12) 50%,
    rgba(96, 165, 250, 0.08) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.15);
  transform: translateY(-20px) translateX(-30px) rotate(-1deg);
  box-shadow:
    0 20px 60px rgba(37, 99, 235, 0.1),
    0 8px 24px rgba(59, 130, 246, 0.08);
}

.divisor-2 {
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.1) 0%,
    rgba(14, 165, 233, 0.12) 50%,
    rgba(96, 165, 250, 0.08) 100%
  );
  border: 1px solid rgba(14, 165, 233, 0.15);
  transform: translateY(10px) translateX(30px) rotate(1deg);
  box-shadow:
    0 20px 60px rgba(37, 99, 235, 0.12),
    0 8px 24px rgba(14, 165, 233, 0.1);
}

/* CTA Section */
.landing-page > section.cta-section {
  position: relative;
  z-index: 2; /* Ensure CTA section is above revenue banner */
  background: #ffffff;
  color: #111827;
  overflow: hidden;
  padding: 72px 0;
  margin-top: -5rem;
  clip-path: none;
}

.landing-page > section.cta-section::before,
.landing-page > section.cta-section::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(148, 197, 254, 0.12) 12%,
    rgba(148, 197, 254, 0.35) 50%,
    rgba(148, 197, 254, 0.12) 88%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  display: none;
}

.cta-light-ray {
  display: none;
}
.landing-page > section.cta-section .cta-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 40px;
  display: grid;
  grid-template-columns: 1.3fr 2fr;
  gap: 28px;
  align-items: center;
  background: transparent;
  border-radius: 32px;
  border: none;
  box-shadow: none;
  backdrop-filter: none;
  overflow: visible;
  z-index: 2;
}

.cta-title {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 12px;
  color: #111827;
}

.cta-sub {
  color: #374151;
  margin: 0 0 20px;
  max-width: 560px;
}

.cta-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: stretch;
  max-width: 760px;
}

.landing-page > section.cta-section .cta-primary,
.landing-page > section.cta-section .cta-secondary {
  text-decoration: none;
  font-weight: 600;
  letter-spacing: -0.01em;
  padding: 0.62rem 1.08rem;
  font-size: 0.88rem;
  min-width: 0;
  width: 100%;
  min-height: 48px;
  justify-content: center;
}

.landing-page > section.cta-section .cta-primary {
  background: linear-gradient(135deg, #7cc0ff 0%, #b8dcff 100%);
  border: none !important;
  box-shadow:
    0 14px 30px rgba(124, 192, 255, 0.4),
    0 6px 16px rgba(184, 220, 255, 0.34);
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary {
  background: #374151;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border: 1px solid #374151 !important;
  box-shadow: none;
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary:hover {
  background: #1f2937;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  box-shadow: none;
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary,
.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary *,
.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary .btn-chevron {
  color: #ffffff !important;
  fill: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary span,
.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary svg,
.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-secondary .cta-btn-left-icon {
  color: #ffffff !important;
  fill: #ffffff !important;
  stroke: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.landing-page > section.cta-section .cta-primary,
.landing-page > section.cta-section .cta-primary * {
  color: #ffffff !important;
  fill: #ffffff !important;
  stroke: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.landing-page > section.cta-section .cta-primary:hover {
  background: linear-gradient(135deg, #5aaeff 0%, #8cc9ff 100%);
  box-shadow:
    0 18px 36px rgba(90, 174, 255, 0.42),
    0 10px 22px rgba(140, 201, 255, 0.34);
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-primary-clone {
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%) !important;
  border: none !important;
  box-shadow:
    0 14px 30px rgba(30, 58, 138, 0.34),
    0 6px 16px rgba(30, 64, 175, 0.28) !important;
}

.landing-page.ecommerce-page > section.cta-section .cta-actions > .cta-primary-clone:hover {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%) !important;
  box-shadow:
    0 18px 36px rgba(29, 78, 216, 0.34),
    0 10px 22px rgba(30, 64, 175, 0.28) !important;
}

.landing-page > section.cta-section .cta-primary::before,
.landing-page > section.cta-section .cta-secondary::before {
  display: none;
}

.landing-page > section.cta-section .cta-primary .btn-chevron,
.landing-page > section.cta-section .cta-secondary .btn-chevron {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.landing-page > section.cta-section .cta-primary:hover .btn-chevron,
.landing-page > section.cta-section .cta-secondary:hover .btn-chevron {
  transform: translateX(4px);
}

.landing-page > section.cta-section .cta-right {
  display: flex;
  flex-direction: column;
  padding-left: 48px;
  border-left: none;
}

.cta-promo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
}

.cta-promo-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
}

.cta-promo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111827;
  margin-bottom: 12px;
  font-size: 1.65rem;
  flex-shrink: 0;
  width: auto;
  height: auto;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.cta-promo-icon::before,
.cta-promo-icon::after {
  content: none;
}

.cta-promo-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.01em;
  font-family: var(--font-family-sohne);
}

.cta-promo-text {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #4b5563;
  margin: 0;
  font-family: var(--font-family-sohne);
  font-weight: 400;
}

.cta-description {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cta-desc-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cta-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-title-icon svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 1px 2px rgba(59, 130, 246, 0.2));
}

.cta-desc-text {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  font-family: var(--font-family-sohne);
  font-weight: 400;
}
.cta-trust-points {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.trust-point {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.78);
  font-family: var(--font-family-sohne);
  font-weight: 500;
}
.cta-col { display:flex; flex-direction:column; gap:8px; }
.cta-icon { width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:10px; background:rgba(248,250,252,0.18); color:#f8fafc; box-shadow:0 8px 20px rgba(15,23,42,0.26); border:1px solid rgba(226,232,240,0.25); }
.cta-icon svg { display:block; transform:none; flex-shrink:0; }
.cta-col-title { font-size:1rem; font-weight:600; margin:0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; letter-spacing: -0.01em; color:#f8fafc; }
.cta-col-text { margin:0; color:rgba(255,255,255,0.72); }
.cta-link { color:#e0f2fe; text-decoration:none; font-weight:600; }
.cta-link:hover { text-decoration:underline; }

.cta-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .landing-page > section.cta-section {
    padding: 72px 0;
    margin-top: -3rem;
    clip-path: none;
  }

  .landing-page > section.cta-section .cta-container {
    grid-template-columns: 1fr;
    gap: 48px;
    padding: 48px 48px;
  }

  .landing-page > section.cta-section .cta-right {
    padding-left: 0;
    padding-top: 36px;
  }

  .cta-light-ray {
    top: -55%;
    width: 220%;
    height: 220%;
  }
}

@media (max-width: 768px) {
  .landing-page > section.cta-section {
    padding: 64px 0;
    margin-top: -2rem;
    clip-path: none;
  }

  .landing-page > section.cta-section .cta-container {
    padding: 40px 28px;
  }

  .landing-page > section.cta-section .cta-actions {
    width: 100%;
    grid-template-columns: 1fr;
    align-items: stretch;
    justify-content: stretch;
    gap: 0.62rem;
  }

  .landing-page > section.cta-section .cta-primary,
  .landing-page > section.cta-section .cta-secondary {
    width: 100% !important;
    justify-content: center;
    padding: 0.56rem 0.92rem;
    font-size: 0.83rem;
  }

  .cta-promo-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .landing-page > section.cta-section .cta-right {
    padding-top: 32px;
  }

  .cta-light-ray {
    top: -65%;
    width: 240%;
    height: 240%;
  }
}

@media (max-width: 480px) {
  .landing-page > section.cta-section {
    padding: 56px 0;
    margin-top: -1.25rem;
    clip-path: none;
  }

  .landing-page > section.cta-section .cta-container {
    padding: 36px 20px;
  }

  .cta-title {
    font-size: 1.75rem;
  }

  .cta-light-ray {
    top: -75%;
  }
}

.cta-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.cta-column:hover {
  transform: translateY(-2px);
}

.cta-column-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: 12px;
  border: none;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  margin-bottom: 0.75rem;
}

.cta-column:hover .cta-column-icon {
  transform: translateY(-2px);
}

.cta-column:hover .cta-column-icon svg {
  filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3));
}

.cta-column-icon svg {
  width: 48px;
  height: 48px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-column-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 0.5rem 0;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.cta-column:hover .cta-column-title {
  color: #bfdbfe;
}

.cta-column-text {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: rgba(226, 232, 240, 0.7);
  margin: 0;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .cta-container { grid-template-columns: 1fr; }
  .cta-right { 
    border-left: none; 
    padding-left: 0; 
    margin-top: 2rem;
  }
  .cta-promo-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

/* API Terminal Styles */
.api-terminal-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 1px;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  max-width: 640px;
  width: 100%;
  margin-top: 0;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
  height: 520px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.api-terminal-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(226, 232, 240, 0.6);
  z-index: 0;
}

.api-terminal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 36px 80px rgba(15, 23, 42, 0.12);
}

.api-terminal-header {
  position: relative;
  z-index: 1;
  padding: 1rem 1.5rem;
  background: #f1f5f9;
  border-bottom: 1px solid rgba(203, 213, 225, 0.9);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.terminal-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.2);
}

.terminal-dot-red {
  background: #ef4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
}

.terminal-dot-yellow {
  background: #facc15;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
}

.terminal-dot-green {
  background: #22c55e;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.35);
}

.api-terminal-title {
  color: #1e293b;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'SF Mono', 'Inconsolata', 'Fira Code', monospace;
}

.api-terminal-body {
  position: relative;
  z-index: 1;
  padding: 1.5rem 2rem 2.25rem;
  background: #ffffff;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.terminal-typed-output {
  font-size: 0.85rem;
  line-height: 1.7;
  color: #0f172a;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow: hidden;
}

.terminal-prompt {
  color: #059669;
  font-weight: 600;
}

.terminal-response {
  color: #334155;
  display: block;
  margin-top: 0.5rem;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
  line-height: 1.6;
}


/* Typed.js cursor styling */
.typed-cursor {
  color: #0f172a;
  opacity: 1;
  animation: typedjsBlink 0.7s infinite;
  font-weight: 100;
}

@keyframes typedjsBlink {
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .cta-columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cta-column {
    padding: 0;
  }
  
  .cta-column-icon {
    width: 48px;
    height: 48px;
  }
  
  .cta-column-title {
    font-size: 1.125rem;
  }
  
  .cta-column-text {
    font-size: 0.875rem;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    padding: 0 1rem;
  }
  
  .hero-container .vertical-divider {
    display: none;
  }
  
  .hero-title {
    font-size: clamp(3.7rem, 11.8vw, 5rem) !important;
    line-height: 0.97 !important;
    letter-spacing: -0.025em;
  }
  
  .hero-description {
    font-size: 1.125rem;
    line-height: 1.6;
  }
  
  .hero-actions {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    max-width: 320px;
  }
  
  .hero-stats {
    justify-content: center;
    gap: 1.1rem;
  }

  .hero-stats .stat-item {
    min-width: 132px;
    padding: 0;
  }
  
  .section-title {
    font-size: 2.25rem;
    letter-spacing: -0.02em;
  }
  
  .section-description {
    font-size: 1.125rem;
  }
  
  .features-section {
    padding: 2.6rem 0 14rem 0;
    margin-top: 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
  .cta-title {
    font-size: 2.25rem;
    letter-spacing: -0.02em;
  }
  
  .cta-description {
    font-size: 1.125rem;
  }

  .section-divisors {
    height: 150px;
    margin-top: -75px;
    margin-bottom: -75px;
  }

  .divisor-rectangle {
    height: 100px;
  }

  .divisor-1 {
    transform: translateY(-15px) translateX(-20px) rotate(-0.5deg);
  }

  .divisor-2 {
    transform: translateY(5px) translateX(20px) rotate(0.5deg);
  }
  
  .landing-page > section.cta-section .cta-actions {
    flex-direction: row !important;
    align-items: center;
    gap: 0.62rem;
  }
  .btn-primary, .btn-secondary {
    max-width: none;
  }

  .global-scale-content {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }

  .global-scale-title {
    font-size: 2.5rem;
  }

  .global-scale-title-big {
    font-size: 3rem;
  }

  .global-scale-description {
    max-width: 100%;
    margin: 0 auto;
  }

  .globe-wrapper {
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: clamp(3rem, 11vw, 3.8rem) !important;
    line-height: 0.99 !important;
    letter-spacing: -0.02em;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 1.875rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
  
  .cta-title {
    font-size: 1.875rem;
  }
  
  .cta-description {
    font-size: 1rem;
  }
}

.feature-card:hover .feature-icon svg {
  filter: drop-shadow(0 8px 16px rgba(30, 64, 175, 0.2));
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;
}

.feature-description {
  color: #6b7280;
  line-height: 1.6;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  opacity: 0.9;
  font-size: 0.95rem;
  position: relative;
  z-index: 1;
}

/* Global Scale Section */
.global-scale-section {
  padding: 8rem 0;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.global-scale-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.global-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.8;
  will-change: transform;
  animation: global-orb-pulse 4s ease-in-out infinite;
}

.global-orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(14, 165, 233, 0.4) 50%, transparent 70%);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.global-orb-2 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.3) 50%, transparent 70%);
  top: 50%;
  right: 15%;
  animation-delay: 0.8s;
}

.global-orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 70%);
  bottom: 15%;
  left: 20%;
  animation-delay: 1.6s;
}

.global-orb-4 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, rgba(29, 78, 216, 0.3) 50%, transparent 70%);
  top: 20%;
  right: 30%;
  animation-delay: 2.4s;
}

.global-orb-5 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.5) 0%, rgba(3, 105, 161, 0.3) 50%, transparent 70%);
  bottom: 25%;
  right: 10%;
  animation-delay: 3.2s;
}

@keyframes global-orb-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
}

.global-scale-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.global-scale-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.global-scale-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
  font-family: var(--font-family-sohne);
}

.global-scale-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  color: #0f172a;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
  font-family: var(--font-family-sohne);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

.global-scale-title-big {
  display: block;
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.global-scale-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #475569;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  max-width: 500px;
}

.global-scale-visual {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.globe-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
}

.globe-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
  opacity: 1 !important; /* Ensure visibility even if GSAP animation hasn't fired */
}

.connection-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 3s ease-in-out forwards;
}

.line-1 {
  animation-delay: 0.5s;
}

.line-2 {
  animation-delay: 1s;
}
.line-3 {
  animation-delay: 1.5s;
}

.line-4 {
  animation-delay: 2s;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}

.marker-point {
  animation: pulse-marker 2s ease-in-out infinite;
}

.marker-point-inner {
  animation: pulse-inner 2s ease-in-out infinite;
}

@keyframes pulse-marker {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes pulse-inner {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.globe-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* Use Cases Section */
.use-cases-section {
  padding: 6rem 0;
  background: #f8fafc;
}

.use-cases-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.use-case-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.use-case-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}
.use-case-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.use-case-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.use-case-description {
  color: #64748b;
  line-height: 1.6;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.use-case-link {
  display: inline-flex;
  align-items: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.75rem;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.use-case-link:hover {
  color: #2563eb;
  transform: translateX(4px);
}

.use-case-link svg {
  transition: transform 0.2s ease;
}

.use-case-link:hover svg {
  transform: translateX(2px);
}

/* Stripe-style Divisors (Overlapping Rectangles) */
.section-divisors {
  position: relative;
  width: 100%;
  height: 200px;
  margin-top: -100px;
  margin-bottom: -100px;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

.divisor-rectangle {
  position: absolute;
  width: 100%;
  height: 150px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.divisor-1 {
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.08) 0%,
    rgba(59, 130, 246, 0.12) 50%,
    rgba(96, 165, 250, 0.08) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.15);
  transform: translateY(-20px) translateX(-30px) rotate(-1deg);
  box-shadow:
    0 20px 60px rgba(37, 99, 235, 0.1),
    0 8px 24px rgba(59, 130, 246, 0.08);
}

.divisor-2 {
  background: linear-gradient(
    135deg,
    rgba(37, 99, 235, 0.1) 0%,
    rgba(14, 165, 233, 0.12) 50%,
    rgba(96, 165, 250, 0.08) 100%
  );
  border: 1px solid rgba(14, 165, 233, 0.15);
  transform: translateY(10px) translateX(30px) rotate(1deg);
  box-shadow:
    0 20px 60px rgba(37, 99, 235, 0.12),
    0 8px 24px rgba(14, 165, 233, 0.1);
}

/* === DEVELOPER SECTION (Stripe-style) === */
.developer-section {
  padding: 8rem 0;
  background: #1A2B40;
  position: relative;
  overflow: hidden;
}

/* Diagonal Shapes (Top Right) */
.stripe-diagonals {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 50%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.stripe-diagonal {
  position: absolute;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stripe-diag-1 {
  width: 400px;
  height: 200px;
  top: -50px;
  right: -100px;
  transform: rotate(45deg);
  border-radius: 8px;
}

.stripe-diag-2 {
  width: 350px;
  height: 180px;
  top: 100px;
  right: -80px;
  transform: rotate(-25deg);
  border-radius: 8px;
  background: rgba(96, 165, 250, 0.05);
  border-color: rgba(96, 165, 250, 0.1);
}

.stripe-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
  position: relative;
  z-index: 1;
}

.stripe-main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6rem;
  align-items: center;
  margin-bottom: 8rem;
}

/* Left Content */
.stripe-left-content {
  color: white;
}

.stripe-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 2rem;
  font-family: var(--font-family-sohne);
  letter-spacing: 0.02em;
}

.stripe-main-title {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1.05;
  margin-bottom: 1.5rem;
  color: white;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.04em;
}

.stripe-main-desc {
  font-size: 1.125rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2.5rem;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
}

.stripe-read-docs-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  font-family: var(--font-family-sohne);
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.stripe-read-docs-btn:hover {
  background: #1d4ed8;
}

.stripe-read-docs-btn svg {
  transition: transform 0.2s ease;
}

.stripe-read-docs-btn:hover svg {
  transform: translateX(2px);
}

/* Right Content - Code + Terminal */
.stripe-right-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Code Editor */
.stripe-code-editor {
  background: #1a2332;
  border-radius: 12px 12px 0 0;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.stripe-code-lines {
  margin: 0;
  padding: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  color: #e5e7eb;
  background: transparent;
}

.stripe-line-num {
  display: inline-block;
  width: 2rem;
  color: #6b7280;
  text-align: right;
  margin-right: 1rem;
  user-select: none;
}

.stripe-code-line {
  display: inline;
}

.stripe-kw {
  color: #82aaff;
}

.stripe-var {
  color: #82aaff;
}

.stripe-str {
  color: #c3e88d;
}

.stripe-fn {
  color: #82aaff;
}

.stripe-prop {
  color: #82aaff;
}

.stripe-num {
  color: #f78c6c;
}

/* File Tab */
.stripe-file-tab {
  background: #151b26;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.5rem 1rem;
}

.stripe-tab-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
}

/* Terminal Output */
.stripe-terminal-output {
  background: #0f1419;
  border-radius: 0 0 12px 12px;
  padding: 1.5rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: none;
}

.stripe-term-line {
  margin-bottom: 0.5rem;
}

.stripe-term-prompt {
  color: #82aaff;
  margin-right: 0.5rem;
}

.stripe-term-command,
.stripe-term-ready {
  color: #e5e7eb;
}

.stripe-term-ready {
  color: #4fd1c7;
}

.stripe-term-date {
  color: #6b7280;
  margin-right: 0.75rem;
}

.stripe-status-200 {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  font-weight: 600;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.stripe-status-208 {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  font-weight: 600;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.stripe-term-event {
  color: #c3e88d;
}

/* Features Grid (4 columns) */
.stripe-features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-top: 4rem;
}

.stripe-feature-card {
  color: white;
  padding: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.stripe-feature-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
}

.stripe-feature-icon {
  margin-bottom: 1.25rem;
  width: 40px;
  height: 40px;
}

.stripe-feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
}

.stripe-feature-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 1.25rem;
  font-family: var(--font-family-sohne);
}
.stripe-feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  font-family: var(--font-family-sohne);
  transition: all 0.2s ease;
}

.stripe-feature-link:hover {
  color: #93c5fd;
}

.stripe-feature-link svg {
  transition: transform 0.2s ease;
}

.stripe-feature-link:hover svg {
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 1200px) {
  .stripe-features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .stripe-main-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .stripe-main-title {
    font-size: 2.5rem;
  }

  .stripe-features-grid {
    grid-template-columns: 1fr;
  }

  .stripe-code-editor,
  .stripe-terminal-output {
    font-size: 0.75rem;
  }
}

/* Dev Tools Banner Section - Full Width with 3D Effects */
.dev-tools-section {
  padding: 1.2rem 0 5.5rem;
  background: #f9fafc;
  position: relative;
  overflow: visible;
  width: 100%;
  margin-bottom: 8rem;
}

.dev-tools-background-visual {
  position: absolute;
  top: -14rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(1200px, 95vw);
  pointer-events: none;
  z-index: 1;
  filter: drop-shadow(0 30px 80px rgba(15, 23, 42, 0.45));
  opacity: 0.95;
}

.background-dashboard-card {
  position: relative;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.88) 50%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  padding: 2.75rem;
  overflow: hidden;
  backdrop-filter: blur(22px);
}

.background-dashboard-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 55%),
              radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.16) 0%, transparent 60%);
  opacity: 0.9;
}

.background-dashboard-card::after {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%);
  filter: blur(0.5px);
}

.background-dashboard-header,
.background-dashboard-body,
.background-dashboard-body > * {
  position: relative;
  z-index: 2;
}

.background-dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.2rem;
}

.background-dashboard-title {
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: -0.02em;
}

.background-dashboard-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.14);
  color: #f8fafc;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.background-dashboard-pill .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.6);
}

.background-dashboard-body {
  display: grid;
  gap: 1.75rem;
}

.background-dashboard-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.1) 100%);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: #cbd5f5;
  backdrop-filter: blur(12px);
}

.metric-label {
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(248, 250, 252, 0.6);
}

.metric-value {
  font-size: clamp(1.75rem, 3.2vw, 2.4rem);
  font-weight: 700;
  color: #f8fafc;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-change svg {
  color: currentColor;
}

.metric-change.positive {
  color: #34d399;
}

.metric-change.neutral {
  color: #e2e8f0;
}

.background-dashboard-chart {
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.background-dashboard-chart svg {
  width: 100%;
  height: 180px;
  display: block;
}

.background-dashboard-chart::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 60% 30%, rgba(96, 165, 250, 0.18) 0%, transparent 55%);
  pointer-events: none;
}

.background-dashboard-chart-legend {
  display: flex;
  gap: 1.25rem;
  margin-top: 1.25rem;
  color: rgba(226, 232, 240, 0.8);
  font-size: 0.875rem;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot.primary {
  background: linear-gradient(135deg, #60a5fa, #2563eb);
  box-shadow: 0 0 6px rgba(37, 99, 235, 0.6);
}

.legend-dot.secondary {
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.6), rgba(148, 163, 184, 0.2));
}

.background-dashboard-orders {
  display: grid;
  gap: 0.9rem;
}

.order-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.1rem;
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  color: #e2e8f0;
}

.order-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.35), rgba(129, 140, 248, 0.4));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.05em;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-label {
  font-weight: 600;
  color: #f8fafc;
}

.order-sub {
  font-size: 0.8125rem;
  color: rgba(226, 232, 240, 0.7);
}

.order-amount {
  font-weight: 700;
  font-size: 0.95rem;
}

.order-amount.positive {
  color: #34d399;
}

.order-amount.neutral {
  color: #e2e8f0;
}

.dev-tools-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafc;
  pointer-events: none;
}

.dev-tools-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.dev-tools-header {
  text-align: center;
  margin-bottom: 2.75rem;
  position: relative;
  z-index: 2;
  padding: 1.5rem;
}
.dev-tools-title {
  font-size: clamp(2.15rem, 3.5vw, 3rem);
  font-weight: 700;
  color: #1e293b !important;
  margin-bottom: 1.5rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.03em;
  position: relative;
  z-index: 2;
}

.dev-tools-subtitle {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  color: #475569 !important;
  font-family: var(--font-family-sohne);
  line-height: 1.7;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.search-integration-shell {
  background: linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #dbe3ee;
  border-radius: 22px;
  padding: 1.5rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.search-mock-bar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid #d6e0ec;
  background: #ffffff;
  border-radius: 999px;
  padding: 0.7rem 0.75rem 0.7rem 1rem;
}

.search-mock-icon {
  color: #2563eb;
  font-size: 1rem;
}

.search-mock-query {
  flex: 1;
  color: #334155;
  font-size: 0.95rem;
}

.search-mock-button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-weight: 600;
  padding: 0.52rem 1rem;
  font-size: 0.85rem;
}

.search-filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 0.95rem 0 1.15rem;
}

.search-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid #dbe3ee;
  background: #f8fafc;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 600;
}

.search-chip.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.search-result-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.95rem;
}

.search-result-card .result-source {
  font-size: 0.73rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
  margin-bottom: 0.45rem;
}

.search-result-card h3 {
  font-size: 0.98rem;
  line-height: 1.35;
  color: #0f172a;
  margin: 0 0 0.45rem;
}

.search-result-card p {
  font-size: 0.83rem;
  color: #475569;
  line-height: 1.45;
  margin: 0;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.7rem;
}

.result-tags span {
  font-size: 0.72rem;
  border: 1px solid #dbe3ee;
  background: #f8fafc;
  color: #334155;
  border-radius: 999px;
  padding: 0.22rem 0.52rem;
}

.api-source-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.65rem;
}

.api-source-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 0.65rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 86px;
}

.api-source-card span {
  font-size: 0.75rem;
  color: #334155;
  font-weight: 600;
  text-align: center;
}

.api-source-icon {
  font-size: 1.6rem;
}

.api-source-icon.aws {
  color: #ff9900;
}

.api-source-icon.github {
  color: #0f172a;
}

.api-source-icon.node {
  color: #339933;
}

.api-source-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.api-source-logo.wide {
  width: 54px;
}

.api-source-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0ea5e9;
  border: 1px solid #bae6fd;
  background: #f0f9ff;
  border-radius: 999px;
  padding: 0.22rem 0.5rem;
}

.dev-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  perspective: 1000px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  width: 100%;
}

.dev-tool-item {
  padding: 1.5rem 1.25rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  overflow: hidden;
  backface-visibility: hidden;
  animation: fadeInUp3DTools 0.6s ease-out backwards;
}

.dev-tool-item:nth-child(1) { animation-delay: 0.05s; }
.dev-tool-item:nth-child(2) { animation-delay: 0.1s; }
.dev-tool-item:nth-child(3) { animation-delay: 0.15s; }
.dev-tool-item:nth-child(4) { animation-delay: 0.2s; }
.dev-tool-item:nth-child(5) { animation-delay: 0.25s; }
.dev-tool-item:nth-child(6) { animation-delay: 0.3s; }
.dev-tool-item:nth-child(7) { animation-delay: 0.35s; }
.dev-tool-item:nth-child(8) { animation-delay: 0.4s; }
.dev-tool-item:nth-child(9) { animation-delay: 0.45s; }
.dev-tool-item:nth-child(10) { animation-delay: 0.5s; }
.dev-tool-item:nth-child(11) { animation-delay: 0.55s; }
.dev-tool-item:nth-child(12) { animation-delay: 0.6s; }

@keyframes fadeInUp3DTools {
  0% {
    opacity: 0;
    transform: translateY(30px) rotateX(-15deg) scale(0.85);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
  }
}

.dev-tool-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  border-radius: 16px;
  z-index: 0;
}

.dev-tool-item::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: transform 0.6s ease;
  opacity: 0;
  z-index: 1;
}

.dev-tool-item:hover::after {
  transform: rotate(45deg) translate(100%, 100%);
  opacity: 1;
}

.dev-tool-item > * {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.dev-tool-icon {
  font-size: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
}

.dev-tool-item span {
  display: inline-block;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: var(--font-family-sohne);
}

.dev-tool-item:hover {
  background: linear-gradient(135deg, #e8eef7 0%, #dbe4f2 100%);
  border-color: rgba(59, 130, 246, 0.2);
  color: #0f172a;
  transform: translateY(-6px) scale(1.03);
  box-shadow: 
    0 12px 24px rgba(15, 23, 42, 0.15),
    0 6px 12px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.dev-tool-item:hover::before {
  opacity: 1;
}

.dev-tool-item:hover .dev-tool-icon {
  transform: scale(1.04);
}

.dev-tool-item:hover span {
  transform: scale(1.01);
}

/* Colores originales de los iconos */
.dev-tool-item .devicon-vuejs-plain {
  color: #4FC08D !important;
}

.dev-tool-item .devicon-vitejs-plain {
  color: #646CFF !important;
}

.dev-tool-item .devicon-tailwindcss-plain {
  color: #38BDF8 !important;
}

.dev-tool-item .devicon-nodejs-plain {
  color: #339933 !important;
}

.dev-tool-item .devicon-express-original {
  color: #000000 !important;
}

.dev-tool-item .devicon-python-plain {
  color: #3776AB !important;
}

.dev-tool-item .devicon-redis-plain {
  color: #DC382D !important;
}

.dev-tool-item .devicon-mongodb-plain {
  color: #47A248 !important;
}

.dev-tool-item .devicon-mysql-plain {
  color: #00758F !important;
}

.dev-tool-item .devicon-docker-plain {
  color: #2496ED !important;
}

.dev-tool-item .devicon-sequelize-plain {
  color: #52B0E7 !important;
}

.dev-tool-item .devicon-flutter-plain {
  color: #02569B !important;
}

/* Mantener colores en hover */
.dev-tool-item:hover .devicon-vuejs-plain,
.dev-tool-item:hover .devicon-vitejs-plain,
.dev-tool-item:hover .devicon-tailwindcss-plain,
.dev-tool-item:hover .devicon-nodejs-plain,
.dev-tool-item:hover .devicon-express-original,
.dev-tool-item:hover .devicon-python-plain,
.dev-tool-item:hover .devicon-redis-plain,
.dev-tool-item:hover .devicon-mongodb-plain,
.dev-tool-item:hover .devicon-mysql-plain,
.dev-tool-item:hover .devicon-docker-plain,
.dev-tool-item:hover .devicon-sequelize-plain,
.dev-tool-item:hover .devicon-flutter-plain {
  color: inherit !important;
}

/* Tooltip styling for dev tools - Clean white background with dark text */
.dev-tools-section :deep(.v-tooltip .v-overlay__content) {
  background: #ffffff !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 10px !important;
  padding: 0.75rem 0.875rem !important;
  font-size: 0.8125rem !important;
  line-height: 1.5 !important;
  color: #1f2937 !important;
  max-width: 220px !important;
  min-width: 160px !important;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.15),
    0 4px 10px rgba(0, 0, 0, 0.1) !important;
  font-weight: 400 !important;
  position: relative !important;
  font-family: var(--font-family-sohne) !important;
  letter-spacing: -0.01em !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  animation: tooltipFadeIn 0.15s ease-out !important;
}

/* Ensure text is above glow effect */
.dev-tools-section :deep(.v-tooltip .v-overlay__content span) {
  position: relative !important;
  z-index: 1 !important;
  display: block !important;
  color: #e2e8f0 !important;
}

/* Elegant bold text styling - vibrant blue gradient */
.dev-tools-section :deep(.v-tooltip .v-overlay__content strong) {
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  position: relative !important;
}

/* Smooth fade-in animation */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Clean connector arrow with dark gradient background */
.dev-tools-section :deep(.v-tooltip .v-overlay__content::before) {
  content: '' !important;
  position: absolute !important;
  bottom: -6px !important;
  left: 50% !important;
  transform: translateX(-50%) rotate(45deg) !important;
  width: 12px !important;
  height: 12px !important;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
  border-right: 1px solid rgba(59, 130, 246, 0.3) !important;
  border-bottom: 1px solid rgba(59, 130, 246, 0.3) !important;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3) !important;
  z-index: 1 !important;
}

/* Remove inner glow for clean white look */
.dev-tools-section :deep(.v-tooltip .v-overlay__content::after) {
  display: none !important;
}

@media (max-width: 1200px) {
  .dev-tools-background-visual {
    top: -10rem;
    width: min(1100px, 94vw);
  }

  .background-dashboard-card {
    padding: 2.3rem;
  }

  .background-dashboard-metrics {
    gap: 1.25rem;
  }
}

@media (max-width: 960px) {
  .dev-tools-background-visual {
    top: -7rem;
    opacity: 0.9;
  }

  .background-dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .background-dashboard-chart svg {
    height: 150px;
  }
}
@media (max-width: 720px) {
  .dev-tools-background-visual {
    top: -5rem;
  }

  .background-dashboard-card {
    padding: 1.75rem;
    border-radius: 22px;
  }

  .background-dashboard-metrics {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .background-dashboard-chart-legend {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 540px) {
  .dev-tools-background-visual {
    display: none;
  }
}

/* Responsive Dev Tools */
@media (max-width: 1200px) {
  .dev-tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }
}

@media (max-width: 968px) {
  .search-results-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .api-source-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .dev-tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.1rem;
  }
  
  .dev-tool-item {
    padding: 1.35rem 1rem;
  }
  
  .dev-tool-icon {
    font-size: 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
  }
}

@media (max-width: 640px) {
  .search-integration-shell {
    padding: 1rem;
    border-radius: 16px;
  }

  .search-mock-bar {
    border-radius: 16px;
    padding: 0.7rem;
    flex-wrap: wrap;
  }

  .search-mock-query {
    width: 100%;
    order: 2;
    font-size: 0.86rem;
  }

  .search-mock-button {
    order: 3;
  }

  .search-results-grid {
    grid-template-columns: 1fr;
  }

  .api-source-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dev-tools-section {
    padding: 2rem 0 4rem;
    margin-bottom: 3rem;
  }
  
  .dev-tools-title {
    font-size: 2rem;
  }
  
  .dev-tools-subtitle {
    font-size: 1rem;
  }
  
  .dev-tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.9rem;
  }
  
  .dev-tool-item {
    padding: 1.1rem 0.8rem;
  }
  
  .dev-tool-icon {
    font-size: 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .dev-tool-item span {
    font-size: 0.8rem;
  }
}

/* Code Block (Old - keeping for compatibility) */
.code-block {
  background: #0F172A;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.code-dots {
  display: flex;
  gap: 0.5rem;
}

.code-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.code-filename {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.code-content {
  padding: 1.25rem;
}

.code-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #E5E7EB;
}

.code-keyword {
  color: #60a5fa;
}

.code-variable {
  color: #82AAFF;
}

.code-operator {
  color: #89DDFF;
}

.code-string {
  color: #C3E88D;
}
.code-function {
  color: #82AAFF;
}

.code-property {
  color: #82AAFF;
}

.code-number {
  color: #F78C6C;
}

/* Terminal Block */
.terminal-block {
  background: #0F172A;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.terminal-header {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.terminal-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-weight: 600;
}

.terminal-content {
  padding: 1.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
}

.terminal-line {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.terminal-prompt {
  color: #4FD1C7;
}

.terminal-command {
  color: #E5E7EB;
}

.terminal-output {
  color: #4FD1C7;
}

.terminal-timestamp {
  color: #73777F;
  font-size: 0.75rem;
}

.terminal-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.75rem;
}

.status-200 {
  background: rgba(16, 185, 129, 0.2);
  color: #10B981;
}

.terminal-event {
  color: #C3E88D;
}

/* Developer Features Grid */
.developer-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 4rem;
}

.developer-feature-card {
  color: white;
  padding: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.developer-feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.developer-feature-icon {
  margin-bottom: 1.5rem;
  width: 48px;
  height: 48px;
}

.developer-feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
}

.developer-feature-description {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.25rem;
  font-family: var(--font-family-sohne);
  font-weight: 400;
  letter-spacing: -0.01em;
}

.developer-feature-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  font-family: var(--font-family-sohne);
  transition: all 0.2s ease;
}

.developer-feature-link:hover {
  color: #87CEEB;
  transform: translateX(4px);
}

.developer-feature-link svg {
  transition: transform 0.2s ease;
}

.developer-feature-link:hover svg {
  transform: translateX(2px);
}

/* Developer Section Responsive */
@media (max-width: 768px) {
  .developer-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .developer-title {
    font-size: 2.5rem;
  }

  .developer-features {
    grid-template-columns: 1fr;
  }

  .code-block,
  .terminal-block {
    font-size: 0.75rem;
  }
}


/* Global Scale steps */
.global-scale-steps {
  padding: 3.5rem 0 3rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.steps-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  align-items: stretch;
}
.step-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.step-card-blue {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.05);
}

.step-card-blue:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

.step-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(37, 99, 235,0.12);
  transition: all 0.2s ease;
}

.step-icon-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.step-card-blue:hover .step-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  transform: scale(1.05);
}

.step-card-blue:hover .step-icon-blue svg {
  stroke: #ffffff;
  fill: #ffffff;
}

.step-title {
  margin: 0 0 4px 0;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  color: #0f172a;
  transition: color 0.3s ease;
}

.step-card-blue .step-title {
  color: #1e293b;
}

.step-card-blue:hover .step-title {
  color: #3b82f6;
}

.step-text {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
  transition: color 0.3s ease;
}

.step-card-blue:hover .step-text {
  color: #475569;
}

.step-arrow {
  display: none;
}

@media (max-width: 1024px) {
  .steps-container {
    grid-template-columns: 1fr;
  }
}

/* Global Scale: Step Flow */
.global-scale-flow {
  padding: 3rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.gs-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: stretch;
}

.gs-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem 1rem;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 0.75rem;
  row-gap: 0.25rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.gs-card-blue {
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.05);
}

.gs-card-blue:hover {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

.gs-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  grid-row: span 2;
  transition: all 0.2s ease;
}

.gs-icon-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.gs-card-blue:hover .gs-icon-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  transform: scale(1.05);
}

.gs-card-blue:hover .gs-icon-blue svg {
  stroke: #ffffff;
  fill: #ffffff;
}

.gs-title {
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.gs-card-blue .gs-title {
  color: #1e293b;
}

.gs-card-blue:hover .gs-title {
  color: #3b82f6;
}

.gs-text {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.gs-arrow {
  display: none;
}

@media (max-width: 1024px) {
  .gs-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Marketplace Solution Banner */
.marketplace-banner-section {
  padding: 10rem 0 6rem 0;
  background: #ffffff;
  position: relative;
  overflow: visible;
}

.marketplace-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.marketplace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.marketplace-content {
  position: relative;
  z-index: 2;
}

.marketplace-category {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.marketplace-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  font-family: var(--font-family-sohne);
}

.marketplace-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #475569;
  margin: 0 0 2.5rem 0;
}

.marketplace-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.marketplace-btn {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.marketplace-btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.marketplace-btn-primary:hover {
  background: #0369a1;
  transform: translateY(-1px);
}

.marketplace-btn-secondary {
  background: #ffffff;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.marketplace-btn-secondary:hover {
  background: #f0f9ff;
}

/* Marketplace Visual - Mockups */
.marketplace-visual {
  position: relative;
  z-index: 1;
}

.mockup-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.mockup-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.mockup-card-1 {
  transform: rotate(-2deg);
  z-index: 2;
  position: relative;
}

.mockup-card-2 {
  transform: rotate(2deg) translateX(1.5rem);
  z-index: 1;
  margin-top: -2rem;
  position: relative;
}

.mockup-header {
  background: #1f2937;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mockup-logo {
  font-size: 0.875rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.mockup-tabs {
  display: flex;
  gap: 0.5rem;
}

.mockup-tab {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 4px;
}
.mockup-tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.mockup-header-small {
  background: #f8fafc;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.mockup-title-small {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
}

.mockup-body {
  padding: 1.5rem 1.25rem;
}

.mockup-field {
  margin-bottom: 1rem;
}

.mockup-field label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.mockup-select,
.mockup-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: #ffffff;
  color: #1f2937;
}

.mockup-btn {
  width: 100%;
  padding: 0.75rem;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

.mockup-stat {
  margin-bottom: 1rem;
}

.mockup-stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.mockup-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
}

.mockup-btn-small {
  width: 100%;
  padding: 0.625rem;
  background: #ef4444;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.mockup-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mockup-list-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.mockup-list-item:last-child {
  border-bottom: none;
}

/* Case Studies Section */
.case-studies-section {
  padding: 6rem 0 10rem 0;
  background: #ffffff;
  position: relative;
  border-top: 1px solid #f1f5f9;
}

.case-studies-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.case-studies-category {
  font-size: 0.875rem;
  font-weight: 600;
  color: #60a5fa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
  text-align: center;
}

.case-studies-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.case-studies-content {
  text-align: center;
}

.case-studies-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  font-family: var(--font-family-sohne);
}

.case-studies-description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #475569;
  margin: 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design for New Sections */
@media (max-width: 1024px) {
  .marketplace-banner-section {
    padding: 8rem 0 5rem 0;
  }
  
  .marketplace-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .marketplace-title {
    font-size: 2.75rem;
  }
  
  .case-studies-section {
    padding: 5rem 0 8rem 0;
  }
  
  .case-studies-title {
    font-size: 2.75rem;
  }
  
  .mockup-card-2 {
    transform: rotate(2deg) translateX(1rem);
    margin-top: -1.5rem;
  }
}

@media (max-width: 768px) {
  .marketplace-banner-section {
    padding: 6rem 0 4rem 0;
  }
  
  .marketplace-title {
    font-size: 2.25rem;
  }
  
  .case-studies-section {
    padding: 4rem 0 6rem 0;
  }
  
  .case-studies-title {
    font-size: 2.25rem;
  }
  
  .case-studies-description {
    font-size: 1.125rem;
  }
  
  .marketplace-actions {
    flex-direction: column;
  }
  
  .marketplace-btn {
    width: 100%;
  }
  
  .mockup-card-1 {
    transform: rotate(-1deg);
  }
  
  .mockup-card-2 {
    transform: rotate(1deg) translateX(0.5rem);
    margin-top: -1rem;
  }
}

/* Global Scale step flow */
.global-scale-steps {
  padding: 3rem 0 1rem 0;
  background: linear-gradient(180deg, #fbfbff 0%, #ffffff 100%);
  border-top: 1px solid #eff6ff;
}

.steps-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 1.5rem;
}

.step-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}
.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}
.step-icon-1 { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.step-icon-2 { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); }
.step-icon-3 { background: linear-gradient(135deg, #ecfdf5, #d1fae5); }

.step-title {
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}

.step-text {
  color: #475569;
  line-height: 1.6;
  font-size: 0.95rem;
}

.step-arrow {
  color: #c7d2fe;
}

@media (max-width: 960px) {
  .steps-container {
    grid-template-columns: 1fr;
  }
  .step-arrow { display: none; }
}


/* Global Scale: Step Flow */
.global-scale-steps {
  padding: 3.5rem 0 1rem 0;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.steps-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 1.25rem;
}

.step-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 12px;
  row-gap: 4px;
}

.step-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(37, 99, 235,0.12);
  grid-row: 1 / span 2;
}

.step-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.step-text {
  font-size: 0.9375rem;
  color: #475569;
  line-height: 1.5;
}
.step-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 1024px) {
  .steps-container { grid-template-columns: 1fr; gap: 1rem; }
  .step-arrow { display: none; }
}

/* Enhanced Circle Effect Animations */
.data-node {
  animation: nodePulse 3s ease-in-out infinite;
  transform-origin: center;
}

.data-node:nth-child(odd) {
  animation-delay: 0.5s;
}

.data-node:nth-child(even) {
  animation-delay: 1s;
}

@keyframes nodePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Enhanced connection lines */
.connection-line {
  filter: drop-shadow(0 0 4px currentColor);
}

.line-5 {
  animation-delay: 2.4s;
}

.line-6 {
  animation-delay: 2.8s;
}

@keyframes drawLine {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* Global Data Visualization Section - Stripe-style */
.global-data-section {
  position: relative;
  background: #021C34 !important; /* Very dark blue background */
  color: #ffffff;
  padding: 10rem 0;
  margin-top: -14rem;
  overflow: hidden;
  z-index: 2;
  clip-path: polygon(0 15%, 100% 0%, 100% 100%, 0 100%); /* More pronounced tilt like Stripe */
}

/* Light Ray Effect */
.light-ray {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-45deg);
  width: 200%;
  height: 200%;
  background: linear-gradient(
    180deg,
    transparent 0%,
    transparent 30%,
    rgba(59, 130, 246, 0.15) 45%,
    rgba(37, 99, 235, 0.2) 50%,
    rgba(59, 130, 246, 0.15) 55%,
    transparent 70%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 0;
  animation: lightRayMove 15s ease-in-out infinite;
  transform-origin: center;
}

@keyframes lightRayMove {
  0%, 100% {
    transform: translateX(-50%) rotate(-45deg) translateY(-20%);
    opacity: 0.6;
  }
  50% {
    transform: translateX(-50%) rotate(-45deg) translateY(20%);
    opacity: 1;
  }
}

/* Removed horizontal strips for cleaner professional look */

.global-data-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.global-data-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 4rem;
  align-items: center;
}

/* Vertical Divider - Stripe Style */
.vertical-divider {
  width: 1px;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(226, 232, 240, 0.4) 10%,
    rgba(226, 232, 240, 0.6) 50%,
    rgba(226, 232, 240, 0.4) 90%,
    transparent 100%
  );
  position: relative;
  align-self: stretch;
  flex-shrink: 0;
}

.vertical-divider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(148, 163, 184, 0.3) 20%,
    rgba(148, 163, 184, 0.5) 50%,
    rgba(148, 163, 184, 0.3) 80%,
    transparent 100%
  );
  opacity: 0.8;
}

.vertical-divider-dark {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 10%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.1) 90%,
    transparent 100%
  );
}

.vertical-divider-dark::before {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.08) 80%,
    transparent 100%
  );
}

/* Left Column: Text Content */
.global-data-content {
  position: relative;
  z-index: 2;
}

.global-data-eyebrow {
  margin: 0 0 1.75rem 0;
  font-size: 1.15rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: #143787;
  font-weight: 700;
  font-family: var(--font-family-sohne);
}

.global-data-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin: 0 0 1rem 0;
  font-family: var(--font-family-sohne);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.global-data-subtitle {
  font-size: 1.125rem;
  font-weight: 500;
  color: #60a5fa; /* Celeste accent */
  margin: 0 0 1.5rem 0;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.global-data-description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #A8B2BD; /* Light gray */
  margin: 0 0 3rem 0;
  font-family: var(--font-family-sohne);
  font-weight: 400;
}

.global-marketing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  padding-top: 1.8rem;
  align-items: start;
  position: relative;
}

.global-marketing-card {
  padding: 1rem 2.2rem 0.4rem 0;
  background: transparent;
  border: 0;
  box-shadow: none;
  min-height: 100%;
}

.global-marketing-card + .global-marketing-card {
  padding: 1rem 0 0.4rem 2.2rem;
  border-left: 0;
}

.global-marketing-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0 0 0.95rem 0;
}

.global-marketing-icon {
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.4rem;
  color: #143787;
  background: transparent;
  border: 0;
  box-shadow: none;
  font-size: 2rem;
}

.global-marketing-accent {
  width: 2px;
  height: 1.9rem;
  border-radius: 999px;
  background: linear-gradient(180deg, #3154a8 0%, #143787 100%);
  flex: 0 0 auto;
}

.global-marketing-head h3 {
  margin: 0;
  font-size: 1.95rem;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #0f172a;
  font-weight: 700;
}

.global-marketing-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.65rem;
  max-width: 31ch;
}

.global-marketing-list li {
  position: relative;
  padding-left: 1rem;
  font-size: 1.02rem;
  line-height: 1.6;
  color: #000000;
}

.global-marketing-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7em;
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 999px;
  background: #3b82f6;
}

/* Right Column: Animated Dashboard */
.global-data-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  z-index: 1;
  width: 100%;
  max-width: 680px;
  padding: 2.5rem 3.25rem;
}

.global-data-visual::before {
  content: '';
  position: absolute;
  inset: -15% -25%;
  background: radial-gradient(ellipse at top, rgba(148, 163, 184, 0.25), rgba(226, 232, 240, 0.05) 60%, rgba(226, 232, 240, 0));
  filter: blur(32px);
  opacity: 0.85;
  z-index: 0;
}

.global-data-visual::after {
  content: '';
  position: absolute;
  inset: -6%;
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.35), rgba(248, 250, 252, 0.1) 45%, rgba(226, 232, 240, 0.25) 85%);
  filter: blur(60px);
  opacity: 0.55;
  z-index: 0;
}

.dashboard-container {
  width: 100%;
  max-width: 500px;
  position: relative;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #60a5fa, #3b82f6, #2563eb, #60a5fa);
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Dashboard Header */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.dashboard-header-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  /* No animation - dots are static like in real browser windows */
}

.dot-red {
  background: #FF5F56;
}

.dot-yellow {
  background: #FFBD2E;
}

.dot-green {
  background: #27C93F;
}

.dashboard-title {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
/* Metrics Cards */
.dashboard-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
}

.metric-card-sales {
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.metric-card-users {
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.metric-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.metric-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.metric-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.metric-unit {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-up {
  color: #ffffff !important;
}

.trend-up span {
  color: #ffffff !important;
}

.trend-stable {
  color: rgba(255, 255, 255, 0.6);
}

/* Chart */
.dashboard-chart {
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.live-chart {
  overflow: visible;
}

.chart-line-group {
  transform-origin: center;
}

.chart-line {
  filter: drop-shadow(0 0 8px rgba(93, 211, 255, 0.5));
}

.chart-point {
  filter: drop-shadow(0 0 4px currentColor);
  /* Static points for professional look - no animation */
}

.chart-dot {
  filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.6));
  transition: all 0.2s ease;
}

.chart-dot:hover {
  r: 6;
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
}

.live-counter {
  font-variant-numeric: tabular-nums;
  transition: all 0.2s ease;
}

.live-counter:before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

/* Bar Chart */
.dashboard-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 120px;
  padding-bottom: 0.5rem;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
  height: 100%;
}

.bar-label {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.125rem;
  text-align: center;
  width: 100%;
}

.bar-wrapper {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
  min-height: 0;
}

.bar {
  width: 100%;
  max-width: 24px;
  position: relative;
  border-radius: 4px 4px 0 0;
  animation: barGrow 1.5s ease-out;
  animation-fill-mode: both;
}

.bar-value {
  position: absolute;
  top: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  font-family: var(--font-family-sohne);
}

.bar:nth-child(1) { animation-delay: 0.1s; }
.bar:nth-child(2) { animation-delay: 0.2s; }
.bar:nth-child(3) { animation-delay: 0.3s; }
.bar:nth-child(4) { animation-delay: 0.4s; }
.bar:nth-child(5) { animation-delay: 0.5s; }
.bar:nth-child(6) { animation-delay: 0.6s; }
.bar:nth-child(7) { animation-delay: 0.7s; }

@keyframes barGrow {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bar-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 4px 4px 0 0;
  animation: barShimmer 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(93, 211, 255, 0.4);
}

@keyframes barShimmer {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .global-data-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .global-data-section .global-data-content-lowered {
    margin-top: 0;
  }
  
  .global-data-grid .vertical-divider {
    display: none;
  }
  
  .global-data-visual {
    order: -1; /* Show dashboard first on mobile */
  }
  
  .dashboard-container {
    max-width: 100%;
  }
  
  .dashboard-card {
    padding: 1.25rem;
  }
  
  .dashboard-metrics {
    gap: 0.75rem;
  }
  
  .dashboard-bars {
    height: 100px;
  }
  
  .global-data-title {
    font-size: 2.75rem;
  }
  
  .global-marketing-grid {
    grid-template-columns: 1fr;
  }

  .global-marketing-card {
    padding: 0.2rem 0 1.35rem 0;
  }

  .global-marketing-card + .global-marketing-card {
    padding: 1.35rem 0 0 0;
  }

  .global-marketing-head h3 {
    font-size: 1.65rem;
  }

  .global-marketing-list {
    max-width: none;
  }
}

/* Responsive chart styles */
@media (max-width: 768px) {
  .preview-chart {
    height: 180px;
    padding: 0.75rem 0.875rem 0.5rem 0.875rem;
  }
  
  .chart-bars {
    gap: 0.375rem;
  }
  
  .mini-line-chart {
    height: 45px;
  }
}

@media (max-width: 480px) {
  .preview-chart {
    height: 160px;
    padding: 0.625rem 0.75rem 0.5rem 0.75rem;
  }
  
  .chart-bars {
    gap: 0.25rem;
  }
  
  .chart-bar-label {
    font-size: 0.5rem;
  }
  
  .mini-line-chart {
    height: 40px;
  }
}

@media (max-width: 768px) {
  .global-data-section {
    padding: 5rem 0;
    margin-top: -6rem;
    clip-path: polygon(0 4%, 100% 0%, 100% 98%, 0 100%); /* Adjusted for natural overlap on mobile */
  }
  
  .global-data-title {
    font-size: 2.25rem;
  }
  
  .global-data-subtitle {
    font-size: 1rem;
  }
  
  .global-data-description {
    font-size: 1rem;
  }
  
  .globe-container {
    max-width: 100%;
  }
}
@media (max-width: 480px) {
  .global-data-title {
    font-size: 1.875rem;
  }
  
  .global-marketing-card {
    padding: 0.2rem 0 1rem 0;
  }

  .global-marketing-icon {
    width: 2.4rem;
    height: 2.4rem;
    margin-bottom: 1rem;
    font-size: 1.55rem;
  }

  .global-marketing-head {
    gap: 0.7rem;
  }

  .global-marketing-accent {
    height: 1.55rem;
  }

  .global-marketing-head h3 {
    font-size: 1.35rem;
  }

  .global-marketing-list li {
    font-size: 0.95rem;
  }
}
/* Central hub animations */
.central-hub {
  animation: hubPulse 2.5s ease-in-out infinite;
}

.central-hub-inner {
  animation: hubInnerPulse 2.5s ease-in-out infinite;
  animation-delay: 0.3s;
}

.central-hub-core {
  animation: hubCorePulse 1.8s ease-in-out infinite;
  animation-delay: 0.6s;
}

@keyframes hubPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

@keyframes hubInnerPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}

@keyframes hubCorePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
}

/* Pulsing rings around central hub */
.pulse-ring {
  animation: ringPulse 3s ease-in-out infinite;
}

.ring-1 {
  animation-delay: 0s;
}

.ring-2 {
  animation-delay: 1s;
}

@keyframes ringPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.globe-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
  animation: particleFloat 8s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.8;
  }
}

/* Admin Menu - Inside Dashboard Preview */
.preview-admin-menu {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 10;
  font-family: var(--font-family-sohne);
}

.preview-admin-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  border: 2px solid #1e40af;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(30, 64, 175, 0.3), 
              0 1px 3px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 11px;
}

.preview-admin-trigger:hover {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4), 
              0 2px 6px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.preview-admin-trigger:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(30, 64, 175, 0.3), 
              0 1px 2px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.preview-admin-seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  padding: 3px;
  transition: all 0.2s ease;
}

.preview-admin-trigger:hover .preview-admin-seal {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: rotate(5deg);
}

.preview-admin-seal svg {
  color: #ffffff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.preview-admin-label {
  font-weight: 600;
  letter-spacing: 0.8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.preview-admin-dropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  min-width: 240px;
  background: #ffffff;
  border: 2px solid #1e3a8a;
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(30, 58, 138, 0.25),
              0 3px 6px rgba(0, 0, 0, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  animation: previewAdminMenuSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes previewAdminMenuSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.preview-admin-header {
  padding: 16px 16px 12px;
  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  color: #ffffff;
  border-bottom: 2px solid #1e40af;
}

.preview-admin-title {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 3px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.preview-admin-subtitle {
  font-size: 11px;
  opacity: 0.9;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-weight: 500;
}

.preview-admin-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  margin: 0;
}

.preview-admin-items {
  padding: 6px;
  background: #ffffff;
}

.preview-admin-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  color: #1f2937;
  text-decoration: none;
  border-radius: 5px;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.preview-admin-item:hover {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
  transform: translateX(3px);
  box-shadow: 0 1px 3px rgba(30, 64, 175, 0.1);
}

.preview-admin-item:active {
  transform: translateX(2px);
}

.preview-admin-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(30, 64, 175, 0.1);
  border-radius: 5px;
  color: #1e40af;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.preview-admin-item:hover .preview-admin-item-icon {
  background: rgba(30, 64, 175, 0.15);
  transform: scale(1.1);
}

.preview-admin-item-icon svg {
  width: 16px;
  height: 16px;
}

/* API Experience Section */
.saas-platform-section {
  padding: 0 0 8rem 0;
  background: linear-gradient(180deg, #f5f9fc 0%, #edf3ff 100%);
  position: relative;
  margin-bottom: 6rem;
}

.saas-platform-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.saas-platform-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.invoices-section {
  margin-top: 2rem;
  position: relative;
  background: #f9fafc;
  padding: 6rem 0 6rem 0;
  width: 100%;
  overflow: hidden;
}

.invoices-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.invoices-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f9fafc;
  pointer-events: none;
  z-index: 0;
}
.invoices-section::after {
  display: none;
}

.invoices-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 3rem;
  align-items: center;
}

.invoices-left {
  padding-top: 0;
  margin-top: -4rem;
  align-self: start;
}

.invoices-title {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding-top: 0;
}

.invoices-subtitle {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.invoices-description {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #475569;
  margin: 0 0 2.5rem 0;
  font-weight: 400;
}

.invoices-section-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin: 2.5rem 0;
}

.invoices-section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.invoices-section-description {
  font-size: 1rem;
  line-height: 1.7;
  color: #64748b;
  margin: 0 0 1.25rem 0;
  font-weight: 400;
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  perspective: 1000px;
  max-width: 400px;
}

.payment-method {
  padding: 1.25rem 0.75rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: none;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  transform-style: preserve-3d;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  cursor: pointer;
  overflow: hidden;
  backface-visibility: hidden;
}

.payment-method::before {
  display: none;
}

.payment-method::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.6) 50%,
    transparent 70%
  );
  transform: rotate(45deg);
  transition: transform 0.6s ease;
  opacity: 0;
  z-index: 1;
}

.payment-method:hover::after {
  transform: rotate(45deg) translate(100%, 100%);
  opacity: 1;
}

.payment-method > * {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.payment-method .payment-icon {
  font-size: 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex !important;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  visibility: visible !important;
  opacity: 1 !important;
  background: none !important;
  border-radius: 0 !important;
  border: none !important;
}

.payment-icon-img {
  object-fit: contain;
}

.payment-icon-img-wide {
  width: 3.1rem !important;
}

.payment-icon svg {
  width: 2.5rem;
  height: 2.5rem;
  display: block;
}

.payment-icon svg path {
  fill: currentColor;
}

.payment-method span {
  display: inline-block;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-family: var(--font-family-sohne);
  color: #0f172a;
  font-weight: 700;
}

.payment-method:hover {
  background: linear-gradient(135deg, #e8eef7 0%, #dbe4f2 100%);
  border: none;
  color: #0f172a;
  transform: translateY(-8px) scale(1.04);
  box-shadow: 
    0 16px 32px rgba(15, 23, 42, 0.18),
    0 8px 16px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.payment-method:hover::before {
  display: none;
}

.payment-method:hover .payment-icon {
  transform: scale(1.03);
}

.payment-method:hover span {
  transform: scale(1.01);
}

/* Payment method icon colors - icons maintain their brand colors */
.payment-stripe .payment-icon {
  color: #2563eb;
}

.payment-apple .payment-icon {
  color: #000000;
}

.payment-apple span {
  color: #0f172a;
}

.payment-paypal .payment-icon {
  color: #0070ba;
}

.payment-custom .payment-icon {
  color: #2563eb;
}

.payment-elastic .payment-icon {
  color: #f97316;
}

.payment-postgres .payment-icon {
  color: #2563eb;
}

.payment-rest .payment-icon {
  color: #0ea5e9;
}

.payment-mongo .payment-icon {
  color: #16a34a;
}

.payment-visa .payment-icon {
  color: #1434cb;
}

.payment-alipay .payment-icon {
  color: #1677ff;
}

/* Dashboard component icon colors */
.dashboard-component .payment-icon {
  color: #2563eb;
}

.dashboard-component:nth-child(1) .payment-icon {
  color: #3b82f6;
}

.dashboard-component:nth-child(2) .payment-icon {
  color: #0ea5e9;
}

.dashboard-component:nth-child(3) .payment-icon {
  color: #10b981;
}

.dashboard-component:nth-child(4) .payment-icon {
  color: #f59e0b;
}

.dashboard-component:nth-child(5) .payment-icon {
  color: #ef4444;
}

.dashboard-component:nth-child(6) .payment-icon {
  color: #06b6d4;
}

.dashboard-component:nth-child(7) .payment-icon {
  color: #42b883;
}

.dashboard-component:nth-child(8) .payment-icon {
  color: #339933;
}

.invoices-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.invoices-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #64748b;
}

.invoices-feature::before {
  content: '?';
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%);
  border-radius: 50%;
  color: #2563eb;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.invoices-right {
  width: 100%;
  max-width: 460px;
  align-self: stretch;
  justify-self: center;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.payment-form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-width: 480px;
}

.payment-form-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.payment-form-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.payment-form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  letter-spacing: -0.02em;
}

.payment-form-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

.payment-form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.payment-field-half {
  flex: 1;
}

.payment-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  letter-spacing: -0.01em;
}

.payment-amount-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.payment-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: #64748b;
}

.payment-amount-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.payment-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.payment-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.payment-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.payment-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.payment-card-icons {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.payment-select-wrapper {
  position: relative;
}

.payment-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.payment-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.payment-select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #64748b;
}

.payment-form-footer {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payment-security {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #64748b;
  justify-content: center;
}

.payment-security svg {
  color: #10b981;
  flex-shrink: 0;
}
.revenue-category {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.revenue-title {
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  letter-spacing: -0.025em;
  line-height: 1.25;
}

.revenue-description {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #475569;
  margin: 0;
  font-weight: 400;
  font-family: var(--font-family-sohne);
}

.revenue-platform-right {
  width: 100%;
  position: relative;
}

.revenue-boxes-wrapper {
  position: relative;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.revenue-boxes-container {
  position: relative;
  flex: 1;
  height: 320px;
  overflow: hidden;
}

.revenue-box {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, scale;
  transform-origin: center top;
  /* Decorative only - no click interactions */
  pointer-events: none;
  cursor: default;
}

/* Position 0: Top visible (fully visible) - Main display */
.revenue-box.box-pos-0 {
  top: 0;
  transform: translateY(0) scale(1);
  opacity: 1;
  z-index: 3;
}

.revenue-box.box-pos-0 .revenue-box-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
}

.revenue-box.box-pos-0 .revenue-box-icon {
  width: 44px;
  height: 44px;
}

.revenue-box.box-pos-0 .revenue-box-icon svg {
  width: 22px;
  height: 22px;
}

/* Position 1: Second visible (mostly visible) - stacked */
.revenue-box.box-pos-1 {
  top: 120px;
  transform: translateY(0) scale(0.95);
  opacity: 0.6;
  z-index: 2;
  filter: blur(1px);
}

/* Position 2: Third visible (barely visible at bottom) - stacked */
.revenue-box.box-pos-2 {
  top: 240px;
  transform: translateY(0) scale(0.9);
  opacity: 0.2;
  z-index: 1;
  filter: blur(2px);
}

.revenue-box-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.15) 100%);
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.revenue-box-icon svg {
  width: 22px;
  height: 22px;
  color: #475569;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.revenue-box-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.revenue-box-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #334155;
  font-weight: 400;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Non-displayed boxes - slightly muted */
.revenue-box.box-pos-1 .revenue-box-text,
.revenue-box.box-pos-2 .revenue-box-text {
  color: #475569;
  font-size: 0.875rem;
}

/* API Highlight Card - Dark blue gradient banner */
.saas-highlight-card {
  position: relative;
  border-radius: 24px;
  padding: 60px 50px;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #1e40af 50%, #1e3a8a 75%, #0f172a 100%);
  color: #ffffff;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 3rem;
  margin-top: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.saas-highlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 60%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  pointer-events: none;
  animation: shimmer-bg 10s ease-in-out infinite;
}

@keyframes shimmer-bg {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.quote-mark {
  position: absolute;
  top: 20px;
  left: 32px;
  font-size: 140px;
  color: rgba(255, 255, 255, 0.08);
  font-weight: 900;
  line-height: 1;
  pointer-events: none;
  font-family: var(--font-family-sohne);
}

.highlight-content {
  position: relative;
  z-index: 1;
}

.highlight-quote {
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: 1.6;
  margin: 0;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.highlight-quote::after {
  content: ' Whether you\'re managing subscriptions, tracking usage-based billing, or scaling your platform globally, our unified infrastructure provides everything you need.';
  font-weight: 500;
  opacity: 0.95;
  display: block;
  margin-top: 1rem;
}

/* Country Banner */
/* Country Selector - Stripe Style (Outside Box) */
.country-selector-stripe {
  display: flex;
  gap: 0.45rem;
  width: 100%;
  margin-bottom: 0.75rem;
  background: transparent;
  border: none;
  padding: 0;
  position: relative;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.country-tab {
  padding: 0.38rem 0.8rem;
  border: none;
  background: #f9fbff;
  font-size: 0.7rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-family-sohne);
  border-radius: 10px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.28rem;
  justify-content: center;
  text-align: center;
  min-height: 38px;
  min-width: 0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04);
  white-space: nowrap;
}

.country-tab:hover {
  color: #1e293b;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.16), 0 3px 8px rgba(15, 23, 42, 0.1);
  transform: translateY(-0.5px);
}

.country-tab.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
  color: #ffffff;
  font-weight: 700;
  border-color: transparent;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.22), 0 3px 10px rgba(15, 23, 42, 0.12);
  transform: translateY(-0.5px);
}

.country-tab.active:hover {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.28), 0 6px 14px rgba(15, 23, 42, 0.16);
  transform: translateY(-1.5px);
}

.country-flag {
  font-size: 1.125rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

/* Accounting Track Card - Professional Bookkeeping Style */
.accounting-track-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 540px;
  min-width: 540px;
  max-width: 540px;
  height: 780px;
  min-height: 780px;
  max-height: 780px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  transform: translateY(-12px);
}

.accounting-track-card:hover {
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
  border-color: #d5dee9;
  transform: translateY(-12px);
}

.accounting-track-header {
  padding: 1.75rem 1.75rem 1.25rem 1.75rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.accounting-track-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
  font-family: var(--font-family-sohne);
}

.accounting-track-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
  font-family: var(--font-family-sohne);
}

.accounting-track-body {
  padding: 1.5rem 1.75rem 2.5rem;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-height: 0;
}

.mini-api-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #ffffff;
  padding: 0.45rem 0.5rem 0.45rem 0.72rem;
}

.mini-api-search-icon {
  color: #2563eb;
  font-size: 0.82rem;
}

.mini-api-search-text {
  flex: 1;
  font-size: 0.78rem;
  color: #1d4ed8;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.mini-api-search-btn {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.32rem 0.64rem;
}

.accounting-table {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 1rem;
}

/* Summary Section */
.accounting-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  padding: 0.95rem 1.2rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.9rem;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}
.summary-value {
  font-size: 1.35rem;
  font-weight: 700;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.02em;
}

.summary-value.positive {
  color: #10b981;
}

.summary-value.negative {
  color: #ef4444;
}

/* Accounting Table */
.accounting-table {
  margin-bottom: 1.1rem;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.accounting-table-header {
  display: grid;
  grid-template-columns: 1.1fr 2fr 1fr 1.1fr;
  gap: 0.75rem;
  padding: 0.7rem 0.95rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.45rem;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.accounting-table-header > div {
  font-size: 0.75rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}

.accounting-table-header > div + div {
  border-left: 1px solid rgba(148, 163, 184, 0.22);
  padding-left: 0.75rem;
  margin-left: -0.1rem;
}

.accounting-table-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: visible;
  padding-right: 0.25rem;
  padding-bottom: 0.5rem;
}

/* Remove horizontal scrolling in the events table */
.landing-page .invoices-section .accounting-table {
  overflow-x: visible !important;
}

.landing-page .invoices-section .accounting-table-header,
.landing-page .invoices-section .accounting-table-row {
  min-width: 0 !important;
}

.accounting-table-row {
  display: grid;
  grid-template-columns: 1.1fr 2fr 1fr 1.1fr;
  gap: 0.75rem;
  padding: 0.95rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.accounting-table-row > div + div {
  border-left: 1px solid rgba(226, 232, 240, 0.7);
  padding-left: 0.75rem;
  margin-left: -0.1rem;
}

.accounting-table-row:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.table-col-date {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  font-family: var(--font-family-sohne);
}

.table-col-description {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  font-family: var(--font-family-sohne);
}

.table-col-category {
  display: flex;
  align-items: center;
}

.category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: var(--font-family-sohne);
}

.category-badge.revenue {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.category-badge.expense {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.table-col-amount {
  font-size: 0.9375rem;
  font-weight: 700;
  text-align: right;
  font-family: var(--font-family-sohne);
  letter-spacing: -0.01em;
}

.table-col-amount.positive {
  color: #10b981;
}

.table-col-amount.negative {
  color: #ef4444;
}

/* View All Button */
.accounting-view-all {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background: #1d4ed8;
  border: 1px solid #1d4ed8;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-family-sohne);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 0;
  box-shadow: none;
  position: relative;
  margin-top: 0.9rem;
}

.landing-page .invoices-section .accounting-track-body .accounting-view-all {
  margin-top: 0.9rem !important;
}

.accounting-view-all-header {
  border: 1px solid transparent;
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 55%, #172554 100%);
  color: #ffffff !important;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.34rem 0.64rem;
  border-radius: 8px;
  line-height: 1;
  white-space: nowrap;
  box-shadow: 0 6px 14px rgba(30, 58, 138, 0.32), 0 3px 10px rgba(15, 23, 42, 0.16);
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.accounting-view-all-header:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #172554 60%, #0f172a 100%);
  color: #ffffff !important;
  box-shadow: 0 10px 20px rgba(23, 37, 84, 0.34), 0 6px 14px rgba(15, 23, 42, 0.2);
  transform: translateY(-1px);
}

.accounting-view-all-header span {
  color: #ffffff !important;
}

.accounting-view-all,
.accounting-view-all span,
.accounting-view-all .btn-chevron {
  color: #ffffff;
}

.accounting-view-all:hover {
  background: #1e40af;
  border-color: #1e40af;
  transform: none;
  box-shadow: none;
}

.accounting-view-all:focus,
.accounting-view-all:focus-visible,
.accounting-view-all:active {
  background: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.28);
  transform: none;
  outline: none;
}

.accounting-view-all:focus:not(:focus-visible) {
  box-shadow: 0 12px 26px rgba(30, 64, 175, 0.42);
}

.accounting-view-all .btn-chevron {
  font-size: 1.1rem;
  line-height: 1;
  transition: transform 0.2s ease;
}

.accounting-view-all::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.06) 60%, rgba(255, 255, 255, 0) 100%);
  opacity: 0.85;
  mix-blend-mode: screen;
  pointer-events: none;
}

.accounting-view-all:hover .btn-chevron {
  transform: translateX(2px);
}

/* Legacy styles - kept for backward compatibility */
.country-banner {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
  padding: 8px;
  background: linear-gradient(135deg, rgba(241, 245, 249, 0.8) 0%, rgba(226, 232, 240, 0.6) 100%);
  border: 1px solid rgba(203, 213, 225, 0.5);
  border-radius: 10px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6);
}

.country-item {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(203, 213, 225, 0.3);
}

.country-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #334155;
  border-color: rgba(148, 163, 184, 0.4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.country-item.active {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}
/* Responsive */
@media (max-width: 768px) {
  .saas-platform-section {
    padding: 4rem 0 6rem 0;
  }
  
  .saas-highlight-card {
    padding: 50px 32px;
  }
  
  .quote-mark {
    font-size: 100px;
    top: 15px;
    left: 24px;
  }
  
  .highlight-quote {
    font-size: 1.125rem;
  }
  
  .saas-highlight-card {
    padding: 60px 32px;
  }
  
    .invoices-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    
    .invoices-left {
      padding-top: 0;
    }
    
    .invoices-title {
      font-size: 1.75rem;
    }
    
    .invoices-right {
      max-width: 100%;
      gap: 1rem;
    }

  .invoices-description {
    font-size: 1rem;
  }
  
    .country-banner {
      padding: 8px;
    }
    
    .country-item {
      padding: 6px 12px;
      font-size: 0.8125rem;
    }
    
    .payment-form-card {
      padding: 24px;
      max-width: 100%;
    }

    .country-selector-stripe {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .country-tab {
      min-height: 36px;
      font-size: 0.72rem;
      padding: 0.4rem 0.75rem;
      flex: 1 1 calc(50% - 0.5rem);
    }

    .accounting-track-card {
      min-height: auto;
      height: auto;
    transform: none;
    box-shadow: 0 8px 28px rgba(15, 23, 42, 0.16), 0 3px 10px rgba(15, 23, 42, 0.12);
    }

    .accounting-track-body {
      gap: 1.25rem;
    }
  
  .accounting-track-card:hover {
    transform: none;
  }
  
  .payment-field-row {
    grid-template-columns: 1fr;
  }
  
    .accounting-summary {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .accounting-table-header,
    .accounting-table-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .accounting-table-header > div + div,
    .accounting-table-row > div + div {
      border-left: none;
      padding-left: 0;
      margin-left: 0;
    }

    .accounting-table {
      min-height: auto;
    }

    .accounting-table-body {
      overflow: visible;
      padding-right: 0;
    }

    .accounting-view-all {
      margin-top: 1.5rem;
    }
  
  .accounting-table-header > div,
  .accounting-table-row > div {
    padding: 0.5rem 0;
  }
  
  .table-col-amount {
    text-align: left;
  }
  
  .accounting-table-header {
    display: none;
  }
  
  .accounting-table-row {
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }
  
  .accounting-table-row::before {
    content: attr(data-label);
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }
  
  .revenue-platform-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  
  .revenue-title {
    font-size: 2rem;
  }
  
  .revenue-description {
    font-size: 1rem;
  }
  
  .revenue-boxes-container {
    height: 400px;
  }
  
  .revenue-box {
    padding: 1.25rem;
  }
  
  .revenue-box.box-pos-1 {
    top: 140px;
  }
  
  .revenue-box.box-pos-2 {
    top: 280px;
  }
  
  .revenue-box.box-pos-3 {
    top: 380px;
  }
  
  /* Analytics Platform Responsive */
  .analytics-platform-section {
    padding: 5rem 0;
  }
  
  .analytics-platform-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  
  .analytics-title {
    font-size: 2rem;
  }
  
  .analytics-description {
    font-size: 1rem;
  }
  
  .analytics-boxes-container {
    height: 400px;
  }
  .analytics-box {
    padding: 1.25rem;
  }
  
  .analytics-box.box-pos-1 {
    top: 140px;
  }
  
  .analytics-box.box-pos-2 {
    top: 280px;
  }
  
  .analytics-box.box-pos-3 {
    top: 380px;
  }
  
  .revenue-box.box-pos-4 {
    top: 400px;
  }
  
  .revenue-box-title {
    font-size: 0.875rem;
  }
  
  .revenue-box-text {
    font-size: 0.8125rem;
  }
  
  .revenue-scrollbar {
    height: 400px;
  }
}

/* Financial Accounts Section */
.financial-accounts-section {
  padding: 6rem 0;
  background: #f5f9fc;
  position: relative;
  overflow: hidden;
}

.financial-accounts-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.financial-accounts-section::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.financial-accounts-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.financial-accounts-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 4rem;
  align-items: start;
}

.financial-accounts-left {
  padding-top: 1rem;
}

.financial-accounts-category {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.financial-accounts-title {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.financial-accounts-description {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #475569;
  margin: 0 0 2rem 0;
  font-weight: 400;
  font-family: var(--font-family-sohne);
}

.financial-accounts-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.financial-accounts-feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  color: #334155;
  font-weight: 500;
}

.financial-accounts-feature svg {
  flex-shrink: 0;
}

.financial-accounts-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.financial-accounts-button-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-family-sohne);
}

.financial-accounts-button-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.financial-accounts-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.financial-accounts-link:hover {
  color: #2563eb;
  gap: 12px;
}

.financial-accounts-right {
  width: 100%;
  position: relative;
}

.financial-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.financial-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.financial-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.financial-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-3px);
  border-color: #cbd5e1;
}

.financial-card:hover::before {
  opacity: 1;
}

.financial-card-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.balance-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.financial-balance-amount {
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.financial-balance-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.financial-button-outline {
  padding: 10px 20px;
  background: #ffffff;
  color: #3b82f6;
  border: 1.5px solid #3b82f6;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.financial-button-outline:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: #2563eb;
}

.financial-button-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-family-sohne);
}

.financial-button-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.financial-button-full {
  width: 100%;
  padding: 14px 24px;
  margin-top: 16px;
}

.tabs-card {
  display: flex;
  flex-direction: column;
  padding: 0;
}

.financial-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 20px 28px 0 28px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0;
}

.financial-tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: var(--font-family-sohne);
  border-radius: 6px 6px 0 0;
  position: relative;
  margin-bottom: -1px;
}
.financial-tab:hover {
  color: #334155;
  background: rgba(148, 163, 184, 0.1);
}

.financial-tab.active {
  color: #3b82f6;
  font-weight: 600;
  border-bottom: 2px solid #3b82f6;
}

.financial-tab-content {
  padding: 28px;
}

.transactions-card {
  display: flex;
  flex-direction: column;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.transaction-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.transaction-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.transaction-item:hover::before {
  opacity: 1;
}

.transaction-item.transaction-negative::before {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.transaction-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
  border-radius: 10px;
  color: #3b82f6;
  transition: all 0.3s ease;
}

.transaction-item:hover .transaction-icon {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%);
  transform: scale(1.05);
}

.transaction-item.transaction-negative .transaction-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #ef4444;
}

.transaction-item.transaction-negative:hover .transaction-icon {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%);
}

.transaction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.transaction-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.transaction-merchant {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.transaction-date {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
}

.transaction-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
  text-align: right;
}

.transaction-amount.amount-negative {
  color: #ef4444;
}

.transaction-crypto {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  white-space: nowrap;
  text-align: right;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
}

/* Transaction slide animations */
.transaction-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.transaction-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  width: 100%;
  left: 0;
}

.transaction-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.transaction-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.transaction-slide-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.account-details-card {
  display: flex;
  flex-direction: column;
}

.account-details-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
}

.account-detail-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-detail-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.account-detail-input {
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #1e293b;
  font-family: var(--font-family-sohne);
  font-weight: var(--font-weight-normal);
  transition: all 0.2s ease;
}

.account-detail-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.account-detail-input:read-only {
  cursor: default;
}

/* Responsive Design */
@media (max-width: 968px) {
  .financial-accounts-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .financial-accounts-right {
    order: -1;
  }
  
  .financial-balance-amount {
    font-size: 1.75rem;
  }
}

@media (max-width: 640px) {
  .financial-accounts-section {
    padding: 4rem 0;
  }
  
  .financial-accounts-container {
    padding: 0 16px;
  }
  
  .financial-balance-actions {
    flex-direction: column;
  }
  
  .financial-button-outline,
  .financial-button-primary {
    width: 100%;
  }
  
  .transaction-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .transaction-icon {
    width: 36px;
    height: 36px;
  }
  
  .transaction-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .transaction-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .transaction-amount,
  .transaction-crypto {
    text-align: left;
  }
  
  .transaction-merchant {
    font-size: 0.9375rem;
  }
  
  .transaction-amount {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .country-selector-stripe {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .country-tab {
    min-height: 46px;
    font-size: 0.78rem;
    padding: 0.65rem 0.8rem;
  }
}

/* Final hero typography override to avoid cascade conflicts */
.hero-section .hero-content {
  text-align: left;
  max-width: 680px;
}

.hero-section .hero-title {
  font-family: var(--font-family-sohne);
  font-weight: 700 !important;
  font-size: clamp(4.8rem, 8.8vw, 6.8rem) !important;
  line-height: 0.96 !important;
  letter-spacing: -0.028em !important;
  margin: 0 0 1.2rem 0 !important;
  text-wrap: balance;
}

.hero-section .hero-line {
  display: block;
  margin: 0;
}

.hero-section .hero-line:last-child {
  margin-top: -0.02em;
}

.hero-section .hero-line > span {
  margin-right: 0.14em;
}

.hero-section .hero-title-base,
.hero-section .hero-title-clients {
  color: #0f172a;
  font-weight: 700;
  letter-spacing: -0.024em;
}

.hero-section .hero-title-emphasis {
  font-weight: 700;
  letter-spacing: -0.024em;
  background: linear-gradient(120deg, #2563eb 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.hero-section .hero-description {
  max-width: 36rem;
  color: #334155;
}

@media (max-width: 768px) {
  .hero-section .hero-content {
    text-align: center;
    max-width: 100%;
  }

  .hero-section .hero-title {
    font-size: clamp(3.3rem, 11.2vw, 4.7rem) !important;
    line-height: 0.98 !important;
    letter-spacing: -0.022em !important;
  }

  .hero-section .hero-description {
    margin-left: auto;
    margin-right: auto;
  }
}

@media (max-width: 480px) {
  .hero-section .hero-title {
    font-size: clamp(2.8rem, 10.6vw, 3.6rem) !important;
    line-height: 1 !important;
    letter-spacing: -0.018em !important;
  }
}

/* Home visual reset: cleaner composition and calmer styles */
.landing-page {
  background: #f8fafc;
}

.hero-section {
  min-height: 88vh !important;
  padding: 3.4rem 0 4.2rem 0 !important;
}

.hero-container {
  grid-template-columns: 1fr 1fr !important;
  gap: 2.4rem !important;
  align-items: center !important;
}

.hero-container .vertical-divider {
  display: none !important;
}

.hero-section .hero-content {
  max-width: 760px !important;
}

.hero-section .hero-title {
  font-size: clamp(9.8rem, 15.2vw, 13.4rem) !important;
  line-height: 0.88 !important;
  letter-spacing: -0.034em !important;
}

.hero-section .hero-description {
  font-size: 1.02rem;
  line-height: 1.65;
}

.hero-actions {
  justify-items: start !important;
  margin-bottom: 2.2rem !important;
}

.hero-stats {
  max-width: 520px !important;
  gap: 0.8rem !important;
}

.hero-stats .stat-item {
  padding: 0.25rem 0.2rem !important;
}

.dashboard-preview {
  transform: none !important;
  border-radius: 22px !important;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.14), 0 8px 24px rgba(15, 23, 42, 0.08) !important;
}

.preview-main {
  padding: 1rem !important;
}

.features-section {
  margin-top: 0 !important;
  padding: 3.4rem 0 12rem 0 !important;
}

.landing-page > section.global-data-section {
  margin-top: -2.5rem !important;
  padding: 10rem 0 11rem 0 !important;
  clip-path: polygon(0 18%, 100% 0%, 100% 100%, 0 100%) !important;
  -webkit-clip-path: polygon(0 18%, 100% 0%, 100% 100%, 0 100%) !important;
  border-radius: 0 !important;
}

.landing-page > section.global-data-section::before {
  content: '';
  position: absolute;
  top: -84px;
  left: 0;
  right: 0;
  height: 90px;
  background: #0a0524;
  clip-path: polygon(0 100%, 100% 0, 100% 100%);
  -webkit-clip-path: polygon(0 100%, 100% 0, 100% 100%);
  pointer-events: none;
}

.section-header {
  margin-bottom: 3rem !important;
}

.feature-card {
  border-radius: 18px !important;
  padding: 2rem !important;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04) !important;
}

.feature-card:hover {
  transform: translateY(-4px) !important;
}

.landing-page > section.cta-section {
  margin-top: -11rem !important;
  padding: 2.75rem 0 2.2rem 0 !important;
}

.landing-page > section.cta-section .cta-container {
  max-width: 1280px !important;
  width: min(96%, 1280px) !important;
  margin: 0 auto !important;
  padding: 1.75rem clamp(1.25rem, 4vw, 3rem) !important;
}

.landing-page > section.cta-section .cta-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: -6px;
}

@media (max-width: 1024px) {
  .landing-page > section.cta-section {
    margin-top: -7.6rem !important;
    padding: 2.4rem 0 2rem 0 !important;
  }

  .landing-page > section.cta-section .cta-container {
    padding: 1.5rem 1.25rem !important;
  }
}

.global-data-section .global-data-container {
  max-width: 1380px !important;
  padding: 0 2.5rem !important;
}

.global-data-section .global-data-grid {
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1.25fr) !important;
  gap: 2.5rem !important;
  align-items: center !important;
}

.global-data-section .global-data-content-lowered {
  margin-top: 5rem;
  align-self: center;
}

.global-data-section .global-data-visual {
  max-width: none !important;
  width: 100% !important;
  padding: 1.2rem 0 !important;
}

.global-data-section .api-terminal-card {
  width: 100% !important;
  max-width: none !important;
  border-radius: 14px !important;
}

.global-data-section .api-terminal-card::before {
  border-radius: 12px !important;
}

@media (max-width: 768px) {
  .hero-section {
    min-height: auto !important;
    padding: 2.6rem 0 3.2rem 0 !important;
  }

  .hero-container {
    grid-template-columns: 1fr !important;
    gap: 1.8rem !important;
  }

  .hero-section .hero-content {
    text-align: center !important;
    max-width: 100% !important;
  }

  .global-data-section .global-data-content-lowered {
    margin-top: 0;
  }

  .hero-section .hero-title {
    font-size: clamp(6.2rem, 16vw, 8.6rem) !important;
    line-height: 0.89 !important;
  }

  .hero-actions {
    justify-items: center !important;
  }

  .hero-stats {
    max-width: 100% !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .features-section {
    padding: 2.6rem 0 9rem 0 !important;
  }

  .landing-page > section.global-data-section {
    margin-top: -3.2rem !important;
    padding: 6.6rem 0 7.5rem 0 !important;
    clip-path: polygon(0 10%, 100% 0%, 100% 100%, 0 100%) !important;
    -webkit-clip-path: polygon(0 10%, 100% 0%, 100% 100%, 0 100%) !important;
    border-radius: 0 !important;
  }

  .landing-page > section.global-data-section::before {
    top: -44px;
    height: 48px;
  }

  .global-data-section .global-data-container {
    padding: 0 1.2rem !important;
  }

  .landing-page > section.cta-section {
    margin-top: -5.3rem !important;
    padding: 2rem 0 1.6rem 0 !important;
  }

  .landing-page > section.cta-section .cta-container {
    padding: 1.25rem 1rem !important;
  }
}

@media (max-width: 480px) {
  .landing-page > section.cta-section {
    margin-top: -3.6rem !important;
    padding: 1.6rem 0 1.2rem 0 !important;
  }

  .landing-page > section.cta-section .cta-container {
    padding: 1rem 0.85rem !important;
  }
}

@media (max-width: 480px) {
  .hero-section .hero-title {
    font-size: clamp(5rem, 17.2vw, 6.6rem) !important;
    line-height: 0.92 !important;
    letter-spacing: -0.026em !important;
  }
}

/* Home conversion + credibility polish */
.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.7rem;
  color: #0f766e;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 26%, rgba(30, 64, 175, 0.1) 1px, transparent 1.5px),
    radial-gradient(circle at 72% 36%, rgba(37, 99, 235, 0.08) 1px, transparent 1.5px),
    linear-gradient(120deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px),
    linear-gradient(60deg, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 120px 120px, 140px 140px, 180px 180px, 180px 180px;
  background-position: 0 0, 20px 10px, 0 0, 28px 22px;
  opacity: 0.45;
  pointer-events: none;
}

.hero-proof {
  margin: 0 0 0.9rem;
  color: #0f172a;
  font-size: 0.93rem;
  font-weight: 600;
}

.hero-actions {
  display: flex !important;
  flex-wrap: wrap;
  gap: 0.85rem 1rem !important;
  margin-bottom: 2rem !important;
}

.hero-actions .btn-primary,
.hero-actions .btn-secondary {
  min-width: 174px;
}

.hero-section .hero-description {
  color: #1e293b !important;
  font-size: 1.18rem !important;
  line-height: 1.72 !important;
  max-width: 42rem;
}

.hero-visual .dashboard-preview {
  min-height: 430px;
}

.hero-visual .search-engine-preview {
  min-height: 390px;
  height: 390px;
  max-height: 390px;
}

.search-engine-source-icons .source-icon-chip:nth-child(n + 3) {
  display: none;
}

.search-engine-source-icons {
  margin-right: 0.16rem;
}

.search-engine-bar {
  gap: 0.56rem;
}

.search-engine-results .engine-result {
  animation: resultFadeIn 0.26s ease both;
  position: relative;
  overflow: hidden;
}

.search-engine-results .engine-result::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.55) 48%, transparent 100%);
  transform: translateX(-120%);
  animation: resultShimmer 2.8s ease-in-out infinite;
  pointer-events: none;
}

.search-engine-results .engine-result:nth-child(2)::after {
  animation-delay: 0.25s;
}

.search-engine-results .engine-result:nth-child(3)::after {
  animation-delay: 0.45s;
}

.engine-score {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
}

.engine-score-value {
  white-space: nowrap;
}

.engine-score-bar {
  width: 54px;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.42);
  overflow: hidden;
}

.engine-score-bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #0ea5e9);
}

@keyframes resultFadeIn {
  from {
    opacity: 0.75;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes resultShimmer {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  40% {
    transform: translateX(120%);
    opacity: 0;
  }
  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  .hero-proof {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-section .hero-description {
    font-size: 1.05rem !important;
    line-height: 1.62 !important;
  }

  .hero-actions {
    justify-content: center;
  }
}

/* Hero infrastructure polish */
.hero-section {
  background: transparent !important;
}

.hero-background::before {
  background-image: none !important;
  opacity: 0 !important;
}

.hero-section .hero-title {
  font-size: clamp(34rem, 48vw, 48rem) !important;
  margin-bottom: 0 !important;
}

.hero-section .hero-description {
  max-width: 35rem !important;
  margin-top: -0.18rem !important;
  margin-bottom: 0.9rem !important;
  line-height: 1.58 !important;
  font-size: 1.24rem !important;
}

.hero-copy-spacer {
  display: none;
}

.hero-pain {
  margin: 0 0 0.65rem;
  max-width: 34rem;
  font-size: 0.96rem;
  color: #334155;
}

.hero-who,
.hero-scale {
  margin: 0 0 0.35rem;
  font-size: 0.88rem;
  color: #1e293b;
  font-weight: 600;
}

.hero-scale {
  margin-bottom: 0.85rem;
  color: #0f172a;
}

.hero-compare {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.38rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #0f172a;
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  padding: 0.38rem 0.64rem;
}

.compare-before {
  color: #475569;
}

.compare-arrow {
  color: #334155;
}

.compare-after {
  color: #0f172a;
}

.hero-actions {
  margin-top: 1rem !important;
  margin-bottom: 1.15rem !important;
}

.btn-tertiary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 0.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none;
  border-bottom: 1px solid rgba(15, 23, 42, 0.25);
  transition: color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.btn-tertiary:hover {
  color: #1d4ed8;
  border-color: #1d4ed8;
  transform: translateX(2px);
}

.hero-tech-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0 0 1.45rem;
}

.hero-tech-strip span {
  border: 1px solid rgba(15, 23, 42, 0.25);
  background: rgba(255, 255, 255, 0.74);
  color: #0f172a;
  border-radius: 999px;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  padding: 0.2rem 0.52rem;
}

.search-engine-preview {
  position: relative;
}

.mockup-floating-label {
  position: absolute;
  right: 12px;
  top: 12px;
  z-index: 2;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  background: rgba(255, 255, 255, 0.85);
  color: #0f172a;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.4rem;
}

.search-query-text {
  font-family: 'JetBrains Mono', var(--font-family-sohne);
}

.search-latency {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
}

.latency-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #16a34a;
  animation: latencyPulse 1.35s ease-in-out infinite;
}

.engine-score-bar i {
  width: var(--score-width);
  animation: relevanceFlow 2.2s ease-in-out infinite;
}

@keyframes latencyPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.36);
  }
  55% {
    opacity: 1;
    transform: scale(1.12);
    box-shadow: 0 0 0 6px rgba(22, 163, 74, 0);
  }
}

@keyframes relevanceFlow {
  0%, 100% {
    filter: brightness(1);
    transform: scaleY(1);
  }
  50% {
    filter: brightness(1.15);
    transform: scaleY(1.08);
  }
}

@media (max-width: 768px) {
  .hero-section .hero-title {
    font-size: clamp(16rem, 36vw, 24rem) !important;
  }

  .hero-compare {
    justify-content: center;
  }

  .hero-tech-strip {
    justify-content: center;
  }
}

/* Final hero title lock: override cascade conflicts in this file */
.hero-section .hero-title .hero-title-base {
  color: transparent !important;
  display: inline-block;
  font-weight: 800 !important;
  letter-spacing: -0.034em !important;
  font-size: 2.05em !important;
  line-height: 1.14 !important;
  padding-bottom: 0.14em;
  white-space: normal;
  background: linear-gradient(90deg, #1e3a8a 0%, #2563eb 55%, #60a5fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 140% 100%;
}

@keyframes heroBlueSweep {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.ecommerce-search-preview {
  min-height: 360px;
}

.ecommerce-search-bar {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.preview-toolbar-left {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.toolbar-pill {
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 999px;
  font-size: 0.66rem;
  color: #334155;
  font-weight: 700;
  padding: 0.16rem 0.42rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-logo-strip {
  margin-top: 1.1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  align-items: center;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero-logo-strip span {
  opacity: 0.9;
}

.ecommerce-filter-chips {
  display: flex;
  gap: 0.38rem;
  margin: 0.62rem 0 0.4rem;
  flex-wrap: wrap;
}

.ecommerce-chip {
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: #f8fafc;
  color: #334155;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.44rem;
}

.ecommerce-chip.active {
  border-color: rgba(30, 64, 175, 0.28);
  background: rgba(219, 234, 254, 0.75);
  color: #1e3a8a;
}

.ecommerce-search-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 142px;
  gap: 0.65rem;
  align-items: start;
}

.ecommerce-product-list {
  margin-top: 0;
}

.ecommerce-mini-cart {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 0.55rem;
}

.ecommerce-mini-cart h5 {
  margin: 0 0 0.4rem;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #334155;
}

.mini-cart-item,
.mini-cart-total {
  display: flex;
  justify-content: space-between;
  gap: 0.45rem;
  font-size: 0.72rem;
  padding: 0.22rem 0;
  color: #334155;
}

.mini-cart-total {
  margin-top: 0.32rem;
  padding-top: 0.42rem;
  border-top: 1px solid rgba(15, 23, 42, 0.12);
  color: #0f172a;
  font-weight: 700;
}

.mini-cart-btn {
  width: 100%;
  margin-top: 0.45rem;
  border: 0;
  border-radius: 8px;
  background: #0a2540;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.36rem 0.5rem;
}

.ecommerce-search-preview .engine-result h4 {
  font-size: 0.95rem;
}

.ecommerce-search-preview .engine-result p {
  font-size: 0.8rem;
}

@media (max-width: 980px) {
  .ecommerce-search-grid {
    grid-template-columns: 1fr;
  }
}

.commerce-two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
  margin-top: 1.3rem;
  padding-top: 1.05rem;
  border-top: 0;
}

.commerce-column {
  display: grid;
  gap: 1.35rem;
}

.commerce-text-item {
  padding-right: 0.4rem;
}

.commerce-item-head {
  display: flex;
  align-items: center;
  gap: 0.58rem;
}

.commerce-text-item h3 {
  margin: 0 0 0.28rem;
  font-size: 1.12rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.commerce-item-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e3a8a;
  border: 1px solid rgba(30, 58, 138, 0.2);
  font-size: 0.86rem;
  flex: 0 0 30px;
}

.commerce-text-item p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.62;
  color: #334155;
}

.ecom-offer-block .container {
  border: 0;
  border-radius: 0;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.ecom-offer-block .section-header {
  max-width: 740px;
}

.commerce-kicker {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(30, 64, 175, 0.18);
  background: rgba(219, 234, 254, 0.72);
  color: #1e3a8a;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0.24rem 0.58rem;
  margin-bottom: 0.75rem;
}

.ecom-offer-block .commerce-text-item {
  position: relative;
  padding: 0.25rem 0.15rem 0.25rem 0.6rem;
}

.ecom-offer-block .commerce-text-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.2rem;
  bottom: 0.2rem;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
}

.commerce-section-title {
  font-size: clamp(1.9rem, 3.8vw, 2.8rem) !important;
  line-height: 1.08 !important;
  letter-spacing: -0.03em !important;
}

.commerce-section-description {
  max-width: 64ch;
  font-size: 1.03rem !important;
  line-height: 1.66 !important;
  color: #1f2937 !important;
}

@media (max-width: 960px) {
  .commerce-two-columns {
    grid-template-columns: 1fr;
    gap: 1.05rem;
  }

  .commerce-text-item {
    padding-right: 0;
  }
}

.hero-placeholder-box {
  min-height: 360px;
  border: 1.5px solid rgba(37, 99, 235, 0.35);
  border-radius: 14px;
  background:
    radial-gradient(120% 90% at 0% 0%, rgba(219, 234, 254, 0.65) 0%, rgba(255, 255, 255, 0) 60%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow:
    inset 0 0 0 1px rgba(191, 219, 254, 0.7),
    0 18px 34px rgba(30, 64, 175, 0.15);
}

.accounting-placeholder-box {
  min-height: 300px;
  border: 1.5px solid rgba(59, 130, 246, 0.34);
  border-radius: 14px;
  background:
    radial-gradient(110% 90% at 100% 0%, rgba(224, 242, 254, 0.6) 0%, rgba(255, 255, 255, 0) 62%),
    linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  box-shadow:
    inset 0 0 0 1px rgba(219, 234, 254, 0.75),
    0 16px 32px rgba(30, 64, 175, 0.14);
}

.ecommerce-left-offers {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.9rem;
  align-items: start;
  background: #ffffff !important;
  border-radius: 16px;
  padding: 1.1rem 1rem;
}

.offer-item {
  padding: 0.15rem 0.1rem 0.15rem 1rem;
  position: relative;
  max-width: 64ch;
}

.offer-item::after {
  content: none;
}

.offer-item::before {
  content: none;
}

.offer-kicker {
  display: inline-flex;
  margin-bottom: 0.4rem;
  color: #1e3a8a;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.offer-head {
  display: flex;
  align-items: center;
  gap: 0;
}

.offer-item h4 {
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 1.6rem);
  line-height: 1.15;
  color: #0b1d34;
  letter-spacing: -0.024em;
  font-weight: 800;
}

.offer-item p {
  margin: 0.68rem 0 0;
  font-size: 0.98rem;
  line-height: 1.7;
  color: #334e68;
}

.finance-included-section {
  position: relative;
  padding: 5.4rem 0 6.4rem;
  background: #ffffff !important;
  overflow: hidden;
}

.finance-included-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: transparent;
  opacity: 0;
  pointer-events: none;
}

.finance-included-container {
  position: relative;
  z-index: 1;
  width: min(100% - 2.4rem, 1180px);
  margin: 0 auto;
}

.finance-included-header {
  max-width: 980px;
  margin-bottom: 3rem;
}

.finance-included-eyebrow {
  display: inline-block;
  margin-bottom: 0.95rem;
  color: #163b82 !important;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.finance-included-title {
  margin: 0;
  color: #0f172a !important;
  font-size: clamp(1.7rem, 2.6vw, 2.55rem);
  line-height: 1.12;
  font-weight: 800;
  max-width: none;
  white-space: nowrap;
}

.finance-included-section .finance-included-subtitle {
  margin: 1rem 0 0;
  max-width: none;
  color: #334155 !important;
  font-size: 0.98rem;
  line-height: 1.65;
  white-space: nowrap;
}

.finance-included-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.8rem;
  align-items: stretch;
}

.finance-included-card {
  --finance-included-accent: #2563eb;
  position: relative;
  min-height: 100%;
  padding: 2rem 2rem 1.8rem;
  border: 1px solid rgba(191, 219, 254, 0.32);
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
  box-shadow:
    0 28px 56px rgba(3, 10, 32, 0.26),
    0 8px 22px rgba(15, 23, 42, 0.14);
  overflow: hidden;
}

.finance-included-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -1px;
  right: -1px;
  height: 7px;
}

.finance-included-card::after {
  content: '';
  position: absolute;
  inset: auto -12% -24% auto;
  width: 150px;
  height: 150px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(191, 219, 254, 0.34) 0%, rgba(191, 219, 254, 0) 72%);
  pointer-events: none;
}

.finance-included-card-routing::before {
  background: linear-gradient(90deg, #ec4899 0%, #f43f5e 100%);
}

.finance-included-card-routing {
  --finance-included-accent: #f43f5e;
}

.finance-included-card-observability::before {
  background: linear-gradient(90deg, #fb923c 0%, #f97316 100%);
}

.finance-included-card-observability {
  --finance-included-accent: #f97316;
}

.finance-included-card-integrations::before {
  background: linear-gradient(90deg, #2dd4bf 0%, #06b6d4 100%);
}

.finance-included-card-integrations {
  --finance-included-accent: #06b6d4;
}

.finance-included-card-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.finance-included-card-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  line-height: 1;
}

.finance-included-card-icon-routing,
.finance-included-card-icon-observability,
.finance-included-card-icon-integrations {
  color: #0f172a;
}

.finance-included-card-title {
  margin: 0;
  color: #08264a;
  font-size: clamp(1.45rem, 2vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.12;
}

.finance-included-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1rem;
}

.finance-included-list li {
  position: relative;
  padding-left: 1.15rem;
  color: #334155;
  font-size: 1rem;
  line-height: 1.7;
}

.finance-included-list li::before {
  content: '';
  position: absolute;
  top: 0.8rem;
  left: 0;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--finance-included-accent);
  transform: translateY(-50%);
}

.landing-page > section.global-data-section {
  background:
    radial-gradient(circle at top left, rgba(125, 211, 252, 0.52), transparent 34%),
    radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.38), transparent 30%),
    linear-gradient(180deg, #e7f4ff 0%, #d5eafd 52%, #c8e2f8 100%) !important;
}

.landing-page > section.global-data-section::before,
.landing-page > section.global-data-section::after {
  background: transparent !important;
}

.global-data-section .light-ray {
  display: none;
}

.landing-page > section.global-data-section::before {
  background: rgba(255, 255, 255, 0.5) !important;
}

.global-data-section .global-data-title,
.global-data-section .global-data-eyebrow,
.global-data-section .global-data-subtitle,
.global-data-section .global-data-description,
.global-data-section .global-stat-label {
  color: #0f172a !important;
}

.global-data-section .global-data-eyebrow {
  color: #143787 !important;
}

.global-data-section .global-stat-number {
  color: #0b3b66 !important;
}

.storefront-launch-card {
  border-radius: 16px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.storefront-image-placeholder {
  min-height: 340px;
  border: 1px dashed rgba(147, 197, 253, 0.42);
  background: linear-gradient(180deg, rgba(96, 165, 250, 0.12) 0%, rgba(12, 74, 110, 0.18) 100%);
}

.storefront-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.8rem;
  border-bottom: 1px solid rgba(22, 101, 52, 0.15);
  background: #f3fff5;
}

.storefront-dots {
  display: inline-flex;
  gap: 0.3rem;
}

.storefront-dots span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #86efac;
}

.storefront-title {
  font-size: 0.78rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-weight: 700;
  color: #166534;
}

.storefront-body {
  padding: 0.9rem;
}

.storefront-hero {
  border-radius: 12px;
  background: linear-gradient(135deg, #14532d 0%, #15803d 100%);
  color: #dcfce7;
  padding: 0.8rem;
}

.storefront-hero h4 {
  margin: 0;
  font-size: 1rem;
  color: #ffffff;
}

.storefront-hero p {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
}

.storefront-products {
  margin-top: 0.65rem;
  display: grid;
  gap: 0.45rem;
}

.storefront-product {
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  border: 1px solid rgba(22, 101, 52, 0.14);
  background: #f7fff9;
  padding: 0.5rem 0.6rem;
  font-size: 0.83rem;
  color: #14532d;
}

.storefront-footer {
  margin-top: 0.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.storefront-primary-btn {
  border: 0;
  border-radius: 9px;
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.48rem 0.7rem;
}

.storefront-footnote {
  font-size: 0.75rem;
  color: #166534;
  font-weight: 600;
}

/* Ecommerce full-page visual polish */
.ecommerce-page {
  background: #ffffff !important;
}

.ecommerce-page .hero-section {
  padding-top: 7rem;
  padding-bottom: 3.2rem;
  background: #f7fbff !important;
}

.ecommerce-page .hero-container,
.ecommerce-page .container,
.ecommerce-page .global-data-container,
.ecommerce-page .invoices-container,
.ecommerce-page .cta-container {
  width: min(1200px, calc(100vw - 2.2rem));
}

.ecommerce-page .hero-description {
  max-width: 60ch;
}

.ecommerce-page .hero-actions .btn-primary,
.ecommerce-page .hero-actions .btn-secondary {
  border-radius: 10px;
  min-height: 42px;
}

.ecommerce-page .features-section {
  padding-top: 0.65rem;
  padding-bottom: 2.8rem;
  background: #ffffff !important;
}

.ecommerce-page .integrations-banner-section {
  padding: 3.4rem 0 2.35rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.ecommerce-page .integrations-banner-container {
  width: min(1160px, calc(100vw - 2.2rem));
  margin: 0 auto;
  background: transparent;
  padding: 0;
  position: relative;
}

.ecommerce-page .integrations-banner-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.82rem;
  padding: 1.05rem;
  position: relative;
  max-width: 1060px;
  margin: 0 auto;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.055);
}

.ecommerce-page .integrations-banner-grid-stack {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.ecommerce-page .integrations-banner-grid::after {
  content: none;
}

.ecommerce-page .integrations-banner-item {
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.54rem;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
  font-size: clamp(1.02rem, 1.55vw, 1.28rem);
  color: #0f172a;
  font-weight: 850;
  letter-spacing: -0.01em;
  text-decoration: none;
}

.ecommerce-page .integrations-banner-item span:last-child {
  color: #0f172a;
  font-weight: 850;
}

.gateway-hero-stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 430px !important;
  margin-top: 1.4rem;
}

.ecommerce-page .ecom-offer-block .section-header {
  margin: 0 auto 1.9rem !important;
}

.ecommerce-page .commerce-header-icon {
  margin: 0 auto 0.72rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  position: relative;
}

.ecommerce-page .commerce-header-icon::before,
.ecommerce-page .commerce-header-icon::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(37, 99, 235, 0.5));
  pointer-events: none;
}

.ecommerce-page .commerce-header-icon::before {
  width: 7px;
  height: 7px;
  top: -2px;
  right: -8px;
  animation: ecommerceOrbOne 2.8s ease-in-out infinite;
}

.ecommerce-page .commerce-header-icon::after {
  width: 5px;
  height: 5px;
  bottom: 1px;
  left: -8px;
  animation: ecommerceOrbTwo 3.2s ease-in-out infinite;
}

.ecommerce-page .commerce-header-icon-glyph {
  font-size: clamp(1.15rem, 1.9vw, 1.5rem);
  transform: rotate(-9deg);
  filter: drop-shadow(0 8px 16px rgba(37, 99, 235, 0.22));
  animation: ecommerceCartFloat 3.1s ease-in-out infinite;
}

.ecommerce-page .commerce-section-title {
  background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 52%, #0f172a 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ecommerceTitleShimmer 8s ease-in-out infinite;
}

.ecommerce-page .ecom-offer-block .commerce-two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.05rem;
  margin-top: 0.25rem;
  padding-top: 0;
}

.ecommerce-page .ecom-offer-block .commerce-column {
  gap: 1.05rem;
}

.ecommerce-page .ecom-offer-block .commerce-text-item {
  padding: 1.05rem 1.05rem 1rem !important;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
}

.ecommerce-page .ecom-offer-block .commerce-text-item::before {
  content: none;
}

.ecommerce-page .ecom-offer-block .commerce-text-item:hover {
  transform: translateY(-2px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 14px 30px rgba(30, 64, 175, 0.12);
}

.ecommerce-page .ecom-offer-block .commerce-item-head {
  gap: 0.7rem;
  margin-bottom: 0.45rem;
}

.ecommerce-page .ecom-offer-block .commerce-item-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 10px;
  background: linear-gradient(145deg, #e0ecff 0%, #c7dbff 100%);
  border: 1px solid rgba(37, 99, 235, 0.24);
  color: #1d4ed8;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.ecommerce-page .ecom-offer-block .commerce-text-item h3 {
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: #111827;
}

.ecommerce-page .ecom-offer-block .commerce-text-item p {
  font-size: 0.94rem;
  line-height: 1.65;
  color: #374151;
}

@keyframes ecommerceCartFloat {
  0%, 100% {
    transform: translateY(0) rotate(-9deg);
    filter: drop-shadow(0 8px 16px rgba(37, 99, 235, 0.22));
  }
  50% {
    transform: translateY(-2px) rotate(-6deg);
    filter: drop-shadow(0 11px 20px rgba(37, 99, 235, 0.3));
  }
}

@keyframes ecommerceOrbOne {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.9;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.24);
  }
  50% {
    transform: translate(2px, -2px) scale(1.12);
    opacity: 1;
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

@keyframes ecommerceOrbTwo {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.82;
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.2);
  }
  50% {
    transform: translate(-2px, 2px) scale(1.15);
    opacity: 1;
    box-shadow: 0 0 0 5px rgba(96, 165, 250, 0);
  }
}

@keyframes ecommerceTitleShimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes automationTitleShimmer {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes automationBoltFloat {
  0%, 100% {
    transform: translateY(0) rotate(-8deg);
    filter: drop-shadow(0 8px 16px rgba(37, 99, 235, 0.2));
  }
  50% {
    transform: translateY(-2px) rotate(-5deg);
    filter: drop-shadow(0 11px 20px rgba(37, 99, 235, 0.3));
  }
}

.landing-page.ecommerce-page {
  background: #ffffff !important;
}

.landing-page.ecommerce-page > section.features-section,
.landing-page.ecommerce-page > section.features-section::before {
  background: #ffffff !important;
}

.ecommerce-page .saas-platform-section {
  padding-top: 0.4rem;
  padding-bottom: 0;
  margin-bottom: 0;
  background: #ffffff !important;
}

.ecommerce-page .invoices-section,
.ecommerce-page .invoices-section::before {
  background: #ffffff !important;
}

.ecommerce-page .invoices-section {
  margin-top: 0.6rem;
  padding: 3.1rem 0 1.1rem 0 !important;
}

.ecommerce-page .invoices-grid {
  gap: 1.8rem;
  align-items: start;
}

.ecommerce-page .invoices-left {
  padding-top: 0.4rem;
}

.ecommerce-page .invoices-right {
  padding-top: 0.3rem;
}

.ecommerce-page .invoices-right.invoices-right-line {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.ecommerce-page .invoices-center-line {
  width: 1px;
  height: 72px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.22);
}

.ecommerce-page .offer-item + .offer-item {
  margin-top: 0.25rem;
}

.ecommerce-page .offer-item p {
  max-width: 62ch;
}

.ecommerce-page .global-data-section {
  margin-top: calc(1.1rem - 40px);
}

.ecommerce-page .global-data-grid {
  gap: 1.6rem;
}

.ecommerce-page .global-data-title {
  letter-spacing: -0.02em;
}

.ecommerce-page .global-stats-row {
  margin-top: 1rem;
}

.ecommerce-page .automation-strip-section {
  padding: 0.1rem 0 1.05rem;
  margin-top: -1rem;
  background: #ffffff;
  position: relative;
  z-index: 2;
}

.ecommerce-page .automation-strip-container {
  width: min(100%, 1080px);
  margin: 0 auto;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  box-shadow: none;
  padding: 0.72rem 0.25rem 0.5rem;
}

.ecommerce-page .integration-logo {
  font-size: 1.62rem;
  color: #0f172a;
  width: 1.72rem;
  text-align: center;
  flex: 0 0 1.72rem;
}

.ecommerce-page .integration-cpp-img {
  width: 1.72rem;
  height: 1.72rem;
  object-fit: contain;
}

.ecommerce-page .integration-php {
  color: #777bb3;
}

.ecommerce-page .integration-perl {
  color: #10b981;
}

.ecommerce-page .integration-java {
  color: #ea580c;
}

.ecommerce-page .integration-js {
  color: #eab308;
}

.ecommerce-page .integration-rust {
  color: #b45309;
}

.ecommerce-page .integration-python {
  color: #3776ab;
}

@media (max-width: 768px) {
  .ecommerce-page .integrations-banner-grid-stack {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.72rem;
  }

  .gateway-hero-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    justify-content: center !important;
  }

  .ecommerce-page .integrations-banner-grid-stack .integrations-banner-item:last-child {
    grid-column: 1 / -1;
  }
}

.ecommerce-page .integration-logo-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.45rem;
  height: 1.45rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.28);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: #0f172a;
}

.ecommerce-page .integration-stripe {
  color: #2563eb;
}

.ecommerce-page .integration-github {
  color: #111827;
}

.ecommerce-page .integration-aws {
  color: #f59e0b;
}

.ecommerce-page .integration-salesforce {
  color: #00a1e0;
}

.ecommerce-page .integration-slack {
  color: #0f5f9e;
}

.ecommerce-page .integration-paypal {
  color: #00457c;
}

.ecommerce-page .integration-googlepay {
  color: #188038;
}

.ecommerce-page .integration-applepay {
  color: #111827;
}

.ecommerce-page .automation-strip-head {
  margin-top: 0.45rem;
  margin-bottom: 2rem;
  text-align: center;
}

.ecommerce-page .automation-strip-header-icon {
  margin: 0 auto 0.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  position: relative;
}

.ecommerce-page .automation-strip-header-icon::before,
.ecommerce-page .automation-strip-header-icon::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(37, 99, 235, 0.5));
  pointer-events: none;
}

.ecommerce-page .automation-strip-header-icon::before {
  width: 6px;
  height: 6px;
  top: -2px;
  right: -8px;
}

.ecommerce-page .automation-strip-header-icon::after {
  width: 4px;
  height: 4px;
  bottom: 0;
  left: -7px;
}

.ecommerce-page .automation-strip-header-icon-glyph {
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  transform: rotate(-8deg);
  filter: drop-shadow(0 8px 16px rgba(37, 99, 235, 0.2));
  animation: automationBoltFloat 2.9s ease-in-out infinite;
}

.ecommerce-page .automation-strip-title {
  margin-top: 20px;
  margin-bottom: 20px;
  font-size: clamp(1.55rem, 3.2vw, 2.2rem);
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: #0f172a;
  font-weight: 860;
  background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 45%, #0f172a 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: automationTitleShimmer 7.2s ease-in-out infinite;
}

.ecommerce-page .automation-strip-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 240px));
  justify-content: center;
  gap: 0.8rem 0.95rem;
}

.ecommerce-page .automation-strip-item {
  position: relative;
  padding: 0.35rem 1.1rem 0.15rem;
  text-align: center;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  transition: transform 0.2s ease;
}

.ecommerce-page .automation-strip-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -0.62rem;
  top: 12%;
  width: 1px;
  height: 76%;
  background: repeating-linear-gradient(
    to bottom,
    rgba(148, 163, 184, 0.75) 0 6px,
    transparent 6px 14px
  );
}

.ecommerce-page .automation-strip-item:hover {
  transform: translateY(-1px);
}

.ecommerce-page .automation-strip-icon {
  width: auto;
  height: auto;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #0f172a;
  margin: 0 auto 0.62rem;
  font-size: 1.15rem;
  box-shadow: none;
}

.ecommerce-page .automation-strip-item h3 {
  margin: 0 0 0.5rem;
  font-size: 1.08rem;
  line-height: 1.24;
  letter-spacing: -0.015em;
  color: #0b1f38;
  font-weight: 780;
}

.ecommerce-page .automation-strip-item p {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.62;
  color: #3b4e66;
  max-width: 36ch;
  margin-left: auto;
  margin-right: auto;
}

.ecommerce-page .cta-section {
  padding-top: 1.4rem;
  position: relative;
  z-index: 1;
}

.landing-page.ecommerce-page > section.cta-section {
  margin-top: 0 !important;
  padding: 1.4rem 0 2.2rem 0 !important;
}

.ecommerce-page .cta-container {
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
}

@media (max-width: 1024px) {
  .ecommerce-page .hero-section {
    padding-top: 6.1rem;
  }

  .ecommerce-page .invoices-grid {
    gap: 1.2rem;
  }

  .ecommerce-page .ecom-offer-block .commerce-two-columns {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }

  .ecommerce-page .automation-strip-grid {
    grid-template-columns: repeat(2, minmax(0, 280px));
    justify-content: center;
  }

  .ecommerce-page .integrations-banner-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-page.ecommerce-page > section.cta-section {
    margin-top: 0 !important;
    padding: 1.2rem 0 1.8rem 0 !important;
  }

  .ecommerce-page .automation-strip-item::after {
    content: none !important;
  }

}

.ecommerce-hero .hero-container {
  display: grid !important;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
  gap: 2.1rem !important;
  align-items: start !important;
  transform: translateY(-10px);
}

.ecommerce-hero .hero-content {
  max-width: 610px;
  padding-top: 0.45rem;
}

.ecommerce-hero .vertical-divider {
  display: none !important;
}

.ecommerce-hero .hero-eyebrow {
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #143787;
  margin-bottom: 0.8rem;
}

.ecommerce-hero .ecommerce-hero-title {
  margin: 0;
  color: #000000 !important;
  font-size: clamp(1.95rem, 3.4vw, 3.25rem) !important;
  line-height: 1.04 !important;
  letter-spacing: -0.04em !important;
  font-weight: 620 !important;
  background: none !important;
  -webkit-text-fill-color: #000000 !important;
}

.ecommerce-hero .hero-description {
  margin-top: 1.2rem !important;
  max-width: 58ch !important;
  color: #000000 !important;
  font-size: 1.03rem !important;
  line-height: 1.65 !important;
}

.ecommerce-hero .hero-actions {
  margin-top: 2.35rem !important;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem !important;
  max-width: 760px;
}

.ecommerce-hero .hero-actions .btn-primary,
.ecommerce-hero .hero-actions .btn-secondary {
  width: 100%;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
}

.ecommerce-page .cta-actions .cta-primary,
.ecommerce-page .cta-actions .cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.44rem;
}

.ecommerce-page .cta-btn-left-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  line-height: 1;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.ecommerce-hero .dashboard-preview {
  border-radius: 16px !important;
  border: 1px solid rgba(10, 37, 64, 0.14) !important;
  box-shadow: 0 22px 46px rgba(15, 23, 42, 0.14) !important;
}

.ecommerce-hero .gateway-integrations-hero-image {
  display: block;
  width: min(100%, 600px);
  height: auto;
  margin: 0 0 0 auto;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  object-fit: contain;
  object-position: right center;
  transform: translateX(clamp(4.5rem, 9vw, 8.5rem));
}

.ecommerce-page .ecommerce-hero,
.ecommerce-page .ecommerce-hero .hero-container,
.ecommerce-page .ecommerce-hero .hero-visual {
  overflow: visible !important;
}

.ecommerce-page .ecommerce-hero .hero-visual {
  display: flex;
  justify-content: flex-end;
  justify-self: end;
  width: calc(100% + clamp(5rem, 10vw, 9rem));
  max-width: none;
}

.gateway-terminal-preview {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 620px;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.gateway-terminal-preview::before {
  content: '';
  position: absolute;
  inset: 54px -10px -12px -10px;
  border-radius: 30px;
  pointer-events: none;
  background: none;
  box-shadow: none;
  filter: none;
  opacity: 0;
}

.gateway-terminal-preview::after {
  content: '';
  position: absolute;
  inset: 56px -2px -2px -2px;
  border-radius: 24px;
  pointer-events: none;
  background: none;
  opacity: 0;
}

.gateway-terminal-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 4;
  pointer-events: auto;
  padding: 0;
  margin-bottom: -0.56rem;
}

.gateway-terminal-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  appearance: none;
  cursor: pointer;
  border: 1px solid rgba(203, 213, 225, 0.95);
  border-bottom-color: rgba(226, 232, 240, 0.95);
  background: linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%);
  color: #000000;
  border-radius: 13px 13px 0 0;
  padding: 0.46rem 0.95rem 0.5rem;
  min-height: 36px;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.01em;
  position: relative;
  z-index: 5;
  pointer-events: auto;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 1),
    0 6px 10px rgba(15, 23, 42, 0.045);
  transition: transform 0.16s ease, border-color 0.18s ease, color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.gateway-terminal-tab-icon {
  font-size: 0.9rem;
  flex: 0 0 auto;
}

.gateway-terminal-tab:hover,
.gateway-terminal-tab:focus-visible {
  outline: none;
  border-color: rgba(148, 163, 184, 0.72);
  color: #000000;
  transform: translateY(-0.5px);
}

.gateway-terminal-tab.active {
  border-color: rgba(8, 37, 94, 0.72);
  border-bottom-color: #0b2f7a;
  background: linear-gradient(180deg, #123f99 0%, #0b2f7a 100%);
  color: #ffffff;
  transform: translateY(0);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    0 8px 14px rgba(15, 23, 42, 0.08);
}

.gateway-terminal-tab.active span,
.gateway-terminal-tab.active .gateway-terminal-tab-icon {
  color: #ffffff;
}

.gateway-console-shell {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  gap: 0.95rem;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
}

.gateway-console-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: none;
  opacity: 0;
}

.gateway-console-shell::after {
  content: '';
  position: absolute;
  inset: auto 18px 16px 18px;
  pointer-events: none;
  height: 110px;
  border-radius: 18px;
  background: none;
  filter: none;
  opacity: 0;
}

.gateway-terminal-preview-secondary {
  width: 100%;
}

.gateway-console-bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  min-height: 96px;
  height: 96px;
  border-radius: 0 18px 18px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    0 12px 24px rgba(15, 23, 42, 0.08);
  z-index: 1;
}

.gateway-console-bar-copy {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.gateway-console-title {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #111827;
}

.gateway-console-subtitle {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.5;
  color: #374151;
}

.gateway-console-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: rgba(219, 234, 254, 0.12);
  border: 1px solid rgba(191, 219, 254, 0.22);
  color: #eff6ff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.gateway-console-panels {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.95rem;
  grid-template-rows: 410px 657px;
}

.gateway-console-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  background: #ffffff;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 16px 30px rgba(15, 23, 42, 0.08);
}

.gateway-console-panel-response {
  background: #ffffff;
  border-color: rgba(226, 232, 240, 0.95);
}

.gateway-console-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem 0.7rem;
  background: linear-gradient(180deg, #f2f4f7 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.gateway-console-panel-response .gateway-console-panel-head {
  background: linear-gradient(180deg, #f2f4f7 0%, #e2e8f0 100%);
  border-bottom-color: rgba(148, 163, 184, 0.16);
}

.gateway-console-panel-label {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #000000 !important;
}

.gateway-console-panel-response .gateway-console-panel-label {
  color: #000000 !important;
}

.gateway-console-panel-meta {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #000000 !important;
}

.gateway-console-panel-response .gateway-console-panel-meta {
  color: #000000 !important;
}

.gateway-console-code {
  position: relative;
  margin: 0;
  padding: 1rem 1rem 1.1rem;
  overflow: hidden;
  font-size: 0.82rem;
  line-height: 1.72;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SFMono-Regular", "SF Mono", "Menlo", "Monaco", monospace;
  flex: 1 1 auto;
  min-height: 0;
}

.gateway-console-code-request {
  color: #0f172a;
  background: #ffffff;
}

.gateway-console-code-response {
  color: #0f172a;
  background: #ffffff;
  text-shadow: none;
}

.gateway-console-code code {
  position: relative;
  z-index: 1;
  display: block;
  color: inherit;
}

.ecommerce-hero .preview-header {
  background: #f8fbff;
}

.ecommerce-hero .toolbar-status {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(30, 64, 175, 0.1);
  color: #1e3a8a;
  font-size: 0.72rem;
  font-weight: 700;
}

.ecommerce-hero .hero-logo-strip {
  grid-column: 1 / -1;
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.12);
}

@media (max-width: 980px) {
  .ecommerce-hero .hero-container {
    grid-template-columns: 1fr !important;
    gap: 1.2rem !important;
  }

  .ecommerce-hero .hero-actions {
    grid-template-columns: 1fr;
    max-width: 360px;
  }

  .ecommerce-hero .hero-logo-strip {
    margin-top: 0.8rem;
  }

  .ecommerce-page .ecommerce-hero .hero-visual {
    justify-content: center;
    justify-self: stretch;
    width: 100%;
  }

  .ecommerce-hero .gateway-integrations-hero-image {
    width: min(100%, 540px);
    transform: none;
  }

  .gateway-terminal-preview {
    max-width: 100%;
  }

  .gateway-console-shell {
    padding: 0.9rem;
  }

  .gateway-console-bar {
    align-items: flex-start;
    flex-direction: column;
    min-height: auto;
    height: auto;
  }

  .gateway-console-panels {
    grid-template-rows: auto auto;
  }

  .gateway-console-code {
    overflow: visible;
  }
}

.modal-close-btn {
  transition: background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.modal-close-btn:hover {
  background: #e2e8f0 !important;
  color: #1e293b !important;
  transform: scale(1.04);
}

.modal-3d-card {
  position: relative;
  transform-style: preserve-3d;
  transform: perspective(1400px) translateZ(0);
  box-shadow:
    0 34px 90px rgba(15, 23, 42, 0.28),
    0 14px 32px rgba(15, 23, 42, 0.16),
    0 2px 0 rgba(255, 255, 255, 0.8) inset;
  animation: modal3dEnter 0.34s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.modal-3d-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0) 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 55%);
  transform: translateZ(18px);
}

.modal-3d-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 100%, rgba(15, 23, 42, 0.22) 0%, rgba(15, 23, 42, 0) 70%);
  filter: blur(6px);
  transform: translateZ(-8px);
  opacity: 0.6;
}

@keyframes modal3dEnter {
  from {
    opacity: 0;
    transform: perspective(1400px) translateY(16px) rotateX(5deg) scale(0.978);
  }
  to {
    opacity: 1;
    transform: perspective(1400px) translateY(0) rotateX(0deg) scale(1);
  }
}

/* Keep API CTA banner copy dark on the light variant */
.landing-page.ecommerce-page > section.cta-section .cta-title,
.landing-page.ecommerce-page > section.cta-section .cta-sub,
.landing-page.ecommerce-page > section.cta-section .cta-desc-title,
.landing-page.ecommerce-page > section.cta-section .cta-desc-text,
.landing-page.ecommerce-page > section.cta-section .cta-promo-title,
.landing-page.ecommerce-page > section.cta-section .cta-promo-text {
  color: #111827 !important;
  fill: #111827 !important;
  stroke: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
}

.landing-page.ecommerce-page > section.cta-section .cta-secondary,
.landing-page.ecommerce-page > section.cta-section .cta-secondary *,
.landing-page.ecommerce-page > section.cta-section .cta-secondary .btn-chevron {
  color: #ffffff !important;
  fill: #ffffff !important;
  stroke: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.ecommerce-page .integrations-banner-item span:last-child {
  font-weight: 700 !important;
}

.hlog-stream-section {
  padding: 3.25rem 0 5.35rem;
  background:
    linear-gradient(180deg, #f1f7ff 0%, #ffffff 24%, #f8fbff 100%);
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.hlog-stream-container {
  width: min(1160px, calc(100vw - 2.2rem));
  margin: 0 auto;
}

.hlog-ingest-panel {
  position: relative;
  width: min(1080px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.82fr);
  align-items: center;
  gap: clamp(1.2rem, 3vw, 3.2rem);
  padding: clamp(2rem, 3.4vw, 3.25rem);
  border: 1px solid rgba(226, 232, 240, 0.24);
  border-radius: 22px;
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0) 0%, rgba(96, 165, 250, 0.08) 58%, rgba(255, 255, 255, 0.14) 100%),
    radial-gradient(circle at 14% -8%, rgba(15, 23, 42, 0.44), transparent 40%),
    radial-gradient(circle at 86% 0%, rgba(147, 197, 253, 0.34), transparent 34%),
    radial-gradient(circle at 55% 112%, rgba(29, 78, 216, 0.14), transparent 42%),
    linear-gradient(90deg, #031126 0%, #082b63 48%, #0b4ea2 100%);
  box-shadow:
    0 34px 78px rgba(2, 6, 23, 0.28),
    0 14px 34px rgba(14, 165, 233, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(2, 6, 23, 0.58);
  text-align: left;
}

.hlog-ingest-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.09), transparent 24%, rgba(2, 6, 23, 0.24) 100%),
    linear-gradient(90deg, rgba(2, 6, 23, 0.18), rgba(255, 255, 255, 0) 44%, rgba(147, 197, 253, 0.18));
}

.hlog-ingest-panel::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 19px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 0 0 1px rgba(147, 197, 253, 0.1),
    inset 0 16px 28px rgba(255, 255, 255, 0.035),
    inset 0 -28px 48px rgba(2, 6, 23, 0.28);
  pointer-events: none;
}

.hlog-ingest-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0;
  max-width: 680px;
}

.hlog-ingest-visual {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.hlog-js-stream-card {
  width: min(100%, 430px);
  overflow: hidden;
  border: 1px solid rgba(191, 219, 254, 0.24);
  border-radius: 16px;
  background:
    radial-gradient(circle at 82% 12%, rgba(56, 189, 248, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.94));
  box-shadow:
    0 22px 46px rgba(2, 6, 23, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.hlog-js-stream-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  height: 38px;
  padding: 0 0.9rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.72);
}

.hlog-js-stream-header span {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #ef4444;
}

.hlog-js-stream-header span:nth-child(2) {
  background: #f59e0b;
}

.hlog-js-stream-header span:nth-child(3) {
  background: #22c55e;
}

.hlog-js-stream-header strong {
  margin-left: 0.35rem;
  color: #cbd5e1;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0;
}

.hlog-js-stream-body {
  position: relative;
  min-height: 245px;
  padding: 1.05rem;
  overflow: hidden;
}

.hlog-js-stream-body::before {
  content: '';
  position: absolute;
  inset: 38% -8% auto -8%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent);
  animation: hlogStreamPulse 2.2s ease-in-out infinite;
}

.hlog-js-stream-body pre {
  position: relative;
  z-index: 2;
  margin: 0;
  color: #dbeafe;
  font: 700 0.82rem/1.62 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0;
  white-space: pre-wrap;
}

.hlog-js-muted {
  color: #93c5fd;
}

.hlog-js-string {
  color: #86efac;
}

.hlog-js-blue {
  color: #67e8f9;
}

.integration-search-search-card {
  border-color: #dfe1e5;
  background: #ffffff;
  box-shadow: 0 22px 46px rgba(15, 23, 42, 0.22);
}

.integration-search-search-card .hlog-js-stream-header {
  border-bottom-color: #e5e7eb;
  background: #f8fafc;
}

.integration-search-search-card .hlog-js-stream-header strong {
  color: #475569;
}

.integration-search-search-body {
  min-height: 345px;
  padding: 1rem 1.15rem 1.15rem;
  background: #ffffff;
}

.integration-search-search-body::before {
  display: none;
}

.integration-search-search-input {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  min-height: 40px;
  padding: 0.56rem 0.9rem;
  border: 1px solid #dfe1e5;
  border-radius: 999px;
  color: #202124;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.12);
  font: 500 0.82rem/1.35 Arial, sans-serif;
}

.integration-search-search-input svg {
  flex: 0 0 auto;
  color: #5f6368;
  font-size: 0.82rem;
}

.integration-search-search-input span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.integration-search-search-summary {
  margin: 0.7rem 0 0.8rem !important;
  color: #70757a !important;
  font: 400 0.68rem/1.35 Arial, sans-serif !important;
}

.integration-search-search-results {
  display: grid;
  gap: 0.85rem;
}

.integration-search-search-result {
  min-width: 0;
  text-align: left;
}

.integration-search-result-url {
  display: block;
  overflow: hidden;
  color: #202124;
  font: 400 0.64rem/1.35 Arial, sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.integration-search-search-result h3 {
  margin: 0.12rem 0 0.16rem !important;
  overflow: hidden;
  color: #1a0dab !important;
  font: 400 0.91rem/1.25 Arial, sans-serif !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.integration-search-search-result p {
  display: -webkit-box;
  margin: 0 !important;
  overflow: hidden;
  color: #4d5156 !important;
  font: 400 0.69rem/1.4 Arial, sans-serif !important;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.hlog-db-stream {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 0.62rem;
  margin: 1.05rem 0 0;
}

.hlog-db-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.66rem;
  min-width: 0;
  padding: 0.62rem 0.68rem;
  border: 1px solid rgba(125, 211, 252, 0.24);
  border-radius: 12px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(8, 47, 73, 0.74)),
    rgba(15, 23, 42, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 10px 22px rgba(2, 6, 23, 0.18);
  opacity: 1;
  transform: none;
  transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}

.hlog-db-row:hover {
  border-color: rgba(125, 211, 252, 0.44);
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(12, 74, 110, 0.78)),
    rgba(15, 23, 42, 0.86);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 12px 26px rgba(2, 6, 23, 0.22);
}

.hlog-db-chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 24px;
  padding: 0 0.42rem;
  border: 1px solid rgba(186, 230, 253, 0.56);
  border-radius: 7px;
  color: #e0f2fe;
  background: rgba(14, 165, 233, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  font: 900 0.62rem/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.hlog-db-record {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: baseline;
  gap: 0.45rem;
  min-width: 0;
}

.hlog-db-field {
  color: #7dd3fc;
  font: 800 0.68rem/1.3 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hlog-db-row code {
  display: block;
  overflow: hidden;
  color: #f8fafc;
  font: 900 0.78rem/1.3 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hlog-db-meta {
  min-width: 0;
  overflow: hidden;
  color: #bae6fd;
  font: 800 0.7rem/1.3 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.84;
}

.hlog-insert-line {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.42rem;
  min-width: 0;
  margin-top: 0.95rem;
  padding: 0.66rem 0.72rem;
  border-radius: 10px;
  color: #dbeafe;
  background: rgba(2, 6, 23, 0.72);
  font: 800 0.75rem/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hlog-terminal-prompt {
  color: #38bdf8;
}

.hlog-typed-insert {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  animation: hlogTypeInsert 3.6s steps(38, end) infinite;
}

.hlog-cursor {
  flex: 0 0 auto;
  width: 0.58rem;
  height: 1rem;
  background: #67e8f9;
  box-shadow: 0 0 14px rgba(103, 232, 249, 0.75);
  animation: hlogCursorBlink 0.82s steps(1, end) infinite;
}

@keyframes hlogTypeInsert {
  0%, 12% {
    width: 0;
  }
  54%, 100% {
    width: 38ch;
  }
}

@keyframes hlogCursorBlink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

@keyframes hlogStreamPulse {
  0%, 100% {
    opacity: 0.16;
    transform: translateX(-18%);
  }
  50% {
    opacity: 0.72;
    transform: translateX(18%);
  }
}

.hlog-packet-field {
  position: relative;
  width: min(100%, 300px);
  height: 210px;
  overflow: hidden;
  border-radius: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0 10px, transparent 10px 24px),
    linear-gradient(180deg, rgba(219, 234, 254, 0.26) 0 6px, transparent 6px 20px),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2), transparent 58%);
  background-size: 18px 36px, 22px 44px, auto;
  background-position: 0 0, 12px 0, 50% 50%;
  box-shadow: none;
  animation: hlogMatrixRain 4.8s linear infinite;
  mask-image: radial-gradient(ellipse at 50% 50%, #000 0%, #000 58%, transparent 82%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 0%, #000 58%, transparent 82%);
}

.hlog-packet-field::before,
.hlog-packet-field::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 12%;
  right: 12%;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(191, 219, 254, 0.72), transparent);
  transform: translateY(-50%);
}

.hlog-packet-field::after {
  top: 34%;
  left: 22%;
  right: 4%;
  opacity: 0.52;
}

.hlog-packet-field b {
  position: absolute;
  inset: -30%;
  display: block;
  pointer-events: none;
  background:
    linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.28) 46%, transparent 72%),
    radial-gradient(circle at 28% 36%, rgba(255, 255, 255, 0.24), transparent 22%),
    radial-gradient(circle at 70% 64%, rgba(219, 234, 254, 0.2), transparent 26%);
  opacity: 0.72;
  animation: hlogBackgroundSweep 7.5s ease-in-out infinite;
}

.hlog-packet-field i {
  position: absolute;
  inset: auto;
  display: block;
  border-radius: 999px;
  pointer-events: none;
}

.hlog-packet-field i:nth-child(1) {
  left: 50%;
  top: 50%;
  width: 84px;
  height: 84px;
  border: 1px solid rgba(191, 219, 254, 0.35);
  background: radial-gradient(circle, rgba(96, 165, 250, 0.44), rgba(96, 165, 250, 0.08) 54%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: hlogCorePulse 3.4s ease-in-out infinite;
}

.hlog-packet-field i:nth-child(2),
.hlog-packet-field i:nth-child(3) {
  left: 14%;
  right: 14%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.88), transparent);
  opacity: 0;
  animation: hlogScanLine 3.8s ease-in-out infinite;
}

.hlog-packet-field i:nth-child(2) {
  top: 42%;
}

.hlog-packet-field i:nth-child(3) {
  top: 61%;
  animation-delay: -1.9s;
}

.hlog-packet-field span {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 5px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(147, 197, 253, 0.74));
  box-shadow:
    0 10px 22px rgba(2, 6, 23, 0.28),
    0 0 18px rgba(147, 197, 253, 0.36);
  animation: hlogPacketFloat 5.6s ease-in-out infinite;
}

.hlog-packet-field span:nth-of-type(1) { top: 18%; left: 9%; animation-delay: -0.4s; }
.hlog-packet-field span:nth-of-type(2) { top: 48%; left: 18%; animation-delay: -1.8s; animation-name: hlogPacketDrift; }
.hlog-packet-field span:nth-of-type(3) { top: 70%; left: 31%; animation-delay: -3.1s; }
.hlog-packet-field span:nth-of-type(4) { top: 24%; left: 42%; animation-delay: -2.3s; animation-name: hlogPacketDrift; }
.hlog-packet-field span:nth-of-type(5) { top: 53%; left: 51%; animation-delay: -0.9s; }
.hlog-packet-field span:nth-of-type(6) { top: 34%; left: 64%; animation-delay: -3.8s; animation-name: hlogPacketDrift; }
.hlog-packet-field span:nth-of-type(7) { top: 67%; left: 72%; animation-delay: -1.3s; }
.hlog-packet-field span:nth-of-type(8) { top: 19%; left: 83%; animation-delay: -4.5s; animation-name: hlogPacketDrift; }
.hlog-packet-field span:nth-of-type(9) { top: 49%; left: 88%; animation-delay: -2.8s; }

@keyframes hlogCorePulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.88);
    opacity: 0.62;
    box-shadow: 0 0 0 0 rgba(147, 197, 253, 0.16);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.12);
    opacity: 1;
    box-shadow: 0 0 0 18px rgba(147, 197, 253, 0);
  }
}

@keyframes hlogMatrixRain {
  0% {
    background-position: 0 -36px, 12px -44px, 50% 50%;
  }
  100% {
    background-position: 0 36px, 12px 44px, 50% 50%;
  }
}

@keyframes hlogBackgroundSweep {
  0%, 100% {
    transform: translate3d(-8%, -4%, 0) rotate(0deg);
    opacity: 0.48;
  }
  50% {
    transform: translate3d(8%, 4%, 0) rotate(8deg);
    opacity: 0.86;
  }
}

@keyframes hlogScanLine {
  0%, 100% {
    transform: translateX(-28%);
    opacity: 0;
  }
  42%, 58% {
    opacity: 0.75;
  }
  70% {
    transform: translateX(28%);
    opacity: 0;
  }
}

@keyframes hlogPacketFloat {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.74;
  }
  50% {
    transform: translate3d(0, -12px, 0) scale(1.08);
    opacity: 1;
  }
}

@keyframes hlogPacketDrift {
  0%, 100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    opacity: 0.72;
  }
  50% {
    transform: translate3d(16px, -10px, 0) rotate(12deg) scale(1.12);
    opacity: 1;
  }
}

.hlog-ingest-copy h2 {
  margin: 0;
  max-width: 15.5ch;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-size: clamp(2.2rem, 3.8vw, 3.85rem);
  line-height: 1;
  letter-spacing: -0.035em;
  font-weight: 900;
}

.hlog-ingest-copy p {
  margin: 1.25rem 0 0;
  max-width: 40rem;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  font-size: clamp(1.02rem, 1.35vw, 1.18rem);
  line-height: 1.7;
}

.hlog-benefits-section {
  margin: clamp(3.25rem, 5vw, 4.75rem) auto 0;
  color: #0f172a;
}

.hlog-benefits-copy {
  max-width: 1080px;
}

.hlog-benefits-eyebrow {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.85rem;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.hlog-benefits-copy h2 {
  max-width: none;
  margin: 0;
  color: #0f172a;
  font-size: clamp(2rem, 3.4vw, 3.35rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
  font-weight: 900;
  white-space: nowrap;
}

.hlog-benefits-copy p {
  max-width: 50rem;
  margin: 0.9rem 0 0;
  color: #000000 !important;
  font-weight: 600;
  font-size: clamp(0.98rem, 1.15vw, 1.08rem);
  line-height: 1.68;
}

.hlog-benefits-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.05rem;
  align-items: stretch;
  margin-top: clamp(2rem, 3.5vw, 3rem);
}

.hlog-benefit-item {
  --hlog-benefit-accent: #2563eb;
  position: relative;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  height: 100%;
  min-height: 260px;
  padding: 1.65rem 1.35rem 1.4rem;
  border: 1px solid rgba(191, 219, 254, 0.52);
  border-radius: 0 0 18px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f8ff 100%);
  box-shadow:
    0 22px 44px rgba(15, 23, 42, 0.12),
    0 6px 18px rgba(15, 23, 42, 0.07);
  min-width: 0;
  overflow: hidden;
}

.hlog-benefit-item::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: auto;
  height: 7px;
  border-radius: 0;
  background: linear-gradient(90deg, var(--hlog-benefit-accent) 0%, color-mix(in srgb, var(--hlog-benefit-accent) 72%, #ffffff) 100%);
}

.hlog-benefit-item::after {
  content: '';
  position: absolute;
  inset: auto -18% -28% auto;
  width: 136px;
  height: 136px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(191, 219, 254, 0.34) 0%, rgba(191, 219, 254, 0) 72%);
  pointer-events: none;
}

.hlog-benefit-item .finance-included-card-head {
  display: flex;
  align-items: center;
  gap: 0.82rem;
  margin-bottom: 1rem;
}

.hlog-benefit-item .finance-included-card-icon {
  width: auto;
  height: auto;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  font-size: 1.5rem;
  line-height: 1;
}

.hlog-benefit-item .finance-included-card-title {
  margin: 0;
  color: #08264a;
  font-size: 1.08rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.hlog-benefit-item:nth-child(1) {
  --hlog-benefit-accent: #2563eb;
}

.hlog-benefit-item:nth-child(2) {
  --hlog-benefit-accent: #f43f5e;
}

.hlog-benefit-item:nth-child(3) {
  --hlog-benefit-accent: #f97316;
}

.hlog-benefit-item:nth-child(4) {
  --hlog-benefit-accent: #06b6d4;
}

.hlog-benefit-item ul {
  flex: 1 1 auto;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.72rem;
}

.hlog-benefit-item li {
  position: relative;
  padding-left: 1.05rem;
  color: #334155;
  font-size: 0.94rem;
  line-height: 1.58;
}

.hlog-benefit-item li::before {
  content: '';
  position: absolute;
  top: 0.72rem;
  left: 0;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 999px;
  background: var(--hlog-benefit-accent);
  transform: translateY(-50%);
}

.hlog-benefit-flow {
  position: relative;
  height: 2px;
  margin-top: 1.05rem;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--hlog-benefit-accent) 16%, #e2e8f0);
}

.hlog-benefit-flow::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -42%;
  width: 42%;
  border-radius: inherit;
  background: linear-gradient(90deg, transparent 0%, var(--hlog-benefit-accent) 52%, transparent 100%);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--hlog-benefit-accent) 52%, transparent));
  animation: hlogBenefitFlow 5.8s ease-in-out infinite;
}

.hlog-benefit-item:nth-child(2) .hlog-benefit-flow::before {
  animation-delay: 0.45s;
}

.hlog-benefit-item:nth-child(3) .hlog-benefit-flow::before {
  animation-delay: 0.9s;
}

.hlog-benefit-item:nth-child(4) .hlog-benefit-flow::before {
  animation-delay: 1.35s;
}

@keyframes hlogBenefitFlow {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  16% {
    opacity: 0.85;
  }
  78% {
    opacity: 0.85;
  }
  100% {
    transform: translateX(340%);
    opacity: 0;
  }
}

@media (max-width: 780px) {
  .hlog-ingest-panel {
    grid-template-columns: 1fr;
    gap: 1.35rem;
    padding: 1.65rem 1.15rem;
    border-radius: 18px;
  }

  .hlog-ingest-visual {
    justify-content: center;
  }

  .hlog-packet-field {
    width: min(78vw, 260px);
    height: 170px;
  }

  .hlog-ingest-copy h2,
  .hlog-benefits-copy h2 {
    max-width: 100%;
  }

  .hlog-benefits-copy p {
    max-width: 100%;
  }

  .hlog-benefits-copy h2 {
    white-space: normal;
  }

  .hlog-benefits-grid {
    grid-template-columns: 1fr;
    gap: 1.35rem;
    padding-bottom: 0;
  }

}

@media (min-width: 781px) and (max-width: 1060px) {
  .hlog-benefits-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-bottom: 0;
  }

}

.sdk-showcase-section {
  padding: 6.25rem 0 6.6rem;
  position: relative;
  overflow: hidden;
}

.sdk-showcase-section::before,
.sdk-showcase-section::after {
  content: '';
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  filter: blur(14px);
}

.sdk-showcase-section::before {
  width: 320px;
  height: 320px;
  top: 8%;
  left: -90px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 72%);
}

.sdk-showcase-section::after {
  width: 420px;
  height: 420px;
  right: -120px;
  bottom: 2%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(37, 99, 235, 0) 70%);
}

.sdk-showcase-shell {
  position: relative;
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
  padding: 2.8rem;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 36px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(246, 250, 255, 0.92)),
    linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(14, 165, 233, 0.08));
  box-shadow:
    0 40px 90px rgba(15, 23, 42, 0.12),
    0 10px 30px rgba(59, 130, 246, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.sdk-showcase-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(115deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0) 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0));
  opacity: 0.95;
}

.sdk-showcase-shell::after {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: 28px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.54);
  opacity: 0.75;
}

.sdk-showcase-head {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 2rem;
  align-items: end;
  margin-bottom: 2.1rem;
}

.sdk-showcase-eyebrow,
.sdk-stage-kicker,
.sdk-metadata-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #3157d5;
}

.sdk-showcase-eyebrow::before,
.sdk-stage-kicker::before,
.sdk-metadata-label::before {
  content: '';
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, rgba(49, 87, 213, 0.18), rgba(49, 87, 213, 0.95));
}

.sdk-showcase-title {
  margin: 0.9rem 0 0;
  font-size: clamp(2.2rem, 3.4vw, 3.45rem);
  line-height: 0.98;
  color: #0a2540;
  letter-spacing: -0.055em;
  max-width: 11ch;
}

.sdk-showcase-description {
  margin: 0;
  font-size: 1.04rem;
  line-height: 1.8;
  color: #425466;
  max-width: 58ch;
}

.sdk-tab-rail {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.6rem;
  padding: 0.38rem;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(241, 245, 249, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.sdk-tab {
  appearance: none;
  position: relative;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 20px;
  padding: 1rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-align: left;
  color: #102a43;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.sdk-tab:hover,
.sdk-tab:focus-visible {
  transform: translateY(-1px) scale(1.01);
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(148, 163, 184, 0.2);
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.06);
  outline: none;
}

.sdk-tab.active {
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.32), transparent 42%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 78%, #38bdf8 100%);
  border-color: rgba(96, 165, 250, 0.34);
  color: #ffffff;
  box-shadow:
    0 22px 32px rgba(29, 78, 216, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.sdk-tab.active::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -8px;
  height: 16px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(37, 99, 235, 0) 72%);
  filter: blur(8px);
  pointer-events: none;
}

.sdk-tab-icon {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.045), rgba(15, 23, 42, 0.09));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);
}

.sdk-tab.active .sdk-tab-icon {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.sdk-tab-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sdk-tab-copy strong {
  font-size: 1rem;
  line-height: 1.1;
  font-weight: 700;
}

.sdk-tab-copy small {
  font-size: 0.77rem;
  color: inherit;
  opacity: 0.66;
  margin-top: 0.2rem;
}

.sdk-showcase-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  gap: 1.4rem;
}

.sdk-code-stage,
.sdk-results-stage {
  min-width: 0;
}

.sdk-code-stage {
  position: relative;
  border-radius: 30px;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.14), transparent 26%),
    linear-gradient(180deg, #0b1220 0%, #0f172a 58%, #111827 100%);
  border: 1px solid rgba(96, 165, 250, 0.14);
  box-shadow:
    0 30px 80px rgba(15, 23, 42, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.sdk-code-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0) 35%);
}

.sdk-code-stage-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.15rem;
}

.sdk-code-stage-header h3 {
  margin: 0.5rem 0 0;
  color: #f8fafc;
  font-size: 1.72rem;
  line-height: 1.06;
  letter-spacing: -0.04em;
  max-width: 17ch;
}

.sdk-stage-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sdk-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.48rem 0.84rem;
  background: rgba(59, 130, 246, 0.16);
  color: #dbeafe;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgba(96, 165, 250, 0.12);
}

.sdk-pill.soft {
  background: rgba(148, 163, 184, 0.1);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.08);
}

.sdk-code-stack {
  display: grid;
  gap: 1.05rem;
}

.sdk-code-card {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.78);
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.sdk-code-card-head,
.sdk-console-panel-head,
.sdk-console-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.sdk-code-card-head {
  padding: 1rem 1.05rem;
  color: #e2e8f0;
  background:
    linear-gradient(180deg, rgba(22, 31, 49, 0.92), rgba(15, 23, 42, 0.76));
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.sdk-code-card-head span,
.sdk-console-panel-head span {
  font-weight: 700;
}

.sdk-code-card-head small,
.sdk-console-panel-head small {
  color: #8ea0b5;
  font-size: 0.78rem;
}

.sdk-code-card pre {
  margin: 0;
  padding: 1.05rem 1.05rem 1.15rem;
  overflow-x: auto;
  font-size: 0.84rem;
  line-height: 1.78;
  color: #dbeafe;
  font-family: "SFMono-Regular", "SF Mono", "Menlo", "Monaco", monospace;
}

.sdk-results-stage {
  display: grid;
  gap: 1.05rem;
}

.sdk-console-card,
.sdk-metadata-card {
  border-radius: 30px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 250, 255, 0.9));
  box-shadow:
    0 26px 60px rgba(15, 23, 42, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.sdk-console-card {
  position: relative;
  overflow: hidden;
}

.sdk-console-card::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -40px;
  width: 180px;
  height: 180px;
  pointer-events: none;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0) 72%);
}

.sdk-console-head {
  padding: 1rem 1.15rem;
  background:
    linear-gradient(180deg, #f8fbff 0%, #eef4ff 72%, #e7eef9 100%);
  color: #0f172a;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  justify-content: flex-start;
}

.sdk-console-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.sdk-console-dot.red { background: #fb7185; }
.sdk-console-dot.amber { background: #fbbf24; }
.sdk-console-dot.green { background: #34d399; }

.sdk-console-head strong {
  margin-left: 0.5rem;
  font-size: 0.88rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #486581;
}

.sdk-console-grid {
  display: grid;
  gap: 1rem;
  padding: 1.05rem;
}

.sdk-console-panel {
  border-radius: 24px;
  padding: 1rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 248, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.sdk-collection-list,
.sdk-hit-list {
  display: grid;
  gap: 0.7rem;
  margin-top: 0.95rem;
}

.sdk-collection-item,
.sdk-hit-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.04);
}

.sdk-collection-item strong,
.sdk-hit-copy strong {
  display: block;
  color: #0f172a;
  font-size: 0.96rem;
}

.sdk-collection-item p,
.sdk-hit-copy p,
.sdk-metadata-main p {
  margin: 0.3rem 0 0;
  color: #516173;
  font-size: 0.88rem;
  line-height: 1.6;
}

.sdk-collection-item span {
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 700;
  color: #3157d5;
  border-radius: 999px;
  padding: 0.34rem 0.58rem;
  background: rgba(59, 130, 246, 0.09);
}

.sdk-hit-score {
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.84rem;
  font-weight: 800;
  color: #0f172a;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 44%),
    linear-gradient(135deg, #bfdbfe 0%, #dbeafe 52%, #93c5fd 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.sdk-metadata-card {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.3rem 1.3rem;
}

.sdk-metadata-main {
  max-width: 34rem;
}

.sdk-metadata-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(110px, 1fr));
  gap: 0.9rem;
}

.sdk-metadata-stats div {
  border-radius: 22px;
  padding: 1rem;
  background:
    linear-gradient(180deg, #fbfdff 0%, #eef4ff 100%);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
}

.sdk-metadata-stats strong {
  display: block;
  color: #0a2540;
  font-size: 1.28rem;
  line-height: 1;
}

.sdk-metadata-stats span {
  display: block;
  margin-top: 0.4rem;
  color: #5b6b7c;
  font-size: 0.78rem;
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .sdk-showcase-head,
  .sdk-showcase-grid {
    grid-template-columns: 1fr;
  }

  .sdk-tab-rail {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sdk-metadata-card {
    flex-direction: column;
  }
}

@media (max-width: 760px) {
  .sdk-showcase-section {
    padding: 4.4rem 0 4.6rem;
  }

  .sdk-showcase-shell {
    width: min(100% - 24px, 1240px);
    padding: 1.2rem;
    border-radius: 26px;
  }

  .sdk-tab-rail {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 0.35rem;
  }

  .sdk-tab {
    padding: 0.8rem 0.85rem;
  }

  .sdk-code-stage,
  .sdk-console-card,
  .sdk-metadata-card {
    border-radius: 22px;
  }

  .sdk-code-stage-header {
    flex-direction: column;
  }

  .sdk-stage-badges {
    justify-content: flex-start;
  }

  .sdk-collection-item,
  .sdk-hit-item {
    flex-direction: column;
  }

  .sdk-metadata-stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 980px) {
  .finance-included-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem;
  }
}

@media (max-width: 640px) {
  .finance-included-section {
    padding: 3rem 0 4.2rem;
  }

  .finance-included-title,
  .finance-included-section .finance-included-subtitle {
    white-space: normal;
  }

  .finance-included-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .finance-included-card {
    padding: 1.65rem 1.25rem 1.4rem;
  }

  .finance-included-card-head {
    gap: 0.85rem;
  }

  .finance-included-card-icon {
    font-size: 1.25rem;
  }
}

/* Keep these product bands visually transparent; only the content cards should carry shape. */
.ecommerce-page .integrations-banner-section,
.hlog-stream-section {
  background: transparent !important;
  border-top: 0 !important;
}

.ecommerce-page .integrations-banner-grid {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

.ecommerce-page .integrations-banner-container,
.hlog-stream-container {
  background: transparent !important;
}

/* Integrations product: refined page hierarchy */
.ecommerce-page .integrations-hero-art {
  display: block;
  width: min(100%, 650px);
  height: auto;
  margin-left: auto;
  border: 1px solid rgba(120, 113, 108, 0.12);
  border-radius: 30px;
  background: #f7f3ee;
  box-shadow: 0 30px 70px rgba(41, 37, 36, 0.14), 0 8px 22px rgba(41, 37, 36, 0.06);
  object-fit: cover;
}

.ecommerce-page .integrations-network {
  width: min(100%, 590px);
  margin-left: auto;
  overflow: hidden;
  border: 1px solid #dce1e8;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.13), 0 8px 20px rgba(15, 23, 42, 0.055);
}

.ecommerce-page .integrations-network-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 50px;
  padding: 0 1rem;
  border-bottom: 1px solid #e4e7eb;
  background: #f7f8fa;
  font: 700 0.7rem/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.ecommerce-page .integrations-network-bar > span {
  display: flex;
  gap: 6px;
}

.ecommerce-page .integrations-network-bar > span i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fb7185;
}

.ecommerce-page .integrations-network-bar > span i:nth-child(2) { background: #fbbf24; }
.ecommerce-page .integrations-network-bar > span i:nth-child(3) { background: #34d399; }
.ecommerce-page .integrations-network-bar code { color: #475569; }

.ecommerce-page .integrations-network-bar b {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #15803d;
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.ecommerce-page .integrations-network-bar b i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
}

.ecommerce-page .integrations-network-stage {
  position: relative;
  height: 340px;
  background:
    radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08), transparent 30%),
    linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
    #fbfbfc;
  background-size: auto, 32px 32px, 32px 32px, auto;
}

.ecommerce-page .integrations-network-stage > svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ecommerce-page .integrations-network-stage > svg path {
  fill: none;
  stroke: #93c5fd;
  stroke-width: 1.5;
  stroke-dasharray: 7 8;
  animation: integrationsPathFlow 18s linear infinite;
}

@keyframes integrationsPathFlow {
  to { stroke-dashoffset: -120; }
}

.ecommerce-page .integrations-network-core,
.ecommerce-page .integrations-network-node {
  position: absolute;
  display: flex;
  align-items: center;
  border: 1px solid #dfe3e8;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
}

.ecommerce-page .integrations-network-core {
  left: 50%;
  top: 50%;
  width: 142px;
  min-height: 82px;
  padding: 0.85rem 1rem;
  flex-wrap: wrap;
  column-gap: 0.65rem;
  border-color: #c7d2fe;
  border-radius: 18px;
  transform: translate(-50%, -50%);
}

.ecommerce-page .integrations-network-core img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.ecommerce-page .integrations-network-core strong {
  color: #111827;
  font-size: 1rem;
  font-weight: 850;
}

.ecommerce-page .integrations-network-core span {
  width: 100%;
  margin-top: 0.2rem;
  color: #64748b;
  font: 700 0.62rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
}

.ecommerce-page .integrations-network-node {
  min-width: 112px;
  min-height: 50px;
  gap: 0.55rem;
  padding: 0.65rem 0.8rem;
  border-radius: 14px;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 800;
}

.ecommerce-page .integrations-network-node svg { color: #2563eb; font-size: 0.92rem; }
.ecommerce-page .integrations-network-node.node-sam { left: 5%; top: 12%; }
.ecommerce-page .integrations-network-node.node-web { right: 5%; top: 12%; }
.ecommerce-page .integrations-network-node.node-api { left: 5%; bottom: 12%; }
.ecommerce-page .integrations-network-node.node-clients { right: 5%; bottom: 12%; }
.ecommerce-page .integrations-network-node.node-web svg { color: #0f766e; }
.ecommerce-page .integrations-network-node.node-api svg { color: #b45309; }
.ecommerce-page .integrations-network-node.node-clients svg { color: #0369a1; }

.ecommerce-page .integrations-banner-section {
  padding: clamp(4.5rem, 7vw, 6.25rem) 0 !important;
  background: #f7f8fa !important;
  border-top: 1px solid #e8eaee !important;
  border-bottom: 1px solid #e8eaee;
}

.ecommerce-page .integrations-stack-head {
  width: min(100%, 760px);
  margin: 0 auto 2rem;
  text-align: center;
}

.ecommerce-page .integrations-stack-head > span {
  display: inline-block;
  margin-bottom: 0.65rem;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.ecommerce-page .integrations-stack-head h2 {
  margin: 0;
  color: #111827;
  font-size: clamp(2rem, 3.5vw, 3.25rem);
  font-weight: 850;
  line-height: 1.05;
  letter-spacing: -0.045em;
}

.ecommerce-page .integrations-stack-head p {
  margin: 1rem auto 0;
  max-width: 650px;
  color: #526070;
  font-size: 1rem;
  line-height: 1.65;
}

.ecommerce-page .integrations-banner-grid.integrations-banner-grid-stack {
  width: min(100%, 1060px);
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.7rem;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
}

.ecommerce-page .integrations-banner-grid-stack .integrations-banner-item {
  min-height: 76px;
  flex-direction: column;
  gap: 0.45rem;
  border: 1px solid #dfe3e8;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.055);
  font-size: 0.78rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.ecommerce-page .integrations-banner-grid-stack .integrations-banner-item:hover {
  transform: translateY(-3px);
  border-color: #c7cdd6;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.09);
}

.ecommerce-page .integrations-banner-grid-stack .integrations-banner-item:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.28);
  outline-offset: 3px;
  border-color: #2563eb;
}

.ecommerce-page .integrations-banner-grid-stack .integration-logo {
  width: 1.45rem;
  height: 1.45rem;
  font-size: 1.45rem;
}

.hlog-stream-section {
  position: relative;
  isolation: isolate;
  padding: clamp(5.5rem, 8vw, 7.5rem) 0 clamp(6rem, 9vw, 8rem) !important;
  overflow: hidden;
  border-top: 1px solid #e6edf4 !important;
  border-bottom: 1px solid #e6edf4;
  background:
    radial-gradient(circle at 88% 10%, rgba(123, 97, 255, 0.085), transparent 29rem),
    linear-gradient(135deg, rgba(207, 227, 255, 0.32) 0%, rgba(245, 249, 252, 0) 38%),
    #f5f9fc !important;
}

.hlog-stream-section::before {
  content: '';
  position: absolute;
  z-index: -1;
  top: -18rem;
  right: -10rem;
  width: 44rem;
  height: 44rem;
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 0 6rem rgba(255, 255, 255, 0.13),
    0 0 0 12rem rgba(207, 227, 255, 0.09);
  pointer-events: none;
}

.hlog-stream-container {
  width: min(1060px, calc(100vw - 3rem));
}

.hlog-ingest-panel {
  width: 100%;
  grid-template-columns: minmax(0, 0.82fr) minmax(340px, 1.18fr);
  gap: clamp(3rem, 7vw, 6.5rem);
  padding: 0;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.hlog-ingest-panel::before {
  content: none;
}

.hlog-ingest-panel::after { content: none; }

.hlog-ingest-copy h2 {
  max-width: 11.5ch;
  color: #0a2540 !important;
  -webkit-text-fill-color: #0a2540 !important;
  font-size: clamp(2.35rem, 4vw, 3.6rem);
  line-height: 1.02;
  letter-spacing: -0.045em;
}

.hlog-ingest-copy p {
  max-width: 34rem;
  color: #425466 !important;
  -webkit-text-fill-color: #425466 !important;
  font-size: 1.05rem;
  line-height: 1.65;
}

.hlog-ingest-copy {
  padding: 0.35rem 0 0.35rem 1.5rem;
  border-left: 2px solid #2563eb;
}

.integration-search-search-card {
  width: min(100%, 480px);
  border-color: #d9e2ec;
  border-radius: 16px;
  box-shadow:
    0 1px 2px rgba(10, 37, 64, 0.09),
    0 6px 16px rgba(10, 37, 64, 0.08),
    0 24px 52px rgba(10, 37, 64, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.98);
}

.integration-search-search-card .hlog-js-stream-header {
  background: #f7fafc;
}

.integration-live-header {
  display: flex;
  height: 48px;
  justify-content: space-between;
  padding: 0 0.9rem;
}

.integration-live-header .integration-live-brand {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.integration-live-header .integration-live-mark {
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border-radius: 8px;
  background: linear-gradient(145deg, #635bff, #2563eb);
  color: #ffffff;
  box-shadow: 0 5px 12px rgba(99, 91, 255, 0.23);
  font: 800 0.78rem/1 Arial, sans-serif;
}

.integration-live-header .integration-live-brand strong {
  margin: 0;
  color: #202124;
  font: 600 0.76rem/1 Arial, sans-serif;
}

.integration-live-header span.integration-live-status {
  display: inline-flex;
  width: auto;
  height: auto;
  align-items: center;
  gap: 0.35rem;
  padding: 0.28rem 0.55rem;
  border: 1px solid #bde8d4;
  border-radius: 999px;
  background: #edf9f2 !important;
  color: #137a49;
  font: 700 0.62rem/1 Arial, sans-serif;
  letter-spacing: 0.02em;
}

.integration-live-status i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a765;
  box-shadow: 0 0 0 4px rgba(22, 167, 101, 0.1);
  animation: integrationLivePulse 1.8s ease-in-out infinite;
}

.integration-search-search-body {
  min-height: 418px;
  padding: 0.9rem 1.1rem 1.15rem;
}

.integration-search-search-input {
  border-color: #d8e1ea;
  min-height: 44px;
  border-radius: 999px;
  box-shadow: 0 1px 6px rgba(32, 33, 36, 0.13);
}

.integration-search-search-input .integration-search-query-text {
  flex: 1 1 auto;
}

.integration-search-caret {
  width: 1px;
  height: 1.1rem;
  flex: 0 0 1px;
  background: #1a73e8;
  animation: integrationCaretBlink 1s steps(1, end) infinite;
}

.integration-search-search-input kbd {
  flex: 0 0 auto;
  padding: 0.18rem 0.34rem;
  border: 1px solid #e1e5ea;
  border-radius: 5px;
  background: #f8f9fa;
  color: #70757a;
  box-shadow: 0 1px 1px rgba(60, 64, 67, 0.08);
  font: 600 0.56rem/1 Arial, sans-serif;
}

.integration-search-tabs {
  display: flex;
  gap: 1.25rem;
  margin: 0.65rem 0 0;
  padding: 0 0.55rem;
  border-bottom: 1px solid #edf0f2;
}

.integration-search-tabs span {
  position: relative;
  padding: 0.36rem 0 0.5rem;
  color: #5f6368;
  font: 500 0.62rem/1 Arial, sans-serif;
}

.integration-search-tabs .is-active {
  color: #1a73e8;
  font-weight: 600;
}

.integration-search-tabs .is-active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  border-radius: 2px 2px 0 0;
  background: #1a73e8;
}

.integration-search-search-summary {
  margin: 0.55rem 0 0.75rem !important;
}

.integration-search-search-results {
  gap: 0.95rem;
}

.integration-search-result-source {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 0.55rem;
  align-items: center;
}

.integration-search-result-favicon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid #e2e6ea;
  border-radius: 50%;
  background: #f8f9fa;
  color: #1a73e8;
  font: 700 0.67rem/1 Arial, sans-serif;
}

.integration-search-result-source > span:nth-child(2) {
  display: grid;
  min-width: 0;
  gap: 0.05rem;
}

.integration-search-result-source strong {
  color: #202124;
  font: 500 0.67rem/1.2 Arial, sans-serif;
}

.integration-search-result-source small {
  overflow: hidden;
  color: #4d5156;
  font: 400 0.58rem/1.25 Arial, sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.integration-search-result-source > i {
  color: #5f6368;
  font: 700 0.8rem/1 Arial, sans-serif;
}

.integration-search-search-result h3 {
  margin: 0.22rem 0 0.12rem 2.25rem !important;
  color: #1a0dab !important;
  font-size: 1rem !important;
}

.integration-search-search-result p {
  margin-left: 2.25rem !important;
  font-size: 0.7rem !important;
  line-height: 1.42 !important;
}

@keyframes integrationLivePulse {
  0%, 100% { opacity: 0.55; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes integrationCaretBlink {
  0%, 52% { opacity: 1; }
  53%, 100% { opacity: 0; }
}

@media (max-width: 780px) {
  .hlog-ingest-panel {
    grid-template-columns: 1fr;
    gap: 2.25rem;
  }

  .hlog-ingest-copy {
    padding-left: 1rem;
  }

  .hlog-ingest-visual {
    justify-content: center;
  }

  .integration-search-search-card {
    width: min(100%, 520px);
  }
}

@media (max-width: 520px) {
  .hlog-stream-container {
    width: min(100% - 1.5rem, 1060px);
  }

  .integration-search-search-body {
    min-height: 0;
    padding: 0.75rem 0.8rem 0.95rem;
  }

  .integration-search-search-input kbd {
    display: none;
  }

  .integration-search-search-result h3,
  .integration-search-search-result p {
    margin-left: 0 !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .integration-live-status i,
  .integration-search-caret {
    animation: none;
  }
}

.hlog-benefits-section { margin-top: clamp(5rem, 8vw, 7rem); }
.hlog-benefits-copy { width: min(100%, 900px); margin: 0 auto; text-align: center; }
.hlog-benefits-copy h2 { white-space: normal; }
.hlog-benefits-copy p { margin-right: auto; margin-left: auto; color: #4b5563 !important; font-weight: 500; }
.hlog-benefits-eyebrow { color: #2563eb; }

.hlog-benefits-grid {
  gap: 0.9rem;
  margin-top: 2.5rem;
}

.hlog-benefit-item {
  min-height: 238px;
  padding: 1.55rem 1.25rem 1.35rem;
  border: 1px solid #dfe3e8;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.07);
}

.hlog-benefit-item::before {
  right: auto;
  width: 100%;
  height: 4px;
  border-radius: 18px 18px 0 0;
}

.hlog-benefit-item::after { opacity: 0.45; }
.hlog-benefit-item .finance-included-card-title { color: #171b22; }
.hlog-benefit-item .finance-included-card-icon { color: var(--hlog-benefit-accent); }
.hlog-benefit-item:nth-child(1) { --hlog-benefit-accent: #475569; }
.hlog-benefit-item:nth-child(2) { --hlog-benefit-accent: #0f766e; }
.hlog-benefit-item:nth-child(3) { --hlog-benefit-accent: #0369a1; }
.hlog-benefit-item:nth-child(4) { --hlog-benefit-accent: #b45309; }

/* Same three-color marker used in the Guides article hero and web landing. */
.integrations-guide-ribbons {
  position: relative;
  width: 150px;
  height: 39px;
  margin: 0.8rem 0 1.15rem;
}

.integrations-guide-ribbons i {
  position: absolute;
  left: 0;
  display: block;
  transform: skewY(-6deg);
  transform-origin: left;
}

.integrations-guide-ribbons i:nth-child(1) {
  bottom: 15px;
  width: 150px;
  height: 19px;
  background: #60a5fa;
}

.integrations-guide-ribbons i:nth-child(2) {
  bottom: 5px;
  width: 86px;
  height: 20px;
  background: #1d4ed8;
}

.integrations-guide-ribbons i:nth-child(3) {
  bottom: 0;
  left: 10px;
  width: 76px;
  height: 20px;
  background: #059669;
}

/* Compact Stripe-like closing CTA: broad copy column and one focused proof column. */
.landing-page.ecommerce-page > section.cta-section .cta-container {
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.55fr) !important;
  gap: clamp(2.5rem, 6vw, 5.5rem) !important;
}

.landing-page.ecommerce-page > section.cta-section .cta-title {
  max-width: 720px;
  margin-bottom: 1rem;
  color: #0a2540 !important;
  font-family: var(--font-family-sohne);
  font-size: clamp(2.15rem, 3.5vw, 3.35rem);
  font-weight: 650;
  line-height: 1.04;
  letter-spacing: -0.048em;
}

.landing-page.ecommerce-page > section.cta-section .cta-promo-grid {
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
}

.landing-page.ecommerce-page > section.cta-section .cta-right {
  padding-left: clamp(1.5rem, 3vw, 2.75rem);
  border-left: 1px solid #d9e2ec;
}

.landing-page.ecommerce-page > section.cta-section .integrations-cta-actions {
  display: flex !important;
  width: fit-content !important;
  max-width: none !important;
}

.landing-page.ecommerce-page > section.cta-section .integrations-cta-actions > .cta-primary {
  width: auto !important;
  min-width: 0 !important;
  min-height: 36px !important;
  padding: 0.46rem 0.78rem !important;
  border-radius: 8px !important;
  font-size: 0.78rem !important;
}

/* Stripe-like proof cards: crisp white surfaces and compact information density. */
.landing-page.ecommerce-page .global-marketing-grid {
  gap: 0.9rem;
  padding-top: 1.4rem;
}

.landing-page.ecommerce-page .global-marketing-card,
.landing-page.ecommerce-page .global-marketing-card + .global-marketing-card {
  position: relative;
  min-height: 230px;
  padding: 1.35rem 1.25rem 1.3rem;
  overflow: hidden;
  border: 1px solid rgba(10, 37, 64, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 1px 2px rgba(10, 37, 64, 0.06),
    0 8px 20px rgba(10, 37, 64, 0.07);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.landing-page.ecommerce-page .global-marketing-card::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #60a5fa, #2563eb);
  content: '';
}

.landing-page.ecommerce-page .global-marketing-card:nth-child(2)::before {
  background: linear-gradient(90deg, #38bdf8, #0284c7);
}

.landing-page.ecommerce-page .global-marketing-card:hover {
  border-color: rgba(37, 99, 235, 0.2);
  box-shadow:
    0 2px 4px rgba(10, 37, 64, 0.06),
    0 14px 28px rgba(10, 37, 64, 0.1);
  transform: translateY(-2px);
}

.landing-page.ecommerce-page .global-marketing-icon {
  width: 40px;
  height: 40px;
  margin: 0 0 1rem;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  color: #2563eb;
  background: #eff6ff;
  box-shadow: inset 0 1px 0 #fff;
  font-size: 1rem;
}

.landing-page.ecommerce-page .global-marketing-card:nth-child(2) .global-marketing-icon {
  border-color: #d7f0fb;
  color: #0369a1;
  background: #f0f9ff;
}

.landing-page.ecommerce-page .global-marketing-head {
  gap: 0;
  margin-bottom: 0.9rem;
}

.landing-page.ecommerce-page .global-marketing-accent {
  display: none;
}

.landing-page.ecommerce-page .global-marketing-head h3 {
  color: #0a2540;
  font-size: 1.14rem;
  font-weight: 680;
  line-height: 1.25;
  letter-spacing: -0.025em;
}

.landing-page.ecommerce-page .global-marketing-list {
  gap: 0.58rem;
  max-width: none;
}

.landing-page.ecommerce-page .global-marketing-list li {
  padding-left: 1.05rem;
  color: #425466;
  font-size: 0.83rem;
  font-weight: 450;
  line-height: 1.5;
}

.landing-page.ecommerce-page .global-marketing-list li::before {
  top: 0.62em;
  width: 5px;
  height: 5px;
  background: #2563eb;
}

@media (max-width: 980px) {
  .landing-page.ecommerce-page > section.cta-section .cta-container { grid-template-columns: 1fr !important; }
  .landing-page.ecommerce-page > section.cta-section .cta-right { padding: 1.5rem 0 0; border-top: 1px solid #d9e2ec; border-left: 0; }
  .ecommerce-page .integrations-hero-art { margin: 0 auto; }
  .ecommerce-page .integrations-network { margin: 0 auto; }
  .ecommerce-page .integrations-banner-grid.integrations-banner-grid-stack { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ecommerce-page .integrations-banner-grid-stack .integrations-banner-item:last-child { grid-column: auto; }
}

@media (max-width: 640px) {
  .ecommerce-page .integrations-banner-grid.integrations-banner-grid-stack { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ecommerce-page .integrations-network-stage { height: 300px; }
  .ecommerce-page .integrations-network-node { min-width: 92px; padding: 0.55rem 0.62rem; }
  .hlog-stream-container { width: min(100% - 2rem, 1060px); }
  .hlog-ingest-panel { grid-template-columns: 1fr; gap: 2.5rem; padding: 0; }
  .hlog-ingest-copy { padding-left: 1rem; }
  .hlog-benefits-copy { text-align: left; }
}

/* Launch benefits: richer integration-focused cards. */
.landing-page.ecommerce-page .api-launch-benefits {
  perspective: 900px;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card,
.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card + .global-marketing-card {
  min-height: 0;
  padding: 1.45rem 1.5rem 1.4rem;
  border: 1px solid #dbe4ef;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 30px rgba(15, 23, 42, 0.07);
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:nth-child(2) {
  border-color: #d9e8e5;
  background: #ffffff;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card::before {
  height: 4px;
  background: linear-gradient(90deg, #60a5fa, #38bdf8) !important;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:nth-child(2)::before {
  background: linear-gradient(90deg, #2dd4bf, #22c55e) !important;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:hover {
  border-color: #b9c9dc;
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.04),
    0 16px 34px rgba(15, 23, 42, 0.1);
  transform: translateY(-2px);
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 0.9rem;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  box-shadow: none;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:nth-child(2) .global-marketing-icon {
  border-color: #ccfbf1;
  background: #f0fdfa;
  color: #0f766e;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-head h3 {
  color: #0f2742 !important;
  font-size: 1.2rem;
  font-weight: 720;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-list {
  gap: 0.65rem;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-list li {
  color: #526579 !important;
  font-size: 0.9rem;
  line-height: 1.5;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:nth-child(2) .global-marketing-list li {
  color: #526579 !important;
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-list li::before {
  width: 6px;
  height: 6px;
  background: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.12);
}

.landing-page.ecommerce-page .api-launch-benefits .global-marketing-card:nth-child(2) .global-marketing-list li::before {
  background: #2dd4bf;
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.12);
}

/* Standalone Stripe-like modules; intentionally isolated from legacy marketing cards. */
.landing-page.ecommerce-page .api-launch-benefits {
  gap: 1.1rem !important;
  padding: 0 !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  align-items: stretch !important;
}

/* Keep the cards visually independent from the legacy zero-gap marketing grid. */
html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  column-gap: clamp(2.25rem, 4vw, 3.5rem) !important;
  row-gap: 1.1rem !important;
  margin-left: clamp(1.75rem, 4vw, 3.5rem) !important;
}

.api-benefit-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-width: 0;
  height: 100%;
  padding: 1.45rem 1.4rem 1.35rem;
  border: 1px solid rgba(129, 140, 248, 0.2);
  border-radius: 20px;
  background:
    linear-gradient(155deg, rgba(245, 243, 255, 0.96) 0%, #ffffff 32%, #ffffff 100%);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.08),
    0 16px 36px rgba(5, 18, 40, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
}

.api-benefit-card--trust {
  border-color: rgba(20, 184, 166, 0.22);
  background:
    linear-gradient(155deg, rgba(236, 253, 245, 0.98) 0%, #ffffff 32%, #ffffff 100%);
}

.api-benefit-card::before {
  content: none;
  position: absolute;
  z-index: 2;
  inset: 0 0 auto;
  height: 4px;
  background: linear-gradient(90deg, #8b5cf6 0%, #4f46e5 48%, #38bdf8 100%);
}

.api-benefit-card--trust::before {
  background: linear-gradient(90deg, #34d399 0%, #0d9488 52%, #22d3ee 100%);
}

.api-benefit-card::after {
  content: '';
  position: absolute;
  z-index: -1;
  top: -4.5rem;
  right: -4rem;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  filter: blur(2px);
  pointer-events: none;
}

.api-benefit-card--trust::after {
  background: rgba(20, 184, 166, 0.1);
}

.api-benefit-card:hover {
  border-color: rgba(99, 102, 241, 0.34);
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.07),
    0 22px 46px rgba(5, 18, 40, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transform: translateY(-4px);
}

.api-benefit-card--trust:hover {
  border-color: rgba(13, 148, 136, 0.36);
}

.api-benefit-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.05rem;
}

.api-benefit-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 13px;
  background: linear-gradient(145deg, #ffffff, #eeecff);
  color: #5145cd;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.12), inset 0 1px 0 #ffffff;
  font-size: 1rem;
}

.api-benefit-card--trust .api-benefit-icon {
  border-color: rgba(13, 148, 136, 0.2);
  background: linear-gradient(145deg, #ffffff, #e8faf6);
  color: #087f6d;
  box-shadow: 0 8px 18px rgba(13, 148, 136, 0.11), inset 0 1px 0 #ffffff;
}

.api-benefit-number {
  display: inline-flex;
  align-items: center;
  min-height: 25px;
  padding: 0.25rem 0.52rem;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #818cf8;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.api-benefit-card--trust .api-benefit-number {
  border-color: rgba(13, 148, 136, 0.12);
  color: #0d9488;
}

.api-benefit-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  margin: 0 0 1.3rem;
  padding: 1rem 0.8rem;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.16);
  border-radius: 15px;
  background:
    radial-gradient(circle at 84% 4%, rgba(99, 91, 255, 0.18), transparent 42%),
    linear-gradient(145deg, #fafaff, #f2f1ff);
  box-shadow: inset 0 1px 0 #ffffff, 0 8px 18px rgba(79, 70, 229, 0.07);
}

.api-benefit-flow span {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  min-width: 48px;
  height: 32px;
  padding: 0 0.5rem;
  border: 1px solid #d9d7ff;
  border-radius: 9px;
  background: #ffffff;
  color: #3f3a87;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.08);
  font-size: 0.64rem;
  font-weight: 750;
}

.api-benefit-flow span:nth-of-type(2) {
  border-color: #8c86ff;
  background: #635bff;
  color: #ffffff;
  box-shadow: 0 7px 16px rgba(99, 91, 255, 0.28);
}

.api-benefit-flow i {
  position: relative;
  width: clamp(12px, 2vw, 24px);
  height: 1px;
  background: #aaa6ef;
}

.api-benefit-flow i::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -1px;
  width: 5px;
  height: 5px;
  border-top: 1px solid #7770df;
  border-right: 1px solid #7770df;
  transform: translateY(-50%) rotate(45deg);
}

.api-benefit-security {
  gap: clamp(0.55rem, 1.6vw, 0.9rem);
  border-color: #d7eee9;
  background:
    radial-gradient(circle at 15% 0%, rgba(20, 184, 166, 0.18), transparent 42%),
    linear-gradient(145deg, #f7fdfc, #edf9f7);
  box-shadow: inset 0 1px 0 #ffffff, 0 8px 18px rgba(15, 118, 110, 0.07);
}

.api-benefit-security span {
  padding: 0.34rem 0.55rem;
  border: 1px solid #cde9e3;
  border-radius: 999px;
  background: #ffffff;
  color: #176b60;
  font-size: 0.61rem;
  font-weight: 750;
  box-shadow: 0 4px 10px rgba(15, 118, 110, 0.07);
}

.api-benefit-security strong {
  position: relative;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 15px;
  background: linear-gradient(145deg, #14b8a6, #0f766e);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 118, 110, 0.24);
  font-size: 0.9rem;
}

.api-benefit-security strong::before {
  content: '';
  position: absolute;
  inset: -7px;
  border: 1px solid rgba(20, 184, 166, 0.22);
  border-radius: 18px;
}

.api-benefit-kicker {
  margin: 0 0 0.42rem;
  color: #635bff !important;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.11em;
  line-height: 1.3;
  text-transform: uppercase;
}

.api-benefit-card--trust .api-benefit-kicker {
  color: #087f6d !important;
}

.api-benefit-card h3 {
  margin: 0 0 1.05rem;
  color: #0a2540 !important;
  font-size: 1.32rem;
  font-weight: 720;
  letter-spacing: -0.025em;
  line-height: 1.2;
}

.api-benefit-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.api-benefit-list li {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 0.6rem;
  align-items: start;
  margin: 0;
  padding: 0.72rem 0;
  border-top: 1px solid rgba(226, 232, 240, 0.82);
  color: #526579 !important;
  font-size: 0.86rem;
  font-weight: 450;
  line-height: 1.45;
}

.api-benefit-list li > span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 0.08rem;
  border-radius: 999px;
  background: #eeedff;
  color: #5145cd;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.1);
  font-size: 0.64rem;
  font-weight: 850;
}

.api-benefit-card--trust .api-benefit-list li > span {
  background: #e8f8f4;
  color: #087f6d;
  box-shadow: 0 3px 8px rgba(13, 148, 136, 0.1);
}

@media (max-width: 1180px) {
  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 2.75rem !important;
  }
}

@media (max-width: 760px) {
  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .api-benefit-card {
    padding: 1.3rem 1.15rem 1.15rem;
    border-radius: 18px;
  }

  .api-benefit-visual {
    min-height: 84px;
  }
}

/* Compact launch cards and a clean, uninterrupted blue section. */
html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid {
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1.28fr) !important;
  gap: clamp(2rem, 4vw, 4rem) !important;
  align-items: start !important;
}

.api-launch-section .global-data-content {
  grid-column: 1;
  grid-row: 1 / span 2;
  align-self: center;
}

html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits {
  grid-column: 2;
  grid-row: 1;
  align-items: start !important;
  column-gap: 0.85rem !important;
  margin-left: 0 !important;
}

.api-launch-section .global-data-visual {
  grid-column: 2;
  grid-row: 2;
  width: 100%;
  margin-top: 0.9rem;
}

.api-launch-section .api-benefit-card {
  height: auto;
  padding: 1rem 1rem 0.9rem;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(5, 18, 40, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.api-launch-section .api-benefit-card-header {
  margin-bottom: 0.65rem;
}

.api-launch-section .api-benefit-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 0.82rem;
}

.api-launch-section .api-benefit-number {
  min-height: 22px;
  padding: 0.18rem 0.42rem;
  font-size: 0.58rem;
}

.api-launch-section .api-benefit-visual {
  min-height: 62px;
  margin-bottom: 0.75rem;
  padding: 0.55rem;
  border-radius: 11px;
}

.api-launch-section .api-benefit-flow span {
  min-width: 40px;
  height: 27px;
  padding-inline: 0.35rem;
  font-size: 0.55rem;
}

.api-launch-section .api-benefit-security strong {
  width: 36px;
  height: 36px;
  border-radius: 11px;
}

.api-launch-section .api-benefit-security strong::before {
  inset: -4px;
  border-radius: 13px;
}

.api-launch-section .api-benefit-kicker {
  margin-bottom: 0.28rem;
  font-size: 0.58rem;
}

.api-launch-section .api-benefit-card h3 {
  margin-bottom: 0.6rem;
  font-size: 1.05rem;
}

.api-launch-section .api-benefit-list li {
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 0.45rem;
  padding: 0.42rem 0;
  font-size: 0.76rem;
  line-height: 1.35;
}

.api-launch-section .api-benefit-list li > span {
  width: 17px;
  height: 17px;
  font-size: 0.55rem;
}

@media (max-width: 1180px) {
  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 2rem !important;
  }

  .api-launch-section .global-data-content,
  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits,
  .api-launch-section .global-data-visual {
    grid-column: 1;
    grid-row: auto;
  }

  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits {
    width: min(100%, 820px);
    margin-inline: auto !important;
  }

  .api-launch-section .global-data-visual {
    width: min(100%, 820px);
    margin: 0.25rem auto 0;
  }
}

@media (max-width: 760px) {
  html body #app .landing-page.ecommerce-page .api-launch-section .global-data-grid > .api-launch-benefits {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
</style>
