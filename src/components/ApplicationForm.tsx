import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  APPLICATION_EMAIL,
  CATEGORIES,
  FORM_API_URL,
  STATUSES,
} from '../config'
import { formatMoneyInput, moneyDisplayWithCurrency } from '../money'
import { useKvkk } from './KvkkModal'

type Status = 'idle' | 'loading' | 'success' | 'error'

type CaptchaState = {
  id: string
  code: string
}

export function ApplicationForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [captcha, setCaptcha] = useState<CaptchaState | null>(null)
  const [captchaInput, setCaptchaInput] = useState('')
  const [talepTutari, setTalepTutari] = useState('')
  const { accepted, openKvkk, clearAccepted } = useKvkk()

  const loadCaptcha = useCallback(async () => {
    try {
      const response = await fetch(`${FORM_API_URL}/captcha`)
      if (!response.ok) throw new Error('captcha')
      const data = (await response.json()) as CaptchaState
      setCaptcha(data)
      setCaptchaInput('')
    } catch {
      setCaptcha(null)
      setMessage(
        'Doğrulama kodu yüklenemedi. API’nin çalıştığından emin olun (npm run dev:api).',
      )
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void loadCaptcha()
  }, [loadCaptcha])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!accepted) {
      setStatus('error')
      setMessage(
        'Devam etmek için KVKK aydınlatma metnini sonuna kadar okuyup onaylayın.',
      )
      openKvkk()
      return
    }

    if (!captcha) {
      setStatus('error')
      setMessage('Doğrulama kodu hazır değil. Sayfayı yenileyip tekrar deneyin.')
      return
    }

    if (!talepTutari.trim()) {
      setStatus('error')
      setMessage('Talep tutarı zorunludur.')
      return
    }

    const raw = new FormData(form)
    const payload = {
      adSoyad: String(raw.get('adSoyad') ?? '').trim(),
      telefon: String(raw.get('telefon') ?? '').trim(),
      eposta: String(raw.get('eposta') ?? '').trim(),
      talepTutari: moneyDisplayWithCurrency(talepTutari),
      statu: String(raw.get('statu') ?? '').trim(),
      kategori: String(raw.get('kategori') ?? '').trim(),
      talepOzeti: String(raw.get('talepOzeti') ?? '').trim(),
      kvkkOnay: true,
      captchaId: captcha.id,
      captchaAnswer: captchaInput.trim(),
      website: String(raw.get('website') ?? ''),
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(`${FORM_API_URL}/applications`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = (await response.json().catch(() => null)) as {
        success?: boolean
        message?: string
      } | null

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Gönderim başarısız')
      }

      setStatus('success')
      setMessage('Başvurunuz alındı. Teşekkür ederiz.')
      form.reset()
      setTalepTutari('')
      clearAccepted()
      await loadCaptcha()
      requestAnimationFrame(() => {
        document.getElementById('basvuru-sonuc')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      })
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof Error
          ? error.message
          : `Gönderim tamamlanamadı. ${APPLICATION_EMAIL} adresine yazabilirsiniz.`,
      )
      await loadCaptcha()
    }
  }

  return (
    <section className="section application" id="basvuru">
      <div className="shell application-layout">
        <div className="section-intro reveal">
          <p className="eyebrow">Başvuru</p>
          <h2>Destek talebinizi iletin</h2>
          <p>
            Formu doldurduğunuzda başvurunuz e-posta olarak{' '}
            <strong>{APPLICATION_EMAIL}</strong> adresine iletilir. Kişisel
            verileriniz yalnızca başvuru sürecinde kullanılır.
          </p>
        </div>

        <form className="app-form reveal" onSubmit={onSubmit} autoComplete="on">
          {message ? (
            <div
              id="basvuru-sonuc"
              className={`form-alert is-${status}`}
              role="status"
              aria-live="polite"
            >
              <strong>
                {status === 'success'
                  ? 'Başvurunuz alındı'
                  : status === 'error'
                    ? 'Gönderilemedi'
                    : ''}
              </strong>
              <p>{message}</p>
            </div>
          ) : null}

          <input
            className="honey"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <div className="form-grid">
            <label>
              <span>Ad soyad</span>
              <input name="adSoyad" type="text" required autoComplete="name" />
            </label>
            <label>
              <span>Telefon</span>
              <input name="telefon" type="tel" required autoComplete="tel" />
            </label>
            <label>
              <span>E-posta</span>
              <input name="eposta" type="email" required autoComplete="email" />
            </label>
            <label>
              <span>Talep tutarı</span>
              <div className="money-field">
                <input
                  name="talepTutari"
                  type="text"
                  inputMode="decimal"
                  required
                  value={talepTutari}
                  onChange={(event) =>
                    setTalepTutari(formatMoneyInput(event.target.value))
                  }
                  placeholder="Örn. 15.000,00"
                  autoComplete="off"
                />
                <span className="money-suffix" aria-hidden="true">
                  TL
                </span>
              </div>
            </label>
            <label className="full">
              <span>Başvuru sahibi statüsü</span>
              <select name="statu" required defaultValue="">
                <option value="" disabled>
                  Seçiniz
                </option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              <span>Destek talep kategorisi</span>
              <select name="kategori" required defaultValue="">
                <option value="" disabled>
                  Seçiniz
                </option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              <span>Talep özeti</span>
              <textarea
                name="talepOzeti"
                rows={5}
                required
                placeholder="İhtiyacınızı ve varsa belge durumunuzu kısaca yazın."
              />
            </label>
            <div className="full captcha-block">
              <span className="captcha-label">Doğrulama kodu</span>
              <div className="captcha-row">
                <code className="captcha-code" aria-live="polite">
                  {captcha?.code ?? '······'}
                </code>
                <button
                  type="button"
                  className="btn btn-ghost-dark captcha-refresh"
                  onClick={() => void loadCaptcha()}
                  disabled={!captcha || status === 'loading'}
                >
                  Yenile
                </button>
              </div>
              <label className="captcha-field">
                <span>Yukarıdaki kodu yazın</span>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(event) =>
                    setCaptchaInput(event.target.value.toUpperCase())
                  }
                  placeholder="Kodu buraya yazın"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={!captcha}
                  maxLength={12}
                />
              </label>
            </div>
          </div>

          <label className="consent">
            <input
              type="checkbox"
              name="kvkk_onay_ui"
              checked={accepted}
              readOnly
              onClick={(event) => {
                event.preventDefault()
                openKvkk()
              }}
              aria-checked={accepted}
            />
            <span>
              <button type="button" className="linkish" onClick={openKvkk}>
                KVKK aydınlatma metnini
              </button>{' '}
              okudum; kişisel verilerimin destek başvurusunun değerlendirilmesi
              amacıyla işlenmesini kabul ediyorum.
              {!accepted ? (
                <em className="consent-hint"> Metni açıp sonuna kadar okuyun.</em>
              ) : null}
            </span>
          </label>

          <div className="form-footer">
            <button className="btn" type="submit" disabled={status === 'loading' || !captcha}>
              {status === 'loading' ? 'Gönderiliyor…' : 'Başvuruyu gönder'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
