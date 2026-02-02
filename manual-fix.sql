-- Manual Fix for Partial Migration
-- Run this SQL script directly on your production database
-- This will create any missing tables from the first migration

-- First, check what tables exist
SHOW TABLES;

-- If Tax table is missing, create it with the description field already included
CREATE TABLE IF NOT EXISTS `Tax` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `rate` DOUBLE NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `Tax_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign key constraint
ALTER TABLE `Tax` ADD CONSTRAINT `Tax_tenantId_fkey` 
FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create InvoiceTax table (from later migration)
CREATE TABLE IF NOT EXISTS `InvoiceTax` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `taxId` VARCHAR(191) NOT NULL,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `InvoiceTax_invoiceId_taxId_key`(`invoiceId`, `taxId`),
    INDEX `InvoiceTax_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceTax_taxId_idx`(`taxId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys for InvoiceTax
ALTER TABLE `InvoiceTax` ADD CONSTRAINT `InvoiceTax_invoiceId_fkey` 
FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `InvoiceTax` ADD CONSTRAINT `InvoiceTax_taxId_fkey` 
FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ProformaInvoiceTax table (from later migration)
CREATE TABLE IF NOT EXISTS `ProformaInvoiceTax` (
    `id` VARCHAR(191) NOT NULL,
    `proformaId` VARCHAR(191) NOT NULL,
    `taxId` VARCHAR(191) NOT NULL,
    `taxAmount` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ProformaInvoiceTax_proformaId_taxId_key`(`proformaId`, `taxId`),
    INDEX `ProformaInvoiceTax_proformaId_idx`(`proformaId`),
    INDEX `ProformaInvoiceTax_taxId_idx`(`taxId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add foreign keys for ProformaInvoiceTax
ALTER TABLE `ProformaInvoiceTax` ADD CONSTRAINT `ProformaInvoiceTax_proformaId_fkey` 
FOREIGN KEY (`proformaId`) REFERENCES `ProformaInvoice`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProformaInvoiceTax` ADD CONSTRAINT `ProformaInvoiceTax_taxId_fkey` 
FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Add bank details to Tenant (from later migration)
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `bankName` VARCHAR(191) NULL;
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `accountNumber` VARCHAR(191) NULL;
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `accountName` VARCHAR(191) NULL;

-- Add password reset fields to User (from later migration)
ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `resetToken` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN IF NOT EXISTS `resetTokenExpiry` DATETIME(3) NULL;

-- Add default template to Tenant (from later migration)
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `defaultTemplateId` VARCHAR(191) NULL;
ALTER TABLE `Tenant` ADD COLUMN IF NOT EXISTS `logoSize` INTEGER NOT NULL DEFAULT 50;

-- Add foreign key for default template
ALTER TABLE `Tenant` ADD CONSTRAINT `Tenant_defaultTemplateId_fkey` 
FOREIGN KEY (`defaultTemplateId`) REFERENCES `Template`(`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify all tables exist
SHOW TABLES;

-- Check Tax table structure
DESCRIBE Tax;
