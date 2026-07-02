import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../lib/api'
import { createTrip, getAvailableDrivers } from '../services/tripService'
import type { User } from '../types'

// Pantalla 3 — Solicitar viaje.
// Muestra los conductores disponibles (GET /drivers/available) como referencia,
// y un formulario origen/destino que crea el viaje (POST /trips) y redirige al detalle.
export default function RequestTripPage() {
  const navigate = useNavigate()

  const [drivers, setDrivers] = useState<User[]>([])
  const [loadingDrivers, setLoadingDrivers] = useState(true)

  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await getAvailableDrivers()
        if (active) setDrivers(data)
      } catch {
        // No es bloqueante: aunque falle la lista, el pasajero puede pedir el viaje.
        if (active) setDrivers([])
      } finally {
        if (active) setLoadingDrivers(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const trip = await createTrip({ pickupAddress: pickup, dropoffAddress: dropoff })
      navigate(`/passenger/trips/${trip.id}`, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo solicitar el viaje'))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        onClick={() => navigate('/passenger')}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver
      </button>

      <h1 className="text-2xl font-bold text-gray-900">Solicitar viaje</h1>

      {/* Conductores disponibles */}
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Conductores disponibles</h2>

        {loadingDrivers && (
          <p className="text-sm text-gray-400">Buscando conductores…</p>
        )}

        {!loadingDrivers && drivers.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
            No hay conductores disponibles ahora mismo. Puedes solicitar el viaje igual y se
            asignará cuando alguno acepte.
          </p>
        )}

        {!loadingDrivers && drivers.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {drivers.map((driver) => (
              <li
                key={driver.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {driver.firstName} {driver.lastName}
                </span>
                <span className="text-xs text-amber-500">★ {driver.rating.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Formulario de viaje */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Origen</label>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            placeholder="Ej. Av. Javier Prado 100"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Destino</label>
          <input
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            required
            placeholder="Ej. Miraflores, Lima"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Solicitando…' : 'Solicitar viaje'}
        </button>
      </form>
    </div>
  )
}
