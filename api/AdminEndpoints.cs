using AgbVakif.Api.Data;
using AgbVakif.Api.Options;
using AgbVakif.Api.Services;
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
    ];

    public static void MapAdminEndpoints(this WebApplication app)
    {
        app.MapPost("/api/admin/login", HandleLogin);
        app.MapPost("/api/admin/logout", HandleLogout).AddEndpointFilter(RequireAdminSession);

        var group = app.MapGroup("/api/admin").AddEndpointFilter(RequireAdminSession);
        group.MapGet("/me", HandleMe);
        group.MapGet("/basvurular", HandleList);
        group.MapGet("/basvurular/{id:guid}", HandleDetail);
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
        int page = 1,
        int pageSize = 25,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.AGB_Vakif_Basvuru.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(durum))
        {
            var d = durum.Trim();
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
                (x.Telefon != null && x.Telefon.Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(x => x.SonGonderimTarihi ?? x.GuncellemeTarihi)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.Ad,
                x.Soyad,
                tcKimlikNo = x.TcKimlikNo,
                x.Telefon,
                x.Eposta,
                x.Universite,
                x.Bolum,
                x.Sinif,
                x.Kategori,
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

    private static async Task<IResult> HandleDetail(
        Guid id,
        BoytasWhContext db,
        CancellationToken ct)
    {
        var e = await db.AGB_Vakif_Basvuru.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (e is null)
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        return Results.Ok(new { success = true, data = ToAdminDto(e) });
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
            "Taslak", "Gonderildi", "Inceleniyor", "Onaylandi", "Reddedildi", "GeriCekildi",
        };

        var durum = (request.Durum ?? "").Trim();
        if (!allowed.Contains(durum))
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "Geçersiz durum. İzin verilen: Taslak, Gonderildi, Inceleniyor, Onaylandi, Reddedildi, GeriCekildi",
            });
        }

        var entity = await db.AGB_Vakif_Basvuru.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Başvuru bulunamadı." });
        }

        var previous = entity.Durum;
        entity.Durum = durum;
        entity.GuncellemeTarihi = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        string? notifyMessage = null;
        var becameApproved = !string.Equals(previous, "Onaylandi", StringComparison.OrdinalIgnoreCase)
            && string.Equals(durum, "Onaylandi", StringComparison.OrdinalIgnoreCase);

        if (becameApproved)
        {
            notifyMessage = await NotifyApprovalAsync(entity, emailSender, sms, emailOptions.Value, logger, ct);
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
                    ApplicationMailComposer.BuildApprovalHtml(adSoyad),
                    ApplicationMailComposer.BuildApprovalText(adSoyad),
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
                await sms.SendAsync(entity.Telefon, ApplicationMailComposer.ApprovalSms, ct);
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
        tcKimlikNo = e.TcKimlikNo,
        telefon = e.Telefon,
        e.Ad,
        e.Soyad,
        dogumTarihi = e.DogumTarihi?.ToString("yyyy-MM-dd"),
        e.DogumYeri,
        e.Eposta,
        e.YakinTelefon,
        e.Il,
        e.Ilce,
        e.AcikAdres,
        e.Statu,
        e.Kategori,
        e.BabaAdi,
        e.BabaSagMi,
        e.BabaMeslegi,
        e.BabaAylikGelir,
        e.AnneAdi,
        e.AnneSagMi,
        e.AnneMeslegi,
        e.AnneAylikGelir,
        e.AnneBabaBirlikte,
        e.KardesIlkokul,
        e.KardesYuksek,
        e.OturdugunuzEv,
        e.AracVarMi,
        e.AracMarkaModel,
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
        e.BeyanCalismiyor,
        e.BeyanEvliDegil,
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
