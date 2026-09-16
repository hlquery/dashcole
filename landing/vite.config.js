import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    })
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vue', test: /node_modules\/(?:@vue|vue|pinia|vue-router)\// },
            { name: 'vuetify', test: /node_modules\/vuetify\// },
            { name: 'animations', test: /node_modules\/(?:gsap|lenis)\// },
            { name: 'icons', test: /node_modules\/@fortawesome\// },
            ...['es', 'en', 'fr', 'de', 'it', 'hi'].map(locale => ({
              name: `locale-${locale}`, test: id => id.endsWith(`/locales/${locale}.json`),
            })),
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow access from localhost and network
    strictPort: true,
    proxy: {
      '/api/dashcole': {
        target: 'http://localhost:9200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dashcole/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
        }
      },
      '/api': {
        target: `http://127.0.0.1:${process.env.PORT || 7000}`,
        changeOrigin: true,
      },
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'vue-router',
      'vue-i18n',
      'vuetify',
      'lenis',
      'gsap',
      'gsap/ScrollTrigger'
    ],
    force: false // Set to true if you need to force re-optimization
  }
})