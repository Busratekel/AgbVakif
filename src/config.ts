/** Başvuruların düşeceği adres (bilgilendirme metinleri) */
export const APPLICATION_EMAIL = 'agbvakfi@anadolugucbirligi.com.tr'

/** Vite proxy üzerinden API: /api → http://localhost:5000 */
export const FORM_API_URL = '/api'

export const SITE = {
  name: 'Anadolu Güçbirliği Vakfı',
  shortName: 'AGB Vakfı',
  city: 'Kayseri',
  district: 'Melikgazi',
  tagline:
    'Eğitim, sağlık, spor ve toplumsal dayanışma ile Anadolu’da umuda ortak oluyoruz.',
}

export const CONTACT = {
  email: 'info@anadolugucbirligi.com.tr',
  phone: '+90 212 438 25 00',
  addressLines: [
    'Oruç Reis Mah. Giyimkent Sitesi Vadi Cad. No:3',
    'Esenler / İSTANBUL',
  ],
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Oru%C3%A7+Reis+Mah.+Giyimkent+Sitesi+Vadi+Cad.+No:3+Esenler+%C4%B0stanbul',
} as const

export const STATUSES = [
  'Anadolu Güçbirliği Holding çalışanı',
  'Grup şirketi çalışanı',
  'Çalışanın çocuğu',
  'Çalışanın birinci derece yakını',
  'Diğer / Bireysel başvuru',
  'Kurum / STK başvurusu',
] as const

export const CATEGORIES = [
  'Eğitim',
  'Sağlık',
  'Spor',
  'Ekonomik / Sosyal destek',
  'Kültür ve sanat',
  'Toplumsal kalkınma',
  'Afet / Acil durum desteği',
  'Proje / Kurumsal iş birliği',
  'Diğer',
] as const

export const ABOUT = {
  lead: `Anadolu Güçbirliği Vakfı; eğitim, sağlık, spor, ekonomik ve kültürel dayanışma ile toplumsal kalkınma alanlarında faaliyet göstermek üzere kurulmuştur. Desteklerimiz öncelikle Anadolu Güçbirliği Holding ve grup firmaları çalışanları, çocukları ve birinci dereceden yakınlarına yöneliktir; aynı zamanda genel topluma açıktır.`,
  pillars: [
    {
      title: 'Amacımız',
      text: 'Eğitim, sağlık, spor ve toplumsal dayanışma alanlarında ihtiyacı olanlara adil ve sürdürülebilir destek sunmak.',
    },
    {
      title: 'Yaklaşımımız',
      text: 'Her dosya; belgelenebilir ihtiyaç, aciliyet ve vakıf senedindeki amaçlara uygunluk üzerinden incelenir. Statü tek başına karar değildir.',
    },
    {
      title: 'Kurucularımız',
      text: 'Vakıf; Anadolu Güçbirliği Holding A.Ş., Bellona Mobilya Sanayi ve Ticaret A.Ş. ile Doqu Ev Tekstili Sanayi ve Ticaret A.Ş. tarafından kurulmuştur.',
    },
  ],
} as const

/** Kurumsal sayfalar — Holding kaynaklı metinler (vakıf sitesinde yayınlanır) */
export const KURUMSAL_NAV = [
  { to: '/kurumsal/hakkinda', label: 'Hakkında' },
  { to: '/kurumsal/tarihce', label: 'Tarihçe' },
  { to: '/kurumsal/baskan', label: "Başkan’ın mesajı" },
  { to: '/kurumsal/ceo', label: 'CEO’nun mesajı' },
  { to: '/kurumsal/yonetim-kurulu', label: 'Yönetim kurulu' },
] as const

