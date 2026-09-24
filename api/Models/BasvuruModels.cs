using System.ComponentModel.DataAnnotations;

namespace AgbVakif.Api.Models;

public sealed class KimlikRequest
{
    [Required]
    public string TcKimlikNo { get; set; } = "";

    [Required]
    public string Telefon { get; set; } = "";

    [Required]
    public bool KvkkOnay { get; set; }
}

public sealed class SmsDogrulaRequest
{
    [Required]
    public string SessionId { get; set; } = "";

    [Required]
    public string Code { get; set; } = "";
}

public sealed class BasvuruKaydetRequest
{
    [Required, MaxLength(80)]
    public string Ad { get; set; } = "";

    [Required, MaxLength(80)]
    public string Soyad { get; set; } = "";

    public DateOnly? DogumTarihi { get; set; }

    [MaxLength(80)]
    public string? DogumYeri { get; set; }

    [Required, EmailAddress, MaxLength(160)]
    public string Eposta { get; set; } = "";

    [MaxLength(20)]
    public string? YakinTelefon { get; set; }

    [Required, MaxLength(60)]
    public string Il { get; set; } = "";

    [Required, MaxLength(60)]
    public string Ilce { get; set; } = "";

    [Required, MaxLength(120)]
    public string Statu { get; set; } = "";

    [Required, MaxLength(120)]
    public string Kategori { get; set; } = "";

    [Required, MaxLength(60)]
    public string TalepTutari { get; set; } = "";

    [Required, MaxLength(4000)]
    public string TalepOzeti { get; set; } = "";

    public bool BeyanCalismiyor { get; set; }
    public bool BeyanAdliSicil { get; set; }
    public bool BeyanBilgiDogru { get; set; }
}

public sealed class BasvuruDto
{
    public Guid Id { get; set; }
    public string TcKimlikNoMasked { get; set; } = "";
    public string TelefonMasked { get; set; } = "";
    public string? Ad { get; set; }
    public string? Soyad { get; set; }
    public string? DogumTarihi { get; set; }
    public string? DogumYeri { get; set; }
    public string? Eposta { get; set; }
    public string? YakinTelefon { get; set; }
    public string? Il { get; set; }
    public string? Ilce { get; set; }
    public string? Statu { get; set; }
    public string? Kategori { get; set; }
    public string? TalepTutari { get; set; }
    public string? TalepOzeti { get; set; }
    public bool BeyanCalismiyor { get; set; }
    public bool BeyanAdliSicil { get; set; }
    public bool BeyanBilgiDogru { get; set; }
    public string Durum { get; set; } = "";
}
