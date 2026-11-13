<script setup>
/**
 * GlassNav —— 液态玻璃胶囊导航
 *
 * <GlassNav
 *   v-model="tab"
 *   :items="navItems"
 *   :frost="0.6"              // 0~1：整条导航的柔滑比例
 *   color="#1d1d1f" active-color="#0a84ff"
 *   @click="onClick" @change="onChange"
 * />
 *
 * items 每项：{ label, value, normalImg?, activeImg?, to? }
 *   label      必填，图标下方的文字
 *   value      必填，v-model 绑定的就是它（不是索引）
 *   normalImg  未选中图标（PNG）/ activeImg 选中图标（PNG），只传这两张图即可
 *              建议两张图同轮廓、不同颜色，半程变色时形状一致、无错位黑边
 *   to         可选，填了点击就跳转（有 router 走 router.push，否则 location.assign）
 *
 * 事件
 *   @click   ({ item, index, value, originalEvent })  点谁都触发，包括当前已选中项
 *   @change  (item, value, index)                     只有选中项真的变了才触发
 *
 * 交互
 *   pointerdown 就选中并滑过去（不用等松手），移动超过 3px 转为拖动跟手，
 *   松手吸附最近一项并弹簧回弹。
 *
 * 折射（固定开启，无开关）
 *   按住时玻璃升到文字上方，图标文字进入折射源被掰弯。
 *   按压态材质刻意压低 edgeReach / edgeWidth / refraction：否则镜片边缘的
 *   捕获带会把轨道描边线和文字折叠成上下两道黑色拖影。
 */
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { routerKey } from 'vue-router'

const props = defineProps({
  items: { type: Array, required: true },
  modelValue: { type: [String, Number], default: '' },
  color: { type: String, default: '#1d1d1f' },
  activeColor: { type: String, default: '#0a84ff' },
  /** 0~1，导航整体柔滑比例：0 = 清澈透明（折射锐利，几乎看不见玻璃本体），1 = 重度磨砂奶白 */
  frost: { type: Number, default: 0.6 },
  /**
   * 单个 tab 的目标宽度（px）。组件据此自动算出导航总宽 = 单格宽 × tab 数 + 左右内边距，
   * 做到「几个 tab 撑多宽」。所以使用方通常不需要再给导航设宽度。
   * 默认 76：按 iOS 26 胶囊 tab bar 的紧凑间距（单格 ≥ 44pt tap target）。
   */
  segWidth: { type: Number, default: 76 },
})
// 材质 / 折射 / 高度内部写死，不对外暴露 options / height
const emit = defineEmits(['update:modelValue', 'change', 'click'])

/* ---------------- 常量：想调手感改这里 ---------------- */
const PAD = 4 // 文字层相对导航的内边距
const NAV_HEIGHT = 56 // 导航高度：对齐 iOS 26 tab bar regular（56pt），内部锁死不可自定义
// 按压/拖动时：胶囊横向撑开 + 纵向长高，形成"凸起的清澈透镜"
const GROW_W = 1.12 // 按压时胶囊宽度倍数（横向撑开，仍以格子中心为轴）
const GROW_H = 1.15 // 按压时胶囊高度倍数
const PILL_LIFT = 10 // 按压时至少要高出导轨的像素，导航很矮时也不至于被压扁
// 按压/拖动时整个导航的弹簧形变：横向拉长、纵向压矮（"弹一下"的那种 Q 感）。
// 这两个值同时喂给 CSS（transform: scale）和拖动位移换算，必须保持唯一来源。
const PRESS_SCALE_X = 1.035
const PRESS_SCALE_Y = 0.94
// 按压态胶囊：清澈玻璃。
// 按住时玻璃升到文字上方，折射源加入页面内容（backdrop 里的 'auto'），
// 图标文字才会被玻璃弯折。
// 边缘参数是刻意调低的：镜片最外圈的采样深度 ≈ refraction*0.32 + edgeReach 带宽，
// 默认值（84 / 0.14 / 0.21）会采样到 40px 深处，正好压在文字行和轨道描边线上，
// 把它们折叠成上下两道黑色拖影。压到 ~22px 内就只弯背景、不拖黑影。
// 按压态胶囊：清澈玻璃。
// 按住时玻璃升到文字上方，折射源加入页面内容（backdrop 里的 'auto'），
// 图标文字才会被玻璃弯折。
// 折射深度（refraction*0.32 + edgeReach 带宽 ≈ 27px）决定镜片边缘把
// 多深的内容折叠进轮廓带：太浅文字弯不动，太深整行都会被压成糊带。
// 注意：鬼影的真正根源是采集器不认 clip-path（见 solid 层），不是这里的参数。
const PRESSED_MATERIAL = {
  // 清澈透镜：body 是玻璃主体（"厚度/乳白度"）不透明度，默认 0.72。
  // 之前为了凸起感调到 0.8，结果滑块被霜成一块白塑料；压到 0.4 才回到
  // "能直接看见背景和文字"的透镜状态，体积感交给边缘 rim / highlight。
  tint: 0.02,
  frost: 0,
  body: 0.4,
  refraction: 66,
  dispersion: 2.4,
  edgeReach: 0.05,
  edgeWidth: 0.16,
  // 边缘立体光：滑块是透明的，凸起感全靠轮廓光撑。
  // rim/反射/高光只影响轮廓附近的加亮，不会把文字拖成黑影，可以放心调高。
  rim: 0.5,
  reflection: 0.55,
  highlight: 0.6,
  hairline: 1.0,
}