export const KURUMSAL_HAKKINDA = {
  eyebrow: 'Bizi tanıyın',
  title: 'Anadolu Güçbirliği Holding',
  paragraphs: [
    'Anadolu Güçbirliği Holding, üretim gücünü, yenilikçi yaklaşımı ve sürdürülebilirlik vizyonunu merkezine alan; mobilya ve tekstil sektörlerinde faaliyet gösteren güçlü markalarıyla Türkiye ekonomisine değer katan bir holding yapısıdır. Kurulduğu günden bu yana istikrarlı büyüme anlayışıyla hareket eden Holdingimiz, sanayi, üretim, perakende ve ihracat odaklı faaliyetleriyle hem ulusal hem de uluslararası pazarlarda etkin bir konuma sahiptir.',
    'Faaliyet gösterdiğimiz tüm alanlarda; kalite, güven, verimlilik ve müşteri memnuniyetini temel ilkelerimiz arasında görüyoruz. Güçlü organizasyon yapımız ve tecrübeli insan kaynağımızla, bünyemizde yer alan markaların rekabet gücünü artırmayı, sürdürülebilir büyümeyi desteklemeyi ve uzun vadeli değer üretmeyi hedefliyoruz.',
    'Anadolu Güçbirliği Holding, yalnızca ekonomik başarıyı değil; çevresel, sosyal ve yönetişim sorumluluklarını da iş yapış biçiminin ayrılmaz bir parçası olarak benimsemektedir. Enerji verimliliği, yenilenebilir enerji yatırımları, çevre dostu üretim süreçleri ve etik iş anlayışı doğrultusunda yürütülen çalışmalar, gelecek nesillere karşı taşıdığımız sorumluluğun somut göstergeleridir.',
    'İnsan odaklı yönetim anlayışımız doğrultusunda; çalışanlarımızın gelişimini destekleyen, iş ortaklarımızla uzun soluklu ve güvene dayalı ilişkiler kuran, müşterilerimizin beklentilerini önceliklendiren bir yaklaşım benimsiyoruz. Dijital dönüşüm, kurumsal yönetişim ve sürekli iyileştirme odaklı stratejilerimizle, değişen dünyaya uyum sağlayan dinamik bir yapı ile yolumuza devam ediyoruz.',
    'Anadolu Güçbirliği Holding olarak; güçlü markalarımız, sağlam kurumsal altyapımız ve sürdürülebilir gelecek vizyonumuzla, faaliyet gösterdiğimiz her alanda kalıcı değer üretmeyi ve ülke ekonomisine katkı sağlamayı kararlılıkla sürdürüyoruz.',
  ],
  vizyon:
    'Sürdürülebilir büyüme anlayışıyla, faaliyet gösterdiğimiz alanlarda güven ve değer yaratan lider bir holding olmayı hedeflemekteyiz.',
  misyon:
    'Anadolu Güçbirliği Holding bünyesindeki markalarla; sürdürülebilir büyüme odağında, ulusal ve uluslararası arenada değer üreten, ülke ekonomisine ve toplumsal kalkınmaya katkı sağlayan bir yapı oluşturmayı misyon edinmiştir.',
} as const

export const KURUMSAL_TARIHCE = {
  lead: `Anadolu Güçbirliği Holding, güçlü üretim ve ticaret tecrübesini kurumsal bir yapı altında birleştirmek amacıyla kurulmuştur. Kuruluşundan itibaren sanayi ve üretim odaklı büyüme stratejisiyle hareket eden Holdingimiz, bünyesinde yer alan markalarla yurt içi ve yurt dışı pazarlarda istikrarlı bir gelişim göstermiştir. Zaman içerisinde organizasyon yapısını güçlendiren Anadolu Güçbirliği Holding; sürdürülebilirlik, verimlilik ve yenilikçilik odaklı yatırımlarıyla faaliyet alanlarını genişleterek mobilya ve tekstil sektörlerinde güçlü bir holding yapısına ulaşmayı hedeflemektedir.`,
  highlight:
    'Anadolu Güçbirliği Holding A.Ş., Temmuz 2024’te Doqu Home, 15 Eylül 2025 itibarıyla ise Bellona markalarını bünyesine katmıştır.',
  milestones: [
    { date: 'Şubat 2024', text: 'Anadolu Güçbirliği Holding A.Ş. kuruldu.' },
    { date: 'Temmuz 2024', text: 'Doqu Home Tekstil A.Ş. bünyesine katıldı.' },
    { date: 'Eylül 2025', text: 'Bellona Mobilya A.Ş. bünyesine katıldı.' },
  ],
} as const

