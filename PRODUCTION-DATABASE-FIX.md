# Production Database Fix - User Table Missing

## Problem
The error `The table 'User' does not exist in the current database` indicates that your production database hasn't been initialized with the required schema.

## Root Cause
Prisma migrations have not been run on your production database. The database exists but is empty (no tables).

## Solution

### Option 1: Run Migrations Locally Against Production DB (Recommended for first-time setup)

1. **Backup your production database first** (if it has any data)

2. **Set your production DATABASE_URL temporarily in a local .env file:**
   ```bash
   # Create a .env.production file (don't commit this!)
   DATABASE_URL="mysql://user:password@production-host:3306/production_db"
   ```

3. **Run the migration deployment command:**
   ```bash
   # Windows PowerShell
   $env:DATABASE_URL="your-production-database-url"; npx prisma migrate deploy

   # Windows CMD
   set DATABASE_URL=your-production-database-url && npx prisma migrate deploy

   # Or if you have a .env.production file:
   npx dotenv -e .env.production -- prisma migrate deploy
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Option 2: Run Migrations on Production Server

If you have SSH access to your production server:

1. **SSH into your production server**

2. **Navigate to your application directory**

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Restart your application**

### Option 3: Using Your Hosting Platform

#### For Vercel:
1. Add this to your `package.json` scripts:
   ```json
   "scripts": {
     "vercel-build": "prisma generate && prisma migrate deploy && next build"
   }
   ```

2. Ensure `DATABASE_URL` is set in Vercel environment variables

3. Redeploy

#### For Railway/Render/Heroku:
1. Add a build command or release phase:
   ```bash
   npx prisma migrate deploy && npm run build
   ```

2. Or add to your `package.json`:
   ```json
   "scripts": {
     "build": "prisma generate && prisma migrate deploy && next build"
   }
   ```

### Option 4: Database Push (Quick but not recommended for production)

⚠️ **Use with caution** - This bypasses migration history:

```bash
npx prisma db push
```

This will sync your schema directly to the database without using migrations.

## Verification

After running migrations, verify the tables exist:

```bash
# Connect to your database and run:
SHOW TABLES;

# Or use Prisma Studio:
npx prisma studio
```

You should see all these tables:
- User
- Tenant
- Account
- Session
- VerificationToken
- Plan
- Subscription
- Customer
- Item
- Tax
- Invoice
- InvoiceItem
- InvoiceTax
- Receipt
- ProformaInvoice
- ProformaInvoiceItem
- ProformaInvoiceTax
- Payment
- Template
- SystemConfig
- AuditLog

## Important Notes

1. **Always backup your production database before running migrations**

2. **Never use `prisma migrate dev` in production** - it's for development only

3. **Use `prisma migrate deploy`** - it applies pending migrations without prompting

4. **Ensure DATABASE_URL is correct** - check host, port, username, password, and database name

5. **Check database permissions** - the user must have CREATE, ALTER, DROP privileges

## Common Issues

### Issue: "Can't reach database server"
- Check if your production database is accessible from where you're running the command
- Verify firewall rules and IP whitelisting
- Confirm DATABASE_URL format is correct

### Issue: "Access denied"
- Verify database credentials
- Ensure the database user has sufficient privileges

### Issue: "Database does not exist"
- Create the database first:
  ```sql
  CREATE DATABASE your_database_name;
  ```

### Issue: Migration fails midway
- Check the error message
- You may need to manually fix the database state
- Use `prisma migrate resolve` to mark migrations as applied/rolled back

## Post-Migration Steps

1. **Seed initial data** (if needed):
   ```bash
   npm run db:seed
   ```

2. **Restart your application**

3. **Test the signup endpoint** to verify the User table is accessible

4. **Monitor logs** for any other database-related errors

## Prevention for Future Deployments

Add to your CI/CD pipeline or build process:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "deploy": "prisma migrate deploy && npm run build"
  }
}
```

Or create a deployment script:

```bash
#!/bin/bash
# deploy.sh

echo "Running database migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Building application..."
npm run build

echo "Deployment complete!"
```

## Need Help?

If you continue to experience issues:

1. Check your production logs for more detailed error messages
2. Verify your DATABASE_URL environment variable is set correctly
3. Test database connectivity from your production environment
4. Ensure all migrations in `prisma/migrations/` are committed to your repository
