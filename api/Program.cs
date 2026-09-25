using AgbVakif.Api;
using AgbVakif.Api.Data;
using AgbVakif.Api.Options;
using AgbVakif.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<EmailOptions>(
    builder.Configuration.GetSection(EmailOptions.SectionName));
builder.Services.Configure<SmsOptions>(
    builder.Configuration.GetSection(SmsOptions.SectionName));
builder.Services.Configure<AppAuthorizationOptions>(
    builder.Configuration.GetSection(AppAuthorizationOptions.SectionName));
builder.Services.AddSingleton<IAdminAccessService, AdminAccessService>();

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<CaptchaService>();
builder.Services.AddSingleton<RateLimitService>();
builder.Services.AddSingleton<OtpSessionService>();
builder.Services.AddHttpClient(nameof(TuratelSmsSender));
builder.Services.AddSingleton<ISmsSender>(sp =>
{
    var sms = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<SmsOptions>>().Value;
    return sms.Provider.Trim().ToLowerInvariant() switch
    {
        "turatel" => ActivatorUtilities.CreateInstance<TuratelSmsSender>(sp),
        _ => ActivatorUtilities.CreateInstance<DevelopmentSmsSender>(sp),
    };
});

var connectionString = builder.Configuration.GetConnectionString("BoytasWHConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "ConnectionStrings:BoytasWHConnection tanımlı değil.");
}

builder.Services.AddDbContext<BoytasWhContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddScoped<GraphCredentialProvider>();
builder.Services.AddScoped<IEmailSender, GraphEmailSender>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();
var logger = app.Logger;

await EnsureBasvuruTableAsync(app);
await EnsureAgbConfigAsync(app);
await EnsurePanelUsersTableAsync(app);
await EnsureHeroSlideTableAsync(app);

var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "Uploads");
Directory.CreateDirectory(Path.Combine(uploadsRoot, "hero"));
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads",
});

app.UseCors("Frontend");

app.MapGet("/", () => Results.Ok(new
{
    name = "AgbVakif.Api",
    status = "ok",
    endpoints = new[]
    {
        "/api/health",
        "GET /api/basvuru/donem",
        "POST /api/basvuru/kimlik",
        "POST /api/basvuru/sms-dogrula",
        "GET /api/basvuru/me",
        "PUT /api/basvuru/me",
        "POST /api/basvuru/me/gonder",
        "POST /api/admin/login",
        "GET /api/hero",
        "GET /api/admin/hero",
        "GET /api/admin/basvurular",
        "GET /api/admin/basvurular/{id}",
        "PATCH /api/admin/basvurular/{id}/durum",
        "GET /api/admin/config",
        "PUT /api/admin/config",
    },
}));

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", provider = "Graph" }));

app.MapBasvuruEndpoints();
app.MapAdminEndpoints();
app.MapHeroEndpoints();

app.Run();

static async Task EnsureBasvuruTableAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BoytasWhContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Sql", "Create_AGB_Vakif_Basvuru.sql");
        if (File.Exists(sqlPath))
        {
            var sql = await File.ReadAllTextAsync(sqlPath);
            foreach (var batch in sql.Split(["\nGO\r", "\nGO\n", "\rGO\r", "\r\nGO\r\n"], StringSplitOptions.RemoveEmptyEntries))
            {
                var trimmed = batch.Trim();
                if (trimmed.Length > 0)
                {
                    await db.Database.ExecuteSqlRawAsync(trimmed);
                }
            }

            log.LogInformation("AGB_Vakif_Basvuru tablosu kontrol edildi / oluşturuldu.");
        }
    }
    catch (Exception ex)
    {
        log.LogError(ex, "AGB_Vakif_Basvuru tablosu oluşturulamadı. Sql scriptini manuel çalıştırın.");
    }
}

static async Task EnsureAgbConfigAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BoytasWhContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Sql", "Create_AGB_Vakif_Config.sql");
        if (!File.Exists(sqlPath))
        {
            log.LogWarning("Create_AGB_Vakif_Config.sql bulunamadı.");
            return;
        }

        var sql = await File.ReadAllTextAsync(sqlPath);
        foreach (var batch in sql.Split(["\nGO\r", "\nGO\n", "\rGO\r", "\r\nGO\r\n"], StringSplitOptions.RemoveEmptyEntries))
        {
            var trimmed = batch.Trim();
            if (trimmed.Length > 0)
            {
                await db.Database.ExecuteSqlRawAsync(trimmed);
            }
        }

        log.LogInformation("AGB_Vakif_Config tablosu kontrol edildi / oluşturuldu.");
    }
    catch (Exception ex)
    {
        log.LogError(ex, "AGB_Vakif_Config oluşturulamadı. Sql scriptini manuel çalıştırın.");
    }
}

static async Task EnsurePanelUsersTableAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BoytasWhContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Sql", "Create_AGB_Vakif_PanelKullanici.sql");
        if (!File.Exists(sqlPath))
        {
            log.LogWarning("Create_AGB_Vakif_PanelKullanici.sql bulunamadı.");
            return;
        }

        var sql = await File.ReadAllTextAsync(sqlPath);
        foreach (var batch in sql.Split(["\nGO\r", "\nGO\n", "\rGO\r", "\r\nGO\r\n"], StringSplitOptions.RemoveEmptyEntries))
        {
            var trimmed = batch.Trim();
            if (trimmed.Length > 0)
            {
                await db.Database.ExecuteSqlRawAsync(trimmed);
            }
        }

        log.LogInformation("AGB_Vakif_PanelKullanici tablosu kontrol edildi / oluşturuldu.");
    }
    catch (Exception ex)
    {
        log.LogError(ex, "AGB_Vakif_PanelKullanici oluşturulamadı. Sql scriptini manuel çalıştırın.");
    }
}

static async Task EnsureHeroSlideTableAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<BoytasWhContext>();
    var log = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

    try
    {
        var sqlPath = Path.Combine(app.Environment.ContentRootPath, "Sql", "Create_AGB_Vakif_HeroSlide.sql");
        if (!File.Exists(sqlPath))
        {
            log.LogWarning("Create_AGB_Vakif_HeroSlide.sql bulunamadı.");
            return;
        }

        var sql = await File.ReadAllTextAsync(sqlPath);
        foreach (var batch in sql.Split(["\nGO\r", "\nGO\n", "\rGO\r", "\r\nGO\r\n"], StringSplitOptions.RemoveEmptyEntries))
        {
            var trimmed = batch.Trim();
            if (trimmed.Length > 0)
            {
                await db.Database.ExecuteSqlRawAsync(trimmed);
            }
        }

        log.LogInformation("AGB_Vakif_HeroSlide tablosu kontrol edildi / oluşturuldu.");
    }
    catch (Exception ex)
    {
        log.LogError(ex, "AGB_Vakif_HeroSlide oluşturulamadı. Sql scriptini manuel çalıştırın.");
    }
}