export const KURUMSAL_CEO = {
  name: 'Serdar KARAVİL',
  title: 'Yönetim Kurulu Üyesi & CEO',
  org: 'Anadolu Güçbirliği Holding',
  photo: '/kurumsal/serdar-karavil.jpg',
  greeting: 'Kıymetli İş Ortaklarımız,\nDeğerli Çalışma Arkadaşlarım;',
  paragraphs: [
    'Anadolu Güçbirliği Holding olarak; üretim gücünü, kurumsal yönetim anlayışını ve sürdürülebilir büyüme vizyonunu merkeze alan bir yapı ile yolumuza devam ediyoruz. Faaliyet gösterdiğimiz tüm alanlarda yalnızca bugünün ihtiyaçlarını değil, geleceğin beklentilerini de gözeten uzun vadeli bir bakış açısıyla hareket ediyoruz.',
    'Holdingimiz bünyesinde yer alan güçlü markalarımızla; kalite, güven ve verimlilik ilkelerini temel alıyor, değişen küresel dinamiklere uyum sağlayan esnek ve yenilikçi iş modelleri geliştiriyoruz. Dijital dönüşüm, operasyonel mükemmeliyet ve müşteri odaklı yaklaşım, büyüme stratejimizin ana unsurları arasında yer almaktadır. Tekstil ve mobilya alanında yaptığımız yatırımlar, sadece ticari başarılar değil, aynı zamanda ülkemize katma değer sağlama hedefimizin bir parçasıdır.',
    'Sürdürülebilirlik, Anadolu Güçbirliği Holding’in stratejik önceliklerinden biridir. Çevresel sorumluluk bilinciyle yürüttüğümüz enerji verimliliği çalışmaları, yenilenebilir enerji yatırımları ve sürdürülebilir üretim uygulamaları; gelecek nesillere karşı taşıdığımız sorumluluğun somut yansımalarıdır. Aynı zamanda sosyal sorumluluk, etik değerler ve şeffaf yönetişim anlayışı ile tüm paydaşlarımız için kalıcı değer üretmeyi hedefliyoruz.',
    'İnsan odaklı yönetim anlayışımız doğrultusunda; çalışanlarımızın gelişimini destekleyen, iş ortaklarımızla güvene dayalı ilişkiler kuran ve müşterilerimizin beklentilerini merkeze alan bir kurum kültürünü benimsiyoruz. Gücümüzü birliktelikten alıyor, ortak akıl ve güçlü ekip ruhu ile büyümemizi sürdürüyoruz.',
    'Önümüzdeki dönemde de Anadolu Güçbirliği Holding olarak; yenilikçi, çevreci ve sorumlu iş modelleriyle faaliyet gösterdiğimiz her alanda sürdürülebilir başarıyı hedeflemeye devam edeceğiz. Bu yolculukta bizlere güvenen tüm iş ortaklarımıza ve kıymetli çalışanlarımıza teşekkür eder, birlikte daha güçlü bir gelecek inşa edeceğimize olan inancımı paylaşmak isterim.',
  ],
} as const

export const KURUMSAL_BASKAN = {
  name: 'Abdulkadir KARAVİL',
  title: 'Yönetim Kurulu Başkanı',
  org: 'Anadolu Güçbirliği Holding',
  photo: '/kurumsal/abdulkadir-karavil.jpg',
  greeting: 'Değerli Paydaşlarımız,',
  paragraphs: [
    'Anadolu Güçbirliği Holding olarak; köklü üretim kültürümüzü, güçlü kurumsal değerlerimizle birleştirerek ülkemize, sektörlerimize ve topluma sürdürülebilir katkı sunma hedefiyle yol alıyoruz. Bugün; bünyemizde yer alan markalarımız ve şirketlerimizle yalnızca ekonomik büyümeyi değil, aynı zamanda uzun vadeli değer üretmeyi temel önceliğimiz olarak görüyoruz.',
    'İçinde bulunduğumuz çağ; hızla değişen tüketici beklentileri, teknoloji dönüşümü ve küresel rekabet dinamikleriyle yeni bir bakış açısını zorunlu kılıyor. Bizler bu dönüşümü; dijitalleşme, verimlilik, kalite, inovasyon ve insan odaklı yönetim anlayışıyla karşılıyor; rekabet gücümüzü artırırken kurumsal sorumluluk bilincimizi de daha ileriye taşıyoruz.',
    'Holdingimizin temelinde “birlikten doğan güç” anlayışı vardır. Bu anlayış; ortak akla dayalı karar alma kültürümüzü, paydaşlarımızla güçlü ilişkilerimizi ve ekip ruhunu besleyen en önemli değerimizdir. Çalışma arkadaşlarımızın emeği, iş ortaklarımızın güveni ve paydaşlarımızın desteğiyle, ülkemizden dünyaya uzanan başarı hikâyeleri üretmeye devam edeceğimize yürekten inanıyorum.',
    'Geleceğe yürürken; sürdürülebilir büyüme yaklaşımımız doğrultusunda çevreye duyarlı üretim, etik değerler, şeffaflık ve kurumsal yönetim ilkelerine bağlılık temel rehberimiz olacaktır. Anadolu Güçbirliği Holding’i, faaliyet gösterdiği her alanda daha güçlü, daha yenilikçi ve daha saygın bir konuma taşımak için kararlılıkla çalışmayı sürdüreceğiz. Bu yolculukta emeği geçen tüm çalışma arkadaşlarımıza, iş ortaklarımıza ve paydaşlarımıza teşekkür ediyor; sizleri saygıyla selamlıyorum.',
  ],
} as const

