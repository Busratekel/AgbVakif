using System.Net;
using AgbVakif.Api.Data;

namespace AgbVakif.Api.Services;

public static class ApplicationMailComposer
{
    /// <summary>Vakıf ekibine kısa bildirim (detay panelden bakılacak).</summary>
    public static string BuildStaffNoticeText(AgbBasvuru e)
    {
        var ad = $"{e.Ad} {e.Soyad}".Trim();
        return
            "Anadolu Güçbirliği Vakfı\n\n" +
            "Yeni bir burs / destek başvurusu alındı.\n\n" +
            $"Başvuran: {ad}\n" +
            $"Telefon: {e.Telefon}\n" +
            $"E-posta: {e.Eposta}\n\n" +
            "Başvuru detaylarını panelden inceleyebilirsiniz.";
    }

    public static string BuildStaffNoticeHtml(AgbBasvuru e)
    {
        static string Enc(string? value) => WebUtility.HtmlEncode(value ?? "");
        var ad = Enc($"{e.Ad} {e.Soyad}".Trim());

        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <h2 style="margin:0 0 8px">Anadolu Güçbirliği Vakfı</h2>
              <p style="margin:0 0 16px">Yeni bir burs / destek başvurusu alındı.</p>
              <p style="margin:0 0 8px"><strong>Başvuran:</strong> {ad}</p>
              <p style="margin:0 0 8px"><strong>Telefon:</strong> {Enc(e.Telefon)}</p>
              <p style="margin:0 0 16px"><strong>E-posta:</strong> {Enc(e.Eposta)}</p>
              <p style="margin:0;color:#5c6f67">Detaylar panel üzerinden görüntülenecektir.</p>
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

    public static string BuildApprovalHtml(string? adSoyad)
    {
        var ad = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim());
        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <p>Sayın {ad},</p>
              <p>Başvurunuz <strong>Anadolu Güçbirliği Vakfı</strong> tarafından <strong>onaylanmıştır</strong>.</p>
              <p>En kısa sürede sizinle iletişime geçilecektir.</p>
              <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
            </div>
            """;
    }

    public static string BuildApprovalText(string? adSoyad)
    {
        var ad = string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim();
        return
            $"Sayın {ad},\n\n" +
            "Başvurunuz Anadolu Güçbirliği Vakfı tarafından onaylanmıştır.\n" +
            "En kısa sürede sizinle iletişime geçilecektir.\n\n" +
            "Saygılarımızla,\nAnadolu Güçbirliği Vakfı";
    }

    public const string ApprovalSms =
        "Anadolu Gucbirligi Vakfi: Basvurunuz onaylanmistir. En kisa surede sizinle iletisime gecilecektir.";

    public static string BuildRejectionHtml(string? adSoyad)
    {
        var ad = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim());
        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <p>Sayın {ad},</p>
              <p>Üzgünüz; başvurunuz <strong>Anadolu Güçbirliği Vakfı</strong> tarafından <strong>olumsuz</strong> sonuçlandırılmıştır.</p>
              <p>İlginiz için teşekkür eder, gelecekteki başvurularınızda başarılar dileriz.</p>
              <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
            </div>
            """;
    }

    public static string BuildRejectionText(string? adSoyad)
    {
        var ad = string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim();
        return
            $"Sayın {ad},\n\n" +
            "Üzgünüz; başvurunuz Anadolu Güçbirliği Vakfı tarafından olumsuz sonuçlandırılmıştır.\n" +
            "İlginiz için teşekkür eder, gelecekteki başvurularınızda başarılar dileriz.\n\n" +
            "Saygılarımızla,\nAnadolu Güçbirliği Vakfı";
    }

    public const string RejectionSms =
        "Anadolu Gucbirligi Vakfi: Uzgunuz, basvurunuz olumsuz sonuclanmistir. Ilginiz icin tesekkur ederiz.";
}
