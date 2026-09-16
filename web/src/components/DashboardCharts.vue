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

const props = defineProps({
  charts: { type: Object, default: null },
});

const FONT = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const palette = [
  '#0067b2', '#0e6b8a', '#0f766e', '#15803d', '#0369a1', '#475569',
  '#c27803', '#b45309', '#9a3412', '#0891b2', '#65a30d', '#be123c',
];

const mode = computed(() => props.charts?.mode || 'admin');
const isGuardian = computed(() => mode.value === 'guardian');
const showAcademic = computed(() => mode.value === 'teacher' || mode.value === 'head' || mode.value === 'guardian');
const showRoster = computed(() => mode.value === 'admin' || mode.value === 'head');
const periodLabel = computed(() => props.charts?.periodLabel || 'Últimos 30 días');
const summary = computed(() => props.charts?.summary || {});
const sectionTitle = computed(() => {
  if (mode.value === 'head') return 'Indicadores de tus cursos';
  if (mode.value === 'teacher') return 'Indicadores de tus asignaturas';
  if (mode.value === 'guardian') return 'Indicadores de tus estudiantes';
  return 'Indicadores del colegio';
});
const sectionSub = computed(() => {
  if (mode.value === 'head') return 'Notas, asistencia, inasistencias y matrícula de los cursos donde eres profesor jefe.';
  if (mode.value === 'teacher') return 'Promedio por ramo y asistencia de los cursos que dictas.';
  if (mode.value === 'guardian') return 'Promedio de notas y asistencia de los estudiantes vinculados a tu cuenta.';
  return `${periodLabel.value}: inasistencias y matrícula activa por curso.`;
});

function entries(series) {
  return Object.entries(series || {})
    .map(([label, value]) => [label, Number(value)])
    .filter(([, value]) => Number.isFinite(value));
}

function shortLabel(label, max = 22) {
  const text = String(label || '');
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

const absences = computed(() => entries(props.charts?.absencesByCourse));
const students = computed(() => entries(props.charts?.studentsByCourse));
const grades = computed(() => entries(props.charts?.gradesBySubject || props.charts?.gradesByStudent));
const attendance = computed(() => entries(props.charts?.attendanceByCourse || props.charts?.attendanceByStudent));

const hasAbsences = computed(() => absences.value.some(([, v]) => v > 0));
const hasStudents = computed(() => students.value.some(([, v]) => v > 0));
const hasGrades = computed(() => grades.value.length > 0);
const hasAttendance = computed(() => attendance.value.length > 0);

const totalAbsences = computed(() => Number(summary.value.totalAbsences ?? absences.value.reduce((s, [, v]) => s + v, 0)));
const uniqueStudents = computed(() => Number(summary.value.uniqueStudents ?? summary.value.studentCount ?? students.value.reduce((s, [, v]) => s + v, 0)));

const avgGrade = computed(() => {
  if (summary.value.averageGrade != null && Number.isFinite(Number(summary.value.averageGrade))) {
    return Number(summary.value.averageGrade).toFixed(1);
  }
  if (!grades.value.length) return '—';
  const sum = grades.value.reduce((s, [, v]) => s + v, 0);
  return (sum / grades.value.length).toFixed(1);
});

const avgAttendance = computed(() => {
  if (summary.value.averageAttendance != null && Number.isFinite(Number(summary.value.averageAttendance))) {
    return `${Math.round(Number(summary.value.averageAttendance))}%`;
  }
  if (!attendance.value.length) return '—';
  const sum = attendance.value.reduce((s, [, v]) => s + v, 0);
  return `${Math.round(sum / attendance.value.length)}%`;
});

const gradeSubtitle = computed(() => {
  if (isGuardian.value) return 'Promedio de cada estudiante a tu cargo';
  return summary.value.isHeadTeacher
    ? 'Promedio del curso a tu cargo'
    : 'Promedio de tus ramos';
});
const gradeTitle = computed(() => (isGuardian.value ? 'Nota por estudiante' : 'Nota por asignatura'));
const attendanceTitle = computed(() => (isGuardian.value ? 'Asistencia por estudiante' : 'Asistencia por curso'));
const attendanceSubtitle = computed(() => periodLabel.value);

function gradeColor(score) {
  if (score < 4) return '#dc2626';
  if (score < 5) return '#d97706';
  if (score < 6) return '#0284c7';
  return '#059669';
}

function attendanceColor(pct) {
  if (pct < 85) return '#dc2626';
  if (pct < 95) return '#d97706';
  return '#0d9488';
}

function absenceColor(count, max) {
  if (!max) return '#ea580c';
  const ratio = count / max;
  if (ratio >= 0.66) return '#c2410c';
  if (ratio >= 0.33) return '#ea580c';
  return '#fb923c';
}

function barGradient(ctx, color) {
  const { chart, chartArea } = ctx;
  if (!chartArea) return color;
  const vertical = chart.options.indexAxis !== 'y';
  const gradient = vertical
    ? chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    : chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
  gradient.addColorStop(0, `${color}cc`);
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, color);
  return gradient;
}

