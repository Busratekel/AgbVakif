import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/basvuru', label: 'Genel bilgilendirme', end: true },
  { to: '/basvuru/sss', label: 'Burslar hakkında SSS', end: false },
  { to: '/basvuru/form', label: 'Burs başvurusu', end: false },
  { to: '/basvuru/belgeler', label: 'Burs için gerekli belgeler', end: false },
]

export function BasvuruLayout() {
  return (
    <section className="basvuru-shell">
      <div className="shell basvuru-layout">
        <aside className="basvuru-side" aria-label="Başvuru menüsü">
          <p className="basvuru-side-title">Başvuru</p>
          <nav className="basvuru-side-nav">
            {links.map((link) => (
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
