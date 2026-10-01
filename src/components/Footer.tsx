import { Link } from 'react-router-dom'
import { BASVURU_NAV, KURUMSAL_NAV, MEDYA_NAV, SITE } from '../config'
import { useCookieConsent } from './CookieConsent'

const LEGAL_LINKS = [
  { to: '/yasal/kvkk', label: 'KVKK metni' },
  { to: '/yasal/gizlilik-politikasi', label: 'Gizlilik politikası' },
  { to: '/yasal/cerez-politikasi', label: 'Çerez politikası' },
] as const

export function Footer() {
  const { openPreferences } = useCookieConsent()

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
          <strong>Medya merkezi</strong>
          <ul>
            {MEDYA_NAV.map((item) => (
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
          <ul>
            <li>
              <Link to="/iletisim">İletişim bilgileri</Link>
            </li>
            <li>
              <Link to="/basvuru/form">Başvuru formu</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p className="footer-note">
          © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
        </p>
        <nav className="footer-legal-links" aria-label="Yasal metinler">
          {LEGAL_LINKS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          <button type="button" className="footer-cookie-btn" onClick={openPreferences}>
            Çerez tercihleri
          </button>
        </nav>
      </div>
    </footer>
  )
}
