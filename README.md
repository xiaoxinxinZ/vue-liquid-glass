# Liquid Glass 组件库

一套基于 **apple-liquid-glass-webgl** 的 Vue 3 液态玻璃（Liquid Glass）组件，模拟 Apple 风格的玻璃质感 —— 透明、折射、磨砂、按压膨胀。当前包含：

| 组件 | 说明 |
| --- | --- |
| **GlassSwitch** | 玻璃开关 |
| **GlassNav** | 胶囊导航（Tabbar） |
| **GlassBox** | 可点击的空玻璃容器 |

---

# GlassSwitch 开关组件

普通轨道 + 按压变玻璃的滑块。**按住 / 拖动时，白色滑块会变成一块无色透明玻璃镜片**，自身带 WebGL 折射、把背后的画面掰弯，并等比膨胀到超出轨道上下边缘。

## 特性

- 🔵 **v-model 双向绑定**，值支持 `0/1` 或 `true/false`
- 🎨 **两个内置预设色 + 自定义色**（不传即默认蓝色）
- 📏 **三档尺寸**：`mini` / `normal` / `large`
- 🧊 **按压变玻璃**：滑块变透明镜片，折射背景，等比放大凸出轨道
- 🖐 **点击 + 拖动**：点击切换、拖动跟手、松手吸附
- 🚫 **禁用态**：颜色变淡（非置灰失真），不可交互
- ♿ **无障碍**：`role="switch"` + `aria-checked` + `aria-disabled`

## 快速上手

```vue
<script setup>
import { ref } from 'vue'
import { GlassSwitch } from '@/components/glass'

const on = ref(0) // 0 关 ／ 1 开
</script>

<template>
  <GlassSwitch v-model="on" />
</template>
```

> **值类型跟随输入**：`v-model` 绑数字（`0/1`），`update:modelValue` 和 `change` 就回 `0/1`；绑布尔（`true/false`）就回布尔。

## 完整用法

```vue
<template>
  <!-- 默认：normal 尺寸、蓝色 -->
  <GlassSwitch v-model="on" />

  <!-- 指定尺寸 -->
  <GlassSwitch v-model="on" size="mini" />
  <GlassSwitch v-model="on" size="large" />

  <!-- 颜色：内置预设名 blue / green -->
  <GlassSwitch v-model="on" color="blue" />
  <GlassSwitch v-model="on" color="green" />

  <!-- 颜色：任意 CSS 颜色（hex / rgb / hsl） -->
  <GlassSwitch v-model="on" color="#ff9f0a" />

  <!-- 禁用 -->
  <GlassSwitch v-model="on" disabled />

  <!-- change 事件：v 是变化后的值 -->
  <GlassSwitch v-model="on" @change="(v) => console.log(v)" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `modelValue` | `Boolean \| Number` | `false` | **v-model / model-value** 绑定值。`0/1` 或 `true/false`（内部归一化成布尔）。输出「跟随输入类型」 |
| `defaultValue` | `Boolean \| Number` | `false` | 非受控默认值（不传 `modelValue` 时生效） |
| `size` | `String` | `'normal'` | 尺寸档位：`'mini'` \| `'normal'` \| `'large'` |
| `color` | `String` | `'blue'` | 开启色。内置预设 `'blue'`（`#0a84ff`）/ `'green'`（`#34c759`），或直接传任意 CSS 颜色自定义 |
| `trackColor` | `String` | `rgba(118,118,128,.34)` | 轨道底色（关闭态） |
| `disabled` | `Boolean` | `false` | 禁用：不可点击 / 拖动 / 键盘，颜色变淡并移除焦点 |

> **注意**：材质与折射参数内部已写死，不提供 `options` 属性，无法从外部覆盖。

### 尺寸档位

| size | 宽 × 高 |
| --- | --- |
| `mini` | 40 × 24 |
| `normal` | 52 × 30 |
| `large` | 66 × 34 |

### 颜色预设

| color | 色值 |
| --- | --- |
| `blue`（默认） | `#0a84ff` |
| `green` | `#34c759` |
| 自定义 | 传入任意 CSS 颜色字符串 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(value)` | v-model 双向，值类型跟随输入（`0/1` 或 `bool`） |
| `change` | `(value, { source })` | 状态确认。`source` = `'click'` \| `'drag'` \| `'key'` |

```vue
<GlassSwitch
  v-model="on"
  @change="(value, meta) => console.log('值', value, '来源', meta.source)"
