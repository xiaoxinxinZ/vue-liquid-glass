<script setup>
/**
 * SwitchPanel —— 磨砂白开关面板
 *
 * 几行 GlassSwitch，演示 size 三档 + v-model / defaultValue / change 事件。
 */
import { ref } from 'vue'
import GlassSwitch from '../components/glass/GlassSwitch.vue'

// 开关状态（本地演示用）
const notifyOn = ref(true) // v-model 绑定，默认打开
const darkOn = ref(false) // 自定义颜色（蓝）
const lastEvent = ref('') // change 事件回显

// change 事件（source: click / drag / key）
function onChange(value, meta) {
  lastEvent.value = `${value ? '开' : '关'} · ${meta.source}`
}
</script>

<template>
  <div class="switch-panel">
    <div class="switch-row">
      <GlassSwitch v-model="notifyOn" size="mini" class="demo-switch" @change="onChange" />
      <span class="switch-label">迷你 · size="mini"</span>
    </div>
    <div class="switch-row">
      <GlassSwitch v-model="darkOn" class="demo-switch" color="#0a84ff" @change="onChange" />
      <span class="switch-label">正常 · 默认尺寸</span>
    </div>
    <div class="switch-row">
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
</template>

<style scoped>
.switch-panel {
  pointer-events: auto;
  width: 300px;
  border-radius: 24px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14);
}
.switch-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.demo-switch {
  flex: none;
}
.switch-label {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
}
.switch-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(17, 17, 41, 0.08);
  font-size: 12px;
  color: #8c8ca8;
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
  color: #6a5cff;
}
</style>
