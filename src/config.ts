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

/** Ana sayfa — hero altı iyi niyet beyanı */
export const HERO_BELOW_MESSAGE = {
  title: 'İyi Niyet Beyanı',
  paragraphs: [
    'Biz Vakfedenler; iyiliğin çoğaldığı, dayanışmanın güçlendiği ve kimsenin kendini yalnız hissetmediği bir toplum hayaliyle bu Vakfı kuruyoruz. Bu Vakıf, insanın insana omuz verdiği, umudun paylaşıldıkça çoğaldığı, merhametin ve sorumluluğun yol gösterici olduğu bir iyilik kapısıdır. Vakfa emanet edilen her değerin bu anlayışla yaşatılması ve her adımın vicdan, hakkaniyet ve iyi niyetle atılması en içten dileğimizdir.',
    'Bu Vakıf, Vakıf Resmi Senedinin altında unvanı ve adresi yazılı tüzel kişi tarafından Türk Medeni Kanunu hükümlerine göre kurulmuştur.',
  ],
} as const

export const CONTACT = {
  email: 'agbvakfi@anadolugucbirligi.com.tr',
  phone: '+90 212 438 25 00',
  addressLines: [
    'Organize Sanayi Bölgesi 16. Cd. No: 2B',
    'Melikgazi / KAYSERİ',
  ],
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=Organize+Sanayi+B%C3%B6lgesi+16.+Cd.+No:+2B+Melikgazi+Kayseri',
} as const

/** Yardım başvurusu — başvuru sahibi statüsü */
export const STATUSES_YARDIM = [
  'Anadolu Güçbirliği Holding çalışanı',
  'Grup şirketi çalışanı',
  'Çalışanın çocuğu',
  'Çalışanın birinci derece yakını',
  'Diğer / Bireysel başvuru',
  'Kurum / STK başvurusu',
] as const

/** Burs başvurusu — başvuru sahibi statüsü */
export const STATUSES_BURS = [
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
  { to: '/kurumsal/yonetim-kurulu', label: 'Yönetim kurulu' },
] as const

export const BASVURU_NAV = [
  //{ to: '/basvuru/istatistikler', label: 'İstatistikler', end: false },
  { to: '/basvuru', label: 'Genel bilgilendirme', end: true },
  { to: '/basvuru/sss', label: 'Burslar hakkında SSS', end: false },
  { to: '/basvuru/belgeler', label: 'Burs için gerekli belgeler', end: false },
  { to: '/basvuru/form', label: 'Burs başvurusu', end: false },
] as const

export const YARDIM_NAV = [
  { to: '/yardim', label: 'Genel bilgilendirme', end: true },
  { to: '/yardim/form', label: 'Yardım başvurusu', end: false },
] as const

export const MEDYA_NAV = [
  { to: '/medya/faaliyet-raporu', label: 'Faaliyet raporu' },
  { to: '/medya/haber', label: 'Haber' },
  { to: '/medya/basin-bultenleri', label: 'Basın bültenleri' },
  { to: '/medya/kurumsal-kimlik', label: 'Kurumsal kimlik' },
] as const

export const KURUMSAL_HAKKINDA = {
  eyebrow: 'Bizi tanıyın',
  title: 'Anadolu Güçbirliği Vakfı',
  paragraphs: [
    'Anadolu Güçbirliği Vakfı toplumsal dayanışmayı güçlendirmek, insan hayatına kalıcı değer katmak ve geleceğe umutla bakan güçlü bir toplumun oluşmasına katkı sağlamak amacıyla 2026 yılında kurulmuştur.',
    'İnsana, topluma ve sürdürülebilir kalkınmaya verdiği değerden ilham alan Vakfımız; öncelikli olarak Holding ve grup şirketlerinde görev yapan çalışanlarımızın, çocuklarının ve birinci dereceden yakınlarının yaşamlarına katkı sağlamayı, bununla birlikte faaliyetlerini toplumun tüm kesimlerine açık bir anlayışla sürdürmeyi amaçlamaktadır.',
    'Sağlık, eğitim, spor, ekonomik ve kültürel dayanışma ile toplumsal kalkınma başta olmak üzere farklı alanlarda projeler geliştiren Anadolu Güçbirliği Vakfı; ihtiyaçların doğru tespit edildiği, kaynakların etkin ve şeffaf biçimde değerlendirildiği, sürdürülebilir ve uzun vadeli fayda sağlayan çalışmalar gerçekleştirmeyi hedeflemektedir.',
    'Yurt içinde ve yurt dışında gerçekleştireceğimiz faaliyetlerle; bireylerin gelişimine destek olmayı, eğitim, sağlık ve fırsat eşitliğine katkı sağlamayı, sosyal dayanışmayı güçlendirmeyi ve toplumun ortak değerlerine sahip çıkan projeleri hayata geçirmeyi önemsiyoruz.',
    'İyiliği çoğaltan, dayanışmayı güçlendiren ve geleceğe değer bırakan bir anlayışla; birlikte daha güçlü bir gelecek için çalışıyoruz.',

  ],
  vizyon:
    'İnsanı odağına alan; eğitimden sağlığa, spordan kültüre ve toplumsal kalkınmaya kadar farklı alanlarda sürdürülebilir değer üreten, güvenilir ve örnek gösterilen bir vakıf olarak toplumsal gelişime katkı sağlamak.',
  misyon:
    'Çalışanları, aileleri ve toplumun farklı kesimlerinin ihtiyaçlarına yönelik; eğitim, sağlık, spor, ekonomik ve kültürel dayanışma ile toplumsal kalkınma alanlarında erişilebilir, sürdürülebilir ve kalıcı fayda sağlayan çalışmalar gerçekleştirmek. Toplumsal dayanışma kültürünü güçlendirmek, fırsat eşitliğine katkıda bulunmak, ihtiyaç sahiplerine destek olmak ve insan hayatına dokunan projeler geliştirerek bugünden geleceğe değer taşımak.',
} as const

