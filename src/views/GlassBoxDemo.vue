<script setup>
/**
 * GlassTile —— 「渐变」内容的液态玻璃块 demo
 *
 * 用 GlassBox 包一块渐变内容，验证玻璃折射真实图片/渐变块的效果。
 */
import GlassBox from '../components/glass/GlassBox.vue'
</script>

<template>
  <GlassBox class="grad-tile">
    <div class="grad-hero">
      <span class="grad-badge">渐变</span>
    </div>
    <div class="grad-body">
      <span>这块玻璃里放了渐变块内容</span>
    </div>
  </GlassBox>
</template>

<style scoped>
.grad-tile {
  pointer-events: auto;
  width: 280px;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
}
.grad-hero {
  height: 56px;
  background: linear-gradient(120deg, #6a5cff, #c471f5, #48c6ef);
  position: relative;
}
.grad-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #111129;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
}
.grad-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
}
.grad-body strong {
  font-size: 16px;
  color: #111129;
}
.grad-body span {
  font-size: 13px;
  color: #8c8ca8;
}
</style>
