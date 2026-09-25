import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BASVURU_NAV, KURUMSAL_NAV, SITE } from '../config'

const links = [
  { href: '/#destek', label: 'Destek alanları' },
  { href: '/#footer-contact', label: 'İletişim' },
]

type DropKey = 'kurumsal' | 'basvuru' | null

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState<DropKey>(null)
  const location = useLocation()
  const kurumsalRef = useRef<HTMLDivElement>(null)
  const basvuruRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24 || location.pathname !== '/')
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => {
    setOpen(false)
    setDropOpen(null)
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
      const t = e.target as Node
      if (kurumsalRef.current?.contains(t) || basvuruRef.current?.contains(t)) return
      setDropOpen(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const kurumsalActive = location.pathname.startsWith('/kurumsal')
  const basvuruActive = location.pathname.startsWith('/basvuru')

  function closeAll() {
    setDropOpen(null)
    setOpen(false)
  }

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
          <div
            className={`nav-drop${dropOpen === 'kurumsal' ? ' is-open' : ''}`}
            ref={kurumsalRef}
            onMouseEnter={() => {
              if (canHover()) setDropOpen('kurumsal')
            }}
            onMouseLeave={() => {
              if (canHover()) setDropOpen((v) => (v === 'kurumsal' ? null : v))
            }}
          >
            <button
              type="button"
              className={`nav-drop-btn${kurumsalActive ? ' is-active' : ''}`}
              aria-expanded={dropOpen === 'kurumsal'}
              aria-haspopup="true"
              onClick={() => setDropOpen((v) => (v === 'kurumsal' ? null : 'kurumsal'))}
            >
              Kurumsal
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="nav-drop-menu" role="menu">
              {KURUMSAL_NAV.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {links[0] ? (
            <a href={links[0].href} onClick={() => setOpen(false)}>
              {links[0].label}
            </a>
          ) : null}

          <div
            className={`nav-drop${dropOpen === 'basvuru' ? ' is-open' : ''}`}
            ref={basvuruRef}
            onMouseEnter={() => {
              if (canHover()) setDropOpen('basvuru')
            }}
            onMouseLeave={() => {
              if (canHover()) setDropOpen((v) => (v === 'basvuru' ? null : v))
            }}
          >
            <button
              type="button"
              className={`nav-drop-btn${basvuruActive ? ' is-active' : ''}`}
              aria-expanded={dropOpen === 'basvuru'}
              aria-haspopup="true"
              onClick={() => setDropOpen((v) => (v === 'basvuru' ? null : 'basvuru'))}
            >
              Burs
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="nav-drop-menu" role="menu">
              {BASVURU_NAV.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {links[1] ? (
            <a href={links[1].href} onClick={() => setOpen(false)}>
              {links[1].label}
            </a>
          ) : null}

          <Link className="btn btn-small" to="/basvuru/form" onClick={closeAll}>
            Başvuru yap
          </Link>
        </nav>
      </div>
    </header>
  )
}
