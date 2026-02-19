import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { setOnUnauthorized } from '../services/apiClient'
import { authService } from '../services/authService'
import type { UserProfile } from '../types/api'

interface AuthState {
  user: UserProfile | null
  loading: boolean
  checked: boolean
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>
  register: (body: {
    phone: string
    password: string
    password_confirmation: string
    name: string
    email?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    checked: false,
  })

  const refreshProfile = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setState((s) => ({ ...s, user: null, checked: true }))
      return
    }
    try {
      const user = await authService.getProfile()
      setState((s) => ({ ...s, user, checked: true }))
    } catch {
      setState((s) => ({ ...s, user: null, checked: true }))
    }
  }, [])

  useEffect(() => {
    setOnUnauthorized(() => {
      setState((s) => ({ ...s, user: null }))
    })
    refreshProfile()
  }, [refreshProfile])

  const login = useCallback(async (phone: string, password: string) => {
    setState((s) => ({ ...s, loading: true }))
    try {
      await authService.login(phone, password)
      await refreshProfile()
    } finally {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [refreshProfile])

  const register = useCallback(
    async (body: {
      phone: string
      password: string
      password_confirmation: string
      name: string
      email?: string
    }) => {
      setState((s) => ({ ...s, loading: true }))
      try {
        await authService.register(body)
        await refreshProfile()
      } finally {
        setState((s) => ({ ...s, loading: false }))
      }
    },
    [refreshProfile]
  )

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      await authService.logout()
      setState((s) => ({ ...s, user: null }))
    } finally {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!state.user || authService.isAuthenticated(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
