import { KURUMSAL_TARIHCE } from '../config'
import { PageBanner } from '../components/PageBanner'

export function KurumsalTarihce() {
  return (
    <>
      <PageBanner
        title="Tarihçe"
        crumbs={[
          { label: 'Kurumsal', to: '/kurumsal/hakkinda' },
          { label: 'Tarihçe' },
        ]}
      />
      <section className="section kurumsal-section">
        <div className="shell kurumsal-narrow">
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
      </section>
    </>
  )
}
