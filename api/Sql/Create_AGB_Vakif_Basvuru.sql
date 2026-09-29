-- Anadolu Güçbirliği Vakfı başvuru tablosu
IF OBJECT_ID(N'dbo.AGB_Vakif_Basvuru', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_Basvuru
    (
        Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AGB_Vakif_Basvuru PRIMARY KEY,
        BasvuruNo       NVARCHAR(30)     NULL,
        TcKimlikNo      NVARCHAR(11)     NOT NULL,
        Telefon         NVARCHAR(20)     NOT NULL,
        Ad              NVARCHAR(80)     NULL,
        Soyad           NVARCHAR(80)     NULL,
        DogumTarihi     DATE             NULL,
        DogumYeri       NVARCHAR(80)     NULL,
        MedeniDurum     NVARCHAR(20)     NULL,
        Eposta          NVARCHAR(160)    NULL,
        YakinTelefon    NVARCHAR(20)     NULL,
        YakinKim        NVARCHAR(80)     NULL,
        Il              NVARCHAR(60)     NULL,
        Ilce            NVARCHAR(60)     NULL,
        AcikAdres       NVARCHAR(MAX)    NULL,
        Statu           NVARCHAR(120)    NULL,
        BabaAdi         NVARCHAR(80)     NULL,
        BabaSagMi       NVARCHAR(10)     NULL,
        BabaMeslegi     NVARCHAR(80)     NULL,
        BabaAylikGelir  NVARCHAR(40)     NULL,
        AnneAdi         NVARCHAR(80)     NULL,
        AnneSagMi       NVARCHAR(10)     NULL,
        AnneMeslegi     NVARCHAR(80)     NULL,
        AnneAylikGelir  NVARCHAR(40)     NULL,
        AnneBabaBirlikte NVARCHAR(10)    NULL,
        BirlikteYasadigiKisiler NVARCHAR(80) NULL,
        EsAylikGelir     NVARCHAR(40)     NULL,
        HaneGeliri       NVARCHAR(40)     NULL,
        KardesIlkokul   NVARCHAR(5)      NULL,
        KardesYuksek    NVARCHAR(5)      NULL,
        OturdugunuzEv   NVARCHAR(60)     NULL,
        EvKiraBedeli    NVARCHAR(40)     NULL,
        AracVarMi       NVARCHAR(10)     NULL,
        AracMarkaModel  NVARCHAR(120)    NULL,
        AracYili        NVARCHAR(10)     NULL,
        OzelDurumTipi   NVARCHAR(80)     NULL,
        OzelDurum       NVARCHAR(MAX)    NULL,
        Universite      NVARCHAR(160)    NULL,
        Fakulte         NVARCHAR(160)    NULL,
        Bolum           NVARCHAR(160)    NULL,
        KayitYili       NVARCHAR(10)     NULL,
        Sinif           NVARCHAR(20)     NULL,
        BitirmeYili     NVARCHAR(10)     NULL,
        Hazirlik        NVARCHAR(10)     NULL,
        AiledenUzakta   NVARCHAR(10)     NULL,
        KonaklamaDurumu NVARCHAR(60)     NULL,
        KonaklamaUcreti NVARCHAR(40)     NULL,
        YksSiralamasi   NVARCHAR(80)     NULL,
        NotOrtalamasi   NVARCHAR(20)     NULL,
        BaskaBurs       NVARCHAR(10)     NULL,
        BaskaBursMiktari NVARCHAR(40)    NULL,
        BeyanCalismiyor BIT              NOT NULL CONSTRAINT DF_AGB_Beyan1 DEFAULT(0),
        BeyanDisiplin   BIT              NOT NULL CONSTRAINT DF_AGB_BeyanDi DEFAULT(0),
        BeyanAdliSicil  BIT              NOT NULL CONSTRAINT DF_AGB_Beyan2 DEFAULT(0),
        BeyanOrgunOgretim BIT            NOT NULL CONSTRAINT DF_AGB_BeyanOr DEFAULT(0),
        KvkkOnay        BIT              NOT NULL CONSTRAINT DF_AGB_Kvkk DEFAULT(0),
        Durum           NVARCHAR(30)     NOT NULL CONSTRAINT DF_AGB_Durum DEFAULT(N'Taslak'),
        OlusturmaTarihi DATETIME2        NOT NULL CONSTRAINT DF_AGB_Created DEFAULT(SYSUTCDATETIME()),
        GuncellemeTarihi DATETIME2       NOT NULL CONSTRAINT DF_AGB_Updated DEFAULT(SYSUTCDATETIME()),
        SonGonderimTarihi DATETIME2      NULL
    );

    CREATE UNIQUE INDEX IX_AGB_Vakif_Basvuru_Tc ON dbo.AGB_Vakif_Basvuru(TcKimlikNo);
END
GO

-- Mevcut tabloya yeni kolonlar (yoksa ekle)
IF OBJECT_ID(N'dbo.AGB_Vakif_Basvuru', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AcikAdres') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AcikAdres NVARCHAR(MAX) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BasvuruNo') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BasvuruNo NVARCHAR(30) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BabaAdi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BabaAdi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BabaSagMi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BabaSagMi NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BabaMeslegi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BabaMeslegi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BabaAylikGelir') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BabaAylikGelir NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AnneAdi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AnneAdi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AnneSagMi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AnneSagMi NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AnneMeslegi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AnneMeslegi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AnneAylikGelir') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AnneAylikGelir NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AnneBabaBirlikte') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AnneBabaBirlikte NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BirlikteYasadigiKisiler') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BirlikteYasadigiKisiler NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'HaneGeliri') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD HaneGeliri NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'KardesIlkokul') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD KardesIlkokul NVARCHAR(5) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'KardesYuksek') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD KardesYuksek NVARCHAR(5) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'OturdugunuzEv') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD OturdugunuzEv NVARCHAR(60) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AracVarMi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AracVarMi NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AracMarkaModel') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AracMarkaModel NVARCHAR(120) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'OzelDurumTipi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD OzelDurumTipi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'OzelDurum') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD OzelDurum NVARCHAR(MAX) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Universite') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD Universite NVARCHAR(160) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Fakulte') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD Fakulte NVARCHAR(160) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Bolum') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD Bolum NVARCHAR(160) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'KayitYili') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD KayitYili NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Sinif') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD Sinif NVARCHAR(20) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BitirmeYili') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BitirmeYili NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Hazirlik') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD Hazirlik NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AiledenUzakta') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AiledenUzakta NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'KonaklamaDurumu') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD KonaklamaDurumu NVARCHAR(60) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'KonaklamaUcreti') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD KonaklamaUcreti NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'YksSiralamasi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD YksSiralamasi NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'NotOrtalamasi') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD NotOrtalamasi NVARCHAR(20) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BaskaBurs') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BaskaBurs NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BeyanDisiplin') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BeyanDisiplin BIT NOT NULL CONSTRAINT DF_AGB_BeyanDi2 DEFAULT(0);
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BeyanOrgunOgretim') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BeyanOrgunOgretim BIT NOT NULL CONSTRAINT DF_AGB_BeyanOr2 DEFAULT(0);

    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'MedeniDurum') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD MedeniDurum NVARCHAR(20) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'YakinKim') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD YakinKim NVARCHAR(80) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'EsAylikGelir') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD EsAylikGelir NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'EvKiraBedeli') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD EvKiraBedeli NVARCHAR(40) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'AracYili') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD AracYili NVARCHAR(10) NULL;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BaskaBursMiktari') IS NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru ADD BaskaBursMiktari NVARCHAR(40) NULL;