export const KURUMSAL_YONETIM: {
  name: string
  title: string
  photo?: string
}[] = [
  {
    name: 'Abdulkadir KARAVİL',
    title: 'Yönetim Kurulu Başkanı',
    photo: '/kurumsal/abdulkadir-karavil.jpg',
  },
  {
    name: 'Ahmet Kamil ŞİRİKÇİ',
    title: 'Yönetim Kurulu Başkan Vekili',
    photo: '/kurumsal/ahmet-kamil-sirikci.jpg',
  },
  {
    name: 'Serdar KARAVİL',
    title: 'Yönetim Kurulu Üyesi & CEO',
    photo: '/kurumsal/serdar-karavil.jpg',
  },
  {
    name: 'Mustafa SİVİŞ',
    title: 'Yönetim Kurulu Üyesi',
    photo: '/kurumsal/mustafa-sivis.jpg',
  },
  {
    name: 'Lütfi BEŞDOK',
    title: 'Yönetim Kurulu Üyesi',
    photo: '/kurumsal/lutfi-besdok.jpg',
  },
  {
    name: 'Hakan ÖZTÜRK',
    title: 'Yönetim Kurulu Üyesi',
    photo: '/kurumsal/hakan-ozturk.jpg',
  },
  {
    name: 'Mehmet KARAVİL',
    title: 'Yönetim Kurulu Üyesi',
    photo: '/kurumsal/mehmet-karavil.jpg',
  },
]

export const SUPPORT_AREAS = [
  {
    title: 'Eğitim',
    text: 'Okul, üniversite ve mesleki gelişim süreçlerinde burs, eğitim materyali, ulaşım veya eğitim sürekliliğini bozan mali engeller için destek talep edilebilir. Belgelenebilir eğitim ihtiyacı ve devamlılık esas alınır.',
  },
  {
    title: 'Sağlık',
    text: 'Tedavi, tetkik, ilaç, cihaz veya tedaviye erişimi etkileyen maliyetler için başvurular alınır. Sağlık raporları, fatura/proforma ve aciliyet bilgisi değerlendirmede belirleyicidir.',
  },
  {
    title: 'Spor',
    text: 'Sporcu gelişimi, kulüp/federasyon süreçleri, ekipman veya yarışma katılımı gibi talepler değerlendirilir. Özellikle çocuk ve gençlerin spora erişimini güçlendiren başvurular önceliklidir.',
  },
  {
    title: 'Ekonomik / sosyal destek',
    text: 'Temel yaşam ihtiyacı, geçici ekonomik zorluk veya sosyal dayanışma gerektiren durumlarda destek başvurusu yapılabilir. İhtiyaç belgesi ve mevcut destek kaynakları sorulabilir.',
  },
  {
    title: 'Kültür ve sanat',
    text: 'Kültürel üretime katılım, sanat eğitimi veya toplumun kültürel hayata erişimini artıran bireysel ve kurumsal talepler bu başlıkta incelenir.',
  },
  {
    title: 'Toplumsal kalkınma',
    text: 'Yerel kalkınma, istihdamı güçlendiren sosyal projeler ve toplum yararına sürdürülebilir çalışmalar için iş birliği ve destek talepleri alınır.',
  },
  {
    title: 'Afet / acil durum',
    text: 'Afet, ani sağlık krizi veya ertelenmesi halinde ciddi sonuç doğurabilecek acil ihtiyaçlarda hızlı değerlendirme mekanizması işletilir. Destekleyici belgeler mümkün olduğunca erken iletilmelidir.',
  },
  {
    title: 'Proje / kurumsal iş birliği',
    text: 'STK’lar, kamu kurumları ve sosyal etki odaklı kuruluşlarla ortak proje, protokol ve kurumsal destek başvuruları bu kategoride değerlendirilir.',
  },
] as const

/** Genel bilgilendirme — başvuru koşulları */
export const BASVURU_KOSULLAR = [
  'T.C. vatandaşı olmak',
  'Maddi desteğe ihtiyacı olmak',
  'Kazanç getirici bir işte çalışmamak',
  'Öğrenimi sırasında kısa süreli uzaklaştırmadan daha ağır bir ceza almamış olmak',
  'Evli olmamak',
  'Kardeşlerinden Anadolu Güçbirliği Vakfı bursu alan olmamak (birden fazla kardeş başvurursa başarı durumu yüksek olan değerlendirilir)',
  'Başvuru tarihinde 25 yaşını doldurmamış olmak',
  'Önlisans veya lisans programında öğrenim görmek (açık öğretim, yurt dışı üniversite ve dışarıdan öğrenim görenler hariç)',
] as const

