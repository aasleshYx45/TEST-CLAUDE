import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

type ToastPayload = { message: string; actionLabel?: string; onAction?: () => void }
type ToastValue = (payload: ToastPayload) => void

const ToastContext = createContext<ToastValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastPayload & { key: number }) | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback<ToastValue>((payload) => {
    window.clearTimeout(timer.current)
    setToast({ ...payload, key: Date.now() })
    timer.current = window.setTimeout(() => setToast(null), 4200)
  }, [])

  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="toast" key={toast.key} role="status">
          <span>{toast.message}</span>
          {toast.actionLabel ? (
            <button
              className="toast__action"
              onClick={() => {
                toast.onAction?.()
                setToast(null)
              }}
            >
              {toast.actionLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
