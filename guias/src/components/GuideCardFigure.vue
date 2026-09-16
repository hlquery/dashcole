<template>
  <div class="guide-card-figure" aria-hidden="true">
    <svg viewBox="0 0 220 130" role="presentation" preserveAspectRatio="xMidYMid meet">
      <g v-if="activePattern === 'circles'">
        <circle class="figure-fill" cx="164" cy="82" r="43" />
        <circle cx="164" cy="82" r="43" />
        <circle cx="164" cy="82" r="28" />
        <path d="M20 118L106 43M42 130L128 55" />
        <path d="M105 130A68 68 0 0 1 220 68" />
      </g>

      <g v-else-if="activePattern === 'isometric'" :class="`isometric-variant-${variant}`">
        <path class="figure-fill" d="M82 61l35-20 35 20-35 20z" />
        <path d="M82 61l35-20 35 20-35 20zM82 61v39l35 20V80M152 61v39l-35 20" />
        <path d="M32 89l23-13 23 13-23 13zM32 89v25l23 13M78 89v25l-23 13" />
        <path d="M144 104l24-14 24 14-24 14zM144 104v18l24 14M192 104v18l-24 14" />
      </g>

      <g v-else-if="activePattern === 'waves'">
        <path class="figure-fill" d="M-8 91c30-34 51-34 80 0s50 34 80 0 51-34 76 0v47H-8z" />
        <path d="M-8 91c30-34 51-34 80 0s50 34 80 0 51-34 76 0" />
        <path d="M-8 108c30-34 51-34 80 0s50 34 80 0 51-34 76 0" />
        <path d="M-8 125c30-34 51-34 80 0s50 34 80 0 51-34 76 0" />
      </g>

      <g v-else-if="activePattern === 'grid'">
        <path d="M18 46h184M18 70h184M18 94h184M42 26v92M78 26v92M114 26v92M150 26v92M186 26v92" />
        <path class="figure-fill" d="M114 70h36v24h-36zM150 94h36v24h-36zM78 46h36v24H78z" />
        <path d="M18 118h48M138 26h64M18 26h40" />
      </g>

      <g v-else-if="activePattern === 'orbit'">
        <ellipse class="figure-fill" cx="126" cy="84" rx="72" ry="25" />
        <ellipse cx="126" cy="84" rx="72" ry="25" transform="rotate(-18 126 84)" />
        <ellipse cx="126" cy="84" rx="72" ry="25" transform="rotate(34 126 84)" />
        <circle cx="126" cy="84" r="8" />
        <circle cx="62" cy="60" r="4" class="figure-fill" />
        <circle cx="190" cy="100" r="4" class="figure-fill" />
      </g>

      <g v-else-if="activePattern === 'stairs'">
        <path class="figure-fill" d="M20 118V98h32V78h32V58h32V38h32V18h32v100z" />
        <path d="M20 118V98h32V78h32V58h32V38h32V18h32v100M20 118h180" />
        <path d="M52 98v20M84 78v40M116 58v60M148 38v80M180 18v100" />
      </g>

      <g v-else-if="activePattern === 'tunnel'">
        <rect class="figure-fill" x="25" y="23" width="170" height="96" rx="2" />
        <rect x="25" y="23" width="170" height="96" rx="2" />
        <rect x="50" y="37" width="120" height="82" rx="2" />
        <rect x="76" y="52" width="70" height="67" rx="2" />
        <rect x="98" y="67" width="26" height="52" rx="2" />
      </g>

      <g v-else-if="activePattern === 'triangles'">
        <path class="figure-fill" d="M20 120L91 22l52 98z" />
        <path d="M20 120L91 22l52 98zM91 22l49 56 60 42M72 120l68-42" />
        <path class="figure-fill" d="M122 120l35-70 44 70z" />
        <path d="M122 120l35-70 44 70z" />
      </g>

      <g v-else-if="activePattern === 'nodes'">
        <path d="M29 102L72 66 108 105 151 48 195 84M72 66l38-39M108 105l43-57M151 48l12 61" />
        <circle class="figure-fill" cx="29" cy="102" r="7" /><circle cx="29" cy="102" r="7" />
        <circle class="figure-fill" cx="72" cy="66" r="7" /><circle cx="72" cy="66" r="7" />
        <circle class="figure-fill" cx="108" cy="105" r="7" /><circle cx="108" cy="105" r="7" />
        <circle class="figure-fill" cx="151" cy="48" r="7" /><circle cx="151" cy="48" r="7" />
        <circle class="figure-fill" cx="195" cy="84" r="7" /><circle cx="195" cy="84" r="7" />
      </g>

      <g v-else>
        <path class="figure-fill" d="M25 120V68h34V45h34V25h34v20h34v23h34v52z" />
        <path d="M25 120V68h34V45h34V25h34v20h34v23h34v52M59 120V68M93 120V45M127 120V25M161 120V45M195 120V68" />
        <path d="M48 68a28 28 0 0 1 56 0M116 45a28 28 0 0 1 56 0" />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'module' },
  pattern: { type: String, default: '' },
  seed: { type: String, default: '' },
  patternIndex: { type: Number, default: -1 }
})

const patterns = ['circles', 'isometric', 'waves', 'grid', 'orbit', 'stairs', 'tunnel', 'triangles', 'nodes', 'arches']

const activePattern = computed(() => {
  if (props.pattern && patterns.includes(props.pattern)) return props.pattern
  if (props.patternIndex >= 0) return patterns[props.patternIndex % patterns.length]
  let hash = 2166136261
  const value = `${props.type}:${props.seed}`
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return patterns[(hash >>> 0) % patterns.length]
})

const variant = computed(() => {
  let hash = 2166136261
  const value = `${props.type}:${props.seed}:variant`
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) % 3
})
</script>
