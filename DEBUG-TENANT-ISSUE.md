# 🔍 DEBUGGING TENANT SESSION ISSUE

## Current Status
The error is still occurring, which means we need to investigate further.

## What I Just Did

### 1. Added Database Fallback in `middleware/tenant.ts`
If the session doesn't have a `tenantId`, the middleware now fetches it directly from the database as a fallback.

### 2. Added Comprehensive Debugging
Added console.log statements to track:
- JWT callback execution
- Session update triggers
- Database queries
- Token state before and after updates

## What You Need to Do Now

### Step 1: Check the Server Console
Look at your terminal where the dev server is running. You should now see detailed debug logs like:

```
=== JWT Callback Debug ===
Trigger: update
User: none
Token before: { id: 'xxx', tenantId: null }
Session update triggered, fetching from database
Update dbUser: { id: 'xxx', tenantId: 'yyy' }
Token after: { id: 'xxx', tenantId: 'yyy' }
=== End JWT Callback ===
```

### Step 2: Try to Access the Invoices Page
1. Navigate to http://localhost:3001/dashboard/invoices
2. Watch the server console for the debug output
3. Copy and paste the debug logs here

### Step 3: Check Your Database
Run this query to verify your user has a tenantId:

```sql
SELECT id, email, name, tenantId FROM User WHERE email = 'your-email@example.com';
```

### Step 4: Force Session Refresh

#### Option A: Log Out and Log Back In
1. Click logout
2. Log back in
3. Try accessing the invoices page again

#### Option B: Clear Browser Data
1. Open DevTools (F12)
2. Go to Application tab
3. Clear all cookies for localhost
4. Clear Local Storage
5. Refresh the page
6. Log in again

## What the Debug Logs Will Tell Us

### If you see this:
```
Token before: { id: 'xxx', tenantId: null }
Token after: { id: 'xxx', tenantId: null }
```
**Problem**: Session update isn't being triggered or database doesn't have tenantId

### If you see this:
```
Token before: { id: 'xxx', tenantId: null }
Update dbUser: { id: 'xxx', tenantId: 'yyy' }
Token after: { id: 'xxx', tenantId: 'yyy' }
```
**Good**: The fix is working, but you need to trigger a session update

### If you see this:
```
=== getTenantId Debug ===
Session user tenantId: null
Fetching tenantId from database for user: xxx
Database user tenantId: yyy
```
**Good**: The fallback is working and fetching from database

## Quick Fixes to Try

### Fix 1: Manually Trigger Session Update
Add this to your browser console on any dashboard page:

```javascript
// This will trigger a session update
fetch('/api/auth/session', { method: 'GET' })
  .then(r => r.json())
  .then(console.log);
```

### Fix 2: Check if Onboarding Completed
Run this SQL query:

```sql
-- Check if user has a tenant
SELECT 
  u.id, 
  u.email, 
  u.tenantId,
  t.companyName,
  t.status
FROM User u
LEFT JOIN Tenant t ON t.id = u.tenantId
WHERE u.email = 'your-email@example.com';
```

If `tenantId` is NULL, you need to complete onboarding again.

### Fix 3: Manual Database Fix (if needed)
If you completed onboarding but tenantId is still NULL:

```sql
-- Find your tenant from audit log
SELECT tenantId FROM AuditLog 
WHERE userId = 'your-user-id' 
AND action = 'tenant.created'
ORDER BY createdAt DESC
LIMIT 1;

-- Update user with tenantId
UPDATE User 
SET tenantId = 'tenant-id-from-above' 
WHERE id = 'your-user-id';
```

## Expected Behavior After Fix

1. **With Fallback**: Even if session doesn't have tenantId, the middleware fetches it from database
2. **After Session Update**: The JWT callback fetches fresh data and updates the token
3. **After Login**: The session should have tenantId from the start

## Next Steps

1. **Check the debug logs** in your server console
2. **Copy the logs** and share them so we can see what's happening
3. **Try logging out and back in** to force a fresh session
4. **Check the database** to verify tenantId exists

## Files Modified

- ✅ `middleware/tenant.ts` - Added database fallback
- ✅ `lib/auth.ts` - Added comprehensive debugging

## What to Share

Please share:
1. The debug logs from server console
2. Result of the SQL query checking your user
3. Whether logging out/in fixes the issue

This will help us identify exactly where the problem is!
