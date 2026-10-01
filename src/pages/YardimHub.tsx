import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FORM_API_URL, SITE } from '../config'

export function YardimHub() {
  const [yardimAcik, setYardimAcik] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/basvuru/donem`)
        const json = await res.json().catch(() => ({}))
        if (cancelled || !res.ok) return
        setYardimAcik(json.yardimAcik !== false)
      } catch {
        // ignore
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Yardım / destek başvurusu</h1>
        <hr className="basvuru-rule" />
      </header>

      {yardimAcik === false ? (
        <p className="basvuru-org">Yardım başvuruları şu an kapalıdır.</p>
      ) : yardimAcik === true ? (
        <p className="basvuru-org">Yardım başvuruları açıktır.</p>
      ) : null}

      <p>
        {SITE.name}; eğitim, sağlık, spor ve toplumsal dayanışma alanlarında ihtiyaç
        sahiplerinin destek taleplerini değerlendirir. Başvuru süreci kimlik doğrulama,
        SMS onayı ve iletişim bilgileriyle ilerler; ardından destek talebinizi
        (kategori, tutar, özet) paylaşırsınız.
      </p>

      <div className="basvuru-actions">
        {yardimAcik !== false ? (
          <Link className="btn" to="/yardim/form">
            Yardım başvurusu için tıklayınız
          </Link>
        ) : null}
      </div>
    </article>
  )
}
