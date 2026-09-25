import { ABOUT } from '../config'
import { Link } from 'react-router-dom'

/** Ana sayfa kısa tanıtım — detay Kurumsal altında */
export function About() {
  return (
    <section className="section about" id="hakkimizda">
      <div className="shell about-layout">
        <div className="about-copy reveal">
          <p className="eyebrow">Kurumsal</p>
          <h2>Dayanışmayı ölçülebilir, adil ve sürdürülebilir kılmak</h2>
          <p className="about-lead">{ABOUT.lead}</p>
          <div className="hero-actions" style={{ marginTop: '1.5rem' }}>
            <Link className="btn" to="/kurumsal/hakkinda">
              Kurumsalı incele
            </Link>
          </div>
        </div>
        <div className="about-pillars">
          {ABOUT.pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className="about-pillar reveal"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="about-pillar-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
