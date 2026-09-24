namespace AgbVakif.Api.Options;

public sealed class EmailOptions
{
    public const string SectionName = "Email";

    /// <summary>Başvurunun düşeceği adres</summary>
    public string ToAddress { get; set; } = "agbvakfi@anadolugucbirligi.com.tr";

    public string FromName { get; set; } = "Anadolu Güçbirliği Vakfı";

    public GraphOptions Graph { get; set; } = new();
}

public sealed class GraphOptions
{
    /// <summary>Maili gönderen M365 kullanıcı UPN (ör. agbvakfi@...)</summary>
    public string SenderUserId { get; set; } = "";
}
