-- Fix all showInMenu values to true
-- Run this in SQL Server Management Studio or Azure Data Studio

-- Update all reports to showInMenu = 1 (true)
UPDATE ReportConfigs
SET showInMenu = 1
WHERE showInMenu = 0 OR showInMenu IS NULL;

-- Verify the update
SELECT 
    id,
    name,
    showInMenu,
    isActive,
    companyId
FROM ReportConfigs
ORDER BY name;

PRINT 'All reports updated to showInMenu = true';

