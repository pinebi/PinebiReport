-- Check mehmeterdogan user and reports
-- Run this in SQL Server Management Studio

-- 1. Check mehmeterdogan user details
SELECT 
    id,
    username,
    firstName,
    lastName,
    role,
    companyId,
    isActive
FROM Users
WHERE username = 'mehmeterdogan';

-- 2. Check BELPAS company
SELECT 
    id,
    name,
    code,
    isActive
FROM Companies
WHERE name LIKE '%BELPAS%';

-- 3. Check reports for BELPAS
SELECT 
    r.id,
    r.name,
    r.isActive,
    r.showInMenu,
    r.companyId,
    c.name as companyName,
    r.categoryId
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
WHERE c.name LIKE '%BELPAS%'
ORDER BY r.name;

-- 4. Check ReportUsers assignments for mehmeterdogan
SELECT 
    ru.id,
    ru.userId,
    ru.reportId,
    u.username,
    r.name as reportName,
    r.isActive,
    r.showInMenu,
    c.name as companyName
FROM ReportUsers ru
LEFT JOIN Users u ON ru.userId = u.id
LEFT JOIN ReportConfigs r ON ru.reportId = r.id
LEFT JOIN Companies c ON r.companyId = c.id
WHERE u.username = 'mehmeterdogan'
ORDER BY r.name;

-- 5. Summary: Which reports should mehmeterdogan see?
-- (BELPAS reports + assigned reports + showInMenu=true + isActive=true)
SELECT 
    r.id,
    r.name,
    r.isActive,
    r.showInMenu,
    c.name as companyName,
    CASE 
        WHEN c.name LIKE '%BELPAS%' THEN 'YES (Company)'
        WHEN ru.userId IS NOT NULL THEN 'YES (Assigned)'
        ELSE 'NO'
    END as 'Should See?'
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
LEFT JOIN ReportUsers ru ON r.id = ru.reportId AND ru.userId = (SELECT id FROM Users WHERE username = 'mehmeterdogan')
WHERE 
    r.isActive = 1 
    AND r.showInMenu = 1
    AND (
        c.name LIKE '%BELPAS%' 
        OR ru.userId IS NOT NULL
    )
ORDER BY r.name;

