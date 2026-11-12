// 自定义指令：v-liquid-glass
// 把 DOM 元素交给 apple-liquid-glass-webgl 渲染成液态玻璃。
// 用法：<div v-liquid-glass="{ material: {...}, backdrop: '#bg' }">...</div>
import { LiquidGlass } from 'apple-liquid-glass-webgl'

const instances = new WeakMap()
const signatures = new WeakMap()

// 便宜的签名比较：按压动画每帧都会触发组件重渲染，
// 参数没变时不能重复调 update()，否则动画会被打断。
const signature = (value) => JSON.stringify(value ?? null)

export const liquidGlass = {
  mounted(el, binding) {
    // 元素存在后才能挂载；SSR 安全（只在浏览器中执行）
    signatures.set(el, signature(binding.value))
    instances.set(el, new LiquidGlass(el, binding.value || {}))
  },
  updated(el, binding) {
    const next = signature(binding.value)
    if (next === signatures.get(el)) return
    signatures.set(el, next)
    instances.get(el)?.update(binding.value || {})
  },
  unmounted(el) {
    // 组件卸载时销毁，释放 WebGL 上下文（浏览器一页只给 ~16 个）
    instances.get(el)?.destroy()
    instances.delete(el)
    signatures.delete(el)
  },
}
