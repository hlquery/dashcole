<template>
  <div class="nf-page">
    <Header :force-header-background-color="'#f5f9fc'" />
    <div class="nf-wrap">
    <!-- Decorative background shapes -->
    <div class="bg-shape bg-triangle green-triangle"></div>
    <div class="bg-shape bg-circle orange-circle"></div>
    <div class="bg-shape bg-hexagon pink-hexagon"></div>
    
    <div class="nf-card">
      <div class="nf-icon" aria-hidden="true">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M44 44L58 58" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          <path d="M20 32C20 24.268 26.268 18 34 18C41.732 18 48 24.268 48 32C48 39.732 41.732 46 34 46C28.477 46 24 41.523 24 36" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>{{ $t('not_found_title') }}</h1>
      <p>{{ $t('not_found_description') }}</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">
          <svg class="home-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ $t('not_found_home') }}</span>
        </router-link>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'

const { t } = useI18n()
</script>
<style scoped>
.nf-page {
  min-height: 100vh;
  background: #f5f9fc;
}

.nf-wrap { 
  min-height: 100vh; 
  display: flex; 
  align-items: flex-start; 
  justify-content: center; 
  padding: 40px 24px 80px; 
  background: #f5f9fc !important;
  overflow-x: hidden;
  overflow-y: visible;
  position: relative;
  width: 100%;
  padding-top: 80px;
}

/* Decorative background shapes */
.bg-shape {
  position: absolute;
  pointer-events: none;
  z-index: 0;
  will-change: transform, opacity;
  transform-origin: center center;
}

.bg-triangle {
  width: 0;
  height: 0;
  opacity: 0.12;
  filter: drop-shadow(0 12px 20px rgba(0,0,0,.12)) drop-shadow(0 4px 8px rgba(0,0,0,.08));
}

.bg-circle {
  width: 150px;
  height: 150px;
  opacity: 0.15;
  border-radius: 50%;
  box-shadow: 0 15px 30px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.3);
}

.bg-hexagon {
  width: 140px;
  height: 140px;
  transform: rotate(15deg);
  opacity: 0.12;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  box-shadow: 0 12px 28px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.3);
}

.green-triangle {
  border-left: 35px solid transparent;
  border-right: 35px solid transparent;
  border-bottom: 60px solid #22c55e;
  top: 100px;
  right: 12%;
  opacity: 0.20;
  animation: floatMicro 14s ease-in-out infinite alternate, gentleCircle 28s ease-in-out infinite;
}

.orange-circle {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  top: 250px;
  left: 3%;
  opacity: 0.22;
  animation: floatMicro 14s ease-in-out infinite alternate, gentleCircle 32s ease-in-out infinite reverse;
}

.pink-hexagon {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  top: 120px;
  right: 1%;
  opacity: 0.18;
  animation: floatMicro 14s ease-in-out infinite alternate, gentleCircle 30s ease-in-out infinite;
}

@keyframes floatMicro {
  0%   { transform: translate3d(0, 0px, 0); }
  100% { transform: translate3d(0, 4px, 0); }
}

@keyframes gentleCircle {
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(6px, -6px);
  }
  50% {
    transform: translate(0, -8px);
  }
  75% {
    transform: translate(-6px, -6px);
  }
  100% {
    transform: translate(0, 0);
  }
}

/* Use same card style as contact form */
.nf-card { 
  max-width: 560px; 
  width: 100%; 
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-radius: 16px !important;
  padding: 48px !important;
  text-align: center;
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.03) !important;
  position: relative;
  z-index: 3;
}

.nf-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 16px;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 { 
  font-size: 1.75rem; 
  font-weight: 800; 
  letter-spacing: -0.02em; 
  margin: 0 0 8px;
  color: #0a2540;
}
p { 
  color: #6b7280; 
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 1.6;
}
.actions { 
  display: flex; 
  gap: 10px; 
  justify-content: center; 
}

.btn { 
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem; 
  border-radius: 10px; 
  text-decoration: none; 
  font-weight: 600; 
  font-size: 14px;
  letter-spacing: -0.01em;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary { 
  background: linear-gradient(135deg, #3b82f6, #2563eb) !important; 
  color: #ffffff !important; 
  box-shadow: 
    0 3px 8px rgba(59, 130, 246, 0.18),
    0 1px 3px rgba(59, 130, 246, 0.14) !important;
  border: 0;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
  z-index: 0;
}

.btn-primary:hover::before { 
  left: 100%; 
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
  box-shadow: 
    0 6px 14px rgba(59, 130, 246, 0.2),
    0 3px 6px rgba(59, 130, 246, 0.16) !important;
  transform: translateY(-1px);
}

.btn-primary > * {
  position: relative;
  z-index: 1;
}

.btn-primary span {
  color: #ffffff !important;
}

.home-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: currentColor;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover .home-icon {
  transform: scale(1.1);
}


@media (max-width: 600px) {
  .nf-card {
    padding: 32px 24px !important;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  p {
    font-size: 14px;
  }
}
</style>
