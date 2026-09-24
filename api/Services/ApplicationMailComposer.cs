using System.Net;
using System.Text;
using AgbVakif.Api.Models;

namespace AgbVakif.Api.Services;

public static class ApplicationMailComposer
{
    public static string BuildText(ApplicationRequest request)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Anadolu Güçbirliği Vakfı — Yeni destek başvurusu");
        sb.AppendLine();
        sb.AppendLine($"Ad Soyad: {request.AdSoyad}");
        sb.AppendLine($"Telefon: {request.Telefon}");
        sb.AppendLine($"E-posta: {request.Eposta}");
        sb.AppendLine($"Talep Tutarı: {request.TalepTutari}");
        sb.AppendLine($"Başvuru Sahibi Statüsü: {request.Statu}");
        sb.AppendLine($"Destek Kategorisi: {request.Kategori}");
        sb.AppendLine();
        sb.AppendLine("Talep Özeti:");
        sb.AppendLine(request.TalepOzeti);
        sb.AppendLine();
        sb.AppendLine("KVKK Onayı: Evet");
        return sb.ToString();
    }

    public static string BuildHtml(ApplicationRequest request)
    {
        static string E(string? value) => WebUtility.HtmlEncode(value ?? "");

        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.5">
              <h2 style="margin:0 0 12px">Anadolu Güçbirliği Vakfı</h2>
              <p style="margin:0 0 18px;color:#5c6f67">Yeni destek başvurusu</p>
              <table style="border-collapse:collapse;width:100%;max-width:640px">
                <tr><td style="padding:8px;border:1px solid #d7ddd9;width:38%"><strong>Ad Soyad</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.AdSoyad)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>Telefon</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.Telefon)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>E-posta</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.Eposta)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>Talep Tutarı</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.TalepTutari)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>Başvuru Sahibi Statüsü</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.Statu)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>Destek Kategorisi</strong></td><td style="padding:8px;border:1px solid #d7ddd9">{E(request.Kategori)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9;vertical-align:top"><strong>Talep Özeti</strong></td><td style="padding:8px;border:1px solid #d7ddd9;white-space:pre-wrap">{E(request.TalepOzeti)}</td></tr>
                <tr><td style="padding:8px;border:1px solid #d7ddd9"><strong>KVKK Onayı</strong></td><td style="padding:8px;border:1px solid #d7ddd9">Evet</td></tr>
              </table>
            </div>
            """;
    }

    public static string BuildApplicantAutoReply() =>
        """
        <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.5">
          <p>Sayın başvuru sahibi,</p>
          <p>Başvurunuz <strong>Anadolu Güçbirliği Vakfı</strong> tarafından alınmıştır. En kısa sürede değerlendirilecektir.</p>
          <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
        </div>
        """;
}
