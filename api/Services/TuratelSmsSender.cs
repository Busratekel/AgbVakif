using System.Net;
using System.Text;
using System.Xml.Linq;
using AgbVakif.Api.Options;
using Microsoft.Extensions.Options;

namespace AgbVakif.Api.Services;

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
        var encodedMessage = WebUtility.HtmlEncode(message);
        // Option=1: Single Shot OTP (otpbellona hesabı)
        var xml =
            $"""
            <?xml version="1.0" encoding="utf-8"?>
            <MainmsgBody>
            <Command>0</Command>
            <PlatformID>{EscapeXml(cfg.PlatformId)}</PlatformID>
            <ChannelCode>{EscapeXml(cfg.ChannelCode)}</ChannelCode>
            <UserName>{EscapeXml(cfg.UserName)}</UserName>
            <PassWord>{EscapeXml(cfg.PassWord)}</PassWord>
            <Mesgbody>{encodedMessage}</Mesgbody>
            <Numbers>{number}</Numbers>
            <Type>{EscapeXml(cfg.Type)}</Type>
            <Originator>{EscapeXml(cfg.Originator)}</Originator>
            <Option>1</Option>
            </MainmsgBody>
            """;

        var client = httpClientFactory.CreateClient(nameof(TuratelSmsSender));
        using var content = new StringContent(
            xml.Replace("\r\n", "\n").Replace("\n", ""),
            Encoding.UTF8,
            "application/xml");
        using var response = await client.PostAsync(cfg.Url, content, cancellationToken);
        var body = (await response.Content.ReadAsStringAsync(cancellationToken)).Trim();

        logger.LogInformation(
            "Turatel SMS yanıtı ({Status}) Originator={Originator} Phone=***{Last4}: {Body}",
            (int)response.StatusCode,
            cfg.Originator,
            number.Length >= 4 ? number[^4..] : "????",
            body);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("SMS gönderilemedi (Turatel HTTP hata).");
        }

        if (!IsTuratelSuccess(body))
        {
            logger.LogError("Turatel SMS hata gövdesi: {Body}", body);
            throw new InvalidOperationException($"SMS gönderilemedi (Turatel: {DescribeError(body)}).");
        }
    }

    /// <summary>
    /// otpbellona hesabı başarıda "100" veya "ID:123…" döner.
    /// Klasik hata kodları: 01 auth, 02 kredi, 03 içerik, 05 originator, 06 boş…
    /// </summary>
    internal static bool IsTuratelSuccess(string body)
    {
        if (string.IsNullOrWhiteSpace(body))
            return true;

        var trimmed = body.Trim();
        if (trimmed.StartsWith("ID:", StringComparison.OrdinalIgnoreCase))
            return true;

        // Bu Turatel OTP hesabının bilinen başarı cevabı
        if (trimmed == "100")
            return true;

        if (trimmed.Contains("ERR", StringComparison.OrdinalIgnoreCase)
            || trimmed.Contains("Error", StringComparison.OrdinalIgnoreCase)
            || trimmed.Contains("Hata", StringComparison.OrdinalIgnoreCase)
            || trimmed.Contains("fail", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        // 01–11, 18 gibi kısa hata kodları (100 hariç)
        if (trimmed.Length <= 2 && trimmed.All(char.IsDigit))
            return false;

        return trimmed.All(c => char.IsDigit(c) || char.IsWhiteSpace(c));
    }

    internal static string DescribeError(string body) => body.Trim() switch
    {
        "01" => "kullanıcı/şifre hatalı",
        "02" => "SMS kredisi yetersiz",
        "03" => "geçersiz içerik",
        "04" => "bilinmeyen SMS tipi",
        "05" => "hatalı gönderen ismi (Originator)",
        "06" => "mesaj veya alıcı eksik",
        "07" => "mesaj uzun, Concat yok",
        "08" => "gateway tanımlı değil / çalışmıyor",
        "09" => "yanlış tarih formatı",
        _ => body.Trim(),
    };

    internal static string ToMsisdn90(string phone)
    {
        var digits = new string((phone ?? "").Where(char.IsDigit).ToArray());
        if (digits.StartsWith('0')) digits = digits[1..];
        if (!digits.StartsWith("90")) digits = "90" + digits;
        return digits;
    }

    private static string EscapeXml(string? value) =>
        new XText(value ?? "").ToString();
}
