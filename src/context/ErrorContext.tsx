import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type ToastType = 'error' | 'success' | 'info'

interface ToastMessage {
  id: number
  message: string
  type: ToastType
}

interface ErrorContextValue {
  showError: (message: string, type?: ToastType) => void
  dismiss: (id: number) => void
  toasts: ToastMessage[]
}

const ErrorContext = createContext<ErrorContextValue | null>(null)

let nextId = 0
const AUTO_DISMISS_MS = 5000

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showError = useCallback((message: string, type: ToastType = 'error') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])
    if (AUTO_DISMISS_MS > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, AUTO_DISMISS_MS)
    }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value: ErrorContextValue = { showError, dismiss, toasts }

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

export function useErrorToast(): ErrorContextValue {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useErrorToast must be used within ErrorProvider')
  return ctx
}
