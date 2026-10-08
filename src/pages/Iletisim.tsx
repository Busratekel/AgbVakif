import { Link } from 'react-router-dom'
import { CONTACT, SITE } from '../config'
import { PageHero } from '../components/PageHero'

export function Iletisim() {
  return (
    <section className="basvuru-shell has-page-hero">
      <PageHero />
      <div className="shell">
        <article className="basvuru-article legal-article">
          <header className="basvuru-article-head">
            <h1>İletişim bilgileri</h1>
            <hr className="basvuru-rule" />
          </header>

          <div className="iletisim-grid">
            <div>
              <h2>{SITE.name}</h2>
              <ul className="iletisim-list">
                <li>
                  <strong>E-posta</strong>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </li>
                <li>
                  <strong>Telefon</strong>
                  <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
                </li>
                <li>
                  <strong>Adres</strong>
                  <span>
                    {CONTACT.addressLines.map((line) => (
                      <span key={line} className="iletisim-line">
                        {line}
                      </span>
                    ))}
                  </span>
                </li>
              </ul>
              <p>
                <a
                  className="footer-map-link"
                  href={CONTACT.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Haritada görüntüleyin
                </a>
              </p>
            </div>

            <div className="iletisim-cta">
              <h2>Başvuru</h2>
              <p>Burs / destek başvurunuz için formu doldurabilirsiniz.</p>
              <Link className="btn" to="/basvuru/form">
                Başvuru formu
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
