import type { TripStatus } from '../types'

// Badge de color según el estado del viaje. Componente "tonto" compartido
// (contrato base del Día 1). Lo usa el pasajero (Parte B) y el conductor (Parte C).

const STYLES: Record<TripStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
}

const LABELS: Record<TripStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completado',
}

export default function StatusBadge({ status }: { status: TripStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  )
}
