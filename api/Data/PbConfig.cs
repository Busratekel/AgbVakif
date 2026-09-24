using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgbVakif.Api.Data;

[Table("PB_Config")]
public sealed class PbConfig
{
    [Key]
    [MaxLength(200)]
    public string ConfigKey { get; set; } = "";

    public string? ConfigValue { get; set; }
}
