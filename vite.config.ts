import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  // Set the base URL to the repository name for GitHub Pages
  base: process.env.GITHUB_PAGES ? "/dopplerEffectPhET/" : "./",
  plugins: [viteSingleFile()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      external: ['fsevents', 'node:fs/promises', 'node:perf_hooks'],
      output: {
        // Create a single bundle
        manualChunks: undefined,
        inlineDynamicImports: true
      }
    },
    // Set a high asset limit to inline most assets
    assetsInlineLimit: 1024 * 1024 * 10, // 10MB
    chunkSizeWarningLimit: 5000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['scenerystack']
  }
}); 