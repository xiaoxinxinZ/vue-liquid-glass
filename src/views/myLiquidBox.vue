<script setup>
/**
 * myLiquidBox —— GlassBox 空玻璃容器的使用示例
 *
 * 演示如何把任意 div / 文字 / 图片 / 小组件塞进一块可点击、按压会弹簧缩放的玻璃里。
 * GlassBox 是零配置组件：不传任何参数、不接任何事件，像普通 div 一样用即可。
 * 尺寸、圆角、位置都由外层 CSS 控制，里面元素自由写背景色/样式。
 */
import GlassBox from '../components/glass/GlassBox.vue'
</script>

<template>
  <!-- 外层 wrapper 负责定位（玻璃组件根元素依赖 position:relative，定位不要直接加在它上面） -->
  <div class="box-demo">
    <!-- 示例 1：玻璃卡片，里面放标题 + 文字（内部元素自由写背景色/样式） -->
    <GlassBox class="card">
      <div class="card-head">
        <span class="emoji">✨</span>
        <span class="tag">GlassBox 卡片</span>
      </div>
      <h3 class="card-title">任意内容都能塞进来</h3>
      <p class="card-text">
        这是一块可点击的液态玻璃容器，里面放了标题、段落、emoji，点击时整块会弹簧缩放回弹。
      </p>
      <!-- 内部元素可以自由写背景色 -->
      <div class="inner-block">我内部带了背景色</div>
    </GlassBox>

    <!-- 示例 2：玻璃图卡，里面放渐变封面 + 文案 -->
    <GlassBox class="cover">
      <div class="cover-hero">
        <span class="cover-badge">NEW</span>
      </div>
      <div class="cover-body">
        <strong>渐变封面</strong>
        <span>里面放图片 / 渐变块也 OK</span>
      </div>
    </GlassBox>

    <!-- 示例 3：玻璃按钮块，里面放一个小图标组件（内联 SVG） -->
    <GlassBox class="mini">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
      <span class="mini-label">添加</span>
    </GlassBox>
  </div>
</template>

<style scoped>
.box-demo {
  position: fixed; /* 固定悬浮：滚动页面时玻璃保持不动，方便观察折射下方划过内容的效果 */
  top: 40vh;       /* 仍在屏幕中上部，避开顶部导航（导航在 25vh） */
  left: 0;
  right: 0;
  z-index: 5; /* 在官网内容之上、导航之下 */
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  padding: 0 24px;
  pointer-events: none; /* 整体穿透，只玻璃本身可点 */
}

.card {
  pointer-events: auto;
  width: 300px;
  border-radius: 26px;
  padding: 26px;
  /* 注意：GlassBox 玻璃本身是透明的，不写 background；
     里面的 .card-head / 文字等元素可以自由写背景色 */
  box-shadow: 0 12px 40px rgba(17, 17, 41, 0.10);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.emoji { font-size: 26px; }
.tag {
  font-size: 12px;
  font-weight: 600;
  color: #6a5cff;
  background: rgba(106, 92, 255, 0.12);
  padding: 4px 12px;
  border-radius: 999px;
}
.card-title {
  margin: 0 0 10px;
  font-size: 20px;
  color: #111129;
}
.card-text {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #55556c;
}
/* 内部元素自由写背景色 */
.inner-block {
  padding: 12px 16px;
  border-radius: 12px;
  background: linear-gradient(120deg, #6a5cff, #c471f5);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.cover {
  pointer-events: auto;
  width: 300px;
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(17, 17, 41, 0.10);
}
.cover-hero {
  height: 100px;
  background: linear-gradient(120deg, #6a5cff, #c471f5, #48c6ef);
  position: relative;
}
.cover-badge {
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
.cover-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
}
.cover-body strong {
  font-size: 16px;
  color: #111129;
}
.cover-body span {
  font-size: 13px;
  color: #8c8ca8;
}

.mini {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 14px 20px;
  box-shadow: 0 8px 24px rgba(17, 17, 41, 0.10);
  color: #111129;
}
.mini-label {
  font-size: 14px;
  font-weight: 600;
}
</style>
