using System.Collections.Concurrent;
using System.DirectoryServices.AccountManagement;
using AgbVakif.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace AgbVakif.Api.Services;

public interface IAdminAccessService
{
    bool ValidateCredentials(string userName, string password);
    bool IsAdmin(string? userName);
    AdminSession CreateSession(string userName);
    AdminSession? GetSession(string? token);
    void Revoke(string? token);
    void InvalidateAdminCache(string? userName = null);
    IReadOnlyList<string> GetConfigAdminUsers();
}

public sealed record AdminSession(
    string Token,
    string UserName,
    DateTimeOffset ExpiresAt);
public sealed class AdminAccessService : IAdminAccessService
{
    private static readonly TimeSpan GroupCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan SessionDuration = TimeSpan.FromHours(8);

    private readonly AppAuthorizationOptions _options;
    private readonly IMemoryCache _cache;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AdminAccessService> _logger;
    private readonly ConcurrentDictionary<string, AdminSession> _sessions = new();

    public AdminAccessService(
        IOptions<AppAuthorizationOptions> options,
        IMemoryCache cache,
        IServiceScopeFactory scopeFactory,
        ILogger<AdminAccessService> logger)
    {
        _options = options.Value;
        _cache = cache;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public bool ValidateCredentials(string userName, string password)
    {
        if (string.IsNullOrWhiteSpace(userName) || string.IsNullOrEmpty(password))
            return false;

        if (!OperatingSystem.IsWindows())
        {
            _logger.LogWarning("AD doğrulama yalnızca Windows ortamında çalışır.");
            return false;
        }

        var sam = ExtractAccountName(userName);
        var domain = _options.AdDomain?.Trim();
        if (string.IsNullOrWhiteSpace(domain))
        {
            _logger.LogWarning("Authorization:AdDomain tanımlı değil.");
            return false;
        }

        try
        {
            using var context = new PrincipalContext(ContextType.Domain, domain);
            var ok = context.ValidateCredentials(sam, password);
            _logger.LogInformation("AD doğrulama {Result}: {User}", ok ? "başarılı" : "başarısız", sam);
            return ok;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AD doğrulama hatası: {User}", sam);
            return false;
        }
    }

    public bool IsAdmin(string? userName)
    {
        if (string.IsNullOrWhiteSpace(userName) || userName == "Unknown")
            return false;

        var cacheKey = $"agb-admin:{userName.Trim().ToUpperInvariant()}";
        return _cache.GetOrCreate(cacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = GroupCacheDuration;
            return IsAdminCore(userName);
        });
    }

    public AdminSession CreateSession(string userName)
    {
        CleanupSessions();
        var token = Guid.NewGuid().ToString("N");
        var session = new AdminSession(token, ExtractAccountName(userName), DateTimeOffset.UtcNow.Add(SessionDuration));
        _sessions[token] = session;
        return session;
    }

    public AdminSession? GetSession(string? token)
    {
        CleanupSessions();
        if (string.IsNullOrWhiteSpace(token)) return null;
        return _sessions.TryGetValue(token, out var s) && s.ExpiresAt >= DateTimeOffset.UtcNow ? s : null;
    }

    public void Revoke(string? token)
    {
        if (!string.IsNullOrWhiteSpace(token))
            _sessions.TryRemove(token, out _);
    }

    private bool IsAdminCore(string userName)
    {
        if (HasAdGroups() && IsMemberOfAdminGroups(userName))
            return true;

        if (IsListedAdminUser(userName))
            return true;

        return IsPanelUserInDatabase(userName);
    }

    public IReadOnlyList<string> GetConfigAdminUsers()
    {
        if (_options.AdminUsers is not { Count: > 0 })
            return Array.Empty<string>();

        return _options.AdminUsers
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(ExtractAccountName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public void InvalidateAdminCache(string? userName = null)
    {
        if (!string.IsNullOrWhiteSpace(userName))
        {
            _cache.Remove($"agb-admin:{userName.Trim().ToUpperInvariant()}");
            _cache.Remove($"agb-admin:{ExtractAccountName(userName).ToUpperInvariant()}");
            return;
        }

        // Basit yaklaşım: bilinen config kullanıcılarının önbelleğini temizle
        foreach (var u in GetConfigAdminUsers())
            _cache.Remove($"agb-admin:{u.ToUpperInvariant()}");
    }

    private bool IsPanelUserInDatabase(string userName)
    {
        var login = ExtractAccountName(userName);
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<Data.BoytasWhContext>();
            return db.AGB_Vakif_PanelKullanici.AsNoTracking()
                .Any(x => x.UserName == login);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Panel kullanıcı DB kontrolü başarısız: {User}", login);
            return false;
        }
    }

    private bool HasAdGroups() =>
        _options.AdminAdGroups is { Count: > 0 } &&
        _options.AdminAdGroups.Any(g => !string.IsNullOrWhiteSpace(g));

    private bool IsListedAdminUser(string userName)
    {
        if (_options.AdminUsers is not { Count: > 0 })
            return false;

        var loginName = ExtractAccountName(userName);
        foreach (var admin in _options.AdminUsers)
        {
            if (string.IsNullOrWhiteSpace(admin)) continue;
            if (string.Equals(admin.Trim(), userName, StringComparison.OrdinalIgnoreCase))
                return true;
            if (string.Equals(ExtractAccountName(admin), loginName, StringComparison.OrdinalIgnoreCase))
                return true;
        }

        return false;
    }

    private bool IsMemberOfAdminGroups(string userName)
    {
        if (!OperatingSystem.IsWindows())
        {
            _logger.LogWarning("AD grup kontrolü yalnızca Windows ortamında çalışır.");
            return false;
        }

        var domain = _options.AdDomain?.Trim();
        if (string.IsNullOrWhiteSpace(domain))
        {
            _logger.LogWarning("AD domain tanımlı değil; AdminAdGroups kontrol edilemedi.");
            return false;
        }

        var samAccountName = ExtractAccountName(userName);
        try
        {
            using var context = new PrincipalContext(ContextType.Domain, domain);
            using var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, samAccountName);
            if (user is null)
            {
                _logger.LogWarning("AD kullanıcısı bulunamadı: {UserName} (domain: {Domain})", userName, domain);
                return false;
            }

            foreach (var groupSpec in _options.AdminAdGroups!)
            {
                if (string.IsNullOrWhiteSpace(groupSpec)) continue;
                var groupSam = ExtractAccountName(groupSpec.Trim());
                using var group = GroupPrincipal.FindByIdentity(context, IdentityType.SamAccountName, groupSam)
                    ?? GroupPrincipal.FindByIdentity(context, IdentityType.Name, groupSam);

                if (group is not null && user.IsMemberOf(group))
                {
                    _logger.LogDebug("Admin erişimi AD grubu ile doğrulandı: {UserName} -> {Group}", userName, groupSam);
                    return true;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AD grup kontrolü başarısız: {UserName}", userName);
        }

        return false;
    }

    private void CleanupSessions()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var pair in _sessions)
        {
            if (pair.Value.ExpiresAt < now)
                _sessions.TryRemove(pair.Key, out _);
        }
    }

    private static string ExtractAccountName(string value)
    {
        var idx = value.IndexOf('\\');
        return idx >= 0 ? value[(idx + 1)..].Trim().ToLowerInvariant() : value.Trim().ToLowerInvariant();
    }
}
#pragma warning restore CA1416
