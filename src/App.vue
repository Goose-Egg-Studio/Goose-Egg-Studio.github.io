<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef, watch, watchEffect } from 'vue'
import MemberNames from './MemberNames.vue'
import HomePage from './HomePage.vue'
import HeaderNav from './HeaderNav.vue'
import { createDividerRenderer } from './dividers'
import { type CreditsData, type DisplayGroup, displayGroups, displayCreators, displaySections, validateData } from './credits'

const data = shallowRef<CreditsData>()
const ordered = shallowRef<DisplayGroup[]>([])
const orderedCreators = shallowRef<DisplayGroup[]>([])
const loading = ref(true)
const error = ref('')
function pageFromHash(): 'home' | 'credits' {
  return ['#/credits', '#/credits/', '#credits'].includes(window.location.hash) ? 'credits' : 'home'
}
const page = ref(pageFromHash())
const compactHeader = ref(window.scrollY > 24)
const mobile = ref(window.matchMedia('(max-width: 760px)').matches)
const arcPlane = ref<HTMLDivElement>()
const pageShell = ref<HTMLDivElement>()
const mainContent = ref<HTMLElement>()
let resizeObserver: ResizeObserver | undefined
let dividerFrame = 0
let dividerLayoutDirty = true
const dividerRenderer = createDividerRenderer()
const visible = computed(() => ordered.value.filter(group => group.members.length > 0))
const sections = computed(() => displaySections(visible.value))
const logoUrl = `${import.meta.env.BASE_URL}gooseegg-logo.png`
const creators = computed(() => orderedCreators.value[0]?.members || [])
const count = computed(() => creators.value.length + visible.value.reduce((sum, group) => sum + group.members.length, 0))

