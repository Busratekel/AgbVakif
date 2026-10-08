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

    /// <summary>Burs (varsayılan) veya Destek.</summary>
    public string? BasvuruTipi { get; set; }

    /// <summary>Başvurum girişi: yeni taslak açma; OTP sonrası liste.</summary>
    public bool SadeceGiris { get; set; }
}

public sealed class BasvuruSecRequest
{
    [Required]
    public Guid BasvuruId { get; set; }
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

    [MaxLength(80)]
    public string? YakinKim { get; set; }

    [MaxLength(20)]
    public string? MedeniDurum { get; set; }

    [Required, MaxLength(60)]
    public string Il { get; set; } = "";

    [Required, MaxLength(60)]
    public string Ilce { get; set; } = "";

    [MaxLength(2000)]
    public string? AcikAdres { get; set; }

    [Required, MaxLength(120)]
    public string Statu { get; set; } = "";

    [MaxLength(80)]
    public string? Kategori { get; set; }

    [MaxLength(40)]
    public string? TalepTutari { get; set; }

    [MaxLength(4000)]
    public string? TalepOzeti { get; set; }

    [MaxLength(80)]
    public string? BabaAdi { get; set; }

    [MaxLength(10)]
    public string? BabaSagMi { get; set; }

    [MaxLength(80)]
    public string? BabaMeslegi { get; set; }

    [MaxLength(40)]
    public string? BabaAylikGelir { get; set; }

    [MaxLength(80)]
    public string? AnneAdi { get; set; }

    [MaxLength(10)]
    public string? AnneSagMi { get; set; }

    [MaxLength(80)]
    public string? AnneMeslegi { get; set; }

    [MaxLength(40)]
    public string? AnneAylikGelir { get; set; }

    [MaxLength(10)]
    public string? AnneBabaBirlikte { get; set; }

    [MaxLength(80)]
    public string? BirlikteYasadigiKisiler { get; set; }

    [MaxLength(40)]
    public string? EsAylikGelir { get; set; }

    [MaxLength(40)]
    public string? HaneGeliri { get; set; }

    [MaxLength(5)]
    public string? KardesIlkokul { get; set; }

    [MaxLength(5)]
    public string? KardesYuksek { get; set; }

    [MaxLength(60)]
    public string? OturdugunuzEv { get; set; }

    [MaxLength(40)]
    public string? EvKiraBedeli { get; set; }

    [MaxLength(10)]
    public string? AracVarMi { get; set; }

    [MaxLength(120)]
    public string? AracMarkaModel { get; set; }

    [MaxLength(10)]
    public string? AracYili { get; set; }

    [MaxLength(80)]
    public string? OzelDurumTipi { get; set; }

    [MaxLength(4000)]
    public string? OzelDurum { get; set; }

    [MaxLength(160)]
    public string? Universite { get; set; }

    [MaxLength(160)]
    public string? Fakulte { get; set; }

    [MaxLength(160)]
    public string? Bolum { get; set; }

    [MaxLength(10)]
    public string? KayitYili { get; set; }

    [MaxLength(20)]
    public string? Sinif { get; set; }

    [MaxLength(10)]
    public string? BitirmeYili { get; set; }

    [MaxLength(10)]
    public string? Hazirlik { get; set; }

    [MaxLength(10)]
    public string? AiledenUzakta { get; set; }

    [MaxLength(60)]
    public string? KonaklamaDurumu { get; set; }

    [MaxLength(40)]
    public string? KonaklamaUcreti { get; set; }

    [MaxLength(80)]
    public string? YksSiralamasi { get; set; }

    [MaxLength(20)]
    public string? NotOrtalamasi { get; set; }

    [MaxLength(10)]
    public string? BaskaBurs { get; set; }

    [MaxLength(40)]
    public string? BaskaBursMiktari { get; set; }

    public bool BeyanCalismiyor { get; set; }
    public bool BeyanDisiplin { get; set; }
    public bool BeyanAdliSicil { get; set; }
    public bool BeyanOrgunOgretim { get; set; }
}

public sealed class BasvuruDto
{
    public Guid Id { get; set; }
    public string? BasvuruNo { get; set; }
    public string BasvuruTipi { get; set; } = "Burs";
    public int DonemYili { get; set; }
    public string TcKimlikNoMasked { get; set; } = "";
    public string TelefonMasked { get; set; } = "";
    public string? Ad { get; set; }
    public string? Soyad { get; set; }
    public string? DogumTarihi { get; set; }
    public string? DogumYeri { get; set; }
    public string? MedeniDurum { get; set; }
    public string? Eposta { get; set; }
    public string? YakinTelefon { get; set; }
    public string? YakinKim { get; set; }
    public string? Il { get; set; }
    public string? Ilce { get; set; }
    public string? AcikAdres { get; set; }
    public string? Statu { get; set; }
    public string? Kategori { get; set; }
    public string? TalepTutari { get; set; }
    public string? TalepOzeti { get; set; }
    public string? BabaAdi { get; set; }
    public string? BabaSagMi { get; set; }
    public string? BabaMeslegi { get; set; }
    public string? BabaAylikGelir { get; set; }
    public string? AnneAdi { get; set; }
    public string? AnneSagMi { get; set; }
    public string? AnneMeslegi { get; set; }
    public string? AnneAylikGelir { get; set; }
    public string? AnneBabaBirlikte { get; set; }
    public string? BirlikteYasadigiKisiler { get; set; }
    public string? EsAylikGelir { get; set; }
    public string? HaneGeliri { get; set; }
    public string? KardesIlkokul { get; set; }
    public string? KardesYuksek { get; set; }
    public string? OturdugunuzEv { get; set; }
    public string? EvKiraBedeli { get; set; }
    public string? AracVarMi { get; set; }
    public string? AracMarkaModel { get; set; }
    public string? AracYili { get; set; }
    public string? OzelDurumTipi { get; set; }
    public string? OzelDurum { get; set; }
    public string? Universite { get; set; }
    public string? Fakulte { get; set; }
    public string? Bolum { get; set; }
    public string? KayitYili { get; set; }
    public string? Sinif { get; set; }
    public string? BitirmeYili { get; set; }
    public string? Hazirlik { get; set; }
    public string? AiledenUzakta { get; set; }
    public string? KonaklamaDurumu { get; set; }
    public string? KonaklamaUcreti { get; set; }
    public string? YksSiralamasi { get; set; }
    public string? NotOrtalamasi { get; set; }
    public string? BaskaBurs { get; set; }
    public string? BaskaBursMiktari { get; set; }
    public bool BeyanCalismiyor { get; set; }
    public bool BeyanDisiplin { get; set; }
    public bool BeyanAdliSicil { get; set; }
    public bool BeyanOrgunOgretim { get; set; }
    public string Durum { get; set; } = "";
}
