import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// TODO: Parte C — reemplazar este placeholder por el Dashboard del conductor real
// (GET /users/me · GET /trips/pending · GET /trips/my · PATCH /trips/{id}/accept).
export default function DriverDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Conductor</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.firstName} {user?.lastName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Rating: {user?.rating?.toFixed(1)} ·{' '}
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

      <p className="mt-8 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
        Dashboard del conductor — pendiente (Parte C)
      </p>
    </div>
  )
}
