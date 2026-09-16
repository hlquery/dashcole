<template>
  <component
    :is="componentTag"
    v-bind="linkProps"
    class="guide-card"
    :class="[`tone-${tone}`, `size-${size}`]"
    :style="{ '--box-color': boxColor }"
  >
    <div class="guide-card-content">
      <span class="guide-card-category">{{ category }}</span>
      <h3>{{ title }}</h3>
      <span class="guide-card-read-more">
        <span>Leer más</span>
        <span class="guide-card-read-more-arrow" aria-hidden="true">
          <svg viewBox="0 0 18 18" fill="none">
            <path d="M2.5 9h12M10.5 5l4 4-4 4" />
          </svg>
        </span>
      </span>
    </div>

    <div class="guide-card-visual" aria-hidden="true">
      <GuideCardFigure
        :type="figureType"
        :seed="seed"
        :patternIndex="sequenceIndex"
      />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import GuideCardFigure from './GuideCardFigure.vue'

const props = defineProps({
  title: { type: String, required: true },
  category: { type: String, required: true },
  tone: { type: String, default: 'blue' },
  size: { type: String, default: 'medium' },
  figureType: { type: String, default: 'module' },
  seed: { type: String, default: '' },
  sequenceIndex: { type: Number, default: 0 },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null }
})

const boxColors = [
  '#635BFF',
  '#1683F3',
  '#FF7A1A',
  '#F6538C',
  '#7A5AF8',
  '#00A6A6',
  '#1565D8',
  '#D94A8C',
  '#F6C453',
  '#2D8CFF',
  '#C77DFF',
  '#F08A5D'
]

const boxColor = computed(() => boxColors[props.sequenceIndex % boxColors.length])

const componentTag = computed(() => (props.to ? RouterLink : 'a'))
const linkProps = computed(() => {
  if (props.to) {
    return { to: props.to }
  }

  const propsOut = { href: props.href || '#' }
  if (props.href && /^https?:\/\//.test(props.href)) {
    propsOut.target = '_blank'
    propsOut.rel = 'noopener noreferrer'
  }

  return propsOut
})
</script>
