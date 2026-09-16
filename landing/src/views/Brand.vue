<template>
  <div class="brand-page">
    <section class="hero">
      <div class="hero-inner">
        <h1 class="title">{{ t('brand_title') }}</h1>
        <p class="subtitle">
          {{ t('brand_subtitle') }}
        </p>
      </div>
    </section>

    <v-container class="content" fluid>
      <v-row>
        <v-col cols="12" md="8" class="mx-auto">
          <v-card class="about-card">
            <v-card-text>
              <h2 class="section-title">{{ t('brand_what_we_do_title') }}</h2>
              <p class="lead">
                {{ t('brand_what_we_do_description') }}
              </p>
              <ul class="bullets">
                <li>{{ t('brand_bullet_integrations') }}</li>
                <li>{{ t('brand_bullet_widgets') }}</li>
                <li>{{ t('brand_bullet_security') }}</li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="10" class="mx-auto">
          <h2 class="section-title logos">{{ t('brand_integrations_title') }}</h2>
          <div class="logos-grid">
            <v-tooltip v-for="logo in logos" :key="logo.alt" location="top">
              <template #activator="{ props }">
                <img v-bind="props" :src="logo.src" :alt="logo.alt" class="logo-img" :title="logo.alt" />
              </template>
              <span>{{ logo.alt }}</span>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const logos = [
  // Company-provided brand variations
  { src: '/images/logos/Imgv-alta-04.png', alt: 'CazuApp Vertical Color' },
  { src: '/images/logos/Imgv-alta-b-04.png', alt: 'CazuApp Vertical White' },
  { src: '/images/logos/Imgv-alta-n-04.png', alt: 'CazuApp Vertical Black' },
  { src: '/images/logos/Imgh-alta-04.png', alt: 'CazuApp Horizontal Color' },
  { src: '/images/logos/Imgh-alta-b-04.png', alt: 'CazuApp Horizontal White' },
  { src: '/images/logos/Imgh-alta-n-04.png', alt: 'CazuApp Horizontal Black' },
  // Example ecosystem logos you added
  { src: '/images/etc/stripe.png', alt: 'Stripe' },
  { src: '/images/etc/twitter.png', alt: 'Twitter' },
  { src: '/images/etc/whatsapp.png', alt: 'WhatsApp' },
  { src: '/images/etc/apple.png', alt: 'Apple' },
  { src: '/images/etc/flutter.png', alt: 'Flutter' },
  { src: '/images/etc/wordpress.png', alt: 'WordPress' },
  { src: '/images/etc/shopify.png', alt: 'Shopify' },
  { src: '/images/etc/WooCommerce-Logo-1536x864.png', alt: 'WooCommerce' },
  { src: '/images/etc/GitHub_Logo.png', alt: 'GitHub' }
]
</script>

<style scoped>
.brand-page { padding-top: 96px; }
.hero { background: linear-gradient(180deg,#fbfbff 0%,#ffffff 100%); border-bottom:1px solid #eff6ff; }
.hero-inner { max-width: 1100px; margin: 0 auto; padding: 28px 16px; text-align: center; }
.title { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
.subtitle { color:#6b7280; margin-top: 6px; }
.content { max-width: 1100px; }
.about-card { border-radius: 16px; border:1px solid rgba(229,231,235,.8); }
.section-title { font-size: 1.25rem; font-weight: 800; margin: 6px 0 12px; }
.lead { color:#334155; }
.bullets { margin: 0; padding-left: 1.1rem; }
.logos { text-align:center; margin-top: 10px; }
.logos-grid { display:flex; flex-wrap:wrap; gap: 16px 20px; align-items:center; justify-content:center; }
.logo-img { height: 32px; object-fit: contain; filter: grayscale(15%); opacity: 0.95; transition: transform .15s ease, filter .15s ease, opacity .15s ease; }
.logo-img:hover { transform: translateY(-1px) scale(1.03); filter: grayscale(0%); opacity: 1; }
@media (min-width: 960px) { .logo-img { height: 36px; } }
</style>
