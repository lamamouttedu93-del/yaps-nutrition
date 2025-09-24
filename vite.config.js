// vite.config.js — config minimale, sans plugins Horizon
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  // garde si ton projet est en React

export default defineConfig({
  plugins: [react()],        // si ton projet N'EST PAS en React, mets: plugins: []
  base: '/',
  build: { outDir: 'dist' },
  server: { host: true }
})
