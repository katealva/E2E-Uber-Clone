interface StarRatingProps {
  // Valor actual (0 = sin seleccionar).
  value: number
  // Si se pasa, el componente es interactivo; si se omite, es de solo lectura.
  onChange?: (value: number) => void
  // Tamaño del texto de las estrellas (Tailwind), p. ej. 'text-2xl'.
  size?: string
}

// Selector de 1–5 estrellas reutilizable.
// - Interactivo (con onChange): para el formulario de calificación.
// - Read-only (sin onChange): para mostrar un rating ya guardado.
export default function StarRating({ value, onChange, size = 'text-2xl' }: StarRatingProps) {
  const readOnly = !onChange
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className={`flex gap-1 ${size}`}>
      {stars.map((star) => {
        const filled = star <= value
        const className = filled ? 'text-amber-400' : 'text-gray-300'

        if (readOnly) {
          return (
            <span key={star} className={className} aria-hidden="true">
              ★
            </span>
          )
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${className} transition hover:scale-110`}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
