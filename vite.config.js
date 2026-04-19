import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // LangGraph backend (port 8001) — daha spesifik kural önce gelmeli
      '/api/assistant': {
        target: process.env.VITE_LANGGRAPH_URL ?? 'http://localhost:8001',
        changeOrigin: true,
      },
      // CrewAI backend (port 8000)
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_API_URL ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})