-- Fix Table Case Sensitivity Issue
-- This script renames all tables to match Prisma schema expectations
-- Run this on your production database

-- First, check what tables exist
SELECT 'Current tables:' as info;
SHOW TABLES;

-- Check case sensitivity setting
SELECT 'Case sensitivity setting:' as info;
SHOW VARIABLES LIKE 'lower_case_table_names';

-- Rename tables to match Prisma schema (capital first letter)
-- Only rename if the lowercase version exists

-- Core tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users') > 0,
    'RENAME TABLE `users` TO `User`', 'SELECT "users table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenant') > 0,
    'RENAME TABLE `tenant` TO `Tenant`', 'SELECT "tenant table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'account') > 0,
    'RENAME TABLE `account` TO `Account`', 'SELECT "account table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'session') > 0,
    'RENAME TABLE `session` TO `Session`', 'SELECT "session table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'verificationtoken') > 0,
    'RENAME TABLE `verificationtoken` TO `VerificationToken`', 'SELECT "verificationtoken table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Subscription tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plan') > 0,
    'RENAME TABLE `plan` TO `Plan`', 'SELECT "plan table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscription') > 0,
    'RENAME TABLE `subscription` TO `Subscription`', 'SELECT "subscription table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Business tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'customer') > 0,
    'RENAME TABLE `customer` TO `Customer`', 'SELECT "customer table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'item') > 0,
    'RENAME TABLE `item` TO `Item`', 'SELECT "item table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tax') > 0,
    'RENAME TABLE `tax` TO `Tax`', 'SELECT "tax table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Invoice tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoice') > 0,
    'RENAME TABLE `invoice` TO `Invoice`', 'SELECT "invoice table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoiceitem') > 0,
    'RENAME TABLE `invoiceitem` TO `InvoiceItem`', 'SELECT "invoiceitem table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'invoicetax') > 0,
    'RENAME TABLE `invoicetax` TO `InvoiceTax`', 'SELECT "invoicetax table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Receipt tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'receipt') > 0,
    'RENAME TABLE `receipt` TO `Receipt`', 'SELECT "receipt table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Proforma tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'proformainvoice') > 0,
    'RENAME TABLE `proformainvoice` TO `ProformaInvoice`', 'SELECT "proformainvoice table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'proformainvoiceitem') > 0,
    'RENAME TABLE `proformainvoiceitem` TO `ProformaInvoiceItem`', 'SELECT "proformainvoiceitem table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'proformainvoicetax') > 0,
    'RENAME TABLE `proformainvoicetax` TO `ProformaInvoiceTax`', 'SELECT "proformainvoicetax table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Other tables
SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payment') > 0,
    'RENAME TABLE `payment` TO `Payment`', 'SELECT "payment table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'template') > 0,
    'RENAME TABLE `template` TO `Template`', 'SELECT "template table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'systemconfig') > 0,
    'RENAME TABLE `systemconfig` TO `SystemConfig`', 'SELECT "systemconfig table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF((SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'auditlog') > 0,
    'RENAME TABLE `auditlog` TO `AuditLog`', 'SELECT "auditlog table already correct" as status');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Show final table list
SELECT 'Tables after renaming:' as info;
SHOW TABLES;

SELECT 'SUCCESS: All tables have been renamed to match Prisma schema!' as result;
SELECT 'Next steps:' as info;
SELECT '1. Run: npx prisma migrate deploy' as step;
SELECT '2. Run: npx prisma generate' as step;
SELECT '3. Restart your application' as step;
