import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Enable source maps for better debugging
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    cors: true,
  },
  // Add a copy plugin configuration to ensure all HTML files are properly handled
  publicDir: 'public',
  // Handle SPA routing in development mode
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    cors: true,
  }
});
