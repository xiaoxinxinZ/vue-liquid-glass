<script setup>
/**
 * 液态玻璃开关 —— 用法跟普通 input 一样：
 *   <GlassSwitch v-model="on" :options="glassOptions" />
 * 结构:
 *   轨道 = 一整块玻璃（canvas 在子元素后面）
 *   开启态 = 叠在玻璃上的半透明绿（0.42），保留折射，不会变成绿方块
 *   旋钮 = 白瓷片，外层滑动 / 内层按压缩放
 */
import { computed } from 'vue'
import { usePressSpring } from '../../composables/usePressSpring'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  options: { type: Object, default: () => ({}) },
  activeColor: { type: String, default: '#34c759' },
})
const emit = defineEmits(['update:modelValue'])

const { amount, setPressed } = usePressSpring()

const rootStyle = computed(() => ({
  transform: `scale(${1 + amount.value * 0.05})`,
  filter: `brightness(${1 + amount.value * 0.16})`,
}))

const knobStyle = computed(() => ({
  transform: `scale(${1 + amount.value * 0.1})`,
}))

const toggle = () => emit('update:modelValue', !props.modelValue)
</script>

<template>
  <span
    class="lg-switch"
    :class="{ on: modelValue }"
    role="switch"
    :aria-checked="modelValue"
    tabindex="0"
    :style="rootStyle"
    v-liquid-glass="options"
    @click="toggle"
    @pointerdown="setPressed(true)"
    @pointerup="setPressed(false)"
    @pointerleave="setPressed(false)"
    @pointercancel="setPressed(false)"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <!-- 半透明色洗 + 顶边高光：玻璃上有颜色，而不是被颜色盖住 -->
    <span
      class="tint"
      :style="{ background: modelValue ? activeColor : 'transparent', opacity: modelValue ? 0.42 : 0 }"
    ></span>
    <span class="sheen" aria-hidden="true"></span>

    <span class="knob-slot">
      <span class="knob" :style="knobStyle"></span>
    </span>
  </span>
</template>

<style scoped>
.lg-switch {
  position: relative;
  display: inline-block;
  border-radius: 999px;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  touch-action: manipulation;
}

.tint {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  transition: opacity 0.28s ease;
}

/* 玻璃顶边高光：一眼看出是玻璃而不是色块 */
.sheen {
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.75),
    inset 0 -1px 1px rgba(0, 0, 0, 0.12);
}

.knob-slot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 46%;
  height: calc(100% - 6px);
  pointer-events: none;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.lg-switch.on .knob-slot {
  transform: translateX(112%);
}

.knob {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #fff;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.22),
    0 0 1px rgba(0, 0, 0, 0.12);
}
</style>
