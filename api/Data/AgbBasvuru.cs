using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_Basvuru")]
public sealed class AgbBasvuru
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>İnsan okunur başvuru no (ör. AGB-2026-000042).</summary>
    [MaxLength(30)]
    public string? BasvuruNo { get; set; }

    /// <summary>Burs veya Destek (yardım).</summary>
    [MaxLength(10)]
    public string BasvuruTipi { get; set; } = "Burs";

    [MaxLength(11)]
    public string TcKimlikNo { get; set; } = "";

    [MaxLength(20)]
    public string Telefon { get; set; } = "";

    [MaxLength(80)]
    public string? Ad { get; set; }

    [MaxLength(80)]
    public string? Soyad { get; set; }

    public DateOnly? DogumTarihi { get; set; }

    [MaxLength(80)]
    public string? DogumYeri { get; set; }

    [MaxLength(160)]
    public string? Eposta { get; set; }

    [MaxLength(20)]
    public string? YakinTelefon { get; set; }

    [MaxLength(80)]
    public string? YakinKim { get; set; }

    [MaxLength(20)]
    public string? MedeniDurum { get; set; }

    [MaxLength(60)]
    public string? Il { get; set; }

    [MaxLength(60)]
    public string? Ilce { get; set; }

    public string? AcikAdres { get; set; }

    [MaxLength(120)]
    public string? Statu { get; set; }

    [MaxLength(80)]
    public string? Kategori { get; set; }

    [MaxLength(40)]
    public string? TalepTutari { get; set; }

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
    public bool KvkkOnay { get; set; }

    [MaxLength(30)]
    public string Durum { get; set; } = "Taslak";

    public DateTime OlusturmaTarihi { get; set; }
    public DateTime GuncellemeTarihi { get; set; }
    public DateTime? SonGonderimTarihi { get; set; }
}
