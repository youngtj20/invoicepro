# Fix Migration Error - Tax Table Missing

## The Problem
The first migration (`20251126210239_start`) was marked as applied, but the Tax table wasn't actually created in the database. This causes subsequent migrations to fail.

## Solution: Reset and Reapply Migrations

### Step 1: Mark the failed migration as rolled back

Run this command to tell Prisma that the second migration failed:

```cmd
npx prisma migrate resolve --rolled-back 20251127183028_add_description_to_tax
```

### Step 2: Check what tables actually exist

Connect to your database and run:
```sql
SHOW TABLES;
```

This will show you which tables were actually created.

### Step 3: Choose the appropriate fix

#### Option A: If NO tables exist (clean database)
Reset the migration history and start fresh:

```cmd
npx prisma migrate reset --skip-seed
npx prisma migrate deploy
```

⚠️ **WARNING**: This will drop all tables and data!

#### Option B: If SOME tables exist (partial migration)
You have two choices:

**B1. Manual Fix (Recommended):**

1. Connect to your database
2. Check which tables are missing:
   ```sql
   SHOW TABLES;
   ```

3. If Tax table is missing, create it manually:
   ```sql
   CREATE TABLE `Tax` (
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

   ALTER TABLE `Tax` ADD CONSTRAINT `Tax_tenantId_fkey` 
   FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) 
   ON DELETE CASCADE ON UPDATE CASCADE;
   ```

4. Mark the first migration as applied:
   ```cmd
   npx prisma migrate resolve --applied 20251126210239_start
   ```

5. Mark the second migration as applied (since we added description in the CREATE):
   ```cmd
   npx prisma migrate resolve --applied 20251127183028_add_description_to_tax
   ```

6. Continue with remaining migrations:
   ```cmd
   npx prisma migrate deploy
   ```

**B2. Drop and Recreate (If no important data):**

```cmd
# Drop all tables
npx prisma migrate reset --skip-seed

# Reapply all migrations
npx prisma migrate deploy
```

### Step 4: Verify the fix

After applying migrations, verify all tables exist:

```sql
SHOW TABLES;
```

You should see all these tables:
- Account
- AuditLog
- Customer
- Invoice
- InvoiceItem
- InvoiceTax
- Item
- Payment
- Plan
- ProformaInvoice
- ProformaInvoiceItem
- ProformaInvoiceTax
- Receipt
- Session
- Subscription
- SystemConfig
- Tax
- Template
- Tenant
- User
- VerificationToken
- _prisma_migrations

## Quick Fix Script

I've created a script to automate this. Use it if you have a clean database with no important data:

```cmd
fix-migration-error.bat
```

## Prevention

This usually happens when:
1. Database connection is interrupted during migration
2. Database user lacks sufficient permissions
3. Database server runs out of resources
4. Network issues during migration

To prevent:
- Ensure stable database connection
- Grant proper permissions (CREATE, ALTER, DROP, INDEX)
- Run migrations during low-traffic periods
- Monitor database resources
