using AgbVakif.Api.Data;
using AgbVakif.Api.Options;
using AgbVakif.Api.Services;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AgbVakif.Api;

public static class AdminEndpoints
{
    private static readonly string[] ConfigKeys =
    [
        "PopupAktif",
        "PopupBaslik",
        "PopupMetin",
        "BasvuruBaslik",
        "BasvuruBaslikNot",
        "BasvuruFormBaslik",
        "BasvuruFormBaslikNot",
        "BasvuruBaslangic",
        "BasvuruBitis",
        "MinDogumTarihi",
        "YardimBasvuruAktif",
    ];

    public static void MapAdminEndpoints(this WebApplication app)
    {
        app.MapPost("/api/admin/login", HandleLogin);
        app.MapPost("/api/admin/logout", HandleLogout).AddEndpointFilter(RequireAdminSession);

        var group = app.MapGroup("/api/admin").AddEndpointFilter(RequireAdminSession);
        group.MapGet("/me", HandleMe);
        group.MapGet("/basvurular", HandleList);
        group.MapGet("/basvurular/export", HandleExportExcel);
        group.MapGet("/basvurular/{id:guid}", HandleDetail);
        group.MapGet("/basvurular/{id:guid}/belgeler/{belgeId:guid}", HandleDownloadBelge);
        group.MapPatch("/basvurular/{id:guid}/durum", HandleDurum);
        group.MapGet("/config", HandleGetConfig);
        group.MapPut("/config", HandlePutConfig);
        group.MapGet("/kullanicilar", HandleListUsers);
        group.MapPost("/kullanicilar", HandleAddUser);
        group.MapDelete("/kullanicilar/{userName}", HandleDeleteUser);
    }

    private static IResult HandleLogin(AdminLoginRequest request, IAdminAccessService access)
    {
        var userName = (request.UserName ?? "").Trim();
        var password = request.Password ?? "";

        if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrEmpty(password))
        {
            return Results.BadRequest(new { success = false, message = "Kullanıcı adı ve şifre zorunludur." });
        }

        if (!access.ValidateCredentials(userName, password))
        {
            return Results.Json(
                new { success = false, message = "Kullanıcı adı veya şifre hatalı." },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        if (!access.IsAdmin(userName))
        {
            return Results.Json(
                new { success = false, message = "Bu hesap için panel yetkisi yok." },
                statusCode: StatusCodes.Status403Forbidden);
        }

        var session = access.CreateSession(userName);
        return Results.Ok(new
        {
            success = true,
            accessToken = session.Token,
            userName = session.UserName,
            expiresAt = session.ExpiresAt,
        });
    }

    private static IResult HandleLogout(HttpContext http, IAdminAccessService access)
    {
        access.Revoke(GetBearerToken(http));
        return Results.Ok(new { success = true });
    }

    private static IResult HandleMe(HttpContext http, IAdminAccessService access)
    {
        var session = access.GetSession(GetBearerToken(http));
        if (session is null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new
        {
            success = true,
            userName = session.UserName,
            expiresAt = session.ExpiresAt,
        });
    }

    private static async ValueTask<object?> RequireAdminSession(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var access = context.HttpContext.RequestServices.GetRequiredService<IAdminAccessService>();
        var session = access.GetSession(GetBearerToken(context.HttpContext));
        if (session is null)
        {
            return Results.Json(
                new { success = false, message = "Oturum geçersiz veya süresi dolmuş. Tekrar giriş yapın." },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        context.HttpContext.Items["AdminUser"] = session.UserName;
        return await next(context);
    }

    private static string? GetBearerToken(HttpContext http)
    {
        var auth = http.Request.Headers.Authorization.ToString();
        if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return auth["Bearer ".Length..].Trim();
        }

        var header = http.Request.Headers["X-Admin-Token"].ToString();
        return string.IsNullOrWhiteSpace(header) ? null : header.Trim();
    }

    private sealed class AdminLoginRequest
    {
        public string? UserName { get; set; }
        public string? Password { get; set; }
    }

    private static async Task<IResult> HandleList(
        BoytasWhContext db,
        string? q,
        string? durum,
        string? tip,
        int page = 1,
        int pageSize = 25,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = FilterBasvurular(db.AGB_Vakif_Basvuru.AsNoTracking(), q, durum, tip);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.SonGonderimTarihi ?? x.GuncellemeTarihi)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.BasvuruNo,
                basvuruTipi = x.BasvuruTipi,
                donemYili = x.DonemYili,
                x.Ad,
                x.Soyad,
                tcKimlikNo = x.TcKimlikNo,
                x.Telefon,
                x.Eposta,
                x.Kategori,
                x.Universite,
                x.Bolum,
                x.Sinif,
                x.Durum,
                x.OlusturmaTarihi,
                x.GuncellemeTarihi,
                x.SonGonderimTarihi,
            })
            .ToListAsync(ct);

