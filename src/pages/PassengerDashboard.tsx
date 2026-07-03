import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../lib/api'
import { formatDate } from '../lib/format'
import { getTrips } from '../services/tripService'
import StatusBadge from '../components/StatusBadge'
import type { Trip } from '../types'

// Pantalla 2 — Dashboard del pasajero.
// Muestra el nombre, un botón para pedir viaje y la lista de viajes (GET /trips)
// con su badge de estado. Cada fila navega al detalle del viaje.
export default function PassengerDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getTrips()
        if (active) setTrips(data)
      } catch (err) {
        if (active) setError(getApiErrorMessage(err, 'No se pudieron cargar los viajes'))
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Pasajero</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.firstName} {user?.lastName}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        onClick={() => navigate('/passenger/request')}
        className="mt-8 w-full rounded-lg bg-brand-accent py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
      >
        Pedir viaje
      </button>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-gray-900">Mis viajes</h2>

      {loading && <p className="py-6 text-center text-sm text-gray-400">Cargando viajes…</p>}

      {error && !loading && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && trips.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          Aún no tienes viajes. ¡Pide el primero!
        </p>
      )}

      {!loading && !error && trips.length > 0 && (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id}>
              <button
                onClick={() => navigate(`/passenger/trips/${trip.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-brand-accent hover:shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {trip.pickupAddress} → {trip.dropoffAddress}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(trip.requestedAt)}</p>
                </div>
                <StatusBadge status={trip.status} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
