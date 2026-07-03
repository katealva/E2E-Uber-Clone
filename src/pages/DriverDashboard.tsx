import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { acceptTrip, getMyTrips, getPendingTrips } from '../services/driverService'
import { usePolling } from '../hooks/usePolling'
import StatusBadge from '../components/StatusBadge'
import type { Trip } from '../types'

// Pantalla 5 — Dashboard del conductor.
// Muestra su rating, el viaje IN_PROGRESS activo (si existe) y la lista de
// viajes PENDING disponibles para aceptar. Refresca en polling cada 4s.
const POLL_MS = 4000

export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [pending, setPending] = useState<Trip[]>([])
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)

  // Carga pendientes + mis viajes en paralelo. Reutilizable por el polling.
  const refetch = useCallback(async () => {
    try {
      const [pendingTrips, myTrips] = await Promise.all([getPendingTrips(), getMyTrips()])
      setPending(pendingTrips)
      // El viaje activo es el primero IN_PROGRESS asignado al conductor.
      setActiveTrip(myTrips.find((t) => t.status === 'IN_PROGRESS') ?? null)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los viajes'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    refetch()
  }, [refetch])

  usePolling(refetch, POLL_MS, true)

  async function handleAccept(id: number) {
    setError(null)
    setAcceptingId(id)
    try {
      const trip = await acceptTrip(id)
      navigate(`/driver/trips/${trip.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo aceptar el viaje'))
      setAcceptingId(null)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header: nombre + rating + disponibilidad + logout */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Conductor</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="text-amber-500">★ {user?.rating?.toFixed(1)}</span> ·{' '}
            {user?.available ? 'Disponible' : 'Ocupado'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        onClick={() => navigate('/historial')}
        className="mt-6 text-sm font-medium text-brand-accent hover:underline"
      >
        Ver historial →
      </button>

      {/* Viaje activo IN_PROGRESS resaltado */}
      {activeTrip && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Viaje en curso</h2>
          <button
            onClick={() => navigate(`/driver/trips/${activeTrip.id}`)}
            className="flex w-full items-center justify-between rounded-lg border-2 border-brand-accent bg-blue-50 p-4 text-left transition hover:bg-blue-100"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {activeTrip.pickupAddress} → {activeTrip.dropoffAddress}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {activeTrip.passenger.firstName} {activeTrip.passenger.lastName} ·{' '}
                {formatDate(activeTrip.acceptedAt ?? activeTrip.requestedAt)}
              </p>
            </div>
            <StatusBadge status={activeTrip.status} />
          </button>
        </section>
      )}

      {/* Viajes pendientes por aceptar */}
      <h2 className="mt-10 mb-3 text-lg font-semibold text-gray-900">Viajes disponibles</h2>
      {loading && <p className="py-6 text-center text-sm text-gray-400">Cargando viajes…</p>}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {!loading && !error && pending.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          No hay viajes pendientes por ahora.
        </p>
      )}
      {pending.length > 0 && (
        <ul className="space-y-3">
          {pending.map((trip) => (
            <li
              key={trip.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {trip.pickupAddress} → {trip.dropoffAddress}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {trip.passenger.firstName} {trip.passenger.lastName} ·{' '}
                  {formatDate(trip.requestedAt)}
                </p>
              </div>
              <button
                onClick={() => handleAccept(trip.id)}
                disabled={acceptingId === trip.id}
                className="shrink-0 rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {acceptingId === trip.id ? 'Aceptando…' : 'Aceptar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
