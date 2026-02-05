-- Check table names case sensitivity issue
-- Run this on your production database

-- Show all tables (this will show the actual case used)
SHOW TABLES;

-- Check if 'users' (lowercase) exists
SHOW TABLES LIKE 'users';

-- Check if 'User' (capital U) exists  
SHOW TABLES LIKE 'User';

-- Check if 'tax' (lowercase) exists
SHOW TABLES LIKE 'tax';

-- Check if 'Tax' (capital T) exists
SHOW TABLES LIKE 'Tax';

-- Show all tables with their exact names
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Check the case sensitivity setting
SHOW VARIABLES LIKE 'lower_case_table_names';
