import { Link } from 'react-router-dom'
import { ApplicationWizard } from '../components/ApplicationWizard'

export function BasvuruForm() {
  return (
    <section className="basvuru-form-page basvuru-form-top">
      <div className="shell">
        <p className="basvuru-form-back no-print">
          <Link to="/basvuru">← Başvuru bilgilendirmesine dön</Link>
        </p>
      </div>
      <ApplicationWizard />
    </section>
  )
}
