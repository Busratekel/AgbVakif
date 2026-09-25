import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FORM_API_URL, SITE } from '../config'

type PopupData = {
  aktif: boolean
  baslik: string
  metin: string
  donemMetni: string
}

const SESSION_KEY = 'agb-popup-dismissed'

export function AnnouncementPopup() {
  const [data, setData] = useState<PopupData | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (sessionStorage.getItem(SESSION_KEY) === '1') return
        const res = await fetch(`${FORM_API_URL}/basvuru/donem`)
        const json = await res.json()
        if (!res.ok || !json.success || cancelled) return

        const aktif = json.popupAktif !== false && String(json.popupAktif ?? '1') !== '0'
        const payload: PopupData = {
          aktif,
          baslik: json.popupBaslik || json.baslik || '',
          metin: json.popupMetin || json.baslikNot || '',
          donemMetni: json.donemMetni || '',
        }
        if (!aktif || (!payload.baslik && !payload.metin && !payload.donemMetni)) return
        setData(payload)
        setOpen(true)
      } catch {
        // sessiz
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function close() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setOpen(false)
  }

  if (!open || !data) return null

  return (
    <div className="announce-overlay" role="dialog" aria-modal="true" aria-labelledby="announce-title">
      <div className="announce-modal">
        <button type="button" className="announce-close" onClick={close} aria-label="Kapat">
          ×
        </button>
        <div className="announce-board">
          <p className="announce-brand">{SITE.shortName}</p>
          {data.baslik ? (
            <h2 id="announce-title" className="announce-title">
              {data.baslik}
            </h2>
          ) : null}
          {data.metin ? <p className="announce-text">{data.metin}</p> : null}
          {data.donemMetni ? <p className="announce-period">{data.donemMetni}</p> : null}
          <Link className="announce-cta btn" to="/basvuru/form" onClick={close}>
            Başvuruya git
          </Link>
        </div>
      </div>
    </div>
  )
}
