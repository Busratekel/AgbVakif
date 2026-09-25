-- AGB Vakıf ayar tablosu (dönem, ileride diğer ayarlar)
IF OBJECT_ID(N'dbo.AGB_Vakif_Config', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_Config
    (
        ConfigKey   NVARCHAR(200)  NOT NULL CONSTRAINT PK_AGB_Vakif_Config PRIMARY KEY,
        ConfigValue NVARCHAR(MAX)  NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruBaslik')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruBaslik', N'2026–2027 Lisans Başvurusu');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruBaslikNot')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruBaslikNot', N'');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruFormBaslik')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruFormBaslik', N'Lisans Burs Başvurusu Formu');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruFormBaslikNot')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruFormBaslikNot', N'Başvuru yaklaşık 10 dakika sürer. Devam etmek için aydınlatma metnini sonuna kadar okuyup onaylamanız gerekir. Kimliğiniz, cep telefonunuza gönderilecek tek kullanımlık kod ile doğrulanır.');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruBaslangic')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruBaslangic', N'2026-09-07T09:00:00');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'BasvuruBitis')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'BasvuruBitis', N'2026-09-30T17:00:00');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'PopupAktif')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'PopupAktif', N'1');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'PopupBaslik')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'PopupBaslik', N'2026–2027 Lisans Başvurusu');

IF NOT EXISTS (SELECT 1 FROM dbo.AGB_Vakif_Config WHERE ConfigKey = N'PopupMetin')
    INSERT INTO dbo.AGB_Vakif_Config (ConfigKey, ConfigValue)
    VALUES (N'PopupMetin', N'');
GO
