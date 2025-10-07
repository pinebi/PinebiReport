-- TÜM KULLANICILAR İÇİN RAPOR ATAMA
-- Kural: Kullanıcının şirketi = Rapor şirketi ise, otomatik ata

-- 1. Mevcut durumu göster
SELECT 
    u.username as Kullanici,
    c.name as KullaniciSirketi,
    COUNT(ru.id) as AtananRaporSayisi
FROM Users u
LEFT JOIN Companies c ON u.companyId = c.id
LEFT JOIN ReportUsers ru ON u.id = ru.userId
GROUP BY u.username, c.name
ORDER BY u.username;

-- 2. Her kullanıcı için, kendi şirketinin raporlarını ata
INSERT INTO ReportUsers (id, reportId, userId, createdAt, updatedAt)
SELECT 
    LOWER(NEWID()) as id,
    r.id as reportId,
    u.id as userId,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM Users u
CROSS JOIN ReportConfigs r
WHERE u.companyId = r.companyId  -- Şirket eşleşmesi
  AND r.isActive = 1              -- Aktif raporlar
  AND u.isActive = 1              -- Aktif kullanıcılar
  AND NOT EXISTS (
    SELECT 1 FROM ReportUsers ru 
    WHERE ru.reportId = r.id AND ru.userId = u.id
  );

-- 3. Mehmeterdogan özel kontrol
SELECT 
    u.username as Kullanici,
    c.name as Sirket,
    r.name as RaporAdi,
    r.showInMenu as MenudeGoster,
    CASE 
        WHEN ru.id IS NOT NULL THEN 'ATANMIŞ ✓'
        ELSE 'ATANMAMIŞ ✗'
    END as Durum
FROM Users u
LEFT JOIN Companies c ON u.companyId = c.id
CROSS JOIN ReportConfigs r
LEFT JOIN ReportUsers ru ON r.id = ru.reportId AND ru.userId = u.id
WHERE u.username = 'mehmeterdogan'
  AND r.companyId = u.companyId
  AND r.isActive = 1
ORDER BY r.name;

-- 4. Tüm kullanıcıların rapor sayıları
SELECT 
    u.username as Kullanici,
    c.name as Sirket,
    COUNT(DISTINCT r.id) as ToplamRapor,
    COUNT(DISTINCT ru.id) as AtananRapor,
    COUNT(DISTINCT CASE WHEN r.showInMenu = 1 THEN r.id END) as MenudekiRapor
FROM Users u
LEFT JOIN Companies c ON u.companyId = c.id
LEFT JOIN ReportConfigs r ON r.companyId = u.companyId AND r.isActive = 1
LEFT JOIN ReportUsers ru ON ru.reportId = r.id AND ru.userId = u.id
WHERE u.isActive = 1
GROUP BY u.username, c.name
ORDER BY u.username;

-- 5. BELPAS raporlarını ve mehmeterdogan atamasını göster
SELECT 
    r.name as RaporAdi,
    c.name as RaporSirketi,
    r.showInMenu as MenudeGoster,
    r.isActive as Aktif,
    STRING_AGG(u.username, ', ') as AtananKullanicilar
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId
LEFT JOIN Users u ON ru.userId = u.id
WHERE c.name LIKE '%BELPAS%' OR c.name LIKE '%Belpas%'
GROUP BY r.id, r.name, c.name, r.showInMenu, r.isActive
ORDER BY r.name;

