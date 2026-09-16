<template>
  <div class="analytics-page">
    <div class="page-header">
      <h1 class="title">{{ $t('analytics_title') }}</h1>
      <p class="subtitle">{{ $t('analytics_subtitle') }}</p>
    </div>

    <v-container fluid class="metrics-container">
      <v-row>
        <v-col cols="12" md="3" v-for="card in kpis" :key="card.title">
          <v-card class="kpi-card">
            <v-card-text>
              <div class="kpi-title">{{ $t(card.title) }}</div>
              <div class="kpi-value">{{ card.value }}</div>
              <div class="kpi-trend" :class="{ up: card.trend > 0, down: card.trend < 0 }">
                <v-icon size="16" class="mr-1">{{ card.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                {{ Math.abs(card.trend) }}{{ $t('analytics_trend_suffix') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="chart-card">
            <v-card-title>{{ $t('analytics_traffic_overview') }}</v-card-title>
            <v-card-text>
              <div class="chart-placeholder">{{ $t('chart_placeholder') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="chart-card">
            <v-card-title>{{ $t('analytics_top_sources') }}</v-card-title>
            <v-card-text>
              <ul class="sources-list">
                <li v-for="s in sources" :key="s.name">
                  <span class="source-name">{{ s.name }}</span>
                  <span class="source-value">{{ s.value }}</span>
                </li>
              </ul>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const kpis = ref([
  { title: 'analytics_kpi_sessions', value: '42,310', trend: 8.2 },
  { title: 'analytics_kpi_users', value: '18,904', trend: 5.1 },
  { title: 'analytics_kpi_bounce', value: '38.6%', trend: -2.3 },
  { title: 'analytics_kpi_avg_time', value: '3m 24s', trend: 1.4 }
])

const sources = ref([
  { name: 'Google', value: '58%' },
  { name: 'Twitter', value: '17%' },
  { name: 'Newsletter', value: '13%' },
  { name: 'Other', value: '12%' }
])
</script>

<style scoped>
.analytics-page {
  padding-top: 96px;
}
.page-header {
  max-width: 1200px;
  margin: 0 auto 1rem auto;
  padding: 0 16px;
}
.title { font-size: 2rem; font-weight: 800; letter-spacing: -0.02em; }
.subtitle { color: #6b7280; margin-top: 4px; }
.metrics-container { max-width: 1200px; }

.kpi-card { border-radius: 16px; border: 1px solid rgba(229,231,235,.7); }
.kpi-title { color: #6b7280; font-size: .85rem; font-weight: 600; }
.kpi-value { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 6px; }
.kpi-trend { display: flex; align-items: center; margin-top: 6px; font-weight: 600; }
.kpi-trend.up { color: #10b981; }
.kpi-trend.down { color: #ef4444; }

.chart-card { border-radius: 16px; border: 1px solid rgba(229,231,235,.7); }
.chart-placeholder {
  height: 260px; border-radius: 12px; background: repeating-linear-gradient(
    45deg, #f3f4f6, #f3f4f6 10px, #eef2f7 10px, #eef2f7 20px
  ); display: flex; align-items: center; justify-content: center; color: #9ca3af; font-weight: 700;
}
.sources-list { list-style: none; padding: 0; margin: 0; }
.sources-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; }
.sources-list li:last-child { border-bottom: none; }
.source-name { color: #374151; font-weight: 600; }
.source-value { color: #6b7280; font-weight: 600; }
</style>
