import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    allowedHosts: [
      '5da6-2406-7400-10a-1b0b-6b1a-3649-9501-1c57.ngrok-free.app'
    ]
  }
})
