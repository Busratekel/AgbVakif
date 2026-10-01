import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CATEGORIES, FORM_API_URL, SITE, STATUSES_BURS, STATUSES_YARDIM } from '../config'
import { formatMoneyInput } from '../money'
import { ILLER, ilcelerOf } from '../data/turkiye'
import { bolumlerOf, fakultelerOf, UNIVERSITE_AGACI } from '../data/universiteTree'
import {
  ARAC_YILLARI,
  emptyBasvuru,
  EV_DURUMU,
  EVET_HAYIR,
  HANE_KISI_SAYILARI,
  isAraSinif,
  isYeniOgrenci,
  KARDEŞ_SAYILARI,
  KAYIT_YILLARI,
  BITIRME_YILLARI,
  KONAKLAMA,
  MEDENI_DURUM,
  OZEL_DURUM_TIPLERI,
  SAG_MI,
  SINIFLAR,
  YKS_DILIMLERI,
  apiBasvuruTipi,
  wizardStepsFor,
  type BasvuruData,
  type BasvuruKind,
  type WizardStep,
} from '../basvuruTypes'
import { validateTCKN } from '../tcKimlik'
import { KvkkContent } from './KvkkContent'
import { BasvuruProfil } from './BasvuruProfil'

type ApiBasvuru = Record<string, unknown> & {
  id: string
  tcKimlikNoMasked: string
  telefonMasked: string
  durum: string
}

function asDiger(value: string, options: string[]) {
  const v = value.trim()
  if (!v) return { choice: '', text: '' }
  if (options.includes(v)) return { choice: v, text: '' }
  return { choice: 'Diğer', text: v }
}

function shownName(choice: string, text: string) {
  return choice === 'Diğer' ? text.trim() || 'Diğer' : choice
}

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Başvuru gününde 25 yaşını doldurmamış olmak. 25. yaş günü elenir. */
function earliestBirthForUnder25(now = new Date()) {
  const y = now.getFullYear() - 25
  const m = now.getMonth()
  const last = new Date(y, m + 1, 0).getDate()
  const turned = new Date(y, m, Math.min(now.getDate(), last))
  turned.setDate(turned.getDate() + 1)
  return isoDate(turned)
}

