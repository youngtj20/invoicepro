# 🚨 IMMEDIATE ACTION REQUIRED - Tenant Session Debug

## What I Just Created

### 1. Debug Page
**URL**: http://localhost:3001/debug-session

This page will show you:
- ✅ Current session data
- ✅ Database user data
- ✅ Comparison between session and database
- ✅ Actions to fix the issue

### 2. Enhanced Debugging
Added console logs to track exactly what's happening with your session.

### 3. Database Fallback
The middleware now fetches tenantId from database if it's not in the session.

## STEP-BY-STEP FIX

### Step 1: Open the Debug Page
Navigate to: **http://localhost:3001/debug-session**

### Step 2: Check What You See

#### Scenario A: Session tenantId is NULL, Database tenantId EXISTS
**This means**: Session is out of sync with database

**Fix**:
1. Click "Update Session" button on the debug page
2. Wait 2 seconds
3. Refresh the page
4. Check if session tenantId is now populated
5. Try accessing /dashboard/invoices again

#### Scenario B: Both Session and Database tenantId are NULL
**This means**: You haven't completed onboarding

**Fix**:
1. Go to http://localhost:3001/onboarding
2. Complete the onboarding form
3. After submission, you'll be redirected to dashboard
4. Go back to debug page to verify

#### Scenario C: Session tenantId EXISTS and matches Database
**This means**: Everything is in sync, but API calls are still failing

**Fix**: This is a different issue. Check server console logs.

### Step 3: Watch Server Console
Look at your terminal where `npm run dev` is running. You should see:

```
=== JWT Callback Debug ===
=== getTenantId Debug ===
```

These logs will tell us exactly what's happening.

### Step 4: Try the Fallback
Even if session doesn't have tenantId, the middleware now fetches it from database.

Try accessing: http://localhost:3001/dashboard/invoices

Check the server console for:
```
=== getTenantId Debug ===
Session user tenantId: null
Fetching tenantId from database for user: xxx
Database user tenantId: yyy
```

If you see this, the fallback is working!

## Quick Fixes

### Fix 1: Force Session Update (Recommended)
```javascript
// Open browser console on any page and run:
fetch('/api/auth/session', { 
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log);

// Then manually trigger update
window.location.reload();
```

### Fix 2: Clear Everything and Start Fresh
1. Open DevTools (F12)
2. Application tab → Clear all cookies
3. Clear Local Storage
4. Close browser completely
5. Reopen and go to http://localhost:3001
6. Log in again

### Fix 3: Database Check
Open your MySQL client and run:

```sql
-- Check your user
SELECT id, email, name, tenantId 
FROM User 
WHERE email = 'your-email@example.com';

-- If tenantId is NULL, find your tenant
SELECT t.id, t.companyName, al.userId
FROM Tenant t
INNER JOIN AuditLog al ON al.tenantId = t.id
WHERE al.action = 'tenant.created'
AND al.userId = 'your-user-id';

-- Link them if needed
UPDATE User 
SET tenantId = 'tenant-id-from-above'
WHERE id = 'your-user-id';
```

## What Each File Does

### `app/debug-session/page.tsx`
- Shows session vs database comparison
- Provides buttons to update session
- Visual indicators of what's wrong

### `app/api/user/me/route.ts`
- Fetches current user from database
- Returns user with tenant info
- Used by debug page

### `middleware/tenant.ts` (Modified)
- Added database fallback
- Added debug logging
- Now works even if session is missing tenantId

### `lib/auth.ts` (Modified)
- Added debug logging to JWT callback
- Shows when session updates are triggered
- Logs database queries

## Expected Debug Output

### When You Visit Debug Page:
```
=== getTenantId Debug ===
Session exists: true
Session user: { id: 'xxx', email: 'user@example.com', ... }
Session user tenantId: null
Fetching tenantId from database for user: xxx
Database user tenantId: yyy
```

### When You Click "Update Session":
```
=== JWT Callback Debug ===
Trigger: update
Token before: { id: 'xxx', tenantId: null }
Session update triggered, fetching from database
Update dbUser: { id: 'xxx', tenantId: 'yyy' }
Token after: { id: 'xxx', tenantId: 'yyy' }
=== End JWT Callback ===
```

## Success Indicators

✅ Debug page shows matching tenantIds  
✅ Server console shows tenantId being fetched  
✅ /dashboard/invoices loads without errors  
✅ No 500 errors in browser console  

## If Nothing Works

### Nuclear Option: Reset Your Session
1. Delete all cookies for localhost
2. Run this SQL:
```sql
DELETE FROM Session WHERE userId = 'your-user-id';
```
3. Close browser completely
4. Restart dev server
5. Log in fresh

## What to Report Back

Please share:
1. **Screenshot of debug page** showing the comparison
2. **Server console logs** (copy the JWT Callback Debug output)
3. **Result of SQL query**: `SELECT id, email, tenantId FROM User WHERE email = 'your-email';`
4. **What happens** when you click "Update Session"

## Files Created/Modified

- ✅ `app/debug-session/page.tsx` - NEW debug interface
- ✅ `app/api/user/me/route.ts` - NEW API endpoint
- ✅ `middleware/tenant.ts` - MODIFIED with fallback
- ✅ `lib/auth.ts` - MODIFIED with debugging

## Next Steps

1. **Go to debug page**: http://localhost:3001/debug-session
2. **Take a screenshot** of what you see
3. **Check server console** for debug logs
4. **Try the fixes** based on what you see
5. **Report back** with the results

---

**The debug page is your best friend right now!** It will show you exactly what's wrong and provide buttons to fix it.

🔗 **Start here**: http://localhost:3001/debug-session
