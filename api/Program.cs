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
builder.Services.Configure<StorageOptions>(
    builder.Configuration.GetSection(StorageOptions.SectionName));
builder.Services.AddSingleton<IAdminAccessService, AdminAccessService>();
builder.Services.AddSingleton<BelgeStorageService>();

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
                "https://localhost:5173",
                "https://agbvakfi.org",
                "https://www.agbvakfi.org",
                "http://agbvakfi.org",
                "http://www.agbvakfi.org")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 45L * 1024 * 1024;
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 45L * 1024 * 1024;
});

var app = builder.Build();
var logger = app.Logger;

await EnsureBasvuruTableAsync(app);
await EnsureAgbConfigAsync(app);
await EnsurePanelUsersTableAsync(app);
await EnsureHeroSlideTableAsync(app);

var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "Uploads");
Directory.CreateDirectory(Path.Combine(uploadsRoot, "hero"));
try
{
    var belgeRoot = app.Services.GetRequiredService<BelgeStorageService>().GetRoot();
    Directory.CreateDirectory(belgeRoot);
}
catch (Exception ex)
{
    logger.LogWarning(ex, "Belge kök klasörü oluşturulamadı. Storage:BelgeRootPath ve paylaşım izinlerini kontrol edin.");
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsRoot),
    RequestPath = "/uploads",
});

app.UseCors("Frontend");

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", provider = "Graph" }));

app.MapBasvuruEndpoints();
app.MapAdminEndpoints();
app.MapHeroEndpoints();

app.MapFallbackToFile("index.html");

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
