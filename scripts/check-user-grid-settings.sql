-- UserGridSettings tablosunu kontrol etme SQL'leri
-- SQL Server Management Studio'da çalıştırın

USE PinebiWebReport;
GO

-- 1. Tablo var mı kontrol et
SELECT 
    TABLE_NAME,
    TABLE_SCHEMA,
    TABLE_TYPE
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'UserGridSettings';
GO

-- 2. Tablo yapısını kontrol et
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'UserGridSettings'
ORDER BY ORDINAL_POSITION;
GO

-- 3. Mevcut kayıtları listele
SELECT 
    id,
    userId,
    gridType,
    CASE 
        WHEN columnSettings IS NOT NULL THEN 'Var'
        ELSE 'Yok'
    END AS columnSettings_Status,
    CASE 
        WHEN filterSettings IS NOT NULL THEN 'Var'
        ELSE 'Yok'
    END AS filterSettings_Status,
    isActive,
    createdAt,
    updatedAt
FROM dbo.UserGridSettings
ORDER BY createdAt DESC;
GO

-- 4. Kullanıcı bazlı grid ayarlarını göster
SELECT 
    u.username,
    u.firstName + ' ' + u.lastName AS fullName,
    ugs.gridType,
    ugs.createdAt,
    ugs.updatedAt,
    CASE 
        WHEN ugs.columnSettings IS NOT NULL THEN LEN(ugs.columnSettings)
        ELSE 0
    END AS columnSettings_Length
FROM dbo.UserGridSettings ugs
INNER JOIN dbo.Users u ON ugs.userId = u.id
WHERE ugs.isActive = 1
ORDER BY u.username, ugs.gridType;
GO

-- 5. Belirli bir kullanıcının ayarlarını detaylı göster
-- (userId'yi kendi kullanıcı ID'nizle değiştirin)
/*
DECLARE @UserId NVARCHAR(255) = 'your-user-id-here'

SELECT 
    gridType,
    columnSettings,
    filterSettings,
    sortSettings,
    sidebarSettings,
    createdAt,
    updatedAt
FROM dbo.UserGridSettings
WHERE userId = @UserId
ORDER BY gridType;
*/
GO

PRINT 'UserGridSettings tablo kontrolü tamamlandı!';
GO

























