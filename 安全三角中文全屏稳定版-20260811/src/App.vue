<script setup lang="ts">
import CascadingMenu from './components/CascadingMenu.vue'

document.title = '安全三角 · 中文版'
</script>

<template>
  <main class="fullscreen-canvas">
    <CascadingMenu :show-geometry="true" />
  </main>
</template>
