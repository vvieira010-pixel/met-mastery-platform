import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  cacheDir: '.vite-cache-v2',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/motion/')) return 'vendor-motion';
          if (id.includes('node_modules/recharts/')) return 'vendor-recharts';
          if (id.includes('node_modules/d3-')) return 'vendor-d3';
          if (id.includes('node_modules/es-toolkit')) return 'vendor-toolkit';
          if (id.includes('node_modules/@grapesjs/studio-sdk')) return 'vendor-grapesjs';
        },
      },
    },
  },
  server: {
    port: 5173,
    hmr: true,
    proxy: {
      '/api': process.env.USE_PROD_API === 'true'
        ? { target: 'https://met-mastery.vercel.app', changeOrigin: true }
        : 'http://localhost:3000',
    },
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
  },
});
