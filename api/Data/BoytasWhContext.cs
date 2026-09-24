using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api.Data;

public sealed class BoytasWhContext(DbContextOptions<BoytasWhContext> options) : DbContext(options)
{
    public DbSet<PbConfig> PB_Config => Set<PbConfig>();
    public DbSet<AgbBasvuru> AGB_Vakif_Basvuru => Set<AgbBasvuru>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PbConfig>(entity =>
        {
            entity.ToTable("PB_Config");
            entity.HasKey(x => x.ConfigKey);
            entity.Property(x => x.ConfigKey).HasColumnName("ConfigKey");
            entity.Property(x => x.ConfigValue).HasColumnName("ConfigValue");
        });

        modelBuilder.Entity<AgbBasvuru>(entity =>
        {
            entity.ToTable("AGB_Vakif_Basvuru");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.TcKimlikNo).IsUnique();
            entity.Property(x => x.TalepOzeti).HasColumnType("nvarchar(max)");
        });
    }
}
