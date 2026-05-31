import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const backendUrl =
    process.env.VITE_API_URL ||
    process.env.BACKEND_BASE_URL ||
    'http://localhost:8000';
  const isProd = mode === 'production';

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },

    server: isProd
      ? {}
      : {
          host: '0.0.0.0',
          port: 5173,
          proxy: {
            '/api':    { target: backendUrl, changeOrigin: true, secure: false },
            '/health': { target: backendUrl, changeOrigin: true, secure: false },
          },
        },

    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        // Suprimir warnings de módulos no resueltos en dependencias de terceros
        onwarn(warning, defaultHandler) {
          if (
            warning.code === 'UNRESOLVED_IMPORT' ||
            (warning.message && warning.message.includes('scheduler'))
          ) {
            return; // silenciar — scheduler es interno de React
          }
          defaultHandler(warning);
        },
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
