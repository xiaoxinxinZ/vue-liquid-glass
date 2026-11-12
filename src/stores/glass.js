import { defineStore } from 'pinia'
import { DEFAULT_MATERIAL_V2 } from 'apple-liquid-glass-webgl'

// 材质底子 = 官方 Playground 右侧面板那套（截图面板右上角即"默认参数"），
// 再补一点奶感：官方默认 tint 0，玻璃在深色照片上几乎隐形。
// GlassNav 会用自己的 frost prop 覆盖 tint / frost（见 GlassNav 的 trackOptions）。
export const useGlassStore = defineStore('glass', {
  state: () => ({
    material: { ...DEFAULT_MATERIAL_V2, tint: 0.45, frost: 0.35 },
    tintTone: 'light',
    /** 导航整体柔滑比例，0 = 清澈透明，1 = 重度磨砂奶白 */
    navFrost: 0.45,
    switchOn: false,
  }),
  getters: {
    // 直接喂给 v-liquid-glass 指令的完整选项
    glassOptions: (state) => ({
      material: { ...state.material },
      tintTone: state.tintTone,
      // 明确指定折射源：固定背景图 #bg（库的 auto 不认 CSS 背景图）
      backdrop: { source: '#bg', anchor: 'viewport', fit: 'cover' },
    }),
  },
})
