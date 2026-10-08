using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace AgbVakif.Api.Services;

public sealed class OtpSessionService
{
    private readonly ConcurrentDictionary<string, OtpSession> _otp = new();
    private readonly ConcurrentDictionary<string, AccessSession> _access = new();

    public OtpSession CreateOtp(string tc, string telefon, string basvuruTipi)
    {
        Cleanup();
        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var sessionId = Guid.NewGuid().ToString("N");
        var entry = new OtpSession(sessionId, tc, telefon, basvuruTipi, code, DateTimeOffset.UtcNow.AddMinutes(3));
        _otp[sessionId] = entry;
        return entry;
    }

    public OtpSession? GetOtp(string sessionId)
    {
        Cleanup();
        return _otp.TryGetValue(sessionId, out var s) ? s : null;
    }

    public bool TryVerifyOtp(string sessionId, string code, out AccessSession? access)
    {
        access = null;
        Cleanup();
        if (!_otp.TryRemove(sessionId, out var otp)) return false;
        if (otp.ExpiresAt < DateTimeOffset.UtcNow) return false;
        if (!string.Equals(otp.Code, code.Trim(), StringComparison.Ordinal)) return false;

        var token = Guid.NewGuid().ToString("N");
        access = new AccessSession(
            token,
            otp.TcKimlikNo,
            otp.Telefon,
            otp.BasvuruTipi,
            DateTimeOffset.UtcNow.AddHours(2),
            SelectedBasvuruId: null);
        _access[token] = access;
        return true;
    }

    public AccessSession? GetAccess(string? token)
    {
        Cleanup();
        if (string.IsNullOrWhiteSpace(token)) return null;
        return _access.TryGetValue(token, out var s) && s.ExpiresAt >= DateTimeOffset.UtcNow ? s : null;
    }

    public AccessSession? TrySelectBasvuru(string? token, Guid basvuruId)
    {
        Cleanup();
        if (string.IsNullOrWhiteSpace(token)) return null;
        if (!_access.TryGetValue(token, out var s) || s.ExpiresAt < DateTimeOffset.UtcNow) return null;
        var updated = s with { SelectedBasvuruId = basvuruId };
        _access[token] = updated;
        return updated;
    }

    public AccessSession? ClearSelectedBasvuru(string? token)
    {
        Cleanup();
        if (string.IsNullOrWhiteSpace(token)) return null;
        if (!_access.TryGetValue(token, out var s) || s.ExpiresAt < DateTimeOffset.UtcNow) return null;
        var updated = s with { SelectedBasvuruId = null };
        _access[token] = updated;
        return updated;
    }

    private void Cleanup()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var pair in _otp)
        {
            if (pair.Value.ExpiresAt < now) _otp.TryRemove(pair.Key, out _);
        }

        foreach (var pair in _access)
        {
            if (pair.Value.ExpiresAt < now) _access.TryRemove(pair.Key, out _);
        }
    }
}

public sealed record OtpSession(
    string SessionId,
    string TcKimlikNo,
    string Telefon,
    string BasvuruTipi,
    string Code,
    DateTimeOffset ExpiresAt);

public sealed record AccessSession(
    string Token,
    string TcKimlikNo,
    string Telefon,
    string BasvuruTipi,
    DateTimeOffset ExpiresAt,
    Guid? SelectedBasvuruId = null);
