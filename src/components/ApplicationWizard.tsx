import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, FORM_API_URL, SITE, STATUSES } from '../config'
import { formatMoneyInput, moneyDisplayWithCurrency } from '../money'
import {
  emptyBasvuru,
  ILLER,
  WIZARD_STEPS,
  type BasvuruData,
  type WizardStep,
} from '../basvuruTypes'
import { useKvkk } from './KvkkModal'

type ApiBasvuru = {
  id: string
  tcKimlikNoMasked: string
  telefonMasked: string
  ad?: string
  soyad?: string
  dogumTarihi?: string
  dogumYeri?: string
  eposta?: string
  yakinTelefon?: string
  il?: string
  ilce?: string
  statu?: string
  kategori?: string
  talepTutari?: string
  talepOzeti?: string
  beyanCalismiyor: boolean
  beyanAdliSicil: boolean
  beyanBilgiDogru: boolean
  durum: string
}

function mapApi(data: ApiBasvuru): BasvuruData {
  return {
    id: data.id,
    tcKimlikNoMasked: data.tcKimlikNoMasked,
    telefonMasked: data.telefonMasked,
    ad: data.ad ?? '',
    soyad: data.soyad ?? '',
    dogumTarihi: data.dogumTarihi ?? '',
    dogumYeri: data.dogumYeri ?? '',
    eposta: data.eposta ?? '',
    yakinTelefon: data.yakinTelefon ?? '',
    il: data.il ?? '',
    ilce: data.ilce ?? '',
    statu: data.statu ?? '',
    kategori: data.kategori ?? '',
    talepTutari: (data.talepTutari ?? '').replace(/\s*TL$/i, ''),
    talepOzeti: data.talepOzeti ?? '',
    beyanCalismiyor: data.beyanCalismiyor,
    beyanAdliSicil: data.beyanAdliSicil,
    beyanBilgiDogru: data.beyanBilgiDogru,
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

export function ApplicationWizard() {
  const { openKvkk } = useKvkk()
  const [step, setStep] = useState<WizardStep>('kvkk')
  const [kvkkOk, setKvkkOk] = useState(false)
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
  const [loading, setLoading] = useState(false)

  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [secondsLeft])

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

  async function sendKimlik() {
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${FORM_API_URL}/basvuru/kimlik`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tcKimlikNo: tc,
          telefon,
          kvkkOnay: kvkkOk,
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

  async function saveAndContinue() {
    setError('')
    if (!data.ad || !data.soyad || !data.eposta || !data.il || !data.ilce || !data.statu || !data.kategori || !data.talepTutari || !data.talepOzeti || !data.dogumTarihi || !data.dogumYeri) {
      setError('Tüm alanları eksiksiz doldurun.')
      return
    }
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
      setStep('onay')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  async function submitFinal() {
    setError('')
    if (!data.beyanCalismiyor || !data.beyanAdliSicil || !data.beyanBilgiDogru) {
      setError('Tüm koşul beyanları zorunludur.')
      return
    }
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

  return (
    <section className="section application wizard" id="basvuru">
      <div className="shell">
        <div className="wizard-banner">
          <strong>{SITE.shortName} — Destek Başvurusu</strong>
          <span>Kimliğiniz cep telefonunuza gönderilecek tek kullanımlık kod ile doğrulanır.</span>
        </div>

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

        <div className="wizard-card">
          {error ? <div className="form-alert is-error"><p>{error}</p></div> : null}

          {step === 'kvkk' && (
            <>
              <h2>Destek Başvurusu</h2>
              <p className="wizard-lead">
                Başvuru yaklaşık birkaç dakika sürer. Devam etmeden önce aydınlatma
                metnini okuyup onaylayın.
              </p>
              <div className="kvkk-scroll">
                <p>
                  6698 sayılı KVKK uyarınca kişisel verileriniz {SITE.name} tarafından
                  destek başvurusunun alınması ve değerlendirilmesi amacıyla işlenir.
                  Ayrıntılı metni okumak için aşağıdaki bağlantıyı kullanın.
                </p>
                <button type="button" className="linkish" onClick={openKvkk}>
                  KVKK aydınlatma metnini aç
                </button>
              </div>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={kvkkOk}
                  onChange={(e) => setKvkkOk(e.target.checked)}
                />
                <span>
                  Aydınlatma metnini okudum; kişisel verilerimin başvuru sürecinde
                  işlenmesini kabul ediyorum.
                </span>
              </label>
              <div className="wizard-actions">
                <button
                  type="button"
                  className="btn"
                  disabled={!kvkkOk}
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
                  setReturning(true)
                  setKvkkOk(true)
                  setStep('kimlik')
                }}
              >
                Daha önce başvurdunuz mu? Başvurumu görüntüle / düzenle
              </button>
            </>
          )}

          {step === 'kimlik' && (
            <>
              <h2>Kimlik Doğrulama</h2>
              <p className="wizard-lead">
                T.C. kimlik numaranızı ve size ait cep telefonunu girin. Telefonunuza
                6 haneli tek kullanımlık doğrulama kodu göndereceğiz.
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
                    required
                    placeholder="11 haneli"
                  />
                  <small className="field-hint">Sistemde şifreli tutulur; listelerde açık görünmez.</small>
                </label>
                <label className="full">
                  <span>Cep telefonu</span>
                  <input
                    value={telefon}
                    onChange={(e) => setTelefon(formatPhoneInput(e.target.value))}
                    inputMode="tel"
                    placeholder="05__ ___ __ __"
                    required
                  />
                  <small className="field-hint">Doğrulama kodu bu numaraya SMS ile gelir.</small>
                </label>
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('kvkk')}>
                  ← Geri
                </button>
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
              <p className="wizard-lead">
                {telefonMasked} numaralı telefona gönderilen 6 haneli kodu girin.
              </p>
              {debugOtp ? (
                <p className="debug-otp">Geliştirme OTP: <strong>{debugOtp}</strong></p>
              ) : null}
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
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('kimlik')}>
                  ← Geri
                </button>
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
              <p className="wizard-lead">Tüm alanları eksiksiz doldurun.</p>
              <h3 className="wizard-sub">1. Kimlik bilgileri</h3>
              <div className="form-grid">
                <label>
                  <span>T.C. kimlik no</span>
                  <input value={data.tcKimlikNoMasked ?? ''} readOnly />
                </label>
                <label>
                  <span>Adı</span>
                  <input
                    value={data.ad}
                    onChange={(e) => setData({ ...data, ad: e.target.value.replace(/[0-9]/g, '') })}
                    required
                  />
                </label>
                <label>
                  <span>Soyadı</span>
                  <input
                    value={data.soyad}
                    onChange={(e) => setData({ ...data, soyad: e.target.value.replace(/[0-9]/g, '') })}
                    required
                  />
                </label>
                <label>
                  <span>Doğum tarihi</span>
                  <input
                    type="date"
                    value={data.dogumTarihi}
                    onChange={(e) => setData({ ...data, dogumTarihi: e.target.value })}
                    required
                  />
                </label>
                <label className="full">
                  <span>Doğum yeri</span>
                  <input
                    value={data.dogumYeri}
                    onChange={(e) => setData({ ...data, dogumYeri: e.target.value })}
                    required
                  />
                </label>
              </div>
              <h3 className="wizard-sub">2. İletişim bilgileri</h3>
              <div className="form-grid">
                <label>
                  <span>Cep telefonu</span>
                  <input value={data.telefonMasked ?? ''} readOnly />
                </label>
                <label>
                  <span>E-posta</span>
                  <input
                    type="email"
                    value={data.eposta}
                    onChange={(e) => setData({ ...data, eposta: e.target.value })}
                    required
                  />
                </label>
                <label className="full">
                  <span>Yakınına ait telefon</span>
                  <input
                    value={data.yakinTelefon}
                    onChange={(e) => setData({ ...data, yakinTelefon: formatPhoneInput(e.target.value) })}
                    placeholder="05__ ___ __ __"
                  />
                  <small className="field-hint">
                    Bu numara yalnızca size ulaşılamadığında iletişim için kullanılır.
                  </small>
                </label>
                <label>
                  <span>İl</span>
                  <select
                    value={data.il}
                    onChange={(e) => setData({ ...data, il: e.target.value })}
                    required
                  >
                    <option value="">Seçiniz</option>
                    {ILLER.map((il) => (
                      <option key={il} value={il}>{il}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>İlçe</span>
                  <input
                    value={data.ilce}
                    onChange={(e) => setData({ ...data, ilce: e.target.value })}
                    required
                  />
                </label>
              </div>
              <h3 className="wizard-sub">3. Destek talebi</h3>
              <div className="form-grid">
                <label className="full">
                  <span>Başvuru sahibi statüsü</span>
                  <select
                    value={data.statu}
                    onChange={(e) => setData({ ...data, statu: e.target.value })}
                    required
                  >
                    <option value="">Seçiniz</option>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="full">
                  <span>Destek kategorisi</span>
                  <select
                    value={data.kategori}
                    onChange={(e) => setData({ ...data, kategori: e.target.value })}
                    required
                  >
                    <option value="">Seçiniz</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label>
                  <span>Talep tutarı</span>
                  <div className="money-field">
                    <input
                      value={data.talepTutari}
                      onChange={(e) =>
                        setData({ ...data, talepTutari: formatMoneyInput(e.target.value) })
                      }
                      required
                      placeholder="Örn. 15.000,00"
                    />
                    <span className="money-suffix">TL</span>
                  </div>
                </label>
                <label className="full">
                  <span>Talep özeti</span>
                  <textarea
                    rows={4}
                    value={data.talepOzeti}
                    onChange={(e) => setData({ ...data, talepOzeti: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('sms')}>
                  ← Geri
                </button>
                <button type="button" className="btn" disabled={loading} onClick={() => void saveAndContinue()}>
                  {loading ? 'Kaydediliyor…' : 'Özeti gör ve onayla →'}
                </button>
              </div>
            </>
          )}

          {step === 'onay' && (
            <>
              <h2>Özet ve Koşul Beyanları</h2>
              <div className="summary-box" id="basvuru-ozet">
                <p><strong>Ad Soyad:</strong> {data.ad} {data.soyad}</p>
                <p><strong>T.C.:</strong> {data.tcKimlikNoMasked}</p>
                <p><strong>Telefon:</strong> {data.telefonMasked}</p>
                <p><strong>E-posta:</strong> {data.eposta}</p>
                <p><strong>İl / İlçe:</strong> {data.il} / {data.ilce}</p>
                <p><strong>Statü:</strong> {data.statu}</p>
                <p><strong>Kategori:</strong> {data.kategori}</p>
                <p><strong>Talep tutarı:</strong> {moneyDisplayWithCurrency(data.talepTutari)}</p>
                <p><strong>Talep özeti:</strong> {data.talepOzeti}</p>
              </div>
              <h3 className="wizard-sub">Koşul beyanları</h3>
              <p className="wizard-lead">Aşağıdaki beyanların tamamı zorunludur.</p>
              <div className="beyan-list">
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanCalismiyor}
                    onChange={(e) => setData({ ...data, beyanCalismiyor: e.target.checked })}
                  />
                  <span>Destek talebimin gerçek bir ihtiyaca dayandığını beyan ederim.</span>
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanAdliSicil}
                    onChange={(e) => setData({ ...data, beyanAdliSicil: e.target.checked })}
                  />
                  <span>Adli sicil kaydım yoktur.</span>
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={data.beyanBilgiDogru}
                    onChange={(e) => setData({ ...data, beyanBilgiDogru: e.target.checked })}
                  />
                  <span>
                    Verdiğim bilgilerin doğru ve güncel olduğunu; destek uygun görüldüğünde
                    talep edilen belgeleri sunacağımı ve belgelenemeyen beyanların başvurunun
                    iptaline yol açabileceğini kabul ederim.
                  </span>
                </label>
              </div>
              <div className="wizard-actions space-between">
                <button type="button" className="btn btn-ghost-dark" onClick={() => setStep('bilgiler')}>
                  ← Geri
                </button>
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
                Talebiniz kaydedildi{data.durum ? ` (durum: ${data.durum})` : ''}.
                Değerlendirme sonucunda sizinle iletişime geçilecektir.
              </p>
              <div className="summary-box">
                <p><strong>Ad Soyad:</strong> {data.ad} {data.soyad}</p>
                <p><strong>T.C.:</strong> {data.tcKimlikNoMasked}</p>
                <p><strong>Kategori:</strong> {data.kategori}</p>
                <p><strong>Talep tutarı:</strong> {moneyDisplayWithCurrency(data.talepTutari)}</p>
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
    statu: data.statu,
    kategori: data.kategori,
    talepTutari: moneyDisplayWithCurrency(data.talepTutari),
    talepOzeti: data.talepOzeti,
    beyanCalismiyor: data.beyanCalismiyor,
    beyanAdliSicil: data.beyanAdliSicil,
    beyanBilgiDogru: data.beyanBilgiDogru,
  }
}
