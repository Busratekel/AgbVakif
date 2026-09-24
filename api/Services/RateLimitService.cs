using System.Collections.Concurrent;

namespace AgbVakif.Api.Services;

public sealed class RateLimitService
{
    private readonly ConcurrentDictionary<string, DateTimeOffset> _last = new();
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(1);

    public bool IsAllowed(string key)
    {
        var now = DateTimeOffset.UtcNow;
        if (_last.TryGetValue(key, out var previous) && now - previous < Window)
        {
            return false;
        }

        _last[key] = now;
        return true;
    }
}
