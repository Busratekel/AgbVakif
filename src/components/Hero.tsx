import { SITE } from '../config'

export function Hero() {
  return (
    <section className="hero" id="ust">
      <div className="hero-media" aria-hidden="true" />
      <div className="hero-veil" aria-hidden="true" />
      <div className="shell hero-content">
        <p className="hero-kicker">Kayseri · 2026</p>
        <h1>
          <span className="hero-brand">{SITE.name}</span>
        </h1>
        <p className="hero-lead">{SITE.tagline}</p>
        <div className="hero-actions">
          <a className="btn" href="#basvuru">
            Başvuru yap
          </a>
          <a className="btn btn-ghost" href="#hakkimizda">
            Vakfı tanı
          </a>
        </div>
      </div>
    </section>
  )
}
