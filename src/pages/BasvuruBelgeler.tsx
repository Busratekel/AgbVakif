import { Link } from 'react-router-dom'
import { BASVURU_BELGELER } from '../config'

export function BasvuruBelgeler() {
  return (
    <article className="basvuru-article">
      <header className="basvuru-article-head">
        <h1>Burs için gerekli belgeler</h1>
        <hr className="basvuru-rule" />
      </header>

      <p>
        Burs verilmesi uygun görülen öğrenciler e-posta veya SMS yoluyla
        bilgilendirileceği için e-posta ve telefon bilgilerinin doğru
        yazıldığından emin olunması gerekmektedir.
      </p>
      <p>
        <strong>
          Değerlendirme sonrası burs alması uygun görülen öğrencilerden
          istenecek belgeler:
        </strong>
      </p>

      <ol className="basvuru-belge-list">
        {BASVURU_BELGELER.map((item) => (
          <li key={item.text}>
            {item.text}
            {item.alt?.length ? (
              <ul>
                {item.alt.map((alt) => (
                  <li key={alt}>{alt}</li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>

      <p>
        Yukarıdaki bilgilere göre burs müracaatında bulunmak için aşağıdaki
        bağlantıyı kullanınız.
      </p>

      <div className="basvuru-actions">
        <Link className="btn" to="/basvuru/form">
          Başvuru için tıklayınız
        </Link>
      </div>
    </article>
  )
}
