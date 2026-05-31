import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const backendUrl = process.env.VITE_API_URL || process.env.BACKEND_BASE_URL || 'http://localhost:8000';
  const isProd = mode === 'production';

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    // Prod: Vercel maneja proxy via vercel.json rewrites.
    // Dev: proxy local al backend.
    server: isProd ? {} : {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': { target: backendUrl, changeOrigin: true, secure: false },
        '/health': { target: backendUrl, changeOrigin: true, secure: false },
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            fluent:  ['@fluentui/react-components', '@fluentui/react-icons'],
            charts:  ['chart.js', 'react-chartjs-2', 'recharts'],
          },
        },
      },
    },
  };
});
