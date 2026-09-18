<script setup lang="ts">
import type { GuardVisual } from '../types'

defineProps<{
  guards: GuardVisual[]
  visible: boolean
}>()

const points = (guard: GuardVisual) =>
  `${guard.apex.x},${guard.apex.y} ${guard.top.x},${guard.top.y} ${guard.bottom.x},${guard.bottom.y}`
</script>

<template>
  <Transition name="guard-fade">
    <svg
      v-if="visible"
      class="guard-overlay"
      aria-hidden="true"
      width="100%"
      height="100%"
    >
      <g
        v-for="guard in guards"
        :key="guard.depth"
        class="guard"
        :class="`guard--${guard.state}`"
      >
        <polygon class="guard__fill" :points="points(guard)" />
        <polygon class="guard__line" :points="points(guard)" />
        <circle class="guard__point" :cx="guard.apex.x" :cy="guard.apex.y" r="6" />
        <circle class="guard__point" :cx="guard.top.x" :cy="guard.top.y" r="6" />
        <circle class="guard__point" :cx="guard.bottom.x" :cy="guard.bottom.y" r="6" />
      </g>
    </svg>
  </Transition>
</template>