export const KURUMSAL_TARIHCE = {
  lead: `Anadolu Güçbirliği Vakfı, güçlü üretim ve ticaret tecrübesini kurumsal bir yapı altında birleştirmek amacıyla kurulmuştur. Kuruluşundan itibaren sanayi ve üretim odaklı büyüme stratejisiyle hareket eden Holdingimiz, bünyesinde yer alan markalarla yurt içi ve yurt dışı pazarlarda istikrarlı bir gelişim göstermiştir. Zaman içerisinde organizasyon yapısını güçlendiren Anadolu Güçbirliği Vakfı; sürdürülebilirlik, verimlilik ve yenilikçilik odaklı yatırımlarıyla faaliyet alanlarını genişleterek mobilya ve tekstil sektörlerinde güçlü bir holding yapısına ulaşmayı hedeflemektedir.`,
  highlight:
    'Anadolu Güçbirliği Vakfı, 27 Eylül 2026 tarihinde kurulmuştur.',
  milestones: [
    { date: '27 Eylül 2026', text: 'Anadolu Güçbirliği Vakfı kuruldu.' },
  ],
} as const


export const KURUMSAL_BASKAN = {
  name: 'Lütfi BEŞDOK',
  title: 'Yönetim Kurulu Başkanı',
  org: 'Anadolu Güçbirliği Vakfı',
  photo: '/kurumsal/lutfi-besdok.jpg',
  greeting: 'Değerli Paydaşlarımız,',
  paragraphs: [
    'Anadolu Güçbirliği Vakfı’nı, dayanışmanın gücüne olan inancımızın ve topluma karşı taşıdığımız sorumluluk bilincinin bir yansıması olarak 2026 yılında hayata geçirdik.',
    'Bizler için güçlü bir gelecek yalnızca ekonomik büyümeyle değil; eğitimde fırsat eşitliğinin güçlenmesi, sağlık hizmetlerine erişimin desteklenmesi, kültürel değerlerin yaşatılması ve ihtiyaç anında insanların birbirine omuz verebilmesiyle mümkündür.',
    'Vakfımızın attığı her adımda güven, şeffaflık, sürdürülebilirlik ve insan odaklı yaklaşımı temel ilke olarak benimseyeceğiz.',
    'İnanıyoruz ki iyilik paylaşıldıkça çoğalır, dayanışma güçlendikçe toplumlar daha sağlam bir geleceğe yürür.',
    'Birlikte üreten, birlikte paylaşan ve birlikte güçlenen bir gelecek için çalışmaya devam edeceğiz.',
  ],
} as const

export const KURUMSAL_YONETIM: {
  name: string
  title: string
  photo?: string
}[] = [
  {
    name: 'Lütfi BEŞDOK',
    title: 'Yönetim Kurulu Başkanı',
  },
  {
    name: 'Serdar KARAVİL',
    title: 'Yönetim Kurulu Başkan Vekili',
  },
  {
    name: 'Muharrem YERER',
    title: 'Yönetim Kurulu Üyesi',
  },
  {
    name: 'Adem OFRAZ',
    title: 'Yönetim Kurulu Üyesi',
  },
  {
    name: 'Ömer ARSLAN',
    title: 'Yönetim Kurulu Üyesi',
  },
  {
    name: 'Doğanur ATABAY IŞIK',
    title: 'Yönetim Kurulu Üyesi',
  },
  {
    name: 'Kübra ÖZPINAR',
    title: 'Yönetim Kurulu Üyesi',
  },
]


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
    a: 'Aynı TC kimlik numarası ile her takvim yılında (burs / yardım tipine göre) bir başvuru kaydı tutulur. Yeni yılın başvuru dönemi açıldığında aynı TC ile yeniden başvurabilirsiniz; önceki yılların kayıtları geçmiş olarak saklanır.',
  },
  {
    q: 'Sonuç nasıl öğrenilir?',
    a: 'Burs verilmesi uygun görülen öğrenciler e-posta veya SMS yoluyla bilgilendirilir veya Başvurum kısmından sonuçları görüntüleyebilir.',
  },
] as const