watchEffect(() => {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mobile.value ? '#ffffff' : '#edf1f2')
})
watchEffect(() => {
  if (!data.value) return
  ordered.value = displayGroups(data.value)
  orderedCreators.value = displayCreators(data.value)
})
watchEffect(() => {
  const studioName = data.value?.studio.name || 'GooseEgg Studio'
  document.title = page.value === 'home' ? studioName : `鸣谢 / Credits · ${studioName}`
})
function updateDividers() {
  if (mobile.value) return
  if (dividerLayoutDirty) {
    dividerRenderer.measure(arcPlane.value, pageShell.value, window.scrollY, document.documentElement.clientWidth)
    dividerLayoutDirty = false
  }
  dividerRenderer.render(window.scrollY, window.innerHeight)
}
function requestDividerFrame() {
  if (mobile.value || dividerFrame) return
  dividerFrame = requestAnimationFrame(() => { dividerFrame = 0; updateDividers() })
}
function scheduleDividers() {
  dividerLayoutDirty = true
  requestDividerFrame()
}
function handleScroll() {
  compactHeader.value = window.scrollY > 24
  requestDividerFrame()
}
function handleNavigation() {
  page.value = pageFromHash()
}
function skipToContent() {
  mainContent.value?.focus({ preventScroll: true })
  mainContent.value?.scrollIntoView({ behavior: 'instant', block: 'start' })
}
watch(page, () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  handleScroll()
  mainContent.value?.focus({ preventScroll: true })
}, { flush: 'post' })
watch([visible, creators], scheduleDividers, { flush: 'post' })
function handleResize() {
  mobile.value = window.matchMedia('(max-width: 760px)').matches
  scheduleDividers()
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}credits.json`, { cache: 'no-store' })
    if (!response.ok) throw new Error('名单文件暂时无法读取。')
    data.value = validateData(await response.json())
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '名单加载失败。'
  } finally { loading.value = false }
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('hashchange', handleNavigation)
  window.addEventListener('resize', handleResize)
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleDividers)
    if (arcPlane.value) resizeObserver.observe(arcPlane.value)
    if (pageShell.value) resizeObserver.observe(pageShell.value)
  }
  handleScroll()
  load()
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('hashchange', handleNavigation)
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  if (dividerFrame) cancelAnimationFrame(dividerFrame)
})
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="skipToContent">跳到主要内容 / <span lang="en">Skip to content</span></a>
  <div class="scenery" aria-hidden="true">
    <div ref="arcPlane" class="white-arc"></div><div class="outer-arc"></div>
    <span class="outline-diamond diamond-two"></span>
    <span class="outline-diamond diamond-three"></span>
  </div>

  <div class="header-space">
    <header class="topbar" :class="{ 'is-compact': compactHeader }">
      <div class="topbar-inner">
      <div class="topbar-brand">
      <a class="wordmark" href="#/" :aria-label="data?.studio.name || 'GooseEgg Studio'">
        <svg class="studio-logo" viewBox="222 313 1476 346" aria-hidden="true"><image :href="logoUrl" width="1920" height="1080" /></svg>
      </a>
      <HeaderNav :page="page" />
      </div>
      </div>
    </header>
  </div>

  <div ref="pageShell" class="page-shell">
    <main ref="mainContent" id="main-content" class="page-stage" tabindex="-1">
      <Transition name="page" mode="out-in" @after-enter="scheduleDividers">
      <HomePage v-if="page === 'home'" key="home" :studio-name="data?.studio.name || 'GooseEgg Studio'" :links="data?.links" />
      <div v-else key="credits" class="credits-view">
      <section class="intro" aria-labelledby="page-title">
        <h1 id="page-title">鸣谢<span class="page-title-en" lang="en">Credits</span></h1>
      </section>

      <section v-if="loading" class="state-panel" role="status"><span class="loading-diamond" aria-hidden="true"></span><p>正在加载鸣谢名单<span class="translation" lang="en">Loading credits</span></p></section>
      <section v-else-if="error" class="state-panel" role="alert"><h2>名单暂时无法显示<span class="translation" lang="en">Unable to load credits</span></h2><p>{{ error }}</p><button class="text-action" @click="load">重新加载 / <span lang="en">Reload</span> <span aria-hidden="true">↗</span></button></section>

      <section v-else-if="data" id="credits" class="credits-content" aria-label="工作室鸣谢名单 / Studio credits">
        <div class="list-meta"><p>成员排名不分先后<span v-if="data.studio.demo" class="demo-tag">演示名单 / Demo</span><span class="translation" lang="en">Names are listed in no particular order.</span></p></div>

        <section v-if="creators.length" class="creator-section" data-divider aria-labelledby="creator-title">
          <div class="section-heading"><span class="section-marker" aria-hidden="true"></span><h2 id="creator-title">主创<span class="heading-en" lang="en">Creator</span></h2></div>
          <div class="creator-signature"><MemberNames :members="creators" featured /></div>
          <span class="section-divider" aria-hidden="true"></span>
        </section>

        <div class="group-list">
          <section v-for="section in sections" :key="section.id" class="credit-category" :aria-labelledby="section.title ? `section-${section.id}` : undefined">
            <h2 v-if="section.title" :id="`section-${section.id}`" class="category-title">{{ section.title }}<span v-if="section.en" class="heading-en" lang="en">{{ section.en }}</span></h2>
            <section v-for="group in section.groups" :key="group.id" class="credit-section" data-divider :aria-labelledby="`group-${group.id}`">
              <div class="section-heading"><span class="section-marker" aria-hidden="true"></span><component :is="section.title ? 'h3' : 'h2'" :id="`group-${group.id}`">{{ group.title }}<span v-if="group.en" class="heading-en" lang="en">{{ group.en }}</span></component></div>
              <MemberNames :members="group.members" />
              <span class="section-divider" aria-hidden="true"></span>
            </section>
          </section>
        </div>
        <div v-if="!count" class="state-panel" role="status"><p>名单尚未添加。<span class="translation" lang="en">No credits have been added yet.</span></p></div>

        <div class="ending"><div class="ending-rule" aria-hidden="true"><span></span></div><p class="ending-title">Every name. Every note.</p><p>{{ data.studio.closing }}<span v-if="data.studio.closingEn" class="translation" lang="en">{{ data.studio.closingEn }}</span></p><span class="ending-caption">THANK YOU FOR BEING HERE.</span></div>
      </section>
      </div>
      </Transition>
    </main>
    <footer class="footer"><span>© {{ data?.studio.name || 'GooseEgg Studio' }}</span><a v-if="page === 'credits'" href="#/"><span aria-hidden="true">←</span><span>首页</span><span lang="en">Home</span></a></footer>
  </div>
</template>
