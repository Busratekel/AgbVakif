import { Link } from 'react-router-dom'
import { CONTACT, SITE } from '../config'
import { PageHero } from '../components/PageHero'

export function Iletisim() {
  return (
    <section className="basvuru-shell has-page-hero">
      <PageHero />
      <div className="shell">
        <article className="basvuru-article iletisim-page">
          <header className="basvuru-article-head">
            <h1>İletişim bilgileri</h1>
            <hr className="basvuru-rule" />
          </header>

          <h2 className="iletisim-org">{SITE.name}</h2>

          <div className="iletisim-grid">
            <ul className="iletisim-list">
              <li className="iletisim-card">
                <span className="iletisim-emoji" aria-hidden="true">✉️</span>
                <div>
                  <strong>E-posta</strong>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </div>
              </li>
              <li className="iletisim-card">
                <span className="iletisim-emoji" aria-hidden="true">📞</span>
                <div>
                  <strong>Telefon</strong>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
                </div>
              </li>
              <li className="iletisim-card">
                <span className="iletisim-emoji" aria-hidden="true">📍</span>
                <div>
                  <strong>Adres</strong>
                  <span>
                    {CONTACT.addressLines.map((line) => (
                      <span key={line} className="iletisim-line">
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
            </ul>

            <aside className="iletisim-mid">
              <div className="iletisim-mid-inner">
                <p className="iletisim-cta-emoji" aria-hidden="true">🤝</p>
                <h2>Size nasıl yardımcı olalım?</h2>
                <p>
                  Başvuru süreciniz, belgeleriniz veya genel sorularınız için
                  bize yazın; en kısa sürede dönüş yaparız.
                </p>
                <div className="iletisim-mid-links">
                  <Link to="/basvuru/sss">Sıkça sorulan sorular →</Link>
                </div>
              </div>
            </aside>

            <aside className="iletisim-cta">
              <div className="iletisim-cta-inner">
                <p className="iletisim-cta-emoji" aria-hidden="true">🗺️</p>
                <h2>Konum</h2>
                <p>
                  Vakıf ofisimize harita üzerinden kolayca ulaşabilir, yol tarifi
                  alabilirsiniz.
                </p>
                <a
                  className="btn btn-small"
                  href={CONTACT.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Haritada görüntüle
                </a>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </section>
  )
}
