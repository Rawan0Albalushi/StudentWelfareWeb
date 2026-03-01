import { useAuth } from '../../context/AuthContext'
import styles from './AuthCheckedGate.module.css'

interface AuthCheckedGateProps {
  children: React.ReactNode
}

/**
 * Shows a full-page loading state until auth has been checked (token + profile).
 * Avoids flashing "Login" in header then switching to user menu on first load.
 */
export function AuthCheckedGate({ children }: AuthCheckedGateProps) {
  const { checked } = useAuth()

  if (!checked) {
    return (
      <div className={styles.wrapper} aria-busy="true" role="status">
        <div className={styles.spinner} />
      </div>
    )
  }

  return <>{children}</>
}
