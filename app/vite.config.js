import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative assets keep the same build deployable on GitHub Pages and Vercel.
  base: './',
  plugins: [react()],
})
