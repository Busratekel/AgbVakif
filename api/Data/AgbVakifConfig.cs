using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("AGB_Vakif_Config")]
public sealed class AgbVakifConfig
{
    [Key]
    [MaxLength(200)]
    public string ConfigKey { get; set; } = "";

    public string? ConfigValue { get; set; }
}
