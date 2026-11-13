<script setup>
/**
 * GlassSwitch —— 开关（普通轨道 + 按压变玻璃的滑块）
 *
 * 层级关系（重点）：
 *   下面那层「轨道」= 普通 DOM + CSS 背景，不参与 WebGL；开启时整条轨道灌成 color
 *   上面那颗「滑块」= 永远白色；按住拖拽时**变成无色的透明玻璃镜片**，
 *                    自身带 WebGL 折射，并且胀高到超出轨道上下边缘
 *
 * 三步状态：
 *   1. 静止：轨道（关 = 半透明灰 / 开 = color）+ 白色小滑块
 *   2. 按住 / 拖动：滑块胀开、高出轨道，白色淡出 → 成无色玻璃，折射下方内容
 *   3. 松手：弹性回落到正常尺寸，白色重新盖住玻璃
 *
 * 用法：
 *   <GlassSwitch v-model="on" />                     // 默认 normal 尺寸
 *   <GlassSwitch v-model="on" size="mini" />         // 迷你
 *   <GlassSwitch v-model="on" size="large" />        // 大
 *   <GlassSwitch v-model="on" color="#0a84ff" />
 *   <GlassSwitch :default-value="true" />            // 非受控，默认打开
 *   <GlassSwitch v-model="on" style="width:120px" /> // 想自定义尺寸也可以直接写
 *
 * props:
 *   modelValue    开关状态（布尔），v-model 绑定
 *   defaultValue  非受控时的默认值（不写 v-model 才生效），默认 false
 *   size          尺寸档位：'mini' | 'normal' | 'large'，默认 normal
 *   color         开启时轨道灌入的颜色，默认 #34c759（不影响滑块）
 *   trackColor    轨道底色（关闭态），默认半透明灰 rgba(118,118,128,.34)
 *   options       传给滑块 v-liquid-glass 的选项（材质 / 折射源）
 *
 * events:
 *   update:modelValue          状态变化（拖动中实时触发）
 *   change(value, { source })  最终状态确认，source = 'click' | 'drag' | 'key'
 *   dragstart / dragend(value) 拖动开始 / 结束（已吸附到一侧）
 *
 * 注意：class/style 透传到根元素；position:fixed/absolute 请用外层容器包裹。
 */
import { computed, getCurrentInstance, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  defaultValue: { type: Boolean, default: false },
  // 尺寸档位
  size: { type: String, default: 'normal' },
  color: { type: String, default: '#34c759' },
  trackColor: { type: String, default: 'rgba(118, 118, 128, 0.34)' },
  options: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'change', 'dragstart', 'dragend'])

/* ---- 三档尺寸（宽 / 高 / 滑块左右内边距 / 轨道上下内缩 / 滑块上下内缩） ----
 * 高宽比更接近 iOS 那样细长的胶囊：宽度压窄，滑块接近圆形。
 */
const SIZES = {
  mini: { w: 40, h: 24, pad: 2, trackInset: 3, knobInset: 2 },
  normal: { w: 52, h: 30, pad: 2, trackInset: 3, knobInset: 2 },
  large: { w: 66, h: 34, pad: 3, trackInset: 4, knobInset: 2 },
}

const sizeInfo = computed(() => SIZES[props.size] || SIZES.normal)

// 尺寸全部走 CSS 变量：一处定义，外部仍可用 style="width:..." 覆盖
const sizeVars = computed(() => {
  const s = sizeInfo.value
  return {
    '--sw-w': `${s.w}px`,
    '--sw-h': `${s.h}px`,
    '--sw-pad': `${s.pad}px`,
    '--track-inset': `${s.trackInset}px`,
    '--knob-inset': `${s.knobInset}px`,
  }
})

// 滑块宽度占「轨道可用宽度」的比例（与 CSS 里 .knob-slot 对应）
// 调大 = 滑块更宽（近似轨道厚度）；调小 = 滑块更窄更圆
const KNOB_RATIO = 0.58
// 滑块从一端滑到另一端所需的位移，换算成相对自身宽度的百分比
const KNOB_TRAVEL_PCT = ((1 - KNOB_RATIO) / KNOB_RATIO) * 100

// 按住时的膨胀倍数：等比缩放（宽高比例不变，整体变大）。
// 配合「反侧锚定」：滑到两端时长、宽都从端头凸出轨道；高度也均匀高出。
// 一个倍数同时管宽和高，避免 X/Y 分离导致的「变高」比例失衡。
const PRESS_SCALE = 1.42

// 滑块颜色：固定白色，不跟轨道走
const KNOB_COLOR = '#ffffff'

// 滑块玻璃材质：小尺寸专用的「无色透明透镜」，折射拉到最高。
// 注意 edgeReach / edgeWidth 是「占短边的比例」：默认 0.06 / 0.18 在 30px 的
// 小胶囊上只有 2px 折射带，等于看不见。这里直接顶到 1.0，整颗镜片满幅弯折。
// body 压到 0 保证完全透明，否则会糊成奶白塑料；dispersion 调大加强色散彩边。
const KNOB_MATERIAL = {
  tint: 0,
  frost: 0,
  backdropBlur: 0,
  body: 0,
  absorption: 0.2,
  refraction: 200,
  dispersion: 8,
  edgeReach: 1.0,
  edgeWidth: 1.0,
  rim: 0.4,
  reflection: 0.35,
  highlight: 0.3,
  hairline: 1.0,
}

