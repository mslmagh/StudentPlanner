// API base: dev'de Vite proxy üzerinden (/api), prod'da VITE_API_URL env var'ı
export const API_BASE = import.meta.env.VITE_API_URL ?? ''
