// API base: dev'de Vite proxy üzerinden (/api), prod'da VITE_API_URL env var'ı
export const API_BASE = import.meta.env.VITE_API_URL ?? ''

// LangGraph backend: ayrı port'ta çalışır (crew_backend = 8000, langgraph_backend = 8001)
export const LANGGRAPH_BASE = import.meta.env.VITE_LANGGRAPH_URL ?? ''
