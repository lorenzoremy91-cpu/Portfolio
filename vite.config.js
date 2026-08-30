import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Build stamp — visible in the browser console on every load, so a
  // deployed version can be compared against local at a glance.
  define: {
    __BUILD_ID__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'gsap', '@gsap/react'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
