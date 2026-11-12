<script setup>
/**
 * 纯液态玻璃表面 —— 最基础的组件，可以像 div 一样用：
 *   <GlassSurface :options="glassOptions" />
 *   <GlassSurface :options="glassOptions" style="width: 200px; height: 120px" />
 * 无内容也成立（玻璃本身就是内容），可放 slot。
 * 尺寸、圆角全部由外部 CSS 控制：它只负责"变成一块玻璃"。
 */
defineProps({
  options: { type: Object, default: () => ({}) },
})
</script>

<template>
  <div class="glass-surface" v-liquid-glass="options">
    <slot />
  </div>
</template>

<style scoped>
.glass-surface {
  display: block;
  border-radius: 24px;
  color: #1d1d1f;
}
</style>
