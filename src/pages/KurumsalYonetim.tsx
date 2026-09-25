import { KURUMSAL_YONETIM } from '../config'
import { PageBanner } from '../components/PageBanner'

export function KurumsalYonetim() {
  return (
    <>
      <PageBanner
        title="Yönetim kurulu"
        crumbs={[
          { label: 'Kurumsal', to: '/kurumsal/hakkinda' },
          { label: 'Yönetim kurulu' },
        ]}
      />
      <section className="section kurumsal-section">
        <div className="shell">
          <ul className="kurumsal-board">
            {KURUMSAL_YONETIM.map((m) => (
              <li key={m.name} className="kurumsal-board-card">
                {m.photo ? (
                  <img className="kurumsal-person-photo" src={m.photo} alt={m.name} />
                ) : (
                  <div className="kurumsal-person-photo" aria-hidden="true" />
                )}
                <strong>{m.name}</strong>
                <span>{m.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
