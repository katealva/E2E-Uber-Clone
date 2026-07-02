// Tipos compartidos del dominio "Uber Clone".
// Fuente: CLAUDE.md §6. Estos tipos los consume toda la app (Partes A/B/C...).

export type Role = 'PASSENGER' | 'DRIVER'
export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: Role
  available: boolean
  rating: number
}

export interface Trip {
  id: number
  status: TripStatus
  pickupAddress: string
  dropoffAddress: string
  requestedAt: string // ISO 8601
  acceptedAt: string | null
  completedAt: string | null
  passenger: User
  driver: User | null
  passengerRating: number | null
  ratingComment: string | null
}

// ---- Auth ----

export interface AuthResponse {
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
}

// Forma de error de la API: { "error": "mensaje" }
// (los errores de validación usan el nombre del campo como clave)
export interface ApiError {
  error?: string
  [field: string]: string | undefined
}
