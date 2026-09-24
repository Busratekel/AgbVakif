export type WizardStep =
  | 'kvkk'
  | 'kimlik'
  | 'sms'
  | 'bilgiler'
  | 'onay'
  | 'sonuc'

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'kvkk', label: 'KVKK Onayı' },
  { id: 'kimlik', label: 'Kimlik' },
  { id: 'sms', label: 'SMS Kodu' },
  { id: 'bilgiler', label: 'Bilgiler' },
  { id: 'onay', label: 'Onay' },
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
  statu: string
  kategori: string
  talepTutari: string
  talepOzeti: string
  beyanCalismiyor: boolean
  beyanAdliSicil: boolean
  beyanBilgiDogru: boolean
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
  statu: '',
  kategori: '',
  talepTutari: '',
  talepOzeti: '',
  beyanCalismiyor: false,
  beyanAdliSicil: false,
  beyanBilgiDogru: false,
})

const RIZE = 'Ri' + 'ze'

export const ILLER = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', RIZE,
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
]
