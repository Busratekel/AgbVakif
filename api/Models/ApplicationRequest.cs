using System.ComponentModel.DataAnnotations;

namespace AgbVakif.Api.Models;

public sealed class ApplicationRequest
{
    [Required, MaxLength(120)]
    public string AdSoyad { get; set; } = "";

    [Required, MaxLength(40)]
    public string Telefon { get; set; } = "";

    [Required, EmailAddress, MaxLength(160)]
    public string Eposta { get; set; } = "";

    [Required, MinLength(1), MaxLength(60)]
    public string TalepTutari { get; set; } = "";

    [Required, MaxLength(120)]
    public string Statu { get; set; } = "";

    [Required, MaxLength(120)]
    public string Kategori { get; set; } = "";

    [Required, MaxLength(4000)]
    public string TalepOzeti { get; set; } = "";

    [Required]
    public bool KvkkOnay { get; set; }

    [Required]
    public string CaptchaId { get; set; } = "";

    [Required]
    public string CaptchaAnswer { get; set; } = "";

    /// <summary>Honeypot — doluysa bot kabul edilir ve sessizce OK döner.</summary>
    public string? Website { get; set; }
}
