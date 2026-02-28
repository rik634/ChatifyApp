import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. Target the prefix
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // 2. Add this to verify it's working
        rewrite: (path) => path.replace(/^\/api/, '/api') 
      }
    }
  },
  define: {
    // This maps 'global' to 'window' at compile time
    global: 'window',
  },
})
