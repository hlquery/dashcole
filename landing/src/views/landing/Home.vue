<template>
  <div class="landing-page-wrapper">
    <FlowLines />
    <Header :force-header-background-color="'#f8fafc'" />
    <div class="landing-page">
      <!-- Background Vertical Line - Stripe Style -->

      <!-- Hero Section -->
      <section class="hero-section ecommerce-hero home-hero">
        <div class="hero-background">
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="gradient-orb orb-3"></div>
        </div>

        <div class="hero-container">
          <div class="hero-content">
            <span class="hero-eyebrow">{{ $t('landing_home_hero_eyebrow') }}</span>
            <h1 class="hero-title ecommerce-hero-title">{{ $t('landing_home_hero_title') }}</h1>
            <p class="hero-description animate__animated animate__fadeInUp animate__faster">
              {{ $t('landing_home_hero_description') }}
            </p>

            <div class="hero-actions animate__animated animate__fadeInUp animate__faster">
              <router-link
                to="/contact"
                class="btn-primary"
                :aria-label="$t('landing_home_cta_docs_aria')"
              >
                <font-awesome-icon class="btn-icon" :icon="['fas', 'inbox']" aria-hidden="true" />
                <span>Solicitar demo</span>
              </router-link>
            </div>
          </div>

          <!-- Vertical Divider -->
          <div class="vertical-divider"></div>

          <div class="hero-visual animate__animated animate__fadeInRight animate__faster">
            <div
              class="home-hero-search-visual"
              aria-label="Vista previa de la plataforma de gestión educativa DashCole"
            >
              <span class="home-hero-banner-stack">
                <img
                  src="/images/banners/browser-hero-ultra.png?v=6"
                  alt="Panel de seguimiento académico de DashCole"
                  class="home-hero-banner-image home-hero-banner-image-primary"
                  :class="{ 'is-active': heroSearchIndex === 0 }"
                  loading="eager"
                  decoding="async"
                  width="3496"
                  height="2272"
                />
                <img
                  src="/images/banners/browser-hero-tv-products-v8.webp"
                  alt="Consulta de notas y evaluaciones en DashCole"
                  class="home-hero-banner-image home-hero-banner-image-secondary"
                  :class="{ 'is-active': heroSearchIndex === 1 }"
                  loading="eager"
                  decoding="async"
                  width="3496"
                  height="2272"
                />
                <img
                  src="/images/banners/browser-hero-pc-products-v8.webp"
                  alt="Registro de asistencia y cursos en DashCole"
                  class="home-hero-banner-image home-hero-banner-image-tertiary"
                  :class="{ 'is-active': heroSearchIndex === 2 }"
                  loading="eager"
                  decoding="async"
                  width="3496"
                  height="2272"
                />
                <span class="home-hero-education-url" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <rect x="3.5" y="7" width="9" height="7" rx="1.5" fill="currentColor" />
                    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.5" />
                  </svg>
                  <strong>dashboard.hlquery.com</strong>
                </span>
                <span class="home-hero-education-panel" aria-hidden="true">
                  <span class="education-panel-sidebar">
                    <strong class="education-panel-brand">Gestión académica</strong>
                    <span class="education-panel-label">Curso</span>
                    <span class="education-panel-select">8° Básico A <b>⌄</b></span>
                    <span class="education-panel-label">Ver registros</span>
                    <span class="education-panel-filter is-active">✓ Todas las asignaturas</span>
                    <span class="education-panel-filter">□ Notas</span>
                    <span class="education-panel-filter">□ Asistencia</span>
                    <span class="education-panel-filter">□ Observaciones</span>
                    <span class="education-panel-label education-panel-period-label">Período</span>
                    <span class="education-panel-filter is-active">✓ Segundo semestre</span>
                  </span>
                  <span class="education-panel-main">
                    <span class="education-panel-heading">
                      <span>
                        <strong>Notas de estudiantes</strong>
                        <small>8° Básico A · Segundo semestre</small>
                      </span>
                      <span class="education-panel-average">Promedio del curso <b>6,1</b></span>
                    </span>
                    <span class="education-panel-summary">
                      <span><small>Estudiantes</small><strong>32</strong></span>
                      <span><small>Evaluaciones</small><strong>8</strong></span>
                      <span><small>Asistencia</small><strong>94%</strong></span>
                    </span>
                    <span class="education-student-grid">
                      <span class="education-student-card">
                        <span class="education-student-avatar">A1</span>
                        <strong>Alumno 1</strong>
                        <small>Promedio general</small>
                        <b class="education-grade">6,5</b>
                        <span class="education-subject"><i>Matemática</i><b>6,7</b></span>
                        <span class="education-subject"><i>Lenguaje</i><b>6,3</b></span>
                        <span class="education-status">Buen desempeño</span>
                      </span>
                      <span class="education-student-card">
                        <span class="education-student-avatar">A2</span>
                        <strong>Alumno 2</strong>
                        <small>Promedio general</small>
                        <b class="education-grade">6,1</b>
                        <span class="education-subject"><i>Matemática</i><b>5,9</b></span>
                        <span class="education-subject"><i>Lenguaje</i><b>6,3</b></span>
                        <span class="education-status">Avance constante</span>
                      </span>
                      <span class="education-student-card">
                        <span class="education-student-avatar">A3</span>
                        <strong>Alumno 3</strong>
                        <small>Promedio general</small>
                        <b class="education-grade">5,8</b>
                        <span class="education-subject"><i>Matemática</i><b>5,6</b></span>
                        <span class="education-subject"><i>Lenguaje</i><b>6,0</b></span>
                        <span class="education-status education-status-attention">Requiere apoyo</span>
                      </span>
                    </span>
                  </span>
                </span>
                <span class="home-hero-query-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="4.35" stroke="currentColor" stroke-width="1.5" />
                    <path d="M10.35 10.35 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </span>
                <span class="home-hero-api-title-cover" aria-hidden="true"></span>
                <span class="home-hero-query-typing" aria-hidden="true">
                  <span>{{ heroTypedQuery }}</span>
                  <span class="home-hero-query-caret"></span>
                </span>
                <span v-if="heroSearchLoading" class="home-hero-results-loading" aria-hidden="true">
                  <span class="home-hero-results-spinner"></span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="container">
          <div class="section-header dev-tools-header animate__animated animate__fadeInUp">
            <span class="home-dev-header-icon" aria-hidden="true">
              <font-awesome-icon
                class="home-dev-header-icon-glyph"
                :icon="['fas', 'magnifying-glass']"
              />
            </span>
            <h2 class="section-title">{{ $t('landing_dev_tools_title') }}</h2>
            <p class="section-description">
              {{ $t('landing_dev_tools_subtitle') }}
            </p>
          </div>

          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'hand-pointer']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_drag_drop') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_drag_drop_desc') }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'plug']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_connect') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_connect_desc') }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'sync-alt']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_live') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_live_desc') }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'share-nodes']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_share') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_share_desc') }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'chart-line']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_charts') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_charts_desc') }}
              </p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <font-awesome-icon :icon="['fas', 'mobile-screen']" class="feature-icon-img" />
              </div>
              <h3 class="feature-title">{{ $t('landing_feature_everywhere') }}</h3>
              <p class="feature-description">
                {{ $t('landing_feature_everywhere_desc') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section class="hero-section home-hero hero-secondary">
        <div class="hero-background">
          <div class="gradient-orb orb-1"></div>
          <div class="gradient-orb orb-2"></div>
          <div class="gradient-orb orb-3"></div>
        </div>

        <div class="hero-container hero-container-secondary">
          <div class="hero-content hero-content-secondary">
            <h1 class="hero-title hero-title-secondary">
              <span class="hero-line">
                <span class="hero-title-base">{{ $t('landing_home_secondary_title') }}</span>
              </span>
            </h1>
            <p
              class="hero-description hero-description-secondary animate__animated animate__fadeInUp animate__faster"
            >
              {{ $t('landing_home_secondary_description') }}
            </p>
            <p class="hero-description hero-description-secondary hero-description-secondary-2">
              {{ $t('landing_home_secondary_description_plus') }}
            </p>
            <div class="home-secondary-stats" role="list">
              <div class="home-secondary-stat" role="listitem">
                <strong>{{ $t('landing_home_stat_latency_value') }}</strong>
                <span>{{ $t('landing_home_stat_latency_label') }}</span>
              </div>
              <div class="home-secondary-stat" role="listitem">
                <strong>{{ $t('landing_home_stat_apis_value') }}</strong>
                <span>{{ $t('landing_home_stat_apis_label') }}</span>
              </div>
              <div class="home-secondary-stat" role="listitem">
                <strong>{{ $t('landing_home_stat_open_source_value') }}</strong>
                <span>{{ $t('landing_home_stat_open_source_label') }}</span>
              </div>
            </div>
          </div>

          <div class="hero-visual hero-visual-secondary">
            <div class="hero-preview-box">
              <img src="/images/banners/index-search-discovery.png" alt="" class="hero-preview-image" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <!-- Global Data Visualization Section (Stripe-style) -->
      <section
        class="global-data-section"
        style="
          clip-path: polygon(0 18%, 100% 0%, 100% 100%, 0 100%);
          -webkit-clip-path: polygon(0 18%, 100% 0%, 100% 100%, 0 100%);
        "
      >
        <div class="light-ray"></div>
        <div class="global-data-container">
          <div class="global-data-grid">
            <div class="global-data-intro">
              <p class="global-data-eyebrow">{{ $t('global_proof_eyebrow') }}</p>
              <h2 class="global-data-title">{{ $t('landing_global_title') }}</h2>
            </div>

            <div class="global-data-copy">
              <p class="global-data-subtitle">{{ $t('landing_global_subtitle') }}</p>
              <p class="global-data-description">
                {{ $t('landing_global_description') }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Developer section moved to Products -->
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
              <div class="stripe-badge">Designed for developers</div>
              <h2 class="stripe-main-title">Ship faster with powerful and easy-to-use APIs</h2>
              <p class="stripe-main-desc">
                Save engineering time with unified payments functionality. We obsess over the maze
                of gateways, payments rails, and financial institutions that make up the global
                economic landscape so that your teams can build what you need on one platform.
              </p>
            </div>

            <!-- Right: Code + Terminal -->
            <div class="stripe-right-content">
              <!-- Code Block -->
              <div class="stripe-code-editor">
                <pre
                  class="stripe-code-lines"
                ><code><span class="stripe-line-num">1</span><span class="stripe-code-line"> <span class="stripe-kw">const</span> <span class="stripe-var">stripe</span> = <span class="stripe-kw">require</span>(<span class="stripe-str">'stripe'</span>)(<span class="stripe-str">'sk_test_BQokikJ0vB12H14'</span>);</span>
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
                  <span class="stripe-term-date">2025-10-03 12:24:29</span>
                  <span class="stripe-status-200">[200]</span>
                  <span class="stripe-term-event">payment_intent.created</span>
                </div>
                <div class="stripe-term-line">
                  <span class="stripe-term-date">2025-10-03 12:24:29</span>
                  <span class="stripe-status-208">[208]</span>
                  <span class="stripe-term-event">charge.succeeded</span>
                </div>
                <div class="stripe-term-line">
                  <span class="stripe-term-date">2025-10-03 12:24:29</span>
                  <span class="stripe-status-200">[200]</span>
                  <span class="stripe-term-event">payment_intent.succeeded</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Cards Row (4 Columns) -->
          <div class="stripe-features-grid">
            <div class="stripe-feature-card">
              <div class="stripe-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="url(#stripeGrad1)"
                    stroke-width="2"
                  />
                  <rect x="7" y="7" width="10" height="10" rx="1" fill="url(#stripeGrad1)" />
                </svg>
                <defs>
                  <linearGradient id="stripeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: #60a5fa; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #60a5fa; stop-opacity: 1" />
                  </linearGradient>
                </defs>
              </div>
              <h3 class="stripe-feature-title">Integra tu ecosistema</h3>
              <p class="stripe-feature-description">
                Conecta las herramientas académicas y administrativas que tu institución ya utiliza.
              </p>
            </div>

            <div class="stripe-feature-card">
              <div class="stripe-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="url(#stripeGrad2)" stroke-width="2" />
                  <path
                    d="M12 8V12L15 15"
                    stroke="url(#stripeGrad2)"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <circle cx="12" cy="12" r="2" fill="url(#stripeGrad2)" />
                </svg>
                <defs>
                  <linearGradient id="stripeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: #60a5fa; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #ec4899; stop-opacity: 1" />
                  </linearGradient>
                </defs>
              </div>
              <h3 class="stripe-feature-title">Automatiza tareas</h3>
              <p class="stripe-feature-description">
                Reduce el trabajo manual con flujos simples y datos compartidos entre módulos.
              </p>
            </div>

            <div class="stripe-feature-card">
              <div class="stripe-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="url(#stripeGrad3)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <defs>
                  <linearGradient id="stripeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: #60a5fa; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #0ea5e9; stop-opacity: 1" />
                  </linearGradient>
                </defs>
              </div>
              <h3 class="stripe-feature-title">Activa módulos educativos</h3>
              <p class="stripe-feature-description">
                Suma asistencia, matrículas, finanzas y comunicaciones cuando los necesites.
              </p>
              <a href="/que-hacemos" class="stripe-feature-link">
                Comparar planes
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 4L10 8L6 12"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div class="stripe-feature-card">
              <div class="stripe-feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="url(#stripeGrad4)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="url(#stripeGrad4)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="url(#stripeGrad4)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <defs>
                  <linearGradient id="stripeGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: #3b82f6; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: #ec4899; stop-opacity: 1" />
                  </linearGradient>
                </defs>
              </div>
              <h3 class="stripe-feature-title">Trabaja en comunidad</h3>
              <p class="stripe-feature-description">
                Ofrece una experiencia clara para directivos, docentes, estudiantes y familias.
              </p>
            </div>
          </div>
        </div>
      </section>
      <!-- SaaS Platform Banner (Stripe-style) -->
      <section class="saas-platform-section">
        <!-- Invoices Section - Full Width Background -->
        <div class="invoices-section">
          <div class="invoices-container">
            <div class="invoices-grid">
              <!-- Left: Text Content -->
              <div class="invoices-left" style="position: relative">
                <h2 class="invoices-title">{{ $t('landing_invoices_title') }}</h2>

                <div class="invoices-section-divider"></div>

                <h4 class="invoices-section-title">{{ $t('landing_invoices_section_title') }}</h4>
                <p class="invoices-section-description">
                  {{ $t('landing_invoices_section_description') }}
                </p>

                <!-- Integration Grid -->
                <div class="payment-methods-grid">
                  <div
                    class="payment-method payment-github"
                    :class="{ 'payment-selected': isIntegrationSelected('github') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_github_aria')"
                    @click="openIntegrationModal('github', $event)"
                    @keyup.enter="openIntegrationModal('github')"
                    @keyup.space.prevent="openIntegrationModal('github')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'users']" /></span>
                    <span>{{ $t('landing_home_integration_github') }}</span>
                  </div>
                  <div
                    class="payment-method payment-node"
                    :class="{ 'payment-selected': isIntegrationSelected('stripe') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_stripe_aria')"
                    @click="openIntegrationModal('stripe', $event)"
                    @keyup.enter="openIntegrationModal('stripe')"
                    @keyup.space.prevent="openIntegrationModal('stripe')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'chart-line']" /></span>
                    <span>{{ $t('landing_home_integration_stripe') }}</span>
                  </div>
                  <div
                    class="payment-method payment-api"
                    :class="{ 'payment-selected': isIntegrationSelected('paypal') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_paypal_aria')"
                    @click="openIntegrationModal('paypal', $event)"
                    @keyup.enter="openIntegrationModal('paypal')"
                    @keyup.space.prevent="openIntegrationModal('paypal')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'hand-pointer']" /></span>
                    <span>{{ $t('landing_home_integration_paypal') }}</span>
                  </div>
                  <div
                    class="payment-method payment-redis"
                    :class="{ 'payment-selected': isIntegrationSelected('aws') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_aws_aria')"
                    @click="openIntegrationModal('aws', $event)"
                    @keyup.enter="openIntegrationModal('aws')"
                    @keyup.space.prevent="openIntegrationModal('aws')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'file-invoice']" /></span>
                    <span>{{ $t('landing_home_integration_aws') }}</span>
                  </div>
                  <div
                    class="payment-method payment-postgres"
                    :class="{ 'payment-selected': isIntegrationSelected('openai') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_openai_aria')"
                    @click="openIntegrationModal('openai', $event)"
                    @keyup.enter="openIntegrationModal('openai')"
                    @keyup.space.prevent="openIntegrationModal('openai')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'envelope']" /></span>
                    <span>{{ $t('landing_home_integration_openai') }}</span>
                  </div>
                  <div
                    class="payment-method payment-mongo"
                    :class="{ 'payment-selected': isIntegrationSelected('twilio') }"
                    role="button"
                    tabindex="0"
                    :aria-label="$t('landing_home_integration_twilio_aria')"
                    @click="openIntegrationModal('twilio', $event)"
                    @keyup.enter="openIntegrationModal('twilio')"
                    @keyup.space.prevent="openIntegrationModal('twilio')"
                  >
                    <span class="payment-icon"><font-awesome-icon :icon="['fas', 'chart-bar']" /></span>
                    <span>{{ $t('landing_home_integration_twilio') }}</span>
                  </div>
                </div>
                <teleport to="body">
                  <div
                    v-if="activeIntegrationKey"
                    :style="`position:absolute; left:0; right:0; top:${modalViewportTop}px; height:100vh; z-index:999999; background:#e2e8f0;`"
                  >
                    <section
                      role="dialog"
                      aria-modal="true"
                      style="
                        position: fixed;
                        inset: 0;
                        overflow: hidden;
                        background: #e2e8f0;
                        color: #0f172a;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 24px;
                      "
                      @click="closeIntegrationModal"
                    >
                      <article
                        class="modal-3d-card"
                        style="
                          width: min(920px, 100%);
                          max-height: calc(100vh - 48px);
                          overflow-y: auto;
                          overflow-x: hidden;
                          background: #ffffff;
                          border: 1px solid rgba(148, 163, 184, 0.32);
                          border-radius: 18px;
                          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.22);
                        "
                        @click.stop
                      >
                        <div
                          style="
                            position: sticky;
                            top: 0;
                            z-index: 2;
                            display: grid;
                            grid-template-columns: auto 1fr auto;
                            align-items: center;
                            gap: 8px;
                            padding: 12px 16px;
                            min-height: 60px;
                            border-bottom: 1px solid rgba(209, 213, 219, 0.9);
                            background: linear-gradient(135deg, #eff3f6, #dfe6ea);
                          "
                        >
                          <div class="integration-modal-header">
                            <font-awesome-icon
                              v-if="integrationModalData.icon"
                              :icon="integrationModalData.icon"
                              class="integration-modal-header-icon"
                            />
                            <span class="integration-modal-header-title">{{
                              integrationModalData.title
                            }}</span>
                          </div>
                          <div></div>
                          <button
                            class="modal-close-btn"
                            type="button"
                            :aria-label="$t('landing_home_integration_close_aria')"
                            @click="closeIntegrationModal"
                            style="
                              width: 30px;
                              height: 30px;
                              border: none;
                              background: transparent;
                              color: #000000;
                              font-size: 20px;
                              line-height: 1;
                              font-weight: 700;
                              display: inline-flex;
                              align-items: center;
                              justify-content: center;
                              padding: 0;
                              border-radius: 6px;
                              justify-self: end;
                            "
                          >
                            ×
                          </button>
                        </div>
                        <div
                          style="
                            max-width: 900px;
                            margin: 0 auto;
                            padding: 14px 20px 20px 20px;
                            color: #000000;
                          "
                        >
                          <p class="integration-modal-badge">
                            {{ integrationModalData.badge }}
                          </p>
                          <br />
                          <p class="integration-modal-summary">
                            {{ integrationModalData.summary }}
                          </p>
                          <p class="integration-modal-subtitle">
                            {{ $t('landing_home_integration_modal_subtitle') }}
                          </p>
                          <div class="integration-steps">
                            <p
                              v-for="(step, idx) in integrationModalData.steps"
                              :key="`${integrationModalData.title}-${idx}`"
                              class="integration-step-line"
                            >
                              {{ step }}
                            </p>
                          </div>
                          <p class="integration-modal-cta">{{ integrationModalData.cta }}</p>
                        </div>
                      </article>
                    </section>
                  </div>
                </teleport>
              </div>

              <!-- Right: Country Selector with Invoices -->
              <div class="invoices-right">
                <!-- Country Selector - Stripe Style (Outside Box) -->
                <div class="country-selector-stripe">
                  <button
                    class="country-tab"
                    :class="{ active: selectedCountry === 'us' }"
                    @click="selectedCountry = 'us'"
                    role="button"
                    tabindex="0"
                    @keyup.enter="selectedCountry = 'us'"
                    :aria-label="$t('landing_home_country_select_us_aria')"
                  >
                    <span class="country-flag">🏫</span>
                    {{ $t('landing_country_us') }}
                  </button>
                  <button
                    class="country-tab"
                    :class="{ active: selectedCountry === 'nl' }"
                    @click="selectedCountry = 'nl'"
                    role="button"
                    tabindex="0"
                    @keyup.enter="selectedCountry = 'nl'"
                    :aria-label="$t('landing_home_country_select_nl_aria')"
                  >
                    <span class="country-flag">📘</span>
                    {{ $t('landing_country_nl') }}
                  </button>
                  <button
                    class="country-tab"
                    :class="{ active: selectedCountry === 'cl' }"
                    @click="selectedCountry = 'cl'"
                    role="button"
                    tabindex="0"
                    @keyup.enter="selectedCountry = 'cl'"
                    :aria-label="$t('landing_home_country_select_cl_aria')"
                  >
                    <span class="country-flag">🌱</span>
                    {{ $t('landing_country_cl') }}
                  </button>
                  <button
                    class="country-tab"
                    :class="{ active: selectedCountry === 'jp' }"
                    @click="selectedCountry = 'jp'"
                    role="button"
                    tabindex="0"
                    @keyup.enter="selectedCountry = 'jp'"
                    :aria-label="$t('landing_home_country_select_jp_aria')"
                  >
                    <span class="country-flag">🎓</span>
                    {{ $t('landing_country_jp') }}
                  </button>
                </div>

                <!-- Accounting Track Record Card -->
                <div class="accounting-track-card">
                  <div class="accounting-track-header">
                    <div class="accounting-track-title">
                      {{ $t('landing_accounting_track_title') }}
                    </div>
                    <button class="accounting-view-all-header">
                      <span>{{ $t('landing_home_view_all') }}</span>
                      <svg
                        class="accounting-view-all-chevron"
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 4l4 4-4 4"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div class="accounting-track-body">
                    <!-- Summary Row -->
                    <div class="accounting-summary">
                      <div class="summary-item">
                        <div class="summary-label">
                          {{ $t('landing_accounting_total_revenue') }}
                        </div>
                        <div class="summary-value positive">
                          {{
                            formatCurrencyForCountry(
                              selectedCountry,
                              getAccountingData(selectedCountry).totalRevenue
                            )
                          }}
                        </div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">
                          {{ $t('landing_accounting_total_expenses') }}
                        </div>
                        <div class="summary-value negative">
                          {{
                            formatCurrencyForCountry(
                              selectedCountry,
                              getAccountingData(selectedCountry).totalExpenses
                            )
                          }}
                        </div>
                      </div>
                      <div class="summary-item">
                        <div class="summary-label">{{ $t('landing_accounting_net_profit') }}</div>
                        <div class="summary-value positive">
                          {{
                            formatCurrencyForCountry(
                              selectedCountry,
                              getAccountingData(selectedCountry).netProfit
                            )
                          }}
                        </div>
                      </div>
                    </div>

                    <!-- Transactions Table -->
                    <div class="accounting-table">
                      <div class="accounting-table-header">
                        <div class="table-col-date">{{ $t('landing_accounting_table_date') }}</div>
                        <div class="table-col-description">
                          {{ $t('landing_accounting_table_description') }}
                        </div>
                        <div class="table-col-category">
                          {{ $t('landing_accounting_table_category') }}
                        </div>
                        <div class="table-col-amount">{{ $t('landing_home_records') }}</div>
                      </div>

                      <div class="accounting-table-body">
                        <div
                          v-for="(transaction, index) in getAccountingData(selectedCountry)
                            .transactions"
                          :key="`${selectedCountry}-${index}`"
                          class="accounting-table-row"
                        >
                          <div class="table-col-date">
                            {{ formatAccountingDate(selectedCountry, transaction.date) }}
                          </div>
                          <div class="table-col-description">{{ transaction.description }}</div>
                          <div class="table-col-category">
                            <span class="category-badge" :class="transaction.category">{{
                              transaction.category === 'success'
                                ? $t('landing_accounting_category_revenue')
                                : $t('landing_accounting_category_expense')
                            }}</span>
                          </div>
                          <div
                            class="table-col-amount"
                            :class="transaction.category === 'success' ? 'positive' : 'negative'"
                          >
                            {{
                              formatTransactionAmount(
                                selectedCountry,
                                transaction.amount,
                                transaction.category
                              )
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="simple-pricing">
        <div class="simple-pricing-card">
          <span class="simple-pricing-kicker">100% OPEN SOURCE</span>
          <h2>Código abierto de verdad</h2>
          <p>DashCole es 100% open source: instálalo, audítalo y adáptalo a tu colegio sin límites artificiales de estudiantes ni tarifas ocultas.</p>
          <a href="https://github.com/hlquery/dashcole" class="simple-pricing-button" target="_blank" rel="noopener noreferrer">Ver en GitHub <span aria-hidden="true">→</span></a>
        </div>
      </section>

      <!-- CTA Section: Ready to get started? -->
      <section class="cta-section">
        <div class="cta-container">
          <div class="cta-left">
            <h2 class="cta-title">{{ $t('landing_home_cta_title') }}</h2>
            <p class="cta-sub">{{ $t('landing_home_cta_subtitle') }}</p>
            <div class="cta-actions cta-actions--single">
              <router-link to="/contact" class="cta-primary btn-primary">
                <font-awesome-icon class="btn-icon" :icon="['fas', 'inbox']" aria-hidden="true" />
                <span>Solicitar demo</span>
              </router-link>
            </div>
          </div>
          <aside class="cta-aside">
            <h3 class="cta-aside-title">{{ $t('landing_home_cta_promo_col1_title') }}</h3>
            <p class="cta-aside-text">{{ $t('landing_home_cta_promo_col1_text1') }}</p>
            <router-link to="/productos/dashcole" class="cta-aside-link">
              <span>{{ $t('landing_home_cta_more') }}</span>
              <span aria-hidden="true">›</span>
            </router-link>
          </aside>
        </div>
      </section>
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
    faHeadphones,
    faTag,
    faBox,
  } from '@fortawesome/free-solid-svg-icons'
  import {
    faStripe,
    faApplePay,
    faGooglePay,
    faPaypal,
    faCcVisa,
    faCcMastercard,
    faAlipay,
    faWeixin,
    faCcAmex,
    faVuejs,
    faNodeJs,
    faAws,
    faOpenai,
    faGithub,
    faSalesforce,
    faSlack,
    faDocker,
    faGoogle,
    faMicrosoft,
    faPython,
    faPhp,
    faJava,
    faJs,
    faRust,
  } from '@fortawesome/free-brands-svg-icons'
  import { faDatabase, faMicrochip } from '@fortawesome/free-solid-svg-icons'
  library.add(
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
    faHeadphones,
    faTag,
    faBox,
    faStripe,
    faApplePay,
    faGooglePay,
    faPaypal,
    faCcVisa,
    faCcMastercard,
    faAlipay,
    faWeixin,
    faCcAmex,
    faVuejs,
    faNodeJs,
    faAws,
    faOpenai,
    faGithub,
    faSalesforce,
    faSlack,
    faDocker,
    faGoogle,
    faMicrosoft,
    faPython,
    faPhp,
    faJava,
    faJs,
    faRust,
    faDatabase,
    faMicrochip
  )

  export default {
    name: 'LandingPage',
    components: {
      FontAwesomeIcon,
      Header,
      Footer,
      FlowLines,
    },
    setup() {
      const { t, locale } = useI18n()
      const authStore = useAuthStore()
      const router = useRouter()
      const scrollTriggers = []
      const showAdminMenu = ref(false)
      const selectedCountry = ref('cl')
      const selectedFinancialTab = ref('transactions')
      const currentDashboardView = ref('dashboard')
      const activeIntegrationKey = ref(null)
      const modalViewportTop = ref(0)
      const heroSearchQueries = computed(() => [
        t('landing_home_demo_query_1'),
        t('landing_home_demo_query_2'),
        t('landing_home_demo_query_3')
      ])
      const heroSearchIndex = ref(0)
      const heroTypedQuery = ref('')
      const heroSearchLoading = ref(false)
      let heroSearchPhaseTimer = null
      let heroSearchTypingTimer = null

      const startHeroSearchPhase = (queryIndex = heroSearchIndex.value) => {
        const query = heroSearchQueries.value[queryIndex]
        heroSearchIndex.value = queryIndex
        heroTypedQuery.value = ''
        heroSearchLoading.value = false
        let characterIndex = 0

        clearTimeout(heroSearchPhaseTimer)
        clearInterval(heroSearchTypingTimer)
        heroSearchTypingTimer = setInterval(() => {
          characterIndex += 1
          heroTypedQuery.value = query.slice(0, characterIndex)
          if (characterIndex >= query.length - 2) {
            heroSearchLoading.value = true
          }
          if (characterIndex >= query.length) {
            clearInterval(heroSearchTypingTimer)
            heroSearchTypingTimer = null

            // Let the completed query and caret breathe before refreshing results.
            heroSearchPhaseTimer = setTimeout(() => {
              heroSearchLoading.value = false

              // Keep the matching results visible before beginning the next search.
              heroSearchPhaseTimer = setTimeout(() => {
                const nextIndex = (queryIndex + 1) % heroSearchQueries.value.length
                startHeroSearchPhase(nextIndex)
              }, 1900)
            }, 700)
          }
        }, 82)
      }
      const integrationModalContent = {
        github: {
          badge: t('landing_home_modal_github_badge'),
          title: t('landing_home_integration_github'),
          icon: ['fas', 'users'],
          summary: t('landing_home_modal_github_summary'),
          steps: [
            t('landing_home_modal_github_step1'),
            t('landing_home_modal_github_step2'),
            t('landing_home_modal_github_step3'),
          ],
          cta: t('landing_home_modal_github_cta'),
        },
        stripe: {
          badge: t('landing_home_modal_stripe_badge'),
          title: t('landing_home_integration_stripe'),
          icon: ['fas', 'chart-line'],
          summary: t('landing_home_modal_stripe_summary'),
          steps: [
            t('landing_home_modal_stripe_step1'),
            t('landing_home_modal_stripe_step2'),
            t('landing_home_modal_stripe_step3'),
          ],
          cta: t('landing_home_modal_stripe_cta'),
        },
        paypal: {
          badge: t('landing_home_modal_paypal_badge'),
          title: t('landing_home_integration_paypal'),
          icon: ['fas', 'hand-pointer'],
          summary: t('landing_home_modal_paypal_summary'),
          steps: [
            t('landing_home_modal_paypal_step1'),
            t('landing_home_modal_paypal_step2'),
            t('landing_home_modal_paypal_step3'),
          ],
          cta: t('landing_home_modal_paypal_cta'),
        },
        aws: {
          badge: t('landing_home_modal_aws_badge'),
          title: t('landing_home_integration_aws'),
          icon: ['fas', 'file-invoice'],
          summary: t('landing_home_modal_aws_summary'),
          steps: [
            t('landing_home_modal_aws_step1'),
            t('landing_home_modal_aws_step2'),
            t('landing_home_modal_aws_step3'),
          ],
          cta: t('landing_home_modal_aws_cta'),
        },
        openai: {
          badge: t('landing_home_modal_openai_badge'),
          title: t('landing_home_integration_openai'),
          icon: ['fas', 'envelope'],
          summary: t('landing_home_modal_openai_summary'),
          steps: [
            t('landing_home_modal_openai_step1'),
            t('landing_home_modal_openai_step2'),
            t('landing_home_modal_openai_step3'),
          ],
          cta: t('landing_home_modal_openai_cta'),
        },
        twilio: {
          badge: t('landing_home_modal_twilio_badge'),
          title: t('landing_home_integration_twilio'),
          icon: ['fas', 'chart-bar'],
          summary: t('landing_home_modal_twilio_summary'),
          steps: [
            t('landing_home_modal_twilio_step1'),
            t('landing_home_modal_twilio_step2'),
            t('landing_home_modal_twilio_step3'),
          ],
          cta: t('landing_home_modal_twilio_cta'),
        },
        php: {
          badge: 'Backend Integration',
          title: 'PHP',
          icon: ['fab', 'php'],
          summary:
            'Use PHP SDK patterns to index records and serve low-latency search APIs for content-heavy apps.',
          steps: [
            'Install your PHP client and configure secure API credentials.',
            'Map entities into dashcole schema fields for filters and ranking.',
            'Schedule incremental sync jobs to keep search data fresh.',
          ],
          cta: 'Ship production search in your PHP stack with minimal glue code.',
        },
        perl: {
          badge: 'Backend Integration',
          title: 'Perl',
          icon: ['fas', 'code'],
          summary:
            'Connect legacy and modern Perl services to a fast, open-source search layer with structured indexing.',
          steps: [
            'Connect service endpoints and extract domain data from Perl pipelines.',
            'Transform output to normalized searchable documents.',
            'Automate index refresh with batch or event-driven updates.',
          ],
          cta: 'Modernize search in existing Perl systems without rewriting your core app.',
        },
        java: {
          badge: 'Backend Integration',
          title: 'Java',
          icon: ['fab', 'java'],
          summary:
            'Power enterprise Java services with relevance-tuned search, filters, and scalable indexing workflows.',
          steps: [
            'Use Java service layers to publish documents into dashcole collections.',
            'Apply analyzers and ranking rules for accurate enterprise retrieval.',
            'Expose search endpoints for web, mobile, and internal tools.',
          ],
          cta: 'Add enterprise-grade search to Java applications with predictable performance.',
        },
        cpp: {
          badge: 'System Integration',
          title: 'C++',
          icon: ['fas', 'microchip'],
          summary:
            'Integrate high-performance C++ services with a flexible search backend for real-time query workloads.',
          steps: [
            'Create lightweight ingestion adapters from C++ services.',
            'Stream structured payloads into indexed collections.',
            'Tune relevance and caching for low-latency responses.',
          ],
          cta: 'Combine C++ speed with an open search engine built for real projects.',
        },
        javascript: {
          badge: 'Fullstack Integration',
          title: 'JavaScript',
          icon: ['fab', 'js'],
          summary:
            'Build end-to-end search features from Node.js backends to browser UI with one consistent query model.',
          steps: [
            'Connect Node APIs to dashcole indexing and search endpoints.',
            'Render live search UI with facets, highlights, and ranking controls.',
            'Keep data synced via webhooks and scheduled refresh tasks.',
          ],
          cta: 'Launch modern search UX quickly across your JavaScript stack.',
        },
        rust: {
          badge: 'System Integration',
          title: 'Rust',
          icon: ['fab', 'rust'],
          summary:
            'Use Rust services for reliable, high-throughput data pipelines feeding dashcole search collections.',
          steps: [
            'Build Rust connectors for ingestion from APIs, files, and databases.',
            'Validate and serialize documents into consistent schemas.',
            'Deploy background workers for continuous index freshness.',
          ],
          cta: 'Pair Rust reliability with fast, flexible open-source search.',
        },
        python: {
          badge: 'Data Integration',
          title: 'Python',
          icon: ['fab', 'python'],
          summary:
            'Index data from Python apps, ETL jobs, and ML workflows to deliver searchable product and content experiences.',
          steps: [
            'Use Python jobs to gather and enrich source data before indexing.',
            'Send normalized documents and vectors into dashcole collections.',
            'Orchestrate sync and relevance experiments with simple scripts.',
          ],
          cta: 'Turn Python data workflows into customer-ready search experiences.',
        },
        fallback: {
          badge: t('landing_home_modal_fallback_badge'),
          title: t('landing_home_modal_fallback_title'),
          icon: ['fas', 'plug'],
          summary: t('landing_home_modal_fallback_summary'),
          steps: [
            t('landing_home_modal_fallback_step1'),
            t('landing_home_modal_fallback_step2'),
            t('landing_home_modal_fallback_step3'),
          ],
          cta: t('landing_home_modal_fallback_cta'),
        },
      }
      const integrationModalFallback = {
        badge: t('landing_home_modal_fallback_badge'),
        title: t('landing_home_modal_fallback_title'),
        icon: ['fas', 'plug'],
        summary: t('landing_home_modal_fallback_summary'),
        steps: [
          t('landing_home_modal_fallback_step1'),
          t('landing_home_modal_fallback_step2'),
          t('landing_home_modal_fallback_step3'),
        ],
        cta: t('landing_home_modal_fallback_cta'),
      }
      const enrichStep = (step) => {
        const value = String(step || '').trim()
        if (!value) return ''
        return value
      }
      const integrationModalData = computed(() => {
        const modal = integrationModalContent[activeIntegrationKey.value] || {}
        const steps = (
          Array.isArray(modal.steps) && modal.steps.length
            ? modal.steps
            : integrationModalFallback.steps
        ).map(enrichStep)
        return {
          badge: modal.badge || integrationModalFallback.badge,
          title: modal.title || integrationModalFallback.title,
          icon: modal.icon || integrationModalFallback.icon,
          summary: modal.summary || integrationModalFallback.summary,
          steps,
          cta: modal.cta || integrationModalFallback.cta,
        }
      })
      const searchQueries = [
        'products_index',
        'support_articles',
      ]
      const searchSuggestionPools = [
        [
          { text: 'products_index collection', icon: ['fas', 'database'] },
          { text: 'search products_index documents', icon: ['fas', 'magnifying-glass'] },
          { text: 'create product catalog collection', icon: ['fas', 'box'] },
        ],
        [
          { text: 'support_articles collection', icon: ['fas', 'file-invoice'] },
          { text: 'hybrid search support docs', icon: ['fas', 'bolt'] },
          { text: 'tune synonyms for support queries', icon: ['fas', 'chart-line'] },
        ],
      ]
      const searchResultPools = [
        [
          {
            title: 'products_index',
            snippet: 'Primary product catalog collection, ready for lexical and hybrid search.',
            source: '/collections/products_index/search',
            score: '98%',
            scoreLabel: '0.98',
            badge: '1.2M docs',
            icon: ['fas', 'database'],
          },
          {
            title: 'bench_products_5100_1',
            snippet: 'Benchmark collection from the live demo, useful for latency checks.',
            source: 'localhost:9200 · collection',
            score: '91%',
            scoreLabel: '0.91',
            badge: '2,500 docs',
            icon: ['fas', 'bolt'],
          },
          {
            title: 'product_synonyms',
            snippet: 'Ranking helper data for matching product language and aliases.',
            source: 'relevance tools',
            score: '88%',
            scoreLabel: '0.88',
            badge: 'Synonyms',
            icon: ['fas', 'plug'],
          },
        ],
        [
          {
            title: 'support_articles',
            snippet: 'Support knowledge base indexed for exact keyword and semantic retrieval.',
            source: '/collections/support_articles/search',
            score: '97%',
            scoreLabel: '0.97',
            badge: '186k docs',
            icon: ['fas', 'file-invoice'],
          },
          {
            title: 'docs_index',
            snippet: 'Developer docs collection used by REST examples and client guides.',
            source: 'docs.hlquery.com · indexed',
            score: '92%',
            scoreLabel: '0.92',
            badge: 'Hybrid',
            icon: ['fas', 'code'],
          },
          {
            title: 'stopword_rules',
            snippet: 'Search tuning rules applied before query execution.',
            source: 'relevance tools',
            score: '86%',
            scoreLabel: '0.86',
            badge: 'Tunable',
            icon: ['fas', 'gear'],
          },
        ],
      ]
      const currentSearchQuery = ref(searchQueries[0])
      const currentSearchSuggestions = ref(searchSuggestionPools[0])
      const typedSearchQuery = ref('')
      const displayedSearchResults = ref(searchResultPools[0])
      const searchLatency = ref(12)
      const searchResultCount = ref(3)
      const activeSourceIndex = ref(0)
      let searchDemoTimer = null
      let searchTypingTimer = null
      let searchLatencyTimer = null
      let activeSearchQueryIndex = 0

      const highlightSearchText = (input) => {
        const text = String(input || '')
        const terms = currentSearchQuery.value
          .split(/\s+/)
          .map((term) => term.trim())
          .filter((term) => term.length > 3)
        if (!terms.length) return text

        let highlighted = text
        terms.forEach((term) => {
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          highlighted = highlighted.replace(new RegExp(`(${escaped})`, 'ig'), '<mark>$1</mark>')
        })
        return highlighted
      }

      const openIntegrationModal = (integrationKey) => {
        modalViewportTop.value = Number(
          window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0
        )
        activeIntegrationKey.value = integrationModalContent[integrationKey]
          ? integrationKey
          : 'fallback'
      }

      const isIntegrationSelected = (integrationKey) =>
        activeIntegrationKey.value === integrationKey

      const closeIntegrationModal = () => {
        activeIntegrationKey.value = null
      }

      const modalScrollKeys = new Set([
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        ' ',
        'Spacebar',
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

      watch(activeIntegrationKey, (value) => {
        if (value) {
          lockModalScroll()
        } else {
          unlockModalScroll()
        }
      })

      const runSearchDemoCycle = (index) => {
        const query = searchQueries[index]
        currentSearchQuery.value = query
        currentSearchSuggestions.value = searchSuggestionPools[index]
        typedSearchQuery.value = ''
        displayedSearchResults.value = searchResultPools[index]
        searchResultCount.value = searchResultPools[index].length
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
          }, 2600)
        }, 58)
      }

      // Terminal Typed.js instance
      const terminalTyped = ref(null)
      let typedInstance = null

      const getTerminalContent = () => [
        `<span class="terminal-prompt">$</span> <span class="terminal-request">curl -H "X-API-Key: hlq_dev" http://localhost:9200/collections</span><br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"collections": ["products", "docs"],<br>&nbsp;&nbsp;"count": 2<br>}</span>`,
        `<span class="terminal-prompt">$</span> <span class="terminal-request">curl -X POST http://localhost:9200/collections/products/documents \\<br>&nbsp;&nbsp;&nbsp;&nbsp;-H "Content-Type: application/json" \\<br>&nbsp;&nbsp;&nbsp;&nbsp;-d '{"id":"prod_123","title":"${t('landing_api_terminal_product_name')}"}'</span><br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"id": "prod_123",<br>&nbsp;&nbsp;"status": "${t('landing_api_terminal_order_status_completed')}"<br>}</span>`,
        `<span class="terminal-prompt">$</span> <span class="terminal-request">curl "http://localhost:9200/collections/products/documents/search?q=laptop"</span><br><br><span class="terminal-response">{<br>&nbsp;&nbsp;"${t('landing_api_terminal_key_total_revenue')}": 1,<br>&nbsp;&nbsp;"${t('landing_api_terminal_key_orders')}": [{ "id": "prod_123", "score": 1.09 }],<br>&nbsp;&nbsp;"${t('landing_api_terminal_key_avg_order_value')}": 2.4<br>}</span>`,
      ]

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
          fadeOutDelay: 0,
        })
      }

      watch(
        () => locale.value,
        () => {
          heroSearchIndex.value = 0
          startHeroSearchPhase(0)
          destroyTerminalTyped()
          nextTick(() => {
            initTerminalTyped()
          })
        }
      )

      // Timer for country rotation
      let countryTimer = null
      let typingInterval = null
      let terminalAnimationTimer = null
      const countries = ['us', 'nl', 'cl', 'jp']
      const countryTabLabels = {
        us: 'USA',
        nl: 'Netherlands',
        cl: 'Chile',
        jp: 'Japan',
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
          {
            number: 'INV-002',
            date: 'Jan 20, 2024',
            client: 'Tech Solutions',
            amount: '$3,450.00',
          },
          { number: 'INV-003', date: 'Feb 1, 2024', client: 'Global Inc', amount: '$2,100.00' },
        ],
        nl: [
          { number: 'INV-101', date: '15 Jan 2024', client: 'Euro Corp', amount: '?1,150.00' },
          { number: 'INV-102', date: '20 Jan 2024', client: 'Dutch Tech', amount: '?3,200.00' },
          { number: 'INV-103', date: '1 Feb 2024', client: 'Netherlands Co', amount: '?1,950.00' },
        ],
        cl: [
          { number: 'INV-201', date: '15.01.2024', client: 'Chile Corp', amount: '$450,000 CLP' },
          { number: 'INV-202', date: '20.01.2024', client: 'Tech Chile', amount: '$820,000 CLP' },
          { number: 'INV-203', date: '01.02.2024', client: 'Global CL', amount: '$610,000 CLP' },
        ],
        jp: [
          { number: 'INV-301', date: '2024/01/15', client: 'Tokyo Corp', amount: '?180,000' },
          { number: 'INV-302', date: '2024/01/20', client: 'Osaka Tech', amount: '?450,000' },
          { number: 'INV-303', date: '2024/02/01', client: 'Japan Co', amount: '?320,000' },
        ],
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
            { merchant: 'Konbini', date: 'Nov 12', amount: '?12,493.24', crypto: '4,498.59 USDC' },
          ],
          routingNumber: '424242424',
          accountNumber: '???????? 4242',
          cryptoWallet: '0x ???? dE10',
        },
        nl: {
          balance: '?347,892.18',
          currency: 'EUR',
          transactions: [
            {
              merchant: 'Albert Heijn',
              date: '15 Nov',
              amount: '-?84.50',
              crypto: '3,625.42 USDC',
            },
            { merchant: 'Jumbo', date: '14 Nov', amount: '-?72.30', crypto: '3,712.18 USDC' },
            { merchant: 'Lidl', date: '13 Nov', amount: '-?65.20', crypto: '3,798.50 USDC' },
            { merchant: 'HEMA', date: '12 Nov', amount: '-?45.90', crypto: '3,884.25 USDC' },
          ],
          routingNumber: 'NL91ABNA0417164300',
          accountNumber: '???????? 4300',
          cryptoWallet: '0x ???? aB12',
        },
        cl: {
          balance: '$28,450,000 CLP',
          currency: 'CLP',
          transactions: [
            { merchant: 'Lider', date: '15 Nov', amount: '-$84,500', crypto: '3,625.42 USDC' },
            { merchant: 'Jumbo', date: '14 Nov', amount: '-$72,300', crypto: '3,712.18 USDC' },
            { merchant: 'Unimarc', date: '13 Nov', amount: '-$65,200', crypto: '3,798.50 USDC' },
            { merchant: 'Tottus', date: '12 Nov', amount: '-$45,900', crypto: '3,884.25 USDC' },
          ],
          routingNumber: 'CL123456789',
          accountNumber: '???????? 7890',
          cryptoWallet: '0x ???? cD34',
        },
        jp: {
          balance: '?52,340,000',
          currency: 'JPY',
          transactions: [
            { merchant: '7-Eleven', date: '11/15', amount: '-?8,450', crypto: '3,625.42 USDC' },
            { merchant: 'FamilyMart', date: '11/14', amount: '-?7,230', crypto: '3,712.18 USDC' },
            { merchant: 'Lawson', date: '11/13', amount: '-?6,520', crypto: '3,798.50 USDC' },
            { merchant: 'AEON', date: '11/12', amount: '-?4,590', crypto: '3,884.25 USDC' },
          ],
          routingNumber: 'JP1234567',
          accountNumber: '???????? 5678',
          cryptoWallet: '0x ???? eF56',
        },
      }

      const getFinancialAccountData = (countryCode) => {
        return financialAccountsData[countryCode] || financialAccountsData.us
      }

      // Accounting data by country
      const accountingData = {
        us: {
          currency: '$',
          currencyCode: 'USD',
          totalRevenue: 12745,
          totalExpenses: 8,
          netProfit: 38,
          transactions: [
            {
              date: '2024-11-15',
              description: t('landing_home_accounting_desc_1'),
              category: 'success',
              amount: 1250,
            },
            {
              date: '2024-11-14',
              description: t('landing_home_accounting_desc_2'),
              category: 'issue',
              amount: 32,
            },
            {
              date: '2024-11-13',
              description: t('landing_home_accounting_desc_3'),
              category: 'success',
              amount: 875,
            },
            {
              date: '2024-11-12',
              description: t('landing_home_accounting_desc_4'),
              category: 'issue',
              amount: 4,
            },
          ],
        },
        nl: {
          currency: '€',
          currencyCode: 'EUR',
          totalRevenue: 11523,
          totalExpenses: 6,
          netProfit: 31,
          transactions: [
            {
              date: '2024-11-15',
              description: t('landing_home_accounting_desc_1'),
              category: 'success',
              amount: 1125,
            },
            {
              date: '2024-11-14',
              description: t('landing_home_accounting_desc_2'),
              category: 'issue',
              amount: 28,
            },
            {
              date: '2024-11-13',
              description: t('landing_home_accounting_desc_3'),
              category: 'success',
              amount: 842,
            },
            {
              date: '2024-11-12',
              description: t('landing_home_accounting_desc_4'),
              category: 'issue',
              amount: 3,
            },
          ],
        },
        cl: {
          currency: '$',
          currencyCode: 'CLP',
          totalRevenue: 18450,
          totalExpenses: 7,
          netProfit: 42,
          transactions: [
            {
              date: '2024-11-15',
              description: t('landing_home_accounting_desc_1'),
              category: 'success',
              amount: 2400,
            },
            {
              date: '2024-11-14',
              description: t('landing_home_accounting_desc_2'),
              category: 'issue',
              amount: 18,
            },
            {
              date: '2024-11-13',
              description: t('landing_home_accounting_desc_3'),
              category: 'success',
              amount: 1760,
            },
            {
              date: '2024-11-12',
              description: t('landing_home_accounting_desc_4'),
              category: 'issue',
              amount: 5,
            },
          ],
        },
        jp: {
          currency: '¥',
          currencyCode: 'JPY',
          totalRevenue: 9840,
          totalExpenses: 5,
          netProfit: 27,
          transactions: [
            {
              date: '2024-11-15',
              description: t('landing_home_accounting_desc_1'),
              category: 'success',
              amount: 980,
            },
            {
              date: '2024-11-14',
              description: t('landing_home_accounting_desc_2'),
              category: 'issue',
              amount: 12,
            },
            {
              date: '2024-11-13',
              description: t('landing_home_accounting_desc_3'),
              category: 'success',
              amount: 740,
            },
            {
              date: '2024-11-12',
              description: t('landing_home_accounting_desc_4'),
              category: 'issue',
              amount: 2,
            },
          ],
        },
      }

      const accountingLocaleConfig = {
        us: {
          locale: 'en-US',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          dateOptions: { year: 'numeric', month: 'short', day: 'numeric' },
        },
        nl: {
          locale: 'nl-NL',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          dateOptions: { day: '2-digit', month: 'long', year: 'numeric' },
        },
        cl: {
          locale: 'es-CL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          dateOptions: { day: '2-digit', month: '2-digit', year: 'numeric' },
        },
        jp: {
          locale: 'ja-JP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          dateOptions: { year: 'numeric', month: 'long', day: 'numeric' },
        },
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
          signDisplay: options.signDisplay || 'auto',
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
        const signedAmount =
          category === 'issue' ? -Math.abs(numericAmount) : Math.abs(numericAmount)
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
          const x = 20 + i * spacing
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
        chartPoints.value.forEach((point) => {
          point.x -= 0.5
        })

        // Add new point on the right (less frequent)
        if (chartPoints.value[0].x < -20) {
          chartPoints.value.shift()
          const newY = 100 + (Math.random() * 40 - 20)
          chartPoints.value.push({ x: 400, y: newY })
        }

        // Update Y values slightly for animation (much less variation)
        chartPoints.value.forEach((point) => {
          point.y += Math.random() * 0.5 - 0.25
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
        { x: 100, y: 12 },
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
        growthChartPoints.value.forEach((point) => {
          point.x -= 0.08
        })

        // Always ensure we have points covering 0-100 range
        const firstVisiblePoint = growthChartPoints.value.find((p) => p.x >= 0)
        const lastVisiblePoint = growthChartPoints.value[growthChartPoints.value.length - 1]

        // If we're running out of points on the left, shift all points to start from 0
        if (!firstVisiblePoint || firstVisiblePoint.x > 5) {
          // Reset all points to start from 0, maintaining relative spacing
          const minX = Math.min(...growthChartPoints.value.map((p) => p.x))
          const offset = 0 - minX
          growthChartPoints.value.forEach((point) => {
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
        growthChartPoints.value = growthChartPoints.value.filter((p) => p.x > -10)

        // Keep reasonable number of points (15-20 for smooth curve)
        if (growthChartPoints.value.length > 20) {
          // Remove oldest points (leftmost)
          growthChartPoints.value.sort((a, b) => a.x - b.x)
          growthChartPoints.value.shift()
        }

        // Very subtle variation in Y values for natural movement (much slower)
        growthChartPoints.value.forEach((point) => {
          if (point.x >= 0 && point.x <= 100) {
            point.y += Math.random() * 0.08 - 0.04 // Much smaller variation
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
          const variation = Math.random() * 0.5 - 0.25 // ±0.25 variation (más pequeña)
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
          maximumFractionDigits: 0,
        }).format(value)
      }

      // Watch for auth changes
      watch(
        () => authStore.isAuthenticated,
        (newVal) => {
          // Force reactivity update if auth state changes
        }
      )
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
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          startHeroSearchPhase()
        } else {
          heroTypedQuery.value = heroSearchQueries.value[0]
        }

        // Initialize terminal Typed.js animation
        nextTick(() => {
          initTerminalTyped()
        })

        // Start country rotation timer
        countryTimer = setInterval(rotateCountry, 3000) // Change every 3 seconds

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
            attributeFilter: ['class'],
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
          ease: 'power3.out',
        })

        gsap.from('.hero-description', {
          duration: 1,
          y: 50,
          opacity: 0,
          delay: 0.3,
          ease: 'power3.out',
        })

        gsap.from('.hero-actions', {
          duration: 1,
          y: 30,
          opacity: 0,
          delay: 0.6,
          ease: 'power3.out',
        })

        // Floating orbs animation
        gsap.to('.orb-1', {
          duration: 20,
          x: 100,
          y: -100,
          rotation: 360,
          repeat: -1,
          ease: 'none',
        })

        gsap.to('.orb-2', {
          duration: 25,
          x: -150,
          y: 80,
          rotation: -360,
          repeat: -1,
          ease: 'none',
        })

        gsap.to('.orb-3', {
          duration: 30,
          x: 200,
          y: -50,
          rotation: 180,
          repeat: -1,
          ease: 'none',
        })

        // Feature cards - NO animations, appear automatically
        const featureCards = gsap.utils.toArray('.feature-card')

        // Set cards to be immediately visible with no animations
        if (featureCards.length > 0) {
          gsap.set(featureCards, {
            opacity: 1,
            y: 0,
            scale: 1,
            visibility: 'visible',
          })

          // Icons appear immediately with cards - no animations
          featureCards.forEach((card) => {
            const icon = card.querySelector('.feature-icon')
            if (icon) {
              gsap.set(icon, {
                opacity: 1,
                scale: 1,
                rotation: 0,
                visibility: 'visible',
              })
            }
          })
        }

        // Home hero visual animation
        gsap.from('.home-hero-search-visual', {
          duration: 1.5,
          scale: 0.8,
          opacity: 0,
          delay: 0.5,
          ease: 'power3.out',
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
              setTimeout(
                () => {
                  bar.style.transition = 'height 0.6s ease-out, opacity 0.3s ease-out'
                  bar.style.height = originalHeightPercent
                  bar.style.opacity = '1'
                },
                100 + index * 80
              )
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
                scrollTrigger: undefined,
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
              start: 'top 80%',
            },
          })

          animateElement('.global-scale-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            delay: 0.2,
            scrollTrigger: {
              trigger: '.global-scale-section',
              start: 'top 80%',
            },
            ease: 'power3.out',
          })

          animateElement('.global-scale-description', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            delay: 0.4,
            scrollTrigger: {
              trigger: '.global-scale-section',
              start: 'top 80%',
            },
            ease: 'power2.out',
          })

          // Animate dashboard card
          animateElement('.dashboard-card', {
            duration: 1.2,
            y: 50,
            opacity: 0,
            delay: 0.3,
            scrollTrigger: {
              trigger: '.global-data-section',
              start: 'top 80%',
            },
            ease: 'power3.out',
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
                  start: 'top 80%',
                },
                ease: 'back.out(1.7)',
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
                  once: true,
                },
                onUpdate: function () {
                  // Format the number based on the unit
                  if (unit === 'M+') {
                    element.textContent = Math.round(counter.value)
                  } else if (unit === '%') {
                    element.textContent = counter.value.toFixed(1)
                  } else {
                    element.textContent = Math.round(counter.value)
                  }
                },
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
                  start: 'top 80%',
                },
                ease: 'power2.out',
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
            ease: 'power1.inOut',
          })

          gsap.to('.global-orb-2', {
            duration: 20,
            x: -180,
            y: 120,
            scale: 0.8,
            rotation: -360,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          })

          gsap.to('.global-orb-3', {
            duration: 18,
            x: 150,
            y: 200,
            scale: 1.1,
            rotation: 240,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          })

          gsap.to('.global-orb-4', {
            duration: 22,
            x: -120,
            y: -100,
            scale: 0.9,
            rotation: -240,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
          })

          gsap.to('.global-orb-5', {
            duration: 25,
            x: 100,
            y: 150,
            scale: 1.3,
            rotation: 180,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut',
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
        if (heroSearchPhaseTimer) {
          clearTimeout(heroSearchPhaseTimer)
          heroSearchPhaseTimer = null
        }
        if (heroSearchTypingTimer) {
          clearInterval(heroSearchTypingTimer)
          heroSearchTypingTimer = null
        }
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
        scrollTriggers.forEach((trigger) => {
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

      const goToEcommerce = () => {
        router.push('/soluciones/gestion-educacional')
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
        randomHeights,
        showAdminMenu,
        selectedCountry,
        countryTabLabels,
        terminalTyped,
        currentDashboardView,
        currentSearchQuery,
        currentSearchSuggestions,
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
        goToEcommerce,
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
        integrationModalData,
        modalViewportTop,
        activeIntegrationKey,
        heroSearchIndex,
        heroTypedQuery,
        heroSearchLoading,
        openIntegrationModal,
        isIntegrationSelected,
        closeIntegrationModal,
      }
    },
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
    background: var(--hero-bg-color);
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
    background: #021c34 !important; /* Override inherit for dark blue background */
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
    padding: 2rem 0 2rem 0;
    margin-top: 0;
    background: transparent;
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
  .hero-section *[style*='position: absolute'],
  .hero-section *[style*='position:fixed'] {
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
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
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
    0%,
    100% {
      transform: translate3d(0, 0, 0) rotateX(0deg);
    }
    50% {
      transform: translate3d(0, -5px, 12px) rotateX(-0.6deg);
    }
  }

  @keyframes heroTitleSheen {
    0%,
    35% {
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
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
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
    0%,
    100% {
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

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.9rem 1.9rem;
    border-radius: 14px;
    font-weight: 600;
    font-size: 1rem;
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      background 0.25s ease;
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

  .btn-primary .btn-browser-icon {
    fill: none !important;
  }

  .btn-primary .btn-browser-icon * {
    fill: none !important;
    stroke: currentColor !important;
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
    box-shadow:
      0 34px 72px rgba(15, 23, 42, 0.16),
      0 10px 28px rgba(15, 23, 42, 0.08) !important;
    position: relative !important;
    overflow: hidden !important;
    max-width: 760px;
    width: 100%;
    transform: scale(0.99) !important;
  }

  /* tone down animated borders */
  .dashboard-preview::before,
  .dashboard-preview::after {
    display: none !important;
  }

  .preview-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
    padding: 0;
  }

  /* make links look like items */
  .preview-sidebar a.sidebar-item {
    text-decoration: none;
    color: inherit;
  }

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

  .preview-title {
    display: none;
  }

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
    box-shadow:
      0 8px 24px rgba(15, 23, 42, 0.4),
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
    box-shadow:
      0 18px 44px rgba(15, 23, 42, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.82);
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
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
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
    0%,
    49% {
      opacity: 1;
    }
    50%,
    100% {
      opacity: 0;
    }
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
    transition:
      height 0.8s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s ease !important;
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
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-2 {
    background: linear-gradient(to top, #3b82f6, #2563eb, #1d4ed8) !important;
    border-color: rgba(59, 130, 246, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-3 {
    background: linear-gradient(to top, #10b981, #059669, #047857) !important;
    border-color: rgba(16, 185, 129, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(16, 185, 129, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-4 {
    background: linear-gradient(to top, #f59e0b, #d97706, #b45309) !important;
    border-color: rgba(245, 158, 11, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(245, 158, 11, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-5 {
    background: linear-gradient(to top, #3b82f6, #2563eb, #1e40af) !important;
    border-color: rgba(14, 165, 233, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(14, 165, 233, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-6 {
    background: linear-gradient(to top, #ec4899, #db2777, #be185d) !important;
    border-color: rgba(236, 72, 153, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(236, 72, 153, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
  }

  .chart-bar.bar-7 {
    background: linear-gradient(to top, #06b6d4, #0891b2, #0e7490) !important;
    border-color: rgba(6, 182, 212, 0.25) !important;
    box-shadow:
      0 2px 8px rgba(6, 182, 212, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
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
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.9) 100%
    );
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
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.9) 100%
    );
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
    0%,
    100% {
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
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(248, 250, 252, 0.9) 100%
    ) !important;
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
    background: linear-gradient(
      90deg,
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
    background: linear-gradient(
      90deg,
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
    0%,
    100% {
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
    0%,
    100% {
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
    background: linear-gradient(
      145deg,
      rgba(248, 250, 252, 0.95) 0%,
      rgba(226, 232, 240, 0.95) 100%
    );
    border: 1px solid rgba(148, 163, 184, 0.25);
    box-shadow:
      inset 1px 1px 2px rgba(255, 255, 255, 0.9),
      inset -1px -1px 2px rgba(148, 163, 184, 0.35),
      8px 12px 24px rgba(148, 163, 184, 0.18);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease,
      background 0.25s ease;
    position: relative;
  }

  .feature-icon::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 11px;
    background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.65) 0%,
      rgba(226, 232, 240, 0.2) 100%
    );
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
    transition:
      transform 0.25s ease,
      filter 0.25s ease,
      color 0.25s ease;
    shape-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    position: relative;
    z-index: 1;
  }

  .feature-card {
    --feature-card-bg:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.28) 0%,
        rgba(255, 255, 255, 0.04) 18%,
        rgba(255, 255, 255, 0) 34%
      ),
      linear-gradient(160deg, #ffffff 0%, #f8fafc 100%);
    --feature-card-border: rgba(148, 163, 184, 0.22);
    --feature-card-topbar: linear-gradient(90deg, #0f172a 0%, #334155 100%);
    --feature-icon-bg: linear-gradient(
      145deg,
      rgba(248, 250, 252, 0.95) 0%,
      rgba(226, 232, 240, 0.95) 100%
    );
    --feature-icon-color: #1f2937;
    --feature-title-color: #111827;
    --feature-description-color: #334155;
    background: var(--feature-card-bg) !important;
    border: 1px solid rgba(148, 163, 184, 0.22) !important;
    border-top: none !important;
    border-radius: 16px !important;
    padding: 42px !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow:
      0 22px 42px rgba(37, 99, 235, 0.12),
      0 10px 22px rgba(15, 23, 42, 0.08),
      0 2px 6px rgba(15, 23, 42, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.85) !important;
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
    display: block;
  }

  .feature-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow:
      0 30px 56px rgba(37, 99, 235, 0.16),
      0 16px 28px rgba(15, 23, 42, 0.1),
      0 4px 12px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.92) !important;
    border-color: rgba(96, 165, 250, 0.34) !important;
  }

  .feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--feature-card-topbar) !important;
    border-radius: 16px 16px 0 0;
  }

  .feature-card::after {
    content: '';
    position: absolute;
    inset: 1px;
    border-radius: 15px;
    background:
      linear-gradient(
        140deg,
        rgba(255, 255, 255, 0.44) 0%,
        rgba(255, 255, 255, 0.12) 18%,
        rgba(255, 255, 255, 0) 42%
      ),
      radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 42%);
    pointer-events: none;
    opacity: 0.9;
  }

  .feature-card:nth-child(odd) {
    background: var(--feature-card-bg) !important;
    border-color: var(--feature-card-border) !important;
  }

  .feature-card:nth-child(odd)::before {
    background: var(--feature-card-topbar) !important;
  }

  .feature-card:nth-child(even) {
    background: var(--feature-card-bg) !important;
    border-color: var(--feature-card-border) !important;
  }

  .feature-card:nth-child(even)::before {
    background: var(--feature-card-topbar) !important;
  }

  .features-grid .feature-card {
    --feature-card-bg:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.62) 0%,
        rgba(255, 255, 255, 0.22) 20%,
        rgba(255, 255, 255, 0.04) 46%
      ),
      linear-gradient(
        220deg,
        rgba(226, 232, 240, 0.24) 0%,
        rgba(226, 232, 240, 0.06) 42%,
        rgba(226, 232, 240, 0) 66%
      ),
      linear-gradient(160deg, #fcfdff 0%, #f1f5f9 54%, #e2e8f0 100%);
    --feature-card-border: rgba(148, 163, 184, 0.24);
    --feature-card-topbar: linear-gradient(90deg, #cbd5e1 0%, #94a3b8 52%, #cbd5e1 100%);
    --feature-icon-bg: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(226, 232, 240, 0.97) 50%,
      rgba(203, 213, 225, 0.95) 100%
    );
    --feature-icon-color: #334155;
    --feature-title-color: #000000;
    --feature-description-color: #000000;
  }

  .features-grid .feature-card .feature-icon {
    background: var(--feature-icon-bg);
  }

  .features-grid .feature-card .feature-icon svg {
    color: var(--feature-icon-color);
  }

  .features-grid .feature-card:nth-child(1) {
    --feature-icon-color: #2563eb;
  }
  .features-grid .feature-card:nth-child(2) {
    --feature-icon-color: #0f766e;
  }
  .features-grid .feature-card:nth-child(3) {
    --feature-icon-color: #0369a1;
  }
  .features-grid .feature-card:nth-child(4) {
    --feature-icon-color: #c2410c;
  }
  .features-grid .feature-card:nth-child(5) {
    --feature-icon-color: #b91c1c;
  }
  .features-grid .feature-card:nth-child(6) {
    --feature-icon-color: #0369a1;
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
    transition:
      transform 0.25s ease,
      filter 0.25s ease;
  }

  .feature-card:hover .feature-icon {
    transform: translateY(-4px);
    background: var(--feature-icon-bg);
  }

  .feature-card:hover .feature-icon svg,
  .feature-card:hover .feature-icon-img {
    transform: translateY(-1px) scale(1.04);
    filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.22));
  }

  .feature-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--feature-title-color);
    margin-bottom: 0.75rem;
    font-family: var(--font-family-sohne);
    letter-spacing: -0.025em;
    position: relative;
    z-index: 2;
  }

  .feature-description {
    color: var(--feature-description-color);
    line-height: 1.6;
    font-family: var(--font-family-sohne);
    font-weight: 400;
    letter-spacing: -0.01em;
    opacity: 1;
    font-size: 0.95rem;
    position: relative;
    z-index: 2;
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
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.6) 0%,
      rgba(14, 165, 233, 0.4) 50%,
      transparent 70%
    );
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .global-orb-2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(59, 130, 246, 0.5) 0%,
      rgba(37, 99, 235, 0.3) 50%,
      transparent 70%
    );
    top: 50%;
    right: 15%;
    animation-delay: 0.8s;
  }

  .global-orb-3 {
    width: 450px;
    height: 450px;
    background: radial-gradient(
      circle,
      rgba(59, 130, 246, 0.5) 0%,
      rgba(14, 165, 233, 0.3) 50%,
      transparent 70%
    );
    bottom: 15%;
    left: 20%;
    animation-delay: 1.6s;
  }

  .global-orb-4 {
    width: 550px;
    height: 550px;
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.4) 0%,
      rgba(29, 78, 216, 0.3) 50%,
      transparent 70%
    );
    top: 20%;
    right: 30%;
    animation-delay: 2.4s;
  }

  .global-orb-5 {
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(14, 165, 233, 0.5) 0%,
      rgba(3, 105, 161, 0.3) 50%,
      transparent 70%
    );
    bottom: 25%;
    right: 10%;
    animation-delay: 3.2s;
  }

  @keyframes global-orb-pulse {
    0%,
    100% {
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
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid rgba(226, 232, 240, 0.9);
    border-radius: 14px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.08),
      0 1px 2px rgba(0, 0, 0, 0.05);
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

  .step-arrow {
    opacity: 0.9;
  }

  @media (max-width: 900px) {
    .global-step-flow {
      grid-template-columns: 1fr;
    }
    .step-arrow {
      display: none;
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
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.06) 100%
    );
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
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
    .step-arrow {
      display: none;
    }
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
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  @keyframes pulse-inner {
    0%,
    100% {
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
    filter: saturate(1.2);
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
    animation: divisorVibe 16s ease-in-out infinite alternate;
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
    animation: divisorGlide 18s ease-in-out infinite alternate;
  }

  .divisor-rectangle::after {
    content: '';
    position: absolute;
    inset: 18px;
    border-radius: 18px;
    border: 1px dashed rgba(15, 23, 42, 0.22);
    opacity: 0;
    animation: divisorDash 6s linear infinite;
  }

  @keyframes divisorVibe {
    from {
      transform: translateY(-18px) translateX(-25px) rotate(-0.5deg);
      box-shadow:
        0 24px 70px rgba(37, 99, 235, 0.18),
        0 10px 28px rgba(59, 130, 246, 0.12);
    }
    to {
      transform: translateY(-26px) translateX(-35px) rotate(-1.5deg);
      box-shadow:
        0 16px 46px rgba(37, 99, 235, 0.08),
        0 6px 18px rgba(59, 130, 246, 0.09);
    }
  }

  @keyframes divisorGlide {
    from {
      transform: translateY(6px) translateX(24px) rotate(0.5deg);
      box-shadow:
        0 24px 70px rgba(37, 99, 235, 0.15),
        0 12px 30px rgba(14, 165, 233, 0.12);
    }
    to {
      transform: translateY(14px) translateX(36px) rotate(1.5deg);
      box-shadow:
        0 16px 46px rgba(37, 99, 235, 0.08),
        0 6px 18px rgba(14, 165, 233, 0.09);
    }
  }

  @keyframes divisorDash {
    0% {
      opacity: 0;
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  .simple-pricing{padding:88px 24px;background:#f4f9fd}.simple-pricing-card{max-width:960px;margin:auto;padding:56px;border:1px solid #cfe4f2;border-radius:28px;text-align:center;background:linear-gradient(145deg,#fff,#eaf6fd);box-shadow:0 22px 60px rgba(10,37,64,.12)}.simple-pricing-kicker{color:#0067b2;font-size:12px;font-weight:800;letter-spacing:.16em}.simple-pricing h2{margin:12px 0;color:#0a2540;font-size:clamp(34px,5vw,58px);letter-spacing:-.045em}.simple-pricing p{max-width:700px;margin:0 auto 26px;color:#526b7e;font-size:17px;line-height:1.65}.simple-pricing-button{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:12px;color:#fff;background:#0067b2;font-weight:750;text-decoration:none;box-shadow:0 12px 28px rgba(0,103,178,.25)}.simple-pricing-button:hover{background:#075f98;transform:translateY(-2px)}
  @media(max-width:600px){.simple-pricing{padding:54px 16px}.simple-pricing-card{padding:34px 20px}}

  /* CTA Section */
  .landing-page > section.cta-section {
    position: relative;
    z-index: 2; /* Ensure CTA section is above revenue banner */
    background: #021c34;
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

  .landing-page > section.cta-section::before {
    top: 0;
  }

  .landing-page > section.cta-section::after {
    bottom: 0;
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
    color: #ffffff;
  }

  .cta-sub {
    color: rgba(255, 255, 255, 0.82);
    margin: 0 0 20px;
    max-width: 560px;
  }

  .cta-actions {
    display: flex;
    gap: 14px;
    align-items: center;
    flex-wrap: wrap;
  }

  .landing-page .cta-actions .cta-primary,
  .landing-page .cta-actions .cta-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.44rem;
    text-decoration: none;
    font-weight: 600;
    letter-spacing: -0.01em;
    padding: 0.56rem 0.9rem;
    font-size: 0.84rem;
    min-width: auto;
    width: auto;
  }

  .landing-page .cta-btn-left-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.82rem;
    line-height: 1;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .landing-page > section.cta-section .cta-primary {
    background: linear-gradient(135deg, #7cc0ff 0%, #b8dcff 100%);
    box-shadow:
      0 14px 30px rgba(124, 192, 255, 0.4),
      0 6px 16px rgba(184, 220, 255, 0.34);
  }

  .landing-page > section.cta-section .cta-primary:hover {
    background: linear-gradient(135deg, #5aaeff 0%, #8cc9ff 100%);
    box-shadow:
      0 18px 36px rgba(90, 174, 255, 0.42),
      0 10px 22px rgba(140, 201, 255, 0.34);
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
    color: #ffffff;
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
    color: #ffffff;
    margin: 0 0 8px 0;
    letter-spacing: -0.01em;
    font-family: var(--font-family-sohne);
  }

  .cta-promo-text {
    font-size: 0.9375rem;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.72);
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
  .cta-col {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cta-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: rgba(248, 250, 252, 0.18);
    color: #f8fafc;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.26);
    border: 1px solid rgba(226, 232, 240, 0.25);
  }
  .cta-icon svg {
    display: block;
    transform: none;
    flex-shrink: 0;
  }
  .cta-col-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.01em;
    color: #f8fafc;
  }
  .cta-col-text {
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
  }
  .cta-link {
    color: #e0f2fe;
    text-decoration: none;
    font-weight: 600;
  }
  .cta-link:hover {
    text-decoration: underline;
  }

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
      width: auto;
      flex-direction: row !important;
      align-items: center;
      justify-content: flex-start;
      gap: 0.62rem;
      flex-wrap: nowrap;
    }

    .landing-page > section.cta-section .cta-primary,
    .landing-page > section.cta-section .cta-secondary {
      width: auto !important;
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
    .cta-container {
      grid-template-columns: 1fr;
    }
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
    transition:
      transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1);
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

  .api-terminal-body .terminal-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .api-terminal-body .terminal-typed-output {
    font-size: 0.85rem;
    line-height: 1.7;
    color: #0f172a;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
  }

  .api-terminal-body .terminal-prompt {
    color: #059669;
    font-weight: 600;
  }

  .api-terminal-body .terminal-request,
  .api-terminal-body .terminal-response {
    color: #334155;
    display: block;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.7;
  }

  .api-terminal-body .terminal-response {
    margin-top: 0.5rem;
  }

  /* Typed.js cursor styling */
  .typed-cursor {
    color: #0f172a;
    opacity: 1;
    animation: typedjsBlink 0.7s infinite;
    font-weight: 100;
  }

  @keyframes typedjsBlink {
    50% {
      opacity: 0;
    }
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
    .btn-primary,
    .btn-secondary {
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
    color: var(--feature-description-color);
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
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.6) 0%,
      rgba(14, 165, 233, 0.4) 50%,
      transparent 70%
    );
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }

  .global-orb-2 {
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle,
      rgba(59, 130, 246, 0.5) 0%,
      rgba(37, 99, 235, 0.3) 50%,
      transparent 70%
    );
    top: 50%;
    right: 15%;
    animation-delay: 0.8s;
  }

  .global-orb-3 {
    width: 450px;
    height: 450px;
    background: radial-gradient(
      circle,
      rgba(59, 130, 246, 0.5) 0%,
      rgba(14, 165, 233, 0.3) 50%,
      transparent 70%
    );
    bottom: 15%;
    left: 20%;
    animation-delay: 1.6s;
  }

  .global-orb-4 {
    width: 550px;
    height: 550px;
    background: radial-gradient(
      circle,
      rgba(37, 99, 235, 0.4) 0%,
      rgba(29, 78, 216, 0.3) 50%,
      transparent 70%
    );
    top: 20%;
    right: 30%;
    animation-delay: 2.4s;
  }

  .global-orb-5 {
    width: 400px;
    height: 400px;
    background: radial-gradient(
      circle,
      rgba(14, 165, 233, 0.5) 0%,
      rgba(3, 105, 161, 0.3) 50%,
      transparent 70%
    );
    bottom: 25%;
    right: 10%;
    animation-delay: 3.2s;
  }

  @keyframes global-orb-pulse {
    0%,
    100% {
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
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  @keyframes pulse-inner {
    0%,
    100% {
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
    background: #1a2b40;
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
    color: #0f172a;
    padding: 2rem;
    border-radius: 12px;
    background: #f9fafb;
    border: 1px solid rgba(15, 23, 42, 0.08);
    transition: all 0.2s ease;
    box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
  }

  .stripe-feature-card:hover {
    background: #eff3ff;
    border-color: rgba(15, 23, 42, 0.16);
    transform: translateY(-2px);
  }

  .stripe-feature-icon {
    margin-bottom: 1.25rem;
    width: 40px;
    height: 40px;
  }

  .stripe-feature-title {
    font-size: 1.125rem;
    font-weight: 800;
    color: #4b5563;
    margin-bottom: 0.75rem;
    font-family: var(--font-family-sohne);
    letter-spacing: -0.02em;
    float: left;
    width: 100%;
    text-align: left;
  }
  .stripe-feature-description {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: #0f172a;
    font-weight: 600;
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
    background: linear-gradient(
      160deg,
      rgba(15, 23, 42, 0.92) 0%,
      rgba(30, 41, 59, 0.88) 50%,
      rgba(15, 23, 42, 0.95) 100%
    );
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
    background:
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.18) 0%, transparent 55%),
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

  .dev-tool-item:nth-child(1) {
    animation-delay: 0.05s;
  }
  .dev-tool-item:nth-child(2) {
    animation-delay: 0.1s;
  }
  .dev-tool-item:nth-child(3) {
    animation-delay: 0.15s;
  }
  .dev-tool-item:nth-child(4) {
    animation-delay: 0.2s;
  }
  .dev-tool-item:nth-child(5) {
    animation-delay: 0.25s;
  }
  .dev-tool-item:nth-child(6) {
    animation-delay: 0.3s;
  }
  .dev-tool-item:nth-child(7) {
    animation-delay: 0.35s;
  }
  .dev-tool-item:nth-child(8) {
    animation-delay: 0.4s;
  }
  .dev-tool-item:nth-child(9) {
    animation-delay: 0.45s;
  }
  .dev-tool-item:nth-child(10) {
    animation-delay: 0.5s;
  }
  .dev-tool-item:nth-child(11) {
    animation-delay: 0.55s;
  }
  .dev-tool-item:nth-child(12) {
    animation-delay: 0.6s;
  }

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
    color: #4fc08d !important;
  }

  .dev-tool-item .devicon-vitejs-plain {
    color: #646cff !important;
  }

  .dev-tool-item .devicon-tailwindcss-plain {
    color: #38bdf8 !important;
  }

  .dev-tool-item .devicon-nodejs-plain {
    color: #339933 !important;
  }

  .dev-tool-item .devicon-express-original {
    color: #000000 !important;
  }

  .dev-tool-item .devicon-python-plain {
    color: #3776ab !important;
  }

  .dev-tool-item .devicon-redis-plain {
    color: #dc382d !important;
  }

  .dev-tool-item .devicon-mongodb-plain {
    color: #47a248 !important;
  }

  .dev-tool-item .devicon-mysql-plain {
    color: #00758f !important;
  }

  .dev-tool-item .devicon-docker-plain {
    color: #2496ed !important;
  }

  .dev-tool-item .devicon-sequelize-plain {
    color: #52b0e7 !important;
  }

  .dev-tool-item .devicon-flutter-plain {
    color: #02569b !important;
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
    background: #0f172a;
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
    color: #e5e7eb;
  }

  .code-keyword {
    color: #60a5fa;
  }

  .code-variable {
    color: #82aaff;
  }

  .code-operator {
    color: #89ddff;
  }

  .code-string {
    color: #c3e88d;
  }
  .code-function {
    color: #82aaff;
  }

  .code-property {
    color: #82aaff;
  }

  .code-number {
    color: #f78c6c;
  }

  /* Terminal Block */
  .terminal-block {
    background: #0f172a;
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
    color: #4fd1c7;
  }

  .terminal-command {
    color: #e5e7eb;
  }

  .terminal-output {
    color: #4fd1c7;
  }

  .terminal-timestamp {
    color: #73777f;
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
    color: #10b981;
  }

  .terminal-event {
    color: #c3e88d;
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
    color: #87ceeb;
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
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.08),
      0 0 0 1px rgba(59, 130, 246, 0.05);
  }

  .step-card-blue:hover {
    transform: translateY(-4px);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow:
      0 12px 24px rgba(59, 130, 246, 0.15),
      0 0 0 1px rgba(59, 130, 246, 0.1);
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
    border: 1px solid rgba(37, 99, 235, 0.12);
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
    box-shadow:
      0 4px 12px rgba(59, 130, 246, 0.08),
      0 0 0 1px rgba(59, 130, 246, 0.05);
  }

  .gs-card-blue:hover {
    transform: translateY(-4px);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow:
      0 12px 24px rgba(59, 130, 246, 0.15),
      0 0 0 1px rgba(59, 130, 246, 0.1);
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
  .step-icon-1 {
    background: linear-gradient(135deg, #eff6ff, #dbeafe);
  }
  .step-icon-2 {
    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  }
  .step-icon-3 {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  }

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
    .step-arrow {
      display: none;
    }
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
    border: 1px solid rgba(37, 99, 235, 0.12);
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
    .steps-container {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .step-arrow {
      display: none;
    }
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
    0%,
    100% {
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
    background: #061f36 !important;
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
    0%,
    100% {
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
    color: #a8b2bd; /* Light gray */
    margin: 0 0 3rem 0;
    font-family: var(--font-family-sohne);
    font-weight: 400;
  }

  /* Stats Row */
  .global-stats-row {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 560px;
    padding-top: 1.5rem;
  }

  .global-stat-item {
    flex: 1;
    text-align: left;
  }

  .global-stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.9rem;
    color: #e0f2fe;
    font-size: 1rem;
  }

  .global-stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
    font-family: var(--font-family-sohne);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .global-stat-label {
    font-size: 0.9375rem;
    color: #a8b2bd; /* Light gray */
    font-family: var(--font-family-sohne);
    font-weight: 400;
    line-height: 1.4;
  }

  .global-stat-divider {
    width: 1px;
    height: 60px;
    background: rgba(168, 178, 189, 0.2); /* Light gray divider */
    flex-shrink: 0;
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
    background: radial-gradient(
      ellipse at top,
      rgba(148, 163, 184, 0.25),
      rgba(226, 232, 240, 0.05) 60%,
      rgba(226, 232, 240, 0)
    );
    filter: blur(32px);
    opacity: 0.85;
    z-index: 0;
  }

  .global-data-visual::after {
    content: '';
    position: absolute;
    inset: -6%;
    background: linear-gradient(
      135deg,
      rgba(226, 232, 240, 0.35),
      rgba(248, 250, 252, 0.1) 45%,
      rgba(226, 232, 240, 0.25) 85%
    );
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
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
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
    background: #ff5f56;
  }

  .dot-yellow {
    background: #ffbd2e;
  }

  .dot-green {
    background: #27c93f;
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
    0%,
    100% {
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

  .bar:nth-child(1) {
    animation-delay: 0.1s;
  }
  .bar:nth-child(2) {
    animation-delay: 0.2s;
  }
  .bar:nth-child(3) {
    animation-delay: 0.3s;
  }
  .bar:nth-child(4) {
    animation-delay: 0.4s;
  }
  .bar:nth-child(5) {
    animation-delay: 0.5s;
  }
  .bar:nth-child(6) {
    animation-delay: 0.6s;
  }
  .bar:nth-child(7) {
    animation-delay: 0.7s;
  }

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
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .global-data-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
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

    .global-stats-row {
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .global-stat-divider {
      display: none; /* Hide dividers on smaller screens */
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
      clip-path: polygon(
        0 4%,
        100% 0%,
        100% 98%,
        0 100%
      ); /* Adjusted for natural overlap on mobile */
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

    .global-stats-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .global-stat-item {
      width: 100%;
    }

    .global-stat-number {
      font-size: 2rem;
    }

    .globe-container {
      max-width: 100%;
    }
  }
  @media (max-width: 480px) {
    .global-data-title {
      font-size: 1.875rem;
    }

    .global-stat-number {
      font-size: 1.75rem;
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
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.9;
    }
  }

  @keyframes hubInnerPulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.9;
    }
    50% {
      transform: scale(1.15);
      opacity: 0.8;
    }
  }

  @keyframes hubCorePulse {
    0%,
    100% {
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
    background:
      radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
    animation: particleFloat 8s ease-in-out infinite;
  }

  @keyframes particleFloat {
    0%,
    100% {
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
    box-shadow:
      0 3px 8px rgba(30, 64, 175, 0.3),
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
    box-shadow:
      0 4px 12px rgba(30, 64, 175, 0.4),
      0 2px 6px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .preview-admin-trigger:active {
    transform: translateY(0);
    box-shadow:
      0 2px 6px rgba(30, 64, 175, 0.3),
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
    box-shadow:
      0 6px 20px rgba(30, 58, 138, 0.25),
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

  /* SaaS Platform Section */
  .saas-platform-section {
    padding: 0;
    background: #f9fafc;
    position: relative;
    margin-bottom: 0;
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
    margin-top: 0;
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

  /* Firefox does not reliably paint SVG content when the SVG root is a flex
     container. Font Awesome puts payment-icon on the root SVG itself. */
  .payment-method svg.payment-icon {
    display: block !important;
    width: 2.5rem !important;
    height: 2.5rem !important;
    flex: 0 0 2.5rem;
    overflow: visible;
    color: inherit;
    fill: currentColor;
  }

  .payment-method svg.payment-icon path,
  .payment-method svg.payment-icon g {
    fill: currentColor;
  }

  .payment-method img.payment-icon {
    display: block !important;
    width: 2.5rem !important;
    height: 2.5rem !important;
    flex: 0 0 2.5rem;
  }

  .payment-icon-img {
    display: block;
    width: 2.5rem;
    height: 2.5rem;
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

  .payment-method.payment-selected,
  .payment-method.payment-selected span,
  .payment-method.payment-selected .payment-icon {
    color: #000000 !important;
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

  .payment-method:focus {
    outline: none;
    border: none;
  }

  .payment-method:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 3px;
  }

  .payment-method:active {
    outline: none;
    border: none;
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

  .payment-github .payment-icon {
    color: #111827;
  }

  .payment-node .payment-icon {
    color: #2563eb;
  }

  .payment-api .payment-icon {
    color: #0070ba;
  }

  .payment-paypal .payment-icon {
    color: #0070ba;
  }

  .payment-custom .payment-icon {
    color: #2563eb;
  }

  .payment-redis .payment-icon {
    color: #ff9900;
  }

  .payment-postgres .payment-icon {
    color: #10a37f;
  }

  .payment-rest .payment-icon {
    color: #0ea5e9;
  }

  .payment-mongo .payment-icon {
    color: #f22f46;
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
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.08),
      0 1px 3px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-width: 480px;
  }

  .payment-form-card:hover {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 2px 8px rgba(0, 0, 0, 0.06);
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
    background: linear-gradient(
      135deg,
      rgba(148, 163, 184, 0.1) 0%,
      rgba(100, 116, 139, 0.15) 100%
    );
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

  /* SaaS Highlight Card - Dark blue gradient banner */
  .saas-highlight-card {
    position: relative;
    border-radius: 24px;
    padding: 60px 50px;
    background: linear-gradient(
      135deg,
      #0f172a 0%,
      #1e3a8a 25%,
      #1e40af 50%,
      #1e3a8a 75%,
      #0f172a 100%
    );
    color: #ffffff;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.15);
    margin-bottom: 3rem;
    margin-top: 1.5rem;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      0 4px 12px rgba(0, 0, 0, 0.08);
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
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.85;
    }
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
    content: ' Whether you are indexing documents, tuning hybrid retrieval, or scaling search across applications, dashcole gives you one open search layer to build on.';
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
    box-shadow:
      0 2px 8px rgba(15, 23, 42, 0.06),
      0 1px 2px rgba(15, 23, 42, 0.04);
    white-space: nowrap;
  }

  .country-tab:hover {
    color: #1e293b;
    box-shadow:
      0 6px 14px rgba(37, 99, 235, 0.16),
      0 3px 8px rgba(15, 23, 42, 0.1);
    transform: translateY(-0.5px);
  }

  .country-tab.active {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
    color: #ffffff;
    font-weight: 700;
    border-color: transparent;
    box-shadow:
      0 6px 16px rgba(37, 99, 235, 0.22),
      0 3px 10px rgba(15, 23, 42, 0.12);
    transform: translateY(-0.5px);
  }

  .country-tab.active:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%);
    color: #ffffff;
    box-shadow:
      0 10px 24px rgba(37, 99, 235, 0.28),
      0 6px 14px rgba(15, 23, 42, 0.16);
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
    align-items: center;
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
    line-height: 1;
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
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
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

  .category-badge.success,
  .category-badge.revenue {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }

  .category-badge.issue,
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
    font-size: 0.72rem;
    font-weight: 700;
    padding: 0.34rem 0.64rem;
    border-radius: 8px;
    line-height: 1;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    box-shadow:
      0 6px 14px rgba(30, 58, 138, 0.32),
      0 3px 10px rgba(15, 23, 42, 0.16);
    transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .accounting-view-all-header:hover {
    background: linear-gradient(135deg, #1e3a8a 0%, #172554 60%, #0f172a 100%);
    color: #ffffff !important;
    box-shadow:
      0 10px 20px rgba(23, 37, 84, 0.34),
      0 6px 14px rgba(15, 23, 42, 0.2);
    transform: translateY(-1px);
  }

  .accounting-view-all-header span {
    color: #ffffff !important;
    font-size: 0.9rem;
    letter-spacing: 0;
    text-transform: none;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }

  .accounting-view-all-chevron {
    color: #ffffff !important;
    flex-shrink: 0;
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
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.32) 0%,
      rgba(255, 255, 255, 0.06) 60%,
      rgba(255, 255, 255, 0) 100%
    );
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
      padding: 0;
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
      box-shadow:
        0 8px 28px rgba(15, 23, 42, 0.16),
        0 3px 10px rgba(15, 23, 42, 0.12);
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
    background: #ffffff;
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
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.04);
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
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.08),
      0 8px 24px rgba(0, 0, 0, 0.06);
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

  .hero-section.hero-secondary {
    pointer-events: auto !important;
    min-height: 76vh;
    padding: 2.8rem 0 3.2rem 0;
    background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
    margin-top: calc(-1.5rem - 10px);
  }

  .hero-section.hero-secondary .hero-container {
    width: min(1080px, calc(100vw - 2rem)) !important;
    max-width: 1080px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    display: grid !important;
    grid-template-columns: minmax(0, 546px) minmax(0, 460px) !important;
    gap: clamp(1.35rem, 4vw, 3rem) !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .hero-section.hero-secondary .hero-content-secondary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    width: min(460px, 100%);
    max-width: 460px;
    justify-self: center;
    gap: 0;
  }

  .hero-section.hero-secondary .hero-title-secondary {
    margin-bottom: 0.28rem;
  }

  .hero-section.hero-secondary .hero-description-secondary {
    margin: 0;
    line-height: 1.34;
  }

  .hero-section.hero-secondary .hero-description-secondary-2 {
    margin: 0.18rem 0 0;
    max-width: 460px;
    color: #334155;
    font-size: 1rem;
    line-height: 1.34;
    opacity: 0.9;
  }

  .hero-section.hero-secondary .hero-actions-secondary {
    justify-content: center;
  }

  .hero-section.hero-secondary .hero-visual-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-self: center;
    width: 100%;
    margin-left: 0;
  }

  .hero-preview-box {
    width: min(546px, 100%);
    aspect-ratio: 1448 / 1086;
    height: auto;
    border-radius: 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    display: block;
    overflow: visible;
  }

  .hero-preview-image {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    image-rendering: auto;
    transform: none;
    transform-origin: center center;
    filter: drop-shadow(0 18px 28px rgba(15, 23, 42, 0.12));
  }

  @media (max-width: 1024px) {
    .hero-section.hero-secondary .hero-container {
      grid-template-columns: 1fr !important;
    }

    .hero-section.hero-secondary .hero-visual-secondary {
      justify-content: center;
      justify-self: stretch;
      width: 100%;
      margin-left: 0;
    }

    .hero-preview-image {
      transform: none;
      transform-origin: center center;
    }

    .hero-section.hero-secondary .hero-content-secondary {
      align-items: flex-start;
      text-align: left;
      justify-self: center;
    }

    .hero-section.hero-secondary .hero-actions-secondary {
      justify-content: center;
    }
  }

  .dashboard-preview {
    transform: none !important;
    border-radius: 22px !important;
    box-shadow:
      0 26px 60px rgba(15, 23, 42, 0.14),
      0 8px 24px rgba(15, 23, 42, 0.08) !important;
  }

  .preview-main {
    padding: 1rem !important;
  }

  .features-section {
    margin-top: 0 !important;
    padding: calc(3.4rem - 10px) 0 12rem 0 !important;
  }

  .landing-page > section.global-data-section {
    margin-top: 1.2rem !important;
    padding: 7.25rem 0 9rem 0 !important;
    clip-path: polygon(0 8%, 100% 0%, 100% 100%, 0 100%) !important;
    -webkit-clip-path: polygon(0 8%, 100% 0%, 100% 100%, 0 100%) !important;
    border-radius: 0 !important;
  }

  .landing-page > section.global-data-section::before {
    content: none !important;
    position: absolute;
    top: -84px;
    left: 0;
    right: 0;
    height: 90px;
    background: #021c34;
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
    box-shadow:
      0 14px 34px rgba(15, 23, 42, 0.08),
      0 4px 12px rgba(15, 23, 42, 0.04) !important;
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

  .global-data-section .global-data-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.35rem;
    align-self: center;
    min-height: 100%;
    max-width: 560px;
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
      margin-top: 0.8rem !important;
      padding: 5.4rem 0 7.5rem 0 !important;
      clip-path: polygon(0 5%, 100% 0%, 100% 100%, 0 100%) !important;
      -webkit-clip-path: polygon(0 5%, 100% 0%, 100% 100%, 0 100%) !important;
      border-radius: 0 !important;
    }

    .landing-page > section.global-data-section::before {
      content: none !important;
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
    background-size:
      120px 120px,
      140px 140px,
      180px 180px,
      180px 180px;
    background-position:
      0 0,
      20px 10px,
      0 0,
      28px 22px;
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
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0.55) 48%,
      transparent 100%
    );
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
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
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
    0%,
    100% {
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
    0%,
    100% {
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

  /* Home dev tools header icon + slightly smaller title */
  .features-section .dev-tools-header {
    display: flex;
    width: min(100%, 780px);
    margin-right: auto !important;
    margin-left: auto !important;
    margin-bottom: 3rem !important;
    flex-direction: column;
    align-items: center;
    text-align: center !important;
    transform: translateY(0) !important;
  }

  .features-section .home-dev-header-icon {
    display: flex;
    width: fit-content;
    margin: 0 0 0.72rem;
    align-items: center;
    justify-content: center;
    color: #1d4ed8;
    position: relative;
  }

  .features-section .home-dev-header-icon::before,
  .features-section .home-dev-header-icon::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(37, 99, 235, 0.5));
    pointer-events: none;
  }

  .features-section .home-dev-header-icon::before {
    width: 7px;
    height: 7px;
    top: -2px;
    right: -8px;
    animation: homeOrbOne 2.8s ease-in-out infinite;
  }

  .features-section .home-dev-header-icon::after {
    width: 5px;
    height: 5px;
    bottom: 1px;
    left: -8px;
    animation: homeOrbTwo 3.1s ease-in-out infinite;
  }

  .features-section .home-dev-header-icon-glyph {
    font-size: clamp(1.1rem, 1.8vw, 1.4rem);
    transform: rotate(-8deg);
    filter: drop-shadow(0 8px 16px rgba(37, 99, 235, 0.22));
    animation: homeMagnifierFloat 3.2s ease-in-out infinite;
  }

  .features-section .dev-tools-header .section-title {
    width: 100%;
    margin-right: auto !important;
    margin-left: auto !important;
    padding-bottom: 0.12em !important;
    overflow: visible !important;
    text-align: center !important;
    font-size: clamp(2rem, 3.8vw, 2.65rem) !important;
    background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 45%, #0f172a 100%);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: homeDevToolsTitleShimmer 7.2s ease-in-out infinite;
  }

  .features-section .dev-tools-header .section-description {
    margin-right: auto !important;
    margin-left: auto !important;
    text-align: center !important;
  }

  @keyframes homeMagnifierFloat {
    0%,
    100% {
      transform: translateY(0) rotate(-8deg);
    }
    50% {
      transform: translateY(-2px) rotate(-5deg);
    }
  }

  @keyframes homeDevToolsTitleShimmer {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @keyframes homeOrbOne {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.9;
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.25);
    }
    50% {
      transform: translate(2px, -2px) scale(1.12);
      opacity: 1;
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
    }
  }

  @keyframes homeOrbTwo {
    0%,
    100% {
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

  /* Home hero layout lock: keep copy on the left like ecommerce */
  .home-hero .hero-container {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) !important;
    align-items: center !important;
  }

  .home-hero .hero-content {
    text-align: left !important;
    align-self: center !important;
    max-width: 640px !important;
  }

  .home-hero .hero-title {
    font-size: clamp(6.2rem, 11.2vw, 9.2rem) !important;
    line-height: 0.9 !important;
    margin-bottom: 1rem !important;
  }

  .home-hero .hero-description {
    max-width: 34rem !important;
    margin-top: 0 !important;
  }

  .home-hero .hero-actions {
    justify-content: flex-start !important;
    margin-top: 64px !important;
  }

  .home-hero .hero-container .vertical-divider {
    display: none !important;
  }

  .home-hero .hero-container {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    gap: 2.5rem !important;
  }

  .home-hero .hero-visual {
    min-height: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
  }

  .landing-page .integrations-banner-section {
    padding: 1.6rem 0 2.35rem;
    background: #f9fafc;
  }

  .landing-page .integrations-banner-container {
    width: min(1200px, calc(100vw - 2.2rem));
    margin: 0 auto;
    background: #f9fafc;
    padding: 0.1rem 0.2rem 0.35rem;
    position: relative;
  }

  .landing-page .integrations-banner-label {
    display: block;
    margin-bottom: 1.35rem;
    text-align: center;
    font-size: 0.95rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #1e3a8a;
    font-weight: 800;
  }

  .landing-page .integrations-banner-grid {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: 0.9rem 1.1rem;
    padding-bottom: 0;
    position: relative;
  }

  .landing-page .integrations-banner-grid::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -18px;
    height: 2px;
    background: repeating-linear-gradient(to right, #d1d5db 0 16px, transparent 16px 34px);
  }

  .landing-page .integrations-banner-item {
    min-height: 46px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.62rem;
    font-size: clamp(1rem, 1.7vw, 1.24rem);
    color: #0b1f38;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  .landing-page .integrations-banner-item span:last-child {
    font-weight: 900;
    white-space: nowrap;
  }

  .landing-page .integration-logo {
    font-size: 1.45rem;
    width: 1.55rem;
    text-align: center;
    flex: 0 0 1.55rem;
  }

  .landing-page .integration-google {
    color: #188038;
  }

  .landing-page .integration-microsoft {
    color: #2563eb;
  }

  .landing-page .integration-github {
    color: #111827;
  }

  .landing-page .integration-salesforce {
    color: #00a1e0;
  }

  .landing-page .integration-slack {
    color: #0f5f9e;
  }

  .landing-page .integration-docker {
    color: #2496ed;
  }

  .landing-page .integration-aws {
    color: #f59e0b;
  }

  .landing-page .integration-stripe {
    color: #2563eb;
  }

  @media (max-width: 768px) {
    .home-hero .hero-container {
      grid-template-columns: 1fr !important;
    }

    .home-hero .hero-container .vertical-divider {
      display: none !important;
    }

    .home-hero .hero-content {
      text-align: center !important;
      max-width: 100% !important;
    }

    .home-hero .hero-title {
      font-size: clamp(4.2rem, 16.5vw, 6.3rem) !important;
      line-height: 0.92 !important;
    }

    .home-hero .hero-actions {
      justify-content: center !important;
    }

    .features-section .dev-tools-header .section-title {
      font-size: clamp(1.75rem, 6.5vw, 2.1rem) !important;
    }

    .landing-page .integrations-banner-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.72rem;
    }
  }

  /* Final lock: keep Home CTA button size identical to Ecommerce CTA */
  .landing-page-wrapper .landing-page > section.cta-section .cta-actions {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 14px !important;
    align-items: stretch !important;
    max-width: 760px !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-primary,
  .landing-page-wrapper .landing-page > section.cta-section .cta-secondary {
    width: 100% !important;
    min-width: 0 !important;
    min-height: 48px !important;
    padding: 0.62rem 1.08rem !important;
    font-size: 0.88rem !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.44rem !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-btn-left-icon {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 0.82rem !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  @media (max-width: 768px) {
    .landing-page-wrapper .landing-page > section.cta-section .cta-actions {
      grid-template-columns: 1fr !important;
      width: 100% !important;
      gap: 0.62rem !important;
    }

    .landing-page-wrapper .landing-page > section.cta-section .cta-primary,
    .landing-page-wrapper .landing-page > section.cta-section .cta-secondary {
      width: 100% !important;
      padding: 0.56rem 0.92rem !important;
      font-size: 0.83rem !important;
    }
  }

  .modal-close-btn {
    transition:
      background-color 0.18s ease,
      color 0.18s ease,
      transform 0.18s ease;
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
    background: radial-gradient(
      ellipse at 50% 100%,
      rgba(15, 23, 42, 0.22) 0%,
      rgba(15, 23, 42, 0) 70%
    );
    filter: blur(6px);
    transform: translateZ(-8px);
    opacity: 0.6;
  }

  .integration-modal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-start;
    width: 100%;
    padding-right: 4px;
  }

  .integration-modal-header-icon {
    font-size: 1.2rem;
    color: #0f172a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    height: 1.4rem;
    width: 1.4rem;
    margin-left: 4px;
  }

  .integration-modal-header-title {
    font-size: 1rem;
    font-weight: 800;
    color: #0f172a !important;
    letter-spacing: -0.01em;
  }

  .integration-modal-badge {
    margin: 0 0 10px 0;
    font-size: clamp(1.65rem, 4vw, 2rem);
    font-weight: 900;
    color: #111827 !important;
    letter-spacing: -0.01em;
    text-decoration: none;
  }

  .integration-modal-summary {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    font-weight: 700;
    color: #111827 !important;
  }

  .integration-modal-subtitle {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 800;
    color: #1e293b !important;
    letter-spacing: -0.01em;
  }

  .integration-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
  }

  .integration-step-line {
    margin: 0;
    font-size: 15.5px;
    font-weight: 700;
    line-height: 1.58;
    color: #000000 !important;
    text-align: left;
  }

  .integration-modal-cta {
    margin: 14px 0 0 0;
    font-weight: 800;
    font-size: 15.5px;
    color: #0f172a !important;
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

  /* Force white text on "Ready to build with dashcole" CTA block */
  .landing-page-wrapper .landing-page > section.cta-section .cta-title,
  .landing-page-wrapper .landing-page > section.cta-section .cta-sub,
  .landing-page-wrapper .landing-page > section.cta-section .cta-desc-title,
  .landing-page-wrapper .landing-page > section.cta-section .cta-desc-text,
  .landing-page-wrapper .landing-page > section.cta-section .cta-promo-title,
  .landing-page-wrapper .landing-page > section.cta-section .cta-promo-text {
    color: #ffffff !important;
  }

  /* Home 6 feature boxes: force 3 columns on desktop and slightly smaller cards */
  .landing-page .features-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 1.4rem !important;
  }

  .landing-page .feature-card {
    --feature-card-bg:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.78) 0%,
        rgba(255, 255, 255, 0.3) 22%,
        rgba(255, 255, 255, 0.08) 48%
      ),
      linear-gradient(
        315deg,
        rgba(203, 213, 225, 0.34) 0%,
        rgba(241, 245, 249, 0.2) 34%,
        rgba(148, 163, 184, 0.08) 100%
      ),
      linear-gradient(160deg, #f8fafc 0%, #eef3f8 52%, #dfe7ef 100%);
    --feature-card-border: rgba(203, 213, 225, 0.8);
    --feature-card-topbar: linear-gradient(
      90deg,
      #ffffff 0%,
      #eef3f8 24%,
      #cfd8e3 52%,
      #f8fafc 78%,
      #e2e8f0 100%
    );
    padding: 1.15rem !important;
    border: 1px solid var(--feature-card-border) !important;
    box-shadow:
      0 16px 28px rgba(15, 23, 42, 0.08),
      0 6px 12px rgba(15, 23, 42, 0.045),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 1px 0 0 rgba(255, 255, 255, 0.72),
      inset 0 -1px 0 rgba(148, 163, 184, 0.08) !important;
  }

  .landing-page .feature-card::after {
    background:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.72) 0%,
        rgba(255, 255, 255, 0.22) 18%,
        rgba(255, 255, 255, 0) 38%
      ),
      linear-gradient(315deg, rgba(100, 116, 139, 0.08) 0%, rgba(100, 116, 139, 0) 38%),
      radial-gradient(circle at 82% 12%, rgba(255, 255, 255, 0.44), transparent 34%) !important;
    opacity: 1 !important;
  }

  .landing-page .feature-card:hover {
    border-color: rgba(186, 198, 211, 0.95) !important;
    box-shadow:
      0 22px 36px rgba(15, 23, 42, 0.11),
      0 9px 16px rgba(15, 23, 42, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 1px 0 0 rgba(255, 255, 255, 0.78),
      inset 0 -1px 0 rgba(148, 163, 184, 0.1) !important;
  }

  .landing-page .features-grid .feature-card .feature-icon {
    width: 46px !important;
    height: 46px !important;
  }

  .landing-page .features-grid .feature-card .feature-icon svg,
  .landing-page .features-grid .feature-card .feature-icon-img {
    width: 23px !important;
    height: 23px !important;
  }

  .landing-page .features-grid .feature-card:nth-child(1) {
    --feature-icon-color: #1d4ed8;
  }
  .landing-page .features-grid .feature-card:nth-child(2) {
    --feature-icon-color: #0f5f59;
  }
  .landing-page .features-grid .feature-card:nth-child(3) {
    --feature-icon-color: #2563eb;
  }
  .landing-page .features-grid .feature-card:nth-child(4) {
    --feature-icon-color: #9a3412;
  }
  .landing-page .features-grid .feature-card:nth-child(5) {
    --feature-icon-color: #991b1b;
  }
  .landing-page .features-grid .feature-card:nth-child(6) {
    --feature-icon-color: #075985;
  }

  @media (max-width: 980px) {
    .landing-page .features-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
  }

  @media (max-width: 768px) {
    .landing-page .features-grid {
      grid-template-columns: 1fr !important;
    }
  }

  /* Force white text in Home "Give every customer..." global data block */
  .landing-page > section.global-data-section .global-data-title,
  .landing-page > section.global-data-section .global-data-subtitle,
  .landing-page > section.global-data-section .global-data-description,
  .landing-page > section.global-data-section .global-stat-number,
  .landing-page > section.global-data-section .global-stat-label {
    color: #ffffff !important;
  }

  .landing-page > section.global-data-section .api-terminal-title {
    color: #0f172a !important;
    text-transform: uppercase;
  }

  .landing-page > section.global-data-section .global-data-subtitle,
  .landing-page > section.global-data-section .global-data-description,
  .landing-page > section.global-data-section .global-stat-label {
    color: rgba(255, 255, 255, 0.84) !important;
  }

  /* Integrations banner: make label and names bold */
  .landing-page .integrations-banner-label {
    font-weight: 800 !important;
  }

  .landing-page .integrations-banner-item span:last-child {
    font-weight: 700 !important;
  }

  /* Home feature cards: softer gray hierarchy */
  .landing-page .features-section .feature-title {
    color: #000000 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 1.125rem !important;
    opacity: 1 !important;
    font-weight: 800 !important;
    letter-spacing: -0.02em !important;
  }

  .landing-page .features-section .feature-description {
    color: #000000 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 0.9375rem !important;
    opacity: 1 !important;
    font-weight: 600 !important;
  }

  .landing-page .features-section .section-description {
    color: #1f2937 !important;
    opacity: 1 !important;
  }

  /* Home feature boxes: light cards with dashcole-style accent bars */
  .landing-page .features-section .features-grid {
    align-items: stretch !important;
    perspective: 1200px !important;
  }

  .landing-page .features-section .features-grid .feature-card {
    --feature-accent: #2563EB;
    --feature-card-bg: linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%);
    --feature-card-border: #DCE7F5;
    --feature-card-topbar: var(--feature-accent);
    --feature-icon-bg: color-mix(in srgb, var(--feature-accent) 8%, #ffffff);
    --feature-icon-color: var(--feature-accent);
    --feature-title-color: #0F172A;
    --feature-description-color: #475569;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
    min-height: 255px !important;
    padding: 1.55rem 1.45rem 1.45rem !important;
    border: 1px solid var(--feature-card-border) !important;
    border-radius: 0 0 24px 24px !important;
    background: var(--feature-card-bg) !important;
    box-shadow:
      0 24px 44px rgba(15, 23, 42, 0.14),
      0 10px 18px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.95) !important;
    overflow: hidden !important;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(-0.8deg) !important;
    transform-style: preserve-3d !important;
    transition:
      transform 0.22s ease,
      border-color 0.22s ease,
      box-shadow 0.22s ease !important;
    will-change: transform, box-shadow !important;
  }

  .landing-page .features-section .features-grid .feature-card::before {
    height: 6px !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    border-radius: 0 !important;
    background: var(--feature-accent) !important;
  }

  .landing-page .features-section .features-grid .feature-card::after {
    content: '' !important;
    position: absolute !important;
    left: 1.45rem !important;
    right: 1.45rem !important;
    bottom: 1.05rem !important;
    top: auto !important;
    height: 3px !important;
    border-radius: 999px !important;
    background: color-mix(in srgb, var(--feature-accent) 24%, transparent) !important;
    opacity: 1 !important;
    pointer-events: none !important;
  }

  .landing-page .features-section .features-grid .feature-card:hover {
    transform: translate3d(0, -6px, 30px) rotateX(2deg) rotateY(-1.2deg) scale(1.01) !important;
    border-color: color-mix(in srgb, var(--feature-accent) 42%, #DCE7F5) !important;
    box-shadow:
      0 34px 60px rgba(15, 23, 42, 0.18),
      0 14px 24px rgba(15, 23, 42, 0.11),
      inset 0 1px 0 rgba(255, 255, 255, 1) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(1) {
    --feature-accent: #2563EB;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(-0.8deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(2) {
    --feature-accent: #0F766E;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(0.8deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(3) {
    --feature-accent: #0369a1;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(-0.6deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(4) {
    --feature-accent: #EA580C;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(0.6deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(5) {
    --feature-accent: #DC2626;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(-0.8deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(6) {
    --feature-accent: #0369A1;
    transform: translate3d(0, 0, 18px) rotateX(1deg) rotateY(0.8deg) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(1):hover,
  .landing-page .features-section .features-grid .feature-card:nth-child(3):hover,
  .landing-page .features-section .features-grid .feature-card:nth-child(5):hover {
    transform: translate3d(0, -6px, 30px) rotateX(2deg) rotateY(-1.2deg) scale(1.01) !important;
  }

  .landing-page .features-section .features-grid .feature-card:nth-child(2):hover,
  .landing-page .features-section .features-grid .feature-card:nth-child(4):hover,
  .landing-page .features-section .features-grid .feature-card:nth-child(6):hover {
    transform: translate3d(0, -6px, 30px) rotateX(2deg) rotateY(1.2deg) scale(1.01) !important;
  }

  .landing-page .features-section .features-grid .feature-card .feature-icon {
    width: 46px !important;
    height: 46px !important;
    margin-bottom: 1rem !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .landing-page .features-section .features-grid .feature-card .feature-icon::after {
    content: none !important;
  }

  .landing-page .features-section .features-grid .feature-card .feature-icon svg,
  .landing-page .features-section .features-grid .feature-card .feature-icon-img {
    width: 23px !important;
    height: 23px !important;
    color: var(--feature-accent) !important;
    filter: none !important;
  }

  .landing-page .features-section .features-grid .feature-card:hover .feature-icon {
    transform: translateY(-2px) !important;
    background: transparent !important;
  }

  .landing-page .features-section .features-grid .feature-card .feature-title {
    color: #000000 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 1.125rem !important;
    font-weight: 800 !important;
    line-height: 1.2 !important;
    letter-spacing: -0.02em !important;
    margin: 0 0 1.125rem !important;
  }

  .landing-page .features-section .features-grid .feature-card .feature-description {
    color: #64748b !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 0.9375rem !important;
    font-weight: 400 !important;
    line-height: 1.6 !important;
    margin: auto 0 0.35rem !important;
  }

  .landing-page .features-section .features-grid .feature-card li,
  .landing-page .features-section .features-grid .feature-card li::marker {
    color: #000000 !important;
  }

  /* Home vertical rhythm: keep the second banner separated from the hero */
  .landing-page .features-section {
    padding: 1.5rem 0 4.8rem 0 !important;
    background: #f6f9fc !important;
  }

  .landing-page .hero-section.hero-secondary {
    min-height: auto !important;
    margin-top: 3.5rem !important;
    padding: 4.5rem 0 5.25rem 0 !important;
    background: #f8fafc !important;
    border-top: 0;
  }

  .landing-page .hero-section.hero-secondary .hero-container {
    width: min(1180px, calc(100vw - 2rem)) !important;
    max-width: 1180px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 480px)) !important;
    gap: clamp(7rem, 9vw, 10rem) !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .landing-page .hero-section.hero-secondary .hero-visual-secondary {
    width: 480px !important;
    max-width: 100% !important;
    justify-self: center !important;
  }

  @media (min-width: 1025px) {
    .landing-page .hero-section.hero-secondary .hero-visual-secondary {
      transform: translateY(20px) !important;
    }
  }

  .landing-page .hero-section.hero-secondary .hero-preview-box {
    width: 480px !important;
    max-width: 100% !important;
  }

  @media (min-width: 1101px) {
    .landing-page .hero-section.hero-secondary .hero-preview-image {
      width: 112% !important;
      max-width: none !important;
      transform: translateX(2%) !important;
      transform-origin: center center !important;
    }
  }

  .landing-page .hero-section.hero-secondary .hero-content-secondary {
    align-items: flex-start !important;
    justify-self: start !important;
    text-align: left !important;
    width: min(460px, 100%) !important;
    max-width: 460px !important;
    position: relative;
    padding-left: 0;
    border-left: 0;
  }

  @media (min-width: 1025px) {
    .landing-page .hero-section.hero-secondary .hero-content-secondary {
      transform: translateY(-28px) !important;
    }
  }

  .landing-page .hero-section.hero-secondary .hero-title-secondary,
  .landing-page .hero-section.hero-secondary .hero-title-secondary .hero-line,
  .landing-page .hero-section.hero-secondary .hero-title-secondary .hero-title-base {
    text-align: left !important;
    color: #000000 !important;
    background: none !important;
    -webkit-text-fill-color: #000000 !important;
  }

  .landing-page .hero-section.hero-secondary .hero-title-secondary {
    margin-bottom: 1rem !important;
    font-size: clamp(2.1rem, 3.15vw, 3.05rem) !important;
    line-height: 0.98 !important;
    letter-spacing: -0.055em !important;
  }

  .landing-page .hero-section.hero-secondary .hero-description-secondary,
  .landing-page .hero-section.hero-secondary .hero-description-secondary-2 {
    margin-left: 0 !important;
    margin-right: 0 !important;
    text-align: left !important;
  }

  .landing-page .hero-section.hero-secondary .hero-description-secondary {
    margin-top: 0 !important;
    color: #1e293b !important;
    font-size: 1.02rem !important;
    font-weight: 540 !important;
    line-height: 1.58 !important;
  }

  .landing-page .hero-section.hero-secondary .hero-description-secondary-2 {
    margin-top: 0.8rem !important;
    color: #475569 !important;
    font-size: 0.98rem !important;
    line-height: 1.58 !important;
  }

  .home-secondary-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    width: 100%;
    margin-top: 1.75rem;
  }

  .home-secondary-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 0.42rem;
    min-width: 0;
    min-height: 112px;
    padding: 1rem 0.85rem 0.9rem;
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(148, 163, 184, 0.28);
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.055);
  }

  .home-secondary-stat::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: #2563eb;
  }

  .home-secondary-stat:nth-child(2)::before {
    background: #0ea5e9;
  }

  .home-secondary-stat:nth-child(3)::before {
    background: #06b6d4;
  }

  .home-secondary-stat strong {
    color: #0f172a;
    font-size: clamp(1.65rem, 2.25vw, 2.15rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  .home-secondary-stat span {
    color: #475569;
    font-size: 0.73rem;
    font-weight: 680;
    line-height: 1.3;
  }

  @media (max-width: 1024px) {
    .landing-page .hero-section.hero-secondary .hero-container {
      width: min(100%, calc(100vw - 2rem)) !important;
      grid-template-columns: 1fr !important;
      gap: 1.1rem !important;
      justify-items: center !important;
    }

    .landing-page .hero-section.hero-secondary .hero-visual-secondary,
    .landing-page .hero-section.hero-secondary .hero-content-secondary {
      justify-self: center !important;
    }

    .landing-page .hero-section.hero-secondary .hero-content-secondary {
      align-items: flex-start !important;
      text-align: left !important;
      width: min(460px, 100%) !important;
      padding-left: 1.25rem;
    }

    .landing-page .hero-section.hero-secondary .hero-preview-box {
      width: min(546px, 92vw) !important;
    }

    .landing-page .hero-section.hero-secondary .hero-preview-image {
      width: 100% !important;
      max-width: 100% !important;
      transform: none !important;
    }

  }

  /* Integration labels stay crisp while each icon keeps its brand color. */
  .landing-page .invoices-left .payment-method,
  .landing-page .invoices-left .payment-method:hover,
  .landing-page .invoices-left .payment-method > span:not(.payment-icon),
  .landing-page .invoices-left .payment-method:hover > span:not(.payment-icon) {
    color: #000000 !important;
  }

  .landing-page .invoices-left .payment-method.payment-github .payment-icon {
    color: #111827 !important;
  }

  .landing-page .invoices-left .payment-method.payment-node .payment-icon {
    color: #635bff !important;
  }

  .landing-page .invoices-left .payment-method.payment-api .payment-icon {
    color: #0070ba !important;
  }

  .landing-page .invoices-left .payment-method.payment-redis .payment-icon {
    color: #ff9900 !important;
  }

  .landing-page .invoices-left .payment-method.payment-postgres .payment-icon {
    color: #10a37f !important;
  }

  .landing-page .invoices-left .payment-method.payment-mongo .payment-icon {
    color: #f22f46 !important;
  }

  .landing-page .invoices-left .payment-method img.twilio-brand-mark {
    filter: none !important;
  }

  /* Text below integrations: near-black */
  .landing-page .invoices-section-description {
    color: #1f2937 !important;
  }

  /* Indexing activity overview card: near-black text hierarchy */
  .landing-page .invoices-section .accounting-track-title,
  .landing-page .invoices-section .summary-value,
  .landing-page .invoices-section .summary-value.positive,
  .landing-page .invoices-section .summary-value.negative,
  .landing-page .invoices-section .accounting-table-header > div,
  .landing-page .invoices-section .table-col-date,
  .landing-page .invoices-section .table-col-description,
  .landing-page .invoices-section .table-col-amount,
  .landing-page .invoices-section .table-col-amount.positive,
  .landing-page .invoices-section .table-col-amount.negative {
    color: #111827 !important;
  }

  .landing-page .invoices-section .accounting-table-header > div {
    font-weight: 900 !important;
  }

  .landing-page .invoices-section .table-col-date,
  .landing-page .invoices-section .table-col-description,
  .landing-page .invoices-section .table-col-category {
    color: #000000 !important;
    font-weight: 900 !important;
  }

  .landing-page .invoices-section .summary-value,
  .landing-page .invoices-section .summary-value.positive,
  .landing-page .invoices-section .summary-value.negative {
    color: #1e3a8a !important;
    font-weight: 800 !important;
  }

  .landing-page .invoices-section .summary-label {
    color: #374151 !important;
  }

  .landing-page .invoices-section .category-badge,
  .landing-page .invoices-section .category-badge.revenue,
  .landing-page .invoices-section .category-badge.expense {
    color: #111827 !important;
    background: #e5e7eb !important;
    border: 1px solid #d1d5db !important;
  }

  .landing-page .invoices-section .category-badge.success,
  .landing-page .invoices-section .category-badge.revenue {
    color: #059669 !important;
    background: rgba(16, 185, 129, 0.12) !important;
    border: 1px solid rgba(16, 185, 129, 0.28) !important;
  }

  .landing-page .invoices-section .category-badge.issue,
  .landing-page .invoices-section .category-badge.expense {
    color: #dc2626 !important;
    background: rgba(239, 68, 68, 0.12) !important;
    border: 1px solid rgba(239, 68, 68, 0.28) !important;
  }

  /* Home hero: centered two-column banner with left-aligned copy */
  .landing-page .home-hero,
  .landing-page .home-hero .hero-container,
  .landing-page .home-hero .hero-visual {
    overflow: visible !important;
  }

  .landing-page .home-hero {
    padding-top: 1.45rem !important;
    padding-bottom: 3.2rem !important;
    min-height: 78vh !important;
  }

  .landing-page .home-hero:not(.hero-secondary) {
    overflow: hidden !important;
  }

  .landing-page .home-hero .hero-container {
    display: grid !important;
    width: calc(100vw - clamp(1rem, 4vw, 4.5rem)) !important;
    max-width: none !important;
    margin-left: clamp(1rem, 4vw, 4.5rem) !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    grid-template-columns: minmax(340px, 0.72fr) minmax(0, 1.28fr) !important;
    gap: clamp(1rem, 2.5vw, 2.5rem) !important;
    align-items: center !important;
    transform: none !important;
  }

  .landing-page .home-hero .vertical-divider {
    display: none !important;
  }

  .landing-page .home-hero .hero-content {
    min-width: 0 !important;
    max-width: 580px !important;
    padding-top: 0 !important;
    justify-self: start !important;
    text-align: left !important;
    transform: translateY(-1.25rem) !important;
  }

  .landing-page .home-hero .hero-eyebrow {
    display: inline-flex !important;
    font-size: 0.78rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    color: #1d4ed8 !important;
    margin-bottom: 0.8rem !important;
  }

  .landing-page .home-hero .hero-title {
    margin: 0 !important;
    color: #0a2540 !important;
    font-size: clamp(2.34rem, 4.08vw, 3.9rem) !important;
    line-height: 1.04 !important;
    letter-spacing: -0.04em !important;
    font-weight: 620 !important;
    background: none !important;
    -webkit-text-fill-color: #0a2540 !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-title {
    transform: translateY(-10px);
  }

  .landing-page .home-hero .hero-description {
    margin-top: 1.2rem !important;
    max-width: 58ch !important;
    color: #000000 !important;
    font-size: 1.03rem !important;
    line-height: 1.65 !important;
    font-weight: 500 !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-description {
    margin-top: calc(1.2rem + 10px) !important;
  }

  .landing-page .home-hero .hero-actions {
    margin-top: 2rem !important;
    display: flex !important;
    flex-wrap: wrap !important;
    grid-template-columns: none !important;
    gap: 0.85rem !important;
    max-width: 440px !important;
    justify-content: flex-start !important;
  }

  .landing-page .home-hero .hero-actions .btn-primary,
  .landing-page .home-hero .hero-actions .btn-secondary {
    width: auto !important;
    min-width: 178px !important;
    min-height: 46px !important;
    padding: 0.72rem 1.05rem !important;
    border-radius: 11px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.44rem !important;
  }

  .landing-page .home-hero .hero-visual {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    justify-self: stretch !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-right: 0 !important;
    min-width: 0 !important;
  }

  .landing-page .home-hero .home-hero-search-visual {
    position: relative;
    display: block;
    flex: 0 0 auto;
    color: inherit !important;
    text-decoration: none !important;
    width: clamp(760px, 62vw, 1120px) !important;
    max-width: none !important;
    min-height: 0 !important;
    margin: 0 0 0 auto !important;
    transform: translate(
      clamp(7.5rem, 8vw, 9rem),
      -0.75rem
    ) !important;
    isolation: isolate;
    -webkit-font-smoothing: antialiased;
    border-radius: clamp(16px, 1.65vw, 24px);
  }

  .landing-page .home-live-browser {
    position: relative;
    width: 100%;
    aspect-ratio: 1.685;
    overflow: hidden;
    border: 1px solid rgba(148, 163, 184, 0.46);
    border-radius: 24px;
    background: #ffffff;
    box-shadow:
      0 36px 90px rgba(15, 23, 42, 0.18),
      0 12px 28px rgba(15, 23, 42, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.96);
    transform: translateZ(0);
  }

  .landing-page .home-live-browser::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      inset 0 -22px 52px rgba(15, 23, 42, 0.035);
  }

  .home-live-browser-chrome {
    height: 7%;
    min-height: 58px;
    display: grid;
    grid-template-columns: minmax(92px, 0.35fr) minmax(260px, 0.9fr) minmax(90px, 0.3fr);
    align-items: center;
    gap: 1.2rem;
    padding: 0 2.2%;
    border-bottom: 1px solid #dfe7f1;
    background: linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
  }

  .home-live-browser-dots,
  .home-live-browser-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .home-live-browser-dots span {
    width: 0.62rem;
    height: 0.62rem;
    border-radius: 999px;
  }

  .home-live-browser-dots span:nth-child(1) { background: #ff5f57; }
  .home-live-browser-dots span:nth-child(2) { background: #ffbd2e; }
  .home-live-browser-dots span:nth-child(3) { background: #28c840; }

  .home-live-browser-url {
    height: 2.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid #dbe3ee;
    border-radius: 0.55rem;
    background: linear-gradient(180deg, #ffffff, #f8fafc);
    color: #242b36;
    font-size: clamp(0.72rem, 1vw, 1.02rem);
    letter-spacing: 0;
  }

  .home-live-lock {
    width: 0.58rem;
    height: 0.52rem;
    border-radius: 0.12rem;
    background: #4b5563;
    position: relative;
  }

  .home-live-lock::before {
    content: '';
    position: absolute;
    left: 0.1rem;
    top: -0.42rem;
    width: 0.38rem;
    height: 0.46rem;
    border: 0.1rem solid #4b5563;
    border-bottom: 0;
    border-radius: 999px 999px 0 0;
  }

  .home-live-browser-actions {
    justify-content: flex-end;
  }

  .home-live-browser-actions span {
    width: 1.1rem;
    height: 1.1rem;
    border: 2px solid #334155;
    border-radius: 0.25rem;
    opacity: 0.78;
  }

  .home-live-browser-nav {
    height: 8.2%;
    min-height: 66px;
    display: flex;
    align-items: center;
    gap: clamp(1.35rem, 3vw, 4rem);
    padding: 0 3%;
    border-bottom: 1px solid #e5edf6;
    color: #111827;
    font-size: clamp(0.78rem, 1.05vw, 1.05rem);
    font-weight: 780;
    background: #ffffff;
  }

  .home-live-logo {
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb, #0f5bff);
    color: #fff;
    font-weight: 900;
  }

  .home-live-browser-body {
    display: grid;
    grid-template-columns: minmax(170px, 23%) minmax(0, 1fr);
    height: 84.8%;
  }

  .home-live-sidebar {
    border-right: 1px solid #e2e8f0;
    padding: clamp(1rem, 2.5vw, 2.25rem);
    color: #334155;
    background: #ffffff;
  }

  .home-live-sidebar h3 {
    margin: 0 0 1.35rem;
    color: #101828;
    font-size: clamp(0.95rem, 1.35vw, 1.28rem);
    letter-spacing: 0;
  }

  .home-live-sidebar p {
    margin: 1.1rem 0 0.6rem;
    color: #0f172a;
    font-size: clamp(0.66rem, 0.86vw, 0.82rem);
    font-weight: 850;
  }

  .home-live-sidebar label {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin: 0.48rem 0;
    font-size: clamp(0.66rem, 0.9vw, 0.86rem);
    line-height: 1.2;
  }

  .home-live-sidebar label span {
    width: 0.78rem;
    height: 0.78rem;
    flex: 0 0 auto;
    border: 1.5px solid #94a3b8;
    border-radius: 0.18rem;
  }

  .home-live-sidebar label span.is-on {
    background: #0f5bff;
    border-color: #0f5bff;
    box-shadow: inset 0 0 0 2px #fff;
  }

  .home-live-slider {
    position: relative;
    height: 1.9rem;
  }

  .home-live-slider::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0.9rem;
    height: 0.32rem;
    border-radius: 999px;
    background: #0f5bff;
  }

  .home-live-slider span,
  .home-live-slider::after {
    content: '';
    position: absolute;
    top: 0.58rem;
    width: 0.92rem;
    height: 0.92rem;
    border-radius: 999px;
    background: #0f5bff;
    box-shadow: 0 2px 6px rgba(15, 91, 255, 0.3);
  }

  .home-live-slider span { left: 0; }
  .home-live-slider::after { right: 0; }

  .home-live-latency {
    display: block;
    margin-top: 0.35rem;
    color: #0f5bff;
    font-size: clamp(0.82rem, 1.15vw, 1.05rem);
  }

  .home-live-latency small {
    color: #64748b;
    font-size: 0.72em;
  }

  .home-live-main {
    position: relative;
    min-width: 0;
    padding: clamp(0.85rem, 2vw, 1.65rem);
    background: #ffffff;
  }

  .home-live-searchbar {
    width: min(100%, 560px);
    height: clamp(2.55rem, 4.1vw, 3.35rem);
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0 1.15rem;
    border: 1.5px solid #d9e2ed;
    border-radius: 0.72rem;
    color: #111827;
    font-size: clamp(0.86rem, 1.2vw, 1.06rem);
    background: #ffffff;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
  }

  .home-live-searchbar svg {
    color: #475569;
    font-size: 0.95em;
    flex: 0 0 auto;
  }

  .home-live-searchbar span {
    min-width: 8ch;
    white-space: nowrap;
  }

  .home-live-searchbar i {
    width: 0.09rem;
    height: 1.18rem;
    display: inline-block;
    border-radius: 999px;
    background: #0f172a;
    animation: homeLiveCursor 0.78s steps(2, jump-none) infinite;
  }

  .home-live-suggestions {
    position: absolute;
    left: clamp(1rem, 2.5vw, 2.1rem);
    top: calc(clamp(0.85rem, 2vw, 1.65rem) + clamp(2.55rem, 4.1vw, 3.35rem) + 0.32rem);
    z-index: 4;
    width: min(100% - clamp(1.7rem, 4vw, 3.3rem), 560px);
    padding: 0.65rem 0;
    border: 1px solid #dce5ef;
    border-radius: 0.8rem;
    background: rgba(255, 255, 255, 0.986);
    box-shadow: 0 18px 44px rgba(15, 23, 42, 0.14), inset 0 1px 0 rgba(255,255,255,.8);
    animation: homeLiveSuggestBox 5.7s ease-in-out infinite;
  }

  .home-live-suggestion {
    min-height: 2.1rem;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0 1.1rem;
    color: #111827;
    font-size: clamp(0.78rem, 1.08vw, 0.94rem);
    font-weight: 680;
    opacity: 0;
    transform: translateY(6px);
    animation: homeLiveSuggestion 5.7s ease-in-out infinite;
    animation-delay: calc(var(--suggestion-index) * 0.16s);
  }

  .home-live-suggestion svg {
    width: 1rem;
    color: #334155;
    flex: 0 0 auto;
  }

  .home-live-results-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-top: clamp(4.35rem, 6vw, 5.25rem);
  }

  .home-live-results-head h3 {
    margin: 0 0 0.35rem;
    color: #101828;
    font-size: clamp(1.15rem, 2vw, 1.65rem);
    line-height: 1.08;
    letter-spacing: 0;
  }

  .home-live-results-head p {
    margin: 0;
    color: #475569;
    font-size: clamp(0.72rem, 1vw, 0.9rem);
    line-height: 1.4;
  }

  .home-live-results-head strong {
    color: #0f5bff;
  }

  .home-live-results-head > span {
    margin-top: 0.4rem;
    padding: 0.58rem 0.9rem;
    border: 1px solid #dce5ef;
    border-radius: 0.65rem;
    color: #111827;
    background: #fff;
    font-size: clamp(0.68rem, 0.95vw, 0.82rem);
    font-weight: 720;
  }

  .home-live-chips {
    display: flex;
    gap: 0.72rem;
    margin: 0.75rem 0 0.7rem;
    overflow: hidden;
  }

  .home-live-chips span {
    padding: 0.58rem 1.05rem;
    border: 1px solid #dce5ef;
    border-radius: 0.65rem;
    color: #111827;
    background: #fff;
    font-size: clamp(0.68rem, 0.95vw, 0.82rem);
    font-weight: 720;
    white-space: nowrap;
  }

  .home-search-results-panel {
    position: absolute;
    left: clamp(0.85rem, 2vw, 1.65rem);
    right: clamp(0.85rem, 2vw, 1.65rem);
    bottom: clamp(0.85rem, 2vw, 1.35rem);
    display: grid;
    gap: 0.55rem;
    padding: 0.85rem;
    border: 1px solid rgba(203, 213, 225, 0.92);
    border-radius: 1rem;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.95));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09), inset 0 1px 0 rgba(255,255,255,.95);
    animation: homeLiveResultIn 5.7s ease-in-out infinite;
  }

  .home-search-results-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    min-height: 2rem;
    padding: 0 0.2rem 0.35rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .home-search-results-toolbar strong {
    min-width: 0;
    overflow: hidden;
    color: #0f172a;
    font-size: clamp(0.72rem, 1vw, 0.88rem);
    font-weight: 880;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-search-results-toolbar span {
    flex: 0 0 auto;
    padding: 0.35rem 0.58rem;
    border-radius: 999px;
    background: #eff6ff;
    color: #1d4ed8;
    font-size: clamp(0.58rem, 0.82vw, 0.68rem);
    font-weight: 850;
  }

  .home-search-result-row {
    display: grid;
    grid-template-columns: clamp(2.1rem, 3.5vw, 3rem) minmax(0, 1fr) minmax(5.4rem, 0.24fr);
    align-items: center;
    gap: 0.75rem;
    min-height: clamp(3.35rem, 5.6vw, 4.55rem);
    padding: 0.55rem 0.65rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.78rem;
    background: rgba(255,255,255,0.86);
    opacity: 0;
    transform: translateY(10px);
    animation: homeLiveResultIn 5.7s ease-in-out infinite;
    animation-delay: calc(0.22s + var(--result-index) * 0.1s);
  }

  .home-search-result-icon {
    width: clamp(2.1rem, 3.5vw, 3rem);
    height: clamp(2.1rem, 3.5vw, 3rem);
    display: grid;
    place-items: center;
    border-radius: 0.72rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f5bff, #14b8a6);
    box-shadow: 0 12px 20px rgba(15, 91, 255, 0.18), inset 0 1px 0 rgba(255,255,255,.24);
  }

  .home-search-result-copy {
    min-width: 0;
  }

  .home-search-result-copy h4,
  .home-search-result-copy p,
  .home-search-result-copy small {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-search-result-copy h4 {
    margin: 0;
    color: #0f172a;
    font-size: clamp(0.72rem, 1.02vw, 0.92rem);
    font-weight: 880;
    letter-spacing: 0;
  }

  .home-search-result-copy p {
    margin: 0.18rem 0 0;
    color: #475569;
    font-size: clamp(0.58rem, 0.82vw, 0.72rem);
    font-weight: 680;
  }

  .home-search-result-copy small {
    margin-top: 0.16rem;
    color: #64748b;
    font-size: clamp(0.54rem, 0.76vw, 0.66rem);
    font-weight: 720;
  }

  .home-search-result-meta {
    min-width: 0;
    display: grid;
    gap: 0.32rem;
    justify-items: end;
  }

  .home-search-result-meta em {
    max-width: 100%;
    overflow: hidden;
    padding: 0.34rem 0.48rem;
    border: 1px solid #b7efc5;
    border-radius: 999px;
    background: #dcfce7;
    color: #15803d;
    font-size: clamp(0.54rem, 0.78vw, 0.66rem);
    font-style: normal;
    font-weight: 850;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-search-result-meta span {
    color: #0f5bff;
    font-size: clamp(0.54rem, 0.76vw, 0.66rem);
    font-weight: 900;
  }

  .home-search-result-meta i {
    width: min(100%, 4.8rem);
    height: 0.3rem;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .home-search-result-meta b {
    display: block;
    width: var(--score-width);
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0f5bff, #14b8a6);
  }

  .home-demo-panel {
    position: absolute;
    left: clamp(0.85rem, 2vw, 1.65rem);
    bottom: clamp(0.85rem, 2vw, 1.35rem);
    z-index: 2;
    width: min(54%, 520px);
    min-height: clamp(11.4rem, 15vw, 13.4rem);
    overflow: hidden;
    border: 1px solid rgba(203, 213, 225, 0.92);
    border-radius: 1rem;
    background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,250,252,.95));
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09), inset 0 1px 0 rgba(255,255,255,.95);
    animation: homeLiveResultIn 5.7s ease-in-out infinite;
  }

  .home-demo-panel-top {
    min-height: 3.35rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.85rem;
    padding: 0.72rem 0.9rem;
    background: #172033;
    color: #ffffff;
  }

  .home-demo-panel-top h4 {
    margin: 0;
    font-size: clamp(0.78rem, 1.05vw, 0.95rem);
    line-height: 1.1;
    font-weight: 880;
    letter-spacing: 0;
  }

  .home-demo-panel-top p {
    margin: 0.18rem 0 0;
    color: rgba(255,255,255,0.72);
    font-size: clamp(0.58rem, 0.8vw, 0.7rem);
    line-height: 1.2;
  }

  .home-demo-panel-actions {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex: 0 0 auto;
  }

  .home-demo-panel-actions span,
  .home-demo-panel-actions strong {
    display: inline-flex;
    align-items: center;
    min-height: 1.7rem;
    padding: 0 0.62rem;
    border-radius: 0.5rem;
    background: #ffffff;
    color: #172033;
    font-size: clamp(0.58rem, 0.78vw, 0.7rem);
    font-weight: 850;
    white-space: nowrap;
  }

  .home-demo-search {
    height: 2.3rem;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin: 0.75rem 0.85rem 0.65rem;
    padding: 0 0.72rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.65rem;
    color: #64748b;
    background: #f8fafc;
    font-size: clamp(0.62rem, 0.86vw, 0.75rem);
  }

  .home-demo-search svg {
    flex: 0 0 auto;
    color: #94a3b8;
  }

  .home-demo-table {
    margin: 0 0.85rem 0.85rem;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 0.65rem;
  }

  .home-demo-row {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) 5.2rem;
    align-items: center;
    min-height: 1.9rem;
    gap: 0.55rem;
    padding: 0 0.7rem;
    border-top: 1px solid #e2e8f0;
    color: #475569;
    font-size: clamp(0.58rem, 0.82vw, 0.72rem);
  }

  .home-demo-row:first-child {
    border-top: 0;
  }

  .home-demo-row-head {
    min-height: 2rem;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .home-demo-row strong {
    min-width: 0;
    overflow: hidden;
    color: #0f172a;
    font-weight: 780;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-live-grid {
    position: absolute;
    left: auto;
    right: clamp(0.85rem, 2vw, 1.65rem);
    bottom: clamp(0.85rem, 2vw, 1.35rem);
    z-index: 3;
    width: min(40%, 390px);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.72rem, 1.7vw, 1.4rem);
  }

  .home-live-product:nth-child(n + 3) {
    display: none;
  }

  .home-live-product {
    min-width: 0;
    min-height: clamp(11.4rem, 15vw, 13.4rem);
    padding: clamp(0.65rem, 1.25vw, 0.9rem);
    border: 1px solid #dce5ef;
    border-radius: 1rem;
    background:
      linear-gradient(180deg, rgba(255,255,255,.98), rgba(248,251,255,.92)),
      radial-gradient(circle at 30% 8%, rgba(15,91,255,.045), transparent 38%);
    box-shadow: 0 14px 30px rgba(15,23,42,.055), inset 0 1px 0 rgba(255,255,255,.92);
    opacity: 0;
    transform: translateY(12px) scale(0.985);
    animation: homeLiveResultIn 5.7s ease-in-out infinite;
    animation-delay: calc(0.25s + var(--result-index) * 0.12s);
  }

  .home-live-product-photo {
    height: clamp(3.8rem, 6.5vw, 5.6rem);
    display: grid;
    place-items: center;
    margin-bottom: 0.8rem;
    border-radius: 0.85rem;
    background:
      radial-gradient(circle at 35% 18%, rgba(15, 91, 255, 0.16), transparent 38%),
      linear-gradient(180deg, #f8fbff, #eef5ff);
  }

  .home-live-product-photo svg {
    width: clamp(1.8rem, 3.1vw, 2.8rem);
    height: clamp(1.8rem, 3.1vw, 2.8rem);
    padding: 0.62rem;
    border-radius: 0.9rem;
    color: #ffffff;
    background: linear-gradient(135deg, #0f5bff, #14b8a6);
    box-shadow: 0 16px 28px rgba(15, 91, 255, 0.24), inset 0 1px 0 rgba(255,255,255,.28);
  }

  .home-live-product h4 {
    margin: 0;
    color: #101828;
    font-size: clamp(0.8rem, 1.16vw, 1.02rem);
    line-height: 1.16;
    font-weight: 880;
    letter-spacing: 0;
  }

  .home-live-product p {
    margin: 0;
  }

  .home-live-product-source {
    margin-top: 0.35rem !important;
    color: #64748b;
    font-size: clamp(0.62rem, 0.86vw, 0.76rem);
    line-height: 1.25;
  }

  .home-live-product-snippet {
    margin-top: 0.55rem !important;
    color: #475569;
    font-size: clamp(0.65rem, 0.9vw, 0.78rem);
    line-height: 1.38;
  }

  .home-live-product-score {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    margin-top: 0.62rem;
    color: #0f5bff;
    font-size: clamp(0.62rem, 0.86vw, 0.74rem);
    font-weight: 850;
  }

  .home-live-product-score i {
    flex: 1;
    height: 0.35rem;
    overflow: hidden;
    border-radius: 999px;
    background: #e2e8f0;
  }

  .home-live-product-score b {
    display: block;
    width: var(--score-width);
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0f5bff, #14b8a6);
  }

  .home-live-product em {
    display: inline-flex;
    margin-top: 0.7rem;
    padding: 0.45rem 0.72rem;
    border: 1px solid #b7efc5;
    border-radius: 0.55rem;
    background: #dcfce7;
    color: #15803d;
    font-size: clamp(0.62rem, 0.86vw, 0.74rem);
    font-style: normal;
    font-weight: 840;
  }

  @keyframes homeLiveCursor {
    0%, 44% { opacity: 1; }
    45%, 100% { opacity: 0; }
  }

  @keyframes homeLiveSuggestBox {
    0%, 8% { opacity: 0; transform: translateY(-5px); }
    15%, 58% { opacity: 1; transform: translateY(0); }
    70%, 100% { opacity: 0; transform: translateY(-5px); }
  }

  @keyframes homeLiveSuggestion {
    0%, 12% { opacity: 0; transform: translateY(6px); }
    20%, 55% { opacity: 1; transform: translateY(0); }
    68%, 100% { opacity: 0; transform: translateY(-4px); }
  }

  @keyframes homeLiveResultIn {
    0%, 22% { opacity: 0; transform: translateY(12px) scale(0.985); }
    34%, 82% { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0.35; transform: translateY(0) scale(0.995); }
  }

  .landing-page .home-hero .home-hero-search-visual picture {
    display: block !important;
    width: 100% !important;
  }

  .landing-page .home-hero .home-hero-banner-stack {
    position: relative;
    display: block;
    width: 100%;
    border-radius: clamp(16px, 1.65vw, 24px);
  }

  .landing-page .home-hero .home-hero-banner-image {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    max-width: none !important;
    margin: 0 0 0 auto !important;
    object-fit: contain !important;
    object-position: right center !important;
    image-rendering: auto !important;
    clip-path: none !important;
    filter: none !important;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .landing-page .home-hero .home-hero-banner-image-primary {
    position: relative;
    z-index: 1;
  }

  .landing-page .home-hero .home-hero-banner-image-secondary,
  .landing-page .home-hero .home-hero-banner-image-tertiary {
    position: absolute;
    inset: 0;
  }

  .landing-page .home-hero .home-hero-banner-image-secondary {
    z-index: 2;
  }

  .landing-page .home-hero .home-hero-banner-image-tertiary {
    z-index: 3;
  }

  .landing-page .home-hero .home-hero-banner-image-primary,
  .landing-page .home-hero .home-hero-banner-image-secondary,
  .landing-page .home-hero .home-hero-banner-image-tertiary {
    opacity: 0;
    transition: opacity 0.32s ease-in-out;
  }

  .landing-page .home-hero .home-hero-banner-image.is-active {
    opacity: 1;
  }

  .landing-page .home-hero .home-hero-education-url {
    position: absolute;
    z-index: 10;
    left: 30%;
    top: 2.25%;
    width: 34%;
    height: 4.45%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    color: #1e293b;
    background: #f1f5f9;
    font-size: clamp(7px, 0.85vw, 14px);
    letter-spacing: -0.015em;
    pointer-events: none;
  }

  .landing-page .home-hero .home-hero-education-url svg {
    width: clamp(8px, 0.9vw, 15px);
    height: clamp(8px, 0.9vw, 15px);
    color: #475569;
  }

  .landing-page .home-hero .home-hero-education-panel {
    position: absolute;
    z-index: 5;
    inset: 8.7% 0.45% 0.6%;
    display: grid;
    grid-template-columns: 18% 1fr;
    overflow: hidden;
    color: #172033;
    background: #ffffff;
    font-size: clamp(5px, 0.68vw, 11px);
    text-align: left;
    pointer-events: none;
  }

  .landing-page .home-hero .education-panel-sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.72em;
    padding: 6% 8%;
    border-right: 1px solid #dbe4ef;
    background: #fbfdff;
  }

  .landing-page .home-hero .education-panel-brand {
    margin-bottom: 1.2em;
    font-size: 1.55em;
    letter-spacing: -0.025em;
  }

  .landing-page .home-hero .education-panel-label {
    margin-top: 0.7em;
    color: #64748b;
    font-size: 0.88em;
    font-weight: 700;
    text-transform: uppercase;
  }

  .landing-page .home-hero .education-panel-select {
    display: flex;
    justify-content: space-between;
    padding: 0.75em;
    border: 1px solid #cbd5e1;
    border-radius: 0.55em;
    background: #ffffff;
    font-weight: 650;
  }

  .landing-page .home-hero .education-panel-filter {
    padding: 0.35em 0;
    color: #475569;
  }

  .landing-page .home-hero .education-panel-filter.is-active {
    color: #2563eb;
    font-weight: 700;
  }

  .landing-page .home-hero .education-panel-period-label {
    margin-top: 1.5em;
  }

  .landing-page .home-hero .education-panel-main {
    display: flex;
    flex-direction: column;
    padding: 12.5% 4.5% 4%;
    background: #f8fafc;
  }

  .landing-page .home-hero .education-panel-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 2.4em;
  }

  .landing-page .home-hero .education-panel-heading > span:first-child {
    display: flex;
    flex-direction: column;
    gap: 0.35em;
  }

  .landing-page .home-hero .education-panel-heading strong {
    font-size: 2.1em;
    letter-spacing: -0.035em;
  }

  .landing-page .home-hero .education-panel-heading small {
    color: #64748b;
    font-size: 1em;
  }

  .landing-page .home-hero .education-panel-average {
    display: flex;
    align-items: center;
    gap: 0.65em;
    color: #64748b;
  }

  .landing-page .home-hero .education-panel-average b {
    padding: 0.35em 0.65em;
    border-radius: 0.6em;
    color: #166534;
    background: #dcfce7;
    font-size: 1.2em;
  }

  .landing-page .home-hero .education-panel-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.3em;
    margin-bottom: 2.4em;
  }

  .landing-page .home-hero .education-panel-summary > span {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1em 1.2em;
    border: 1px solid #dbe4ef;
    border-radius: 0.75em;
    background: #ffffff;
  }

  .landing-page .home-hero .education-panel-summary small {
    color: #64748b;
  }

  .landing-page .home-hero .education-panel-summary strong {
    color: #2563eb;
    font-size: 1.45em;
  }

  .landing-page .home-hero .education-student-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5em;
  }

  .landing-page .home-hero .education-student-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
    padding: 1.4em;
    border: 1px solid #dbe4ef;
    border-radius: 1em;
    background: #ffffff;
    box-shadow: 0 0.45em 1.4em rgba(15, 23, 42, 0.06);
  }

  .landing-page .home-hero .education-student-avatar {
    display: grid;
    place-items: center;
    width: 2.8em;
    height: 2.8em;
    margin-bottom: 0.8em;
    border-radius: 50%;
    color: #1d4ed8;
    background: #dbeafe;
    font-weight: 800;
  }

  .landing-page .home-hero .education-student-card > strong {
    font-size: 1.25em;
  }

  .landing-page .home-hero .education-student-card > small {
    margin-top: 0.55em;
    color: #64748b;
  }

  .landing-page .home-hero .education-grade {
    margin: 0.15em 0 0.65em;
    color: #0f766e;
    font-size: 2.15em;
  }

  .landing-page .home-hero .education-subject {
    display: flex;
    width: 100%;
    justify-content: space-between;
    padding: 0.5em 0;
    border-top: 1px solid #eef2f7;
  }

  .landing-page .home-hero .education-subject i {
    color: #64748b;
    font-style: normal;
  }

  .landing-page .home-hero .education-status {
    margin-top: 0.9em;
    padding: 0.45em 0.7em;
    border-radius: 999px;
    color: #166534;
    background: #dcfce7;
    font-size: 0.86em;
    font-weight: 700;
  }

  .landing-page .home-hero .education-status-attention {
    color: #9a3412;
    background: #ffedd5;
  }

  .landing-page .home-hero .home-hero-query-icon {
    position: absolute;
    z-index: 8;
    left: 21.35%;
    top: 13.15%;
    width: 2.2%;
    height: 3.15%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111827;
    background: #f1f5f9;
    pointer-events: none;
  }

  .landing-page .home-hero .home-hero-query-icon svg {
    display: block;
    width: clamp(10px, 1vw, 16px);
    height: clamp(10px, 1vw, 16px);
  }

  .landing-page .home-hero .home-hero-api-title-cover {
    display: none;
  }

  .landing-page .home-hero .home-hero-query-typing {
    position: absolute;
    z-index: 8;
    left: 23.55%;
    top: 13.15%;
    width: 39.4%;
    height: 3.15%;
    display: flex;
    align-items: center;
    gap: 0.13rem;
    overflow: hidden;
    box-sizing: border-box;
    padding-left: 1.05%;
    color: #111827;
    background: #f1f5f9;
    box-shadow: -4px 0 0 #f1f5f9, 4px 0 0 #f1f5f9;
    font-size: clamp(8px, 0.8vw, 13px);
    font-weight: 500;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
  }

  .landing-page .home-hero .home-hero-query-caret {
    width: 1px;
    height: 1.05em;
    flex: 0 0 1px;
    background: currentColor;
    animation: homeHeroQueryCaret 0.72s steps(1, end) infinite;
  }

  .landing-page .home-hero .home-hero-results-loading {
    position: absolute;
    z-index: 7;
    left: 18.1%;
    top: 23.4%;
    right: 1.2%;
    bottom: 1.2%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 0 14px 0;
    background: rgba(248, 250, 252, 0.84);
    backdrop-filter: blur(1px);
    pointer-events: none;
  }

  .landing-page .home-hero .home-hero-results-spinner {
    display: block;
    width: clamp(14px, 1.8vw, 28px);
    height: clamp(14px, 1.8vw, 28px);
    border: clamp(2px, 0.18vw, 3px) solid rgba(37, 99, 235, 0.18);
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: homeHeroResultsSpin 0.72s linear infinite;
  }

  @keyframes homeHeroQueryCaret {
    0%, 48% { opacity: 1; }
    49%, 100% { opacity: 0; }
  }

  @keyframes homeHeroResultsSpin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .landing-page .home-hero .home-hero-query-caret {
      animation: none !important;
      opacity: 0;
    }

    .landing-page .home-hero .home-hero-results-spinner {
      animation: none !important;
    }
  }

  .home-diagram-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .home-diagram-node {
    position: absolute;
    z-index: 4;
    display: grid;
    grid-template-columns: 1.1rem minmax(0, 1fr);
    gap: 0.36rem;
    align-items: center;
    width: min(188px, 30%);
    min-height: 42px;
    padding: 0.38rem 0.44rem;
    border: 1px solid rgba(191, 219, 254, 0.5);
    border-radius: 9px;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(239, 246, 255, 0.86));
    box-shadow:
      0 18px 42px rgba(15, 23, 42, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
  }

  .home-diagram-node strong,
  .home-diagram-node small {
    display: block;
    min-width: 0;
  }

  .home-diagram-node strong {
    color: #0f172a;
    font-size: 0.6rem;
    font-weight: 850;
    line-height: 1.15;
  }

  .home-diagram-node small {
    margin-top: 0.24rem;
    color: #475569;
    font-size: 0.48rem;
    font-weight: 650;
    line-height: 1.28;
  }

  .home-diagram-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.1rem;
    height: 1.1rem;
    border-radius: 6px;
    color: #ffffff;
    background: linear-gradient(135deg, #1d4ed8, #0891b2);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
    font-size: 0.5rem;
  }

  .home-diagram-title {
    position: absolute;
    left: 5%;
    top: 8%;
    z-index: 4;
    display: inline-grid;
    gap: 0.16rem;
    padding: 0.46rem 0.58rem;
    border: 1px solid rgba(191, 219, 254, 0.52);
    border-radius: 11px;
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.13);
    backdrop-filter: blur(10px);
  }

  .home-diagram-title span {
    color: #2563eb;
    font-size: 0.54rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .home-diagram-title strong {
    color: #0f172a;
    font-size: 0.66rem;
    font-weight: 900;
    line-height: 1;
  }

  .home-diagram-node-source {
    left: 4%;
    top: 24%;
  }

  .home-diagram-node-index {
    left: 3%;
    top: 48%;
  }

  .home-diagram-node-rank {
    left: 5%;
    top: 72%;
  }

  .home-diagram-node-api {
    right: 2%;
    top: 20%;
    border-color: rgba(29, 78, 216, 0.34);
  }

  .home-diagram-node-app {
    right: 4%;
    top: 58%;
  }

  .home-diagram-line {
    position: absolute;
    z-index: 3;
    display: block;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(37, 99, 235, 0.42), rgba(8, 145, 178, 0.9));
    box-shadow: 0 0 12px rgba(37, 99, 235, 0.22);
    transform-origin: left center;
  }

  .home-diagram-line::after {
    content: '';
    position: absolute;
    right: -0.16rem;
    top: 50%;
    width: 0.44rem;
    height: 0.44rem;
    border-top: 2px solid #0891b2;
    border-right: 2px solid #0891b2;
    transform: translateY(-50%) rotate(45deg);
  }

  .home-diagram-line-a {
    left: 27%;
    top: 30%;
    width: 18%;
    transform: rotate(1deg);
  }

  .home-diagram-line-b {
    left: 26%;
    top: 55%;
    width: 19%;
    transform: rotate(-16deg);
  }

  .home-diagram-line-c {
    left: 28%;
    top: 78%;
    width: 20%;
    transform: rotate(-30deg);
  }

  .home-diagram-line-d {
    left: 67%;
    top: 63%;
    width: 12%;
    transform: rotate(-168deg);
  }

  @media (max-width: 980px) {
    .landing-page .home-hero {
      padding-top: 2.2rem !important;
      min-height: auto !important;
    }

    .landing-page .home-hero .hero-container {
      transform: translateY(-24px) !important;
    }

    .landing-page .home-hero .hero-visual {
      margin-right: 0 !important;
      justify-content: center !important;
    }

    .landing-page .home-hero .home-hero-search-visual {
      width: min(100%, 760px) !important;
      transform: translateY(-8px) !important;
    }
  }

  @media (max-width: 768px) {
    .landing-page .home-hero:not(.hero-secondary) {
      min-height: auto !important;
      padding: 1.85rem 0 2.3rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-container {
      width: min(100%, calc(100vw - 2rem)) !important;
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
      align-items: start !important;
      transform: none !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-content {
      order: 1 !important;
      max-width: 100% !important;
      padding-top: 0 !important;
      text-align: left !important;
      transform: none !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-eyebrow {
      margin-bottom: 0.65rem !important;
      font-size: 0.7rem !important;
      line-height: 1.2 !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-title {
      max-width: 12ch !important;
      font-size: clamp(2.35rem, 10.9vw, 3.5rem) !important;
      line-height: 1.03 !important;
      letter-spacing: -0.035em !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-description {
      max-width: 100% !important;
      margin-top: 0.8rem !important;
      font-size: 0.92rem !important;
      line-height: 1.48 !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions {
      width: 100% !important;
      max-width: 100% !important;
      display: flex !important;
      flex-wrap: nowrap !important;
      gap: 0.55rem !important;
      margin-top: 1rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-primary,
    .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary {
      width: calc(50% - 0.275rem) !important;
      min-width: 0 !important;
      min-height: 43px !important;
      padding: 0.68rem 0.5rem !important;
      font-size: clamp(0.72rem, 3.35vw, 0.9rem) !important;
      white-space: nowrap !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-primary {
      width: calc(43% - 0.275rem) !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary {
      width: calc(57% - 0.275rem) !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-visual {
      order: 2 !important;
      display: flex !important;
      width: 100% !important;
      margin: 0 !important;
      justify-content: center !important;
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .home-hero-search-visual {
      display: block !important;
      width: min(94vw, 430px) !important;
      margin: 0 auto !important;
      transform: none !important;
      opacity: 1 !important;
      visibility: visible !important;
      animation: none !important;
      border-radius: 12px !important;
      filter: drop-shadow(0 14px 24px rgba(15, 23, 42, 0.13));
    }

    .landing-page .home-hero:not(.hero-secondary) .home-hero-banner-stack {
      display: block !important;
      width: 100% !important;
      aspect-ratio: 3496 / 2272;
      overflow: visible !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .home-hero-banner-image {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      object-position: center center !important;
      transform: none !important;
      visibility: visible !important;
    }

    .home-diagram-layer {
      position: relative;
      inset: auto;
      display: grid;
      gap: 0.55rem;
      margin-top: -1.2rem;
      padding: 0 0.4rem 0.25rem;
    }

    .home-diagram-line {
      display: none;
    }

    .home-diagram-title,
    .home-diagram-node {
      position: relative;
      left: auto;
      right: auto;
      top: auto;
      width: 100%;
    }

    .home-diagram-title {
      display: none;
    }

    .home-diagram-node {
      min-height: 58px;
      padding: 0.58rem 0.62rem;
    }
  }

  @media (max-width: 430px) {
    .landing-page .home-hero:not(.hero-secondary) {
      padding-top: 1.45rem !important;
      padding-bottom: 1.85rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-container {
      width: calc(100vw - 2rem) !important;
      max-width: calc(100vw - 2rem) !important;
      box-sizing: border-box !important;
      gap: 0.85rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-content,
    .landing-page .home-hero:not(.hero-secondary) .hero-description,
    .landing-page .home-hero:not(.hero-secondary) .hero-actions,
    .landing-page .home-hero:not(.hero-secondary) .hero-visual {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-title {
      font-size: clamp(2.25rem, 10.8vw, 3rem) !important;
      max-width: 12ch !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-description {
      font-size: 0.86rem !important;
      line-height: 1.44 !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .home-hero-search-visual {
      width: 100% !important;
      max-width: 390px !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-chevron {
      display: none !important;
    }

    .home-diagram-node {
      grid-template-columns: 1.9rem minmax(0, 1fr);
      gap: 0.5rem;
    }

    .home-diagram-icon {
      width: 1.9rem;
      height: 1.9rem;
    }

    .home-diagram-node strong {
      font-size: 0.72rem;
    }

    .home-diagram-node small {
      font-size: 0.58rem;
    }
  }

  @media (max-width: 768px) {
    .landing-page .invoices-container {
      width: 100% !important;
      max-width: 100% !important;
      padding-inline: 1rem !important;
      box-sizing: border-box !important;
    }

    .landing-page .invoices-grid,
    .landing-page .invoices-left,
    .landing-page .invoices-right,
    .landing-page .payment-methods-grid {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      transform: none !important;
      box-sizing: border-box !important;
    }

    .landing-page .payment-methods-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 0.7rem !important;
    }

    .landing-page .accounting-track-card {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      transform: none !important;
      box-sizing: border-box !important;
    }

    .landing-page .hero-section.hero-secondary {
      overflow: hidden !important;
    }

    .landing-page .hero-section.hero-secondary .hero-container,
    .landing-page .hero-section.hero-secondary .hero-visual-secondary,
    .landing-page .hero-section.hero-secondary .hero-content-secondary,
    .landing-page .hero-section.hero-secondary .hero-preview-box,
    .landing-page .hero-section.hero-secondary .hero-title-secondary,
    .landing-page .hero-section.hero-secondary .hero-description-secondary,
    .landing-page .hero-section.hero-secondary .hero-description-secondary-2,
    .landing-page .hero-section.hero-secondary .home-secondary-stats {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      transform: none !important;
    }

    .landing-page .hero-section.hero-secondary .hero-container {
      width: min(100%, calc(100vw - 2rem)) !important;
      padding-inline: 0 !important;
    }

    .landing-page .hero-section.hero-secondary .home-secondary-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.65rem;
    }

    .landing-page .hero-section.hero-secondary .home-secondary-stat strong {
      font-size: clamp(1.25rem, 6vw, 1.7rem);
    }

    .landing-page .hero-section.hero-secondary .home-secondary-stat span {
      font-size: 0.68rem;
    }
  }

  /* Mobile home hero: keep the fast-search message, remove the large product visual. */
  @media (max-width: 768px) {
    .landing-page .home-hero:not(.hero-secondary) .hero-visual {
      display: none !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-container {
      gap: 0 !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-content {
      padding-top: 10px !important;
    }
  }

  /* Closing CTA continues the light-gray area below the indexing card. */
  .landing-page-wrapper .landing-page > section.cta-section {
    margin-top: 0 !important;
    padding: 10rem 0 8.5rem !important;
    background: #f3f4f6 !important;
    overflow: hidden !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section::before,
  .landing-page-wrapper .landing-page > section.cta-section::after {
    content: none !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-container {
    display: grid !important;
    grid-template-columns: minmax(0, 3fr) minmax(210px, 1fr) !important;
    gap: clamp(3rem, 7vw, 7rem) !important;
    align-items: center !important;
    width: min(100% - 2rem, 1060px) !important;
    max-width: 1060px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: transparent !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-left {
    display: block !important;
    width: min(100%, 682px) !important;
    max-width: 682px !important;
    margin: 0 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-title {
    margin: 0 0 1.5rem !important;
    color: #0a2540 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 1.75rem !important;
    font-weight: 700 !important;
    line-height: 1.125 !important;
    letter-spacing: -0.025em !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-sub {
    max-width: 650px !important;
    margin: 0 0 1.5rem !important;
    color: #425466 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 1.125rem !important;
    font-weight: 400 !important;
    line-height: 1.55 !important;
    letter-spacing: 0 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-actions {
    display: flex !important;
    width: auto !important;
    max-width: none !important;
    grid-template-columns: none !important;
    gap: 0 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-primary {
    flex: 0 0 auto !important;
    width: fit-content !important;
    max-width: max-content !important;
    min-width: 0 !important;
    min-height: 34px !important;
    height: 34px !important;
    padding: 0 1rem !important;
    border: 0 !important;
    border-radius: 8px !important;
    background: #2563eb !important;
    color: #ffffff !important;
    box-shadow: none !important;
    font-size: 0.9375rem !important;
    font-weight: 600 !important;
    line-height: 1 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-primary:hover {
    background: #1d4ed8 !important;
    box-shadow: none !important;
    transform: none !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-primary .btn-chevron {
    font-size: 1.1rem !important;
    line-height: 1 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-aside {
    align-self: center !important;
    min-width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-aside-title {
    margin: 0 0 0.65rem !important;
    color: #0a2540 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    line-height: 1.45 !important;
    letter-spacing: -0.01em !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-aside-text {
    margin: 0 0 0.8rem !important;
    color: #425466 !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 0.95rem !important;
    font-weight: 400 !important;
    line-height: 1.55 !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-aside-link {
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.4rem !important;
    color: #2563eb !important;
    font-family: var(--font-family-sohne) !important;
    font-size: 0.9rem !important;
    font-weight: 600 !important;
    line-height: 1.4 !important;
    text-decoration: none !important;
  }

  .landing-page-wrapper .landing-page > section.cta-section .cta-aside-link:hover {
    color: #1d4ed8 !important;
  }

  @media (max-width: 768px) {
    .landing-page-wrapper .landing-page > section.cta-section {
      padding: 5rem 0 !important;
    }

    .landing-page-wrapper .landing-page > section.cta-section .cta-container {
      display: block !important;
      width: min(100% - 2.5rem, 1060px) !important;
    }

    .landing-page-wrapper .landing-page > section.cta-section .cta-primary {
      width: fit-content !important;
      max-width: max-content !important;
      padding: 0 1rem !important;
    }

    .landing-page-wrapper .landing-page > section.cta-section .cta-aside {
      margin-top: 3.25rem !important;
      padding: 0 !important;
      border-left: 0 !important;
    }
  }

  /* Hero CTAs: compact Stripe-like depth with a clean outlined docs action. */
  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-primary {
    border: 1px solid #1d4ed8 !important;
    background: linear-gradient(180deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%) !important;
    box-shadow:
      0 3px 0 #173f9f,
      0 10px 22px rgba(37, 99, 235, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.42) !important;
    transform: translateY(-1px) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-primary:hover {
    background: linear-gradient(180deg, #4b8df8 0%, #2563eb 48%, #1e40af 100%) !important;
    box-shadow:
      0 4px 0 #15388d,
      0 15px 30px rgba(37, 99, 235, 0.36),
      inset 0 1px 0 rgba(255, 255, 255, 0.48) !important;
    transform: translateY(-3px) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-primary:active {
    box-shadow:
      0 1px 0 #173f9f,
      0 5px 12px rgba(37, 99, 235, 0.24),
      inset 0 1px 0 rgba(255, 255, 255, 0.34) !important;
    transform: translateY(1px) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary {
    border: 1px solid #cbd5e1 !important;
    background: #ffffff !important;
    color: #334155 !important;
    box-shadow:
      0 2px 0 rgba(100, 116, 139, 0.2),
      0 7px 16px rgba(15, 23, 42, 0.1),
      inset 0 1px 0 #ffffff !important;
    transform: translateY(-1px) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary::before {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 55%, rgba(226, 232, 240, 0.28) 100%) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary:hover {
    border-color: #94a3b8 !important;
    background: #ffffff !important;
    color: #1e293b !important;
    box-shadow:
      0 3px 0 rgba(100, 116, 139, 0.24),
      0 11px 22px rgba(15, 23, 42, 0.14),
      inset 0 1px 0 #ffffff !important;
    transform: translateY(-3px) !important;
  }

  .landing-page-wrapper .landing-page .home-hero:not(.hero-secondary) .hero-actions .btn-secondary:active {
    box-shadow:
      0 1px 0 rgba(100, 116, 139, 0.2),
      0 4px 10px rgba(15, 23, 42, 0.09) !important;
    transform: translateY(1px) !important;
  }

  /* Final Home hero composition: centered copy first, full-width browser below. */
  .landing-page .home-hero:not(.hero-secondary) {
    min-height: 0 !important;
    padding: clamp(6rem, 8vw, 7.5rem) 0 clamp(1.5rem, 2.5vw, 2.5rem) !important;
    overflow: hidden !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-container {
    width: min(calc(100vw - 2rem), 1180px) !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    grid-template-columns: minmax(0, 1fr) !important;
    gap: clamp(1.75rem, 2.5vw, 2.5rem) !important;
    align-items: start !important;
    transform: none !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-visual {
    order: 2 !important;
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    justify-self: stretch !important;
    justify-content: center !important;
    margin: 0 !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .home-hero-search-visual {
    width: min(100%, 1100px) !important;
    max-width: 1100px !important;
    margin: 0 auto !important;
    transform: none !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-content {
    order: 1 !important;
    width: min(100%, 760px) !important;
    max-width: 760px !important;
    justify-self: center !important;
    padding: 0 !important;
    text-align: center !important;
    transform: translateY(-0.35rem) !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-eyebrow {
    justify-content: center !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-title {
    max-width: none !important;
    transform: none !important;
    color: transparent !important;
    background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 45%, #0f172a 100%) !important;
    background-size: 220% 100% !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    animation:
      heroTitleReveal 0.75s cubic-bezier(0.25, 0.85, 0.35, 1) forwards,
      homeDevToolsTitleShimmer 7.2s ease-in-out 0.75s infinite !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-description {
    max-width: 62ch !important;
    margin-right: auto !important;
    margin-left: auto !important;
  }

  .landing-page .home-hero:not(.hero-secondary) .hero-actions {
    margin-right: auto !important;
    margin-left: auto !important;
    justify-content: center !important;
  }

  /* Keep the feature introduction on the page's true visual center. */
  .landing-page .features-section .dev-tools-header {
    width: 100% !important;
    max-width: 820px !important;
    margin-right: auto !important;
    margin-left: auto !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
  }

  .landing-page .features-section .dev-tools-header .section-title,
  .landing-page .features-section .dev-tools-header .section-description {
    width: 100% !important;
    margin-right: auto !important;
    margin-left: auto !important;
    text-align: center !important;
  }

  .landing-page .features-section .dev-tools-header .section-description {
    max-width: 720px !important;
  }

  @media (max-width: 768px) {
    .landing-page .home-hero:not(.hero-secondary) {
      padding: 5.25rem 0 1.5rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-container {
      width: min(calc(100vw - 2rem), 1180px) !important;
      gap: 2rem !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-visual {
      display: flex !important;
      order: 2 !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-content {
      order: 1 !important;
      padding: 0 !important;
      text-align: center !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .home-hero-search-visual {
      width: 100% !important;
      max-width: 100% !important;
    }

    .landing-page .home-hero:not(.hero-secondary) .hero-actions {
      justify-content: center !important;
    }
  }
</style>
