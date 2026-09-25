import { Link } from 'react-router-dom'
import { BASVURU_NAV, CONTACT, KURUMSAL_NAV, SITE } from '../config'
import { useKvkk } from './KvkkModal'

export function Footer() {
  const { openKvkk } = useKvkk()

  return (
    <footer className="site-footer" id="footer-contact">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <img src="/logo.png" alt={SITE.name} />
        </div>

        <div className="footer-col">
          <strong>Kurumsal</strong>
          <ul>
            {KURUMSAL_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <strong>Başvuru</strong>
          <ul>
            {BASVURU_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <strong>İletişim</strong>
          <ul className="footer-contact-list">
            <li>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </li>
            <li>
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>{CONTACT.phone}</a>
            </li>
            {CONTACT.addressLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              <a
                className="footer-map-link"
                href={CONTACT.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Haritada Görüntüleyin
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p className="footer-note">
          © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
        </p>
        <button type="button" className="linkish footer-kvkk" onClick={openKvkk}>
          KVKK aydınlatma metni
        </button>
      </div>
    </footer>
  )
}