export type BelgeMadde = {
  text: string
  alt?: string[]
}

/** Değerlendirme sonrası istenecek belgeler */
export const BASVURU_BELGELER: BelgeMadde[] = [
  { text: 'Burs başvuru formu' },
  { text: 'Onaylı öğrenci belgesi' },
  { text: 'Vesikalık fotoğraf (1 adet)' },
  { text: 'e-Devlet’ten alınacak vukuatlı nüfus kayıt örneği' },
  { text: 'e-Devlet’ten alınacak adli sicil kaydı' },
  { text: 'Öğrenim gören kardeşlerin öğrenim belgeleri' },
  {
    text: 'Ailenin gelir durumunu gösterir belge:',
    alt: [
      'Maaşlı çalışanlar için onaylı ücret bordrosu',
      'Emekli olanlar için aylık ya da üç aylık maaşı gösterir belgenin onaylı örneği',
      'Çiftçi ise onaylı yıllık gelir belgesi örneği',
      'Esnaf veya serbest meslek sahibi ise vergi levhası örneği',
    ],
  },
  {
    text: 'Aileniz kirada oturuyor ise kira kontratı; kredi ile ev alınmış ise kredi ödemelerine ilişkin belge veya dekont örneği',
  },
  { text: 'Ailenizin ikamet belgesi' },
  {
    text: 'Ailenizden uzakta öğrenim görüyorsanız ikamet belgeniz; kaldığınız yer pansiyon, misafirhane, özel yurt veya devlet yurdu ise ilgili belge; kira ise kontrat',
  },
  {
    text: 'Üniversiteyi yeni kazananlar için ÖSYM sınav sonuç belgesi ile başarı sırası ve yerleşme puanını gösterir belge',
  },
  {
    text: 'Ara sınıftakiler için bitirilen öğretim yılındaki başarı belgesi (transkript)',
  },
  {
    text: 'Çalışmayan anne ve/veya baba için Sosyal Güvenlik Kurumu’ndan alınacak, çalışmadıklarına dair belge',
  },
  {
    text: 'Öğrenci adına açılan banka hesap bilgileri (banka adı, şube adı ve IBAN numarası)',
  },
]

export const BASVURU_FAQ = [
  {
    q: 'Kimler burs başvurusu yapabilir?',
    a: 'Önlisans ve lisans öğrencilerinden maddi desteğe ihtiyacı olan, başvuru koşullarını sağlayan T.C. vatandaşları başvurabilir. Yüksek lisans ve doktora öğrencileri bu burs kapsamı dışındadır. Holding ve grup şirketi çalışanları ile yakınları öncelikli değerlendirilebilir.',
  },
  {
    q: 'Başvuru nasıl değerlendirilir?',
    a: 'Online formdaki beyanlar üzerinden ön değerlendirme yapılır. Uygun görülen adaylardan belgeler istenir; beyan ile belgeler arasında çelişki olması halinde başvuru geçersiz sayılır.',
  },
  {
    q: 'Belgeleri ne zaman yüklemeliyim?',
    a: 'Belgeler başvuru anında zorunlu değildir. Değerlendirme sonrası burs alması uygun görülen öğrencilerden istenir. İletişim e-posta ve SMS ile yapıldığı için telefon ve e-posta bilgilerinizin doğru olduğundan emin olun.',
  },
  {
    q: 'Başvuru dönemi kapalıysa ne olur?',
    a: 'Dönem kapalıyken online form üzerinden yeni başvuru alınmaz. Açılış ve kapanış tarihleri genel bilgilendirme sayfasında yer alır.',
  },
  {
    q: 'Telefon doğrulaması neden gerekir?',
    a: 'Kimlik doğrulama ve iletişim güvenliği için TC kimlik / telefon ile SMS doğrulaması yapılır. Doğrulanan oturum üzerinden taslak kaydedilir ve gönderilir.',
  },
  {
    q: 'Birden fazla başvuru yapabilir miyim?',
    a: 'Aynı TC kimlik numarası ile sistemde tek başvuru kaydı tutulur. Dönem içinde güncelleme veya yeniden gönderim kuralları form akışında belirtilir.',
  },
  {
    q: 'Sonuç nasıl öğrenilir?',
    a: 'Burs verilmesi uygun görülen öğrenciler e-posta veya SMS yoluyla bilgilendirilir.',
  },
] as const