/* ---- 受控 / 非受控 ---- */
const instance = getCurrentInstance()
const hasModel = (() => {
  const p = instance?.vnode?.props || {}
  return 'modelValue' in p || 'model-value' in p
})()
const innerOn = ref(props.defaultValue)
const isOn = computed(() => (hasModel ? props.modelValue : innerOn.value))

/* ---- 滑块位置：0 = 关（左），1 = 开（右）。拖动跟手的唯一来源 ---- */
const knobPos = ref(isOn.value ? 1 : 0)
const dragging = ref(false)
const pressed = ref(false)

let startX = 0
let startPos = 0
let dragStartValue = false
let suppressClick = false

/* ---- 滑块玻璃：按住时才挂载（省一个 WebGL 上下文），折射源跟着页面走 ---- */
const knobGlassOptions = computed(() => ({
  backdrop: props.options.backdrop ?? 'auto',
  material: { ...(props.options.material || {}), ...KNOB_MATERIAL },
}))

/* ---- 滑块位置：0 → 贴左，1 → 贴右 ---- */
const knobSlotStyle = computed(() => {
  const base = { transform: `translateX(${knobPos.value * KNOB_TRAVEL_PCT}%)` }
  // 拖动中关掉 CSS 过渡 = 跟手；否则带弹性过渡
  if (dragging.value) base.transition = 'none'
  return base
})

/* ---- 滑块膨胀：按住 → 撑开（高出轨道）；松手 → 弹性回落 ----
 * 关键：膨胀锚点要「稳定在滑块当前所贴的一侧的反侧」——
 *   滑到右端（knobPos=1）时，锚定左端，向右外侧凸出；
 *   滑到左端（knobPos=0）时，锚定右端，向左外侧凸出；
 *   中间时锚定中心，向两侧均匀微胀。
 * 这样滑到两端时滑块端头会从轨道端「冒」出去，而不是向内缩。
 */
const knobFlexStyle = computed(() => {
  const active = pressed.value
  // knobPos 1(右端) → 锚定 0%(左端) 向右胀；0(左端) → 锚定 100%(右端) 向左胀
  const anchorPct = (1 - knobPos.value) * 100
  return {
    transform: `scale(${active ? PRESS_SCALE : 1})`,
    transformOrigin: `${anchorPct}% 50%`,
  }
})

/* ---- 滑块填充色 ----
 * 滑块永远是白色，不跟开/关、也不跟轨道颜色变（颜色只属于底层轨道）。
 * 按住 → 淡出成 0，露出下面那块无色的透明玻璃。
 */
const knobFillStyle = computed(() => ({
  background: KNOB_COLOR,
  opacity: pressed.value ? 0 : 1,
}))

/* ---- 状态提交 ---- */
function commit(on, source) {
  if (on === isOn.value) return
  if (!hasModel) innerOn.value = on
  knobPos.value = on ? 1 : 0
  emit('update:modelValue', on)
  emit('change', on, { source })
}

/* ---- 指针交互 ---- */
function down(e) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  // 阻止冒泡：别让外层容器跟着按压缩放（否则轨道尺寸变化会让拖动换算抖动）
  e.stopPropagation()
  pressed.value = true
  dragging.value = false
  dragStartValue = isOn.value
  startX = e.clientX
  startPos = knobPos.value
  // 指针捕获：拖出轨道外也继续跟手
  try {
    e.currentTarget.setPointerCapture(e.pointerId)
  } catch {}
}

function move(e) {
  if (!pressed.value) return
  const dx = e.clientX - startX

  if (!dragging.value) {
    if (Math.abs(dx) < 3) return
    dragging.value = true
    emit('dragstart')
  }

  const rect = e.currentTarget.getBoundingClientRect()
  const travel = (rect.width - sizeInfo.value.pad * 2) * (1 - KNOB_RATIO)
  if (travel <= 0) return

  // 屏幕位移 → 滑块位置（0~1），钳制在两端
  const next = Math.min(1, Math.max(0, startPos + dx / travel))
  knobPos.value = next

  // 拖动中实时同步开关态（过半即切换），change 只在松手时发一次
  const on = next >= 0.5
  if (on !== isOn.value) {
    if (!hasModel) innerOn.value = on
    emit('update:modelValue', on)
  }
}

function up() {
  if (!pressed.value) return
  pressed.value = false

  if (dragging.value) {
    dragging.value = false
    const on = knobPos.value >= 0.5
    knobPos.value = on ? 1 : 0 // 吸附到最近一侧
    if (!hasModel) innerOn.value = on
    emit('dragend', on)
    if (on !== dragStartValue) emit('change', on, { source: 'drag' })
    // 拖动过就吞掉紧随其后的 click，避免又翻一次
    suppressClick = true
  }
}

function clickHandle() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  commit(!isOn.value, 'click')
}

