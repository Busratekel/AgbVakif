import { EVALUATION_STEPS, SUPPORT_AREAS } from '../config'

export function SupportAreas() {
  return (
    <section className="section support" id="destek">
      <div className="shell">
        <div className="support-intro reveal">
          <div>
            <p className="eyebrow">Destek alanları</p>
            <h2>Hangi ihtiyaçlarda yanınızdayız?</h2>
          </div>
          <p>
            Her başvuru; ihtiyacın niteliği, belgelenebilirliği, aciliyeti ve
            vakıf senedindeki amaçlara uygunluğu üzerinden ayrı ayrı
            değerlendirilir. Aşağıdaki başlıklardan birini seçerek talep
            iletebilirsiniz.
          </p>
        </div>

        <ul className="support-grid">
          {SUPPORT_AREAS.map((area, index) => (
            <li
              key={area.title}
              className="support-card reveal"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="support-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </li>
          ))}
        </ul>

        <div className="eval-strip reveal">
          <h3>Değerlendirme özeti</h3>
          <ol>
            {EVALUATION_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
