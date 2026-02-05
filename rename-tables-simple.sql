-- Simple Table Rename Script
-- Run this if your tables are lowercase and need to be capitalized

-- Check current tables
SHOW TABLES;

-- Rename all tables to match Prisma schema
-- If a table doesn't exist, the command will fail but won't break the script

RENAME TABLE `users` TO `User`;
RENAME TABLE `tenant` TO `Tenant`;
RENAME TABLE `account` TO `Account`;
RENAME TABLE `session` TO `Session`;
RENAME TABLE `verificationtoken` TO `VerificationToken`;
RENAME TABLE `plan` TO `Plan`;
RENAME TABLE `subscription` TO `Subscription`;
RENAME TABLE `customer` TO `Customer`;
RENAME TABLE `item` TO `Item`;
RENAME TABLE `tax` TO `Tax`;
RENAME TABLE `invoice` TO `Invoice`;
RENAME TABLE `invoiceitem` TO `InvoiceItem`;
RENAME TABLE `invoicetax` TO `InvoiceTax`;
RENAME TABLE `receipt` TO `Receipt`;
RENAME TABLE `proformainvoice` TO `ProformaInvoice`;
RENAME TABLE `proformainvoiceitem` TO `ProformaInvoiceItem`;
RENAME TABLE `proformainvoicetax` TO `ProformaInvoiceTax`;
RENAME TABLE `payment` TO `Payment`;
RENAME TABLE `template` TO `Template`;
RENAME TABLE `systemconfig` TO `SystemConfig`;
RENAME TABLE `auditlog` TO `AuditLog`;

-- Verify
SHOW TABLES;
