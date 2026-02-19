import { authApi, api, getToken, setToken, clearToken } from './apiClient'
import type { UserProfile } from '../types/api'

function extractToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const fromData = d.data && typeof d.data === 'object' && (d.data as Record<string, unknown>).token
  if (typeof fromData === 'string') return fromData
  if (typeof d.token === 'string') return d.token
  return null
}

export const authService = {
  async login(phone: string, password: string): Promise<{ token: string }> {
    const data = await authApi.post<unknown>('/auth/login', { phone, password })
    const token = extractToken(data)
    if (!token) throw new Error('Invalid login response')
    setToken(token)
    return { token }
  },

  async register(body: {
    phone: string
    password: string
    password_confirmation: string
    name: string
    email?: string
  }): Promise<{ token: string }> {
    const data = await authApi.post<unknown>('/auth/register', body)
    const token = extractToken(data)
    if (!token) throw new Error('Invalid register response')
    setToken(token)
    return { token }
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/auth/logout')
    } finally {
      clearToken()
    }
  },

  async getProfile(): Promise<UserProfile> {
    const data = await api.get<unknown>('/me/edit/profile')
    if (Array.isArray(data)) return (data[0] as UserProfile) ?? {}
    const d = data as { data?: UserProfile }
    return d.data ?? (data as UserProfile)
  },

  async updateProfile(body: { name?: string; phone?: string; email?: string }): Promise<UserProfile> {
    const data = await api.patch<unknown>('/me/edit/profile', body)
    const d = data as { data?: UserProfile }
    return d.data ?? (data as UserProfile)
  },

  isAuthenticated(): boolean {
    return !!getToken()
  },
}
