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
  address: 'Kayseri OSB Mahallesi 16. Cadde No: 2/B 38070 Melikgazi / Kayseri',
  phones: ['+90 (352) 321 16 70', '+90 (352) 321 16 75'],
  email: APPLICATION_EMAIL,
  eTebligat: '',
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
  body: `Amacımız, gerçek ve belgelenebilir ihtiyaçlara adil, şeffaf ve sürdürülebilir bir değerlendirme süreciyle yanıt vermektir. Başvurular vakıf senedindeki amaçlara uygunluk, ihtiyaç ve aciliyet üzerinden incelenir; statü tek başına destek kararı için yeterli görülmez.`,
  pillars: [
    {
      title: 'Kimler başvurabilir?',
      text: 'Holding ve grup şirketi çalışanları, çocukları ve birinci derece yakınları öncelikli olmak üzere bireysel başvurular ile kurum / STK başvuruları kabul edilir.',
    },
    {
      title: 'Nasıl değerlendirilir?',
      text: 'Ön kontrol, ihtiyaç ve aciliyet incelemesi, mali uygunluk ve çıkar çatışması kontrolünün ardından karar; onay, kısmi onay, ek belge talebi veya uygun bulunmama şeklinde kayıt altına alınır.',
    },
    {
      title: 'Nereden doğduk?',
      text: 'Vakıf; Anadolu Güçbirliği Holding A.Ş., Bellona Mobilya Sanayi ve Ticaret A.Ş. ile Doqu Ev Tekstili Sanayi ve Ticaret A.Ş. tarafından kurulmuştur.',
    },
  ],
} as const

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

export const EVALUATION_STEPS = [
  'Vakıf amacına uygunluk ve zorunlu bilgilerin kontrolü',
  'İhtiyaç ve belgelenebilirliğin incelenmesi',
  'Aciliyet, etki ve mali uygunluğun değerlendirilmesi',
  'Kararın gerekçesiyle birlikte kayıt altına alınması',
] as const
