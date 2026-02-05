# 🔥 QUICK FIX: Table Case Sensitivity Issue

## Your Problem
```
Error: The table `User` does not exist in the current database.
```

But when you check your database, you see `users` (lowercase) instead of `User` (capital U).

## The Fix (3 Simple Steps)

### Step 1: Check Your Tables
Connect to your production database and run:
```sql
SHOW TABLES;
```

If you see **lowercase** table names (`users`, `tax`, `invoice`, etc.), continue to Step 2.

### Step 2: Rename Tables
Run this SQL script on your production database:

```sql
RENAME TABLE `users` TO `User`;
RENAME TABLE `tax` TO `Tax`;
RENAME TABLE `tenant` TO `Tenant`;
RENAME TABLE `account` TO `Account`;
RENAME TABLE `session` TO `Session`;
RENAME TABLE `customer` TO `Customer`;
RENAME TABLE `item` TO `Item`;
RENAME TABLE `invoice` TO `Invoice`;
RENAME TABLE `invoiceitem` TO `InvoiceItem`;
RENAME TABLE `receipt` TO `Receipt`;
RENAME TABLE `payment` TO `Payment`;
RENAME TABLE `template` TO `Template`;
```

**Or use the provided script:**
```cmd
mysql -h your-host -u your-user -p your-database < rename-tables-simple.sql
```

### Step 3: Complete Migrations
After renaming tables, run:

```cmd
npx prisma migrate deploy
npx prisma generate
```

Then restart your application.

## Done! ✅

Your application should now work correctly.

---

## Why This Happened

- **Your local machine** (Windows/Mac): MySQL is case-insensitive, creates lowercase tables
- **Production server** (Linux): MySQL is case-sensitive, expects exact case match
- **Prisma schema**: Defines models as `User`, `Tax`, etc. (capital first letter)

When migrations ran, they created lowercase tables, but Prisma expects capitalized names.

---

## Alternative: If You Can't Rename Tables

If you can't rename tables in production, update your `schema.prisma` to use lowercase:

```prisma
model User {
  // ... all your fields ...
  
  @@map("users")  // Add this line
}

model Tax {
  // ... all your fields ...
  
  @@map("tax")  // Add this line
}

// Add @@map() to ALL models
```

Then run:
```cmd
npx prisma generate
```

---

## Verify the Fix

After applying the fix:

1. **Check tables:**
   ```sql
   SHOW TABLES;
   ```
   Should show: `User`, `Tax`, `Invoice`, etc. (capitalized)

2. **Test signup:**
   Try creating a new user account

3. **Check logs:**
   No more "table does not exist" errors

---

## Files Created for You

- `FIX-TABLE-CASE.md` - Detailed explanation
- `rename-tables-simple.sql` - Simple rename script
- `fix-table-case.sql` - Advanced rename script with checks
- `check-table-case.sql` - Diagnostic queries

---

## Need Help?

Run these diagnostics and share the output:

```sql
-- Show all tables
SHOW TABLES;

-- Show case sensitivity setting
SHOW VARIABLES LIKE 'lower_case_table_names';

-- Show table names from information schema
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
```
