// 按压弹簧 —— 复刻官方 playground 的物理手感
// 官方 press-effects.js：按下刚度 520 / 阻尼 28，松手 540 / 31，
// 每帧推进 amount(0 → ~1.12)，把它映射到玻璃表面的缩放，玻璃就会"充气"膨胀再弹回。
import { onBeforeUnmount, ref } from 'vue'

export function usePressSpring() {
  const amount = ref(0)

  let target = 0
  let velocity = 0
  let raf = 0
  let last = 0

  const stop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
  }

  const tick = (now) => {
    const seconds = Math.min(0.034, Math.max(0.001, (now - last) / 1000))
    last = now

    const stiffness = target ? 520 : 540
    const damping = target ? 28 : 31

    velocity += (target - amount.value) * stiffness * seconds
    velocity *= Math.exp(-damping * seconds)
    amount.value += velocity * seconds
    amount.value = Math.max(0, Math.min(1.12, amount.value))

    if (!target && amount.value < 0.004 && Math.abs(velocity) < 0.018) {
      amount.value = 0
      raf = 0
      return
    }
    raf = requestAnimationFrame(tick)
  }

  const setPressed = (pressed) => {
    target = pressed ? 1 : 0
    stop()
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }

  onBeforeUnmount(stop)

  return { amount, setPressed }
}
