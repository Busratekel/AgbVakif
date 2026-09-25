import { KURUMSAL_CEO } from '../config'
import { PageBanner } from '../components/PageBanner'

export function KurumsalCeo() {
  return (
    <>
      <PageBanner
        title="CEO’nun mesajı"
        crumbs={[
          { label: 'Kurumsal', to: '/kurumsal/hakkinda' },
          { label: 'CEO’nun mesajı' },
        ]}
      />
      <section className="section kurumsal-section">
        <div className="shell kurumsal-message">
          <aside className="kurumsal-person">
            {KURUMSAL_CEO.photo ? (
              <img
                className="kurumsal-person-photo"
                src={KURUMSAL_CEO.photo}
                alt={KURUMSAL_CEO.name}
              />
            ) : (
              <div className="kurumsal-person-photo" aria-hidden="true" />
            )}
            <strong>{KURUMSAL_CEO.name}</strong>
            <span>{KURUMSAL_CEO.title}</span>
            <span className="muted">{KURUMSAL_CEO.org}</span>
          </aside>
          <div className="kurumsal-copy">
            <p className="kurumsal-greeting">{KURUMSAL_CEO.greeting}</p>
            {KURUMSAL_CEO.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            <p className="kurumsal-sign">
              <strong>{KURUMSAL_CEO.name}</strong>
              <br />
              {KURUMSAL_CEO.org}
              <br />
              {KURUMSAL_CEO.title}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
