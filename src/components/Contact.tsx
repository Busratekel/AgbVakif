import { CONTACT, SITE } from '../config'

export function Contact() {
  return (
    <section className="section contact" id="iletisim">
      <div className="shell contact-layout reveal">
        <div>
          <p className="eyebrow">İletişim</p>
          <h2>Bize ulaşın</h2>
          <p>
            Destek başvuruları ve diğer talepleriniz için aşağıdaki kanallardan
            bize ulaşabilirsiniz.
          </p>
        </div>
        <dl className="contact-facts">
          <div>
            <dt>Kurum</dt>
            <dd>{SITE.name}</dd>
          </div>
          <div>
            <dt>Adres</dt>
            <dd>{CONTACT.address}</dd>
          </div>
          <div>
            <dt>Telefon</dt>
            <dd>
              {CONTACT.phones.map((phone) => (
                <a key={phone} className="contact-phone" href={`tel:${phone.replace(/\s/g, '')}`}>
                  {phone}
                </a>
              ))}
            </dd>
          </div>
          <div>
            <dt>E-posta</dt>
            <dd>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
