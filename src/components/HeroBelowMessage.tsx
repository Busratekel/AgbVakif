import { HERO_BELOW_MESSAGE } from '../config'

export function HeroBelowMessage() {
  const { title, paragraphs } = HERO_BELOW_MESSAGE

  return (
    <section className="hero-below" aria-labelledby="iyi-niyet-title">
      <div className="shell hero-below-inner">
        <h2 id="iyi-niyet-title">{title}</h2>
        {paragraphs.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
    </section>
  )
}
