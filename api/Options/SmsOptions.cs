namespace AgbVakif.Api.Options;

public sealed class SmsOptions
{
    public const string SectionName = "Sms";

    /// <summary>Development | Turatel | </summary>
    public string Provider { get; set; } = "Development";

    /// <summary>Development dışında bile OTP’yi API yanıtında gösterme (yalnızca test).</summary>
    public bool ExposeDebugOtp { get; set; }

    public TuratelSmsOptions Turatel { get; set; } = new();
}

public sealed class TuratelSmsOptions
{
    public string Url { get; set; } = "http://service2.turatel.com.tr/xml/process.aspx";
    public string ChannelCode { get; set; } = "583";
    public string UserName { get; set; } = "";
    public string PassWord { get; set; } = "";
    public string Originator { get; set; } = "BELLONA";
    public string PlatformId { get; set; } = "1";
    public string Type { get; set; } = "1";
}