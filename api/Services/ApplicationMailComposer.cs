using System.Net;
using AgbVakif.Api.Data;

namespace AgbVakif.Api.Services;

public static class ApplicationMailComposer
{
    private static string NoLabel(AgbBasvuru e) =>
        string.IsNullOrWhiteSpace(e.BasvuruNo) ? "" : e.BasvuruNo.Trim();

    /// <summary>Vakıf ekibine kısa bildirim (detay panelden bakılacak).</summary>
    public static string BuildStaffNoticeText(AgbBasvuru e, bool isUpdate = false)
    {
        var ad = $"{e.Ad} {e.Soyad}".Trim();
        var no = NoLabel(e);
        return
            "Anadolu Güçbirliği Vakfı\n\n" +
            (isUpdate
                ? "Mevcut bir burs / destek başvurusu güncellendi.\n\n"
                : "Yeni bir burs / destek başvurusu alındı.\n\n") +
            (string.IsNullOrEmpty(no) ? "" : $"Başvuru no: {no}\n") +
            $"Başvuran: {ad}\n" +
            $"Telefon: {e.Telefon}\n" +
            $"E-posta: {e.Eposta}\n\n" +
            "Başvuru detaylarını panelden inceleyebilirsiniz.";
    }

    public static string BuildStaffNoticeHtml(AgbBasvuru e, bool isUpdate = false)
    {
        static string Enc(string? value) => WebUtility.HtmlEncode(value ?? "");
        var ad = Enc($"{e.Ad} {e.Soyad}".Trim());
        var no = NoLabel(e);

        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <h2 style="margin:0 0 8px">Anadolu Güçbirliği Vakfı</h2>
              <p style="margin:0 0 16px">{(isUpdate ? "Mevcut bir burs / destek başvurusu güncellendi." : "Yeni bir burs / destek başvurusu alındı.")}</p>
              {(string.IsNullOrEmpty(no) ? "" : $"<p style=\"margin:0 0 8px\"><strong>Başvuru no:</strong> {Enc(no)}</p>")}
              <p style="margin:0 0 8px"><strong>Başvuran:</strong> {ad}</p>
              <p style="margin:0 0 8px"><strong>Telefon:</strong> {Enc(e.Telefon)}</p>
              <p style="margin:0 0 16px"><strong>E-posta:</strong> {Enc(e.Eposta)}</p>
              <p style="margin:0;color:#5c6f67">Detaylar panel üzerinden görüntülenecektir.</p>
            </div>
            """;
    }

    public static string BuildApplicantAutoReply(AgbBasvuru e, bool isUpdate = false)
    {
        var no = NoLabel(e);
        var noHtml = string.IsNullOrEmpty(no)
            ? ""
            : $"<p>Başvuru numaranız: <strong>{WebUtility.HtmlEncode(no)}</strong></p>";
        var body = isUpdate
            ? $"<p><strong>{WebUtility.HtmlEncode(no)}</strong> numaralı başvurunuz <strong>Anadolu Güçbirliği Vakfı</strong> tarafından güncellenmiştir.</p>"
            : $"<p><strong>{WebUtility.HtmlEncode(no)}</strong> numaralı başvurunuz <strong>Anadolu Güçbirliği Vakfı</strong> tarafından alınmış ve değerlendirmeye alınmıştır.</p>";
        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.5">
              <p>Sayın başvuru sahibi,</p>
              {body}
              {noHtml}
              <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
            </div>
            """;
    }

    public static string BuildApplicantAutoReplyText(AgbBasvuru e, bool isUpdate = false)
    {
        var no = NoLabel(e);
        var subject = string.IsNullOrEmpty(no) ? "Başvurunuz" : $"{no} numaralı başvurunuz";
        return
            "Sayın başvuru sahibi,\n\n" +
            subject +
            (isUpdate
                ? " Anadolu Güçbirliği Vakfı tarafından güncellenmiştir.\n\n"
                : " Anadolu Güçbirliği Vakfı tarafından alınmış ve değerlendirmeye alınmıştır.\n\n") +
            "Saygılarımızla,\nAnadolu Güçbirliği Vakfı";
    }

