<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand-col">
          <div class="footer-brand-stack">
            <router-link to="/" class="footer-brand" :aria-label="$t('footer.homeAria')">
              <img
                src="/images/logos/high-appbar.png"
                srcset="/images/logos/high-appbar.png 1x, /images/logos/high-appbar@2x.png 2x, /images/logos/high-appbar@3x.png 3x"
                alt="DashCole"
                class="footer-brand-logo"
                width="34"
                height="34"
                decoding="async"
              />
              <span class="footer-brand-text">DashCole</span>
            </router-link>
            <p class="footer-brand-slogan">{{ $t('footer.brandSlogan') }}</p>
          </div>
        </div>

        <div class="footer-links">
          <div class="footer-column">
            <h4>{{ $t('footer.product') }}</h4>
            <router-link to="/productos/dashcole">{{ $t('header.productDashCole') }}</router-link>
            <router-link to="/productos/integraciones">{{ $t('header.productApiGateway') }}</router-link>
            <router-link to="/que-hacemos">{{ $t('header.pricing') }}</router-link>
          </div>

        <div class="footer-column">
          <h4>{{ $t('footer.solutions') }}</h4>
          <router-link to="/soluciones/gestion-educacional">{{ $t('header.solutionEcommerce') }}</router-link>
          <router-link to="/solutions/finance">{{ $t('header.solutionFinance') }}</router-link>
          <router-link to="/solutions/saas">{{ $t('header.solutionSaas') }}</router-link>
          <router-link to="/soluciones/jardines">{{ $t('header.solutionFashion') }}</router-link>
        </div>

          <div class="footer-column">
            <h4>{{ $t('footer.developers') }}</h4>
            <a :href="getStartedUrl" target="_blank" rel="noopener">{{ $t('header.getStarted') }}</a>
            <a :href="guidesUrl" target="_blank" rel="noopener">{{ $t('header.guides') }}</a>
            <router-link to="/faq">{{ $t('header.faq') }}</router-link>
            <a href="https://github.com/hlquery/dashcole" target="_blank" rel="noopener">{{ $t('header.github') }}</a>
            <router-link to="/contact">{{ $t('footer.contact') }}</router-link>
          </div>
        </div>
      </div>

      <div class="footer-meta">
        <p class="footer-copyright">© {{ currentYear }} dashcole. {{ $t('footer.rightsReserved') }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'Footer',
  components: {
    RouterLink
  },
  computed: {
    guidesUrl() {
      return String(import.meta.env.VITE_GUIDES_URL || 'https://guias.hlquery.com/').trim()
    },
    getStartedUrl() {
      return String(
        import.meta.env.VITE_GET_STARTED_URL ||
        'https://guias.hlquery.com/installation/como-instalar-dashcole'
      ).trim()
    },
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  background: #f5f9fc !important;
  background-image: none !important;
  padding: 0;
  font-family: var(--font-family-sohne);
  position: relative;
  border-top: none;
  z-index: 2;
}

.footer-container {
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
  padding: 7.5rem 0 2.5rem;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  gap: 0;
  margin: 0 0 3.5rem;
  align-items: start;
}

.footer-brand-col {
  display: grid;
  gap: 0.7rem;
  justify-items: start;
  text-align: left;
}

.footer-brand-stack {
  display: grid;
  gap: 0.55rem;
  justify-items: start;
  width: max-content;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  transition: transform 0.24s ease, filter 0.24s ease, opacity 0.24s ease;
}

.footer-brand:hover {
  opacity: 0.98;
  transform: translateY(-1px) scale(1.02);
  filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.16));
}

.footer-brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  image-rendering: auto;
  display: block;
  flex-shrink: 0;
  transition: transform 0.24s ease;
}

.footer-brand:hover .footer-brand-logo {
  transform: rotate(-5deg);
}

.footer-brand-text {
  font-size: 1.36rem;
  font-weight: 900;
  color: #0a2540;
  letter-spacing: -0.03em;
  line-height: 1;
}

.footer-brand-slogan {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: #000000 !important;
  letter-spacing: -0.01em;
}

.footer-social-group {
  display: grid;
  justify-items: start;
  gap: 0.45rem;
  margin-top: 1.25rem;
}

.footer-social-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.footer-social-label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  color: #000000 !important;
}

.footer-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.16);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.2;
  text-decoration: none;
  transition: filter 0.24s ease, opacity 0.24s ease, background-color 0.24s ease, border-color 0.24s ease, transform 0.24s ease;
  margin-top: 0.15rem;
}

.footer-social-link:hover {
  opacity: 0.95;
  background-color: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
  filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.2));
  transform: translateY(-1px);
}

.footer-social-icon {
  width: 17px;
  height: 17px;
  object-fit: contain;
  display: block;
  transition: filter 0.24s ease;
  filter: brightness(0);
}

.footer-social-icon-github {
  width: 18px;
  height: 18px;
}

.footer-social-link:hover .footer-social-icon {
  filter: brightness(0) invert(1);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  width: 100%;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-top: 1rem;
  border-top: none;
}

.footer-copyright {
  margin: 0;
  font-size: 0.76rem;
  line-height: 1.5;
  color: #000000;
  letter-spacing: -0.01em;
}

.footer-column {
  text-align: left;
}

.footer-column h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #0a2540;
  margin-bottom: 0.84rem;
  letter-spacing: -0.01em;
  text-transform: none;
  line-height: 1.3;
  -webkit-font-smoothing: antialiased;
}

.footer-column a {
  display: block;
  color: #0a2540;
  text-decoration: none;
  font-size: 0.88rem;
  margin-bottom: 0.45rem;
  line-height: 1.6;
  transition: color 0.2s ease, transform 0.2s ease;
}

.footer-column a:hover {
  color: #0f172a;
  transform: translateX(2px);
}

@media (max-width: 900px) {
  .footer-container {
    padding: 5rem 2rem 2rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 2.1rem;
  }

  .footer-links {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.6rem;
  }

}

@media (max-width: 640px) {
  .footer {
    padding: 0;
  }

  .footer-container {
    padding: 4rem 1.25rem 1.5rem;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .footer-meta {
    padding-top: 0.9rem;
  }
}

</style>
