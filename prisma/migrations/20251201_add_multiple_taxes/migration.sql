-- CreateTable InvoiceTax
CREATE TABLE `InvoiceTax` (
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

-- CreateTable ProformaInvoiceTax
CREATE TABLE `ProformaInvoiceTax` (
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

-- AddForeignKey
ALTER TABLE `InvoiceTax` ADD CONSTRAINT `InvoiceTax_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceTax` ADD CONSTRAINT `InvoiceTax_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaInvoiceTax` ADD CONSTRAINT `ProformaInvoiceTax_proformaId_fkey` FOREIGN KEY (`proformaId`) REFERENCES `ProformaInvoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProformaInvoiceTax` ADD CONSTRAINT `ProformaInvoiceTax_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
