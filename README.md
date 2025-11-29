# InvoicePro - Multi-Tenant SaaS Invoice Management Platform

A fully-featured, multi-tenant Software-as-a-Service (SaaS) web application that allows businesses to create, manage, and send professional invoices, receipts, and proforma invoices. Built with Next.js 15, TypeScript, MySQL, and Prisma.

## Features

### Core Features
- **Multi-Tenancy**: Complete data isolation between different company accounts
- **Authentication**: Email/Password and Google OAuth support
- **7-Day Free Trial**: Automatic trial with Pro features
- **Subscription Plans**: Freemium model with Free and Pro tiers
- **Invoice Management**: Create, edit, and send invoices with beautiful templates
- **Payment Integration**: Paystack integration for invoice payments
- **Multiple Delivery Channels**: Email, SMS (Termii), and WhatsApp
- **PDF Generation**: Export invoices as PDF or images
- **Customer Management**: Comprehensive CRM for clients
- **Item/Service Library**: Reusable product and service catalog
- **Tax Management**: Flexible tax configuration
- **Audit Logging**: Complete activity tracking
- **Responsive Design**: Mobile-first, works on all devices

### Admin Features
- **Tenant Management**: View and manage all registered businesses
- **Plan Management**: Create and configure subscription plans
- **Template Management**: Upload and manage invoice templates
- **System Configuration**: Configure global settings without code deployment
- **Analytics Dashboard**: System-wide metrics and reports

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **PDF Generation**: @react-pdf/renderer, jsPDF, html2canvas
- **Payment**: Paystack
- **Email**: Nodemailer (SendGrid/Mailgun)
- **SMS**: Termii API
- **WhatsApp**: wa.me links + optional Business API

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- MySQL 8+ database server
- npm or yarn package manager
- Paystack account (for payments)
- Email service account (SendGrid, Mailgun, etc.)
- SMS provider account (Termii or Africa's Talking)

## Installation

### 1. Clone and Install Dependencies

```bash
cd invoice-saas
npm install
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE invoice_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/invoice_saas"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Paystack
PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxx"
PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"

# Email Configuration
EMAIL_FROM="noreply@yourdomain.com"
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"

# SMS Configuration
SMS_PROVIDER="termii"
TERMII_API_KEY="your-termii-api-key"
TERMII_SENDER_ID="YourBrand"

# WhatsApp (Optional)
WHATSAPP_API_ENABLED="false"
WHATSAPP_API_URL=""
WHATSAPP_API_TOKEN=""

# Application
APP_URL="http://localhost:3000"
APP_NAME="InvoicePro"
DEFAULT_TRIAL_DAYS="7"
```

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `NEXTAUTH_SECRET` in your `.env` file.

### 5. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 6. Seed Initial Data

Create a seed file to populate initial plans and templates:

```bash
npx prisma db seed
```

### 7. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
invoice-saas/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── invoices/             # Invoice CRUD
│   │   ├── customers/            # Customer CRUD
│   │   ├── items/                # Item CRUD
│   │   ├── taxes/                # Tax CRUD
│   │   ├── webhooks/             # Paystack webhooks
│   │   └── admin/                # Admin endpoints
│   ├── auth/                     # Auth pages
│   ├── dashboard/                # Tenant dashboard
│   ├── admin/                    # Admin dashboard
│   ├── onboarding/               # New user setup
│   ├── invoices/                 # Invoice management
│   ├── customers/                # Customer management
│   ├── settings/                 # Account settings
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── forms/                    # Form components
│   ├── invoices/                 # Invoice-specific
│   ├── templates/                # Invoice templates
│   └── providers.tsx             # Context providers
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # NextAuth config
│   ├── paystack.ts               # Paystack integration
│   ├── email.ts                  # Email service
│   ├── sms.ts                    # SMS service
│   └── whatsapp.ts               # WhatsApp service
├── middleware/                   # Custom middleware
│   └── tenant.ts                 # Multi-tenancy logic
├── prisma/                       # Database schema
│   ├── schema.prisma             # Prisma schema
│   └── migrations/               # Migration files
├── types/                        # TypeScript types
│   └── next-auth.d.ts            # NextAuth types
├── utils/                        # Helper functions
│   └── cn.ts                     # Class name merger
└── public/                       # Static assets
```

## Database Schema

The application uses a comprehensive multi-tenant schema with the following key models:

### Core Models
- **Tenant**: Company/business account
- **User**: System users (SUPER_ADMIN or TENANT_USER)
- **Subscription**: Links tenant to a plan
- **Plan**: Subscription tiers with feature flags

### Invoice Models
- **Customer**: Client information
- **Item**: Products/services catalog
- **Tax**: Tax rates configuration
- **Invoice**: Main invoice entity
- **InvoiceItem**: Invoice line items
- **Receipt**: Payment receipts
- **ProformaInvoice**: Quotes/estimates
- **Payment**: Payment records

### System Models
- **Template**: Invoice templates
- **SystemConfig**: Global configuration
- **AuditLog**: Activity tracking

## Configuration

### Setting Up Paystack

1. Sign up at https://paystack.com
2. Get your API keys from Settings > API Keys & Webhooks
3. Add keys to `.env`:
   ```env
   PAYSTACK_PUBLIC_KEY="pk_test_xxxxx"
   PAYSTACK_SECRET_KEY="sk_test_xxxxx"
   ```
4. Configure webhook URL: `https://yourdomain.com/api/webhooks/paystack`
5. Copy webhook secret to `.env`

### Setting Up Email (SendGrid)

1. Sign up at https://sendgrid.com
2. Create an API key
3. Verify your sender domain
4. Configure in `.env`:
   ```env
   EMAIL_FROM="noreply@yourdomain.com"
   EMAIL_SERVER_HOST="smtp.sendgrid.net"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="apikey"
   EMAIL_SERVER_PASSWORD="SG.xxxxx"
   ```

### Setting Up SMS (Termii)

1. Sign up at https://termii.com
2. Get your API key
3. Create a Sender ID
4. Configure in `.env`:
   ```env
   SMS_PROVIDER="termii"
   TERMII_API_KEY="your-api-key"
   TERMII_SENDER_ID="YourBrand"
   ```

### Setting Up WhatsApp

#### Basic Method (wa.me links)
No configuration needed. The system automatically generates WhatsApp links.

#### Advanced Method (Business API)
1. Set up WhatsApp Business API through a provider
2. Get API credentials
3. Enable in `.env`:
   ```env
   WHATSAPP_API_ENABLED="true"
   WHATSAPP_API_URL="https://api.provider.com/whatsapp/send"
   WHATSAPP_API_TOKEN="your-api-token"
   ```

### Setting Up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Configure in `.env`:
   ```env
   GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="xxxxx"
   ```

## Creating the First Admin User

After setup, you need to create the first super admin user manually in the database:

```sql
INSERT INTO User (id, email, password, name, role, createdAt, updatedAt)
VALUES (
  'admin-id',
  'admin@yourdomain.com',
  '$2a$10$...',  -- Hash your password using bcrypt
  'Admin User',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

Or use Prisma Studio:

```bash
npx prisma studio
```

## Managing Subscription Plans

Plans are managed through the Admin Dashboard or directly in the database. Key plan features:

- `maxInvoices`: Maximum invoices per month (-1 = unlimited)
- `maxCustomers`: Maximum customers (-1 = unlimited)
- `maxItems`: Maximum items (-1 = unlimited)
- `canUsePremiumTemplates`: Access to premium templates
- `canCustomizeTemplates`: Template customization
- `canUseReporting`: Advanced analytics
- `canExportData`: CSV/Excel export
- `canRemoveBranding`: Remove InvoicePro branding
- `canUseWhatsApp`: WhatsApp delivery
- `canUseSMS`: SMS delivery

## Invoice Templates

The system supports 10+ professional invoice templates. Templates are stored as JSON configurations in the `Template` table with the following structure:

```json
{
  "colors": {
    "primary": "#0ea5e9",
    "secondary": "#64748b",
    "accent": "#f59e0b"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Inter"
  },
  "layout": "modern",
  "logo": {
    "position": "left",
    "size": "medium"
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `POST /api/auth/signout` - Sign out

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice
- `PATCH /api/invoices/[id]` - Update invoice
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/send` - Send invoice
- `POST /api/invoices/[id]/pdf` - Generate PDF

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `PATCH /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Items
- `GET /api/items` - List items
- `POST /api/items` - Create item
- `PATCH /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### Admin
- `GET /api/admin/tenants` - List all tenants
- `GET /api/admin/plans` - List plans
- `POST /api/admin/plans` - Create plan
- `PATCH /api/admin/plans/[id]` - Update plan

### Webhooks
- `POST /api/webhooks/paystack` - Paystack webhook handler

## Multi-Tenancy

The application implements row-level multi-tenancy:

1. Each tenant has a unique `tenantId`
2. All data models include `tenantId` foreign key
3. Middleware enforces tenant isolation on all queries
4. Users can only access their tenant's data
5. Super admins can access all tenants

## Security Features

- Password hashing with bcrypt
- JWT session tokens
- SQL injection prevention via Prisma
- CSRF protection
- Environment variable validation
- Tenant data isolation
- Role-based access control

## Deployment

### Database Migration

```bash
npx prisma migrate deploy
```

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection string
- NextAuth secret and URL
- API keys for all services
- Production domain URLs

### Recommended Hosting

- **Application**: Vercel, Railway, or DigitalOcean
- **Database**: PlanetScale, Railway, or managed MySQL
- **File Storage**: AWS S3 or Cloudinary (for logos/attachments)

## Monitoring and Logs

- Application logs: Check Next.js console output
- Database queries: Enable Prisma logging in development
- Audit logs: Stored in `AuditLog` table
- Payment events: Logged via Paystack webhooks

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL format
- Ensure database exists
- Check user permissions

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### Payment Issues
- Verify Paystack API keys
- Check webhook URL is publicly accessible
- Review Paystack dashboard for errors

### Email Delivery Issues
- Verify SMTP credentials
- Check spam folder
- Review email service logs
- Test with a simple email first

## Support and Documentation

For detailed documentation on specific features:

1. **Invoice Creation**: See `/docs/invoices.md`
2. **Template Customization**: See `/docs/templates.md`
3. **Admin Dashboard**: See `/docs/admin.md`
4. **API Reference**: See `/docs/api.md`

## License

Proprietary - All rights reserved

## Contributing

This is a private project. Please contact the administrator for contribution guidelines.

---

Built with ❤️ for Nigerian businesses
