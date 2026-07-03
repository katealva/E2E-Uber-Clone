import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { getTrip } from '../services/tripService'
import { completeTrip } from '../services/driverService'
import { usePolling } from '../hooks/usePolling'
import StatusBadge from '../components/StatusBadge'
import StarRating from '../components/StarRating'
import type { Trip } from '../types'

// Pantalla 6 — Detalle de viaje (conductor).
// Muestra los datos del pasajero, permite completar el viaje si está IN_PROGRESS
// y muestra un resumen cuando ya está COMPLETED.
const POLL_MS = 4000

export default function DriverTripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const tripId = Number(id)
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      const data = await getTrip(tripId)
      setTrip(data)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar el viaje'))
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    setLoading(true)
    refetch()
  }, [refetch])

  // Polling solo mientras el viaje siga en curso.
  usePolling(refetch, POLL_MS, trip?.status === 'IN_PROGRESS')

  async function handleComplete() {
    setCompleteError(null)
    setCompleting(true)
    try {
      const updated = await completeTrip(tripId)
      setTrip(updated)
    } catch (err) {
      setCompleteError(getApiErrorMessage(err, 'No se pudo completar el viaje'))
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-gray-400">Cargando viaje…</p>
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        <button
          onClick={() => navigate('/driver')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al inicio
        </button>
      </div>
    )
  }

  if (!trip) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={() => navigate('/driver')}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Viaje #{trip.id}</h1>
        <StatusBadge status={trip.status} />
      </div>

      {/* Ruta */}
      <div className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Origen</p>
          <p className="text-sm font-medium text-gray-900">{trip.pickupAddress}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Destino</p>
          <p className="text-sm font-medium text-gray-900">{trip.dropoffAddress}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Solicitado</p>
          <p className="text-sm text-gray-600">{formatDate(trip.requestedAt)}</p>
        </div>
      </div>

      {/* Datos del pasajero */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">Pasajero</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-900">
            {trip.passenger.firstName} {trip.passenger.lastName}
          </span>
          <span className="text-xs text-amber-500">★ {trip.passenger.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Acción: completar viaje (solo IN_PROGRESS) */}
      {trip.status === 'IN_PROGRESS' && (
        <div className="mt-4 space-y-3">
          {completeError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{completeError}</p>
          )}
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {completing ? 'Completando…' : 'Completar viaje'}
          </button>
        </div>
      )}

      {/* Resumen cuando ya está completado */}
      {trip.status === 'COMPLETED' && (
        <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-semibold text-gray-700">Resumen del viaje</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Aceptado</p>
              <p className="text-gray-600">{formatDate(trip.acceptedAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400">Completado</p>
              <p className="text-gray-600">{formatDate(trip.completedAt)}</p>
            </div>
          </div>
          {trip.passengerRating != null ? (
            <div>
              <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                Calificación del pasajero
              </p>
              <StarRating value={trip.passengerRating} size="text-xl" />
              {trip.ratingComment && (
                <p className="mt-2 text-sm text-gray-600">"{trip.ratingComment}"</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">El pasajero aún no ha calificado el viaje.</p>
          )}
        </div>
      )}
    </div>
  )
}
