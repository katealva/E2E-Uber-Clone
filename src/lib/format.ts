// Formatea una fecha ISO 8601 a un string corto y legible en es-PE.
// Devuelve '—' si la fecha es null (campos como acceptedAt/completedAt).
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
