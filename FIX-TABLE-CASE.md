# TABLE CASE SENSITIVITY FIX

## The Real Problem

Your production database has **lowercase table names** (`users`, `tax`, etc.) but Prisma expects **capitalized table names** (`User`, `Tax`, etc.).

This happens because:
- **Windows/Mac MySQL**: Case-insensitive by default (creates lowercase tables)
- **Linux MySQL**: Case-sensitive (respects the case in CREATE TABLE statements)
- **Prisma migrations**: Create tables with exact case from schema (User, Tax, etc.)

## Quick Diagnosis

Run this on your production database:

```sql
-- Check actual table names
SHOW TABLES;

-- Check case sensitivity setting
SHOW VARIABLES LIKE 'lower_case_table_names';
```

If you see `users` instead of `User`, this is your problem!

## SOLUTION 1: Rename Tables to Match Prisma Schema (RECOMMENDED)

Run this SQL on your production database:

```sql
-- Rename all tables to match Prisma schema (capital first letter)
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

-- Verify the changes
SHOW TABLES;
```

After renaming, run:
```cmd
npx prisma migrate deploy
npx prisma generate
```

## SOLUTION 2: Update Prisma Schema to Use Lowercase (Alternative)

If you prefer to keep lowercase table names, update your `schema.prisma`:

Add `@@map("users")` to each model:

```prisma
model User {
  // ... fields ...
  
  @@map("users")  // Add this
}

model Tax {
  // ... fields ...
  
  @@map("tax")  // Add this
}

// Do this for ALL models
```

Then:
```cmd
npx prisma generate
```

## SOLUTION 3: Configure MySQL for Case-Insensitive Tables

⚠️ **Requires database restart - use with caution!**

Add to your MySQL config (`my.cnf` or `my.ini`):

```ini
[mysqld]
lower_case_table_names=1
```

Then restart MySQL and recreate the database.

## Quick Fix Script

I've created `fix-table-case.sql` - run it on your production database:

```cmd
mysql -h your-host -u your-user -p your-database < fix-table-case.sql
```

## After Fixing

1. **Verify tables are renamed:**
   ```sql
   SHOW TABLES;
   ```

2. **Complete any pending migrations:**
   ```cmd
   npx prisma migrate deploy
   ```

3. **Generate Prisma client:**
   ```cmd
   npx prisma generate
   ```

4. **Restart your application**

5. **Test signup/login**

## Prevention

When deploying to production:
1. Always test migrations on a staging environment first
2. Check table case sensitivity settings before migrating
3. Use `prisma migrate deploy` (not `prisma db push`)
4. Verify table names after migration

## Still Having Issues?

Run these diagnostics:

```sql
-- Show all tables with exact case
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE();

-- Check case sensitivity
SHOW VARIABLES LIKE 'lower_case_table_names';

-- Check if User table exists (any case)
SHOW TABLES LIKE '%user%';
```

Share the output and we can help further!
