-- AlterTable
ALTER TABLE `tenant` ADD COLUMN `defaultTemplateId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Tenant` ADD CONSTRAINT `Tenant_defaultTemplateId_fkey` FOREIGN KEY (`defaultTemplateId`) REFERENCES `Template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
