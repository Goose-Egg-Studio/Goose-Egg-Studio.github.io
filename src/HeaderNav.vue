<script setup lang="ts">
defineProps<{ page: 'home' | 'credits' }>()
</script>

<template>
  <nav class="header-nav" aria-label="主要导航 / Main navigation">
    <a class="header-nav-link" href="#/" :aria-current="page === 'home' ? 'page' : undefined">
      <span>首页</span><span lang="en">Home</span>
    </a>
    <a class="header-nav-link" href="#/credits" :aria-current="page === 'credits' ? 'page' : undefined">
      <span>鸣谢</span><span lang="en">Credits</span>
    </a>
  </nav>
</template>
