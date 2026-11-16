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
 * 弹性动画只暴露一个参数 grow：
 *   - grow: 0 ~ 1，0 = 完全不弹，1 = 弹得最强（默认 0.5）。
 *     弹的是「固定像素」而非比例：无论盒子多大，按下时宽、高两边的边缘位移像素都相同。
 *     grow 映射到固定像素档位 = grow * 5px（即 grow=1 时每边位移 5px，grow=0.5 时 2.5px），
 *     再按宽高分别反推 scaleX/scaleY，因此大小元素手感绝对一致，不会「越大越夸张」。
 *     代价：宽高放大比例不同，宽高悬殊的元素按下会轻微变形（圆角变椭圆）。
 *
 * Props:
 *   - frost: 磨砂度 0 ~ 1（0 清澈透明 ~ 1 重度磨砂奶白），默认 0.6
 *   - grow:  弹性强度 0 ~ 1（默认 0.6）
 *
 * 注意（和所有玻璃组件一样）：
 *   根元素的 transform 被按压弹簧占用；position:fixed/absolute 请用外层容器包裹，
 *   不要直接加在 GlassBox 根上，否则会覆盖内部 position:relative 导致玻璃画布错乱。
 */
import { computed, ref } from 'vue'
// 指令局部注册：script setup 里名为 vXxx 的变量可直接当 v-xxx 用，
// 这样组件脱离「全局注册」也能独立工作（npm 包形态必需）
import { liquidGlass as vLiquidGlass } from '../../directives/liquidGlass.js'

const props = defineProps({
  // 磨砂度：0 清澈透明 ~ 1 重度磨砂奶白
  frost: { type: Number, default: 0.6 },
  // 弹性强度 0 ~ 1（0 = 不弹，1 = 最强），固定像素位移
  grow: { type: Number, default: 0.5 },
})

// 弹性最大位移（像素）：grow=1 时边缘位移 5px，0~1 线性映射到 0~5px
const MAX_SHIFT = 5

// 根元素节点：用于读取按下时的实际尺寸，把固定像素位移反推回 scale
const rootEl = ref(null)

// 磨砂度交给材质的 frost（0.1~1 夹取，防误传负数/超界），其余材质全部用原库默认值
const glassOptions = computed(() => ({
  material: { frost: Math.min(1, Math.max(0, props.frost)) },
}))

// 「弹簧手感」交给 CSS transition 的贝塞尔曲线实现（见 .glass-box 样式）：
// 用一个 pressed 状态量驱动 transform 在「压下去 / 弹回来」之间过渡，
// 贝塞尔曲线 cubic-bezier(0.34, 1.56, 0.64, 1) 自带 overshoot ——
// 松手时缩放会越过基线再回稳，形成明确的"弹一下再落下"的阻尼感。
const pressed = ref(false)

// 固定像素位移换算成 scale：
//   按下位移 px = clamp(grow, 0, 1) * MAX_SHIFT，是固定像素、不随尺寸放大；
//   再按宽、高分别反推 scaleX/scaleY = 1 + px / 对应边长，
//   这样宽、高两边的边缘位移像素都精确等于 px，大小元素绝对一致。
//   （副作用：宽高放大比例不同，元素会轻微变形，圆角会变椭圆——这是选「分开缩放」的代价）
//   grow=0 时 px=0 → scale=1，完全不弹。
const scale = computed(() => {
  if (!pressed.value) return { x: 1, y: 1 }
  const g = Math.min(1, Math.max(0, Number(props.grow)))
  if (g === 0) return { x: 1, y: 1 }

  const px = g * MAX_SHIFT
  const el = rootEl.value
  const w = el ? el.offsetWidth : 0
  const h = el ? el.offsetHeight : 0
  // 兜底：尺寸未知时按 100px 近似，避免除零
  const sx = w ? 1 + px / w : 1 + px / 100
  const sy = h ? 1 + px / h : 1 + px / 100
  return { x: sx, y: sy }
})

const style = computed(() => ({
  transform: `scale(${scale.value.x}, ${scale.value.y})`,
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
    ref="rootEl"
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
