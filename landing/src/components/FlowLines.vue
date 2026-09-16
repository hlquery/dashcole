<template>
  <div class="flow-lines" :class="{ 'reduced-motion': prefersReducedMotion }">
    <svg
      class="flow-lines-svg"
      width="100%"
      height="100%"
      viewBox="0 0 1920 3000"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :style="{ stopColor: '#3B82F6', stopOpacity: 0.25 }" />
          <stop offset="50%" :style="{ stopColor: '#2563eb', stopOpacity: 0.25 }" />
          <stop offset="100%" :style="{ stopColor: '#10B981', stopOpacity: 0.25 }" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="0%" r="75%">
          <stop offset="0%" stop-color="rgba(37, 99, 235, 0.18)" />
          <stop offset="60%" stop-color="rgba(37, 99, 235, 0.08)" />
          <stop offset="100%" stop-color="rgba(37, 99, 235, 0)" />
        </radialGradient>
      </defs>
      
      <rect
        class="flow-glow"
        x="0"
        y="0"
        width="1920"
        height="3000"
        fill="url(#glowGradient)"
        opacity="0.35"
      />
      
      <g class="flow-lines-group">
        <path
          ref="line1"
          class="flow-line line-1"
          d="M 220 0 L 220 3000"
          fill="none"
          stroke="url(#stripeGradient)"
          stroke-width="6"
          stroke-linecap="round"
          opacity="0.65"
        />
        
        <path
          ref="line2"
          class="flow-line line-2"
          d="M 520 0 L 520 3000"
          fill="none"
          stroke="url(#stripeGradient)"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.55"
        />
        
        <path
          ref="line3"
          class="flow-line line-3"
          d="M 900 0 L 900 3000"
          fill="none"
          stroke="url(#stripeGradient)"
          stroke-width="7"
          stroke-linecap="round"
          opacity="0.6"
        />
        
        <path
          ref="line4"
          class="flow-line line-4"
          d="M 1280 0 L 1280 3000"
          fill="none"
          stroke="url(#stripeGradient)"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.5"
        />
        
        <path
          ref="line5"
          class="flow-line line-5"
          d="M 1620 0 L 1620 3000"
          fill="none"
          stroke="url(#stripeGradient)"
          stroke-width="6"
          stroke-linecap="round"
          opacity="0.45"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const line1 = ref(null)
const line2 = ref(null)
const line3 = ref(null)
const line4 = ref(null)
const line5 = ref(null)

const prefersReducedMotion = ref(false)
let scrollTriggers = []

// Verificar prefers-reduced-motion
const checkReducedMotion = () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const setupAnimations = () => {
  if (prefersReducedMotion.value) {
    return
  }

  // Registrar ScrollTrigger
  gsap.registerPlugin(ScrollTrigger)

  const lines = [
    { ref: line1, dashArray: '6 12', duration: 20 },
    { ref: line2, dashArray: '8 14', duration: 25 },
    { ref: line3, dashArray: '7 13', duration: 22 },
    { ref: line4, dashArray: '9 15', duration: 28 },
    { ref: line5, dashArray: '6 11', duration: 24 }
  ]

  lines.forEach((line, index) => {
    if (!line.ref.value) return

    const path = line.ref.value
    const pathLength = path.getTotalLength()

    // Configurar stroke-dasharray y aplicar gradiente
    path.style.strokeDasharray = line.dashArray
    path.style.strokeDashoffset = 0
    path.setAttribute('stroke', 'url(#stripeGradient)')

    // Animación principal del dash con ScrollTrigger (vinculada al scroll)
    const dashAnimation = gsap.to(path, {
      strokeDashoffset: -pathLength * 2,
      ease: 'none',
      scrollTrigger: {
        trigger: '.landing-page-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: true
      }
    })

    if (dashAnimation.scrollTrigger) {
      scrollTriggers.push(dashAnimation.scrollTrigger)
    }

    // Animación secundaria lenta para "respirar" (desplazamiento en X)
    gsap.to(path, {
      x: index % 2 === 0 ? 18 : -18,
      duration: 10 + index * 0.7,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      opacity: 0.35 + index * 0.05
    })
  })
}

// Limpiar animaciones
const cleanup = () => {
  scrollTriggers.forEach(trigger => {
    if (trigger && trigger.kill) {
      trigger.kill()
    }
  })
  scrollTriggers = []
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.trigger === '.landing-page-wrapper') {
      trigger.kill()
    }
  })
}

onMounted(() => {
  checkReducedMotion()
  
  // Escuchar cambios en prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  mediaQuery.addEventListener('change', checkReducedMotion)
  
  // Esperar un frame para asegurar que el DOM esté listo
  requestAnimationFrame(() => {
    setupAnimations()
  })
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.flow-lines {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
  opacity: 1;
  overflow: visible;
  background: transparent;
}

.flow-lines-svg {
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
}

.flow-lines-group {
  mix-blend-mode: screen;
}

.flow-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Deshabilitar animaciones si hay reduced motion */
.flow-lines.reduced-motion .flow-line {
  animation: none !important;
}
</style>
