import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 组件库构建配置（与 demo 应用构建分离）
// 用法：npm run build:lib  →  dist/（index.js + index.umd.cjs + style.css）
export default defineConfig({
  plugins: [vue()],
  // 库构建不需要 public 目录（favicon 等是 demo 应用的东西）
  publicDir: false,
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.js',
      name: 'DiyVueLiquidGlass',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.umd.cjs'),
      // CSS 产物固定命名 dist/style.css，对应 package.json exports 的 "./style.css"
      cssFileName: 'style',
    },
    rollupOptions: {
      // vue 和渲染核心都不打进包里，交给使用方自己装（避免版本冲突和体积膨胀）
      external: ['vue', 'apple-liquid-glass-webgl'],
      output: {
        globals: {
          vue: 'Vue',
          'apple-liquid-glass-webgl': 'AppleLiquidGlassWebgl',
        },
        exports: 'named',
      },
    },
    // 所有 SFC 的 scoped CSS 合并输出为一个 style.css
    cssCodeSplit: false,
  },
})
