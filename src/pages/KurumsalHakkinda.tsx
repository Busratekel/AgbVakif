import { Link } from 'react-router-dom'
import { KURUMSAL_HAKKINDA } from '../config'

export function KurumsalHakkinda() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Hakkında</h1>
        <hr className="basvuru-rule" />
      </header>

      <div className="kurumsal-intro">
        <div className="kurumsal-copy">
          <p className="eyebrow">{KURUMSAL_HAKKINDA.eyebrow}</p>
          <h2>{KURUMSAL_HAKKINDA.title}</h2>
          {KURUMSAL_HAKKINDA.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
        <div className="kurumsal-vizyon-box">
          <h3>Vizyon</h3>
          <p>{KURUMSAL_HAKKINDA.vizyon}</p>
          <h3>Misyon</h3>
          <p>{KURUMSAL_HAKKINDA.misyon}</p>
          <p className="muted">
            Vakıf faaliyetlerimiz için{' '}
            <Link to="/basvuru">başvuru bilgilendirmesine</Link> bakabilirsiniz.
          </p>
        </div>
      </div>
    </article>
  )
}
