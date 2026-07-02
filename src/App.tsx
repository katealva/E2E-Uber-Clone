import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { HOME_BY_ROLE } from './lib/routes'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import PassengerDashboard from './pages/PassengerDashboard'
import RequestTripPage from './pages/RequestTripPage'
import TripDetailPage from './pages/TripDetailPage'
import DriverDashboard from './pages/DriverDashboard'

// Raíz protegida: envía a cada usuario al dashboard de su rol.
function RoleHome() {
  const { user } = useAuth()
  return <Navigate to={user ? HOME_BY_ROLE[user.role] : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RoleHome />} />
      </Route>

      <Route element={<ProtectedRoute role="PASSENGER" />}>
        <Route path="/passenger" element={<PassengerDashboard />} />
        <Route path="/passenger/request" element={<RequestTripPage />} />
        <Route path="/passenger/trips/:id" element={<TripDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute role="DRIVER" />}>
        <Route path="/driver" element={<DriverDashboard />} />
      </Route>

      {/* Cualquier otra ruta → raíz */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