/>
```

## 交互说明

- **点击**：切换开关状态（`source: 'click'`）
- **拖动**：按住拖动滑块，跟随手指/鼠标移动，过半即切换；松手吸附到最近一侧（`source: 'drag'`）
- **键盘**：`Space` / `Enter` 切换（`source: 'key'`）
- **按压**：滑块膨胀变玻璃，折射下方内容；松手弹簧回弹

## 注意事项

1. **尺寸不可自定义**：`width` / `height` / `border-radius` 由组件内部锁定（尺寸只能通过 `size` 预设控制），外部写 `class` / `style` 改宽高**不会生效** —— 这是为了保持圆角比例不失衡。
2. **定位**：`position: fixed / absolute` 请用外层容器包裹，不要直接加在组件根元素上（根元素的 `transform` 被按压弹簧动画占用）。
3. **玻璃不能嵌套**：玻璃组件之间不要互相嵌套，折射源会互相干扰。

---

# GlassNav 胶囊导航组件

液态玻璃胶囊 Tabbar，尺寸完全对齐 **iOS 26 Tab Bar 规范**。悬浮胶囊形态（圆角 = 高度/2），图标 + 文字上下排列，按住时玻璃升到文字上方折射背景、胶囊跟随手指滑动、松手吸附到最近一项。

## 特性

- 📏 **iOS 26 规范尺寸**：高 56pt、图标 24×24pt、文字 10pt medium
- 🔄 **v-model 双向绑定**（绑 `value`，非索引）
- 🧊 **按压变玻璃**：按住时胶囊变玻璃透镜，折射下方画面
- 🖐 **点击 + 拖动**：按下即选中滑动、拖动跟手、松手吸附弹簧回弹
- 🎨 **frost 磨砂旋钮**：`0` 清澈透明 ~ `1` 重度磨砂奶白
- 🧩 **PNG 图标**：常态图 + 选中图两套，半程变色无缝

## 快速上手

```vue
<script setup>
import { ref } from 'vue'
import { GlassNav } from '@/components/glass'
import imgHome from '@/assets/home.png'
import imgActiveHome from '@/assets/activeHome.png'
// ... 其余图标

const tab = ref('home')

const items = [
  { label: 'Home', value: 'home', normalImg: imgHome, activeImg: imgActiveHome },
  // ...
]
</script>

<template>
  <GlassNav v-model="tab" :items="items" />
</template>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `Array` | 必填 | 每个 tab：`{ label, value, normalImg?, activeImg?, to? }`（见下方 items 结构） |
| `modelValue` | `String \| Number` | `''` | v-model 绑定值（绑 `value`，不是索引） |
| `frost` | `Number` | `0.6` | 磨砂比例：`0` 清澈透明 ~ `1` 重度磨砂奶白 |
| `color` | `String` | `'#1d1d1f'` | 未选中文字/图标颜色 |
| `activeColor` | `String` | `'#0a84ff'` | 选中态颜色 |
| `segWidth` | `Number` | `76` | 单个 tab 目标宽度（px），导航总宽 = `segWidth × 数量 + 内边距` |
| `height` | `Number` | `56` | 导航高度（px），对齐 iOS 26 regular（56pt） |
| `options` | `Object` | `{}` | 传给 `v-liquid-glass` 的选项（材质 / 折射源） |

### items 结构

```js
{
  label: 'Home',        // 必填：图标下方文字
  value: 'home',        // 必填：v-model 绑定的就是它
  normalImg: imgHome,   // 未选中图标（PNG）
  activeImg: imgActive, // 选中图标（PNG）
  to: '/home',          // 可选：填了点击跳转（router.push 或 location.assign）
}
```

> 建议 `normalImg` / `activeImg` 两张图同轮廓、不同颜色，半程变色时形状一致、无错位黑边。

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `(value)` | v-model 双向 |
| `change` | `(item, value, index)` | 仅选中项真正变化时触发 |
| `click` | `({ item, index, value, originalEvent })` | 点谁都触发（含当前已选中项） |

```vue
<GlassNav
  v-model="tab"
  :items="items"
  @click="({ item, value }) => console.log('点了', value)"
  @change="(item, value, index) => console.log('切换', value, index)"
/>
```

## 交互说明

- **点击**：`pointerdown` 就选中并滑过去（不等松手）
- **拖动**：移动超 3px 转拖动跟手，松手吸附最近项并弹簧回弹
- **按压**：玻璃升到文字上方，图标文字进入折射源被掰弯

## 注意事项

1. **定位**：`position: fixed` 请用外层容器包裹（根元素 `transform` 被按压弹簧占用）。
2. **图标必须是真 `<img>`**：不能用 CSS `mask` 上色，否则折射源抓不到图标形状。
3. **玻璃不能嵌套**：与其它玻璃组件之间不要互相嵌套。

## 依赖

- [apple-liquid-glass-webgl](https://www.npmjs.com/package/apple-liquid-glass-webgl) —— 液态玻璃渲染核心
- [Vue 3](https://vuejs.org/) —— `^3.5`

## 目录结构

```
src/
├── components/glass/
│   ├── GlassSwitch.vue   # 开关组件
│   ├── GlassNav.vue      # 胶囊导航
│   ├── GlassBox.vue      # 空玻璃容器
│   └── index.js          # 组件库入口
├── directives/
│   └── liquidGlass.js    # v-liquid-glass 自定义指令
└── views/
    ├── GlassSwitchDemo.vue   # 开关使用示例
    ├── GlassTabbarDemo.vue   # 导航使用示例
    ├── GlassBoxDemo.vue      # 玻璃容器使用示例
    └── GlassButtonDemo.vue   # 按钮形状玻璃示例
```

## 本地运行

```bash
npm install
npm run dev
```
