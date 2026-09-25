using Microsoft.EntityFrameworkCore;

namespace AgbVakif.Api.Data;

public sealed class BoytasWhContext(DbContextOptions<BoytasWhContext> options) : DbContext(options)
{
    public DbSet<PbConfig> PB_Config => Set<PbConfig>();
    public DbSet<AgbBasvuru> AGB_Vakif_Basvuru => Set<AgbBasvuru>();
    public DbSet<AgbVakifConfig> AGB_Vakif_Config => Set<AgbVakifConfig>();
    public DbSet<AgbPanelKullanici> AGB_Vakif_PanelKullanici => Set<AgbPanelKullanici>();
    public DbSet<AgbHeroSlide> AGB_Vakif_HeroSlide => Set<AgbHeroSlide>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PbConfig>(entity =>
        {
            entity.ToTable("PB_Config");
            entity.HasKey(x => x.ConfigKey);
            entity.Property(x => x.ConfigKey).HasColumnName("ConfigKey");
            entity.Property(x => x.ConfigValue).HasColumnName("ConfigValue");
        });

        modelBuilder.Entity<AgbVakifConfig>(entity =>
        {
            entity.ToTable("AGB_Vakif_Config");
            entity.HasKey(x => x.ConfigKey);
            entity.Property(x => x.ConfigValue).HasColumnType("nvarchar(max)");
        });

        modelBuilder.Entity<AgbBasvuru>(entity =>
        {
            entity.ToTable("AGB_Vakif_Basvuru");
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.TcKimlikNo).IsUnique();
            entity.Property(x => x.AcikAdres).HasColumnType("nvarchar(max)");
            entity.Property(x => x.OzelDurum).HasColumnType("nvarchar(max)");
        });

        modelBuilder.Entity<AgbPanelKullanici>(entity =>
        {
            entity.ToTable("AGB_Vakif_PanelKullanici");
            entity.HasKey(x => x.UserName);
        });

        modelBuilder.Entity<AgbHeroSlide>(entity =>
        {
            entity.ToTable("AGB_Vakif_HeroSlide");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Aciklama).HasColumnType("nvarchar(max)");
        });
    }
}
