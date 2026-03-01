import { useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import styles from './ProtectedRoute.module.css'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Protects routes that require authentication.
 * Shows loading while auth is being checked, redirects to /login with return URL if not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation()
  const { isAuthenticated, checked } = useAuth()
  const location = useLocation()

  if (!checked) {
    return (
      <div className={styles.wrapper} aria-busy="true" role="status">
        <div className={styles.spinner} />
        <span className={styles.label}>{t('common.checkingAuth')}</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
