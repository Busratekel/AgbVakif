-- Hero / duyuru slider
IF OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_HeroSlide
    (
        Id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AGB_Vakif_HeroSlide PRIMARY KEY,
        Baslik           NVARCHAR(300)    NOT NULL,
        Aciklama         NVARCHAR(MAX)    NULL,
        UstBaslik        NVARCHAR(200)    NULL,
        ResimUrl         NVARCHAR(500)    NULL,
        ButonMetin       NVARCHAR(120)    NULL,
        ButonLink        NVARCHAR(500)    NULL,
        Sira             INT              NOT NULL CONSTRAINT DF_AGB_Hero_Sira DEFAULT(0),
        Aktif            BIT              NOT NULL CONSTRAINT DF_AGB_Hero_Aktif DEFAULT(1),
        OlusturmaTarihi  DATETIME2        NOT NULL CONSTRAINT DF_AGB_Hero_Olusturma DEFAULT (SYSUTCDATETIME()),
        GuncellemeTarihi DATETIME2        NOT NULL CONSTRAINT DF_AGB_Hero_Guncelleme DEFAULT (SYSUTCDATETIME())
    );

    CREATE INDEX IX_AGB_Vakif_HeroSlide_Sira ON dbo.AGB_Vakif_HeroSlide(Aktif, Sira);
END
GO

-- Mevcut tabloda kısa kolonları genişlet
IF OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide', N'U') IS NOT NULL
BEGIN
    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide')
          AND name = N'UstBaslik' AND max_length < 400
    )
        ALTER TABLE dbo.AGB_Vakif_HeroSlide ALTER COLUMN UstBaslik NVARCHAR(200) NULL;

    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide')
          AND name = N'Baslik' AND max_length < 600
    )
        ALTER TABLE dbo.AGB_Vakif_HeroSlide ALTER COLUMN Baslik NVARCHAR(300) NOT NULL;

    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide')
          AND name = N'ButonMetin' AND max_length < 240
    )
        ALTER TABLE dbo.AGB_Vakif_HeroSlide ALTER COLUMN ButonMetin NVARCHAR(120) NULL;

    IF EXISTS (
        SELECT 1 FROM sys.columns
        WHERE object_id = OBJECT_ID(N'dbo.AGB_Vakif_HeroSlide')
          AND name = N'ButonLink' AND max_length < 1000
    )
        ALTER TABLE dbo.AGB_Vakif_HeroSlide ALTER COLUMN ButonLink NVARCHAR(500) NULL;
END
GO
