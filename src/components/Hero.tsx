import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { FORM_API_URL, SITE } from '../config'

type HeroSlide = {
  id: string
  baslik: string
  aciklama?: string | null
  ustBaslik?: string | null
  resimUrl?: string | null
  butonMetin?: string | null
  butonLink?: string | null
}

const FALLBACK: HeroSlide = {
  id: 'fallback',
  baslik: SITE.name,
  aciklama: SITE.tagline,
  ustBaslik: 'Kayseri · 2026',
  butonMetin: 'Başvuru yap',
  butonLink: '/basvuru/form',
}

const AUTO_MS = 3000

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([FALLBACK])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/hero`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        const items = (json.items ?? []) as HeroSlide[]
        if (items.length > 0) {
          setSlides(items)
          setIndex(0)
        }
      } catch {
        // keep fallback
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, AUTO_MS)
    return () => window.clearInterval(timer)
  }, [slides.length])

  const slide = slides[index] ?? FALLBACK
  const hasMany = slides.length > 1
  const primaryLabel = slide.butonMetin?.trim() || ''
  const primaryHref = slide.butonLink?.trim() || '/basvuru/form'
  const showPrimary = Boolean(primaryLabel)
  const showSecondary = slide.id === 'fallback'
  const showActions = showPrimary || showSecondary
  const primaryIsInternal =
    primaryHref.startsWith('/') && !primaryHref.startsWith('//')
  const title = slide.baslik?.trim() || ''
  const kicker = slide.ustBaslik?.trim() || ''
  // Panelde yalnızca üst başlık doluysa onu ana başlık gibi göster
  const headline = title || kicker
  const showKicker = Boolean(title && kicker)

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  return (
    <section className="hero" id="ust">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero-slide${i === index ? ' is-active' : ''}`}
          aria-hidden={i !== index}
        >
          <div
            className={`hero-media${s.resimUrl ? ' has-photo' : ''}`}
            style={
              s.resimUrl
                ? ({ ['--hero-photo']: `url("${s.resimUrl}")` } as CSSProperties)
                : undefined
            }
            aria-hidden="true"
          />
        </div>
      ))}
      <div className="hero-veil" aria-hidden="true" />

      <div className="shell hero-content" key={slide.id}>
        {showKicker ? <p className="hero-kicker">{kicker}</p> : null}
        {headline ? (
          <h1>
            <span className="hero-brand">{headline}</span>
          </h1>
        ) : null}
        {slide.aciklama ? <p className="hero-lead">{slide.aciklama}</p> : null}
        {showActions ? (
          <div className="hero-actions">
            {showPrimary ? (
              primaryIsInternal ? (
                <Link className="btn" to={primaryHref}>
                  {primaryLabel}
                </Link>
              ) : (
                <a className="btn" href={primaryHref}>
                  {primaryLabel}
                </a>
              )
            ) : null}
            {showSecondary ? (
              <Link className="btn btn-ghost" to="/kurumsal/hakkinda">
                Vakfı tanı
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      {hasMany ? (
        <div className="hero-controls shell">
          <button type="button" className="hero-nav-btn" aria-label="Önceki" onClick={() => go(-1)}>
            ‹
          </button>
          <div className="hero-dots" role="tablist" aria-label="Slaytlar">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`hero-dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button type="button" className="hero-nav-btn" aria-label="Sonraki" onClick={() => go(1)}>
            ›
          </button>
        </div>
      ) : null}
    </section>
  )
}
