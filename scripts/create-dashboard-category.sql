-- Dashboard Raporları kategorisini oluştur
INSERT INTO ReportCategories (id, name, description, icon, color, sortOrder, isActive, parentId, createdAt, updatedAt)
VALUES (
  'dashboard-reports',
  'Dashboard Raporları',
  'Ana dashboard için kullanılan raporlar',
  '📊',
  '#F59E0B',
  0,
  1,
  NULL,
  GETDATE(),
  GETDATE()
);

-- RMK CIRO DASHBOARD raporunu güncelle
UPDATE ReportConfigs
SET 
  categoryId = 'dashboard-reports',
  showInMenu = 1,
  updatedAt = GETDATE()
WHERE name = 'RMK CIRO DASHBOARD';

-- BELPAS CIRO DASHBOARD raporunu güncelle  
UPDATE ReportConfigs
SET 
  categoryId = 'dashboard-reports',
  showInMenu = 1,
  updatedAt = GETDATE()
WHERE name = 'BELPAS CIRO DASHBOARD';

-- Satış Analiz Raporu'nu dashboard kategorisine taşı
UPDATE ReportConfigs
SET 
  categoryId = 'dashboard-reports',
  showInMenu = 1,
  updatedAt = GETDATE()
WHERE name = 'Satış Analiz Raporu';

-- Kontrol
SELECT 
  rc.name,
  rc.categoryId,
  rc.showInMenu,
  cat.name as CategoryName
FROM ReportConfigs rc
LEFT JOIN ReportCategories cat ON rc.categoryId = cat.id
WHERE rc.categoryId = 'dashboard-reports';

