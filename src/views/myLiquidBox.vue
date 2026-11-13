<script setup>
/**
 * myLiquidBox —— GlassBox 空玻璃容器 + GlassSwitch 开关的使用示例
 *
 * 演示如何把任意 div / 文字 / 图片 / 小组件塞进一块可点击、按压会弹簧缩放的玻璃里。
 * GlassBox 是零配置组件：不传任何参数、不接任何事件，像普通 div 一样用即可。
 * GlassSwitch 支持点击切换 + 拖动跟手滑动。
 * 尺寸、圆角、位置都由外层 CSS 控制，里面元素自由写背景色/样式。
 */
import { onMounted, ref } from 'vue'
import GlassBox from '../components/glass/GlassBox.vue'
import GlassSwitch from '../components/glass/GlassSwitch.vue'

// 开关状态（本地演示用）
const notifyOn = ref(true) // v-model 绑定，默认打开
const darkOn = ref(false) // 自定义颜色（蓝）
const lastEvent = ref('') // change 事件回显

// v-model 事件 + change 事件（source: click / drag / key）
function onChange(value, meta) {
  lastEvent.value = `${value ? '开' : '关'} · ${meta.source}`
}

// 调试用：?press=1 时自动按住第一个开关，方便截图看玻璃态
onMounted(() => {
  if (!location.search.includes('press')) return
  setTimeout(() => {
    // 第二个开关（关状态）按住 → 应该变成玻璃
    const el = document.querySelectorAll('.demo-switch')[1]
    if (!el) return
    const r = el.getBoundingClientRect()
    const base = {
      bubbles: true,
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      clientY: r.top + r.height / 2,
    }
    el.dispatchEvent(new PointerEvent('pointerdown', { ...base, clientX: r.left + 12 }))
    el.dispatchEvent(new PointerEvent('pointermove', { ...base, clientX: r.left + 20 }))
  }, 600)
})
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

    <!-- 示例 4：玻璃开关（点击 + 拖动；size 三档 / v-model / 默认值 / 自定义颜色 / 事件）
         注意：这里用普通 div 当面板，不要用 GlassBox 套玻璃 —— 玻璃不建议嵌套 -->
    <div class="switch-panel">
      <div class="switch-row">
        <GlassSwitch v-model="notifyOn" size="mini" class="demo-switch" @change="onChange" />
        <span class="switch-label">迷你 · size="mini"</span>
      </div>
      <div class="switch-row">
        <!-- 不写 size 就是 normal（默认档） -->
        <GlassSwitch v-model="darkOn" class="demo-switch" color="#0a84ff" @change="onChange" />
        <span class="switch-label">正常 · 默认尺寸</span>
      </div>
      <div class="switch-row">
        <!-- 非受控：只给默认值，组件自己管状态 -->
        <GlassSwitch
          size="large"
          class="demo-switch"
          color="#ff9f0a"
          :default-value="true"
          @change="onChange"
        />
        <span class="switch-label">大 · size="large"</span>
      </div>
      <div class="switch-foot">
        <span class="dot"></span>
        change 事件：<code>{{ lastEvent || '还没操作过' }}</code>
      </div>
    </div>
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

/* 开关面板：三行开关 + 事件回显。
   故意用高对比渐变当底：滑块玻璃要弯折到有细节的东西才看得出折射 */
.switch-panel {
  pointer-events: auto;
  width: 300px;
  border-radius: 24px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  /* 斜纹是给玻璃弯折用的：折射平滑渐变等于没折射，只有高频细节才看得出被扭曲 */
  background-image:
    repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.16) 0px,
      rgba(255, 255, 255, 0.16) 2px,
      transparent 2px,
      transparent 13px
    ),
    linear-gradient(135deg, #6a5cff 0%, #c471f5 46%, #48c6ef 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 16px 44px rgba(17, 17, 41, 0.18);
}
.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
/* 开关尺寸由组件的 size 档位决定，这里只固定不参与 flex 伸缩 */
.demo-switch {
  flex: none;
}
.switch-label {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.switch-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.28);
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}
.switch-foot .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
}
.switch-foot code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #fff;
}
</style>
