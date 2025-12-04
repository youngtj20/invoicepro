# Database Migration Instructions for Multiple Taxes

## Quick Start

Run these commands in order to apply the multiple taxes feature:

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Create and Apply Migration
```bash
npx prisma migrate dev --name add_multiple_taxes_support
```

This will:
- Create the migration files
- Apply the migration to your database
- Regenerate the Prisma client

### Step 3: Verify Migration
```bash
npx prisma db push
```

## What the Migration Does

The migration creates two new tables:

### InvoiceTax Table
```sql
CREATE TABLE `InvoiceTax` (
  `id` VARCHAR(191) NOT NULL,
  `invoiceId` VARCHAR(191) NOT NULL,
  `taxId` VARCHAR(191) NOT NULL,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `InvoiceTax_invoiceId_taxId_key` (`invoiceId`, `taxId`),
  KEY `InvoiceTax_invoiceId_idx` (`invoiceId`),
  KEY `InvoiceTax_taxId_idx` (`taxId`),
  
  CONSTRAINT `InvoiceTax_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice` (`id`) ON DELETE CASCADE,
  CONSTRAINT `InvoiceTax_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax` (`id`) ON DELETE CASCADE
);
```

### ProformaInvoiceTax Table
```sql
CREATE TABLE `ProformaInvoiceTax` (
  `id` VARCHAR(191) NOT NULL,
  `proformaId` VARCHAR(191) NOT NULL,
  `taxId` VARCHAR(191) NOT NULL,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `ProformaInvoiceTax_proformaId_taxId_key` (`proformaId`, `taxId`),
  KEY `ProformaInvoiceTax_proformaId_idx` (`proformaId`),
  KEY `ProformaInvoiceTax_taxId_idx` (`taxId`),
  
  CONSTRAINT `ProformaInvoiceTax_proformaId_fkey` FOREIGN KEY (`proformaId`) REFERENCES `ProformaInvoice` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ProformaInvoiceTax_taxId_fkey` FOREIGN KEY (`taxId`) REFERENCES `Tax` (`id`) ON DELETE CASCADE
);
```

## Troubleshooting

### If you get "Cannot find module" errors:
```bash
npm install
npx prisma generate
```

### If migration fails:
```bash
# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset

# Or manually apply the schema
npx prisma db push --force-reset
```

### If Prisma client is out of sync:
```bash
# Clear cache and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

## Verification

After migration, verify the tables were created:

```bash
# Connect to your database and run:
SHOW TABLES LIKE 'Invoice%';
SHOW TABLES LIKE 'ProformaInvoice%';

# You should see:
# - InvoiceTax
# - ProformaInvoiceTax
```

## Rollback (if needed)

If you need to rollback the migration:

```bash
# List all migrations
npx prisma migrate status

# Rollback to previous state
npx prisma migrate resolve --rolled-back add_multiple_taxes_support
```

## Next Steps

After migration:
1. Test creating an invoice with multiple taxes
2. Verify taxes are saved in the InvoiceTax table
3. Check that invoice totals are calculated correctly
4. Test invoice retrieval with tax details
