import { NavLink, Outlet } from 'react-router-dom'
import { BASVURU_NAV } from '../config'

export function BasvuruLayout() {
  return (
    <section className="basvuru-shell">
      <div className="shell basvuru-layout">
        <aside className="basvuru-side" aria-label="Başvuru menüsü">
          <p className="basvuru-side-title">Başvuru</p>
          <nav className="basvuru-side-nav">
            {BASVURU_NAV.map((link) => (
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