/* ---------------- 状态 ---------------- */
const navEl = ref(null)
const activeIndex = ref(resolveIndex(props.modelValue))
const pressed = ref(false)
const dragging = ref(false)

const navW = ref(0)
const navH = ref(0)
const segW = ref(0)
const slotX = ref(PAD)

let ro

function resolveIndex(value) {
  const i = props.items.findIndex((it) => it.value === value)
  return i < 0 ? 0 : i
}

function measure() {
  const nav = navEl.value
  if (!nav) return
  // 用 offsetWidth/offsetHeight（布局尺寸），不能用 getBoundingClientRect：
  // 按压时整个导航带 scale(sx, sy) 弹簧动画，rect 返回的是缩放后的尺寸，
  // 拿它算胶囊几何会让"按一次小一圈"，几何必须始终基于布局尺寸。
  const w = nav.offsetWidth
  const h = nav.offsetHeight
  if (!w || !h) return
  navW.value = w
  navH.value = h
  segW.value = (w - PAD * 2) / Math.max(1, props.items.length)
  if (!dragging.value) slotX.value = PAD + activeIndex.value * segW.value
}

function indexAt(clientX) {
  const nav = navEl.value
  if (!nav) return 0
  const rect = nav.getBoundingClientRect()
  // rect 可能正处在按压缩放中：用比例把屏幕坐标换算回布局坐标，
  // 否则缩放越大、光标落点越偏向内侧
  const scaleX = rect.width ? navW.value / rect.width : 1
  const x = (clientX - rect.left) * scaleX
  const i = Math.floor((x - PAD) / Math.max(1, segW.value))
  return Math.max(0, Math.min(props.items.length - 1, i))
}

// 按胶囊当前位置换算最近的格子（拖动收尾用它吸附，比用指针坐标稳）
function indexFromSlot() {
  return Math.max(
    0,
    Math.min(
      props.items.length - 1,
      Math.round((slotX.value - PAD) / Math.max(1, segW.value)),
    ),
  )
}

