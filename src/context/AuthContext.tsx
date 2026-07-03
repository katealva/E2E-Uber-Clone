import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { clearToken, getToken, setToken } from '../lib/api'
import { getMe } from '../services/authService'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  token: string | null
  loading: boolean
  // Persiste el token, hidrata el perfil y devuelve el User (para redirect por rol).
  login: (token: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [loading, setLoading] = useState(true)

  // Al montar: si hay token guardado, intenta hidratar la sesión.
  useEffect(() => {
    let active = true

    async function hydrate() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await getMe()
        if (active) setUser(me)
      } catch {
        // Token inválido/expirado: limpiar sesión.
        clearToken()
        if (active) {
          setUser(null)
          setTokenState(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    hydrate()
    return () => {
      active = false
    }
  }, [])

  async function login(newToken: string): Promise<User> {
    setToken(newToken)
    setTokenState(newToken)
    const me = await getMe()
    setUser(me)
    return me
  }

  function logout() {
    clearToken()
    setUser(null)
    setTokenState(null)
  }

  const value: AuthContextValue = { user, token, loading, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
