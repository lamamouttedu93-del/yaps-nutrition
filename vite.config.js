// vite.config.js — alias "@" vers la RACINE du projet
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // exemple: import App from "@/App.jsx"
      '@': fileURLToPath(new URL('.', import.meta.url))
      // si un jour tu déplaces tout dans /src, change en:
      // '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: '/',
  build: { outDir: 'dist' },
  server: { host: true }
})
