using AgbVakif.Api.Data;
using AgbVakif.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api;

public static class HeroEndpoints
{
    private static readonly HashSet<string> AllowedImageExt = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

    private static readonly HashSet<string> AllowedVideoExt = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".webm",
    };

    private static readonly HashSet<string> AllowedExt =
        new(AllowedImageExt.Concat(AllowedVideoExt), StringComparer.OrdinalIgnoreCase);

    private const long MaxImageBytes = 5L * 1024 * 1024;
    private const long MaxVideoBytes = 40L * 1024 * 1024;

    public static void MapHeroEndpoints(this WebApplication app)
    {
        app.MapGet("/api/hero", HandlePublicList);

        var admin = app.MapGroup("/api/admin/hero").AddEndpointFilter(RequireAdminSession);
        admin.MapGet("/", HandleAdminList);
        admin.MapPost("/", HandleCreate);
        admin.MapPut("/{id:guid}", HandleUpdate);
        admin.MapDelete("/{id:guid}", HandleDelete);
    }

    private static async Task<IResult> HandlePublicList(BoytasWhContext db, CancellationToken ct)
    {
        var items = await db.AGB_Vakif_HeroSlide.AsNoTracking()
            .Where(x => x.Aktif)
            .OrderBy(x => x.Sira)
            .ThenBy(x => x.OlusturmaTarihi)
            .ToListAsync(ct);

        return Results.Ok(new { success = true, items = items.Select(ToDto) });
    }

    private static async Task<IResult> HandleAdminList(BoytasWhContext db, CancellationToken ct)
    {
        var items = await db.AGB_Vakif_HeroSlide.AsNoTracking()
            .OrderBy(x => x.Sira)
            .ThenByDescending(x => x.GuncellemeTarihi)
            .ToListAsync(ct);

        return Results.Ok(new { success = true, items = items.Select(ToDto) });
    }

    private static async Task<IResult> HandleCreate(
        HttpRequest request,
        BoytasWhContext db,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        IFormCollection form;
        try
        {
            form = await request.ReadFormAsync(ct);
        }
        catch (BadHttpRequestException ex)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = ex.Message.Contains("size", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("boyut", StringComparison.OrdinalIgnoreCase)
                    ? "Dosya çok büyük. Video en fazla 40 MB, görsel en fazla 5 MB olabilir."
                    : $"İstek okunamadı: {ex.Message}",
            });
        }

        var baslik = (form["baslik"].ToString() ?? "").Trim();
        var ustBaslik = NullIfEmpty(form["ustBaslik"].ToString());
        var butonMetin = NullIfEmpty(form["butonMetin"].ToString());
        var butonLink = NullIfEmpty(form["butonLink"].ToString());

        var lengthError = ValidateFieldLengths(baslik, ustBaslik, butonMetin, butonLink);
        if (lengthError is not null)
        {
            return Results.BadRequest(new { success = false, message = lengthError });
        }

        var entity = new AgbHeroSlide
        {
            Id = Guid.NewGuid(),
            Baslik = baslik,
            Aciklama = NullIfEmpty(form["aciklama"].ToString()),
            UstBaslik = ustBaslik,
            ButonMetin = butonMetin,
            ButonLink = butonLink,
            Sira = ParseInt(form["sira"], 0),
            Aktif = ParseBool(form["aktif"], true),
            OlusturmaTarihi = DateTime.UtcNow,
            GuncellemeTarihi = DateTime.UtcNow,
        };

        var file = form.Files.GetFile("resim");
        if (file is { Length: > 0 })
        {
            var saved = await SaveMediaAsync(file, env, ct);
            if (saved.error is not null)
            {
                return Results.BadRequest(new { success = false, message = saved.error });
            }

            entity.ResimUrl = saved.url;
        }

        db.AGB_Vakif_HeroSlide.Add(entity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "Kayıt kaydedilemedi. Metin alanlarından biri çok uzun olabilir.",
            });
        }

        return Results.Ok(new { success = true, data = ToDto(entity) });
    }

    private static async Task<IResult> HandleUpdate(
        Guid id,
        HttpRequest request,
        BoytasWhContext db,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        var entity = await db.AGB_Vakif_HeroSlide.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Slayt bulunamadı." });
        }

        IFormCollection form;
        try
        {
            form = await request.ReadFormAsync(ct);
        }
        catch (BadHttpRequestException ex)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = ex.Message.Contains("size", StringComparison.OrdinalIgnoreCase)
                    || ex.Message.Contains("boyut", StringComparison.OrdinalIgnoreCase)
                    ? "Dosya çok büyük. Video en fazla 40 MB, görsel en fazla 5 MB olabilir."
                    : $"İstek okunamadı: {ex.Message}",
            });
        }

        var baslik = (form["baslik"].ToString() ?? "").Trim();
        var ustBaslik = NullIfEmpty(form["ustBaslik"].ToString());
        var butonMetin = NullIfEmpty(form["butonMetin"].ToString());
        var butonLink = NullIfEmpty(form["butonLink"].ToString());

        var lengthError = ValidateFieldLengths(baslik, ustBaslik, butonMetin, butonLink);
        if (lengthError is not null)
        {
            return Results.BadRequest(new { success = false, message = lengthError });
        }

        entity.Baslik = baslik;
        entity.Aciklama = NullIfEmpty(form["aciklama"].ToString());
        entity.UstBaslik = ustBaslik;
        entity.ButonMetin = butonMetin;
        entity.ButonLink = butonLink;
        entity.Sira = ParseInt(form["sira"], entity.Sira);
        entity.Aktif = ParseBool(form["aktif"], entity.Aktif);
        entity.GuncellemeTarihi = DateTime.UtcNow;

        var file = form.Files.GetFile("resim");
        if (file is { Length: > 0 })
        {
            var saved = await SaveMediaAsync(file, env, ct);
            if (saved.error is not null)
            {
                return Results.BadRequest(new { success = false, message = saved.error });
            }

            TryDeleteMedia(entity.ResimUrl, env);
            entity.ResimUrl = saved.url;
        }
        else if (ParseBool(form["resimKaldir"], false))
        {
            TryDeleteMedia(entity.ResimUrl, env);
            entity.ResimUrl = null;
        }

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Results.BadRequest(new
            {
                success = false,
                message = "Kayıt güncellenemedi. Metin alanlarından biri çok uzun olabilir.",
            });
        }

        return Results.Ok(new { success = true, data = ToDto(entity) });
    }

    private static async Task<IResult> HandleDelete(
        Guid id,
        BoytasWhContext db,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        var entity = await db.AGB_Vakif_HeroSlide.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
        {
            return Results.NotFound(new { success = false, message = "Slayt bulunamadı." });
        }

        TryDeleteMedia(entity.ResimUrl, env);
        db.AGB_Vakif_HeroSlide.Remove(entity);
        await db.SaveChangesAsync(ct);
        return Results.Ok(new { success = true });
    }

    private static async Task<(string? url, string? error)> SaveMediaAsync(
        IFormFile file,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExt.Contains(ext))
        {
            return (null, "İzin verilen formatlar: jpg, png, webp, gif, mp4, webm.");
        }

        var isVideo = AllowedVideoExt.Contains(ext);
        var maxBytes = isVideo ? MaxVideoBytes : MaxImageBytes;
        if (file.Length > maxBytes)
        {
            return (null, isVideo
                ? "Video en fazla 40 MB olabilir."
                : "Resim en fazla 5 MB olabilir.");
        }

        var dir = Path.Combine(env.ContentRootPath, "Uploads", "hero");
        try
        {
            Directory.CreateDirectory(dir);
            var name = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
            var path = Path.Combine(dir, name);
            await using (var stream = File.Create(path))
            {
                await file.CopyToAsync(stream, ct);
            }

            return ($"/uploads/hero/{name}", null);
        }
        catch (Exception ex)
        {
            return (null, $"Medya kaydedilemedi (sunucu yazma izni/klasör): {ex.Message}");
        }
    }

    private static void TryDeleteMedia(string? url, IWebHostEnvironment env)
    {
        if (string.IsNullOrWhiteSpace(url) || !url.StartsWith("/uploads/hero/", StringComparison.OrdinalIgnoreCase))
            return;

        var name = Path.GetFileName(url);
        if (string.IsNullOrWhiteSpace(name)) return;
        var path = Path.Combine(env.ContentRootPath, "Uploads", "hero", name);
        if (File.Exists(path))
        {
            try { File.Delete(path); } catch { /* ignore */ }
        }
    }

    private static object ToDto(AgbHeroSlide x) => new
    {
        x.Id,
        x.Baslik,
        x.Aciklama,
        x.UstBaslik,
        x.ResimUrl,
        x.ButonMetin,
        x.ButonLink,
        x.Sira,
        x.Aktif,
        x.OlusturmaTarihi,
        x.GuncellemeTarihi,
    };

    private static string? ValidateFieldLengths(
        string baslik,
        string? ustBaslik,
        string? butonMetin,
        string? butonLink)
    {
        if (baslik.Length > 300)
            return "Başlık en fazla 300 karakter olabilir.";
        if ((ustBaslik?.Length ?? 0) > 200)
            return "Üst başlık en fazla 200 karakter olabilir.";
        if ((butonMetin?.Length ?? 0) > 120)
            return "Buton metni en fazla 120 karakter olabilir.";
        if ((butonLink?.Length ?? 0) > 500)
            return "Buton linki en fazla 500 karakter olabilir.";
        return null;
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static int ParseInt(string? raw, int fallback) =>
        int.TryParse(raw, out var n) ? n : fallback;

    private static bool ParseBool(string? raw, bool fallback)
    {
        if (string.IsNullOrWhiteSpace(raw)) return fallback;
        var v = raw.Trim().ToLowerInvariant();
        return v is "1" or "true" or "evet" or "on";
    }

    private static async ValueTask<object?> RequireAdminSession(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        var access = context.HttpContext.RequestServices.GetRequiredService<IAdminAccessService>();
        var token = GetBearerToken(context.HttpContext);
        var session = access.GetSession(token);
        if (session is null)
        {
            return Results.Json(
                new { success = false, message = "Oturum geçersiz veya süresi dolmuş." },
                statusCode: StatusCodes.Status401Unauthorized);
        }

        context.HttpContext.Items["AdminUser"] = session.UserName;
        return await next(context);
    }

    private static string? GetBearerToken(HttpContext http)
    {
        var auth = http.Request.Headers.Authorization.ToString();
        if (auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return auth["Bearer ".Length..].Trim();
        var header = http.Request.Headers["X-Admin-Token"].ToString();
        return string.IsNullOrWhiteSpace(header) ? null : header.Trim();
    }
}
