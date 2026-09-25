import { Link } from 'react-router-dom'

type Props = {
  title: string
  crumbs: { label: string; to?: string }[]
}

export function PageBanner({ title, crumbs }: Props) {
  return (
    <div className="page-banner">
      <div className="shell page-banner-inner">
        <h1>{title}</h1>
        <nav className="page-crumbs" aria-label="Sayfa konumu">
          <Link to="/">Ana sayfa</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span className="page-crumbs-sep" aria-hidden="true">
                {' '}
                ›{' '}
              </span>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
        </nav>
      </div>
    </div>
  )
}
