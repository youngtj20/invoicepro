# Quick Fix: User Table Does Not Exist Error

## The Problem
Your production database is empty - no tables have been created yet.

## The Solution (Choose ONE method based on your hosting)

### Method 1: If you're using Vercel, Netlify, or similar
1. Make sure `DATABASE_URL` is set in your environment variables
2. Redeploy your application - it will now run migrations automatically during build
3. The updated `package.json` includes `vercel-build` script that handles this

### Method 2: If you have direct database access
Run this command with your production DATABASE_URL:

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="mysql://user:password@host:3306/database"; npx prisma migrate deploy
```

**Windows CMD:**
```cmd
set DATABASE_URL=mysql://user:password@host:3306/database && npx prisma migrate deploy
```

**Linux/Mac:**
```bash
DATABASE_URL="mysql://user:password@host:3306/database" npx prisma migrate deploy
```

### Method 3: Use the provided script
1. Set your production DATABASE_URL:
   ```cmd
   set DATABASE_URL=mysql://user:password@host:3306/database
   ```

2. Run the script:
   ```cmd
   deploy-migrations.bat
   ```

## What This Does
- Creates all database tables (User, Tenant, Invoice, etc.)
- Applies all migrations from `prisma/migrations/`
- Makes your production database match your schema

## After Running Migrations
1. Restart your production application
2. Test the signup endpoint - it should work now
3. All database tables will be ready to use

## Important Notes
- ✅ Use `prisma migrate deploy` for production
- ❌ Never use `prisma migrate dev` in production
- 🔒 Always backup your database first (if it has data)
- 🔑 Make sure DATABASE_URL has correct credentials and permissions

## Verify It Worked
After running migrations, you can verify by connecting to your database and running:
```sql
SHOW TABLES;
```

You should see tables like: User, Tenant, Invoice, Customer, etc.

## Still Having Issues?
1. Check that DATABASE_URL is correct
2. Verify database user has CREATE/ALTER/DROP permissions
3. Ensure the database exists (create it if needed)
4. Check firewall/network access to database
5. Look at the full error message for more details

## For Future Deployments
The updated `package.json` now includes:
- `build`: Generates Prisma client before building
- `db:migrate:deploy`: Runs production migrations
- `vercel-build`: Automatic migrations for Vercel deployments

Your deployments will now handle migrations automatically! 🎉
