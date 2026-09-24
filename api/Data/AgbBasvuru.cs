using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_Basvuru")]
public sealed class AgbBasvuru
{
    [Key]
    public Guid Id { get; set; }

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

    [MaxLength(60)]
    public string? Il { get; set; }

    [MaxLength(60)]
    public string? Ilce { get; set; }

    [MaxLength(120)]
    public string? Statu { get; set; }

    [MaxLength(120)]
    public string? Kategori { get; set; }

    [MaxLength(60)]
    public string? TalepTutari { get; set; }

    public string? TalepOzeti { get; set; }

    public bool BeyanCalismiyor { get; set; }
    public bool BeyanAdliSicil { get; set; }
    public bool BeyanBilgiDogru { get; set; }
    public bool KvkkOnay { get; set; }

    /// <summary>Taslak | Gonderildi | GeriCekildi</summary>
    [MaxLength(30)]
    public string Durum { get; set; } = "Taslak";

    public DateTime OlusturmaTarihi { get; set; }
    public DateTime GuncellemeTarihi { get; set; }
    public DateTime? SonGonderimTarihi { get; set; }
}
