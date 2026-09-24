import { SITE } from '../config'
import { useKvkk } from './KvkkModal'

export function Footer() {
  const { openKvkk } = useKvkk()

  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-brand">
          <img src="/logo.svg" alt="" width={36} height={36} />
          <div>
            <strong>{SITE.shortName}</strong>
            <p>{SITE.name}</p>
          </div>
        </div>
        <div className="footer-meta">
          <button type="button" className="linkish" onClick={openKvkk}>
            KVKK aydınlatma metni
          </button>
          <p className="footer-note">
            © {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  )
}
