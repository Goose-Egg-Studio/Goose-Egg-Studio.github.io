<script setup lang="ts">
import { PLATFORMS, type PlatformLinks } from './credits'
import PlatformIcon from './PlatformIcon.vue'
defineProps<{ links?: PlatformLinks }>()
</script>

<template>
  <nav class="platform-links" aria-label="Simple 平台链接 / Simple platform links">
    <template v-for="platform in PLATFORMS" :key="platform.id">
      <a v-if="links?.[platform.id]" class="platform-link" :href="links[platform.id]" target="_blank" rel="noopener noreferrer" :title="platform.label" :aria-label="`${platform.label}（新窗口打开 / opens in a new tab）`">
        <PlatformIcon :platform="platform.id" />
      </a>
      <span v-else class="platform-link is-unavailable" role="img" :title="`${platform.label} · 暂无链接 / Link unavailable`" :aria-label="`${platform.label} · 暂无链接 / Link unavailable`">
        <PlatformIcon :platform="platform.id" />
      </span>
    </template>
  </nav>
</template>