        return Results.Ok(new
        {
            success = true,
            total,
            page,
            pageSize,
            items,
        });
    }

    private static async Task<IResult> HandleExportExcel(
        BoytasWhContext db,
        string? q,
        string? durum,
        string? tip,
        CancellationToken ct)
    {
        var query = FilterBasvurular(db.AGB_Vakif_Basvuru.AsNoTracking(), q, durum, tip);
        var rows = await query
            .OrderByDescending(x => x.SonGonderimTarihi ?? x.GuncellemeTarihi)
            .ToListAsync(ct);

        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Basvurular");

        string[] headers =
        [
            "Basvuru No", "Basvuru Tipi", "Donem Yili", "Durum", "T.C. Kimlik No", "Ad", "Soyad", "Dogum Tarihi", "Dogum Yeri", "Medeni Durum",
            "Telefon", "E-posta", "Yakin Telefon", "Yakin Kim", "Il", "Ilce", "Acik Adres", "Statu",
            "Kategori", "Talep Tutari", "Talep Ozeti",
            "Baba Adi", "Baba Sag Mi", "Baba Meslegi", "Baba Aylik Gelir",
            "Anne Adi", "Anne Sag Mi", "Anne Meslegi", "Anne Aylik Gelir", "Anne Baba Birlikte", "Birlikte Yasadigi Kisi Sayisi", "Es Aylik Gelir", "Hane Geliri",
            "Kardes Ilkokul-Orta-Lise", "Kardes Yuksekogretim", "Oturdugunuz Ev", "Ev Kira Bedeli",
            "Arac Var Mi", "Arac Marka Model", "Arac Yili", "Ozel Durum Tipi", "Ozel Durum",
            "Universite", "Fakulte", "Bolum", "Kayit Yili", "Sinif", "Bitirme Yili", "Hazirlik",
            "Aileden Uzakta", "Konaklama Durumu", "Konaklama Ucreti", "YKS Siralamasi", "Not Ortalamasi",
            "Baska Burs", "Baska Burs Miktari",
            "Olusturma", "Guncelleme", "Son Gonderim",
        ];

        for (var c = 0; c < headers.Length; c++)
        {
            sheet.Cell(1, c + 1).Value = headers[c];
        }

        var headerRange = sheet.Range(1, 1, 1, headers.Length);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#0F3B32");
        headerRange.Style.Font.FontColor = XLColor.White;

        for (var i = 0; i < rows.Count; i++)
        {
            var e = rows[i];
            var r = i + 2;
            object?[] values =
            [
                e.BasvuruNo, e.BasvuruTipi, e.DonemYili, e.Durum, e.TcKimlikNo, e.Ad, e.Soyad,
                e.DogumTarihi?.ToString("dd.MM.yyyy"), e.DogumYeri, e.MedeniDurum,
                e.Telefon, e.Eposta, e.YakinTelefon, e.YakinKim, e.Il, e.Ilce, e.AcikAdres, e.Statu,
                e.Kategori, e.TalepTutari, e.TalepOzeti,
                e.BabaAdi, e.BabaSagMi, e.BabaMeslegi, e.BabaAylikGelir,
                e.AnneAdi, e.AnneSagMi, e.AnneMeslegi, e.AnneAylikGelir, e.AnneBabaBirlikte, e.BirlikteYasadigiKisiler, e.EsAylikGelir, e.HaneGeliri,
                e.KardesIlkokul, e.KardesYuksek, e.OturdugunuzEv, e.EvKiraBedeli,
                e.AracVarMi, e.AracMarkaModel, e.AracYili, e.OzelDurumTipi, e.OzelDurum,
                e.Universite, e.Fakulte, e.Bolum, e.KayitYili, e.Sinif, e.BitirmeYili, e.Hazirlik,
                e.AiledenUzakta, e.KonaklamaDurumu, e.KonaklamaUcreti, e.YksSiralamasi, e.NotOrtalamasi,
                e.BaskaBurs, e.BaskaBursMiktari,
                e.OlusturmaTarihi.ToLocalTime().ToString("dd.MM.yyyy HH:mm"),
                e.GuncellemeTarihi.ToLocalTime().ToString("dd.MM.yyyy HH:mm"),
                e.SonGonderimTarihi?.ToLocalTime().ToString("dd.MM.yyyy HH:mm"),
            ];

            for (var c = 0; c < values.Length; c++)
            {
                sheet.Cell(r, c + 1).SetValue(values[c]?.ToString() ?? "");
            }
        }

        sheet.SheetView.FreezeRows(1);
        sheet.Columns().AdjustToContents(1, 40);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        var bytes = stream.ToArray();
        var fileName = $"AGB-Basvurular-{DateTime.Now:yyyyMMdd-HHmm}.xlsx";
        return Results.File(
            bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    private static IQueryable<AgbBasvuru> FilterBasvurular(
        IQueryable<AgbBasvuru> query,
        string? q,
        string? durum,
        string? tip = null)
    {
        query = query.Where(x => x.Durum != "Taslak");

        if (!string.IsNullOrWhiteSpace(tip))
        {
            var t = BasvuruTipi.Normalize(tip);
            query = query.Where(x => x.BasvuruTipi == t);
        }

        if (!string.IsNullOrWhiteSpace(durum))
        {
            var d = durum.Trim();
            if (string.Equals(d, "Taslak", StringComparison.OrdinalIgnoreCase))
            {
                return query.Where(_ => false);
            }

            query = query.Where(x => x.Durum == d);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(x =>
                (x.Ad != null && x.Ad.Contains(term)) ||
                (x.Soyad != null && x.Soyad.Contains(term)) ||
                x.TcKimlikNo.Contains(term) ||
                (x.Eposta != null && x.Eposta.Contains(term)) ||
                (x.Universite != null && x.Universite.Contains(term)) ||
                (x.Kategori != null && x.Kategori.Contains(term)) ||
                (x.Telefon != null && x.Telefon.Contains(term)) ||
                (x.BasvuruNo != null && x.BasvuruNo.Contains(term)));
        }

        return query;
    }

    private static async Task<IResult> HandleDetail(
        Guid id,
        BoytasWhContext db,
        CancellationToken ct)
    {
        var e = await db.AGB_Vakif_Basvuru.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (e is null || string.Equals(e.Durum, "Taslak", StringComparison.OrdinalIgnoreCase))
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        var belgeler = await db.AGB_Vakif_BasvuruBelge.AsNoTracking()
            .Where(x => x.BasvuruId == e.Id)
            .OrderBy(x => x.YuklemeTarihi)
            .Select(x => new { x.Id, x.BelgeKod, x.DosyaAdi, x.SaklananAd, x.YuklemeTarihi })
            .ToListAsync(ct);

        return Results.Ok(new { success = true, data = ToAdminDto(e), belgeler });
    }

    private static async Task<IResult> HandleDownloadBelge(
        Guid id,
        Guid belgeId,
        BoytasWhContext db,
        BelgeStorageService storage,
        CancellationToken ct)
    {
        var row = await db.AGB_Vakif_BasvuruBelge.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == belgeId && x.BasvuruId == id, ct);
        if (row is null)
        {
            return Results.NotFound(new { success = false, message = "Belge bulunamadı." });
        }

        var path = storage.FindExistingPath(row.SaklananAd);
        if (path is null)
        {
            return Results.NotFound(new { success = false, message = "Dosya diskte bulunamadı. Ortak alan yolunu ve izinleri kontrol edin." });
        }

        var contentType = ContentTypeForAdmin(row.DosyaAdi);
        var stream = System.IO.File.OpenRead(path);
        return Results.File(stream, contentType, enableRangeProcessing: true);
    }

    private static string ContentTypeForAdmin(string? fileName)
    {
        var ext = Path.GetExtension(fileName ?? "").ToLowerInvariant();
        return ext switch
        {
            ".pdf" => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream",
        };
    }

    private static async Task<IResult> HandleDurum(
        Guid id,
        DurumUpdateRequest request,
        BoytasWhContext db,
        IEmailSender emailSender,
        ISmsSender sms,
        IOptions<EmailOptions> emailOptions,
        ILoggerFactory loggerFactory,
        CancellationToken ct)
    {
        var logger = loggerFactory.CreateLogger("AdminBasvuru");
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Gonderildi", "Inceleniyor", "Onaylandi", "Reddedildi",
        };

        var durum = (request.Durum ?? "").Trim();
        if (!allowed.Contains(durum))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "Geçersiz durum. İzin verilen: Gonderildi, Inceleniyor, Onaylandi, Reddedildi",
            });
        }

        var entity = await db.AGB_Vakif_Basvuru.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null || string.Equals(entity.Durum, "Taslak", StringComparison.OrdinalIgnoreCase))
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        var previous = entity.Durum ?? "";
        var prevApproved = string.Equals(previous, "Onaylandi", StringComparison.OrdinalIgnoreCase);
        var prevRejected = string.Equals(previous, "Reddedildi", StringComparison.OrdinalIgnoreCase);
        var nextApproved = string.Equals(durum, "Onaylandi", StringComparison.OrdinalIgnoreCase);
        var nextRejected = string.Equals(durum, "Reddedildi", StringComparison.OrdinalIgnoreCase);

        // Nihai karar: onay ↔ red birbirinin tersi; bir kez kilitlenir
        if (prevApproved || prevRejected)
        {
            if (!string.Equals(previous, durum, StringComparison.OrdinalIgnoreCase))
            {
                return Results.BadRequest(new
                {
                    success = false,
                    message = prevApproved
                        ? "Başvuru onaylanmış; durum değiştirilemez / reddedilemez."
                        : "Başvuru reddedilmiş; durum değiştirilemez / onaylanamaz.",
                });
            }

            return Results.Ok(new
            {
                success = true,
                data = ToAdminDto(entity),
                notifyMessage = (string?)null,
            });
        }

        entity.Durum = durum;
        entity.GuncellemeTarihi = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        string? notifyMessage = null;
        if (nextApproved)
        {
            notifyMessage = await NotifyApprovalAsync(entity, emailSender, sms, emailOptions.Value, logger, ct);
        }
        else if (nextRejected)
        {
            notifyMessage = await NotifyRejectionAsync(entity, emailSender, sms, emailOptions.Value, logger, ct);
        }

        return Results.Ok(new
        {
            success = true,
            data = ToAdminDto(entity),
            notifyMessage,
        });
    }

    private static async Task<string> NotifyApprovalAsync(
        AgbBasvuru entity,
        IEmailSender emailSender,
        ISmsSender sms,
        EmailOptions email,
        ILogger logger,
        CancellationToken ct)
    {
        var adSoyad = $"{entity.Ad} {entity.Soyad}".Trim();
        var mailOk = false;
        var smsOk = false;

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.Eposta))
            {
                await emailSender.SendAsync(
                    entity.Eposta!,
                    "Başvurunuz onaylandı — Anadolu Güçbirliği Vakfı",
                    ApplicationMailComposer.BuildApprovalHtml(adSoyad, entity.BasvuruNo),
                    ApplicationMailComposer.BuildApprovalText(adSoyad, entity.BasvuruNo),
                    null,
                    ct);
                mailOk = true;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Onay e-postası gönderilemedi: {Id}", entity.Id);
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.Telefon))
            {
                await sms.SendAsync(entity.Telefon, ApplicationMailComposer.ApprovalSms(entity.BasvuruNo), ct);
                smsOk = true;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Onay SMS’i gönderilemedi: {Id}", entity.Id);
        }

        if (mailOk && smsOk) return "Onay e-postası ve SMS gönderildi.";
        if (mailOk) return "Onay e-postası gönderildi; SMS gönderilemedi.";
        if (smsOk) return "Onay SMS’i gönderildi; e-posta gönderilemedi.";
        return "Durum güncellendi ancak bildirim gönderilemedi.";
    }

    private static async Task<string> NotifyRejectionAsync(
        AgbBasvuru entity,
        IEmailSender emailSender,
        ISmsSender sms,
        EmailOptions email,
        ILogger logger,
        CancellationToken ct)
    {
        var adSoyad = $"{entity.Ad} {entity.Soyad}".Trim();
        var mailOk = false;
        var smsOk = false;

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.Eposta))
            {
                await emailSender.SendAsync(
                    entity.Eposta!,
                    "Başvuru sonucunuz — Anadolu Güçbirliği Vakfı",
                    ApplicationMailComposer.BuildRejectionHtml(adSoyad, entity.BasvuruNo),
                    ApplicationMailComposer.BuildRejectionText(adSoyad, entity.BasvuruNo),
                    null,
                    ct);
                mailOk = true;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Red e-postası gönderilemedi: {Id}", entity.Id);
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(entity.Telefon))
            {
                await sms.SendAsync(entity.Telefon, ApplicationMailComposer.RejectionSms(entity.BasvuruNo), ct);
                smsOk = true;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Red SMS’i gönderilemedi: {Id}", entity.Id);
        }

        if (mailOk && smsOk) return "Red bildirimi e-posta ve SMS ile gönderildi.";
        if (mailOk) return "Red e-postası gönderildi; SMS gönderilemedi.";
        if (smsOk) return "Red SMS’i gönderildi; e-posta gönderilemedi.";
        return "Durum güncellendi ancak bildirim gönderilemedi.";
    }

    private static async Task<IResult> HandleListUsers(
        BoytasWhContext db,
        IAdminAccessService access,
        IOptions<AppAuthorizationOptions> authOptions,
        CancellationToken ct)
    {
        var configUsers = access.GetConfigAdminUsers()
            .Select(u => new { userName = u, source = "config", canDelete = false })
            .ToList();

        var dbUsers = await db.AGB_Vakif_PanelKullanici.AsNoTracking()
            .OrderBy(x => x.UserName)
            .Select(x => new
            {
                userName = x.UserName,
                source = "panel",
                canDelete = true,
                olusturan = x.Olusturan,
                olusturmaTarihi = x.OlusturmaTarihi,
            })
            .ToListAsync(ct);

        var groups = authOptions.Value.AdminAdGroups?
            .Where(g => !string.IsNullOrWhiteSpace(g))
            .ToList() ?? [];

        return Results.Ok(new
        {
            success = true,
            adGroups = groups,
            adDomain = authOptions.Value.AdDomain,
            configUsers,
            panelUsers = dbUsers,
        });
    }

    private static async Task<IResult> HandleAddUser(
        PanelUserRequest request,
        HttpContext http,
        BoytasWhContext db,
        IAdminAccessService access,
        CancellationToken ct)
    {
        var raw = (request.UserName ?? "").Trim();
        if (string.IsNullOrWhiteSpace(raw))
        {
            return Results.BadRequest(new { success = false, message = "Kullanıcı adı zorunludur." });
        }

        var userName = NormalizeSam(raw);
        if (userName.Length < 2)
        {
            return Results.BadRequest(new { success = false, message = "Geçersiz kullanıcı adı." });
        }

        var existsInConfig = access.GetConfigAdminUsers()
            .Any(u => string.Equals(u, userName, StringComparison.OrdinalIgnoreCase));
        if (existsInConfig)
        {
            return Results.BadRequest(new { success = false, message = "Bu kullanıcı zaten appsettings AdminUsers listesinde." });
        }

        var exists = await db.AGB_Vakif_PanelKullanici.AnyAsync(x => x.UserName == userName, ct);
        if (exists)
        {
            return Results.BadRequest(new { success = false, message = "Bu kullanıcı zaten panel listesinde." });
        }

        var actor = http.Items["AdminUser"]?.ToString() ?? "panel";
        db.AGB_Vakif_PanelKullanici.Add(new AgbPanelKullanici
        {
            UserName = userName,
            Olusturan = actor,
            OlusturmaTarihi = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        access.InvalidateAdminCache(userName);

        return Results.Ok(new { success = true, userName });
    }

    private static async Task<IResult> HandleDeleteUser(
        string userName,
        BoytasWhContext db,
        IAdminAccessService access,
        CancellationToken ct)
    {
        var sam = NormalizeSam(Uri.UnescapeDataString(userName));
        var row = await db.AGB_Vakif_PanelKullanici.FirstOrDefaultAsync(x => x.UserName == sam, ct);
        if (row is null)
        {
            return Results.NotFound(new { success = false, message = "Panel kullanıcısı bulunamadı." });
        }

        db.AGB_Vakif_PanelKullanici.Remove(row);
        await db.SaveChangesAsync(ct);
        access.InvalidateAdminCache(sam);

        return Results.Ok(new { success = true });
    }

    private static string NormalizeSam(string value)
    {
        var idx = value.IndexOf('\\');
        var sam = idx >= 0 ? value[(idx + 1)..] : value;
        return sam.Trim().ToLowerInvariant();
    }

    private static async Task<IResult> HandleGetConfig(BoytasWhContext db, CancellationToken ct)
    {
        var rows = await db.AGB_Vakif_Config
            .AsNoTracking()
            .Where(x => ConfigKeys.Contains(x.ConfigKey))
            .ToListAsync(ct);

        var map = ConfigKeys.ToDictionary(
            k => k,
            k => rows.FirstOrDefault(r => r.ConfigKey == k)?.ConfigValue ?? "");

        return Results.Ok(new { success = true, items = map });
    }

    private static async Task<IResult> HandlePutConfig(
        ConfigUpdateRequest request,
        BoytasWhContext db,
        CancellationToken ct)
    {
        if (request.Items is null || request.Items.Count == 0)
        {
            return Results.BadRequest(new { success = false, message = "Güncellenecek ayar yok." });
        }

        foreach (var (key, value) in request.Items)
        {
            if (!ConfigKeys.Contains(key))
            {
                return Results.BadRequest(new { success = false, message = $"Bilinmeyen ayar anahtarı: {key}" });
            }

            if (key is "BasvuruBaslangic" or "BasvuruBitis")
            {
                if (!DateTime.TryParse(value, out _))
                {
                    return Results.BadRequest(new
                    {
                        success = false,
                        message = $"{key} geçerli bir tarih/saat olmalıdır (örn. 2026-09-07T09:00:00).",
                    });
                }
            }

            if (key == "MinDogumTarihi" && !string.IsNullOrWhiteSpace(value) && !DateOnly.TryParse(value.Trim(), out _))
            {
                return Results.BadRequest(new
                {
                    success = false,
                    message = "En erken doğum tarihi geçerli bir gün olmalıdır (örn. 2004-01-01).",
                });
            }

            var row = await db.AGB_Vakif_Config.FirstOrDefaultAsync(x => x.ConfigKey == key, ct);
            if (row is null)
            {
                db.AGB_Vakif_Config.Add(new AgbVakifConfig
                {
                    ConfigKey = key,
                    ConfigValue = value ?? "",
                });
            }
            else
            {
                row.ConfigValue = value ?? "";
            }
        }

        await db.SaveChangesAsync(ct);
        return await HandleGetConfig(db, ct);
    }

    private static object ToAdminDto(AgbBasvuru e) => new
    {
        e.Id,
        e.BasvuruNo,
        basvuruTipi = e.BasvuruTipi,
        donemYili = e.DonemYili,
        tcKimlikNo = e.TcKimlikNo,
        telefon = e.Telefon,
        e.Ad,
        e.Soyad,
        dogumTarihi = e.DogumTarihi?.ToString("yyyy-MM-dd"),
        e.DogumYeri,
        e.MedeniDurum,
        e.Eposta,
        e.YakinTelefon,
        e.YakinKim,
        e.Il,
        e.Ilce,
        e.AcikAdres,
        e.Statu,
        e.Kategori,
        e.TalepTutari,
        e.TalepOzeti,
        e.BabaAdi,
        e.BabaSagMi,
        e.BabaMeslegi,
        e.BabaAylikGelir,
        e.AnneAdi,
        e.AnneSagMi,
        e.AnneMeslegi,
        e.AnneAylikGelir,
        e.AnneBabaBirlikte,
        e.BirlikteYasadigiKisiler,
        e.EsAylikGelir,
        e.HaneGeliri,
        e.KardesIlkokul,
        e.KardesYuksek,
        e.OturdugunuzEv,
        e.EvKiraBedeli,
        e.AracVarMi,
        e.AracMarkaModel,
        e.AracYili,
        e.OzelDurumTipi,
        e.OzelDurum,
        e.Universite,
        e.Fakulte,
        e.Bolum,
        e.KayitYili,
        e.Sinif,
        e.BitirmeYili,
        e.Hazirlik,
        e.AiledenUzakta,
        e.KonaklamaDurumu,
        e.KonaklamaUcreti,
        e.YksSiralamasi,
        e.NotOrtalamasi,
        e.BaskaBurs,
        e.BaskaBursMiktari,
        e.BeyanCalismiyor,
        e.BeyanDisiplin,
        e.BeyanAdliSicil,
        e.BeyanOrgunOgretim,
        e.KvkkOnay,
        e.Durum,
        e.OlusturmaTarihi,
        e.GuncellemeTarihi,
        e.SonGonderimTarihi,
    };

    private sealed class DurumUpdateRequest
    {
        public string? Durum { get; set; }
    }

    private sealed class ConfigUpdateRequest
    {
        public Dictionary<string, string?>? Items { get; set; }
    }

    private sealed class PanelUserRequest
    {
        public string? UserName { get; set; }
    }
}