const gradesHorizontal = computed(() => grades.value.length > 5);
const attendanceHorizontal = computed(() => attendance.value.length > 6);
const absencesHorizontal = computed(() => absences.value.length > 6);

const chartKey = computed(() => [
  mode.value,
  grades.value.map((e) => e.join(':')).join('|'),
  attendance.value.map((e) => e.join(':')).join('|'),
  absences.value.map((e) => e.join(':')).join('|'),
  students.value.map((e) => e.join(':')).join('|'),
].join('#'));

const absenceData = computed(() => {
  const max = Math.max(...absences.value.map(([, v]) => v), 1);
  const colors = absences.value.map(([, v]) => absenceColor(v, max));
  return {
    labels: absences.value.map(([label]) => shortLabel(label, absencesHorizontal.value ? 18 : 14)),
    datasets: [{
      label: 'Inasistencias',
      data: absences.value.map(([, v]) => v),
      backgroundColor: (ctx) => barGradient(ctx, colors[ctx.dataIndex] || colors[0]),
      hoverBackgroundColor: colors,
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: absencesHorizontal.value ? 18 : 32,
      categoryPercentage: 0.7,
      barPercentage: 0.88,
    }],
  };
});

const studentData = computed(() => ({
  labels: students.value.map(([label]) => shortLabel(label, 16)),
  datasets: [{
    data: students.value.map(([, v]) => v),
    backgroundColor: students.value.map((_, i) => palette[i % palette.length]),
    borderWidth: 3,
    borderColor: '#ffffff',
    hoverOffset: 8,
    hoverBorderWidth: 3,
    spacing: 2,
  }],
}));

const gradeData = computed(() => {
  const colors = grades.value.map(([, v]) => gradeColor(v));
  return {
    labels: grades.value.map(([label]) => shortLabel(label, gradesHorizontal.value ? 26 : 18)),
    datasets: [{
      label: 'Promedio',
      data: grades.value.map(([, v]) => v),
      backgroundColor: (ctx) => barGradient(ctx, colors[ctx.dataIndex] || colors[0]),
      hoverBackgroundColor: colors,
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: gradesHorizontal.value ? 18 : 32,
      categoryPercentage: 0.7,
      barPercentage: 0.88,
    }],
  };
});

const attendanceData = computed(() => {
  const colors = attendance.value.map(([, v]) => attendanceColor(v));
  return {
    labels: attendance.value.map(([label]) => shortLabel(label, attendanceHorizontal.value ? 18 : 14)),
    datasets: [{
      label: 'Asistencia %',
      data: attendance.value.map(([, v]) => v),
      backgroundColor: (ctx) => barGradient(ctx, colors[ctx.dataIndex] || colors[0]),
      hoverBackgroundColor: colors,
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: attendanceHorizontal.value ? 18 : 32,
      categoryPercentage: 0.7,
      barPercentage: 0.88,
    }],
  };
});

