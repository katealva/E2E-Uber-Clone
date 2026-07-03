import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { HOME_BY_ROLE } from '../lib/routes'
import { getTrips } from '../services/tripService'
import { getMyTrips } from '../services/driverService'
import StatusBadge from '../components/StatusBadge'
import type { Trip, TripStatus } from '../types'

// Pantalla 7 — Historial de viajes (compartida por ambos roles).
// El pasajero ve sus viajes (GET /trips) y el conductor los suyos (GET /trips/my).
// Filtro por estado en cliente.

type Filter = 'ALL' | TripStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completados' },
]

export default function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isDriver = user?.role === 'DRIVER'

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('ALL')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = isDriver ? await getMyTrips() : await getTrips()
        if (active) setTrips(data)
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'No se pudo cargar el historial'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [isDriver])

  const filtered = useMemo(
    () => (filter === 'ALL' ? trips : trips.filter((t) => t.status === filter)),
    [trips, filter],
  )

  function openTrip(trip: Trip) {
    navigate(isDriver ? `/driver/trips/${trip.id}` : `/passenger/trips/${trip.id}`)
  }

  const homePath = user ? HOME_BY_ROLE[user.role] : '/login'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button
        onClick={() => navigate(homePath)}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Historial de viajes</h1>

      {/* Filtro por estado */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              filter === f.value
                ? 'bg-brand-accent text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <p className="py-6 text-center text-sm text-gray-400">Cargando historial…</p>}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          No hay viajes para este filtro.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Ruta</th>
                <th className="px-4 py-3 font-medium">{isDriver ? 'Pasajero' : 'Conductor'}</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((trip) => {
                const counterpart = isDriver ? trip.passenger : trip.driver
                return (
                  <tr
                    key={trip.id}
                    onClick={() => openTrip(trip)}
                    className="cursor-pointer transition hover:bg-gray-50"
                  >
                    <td className="max-w-[16rem] truncate px-4 py-3 font-medium text-gray-900">
                      {trip.pickupAddress} → {trip.dropoffAddress}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {counterpart
                        ? `${counterpart.firstName} ${counterpart.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(trip.requestedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={trip.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
