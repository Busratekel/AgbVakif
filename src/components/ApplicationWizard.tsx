import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, FORM_API_URL, SITE, STATUSES } from '../config'
import { formatMoneyInput } from '../money'
import { ILLER, ilcelerOf } from '../data/turkiye'
import { bolumlerOf, fakultelerOf, UNIVERSITE_AGACI } from '../data/universiteTree'
import {
  emptyBasvuru,
  EV_DURUMU,
  EVET_HAYIR,
  isAraSinif,
  isYeniOgrenci,
  KARDEŞ_SAYILARI,
  KONAKLAMA,
  OZEL_DURUM_TIPLERI,
  SAG_MI,
  SINIFLAR,
  WIZARD_STEPS,
  YILLAR,
  YKS_DILIMLERI,
  type BasvuruData,
  type WizardStep,
} from '../basvuruTypes'
import { KvkkContent } from './KvkkContent'

type ApiBasvuru = Record<string, unknown> & {
  id: string
  tcKimlikNoMasked: string
  telefonMasked: string
  durum: string
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
    tcKimlikNoMasked: data.tcKimlikNoMasked,
    telefonMasked: data.telefonMasked,
    ad: str(data.ad),
    soyad: str(data.soyad),
    dogumTarihi: str(data.dogumTarihi),
    dogumYeri: str(data.dogumYeri),
    eposta: str(data.eposta),
    yakinTelefon: str(data.yakinTelefon),
    il: str(data.il),
    ilce: str(data.ilce),
    acikAdres: str(data.acikAdres),
    statu: str(data.statu),
    kategori: str(data.kategori),
    babaAdi: str(data.babaAdi),
    babaSagMi: str(data.babaSagMi),
    babaMeslegi: str(data.babaMeslegi),
    babaAylikGelir: str(data.babaAylikGelir),
    anneAdi: str(data.anneAdi),
    anneSagMi: str(data.anneSagMi),
    anneMeslegi: str(data.anneMeslegi),
    anneAylikGelir: str(data.anneAylikGelir),
    anneBabaBirlikte: str(data.anneBabaBirlikte),
    kardesIlkokul: str(data.kardesIlkokul) || '0',
    kardesYuksek: str(data.kardesYuksek) || '0',
    oturdugunuzEv: str(data.oturdugunuzEv),
    aracVarMi: str(data.aracVarMi),
    aracMarkaModel: str(data.aracMarkaModel),
    ozelDurumTipi: str(data.ozelDurumTipi),
    ozelDurum: str(data.ozelDurum),
    universite: str(data.universite),
    fakulte: str(data.fakulte),
    bolum: str(data.bolum),
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
    beyanCalismiyor: bool(data.beyanCalismiyor),
    beyanEvliDegil: bool(data.beyanEvliDegil),
    beyanDisiplin: bool(data.beyanDisiplin),
    beyanAdliSicil: bool(data.beyanAdliSicil),
    beyanOrgunOgretim: bool(data.beyanOrgunOgretim),
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

export function ApplicationWizard() {
  const [step, setStep] = useState<WizardStep>('kvkk')
  const [kvkkOk, setKvkkOk] = useState(false)
  const [kvkkReadToEnd, setKvkkReadToEnd] = useState(false)
  const kvkkScrollRef = useRef<HTMLDivElement>(null)
  const [donem, setDonem] = useState({
    baslik: '2026–2027 Lisans Başvurusu',
    baslikNot: '',
    formBaslik: 'Lisans Burs Başvurusu Formu',
    formBaslikNot:
      'Başvuru yaklaşık 10 dakika sürer. Devam etmek için aydınlatma metnini sonuna kadar okuyup onaylamanız gerekir. Kimliğiniz, cep telefonunuza gönderilecek tek kullanımlık kod ile doğrulanır.',
    donemMetni: 'Başvuru dönemi yükleniyor…',
    acik: true,
  })
  const [returning, setReturning] = useState(false)
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

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step)
  const ilceList = useMemo(() => ilcelerOf(data.il), [data.il])
  const fakulteList = useMemo(() => fakultelerOf(data.universite), [data.universite])
  const bolumList = useMemo(() => bolumlerOf(data.universite, data.fakulte), [data.universite, data.fakulte])
  const universiteList = useMemo(() => Object.keys(UNIVERSITE_AGACI), [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/basvuru/donem`)
        const json = await res.json()
        if (!cancelled && res.ok && json.success) {
          setDonem({
            baslik: json.baslik,
            baslikNot: json.baslikNot ?? '',
            formBaslik: json.formBaslik,
            formBaslikNot: json.formBaslikNot ?? '',
            donemMetni: json.donemMetni,
            acik: Boolean(json.acik),
          })
        }
      } catch {
        /* varsayılan metinler kalır */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

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
    } finally {
      setLoading(false)
    }
  }

  async function sendKimlik() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/kimlik`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ tcKimlikNo: tc, telefon, kvkkOnay: kvkkOk }),
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
      if (me.ok && meJson.success) {
        setData(mapApi(meJson.data as ApiBasvuru))
      }
      setStep('bilgiler')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  function showFieldErrors(entries: { key: string; message: string }[]) {
    setError('')
    setFieldErrors(Object.fromEntries(entries.map((e) => [e.key, e.message])))
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('label.is-invalid, .beyan-list.is-invalid')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
    if (!data.dogumTarihi) missing.push({ key: 'dogumTarihi', message: req })
    if (!data.dogumYeri) missing.push({ key: 'dogumYeri', message: req })
    if (!data.eposta.trim()) missing.push({ key: 'eposta', message: req })
    if (!data.yakinTelefon.trim() || onlyDigits(data.yakinTelefon, 11).length < 11) {
      missing.push({ key: 'yakinTelefon', message: 'Geçerli bir telefon girin (05xx …)' })
    }
    if (!data.il) missing.push({ key: 'il', message: req })
    if (!data.ilce) missing.push({ key: 'ilce', message: req })
    if (!data.acikAdres.trim()) missing.push({ key: 'acikAdres', message: req })
    if (!data.statu) missing.push({ key: 'statu', message: req })
    if (!data.kategori) missing.push({ key: 'kategori', message: req })
    return missing
  }

  function validateDetay() {
    const missing: { key: string; message: string }[] = []
    const req = 'Bu alan zorunludur'
    if (!data.babaAdi.trim()) missing.push({ key: 'babaAdi', message: req })
    if (!data.babaSagMi) missing.push({ key: 'babaSagMi', message: req })
    if (!data.babaMeslegi.trim()) missing.push({ key: 'babaMeslegi', message: req })
    if (data.babaAylikGelir === '') missing.push({ key: 'babaAylikGelir', message: req })
    if (!data.anneAdi.trim()) missing.push({ key: 'anneAdi', message: req })
    if (!data.anneSagMi) missing.push({ key: 'anneSagMi', message: req })
    if (!data.anneMeslegi.trim()) missing.push({ key: 'anneMeslegi', message: req })
    if (data.anneAylikGelir === '') missing.push({ key: 'anneAylikGelir', message: req })
    if (!data.anneBabaBirlikte) missing.push({ key: 'anneBabaBirlikte', message: req })
    if (!data.oturdugunuzEv) missing.push({ key: 'oturdugunuzEv', message: req })
    if (!data.aracVarMi) missing.push({ key: 'aracVarMi', message: req })
    if (data.aracVarMi === 'Evet' && !data.aracMarkaModel.trim()) {
      missing.push({ key: 'aracMarkaModel', message: req })
    }
    if (!data.ozelDurumTipi) missing.push({ key: 'ozelDurumTipi', message: req })
    if (!data.universite) missing.push({ key: 'universite', message: req })
    if (!data.fakulte) missing.push({ key: 'fakulte', message: req })
    if (!data.bolum) missing.push({ key: 'bolum', message: req })
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
    await persist('detay')
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
    if (!data.beyanCalismiyor || !data.beyanEvliDegil || !data.beyanDisiplin
      || !data.beyanAdliSicil || !data.beyanOrgunOgretim) {
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
      setStep('sonuc')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  function printSummary() {
    window.print()
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
        <ol className="wizard-steps">
          {WIZARD_STEPS.map((item, index) => {
            const done = index < stepIndex
            const current = index === stepIndex
            return (
              <li key={item.id} className={done ? 'is-done' : current ? 'is-current' : ''}>
                <span className="wizard-dot">{done ? '✓' : index + 1}</span>
                <span className="wizard-label">{item.label}</span>
              </li>
            )
          })}
        </ol>

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
          {!donem.acik && step === 'kvkk' ? (
            <div className="form-alert is-error">
              <p>Başvuru dönemi şu an kapalıdır. Tarihler üst bantta yer almaktadır.</p>
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
                  disabled={!kvkkOk || !donem.acik}
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
                  if (!donem.acik) {
                    setError('Başvuru dönemi kapalı; mevcut başvuru görüntüleme için dönem açık olmalıdır.')
                    return
                  }
                  setReturning(true)
                  setKvkkOk(true)
                  setKvkkReadToEnd(true)
                  setStep('kimlik')
                }}
              >
                Daha önce başvurdunuz mu? Başvurumu görüntüle / düzenle / geri çek
              </button>
            </>
          )}

          {step === 'kimlik' && (
            <>
              <h2>Kimlik Doğrulama</h2>
              <p className="wizard-lead">
                T.C. kimlik numaranızı ve cep telefonunuzu girin.
                {returning ? ' Mevcut başvurunuz varsa bilgiler getirilecektir.' : ''}
              </p>
              <div className="form-grid">
                <label className="full">
                  <span>T.C. kimlik no</span>
                  <input
                    value={tc}
                    onChange={(e) => setTc(onlyDigits(e.target.value, 11))}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="11 haneli"
                  />
                  <small className="field-hint">11 karakter olmalıdır; sistemde şifreli tutulur.</small>
                </label>
                <label className="full">
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
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('kvkk')}>← Geri</button>
                <button
                  type="button"
                  className="btn"
                  disabled={loading || tc.length !== 11 || onlyDigits(telefon, 11).length < 11}
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
              <p className="wizard-lead">Lütfen tüm alanları eksiksiz doldurun.Burs verilmesi uygun görüldüğünde beyanlarınızı kanıtlayan belgeler istenecektir; belgelenemeyen beyan bursun iptaline yol açar.</p>

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
                  <span>Doğum tarihi<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('dogumTarihi')}
                  <input type="date" value={data.dogumTarihi} onChange={(e) => update({ dogumTarihi: e.target.value })} />
                </label>
                <label className={isInvalid('dogumYeri')}>
                  <span>Doğum yeri<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('dogumYeri')}
                  <select value={data.dogumYeri} onChange={(e) => update({ dogumYeri: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {ILLER.map((il) => <option key={il} value={il}>{il}</option>)}
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
                <label className={`full ${isInvalid('yakinTelefon')}`}>
                  <span>Yakınına ait telefon<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('yakinTelefon')}
                  <input
                    value={data.yakinTelefon}
                    onChange={(e) => update({ yakinTelefon: formatPhoneInput(e.target.value) })}
                    placeholder="05__ ___ __ __"
                  />
                  <small className="field-hint">Size ulaşılamadığında iletişim için kullanılır.</small>
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

              <h3 className="wizard-sub">3. Destek talebi</h3>
              <div className="form-grid">
                <label className={`full ${isInvalid('statu')}`}>
                  <span>Başvuru sahibi statüsü<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('statu')}
                  <select value={data.statu} onChange={(e) => update({ statu: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className={`full ${isInvalid('kategori')}`}>
                  <span>Destek kategorisi<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('kategori')}
                  <select value={data.kategori} onChange={(e) => update({ kategori: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
              </div>

              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('sms')}>← Geri</button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goBilgilerNext()}>
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
                  <select value={data.babaSagMi} onChange={(e) => update({ babaSagMi: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {SAG_MI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('babaMeslegi')}>
                  <span>Baba mesleği<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('babaMeslegi')}
                  <input value={data.babaMeslegi} onChange={(e) => update({ babaMeslegi: e.target.value })} />
                </label>
                <label className={isInvalid('babaAylikGelir')}>
                  <span>Baba aylık net geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('babaAylikGelir')}
                  <input
                    value={data.babaAylikGelir}
                    onChange={(e) => update({ babaAylikGelir: formatMoneyInput(e.target.value) })}
                    placeholder="örn. 22.000"
                  />
                  <small className="field-hint">Geliri yoksa 0 yazınız.</small>
                </label>
                <label className={isInvalid('anneAdi')}>
                  <span>Anne adı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneAdi')}
                  <input value={data.anneAdi} onChange={(e) => update({ anneAdi: lettersOnly(e.target.value) })} />
                </label>
                <label className={isInvalid('anneSagMi')}>
                  <span>Anne sağ mı?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneSagMi')}
                  <select value={data.anneSagMi} onChange={(e) => update({ anneSagMi: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {SAG_MI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('anneMeslegi')}>
                  <span>Anne mesleği<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneMeslegi')}
                  <input value={data.anneMeslegi} onChange={(e) => update({ anneMeslegi: e.target.value })} />
                </label>
                <label className={isInvalid('anneAylikGelir')}>
                  <span>Anne aylık net geliri (₺)<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneAylikGelir')}
                  <input
                    value={data.anneAylikGelir}
                    onChange={(e) => update({ anneAylikGelir: formatMoneyInput(e.target.value) })}
                    placeholder="örn. 0"
                  />
                </label>
                <label className={isInvalid('anneBabaBirlikte')}>
                  <span>Anne-baba birlikte mi?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('anneBabaBirlikte')}
                  <select value={data.anneBabaBirlikte} onChange={(e) => update({ anneBabaBirlikte: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
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
                  <select value={data.oturdugunuzEv} onChange={(e) => update({ oturdugunuzEv: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {EV_DURUMU.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('aracVarMi')}>
                  <span>Ailede araç var mı?<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('aracVarMi')}
                  <select
                    value={data.aracVarMi}
                    onChange={(e) =>
                      update({
                        aracVarMi: e.target.value,
                        aracMarkaModel: e.target.value === 'Evet' ? data.aracMarkaModel : '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                {data.aracVarMi === 'Evet' ? (
                  <label className={`full ${isInvalid('aracMarkaModel')}`}>
                    <span>Araç marka / model<abbr className="req" title="Zorunlu">*</abbr></span>
                    {fieldError('aracMarkaModel')}
                    <input
                      value={data.aracMarkaModel}
                      onChange={(e) => update({ aracMarkaModel: e.target.value })}
                      placeholder="örn. Renault Clio"
                    />
                  </label>
                ) : null}
                <label className={`full ${isInvalid('ozelDurumTipi')}`}>
                  <span>Özel durum<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('ozelDurumTipi')}
                  <select
                    value={data.ozelDurumTipi}
                    onChange={(e) => update({ ozelDurumTipi: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    {OZEL_DURUM_TIPLERI.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className="full">
                  <span>Özel durum açıklaması (isteğe bağlı)</span>
                  <textarea
                    rows={3}
                    value={data.ozelDurum}
                    onChange={(e) => update({ ozelDurum: e.target.value })}
                    placeholder="İsterseniz kısa açıklama yazabilirsiniz."
                  />
                </label>
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
                        fakulte: '',
                        bolum: '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {universiteList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('fakulte')}>
                  <span>Fakülte<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('fakulte')}
                  <select
                    value={data.fakulte}
                    disabled={!data.universite}
                    onChange={(e) =>
                      update({
                        fakulte: e.target.value,
                        bolum: '',
                      })
                    }
                  >
                    <option value="">Seçiniz</option>
                    {fakulteList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={`full ${isInvalid('bolum')}`}>
                  <span>Bölüm<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('bolum')}
                  <select
                    value={data.bolum}
                    disabled={!data.fakulte}
                    onChange={(e) => update({ bolum: e.target.value })}
                  >
                    <option value="">Seçiniz</option>
                    {bolumList.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </label>
                <label className={isInvalid('kayitYili')}>
                  <span>Üniversiteye kayıt yılı<abbr className="req" title="Zorunlu">*</abbr></span>
                  {fieldError('kayitYili')}
                  <select value={data.kayitYili} onChange={(e) => update({ kayitYili: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {YILLAR.map((y) => <option key={y} value={y}>{y}</option>)}
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
                    {YILLAR.map((y) => <option key={y} value={y}>{y}</option>)}
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
                  <select value={data.baskaBurs} onChange={(e) => update({ baskaBurs: e.target.value })}>
                    <option value="">Seçiniz</option>
                    {EVET_HAYIR.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <small className="field-hint">KYK öğrenim kredisi burs sayılmaz.</small>
                </label>
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
              <h2>6. Koşul Beyanları</h2>
              <p className="wizard-lead">Burs / destek koşulları gereği aşağıdaki beyanların tamamı zorunludur.</p>
              <div className={`beyan-list ${isInvalid('beyanlar')}`}>
                {fieldError('beyanlar')}
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanCalismiyor}
                    onChange={(e) => update({ beyanCalismiyor: e.target.checked })}
                  />
                  <span>Kazanç getiren herhangi bir işte çalışmıyorum.</span>
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanEvliDegil}
                    onChange={(e) => update({ beyanEvliDegil: e.target.checked })}
                  />
                  <span>Evli değilim.</span>
                </label>
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
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanAdliSicil}
                    onChange={(e) => update({ beyanAdliSicil: e.target.checked })}
                  />
                  <span>Adli sicil kaydım yok.</span>
                </label>
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
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('detay')}>← Geri</button>
                <button type="button" className="btn" disabled={loading} onClick={() => void goBeyanlarNext()}>
                  {loading ? 'Kaydediliyor…' : 'Özeti gör ve onayla →'}
                </button>
              </div>
            </>
          )}

          {step === 'ozet' && (
            <>
              <h2 className="no-print">Başvuru Özeti</h2>
              <div className="summary-box" id="basvuru-ozet">
                <header className="summary-print-head">
                  <strong>Anadolu Güçbirliği Vakfı</strong>
                  <span>Burs / Destek Başvuru Özeti</span>
                </header>
                <dl className="summary-grid">
                  <div><dt>Ad Soyad</dt><dd>{data.ad} {data.soyad}</dd></div>
                  <div><dt>T.C. Kimlik No</dt><dd>{data.tcKimlikNoMasked}</dd></div>
                  <div><dt>Doğum</dt><dd>{data.dogumTarihi} / {data.dogumYeri}</dd></div>
                  <div><dt>Telefon</dt><dd>{data.telefonMasked}</dd></div>
                  <div><dt>E-posta</dt><dd>{data.eposta}</dd></div>
                  <div className="full"><dt>Adres</dt><dd>{data.il} / {data.ilce} — {data.acikAdres}</dd></div>
                  <div><dt>Statü</dt><dd>{data.statu}</dd></div>
                  <div><dt>Kategori</dt><dd>{data.kategori}</dd></div>
                  <div className="full"><dt>Üniversite</dt><dd>{data.universite} — {data.fakulte} / {data.bolum}</dd></div>
                  <div><dt>Sınıf / Kayıt</dt><dd>{data.sinif} · kayıt {data.kayitYili}</dd></div>
                  <div><dt>Bitirme yılı</dt><dd>{data.bitirmeYili}</dd></div>
                  {data.yksSiralamasi ? <div><dt>YKS</dt><dd>{data.yksSiralamasi}</dd></div> : null}
                  {data.notOrtalamasi ? <div><dt>Not ortalaması</dt><dd>{data.notOrtalamasi}</dd></div> : null}
                  <div><dt>Başka burs</dt><dd>{data.baskaBurs}</dd></div>
                  <div><dt>Baba geliri</dt><dd>{data.babaAylikGelir || '0'} ₺</dd></div>
                  <div><dt>Anne geliri</dt><dd>{data.anneAylikGelir || '0'} ₺</dd></div>
                  <div><dt>Ailede araç var mı?</dt><dd>{data.aracVarMi === 'Evet' ? (data.aracMarkaModel || 'Var') : (data.aracVarMi || '—')}</dd></div>
                  {data.ailedenUzakta === 'Evet' ? (
                    <div className="full"><dt>Konaklama</dt><dd>{data.konaklamaDurumu} · {data.konaklamaUcreti} ₺</dd></div>
                  ) : null}
                  <div><dt>Özel durum</dt><dd>{data.ozelDurumTipi || '—'}</dd></div>
                </dl>
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('beyanlar')}>← Geri</button>
                <div className="wizard-actions-right">
                  <button type="button" className="btn btn-ghost-dark" onClick={printSummary}>
                    Özeti PDF / yazdır
                  </button>
                  <button type="button" className="btn" disabled={loading} onClick={() => void submitFinal()}>
                    {loading ? 'Gönderiliyor…' : 'Başvuruyu gönder'}
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'sonuc' && (
            <>
              <h2>Başvurunuz alındı</h2>
              <p className="wizard-lead">
                Talebiniz kaydedildi.
                Değerlendirme sonucunda sizinle iletişime geçilecektir.
              </p>
              <div className="summary-box">
                <header className="summary-print-head">
                  <strong>Anadolu Güçbirliği Vakfı</strong>
                  <span>Burs / Destek Başvuru Özeti</span>
                </header>
                <dl className="summary-grid">
                  <div><dt>Ad Soyad</dt><dd>{data.ad} {data.soyad}</dd></div>
                  <div><dt>T.C. Kimlik No</dt><dd>{data.tcKimlikNoMasked}</dd></div>
                  <div><dt>Kategori</dt><dd>{data.kategori}</dd></div>
                  <div><dt>Üniversite</dt><dd>{data.universite}</dd></div>
                </dl>
              </div>
              <div className="wizard-actions">
                <button type="button" className="btn btn-ghost-dark" onClick={printSummary}>
                  Özeti yazdır / PDF
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setStep('kvkk')
                    setKvkkOk(false)
                    setAccessToken('')
                    setData(emptyBasvuru())
                    setTc('')
                    setTelefon('')
                  }}
                >
                  Yeni başvuru
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
    eposta: data.eposta,
    yakinTelefon: data.yakinTelefon || null,
    il: data.il,
    ilce: data.ilce,
    acikAdres: data.acikAdres,
    statu: data.statu,
    kategori: data.kategori,
    babaAdi: data.babaAdi,
    babaSagMi: data.babaSagMi,
    babaMeslegi: data.babaMeslegi,
    babaAylikGelir: data.babaAylikGelir,
    anneAdi: data.anneAdi,
    anneSagMi: data.anneSagMi,
    anneMeslegi: data.anneMeslegi,
    anneAylikGelir: data.anneAylikGelir,
    anneBabaBirlikte: data.anneBabaBirlikte,
    kardesIlkokul: data.kardesIlkokul,
    kardesYuksek: data.kardesYuksek,
    oturdugunuzEv: data.oturdugunuzEv,
    aracVarMi: data.aracVarMi,
    aracMarkaModel: data.aracMarkaModel || null,
    ozelDurumTipi: data.ozelDurumTipi,
    ozelDurum: data.ozelDurum || null,
    universite: data.universite,
    fakulte: data.fakulte,
    bolum: data.bolum,
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
    beyanCalismiyor: data.beyanCalismiyor,
    beyanEvliDegil: data.beyanEvliDegil,
    beyanDisiplin: data.beyanDisiplin,
    beyanAdliSicil: data.beyanAdliSicil,
    beyanOrgunOgretim: data.beyanOrgunOgretim,
  }
}
