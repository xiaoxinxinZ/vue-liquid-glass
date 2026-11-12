<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { LiquidGlass } from 'apple-liquid-glass-webgl'
import MyTabbar from './views/myTabbar.vue'

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

  <!-- 封装的液态玻璃导航（参数都写在 myTabbar.vue 里） -->
  <MyTabbar />

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
</style>
