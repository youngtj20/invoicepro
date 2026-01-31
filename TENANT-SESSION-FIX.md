# Tenant Session Fix - Complete Solution

## Problem Summary

Users were experiencing "Tenant not found. Please complete onboarding." errors across multiple API endpoints even after completing onboarding. This was causing 500 errors on:

- `/api/customers`
- `/api/invoices/generate-number`
- `/api/settings`
- And other tenant-dependent endpoints

## Root Cause

The issue was in the NextAuth JWT callback in `lib/auth.ts`. When users completed onboarding:

1. The onboarding API correctly created a tenant and linked it to the user in the database
2. The frontend called `update()` to refresh the session
3. However, the JWT callback wasn't fetching the updated `tenantId` from the database
4. The session remained without a `tenantId`, causing all tenant-dependent API calls to fail

## Solution Implemented

### 1. Enhanced JWT Callback (`lib/auth.ts`)

Updated the JWT callback to:

- **Fetch fresh user data on session update**: When `trigger === 'update'`, the callback now queries the database to get the latest user information including the `tenantId`
- **Handle OAuth providers properly**: Added special handling for Google OAuth to ensure `tenantId` is fetched from the database on first login
- **Maintain token consistency**: Ensures all token fields (id, role, tenantId) are properly synchronized with the database

```typescript
async jwt({ token, user, trigger, session, account }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.tenantId = user.tenantId;
  }

  // For OAuth providers, fetch user data from database to get tenantId
  if (account?.provider === 'google' && user) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
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
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
      },
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

## How It Works Now

### For New Users (Onboarding Flow)

1. User signs up and logs in → `tenantId` is `null`
2. User is redirected to `/onboarding` (handled by dashboard layout)
3. User completes onboarding form
4. Onboarding API creates tenant and updates user's `tenantId` in database
5. Frontend calls `update()` to refresh session
6. JWT callback detects `trigger === 'update'` and fetches fresh data from database
7. Session now includes the `tenantId`
8. User is redirected to dashboard
9. All API calls now work correctly with the tenant context

### For Existing Users (Login Flow)

1. User logs in with credentials → `tenantId` is fetched from database during authorization
2. JWT callback sets `tenantId` in token
3. Session includes `tenantId` from the start
4. All API calls work correctly

### For OAuth Users (Google Sign-In)

1. User signs in with Google
2. JWT callback detects OAuth provider and fetches user data from database
3. `tenantId` is properly set in token
4. If no `tenantId` exists, user is redirected to onboarding
5. After onboarding, session update flow applies (same as new users)

## Testing the Fix

### 1. Test New User Onboarding

```bash
# 1. Create a new user account
# 2. Complete the onboarding process
# 3. Verify you're redirected to dashboard
# 4. Check browser console - should see no 500 errors
# 5. Navigate to different pages (Customers, Invoices, Settings)
# 6. All pages should load without tenant errors
```

### 2. Test Existing User Login

```bash
# 1. Log out
# 2. Log back in with existing credentials
# 3. Should go directly to dashboard
# 4. All API calls should work immediately
```

### 3. Test Session Persistence

```bash
# 1. Log in and navigate around
# 2. Refresh the page
# 3. Session should persist with tenantId
# 4. No errors should occur
```

## Additional Safeguards

The application already has these safeguards in place:

1. **Dashboard Layout Protection** (`app/dashboard/layout.tsx`):
   - Checks if user has a `tenantId`
   - Redirects to `/onboarding` if missing
   - Prevents access to dashboard without tenant

2. **Tenant Middleware** (`middleware/tenant.ts`):
   - `requireTenant()` function validates tenant exists and is active
   - Provides clear error messages
   - Used by all tenant-dependent API routes

3. **Onboarding API** (`app/api/onboarding/route.ts`):
   - Creates tenant with proper subscription
   - Links user to tenant in a transaction
   - Creates audit log for tracking

## What Changed

### Files Modified

1. **`lib/auth.ts`**
   - Enhanced JWT callback with database fetch on session update
   - Added OAuth provider handling
   - Improved token synchronization

## Migration Notes

### For Existing Users with Issues

If you have users who completed onboarding but are still seeing tenant errors:

1. **Option 1: Have them log out and log back in**
   - This will trigger a fresh JWT token with the correct `tenantId`

2. **Option 2: Clear their session**
   ```sql
   -- If using database sessions (not applicable with JWT strategy)
   DELETE FROM Session WHERE userId = 'user-id';
   ```

3. **Option 3: Verify database state**
   ```sql
   -- Check if user has tenantId
   SELECT id, email, tenantId FROM User WHERE email = 'user@example.com';
   
   -- If tenantId is NULL but tenant exists, update it
   UPDATE User SET tenantId = 'tenant-id' WHERE id = 'user-id';
   ```

## Verification Checklist

- [x] JWT callback fetches fresh data on session update
- [x] OAuth providers properly fetch tenantId
- [x] Dashboard layout redirects users without tenant
- [x] Onboarding API creates tenant and links user
- [x] Session update is called after onboarding
- [x] All API routes use requireTenant middleware

## Next Steps

1. **Restart your development server** to apply the changes:
   ```bash
   npm run dev
   ```

2. **Test the complete flow**:
   - Sign up a new user
   - Complete onboarding
   - Verify dashboard loads without errors
   - Test all major features (customers, invoices, settings)

3. **Monitor for errors**:
   - Check browser console for any remaining issues
   - Check server logs for API errors
   - Verify all tenant-dependent endpoints work

## Support

If you continue to experience issues:

1. Clear browser cookies and local storage
2. Restart the development server
3. Check that your `.env` file has `NEXTAUTH_SECRET` set
4. Verify database migrations are up to date
5. Check that the Pro plan exists in the database (run seed if needed)

## Summary

The fix ensures that when users complete onboarding, their session is properly updated with the new `tenantId` by fetching fresh data from the database. This resolves the "Tenant not found" errors and allows all tenant-dependent features to work correctly.
