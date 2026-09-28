using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_BasvuruBelge")]
public sealed class AgbBasvuruBelge
{
    [Key]
    public Guid Id { get; set; }

    public Guid BasvuruId { get; set; }

    [MaxLength(400)]
    public string BelgeKod { get; set; } = "";

    [MaxLength(260)]
    public string DosyaAdi { get; set; } = "";

    [MaxLength(80)]
    public string SaklananAd { get; set; } = "";

    public DateTime YuklemeTarihi { get; set; }
}
