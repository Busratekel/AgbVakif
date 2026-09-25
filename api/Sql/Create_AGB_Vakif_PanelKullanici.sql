-- Panel erişim kullanıcıları (AD hesabı; appsettings AdminUsers dışında panelden eklenenler)
IF OBJECT_ID(N'dbo.AGB_Vakif_PanelKullanici', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AGB_Vakif_PanelKullanici
    (
        UserName         NVARCHAR(100) NOT NULL CONSTRAINT PK_AGB_Vakif_PanelKullanici PRIMARY KEY,
        Olusturan        NVARCHAR(100) NULL,
        OlusturmaTarihi  DATETIME2     NOT NULL CONSTRAINT DF_AGB_PanelKul_Olusturma DEFAULT (SYSUTCDATETIME())
    );
END
GO