END
GO

IF OBJECT_ID(N'dbo.AGB_Vakif_Basvuru', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BasvuruNo') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1 FROM sys.indexes
        WHERE name = N'IX_AGB_Vakif_Basvuru_No' AND object_id = OBJECT_ID(N'dbo.AGB_Vakif_Basvuru')
   )
BEGIN
    CREATE UNIQUE INDEX IX_AGB_Vakif_Basvuru_No ON dbo.AGB_Vakif_Basvuru(BasvuruNo) WHERE BasvuruNo IS NOT NULL;
END
GO

IF OBJECT_ID(N'dbo.AGB_Vakif_BasvuruBelge', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_BasvuruBelge
    (
        Id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AGB_Vakif_BasvuruBelge PRIMARY KEY,
        BasvuruId     UNIQUEIDENTIFIER NOT NULL,
        BelgeKod      NVARCHAR(400)    NOT NULL,
        DosyaAdi      NVARCHAR(260)    NOT NULL,
        SaklananAd    NVARCHAR(1000)   NOT NULL,
        YuklemeTarihi DATETIME2        NOT NULL CONSTRAINT DF_AGB_BelgeCreated DEFAULT(SYSUTCDATETIME())
    );
    CREATE INDEX IX_AGB_Vakif_BasvuruBelge_Basvuru ON dbo.AGB_Vakif_BasvuruBelge(BasvuruId);
END
GO

IF OBJECT_ID(N'dbo.AGB_Vakif_BasvuruBelge', N'U') IS NOT NULL
   AND COL_LENGTH('dbo.AGB_Vakif_BasvuruBelge', 'SaklananAd') IS NOT NULL
BEGIN
    ALTER TABLE dbo.AGB_Vakif_BasvuruBelge ALTER COLUMN SaklananAd NVARCHAR(1000) NOT NULL;
END
GO

-- Kullanılmayan eski kolonları kaldır
IF OBJECT_ID(N'dbo.AGB_Vakif_Basvuru', N'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'Kategori') IS NOT NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru DROP COLUMN Kategori;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'TalepTutari') IS NOT NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru DROP COLUMN TalepTutari;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'TalepOzeti') IS NOT NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru DROP COLUMN TalepOzeti;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'BabaGelirBelgeAdi') IS NOT NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru DROP COLUMN BabaGelirBelgeAdi;
    IF COL_LENGTH('dbo.AGB_Vakif_Basvuru', 'DigerAileBilgi') IS NOT NULL
        ALTER TABLE dbo.AGB_Vakif_Basvuru DROP COLUMN DigerAileBilgi;
END
GO
