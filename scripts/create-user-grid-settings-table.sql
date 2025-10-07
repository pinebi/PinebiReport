-- UserGridSettings tablosunu manuel oluşturma SQL'i
-- SQL Server Management Studio'da çalıştırın

USE PinebiWebReport;
GO

-- Eğer tablo varsa sil
IF OBJECT_ID('dbo.UserGridSettings', 'U') IS NOT NULL
    DROP TABLE dbo.UserGridSettings;
GO

-- UserGridSettings tablosunu oluştur
CREATE TABLE dbo.UserGridSettings (
    id NVARCHAR(255) NOT NULL PRIMARY KEY,
    userId NVARCHAR(255) NOT NULL,
    gridType NVARCHAR(255) NOT NULL,
    columnSettings NTEXT NULL,              -- JSON: Sütun ayarları
    filterSettings NTEXT NULL,              -- JSON: Filtre ayarları
    sortSettings NTEXT NULL,                -- JSON: Sıralama ayarları
    groupSettings NTEXT NULL,               -- JSON: Gruplama ayarları
    pivotSettings NTEXT NULL,               -- JSON: Pivot ayarları
    sidebarSettings NTEXT NULL,             -- JSON: Sidebar ayarları
    viewPreferences NTEXT NULL,             -- JSON: Görünüm tercihleri
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign key constraint
    CONSTRAINT FK_UserGridSettings_Users 
        FOREIGN KEY (userId) REFERENCES dbo.Users(id),
    
    -- Unique constraint
    CONSTRAINT UQ_UserGridSettings_UserGrid 
        UNIQUE (userId, gridType)
);
GO

-- Index'ler ekle (performans için)
CREATE INDEX IX_UserGridSettings_UserId ON dbo.UserGridSettings(userId);
CREATE INDEX IX_UserGridSettings_GridType ON dbo.UserGridSettings(gridType);
CREATE INDEX IX_UserGridSettings_CreatedAt ON dbo.UserGridSettings(createdAt);
GO

-- Test verisi ekle (opsiyonel)
-- INSERT INTO dbo.UserGridSettings (id, userId, gridType, columnSettings, isActive)
-- VALUES (NEWID(), 'your-user-id', 'reports-management', '[]', 1);

PRINT 'UserGridSettings tablosu başarıyla oluşturuldu!';
GO

























