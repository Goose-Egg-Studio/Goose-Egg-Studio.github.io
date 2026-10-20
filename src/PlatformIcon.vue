<script setup lang="ts">
import type { PlatformId } from './credits'
defineProps<{ platform: PlatformId }>()
</script>

<template>
  <span v-if="platform === 'taptap'" class="taptap-mark" aria-hidden="true" />
  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <g v-if="platform === 'appStore'"><path d="m9 3 9 16M15 3 5 21M3 15h10m4 0h4" /></g>
    <g v-else-if="platform === 'bilibili'"><rect x="3" y="7" width="18" height="14" rx="3" /><path d="m6 2 4 5m8-5-4 5M8 12v4m8-4v4" /></g>
    <g v-else-if="platform === 'x'"><path d="M4 3h4l12 18h-4L4 3ZM20 3 4 21" /></g>
    <g v-else-if="platform === 'googlePlay'"><path d="M4.5 3.5v17l16-8.5-16-8.5ZM4.5 3.5 15 15m-10.5 5.5L15 9" /></g>
  </svg>
</template>

<style scoped>
.taptap-mark {
  display: block;
  width: 22px;
  height: 22px;
  background-color: currentColor;
  mask: url('./assets/taptap-mark.svg') center / contain no-repeat;
}
</style>
