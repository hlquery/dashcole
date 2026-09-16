<template>
  <div class="tos-page">
    <Header />

    <main class="tos-main">
      <section class="tos-header">
        <h1 class="tos-title">{{ tosI18n.title }}</h1>
        <p class="tos-subtitle">
          {{ tosI18n.subtitle }}
        </p>
      </section>

      <article class="tos-card">
        <section
          v-for="section in sections"
          :id="section.anchor"
          :key="section.anchor"
          class="tos-section"
        >
          <h2 class="tos-section-title">
            <font-awesome-icon
              :icon="getSectionIcon(section.anchor)"
              class="tos-section-icon"
              aria-hidden="true"
            />
            <span>{{ section.title }}</span>
          </h2>
          <p v-for="(paragraph, index) in section.paragraphs" :key="index" class="tos-paragraph">
            {{ paragraph }}
          </p>
          <ul v-if="section.list?.length" class="tos-list">
            <li v-for="(item, index) in section.list" :key="index" class="tos-list-item">
              {{ item }}
            </li>
          </ul>
        </section>
      </article>

      <p class="tos-updated">{{ t('tos_page.lastUpdatedLine', { date: tosI18n.lastUpdated }) }}</p>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faCircleCheck,
  faGear,
  faFileInvoice,
  faCreditCard,
  faFileLines,
  faTriangleExclamation,
  faCircleInfo,
  faShield,
  faRotate,
} from '@fortawesome/free-solid-svg-icons'
import Header from '@/components/Header.vue'

const { t, tm } = useI18n()
const tosI18n = computed(() => tm('tos_page'))
const sections = computed(() => tosI18n.value?.sections || [])

const sectionIcons = {
  'acceptance-of-terms': faCircleCheck,
  'use-of-service': faGear,
  'accounts-billing-data-retention': faFileInvoice,
  'payments-and-fees': faCreditCard,
  'content-and-fair-use': faFileLines,
  'termination-and-suspension': faTriangleExclamation,
  'warranty-disclaimers': faCircleInfo,
  'limitation-of-liability': faShield,
  'updates-to-terms': faRotate,
}

const getSectionIcon = (anchor) =>
  sectionIcons[anchor] || faFileLines
</script>

<style scoped>
.tos-page {
  min-height: 100vh;
  background: #f8fafc;
}

.tos-main {
  width: min(920px, calc(100% - 32px));
  margin: 0 auto;
  padding: 88px 0 56px;
  color: #000000;
}

.tos-header {
  margin-bottom: 18px;
}

.tos-title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  line-height: 1.08;
  font-weight: 800;
  color: #000000;
}

.tos-updated {
  margin: 14px 0 0;
  color: #000000;
  font-weight: 700;
}

.tos-subtitle {
  margin: 10px 0 0;
  color: #000000;
  line-height: 1.6;
  font-weight: 700;
}

.tos-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
  padding: 22px;
}

.tos-section + .tos-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.tos-section {
  scroll-margin-top: 140px;
}

.tos-section-title {
  margin: 0 0 10px;
  font-size: 1.25rem;
  font-weight: 800;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tos-section-icon {
  font-size: 1.05rem;
  color: #000000;
  flex: 0 0 auto;
}

.tos-paragraph {
  margin: 10px 0 0;
  line-height: 1.75;
  color: #000000;
}

.tos-list {
  margin: 12px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
}

.tos-list-item {
  line-height: 1.65;
  color: #000000;
}

@media (max-width: 640px) {
  .tos-main {
    width: min(100%, calc(100% - 20px));
    padding-top: 72px;
  }

  .tos-card {
    padding: 16px;
  }

}
</style>
