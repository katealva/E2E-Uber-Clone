import { api } from '../lib/api'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types'

// Capa de servicio para los endpoints de autenticación y perfil.

export async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', body)
  return data
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', body)
  return data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>('/users/me')
  return data
}
