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

## SMS

Şimdilik `DevelopmentSmsSender` kodu **API log’una** yazar. Development yanıtında `debugOtp` da döner (test için).

Gerçek SMS (Netgsm vb.) bağlanınca `ISmsSender` implementasyonu değiştirilir.

## Graph e-posta

`PB_Config`: `GraphTenantID`, `GraphClientID`, `GraphClientSecret`  
Gönderen: `Email:Graph:SenderUserId`

## SQL

Tablo scripti: `api/Sql/Create_AGB_Vakif_Basvuru.sql` (API açılışta da çalıştırmayı dener).
