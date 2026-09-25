export type WizardStep =
  | 'kvkk'
  | 'kimlik'
  | 'sms'
  | 'bilgiler'
  | 'detay'
  | 'beyanlar'
  | 'ozet'
  | 'sonuc'

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'kvkk', label: 'KVKK Onayı' },
  { id: 'kimlik', label: 'Kimlik' },
  { id: 'sms', label: 'SMS Onayı' },
  { id: 'bilgiler', label: 'İletişim Bilgileri' },
  { id: 'detay', label: 'Aile / Eğitim' },
  { id: 'beyanlar', label: 'Beyanlar' },
  { id: 'ozet', label: 'Özet' },
  { id: 'sonuc', label: 'Sonuç' },
]

export type BasvuruData = {
  id?: string
  tcKimlikNoMasked?: string
  telefonMasked?: string
  ad: string
  soyad: string
  dogumTarihi: string
  dogumYeri: string
  eposta: string
  yakinTelefon: string
  il: string
  ilce: string
  acikAdres: string
  statu: string
  kategori: string
  // Aile
  babaAdi: string
  babaSagMi: string
  babaMeslegi: string
  babaAylikGelir: string
  anneAdi: string
  anneSagMi: string
  anneMeslegi: string
  anneAylikGelir: string
  anneBabaBirlikte: string
  kardesIlkokul: string
  kardesYuksek: string
  oturdugunuzEv: string
  aracVarMi: string
  aracMarkaModel: string
  ozelDurumTipi: string
  ozelDurum: string
  // Eğitim
  universite: string
  fakulte: string
  bolum: string
  kayitYili: string
  sinif: string
  bitirmeYili: string
  hazirlik: string
  ailedenUzakta: string
  konaklamaDurumu: string
  konaklamaUcreti: string
  // Başarı / burs
  yksSiralamasi: string
  notOrtalamasi: string
  baskaBurs: string
  // Beyanlar
  beyanCalismiyor: boolean
  beyanEvliDegil: boolean
  beyanDisiplin: boolean
  beyanAdliSicil: boolean
  beyanOrgunOgretim: boolean
  durum?: string
}

export const emptyBasvuru = (): BasvuruData => ({
  ad: '',
  soyad: '',
  dogumTarihi: '',
  dogumYeri: '',
  eposta: '',
  yakinTelefon: '',
  il: '',
  ilce: '',
  acikAdres: '',
  statu: '',
  kategori: '',
  babaAdi: '',
  babaSagMi: '',
  babaMeslegi: '',
  babaAylikGelir: '',
  anneAdi: '',
  anneSagMi: '',
  anneMeslegi: '',
  anneAylikGelir: '',
  anneBabaBirlikte: '',
  kardesIlkokul: '0',
  kardesYuksek: '0',
  oturdugunuzEv: '',
  aracVarMi: '',
  aracMarkaModel: '',
  ozelDurumTipi: '',
  ozelDurum: '',
  universite: '',
  fakulte: '',
  bolum: '',
  kayitYili: '',
  sinif: '',
  bitirmeYili: '',
  hazirlik: '',
  ailedenUzakta: '',
  konaklamaDurumu: '',
  konaklamaUcreti: '',
  yksSiralamasi: '',
  notOrtalamasi: '',
  baskaBurs: '',
  beyanCalismiyor: false,
  beyanEvliDegil: false,
  beyanDisiplin: false,
  beyanAdliSicil: false,
  beyanOrgunOgretim: false,
})

export const OZEL_DURUM_TIPLERI = [
  'Yok',
  'Şehit yakını',
  'Gazi yakını',
  'Engelli / engelli yakını',
  'Yetim / öksüz',
  'Diğer',
] as const

export const EVET_HAYIR = ['Evet', 'Hayır'] as const

export const SAG_MI = ['Evet', 'Hayır'] as const

export const EV_DURUMU = [
  'Kendimize ait',
  'Kira',
  'Lojman',
  'Akraba yanında',
  'Diğer',
] as const

export const KONAKLAMA = [
  'KYK yurdu',
  'Özel yurt',
  'Ev / apart',
  'Akraba yanında',
  'Diğer',
] as const

export const YKS_DILIMLERI = [
  'İlk 10.000',
  '10.001 – 50.000',
  '50.001 – 100.000',
  '100.001 – 250.000',
  '250.001 ve üzeri',
] as const

/** Yeni başlayan öğrenciler → YKS; 1–6. sınıf → not ortalaması */
export function isYeniOgrenci(sinif: string) {
  return sinif === 'Yeni Başlayan'
}

export function isAraSinif(sinif: string) {
  return ['Hazırlık','1', '2', '3', '4', '5', '6'].includes(sinif)
}

export const SINIFLAR = [
  'Yeni Başlayan',
  'Hazırlık',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
] as const

const yearNow = new Date().getFullYear()
export const YILLAR = Array.from({ length: 15 }, (_, i) => String(yearNow + 2 - i))

export const KARDEŞ_SAYILARI = Array.from({ length: 11 }, (_, i) => String(i))
