-- Account Suspension Testing Script
-- Run these queries to test the suspension functionality

-- ============================================
-- TEST 1: Suspend a Tenant Account
-- ============================================

-- First, find a tenant to test with
SELECT id, companyName, status FROM Tenant LIMIT 5;

-- Suspend the tenant (replace 'tenant-id' with actual ID)
UPDATE Tenant 
SET status = 'SUSPENDED' 
WHERE id = 'tenant-id';

-- Verify the suspension
SELECT id, companyName, status FROM Tenant WHERE id = 'tenant-id';

-- Expected: status should be 'SUSPENDED'

-- ============================================
-- TEST 2: Check User Access
-- ============================================

-- Find users for this tenant
SELECT id, email, name, tenantId 
FROM User 
WHERE tenantId = 'tenant-id';

-- Now try to log in with this user's credentials
-- Expected: Should redirect to /account-suspended page

-- ============================================
-- TEST 3: Verify API Blocking
-- ============================================

-- The API should return 403 errors for suspended accounts
-- Test by making API calls after logging in:
-- GET /api/invoices - Should fail
-- POST /api/customers - Should fail
-- GET /api/settings - Should fail

-- ============================================
-- TEST 4: Reactivate the Account
-- ============================================

-- Reactivate the tenant
UPDATE Tenant 
SET status = 'ACTIVE' 
WHERE id = 'tenant-id';

-- Verify reactivation
SELECT id, companyName, status FROM Tenant WHERE id = 'tenant-id';

-- Expected: status should be 'ACTIVE'

-- Now try to log in again
-- Expected: Should access dashboard normally

-- ============================================
-- TEST 5: Test Account Deletion
-- ============================================

-- Mark tenant as deleted
UPDATE Tenant 
SET status = 'DELETED' 
WHERE id = 'tenant-id';

-- Verify deletion
SELECT id, companyName, status FROM Tenant WHERE id = 'tenant-id';

-- Expected: status should be 'DELETED'

-- Try to log in
-- Expected: Should redirect to /account-deleted page

-- ============================================
-- TEST 6: Audit Log Verification
-- ============================================

-- Check audit logs for status changes
SELECT 
    al.action,
    al.entityType,
    al.metadata,
    al.createdAt,
    u.email as performedBy
FROM AuditLog al
LEFT JOIN User u ON u.id = al.userId
WHERE al.tenantId = 'tenant-id'
AND al.action LIKE 'tenant.%'
ORDER BY al.createdAt DESC;

-- ============================================
-- CLEANUP: Reset to Active
-- ============================================

-- After testing, reset the tenant to active
UPDATE Tenant 
SET status = 'ACTIVE' 
WHERE id = 'tenant-id';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tenant statuses
SELECT 
    status,
    COUNT(*) as count
FROM Tenant
GROUP BY status;

-- Find all suspended tenants
SELECT 
    t.id,
    t.companyName,
    t.status,
    t.updatedAt,
    COUNT(u.id) as userCount
FROM Tenant t
LEFT JOIN User u ON u.tenantId = t.id
WHERE t.status = 'SUSPENDED'
GROUP BY t.id;

-- Find all deleted tenants
SELECT 
    t.id,
    t.companyName,
    t.status,
    t.updatedAt
FROM Tenant t
WHERE t.status = 'DELETED';

-- ============================================
-- ADMIN ACTIONS
-- ============================================

-- Suspend tenant with audit log
START TRANSACTION;

UPDATE Tenant 
SET status = 'SUSPENDED' 
WHERE id = 'tenant-id';

INSERT INTO AuditLog (id, tenantId, action, entityType, entityId, metadata, createdAt)
VALUES (
    UUID(), 
    'tenant-id', 
    'tenant.suspended', 
    'Tenant', 
    'tenant-id',
    JSON_OBJECT('reason', 'Payment failure', 'suspendedBy', 'admin'),
    NOW()
);

COMMIT;

-- Reactivate tenant with audit log
START TRANSACTION;

UPDATE Tenant 
SET status = 'ACTIVE' 
WHERE id = 'tenant-id';

INSERT INTO AuditLog (id, tenantId, action, entityType, entityId, metadata, createdAt)
VALUES (
    UUID(), 
    'tenant-id', 
    'tenant.activated', 
    'Tenant', 
    'tenant-id',
    JSON_OBJECT('reason', 'Payment received', 'activatedBy', 'admin'),
    NOW()
);

COMMIT;

-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================

/*
TEST 1 - Suspend Account:
✅ Tenant status changes to SUSPENDED
✅ User redirected to /account-suspended
✅ Cannot access dashboard

TEST 2 - API Blocking:
✅ All API calls return 403 Forbidden
✅ Error message: "Tenant account is suspended"

TEST 3 - Reactivate Account:
✅ Tenant status changes to ACTIVE
✅ User can access dashboard
✅ All features work normally

TEST 4 - Delete Account:
✅ Tenant status changes to DELETED
✅ User redirected to /account-deleted
✅ Cannot access any data

TEST 5 - Audit Logs:
✅ All status changes are logged
✅ Includes reason and timestamp
✅ Tracks who performed the action
*/
