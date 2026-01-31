-- Tenant Session Diagnostic and Fix Script
-- Run this in your MySQL database to diagnose and fix tenant session issues

-- ============================================
-- DIAGNOSTIC QUERIES
-- ============================================

-- 1. Check users without tenantId
SELECT 
    id,
    email,
    name,
    tenantId,
    role,
    createdAt
FROM User
WHERE tenantId IS NULL
ORDER BY createdAt DESC;

-- 2. Check tenants without users
SELECT 
    t.id,
    t.companyName,
    t.slug,
    t.status,
    COUNT(u.id) as userCount
FROM Tenant t
LEFT JOIN User u ON u.tenantId = t.id
GROUP BY t.id
HAVING userCount = 0;

-- 3. Check users with invalid tenantId (tenant doesn't exist)
SELECT 
    u.id,
    u.email,
    u.tenantId,
    t.id as actualTenantId
FROM User u
LEFT JOIN Tenant t ON t.id = u.tenantId
WHERE u.tenantId IS NOT NULL AND t.id IS NULL;

-- 4. Check subscription status for all tenants
SELECT 
    t.id,
    t.companyName,
    t.status as tenantStatus,
    s.status as subscriptionStatus,
    s.trialEndsAt,
    s.currentPeriodEnd,
    p.name as planName
FROM Tenant t
LEFT JOIN Subscription s ON s.tenantId = t.id
LEFT JOIN Plan p ON p.id = s.planId
ORDER BY t.createdAt DESC;

-- 5. Check for orphaned sessions (if using database sessions)
SELECT 
    s.id,
    s.userId,
    s.expires,
    u.email,
    u.tenantId
FROM Session s
LEFT JOIN User u ON u.id = s.userId
WHERE s.expires > NOW()
ORDER BY s.expires DESC;

-- ============================================
-- FIX QUERIES (Use with caution!)
-- ============================================

-- Fix 1: Link users to their tenant if they created one but aren't linked
-- This finds tenants created by a user (via audit log) and links them
UPDATE User u
INNER JOIN (
    SELECT DISTINCT
        al.userId,
        al.tenantId
    FROM AuditLog al
    WHERE al.action = 'tenant.created'
    AND al.userId IS NOT NULL
    AND al.tenantId IS NOT NULL
) al ON al.userId = u.id
SET u.tenantId = al.tenantId
WHERE u.tenantId IS NULL;

-- Fix 2: Clear expired sessions (if using database sessions)
-- DELETE FROM Session WHERE expires < NOW();

-- Fix 3: Verify all active tenants have subscriptions
SELECT 
    t.id,
    t.companyName,
    t.status,
    s.id as subscriptionId
FROM Tenant t
LEFT JOIN Subscription s ON s.tenantId = t.id
WHERE t.status = 'ACTIVE' AND s.id IS NULL;

-- If you find tenants without subscriptions, you may need to create them manually
-- or run the seed script to ensure plans exist, then create subscriptions

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all users have valid tenant relationships
SELECT 
    COUNT(*) as totalUsers,
    SUM(CASE WHEN tenantId IS NULL THEN 1 ELSE 0 END) as usersWithoutTenant,
    SUM(CASE WHEN tenantId IS NOT NULL THEN 1 ELSE 0 END) as usersWithTenant
FROM User;

-- Verify all tenants have active subscriptions
SELECT 
    COUNT(*) as totalTenants,
    SUM(CASE WHEN s.id IS NULL THEN 1 ELSE 0 END) as tenantsWithoutSubscription,
    SUM(CASE WHEN s.id IS NOT NULL THEN 1 ELSE 0 END) as tenantsWithSubscription
FROM Tenant t
LEFT JOIN Subscription s ON s.tenantId = t.id
WHERE t.status = 'ACTIVE';

-- ============================================
-- EXAMPLE: Manual Tenant Creation for User
-- ============================================

-- If you need to manually create a tenant for a user:
/*
START TRANSACTION;

-- Get the Pro plan ID
SET @proPlanId = (SELECT id FROM Plan WHERE slug = 'pro' LIMIT 1);
SET @userId = 'user-id-here';
SET @companyName = 'Company Name';
SET @slug = 'company-slug';

-- Create tenant
INSERT INTO Tenant (id, companyName, slug, status, createdAt, updatedAt)
VALUES (UUID(), @companyName, @slug, 'ACTIVE', NOW(), NOW());

SET @tenantId = LAST_INSERT_ID();

-- Create subscription
INSERT INTO Subscription (
    id, tenantId, planId, status, 
    trialEndsAt, currentPeriodStart, currentPeriodEnd,
    createdAt, updatedAt
)
VALUES (
    UUID(), @tenantId, @proPlanId, 'TRIALING',
    DATE_ADD(NOW(), INTERVAL 7 DAY), NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY),
    NOW(), NOW()
);

-- Link user to tenant
UPDATE User SET tenantId = @tenantId WHERE id = @userId;

-- Create audit log
INSERT INTO AuditLog (
    id, tenantId, userId, action, entityType, entityId,
    metadata, createdAt
)
VALUES (
    UUID(), @tenantId, @userId, 'tenant.created', 'Tenant', @tenantId,
    JSON_OBJECT('companyName', @companyName, 'trialDays', 7),
    NOW()
);

COMMIT;
*/

-- ============================================
-- CLEANUP QUERIES (Use with extreme caution!)
-- ============================================

-- Remove test/demo data (only if you're sure!)
-- DELETE FROM User WHERE email LIKE '%test%' OR email LIKE '%demo%';
-- DELETE FROM Tenant WHERE companyName LIKE '%Test%' OR companyName LIKE '%Demo%';
