import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BASVURU_NAV, YARDIM_NAV } from '../config'
import { PageHero } from './PageHero'

export function BasvuruLayout() {
  const location = useLocation()
  const isYardim = location.pathname.startsWith('/yardim')
  const nav = isYardim ? YARDIM_NAV : BASVURU_NAV

  return (
    <section className="basvuru-shell has-page-hero">
      <PageHero />
      <div className="shell basvuru-layout">
        <aside className="basvuru-side" aria-label="Başvuru menüsü">
          <p className="basvuru-side-title">{isYardim ? 'Yardım başvurusu' : 'Başvuru'}</p>
          <nav className="basvuru-side-nav">
            {nav.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="basvuru-main">
          <Outlet />
        </div>
      </div>
    </section>
  )
}
