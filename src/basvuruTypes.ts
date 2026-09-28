export type WizardStep =
  | 'kvkk'
  | 'kimlik'
  | 'sms'
  | 'bilgiler'
  | 'detay'
  | 'beyanlar'
  | 'ozet'
  | 'sonuc'
  | 'profil'

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
  basvuruNo?: string
  tcKimlikNoMasked?: string
  telefonMasked?: string
  ad: string
  soyad: string
  dogumTarihi: string
  dogumYeri: string
  medeniDurum: string
  eposta: string
  yakinTelefon: string
  yakinKim: string
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
  /** Çoklu seçim: Anne;Baba;Eş */
  birlikteYasadigiKisiler: string
  esAylikGelir: string
  /** Seçilen kişilerin gelir toplamı (otomatik) */
  haneGeliri: string
  kardesIlkokul: string
  kardesYuksek: string
  oturdugunuzEv: string
  evKiraBedeli: string
  aracVarMi: string
  aracMarkaModel: string
  aracYili: string
  ozelDurumTipi: string
  ozelDurum: string
  // Eğitim
  universite: string
  universiteAdi: string
  fakulte: string
  fakulteAdi: string
  bolum: string
  bolumAdi: string
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
  baskaBursMiktari: string
  // Beyanlar
  beyanCalismiyor: boolean
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
  medeniDurum: '',
  eposta: '',
  yakinTelefon: '',
  yakinKim: '',
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
  birlikteYasadigiKisiler: '',
  esAylikGelir: '',
  haneGeliri: '',
  kardesIlkokul: '0',
  kardesYuksek: '0',
  oturdugunuzEv: '',
  evKiraBedeli: '',
  aracVarMi: '',
  aracMarkaModel: '',
  aracYili: '',
  ozelDurumTipi: '',
  ozelDurum: '',
  universite: '',
  universiteAdi: '',
  fakulte: '',
  fakulteAdi: '',
  bolum: '',
  bolumAdi: '',
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
  baskaBursMiktari: '',
  beyanCalismiyor: false,
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

export const MEDENI_DURUM = ['Bekar', 'Evli'] as const

export const HANE_KISI_SAYILARI = Array.from({ length: 16 }, (_, i) => String(i))

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
  return ['Hazırlık', '1', '2', '3', '4', '5', '6'].includes(sinif)
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
function yearRange(from: number, to: number) {
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  return Array.from({ length: end - start + 1 }, (_, i) => String(end - i))
}
/** Üniversiteye kayıt: son 8 yıl */
export const KAYIT_YILLARI = yearRange(yearNow - 8, yearNow)
/** Normal bitirme: bu yıl ve 10 yıl sonrası */
export const BITIRME_YILLARI = yearRange(yearNow, yearNow + 10)
export const ARAC_YILLARI = Array.from({ length: 45 }, (_, i) => String(yearNow - i))

export const KARDEŞ_SAYILARI = Array.from({ length: 11 }, (_, i) => String(i))
