using AgbVakif.Api.Data;
using AgbVakif.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api;

public static class HeroEndpoints
{
    private static readonly HashSet<string> AllowedExt = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif",
    };

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
        var form = await request.ReadFormAsync(ct);
        var entity = new AgbHeroSlide
        {
            Id = Guid.NewGuid(),
            Baslik = (form["baslik"].ToString() ?? "").Trim(),
            Aciklama = NullIfEmpty(form["aciklama"].ToString()),
            UstBaslik = NullIfEmpty(form["ustBaslik"].ToString()),
            ButonMetin = NullIfEmpty(form["butonMetin"].ToString()),
            ButonLink = NullIfEmpty(form["butonLink"].ToString()),
            Sira = ParseInt(form["sira"], 0),
            Aktif = ParseBool(form["aktif"], true),
            OlusturmaTarihi = DateTime.UtcNow,
            GuncellemeTarihi = DateTime.UtcNow,
        };

        var file = form.Files.GetFile("resim");
        if (file is { Length: > 0 })
        {
            var saved = await SaveImageAsync(file, env, ct);
            if (saved.error is not null)
            {
                return Results.BadRequest(new { success = false, message = saved.error });
            }

            entity.ResimUrl = saved.url;
        }

        db.AGB_Vakif_HeroSlide.Add(entity);
        await db.SaveChangesAsync(ct);
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

        var form = await request.ReadFormAsync(ct);
        var baslik = (form["baslik"].ToString() ?? "").Trim();
        entity.Baslik = baslik;
        entity.Aciklama = NullIfEmpty(form["aciklama"].ToString());
        entity.UstBaslik = NullIfEmpty(form["ustBaslik"].ToString());
        entity.ButonMetin = NullIfEmpty(form["butonMetin"].ToString());
        entity.ButonLink = NullIfEmpty(form["butonLink"].ToString());
        entity.Sira = ParseInt(form["sira"], entity.Sira);
        entity.Aktif = ParseBool(form["aktif"], entity.Aktif);
        entity.GuncellemeTarihi = DateTime.UtcNow;

        var file = form.Files.GetFile("resim");
        if (file is { Length: > 0 })
        {
            var saved = await SaveImageAsync(file, env, ct);
            if (saved.error is not null)
            {
                return Results.BadRequest(new { success = false, message = saved.error });
            }

            TryDeleteImage(entity.ResimUrl, env);
            entity.ResimUrl = saved.url;
        }
        else if (ParseBool(form["resimKaldir"], false))
        {
            TryDeleteImage(entity.ResimUrl, env);
            entity.ResimUrl = null;
        }

        await db.SaveChangesAsync(ct);
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

        TryDeleteImage(entity.ResimUrl, env);
        db.AGB_Vakif_HeroSlide.Remove(entity);
        await db.SaveChangesAsync(ct);
        return Results.Ok(new { success = true });
    }

    private static async Task<(string? url, string? error)> SaveImageAsync(
        IFormFile file,
        IWebHostEnvironment env,
        CancellationToken ct)
    {
        if (file.Length > 5 * 1024 * 1024)
        {
            return (null, "Resim en fazla 5 MB olabilir.");
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExt.Contains(ext))
        {
            return (null, "İzin verilen formatlar: jpg, png, webp, gif.");
        }

        var dir = Path.Combine(env.ContentRootPath, "Uploads", "hero");
        Directory.CreateDirectory(dir);
        var name = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var path = Path.Combine(dir, name);
        await using (var stream = File.Create(path))
        {
            await file.CopyToAsync(stream, ct);
        }

        return ($"/uploads/hero/{name}", null);
    }

    private static void TryDeleteImage(string? url, IWebHostEnvironment env)
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
