import { useEffect, useState } from 'react'
import { SITE } from '../config'

const links = [
  { href: '#hakkimizda', label: 'Hakkımızda' },
  { href: '#destek', label: 'Destek alanları' },
  { href: '#basvuru', label: 'Başvuru' },
  { href: '#iletisim', label: 'İletişim' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="shell header-inner">
        <a className="brand" href="#ust" onClick={() => setOpen(false)}>
          <img src="/logo.svg" alt="" width={40} height={40} />
          <span>
            <strong>{SITE.shortName}</strong>
            <small>{SITE.name}</small>
          </span>
        </a>

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
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
          <a className="btn btn-small" href="#basvuru" onClick={() => setOpen(false)}>
            Başvuru yap
          </a>
        </nav>
      </div>
    </header>
  )
}
