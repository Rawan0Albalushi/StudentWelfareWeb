import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setOnUnauthorized } from '../services/apiClient'

/**
 * Sets global 401 handler to redirect to login. Must be inside Router.
 */
export function AuthRedirectEffect() {
  const navigate = useNavigate()
  useEffect(() => {
    setOnUnauthorized(() => navigate('/login', { replace: true }))
    return () => setOnUnauthorized(() => {})
  }, [navigate])
  return null
}
