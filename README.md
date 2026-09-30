# Anadolu Güçbirliği Vakfı

Türkçe kurumsal site + çok adımlı destek başvurusu.

## Başvuru akışı

1. KVKK onayı  
2. T.C. + cep telefonu  
3. SMS doğrulama (6 hane)  
4. Bilgiler (TC ile eşleşen kayıt getirilir / düzenlenir)  
5. Özet + koşul beyanları (+ yazdır / PDF)  
6. Sonuç  

Kayıtlar `BoytasWH.AGB_Vakif_Basvuru` tablosunda **T.C. kimlik no** ile tutulur.

## Çalıştırma

```bash
npm run dev:api
npm run dev
```

- Site: http://localhost:5173  
- API: http://localhost:5000  

## IIS yayınlama (tek site)

Sunucuda **ASP.NET Core Hosting Bundle** (net10) kurulu olmalı.

Bilgisayarında proje klasöründe:

```bash
npm run build:iis
```

Bu komut siteyi derleyip `publish/` klasörüne koyar (içinde API + `wwwroot` frontend).

Sonra:
1. `publish` klasörünü sunucuya kopyala (örn. `C:\inetpub\AgbVakif`).
2. IIS’te yeni site / uygulama oluştur; fiziksel yol bu klasör olsun.
3. Application Pool → **No Managed Code**, 64-bit.
4. Siteye hostname bağla: `anadolugucbirligivakfi.org.tr` ve isteğe bağlı `www.anadolugucbirligivakfi.org.tr` (HTTPS sertifikası tak).
5. Klasöre yazma izni ver: `Uploads`, `App_Data` (IIS AppPool kimliği).
6. `appsettings.json` içinde SQL / SMS / e-posta canlı ayarları doğru olsun.

Kontrol: `https://anadolugucbirligivakfi.org.tr/api/health` → `{"status":"ok"...}`  
Ana sayfa ve `/basvuru/form` React rotası açılmalı.

Admin’de güncelleme **405** verirse IIS WebDAV engelliyor demektir.  
Site tamamen **500** olursa `web.config` bozulmuş olabilir: `aspNetCore` satırı kaybolmamalı.  
`api/web.config.iis.example` dosyasına bak; publish çıktısındaki `web.config` ile karşılaştır.  
Hata ayıklamak için `logs` klasörü oluşturup `stdoutLogEnabled="true"` yap.

## Başvuru dönemi (dinamik)

Tablo: `BoytasWH.AGB_Vakif_Config` (AGB’ye özel ayarlar; Graph hâlâ `PB_Config`).

| ConfigKey | Örnek |
|-----------|--------|
| `BasvuruBaslik` | `2026–2027 Lisans Başvurusu` |
| `BasvuruBaslikNot` | Üst başlığın altındaki serbest not |
| `BasvuruFormBaslik` | `Lisans Burs Başvurusu Formu` |
| `BasvuruFormBaslikNot` | Form başlığının altındaki açıklama notu |
| `BasvuruBaslangic` | `2026-09-07T09:00:00` |
| `BasvuruBitis` | `2026-09-30T17:00:00` |

API açılışında `Create_AGB_Vakif_Config.sql` çalışır (tablo + yoksa seed). Endpoint: `GET /api/basvuru/donem`



## Belge depolama (ortak alan)

`appsettings.json`:

```json
"Storage": {
  "BelgeRootPath": "\\\\10.100.3.126\\bilgi_teknolojileri\\YAZILIM_UYGULAMA\\HIZMETE_OZEL"
}
```

Boş bırakılırsa yerel `App_Data/belgeler` kullanılır.  
Dosyalar `{BelgeRoot}/{BasvuruNo}/{guid}.pdf` şeklinde kaydedilir; veritabanında **tam fiziksel yol** (`SaklananAd`) tutulur.  
IIS AppPool kimliğinin bu UNC paylaşımına **okuma/yazma** izni olmalıdır. Hero medyası için site klasöründeki `Uploads` (özellikle `Uploads\hero`) yazılabilir olmalı.

`Sms:Provider`: `Turatel` (Bellona OTP / Turatel XML) | `Bms` (Erciyes) | `Development` (sadece log)

Turatel ayarları `appsettings` → `Sms:Turatel`. Gerçek gönderimde `ExposeDebugOtp: false`.

## Graph e-posta

`PB_Config`: `GraphTenantID`, `GraphClientID`, `GraphClientSecret`  
Gönderen: `Email:Graph:SenderUserId`

## SQL

Tablo scripti: `api/Sql/Create_AGB_Vakif_Basvuru.sql` (API açılışta da çalıştırmayı dener).
