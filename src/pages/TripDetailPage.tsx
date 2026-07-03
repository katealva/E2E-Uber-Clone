import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { getTrip, rateTrip } from '../services/tripService'
import { usePolling } from '../hooks/usePolling'
import StatusBadge from '../components/StatusBadge'
import StarRating from '../components/StarRating'
import type { Trip } from '../types'

// Cada cuánto refrescamos el viaje mientras esté activo (3–5 s pedido en el brief).
const POLL_MS = 4000

// Pantalla 4 — Detalle de viaje (pasajero).
// Muestra el estado y el conductor asignado, hace polling mientras el viaje está
// activo, y ofrece el formulario de calificación cuando está COMPLETED sin rating.
export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const tripId = Number(id)
  const navigate = useNavigate()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado del formulario de calificación.
  const [ratingValue, setRatingValue] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingRate, setSubmittingRate] = useState(false)
  const [rateError, setRateError] = useState<string | null>(null)

  // Refresca el viaje (usado en la carga inicial y en el polling).
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

  // Polling solo mientras el viaje esté PENDING o IN_PROGRESS.
  const isActive = trip?.status === 'PENDING' || trip?.status === 'IN_PROGRESS'
  usePolling(refetch, POLL_MS, isActive)

  async function handleRate(e: React.FormEvent) {
    e.preventDefault()
    if (ratingValue < 1) {
      setRateError('Selecciona al menos una estrella')
      return
    }
    setRateError(null)
    setSubmittingRate(true)
    try {
      const updated = await rateTrip(tripId, {
        rating: ratingValue,
        comment: comment.trim() || undefined,
      })
      setTrip(updated)
    } catch (err) {
      setRateError(getApiErrorMessage(err, 'No se pudo enviar la calificación'))
    } finally {
      setSubmittingRate(false)
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
          onClick={() => navigate('/passenger')}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver al inicio
        </button>
      </div>
    )
  }

  if (!trip) return null

  const canRate = trip.status === 'COMPLETED' && trip.passengerRating == null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={() => navigate('/passenger')}
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

      {/* Conductor asignado o buscando */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-gray-700">Conductor</p>
        {trip.driver ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">
              {trip.driver.firstName} {trip.driver.lastName}
            </span>
            <span className="text-xs text-amber-500">★ {trip.driver.rating.toFixed(1)}</span>
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            Buscando conductor…
          </p>
        )}
      </div>

      {/* Formulario de calificación (COMPLETED sin rating) */}
      {canRate && (
        <form
          onSubmit={handleRate}
          className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4"
        >
          <p className="text-sm font-semibold text-gray-700">Califica tu viaje</p>
          <StarRating value={ratingValue} onChange={setRatingValue} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentario (opcional)"
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
          />
          {rateError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{rateError}</p>
          )}
          <button
            type="submit"
            disabled={submittingRate}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submittingRate ? 'Enviando…' : 'Enviar calificación'}
          </button>
        </form>
      )}

      {/* Calificación ya registrada (read-only) */}
      {trip.status === 'COMPLETED' && trip.passengerRating != null && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Tu calificación</p>
          <StarRating value={trip.passengerRating} size="text-xl" />
          {trip.ratingComment && (
            <p className="mt-2 text-sm text-gray-600">“{trip.ratingComment}”</p>
          )}
        </div>
      )}
    </div>
  )
}
