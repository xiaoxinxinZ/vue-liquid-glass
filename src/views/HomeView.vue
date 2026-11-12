<script setup>
import { ref } from 'vue'
import { DEFAULT_MATERIAL_V2 } from 'apple-liquid-glass-webgl'
import { GlassButton, GlassSwitch, GlassSurface } from '../components/glass'

// 组件展示页用的玻璃选项（本地常量，不依赖 store）：
// 导航的实际控制参数都在 myTabbar.vue，这里只是给 GlassButton/GlassSwitch/
// GlassSurface 这几个演示组件一个可用的材质 + 折射源。
const glassOptions = {
  material: { ...DEFAULT_MATERIAL_V2 },
  backdrop: { source: '#bg', anchor: 'viewport', fit: 'cover' },
}

// 开关状态（本地）
const switchOn = ref(false)
</script>

<template>
  <!-- 组件展示：所有液态玻璃组件都在这里，点一下、按一下都有回弹 -->
  <section class="stage">
    <header class="head">
      <h1>Liquid Glass 组件</h1>
      <p>按住看按压回弹 · 空玻璃也有折射和边缘光</p>
    </header>

    <!-- 第一排：可交互的三个 -->
    <div class="row">
      <div class="cell">
        <GlassButton class="bloom" bloom :options="glassOptions">Hold to bloom</GlassButton>
        <span class="label">GlassButton · bloom</span>
      </div>

      <div class="cell">
        <GlassSwitch v-model="switchOn" class="switch" :options="glassOptions" />
        <span class="label">GlassSwitch · {{ switchOn ? 'ON' : 'OFF' }}</span>
      </div>

      <div class="cell">
        <GlassButton class="plus" :options="glassOptions" aria-label="添加">
          <svg viewBox="0 0 24 24" width="42%" height="42%">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />
          </svg>
        </GlassButton>
        <span class="label">GlassButton · 圆形</span>
      </div>
    </div>

    <!-- 第二排：纯玻璃，里面什么都没有 -->
    <div class="row">
      <div class="cell">
        <GlassSurface class="panel" :options="glassOptions" />
        <span class="label">GlassSurface · 空玻璃 220×130</span>
      </div>

      <div class="cell">
        <GlassSurface class="disc" :options="glassOptions" />
        <span class="label">GlassSurface · 空玻璃圆</span>
      </div>
    </div>

    <p class="hint">导航：默认磨砂半透明 → 按住变玻璃并放大 → 可左右拖动，松手吸附</p>
  </section>
</template>

<style scoped>
.stage {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 38px;
  padding: 26vh 24px 64px;
  box-sizing: border-box;
}

.head {
  text-align: center;
}
.head h1 {
  margin: 0 0 8px;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}
.head p {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 40px 56px;
}

.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

/* 控制区：frost 滑杆 + 折射开关，只是给 prop 一个可视化入口，不参与组件库 */
.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 20px;
}

.frost {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #fff;
  font-size: 12px;
}
.frost-name {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}
.frost-range {
  width: 180px;
  accent-color: #0a84ff;
  cursor: pointer;
}
.frost-val {
  width: 32px;
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
}

.hint {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

/* 尺寸与形状由使用方控制，组件像普通 div 一样用 */
.bloom {
  width: clamp(140px, 13vw, 200px);
  height: clamp(38px, 5vh, 50px);
  border-radius: 999px;
  font-size: clamp(13px, 1vw, 15px);
  color: #1d1d1f;
}

.switch {
  width: 112px;
  height: 36px;
}

.plus {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #2c2c2e;
}
.plus :deep(svg) {
  pointer-events: none;
}

.panel {
  width: 220px;
  height: 130px;
  border-radius: 28px;
}

.disc {
  width: 104px;
  height: 104px;
  border-radius: 50%;
}
</style>
