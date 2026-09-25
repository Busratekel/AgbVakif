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

export async function adminFetch(path: string, init?: RequestInit) {
  const isFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${getAdminToken()}`,
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${FORM_API_URL}/admin${path}`, {
    ...init,
    headers,
  })
  const json = await response.json().catch(() => ({}))
  if (response.status === 401) {
    clearAdminSession()
  }
  if (!response.ok || json.success === false) {
    throw new Error(json.message || `İstek başarısız (${response.status})`)
  }
  return json
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
  ad?: string
  soyad?: string
  tcKimlikNo?: string
  telefon?: string
  eposta?: string
  universite?: string
  bolum?: string
  sinif?: string
  kategori?: string
  durum?: string
  olusturmaTarihi?: string
  guncellemeTarihi?: string
  sonGonderimTarihi?: string
}

export const DURUMLAR = [
  'Taslak',
  'Gonderildi',
  'Inceleniyor',
  'Onaylandi',
  'Reddedildi',
  'GeriCekildi',
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
}
