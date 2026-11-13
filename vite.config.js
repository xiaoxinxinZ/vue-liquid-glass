import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // @ 指向 src，README 里 import { GlassSwitch } from '@/components/glass' 依赖它
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
