export type CookieConsent = {
  necessary: true
  analytics: boolean
  updatedAt: string
}

export const COOKIE_CONSENT_KEY = 'agb-cookie-consent'
export const COOKIE_CONSENT_VERSION = 2

const defaultDenied = (): CookieConsent => ({
  necessary: true,
  analytics: false,
  updatedAt: new Date().toISOString(),
})

const defaultAccepted = (): CookieConsent => ({
  necessary: true,
  analytics: true,
  updatedAt: new Date().toISOString(),
})

export function readCookieConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CookieConsent> & { version?: number }
    if (typeof parsed.analytics !== 'boolean') {
      return null
    }
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveCookieConsent(consent: Omit<CookieConsent, 'necessary' | 'updatedAt'> | CookieConsent) {
  const next: CookieConsent = {
    necessary: true,
    analytics: Boolean(consent.analytics),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ ...next, version: COOKIE_CONSENT_VERSION }))
  // Tercih çerezi: JS erişebilir (HttpOnly değil) — 1 yıl
  const maxAge = 60 * 60 * 24 * 365
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(next))}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
  applyCookieConsent(next)
  window.dispatchEvent(new CustomEvent('agb-cookie-consent', { detail: next }))
  return next
}

export function acceptAllCookies() {
  return saveCookieConsent(defaultAccepted())
}

export function rejectOptionalCookies() {
  return saveCookieConsent(defaultDenied())
}

/** İzin verilmeyen opsiyonel çerezleri temizlemeye yardımcı (bilinen önekler). */
function clearOptionalCookies() {
  const keep = new Set([COOKIE_CONSENT_KEY.toLowerCase()])
  const parts = document.cookie.split(';')
  for (const part of parts) {
    const name = part.split('=')[0]?.trim()
    if (!name) continue
    const lower = name.toLowerCase()
    if (keep.has(lower)) continue
    if (
      lower.startsWith('_ga')
      || lower.startsWith('_gid')
      || lower.startsWith('_gat')
      || lower.startsWith('_gcl')
    ) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    }
  }
}

function loadScriptOnce(id: string, src: string) {
  if (document.getElementById(id)) return
  const el = document.createElement('script')
  el.id = id
  el.async = true
  el.src = src
  document.head.appendChild(el)
}

function unloadScript(id: string) {
  document.getElementById(id)?.remove()
}

/**
 * Tercihe göre üçüncü parti scriptleri yükler / kaldırır.
 * GA ölçüm kimliği: VITE_GA_MEASUREMENT_ID (yoksa analitik script yüklenmez).
 */
export function applyCookieConsent(consent: CookieConsent) {
  const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim()

  if (consent.analytics && gaId) {
    ;(window as unknown as { dataLayer?: unknown[] }).dataLayer =
      (window as unknown as { dataLayer?: unknown[] }).dataLayer || []
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void
      dataLayer: unknown[]
    }
    w.gtag = function gtag(...args: unknown[]) {
      w.dataLayer.push(args)
    }
    w.gtag('js', new Date())
    w.gtag('config', gaId, { anonymize_ip: true })
    loadScriptOnce('agb-ga-script', `https://www.googletagmanager.com/gtag/js?id=${gaId}`)
  } else {
    unloadScript('agb-ga-script')
    clearOptionalCookies()
  }
}

export function bootCookieConsent() {
  const existing = readCookieConsent()
  if (existing) applyCookieConsent(existing)
}
