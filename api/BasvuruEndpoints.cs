using AgbVakif.Api.Data;
using AgbVakif.Api.Models;
using AgbVakif.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api;

public static class BasvuruEndpoints
{
    public static void MapBasvuruEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/basvuru");

        group.MapPost("/kimlik", HandleKimlik);
        group.MapPost("/sms-dogrula", HandleSmsDogrula);
        group.MapPost("/sms-tekrar", HandleSmsTekrar);
        group.MapGet("/me", HandleGetMe);
        group.MapPut("/me", HandleSaveMe);
        group.MapPost("/me/gonder", HandleSubmitMe);
    }

    private static async Task<IResult> HandleKimlik(
        KimlikRequest request,
        BoytasWhContext db,
        OtpSessionService sessions,
        ISmsSender sms,
        IHostEnvironment env,
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

        if (!TurkishId.IsValidTc(tc))
        {
            return Results.BadRequest(new { success = false, message = "T.C. kimlik numarası geçersiz (11 hane)." });
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
            db.AGB_Vakif_Basvuru.Add(existing);
        }
        else
        {
            existing.Telefon = telefon;
            existing.KvkkOnay = true;
            existing.GuncellemeTarihi = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(ct);

        var otp = sessions.CreateOtp(tc, telefon);
        var message = $"AGB Vakfi dogrulama kodunuz: {otp.Code}. 3 dk gecerlidir.";
        await sms.SendAsync(telefon, message, ct);
        logger.LogInformation("OTP olusturuldu. TC={Tc} Session={Session}", TurkishId.MaskTc(tc), otp.SessionId);

        return Results.Ok(new
        {
            success = true,
            sessionId = otp.SessionId,
            telefonMasked = TurkishId.MaskPhone(telefon),
            hasExisting = !string.IsNullOrWhiteSpace(existing.Ad),
            expiresInSeconds = 180,
            // Sadece Development: gerçek SMS yokken test kolaylığı
            debugOtp = env.IsDevelopment() ? otp.Code : null,
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
        IHostEnvironment env,
        CancellationToken ct)
    {
        var tc = TurkishId.NormalizeTc(request.TcKimlikNo);
        var telefon = TurkishId.NormalizePhone(request.Telefon);
        if (!TurkishId.IsValidTc(tc) || !TurkishId.IsValidMobile(telefon))
        {
            return Results.BadRequest(new { success = false, message = "Kimlik bilgileri geçersiz." });
        }

        var otp = sessions.CreateOtp(tc, telefon);
        await sms.SendAsync(telefon, $"AGB Vakfi dogrulama kodunuz: {otp.Code}. 3 dk gecerlidir.", ct);

        return Results.Ok(new
        {
            success = true,
            sessionId = otp.SessionId,
            telefonMasked = TurkishId.MaskPhone(telefon),
            expiresInSeconds = 180,
            debugOtp = env.IsDevelopment() ? otp.Code : null,
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
        Microsoft.Extensions.Options.IOptions<Options.EmailOptions> emailOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("Basvuru");
        var access = RequireAccess(http, sessions);
        if (access is null) return Results.Unauthorized();

        if (!request.BeyanCalismiyor || !request.BeyanAdliSicil || !request.BeyanBilgiDogru)
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
        entity.Durum = "Gonderildi";
        entity.SonGonderimTarihi = DateTime.UtcNow;
        entity.GuncellemeTarihi = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        var mailRequest = ToLegacyMail(entity);
        var email = emailOptions.Value;
        try
        {
            await emailSender.SendAsync(
                email.ToAddress,
                "AGB Vakfı — Yeni destek başvurusu",
                ApplicationMailComposer.BuildHtml(mailRequest),
                ApplicationMailComposer.BuildText(mailRequest),
                entity.Eposta,
                ct);

            if (!string.IsNullOrWhiteSpace(entity.Eposta))
            {
                await emailSender.SendAsync(
                    entity.Eposta!,
                    "Başvurunuz alındı — Anadolu Güçbirliği Vakfı",
                    ApplicationMailComposer.BuildApplicantAutoReply(),
                    "Başvurunuz Anadolu Güçbirliği Vakfı tarafından alınmıştır.",
                    null,
                    ct);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Başvuru kaydedildi ancak e-posta gönderilemedi");
        }

        return Results.Ok(new { success = true, data = ToDto(entity) });
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
        entity.Eposta = request.Eposta.Trim();
        entity.YakinTelefon = string.IsNullOrWhiteSpace(request.YakinTelefon)
            ? null
            : TurkishId.NormalizePhone(request.YakinTelefon);
        entity.Il = request.Il.Trim();
        entity.Ilce = request.Ilce.Trim();
        entity.Statu = request.Statu.Trim();
        entity.Kategori = request.Kategori.Trim();
        entity.TalepTutari = request.TalepTutari.Trim();
        entity.TalepOzeti = request.TalepOzeti.Trim();
        entity.BeyanCalismiyor = request.BeyanCalismiyor;
        entity.BeyanAdliSicil = request.BeyanAdliSicil;
        entity.BeyanBilgiDogru = request.BeyanBilgiDogru;
    }

    private static BasvuruDto ToDto(AgbBasvuru e) => new()
    {
        Id = e.Id,
        TcKimlikNoMasked = TurkishId.MaskTc(e.TcKimlikNo),
        TelefonMasked = TurkishId.MaskPhone(e.Telefon),
        Ad = e.Ad,
        Soyad = e.Soyad,
        DogumTarihi = e.DogumTarihi?.ToString("yyyy-MM-dd"),
        DogumYeri = e.DogumYeri,
        Eposta = e.Eposta,
        YakinTelefon = e.YakinTelefon,
        Il = e.Il,
        Ilce = e.Ilce,
        Statu = e.Statu,
        Kategori = e.Kategori,
        TalepTutari = e.TalepTutari,
        TalepOzeti = e.TalepOzeti,
        BeyanCalismiyor = e.BeyanCalismiyor,
        BeyanAdliSicil = e.BeyanAdliSicil,
        BeyanBilgiDogru = e.BeyanBilgiDogru,
        Durum = e.Durum,
    };

    private static ApplicationRequest ToLegacyMail(AgbBasvuru e) => new()
    {
        AdSoyad = $"{e.Ad} {e.Soyad}".Trim(),
        Telefon = e.Telefon,
        Eposta = e.Eposta ?? "",
        TalepTutari = e.TalepTutari ?? "",
        Statu = e.Statu ?? "",
        Kategori = e.Kategori ?? "",
        TalepOzeti = e.TalepOzeti ?? "",
        KvkkOnay = e.KvkkOnay,
        CaptchaId = "n/a",
        CaptchaAnswer = "n/a",
    };

    private static bool IsName(string value) =>
        !string.IsNullOrWhiteSpace(value) &&
        value.All(c => char.IsLetter(c) || char.IsWhiteSpace(c) || c is '-' or '\'');
}
