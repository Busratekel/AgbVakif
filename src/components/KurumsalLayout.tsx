import { NavLink, Outlet } from 'react-router-dom'
import { KURUMSAL_NAV } from '../config'

export function KurumsalLayout() {
  return (
    <section className="basvuru-shell">
      <div className="shell basvuru-layout">
        <aside className="basvuru-side" aria-label="Kurumsal menüsü">
          <p className="basvuru-side-title">Kurumsal</p>
          <nav className="basvuru-side-nav">
            {KURUMSAL_NAV.map((link) => (
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
