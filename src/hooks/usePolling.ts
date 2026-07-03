import { useEffect, useRef } from 'react'

// Ejecuta `callback` cada `intervalMs` mientras `enabled` sea true.
// Limpia el intervalo al desmontar o cuando `enabled` pasa a false.
// Se usa en la Pantalla 4 para refrescar el viaje mientras esté PENDING/IN_PROGRESS.
export function usePolling(callback: () => void, intervalMs: number, enabled: boolean): void {
  // Guardamos el callback en una ref para no reiniciar el intervalo en cada render.
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const id = setInterval(() => savedCallback.current(), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, enabled])
}
