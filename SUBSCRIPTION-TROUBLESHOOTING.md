# Subscription Management - Troubleshooting Guide

## Issue: "No subscription found. Please contact support."

### What This Means
Your tenant account exists, but there's no subscription record in the database. This can happen if:
1. The database was recently reset
2. The tenant was created before subscription management was implemented
3. The seeding script hasn't been run yet

### ✅ Solution: Run the Seeding Script

We've created a seeding script that will:
- Create 4 default plans (Free, Starter, Professional, Enterprise)
- Create trial subscriptions for all existing tenants

**Run this command:**
```bash
npx tsx scripts/seed-subscription-data.ts
```

**Expected Output:**
```
🌱 Starting subscription data seeding...

📦 Creating plans...
  ✅ Free plan created/updated (NGN 0)
  ✅ Starter plan created/updated (NGN 99.99)
  ✅ Professional plan created/updated (NGN 299.99)
  ✅ Enterprise plan created/updated (NGN 999.99)

✅ 4 plans created/updated

🔑 Creating subscriptions for tenants...
  ✅ YourCompany - Free plan (Trial ends: 12/5/2025)

✅ 1 new subscriptions created

📊 Summary:
  Plans: 4
  Tenants: 1
  New Subscriptions: 1
  Existing Subscriptions: 0

✅ Subscription data seeding complete!
```

### After Seeding

1. **Refresh the subscription page** at http://localhost:3000/dashboard/subscription
2. You should now see:
   - Your current plan (Free - Trial)
   - Usage statistics
   - Available plans to upgrade to
   - Days remaining in trial

---

## Issue: Plans Not Showing in Comparison Grid

### Diagnosis
Run this query to check if plans exist:
```sql
SELECT * FROM Plan WHERE isActive = 1;
```

### Solution
If no plans exist, run the seeding script:
```bash
npx tsx scripts/seed-subscription-data.ts
```

---

## Issue: Usage Statistics Show 0%

### This is Normal!
If you haven't created any invoices, customers, or items yet, the usage will be 0%.

### Test with Sample Data
1. **Create test invoices:**
   - Go to http://localhost:3000/dashboard/invoices/new
   - Create 2-3 test invoices

2. **Create test customers:**
   - Go to http://localhost:3000/dashboard/customers
   - Click "Add Customer"
   - Create 2-3 test customers

3. **Create test items:**
   - Go to http://localhost:3000/dashboard/items
   - Click "Add Item"
   - Create 2-3 test items

4. **Refresh subscription page:**
   - You should now see usage percentages update
   - Progress bars will show your usage

---

## Issue: "Payment service not configured"

### Diagnosis
This error appears when trying to upgrade but Paystack keys are not configured.

### Check Your .env File
```env
PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxx"
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
```

If you see placeholder values like above, you need real test keys.

### Solution

1. **Get Paystack Test Keys:**
   - Sign up at https://dashboard.paystack.com/signup
   - Go to Settings → API Keys & Webhooks
   - Copy your test keys (they start with `pk_test_` and `sk_test_`)

2. **Update .env File:**
   ```env
   PAYSTACK_PUBLIC_KEY="pk_test_YOUR_REAL_KEY_HERE"
   PAYSTACK_SECRET_KEY="sk_test_YOUR_REAL_KEY_HERE"
   ```

3. **Restart Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Test Upgrade:**
   - Click "Upgrade" on any plan
   - Use test card: 4084 0840 8408 4081
   - Complete payment flow

---

## Issue: Upgrade Button Does Nothing

### Possible Causes
1. JavaScript error in console
2. API endpoint not responding
3. Paystack keys not configured

### Debug Steps

1. **Open Browser DevTools (F12)**
   - Check Console tab for errors
   - Check Network tab when clicking Upgrade

2. **Expected Network Request:**
   - POST to `/api/subscription/upgrade`
   - Should return `{ authorizationUrl: "...", reference: "..." }`

3. **If 500 Error:**
   - Check server logs in terminal
   - Likely Paystack configuration issue

4. **If 400 Error:**
   - Check error message
   - Might be trying to downgrade (not allowed)

---

## Issue: Database Connection Errors

### Error Message
```
PrismaClientInitializationError: Can't reach database server
```

### Solution

1. **Check MySQL is Running:**
   ```bash
   # Windows
   net start MySQL80

   # Check status
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Verify DATABASE_URL in .env:**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/invoice_saas"
   ```

3. **Test Connection:**
   ```bash
   npx prisma db pull
   ```

---

## Issue: Session/Authentication Errors

### Error Message
```
Unauthorized (401)
```

### Solution

1. **Check if Logged In:**
   - Navigate to http://localhost:3000
   - Verify you're logged in
   - Check for session cookie in DevTools → Application → Cookies

2. **Re-login:**
   - Log out
   - Log back in
   - Try accessing subscription page again

