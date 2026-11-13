/**
 * diy-vue-liquid-glass —— npm 包入口
 *
 * iOS 26 Liquid Glass 的 Vue 3 组件封装，基于 apple-liquid-glass-webgl（WebGL2 真实折射）。
 *
 * 组件（按需引入，自带指令依赖，无需 app.use）：
 *   import { GlassNav, GlassSwitch, GlassBox } from 'diy-vue-liquid-glass'
 *
 * 指令（自己的模板里想直接用 v-liquid-glass 时）：
 *   import { liquidGlass } from 'diy-vue-liquid-glass'
 *   app.directive('liquid-glass', liquidGlass)
 *   // 或 app.use(VueLiquidGlass) 一行完成注册
 *
 * 样式（组件是 scoped CSS，引一次即可）：
 *   import 'diy-vue-liquid-glass/style.css'
 */
import { liquidGlass } from './directives/liquidGlass.js'

export { default as GlassNav } from './components/glass/GlassNav.vue'
export { default as GlassSwitch } from './components/glass/GlassSwitch.vue'
export { default as GlassBox } from './components/glass/GlassBox.vue'
export { liquidGlass }

/** 插件式安装：app.use(VueLiquidGlass) 注册 v-liquid-glass 全局指令 */
export default {
  install(app) {
    app.directive('liquid-glass', liquidGlass)
  },
}
