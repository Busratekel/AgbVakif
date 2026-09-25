import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BASVURU_KOSULLAR, FORM_API_URL, SITE } from '../config'

type DonemInfo = {
  acik: boolean
  baslik: string
  baslikNot: string
  donemMetni: string
}

export function BasvuruHub() {
  const [donem, setDonem] = useState<DonemInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/basvuru/donem`)
        const json = await res.json().catch(() => ({}))
        if (cancelled || !res.ok) return
        setDonem({
          acik: Boolean(json.acik),
          baslik: json.baslik || 'Başvuru dönemi',
          baslikNot: json.baslikNot || '',
          donemMetni: json.donemMetni || '',
        })
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
        <h1>Genel bilgilendirme</h1>
        <hr className="basvuru-rule" />
      </header>

      <p>
        {SITE.name}; maddi imkânları kısıtlı, başarılı önlisans ve lisans
        öğrencilerine burs vermektedir. Yüksek lisans ve doktora öğrencileri bu
        burs kapsamı dışındadır.
      </p>
      <p>
        Belirtilen tarihler arasında burs başvuru formu üzerinden başvurular
        alınır. Ön değerlendirme beyanlara göre yapılır; uygun görülen
        adaylardan belgeler istenir. Beyan ile belgeler arasında çelişki olması
        halinde başvuru geçersiz sayılır.
      </p>

      <h2>Burs için aranan koşullar</h2>
      <ul className="basvuru-list">
        {BASVURU_KOSULLAR.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="basvuru-actions">
        <Link className="btn" to="/basvuru/form">
          Başvuru için tıklayınız
        </Link>
        <Link className="btn btn-ghost-dark" to="/basvuru/belgeler">
          Gerekli belgeler
        </Link>
      </div>
    </article>
  )
}
