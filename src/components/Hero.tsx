import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { FORM_API_URL, SITE } from '../config'
import { isHeroVideo } from '../heroMedia'

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

const AUTO_MS = 4000

export function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [ready, setReady] = useState(false)
  const [index, setIndex] = useState(0)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`${FORM_API_URL}/hero`)
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        const items = (json.items ?? []) as HeroSlide[]
        setSlides(items.length > 0 ? items : [FALLBACK])
        setIndex(0)
      } catch {
        if (!cancelled) setSlides([FALLBACK])
      } finally {
        if (!cancelled) setReady(true)
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

  useEffect(() => {
    slides.forEach((s, i) => {
      const el = videoRefs.current[s.id]
      if (!el) return
      if (i === index) {
        void el.play().catch(() => {})
      } else {
        el.pause()
        el.currentTime = 0
      }
    })
  }, [index, slides])

  const slide = slides[index]
  const hasMany = slides.length > 1
  const primaryLabel = slide?.butonMetin?.trim() || ''
  const primaryHref = slide?.butonLink?.trim() || '/basvuru/form'
  const showPrimary = Boolean(primaryLabel)
  const showSecondary = slide?.id === 'fallback'
  const showActions = showPrimary || showSecondary
  const primaryIsInternal =
    primaryHref.startsWith('/') && !primaryHref.startsWith('//')
  const title = slide?.baslik?.trim() || ''
  const kicker = slide?.ustBaslik?.trim() || ''
  const lead = slide?.aciklama?.trim() || ''

  function go(delta: number) {
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  return (
    <section className="hero" id="ust">
      {!ready || slides.length === 0 ? (
        <div className="hero-slide is-active" aria-hidden="true">
          <div className="hero-media" />
        </div>
      ) : (
        slides.map((s, i) => {
          const video = isHeroVideo(s.resimUrl)
          return (
            <div
              key={s.id}
              className={`hero-slide${i === index ? ' is-active' : ''}`}
              aria-hidden={i !== index}
            >
              {video && s.resimUrl ? (
                <div className="hero-media has-video" aria-hidden="true">
                  <video
                    ref={(el) => {
                      videoRefs.current[s.id] = el
                    }}
                    src={s.resimUrl}
                    muted
                    loop
                    playsInline
                    autoPlay={i === index}
                    preload="metadata"
                  />
                </div>
              ) : (
                <div
                  className={`hero-media${s.resimUrl ? ' has-photo' : ''}`}
                  style={
                    s.resimUrl
                      ? ({ ['--hero-photo']: `url("${s.resimUrl}")` } as CSSProperties)
                      : undefined
                  }
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })
      )}
      <div className="hero-veil" aria-hidden="true" />

      {ready && slide ? (
        <div className="shell hero-content" key={slide.id}>
          {kicker ? <p className="hero-kicker">{kicker}</p> : null}
          {title ? (
            <h1>
              <span className="hero-brand">{title}</span>
            </h1>
          ) : null}
          {lead ? <p className="hero-lead">{lead}</p> : null}
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
      ) : null}

      {ready && hasMany ? (
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
