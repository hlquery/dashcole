import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5177,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4177,
    strictPort: true
  }
})
