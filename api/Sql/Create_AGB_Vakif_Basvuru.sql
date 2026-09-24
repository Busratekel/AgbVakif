-- Anadolu Güçbirliği Vakfı başvuru tablosu
IF OBJECT_ID(N'dbo.AGB_Vakif_Basvuru', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_Basvuru
    (
        Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AGB_Vakif_Basvuru PRIMARY KEY,
        TcKimlikNo      NVARCHAR(11)     NOT NULL,
        Telefon         NVARCHAR(20)     NOT NULL,
        Ad              NVARCHAR(80)     NULL,
        Soyad           NVARCHAR(80)     NULL,
        DogumTarihi     DATE             NULL,
        DogumYeri       NVARCHAR(80)     NULL,
        Eposta          NVARCHAR(160)    NULL,
        YakinTelefon    NVARCHAR(20)     NULL,
        Il              NVARCHAR(60)     NULL,
        Ilce            NVARCHAR(60)     NULL,
        Statu           NVARCHAR(120)    NULL,
        Kategori        NVARCHAR(120)    NULL,
        TalepTutari     NVARCHAR(60)     NULL,
        TalepOzeti      NVARCHAR(MAX)    NULL,
        BeyanCalismiyor BIT              NOT NULL CONSTRAINT DF_AGB_Beyan1 DEFAULT(0),
        BeyanAdliSicil  BIT              NOT NULL CONSTRAINT DF_AGB_Beyan2 DEFAULT(0),
        BeyanBilgiDogru BIT              NOT NULL CONSTRAINT DF_AGB_Beyan3 DEFAULT(0),
        KvkkOnay        BIT              NOT NULL CONSTRAINT DF_AGB_Kvkk DEFAULT(0),
        Durum           NVARCHAR(30)     NOT NULL CONSTRAINT DF_AGB_Durum DEFAULT(N'Taslak'),
        OlusturmaTarihi DATETIME2        NOT NULL CONSTRAINT DF_AGB_Created DEFAULT(SYSUTCDATETIME()),
        GuncellemeTarihi DATETIME2       NOT NULL CONSTRAINT DF_AGB_Updated DEFAULT(SYSUTCDATETIME()),
        SonGonderimTarihi DATETIME2      NULL
    );

    CREATE UNIQUE INDEX IX_AGB_Vakif_Basvuru_Tc ON dbo.AGB_Vakif_Basvuru(TcKimlikNo);
END
GO
