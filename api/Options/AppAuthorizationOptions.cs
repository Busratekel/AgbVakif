namespace AgbVakif.Api.Options;

public sealed class AppAuthorizationOptions
{
    public const string SectionName = "Authorization";

    public List<string> AdminAdGroups { get; set; } = [];

    public string AdDomain { get; set; } = "BELLONAAS";

    /// <summary>AD grubu dışında / yedek olarak panele girebilecek kullanıcılar.</summary>
    public List<string> AdminUsers { get; set; } = [];
}