function barOptions({
  suffix = '',
  max = undefined,
  stepSize = undefined,
  horizontal = false,
  decimals = false,
  fullLabels = [],
} = {}) {
  const valueAxis = {
    beginAtZero: true,
    suggestedMax: max,
    max,
    ticks: {
      precision: decimals ? 1 : 0,
      stepSize,
      font: { size: 11, family: FONT, weight: '500' },
      color: '#64748b',
      padding: 8,
      callback: (v) => `${decimals && Number(v) % 1 !== 0 ? Number(v).toFixed(1) : v}${suffix}`,
    },
    grid: {
      color: 'rgba(15, 23, 42, 0.06)',
      drawBorder: false,
      tickLength: 0,
      lineWidth: 1,
    },
    border: { display: false },
  };
  const categoryAxis = {
    ticks: {
      font: { size: 11, weight: '600', family: FONT },
      color: '#334155',
      autoSkip: false,
      padding: 6,
    },
    grid: { display: false },
    border: { display: false },
  };
  return {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 8, right: 8, bottom: 4, left: 4 } },
    animation: { duration: 640, easing: 'easeOutQuart' },
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(14, 37, 53, 0.94)',
        titleFont: { size: 12, weight: '650', family: FONT },
        bodyFont: { size: 12, family: FONT },
        padding: { x: 14, y: 10 },
        cornerRadius: 12,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
        caretSize: 6,
        caretPadding: 8,
        titleMarginBottom: 4,
        callbacks: {
          title: (items) => fullLabels[items[0]?.dataIndex] || items[0]?.label || '',
          label: (ctx) => {
            const raw = ctx.raw;
            if (suffix === '%') return ` ${raw}%`;
            if (ctx.dataset.label === 'Promedio') return ` Promedio ${Number(raw).toFixed(1)}`;
            if (ctx.dataset.label === 'Inasistencias') return ` ${raw} inasistencia${raw === 1 ? '' : 's'}`;
            return ` ${raw}${suffix}`;
          },
        },
      },
    },
    scales: horizontal
      ? { x: valueAxis, y: categoryAxis }
      : { x: { ...categoryAxis, ticks: { ...categoryAxis.ticks, maxRotation: 32, minRotation: 0 } }, y: valueAxis },
  };
}

const absenceOptions = computed(() => barOptions({
  horizontal: absencesHorizontal.value,
  fullLabels: absences.value.map(([label]) => label),
}));
const gradeOptions = computed(() => barOptions({
  max: 7,
  stepSize: 1,
  horizontal: gradesHorizontal.value,
  decimals: true,
  fullLabels: grades.value.map(([label]) => label),
}));
const attendanceOptions = computed(() => barOptions({
  suffix: '%',
  max: 100,
  stepSize: 20,
  horizontal: attendanceHorizontal.value,
  fullLabels: attendance.value.map(([label]) => label),
}));

const doughnutOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  layout: { padding: 4 },
  animation: { duration: 640, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
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
        title: (items) => students.value[items[0]?.dataIndex]?.[0] || items[0]?.label || '',
        label: (ctx) => {
          const total = ctx.dataset.data.reduce((s, v) => s + Number(v), 0) || 1;
          const pct = Math.round((Number(ctx.raw) / total) * 100);
          return ` ${ctx.raw} alumno${ctx.raw === 1 ? '' : 's'} (${pct}%)`;
        },
      },
    },
  },
}));

const studentLegend = computed(() => students.value.map(([label], index) => ({
  label: shortLabel(label, 22),
  fullLabel: label,
  color: palette[index % palette.length],
})));

function canvasClass(horizontal, count) {
  return {
    'dashboard-chart-canvas': true,
    'dashboard-chart-canvas--tall': horizontal && count > 7,
  };
}
</script>

