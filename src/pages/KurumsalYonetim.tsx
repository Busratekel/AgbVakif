import { KURUMSAL_YONETIM } from '../config'

export function KurumsalYonetim() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Yönetim kurulu</h1>
        <hr className="basvuru-rule" />
      </header>

      <ul className="kurumsal-board">
        {KURUMSAL_YONETIM.map((m) => (
          <li key={m.name} className="kurumsal-board-card">
            {m.photo ? (
              <img className="kurumsal-person-photo" src={m.photo} alt={m.name} />
            ) : null}
            <strong>{m.name}</strong>
            <span>{m.title}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}