function keyHandle() {
  commit(!isOn.value, 'key')
}

// 同步外部 v-model 变化（非拖动时）
watch(
  () => props.modelValue,
  (v) => {
    if (!dragging.value) knobPos.value = v ? 1 : 0
  },
)
</script>

<template>
  <span
    class="lg-switch"
    :class="{ on: isOn, dragging, pressed }"
    :style="sizeVars"
    role="switch"
    :aria-checked="isOn"
    tabindex="0"
    @click="clickHandle"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="up"
    @keydown.space.prevent="keyHandle"
    @keydown.enter.prevent="keyHandle"
  >
    <!-- 底层：轨道 = 普通元素，实心灰胶囊，不参与 WebGL -->
    <span class="track" :style="{ background: trackColor }" aria-hidden="true">
      <!-- 开启时灌入的颜色 -->
      <i class="tint" :style="{ background: color, opacity: isOn ? 0.95 : 0 }"></i>
    </span>

    <!-- 上层：滑块（按住时才是玻璃，且高出轨道） -->
    <span class="knob-slot" :style="knobSlotStyle">
      <span class="knob-flex" :style="knobFlexStyle">
        <span class="knob">
          <i
            v-if="pressed"
            class="knob-glass"
            v-liquid-glass="knobGlassOptions"
            aria-hidden="true"
          ></i>
          <span class="knob-fill" :style="knobFillStyle"></span>
        </span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.lg-switch {
  position: relative;
  display: inline-block;
  width: var(--sw-w, 68px);
  height: var(--sw-h, 32px);
  border-radius: 999px;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  touch-action: none; /* 拖动必需：阻止浏览器默认手势 */
}

/* ---------------- 底层轨道：普通 CSS 胶囊 ---------------- *
 * 轨道上下各内缩 --track-inset，比宿主矮一截：
 *   视觉上底座更薄，滑块会从上下边缘探出来一点（按住膨胀时更明显）。
 * 数值由 size 档位给出（3 / 4 / 5px），也可以自己覆盖这个变量。
 */
.track {
  position: absolute;
  left: 0;
  right: 0;
  top: var(--track-inset, 5px);
  bottom: var(--track-inset, 5px);
  display: block;
  border-radius: calc((var(--sw-h, 30px) - var(--track-inset, 3px) * 2) / 2);
  overflow: hidden;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.14),
    inset 0 -1px 0 rgba(255, 255, 255, 0.55),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition: background 0.26s ease;
}
/* 开启色：从右侧灌进来的一条渐变，别把整条轨道糊成纯色 */
.tint {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  transition: opacity 0.28s ease;
}

/* ---------------- 上层滑块 ---------------- */
/* 滑块静止时比轨道矮：轨道上下各内缩 --track-inset，滑块在它的基础上再往里收一点，
   滑块上下边缘都落在轨道内腔之内，端头露出轨道的胶囊弧（更精致、不臃肿）。
   按住膨胀时才撑高。宽度 = (100% - 左右 padding) × KNOB_RATIO，与 JS 一致 */
.knob-slot {
  position: absolute;
  top: calc(var(--track-inset, 3px) + var(--knob-extra, 2px));
  left: var(--sw-pad, 2px);
  width: calc((100% - var(--sw-pad, 2px) * 2) * 0.58);
  height: calc(100% - (var(--track-inset, 3px) + var(--knob-extra, 2px)) * 2);
  pointer-events: none;
  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 膨胀层：按住时把滑块撑大（纵向会高过轨道），弹性过渡。
   transform-origin 由 JS 内联样式动态设置（跟随滑块位置），这里不写死 */
.knob-flex {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 滑块本体只负责形状，不画背景（玻璃画布会盖住宿主自己的 background）。
   圆角按滑块自己的高度算（高度的一半），保证它是干净的正圆端盖；
   因为滑块比轨道略矮，端盖的圆弧会略小于轨道端头，视觉上自然精致 */
.knob {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: calc(
    (var(--sw-h, 30px) - (var(--track-inset, 3px) + var(--knob-extra, 2px)) * 2) / 2
  );
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.22),
    0 0 1px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.24s ease;
}

/* 玻璃镜片：自带 WebGL 画布（z-index:-1 插在内部），必须自成层，
   否则负 z-index 的画布会跑到更外层去 */
.knob-glass {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  overflow: hidden;
  isolation: isolate;
  z-index: 0;
}
/* 边缘曲面补光：画布是子元素，inset 阴影画不过它，用伪元素叠在最上面。
   静止态不凸起，所以这里只留很淡的一层曲面光，主打是玻璃内部的折射 */
.knob-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.32),
    inset 0 -1px 2px rgba(0, 0, 0, 0.06);
}

/* 填充层：静止时的白 / 彩色，按住（且未开启）时淡出 → 露出玻璃 */
.knob-fill {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 1;
  pointer-events: none;
  transition: opacity 0.22s ease, background 0.26s ease;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35);
}

/* 按住时阴影交给玻璃自身的轮廓光 */
.lg-switch.pressed .knob {
  box-shadow: none;
}
</style>
