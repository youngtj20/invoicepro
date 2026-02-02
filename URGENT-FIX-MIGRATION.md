# URGENT FIX: Migration Failed - Tax Table Missing

## Current Situation
- First migration partially applied
- Tax table was NOT created
- Second migration trying to alter non-existent Tax table
- Migration system is in a broken state

## RECOMMENDED SOLUTION (Choose based on your situation)

### 🟢 Option 1: Fresh Database (NO DATA TO PRESERVE)

**Use this if your production database is empty or you can afford to lose the data.**

1. **Set your DATABASE_URL:**
   ```cmd
   set DATABASE_URL=mysql://user:password@host:3306/database
   ```

2. **Run the fix script:**
   ```cmd
   fix-migration-error.bat
   ```

   This will:
   - Reset the database (drop all tables)
   - Reapply all migrations cleanly
   - Generate Prisma client

3. **Done!** Your database will be ready.

---

### 🟡 Option 2: Manual Fix (PRESERVE EXISTING DATA)

**Use this if you have data you need to keep.**

#### Step 1: Mark the failed migration as rolled back
```cmd
npx prisma migrate resolve --rolled-back 20251127183028_add_description_to_tax
```

#### Step 2: Check what tables exist
Connect to your database and run:
```sql
SHOW TABLES;
```

#### Step 3: Apply the manual fix SQL
Run the `manual-fix.sql` file on your database:

**Using MySQL command line:**
```cmd
mysql -h your-host -u your-user -p your-database < manual-fix.sql
```

**Or copy and paste the SQL from `manual-fix.sql` into your database client.**

#### Step 4: Mark migrations as applied
```cmd
npx prisma migrate resolve --applied 20251126210239_start
npx prisma migrate resolve --applied 20251127183028_add_description_to_tax
npx prisma migrate resolve --applied 20251128215959_add_bank_details_to_tenant
npx prisma migrate resolve --applied 20251129132530_add_password_reset_fields
npx prisma migrate resolve --applied 20251129134355_add_default_template
npx prisma migrate resolve --applied 20251201_add_multiple_taxes
npx prisma migrate resolve --applied add_logo_size
```

#### Step 5: Generate Prisma client
```cmd
npx prisma generate
```

#### Step 6: Verify
```cmd
npx prisma migrate status
```

Should show: "Database schema is up to date!"

---

### 🔴 Option 3: Complete Reset via Prisma (NUCLEAR OPTION)

**Only if Options 1 and 2 don't work.**

```cmd
# This will DROP EVERYTHING
npx prisma migrate reset --force --skip-seed

# Then deploy fresh
npx prisma migrate deploy

# Generate client
npx prisma generate
```

---

## Quick Commands Reference

### Check migration status:
```cmd
npx prisma migrate status
```

### Check what tables exist:
```sql
SHOW TABLES;
```

### Mark a migration as applied:
```cmd
npx prisma migrate resolve --applied MIGRATION_NAME
```

### Mark a migration as rolled back:
```cmd
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

---

## After Fixing

1. **Restart your application**
2. **Test the signup endpoint**
3. **Verify all features work**

---

## Why This Happened

This typically occurs when:
- Database connection interrupted during migration
- Insufficient database permissions
- Database server resource constraints
- Network issues

---

## Prevention for Future

1. **Always backup before migrations**
2. **Test migrations on staging first**
3. **Ensure stable database connection**
4. **Grant proper database permissions**
5. **Monitor database resources**

---

## Need Help?

If you're still stuck:

1. Run this and share the output:
   ```cmd
   npx prisma migrate status
   ```

2. Connect to your database and run:
   ```sql
   SHOW TABLES;
   SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;
   ```

3. Check your database user permissions:
   ```sql
   SHOW GRANTS FOR CURRENT_USER;
   ```
