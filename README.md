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



## SMS

`Sms:Provider`: `Turatel` (Bellona OTP / Turatel XML) | `Bms` (Erciyes) | `Development` (sadece log)

Turatel ayarları `appsettings` → `Sms:Turatel`. Gerçek gönderimde `ExposeDebugOtp: false`.

## Graph e-posta

`PB_Config`: `GraphTenantID`, `GraphClientID`, `GraphClientSecret`  
Gönderen: `Email:Graph:SenderUserId`

## SQL

Tablo scripti: `api/Sql/Create_AGB_Vakif_Basvuru.sql` (API açılışta da çalıştırmayı dener).
