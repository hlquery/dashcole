import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const envDir = fileURLToPath(new URL('../', import.meta.url));
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '');
  return {
    plugins: [vue()],
    envDir,
    // Use the same origin so laptops and phones do not point to their own localhost.
    define: { 'import.meta.env.VITE_API_URL': JSON.stringify(mode === 'development' ? '/api' : (process.env.VITE_API_URL || '/api')) },
    server: {
      host: '0.0.0.0', port: 5174,
      proxy: { '/api': 'http://127.0.0.1:' + (process.env.PORT || env.PORT || 6666) },
    },
  };
});
