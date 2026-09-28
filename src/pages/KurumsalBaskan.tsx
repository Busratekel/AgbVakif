import { KURUMSAL_BASKAN } from '../config'

export function KurumsalBaskan() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Başkan’ın mesajı</h1>
        <hr className="basvuru-rule" />
      </header>

      <div className="kurumsal-message">
        <aside className="kurumsal-person">
          {KURUMSAL_BASKAN.photo ? (
            <img
              className="kurumsal-person-photo"
              src={KURUMSAL_BASKAN.photo}
              alt={KURUMSAL_BASKAN.name}
            />
          ) : (
            <div className="kurumsal-person-photo" aria-hidden="true" />
          )}
          <strong>{KURUMSAL_BASKAN.name}</strong>
          <span>{KURUMSAL_BASKAN.title}</span>
          <span className="muted">{KURUMSAL_BASKAN.org}</span>
        </aside>
        <div className="kurumsal-copy">
          <p className="kurumsal-greeting">{KURUMSAL_BASKAN.greeting}</p>
          {KURUMSAL_BASKAN.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
