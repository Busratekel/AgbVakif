import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import {
  acceptAllCookies,
  applyCookieConsent,
  bootCookieConsent,
  readCookieConsent,
  rejectOptionalCookies,
  saveCookieConsent,
  type CookieConsent,
} from '../cookieConsent'

type CookieConsentApi = {
  consent: CookieConsent | null
  openPreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentApi | null>(null)

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) {
    return {
      consent: null as CookieConsent | null,
      openPreferences: () => {},
    }
  }
  return ctx
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    bootCookieConsent()
    const existing = readCookieConsent()
    if (existing) {
      setConsent(existing)
      setAnalytics(existing.analytics)
      setBannerOpen(false)
    } else {
      setBannerOpen(true)
    }

    function onExternal(e: Event) {
      const detail = (e as CustomEvent<CookieConsent>).detail
      if (!detail) return
      setConsent(detail)
      setAnalytics(detail.analytics)
    }
    window.addEventListener('agb-cookie-consent', onExternal)
    return () => window.removeEventListener('agb-cookie-consent', onExternal)
  }, [])

  const openPreferences = useCallback(() => {
    const current = readCookieConsent()
    setAnalytics(current?.analytics ?? false)
    setPrefsOpen(true)
    setBannerOpen(false)
  }, [])

  const api = useMemo(
    () => ({ consent, openPreferences }),
    [consent, openPreferences],
  )

  function onAcceptAll() {
    const next = acceptAllCookies()
    setConsent(next)
    setAnalytics(true)
    setBannerOpen(false)
    setPrefsOpen(false)
  }

  function onRejectAll() {
    const next = rejectOptionalCookies()
    setConsent(next)
    setAnalytics(false)
    setBannerOpen(false)
    setPrefsOpen(false)
  }

  function onSavePrefs() {
    const next = saveCookieConsent({ analytics })
    setConsent(next)
    applyCookieConsent(next)
    setPrefsOpen(false)
    setBannerOpen(false)
  }

  return (
    <CookieConsentContext.Provider value={api}>
      {children}

      {bannerOpen && !prefsOpen ? (
        <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-live="polite">
          <div className="cookie-banner-inner">
            <div className="cookie-banner-copy">
              <h2 id="cookie-banner-title">Çerez kullanımı</h2>
              <p>
                Bu site zorunlu çerezler ve isteğe bağlı analitik çerezler
                kullanabilir. Zorunlu çerezler site işleyişi için gereklidir.
                Detaylar için{' '}
                <Link to="/yasal/cerez-politikasi">çerez politikası</Link> sayfasına
                bakabilirsiniz.
              </p>
            </div>
            <div className="cookie-banner-actions">
              <button type="button" className="btn btn-small" onClick={onAcceptAll}>
                Tümünü kabul et
              </button>
              <button type="button" className="btn btn-small btn-ghost-dark" onClick={onRejectAll}>
                Tümünü reddet
              </button>
              <button type="button" className="btn btn-small btn-ghost-dark" onClick={openPreferences}>
                Tercihleri yönet
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {prefsOpen ? (
        <div className="cookie-prefs-overlay" role="presentation" onClick={() => setPrefsOpen(false)}>
          <div
            className="cookie-prefs-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-prefs-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cookie-prefs-head">
              <h2 id="cookie-prefs-title">Çerez tercihleri</h2>
              <button type="button" className="cookie-prefs-close" onClick={() => setPrefsOpen(false)} aria-label="Kapat">
                ×
              </button>
            </header>

            <p className="cookie-prefs-lead">
              Zorunlu çerezler her zaman açıktır. Analitik çerezleri açıp
              kapatabilirsiniz.
            </p>

            <ul className="cookie-prefs-list">
              <li>
                <div>
                  <strong>Zorunlu</strong>
                  <span>Oturum, güvenlik ve temel site işlevleri.</span>
                </div>
                <span className="cookie-prefs-locked">Her zaman açık</span>
              </li>
              <li>
                <div>
                  <strong>Analitik</strong>
                  <span>Anonim kullanım istatistikleri (ör. Google Analytics).</span>
                </div>
                <label className="admin-switch">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                  <span className="admin-switch-track" aria-hidden="true" />
                  <span className="admin-switch-text">{analytics ? 'Açık' : 'Kapalı'}</span>
                </label>
              </li>
            </ul>

            <div className="cookie-prefs-actions">
              <button type="button" className="btn btn-small btn-ghost-dark" onClick={onRejectAll}>
                Tümünü reddet
              </button>
              <button type="button" className="btn btn-small" onClick={onSavePrefs}>
                Tercihleri kaydet
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </CookieConsentContext.Provider>
  )
}