3. **Check NEXTAUTH_SECRET:**
   ```env
   NEXTAUTH_SECRET="generate-a-secret-key-here-use-openssl-rand-base64-32"
   ```
   Should not be empty

---

## Issue: Cancel/Reactivate Not Working

### Expected Behavior
- **Cancel:** Sets `cancelAtPeriodEnd` to true, shows warning banner
- **Reactivate:** Sets `cancelAtPeriodEnd` to false, removes warning

### Debug Steps

1. **Check API Response:**
   - Open DevTools → Network tab
   - Click Cancel Subscription
   - Check POST `/api/subscription/cancel` response

2. **Check Database:**
   ```sql
   SELECT id, tenantId, cancelAtPeriodEnd, canceledAt
   FROM Subscription
   WHERE tenantId = 'your-tenant-id';
   ```

3. **Expected Changes:**
   - After cancel: `cancelAtPeriodEnd = 1`, `canceledAt = current timestamp`
   - After reactivate: `cancelAtPeriodEnd = 0`, `canceledAt = NULL`

---

## Verification Checklist

Use this checklist to verify everything is working:

### Database Setup
- [ ] MySQL server is running
- [ ] Database `invoice_saas` exists
- [ ] All Prisma migrations applied (`npx prisma migrate deploy`)
- [ ] Subscription data seeded (`npx tsx scripts/seed-subscription-data.ts`)

### Data Verification
- [ ] 4 plans exist in database (SELECT * FROM Plan)
- [ ] Your tenant has a subscription (SELECT * FROM Subscription)
- [ ] Subscription has a valid planId
- [ ] Plan record exists and isActive = 1

### API Endpoints
- [ ] GET /api/subscription returns 200 (not 404 or 500)
- [ ] GET /api/plans returns list of plans
- [ ] POST /api/subscription/cancel works
- [ ] DELETE /api/subscription/cancel works

### Environment
- [ ] .env file exists and has all required variables
- [ ] DATABASE_URL is correct
- [ ] NEXTAUTH_URL and NEXTAUTH_SECRET are set
- [ ] PAYSTACK keys configured (for payment testing)

### Frontend
- [ ] Subscription page loads without errors
- [ ] Current plan displays
- [ ] Usage statistics show
- [ ] Plan comparison grid renders
- [ ] No console errors in browser DevTools

---

## Quick Diagnostic Script

Run this to check your setup:

```bash
# Check if MySQL is running
mysql -u root -p -e "SELECT VERSION();"

# Check if database exists
mysql -u root -p -e "USE invoice_saas; SELECT COUNT(*) as plan_count FROM Plan;"

# Check if plans exist
mysql -u root -p -e "USE invoice_saas; SELECT id, name, price FROM Plan WHERE isActive = 1;"

# Check if subscriptions exist
mysql -u root -p -e "USE invoice_saas; SELECT s.id, t.companyName, p.name as planName, s.status FROM invoice_saas.Subscription s JOIN invoice_saas.Tenant t ON s.tenantId = t.id JOIN invoice_saas.Plan p ON s.planId = p.id;"
```

---

## Still Having Issues?

### Check Server Logs
Watch the terminal where `npm run dev` is running. Look for:
- Prisma query errors
- API endpoint errors
- Authentication errors

### Check Browser Console
Press F12 and look for:
- JavaScript errors
- Failed network requests
- 404 or 500 errors

### Database Queries to Debug

**Check if tenant exists:**
```sql
SELECT id, companyName, slug FROM Tenant;
```

**Check if subscription exists for tenant:**
```sql
SELECT s.*, p.name as planName
FROM Subscription s
JOIN Plan p ON s.planId = p.id
WHERE s.tenantId = '[your-tenant-id]';
```

**Check plans:**
```sql
SELECT id, name, slug, price, currency, isActive
FROM Plan
ORDER BY price ASC;
```

**Check user session:**
```sql
SELECT u.id, u.email, u.tenantId, t.companyName
FROM User u
JOIN Tenant t ON u.tenantId = t.id
WHERE u.email = 'your-email@example.com';
```

---

## Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| "No subscription found" | Run: `npx tsx scripts/seed-subscription-data.ts` |
| No plans showing | Run seeding script |
| Can't upgrade | Configure Paystack keys in .env |
| Database errors | Check MySQL is running |
| Auth errors | Re-login to application |
| 0% usage | Create test data (invoices, customers, items) |

---

## Testing After Fixes

After resolving any issues, follow this quick test:

1. ✅ Load http://localhost:3000/dashboard/subscription
2. ✅ Verify plan displays (e.g., "Free - Trial")
3. ✅ Check usage stats appear (even if 0%)
4. ✅ Verify plan grid shows 4 plans
5. ✅ Click Cancel → See warning banner
6. ✅ Click Reactivate → Banner disappears
7. ✅ (Optional) Test upgrade with Paystack test card

---

**Last Updated:** 2025-11-28
**For More Help:** See TESTING-QUICK-START.md and SUBSCRIPTION-TESTING-GUIDE.md
