<script setup>
/**
 * GlassSwitchDemo —— 磨砂白开关面板
 *
 * 演示 GlassSwitch：v-model（0/1）+ color + size + change + disabled。
 * v-model 绑数字时，change 回调里的 v 就是变化后的 0/1。
 */
import { ref } from 'vue'
import GlassSwitch from '../components/glass/GlassSwitch.vue'

// 三个开关状态（0 / 1），v-model 自动双向
const miniOn = ref(1)      // 默认蓝色，初始开
const normalOn = ref(0)    // 绿色预设
const largeOn = ref(0)     // 自定义橙
const disabledOn = ref(1)  // 禁用示例，固定开
</script>

<template>
  <div class="switch-panel">
    <div class="switch-row">
      <GlassSwitch v-model="miniOn" size="mini" @change="(v) => console.log(v)" />
      <span class="switch-label">mini · 默认蓝</span>
    </div>
    <div class="switch-row">
      <GlassSwitch v-model="normalOn" color="green" @change="(v) => console.log(v)" />
      <span class="switch-label">normal · green</span>
    </div>
    <div class="switch-row">
      <GlassSwitch v-model="largeOn" size="large" color="#ff9f0a" @change="(v) => console.log(largeOn)" />
      <span class="switch-label">large · 自定义橙</span>
    </div>
    <div class="switch-row">
      <GlassSwitch v-model="disabledOn" size="large" color="#0a84ff" disabled  />
      <span class="switch-label">disabled · 禁用</span>
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
</style>
