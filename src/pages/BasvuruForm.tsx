import { Link, useSearchParams } from 'react-router-dom'
import { ApplicationWizard } from '../components/ApplicationWizard'

export function BasvuruForm() {
  const [searchParams] = useSearchParams()
  const profilGiris = searchParams.get('giris') === '1'

  return (
    <section className="basvuru-form-page basvuru-form-top">
      <div className="shell">
        <p className="basvuru-form-back no-print">
          {profilGiris ? (
            <Link to="/">← Ana sayfaya dön</Link>
          ) : (
            <Link to="/basvuru">← Başvuru bilgilendirmesine dön</Link>
          )}
        </p>
      </div>
      <ApplicationWizard />
    </section>
  )
}
