<script setup>
/**
 * GlassTile —— 「渐变」内容的液态玻璃块 demo
 *
 * 用 GlassBox 包一块渐变内容，验证玻璃折射真实图片/渐变块的效果。
 */
import GlassBox from '../components/glass/GlassBox.vue'
</script>

<template>
  <div class="demo">
    <GlassBox class="grad-tile" :grow="1">
      <div class="grad-hero">
        <span class="grad-badge">grow = 1 最强</span>
      </div>
      <div class="grad-body">
        <span>这块玻璃里放了渐变块内容</span>
        <span class="hint">固定像素，弹得最猛</span>
      </div>
    </GlassBox>

    <GlassBox class="grad-tile" :grow="0">
      <div class="grad-hero grad-hero--alt">
        <span class="grad-badge">grow = 0 不弹</span>
      </div>
      <div class="grad-body">
        <span>完全不弹，只保留亮度反馈</span>
        <span class="hint">点击试试</span>
      </div>
    </GlassBox>
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
  padding: 24px;
}
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
.grad-hero--alt {
  background: linear-gradient(120deg, #5d6d7e, #85929e, #aeb6bf);
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
.grad-body .hint {
  font-size: 11px;
  color: #b0b0c4;
}
</style>
