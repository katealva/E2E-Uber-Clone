import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME_BY_ROLE } from '../lib/routes'
import type { Role } from '../types'

interface ProtectedRouteProps {
  // Si se especifica, solo usuarios con ese rol pueden entrar.
  role?: Role
}

export default function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Cargando…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Rol incorrecto: enviar al dashboard que sí le corresponde.
  if (role && user.role !== role) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  }

  return <Outlet />
}
