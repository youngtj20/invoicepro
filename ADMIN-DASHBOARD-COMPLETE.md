# Admin Dashboard - Complete Implementation

## Overview

The admin dashboard provides super administrators with comprehensive tools to manage the entire SaaS platform, including tenants, subscription plans, and system-wide metrics.

## Features Implemented

### 1. Admin Authentication & Authorization

**Middleware: `middleware/admin.ts`**
- Role-based access control (RBAC)
- `requireAdmin()` - Server-side function to enforce SUPER_ADMIN access
- `isAdmin()` - Helper function to check admin status
- Automatic redirection for unauthorized access

```typescript
// Usage in API routes
import { requireAdmin } from '@/middleware/admin';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(); // Throws error if not admin
  // ... admin-only logic
}
```

### 2. Admin Layout & Navigation

**Layout: `app/admin/layout.tsx`**
- Server-side authentication check
- Role verification before rendering admin pages
- Automatic redirect to `/dashboard` for non-admin users
- Container layout with navigation

**Navigation: `components/admin/AdminNav.tsx`**
- Top navigation bar with admin branding
- Quick access to:
  - Dashboard (`/admin`)
  - Tenants (`/admin/tenants`)
  - Plans (`/admin/plans`)
- "Back to Dashboard" link for regular dashboard access
- Sign out functionality

### 3. Admin Dashboard (`app/admin/page.tsx`)

**Comprehensive Metrics Display:**

#### Overview Cards
- **Total Tenants**: Active vs total count
- **Total Users**: Across all tenants
- **Total Invoices**: With 7-day growth indicator
- **Total Revenue**: From paid invoices

#### Subscription Revenue
- **Monthly Recurring Revenue (MRR)**: Calculated from active subscriptions
- **Revenue by Plan**: Breakdown of revenue per subscription plan
- Automatic MRR calculation (yearly plans divided by 12)

#### Subscription Status
- Active subscriptions count
- Trialing subscriptions count
- Canceled subscriptions count
- Past due subscriptions count (if any)

#### Growth Metrics
- New tenants in last 7 days (with progress bar)
- New invoices in last 7 days (with progress bar)
- Recent signups tracking

#### Payment Statistics
- Total payments processed
- Successful payments count
- Failed payments count
- Pending payments count
- **Success Rate** percentage with visual progress bar

#### Plan Distribution
- Grid view of all plans
- Active subscription count per plan
- Total subscriptions per plan

**API Endpoint: `GET /api/admin/metrics`**
```typescript
{
  overview: {
    totalTenants, activeTenants, suspendedTenants, deletedTenants,
    totalUsers, totalInvoices, totalCustomers, totalRevenue
  },
  subscriptions: {
    active, trialing, canceled, pastDue,
    byPlan: [{ planName, count }]
  },
  revenue: {
    mrr, totalRevenue,
    byPlan: [{ planName, revenue }]
  },
  growth: {
    recentSignups, newTenantsLast7Days, newInvoicesLast7Days
  },
  payments: {
    total, successful, failed, pending, successRate
  }
}
```

### 4. Tenant Management

#### Tenant List (`app/admin/tenants/page.tsx`)

**Features:**
- Paginated tenant list (20 per page)
- Search by company name
- Filter by status (ACTIVE, SUSPENDED, DELETED)
- Table view with:
  - Company name and email
  - Current subscription plan
  - Status badge (color-coded)
  - Usage stats (users, invoices, customers)
  - Creation date
- **Actions per tenant:**
  - View details (eye icon)
  - Suspend/Activate (toggle)
  - Delete tenant

**API Endpoint: `GET /api/admin/tenants`**
```typescript
// Query parameters
?page=1&limit=20&search=company&status=ACTIVE

// Response
{
  tenants: Tenant[],
  pagination: { page, limit, total, totalPages }
}
```

#### Tenant Detail Page (`app/admin/tenants/[id]/page.tsx`)

**Comprehensive Tenant View:**

**Stats Cards:**
- Total revenue from tenant
- Total invoices (paid count)
- Total customers
- Total receipts

**Company Information:**
- Company name, email, phone
- Full address details
- Member since date
- Current status with badge

**Subscription Details:**
- Current plan name
- Plan price and billing period
- Subscription status
- Current period start and end dates

**Users Table:**
- List of all users in the tenant
- User name, email, role
- Join date for each user

**Actions:**
- Suspend tenant (if active)
- Activate tenant (if suspended)
- Delete tenant (with confirmation)

**API Endpoints:**

`GET /api/admin/tenants/[id]`
```typescript
{
  ...tenant,
  subscription: { plan, status, periods },
  users: [...],
  _count: { invoices, customers, items, receipts, payments },
  stats: { totalRevenue, paidInvoices, draftInvoices }
}
```

`PATCH /api/admin/tenants/[id]`
```typescript
// Request body
{ status: 'ACTIVE' | 'SUSPENDED' }

// Creates audit log entry
```

