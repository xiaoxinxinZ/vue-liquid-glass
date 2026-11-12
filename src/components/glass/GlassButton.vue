<script setup>
/**
 * 通用液态玻璃按钮 —— 用法跟普通 <button> 一样：
 *   <GlassButton :options="glassOptions" bloom>按住我</GlassButton>
 * props:
 *   options  传给 v-liquid-glass 的选项（含 material 材质参数）
 *   bloom    按住时额外膨胀变亮（"Hold to bloom" 手感）
 * 事件:
 *   press / release
 * 内置:
 *   弹簧物理按压（官方同款 520/28 → 540/31），玻璃表面随 amount 膨胀后回弹
 * 注意:
 *   组件根元素的 transform 被按压动画占用；需要居中定位请用外层容器包裹
 */
import { computed } from 'vue'
import { usePressSpring } from '../../composables/usePressSpring'

const props = defineProps({
  options: { type: Object, default: () => ({}) },
  bloom: { type: Boolean, default: false },
})
const emit = defineEmits(['press', 'release'])

const { amount, setPressed } = usePressSpring()

const style = computed(() => {
  const grow = props.bloom ? 0.1 : 0.055
  return {
    transform: `scale(${1 + amount.value * grow})`,
    filter: `brightness(${1 + amount.value * (props.bloom ? 0.3 : 0.12)})`,
  }
})

const down = () => { setPressed(true); emit('press') }
const up = () => { if (amount.value > 0) { setPressed(false); emit('release') } }
</script>

<template>
  <button
    class="glass-btn"
    :style="style"
    v-liquid-glass="options"
    @pointerdown="down"
    @pointerup="up"
    @pointerleave="up"
    @pointercancel="up"
  >
    <slot />
  </button>
</template>

<style scoped>
.glass-btn {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  touch-action: manipulation;
}
</style>
