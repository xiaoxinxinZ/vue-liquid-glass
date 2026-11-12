import { defineStore } from 'pinia'

// 目前 store 不存放任何状态。
// 所有导航相关的控制变量 / 参数都已挪到 src/views/myTabbar.vue 里集中管理。
export const useGlassStore = defineStore('glass', {
  state: () => ({}),
})
