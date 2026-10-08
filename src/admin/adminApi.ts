import { FORM_API_URL } from '../config'

const TOKEN_KEY = 'agb-admin-token'
const USER_KEY = 'agb-admin-user'

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) ?? ''
}

export function getAdminUser() {
  return sessionStorage.getItem(USER_KEY) ?? ''
}

export function setAdminSession(token: string, userName: string) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, userName)
}

export function clearAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function adminHeaders() {
  const token = getAdminToken()
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function adminLogin(userName: string, password: string) {
  const response = await fetch(`${FORM_API_URL}/admin/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userName, password }),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok || !json.success) {
    throw new Error(json.message || `Giriş başarısız (${response.status})`)
  }
  setAdminSession(json.accessToken, json.userName ?? userName)
  return json
}

export async function adminLogout() {
  try {
    if (getAdminToken()) {
      await fetch(`${FORM_API_URL}/admin/logout`, {
        method: 'POST',
        headers: adminHeaders(),
      })
    }
  } catch {
    // ignore
  } finally {
    clearAdminSession()
  }
}

export async function adminFetch(path: string, init?: RequestInit): Promise<any> {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${getAdminToken()}`,
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`${FORM_API_URL}/admin${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu kontrol edin.')
  }

  const raw = await response.text()
  let json: any = {}
  if (raw) {
    try {
      json = JSON.parse(raw)
    } catch {
      json = {}
    }
  }

  if (response.status === 401) {
    redirectToAdminLogin()
    throw new Error('Oturum süresi dolmuş. Tekrar giriş yapmanız gerekiyor.')
  }
  if (!response.ok || json.success === false) {
    throw new Error(formatAdminError(response.status, json, raw))
  }
  return json
}

/** Filtreli başvuruları Excel (.xlsx) olarak indirir. */
export async function adminDownloadBasvuruExcel(params: {
  q?: string
  durum?: string
  tip?: string
}) {
  const qs = new URLSearchParams()
  if (params.q?.trim()) qs.set('q', params.q.trim())
  if (params.durum) qs.set('durum', params.durum)
  if (params.tip) qs.set('tip', params.tip)

  let response: Response
  try {
    response = await fetch(`${FORM_API_URL}/admin/basvurular/export?${qs}`, {
      headers: {
        Authorization: `Bearer ${getAdminToken()}`,
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu kontrol edin.')
  }

  if (response.status === 401) {
    redirectToAdminLogin()
    throw new Error('Oturum süresi dolmuş. Tekrar giriş yapmanız gerekiyor.')
  }

  if (!response.ok) {
    const raw = await response.text()
    let json: any = {}
    try {
      json = JSON.parse(raw)
    } catch {
      /* ignore */
    }
    throw new Error(formatAdminError(response.status, json, raw))
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
  const fileName = match
    ? decodeURIComponent(match[1].replace(/['"]/g, ''))
    : `AGB-Basvurular-${new Date().toISOString().slice(0, 10)}.xlsx`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function adminDownloadBelge(basvuruId: string, belgeId: string, fileName: string) {
  let response: Response
  try {
    response = await fetch(`${FORM_API_URL}/admin/basvurular/${basvuruId}/belgeler/${belgeId}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    })
  } catch {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu kontrol edin.')
  }

  if (response.status === 401) {
    redirectToAdminLogin()
    throw new Error('Oturum süresi dolmuş. Tekrar giriş yapmanız gerekiyor.')
  }
  if (!response.ok) {
    const raw = await response.text()
    let json: any = {}
    try { json = JSON.parse(raw) } catch { /* ignore */ }
    throw new Error(formatAdminError(response.status, json, raw))
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  // İndir için dosya adını koru
  const a = document.createElement('a')
  a.href = url
  a.download = fileName || 'belge'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Belgeyi yeni sekmede açar (önizleme). */
export async function adminOpenBelge(basvuruId: string, belgeId: string) {
  let response: Response
  try {
    response = await fetch(`${FORM_API_URL}/admin/basvurular/${basvuruId}/belgeler/${belgeId}`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    })
  } catch {
    throw new Error('Sunucuya bağlanılamadı. API çalışıyor mu kontrol edin.')
  }

  if (response.status === 401) {
    redirectToAdminLogin()
    throw new Error('Oturum süresi dolmuş. Tekrar giriş yapmanız gerekiyor.')
  }
  if (!response.ok) {
    const raw = await response.text()
    let json: any = {}
    try { json = JSON.parse(raw) } catch { /* ignore */ }
    throw new Error(json.message || formatAdminError(response.status, json, raw) || `Belge açılamadı (${response.status})`)
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (!opened) {
    // popup engellendiyse indir
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
}

/** Resim önizlemesi için blob URL üretir; kullanınca revoke edin. */
export async function adminBelgeBlobUrl(basvuruId: string, belgeId: string) {
  const response = await fetch(`${FORM_API_URL}/admin/basvurular/${basvuruId}/belgeler/${belgeId}`, {
    headers: { Authorization: `Bearer ${getAdminToken()}` },
  })
  if (response.status === 401) {
    redirectToAdminLogin()
    throw new Error('Oturum süresi dolmuş. Tekrar giriş yapmanız gerekiyor.')
  }
  if (!response.ok) {
    const raw = await response.text()
    let json: any = {}
    try { json = JSON.parse(raw) } catch { /* ignore */ }
    throw new Error(json.message || 'Belge alınamadı')
  }
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

function redirectToAdminLogin() {
  clearAdminSession()
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (path.startsWith('/admin/giris')) return
  const next = `${path}${window.location.search}`
  window.location.assign(`/admin/giris?next=${encodeURIComponent(next)}`)
}

function formatAdminError(status: number, json: any, raw: string) {
  const message = pickString(json?.message)
  if (message) return message

  const title = pickString(json?.title)
  const detail = pickString(json?.detail)
  if (title && detail) return `${title}: ${detail}`
  if (detail) return detail
  if (title) return title

  const errors = json?.errors
  if (errors && typeof errors === 'object') {
    const parts = Object.values(errors as Record<string, unknown>)
      .flatMap((v) => (Array.isArray(v) ? v : [v]))
      .map((v) => String(v))
      .filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }

  if (status === 413) return 'Dosya çok büyük. Video en fazla 40 MB, görsel en fazla 5 MB olabilir.'
  if (status === 401) return 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
  if (status === 403) return 'Bu işlem için yetkiniz yok.'
  if (status === 404) return 'Kayıt bulunamadı.'
  if (status === 400) return 'Geçersiz istek. Alanları kontrol edip tekrar deneyin.'
  if (status >= 500) {
    if (raw && raw.length < 240 && !raw.trim().startsWith('<')) {
      return `Sunucu hatası: ${raw.trim()}`
    }
    return 'Sunucu hatası oluştu. Dosya boyutu/formatını kontrol edin veya sayfayı yenileyip tekrar deneyin.'
  }
  return `İstek başarısız (${status})`
}

function pickString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

export type HeroSlide = {
  id: string
  baslik: string
  aciklama?: string | null
  ustBaslik?: string | null
  resimUrl?: string | null
  butonMetin?: string | null
  butonLink?: string | null
  sira: number
  aktif: boolean
  olusturmaTarihi?: string
  guncellemeTarihi?: string
}

export type AdminBasvuruListItem = {
  id: string
  basvuruNo?: string
  basvuruTipi?: string
  donemYili?: number
  kategori?: string
  ad?: string
  soyad?: string
  tcKimlikNo?: string
  telefon?: string
  eposta?: string
  universite?: string
  bolum?: string
  sinif?: string
  durum?: string
  olusturmaTarihi?: string
  guncellemeTarihi?: string
  sonGonderimTarihi?: string
}

export const DURUMLAR = [
  'Gonderildi',
  'Inceleniyor',
  'Onaylandi',
  'Reddedildi',
] as const

export const CONFIG_LABELS: Record<string, string> = {
  PopupAktif: 'Açılış popup açık mı?',
  PopupBaslik: 'Popup başlığı',
  PopupMetin: 'Popup ek metin',
  BasvuruBaslik: 'Başvuru başlığı',
  BasvuruBaslikNot: 'Başvuru başlık notu',
  BasvuruFormBaslik: 'Form başlığı',
  BasvuruFormBaslikNot: 'Form açıklama notu',
  BasvuruBaslangic: 'Başlangıç tarihi',
  BasvuruBitis: 'Bitiş tarihi',
  MinDogumTarihi: 'En erken doğum tarihi',
  YardimBasvuruAktif: 'Yardım başvurusu açık mı?',
}
