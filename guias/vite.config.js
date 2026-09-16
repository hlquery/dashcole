import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4176,
    strictPort: true
  }
})
