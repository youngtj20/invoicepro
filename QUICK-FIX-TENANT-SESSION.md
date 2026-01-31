# 🚀 Quick Fix Guide - Tenant Session Error

## The Problem
Getting "Tenant not found. Please complete onboarding." errors on API calls even after completing onboarding.

## The Solution (Already Applied)
Updated `lib/auth.ts` to properly refresh session data from the database when users complete onboarding.

## What You Need to Do Now

### 1. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Test the Fix

#### For New Users:
1. Sign up with a new account
2. Complete the onboarding form
3. You should be redirected to dashboard
4. Check browser console - no 500 errors should appear
5. Navigate to Customers, Invoices, Settings - all should work

#### For Existing Users with Issues:
**Option A: Log out and log back in** (Recommended)
- This will create a fresh session with the correct tenantId

**Option B: Clear browser data**
- Clear cookies and local storage for your app
- Log in again

### 3. Verify Database State (If Issues Persist)

Run these queries in your MySQL database:

```sql
-- Check if user has tenantId
SELECT id, email, name, tenantId FROM User WHERE email = 'your-email@example.com';

-- If tenantId is NULL but you completed onboarding, check audit logs
SELECT * FROM AuditLog 
WHERE action = 'tenant.created' 
AND userId = 'your-user-id'
ORDER BY createdAt DESC;
```

### 4. Manual Fix (If Needed)

If a user completed onboarding but still has no tenantId:

```sql
-- Find the tenant they created
SELECT t.* FROM Tenant t
INNER JOIN AuditLog al ON al.tenantId = t.id
WHERE al.userId = 'user-id' AND al.action = 'tenant.created';

-- Link user to tenant
UPDATE User SET tenantId = 'tenant-id' WHERE id = 'user-id';
```

Then have the user log out and log back in.

## What Changed

### File: `lib/auth.ts`

**Before:**
```typescript
async jwt({ token, user, trigger, session }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.tenantId = user.tenantId;
  }
  
  if (trigger === 'update' && session) {
    token = { ...token, ...session };
  }
  
  return token;
}
```

**After:**
```typescript
async jwt({ token, user, trigger, session, account }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.tenantId = user.tenantId;
  }

  // For OAuth providers, fetch from database
  if (account?.provider === 'google' && user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, tenantId: true },
    });
    if (dbUser) {
      token.id = dbUser.id;
      token.role = dbUser.role;
      token.tenantId = dbUser.tenantId;
    }
  }

  // Handle session update - fetch fresh data from database
  if (trigger === 'update') {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { id: true, email: true, name: true, role: true, tenantId: true },
    });
    if (dbUser) {
      token.id = dbUser.id;
      token.role = dbUser.role;
      token.tenantId = dbUser.tenantId;
    }
  }

  return token;
}
```

## Why This Fixes It

1. **Before**: When `update()` was called after onboarding, the JWT callback just merged the session object without fetching fresh data from the database
2. **After**: The JWT callback now queries the database to get the updated `tenantId` when the session is updated
3. **Result**: The session properly includes the `tenantId` after onboarding, allowing all API calls to work

## Troubleshooting

### Still seeing errors after restart?
1. Clear browser cookies and local storage
2. Log out and log back in
3. Check that `.env` has `NEXTAUTH_SECRET` set
4. Verify database has the Pro plan: `SELECT * FROM Plan WHERE slug = 'pro';`

### Users created before the fix?
They need to log out and log back in to get a fresh session with the correct tenantId.

### OAuth (Google) users?
The fix also handles OAuth users by fetching their tenantId from the database on login.

## Need More Help?

See the detailed documentation:
- `TENANT-SESSION-FIX.md` - Complete technical explanation
- `TENANT-DIAGNOSTIC.sql` - Database diagnostic queries

## Summary

✅ **Fixed**: JWT callback now fetches fresh user data on session update  
✅ **Fixed**: OAuth users properly get tenantId from database  
✅ **Action Required**: Restart dev server and test  
✅ **For Existing Users**: Log out and log back in  

The fix is complete and ready to use! 🎉