onMounted(() => {
  measure()
  nextTick(measure)
  ro = new ResizeObserver(measure)
  if (navEl.value) ro.observe(navEl.value)

  // 没传 v-model 时把第一项抛出去，父组件才拿得到初始值
  if (props.modelValue === '' || props.modelValue == null) {
    const first = props.items[0]
    if (first) emit('update:modelValue', first.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())

watch(
  () => props.modelValue,
  (v) => {
    const i = resolveIndex(v)
    if (i === activeIndex.value) return
    activeIndex.value = i
    if (!dragging.value) snapTo(i)
  },
)

watch(
  () => props.items.map((it) => it.value).join('|'),
  () => {
    activeIndex.value = resolveIndex(props.modelValue)
    nextTick(measure)
  },
)

/* ---------------- 选中 ---------------- */
function select(index) {
  const item = props.items[index]
  if (!item) return
  activeIndex.value = index
  emit('update:modelValue', item.value)
  emit('change', item, item.value, index)
}

function snapTo(index) {
  nextTick(() => {
    slotX.value = PAD + index * segW.value
  })
}

/* ---------------- 指针：按下即切换 ---------------- */
let startX = 0
let startSlot = 0

function pointerDown(e) {
  pressed.value = true

  const index = indexAt(e.clientX)
  if (index !== activeIndex.value) select(index)

  startX = e.clientX
  startSlot = PAD + index * segW.value
  slotX.value = startSlot

  navEl.value?.setPointerCapture?.(e.pointerId)
}

function pointerMove(e) {
  if (!pressed.value) return
  // 按压时整个导航横向被放大 PRESS_SCALE_X，屏幕位移要换算回布局位移，
  // 胶囊才会严丝合缝地跟手（否则会慢 3%）
  const dx = (e.clientX - startX) / PRESS_SCALE_X

  // 超过 3px 才算拖动：这时才关掉过渡，让胶囊跟手
  if (!dragging.value) {
    if (Math.abs(dx) <= 3) return
    dragging.value = true
  }

  const maxX = PAD + segW.value * (props.items.length - 1)
  slotX.value = Math.min(Math.max(startSlot + dx, PAD), maxX)

  // 拖动过程中实时跟随换色：胶囊滑到哪一格，哪一格就是选中色，
  // 离开的格子立刻还原；否则松手前颜色会一直停在按下时那一格。
  const hovered = indexFromSlot()
  if (hovered !== activeIndex.value) select(hovered)
}

function pointerUp(e) {
  if (!pressed.value) return
  dragging.value = false
  pressed.value = false

  // 吸附按胶囊落点算（指针坐标在缩放中会有偏差，且拖动末尾胶囊还在弹簧动画里）
  const index = indexFromSlot()
  if (index !== activeIndex.value) select(index)
  snapTo(index)

  emit('click', {
    item: props.items[index],
    index,
    value: props.items[index]?.value,
    originalEvent: e,
  })

  const to = props.items[index]?.to
  if (to) navigate(to)
}

/* ---------------- 跳转（to 可选） ---------------- */
const router = inject(routerKey, null)

function navigate(to) {
  if (router) router.push(to)
  else window.location.assign(to)
}

/* ---------------- 图标：真 <img> 标签 ----------------
 * 必须用 <img>（而不是 CSS mask 上色），否则 auto 折射源抓取页面内容时
 * 抓不到图标形状（库不还原 mask / 也不画 SVG），图标就会变成一块纯色方块。
 * 渲染两遍：常态层用默认色 img，选中色层用选中色 img，靠 clip-path 对齐胶囊
 * 来做"半程变色"，所以 PNG 要预先备好两套染色：-c(默认色) / -a(选中色)。
 */
const normalIcon = (item) => item.normalImg || item.activeImg
const activeIcon = (item) => item.activeImg || item.normalImg

/* ---------------- 材质 ---------------- */
// 材质基础参数用库的默认值（空对象 = 走 apple-liquid-glass-webgl 的 DEFAULT_MATERIAL_V2），
// frost / tint 由组件内部按 frost prop 实时推导，不接外部 options。
function baseMaterial() {
  return {}
}

// 折射源固定 'auto'（整页重绘）：把玻璃下方划过的所有真实页面元素
// （文字、图片、渐变块、卡片……）都画进折射源，实现「任意内容划过都被折射」。
function baseBackdrop() {
  return 'auto'
}

// frost 一个旋钮同时给材质两件事：
//   frost → 折射前的预模糊半径（0 清澈锐利，1 重度雾化）
//   tint  → 白色涂层不透明度（跟着一起长，否则低 frost 时会被 tint 糊成一块灰白）
// 0.58 时 tint = 0.48，就是当前这套"半透明白墙 + 可见折射"的样子。
const frostValue = computed(() => {
  const f = Number(props.frost)
  return Number.isFinite(f) ? Math.min(1, Math.max(0, f)) : 0.58
})

const trackOptions = computed(() => {
  const base = baseMaterial()
  // 按住/拖动时：模糊度在组件自身 frost 基础上 +0.2（封顶 1），
  // 而不是固定写死成 1 —— 否则 frost 本身就很高的组件，按下反而会因为
  // tint 回落而显得更透明（视觉倒退）。
  const on = pressed.value || dragging.value
  const f = on ? Math.min(1, frostValue.value + 0.3) : frostValue.value
  return {
    material: { ...base, frost: f, tint: on ? 0.5 : 0.12 + 0.62 * f },
  }
})

/* 滑块磨砂白度：始终比轨道更通透（白度更低），这样轨道是一层雾、滑块是一块更清亮的透镜。
   frost=0 时滑块和轨道都近透明；frost=1 时轨道奶白，滑块仍保留一点通透，不会糊成纯白。 */
const pillAlpha = computed(() => 0.28 + 0.44 * frostValue.value)

// 按压态胶囊：清澈玻璃 + 折射页面内容。
// 折射源必须是 'auto'（整页重绘）：这是库唯一能把 tab 图标文字画进取样图的
// 方式（换成 '#元素' 只会画那个元素的 CSS 背景，layerFromElement 不画文字，
// 滑块里就会空成一片）。代价是导轨玻璃也会被采集进去，所以导轨的磨砂要克制。
const glassOptions = computed(() => {
  const base = baseMaterial()
  const background = baseBackdrop()
  // 按压时统一用 'auto'（整页重绘，含玻璃下方所有真实元素）；静止时用显式源（默认也是 auto）
  return {
    backdrop: pressed.value ? 'auto' : background,
    material: { ...base, ...PRESSED_MATERIAL },
  }
})

/* ---------------- 几何 ---------------- */
// 静止：宽 = 一格、高 = 导航内高（贴着导轨）。
// 按压：横向撑开 GROW_W、纵向长高 GROW_H（并保底高出导轨 PILL_LIFT）。
// 撑开部分仍以格子中心为轴，但整体夹在导航内：贴边时如果居中就会溢出到
// 导航外面，而那里不属于任何导轨，会直接透出背景（"四个角变透明"的来源）。
const pill = computed(() => {
  const w = pressed.value ? segW.value * GROW_W : segW.value
  const h = pressed.value
    ? Math.max(navH.value * GROW_H, navH.value + PILL_LIFT)
    : Math.max(0, navH.value - PAD * 2)
  const maxX = Math.max(PAD, navW.value - PAD - w)
  const x = Math.min(Math.max(slotX.value + (segW.value - w) / 2, PAD), maxX)
  return { x, y: (navH.value - h) / 2, w, h }
})

const rootStyle = computed(() => ({
  // 导航总宽 = 单格宽 × tab 数 + 左右内边距（内聚在组件里，使用方无需算宽度）
  width: `${props.items.length * props.segWidth + PAD * 2}px`,
  height: `${NAV_HEIGHT}px`,
  '--nav-fg': props.color,
  '--nav-active-fg': props.activeColor,
  '--pill-a': pillAlpha.value,
  '--press-sx': PRESS_SCALE_X,
  '--press-sy': PRESS_SCALE_Y,
}))

const pillStyle = computed(() => ({
  width: `${pill.value.w}px`,
  height: `${pill.value.h}px`,
  top: `${pill.value.y}px`,
  transform: `translate3d(${pill.value.x}px, 0, 0)`,
}))

// 选中色图层：裁切范围 = 胶囊本身（换算到 labels 坐标系，即减去 PAD）
const clipStyle = computed(() => {
  const inner = Math.max(1, navW.value - PAD * 2)
  const left = Math.max(0, pill.value.x - PAD)
  const right = Math.max(0, inner - left - pill.value.w)
  return { clipPath: `inset(0 ${right}px 0 ${left}px round 999px)` }
})

// 常态层切成左右两块，正好把胶囊那段挖空：胶囊里只留"选中色"那一份图标，
// 否则描边版和实心版叠在一起就会描出一圈黑边
const baseClipLeft = computed(() => {
  const inner = Math.max(1, navW.value - PAD * 2)
  const left = Math.max(0, pill.value.x - PAD)
  return { clipPath: `inset(0 ${Math.max(0, inner - left)}px 0 0)` }
})

const baseClipRight = computed(() => {
  const inner = Math.max(1, navW.value - PAD * 2)
  const end = Math.min(inner, Math.max(0, pill.value.x - PAD) + pill.value.w)
  return { clipPath: `inset(0 0 0 ${end}px)` }
})
</script>

<template>
  <nav
    ref="navEl"
    class="glass-nav"
    :class="{ dragging, pressed }"
    :style="rootStyle"
    role="tablist"
    @pointerdown.prevent="pointerDown"
    @pointermove.prevent="pointerMove"
    @pointerup.prevent="pointerUp"
    @pointercancel="pointerUp"
  >
    <!-- 0 层：轨道玻璃 -->
    <span class="track" v-liquid-glass="trackOptions" aria-hidden="true"></span>

    <!-- 1 层：静止态磨砂白，几何与胶囊完全同步，按住时淡出 -->
    <span class="pill frost-layer" :style="pillStyle" aria-hidden="true"><i></i></span>

    <!-- 2 层：常态文字图标，被切成"胶囊左边 / 胶囊右边"两块 -->
    <div class="labels base" :style="baseClipLeft" aria-hidden="true">
      <span v-for="item in items" :key="`l-${item.value}`" class="seg">
        <img class="seg-icon" :src="normalIcon(item)" :alt="item.label" draggable="false" />
        <span class="seg-label">{{ item.label }}</span>
      </span>
    </div>
    <div class="labels base" :style="baseClipRight" aria-hidden="true">
      <span v-for="item in items" :key="`r-${item.value}`" class="seg">
        <img class="seg-icon" :src="normalIcon(item)" :alt="item.label" draggable="false" />
        <span class="seg-label">{{ item.label }}</span>
      </span>
    </div>

    <!-- 3 层：选中色副本，裁切 = 胶囊本身 → 胶囊盖到哪，哪就是选中色 -->
    <div class="labels is-active" :style="clipStyle" aria-hidden="true">
      <span v-for="item in items" :key="`a-${item.value}`" class="seg">
        <img class="seg-icon" :src="activeIcon(item)" :alt="item.label" draggable="false" />
        <span class="seg-label">{{ item.label }}</span>
      </span>
    </div>

    <!-- 3.5 层：按压实层（不裁切，按选中项直接换色/换图）。
         按住时顶替上面三层进折射源：库的 DOM 采集器不认 clip-path，
         三份裁切副本会被当成三份完整文字画进折射源，镜片边缘就会
         折出"所有 tab 文字"的鬼影。 -->
    <div class="labels solid" aria-hidden="true">
      <span
        v-for="(item, i) in items"
        :key="`d-${item.value}`"
        class="seg"
        :class="{ 'is-on': i === activeIndex }"
      >
        <img
          class="seg-icon"
          :src="i === activeIndex ? activeIcon(item) : normalIcon(item)"
          :alt="item.label"
          draggable="false"
        />
        <span class="seg-label">{{ item.label }}</span>
      </span>
    </div>

    <!-- 4 层：胶囊玻璃（静止在文字下面，按住升到文字上方） -->
    <span class="pill glass-layer" :style="pillStyle">
      <i v-liquid-glass="glassOptions"></i>
    </span>

    <!-- 无障碍：真实可读标签 -->
    <span class="sr-only">
      <span v-for="(item, i) in items" :key="`s-${item.value}`" role="tab" :aria-selected="i === activeIndex">
        {{ item.label }}
      </span>
    </span>
  </nav>
</template>

<style scoped>
.glass-nav {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  box-sizing: border-box;
  color: var(--nav-fg);
  cursor: grab;
  touch-action: none;
  user-select: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate; /* 自成层：玻璃画布的负 z-index 不会跑出组件 */
  transform-origin: center center;
  will-change: transform;
  /* 按压/拖动时整体"变长变矮"的弹簧形变，松手弹回。
     库用 screenWidth/offsetWidth 做 scale 补偿（dom.js），所以画布不会错位。
     只在 transform 上过渡，绝不给 width/height 加过渡：inline 宽度每次变化
     都会触发一轮动画，与这里抢合成层，弹簧就僵硬了。 */
  transition: transform 0.46s cubic-bezier(0.34, 1.6, 0.64, 1);
}
.glass-nav.pressed {
  transform: scale(var(--press-sx), var(--press-sy));
}
.glass-nav.dragging {
  cursor: grabbing;
}

/* 0 层：轨道玻璃（本身无内容，纯背景）。
   尺寸就是导航本身，不做任何外扩：外扩会让"整体"比滑块还高，
   看起来像滑块陷进导航里。 */
.track {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  border-radius: inherit;
}

/* 胶囊几何：磨砂白层和玻璃层永远同尺寸同位置，只切层级 */
.pill {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 999px;
  pointer-events: none;
  will-change: transform, top, width, height;
  transition:
    transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    top 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* 拖动时横向必须跟手，宽高仍保留弹簧 */
.glass-nav.dragging .pill {
  transition:
    top 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    width 0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
    height 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 静止态：玻璃在底、磨砂白盖在它上面、文字在最上面 */
.frost-layer {
  z-index: 2;
}
.frost-layer > i {
  position: absolute;
  inset: 0;
  display: block;
  border-radius: inherit;
  background: linear-gradient(
    168deg,
    rgba(255, 255, 255, calc(var(--pill-a) + 0.06)) 0%,
    rgba(255, 255, 255, calc(var(--pill-a) - 0.08)) 52%,
    rgba(255, 255, 255, var(--pill-a)) 100%
  );
  backdrop-filter: blur(16px) saturate(1.5);
  -webkit-backdrop-filter: blur(16px) saturate(1.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 1px rgba(0, 0, 0, 0.05),
    0 1px 5px rgba(0, 0, 0, 0.1);
  transition: opacity 0.22s ease;
}

.glass-layer {
  z-index: 1;
}
.glass-layer > i {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
}
/* 镜面凸起补光：WebGL 画布是子元素，inset 阴影画不过它，
   所以用 ::after 叠在最上面，给镜片一圈"上亮下暗"的曲面高光。
   只压边缘一点点：滑块本体必须保持透明，白高光一重就又变成白塑料。 */
.glass-layer::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1.5px 2px rgba(255, 255, 255, 0.55),
    inset 0 -1.5px 3px rgba(255, 255, 255, 0.16),
    inset 0 -6px 10px -6px rgba(0, 0, 0, 0.07);
}

/* 按住：磨砂白淡出（连同 backdrop-filter 一起关掉，否则会留一个多余的合成层） */
.glass-nav.pressed .frost-layer > i {
  opacity: 0;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* 按住：玻璃升到文字上方，文字/图标进折射源被弯折。 */
.glass-nav.pressed .glass-layer {
  z-index: 4;
}

/* 文字图标（上下排列）：默认在玻璃上方，清晰不折射 */
.labels {
  position: absolute;
  inset: 4px;
  z-index: 5;
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: clip-path 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.labels.is-active {
  z-index: 6;
  color: var(--nav-active-fg);
}
/* 按住把文字退回玻璃下面，交给玻璃折射。
   同时切到"实层"：三份裁切副本退场（采集器不认 clip-path，
   它们会以完整形态混进折射源），只留一份真实文字给镜片折。 */
.glass-nav.pressed .labels {
  z-index: 2;
}
.glass-nav.pressed .labels.is-active {
  z-index: 3;
}
.labels.solid {
  visibility: hidden;
  z-index: 2;
}
.glass-nav.pressed .labels.solid {
  visibility: visible;
}
.glass-nav.pressed .labels.base,
.glass-nav.pressed .labels.is-active {
  visibility: hidden;
}
.labels.solid .seg.is-on {
  opacity: 1;
  color: var(--nav-active-fg);
}
.glass-nav.dragging .labels {
  transition: none; /* 拖动时裁切必须跟手 */
}

.seg {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px; /* iOS 26：图标与文字间距约 4pt */
  padding: 0 4px;
}

/* 图标是真 <img>：颜色已经在 PNG 里预染好（-c 默认色 / -a 选中色），
   这样折射缓冲里能抓到图标的真实形状，而不是 mask 上色留下的方块。
   24px 对齐 iOS 26 SF Symbols 的标准尺寸（24×24pt，medium weight） */
.seg-icon {
  width: 24px;
  height: 24px;
  flex: none;
  display: block;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/* 文字：SF Pro Text 10pt / medium（iOS 26 tab bar 标准字号） */
.seg-label {
  max-width: 100%;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.labels:not(.is-active) .seg {
  opacity: 0.8;
}

.sr-only {
  position: absolute;
  /* 必须挪出导航画布：库的 DOM 采集器不认 overflow:hidden/clip，
     留在原地会把整行 tab 文字画进折射源，按住时左上角折出鬼影 */
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
