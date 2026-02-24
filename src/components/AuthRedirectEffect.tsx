import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setOnUnauthorized } from '../services/apiClient'

/**
 * Sets global 401 handler to redirect to login. Must be inside Router.
 * Skips redirect on /donate, /donate/return, and /payments/success so donation/return flow works without login (API_DOCUMENTATION.md §5).
 */
export function AuthRedirectEffect() {
  const navigate = useNavigate()
  useEffect(() => {
    setOnUnauthorized(() => {
      const path = typeof window !== 'undefined' ? window.location.pathname : ''
      if (path === '/donate' || path.startsWith('/donate/') || path === '/payments/success') return
      navigate('/login', { replace: true })
    })
    return () => setOnUnauthorized(() => {})
  }, [navigate])
  return null
}
