import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastKind = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  kind: ToastKind
  message: string
}

type ToastApi = {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

let toastId = 0

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((kind: ToastKind, message: string) => {
    const text = (message || '').trim()
    if (!text) return
    const id = ++toastId
    setItems((prev) => [...prev.slice(-4), { id, kind, message: text }])
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => {
        push('success', message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
        document.body.scrollTo({ top: 0, behavior: 'smooth' })
      },
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  function dismiss(id: number) {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-relevant="additions">
        {items.map((t) => (
          <ToastCard key={t.id} item={t} onDone={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastCard({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, item.kind === 'error' ? 6500 : 3800)
    return () => window.clearTimeout(timer)
  }, [item.kind, onDone])

  return (
    <div className={`admin-toast is-${item.kind}`} role="status">
      <p>{item.message}</p>
      <button type="button" className="admin-toast-close" onClick={onDone} aria-label="Kapat">
        ×
      </button>
    </div>
  )
}

export function useAdminToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    }
  }
  return ctx
}
