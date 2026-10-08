import { Link, useLocation } from 'react-router-dom'
import { PAGE_HEROES, type PageHeroDef } from '../config'

function resolveHero(pathname: string): PageHeroDef | null {
  const exact = PAGE_HEROES[pathname]
  if (exact) return exact

  const entries = Object.entries(PAGE_HEROES).sort((a, b) => b[0].length - a[0].length)
  for (const [path, hero] of entries) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return hero
  }
  return null
}

export function PageHero() {
  const { pathname } = useLocation()
  const hero = resolveHero(pathname)
  if (!hero) return null

  return (
    <div
      className="page-hero"
      style={{ ['--page-hero-image' as string]: `url('${hero.image}')` }}
    >
      <div className="page-hero-media" aria-hidden="true" />
      <div className="page-hero-shade" aria-hidden="true" />
      <div className="shell page-hero-content">
        <h1 className="page-hero-title">{hero.title}</h1>
        <nav className="page-hero-crumbs" aria-label="Sayfa konumu">
          {hero.crumbs.map((crumb, i) => {
            const last = i === hero.crumbs.length - 1
            return (
              <span key={`${crumb.label}-${i}`} className="page-hero-crumb">
                {i > 0 ? <span className="page-hero-sep" aria-hidden="true">›</span> : null}
                {last || !crumb.to ? (
                  <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                ) : (
                  <Link to={crumb.to}>{crumb.label}</Link>
                )}
              </span>
            )
          })}
        </nav>
      </div>
      <svg className="page-hero-wave" viewBox="0 0 1440 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0,24 C240,48 480,0 720,18 C960,36 1200,6 1440,24 L1440,48 L0,48 Z" />
      </svg>
    </div>
  )
}
