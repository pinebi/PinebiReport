-- ReportConfigs tablosuna showInMenu kolonu ekle

-- 1. Kolon var mı kontrol et
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'ReportConfigs' 
    AND COLUMN_NAME = 'showInMenu'
)
BEGIN
    -- 2. showInMenu kolonunu ekle (default true)
    ALTER TABLE ReportConfigs
    ADD showInMenu BIT NOT NULL DEFAULT 1;
    
    PRINT 'showInMenu kolonu eklendi - default: true (1)';
END
ELSE
BEGIN
    PRINT 'showInMenu kolonu zaten mevcut';
END

-- 3. Mevcut tüm raporları showInMenu = true yap
UPDATE ReportConfigs
SET showInMenu = 1
WHERE showInMenu IS NULL OR showInMenu = 0;

PRINT 'Tüm raporlar showInMenu = true olarak güncellendi';

-- 4. Kontrol et
SELECT 
    COUNT(*) as ToplamRapor,
    SUM(CASE WHEN showInMenu = 1 THEN 1 ELSE 0 END) as MenudeGosterilen,
    SUM(CASE WHEN showInMenu = 0 THEN 1 ELSE 0 END) as MenudeGosterilmeyen
FROM ReportConfigs;

-- 5. Örnek raporları göster
SELECT TOP 10
    name as RaporAdi,
    isActive as Aktif,
    showInMenu as MenudeGoster,
    c.name as Sirket
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
ORDER BY r.name;
