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
    // 'esnext' shipped ~1,719 `?.` and 109 `??` completely untranspiled. Those are
    // ES2020 syntax, so any pre-2020 browser hits a SyntaxError while *parsing* the
    // bundle — the user gets a blank page with no React mount and no error boundary
    // (it never runs). 'es2019' makes esbuild downlevel optional chaining and nullish
    // coalescing, which removes that whole failure class at a cost of only a few KB.
    // Note: 'es2022' would NOT have helped here — it already includes ES2020 syntax.
    // Runtime APIs (Object.fromEntries, String.replaceAll) still need feature guards.
    target: 'es2019',
    chunkSizeWarningLimit: 500,
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
          if (id.includes('node_modules/@supabase/') || id.includes('node_modules/@supabase-')) return 'vendor-supabase';
          if (id.includes('node_modules/gsap/') || id.includes('node_modules/@gsap/')) return 'vendor-gsap';
          if (id.includes('node_modules/shiki/') || id.includes('node_modules/@shikijs/')) return 'vendor-shiki';
          if (id.includes('node_modules/@google/genai') || id.includes('node_modules/@google_generative')) return 'vendor-genai';
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
