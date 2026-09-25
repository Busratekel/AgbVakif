using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_PanelKullanici")]
public sealed class AgbPanelKullanici
{
    [Key]
    [MaxLength(100)]
    public string UserName { get; set; } = "";

    [MaxLength(100)]
    public string? Olusturan { get; set; }

    public DateTime OlusturmaTarihi { get; set; }
}
