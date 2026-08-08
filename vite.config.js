import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.warn('[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.');
            }
          });
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.warn('[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.');
            }
          });
        },
      },
      '/mock': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.warn('[vite proxy] Backend (127.0.0.1:5001) is starting up or offline.');
            }
          });
        },
      },
    },
  },
  resolve: { alias: { '@': '/src' } },
  build: {
    chunkSizeWarningLimit: 1000,
  }
});