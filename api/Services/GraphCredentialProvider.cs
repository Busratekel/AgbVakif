using AgbVakif.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgbVakif.Api.Services;

public sealed class GraphCredentialProvider(
    BoytasWhContext db,
    IMemoryCache cache,
    ILogger<GraphCredentialProvider> logger)
{
    private const string CacheKey = "graph-credentials";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public async Task<GraphCredentials> GetAsync(CancellationToken cancellationToken = default)
    {
        if (cache.TryGetValue(CacheKey, out GraphCredentials? cached) && cached is not null)
        {
            return cached;
        }

        var config = await db.PB_Config.AsNoTracking().ToListAsync(cancellationToken);

        var tenantId = config.FirstOrDefault(x => x.ConfigKey == "GraphTenantID")?.ConfigValue;
        var clientId = config.FirstOrDefault(x => x.ConfigKey == "GraphClientID")?.ConfigValue;
        var clientSecret = config.FirstOrDefault(x => x.ConfigKey == "GraphClientSecret")?.ConfigValue;

        if (string.IsNullOrWhiteSpace(tenantId) ||
            string.IsNullOrWhiteSpace(clientId) ||
            string.IsNullOrWhiteSpace(clientSecret))
        {
            logger.LogError(
                "PB_Config içinde GraphTenantID / GraphClientID / GraphClientSecret bulunamadı.");
            throw new InvalidOperationException(
                "Graph ayarları PB_Config tablosundan okunamadı.");
        }

        var credentials = new GraphCredentials(tenantId, clientId, clientSecret);
        cache.Set(CacheKey, credentials, CacheDuration);
        return credentials;
    }
}

public sealed record GraphCredentials(string TenantId, string ClientId, string ClientSecret);
