using AgbVakif.Api.Data;
using AgbVakif.Api.Models;
using AgbVakif.Api.Options;
using AgbVakif.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api;

public static class BasvuruEndpoints
{
    public static void MapBasvuruEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/basvuru");

        group.MapGet("/donem", HandleDonem);
        group.MapGet("/istatistik", HandleIstatistik);
        group.MapPost("/kimlik", HandleKimlik);
        group.MapPost("/sms-dogrula", HandleSmsDogrula);
        group.MapPost("/sms-tekrar", HandleSmsTekrar);
        group.MapGet("/me", HandleGetMe);
        group.MapPut("/me", HandleSaveMe);
        group.MapPost("/me/gonder", HandleSubmitMe);
    }

    private static async Task<IResult> HandleDonem(BoytasWhContext db, CancellationToken ct)
    {
        var keys = new[]
        {
            "BasvuruBaslik",
            "BasvuruBaslikNot",
            "BasvuruFormBaslik",
            "BasvuruFormBaslikNot",
            "BasvuruBaslangic",
            "BasvuruBitis",
            "PopupAktif",
            "PopupBaslik",
            "PopupMetin",
        };

        var rows = await db.AGB_Vakif_Config
            .AsNoTracking()
            .Where(x => keys.Contains(x.ConfigKey))
            .ToListAsync(ct);

        string? Get(string key) =>
            rows.FirstOrDefault(x => x.ConfigKey == key)?.ConfigValue;

        var baslik = Get("BasvuruBaslik") ?? "2026–2027 Lisans Başvurusu";
        var baslikNot = Get("BasvuruBaslikNot") ?? "";
        var formBaslik = Get("BasvuruFormBaslik") ?? "Lisans Burs Başvurusu Formu";
        var formBaslikNot = Get("BasvuruFormBaslikNot") ?? "";
        var baslangicRaw = Get("BasvuruBaslangic") ?? "2026-09-07T09:00:00";
        var bitisRaw = Get("BasvuruBitis") ?? "2026-09-30T17:00:00";
        var popupAktifRaw = (Get("PopupAktif") ?? "1").Trim();
        var popupAktif = popupAktifRaw is not ("0" or "false" or "hayır" or "Hayır" or "kapalı" or "Kapalı");
        var popupBaslik = Get("PopupBaslik") ?? baslik;
        var popupMetin = Get("PopupMetin") ?? baslikNot;

        _ = DateTime.TryParse(baslangicRaw, out var baslangic);
        _ = DateTime.TryParse(bitisRaw, out var bitis);
        if (baslangic == default) baslangic = new DateTime(2026, 9, 7, 9, 0, 0);
        if (bitis == default) bitis = new DateTime(2026, 9, 30, 17, 0, 0);

        var culture = new System.Globalization.CultureInfo("tr-TR");
        var donemMetni =
            $"Başvurular {baslangic.ToString("d MMMM yyyy HH:mm", culture)} – {bitis.ToString("d MMMM yyyy HH:mm", culture)} arasında alınmaktadır";

        var now = DateTime.Now;
        var acik = now >= baslangic && now <= bitis;

        return Results.Ok(new
        {
            success = true,
            baslik,
            baslikNot,
            formBaslik,
            formBaslikNot,
            baslangic = baslangic.ToString("o"),
            bitis = bitis.ToString("o"),
            donemMetni,
            acik,
            popupAktif,
            popupBaslik,
            popupMetin,
        });
    }

    private static async Task<IResult> HandleIstatistik(
        BoytasWhContext db,
        int? yil,
        CancellationToken ct)
    {
        var approved = db.AGB_Vakif_Basvuru.AsNoTracking()
            .Where(x => x.Durum == "Onaylandi");

        var years = await approved
            .Select(x => x.GuncellemeTarihi.Year)
            .Distinct()
            .OrderByDescending(y => y)
            .ToListAsync(ct);

        if (years.Count == 0)
        {
            years.Add(DateTime.Now.Year);
        }

        var selected = yil is > 2000 and < 2100 ? yil.Value : years[0];
        if (!years.Contains(selected))
        {
            years.Add(selected);
            years = years.OrderByDescending(y => y).ToList();
        }

        var groups = await approved
            .Where(x => x.GuncellemeTarihi.Year == selected)
            .GroupBy(x => string.IsNullOrWhiteSpace(x.Kategori) ? "Diğer" : x.Kategori!.Trim())
            .Select(g => new { label = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ThenBy(x => x.label)
            .ToListAsync(ct);

        var total = groups.Sum(x => x.count);

        return Results.Ok(new
        {
            success = true,
            yil = selected,
            years,
            total,
            items = groups,
        });
    }

    private static async Task<IResult> HandleKimlik(
        KimlikRequest request,
        BoytasWhContext db,
        OtpSessionService sessions,
        ISmsSender sms,
        Microsoft.Extensions.Options.IOptions<SmsOptions> smsOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("Basvuru");
        if (!request.KvkkOnay)
        {
            return Results.BadRequest(new { success = false, message = "KVKK onayı zorunludur." });
        }

        var tc = TurkishId.NormalizeTc(request.TcKimlikNo);
        var telefon = TurkishId.NormalizePhone(request.Telefon);

        if (!TurkishId.ValidateTCKN(tc))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "T.C. kimlik numarası geçersiz. Lütfen 11 haneli geçerli bir numara girin.",
            });
        }

        if (!TurkishId.IsValidMobile(telefon))
        {
            return Results.BadRequest(new { success = false, message = "Cep telefonu 05xx xxx xx xx formatında olmalıdır." });
        }

        var existing = await db.AGB_Vakif_Basvuru.FirstOrDefaultAsync(x => x.TcKimlikNo == tc, ct);
        if (existing is null)
        {
            existing = new AgbBasvuru
            {
                Id = Guid.NewGuid(),
                TcKimlikNo = tc,
                Telefon = telefon,
                KvkkOnay = true,
                Durum = "Taslak",
                OlusturmaTarihi = DateTime.UtcNow,
                GuncellemeTarihi = DateTime.UtcNow,
            };
            existing.BasvuruNo = await NextBasvuruNoAsync(db, ct);
            db.AGB_Vakif_Basvuru.Add(existing);
        }
        else
        {
            existing.Telefon = telefon;
            existing.KvkkOnay = true;
            existing.GuncellemeTarihi = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(existing.BasvuruNo))
            {
                existing.BasvuruNo = await NextBasvuruNoAsync(db, ct);
            }
        }

        await db.SaveChangesAsync(ct);

        var otp = sessions.CreateOtp(tc, telefon);
        var message = $"AGB Vakfi dogrulama kodunuz: {otp.Code}. 3 dk gecerlidir.";
        try
        {
            await sms.SendAsync(telefon, message, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OTP SMS gonderilemedi. TC={Tc}", TurkishId.MaskTc(tc));
            return Results.BadRequest(new { success = false, message = "Doğrulama SMS’i gönderilemedi. Lütfen tekrar deneyin." });
        }

        logger.LogInformation("OTP olusturuldu. TC={Tc} Session={Session}", TurkishId.MaskTc(tc), otp.SessionId);

        var exposeDebug = smsOptions.Value.ExposeDebugOtp
            || string.Equals(smsOptions.Value.Provider, "Development", StringComparison.OrdinalIgnoreCase);

        return Results.Ok(new
        {
            success = true,
            sessionId = otp.SessionId,
            telefonMasked = TurkishId.MaskPhone(telefon),
            hasExisting = !string.IsNullOrWhiteSpace(existing.Ad),
            expiresInSeconds = 180,
            debugOtp = exposeDebug ? otp.Code : null,
        });
    }

    private static IResult HandleSmsDogrula(
        SmsDogrulaRequest request,
        OtpSessionService sessions)
    {
        if (!sessions.TryVerifyOtp(request.SessionId, request.Code, out var access) || access is null)
        {
            return Results.BadRequest(new { success = false, message = "SMS kodu hatalı veya süresi dolmuş." });
        }

        return Results.Ok(new
        {
            success = true,
            accessToken = access.Token,
            tcMasked = TurkishId.MaskTc(access.TcKimlikNo),
            telefonMasked = TurkishId.MaskPhone(access.Telefon),
        });
    }

    private static async Task<IResult> HandleSmsTekrar(
        KimlikRequest request,
        OtpSessionService sessions,
        ISmsSender sms,
        Microsoft.Extensions.Options.IOptions<SmsOptions> smsOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("Basvuru");
        var tc = TurkishId.NormalizeTc(request.TcKimlikNo);
        var telefon = TurkishId.NormalizePhone(request.Telefon);
        if (!TurkishId.ValidateTCKN(tc) || !TurkishId.IsValidMobile(telefon))
        {
            return Results.BadRequest(new { success = false, message = "Kimlik bilgileri geçersiz." });
        }

        var otp = sessions.CreateOtp(tc, telefon);
        try
        {
            await sms.SendAsync(telefon, $"AGB Vakfi dogrulama kodunuz: {otp.Code}. 3 dk gecerlidir.", ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "OTP SMS tekrar gonderilemedi");
            return Results.BadRequest(new { success = false, message = "Doğrulama SMS’i gönderilemedi. Lütfen tekrar deneyin." });
        }

        var exposeDebug = smsOptions.Value.ExposeDebugOtp
            || string.Equals(smsOptions.Value.Provider, "Development", StringComparison.OrdinalIgnoreCase);

        return Results.Ok(new
        {
            success = true,
            sessionId = otp.SessionId,
            telefonMasked = TurkishId.MaskPhone(telefon),
            expiresInSeconds = 180,
            debugOtp = exposeDebug ? otp.Code : null,
        });
    }

    private static async Task<IResult> HandleGetMe(
        HttpContext http,
        BoytasWhContext db,
        OtpSessionService sessions,
        CancellationToken ct)
    {
        var access = RequireAccess(http, sessions);
        if (access is null) return Results.Unauthorized();

        var entity = await db.AGB_Vakif_Basvuru
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TcKimlikNo == access.TcKimlikNo, ct);

        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        return Results.Ok(new { success = true, data = ToDto(entity) });
    }

    private static async Task<IResult> HandleSaveMe(
        BasvuruKaydetRequest request,
        HttpContext http,
        BoytasWhContext db,
        OtpSessionService sessions,
        CancellationToken ct)
    {
        var access = RequireAccess(http, sessions);
        if (access is null) return Results.Unauthorized();

        if (!IsName(request.Ad) || !IsName(request.Soyad))
        {
            return Results.BadRequest(new { success = false, message = "Ad ve soyad yalnızca harf içermelidir." });
        }

        if (!IsOptionalName(request.BabaAdi) || !IsOptionalName(request.AnneAdi)
            || !IsOptionalName(request.BabaMeslegi) || !IsOptionalName(request.AnneMeslegi))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "Anne/baba adı ve meslek alanları yalnızca harf içermelidir.",
            });
        }

        var entity = await db.AGB_Vakif_Basvuru
            .FirstOrDefaultAsync(x => x.TcKimlikNo == access.TcKimlikNo, ct);

        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        Apply(entity, request);
        entity.GuncellemeTarihi = DateTime.UtcNow;
        if (entity.Durum == "Gonderildi")
        {
            // Düzenleme sonrası tekrar taslak gibi güncellenir; gönderim ayrı adım
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(new { success = true, data = ToDto(entity) });
    }

    private static async Task<IResult> HandleSubmitMe(
        BasvuruKaydetRequest request,
        HttpContext http,
        BoytasWhContext db,
        OtpSessionService sessions,
        IEmailSender emailSender,
        ISmsSender sms,
        Microsoft.Extensions.Options.IOptions<Options.EmailOptions> emailOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("Basvuru");
        var access = RequireAccess(http, sessions);
        if (access is null) return Results.Unauthorized();

        if (!request.BeyanCalismiyor || !request.BeyanDisiplin
            || !request.BeyanAdliSicil || !request.BeyanOrgunOgretim)
        {
            return Results.BadRequest(new { success = false, message = "Tüm koşul beyanları zorunludur." });
        }

        var entity = await db.AGB_Vakif_Basvuru
            .FirstOrDefaultAsync(x => x.TcKimlikNo == access.TcKimlikNo, ct);

        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        Apply(entity, request);
        if (string.IsNullOrWhiteSpace(entity.BasvuruNo))
        {
            entity.BasvuruNo = await NextBasvuruNoAsync(db, ct);
        }

        // Aynı TC tek kayıt: daha önce gönderilmişse güncelleme
        var isUpdate = string.Equals(entity.Durum, "Gonderildi", StringComparison.OrdinalIgnoreCase)
            || entity.SonGonderimTarihi is not null;

        entity.Durum = "Gonderildi";
        entity.SonGonderimTarihi = DateTime.UtcNow;
        entity.GuncellemeTarihi = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        var email = emailOptions.Value;
        try
        {
            await emailSender.SendAsync(
                email.ToAddress,
                isUpdate
                    ? "AGB Vakfı — Güncellenen burs başvurusu"
                    : "AGB Vakfı — Yeni burs başvurusu",
                ApplicationMailComposer.BuildStaffNoticeHtml(entity, isUpdate),
                ApplicationMailComposer.BuildStaffNoticeText(entity, isUpdate),
                entity.Eposta,
                ct);

            if (!string.IsNullOrWhiteSpace(entity.Eposta))
            {
                await emailSender.SendAsync(
                    entity.Eposta!,
                    isUpdate
                        ? "Başvurunuz güncellendi — Anadolu Güçbirliği Vakfı"
                        : "Başvurunuz alındı — Anadolu Güçbirliği Vakfı",
                    ApplicationMailComposer.BuildApplicantAutoReply(entity, isUpdate),
                    ApplicationMailComposer.BuildApplicantAutoReplyText(entity, isUpdate),
                    null,
                    ct);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Başvuru kaydedildi ancak e-posta gönderilemedi");
        }

        try
        {
            await sms.SendAsync(entity.Telefon, ApplicationMailComposer.ReceivedSms(entity, isUpdate), ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Başvuru kaydedildi ancak bilgilendirme SMS’i gönderilemedi");
        }

        return Results.Ok(new { success = true, isUpdate, data = ToDto(entity) });
    }

    private static AccessSession? RequireAccess(HttpContext http, OtpSessionService sessions)
    {
        var header = http.Request.Headers.Authorization.ToString();
        if (header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return sessions.GetAccess(header["Bearer ".Length..].Trim());
        }

        return sessions.GetAccess(http.Request.Headers["X-Access-Token"].ToString());
    }

    private static void Apply(AgbBasvuru entity, BasvuruKaydetRequest request)
    {
        entity.Ad = request.Ad.Trim();
        entity.Soyad = request.Soyad.Trim();
        entity.DogumTarihi = request.DogumTarihi;
        entity.DogumYeri = request.DogumYeri?.Trim();
        entity.MedeniDurum = request.MedeniDurum?.Trim();
        entity.Eposta = request.Eposta.Trim();
        entity.YakinTelefon = string.IsNullOrWhiteSpace(request.YakinTelefon)
            ? null
            : TurkishId.NormalizePhone(request.YakinTelefon);
        entity.YakinKim = request.YakinKim?.Trim();
        entity.Il = request.Il.Trim();
        entity.Ilce = request.Ilce.Trim();
        entity.AcikAdres = request.AcikAdres?.Trim();
        entity.Statu = request.Statu.Trim();
        entity.Kategori = request.Kategori.Trim();
        entity.BabaAdi = request.BabaAdi?.Trim();
        entity.BabaSagMi = request.BabaSagMi?.Trim();
        entity.BabaMeslegi = request.BabaMeslegi?.Trim();
        entity.BabaAylikGelir = request.BabaSagMi == "Evet" ? request.BabaAylikGelir?.Trim() : null;
        entity.AnneAdi = request.AnneAdi?.Trim();
        entity.AnneSagMi = request.AnneSagMi?.Trim();
        entity.AnneMeslegi = request.AnneMeslegi?.Trim();
        entity.AnneAylikGelir = request.AnneSagMi == "Evet" ? request.AnneAylikGelir?.Trim() : null;
        entity.AnneBabaBirlikte = request.AnneBabaBirlikte?.Trim();
        entity.EsAylikGelir = request.MedeniDurum == "Evli" ? request.EsAylikGelir?.Trim() : null;
        entity.KardesIlkokul = request.KardesIlkokul?.Trim();
        entity.KardesYuksek = request.KardesYuksek?.Trim();
        entity.OturdugunuzEv = request.OturdugunuzEv?.Trim();
        entity.EvKiraBedeli = request.OturdugunuzEv == "Kira" ? request.EvKiraBedeli?.Trim() : null;
        entity.AracVarMi = request.AracVarMi?.Trim();
        entity.AracMarkaModel = request.AracVarMi == "Evet" ? request.AracMarkaModel?.Trim() : null;
        entity.AracYili = request.AracVarMi == "Evet" ? request.AracYili?.Trim() : null;
        entity.OzelDurumTipi = request.OzelDurumTipi?.Trim();
        entity.OzelDurum = request.OzelDurumTipi is null or "" or "Yok"
            ? null
            : request.OzelDurum?.Trim();
        entity.Universite = request.Universite?.Trim();
        entity.Fakulte = request.Fakulte?.Trim();
        entity.Bolum = request.Bolum?.Trim();
        entity.KayitYili = request.KayitYili?.Trim();
        entity.Sinif = request.Sinif?.Trim();
        entity.BitirmeYili = request.BitirmeYili?.Trim();
        entity.Hazirlik = request.Hazirlik?.Trim();
        entity.AiledenUzakta = request.AiledenUzakta?.Trim();
        entity.KonaklamaDurumu = request.KonaklamaDurumu?.Trim();
        entity.KonaklamaUcreti = request.KonaklamaUcreti?.Trim();
        entity.YksSiralamasi = request.YksSiralamasi?.Trim();
        entity.NotOrtalamasi = request.NotOrtalamasi?.Trim();
        entity.BaskaBurs = request.BaskaBurs?.Trim();
        entity.BaskaBursMiktari = request.BaskaBurs == "Evet" ? request.BaskaBursMiktari?.Trim() : null;
        entity.BeyanCalismiyor = request.BeyanCalismiyor;
        entity.BeyanDisiplin = request.BeyanDisiplin;
        entity.BeyanAdliSicil = request.BeyanAdliSicil;
        entity.BeyanOrgunOgretim = request.BeyanOrgunOgretim;
    }

    private static BasvuruDto ToDto(AgbBasvuru e) => new()
    {
        Id = e.Id,
        BasvuruNo = e.BasvuruNo,
        TcKimlikNoMasked = TurkishId.MaskTc(e.TcKimlikNo),
        TelefonMasked = TurkishId.MaskPhone(e.Telefon),
        Ad = e.Ad,
        Soyad = e.Soyad,
        DogumTarihi = e.DogumTarihi?.ToString("yyyy-MM-dd"),
        DogumYeri = e.DogumYeri,
        MedeniDurum = e.MedeniDurum,
        Eposta = e.Eposta,
        YakinTelefon = e.YakinTelefon,
        YakinKim = e.YakinKim,
        Il = e.Il,
        Ilce = e.Ilce,
        AcikAdres = e.AcikAdres,
        Statu = e.Statu,
        Kategori = e.Kategori,
        BabaAdi = e.BabaAdi,
        BabaSagMi = e.BabaSagMi,
        BabaMeslegi = e.BabaMeslegi,
        BabaAylikGelir = e.BabaAylikGelir,
        AnneAdi = e.AnneAdi,
        AnneSagMi = e.AnneSagMi,
        AnneMeslegi = e.AnneMeslegi,
        AnneAylikGelir = e.AnneAylikGelir,
        AnneBabaBirlikte = e.AnneBabaBirlikte,
        EsAylikGelir = e.EsAylikGelir,
        KardesIlkokul = e.KardesIlkokul,
        KardesYuksek = e.KardesYuksek,
        OturdugunuzEv = e.OturdugunuzEv,
        EvKiraBedeli = e.EvKiraBedeli,
        AracVarMi = e.AracVarMi,
        AracMarkaModel = e.AracMarkaModel,
        AracYili = e.AracYili,
        OzelDurumTipi = e.OzelDurumTipi,
        OzelDurum = e.OzelDurum,
        Universite = e.Universite,
        Fakulte = e.Fakulte,
        Bolum = e.Bolum,
        KayitYili = e.KayitYili,
        Sinif = e.Sinif,
        BitirmeYili = e.BitirmeYili,
        Hazirlik = e.Hazirlik,
        AiledenUzakta = e.AiledenUzakta,
        KonaklamaDurumu = e.KonaklamaDurumu,
        KonaklamaUcreti = e.KonaklamaUcreti,
        YksSiralamasi = e.YksSiralamasi,
        NotOrtalamasi = e.NotOrtalamasi,
        BaskaBurs = e.BaskaBurs,
        BaskaBursMiktari = e.BaskaBursMiktari,
        BeyanCalismiyor = e.BeyanCalismiyor,
        BeyanDisiplin = e.BeyanDisiplin,
        BeyanAdliSicil = e.BeyanAdliSicil,
        BeyanOrgunOgretim = e.BeyanOrgunOgretim,
        Durum = e.Durum,
    };

    private static async Task<string> NextBasvuruNoAsync(BoytasWhContext db, CancellationToken ct)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"AGB-{year}-";
        var last = await db.AGB_Vakif_Basvuru
            .AsNoTracking()
            .Where(x => x.BasvuruNo != null && x.BasvuruNo.StartsWith(prefix))
            .OrderByDescending(x => x.BasvuruNo)
            .Select(x => x.BasvuruNo)
            .FirstOrDefaultAsync(ct);

        var seq = 1;
        if (!string.IsNullOrWhiteSpace(last) && last.Length > prefix.Length
            && int.TryParse(last[prefix.Length..], out var parsed))
        {
            seq = parsed + 1;
        }

        return $"{prefix}{seq:D6}";
    }

    private static bool IsName(string value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.All(c => char.IsLetter(c) || char.IsWhiteSpace(c) || c is '-' or '\'');

    private static bool IsOptionalName(string? value) =>
        string.IsNullOrWhiteSpace(value) || IsName(value);
}
