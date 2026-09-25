using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_HeroSlide")]
public sealed class AgbHeroSlide
{
    [Key]
    public Guid Id { get; set; }

    [MaxLength(300)]
    public string Baslik { get; set; } = "";

    public string? Aciklama { get; set; }

    [MaxLength(200)]
    public string? UstBaslik { get; set; }

    [MaxLength(500)]
    public string? ResimUrl { get; set; }

    [MaxLength(120)]
    public string? ButonMetin { get; set; }

    [MaxLength(500)]
    public string? ButonLink { get; set; }

    public int Sira { get; set; }

    public bool Aktif { get; set; } = true;

    public DateTime OlusturmaTarihi { get; set; }

    public DateTime GuncellemeTarihi { get; set; }
}
