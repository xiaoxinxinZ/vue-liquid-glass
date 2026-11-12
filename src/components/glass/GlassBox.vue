<script setup>
/**
 * GlassBox —— 可点击的「空玻璃容器」，用法就像普通 div
 *
 * 一块透明的液态玻璃，里面可以放任意内容（div / 文字 / 图片 / 组件），
 * 点击有「整体弹簧缩放」回弹（带 overshoot 阻尼）。
 *
 * 像 div 一样用：
 *   <GlassBox class="my-box" style="width:300px; height:200px">
 *     <div style="background:red">里面的元素随便写背景色/样式</div>
 *   </GlassBox>
 *   - class / style 会透传到根元素，所以宽高、圆角、margin、外层定位都能直接写
 *   - 但「给玻璃本身写 background 颜色无效」：玻璃是透明的，底色由材质 tint 决定，
 *     里面自己的元素则可以自由写 background
 *
 * 无对外参数、无对外事件：
 *   - 按压缩放强度固定为 0.08（内部常量，不暴露）
 *   - 磨砂度 frost 固定为 0.6（内部常量，不暴露）
 *   - press / release 事件也不向外抛，纯内部实现按压回弹
 *
 * 注意（和所有玻璃组件一样）：
 *   根元素的 transform 被按压弹簧占用；position:fixed/absolute 请用外层容器包裹，
 *   不要直接加在 GlassBox 根上，否则会覆盖内部 position:relative 导致玻璃画布错乱。
 */
import { computed, ref } from 'vue'

const props = defineProps({
  options: { type: Object, default: () => ({}) },
})

// 按压缩放强度：固定 0.08 = 按下放大 8%，不对外暴露
const GROW = 0.08
// 玻璃磨砂度：固定 0.6（0 清澈透明 ~ 1 重度磨砂奶白），不对外暴露
const FROST = 0.5

// 合并固定 frost 到材质里（写死 0.6），再交给 v-liquid-glass
const glassOptions = computed(() => ({
  ...props.options,
  material: { ...(props.options.material || {}), frost: FROST },
}))

// 「弹簧手感」交给 CSS transition 的贝塞尔曲线实现（见 .glass-box 样式）：
// 用一个 pressed 状态量驱动 transform 在「压下去 / 弹回来」之间过渡，
// 贝塞尔曲线 cubic-bezier(0.34, 1.56, 0.64, 1) 自带 overshoot ——
// 松手时缩放会越过基线再回稳，形成明确的"弹一下再落下"的阻尼感。
const pressed = ref(false)

const style = computed(() => ({
  transform: `scale(${1 + (pressed.value ? 1 : 0) * GROW})`,
  filter: `brightness(${pressed.value ? 1.12 : 1})`,
}))

const down = () => {
  pressed.value = true
}
const up = () => {
  pressed.value = false
}
</script>

<template>
  <div
    class="glass-box"
    :style="style"
    v-liquid-glass="glassOptions"
    @pointerdown="down"
    @pointerup="up"
    @pointerleave="up"
    @pointercancel="up"
  >
    <div class="glass-box-inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* 宿主：玻璃画布依赖 position:relative 锚定，务必保持 */
.glass-box {
  position: relative;
  display: block;
  border-radius: 24px;
  color: #1d1d1f;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  isolation: isolate; /* 自成层：玻璃画布的负 z-index 不跑出组件 */
  will-change: transform;
  /* 弹簧手感：松手用带 overshoot 的贝塞尔曲线，回弹会越过基线再落下，Q 弹有阻尼。
     按下时同样用一条略缓的曲线，先快后缓到位。 */
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.4s ease;
}
/* 内容层：压在玻璃之上，保证文字/元素清晰可读。
   交互默认交给外层玻璃容器（内部元素不会拦截 pointerdown，点击都能触发弹簧）；
   但如果开发者要在里面放按钮/链接等可交互元素，给那个元素单独设 pointer-events:auto 即可。 */
.glass-box-inner {
  position: relative;
  z-index: 1;
}
</style>
