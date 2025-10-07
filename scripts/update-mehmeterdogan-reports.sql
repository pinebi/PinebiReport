-- Update mehmeterdogan report assignments
-- Run this in SQL Server Management Studio

-- First, get mehmeterdogan user ID and BELPAS company ID
DECLARE @mehmeterdoganId NVARCHAR(50);
DECLARE @belpasCompanyId NVARCHAR(50);

SELECT @mehmeterdoganId = id FROM Users WHERE username = 'mehmeterdogan';
SELECT @belpasCompanyId = id FROM Companies WHERE name LIKE '%BELPAS%';

PRINT '=== USER AND COMPANY INFO ===';
PRINT 'mehmeterdogan ID: ' + ISNULL(@mehmeterdoganId, 'NOT FOUND');
PRINT 'BELPAS Company ID: ' + ISNULL(@belpasCompanyId, 'NOT FOUND');
PRINT '';

-- Delete existing assignments for mehmeterdogan
DELETE FROM ReportUsers WHERE userId = @mehmeterdoganId;
PRINT '✅ Deleted existing ReportUsers for mehmeterdogan';

-- Assign all BELPAS reports to mehmeterdogan
INSERT INTO ReportUsers (id, userId, reportId, createdAt, updatedAt)
SELECT 
    NEWID() as id,
    @mehmeterdoganId as userId,
    r.id as reportId,
    GETDATE() as createdAt,
    GETDATE() as updatedAt
FROM ReportConfigs r
LEFT JOIN Companies c ON r.companyId = c.id
WHERE 
    c.name LIKE '%BELPAS%'
    AND r.isActive = 1
    AND r.showInMenu = 1
    AND r.id NOT IN (SELECT reportId FROM ReportUsers WHERE userId = @mehmeterdoganId);

PRINT '✅ Assigned BELPAS reports to mehmeterdogan';
PRINT '';

-- Show results
PRINT '=== REPORTS ASSIGNED TO MEHMETERDOGAN ===';
SELECT 
    ru.id,
    r.name as reportName,
    r.isActive,
    r.showInMenu,
    c.name as companyName
FROM ReportUsers ru
LEFT JOIN ReportConfigs r ON ru.reportId = r.id
LEFT JOIN Companies c ON r.companyId = c.id
WHERE ru.userId = @mehmeterdoganId
ORDER BY r.name;

