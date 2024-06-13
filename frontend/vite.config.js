import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

console.log('Frontend port:', process.env.FRONTEND_PORT);
console.log('Backend host:', process.env.BACKEND_HOST);
console.log('Backend port:', process.env.BACKEND_PORT);
console.log('API URL:', `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 8000}`);

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.FRONTEND_PORT, 10) || 3000,
    host: true,
    proxy: {
      '/api': {
        target: `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.BACKEND_PORT || 8000}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
  },
});