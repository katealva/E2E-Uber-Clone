import { api } from '../lib/api'
import type { Trip } from '../types'

// Servicios del rol conductor (Parte C). Mismo patrón que tripService.ts:
// se tipa la respuesta y se devuelve `data`. La autorización (Bearer token)
// la agrega automáticamente el interceptor de lib/api.ts.

// GET /trips/pending — viajes en PENDING sin conductor asignado.
export async function getPendingTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/pending')
  return data
}

// GET /trips/my — viajes asignados al conductor autenticado.
export async function getMyTrips(): Promise<Trip[]> {
  const { data } = await api.get<Trip[]>('/trips/my')
  return data
}

// PATCH /trips/{id}/accept — el conductor acepta el viaje (pasa a IN_PROGRESS).
export async function acceptTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/accept`)
  return data
}

// PATCH /trips/{id}/complete — el conductor completa el viaje (pasa a COMPLETED).
export async function completeTrip(id: number): Promise<Trip> {
  const { data } = await api.patch<Trip>(`/trips/${id}/complete`)
  return data
}