`DELETE /api/admin/tenants/[id]`
```typescript
// Deletes tenant with cascade
// Creates audit log entry
```

### 5. Plan Management

#### Plans List (`app/admin/plans/page.tsx`)

**Features:**
- Grid view of all subscription plans
- Plan cards showing:
  - Plan name and description
  - Price and billing period
  - Trial days (if applicable)
  - Resource limits (invoices, customers, items, users)
  - Feature checklist with checkmarks
  - Active vs total subscriptions count
- **Create Plan** button
- **Edit** and **Delete** actions per plan

**Modal Form for Create/Edit:**
- Plan name (required)
- Description (optional)
- Price (required)
- Billing period (Monthly/Yearly)
- Trial days (default: 14)
- **Resource Limits:**
  - Max invoices (-1 for unlimited)
  - Max customers (-1 for unlimited)
  - Max items (-1 for unlimited)
  - Max users (-1 for unlimited)
- **Feature Toggles:**
  - Custom Branding
  - Advanced Reporting
  - API Access
  - Priority Support
  - Multi-Currency
  - Recurring Invoices
  - SMS Notifications
  - WhatsApp Notifications
  - Premium Templates

**API Endpoints:**

`GET /api/admin/plans`
```typescript
{
  plans: [
    {
      ...plan,
      activeSubscriptions: number,
      totalSubscriptions: number
    }
  ]
}
```

`POST /api/admin/plans`
```typescript
// Request body
{
  name, description, price, billingPeriod, trialDays,
  maxInvoices, maxCustomers, maxItems, maxUsers,
  features: { customBranding, advancedReporting, ... }
}

// Validates unique plan name
// Creates audit log entry
```

`PATCH /api/admin/plans/[id]`
```typescript
// All fields optional
// Validates name uniqueness if changed
// Creates audit log entry
```

`DELETE /api/admin/plans/[id]`
```typescript
// Prevents deletion if active subscriptions exist
// Returns error with active subscription count
// Creates audit log entry
```

## Security Features

### Authentication
- Server-side session validation
- Role-based access control
- Automatic redirection for unauthorized users

### Authorization
- All admin routes protected by `requireAdmin()` middleware
- API endpoints verify SUPER_ADMIN role
- Tenant users cannot access admin functionality

### Audit Logging
All admin actions are logged in the `auditLog` table:
- Tenant status changes (suspend/activate)
- Tenant deletion
- Plan creation, updates, deletion
- Includes admin user ID, action type, entity details, and metadata

## Usage Limits Integration

The admin dashboard integrates with the subscription service (`lib/subscription.ts`) for:

### Resource Limits Enforcement
- Invoices: Checked against plan's `maxInvoices`
- Customers: Checked against plan's `maxCustomers`
- Items: Checked against plan's `maxItems`
- Users: Checked against plan's `maxUsers`
- `-1` value means unlimited

### Feature Access Control
Plans control access to:
- Custom branding (logo, colors)
- Advanced reporting and analytics
- API access for integrations
- Priority customer support
- Multi-currency support
- Recurring invoice automation
- SMS notifications via Termii
- WhatsApp messaging
- Premium invoice templates

## Access Control

### Super Admin Access
To grant super admin access to a user, update their role in the database:

```sql
UPDATE User SET role = 'SUPER_ADMIN' WHERE email = 'admin@example.com';
```

Or via Prisma:
```typescript
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { role: 'SUPER_ADMIN' }
});
```

### Role Types
- `SUPER_ADMIN`: Full access to admin dashboard and all features
- `TENANT_USER`: Regular user with access to their tenant's dashboard only

## Navigation Flow

### For Super Admins:
1. Sign in with SUPER_ADMIN account
2. Access regular dashboard at `/dashboard`
3. Click "Admin Panel" or navigate to `/admin`
4. Use admin navigation for:
   - System metrics (`/admin`)
   - Tenant management (`/admin/tenants`)
   - Plan configuration (`/admin/plans`)

### For Regular Users:
- Admin routes automatically redirect to `/dashboard`
- No admin navigation visible
- API endpoints return 403 Forbidden

## Metrics Calculations

### MRR (Monthly Recurring Revenue)
```typescript
activeSubscriptions.forEach(sub => {
  if (sub.plan.billingPeriod === 'MONTHLY') {
    mrr += sub.plan.price;
  } else { // YEARLY
    mrr += sub.plan.price / 12;
  }
});
```

### Payment Success Rate
```typescript
const successRate = total > 0
  ? (successful / total) * 100
  : 0;
```

### Growth Metrics
- New tenants: `COUNT(tenants WHERE createdAt >= 7 days ago)`
- New invoices: `COUNT(invoices WHERE createdAt >= 7 days ago)`

## UI Components

