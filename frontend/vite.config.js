import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['sockjs-client', 'stompjs'],
  },
})
