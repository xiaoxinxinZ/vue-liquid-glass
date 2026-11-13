<script setup>
/**
 * App —— 组合四个液态玻璃 demo + 一屏背景
 *
 * 四个 demo（各一个 vue）：
 *   GlassTabbarDemo   胶囊导航
 *   GlassBoxDemo      渐变玻璃块
 *   GlassButtonDemo   按钮形状的液态玻璃
 *   GlassSwitchDemo   磨砂白开关面板
 *
 * 背景图直接写在这里（App 是全页根），bg.jpeg 铺满全屏、不滚动。
 */
import GlassTabbarDemo from './views/GlassTabbarDemo.vue'
import GlassBoxDemo from './views/GlassBoxDemo.vue'
import GlassButtonDemo from './views/GlassButtonDemo.vue'
import GlassSwitchDemo from './views/GlassSwitchDemo.vue'
</script>

<template>
  <div class="app">
    <!-- 底部全屏背景 -->
    <div class="bg" aria-hidden="true"></div>

    <!-- 导航（fixed 在顶部 25vh） -->
    <GlassTabbarDemo />

    <!-- 其余三个 demo：竖排悬浮在中上部 -->
    <div class="demos">
      <GlassBoxDemo />
      <GlassButtonDemo />
      <GlassSwitchDemo />
    </div>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  height: 100vh;      /* 一屏 */
  overflow: hidden;   /* 不滚动 */
}

/* 背景：bg.jpeg 铺满全屏、不重复、不变形 */
.bg {
  position: absolute;
  inset: 0;
  background-image: url('./assets/bg.jpeg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

/* 三个 demo 竖排悬浮 */
.demos {
  position: fixed;
  top: 40vh;          /* 避开顶部导航（导航在 25vh） */
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 0 24px;
  pointer-events: none; /* 整体穿透，只内部可点元素自开 */
}
</style>
