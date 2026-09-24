import { ABOUT } from '../config'

export function About() {
  return (
    <section className="section about" id="hakkimizda">
      <div className="shell about-layout">
        <div className="about-copy reveal">
          <p className="eyebrow">Hakkımızda</p>
          <h2>Dayanışmayı ölçülebilir, adil ve sürdürülebilir kılmak</h2>
          <p className="about-lead">{ABOUT.lead}</p>
          <p className="about-body">{ABOUT.body}</p>
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