    public static string ReceivedSms(AgbBasvuru e, bool isUpdate = false)
    {
        var no = NoLabel(e);
        if (isUpdate)
        {
            return string.IsNullOrEmpty(no)
                ? "Anadolu Gucbirligi Vakfi: Basvurunuz guncellenmistir."
                : $"Anadolu Gucbirligi Vakfi: {no} nolu basvurunuz guncellenmistir.";
        }

        return string.IsNullOrEmpty(no)
            ? "Anadolu Gucbirligi Vakfi: Destek basvurunuz alinmistir. Degerlendirme sonucunda sizinle iletisime gecilecektir."
            : $"Anadolu Gucbirligi Vakfi: {no} nolu basvurunuz degerlendirmeye alinmistir.";
    }

    public static string BuildApprovalHtml(string? adSoyad, string? basvuruNo)
    {
        var ad = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim());
        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <p>Sayın {ad},</p>
              <p>Başvurunuz onaylanmıştır. Sizden istenen belgeleri site üzerindeki <strong>Başvurum</strong> bölümündeki belge yükleme alanından ekleyiniz.</p>
              <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
            </div>
            """;
    }

    public static string BuildApprovalText(string? adSoyad, string? basvuruNo)
    {
        var ad = string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim();
        return
            $"Sayın {ad},\n\n" +
            "Başvurunuz onaylanmıştır. Sizden istenen belgeleri site üzerindeki Başvurum bölümündeki belge yükleme alanından ekleyiniz.\n\n" +
            "Saygılarımızla,\nAnadolu Güçbirliği Vakfı";
    }

    public static string ApprovalSms(string? basvuruNo)
    {
        return "Anadolu Güçbirliği Vakfı: Başvurunuz onaylanmıştır. İstenen belgeleri Başvurum bölümündeki belge yükleme alanından ekleyiniz.";
    }

    public static string BuildRejectionHtml(string? adSoyad, string? basvuruNo)
    {
        var ad = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim());
        var no = (basvuruNo ?? "").Trim();
        var noPart = string.IsNullOrEmpty(no)
            ? "başvurunuz"
            : $"<strong>{WebUtility.HtmlEncode(no)}</strong> numaralı başvurunuz";
        return $"""
            <div style="font-family:Segoe UI,Arial,sans-serif;color:#14241f;line-height:1.55">
              <p>Sayın {ad},</p>
              <p>Üzgünüz; {noPart} <strong>Anadolu Güçbirliği Vakfı</strong> tarafından <strong>reddedilmiştir</strong>.</p>
              <p>İlginiz için teşekkür eder, gelecekteki başvurularınızda başarılar dileriz.</p>
              <p>Saygılarımızla,<br/>Anadolu Güçbirliği Vakfı</p>
            </div>
            """;
    }

    public static string BuildRejectionText(string? adSoyad, string? basvuruNo)
    {
        var ad = string.IsNullOrWhiteSpace(adSoyad) ? "başvuru sahibi" : adSoyad.Trim();
        var no = (basvuruNo ?? "").Trim();
        var subject = string.IsNullOrEmpty(no) ? "başvurunuz" : $"{no} numaralı başvurunuz";
        return
            $"Sayın {ad},\n\n" +
            $"Üzgünüz; {subject} Anadolu Güçbirliği Vakfı tarafından reddedilmiştir.\n" +
            "İlginiz için teşekkür eder, gelecekteki başvurularınızda başarılar dileriz.\n\n" +
            "Saygılarımızla,\nAnadolu Güçbirliği Vakfı";
    }

    public static string RejectionSms(string? basvuruNo)
    {
        var no = (basvuruNo ?? "").Trim();
        return string.IsNullOrEmpty(no)
            ? "Anadolu Gucbirligi Vakfi: Uzgunuz, basvurunuz reddedilmistir. Ilginiz icin tesekkur ederiz."
            : $"Anadolu Gucbirligi Vakfi: Uzgunuz, {no} nolu basvurunuz reddedilmistir.";
    }
}
