<template>
  <div class="traffic-stats-container">
    <div class="traffic-header">
      <div class="traffic-title">
        <font-awesome-icon :icon="['fas', 'chart-line']" class="traffic-icon" />
        <span>Visitor Traffic</span>
      </div>
      <div class="traffic-subtitle">Real-Time Statistics</div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ stats.totalVisits || 0 }}</div>
        <div class="stat-label">Total Visits</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.uniqueVisitors || 0 }}</div>
        <div class="stat-label">Unique Visitors</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.uniqueSessions || 0 }}</div>
        <div class="stat-label">Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ activeVisitors.length }}</div>
        <div class="stat-label">Active Now</div>
      </div>
    </div>

    <!-- World Map -->
    <div class="world-map-container">
      <div class="map-header">
        <span>Visitors by Country</span>
        <select v-model="period" @change="loadStats" class="period-select">
          <option value="hour">Last Hour</option>
          <option value="day">Last Day</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>
      <div class="world-map" ref="mapContainer">
        <svg viewBox="0 0 1000 500" class="world-map-svg">
          <!-- Simplified world map paths would go here -->
          <!-- For now, we'll use a simple visualization with country markers -->
          <g v-for="(country, index) in mapData" :key="country.country || index">
            <circle
              :cx="getX(country.longitude)"
              :cy="getY(country.latitude)"
              :r="getRadius(country.visitCount)"
              :fill="getColor(country.visitCount)"
              :opacity="0.7"
              class="country-marker"
              @mouseenter="hoveredCountry = country"
              @mouseleave="hoveredCountry = null"
            >
              <title>{{ country.countryName }}: {{ country.visitCount }} visits</title>
            </circle>
          </g>
        </svg>
        <div v-if="hoveredCountry" class="map-tooltip">
          <div class="tooltip-country">{{ hoveredCountry.countryName }}</div>
          <div class="tooltip-visits">{{ hoveredCountry.visitCount }} visits</div>
          <div class="tooltip-sessions">{{ hoveredCountry.uniqueSessions }} sessions</div>
        </div>
      </div>
    </div>

    <!-- Top Countries List -->
    <div class="top-countries">
      <div class="section-title">Top Countries</div>
      <div class="countries-list">
        <div
          v-for="(country, index) in topCountries"
          :key="country.country"
          class="country-item"
        >
          <div class="country-rank">{{ index + 1 }}</div>
          <div class="country-flag">{{ getCountryFlag(country.country) }}</div>
          <div class="country-info">
            <div class="country-name">{{ getCountryName(country.country) }}</div>
            <div class="country-visits">{{ country.count }} visits</div>
          </div>
          <div class="country-bar">
            <div
              class="country-bar-fill"
              :style="{ width: `${(country.count / maxCountryVisits) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Routes -->
    <div class="top-routes">
      <div class="section-title">Top Routes</div>
      <div class="routes-list">
        <div
          v-for="(route, index) in topRoutes"
          :key="route.route"
          class="route-item"
        >
          <div class="route-rank">{{ index + 1 }}</div>
          <div class="route-path">{{ route.route }}</div>
          <div class="route-visits">{{ route.count }} visits</div>
        </div>
      </div>
    </div>

    <!-- Active Visitors -->
    <div class="active-visitors" v-if="activeVisitors.length > 0">
      <div class="section-title">Active Visitors (Last 5 min)</div>
      <div class="visitors-list">
        <div
          v-for="visitor in activeVisitors"
          :key="visitor.sessionId"
          class="visitor-item"
        >
          <div class="visitor-location">
            <span class="visitor-country">{{ visitor.country || 'Unknown' }}</span>
            <span class="visitor-city" v-if="visitor.city">, {{ visitor.city }}</span>
          </div>
          <div class="visitor-device">{{ visitor.device || 'Desktop' }}</div>
          <div class="visitor-route">{{ visitor.route }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { api } from '@/composables/api'
import { useSocket } from '@/composables/socket'

const stats = ref({
  totalVisits: 0,
  uniqueVisitors: 0,
  uniqueSessions: 0
})

const mapData = ref([])
const topCountries = ref([])
const topRoutes = ref([])
const activeVisitors = ref([])
const period = ref('day')
const hoveredCountry = ref(null)

const { socket, isConnected } = useSocket()

const maxCountryVisits = computed(() => {
  if (topCountries.value.length === 0) return 1
  return Math.max(...topCountries.value.map(c => c.count))
})

// Convert longitude to X coordinate (Mercator projection)
function getX(longitude) {
  if (!longitude) return 500
  return ((longitude + 180) / 360) * 1000
}

// Convert latitude to Y coordinate (Mercator projection)
function getY(latitude) {
  if (!latitude) return 250
  return ((90 - latitude) / 180) * 500
}

// Get radius based on visit count
function getRadius(visitCount) {
  if (!visitCount || visitCount === 0) return 3
  const maxVisits = Math.max(...mapData.value.map(c => c.visitCount || 0))
  if (maxVisits === 0) return 3
  const normalized = Math.sqrt(visitCount / maxVisits)
  return Math.max(3, Math.min(15, normalized * 15))
}

// Get color based on visit count
function getColor(visitCount) {
  if (!visitCount || visitCount === 0) return '#6b7280'
  const maxVisits = Math.max(...mapData.value.map(c => c.visitCount || 0))
  if (maxVisits === 0) return '#6b7280'
  const ratio = visitCount / maxVisits
  
  if (ratio > 0.7) return '#ef4444' // Red for high
  if (ratio > 0.4) return '#f59e0b' // Orange for medium-high
  if (ratio > 0.2) return '#3b82f6' // Blue for medium
  return '#10b981' // Green for low
}

// Get country flag emoji (simplified)
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌍'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Get country name
function getCountryName(countryCode) {
  if (!countryCode) return 'Unknown'
  // You can expand this with a full country name mapping
  return countryCode.toUpperCase()
}

async function loadStats() {
  try {
    // Load traffic stats
    const statsResponse = await api.get(`/admin/traffic/stats?period=${period.value}`)
    if (statsResponse && statsResponse.success) {
      stats.value = statsResponse.data.stats
      topCountries.value = statsResponse.data.stats.countries.slice(0, 10)
      topRoutes.value = statsResponse.data.stats.topRoutes.slice(0, 10)
    }

    // Load world map data
    const mapResponse = await api.get(`/admin/traffic/worldmap?period=${period.value}`)
    if (mapResponse && mapResponse.success) {
      mapData.value = mapResponse.data.mapData.filter(item => item.latitude && item.longitude)
    }

    // Load active visitors
    const visitorsResponse = await api.get('/admin/traffic/realtime')
    if (visitorsResponse && visitorsResponse.success) {
      activeVisitors.value = visitorsResponse.data.visitors.slice(0, 10)
    }
  } catch (error) {
    console.error('Error loading traffic stats:', error)
  }
}

let interval = null

// Set up Socket.IO listeners
onMounted(() => {
  loadStats()
  
  // Refresh every 10 seconds
  interval = setInterval(() => {
    loadStats()
  }, 10000)

  // Socket.IO updates
  if (socket && isConnected.value) {
    socket.on('traffic:update', (data) => {
      if (data.stats) {
        stats.value = { ...stats.value, ...data.stats }
      }
      if (data.mapData) {
        mapData.value = data.mapData.filter(item => item.latitude && item.longitude)
      }
      if (data.visitors) {
        activeVisitors.value = data.visitors.slice(0, 10)
      }
    })

    // Subscribe to traffic updates
    socket.emit('traffic:subscribe')
  }
})

// Watch for socket connection changes
watch(isConnected, (connected) => {
  if (connected && socket) {
    socket.emit('traffic:subscribe')
  }
})

onBeforeUnmount(() => {
  if (interval) {
    clearInterval(interval)
  }
  if (socket) {
    socket.off('traffic:update')
    socket.emit('traffic:unsubscribe')
  }
})
</script>

<style scoped>
.traffic-stats-container {
  padding: 1rem;
  background: #1c2930;
  border-radius: 8px;
  margin: 1rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.traffic-header {
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.75rem;
}

.traffic-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.traffic-icon {
  color: #3b82f6;
  font-size: 1rem;
}

.traffic-subtitle {
  font-size: 0.75rem;
  color: #9ca3af;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #0d1117;
  border-radius: 6px;
  padding: 0.75rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.world-map-container {
  margin-bottom: 2rem;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  font-size: 0.875rem;
}

.period-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: #0d1117;
  font-size: 0.75rem;
  color: #ffffff;
  cursor: pointer;
}

.world-map {
  position: relative;
  width: 100%;
  height: 300px;
  background: #0d1117;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.world-map-svg {
  width: 100%;
  height: 100%;
}

.country-marker {
  cursor: pointer;
  transition: all 0.2s ease;
}

.country-marker:hover {
  opacity: 1;
  stroke: #111827;
  stroke-width: 2;
}

.map-tooltip {
  position: absolute;
  background: #111827;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tooltip-country {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tooltip-visits,
.tooltip-sessions {
  font-size: 0.75rem;
  color: #9ca3af;
}

.top-countries,
.top-routes,
.active-visitors {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.countries-list,
.routes-list,
.visitors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.country-item,
.route-item,
.visitor-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #0d1117;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.country-rank,
.route-rank {
  font-weight: 600;
  color: #6b7280;
  min-width: 2rem;
}

.country-flag {
  font-size: 1.5rem;
}

.country-info {
  flex: 1;
}

.country-name {
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.country-visits {
  font-size: 0.625rem;
  color: #9ca3af;
}

.country-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  max-width: 200px;
}

.country-bar-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.route-path {
  flex: 1;
  font-family: var(--font-family-sohne);
  font-variant-numeric: tabular-nums;
  font-size: 0.875rem;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-visits {
  font-weight: 600;
  color: #6b7280;
}

.visitor-location {
  flex: 1;
  font-weight: 500;
  color: #111827;
}

.visitor-country {
  color: #374151;
}

.visitor-city {
  color: #6b7280;
}

.visitor-device {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 80px;
}

.visitor-route {
  font-family: var(--font-family-sohne);
  font-variant-numeric: tabular-nums;
  font-size: 0.75rem;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .world-map {
    height: 300px;
  }
}
</style>

