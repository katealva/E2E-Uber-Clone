import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HOME_BY_ROLE } from '../lib/routes'
import { getApiErrorMessage } from '../lib/api'
import { login as loginRequest, register as registerRequest } from '../services/authService'
import type { Role } from '../types'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const { user, loading: authLoading, login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('PASSENGER')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión, no mostrar el login: redirigir a su dashboard.
  if (!authLoading && user) {
    return <Navigate to={HOME_BY_ROLE[user.role]} replace />
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { token } =
        mode === 'login'
          ? await loginRequest({ email, password })
          : await registerRequest({ firstName, lastName, email, password, role })

      const me = await login(token)
      navigate(HOME_BY_ROLE[me.role], { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo completar la operación'))
    } finally {
      setSubmitting(false)
    }
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  const isRegister = mode === 'register'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Uber Clone</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isRegister ? 'Crea tu cuenta' : 'Inicia sesión para continuar'}
          </p>
        </div>

        {/* Toggle Login / Registro */}
        <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-md py-2 transition ${
              !isRegister ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-md py-2 transition ${
              isRegister ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nombre"
                value={firstName}
                onChange={setFirstName}
                autoComplete="given-name"
                required
              />
              <Field
                label="Apellido"
                value={lastName}
                onChange={setLastName}
                autoComplete="family-name"
                required
              />
            </div>
          )}

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            required
          />

          <Field
            label="Contraseña"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            minLength={isRegister ? 6 : undefined}
            required
          />

          {isRegister && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                {(['PASSENGER', 'DRIVER'] as Role[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg border py-2 text-sm font-medium transition ${
                      role === r
                        ? 'border-brand-accent bg-blue-50 text-brand-accent'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {r === 'PASSENGER' ? 'Pasajero' : 'Conductor'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-accent py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Procesando…'
              : isRegister
                ? 'Crear cuenta'
                : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  autoComplete?: string
  required?: boolean
  minLength?: number
}

function Field({ label, value, onChange, type = 'text', ...rest }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-brand-accent focus:ring-1 focus:ring-brand-accent"
        {...rest}
      />
    </div>
  )
}
