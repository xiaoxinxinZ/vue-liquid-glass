<script setup>
/**
 * GlassButtonDemo —— 用 GlassBox 封装的「按钮形状」玻璃
 *
 * 演示如何把封装好的液态玻璃组件 GlassBox 做成椭圆胶囊按钮：
 * 外挂 border-radius:999px + 小内边距，里面放 icon + 文字。
 */
import GlassBox from '../components/glass/GlassBox.vue'
</script>

<template>
  <GlassBox class="glass-btn">
    <span>添加</span>
  </GlassBox>
</template>

<style scoped>
/* 关键：GlassBox 本身是玻璃，这里把它做成椭圆胶囊按钮的形状（圆角 999px + 小内边距） */
.glass-btn {
  pointer-events: auto;
  gap: 7px;
  padding: 10px 20px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}
</style>
