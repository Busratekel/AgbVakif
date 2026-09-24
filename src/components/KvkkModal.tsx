import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { KvkkContent } from './KvkkContent'

type KvkkContextValue = {
  accepted: boolean
  openKvkk: () => void
  clearAccepted: () => void
}

const KvkkContext = createContext<KvkkContextValue | null>(null)

export function useKvkk() {
  const ctx = useContext(KvkkContext)
  if (!ctx) throw new Error('useKvkk must be used within KvkkProvider')
  return ctx
}

export function KvkkProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [readToEnd, setReadToEnd] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  const openKvkk = useCallback(() => {
    setReadToEnd(false)
    setOpen(true)
  }, [])

  const clearAccepted = useCallback(() => setAccepted(false), [])

  const close = useCallback(() => setOpen(false), [])

  const accept = useCallback(() => {
    if (!readToEnd) return
    setAccepted(true)
    setOpen(false)
  }, [readToEnd])

  useEffect(() => {
    if (!open) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)

    requestAnimationFrame(() => {
      const el = bodyRef.current
      if (!el) return
      if (el.scrollHeight <= el.clientHeight + 8) setReadToEnd(true)
    })

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  function onScroll() {
    const el = bodyRef.current
    if (!el || readToEnd) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      setReadToEnd(true)
    }
  }

  return (
    <KvkkContext.Provider value={{ accepted, openKvkk, clearAccepted }}>
      {children}

      {open ? (
        <div className="kvkk-overlay" role="presentation" onClick={close}>
          <div
            className="kvkk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="kvkk-modal-header">
              <div>
                <p className="eyebrow">Kişisel verilerin korunması</p>
                <h2 id={titleId}>KVKK aydınlatma metni</h2>
              </div>
              <button type="button" className="kvkk-close" onClick={close} aria-label="Kapat">
                ×
              </button>
            </header>

            <div
              className="kvkk-modal-body"
              ref={bodyRef}
              onScroll={onScroll}
              tabIndex={0}
            >
              <KvkkContent />
            </div>

            <footer className="kvkk-modal-footer">
              {!readToEnd ? (
                <p className="kvkk-hint">
                  Onaylamak için metni sonuna kadar kaydırın.
                </p>
              ) : (
                <p className="kvkk-hint is-ready">Metni sonuna kadar okudunuz.</p>
              )}
              <div className="kvkk-actions">
                <button type="button" className="btn btn-ghost-dark" onClick={close}>
                  Vazgeç
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={accept}
                  disabled={!readToEnd}
                >
                  Okudum, kabul ediyorum
                </button>
              </div>
            </footer>
          </div>
        </div>
      ) : null}
    </KvkkContext.Provider>
  )
}
