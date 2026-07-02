import axios from 'axios'
import type { ApiError } from '../types'

// Base URL del backend. Configurable por env var, con fallback a localhost.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// ---- Manejo del token en localStorage ----
const TOKEN_KEY = 'uber_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ---- Instancia de Axios ----
export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: adjunta el Bearer token automáticamente.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: en 401, limpia sesión y redirige a login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      // Evita bucle de redirección si ya estamos en /login.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

// Extrae un mensaje legible de un error de Axios para mostrar en la UI.
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data
    if (data) {
      if (data.error) return data.error
      // Errores de validación: primer mensaje de campo disponible.
      const firstField = Object.values(data).find((v) => typeof v === 'string')
      if (firstField) return firstField
    }
    if (error.message) return error.message
  }
  return fallback
}