function str(v: unknown) {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

function bool(v: unknown) {
  return Boolean(v)
}

function mapApi(data: ApiBasvuru): BasvuruData {
  return {
    id: data.id,
    basvuruNo: str(data.basvuruNo) || undefined,
    tcKimlikNoMasked: data.tcKimlikNoMasked,
    telefonMasked: data.telefonMasked,
    ad: str(data.ad),
    soyad: str(data.soyad),
    dogumTarihi: str(data.dogumTarihi),
    dogumYeri: str(data.dogumYeri),
    medeniDurum: str(data.medeniDurum),
    eposta: str(data.eposta),
    yakinTelefon: str(data.yakinTelefon),
    yakinKim: str(data.yakinKim),
    il: str(data.il),
    ilce: str(data.ilce),
    acikAdres: str(data.acikAdres),
    statu: str(data.statu),
    babaAdi: str(data.babaAdi),
    babaSagMi: str(data.babaSagMi),
    babaMeslegi: str(data.babaMeslegi),
    babaAylikGelir: str(data.babaAylikGelir),
    anneAdi: str(data.anneAdi),
    anneSagMi: str(data.anneSagMi),
    anneMeslegi: str(data.anneMeslegi),
    anneAylikGelir: str(data.anneAylikGelir),
    anneBabaBirlikte: str(data.anneBabaBirlikte),
    birlikteYasadigiKisiler: /^\d+$/.test(str(data.birlikteYasadigiKisiler).trim())
      ? String(Number(str(data.birlikteYasadigiKisiler).trim()))
      : '',
    esAylikGelir: str(data.esAylikGelir),
    haneGeliri: str(data.haneGeliri),
    kardesIlkokul: str(data.kardesIlkokul) || '0',
    kardesYuksek: str(data.kardesYuksek) || '0',
    oturdugunuzEv: str(data.oturdugunuzEv),
    evKiraBedeli: str(data.evKiraBedeli),
    aracVarMi: str(data.aracVarMi),
    aracMarkaModel: str(data.aracMarkaModel),
    aracYili: str(data.aracYili),
    ozelDurumTipi: str(data.ozelDurumTipi),
    ozelDurum: str(data.ozelDurum),
    ...(() => {
      const uni = asDiger(str(data.universite), Object.keys(UNIVERSITE_AGACI))
      const facOptions = uni.choice && uni.choice !== 'Diğer'
        ? Object.keys(UNIVERSITE_AGACI[uni.choice] ?? {})
        : ['Diğer']
      const fac = asDiger(str(data.fakulte), facOptions)
      const bolOptions = uni.choice && fac.choice && fac.choice !== 'Diğer'
        ? (UNIVERSITE_AGACI[uni.choice]?.[fac.choice] ?? ['Diğer'])
        : ['Diğer']
      const bol = asDiger(str(data.bolum), bolOptions)
      return {
        universite: uni.choice,
        universiteAdi: uni.text,
        fakulte: fac.choice,
        fakulteAdi: fac.text,
        bolum: bol.choice,
        bolumAdi: bol.text,
      }
    })(),
    kayitYili: str(data.kayitYili),
    sinif: str(data.sinif),
    bitirmeYili: str(data.bitirmeYili),
    hazirlik: str(data.hazirlik),
    ailedenUzakta: str(data.ailedenUzakta),
    konaklamaDurumu: str(data.konaklamaDurumu),
    konaklamaUcreti: str(data.konaklamaUcreti),
    yksSiralamasi: str(data.yksSiralamasi),
    notOrtalamasi: str(data.notOrtalamasi),
    baskaBurs: str(data.baskaBurs),
    baskaBursMiktari: str(data.baskaBursMiktari),
    beyanCalismiyor: bool(data.beyanCalismiyor),
    beyanDisiplin: bool(data.beyanDisiplin),
    beyanAdliSicil: bool(data.beyanAdliSicil),
    beyanOrgunOgretim: bool(data.beyanOrgunOgretim),
    basvuruTipi: str(data.basvuruTipi),
    kategori: str(data.kategori),
    talepTutari: str(data.talepTutari),
    talepOzeti: str(data.talepOzeti),
    durum: data.durum,
  }
}

function authHeaders(token: string) {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

function lettersOnly(value: string) {
  return value.replace(/[0-9]/g, '')
}

export function ApplicationWizard({ kind = 'burs' }: { kind?: BasvuruKind }) {
  const isYardim = kind === 'yardim'
  const basvuruTipiApi = apiBasvuruTipi(kind)
  const wizardSteps = useMemo(() => wizardStepsFor(kind), [kind])
  const [searchParams] = useSearchParams()
  const profilGiris = searchParams.get('giris') === '1'
  const [step, setStep] = useState<WizardStep>(profilGiris ? 'kimlik' : 'kvkk')
  const [kvkkOk, setKvkkOk] = useState(profilGiris)
  const [kvkkReadToEnd, setKvkkReadToEnd] = useState(profilGiris)
  const kvkkScrollRef = useRef<HTMLDivElement>(null)
  const [donem, setDonem] = useState({
    baslik: isYardim ? 'Yardım / Destek Başvurusu' : '2026–2027 Lisans Başvurusu',
    baslikNot: '',
    formBaslik: isYardim ? 'Yardım / Destek Başvuru Formu' : 'Lisans Burs Başvurusu Formu',
    formBaslikNot: isYardim
      ? 'Başvuru birkaç dakika sürer. KVKK metnini okuduktan sonra kimliğinizi SMS ile doğrular, iletişim ve destek talebinizi paylaşırsınız.'
      : 'Başvuru yaklaşık 10 dakika sürer. Devam etmek için aydınlatma metnini sonuna kadar okuyup onaylamanız gerekir. Kimliğiniz, cep telefonunuza gönderilecek tek kullanımlık kod ile doğrulanır.',
    donemMetni: isYardim ? 'Yardım başvurusu durumu yükleniyor…' : 'Başvuru dönemi yükleniyor…',
    acik: true,
    yardimAcik: true,
    minDogumTarihi: '',
    yasSiniri: '',
  })
  /** Burs: dönem tarihleri · Yardım: paneldeki YardimBasvuruAktif */
  const formAcik = isYardim ? donem.yardimAcik : donem.acik
  const [returning, setReturning] = useState(profilGiris)
  const [tc, setTc] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [telefonMasked, setTelefonMasked] = useState('')
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', ''])
  const [debugOtp, setDebugOtp] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [accessToken, setAccessToken] = useState('')
  const [data, setData] = useState<BasvuruData>(emptyBasvuru)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [wasUpdate, setWasUpdate] = useState(false)
  const [fromProfil, setFromProfil] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)

  function update(patch: Partial<BasvuruData>) {
    setData((prev) => ({ ...prev, ...patch }))
    setFieldErrors((prev) => {
      const keys = Object.keys(patch)
      let changed = false
      const next = { ...prev }
      for (const k of keys) {
        if (k in next) {
          delete next[k]
          changed = true
        }
        if (k.startsWith('beyan') && 'beyanlar' in next) {
          delete next.beyanlar
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  const stepIndex = wizardSteps.findIndex((s) => s.id === step)
  const yasSiniri = donem.yasSiniri || earliestBirthForUnder25()
  const enErkenDogum = [yasSiniri, donem.minDogumTarihi].filter(Boolean).sort().at(-1) ?? ''
  const ilceList = useMemo(() => ilcelerOf(data.il), [data.il])
  const fakulteList = useMemo(() => fakultelerOf(data.universite), [data.universite])
  const bolumList = useMemo(
    () => bolumlerOf(data.universite, data.fakulte),
    [data.universite, data.fakulte],
  )
  const universiteList = useMemo(() => Object.keys(UNIVERSITE_AGACI), [])

  useEffect(() => {
    if (!profilGiris) return
    setReturning(true)
    setKvkkOk(true)
    setKvkkReadToEnd(true)
    setError('')
    setStep((s) => (s === 'kvkk' || s === 'kimlik' || s === 'sms' ? 'kimlik' : s))
  }, [profilGiris])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/basvuru/donem`)
        const json = await res.json()
        if (!cancelled && res.ok && json.success) {
          setDonem({
            baslik: isYardim ? 'Yardım / Destek Başvurusu' : json.baslik,
            baslikNot: isYardim ? '' : (json.baslikNot ?? ''),
            formBaslik: isYardim ? 'Yardım / Destek Başvuru Formu' : json.formBaslik,
            formBaslikNot: isYardim
              ? 'Başvuru birkaç dakika sürer. KVKK metnini okuduktan sonra kimliğinizi SMS ile doğrular, iletişim ve destek talebinizi paylaşırsınız.'
              : (json.formBaslikNot ?? ''),
            donemMetni: isYardim
              ? (json.yardimAcik === false
                ? 'Yardım başvuruları şu an kapalıdır.'
                : 'Yardım başvuruları açıktır.')
              : json.donemMetni,
            acik: Boolean(json.acik),
            yardimAcik: json.yardimAcik !== false,
            minDogumTarihi: typeof json.minDogumTarihi === 'string' ? json.minDogumTarihi : '',
            yasSiniri: typeof json.yasSiniri === 'string' ? json.yasSiniri : '',
          })
        }
      } catch {
        /* varsayılan metinler kalır */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isYardim])

  useEffect(() => {
    if (step !== 'kvkk') return
    setKvkkReadToEnd(false)
    setKvkkOk(false)
    requestAnimationFrame(() => {
      const el = kvkkScrollRef.current
      if (!el) return
      if (el.scrollHeight <= el.clientHeight + 8) setKvkkReadToEnd(true)
    })
  }, [step])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [secondsLeft])

  function onKvkkScroll() {
    const el = kvkkScrollRef.current
    if (!el || kvkkReadToEnd) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) {
      setKvkkReadToEnd(true)
    }
  }

  const smsValue = useMemo(() => smsCode.join(''), [smsCode])

  function onlyDigits(value: string, max: number) {
    return value.replace(/\D/g, '').slice(0, max)
  }

  function formatPhoneInput(value: string) {
    const d = onlyDigits(value, 11)
    if (d.length <= 4) return d
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`
    if (d.length <= 9) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`
  }

  async function persist(nextStep: WizardStep) {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/me`, {
        method: 'PUT',
        headers: authHeaders(accessToken),
        body: JSON.stringify(payloadFromData(data)),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Kayıt başarısız')
      }
      setData(mapApi(result.data as ApiBasvuru))
      setStep(nextStep)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
      requestAnimationFrame(() => {
        alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    } finally {
      setLoading(false)
    }
  }

  async function sendKimlik() {
    setError('')
    if (!validateTCKN(tc)) {
      setError('T.C. kimlik numarası geçersiz. Lütfen 11 haneli geçerli bir numara girin.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/kimlik`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tcKimlikNo: tc,
          telefon,
          kvkkOnay: kvkkOk,
          basvuruTipi: basvuruTipiApi,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Kimlik doğrulama başlatılamadı')
      }
      setSessionId(result.sessionId)
      setTelefonMasked(result.telefonMasked)
      setDebugOtp(result.debugOtp ?? null)
      setSecondsLeft(result.expiresInSeconds ?? 180)
      setSmsCode(['', '', '', '', '', ''])
      setStep('sms')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function verifySms() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/sms-dogrula`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: smsValue }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'SMS doğrulanamadı')
      }
      setAccessToken(result.accessToken)
      const me = await fetch(`${FORM_API_URL}/basvuru/me`, {
        headers: authHeaders(result.accessToken),
      })
      const meJson = await me.json()
      if (!me.ok || !meJson.success) {
        throw new Error(meJson.message || 'Başvuru getirilemedi')
      }
      const mapped = mapApi(meJson.data as ApiBasvuru)
      setData(mapped)
      const gonderilmis = ['Gonderildi', 'Inceleniyor', 'Onaylandi', 'Reddedildi'].includes(mapped.durum ?? '')
      if (gonderilmis) {
        setFromProfil(true)
        setStep('profil')
      } else if (!formAcik) {
        setError(isYardim
          ? 'Yardım başvuruları şu an kapalıdır.'
          : 'Başvuru dönemi kapalı. Yeni başvuru alınmıyor.')
        setStep('kvkk')
      } else {
        setFromProfil(false)
        setStep('bilgiler')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  function showFieldErrors(entries: { key: string; message: string }[]) {
    setError(entries.length
      ? 'Zorunlu alanlar eksik. İşaretli alanları doldurup tekrar deneyin.'
      : '')
    setFieldErrors(Object.fromEntries(entries.map((e) => [e.key, e.message])))
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('label.is-invalid, .beyan-list.is-invalid')
        ?? alertRef.current
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  function isInvalid(...keys: string[]) {
    return keys.some((k) => Boolean(fieldErrors[k])) ? 'is-invalid' : ''
  }

  function fieldError(key: string) {
    const msg = fieldErrors[key]
    if (!msg) return null
    return (
      <span className="field-error" role="alert">
        {msg}
      </span>
    )
  }

  function validateBilgiler() {
    const missing: { key: string; message: string }[] = []
    const req = 'Bu alan zorunludur'
    if (!data.ad.trim()) missing.push({ key: 'ad', message: req })
    if (!data.soyad.trim()) missing.push({ key: 'soyad', message: req })
    if (!isYardim) {
      if (!data.dogumTarihi) missing.push({ key: 'dogumTarihi', message: req })
      else if (enErkenDogum && data.dogumTarihi < enErkenDogum) {
        missing.push({
          key: 'dogumTarihi',
          message: data.dogumTarihi < yasSiniri
            ? 'Başvuru tarihinde 25 yaşını doldurmuş olanlar başvuru yapamaz.'
            : `${enErkenDogum.split('-').reverse().join('.')} tarihinden önce doğanlar başvuru yapamaz.`,
        })
      }
      if (!data.dogumYeri) missing.push({ key: 'dogumYeri', message: req })
    }
    if (!data.medeniDurum) missing.push({ key: 'medeniDurum', message: req })
    if (!data.eposta.trim()) missing.push({ key: 'eposta', message: req })
    if (!data.yakinTelefon.trim() || onlyDigits(data.yakinTelefon, 11).length < 11) {
      missing.push({ key: 'yakinTelefon', message: 'Geçerli bir telefon girin (05xx …)' })
    }
    if (!data.yakinKim.trim()) missing.push({ key: 'yakinKim', message: req })
    if (!data.il) missing.push({ key: 'il', message: req })
    if (!data.ilce) missing.push({ key: 'ilce', message: req })
    if (data.acikAdres.trim().length < 10) {
      missing.push({ key: 'acikAdres', message: 'Açık adres en az 10 karakter olmalıdır' })
    }
    if (!data.statu) missing.push({ key: 'statu', message: req })
    return missing
  }

  function validateDetay() {
    const missing: { key: string; message: string }[] = []
    const req = 'Bu alan zorunludur'
    if (!data.babaAdi.trim()) missing.push({ key: 'babaAdi', message: req })
    if (!data.babaSagMi) missing.push({ key: 'babaSagMi', message: req })
    if (!data.babaMeslegi.trim()) missing.push({ key: 'babaMeslegi', message: req })
    if (data.babaSagMi === 'Evet' && data.babaAylikGelir === '') {
      missing.push({ key: 'babaAylikGelir', message: req })
    }
    if (!data.anneAdi.trim()) missing.push({ key: 'anneAdi', message: req })
    if (!data.anneSagMi) missing.push({ key: 'anneSagMi', message: req })
    if (!data.anneMeslegi.trim()) missing.push({ key: 'anneMeslegi', message: req })
    if (data.anneSagMi === 'Evet' && data.anneAylikGelir === '') {
      missing.push({ key: 'anneAylikGelir', message: req })
    }
    if (!data.anneBabaBirlikte) missing.push({ key: 'anneBabaBirlikte', message: req })
    if (data.medeniDurum === 'Evli' && data.esAylikGelir === '') {
      missing.push({ key: 'esAylikGelir', message: req })
    }
    if (data.birlikteYasadigiKisiler === '') {
      missing.push({ key: 'birlikteYasadigiKisiler', message: req })
    }
    if (data.haneGeliri === '') {
      missing.push({ key: 'haneGeliri', message: req })
    }
    if (!data.oturdugunuzEv) missing.push({ key: 'oturdugunuzEv', message: req })
    if (data.oturdugunuzEv === 'Kira' && data.evKiraBedeli === '') {
      missing.push({ key: 'evKiraBedeli', message: req })
    }
    if (!data.aracVarMi) missing.push({ key: 'aracVarMi', message: req })
    if (data.aracVarMi === 'Evet') {
      if (!data.aracMarkaModel.trim()) missing.push({ key: 'aracMarkaModel', message: req })
      if (!data.aracYili) missing.push({ key: 'aracYili', message: req })
    }
    if (!data.ozelDurumTipi) missing.push({ key: 'ozelDurumTipi', message: req })
    if (!data.universite) missing.push({ key: 'universite', message: req })
    if (data.universite === 'Diğer' && !data.universiteAdi.trim()) {
      missing.push({ key: 'universiteAdi', message: 'Üniversite adını yazın' })
    }
    if (!data.fakulte) missing.push({ key: 'fakulte', message: req })
    if (data.fakulte === 'Diğer' && !data.fakulteAdi.trim()) {
      missing.push({ key: 'fakulteAdi', message: 'Fakülte adını yazın' })
    }
    if (!data.bolum) missing.push({ key: 'bolum', message: req })
    if (data.bolum === 'Diğer' && !data.bolumAdi.trim()) {
      missing.push({ key: 'bolumAdi', message: 'Bölüm adını yazın' })
    }
    if (!data.kayitYili) missing.push({ key: 'kayitYili', message: req })
    if (!data.sinif) missing.push({ key: 'sinif', message: req })
    if (!data.bitirmeYili) missing.push({ key: 'bitirmeYili', message: req })
    if (!data.hazirlik) missing.push({ key: 'hazirlik', message: req })
    if (!data.ailedenUzakta) missing.push({ key: 'ailedenUzakta', message: req })
    if (data.ailedenUzakta === 'Evet') {
      if (!data.konaklamaDurumu) missing.push({ key: 'konaklamaDurumu', message: req })
      if (data.konaklamaUcreti === '') missing.push({ key: 'konaklamaUcreti', message: req })
    }
    if (isYeniOgrenci(data.sinif) && !data.yksSiralamasi) {
      missing.push({ key: 'yksSiralamasi', message: req })
    }
    if (isAraSinif(data.sinif) && !data.notOrtalamasi) {
      missing.push({ key: 'notOrtalamasi', message: req })
    }
    if (!data.baskaBurs) missing.push({ key: 'baskaBurs', message: req })
    if (data.baskaBurs === 'Evet' && data.baskaBursMiktari === '') {
      missing.push({ key: 'baskaBursMiktari', message: req })
    }
    return missing
  }

  async function goBilgilerNext() {
    const missing = validateBilgiler()
    if (missing.length) {
      showFieldErrors(missing)
      return
    }
    setFieldErrors({})
    setError('')
    await persist(isYardim ? 'destek' : 'detay')
  }

  function validateDestek() {
    const missing: { key: string; message: string }[] = []
    const req = 'Bu alan zorunludur'
    if (!data.kategori) missing.push({ key: 'kategori', message: req })
    if (data.talepOzeti.trim().length < 20) {
      missing.push({ key: 'talepOzeti', message: 'Talep özetini en az 20 karakter yazın' })
    }
    return missing
  }

  async function goDestekNext() {
    const missing = validateDestek()
    if (missing.length) {
      showFieldErrors(missing)
      return
    }
    setFieldErrors({})
    setError('')
    await persist('beyanlar')
  }

  async function goDetayNext() {
    const missing = validateDetay()
    if (missing.length) {
      showFieldErrors(missing)
      return
    }
    setFieldErrors({})
    setError('')
    await persist('beyanlar')
  }

  async function goBeyanlarNext() {
    const beyanOk = isYardim
      ? data.beyanCalismiyor && data.beyanAdliSicil && data.beyanDisiplin
      : data.beyanCalismiyor && data.beyanDisiplin
        && data.beyanAdliSicil && data.beyanOrgunOgretim
    if (!beyanOk) {
      showFieldErrors([{ key: 'beyanlar', message: 'Tüm koşul beyanlarını işaretleyin.' }])
      return
    }
    setFieldErrors({})
    setError('')
    await persist('ozet')
  }

  async function submitFinal() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/me/gonder`, {
        method: 'POST',
        headers: authHeaders(accessToken),
        body: JSON.stringify(payloadFromData(data)),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gönderim başarısız')
      }
      setData(mapApi(result.data as ApiBasvuru))
      setWasUpdate(Boolean(result.isUpdate))
      setStep('sonuc')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  function printSummary() {
    document.body.classList.add('printing-summary')
    const cleanup = () => {
      document.body.classList.remove('printing-summary')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    // bazı tarayıcılarda afterprint gecikebilir / gelmeyebilir
    window.setTimeout(cleanup, 1000)
  }

  function onSmsDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...smsCode]
    next[index] = digit
    setSmsCode(next)
    if (digit && index < 5) {
      document.getElementById(`sms-${index + 1}`)?.focus()
    }
  }

  function setIl(il: string) {
    update({ il, ilce: '' })
  }

  return (
    <section className="section application wizard" id="basvuru-form">
      <div className="shell">
        {step !== 'profil' && !(returning && (step === 'kimlik' || step === 'sms')) ? <ol className="wizard-steps">
          {wizardSteps.map((item, index) => {
            const done = index < stepIndex
            const current = index === stepIndex
            return (
              <li key={item.id} className={done ? 'is-done' : current ? 'is-current' : ''}>
                <span className="wizard-dot">{done ? '✓' : index + 1}</span>
                <span className="wizard-label">{item.label}</span>
              </li>
            )
          })}
        </ol> : null}

        <div className="wizard-banner">
          <strong>{donem.baslik}</strong>
          {donem.baslikNot.trim() ? <span>{donem.baslikNot}</span> : null}
          <span>{donem.donemMetni}</span>
        </div>

        <div className="wizard-card">
          {error ? (
            <div className="form-alert is-error" ref={alertRef} role="alert">
              <strong>Eksik / hatalı alan</strong>
              <p>{error}</p>
            </div>
          ) : null}
          {!formAcik && step === 'kvkk' ? (
            <div className="form-alert is-error">
              <p>
                {isYardim
                  ? 'Yardım başvuruları şu an kapalıdır.'
                  : 'Başvuru dönemi şu an kapalıdır. Tarihler üst bantta yer almaktadır.'}
              </p>
            </div>
          ) : null}

          {step === 'kvkk' && (
            <>
              <h2>{donem.formBaslik}</h2>
              {donem.formBaslikNot.trim() ? (
                <p className="wizard-lead">{donem.formBaslikNot}</p>
              ) : null}
              <div
                className="kvkk-scroll kvkk-scroll-embed"
                ref={kvkkScrollRef}
                onScroll={onKvkkScroll}
              >
                <KvkkContent />
              </div>
              {!kvkkReadToEnd ? (
                <p className="kvkk-hint">Onay için metni sonuna kadar kaydırın.</p>
              ) : (
                <p className="kvkk-hint is-ready">Metni sonuna kadar okudunuz; onaylayabilirsiniz.</p>
              )}
              <label className={`consent ${!kvkkReadToEnd ? 'is-disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={kvkkOk}
                  disabled={!kvkkReadToEnd}
                  onChange={(e) => setKvkkOk(e.target.checked)}
                />
                <span>
                  {SITE.name} kişisel verilerin işlenmesine ilişkin aydınlatma metni
                  tarafıma sunulmuş olup okudum; başvuru sürecinde kişisel verilerimin
                  işlenmesini kabul ediyorum.
                </span>
              </label>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="btn"
                  disabled={!kvkkOk || !formAcik}
                  onClick={() => {
                    setReturning(false)
                    setStep('kimlik')
                  }}
                >
                  Başvuruya başla →
                </button>
              </div>
              <button
                type="button"
                className="linkish returning-link"
                onClick={() => {
                  setError('')
                  setReturning(true)
                  setKvkkOk(true)
                  setKvkkReadToEnd(true)
                  setStep('kimlik')
                }}
              >
                Daha önce başvurdunuz mu? Başvurumu görüntüle / düzenle
              </button>
            </>
          )}

          {step === 'kimlik' && (
            <>
              <h2>{returning ? 'Başvuruma giriş' : 'Kimlik Doğrulama'}</h2>
              <p className="wizard-lead">
                {returning
                  ? 'Başvuru durumunuzu görmek, başvurunuzu güncellemek veya istenilen belgeleri göndermek için T.C. kimlik numaranızı ve cep telefonunuzu girin. SMS ile doğrulama yapılır.'
                  : 'T.C. kimlik numaranızı ve cep telefonunuzu girin.'}
              </p>
              <div className="form-grid">
                <label className={tc.length === 11 && !validateTCKN(tc) ? 'is-invalid' : undefined}>
                  <span>T.C. kimlik no</span>
                  <input
                    value={tc}
                    onChange={(e) => setTc(onlyDigits(e.target.value, 11))}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="11 haneli"
                    aria-invalid={tc.length === 11 && !validateTCKN(tc)}
                  />
                  {tc.length === 11 && !validateTCKN(tc) ? (
                    <small className="field-error">Geçersiz T.C. kimlik numarası.</small>
                  ) : (
                    <small className="field-hint">11 haneli geçerli T.C. kimlik no</small>
                  )}
                </label>
                <label>
                  <span>Cep telefonu</span>
                  <input
                    value={telefon}
                    onChange={(e) => setTelefon(formatPhoneInput(e.target.value))}
                    inputMode="tel"
                    placeholder="05__ ___ __ __"
                  />
                </label>
              </div>
              <div className="wizard-actions space-between">
                {returning ? (
                  <Link to="/" className="btn btn-ghost-dark">← Ana sayfa</Link>
                ) : (
                  <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('kvkk')}>← Geri</button>
                )}
                <button
                  type="button"
                  className="btn"
                  disabled={loading || !validateTCKN(tc) || onlyDigits(telefon, 11).length < 11}
                  onClick={() => void sendKimlik()}
                >
                  {loading ? 'Gönderiliyor…' : 'Doğrulama kodu gönder'}
                </button>
              </div>
            </>
          )}

          {step === 'sms' && (
            <>
              <h2>SMS Doğrulama Kodu</h2>
              <p className="wizard-lead">{telefonMasked} numarasına gönderilen 6 haneli kodu girin.</p>
              {debugOtp ? <p className="debug-otp">Geliştirme OTP: <strong>{debugOtp}</strong></p> : null}
              <div className="sms-boxes">
                {smsCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`sms-${index}`}
                    value={digit}
                    onChange={(e) => onSmsDigit(index, e.target.value)}
                    inputMode="numeric"
                    maxLength={1}
                  />
                ))}
              </div>
              <p className="sms-meta">
                Kodun geçerlilik süresi:{' '}
                <strong>
                  {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
                  {String(secondsLeft % 60).padStart(2, '0')}
                </strong>
                {' · '}
                <button type="button" className="linkish" disabled={loading} onClick={() => void sendKimlik()}>
                  Kodu tekrar gönder
                </button>
              </p>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('kimlik')}>← Geri</button>
                <button
                  type="button"
                  className="btn"
                  disabled={loading || smsValue.length !== 6}
                  onClick={() => void verifySms()}
                >
                  {loading ? 'Doğrulanıyor…' : 'Doğrula ve devam et'}
                </button>
              </div>
            </>
          )}

          {step === 'bilgiler' && (
            <>
              <div className="wizard-title-row">
                <h2>Başvuru Bilgileri</h2>
                <span className="verified-pill">✓ Kimlik doğrulandı</span>
              </div>
              <p className="wizard-lead">
                {isYardim
                  ? 'Lütfen tüm alanları eksiksiz doldurun.'
                  : 'Lütfen tüm alanları eksiksiz doldurun. Burs verilmesi uygun görüldüğünde beyanlarınızı kanıtlayan belgeler istenecektir; belgelenemeyen beyan burs başvurunuzun iptaline yol açar.'}
              </p>

              <h3 className="wizard-sub">1. Kimlik bilgileri</h3>
              <div className="form-grid">
                <label>
                  <span>T.C. kimlik no</span>
                  <input value={data.tcKimlikNoMasked ?? ''} readOnly />
                </label>
                <label className={isInvalid('ad')}>
                  <span>Adı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('ad')}
                  <input value={data.ad} onChange={(e) => update({ ad: lettersOnly(e.target.value) })} />
                </label>
                <label className={isInvalid('soyad')}>
                  <span>Soyadı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('soyad')}
                  <input value={data.soyad} onChange={(e) => update({ soyad: lettersOnly(e.target.value) })} />
                </label>
                <label className={isInvalid('dogumTarihi')}>
                  <span>
                    Doğum tarihi
                    {!isYardim ? <abbr className="req" title="Zorunlu">*</abbr> : null}
                  </span>
                  {fieldError('dogumTarihi')}
                  <input
                    type="date"
                    value={data.dogumTarihi}
                    min={!isYardim && enErkenDogum ? enErkenDogum : undefined}
                    onChange={(e) => update({ dogumTarihi: e.target.value })}
                  />
                  {!isYardim ? (
                    <small className="field-hint">
                      Başvuru tarihinde 25 yaşını doldurmamış olmak gerekir.
                      {enErkenDogum ? ` ${enErkenDogum.split('-').reverse().join('.')} ve sonrası doğumlular başvurabilir.` : ''}
                    </small>
                  ) : null}
                </label>
                <label className={isInvalid('dogumYeri')}>
                  <span>
                    Doğum yeri
                    {!isYardim ? <abbr className="req" title="Zorunlu">*</abbr> : null}
                  </span>
                  {fieldError('dogumYeri')}
                  <select value={data.dogumYeri} onChange={(e) => update({ dogumYeri: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {ILLER.map((il) => <option key={il} value={il}>{il}</option>)}
                  </select>
                </label>
                <label className={isInvalid('medeniDurum')}>
                  <span>Medeni durum<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('medeniDurum')}
                  <select
                    value={data.medeniDurum}
                    onChange={(e) =>
                      update({
                        medeniDurum: e.target.value,
                        esAylikGelir: e.target.value === 'Evli' ? data.esAylikGelir : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {MEDENI_DURUM.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
              </div>

              <h3 className="wizard-sub">2. İletişim bilgileri</h3>
              <div className="form-grid">
                <label>
                  <span>Cep telefonu</span>
                  <input value={data.telefonMasked ?? ''} readOnly />
                </label>
                <label className={isInvalid('eposta')}>
                  <span>E-posta<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('eposta')}
                  <input type="email" value={data.eposta} onChange={(e) => update({ eposta: e.target.value })} />
                </label>
                <label className={isInvalid('yakinTelefon')}>
                  <span>Yakınına ait telefon<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('yakinTelefon')}
                  <input
                    value={data.yakinTelefon}
                    onChange={(e) => update({ yakinTelefon: formatPhoneInput(e.target.value) })}
                    placeholder="05__ ___ __ __"
                  />
                  <small className="field-hint">Size ulaşılamadığında iletişim için kullanılır.</small>
                </label>
                <label className={isInvalid('yakinKim')}>
                  <span>Yakınlık / kim olduğu<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('yakinKim')}
                  <input
                    value={data.yakinKim}
                    onChange={(e) => update({ yakinKim: lettersOnly(e.target.value) })}
                    placeholder="örn. Anne, Baba, Kardeş"
                  />
                </label>
                <label className={isInvalid('il')}>
                  <span>İl<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('il')}
                  <select value={data.il} onChange={(e) => setIl(e.target.value)}>
                    <option value="">Seçiniz</option>
                    {ILLER.map((il) => <option key={il} value={il}>{il}</option>)}
                  </select>
                </label>
                <label className={isInvalid('ilce')}>
                  <span>İlçe<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('ilce')}
                  <select
                    value={data.ilce}
                    onChange={(e) => update({ ilce: e.target.value })}
                    disabled={!data.il}
                  >
                    <option value="">Seçiniz</option>
                    {ilceList.map((ilce) => <option key={ilce} value={ilce}>{ilce}</option>)}
                  </select>
                </label>
                <label className={`full ${isInvalid('acikAdres')}`}>
                  <span>Açık adres<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('acikAdres')}
                  <textarea
                    rows={3}
                    value={data.acikAdres}
                    onChange={(e) => update({ acikAdres: e.target.value })}
                    placeholder="Mahalle, cadde/sokak, bina ve daire no"
                  />
                  <small className="field-hint">Mahalle, cadde/sokak, bina ve daire no eksiksiz yazılmalıdır.</small>
                </label>
              </div>

              <h3 className="wizard-sub">Başvuru statüsü</h3>
              <div className="form-grid">
                <label className={`full ${isInvalid('statu')}`}>
                  <span>Başvuru sahibi statüsü<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('statu')}
                  <select value={data.statu} onChange={(e) => update({ statu: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {(isYardim ? STATUSES_YARDIM : STATUSES_BURS).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep(fromProfil ? 'profil' : 'sms')}>← Geri</button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goBilgilerNext()}>
                  {loading ? 'Kaydediliyor…' : 'Devam et →'}
                </button>
              </div>
            </>
          )}

          {step === 'destek' && (
            <>
              <h2>Destek Talebi</h2>
              <p className="wizard-lead">
                Talebinizin değerlendirilmesi için kategori, isteğe bağlı tutar ve kısa bir özet paylaşın.
              </p>
              <div className="form-grid">
                <label className={`full ${isInvalid('kategori')}`}>
                  <span>Destek kategorisi<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('kategori')}
                  <select value={data.kategori} onChange={(e) => update({ kategori: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="full">
                  <span>Talep tutarı (isteğe bağlı)</span>
                  <input
                    value={data.talepTutari}
                    onChange={(e) => update({ talepTutari: formatMoneyInput(e.target.value) })}
                    placeholder="örn. 15.000"
                    inputMode="numeric"
                  />
                </label>
                <label className={`full ${isInvalid('talepOzeti')}`}>
                  <span>Talep özeti<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('talepOzeti')}
                  <textarea
                    rows={5}
                    value={data.talepOzeti}
                    onChange={(e) => update({ talepOzeti: e.target.value })}
                    placeholder="İhtiyacınızı, aciliyetinizi ve varsa ek notları kısaca açıklayın."
                  />
                </label>
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('bilgiler')}>← Geri</button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goDestekNext()}>
                  {loading ? 'Kaydediliyor…' : 'Devam et →'}
                </button>
              </div>
            </>
          )}

          {step === 'detay' && (
            <>
              <h2>Aile, Eğitim ve Burs Bilgileri</h2>
              <p className="wizard-lead">Aşağıdaki alanları eksiksiz doldurun.</p>

              <h3 className="wizard-sub">3. Aile bilgileri</h3>
              <div className="form-grid">
                <label className={isInvalid('babaAdi')}>
                  <span>Baba adı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('babaAdi')}
                  <input value={data.babaAdi} onChange={(e) => update({ babaAdi: lettersOnly(e.target.value) })} />
                </label>
                <label className={isInvalid('babaSagMi')}>
                  <span>Baba sağ mı?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('babaSagMi')}
                  <select
                    value={data.babaSagMi}
                    onChange={(e) =>
                      update({
                        babaSagMi: e.target.value,
                        babaAylikGelir: e.target.value === 'Evet' ? data.babaAylikGelir : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {SAG_MI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('babaMeslegi')}>
                  <span>Baba mesleği<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('babaMeslegi')}
                  <input value={data.babaMeslegi} onChange={(e) => update({ babaMeslegi: lettersOnly(e.target.value) })} />
                </label>
                {data.babaSagMi === 'Evet' ? (
                  <label className={isInvalid('babaAylikGelir')}>
                    <span>Baba aylık net geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('babaAylikGelir')}
                    <input
                      value={data.babaAylikGelir}
                      onChange={(e) => update({ babaAylikGelir: formatMoneyInput(e.target.value) })}
                      placeholder="örn. 22.000"
                      inputMode="numeric"
                    />
                    <small className="field-hint">Geliri yoksa 0 yazınız.</small>
                  </label>
                ) : null}
                <label className={isInvalid('anneAdi')}>
                  <span>Anne adı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneAdi')}
                  <input value={data.anneAdi} onChange={(e) => update({ anneAdi: lettersOnly(e.target.value) })} />
                </label>
                <label className={isInvalid('anneSagMi')}>
                  <span>Anne sağ mı?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneSagMi')}
                  <select
                    value={data.anneSagMi}
                    onChange={(e) =>
                      update({
                        anneSagMi: e.target.value,
                        anneAylikGelir: e.target.value === 'Evet' ? data.anneAylikGelir : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {SAG_MI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('anneMeslegi')}>
                  <span>Anne mesleği<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneMeslegi')}
                  <input value={data.anneMeslegi} onChange={(e) => update({ anneMeslegi: lettersOnly(e.target.value) })} />
                </label>
                {data.anneSagMi === 'Evet' ? (
                  <label className={isInvalid('anneAylikGelir')}>
                    <span>Anne aylık net geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('anneAylikGelir')}
                    <input
                      value={data.anneAylikGelir}
                      onChange={(e) => update({ anneAylikGelir: formatMoneyInput(e.target.value) })}
                      placeholder="örn. 0"
                      inputMode="numeric"
                    />
                    <small className="field-hint">Geliri yoksa 0 yazınız.</small>
                  </label>
                ) : null}
                <label className={isInvalid('anneBabaBirlikte')}>
                  <span>Anne-baba birlikte mi?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneBabaBirlikte')}
                  <select value={data.anneBabaBirlikte} onChange={(e) => update({ anneBabaBirlikte: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <small className="field-hint">Boşanmış / ayrı yaşıyorlarsa Hayır seçiniz.</small>
                </label>
                {data.medeniDurum === 'Evli' ? (
                  <label className={isInvalid('esAylikGelir')}>
                    <span>Eşinizin aylık net geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('esAylikGelir')}
                    <input
                      value={data.esAylikGelir}
                      onChange={(e) => update({ esAylikGelir: formatMoneyInput(e.target.value) })}
                      placeholder="örn. 15.000"
                      inputMode="numeric"
                    />
                    <small className="field-hint">Geliri yoksa 0 yazınız.</small>
                  </label>
                ) : null}

                <label className={isInvalid('birlikteYasadigiKisiler')}>
                  <span>Birlikte yaşadığınız kişi sayısı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('birlikteYasadigiKisiler')}
                  <select
                    value={data.birlikteYasadigiKisiler}
                    onChange={(e) => update({ birlikteYasadigiKisiler: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    {HANE_KISI_SAYILARI.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <small className="field-hint">Sizinle aynı evde yaşayan kişi sayısı (kendiniz hariç). Yalnız yaşıyorsanız 0 seçiniz.</small>
                </label>

                <label className={isInvalid('haneGeliri')}>
                  <span>Hane geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('haneGeliri')}
                  <input
                    value={data.haneGeliri}
                    onChange={(e) => update({ haneGeliri: formatMoneyInput(e.target.value) })}
                    placeholder="örn. 45.000"
                    inputMode="numeric"
                  />
                  <small className="field-hint">Aynı evde yaşayanların toplam aylık net geliri. Gelir yoksa 0 yazınız.</small>
                </label>

                <label>
                  <span>İlkokul/ortaokul/lisede okuyan kardeş<abbr className="req" title="Zorunlu">*</abbr></span>
                  <select value={data.kardesIlkokul} onChange={(e) => update({ kardesIlkokul: e.target.value })}>
                    {KARDEŞ_SAYILARI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label>
                  <span>Yükseköğretimde okuyan kardeş<abbr className="req" title="Zorunlu">*</abbr></span>
                  <select value={data.kardesYuksek} onChange={(e) => update({ kardesYuksek: e.target.value })}>
                    {KARDEŞ_SAYILARI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('oturdugunuzEv')}>
                  <span>Oturduğunuz ev<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('oturdugunuzEv')}
                  <select
                    value={data.oturdugunuzEv}
                    onChange={(e) =>
                      update({
                        oturdugunuzEv: e.target.value,
                        evKiraBedeli: e.target.value === 'Kira' ? data.evKiraBedeli : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {EV_DURUMU.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.oturdugunuzEv === 'Kira' ? (
                  <label className={isInvalid('evKiraBedeli')}>
                    <span>Aylık kira bedeli (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('evKiraBedeli')}
                    <input
                      value={data.evKiraBedeli}
                      onChange={(e) => update({ evKiraBedeli: formatMoneyInput(e.target.value) })}
                      placeholder="örn. 8.000"
                      inputMode="numeric"
                    />
                  </label>
                ) : null}
                <label className={isInvalid('aracVarMi')}>
                  <span>Ailede araç var mı?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('aracVarMi')}
                  <select
                    value={data.aracVarMi}
                    onChange={(e) =>
                      update({
                        aracVarMi: e.target.value,
                        aracMarkaModel: e.target.value === 'Evet' ? data.aracMarkaModel : '',
                        aracYili: e.target.value === 'Evet' ? data.aracYili : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.aracVarMi === 'Evet' ? (
                  <>
                    <label className={isInvalid('aracMarkaModel')}>
                      <span>Araç marka / model<abbr className="req" title="Zorunlu">*</abbr></span>
                      {fieldError('aracMarkaModel')}
                      <input
                        value={data.aracMarkaModel}
                        onChange={(e) => update({ aracMarkaModel: e.target.value })}
                        placeholder="örn. Renault Clio"
                      />
                    </label>
                    <label className={isInvalid('aracYili')}>
                      <span>Araç yılı<abbr className="req" title="Zorunlu">*</abbr></span>
                      {fieldError('aracYili')}
                      <select value={data.aracYili} onChange={(e) => update({ aracYili: e.target.value })}>
                        <option value="">Seçiniz</option>
                        {ARAC_YILLARI.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </label>
                  </>
                ) : null}
                <label className={`full ${isInvalid('ozelDurumTipi')}`}>
                  <span>Özel durum<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('ozelDurumTipi')}
                  <select
                    value={data.ozelDurumTipi}
                    onChange={(e) =>
                      update({
                        ozelDurumTipi: e.target.value,
                        ozelDurum: e.target.value === 'Yok' ? '' : data.ozelDurum,
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {OZEL_DURUM_TIPLERI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.ozelDurumTipi && data.ozelDurumTipi !== 'Yok' ? (
                  <label className="full">
                    <span>Özel durum açıklaması</span>
                    <textarea
                      rows={3}
                      value={data.ozelDurum}
                      onChange={(e) => update({ ozelDurum: e.target.value })}
                      placeholder="Lütfen kısa bir açıklama yazınız."
                    />
                  </label>
                ) : null}
              </div>

              <h3 className="wizard-sub">4. Eğitim bilgileri</h3>
              <div className="form-grid">
                <label className={isInvalid('universite')}>
                  <span>Üniversite<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('universite')}
                  <select
                    value={data.universite}
                    onChange={(e) =>
                      update({
                        universite: e.target.value,
                        universiteAdi: e.target.value === 'Diğer' ? data.universiteAdi : '',
                        fakulte: '',
                        fakulteAdi: '',
                        bolum: '',
                        bolumAdi: '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {universiteList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.universite === 'Diğer' ? (
                  <label className={`full ${isInvalid('universiteAdi')}`}>
                    <span>Üniversite adı<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('universiteAdi')}
                    <input
                      value={data.universiteAdi}
                      onChange={(e) => update({ universiteAdi: e.target.value })}
                      placeholder="Üniversitenin adını yazın"
                    />
                  </label>
                ) : null}
                <label className={isInvalid('fakulte')}>
                  <span>Fakülte<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('fakulte')}
                  <select
                    value={data.fakulte}
                    disabled={!data.universite}
                    onChange={(e) =>
                      update({
                        fakulte: e.target.value,
                        fakulteAdi: e.target.value === 'Diğer' ? data.fakulteAdi : '',
                        bolum: '',
                        bolumAdi: '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {fakulteList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.fakulte === 'Diğer' ? (
                  <label className={`full ${isInvalid('fakulteAdi')}`}>
                    <span>Fakülte adı<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('fakulteAdi')}
                    <input
                      value={data.fakulteAdi}
                      onChange={(e) => update({ fakulteAdi: e.target.value })}
                      placeholder="Fakültenin adını yazın"
                    />
                  </label>
                ) : null}
                <label className={`full ${isInvalid('bolum')}`}>
                  <span>Bölüm<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('bolum')}
                  <select
                    value={data.bolum}
                    disabled={!data.fakulte}
                    onChange={(e) =>
                      update({
                        bolum: e.target.value,
                        bolumAdi: e.target.value === 'Diğer' ? data.bolumAdi : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {bolumList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.bolum === 'Diğer' ? (
                  <label className={`full ${isInvalid('bolumAdi')}`}>
                    <span>Bölüm adı<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('bolumAdi')}
                    <input
                      value={data.bolumAdi}
                      onChange={(e) => update({ bolumAdi: e.target.value })}
                      placeholder="Bölümün adını yazın"
                    />
                  </label>
                ) : null}
                <label className={isInvalid('kayitYili')}>
                  <span>Üniversiteye kayıt yılı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('kayitYili')}
                  <select value={data.kayitYili} onChange={(e) => update({ kayitYili: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {KAYIT_YILLARI.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
                <label className={isInvalid('sinif')}>
                  <span>Bu yıl okuyacağınız sınıf<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('sinif')}
                  <select
                    value={data.sinif}
                    onChange={(e) => {
                      const sinif = e.target.value
                      update({
                        sinif,
                        yksSiralamasi: isYeniOgrenci(sinif) ? data.yksSiralamasi : '',
                        notOrtalamasi: isAraSinif(sinif) ? data.notOrtalamasi : '',
                      })
                    }}
                  >
                    <option value="">Seçiniz</option>
                    {SINIFLAR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('bitirmeYili')}>
                  <span>Normal bitirme yılınız<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('bitirmeYili')}
                  <select value={data.bitirmeYili} onChange={(e) => update({ bitirmeYili: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {BITIRME_YILLARI.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </label>
                <label className={isInvalid('hazirlik')}>
                  <span>Hazırlık okuyacak mısınız?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('hazirlik')}
                  <select value={data.hazirlik} onChange={(e) => update({ hazirlik: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('ailedenUzakta')}>
                  <span>Aileden uzakta mı okuyorsunuz?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('ailedenUzakta')}
                  <select
                    value={data.ailedenUzakta}
                    onChange={(e) =>
                      update({
                        ailedenUzakta: e.target.value,
                        konaklamaDurumu: e.target.value === 'Evet' ? data.konaklamaDurumu : '',
                        konaklamaUcreti: e.target.value === 'Evet' ? data.konaklamaUcreti : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.ailedenUzakta === 'Evet' ? (
                  <>
                    <label className={isInvalid('konaklamaDurumu')}>
                      <span>Konaklama durumu<abbr className="req" title="Zorunlu">*</abbr></span>
                      {fieldError('konaklamaDurumu')}
                      <select
                        value={data.konaklamaDurumu}
                        onChange={(e) => update({ konaklamaDurumu: e.target.value })}
                      >
                        <option value="">Seçiniz</option>
                        {KONAKLAMA.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </label>
                    <label className={isInvalid('konaklamaUcreti')}>
                      <span>Konaklama ücreti (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                      {fieldError('konaklamaUcreti')}
                      <input
                        value={data.konaklamaUcreti}
                        onChange={(e) => update({ konaklamaUcreti: formatMoneyInput(e.target.value) })}
                        placeholder="örn. 3.500"
                      />
                    </label>
                  </>
                ) : null}
              </div>

              <h3 className="wizard-sub">5. Başarı ve burs durumu</h3>
              <div className="form-grid">
                {isYeniOgrenci(data.sinif) ? (
                  <label className={`full ${isInvalid('yksSiralamasi')}`}>
                    <span>YKS yerleşme sıralamanız<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('yksSiralamasi')}
                    <select value={data.yksSiralamasi} onChange={(e) => update({ yksSiralamasi: e.target.value })}>
                      <option value="">Seçiniz</option>
                      {YKS_DILIMLERI.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                    <small className="field-hint">Yeni kayıt öğrencileri için yerleşme sırası.</small>
                  </label>
                ) : null}
                {isAraSinif(data.sinif) ? (
                  <label className={`full ${isInvalid('notOrtalamasi')}`}>
                    <span>Not ortalamanız (GANO)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('notOrtalamasi')}
                    <input
                      value={data.notOrtalamasi}
                      onChange={(e) =>
                        update({
                          notOrtalamasi: e.target.value.replace(/[^\d.,]/g, '').slice(0, 6),
                        })
                      }
                      inputMode="decimal"
                      placeholder="örn. 3,45"
                    />
                    <small className="field-hint">1. sınıf ve üzeri için genel not ortalaması.</small>
                  </label>
                ) : null}
                {!data.sinif ? (
                  <p className="wizard-lead full">Önce “Bu yıl okuyacağınız sınıf” alanını seçin.</p>
                ) : null}
                <label className={`full ${isInvalid('baskaBurs')}`}>
                  <span>Başka kamu veya özel kurumdan burs alıyor musunuz?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('baskaBurs')}
                  <select
                    value={data.baskaBurs}
                    onChange={(e) =>
                      update({
                        baskaBurs: e.target.value,
                        baskaBursMiktari: e.target.value === 'Evet' ? data.baskaBursMiktari : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <small className="field-hint">KYK öğrenim kredisi burs sayılmaz.</small>
                </label>
                {data.baskaBurs === 'Evet' ? (
                  <label className={`full ${isInvalid('baskaBursMiktari')}`}>
                    <span>Aylık burs miktarı (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('baskaBursMiktari')}
                    <input
                      value={data.baskaBursMiktari}
                      onChange={(e) => update({ baskaBursMiktari: formatMoneyInput(e.target.value) })}
                      placeholder="örn. 3.000"
                      inputMode="numeric"
                    />
                  </label>
                ) : null}
              </div>

              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('bilgiler')}>← Geri</button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goDetayNext()}>
                  {loading ? 'Kaydediliyor…' : 'Devam et →'}
                </button>
              </div>
            </>
          )}

          {step === 'beyanlar' && (
            <>
              <h2>{isYardim ? '5. Beyanlar' : '6. Koşul Beyanları'}</h2>
              <p className="wizard-lead">
                {isYardim
                  ? 'Destek talebiniz için aşağıdaki beyanların tamamı zorunludur.'
                  : 'Burs koşulları gereği aşağıdaki beyanların tamamı zorunludur.'}
              </p>
              <div className={`beyan-list ${isInvalid('beyanlar')}`}>
                {fieldError('beyanlar')}
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanCalismiyor}
                    onChange={(e) => update({ beyanCalismiyor: e.target.checked })}
                  />
                  <span>
                    {isYardim
                      ? 'Destek talebimin gerçek bir ihtiyaca dayandığını beyan ederim.'
                      : 'Kazanç getiren herhangi bir işte çalışmıyorum.'}
                  </span>
                </label>
                {isYardim ? (
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={data.beyanDisiplin}
                      onChange={(e) => update({ beyanDisiplin: e.target.checked })}
                    />
                    <span>Verdiğim bilgilerin doğru olduğunu beyan ederim.</span>
                  </label>
                ) : (
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={data.beyanDisiplin}
                      onChange={(e) => update({ beyanDisiplin: e.target.checked })}
                    />
                    <span>
                      Eğitimim sırasında &quot;kısa süreli uzaklaştırma&quot; cezasından daha ağır bir disiplin cezası almadım.
                    </span>
                  </label>
                )}
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanAdliSicil}
                    onChange={(e) => update({ beyanAdliSicil: e.target.checked })}
                  />
                  <span>
                    {isYardim
                      ? 'Adli sicil kaydım yok.'
                      : 'Öğretim kurumunca geçici veya sürekli uzaklaştırma cezası, okul ya da okul dışında öğrencilik vasıflarıyla bağdaşmayan bir davranışımın tespit edilmesi veyahut hürriyeti bağlayıcı bir cezaya ya da ağır para cezasına mahkum edilmedim.'}
                  </span>
                </label>
                {!isYardim ? (
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={data.beyanOrgunOgretim}
                      onChange={(e) => update({ beyanOrgunOgretim: e.target.checked })}
                    />
                    <span>
                      Örgün öğretim öğrencisiyim (açık öğretim, ekstern veya yurt dışı üniversitesi öğrencisi değilim).
                    </span>
                  </label>
                ) : null}
              </div>
              <div className="wizard-actions space-between">
                <button
                  type="button"
                  className="btn btn-ghost-dark"
                  onClick={() => setStep(isYardim ? 'destek' : 'detay')}
                >
                  ← Geri
                </button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goBeyanlarNext()}>
                  {loading ? 'Kaydediliyor…' : 'Özeti gör ve onayla →'}
                </button>
              </div>
            </>
          )}

          {step === 'ozet' && (
            <>
              <h2 className="no-print">Özet ve Onay</h2>
              <p className="wizard-lead no-print">
                Bilgilerinizi kontrol edin. Onayladıktan sonra başvurunuz değerlendirmeye alınır.
              </p>
              <div className="summary-box summary-mev" id="basvuru-ozet">
                <header className="summary-print-head">
                  <strong>Anadolu Güçbirliği Vakfı</strong>
                  <span>{isYardim ? 'Yardım / Destek Başvuru Özeti' : 'Burs Başvuru Özeti'}</span>
                </header>

                <section className="summary-section">
                  <h3>Kimlik ve İletişim</h3>
                  <table className="summary-table">
                    <tbody>
                      {data.basvuruNo ? (
                        <tr>
                          <th>Başvuru no</th>
                          <td>{data.basvuruNo}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <th>T.C. Kimlik No</th>
                        <td>{data.tcKimlikNoMasked}</td>
                      </tr>
                      <tr>
                        <th>Ad Soyad</th>
                        <td>{data.ad} {data.soyad}</td>
                      </tr>
                      <tr>
                        <th>Doğum</th>
                        <td>{data.dogumTarihi} · {data.dogumYeri}</td>
                      </tr>
                      <tr>
                        <th>Medeni durum</th>
                        <td>{data.medeniDurum || '—'}</td>
                      </tr>
                      <tr>
                        <th>Cep / E-posta</th>
                        <td>{data.telefonMasked} · {data.eposta}</td>
                      </tr>
                      <tr>
                        <th>Yakın telefon</th>
                        <td>{data.yakinTelefon} ({data.yakinKim || '—'})</td>
                      </tr>
                      <tr>
                        <th>Adres</th>
                        <td>{data.il} / {data.ilce} — {data.acikAdres}</td>
                      </tr>
                      <tr>
                        <th>Statü</th>
                        <td>{data.statu || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                {isYardim ? (
                  <section className="summary-section">
                    <h3>Destek talebi</h3>
                    <table className="summary-table">
                      <tbody>
                        <tr>
                          <th>Kategori</th>
                          <td>{data.kategori || '—'}</td>
                        </tr>
                        <tr>
                          <th>Talep tutarı</th>
                          <td>{data.talepTutari ? `${data.talepTutari} ₺` : 'Belirtilmedi'}</td>
                        </tr>
                        <tr>
                          <th>Talep özeti</th>
                          <td>{data.talepOzeti || '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>
                ) : null}

                {!isYardim ? (
                <section className="summary-section">
                  <h3>Aile ve Gelir</h3>
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <th>Baba</th>
                        <td>
                          {data.babaAdi}
                          {data.babaMeslegi ? ` · ${data.babaMeslegi}` : ''}
                          {data.babaSagMi === 'Evet' ? ` · ${data.babaAylikGelir || '0'} ₺` : ' · —'}
                        </td>
                      </tr>
                      <tr>
                        <th>Anne</th>
                        <td>
                          {data.anneAdi}
                          {data.anneMeslegi ? ` · ${data.anneMeslegi}` : ''}
                          {data.anneSagMi === 'Evet' ? ` · ${data.anneAylikGelir || '0'} ₺` : ' · —'}
                        </td>
                      </tr>
                      {data.medeniDurum === 'Evli' ? (
                        <tr>
                          <th>Eş geliri</th>
                          <td>{data.esAylikGelir || '0'} ₺</td>
                        </tr>
                      ) : null}
                      <tr>
                        <th>Anne-baba birlikte mi?</th>
                        <td>{data.anneBabaBirlikte || '—'}</td>
                      </tr>
                      <tr>
                        <th>Birlikte yaşadığı kişi sayısı</th>
                        <td>{data.birlikteYasadigiKisiler === '' ? '—' : data.birlikteYasadigiKisiler}</td>
                      </tr>
                      <tr>
                        <th>Hane geliri</th>
                        <td>{data.haneGeliri ? `${data.haneGeliri} ₺` : '—'}</td>
                      </tr>
                      <tr>
                        <th>Kardeşler (ilk-orta-lise / yükseköğretim)</th>
                        <td>{data.kardesIlkokul || '0'} / {data.kardesYuksek || '0'}</td>
                      </tr>
                      <tr>
                        <th>Ev</th>
                        <td>
                          {data.oturdugunuzEv === 'Kira'
                            ? `${data.oturdugunuzEv} · ${data.evKiraBedeli} ₺`
                            : (data.oturdugunuzEv || '—')}
                        </td>
                      </tr>
                      <tr>
                        <th>Araç</th>
                        <td>
                          {data.aracVarMi === 'Evet'
                            ? `${data.aracMarkaModel || 'Var'}${data.aracYili ? ` (${data.aracYili})` : ''}`
                            : (data.aracVarMi || '—')}
                        </td>
                      </tr>
                      <tr>
                        <th>Özel durum</th>
                        <td>
                          {data.ozelDurumTipi || '—'}
                          {data.ozelDurum && data.ozelDurumTipi !== 'Yok' ? ` — ${data.ozelDurum}` : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>
                ) : null}

                {!isYardim ? (
                <section className="summary-section">
                  <h3>Eğitim</h3>
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <th>Okul</th>
                        <td>
                          {shownName(data.universite, data.universiteAdi)}
                          {' · '}
                          {shownName(data.fakulte, data.fakulteAdi)}
                          {' · '}
                          {shownName(data.bolum, data.bolumAdi)}
                        </td>
                      </tr>
                      <tr>
                        <th>Sınıf / Bitirme</th>
                        <td>{data.sinif || '—'} · {data.bitirmeYili || '—'}</td>
                      </tr>
                      <tr>
                        <th>Kayıt yılı / Hazırlık</th>
                        <td>{data.kayitYili || '—'} · {data.hazirlik || '—'}</td>
                      </tr>
                      {data.yksSiralamasi ? (
                        <tr>
                          <th>YKS sıralama</th>
                          <td>{data.yksSiralamasi}</td>
                        </tr>
                      ) : null}
                      {data.notOrtalamasi ? (
                        <tr>
                          <th>Not ortalaması</th>
                          <td>{data.notOrtalamasi}</td>
                        </tr>
                      ) : null}
                      <tr>
                        <th>Başka burs</th>
                        <td>
                          {data.baskaBurs === 'Evet'
                            ? `${data.baskaBurs} · ${data.baskaBursMiktari} ₺`
                            : (data.baskaBurs || '—')}
                        </td>
                      </tr>
                      {data.ailedenUzakta === 'Evet' ? (
                        <tr>
                          <th>Konaklama</th>
                          <td>{data.konaklamaDurumu} · {data.konaklamaUcreti} ₺</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </section>
                ) : null}
              </div>

              <div className="wizard-actions space-between no-print">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('beyanlar')}>
                  ← Düzenle
                </button>
                <div className="wizard-actions-right">
                  <button type="button" className="btn btn-ghost-dark" onClick={printSummary}>
                    Özeti PDF / yazdır
                  </button>
                  <button type="button" className="btn" disabled={loading} onClick={() => void submitFinal()}>
                    {loading
                      ? 'Kaydediliyor…'
                      : data.durum === 'Gonderildi' || data.durum === 'Inceleniyor'
                        ? 'Başvuruyu güncelle'
                        : 'Başvuruyu gönder'}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'profil' && (
            <BasvuruProfil
              data={data}
              accessToken={accessToken}
              donemAcik={formAcik}
              showBelgeler={!isYardim}
              onEdit={() => {
                setError('')
                setFromProfil(true)
                setStep('bilgiler')
              }}
            />
          )}

          {step === 'sonuc' && (
            <>
              <div className="success-box" id="basvuru-ozet">
                <div className="success-check" aria-hidden="true">
                  <svg viewBox="0 0 52 52" width="72" height="72">
                    <circle cx="26" cy="26" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M14.5 27.2 22.2 34.5 37.5 17.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="success-title">
                  {wasUpdate ? 'Başvurunuz güncellendi' : 'Başvurunuz alınmıştır'}
                </h2>
                {data.basvuruNo ? (
                  <p className="success-no">
                    Başvuru no: <strong>{data.basvuruNo}</strong>
                  </p>
                ) : null}
                <p className="success-note no-print">
                  {wasUpdate
                    ? 'Güncel bilgileriniz kaydedildi. Değerlendirme sürecinde bu kayıt dikkate alınır.'
                    : 'Değerlendirme sonucunda sizinle iletişime geçilecektir.'}
                </p>
              </div>
              <div className="wizard-actions no-print" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn-ghost-dark" onClick={printSummary}>
                  Yazdır / PDF
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setError('')
                    setFromProfil(true)
                    setStep('profil')
                  }}
                >
                  Başvurumu gör
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function payloadFromData(data: BasvuruData) {
  return {
    ad: data.ad,
    soyad: data.soyad,
    dogumTarihi: data.dogumTarihi || null,
    dogumYeri: data.dogumYeri,
    medeniDurum: data.medeniDurum || null,
    eposta: data.eposta,
    yakinTelefon: data.yakinTelefon || null,
    yakinKim: data.yakinKim || null,
    il: data.il,
    ilce: data.ilce,
    acikAdres: data.acikAdres,
    statu: data.statu,
    kategori: data.kategori || null,
    talepTutari: data.talepTutari || null,
    talepOzeti: data.talepOzeti || null,
    babaAdi: data.babaAdi,
    babaSagMi: data.babaSagMi,
    babaMeslegi: data.babaMeslegi,
    babaAylikGelir: data.babaSagMi === 'Evet' ? data.babaAylikGelir : null,
    anneAdi: data.anneAdi,
    anneSagMi: data.anneSagMi,
    anneMeslegi: data.anneMeslegi,
    anneAylikGelir: data.anneSagMi === 'Evet' ? data.anneAylikGelir : null,
    anneBabaBirlikte: data.anneBabaBirlikte || null,
    birlikteYasadigiKisiler: data.birlikteYasadigiKisiler || null,
    esAylikGelir: data.medeniDurum === 'Evli' ? data.esAylikGelir : null,
    haneGeliri: data.haneGeliri || null,
    kardesIlkokul: data.kardesIlkokul,
    kardesYuksek: data.kardesYuksek,
    oturdugunuzEv: data.oturdugunuzEv,
    evKiraBedeli: data.oturdugunuzEv === 'Kira' ? data.evKiraBedeli : null,
    aracVarMi: data.aracVarMi,
    aracMarkaModel: data.aracVarMi === 'Evet' ? data.aracMarkaModel || null : null,
    aracYili: data.aracVarMi === 'Evet' ? data.aracYili || null : null,
    ozelDurumTipi: data.ozelDurumTipi,
    ozelDurum: data.ozelDurumTipi && data.ozelDurumTipi !== 'Yok' ? data.ozelDurum || null : null,
    universite: shownName(data.universite, data.universiteAdi),
    fakulte: shownName(data.fakulte, data.fakulteAdi),
    bolum: shownName(data.bolum, data.bolumAdi),
    kayitYili: data.kayitYili,
    sinif: data.sinif,
    bitirmeYili: data.bitirmeYili,
    hazirlik: data.hazirlik,
    ailedenUzakta: data.ailedenUzakta,
    konaklamaDurumu: data.konaklamaDurumu || null,
    konaklamaUcreti: data.konaklamaUcreti || null,
    yksSiralamasi: data.yksSiralamasi || null,
    notOrtalamasi: data.notOrtalamasi || null,
    baskaBurs: data.baskaBurs,
    baskaBursMiktari: data.baskaBurs === 'Evet' ? data.baskaBursMiktari : null,
    beyanCalismiyor: data.beyanCalismiyor,
    beyanDisiplin: data.beyanDisiplin,
    beyanAdliSicil: data.beyanAdliSicil,
    beyanOrgunOgretim: data.beyanOrgunOgretim,
  }
}
