-- ReportUsers ilişkilerini ekle
-- Kullanıcı ve Rapor ID'lerini önce bulup ekleyelim

-- 1. Mehmeterdogan kullanıcısının ID'sini al
DECLARE @mehmeterdoganUserId NVARCHAR(50);
SELECT @mehmeterdoganUserId = id FROM Users WHERE username = 'mehmeterdogan';

-- 2. BELPAS şirketinin raporlarını al
DECLARE @belpasCompanyId NVARCHAR(50);
SELECT @belpasCompanyId = id FROM Companies WHERE name LIKE '%BELPAS%' OR name LIKE '%Belpas%';

-- 3. BELPAS raporlarını bul ve mehmeterdogan için ReportUsers ekle
INSERT INTO ReportUsers (id, reportId, userId, createdAt, updatedAt)
SELECT 
    LOWER(NEWID()) as id,
    r.id as reportId,
    @mehmeterdoganUserId as userId,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM ReportConfigs r
WHERE r.companyId = @belpasCompanyId
  AND r.isActive = 1
  AND NOT EXISTS (
    SELECT 1 FROM ReportUsers ru 
    WHERE ru.reportId = r.id AND ru.userId = @mehmeterdoganUserId
  );

-- 4. Kontrol et - mehmeterdogan'ın kaç raporu var?
SELECT 
    u.username,
    COUNT(ru.id) as report_count,
    STRING_AGG(r.name, ', ') as report_names
FROM Users u
LEFT JOIN ReportUsers ru ON u.id = ru.userId
LEFT JOIN ReportConfigs r ON ru.reportId = r.id
WHERE u.username = 'mehmeterdogan'
GROUP BY u.username;

-- 5. BELPAS raporlarını kontrol et
SELECT 
    r.name,
    r.isActive,
    r.showInMenu,
    c.name as company_name,
    COUNT(ru.userId) as user_count
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId
WHERE c.name LIKE '%BELPAS%' OR c.name LIKE '%Belpas%'
GROUP BY r.id, r.name, r.isActive, r.showInMenu, c.name;

