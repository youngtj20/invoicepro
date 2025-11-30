# InvoicePro - System Architecture Documentation

## Overview

InvoicePro is a multi-tenant SaaS platform built on a modern, scalable architecture using Next.js 15, TypeScript, and MySQL. This document describes the architectural decisions, patterns, and structure of the application.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS 3.4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Lucide React icons, Custom components
- **PDF Generation**: @react-pdf/renderer, jsPDF, html2canvas

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes (App Router)
- **Database**: MySQL 8+
- **ORM**: Prisma 6
- **Authentication**: NextAuth.js 4

### External Services
- **Payments**: Paystack
- **Email**: Nodemailer (SendGrid/Mailgun)
- **SMS**: Termii API
- **WhatsApp**: wa.me links + optional Business API

## Architectural Patterns

### 1. Multi-Tenancy Model

**Pattern**: Row-Level Multi-Tenancy with Shared Database

```
┌─────────────────────────────────────────┐
│         Shared Application Layer         │
├─────────────────────────────────────────┤
│         Shared Database (MySQL)          │
│                                          │
│  ┌────────────┐  ┌────────────┐        │
│  │ Tenant A   │  │ Tenant B   │        │
│  │ Data       │  │ Data       │        │
│  └────────────┘  └────────────┘        │
└─────────────────────────────────────────┘
```

**Key Features**:
- Single database instance
- `tenantId` column on all tenant-scoped tables
- Automatic tenant filtering via middleware
- Complete data isolation between tenants
- Cost-effective for scaling

**Implementation**:
```typescript
// middleware/tenant.ts
export async function requireTenant() {
  const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId;

  if (!tenantId) {
    throw new Error('Tenant not found');
  }

  return await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscription: { include: { plan: true } } }
  });
}
```

### 2. Subscription & Feature Management

**Pattern**: Feature Flag-based Access Control

```
Plan → Feature Flags → Runtime Checks
```

Each plan defines feature availability:
- `maxInvoices`: Resource limits
- `canUsePremiumTemplates`: Feature access
- `canUseReporting`: Advanced features

**Implementation**:
```typescript
export async function checkSubscriptionFeature(
  feature: string,
  tenant?: Tenant
): Promise<boolean> {
  // Check trial status
  // Check subscription status
  // Check plan features
  // Return boolean
}
```

### 3. Authentication Flow

**Pattern**: Session-based with JWT tokens

```
User → NextAuth.js → JWT Session → Protected Routes
```

**Providers**:
1. Credentials (Email/Password)
2. OAuth (Google)

**Session Structure**:
```typescript
{
  user: {
    id: string;
    email: string;
    role: 'SUPER_ADMIN' | 'TENANT_USER';
    tenantId: string | null;
  }
}
```

### 4. Invoice Lifecycle

```
Draft → Sent → Viewed → Paid/Overdue
```

**States**:
- **DRAFT**: Being edited
- **SENT**: Delivered to customer
- **VIEWED**: Customer opened
- **OVERDUE**: Past due date, unpaid
- **CANCELED**: Voided

**Payment States**:
- **UNPAID**: No payment received
- **PARTIALLY_PAID**: Some payment
- **PAID**: Fully paid

## Database Schema Design

### Core Principles

1. **Normalized Structure**: Minimize redundancy
2. **Indexed Foreign Keys**: Fast lookups
3. **Soft Deletes**: Audit trail preservation
4. **JSON for Flexible Data**: Template configs, metadata

### Key Relationships

```
Tenant (1) ──── (N) User
  │
  ├─── (1) Subscription ──── (1) Plan
  │
  ├─── (N) Customer
  │
  ├─── (N) Item
  │
  ├─── (N) Tax
  │
  └─── (N) Invoice
         ├─── (N) InvoiceItem
         ├─── (N) Payment
         └─── (N) AuditLog
```

### Indexes Strategy

```prisma
@@index([tenantId])          // Tenant isolation
@@index([status])            // Status filtering
@@index([createdAt])         // Time-based queries
@@index([email])             // User lookups
@@unique([tenantId, invoiceNumber])  // Business rules
```

## API Architecture

### Route Structure

```
/api
├── /auth
│   └── /[...nextauth]      # Authentication
├── /invoices
│   ├── /                   # List, Create
│   ├── /[id]              # Get, Update, Delete
│   ├── /[id]/send         # Send invoice
│   └── /[id]/pdf          # Generate PDF
├── /customers              # Customer CRUD
├── /items                  # Item CRUD
├── /taxes                  # Tax CRUD
├── /subscriptions          # Subscription management
├── /webhooks
│   └── /paystack          # Payment webhooks
└── /admin
    ├── /tenants           # Tenant management
    ├── /plans             # Plan management
    └── /templates         # Template management
```

### API Response Format

```typescript
// Success
{
  success: true,
  data: { ... },
  message?: string
}

// Error
{
  success: false,
  error: string,
  code?: string
}
```

### Middleware Stack

```
Request
  → CORS Headers
  → Authentication Check
  → Tenant Resolution
  → Feature Check
  → Rate Limiting (future)
  → Handler
  → Response
```

## Security Architecture

### 1. Data Isolation

**Tenant Isolation**:
- All queries automatically filtered by `tenantId`
- Middleware enforces tenant context
- No cross-tenant data access possible

