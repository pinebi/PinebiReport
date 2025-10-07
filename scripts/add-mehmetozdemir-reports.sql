-- Mehmetozdemir kullanıcısı için rapor atamaları
-- Önce kullanıcı ve şirket bilgilerini kontrol edelim

-- 1. Mehmetozdemir kullanıcısının bilgilerini göster
SELECT 
    u.id as userId,
    u.username,
    u.email,
    u.companyId,
    c.name as companyName
FROM Users u
LEFT JOIN Companies c ON u.companyId = c.id
WHERE u.username = 'mehmetozdemir';

-- 2. Mehmetozdemir'in şirketine ait raporları göster
DECLARE @mehmetozdemirUserId NVARCHAR(50);
DECLARE @mehmetozdemirCompanyId NVARCHAR(50);

SELECT 
    @mehmetozdemirUserId = u.id,
    @mehmetozdemirCompanyId = u.companyId
FROM Users u
WHERE u.username = 'mehmetozdemir';

-- Kullanıcının şirketine ait raporları listele
SELECT 
    r.id,
    r.name,
    r.description,
    c.name as company,
    r.isActive,
    r.showInMenu,
    CASE 
        WHEN ru.id IS NOT NULL THEN 'ATANMIŞ'
        ELSE 'ATANMAMIŞ'
    END as atamaDurumu
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId AND ru.userId = @mehmetozdemirUserId
WHERE r.companyId = @mehmetozdemirCompanyId
  AND r.isActive = 1
ORDER BY r.name;

-- 3. Mehmetozdemir için tüm raporları ata (eğer şirketi eşleşiyorsa)
INSERT INTO ReportUsers (id, reportId, userId, createdAt, updatedAt)
SELECT 
    LOWER(NEWID()) as id,
    r.id as reportId,
    @mehmetozdemirUserId as userId,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM ReportConfigs r
WHERE r.companyId = @mehmetozdemirCompanyId
  AND r.isActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM ReportUsers ru 
    WHERE ru.reportId = r.id AND ru.userId = @mehmetozdemirUserId
  );

-- 4. Atama sonrası kontrol
SELECT 
    u.username,
    COUNT(ru.id) as atananRaporSayisi,
    STRING_AGG(r.name, ', ') as raporlar
FROM Users u
LEFT JOIN ReportUsers ru ON u.id = ru.userId
LEFT JOIN ReportConfigs r ON ru.reportId = r.id
WHERE u.username = 'mehmetozdemir'
GROUP BY u.username;

-- 5. Detaylı rapor listesi
SELECT 
    r.name as RaporAdi,
    c.name as Sirket,
    r.showInMenu as MenudeGoster,
    r.isActive as Aktif,
    u.username as AtananKullanici,
    ru.createdAt as AtanmaTarihi
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId AND ru.userId = @mehmetozdemirUserId
LEFT JOIN Users u ON ru.userId = u.id
WHERE r.companyId = @mehmetozdemirCompanyId
  AND r.isActive = 1
ORDER BY r.name;

