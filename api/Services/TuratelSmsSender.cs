using System.Net;
using System.Text;
using System.Xml.Linq;
using AgbVakif.Api.Options;
using Microsoft.Extensions.Options;

namespace AgbVakif.Api.Services;

/// <summary>
/// Turatel XML SMS (Bellona OTP kanalı — örnek PersonelSync ile aynı akış).
/// </summary>
public sealed class TuratelSmsSender(
    IHttpClientFactory httpClientFactory,
    IOptions<SmsOptions> options,
    ILogger<TuratelSmsSender> logger) : ISmsSender
{
    public async Task SendAsync(string phone, string message, CancellationToken cancellationToken = default)
    {
        var cfg = options.Value.Turatel;
        if (string.IsNullOrWhiteSpace(cfg.UserName) || string.IsNullOrWhiteSpace(cfg.PassWord))
        {
            throw new InvalidOperationException("Sms:Turatel kullanıcı/şifre tanımlı değil.");
        }

        var number = ToMsisdn90(phone);
        var xml = new XElement("MainmsgBody",
            new XElement("Command", "0"),
            new XElement("PlatformID", cfg.PlatformId),
            new XElement("ChannelCode", cfg.ChannelCode),
            new XElement("UserName", cfg.UserName),
            new XElement("PassWord", cfg.PassWord),
            new XElement("Mesgbody", message),
            new XElement("Numbers", number),
            new XElement("Type", cfg.Type),
            new XElement("Originator", cfg.Originator));

        var client = httpClientFactory.CreateClient(nameof(TuratelSmsSender));
        using var content = new StringContent(xml.ToString(SaveOptions.DisableFormatting), Encoding.UTF8, "text/xml");
        using var response = await client.PostAsync(cfg.Url, content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        logger.LogInformation("Turatel SMS yanıtı ({Status}): {Body}", (int)response.StatusCode, body);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("SMS gönderilemedi (Turatel HTTP hata).");
        }

        // Turatel genelde gövdede hata kodu döner; negatif / ERR içeren yanıtları yakala
        if (body.Contains("ERR", StringComparison.OrdinalIgnoreCase) ||
            body.Contains("Error", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogError("Turatel SMS hata gövdesi: {Body}", body);
            throw new InvalidOperationException("SMS gönderilemedi (Turatel).");
        }
    }

    internal static string ToMsisdn90(string phone)
    {
        var digits = new string((phone ?? "").Where(char.IsDigit).ToArray());
        if (digits.StartsWith('0')) digits = digits[1..];
        if (!digits.StartsWith("90")) digits = "90" + digits;
        return digits;
    }
}
