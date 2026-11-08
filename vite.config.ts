/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://pt-gemini-proxy.itzsid.workers.dev',
        changeOrigin: true,
        // The Worker only accepts the production origin. This proxy runs in Node on
        // your machine, so it presents that origin instead of http://localhost:5173.
        headers: { origin: 'https://physioflow-app.github.io' },
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
  },
})
