import { api } from '../lib/api'
import type { CreateTripRequest, RateTripRequest, Trip, User } from '../types'

// Capa de servicio para los endpoints de viajes del PASAJERO (Parte B).
// Mismo patrón que authService.ts: usa la instancia `api` (con interceptor de token).

// GET /trips — historial de viajes del pasajero autenticado.
export async function getTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips')
  return data
}

// GET /drivers/available — conductores disponibles (solo PASSENGER).
export async function getAvailableDrivers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/drivers/available')
  return data
}

// POST /trips — solicita un viaje nuevo (se crea en PENDING). Responde 201.
export async function createTrip(body: CreateTripRequest): Promise<Trip> {
  const { data } = await api.post<Trip>('/trips', body)
  return data
}

// GET /trips/{id} — detalle de un viaje (usado también en el polling).
export async function getTrip(id: number): Promise<Trip> {
  const { data } = await api.get<Trip>(`/trips/${id}`)
  return data
}

// POST /trips/{id}/rate — califica el viaje (1–5) con comentario opcional.
export async function rateTrip(id: number, body: RateTripRequest): Promise<Trip> {
  const { data } = await api.post<Trip>(`/trips/${id}/rate`, body)
  return data
}
