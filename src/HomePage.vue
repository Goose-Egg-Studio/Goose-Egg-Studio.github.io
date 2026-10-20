<script setup lang="ts">
import type { PlatformLinks as Links } from './credits'
import PlatformLinks from './PlatformLinks.vue'
defineProps<{ studioName: string; links?: Links }>()
</script>

<template>
  <div class="home-view">
    <section class="home-hero" aria-labelledby="home-title">
      <p class="home-eyebrow">鹅蛋工作室</p>
      <h1 id="home-title" class="home-title">{{ studioName }}</h1>
      <a class="home-credits-link" href="#/credits">
        <span>鸣谢</span><span class="link-en" lang="en">Credits</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
      </a>
    </section>

    <section class="home-work" data-divider aria-labelledby="work-title">
      <div class="section-heading"><span class="section-marker" aria-hidden="true"></span><h2 id="work-title">作品<span class="heading-en" lang="en">Our Work</span></h2></div>
      <div class="home-project">
        <h3>Simple</h3>
        <p>音乐游戏<span class="translation" lang="en">Rhythm game</span></p>
        <PlatformLinks :links="links" />
      </div>
      <span class="section-divider" aria-hidden="true"></span>
    </section>
  </div>
</template>
