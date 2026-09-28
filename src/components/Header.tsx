import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BASVURU_NAV, KURUMSAL_NAV, MEDYA_NAV, SITE } from '../config'

type DropKey = 'kurumsal' | 'medya' | 'basvuru' | null

function canHover() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState<DropKey>(null)
  const location = useLocation()
  const kurumsalRef = useRef<HTMLDivElement>(null)
  const medyaRef = useRef<HTMLDivElement>(null)
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
      if (
        kurumsalRef.current?.contains(t)
        || medyaRef.current?.contains(t)
        || basvuruRef.current?.contains(t)
      ) {
        return
      }
      setDropOpen(null)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const kurumsalActive = location.pathname.startsWith('/kurumsal')
  const medyaActive = location.pathname.startsWith('/medya')
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
            <Link
              to={KURUMSAL_NAV[0].to}
              className={`nav-drop-btn${kurumsalActive ? ' is-active' : ''}`}
              aria-haspopup="true"
              aria-expanded={dropOpen === 'kurumsal'}
              onClick={closeAll}
            >
              Kurumsal
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </Link>
            <div className="nav-drop-menu" role="menu">
              {KURUMSAL_NAV.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            className={`nav-drop${dropOpen === 'medya' ? ' is-open' : ''}`}
            ref={medyaRef}
            onMouseEnter={() => {
              if (canHover()) setDropOpen('medya')
            }}
            onMouseLeave={() => {
              if (canHover()) setDropOpen((v) => (v === 'medya' ? null : v))
            }}
          >
            <Link
              to={MEDYA_NAV[0].to}
              className={`nav-drop-btn${medyaActive ? ' is-active' : ''}`}
              aria-haspopup="true"
              aria-expanded={dropOpen === 'medya'}
              onClick={closeAll}
            >
              Medya merkezi
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </Link>
            <div className="nav-drop-menu" role="menu">
              {MEDYA_NAV.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

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
            <Link
              to={BASVURU_NAV[0].to}
              className={`nav-drop-btn${basvuruActive ? ' is-active' : ''}`}
              aria-haspopup="true"
              aria-expanded={dropOpen === 'basvuru'}
              onClick={closeAll}
            >
              Burs
              <span className="nav-drop-chevron" aria-hidden="true">
                ▾
              </span>
            </Link>
            <div className="nav-drop-menu" role="menu">
              {BASVURU_NAV.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" onClick={closeAll}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/basvuru/form?giris=1"
            className={location.pathname === '/basvuru/form' && location.search.includes('giris=1') ? 'is-active' : undefined}
            onClick={closeAll}
          >
            Başvurum
          </Link>
          <Link
            to="/iletisim"
            className={location.pathname === '/iletisim' ? 'is-active' : undefined}
            onClick={closeAll}
          >
            İletişim
          </Link>
        </nav>
      </div>
    </header>
  )
}
