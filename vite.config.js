import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load the environment variables from your .env file
  const env = loadEnv(mode, process.cwd(), '');
  
  // 2. Grab your target, or fallback to the Docker address just in case
  const apiTarget = env.VITE_API_TARGET || 'http://host.docker.internal:5001';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      proxy: {
        // 3. Use the dynamic target variable here!
        '/api': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
        '/mock': { target: apiTarget, changeOrigin: true },
      },
    },
    resolve: { alias: { '@': '/src' } },
  };
});






// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5174,
//     proxy: {
//       '/api': { target: 'http://127.0.0.1:5001', changeOrigin: true },
//       '/uploads': { target: 'http://127.0.0.1:5001', changeOrigin: true },
//       '/mock': { target: 'http://127.0.0.1:5001', changeOrigin: true },
//     },
//   },
//   resolve: { alias: { '@': '/src' } },
// });