**Role-Based Access**:
```typescript
if (user.role === 'SUPER_ADMIN') {
  // Access all tenants
} else if (user.role === 'TENANT_USER') {
  // Access only own tenant
}
```

### 2. Authentication Security

- Password hashing: bcrypt (10 rounds)
- Session tokens: JWT with rotation
- OAuth state validation
- CSRF protection via NextAuth

### 3. Input Validation

```typescript
import { z } from 'zod';

const createInvoiceSchema = z.object({
  customerId: z.string().cuid(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })),
  // ... more fields
});
```

### 4. SQL Injection Prevention

- Prisma ORM parameterized queries
- No raw SQL execution
- Input sanitization

## Payment Integration

### Paystack Flow

```
1. User clicks "Pay Invoice"
   ↓
2. Backend creates Paystack transaction
   ↓
3. User redirected to Paystack
   ↓
4. User completes payment
   ↓
5. Paystack sends webhook
   ↓
6. Backend verifies payment
   ↓
7. Invoice status updated to PAID
   ↓
8. Receipt generated automatically
```

### Webhook Security

```typescript
import crypto from 'crypto';

const hash = crypto
  .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (hash === req.headers['x-paystack-signature']) {
  // Process webhook
}
```

## Communication Architecture

### Email Delivery

```
Invoice → Email Service → HTML Template → SMTP → Customer
```

**Features**:
- HTML email templates
- PDF attachments
- Delivery tracking
- Bounce handling

### SMS Delivery

```
Invoice → SMS Service (Termii) → Customer Phone
```

**Message Format**:
```
Hi {customer}, you have a new invoice #{number}
for {amount} from {company}. View: {link}
```

### WhatsApp Delivery

**Basic Mode**:
```typescript
const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
// User clicks link → WhatsApp opens → User sends manually
```

**Advanced Mode**:
```typescript
await whatsappAPI.send({
  to: phone,
  message: message
});
// Automatic sending via Business API
```

## File Storage Architecture

### PDF Generation

**Flow**:
```
Invoice Data → Template → HTML → PDF → Storage/Download
```

**Libraries**:
1. **@react-pdf/renderer**: React-based PDFs
2. **jsPDF + html2canvas**: HTML to PDF conversion

### Storage Strategy

**Development**:
- Temporary in-memory storage
- On-demand generation

**Production** (Recommended):
- S3/Cloudinary for permanent storage
- Signed URLs for secure access
- CDN for fast delivery

## Scalability Considerations

### Database

**Current**: Single MySQL instance

**Future Scaling**:
1. Read replicas for reporting
2. Connection pooling (PgBouncer-equivalent)
3. Database sharding by tenant
4. Migration to distributed database

### Application

**Current**: Monolithic Next.js app

**Future Scaling**:
1. Horizontal scaling (multiple instances)
2. Load balancer (Nginx/AWS ELB)
3. Redis for session storage
4. Queue system for background jobs

### Caching Strategy

```
Browser Cache
  ↓
CDN Cache (static assets)
  ↓
Application Cache (React Query)
  ↓
Database Query Cache (Prisma)
  ↓
Database
```

## Monitoring & Observability

### Logging

**Levels**:
- ERROR: Failures, exceptions
- WARN: Degraded performance
- INFO: Business events
- DEBUG: Development details

**Audit Logging**:
```typescript
await prisma.auditLog.create({
  data: {
    tenantId,
    userId,
    action: 'invoice.created',
    entityType: 'Invoice',
    entityId: invoice.id,
    metadata: { ... },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  }
});
```

### Metrics (Future)

- Request latency
- Error rates
- Database query performance
- Payment success rates
- User engagement

## Deployment Architecture

### Development

```
Local Machine
  → MySQL (localhost)
  → Next.js Dev Server
  → Hot Reload
```

### Production

```
                    ┌─────────────┐
                    │   Vercel    │
                    │  (Next.js)  │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │ MySQL   │      │  Paystack   │    │  SendGrid │
   │(Railway)│      │     API     │    │    SMTP   │
   └─────────┘      └─────────────┘    └───────────┘
```

### Environment Isolation

- **Development**: `.env.local`
- **Staging**: `.env.staging`
- **Production**: `.env.production`

## Future Enhancements

### Phase 2
- Mobile apps (React Native)
- Recurring invoices
- Inventory management
- Multi-currency support
- Team collaboration

### Phase 3
- AI-powered insights
- Automated reminders
- Payment plans
- Client portal
- Accounting integrations (QuickBooks, Xero)

## Performance Optimization

### Database
- Indexed all foreign keys
- Composite indexes for common queries
- Connection pooling
- Query optimization via Prisma

### Frontend
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Lazy loading
- Memoization where needed

### API
- Pagination on list endpoints
- Field selection (GraphQL-style)
- Response caching
- Compression (gzip)

## Testing Strategy (Recommended)

```
Unit Tests (Jest)
  ↓
Integration Tests (Playwright)
  ↓
E2E Tests (Playwright)
  ↓
Load Tests (k6)
```

## Conclusion

InvoicePro is built on a solid, scalable foundation that can grow from a small startup to serving thousands of businesses. The architecture prioritizes:

1. **Security**: Multi-tenant isolation, encryption
2. **Scalability**: Horizontal scaling capability
3. **Maintainability**: Clean code, TypeScript
4. **Performance**: Optimized queries, caching
5. **Reliability**: Error handling, audit logs

---

For implementation details, see the code in respective directories.
