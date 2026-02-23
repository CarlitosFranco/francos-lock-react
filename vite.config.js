import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/francos-lock-react/', // ← IMPORTANTE: debe coincidir con nombre del repo
})