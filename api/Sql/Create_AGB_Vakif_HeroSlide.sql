-- Hero / duyuru slider
IF OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_HeroSlide
    (
        Id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AGB_Vakif_HeroSlide PRIMARY KEY,
        Baslik           NVARCHAR(200)    NOT NULL,
        Aciklama         NVARCHAR(MAX)    NULL,
        UstBaslik        NVARCHAR(80)     NULL,
        ResimUrl         NVARCHAR(500)    NULL,
        ButonMetin       NVARCHAR(80)     NULL,
        ButonLink        NVARCHAR(300)    NULL,
        Sira             INT              NOT NULL CONSTRAINT DF_AGB_Hero_Sira DEFAULT(0),
        Aktif            BIT              NOT NULL CONSTRAINT DF_AGB_Hero_Aktif DEFAULT(1),
        OlusturmaTarihi  DATETIME2        NOT NULL CONSTRAINT DF_AGB_Hero_Olusturma DEFAULT (SYSUTCDATETIME()),
        GuncellemeTarihi DATETIME2        NOT NULL CONSTRAINT DF_AGB_Hero_Guncelleme DEFAULT (SYSUTCDATETIME())
    );

    CREATE INDEX IX_AGB_Vakif_HeroSlide_Sira ON dbo.AGB_Vakif_HeroSlide(Aktif, Sira);
END
GO