<template>
  <section v-if="charts" class="dashboard-charts-block" aria-label="Indicadores del resumen">
    <header class="dashboard-charts-intro">
      <div>
        <p class="dashboard-chart-kicker">Resumen visual</p>
        <h2>{{ sectionTitle }}</h2>
        <p>{{ sectionSub }}</p>
      </div>
      <small v-if="summary.truncated" class="dashboard-charts-note">Mostrando los principales cursos</small>
    </header>

    <div class="dashboard-charts" :data-mode="mode" :key="chartKey">
      <article v-if="showAcademic" class="dashboard-chart panel" data-kind="grades">
        <header class="dashboard-chart-head">
          <div>
            <p class="dashboard-chart-kicker">Calificaciones</p>
            <h3>{{ gradeTitle }}</h3>
            <p class="dashboard-chart-sub">{{ gradeSubtitle }}</p>
          </div>
          <div class="dashboard-chart-metric" data-tone="grades">
            <strong>{{ avgGrade }}</strong>
            <span>promedio</span>
          </div>
        </header>
        <div v-if="hasGrades" class="dashboard-chart-body">
          <div :class="canvasClass(gradesHorizontal, grades.length)">
            <Bar :data="gradeData" :options="gradeOptions" />
          </div>
        </div>
        <div v-else class="dashboard-chart-empty">
          <strong>Sin notas todavía</strong>
          <p v-if="isGuardian">Cuando haya calificaciones de tus estudiantes, el promedio aparece aquí.</p>
          <p v-else>Cuando registres calificaciones, el promedio por asignatura aparece aquí.</p>
        </div>
      </article>

      <article v-if="showAcademic" class="dashboard-chart panel" data-kind="attendance">
        <header class="dashboard-chart-head">
          <div>
            <p class="dashboard-chart-kicker">Asistencia</p>
            <h3>{{ attendanceTitle }}</h3>
            <p class="dashboard-chart-sub">{{ attendanceSubtitle }}</p>
          </div>
          <div class="dashboard-chart-metric" data-tone="attendance">
            <strong>{{ avgAttendance }}</strong>
            <span>promedio</span>
          </div>
        </header>
        <div v-if="hasAttendance" class="dashboard-chart-body">
          <div :class="canvasClass(attendanceHorizontal, attendance.length)">
            <Bar :data="attendanceData" :options="attendanceOptions" />
          </div>
        </div>
        <div v-else class="dashboard-chart-empty">
          <strong>Sin asistencia registrada</strong>
          <p v-if="isGuardian">Los porcentajes usan los registros de {{ periodLabel.toLowerCase() }} de tus estudiantes.</p>
          <p v-else>Los porcentajes por curso usan los registros de {{ periodLabel.toLowerCase() }}.</p>
        </div>
      </article>

      <article v-if="showRoster" class="dashboard-chart panel" data-kind="absences">
        <header class="dashboard-chart-head">
          <div>
            <p class="dashboard-chart-kicker">Inasistencias</p>
            <h3>Inasistencias por curso</h3>
            <p class="dashboard-chart-sub">{{ periodLabel }}</p>
          </div>
          <div class="dashboard-chart-metric" data-tone="absent">
            <strong>{{ totalAbsences }}</strong>
            <span>total</span>
          </div>
        </header>
        <div v-if="hasAbsences" class="dashboard-chart-body">
          <div :class="canvasClass(absencesHorizontal, absences.length)">
            <Bar :data="absenceData" :options="absenceOptions" />
          </div>
        </div>
        <div v-else class="dashboard-chart-empty">
          <strong>Sin inasistencias</strong>
          <p>No hay ausencias registradas en {{ periodLabel.toLowerCase() }}.</p>
        </div>
      </article>

      <article v-if="showRoster" class="dashboard-chart panel" data-kind="students">
        <header class="dashboard-chart-head">
          <div>
            <p class="dashboard-chart-kicker">Matrícula</p>
            <h3>Alumnos por curso</h3>
            <p class="dashboard-chart-sub">Matrículas activas</p>
          </div>
          <div class="dashboard-chart-metric" data-tone="students">
            <strong>{{ uniqueStudents }}</strong>
            <span>alumnos</span>
          </div>
        </header>
        <div v-if="hasStudents" class="dashboard-chart-body dashboard-chart-body--donut">
          <div class="dashboard-chart-canvas dashboard-chart-canvas--donut">
            <Doughnut :data="studentData" :options="doughnutOptions" />
            <div class="dashboard-donut-center" aria-hidden="true">
              <strong>{{ uniqueStudents }}</strong>
              <span>alumnos</span>
            </div>
          </div>
          <ul class="dashboard-donut-legend">
            <li v-for="item in studentLegend" :key="item.fullLabel" :title="item.fullLabel">
              <i :style="{ background: item.color }" aria-hidden="true" />
              <span>{{ item.label }}</span>
            </li>
          </ul>
        </div>
        <div v-else class="dashboard-chart-empty">
          <strong>Sin matrículas</strong>
          <p>Cuando haya alumnos activos por curso, verás la distribución aquí.</p>
        </div>
      </article>
    </div>
  </section>
</template>
