import { BASVURU_FAQ } from '../config'

export function BasvuruSss() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Burslar hakkında sıkça sorulan sorular</h1>
        <hr className="basvuru-rule" />
      </header>

      <div className="basvuru-faq">
        {BASVURU_FAQ.map((item) => (
          <details key={item.q} className="basvuru-faq-item">
            <summary>
              <span className="basvuru-faq-mark" aria-hidden="true">
                +
              </span>
              {item.q}
            </summary>
            <div className="basvuru-faq-body">
              <p>{item.a}</p>
            </div>
          </details>
        ))}
      </div>
    </article>
  )
}
