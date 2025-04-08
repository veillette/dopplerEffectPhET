import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor': [
            'scenerystack',
            'scenerystack/sim'
          ],
          // Split model and view into separate chunks
          'model': ['./src/screen-name/model'],
          'view': ['./src/screen-name/view'],
          'utils': ['./src/utils']
        }
      }
    },
    // Increase the chunk size warning limit if needed
    chunkSizeWarningLimit: 600
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
}); 