### Status Badges
- **Active**: Green background, green text
- **Suspended**: Red background, red text
- **Deleted**: Gray background, gray text

### Icons (Lucide React)
- Dashboard: `LayoutDashboard`
- Tenants: `Users`, `Building2`
- Plans: `CreditCard`
- Navigation: `ArrowLeft`, `Home`, `Shield`
- Actions: `Eye`, `Edit`, `Trash2`, `Ban`, `CheckCircle`
- Stats: `DollarSign`, `FileText`, `Receipt`, `TrendingUp`

### Color Scheme
- Primary (Blue): `bg-blue-600`, `text-blue-600`
- Success (Green): `bg-green-600`, `text-green-600`
- Warning (Yellow): `bg-yellow-600`, `text-yellow-600`
- Danger (Red): `bg-red-600`, `text-red-600`
- Neutral (Gray): `bg-gray-900`, `text-gray-600`

## Testing the Admin Dashboard

### 1. Create Super Admin User
```typescript
// In your seed script or directly in database
await prisma.user.create({
  data: {
    email: 'admin@yourcompany.com',
    name: 'System Administrator',
    password: await hash('secure_password'),
    role: 'SUPER_ADMIN',
    tenantId: null, // Super admins don't belong to tenants
  }
});
```

### 2. Test Access Control
1. Sign in as regular user → Cannot access `/admin`
2. Sign in as super admin → Full access to admin panel

### 3. Test Tenant Management
1. View all tenants with search and filters
2. Suspend an active tenant → Check dashboard access blocked
3. Activate suspended tenant → Check dashboard access restored
4. View tenant details → Verify stats accuracy
5. Delete test tenant → Verify cascade deletion

### 4. Test Plan Management
1. Create new plan with features
2. Edit existing plan limits
3. Try to delete plan with active subscriptions → Should fail
4. View plan subscriber list

### 5. Test Metrics
1. Create test data (tenants, invoices, payments)
2. Verify metrics calculations
3. Check MRR calculation accuracy
4. Verify growth metrics for last 7 days

## File Structure

```
app/
├── admin/
│   ├── layout.tsx                 # Admin layout with auth check
│   ├── page.tsx                   # Dashboard with metrics
│   ├── tenants/
│   │   ├── page.tsx              # Tenant list
│   │   └── [id]/
│   │       └── page.tsx          # Tenant detail
│   └── plans/
│       └── page.tsx              # Plan management
│
├── api/
│   └── admin/
│       ├── metrics/
│       │   └── route.ts          # System metrics API
│       ├── tenants/
│       │   ├── route.ts          # Tenant list API
│       │   └── [id]/
│       │       └── route.ts      # Tenant CRUD API
│       └── plans/
│           ├── route.ts          # Plan list & create API
│           └── [id]/
│               └── route.ts      # Plan CRUD API
│
middleware/
└── admin.ts                       # Admin auth middleware

components/
└── admin/
    └── AdminNav.tsx              # Admin navigation bar
```

## Environment Variables

No additional environment variables required. The admin dashboard uses existing:
- `DATABASE_URL`: Prisma database connection
- `NEXTAUTH_URL`: For NextAuth session management
- `NEXTAUTH_SECRET`: For session encryption

## Next Steps & Enhancements

### Potential Improvements:
1. **Analytics Dashboard**
   - Revenue charts over time
   - Tenant growth graphs
   - Payment success rate trends

2. **Email Notifications**
   - Alert admins on failed payments
   - Notify on new tenant signups
   - Send reports for suspended tenants

3. **Advanced Filtering**
   - Filter tenants by plan
   - Filter by revenue range
   - Date range filters

4. **Bulk Actions**
   - Bulk suspend/activate tenants
   - Bulk plan assignments
   - Export tenant data to CSV

5. **System Settings**
   - Configure global settings
   - Email templates management
   - API rate limits configuration

## Troubleshooting

### Issue: Cannot access admin panel
- **Check**: User role is set to `SUPER_ADMIN` in database
- **Check**: User is properly authenticated with NextAuth
- **Check**: No TypeScript/build errors in admin routes

### Issue: Metrics not loading
- **Check**: Database connection is active
- **Check**: Prisma schema is up to date (`npx prisma generate`)
- **Check**: API route `/api/admin/metrics` returns 200

### Issue: Tenant suspension not working
- **Check**: Audit log table exists
- **Check**: Tenant status enum includes SUSPENDED
- **Check**: Middleware properly checks tenant status

## Conclusion

The admin dashboard is now fully functional with:
- ✅ Role-based authentication
- ✅ Comprehensive system metrics
- ✅ Tenant management (view, suspend, activate, delete)
- ✅ Plan management (create, edit, delete)
- ✅ Audit logging for all actions
- ✅ Responsive UI with Tailwind CSS
- ✅ Full API documentation
- ✅ Security best practices

All components are production-ready and follow Next.js 13+ App Router conventions.
