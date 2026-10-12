using System.Collections.Concurrent;

namespace AgbVakif.Api.Services;

public sealed class RateLimitService
{
    private readonly ConcurrentDictionary<string, Entry> _entries = new();
    private static readonly TimeSpan DefaultCooldown = TimeSpan.FromMinutes(1);

    private sealed class Entry
    {
        public int Count;
        public DateTimeOffset WindowStart;
        public readonly object Gate = new();
    }

    /// <summary>Eski API: anahtar başına en fazla 1 istek / dakika.</summary>
    public bool IsAllowed(string key)
    {
        if (IsBlocked(key, maxAttempts: 1, DefaultCooldown, out _))
        {
            return false;
        }

        RecordFailure(key, DefaultCooldown);
        return true;
    }

    public bool IsBlocked(string key, int maxAttempts, TimeSpan window, out TimeSpan retryAfter)
    {
        retryAfter = TimeSpan.Zero;
        if (!_entries.TryGetValue(key, out var entry))
        {
            return false;
        }

        lock (entry.Gate)
        {
            var now = DateTimeOffset.UtcNow;
            if (now - entry.WindowStart >= window)
            {
                entry.Count = 0;
                entry.WindowStart = now;
                return false;
            }

            if (entry.Count < maxAttempts)
            {
                return false;
            }

            retryAfter = window - (now - entry.WindowStart);
            if (retryAfter < TimeSpan.Zero)
            {
                retryAfter = TimeSpan.Zero;
            }

            return true;
        }
    }

    public void RecordFailure(string key, TimeSpan window)
    {
        var entry = _entries.GetOrAdd(key, static _ => new Entry
        {
            WindowStart = DateTimeOffset.UtcNow,
        });

        lock (entry.Gate)
        {
            var now = DateTimeOffset.UtcNow;
            if (now - entry.WindowStart >= window)
            {
                entry.Count = 1;
                entry.WindowStart = now;
            }
            else
            {
                entry.Count++;
            }
        }
    }

    public void Reset(string key) => _entries.TryRemove(key, out _);
}
