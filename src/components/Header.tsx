import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { KURUMSAL_NAV, SITE } from '../config'

const links = [
  { href: '/#destek', label: 'Destek alanları' },
  { href: '/basvuru', label: 'Başvuru', route: true },
  { href: '/#footer-contact', label: 'İletişim' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [kurumsalOpen, setKurumsalOpen] = useState(false)
  const location = useLocation()
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24 || location.pathname !== '/')
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    setOpen(false)
    setKurumsalOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!dropRef.current?.contains(e.target as Node)) setKurumsalOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const kurumsalActive = location.pathname.startsWith('/kurumsal')

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="shell header-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt={SITE.name} />
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <span />
          <span />
        </button>

        <nav id="site-nav" className={open ? 'is-open' : ''} aria-label="Ana menü">
          <div className={`nav-drop${kurumsalOpen ? ' is-open' : ''}`} ref={dropRef}>
            <button
              type="button"
              className={`nav-drop-btn${kurumsalActive ? ' is-active' : ''}`}
              aria-expanded={kurumsalOpen}
              aria-haspopup="true"
              onClick={() => setKurumsalOpen((v) => !v)}
            >
              Kurumsal
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="nav-drop-menu" role="menu">
              {KURUMSAL_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => {
                    setKurumsalOpen(false)
                    setOpen(false)
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {links.map((link) =>
            link.route ? (
              <Link key={link.href} to={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ),
          )}
          <Link className="btn btn-small" to="/basvuru/form" onClick={() => setOpen(false)}>
            Başvuru yap
          </Link>
        </nav>
      </div>
    </header>
  )
}
