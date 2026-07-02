import type { Role } from '../types'

// Ruta "home" a la que redirige cada rol tras autenticar.
export const HOME_BY_ROLE: Record<Role, string> = {
  PASSENGER: '/passenger',
  DRIVER: '/driver',
}
