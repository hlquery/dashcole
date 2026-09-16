<template>
  <div class="logos-page-wrapper">
    <Header />
    <div class="logos-page">
      <div class="bg-shape bg-triangle green-triangle"></div>
      <div class="bg-shape bg-circle orange-circle"></div>
      <div class="bg-shape bg-hexagon pink-hexagon"></div>

      <v-container class="content" fluid>
        <div class="hero">
          <h1>{{ t('header.logos') }}</h1>
          <p>{{ t('logos_page.subtitle') }}</p>
        </div>

        <v-row class="logo-grid" justify="center">
          <v-col
            v-for="logo in logos"
            :key="logo.src"
            cols="12"
            sm="6"
            md="4"
            class="logo-card-col"
          >
            <v-card class="logo-card" elevation="0">
              <div class="logo-card-top">
                <v-card-title class="logo-title">{{ logo.name }}</v-card-title>
                <a
                  :href="logo.src"
                  :download="logo.filename"
                  class="logo-download"
                  :aria-label="t('logos_page.download_aria', { name: logo.name })"
                  @click.stop
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="logo-download-icon">
                    <path
                      d="M12 3v10m0 0 4-4m-4 4-4-4M5 15v3h14v-3"
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </a>
              </div>
              <div
                class="logo-preview"
                :class="{ 'logo-preview-dark': logo.darkBackground }"
              >
                <img
                  :src="logo.src"
                  :alt="logo.name"
                  class="logo-image"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>

      </v-container>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const { t } = useI18n()

const logos = [
  { name: 'Main Logo', src: '/images/logos/logo.png', filename: 'logo.png' },
  { name: 'Profile', src: '/images/logos/profile.png', filename: 'profile.png' },
  { name: 'White Letters', src: '/images/logos/1.png', filename: '1.png', darkBackground: true },
  { name: 'Classic Logo', src: '/images/logos/2.png', filename: '2.png' },
  { name: 'Logo 4', src: '/images/logos/4.png', filename: '4.png' },
  { name: 'Favicon', src: '/images/logos/Favicon.png', filename: 'Favicon.png' },
  { name: 'Black White', src: '/images/logos/blackwhite.png', filename: 'blackwhite.png' },
  { name: 'Colored Black', src: '/images/logos/colroedblack.png', filename: 'colroedblack.png' }
]
</script>

<style scoped>
.logos-page-wrapper {
  display: contents;
}

.logos-page {
  padding-top: 0;
  min-height: 100vh;
  background: #f7faff !important;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  max-width: 100vw;
}

.bg-shape {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  will-change: transform, opacity;
  animation: floatMicro 14s ease-in-out infinite alternate;
  transform-origin: center center;
}

.bg-triangle {
  width: 0;
  height: 0;
  opacity: 0.12;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.12)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08));
}

.bg-circle {
  width: 150px;
  height: 150px;
  opacity: 0.15;
  border-radius: 50%;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.bg-hexagon {
  width: 140px;
  height: 140px;
  transform: rotate(15deg);
  opacity: 0.12;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.green-triangle {
  border-left: 35px solid transparent;
  border-right: 35px solid transparent;
  border-bottom: 60px solid #22c55e;
  top: 100px;
  right: 12%;
  opacity: 0.2;
}

.orange-circle {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  top: 250px;
  left: 3%;
  opacity: 0.22;
}

.pink-hexagon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  top: 120px;
  right: 1%;
  opacity: 0.18;
}

@keyframes floatMicro {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(0, 4px, 0);
  }
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 48px;
  position: relative;
  z-index: 3;
  width: 100%;
  box-sizing: border-box;
}

.hero {
  padding: 48px 0 28px;
  max-width: 680px;
}

.hero h1 {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  color: #0a2540;
  margin: 0 0 16px;
  letter-spacing: -0.03em;
}

.hero > p {
  font-size: 18px;
  line-height: 1.6;
  color: #000000 !important;
  font-weight: 400;
  letter-spacing: -0.01em;
  margin: 0;
}

.logo-grid {
  margin-bottom: 1.5rem;
}

.logo-card-col {
  padding: 0 12px !important;
  margin-bottom: 24px;
}

.logo-card {
  min-height: 280px;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.02) !important;
  border-radius: 16px !important;
  padding: 32px 28px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 6px 20px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.01) !important;
}

.logo-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-preview {
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0 0;
  border-radius: 12px;
}

.logo-preview-dark {
  background: #000000;
}

.logo-image {
  max-width: 100%;
  max-height: 112px;
  object-fit: contain;
  display: block;
}

.logo-title {
  padding: 0 !important;
  margin: 0 !important;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1.35;
  font-family: var(--font-family-sohne);
}

.logo-download {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #0a2540;
  background: #eef4f8;
  border: 1px solid rgba(10, 37, 64, 0.08);
  transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.logo-download:hover {
  transform: translateY(-1px);
  background: #dbeafe;
  color: #1d4ed8;
}

.logo-download-icon {
  width: 18px;
  height: 18px;
  display: block;
}

@media (max-width: 600px) {
  .content {
    padding: 24px 24px 40px !important;
  }

  .hero {
    padding: 60px 0 24px;
  }

  .hero h1 {
    font-size: 26px;
    line-height: 1.2;
  }

  .hero p {
    font-size: 16px;
  }

  .logo-card {
    min-height: auto;
    padding: 24px 20px;
  }

  .logo-preview {
    min-height: 124px;
  }
}
</style>
