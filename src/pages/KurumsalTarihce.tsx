import { KURUMSAL_TARIHCE } from '../config'

export function KurumsalTarihce() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Tarihçe</h1>
        <hr className="basvuru-rule" />
      </header>

      <div className="kurumsal-narrow">
        <h2>Anadolu Güçbirliği</h2>
        <p>{KURUMSAL_TARIHCE.lead}</p>
        <p>
          <strong>{KURUMSAL_TARIHCE.highlight}</strong>
        </p>
        <ul className="kurumsal-timeline">
          {KURUMSAL_TARIHCE.milestones.map((m) => (
            <li key={m.date}>
              <strong>{m.date}</strong>
              <span>{m.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
