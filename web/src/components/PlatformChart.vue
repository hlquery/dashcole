<script setup>
import { computed } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const props = defineProps({
  title: { type: String, default: '' },
  type: { type: String, default: 'doughnut' },
  series: { type: Object, default: () => ({}) },
  colors: { type: Array, default: () => ['#0067b2', '#0f766e', '#b45309', '#be123c', '#475569', '#0284c7'] },
});

const labels = computed(() => Object.keys(props.series || {}));
const values = computed(() => Object.values(props.series || {}).map(Number));
const hasData = computed(() => values.value.some((value) => Number(value) > 0));
const total = computed(() => values.value.reduce((sum, value) => sum + (Number(value) || 0), 0));

function barGradient(ctx, color) {
  const { chart, chartArea } = ctx;
  if (!chartArea) return color;
  const gradient = chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, `${color}b3`);
  gradient.addColorStop(1, color);
  return gradient;
}

const chartData = computed(() => ({
  labels: labels.value,
  datasets: [{
    data: values.value,
    backgroundColor: props.type === 'bar'
      ? (ctx) => barGradient(ctx, props.colors[ctx.dataIndex % props.colors.length] || props.colors[0])
      : props.colors.slice(0, Math.max(labels.value.length, 1)),
    hoverBackgroundColor: props.colors.slice(0, Math.max(labels.value.length, 1)),
    borderWidth: props.type === 'doughnut' ? 3 : 0,
    borderColor: '#ffffff',
    borderRadius: props.type === 'bar' ? 8 : 0,
    borderSkipped: false,
    maxBarThickness: 36,
    categoryPercentage: 0.7,
    barPercentage: 0.88,
    spacing: props.type === 'doughnut' ? 2 : 0,
    hoverOffset: props.type === 'doughnut' ? 8 : 0,
  }],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: props.type === 'doughnut' ? '72%' : undefined,
  animation: { duration: 640, easing: 'easeOutQuart' },
  interaction: { mode: 'index', intersect: false },
  layout: { padding: { top: 6, right: 6, bottom: 2, left: 2 } },
  plugins: {
    legend: {
      display: props.type === 'doughnut',
      position: 'bottom',
      labels: {
        boxWidth: 9,
        boxHeight: 9,
        borderRadius: 3,
        useBorderRadius: true,
        padding: 14,
        font: { size: 11, weight: '600', family: FONT },
        color: '#475569',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(14, 37, 53, 0.94)',
      titleFont: { size: 12, weight: '650', family: FONT },
      bodyFont: { size: 12, family: FONT },
      padding: { x: 14, y: 10 },
      cornerRadius: 12,
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      usePointStyle: true,
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
      },
    },
  },
  scales: props.type === 'bar' ? {
    x: {
      ticks: { font: { size: 11, weight: '600', family: FONT }, color: '#334155' },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 11, family: FONT, weight: '500' }, color: '#64748b', padding: 8 },
      grid: { color: 'rgba(15, 23, 42, 0.06)', drawBorder: false },
      border: { display: false },
    },
  } : undefined,
}));
</script>

<template>
  <article class="panel platform-chart" :data-type="type">
    <header v-if="title" class="platform-chart-head">
      <h3>{{ title }}</h3>
      <div v-if="hasData" class="platform-chart-total">
        <strong>{{ total }}</strong>
        <span>total</span>
      </div>
    </header>
    <div v-if="hasData" class="chart-wrap" :class="{ 'chart-wrap--donut': type === 'doughnut' }">
      <Doughnut v-if="type === 'doughnut'" :data="chartData" :options="chartOptions" />
      <Bar v-else :data="chartData" :options="chartOptions" />
      <div v-if="type === 'doughnut'" class="platform-donut-center" aria-hidden="true">
        <strong>{{ total }}</strong>
        <span>total</span>
      </div>
    </div>
    <p v-else class="empty-note">Sin datos para graficar todavía.</p>
  </article>
</template>

<style scoped>
.platform-chart {
  padding: 20px;
  display: grid;
  gap: 14px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, color-mix(in srgb, #eff6ff 45%, #fff) 0%, #fff 48%, #fff 100%);
  border: 1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 80%, transparent);
  box-shadow:
    0 1px 0 color-mix(in srgb, #fff 70%, transparent) inset,
    0 12px 28px color-mix(in srgb, #0f172a 5%, transparent);
}
.platform-chart[data-type="bar"] {
  background:
    linear-gradient(135deg, color-mix(in srgb, #ecfdf5 45%, #fff) 0%, #fff 48%, #fff 100%);
}
.platform-chart-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.platform-chart h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.015em;
  color: var(--color-text, #0f172a);
}
.platform-chart-total {
  display: grid;
  justify-items: end;
  gap: 2px;
  min-width: 64px;
  padding: 8px 11px;
  border-radius: 14px;
  background: color-mix(in srgb, #eff6ff 90%, #fff);
  border: 1px solid color-mix(in srgb, #93c5fd 40%, transparent);
  color: #075985;
}
.platform-chart-total strong {
  font-size: 18px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}
.platform-chart-total span {
  font-size: 10px;
  font-weight: 700;
  text-transform: lowercase;
  opacity: 0.78;
}
.chart-wrap {
  position: relative;
  height: 248px;
  padding: 10px 8px 6px;
  border-radius: 16px;
  background: color-mix(in srgb, #fff 84%, #f8fafc);
  border: 1px solid color-mix(in srgb, var(--color-border, #e2e8f0) 55%, transparent);
}
.chart-wrap--donut {
  height: 260px;
}
.platform-donut-center {
  position: absolute;
  inset: 20% 28% 34%;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 2px;
  pointer-events: none;
  text-align: center;
}
.platform-donut-center strong {
  font-size: 26px;
  font-weight: 820;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--color-text, #0f172a);
  font-variant-numeric: tabular-nums;
}
.platform-donut-center span {
  font-size: 11px;
  font-weight: 700;
  text-transform: lowercase;
  color: var(--color-muted, #64748b);
}
.empty-note {
  margin: 0;
  padding: 28px 16px;
  border-radius: 14px;
  text-align: center;
  color: #607184;
  font-size: 13px;
  background: color-mix(in srgb, #f8fafc 88%, #fff);
  border: 1px dashed color-mix(in srgb, var(--color-border, #e2e8f0) 85%, transparent);
}
</style>
