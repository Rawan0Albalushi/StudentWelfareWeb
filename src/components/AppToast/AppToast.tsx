import { useErrorToast } from '../../context/ErrorContext'
import type { ToastType } from '../../context/ErrorContext'
import styles from './AppToast.module.css'

function toastClass(type: ToastType): string {
  switch (type) {
    case 'success':
      return styles.toastSuccess
    case 'info':
      return styles.toastInfo
    default:
      return styles.toastError
  }
}

export function AppToast() {
  const { toasts, dismiss } = useErrorToast()

  if (toasts.length === 0) return null

  return (
    <div className={styles.container} role="region" aria-label="إشعارات">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${toastClass(t.type)}`}
          role="alert"
        >
          <span className={styles.message}>{t.message}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismiss(t.id)}
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
