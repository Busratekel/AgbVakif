import { KvkkContent } from '../components/KvkkContent'

export function KvkkMetni() {
  return (
    <section className="basvuru-shell">
      <div className="shell">
        <article className="basvuru-article legal-article">
          <header className="basvuru-article-head">
            <h1>KVKK metni</h1>
            <hr className="basvuru-rule" />
          </header>
          <div className="kvkk-page-body">
            <KvkkContent />
          </div>
        </article>
      </div>
    </section>
  )
}
