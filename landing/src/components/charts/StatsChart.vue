<template>
  <div class="stats-chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <p>Loading chart data...</p>
    </div>
    <div v-else-if="error" class="chart-error">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      <p>{{ error }}</p>
    </div>
    <div v-else class="chart-wrapper">
      <Line v-if="chartData && chartData.labels && chartData.datasets && chartData.datasets.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="chart-empty">
        <font-awesome-icon :icon="['fas', 'chart-line']" />
        <p>No data available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faChartLine, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

library.add(faChartLine, faExclamationCircle)

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Array,
    default: () => []
  },
  datasets: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Statistics Chart'
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  height: {
    type: Number,
    default: 300
  }
})

const chartData = computed(() => {
  // Ensure labels and datasets are arrays
  const labels = Array.isArray(props.labels) ? props.labels : []
  const datasets = Array.isArray(props.datasets) ? props.datasets : []
  const data = Array.isArray(props.data) ? props.data : []
  
  // If no data array, check if labels and datasets are provided
  if (!data || data.length === 0) {
    if (labels.length > 0 && datasets.length > 0) {
      // Validate datasets structure
      const validDatasets = datasets.filter(ds => ds && typeof ds === 'object' && Array.isArray(ds.data))
      if (validDatasets.length > 0) {
        return {
          labels: labels,
          datasets: validDatasets
        }
      }
    }
    return null
  }
  
  // If data is provided as array of objects with labels
  if (data[0] && typeof data[0] === 'object') {
    const chartLabels = labels.length > 0 ? labels : data.map((_, index) => `Day ${index + 1}`)
    const chartDatasets = datasets.length > 0 ? datasets.filter(ds => ds && typeof ds === 'object' && Array.isArray(ds.data)) : [{
      label: props.title,
      data: data.map(item => item.value || item.count || item),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
    
    // Ensure we have valid data
    if (chartDatasets.length === 0 || !chartDatasets[0].data || chartDatasets[0].data.length === 0) {
      return null
    }
    
    return {
      labels: chartLabels,
      datasets: chartDatasets
    }
  }
  
  // If data is simple array
  const chartLabels = labels.length > 0 ? labels : data.map((_, index) => `Day ${index + 1}`)
  const chartDatasets = datasets.length > 0 ? datasets.filter(ds => ds && typeof ds === 'object' && Array.isArray(ds.data)) : [{
    label: props.title,
    data: data,
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4,
    fill: true
  }]
  
  // Ensure we have valid data
  if (chartDatasets.length === 0 || !chartDatasets[0].data || chartDatasets[0].data.length === 0) {
    return null
  }
  
  return {
    labels: chartLabels,
    datasets: chartDatasets
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 12
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      },
      title: {
        display: !!props.title,
        text: props.title,
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6b7280',
          precision: 0
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }
})
</script>

<style scoped>
.stats-chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.chart-loading,
.chart-error,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  gap: 1rem;
}

.chart-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.chart-error {
  color: #ef4444;
}

.chart-error svg,
.chart-empty svg {
  font-size: 3rem;
  opacity: 0.5;
}

.chart-empty p,
.chart-error p,
.chart-loading p {
  margin: 0;
  font-size: 0.875rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
