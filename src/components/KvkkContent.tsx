import { APPLICATION_EMAIL, CONTACT, SITE } from '../config'

/** Veri sorumlusu — resmi vakıf iletişim bilgileri */
export const CONTROLLER = {
  name: SITE.name,
  shortName: 'Vakıf',
  websiteLabel: 'www.anadolugucbirligivakfi.org',
  websiteHref: 'https://www.anadolugucbirligivakfi.org',
  phones: [CONTACT.phone],
  kep: '—',
  kvkkEmail: APPLICATION_EMAIL,
  address: CONTACT.addressLines.join(', '),
} as const

export function KvkkContent() {
  const c = CONTROLLER

  return (
    <>
      <h3 className="kvkk-org">{c.name}</h3>
      <h4>KVKK AYDINLATMA METNİ</h4>
      <p>
        Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel
        verileriniz; veri sorumlusu sıfatıyla {c.name} (“{c.shortName}”)
        tarafından aşağıda açıklanan kapsamda işlenebilecektir. Veri sorumlusu
        olarak Vakfımızın KVKK m.10 kapsamında yerine getirmesi gereken
        aydınlatma yükümlülüğü gereği aşağıdaki açıklamaları başvuru
        sahiplerimizin ve internet sitemizi kullanan üçüncü kişilerin
        bilgilerine sunarız.
      </p>
      <p>
        Vakfımız, işbu Kişisel Verilerin Korunması Kanunu Uyarınca İlgili
        Kişilere İlişkin Aydınlatma Metni’ni (“Aydınlatma Metni”) yürürlükteki
        yasal düzenlemeler kapsamında yapılabilecek değişiklikler çerçevesinde
        her zaman düzenleme hakkını saklı tutar.
      </p>

      <h4>1. Veri Sorumlusu</h4>
      <div className="kvkk-table-wrap">
        <table className="kvkk-table">
          <thead>
            <tr>
              <th colSpan={2}>{c.name}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>İnternet Adresi</td>
              <td>
                <a href={c.websiteHref} target="_blank" rel="noreferrer">
                  {c.websiteLabel}
                </a>
              </td>
            </tr>
            <tr>
              <td>Telefon</td>
              <td>{c.phones.join(' · ')}</td>
            </tr>
            <tr>
              <td>E-Tebligat</td>
              <td>{c.kep}</td>
            </tr>
            <tr>
              <td>Adres</td>
              <td>{c.address}</td>
            </tr>
            <tr>
              <td>E-posta / KVKK İletişim</td>
              <td>
                <a href={`mailto:${c.kvkkEmail}`}>{c.kvkkEmail}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>2. KVKK ile ilgili tanımlar</h4>
      <ul>
        <li>
          <strong>KVKK:</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu
        </li>
        <li>
          <strong>Açık Rıza:</strong> Belirli bir konuya ilişkin,
          bilgilendirilmeye dayanan ve özgür iradeyle açıklanan rıza.
        </li>
        <li>
          <strong>Anonim Hâle Getirme:</strong> Kişisel verilerin, başka
          verilerle eşleştirilerek dahi hiçbir surette kimliği belirli veya
          belirlenebilir bir gerçek kişiyle ilişkilendirilemeyecek hâle
          getirilmesini,
        </li>
        <li>
          <strong>İlgili Kişi:</strong> Kişisel verisi işlenen gerçek kişiyi,
        </li>
        <li>
          <strong>Kişisel Veri/ler:</strong> Kimliği belirli veya belirlenebilir
          gerçek kişiye ilişkin her türlü bilgiyi,
        </li>
        <li>
          <strong>Kişisel Verilerin İşlenmesi:</strong> Kişisel verilerin tamamen
          veya kısmen otomatik olan ya da herhangi bir veri kayıt sisteminin
          parçası olmak kaydıyla otomatik olmayan yollarla elde edilmesi,
          kaydedilmesi, depolanması, muhafaza edilmesi, değiştirilmesi, yeniden
          düzenlenmesi, açıklanması, aktarılması, devralınması, elde edilebilir
          hâle getirilmesi, sınıflandırılması ya da kullanılmasının engellenmesi
          gibi veriler üzerinde gerçekleştirilen her türlü işlemi,
        </li>
        <li>
          <strong>Kurul:</strong> Kişisel Verileri Koruma Kurulunu,
        </li>
        <li>
          <strong>Kurum:</strong> Kişisel Verileri Koruma Kurumunu,
        </li>
        <li>
          <strong>Veri İşleyen:</strong> Veri sorumlusunun verdiği yetkiye
          dayanarak onun adına kişisel verileri işleyen gerçek veya tüzel
          kişiyi,
        </li>
        <li>
          <strong>Veri Kayıt Sistemi:</strong> Kişisel verilerin belirli
          kriterlere göre yapılandırılarak işlendiği kayıt sistemini,
        </li>
        <li>
          <strong>Veri Sorumlusu:</strong> Kişisel verilerin işleme amaçlarını ve
          vasıtalarını belirleyen, veri kayıt sisteminin kurulmasından ve
          yönetilmesinden sorumlu olan gerçek veya tüzel kişiyi,
        </li>
        <li>
          <strong>Özel Nitelikli Kişisel Veri:</strong> Kişilerin ırkı, etnik
          kökeni, siyasi düşüncesi, felsefi inancı, dini, mezhebi veya diğer
          inançları, kılık ve kıyafeti, dernek, vakıf ya da sendika üyeliği,
          sağlığı, cinsel hayatı, ceza mahkûmiyeti ve güvenlik tedbirleriyle
          ilgili verileri ile biyometrik ve genetik verilerini ifade eder.
        </li>
      </ul>

      <h4>3. Vakfın kişisel verileri toplamasında dayandığı yasal düzenlemeler</h4>
      <p>
        Başvuru sahiplerimiz ve web sitesi ziyaretçilerimize ait Kişisel
        Veriler’in kullanılması konusunda kanunlarda yer alan çeşitli yasal
        düzenlemeler mevcuttur. Bunların en başında KVKK ile Kişisel Veriler’in
        korunmasının ana esasları düzenlenmiştir. Ayrıca 5237 sayılı Türk Ceza
        Kanunu ve ilgili diğer mevzuat gereği yükümlülüklerimizi ifa etmek
        amaçlı ilgili verilerin toplanması ve kullanılması gerekmektedir.
      </p>

      <h4>4. Kişisel verilerinizin işlenme amaçları</h4>
      <p>
        İnternet sitemiz üzerinden işlem yapan başvuru sahipleri ve/veya üçüncü
        kişilerin vermiş oldukları Kişisel Veriler, Vakıf tarafından mevzuatın
        izin verdiği durumlarda ve sınırda kaydedilebilecek, saklanabilecek,
        güncellenebilecek, üçüncü kişilere açıklanabilecek, devredilebilecek,
        sınıflandırılabilecek ve işlenebilecektir.
      </p>
      <p>Kişisel verileriniz aşağıda yer alan amaçlarla işlenmekte ve kullanılmaktadır:</p>
      <ul>
        <li>
          Anadolu Güçbirliği Vakfı destek başvurusunun alınması,
          değerlendirilmesi, sonuçlandırılması ve başvuru sahibi ile iletişimin
          yürütülmesi,
        </li>
        <li>
          Bilgi güvenliği, başvuru süreçlerinin yürütülmesi ve yönetimi, işlem
          yapanın kimlik tespitinin yapılması, Veri Sorumlusu operasyonlarının
          güvenliğinin temini,
        </li>
        <li>
          Talep ve şikâyetlerin takibi, kullanıcı memnuniyetine yönelik
          aktivitelerin yürütülmesi,
        </li>
        <li>
          Anadolu Güçbirliği Holding ve grup şirketleri arasında iletişim ve iş
          birliğinin sağlanması, koordinasyonun temini, ortak iş alanlarının ve
          ortak veri tabanlarının yürütülmesi, başvuru sahiplerinin ve
          çalışanların ihtiyaçlarının belirlenmesi, iş güvenliği ve iş
          sürekliliğinin temini,
        </li>
        <li>
          Vakfımızın ve Vakıf ile iş ilişkisi içerisinde olan kişilerin hukuki
          güvenliğinin temini,
        </li>
        <li>
          İnternet sitemizin ziyaret edilmesi durumunda istatistiksel verilerin
          oluşturulması ve ziyaretçi bilgilerinin kaydedilmesi,
        </li>
        <li>Saklama ve arşiv faaliyetlerinin yürütülmesi,</li>
        <li>
          Hukuk işlerinin yürütülmesi ve takibinde, yetkili kişi, kamu kurum ve
          kuruluşlarına bilgi verilmesinde,
        </li>
        <li>
          Yasal düzenlemeler gereği tutulması gereken kayıtların oluşturulması,
        </li>
      </ul>
      <p>
        amaçlarıyla KVKK m. 5 hükmünde belirtilen kişisel veri işleme şartları
        ve amaçları dahilinde işlenecektir.
      </p>
      <p>
        Açık rızanızın varlığı halinde ad soyad, iletişim ve başvuru verileriniz;
        başvuru sürecinin iyileştirilmesi, iletişim kurulmasını tercih ettiğiniz
        kanaldan bilgilendirme yapılması ve bu amaçla hizmet alınan üçüncü
        kişilerle paylaşılması amacıyla ilgili açık rızanız kapsamında
        işlenebilecektir.
      </p>

      <h4>5. İşlenen kişisel verilerin kimlere ve hangi amaçla aktarılabileceği</h4>
      <p>
        İşlediğimiz kişisel verileriniz yukarıdaki amaçların gerçekleştirilmesi
        doğrultusunda, KVKK’nın 8. ve 9. maddeleri dikkate alınarak; Anadolu
        Güçbirliği Holding ve grup firmalarına, iş ortaklarımıza,
        tedarikçilerimize, yetkili kamu kurum ve finans kuruluşlarına, özel
        kişilere, yargı organlarına, kurulu yazılım firmalarına ve teknoloji
        şirketlerine, bulut servis hizmeti aldığımız teknoloji şirketlerine
        aktarılabilecektir.
      </p>

      <h4>6. Kişisel veri toplamanın yöntemi ve hukuki sebebi</h4>
      <p>
        Kişisel verileriniz Vakfımız ile temasınızın olduğu internet sitesi,
        e-posta ve benzeri kanallar aracılığıyla aşağıda belirtilen hukuki
        sebepler nedeniyle toplanmakta ve işlenmektedir;
      </p>
      <ul>
        <li>
          Destek başvurusunun alınması ve değerlendirilmesi, size geri dönüş
          sağlanabilmesi amacıyla bir hakkın tesisi, kullanılması veya korunması
          için veri işlemenin zorunlu olması hukuki sebebine dayalı olarak,
        </li>
        <li>
          Talep ve şikâyetlerinizin değerlendirilmesi amacıyla bir hakkın
          tesisi, kullanılması veya korunması için veri işlemenin zorunlu olması
          hukuki sebebine dayalı olarak,
        </li>
        <li>
          Açık rıza vermeniz halinde ise başvuru ve iletişim süreçlerinin
          yürütülmesi, bilgilendirme iletilerinin gönderilmesi amaçları ile
          ilgili açık rıza hukuki sebebine dayalı olarak işlenebilmektedir.
        </li>
      </ul>

      <h4>7. Kişisel verileri saklama süreleri</h4>
      <p>
        Vakfımız işlediği kişisel verileri ilgili mevzuatta öngörülen veya
        işleme amacının gerektirdiği süreler boyunca Kanun ile uyumlu olarak
        muhafaza eder.
      </p>
      <div className="kvkk-table-wrap">
        <table className="kvkk-table">
          <thead>
            <tr>
              <th>Veri Kategorisi</th>
              <th>Veri Saklama Süresi</th>
              <th>Gerekçe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kimlik</td>
              <td>Hukuki ilişkinin sona erdiği tarihten itibaren 10 yıl</td>
              <td>6098 Sayılı Kanun</td>
            </tr>
            <tr>
              <td>İletişim</td>
              <td>Hukuki ilişkinin sona erdiği tarihten itibaren 10 yıl</td>
              <td>İlgili mevzuat</td>
            </tr>
            <tr>
              <td>Hukuki İşlem</td>
              <td>Hukuki ilişkinin sona erdiği tarihten itibaren 10 yıl</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Başvuru / İşlem</td>
              <td>Hukuki ilişkinin sona erdiği tarihten itibaren 10 yıl</td>
              <td>6098 Sayılı Kanun ve ilgili mevzuat</td>
            </tr>
            <tr>
              <td>İşlem Güvenliği</td>
              <td>10 yıl</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Risk Yönetimi</td>
              <td>10 yıl</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>8. Vakfımız tarafından alınan teknik ve idari tedbirler</h4>
      <p>
        Vakfımızın kişisel verilerin güvenliğinin sağlanması için almış olduğu
        tedbirleri aşağıda bilginize sunarız:
      </p>
      <ul>
        <li>Ağ güvenliği ve uygulama güvenliği sağlanmaktadır.</li>
        <li>Ağ yoluyla kişisel veri aktarımlarında kapalı sistem ağ kullanılmaktadır.</li>
        <li>Anahtar yönetimi uygulanmaktadır.</li>
        <li>
          Bilgi teknolojileri sistemleri tedarik, geliştirme ve bakımı
          kapsamındaki güvenlik önlemleri alınmaktadır.
        </li>
        <li>Çalışanlar için veri güvenliği hükümleri içeren disiplin düzenlemeleri mevcuttur.</li>
        <li>
          Çalışanlar için veri güvenliği konusunda belli aralıklarla eğitim ve
          farkındalık çalışmaları yapılmaktadır.
        </li>
        <li>Çalışanlar için yetki matrisi oluşturulmuştur.</li>
        <li>Erişim logları düzenli olarak tutulmaktadır.</li>
        <li>Gerektiğinde veri maskeleme önlemi uygulanmaktadır.</li>
        <li>Gizlilik taahhütnameleri yapılmaktadır.</li>
        <li>
          Görev değişikliği olan ya da işten ayrılan çalışanların bu alandaki
          yetkileri kaldırılmaktadır.
        </li>
        <li>Güncel anti-virüs sistemleri kullanılmaktadır.</li>
        <li>Güvenlik duvarları kullanılmaktadır.</li>
        <li>İmzalanan sözleşmeler veri güvenliği hükümleri içermektedir.</li>
        <li>Kişisel veri güvenliği politika ve prosedürleri belirlenmiştir.</li>
        <li>Kişisel veri güvenliği sorunları hızlı bir şekilde raporlanmaktadır.</li>
        <li>Kişisel veri güvenliğinin takibi yapılmaktadır.</li>
        <li>
          Kişisel veri içeren fiziksel ortamlara giriş çıkışlarla ilgili gerekli
          güvenlik önlemleri alınmaktadır.
        </li>
        <li>
          Kişisel veri içeren fiziksel ortamların dış risklere (yangın, sel vb.)
          karşı güvenliği sağlanmaktadır.
        </li>
        <li>Kişisel veri içeren ortamların güvenliği sağlanmaktadır.</li>
        <li>Kişisel veriler mümkün olduğunca azaltılmaktadır.</li>
        <li>
          Kişisel veriler yedeklenmekte ve yedeklenen kişisel verilerin güvenliği
          de sağlanmaktadır.
        </li>
        <li>
          Kullanıcı hesap yönetimi ve yetki kontrol sistemi uygulanmakta olup
          bunların takibi de yapılmaktadır.
        </li>
        <li>Kurum içi periyodik ve/veya rastgele denetimler yapılmakta ve yaptırılmaktadır.</li>
        <li>Log kayıtları kullanıcı müdahalesi olmayacak şekilde tutulmaktadır.</li>
        <li>Mevcut risk ve tehditler belirlenmiştir.</li>
        <li>
          Özel nitelikli kişisel veriler elektronik posta yoluyla gönderilecekse
          mutlaka şifreli olarak ve KEP veya kurumsal posta hesabı kullanılarak
          gönderilmektedir.
        </li>
        <li>Saldırı tespit ve önleme sistemleri kullanılmaktadır.</li>
        <li>Sızma testi uygulanmaktadır.</li>
        <li>Siber güvenlik önlemleri alınmış olup uygulanması sürekli takip edilmektedir.</li>
        <li>Şifreleme yapılmaktadır.</li>
        <li>
          Veri işleyen hizmet sağlayıcılarının veri güvenliği konusunda belli
          aralıklarla denetimi sağlanmaktadır.
        </li>
        <li>
          Veri işleyen hizmet sağlayıcılarının, veri güvenliği konusunda
          farkındalığı sağlanmaktadır.
        </li>
      </ul>

      <h4>9. İlgili kişinin KVKK m. 11’de sayılan diğer hakları</h4>
      <p>
        Kişisel veri sahibi İlgili Kişi olarak, KVKK m. 11 uyarınca aşağıdaki
        haklara sahip olduğunuzu bildiririz;
      </p>
      <ul>
        <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
        <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
        <li>
          Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp
          kullanılmadığını öğrenme,
        </li>
        <li>
          Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü
          kişileri bilme,
        </li>
        <li>
          Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların
          düzeltilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin
          aktarıldığı üçüncü kişilere bildirilmesini isteme,
        </li>
        <li>
          6698 sayılı Kanun ve ilgili diğer kanun hükümlerine uygun olarak
          işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan
          kalkması hâlinde kişisel verilerin silinmesini veya yok edilmesini
          isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı
          üçüncü kişilere bildirilmesini isteme,
        </li>
        <li>
          Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara
          uğramanız hâlinde zararın giderilmesini talep etme.
        </li>
      </ul>
      <p>
        KVKK kapsamında bizimle iletişime geçmek, geri bildirimde bulunmak ya da
        sorularınızı yöneltmek isterseniz, kimliğinizi tevsik edici belgelerle
        birlikte {c.address} adresine bizzat veya noter kanalıyla başvurabilir;
        ya da <a href={`mailto:${c.kvkkEmail}`}>{c.kvkkEmail}</a> adresine
        kimlik doğrulanmasını sağlayıcı belgelerle birlikte iletebilirsiniz.
      </p>
      <p>
        Bu kapsamda, konuyla ilgili yapılacak olan yazılı başvurularınızın
        tarafımızca yapılacak olan kimlik doğrulamasını takiben kabul
        edilebileceğini hatırlatmak isteriz. İlgili kişinin talepleri en kısa
        sürede ve nihayetinde en geç otuz (30) gün içerisinde ücretsiz olarak
        değerlendirilip karara bağlanır. Değerlendirme ve karar verme işleminin
        ayrıca bir maliyeti gerektirmesi durumunda Veri Sorumlusuna Başvuru Usul
        ve Esasları Hakkında Tebliğ’de belirlenmiş olan tarifedeki ücret esas
        alınır. İlgili kişiler, Vakfımıza başvuru yaptıktan sonra, söz konusu
        başvuruya ilişkin yanıttan memnun kalmazlarsa Kişisel Verileri Koruma
        Kurumu’na şikâyet yoluna gidebilirler.
      </p>

      <p className="kvkk-end-marker">— Metnin sonu —</p>
    </>
  )
}
