<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { LiquidGlass } from 'apple-liquid-glass-webgl'
import { GlassNav } from './components/glass'
import { useGlassStore } from './stores/glass'

import imgHome from './assets/home.png'
import imgSearch from './assets/search.png'
import imgLibrary from './assets/library.png'
import imgMy from './assets/my.png'
import imgActiveHome from './assets/activeHome.png'
import imgActiveSearch from './assets/activeSearch.png'
import imgActiveLibrary from './assets/activeLibrary.png'
import imgActiveMy from './assets/activeMy.png'

const store = useGlassStore()

// v-model 绑的是 items 里的 value，不是索引
const tab = ref('home')

// 导航宽度跟随 tab 数量 + 单格宽度：GlassNav 把"目标单格宽"回报到这里，
// 导航宽度 = 目标单格宽 × 数量 + 左右内边距，正好"几个 tab 撑多宽"
const segTarget = ref(null)
// 与 GlassNav 的 PAD=4 对应：左右各留 4px 内边距
const NAV_PAD_X = 8
const navWidth = computed(() => {
  // 拿到目标单格宽之前不设宽度（由 CSS 兜底）
  if (!segTarget.value) return undefined
  return `${navItems.length * segTarget.value + NAV_PAD_X}px`
})

// 图标用你在 assets 里放的 PNG：常态版（黑）+ 选中版（彩色）
const navItems = [
  { label: 'Home', value: 'home', normalImg: imgHome, activeImg: imgActiveHome },
  { label: 'Discover', value: 'discover', normalImg: imgSearch, activeImg: imgActiveSearch },
  { label: 'Library', value: 'library', normalImg: imgLibrary, activeImg: imgActiveLibrary },
  { label: 'Profile', value: 'profile', normalImg: imgMy, activeImg: imgActiveMy },
]

// 点谁都触发（包括当前已选中的那一项）
function onNavClick({ item, index, value }) {
  console.log('[GlassNav] click →', item.label, value, index)
}

// 只有选中项真的变了才触发
function onNavChange(item, value, index) {
  console.log('[GlassNav] change →', item.label, value, index)
}

// GlassNav 回报"目标单格宽"（常量，固定值）
function onSegTarget(t) {
  segTarget.value = t
}

// 背景图加载完后刷新一次玻璃，避免首帧折射到空白
onMounted(() => {
  const bg = document.getElementById('bg')
  if (bg?.complete) {
    LiquidGlass.refreshAll()
  } else {
    bg?.addEventListener('load', () => LiquidGlass.refreshAll(), { once: true })
  }
})
</script>

<template>
  <!-- 固定背景图：一张图，不切换；玻璃的折射源就是它 -->
  <img id="bg" class="bg" src="/earth.png" alt="" aria-hidden="true" />

  <GlassNav
    v-model="tab"
    class="navbar"
    :style="{ width: navWidth }"
    :items="navItems"
    :options="store.glassOptions"
    :frost="store.navFrost"
    color="#1d1d1f"
    active-color="#0a84ff"
    @click="onNavClick"
    @change="onNavChange"
    @seg-target="onSegTarget"
  />

  <RouterView />
</template>

<style scoped>
.bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  user-select: none;
}

.navbar {
  position: fixed;
  top: 25vh;
  left: 0;
  right: 0;
  margin-inline: auto; /* 不用 transform 居中：避免玻璃画布定位漂移 */
  z-index: 10;
  width: clamp(288px, 66vw, 600px); /* 兜底：GlassNav 回报目标单格宽后由 :style 覆盖为精确值 */
  height: clamp(52px, 7.2vh, 68px); /* 图标 + 文字上下排列；比之前矮一点 */
  border-radius: 999px;
}
</style>
