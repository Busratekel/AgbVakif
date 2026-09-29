using AgbVakif.Api.Options;
using Microsoft.Extensions.Options;

namespace AgbVakif.Api.Services;
public sealed class BelgeStorageService(IWebHostEnvironment env, IOptions<StorageOptions> options)
{
    public string GetRoot()
    {
        var configured = (options.Value.BelgeRootPath ?? "").Trim();
        if (!string.IsNullOrWhiteSpace(configured))
        {
            return configured.TrimEnd('\\', '/');
        }

        return Path.Combine(env.ContentRootPath, "App_Data", "belgeler");
    }

    public static string SanitizeFolderName(string? basvuruNo, Guid basvuruId)
    {
        var raw = (basvuruNo ?? "").Trim();
        if (string.IsNullOrWhiteSpace(raw))
        {
            return basvuruId.ToString("N");
        }

        foreach (var c in Path.GetInvalidFileNameChars())
        {
            raw = raw.Replace(c, '_');
        }

        raw = raw.Replace(' ', '_');
        return string.IsNullOrWhiteSpace(raw) ? basvuruId.ToString("N") : raw;
    }

    /// <summary>
    /// Diskte dosyayı bulur. SaklananAd tam yol veya eski göreli yol olabilir.
    /// </summary>
    public string? FindExistingPath(string? saklananAd)
    {
        if (string.IsNullOrWhiteSpace(saklananAd)) return null;

        var raw = saklananAd.Trim();
        if (raw.Contains("..", StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Geçersiz dosya yolu.");
        }

        // Yeni kayıtlar: tam fiziksel yol
        if (Path.IsPathRooted(raw) || raw.StartsWith(@"\\", StringComparison.Ordinal))
        {
            try
            {
                if (File.Exists(raw)) return raw;
            }
            catch
            {
                // paylaşım erişim hatası olabilir
            }

            return null;
        }

        // Eski kayıtlar: göreli yol (BasvuruNo/guid.ext)
        var relative = raw.Replace('/', Path.DirectorySeparatorChar).TrimStart(Path.DirectorySeparatorChar);
        var name = Path.GetFileName(relative);
        var candidates = new[]
        {
            Path.Combine(GetRoot(), relative),
            Path.Combine(GetRoot(), name),
            Path.Combine(env.ContentRootPath, "App_Data", "belgeler", relative),
            Path.Combine(env.ContentRootPath, "App_Data", "belgeler", name),
        };

        foreach (var path in candidates)
        {
            try
            {
                if (File.Exists(path)) return path;
            }
            catch
            {
                // paylaşım erişim hatası olabilir
            }
        }

        return null;
    }

    /// <summary>
    /// Dosyayı ortak alana yazar; dönüş değeri DB'ye yazılacak tam fiziksel yoldur.
    /// </summary>
    public async Task<string> SaveAsync(
        string? basvuruNo,
        Guid basvuruId,
        string extension,
        Stream content,
        CancellationToken ct)
    {
        var folder = SanitizeFolderName(basvuruNo, basvuruId);
        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var full = Path.Combine(GetRoot(), folder, fileName);
        var dir = Path.GetDirectoryName(full)!;
        Directory.CreateDirectory(dir);
        await using var stream = File.Create(full);
        await content.CopyToAsync(stream, ct);
        return full;
    }

    public void TryDelete(string? saklananAd)
    {
        if (string.IsNullOrWhiteSpace(saklananAd)) return;
        try
        {
            var full = FindExistingPath(saklananAd);
            if (full is not null && File.Exists(full)) File.Delete(full);
        }
        catch
        {
            // ignore
        }
    }
}
