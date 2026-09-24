using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace AgbVakif.Api.Services;

public sealed class CaptchaService
{
    private readonly ConcurrentDictionary<string, CaptchaEntry> _store = new();
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(10);
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public (string Id, string Code) Create()
    {
        Cleanup();
        var code = GenerateCode(6);
        var id = Guid.NewGuid().ToString("N");
        _store[id] = new CaptchaEntry(code, DateTimeOffset.UtcNow.Add(Ttl));
        return (id, code);
    }

    public bool Validate(string id, string answer)
    {
        Cleanup();
        if (!_store.TryRemove(id, out var entry))
        {
            return false;
        }

        if (entry.ExpiresAt < DateTimeOffset.UtcNow)
        {
            return false;
        }

        return string.Equals(
            entry.Code,
            answer.Trim(),
            StringComparison.OrdinalIgnoreCase);
    }

    private static string GenerateCode(int length)
    {
        var sb = new StringBuilder(length);
        for (var i = 0; i < length; i++)
        {
            var index = RandomNumberGenerator.GetInt32(Alphabet.Length);
            sb.Append(Alphabet[index]);
        }

        return sb.ToString();
    }

    private void Cleanup()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var pair in _store)
        {
            if (pair.Value.ExpiresAt < now)
            {
                _store.TryRemove(pair.Key, out _);
            }
        }
    }

    private sealed record CaptchaEntry(string Code, DateTimeOffset ExpiresAt);
}
