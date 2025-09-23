-- SQL Server için showInMenu alanını ekleme scripti
-- Bu scripti SQL Server Management Studio'da çalıştırın

USE PinebiReport;
GO

-- ReportConfigs tablosuna showInMenu alanını ekle
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ReportConfigs') AND name = 'showInMenu')
BEGIN
    ALTER TABLE ReportConfigs 
    ADD showInMenu BIT NOT NULL DEFAULT 1;
    
    PRINT 'showInMenu alanı başarıyla eklendi.';
END
ELSE
BEGIN
    PRINT 'showInMenu alanı zaten mevcut.';
END
GO

-- Mevcut kayıtları kontrol et
SELECT 
    id,
    name,
    showInMenu,
    isActive
FROM ReportConfigs
ORDER BY name;
GO

PRINT 'Database güncelleme tamamlandı.';
