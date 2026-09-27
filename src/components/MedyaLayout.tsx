import { NavLink, Outlet } from 'react-router-dom'
import { MEDYA_NAV } from '../config'

export function MedyaLayout() {
  return (
    <section className="basvuru-shell">
      <div className="shell basvuru-layout">
        <aside className="basvuru-side" aria-label="Medya merkezi menüsü">
          <p className="basvuru-side-title">Medya merkezi</p>
          <nav className="basvuru-side-nav">
            {MEDYA_NAV.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
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
