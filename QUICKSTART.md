# InvoicePro - Quick Start Guide

Get InvoicePro up and running in 10 minutes.

## Prerequisites Checklist

- ✅ Node.js 18+ installed
- ✅ MySQL 8+ running
- ✅ Paystack account created
- ✅ Email service account (SendGrid/Mailgun)

## Quick Setup (5 Steps)

### 1. Install Dependencies (2 minutes)

```bash
cd invoice-saas
npm install
```

### 2. Configure Database (1 minute)

Create database:
```sql
CREATE DATABASE invoice_saas;
```

Copy and edit `.env`:
```bash
copy .env.example .env
```

Update in `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/invoice_saas"
```

### 3. Generate Secret (30 seconds)

Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

Add to `.env`:
```env
NEXTAUTH_SECRET="your-generated-secret"
```

### 4. Setup Paystack (2 minutes)

1. Get test keys from https://dashboard.paystack.com
2. Add to `.env`:

```env
PAYSTACK_PUBLIC_KEY="pk_test_xxxxxx"
PAYSTACK_SECRET_KEY="sk_test_xxxxxx"
```

### 5. Initialize Database (1 minute)

```bash
npm run db:migrate
npm run db:seed
```

## Run Application

```bash
npm run dev
```

Visit: **http://localhost:3000**

## Default Login

- **Email**: admin@invoicepro.com
- **Password**: admin123

**⚠️ Change this password immediately!**

## Test the Application

### 1. Create a Tenant Account

1. Go to http://localhost:3000
2. Click "Start Free Trial"
3. Sign up with your email
4. Complete company profile

### 2. Create an Invoice

1. Go to Dashboard
2. Click "Customers" → Add a customer
3. Click "Items" → Add a product/service
4. Click "Invoices" → "Create Invoice"
5. Fill in details and save

### 3. Send Invoice (Optional)

Configure email in `.env` first:
```env
EMAIL_FROM="test@yourdomain.com"
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="SG.xxxxx"
```

Then send invoice via email/WhatsApp/SMS.

## What's Working Out of the Box

✅ Authentication (Email/Password + Google OAuth)
✅ Multi-tenant isolation
✅ Subscription management (Free + Pro plans)
✅ 7-day trial period
✅ Invoice CRUD operations
✅ Customer management
✅ Item/service catalog
✅ Tax configuration
✅ 10 beautiful invoice templates
✅ Paystack payment integration
✅ Admin dashboard
✅ Audit logging
✅ Mobile-responsive UI

## What Needs Configuration

🔧 Email delivery (requires SMTP setup)
🔧 SMS delivery (requires Termii account)
🔧 WhatsApp delivery (uses wa.me by default)
🔧 Google OAuth (optional)
🔧 Production domain and SSL

## Common Issues

### Can't connect to database

```bash
# Check MySQL is running (Windows)
net start MySQL80

# Test connection
mysql -u root -p
```

### Prisma errors

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port 3000 already in use

```bash
# Kill the process or use different port
npm run dev -- -p 3001
```

## Next Steps

1. ✅ Complete company profile
2. ✅ Add customers
3. ✅ Create items/services
4. ✅ Design your first invoice
5. ✅ Configure email/SMS
6. ✅ Test payment flow
7. ✅ Review admin dashboard
8. ✅ Customize templates
9. ✅ Set up production environment
10. ✅ Deploy!

## Production Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use production database
- [ ] Configure production domain
- [ ] Set up SSL certificate
- [ ] Use live Paystack keys
- [ ] Configure email service
- [ ] Set up SMS service
- [ ] Enable error monitoring
- [ ] Set up backups
- [ ] Configure firewall
- [ ] Review security settings
- [ ] Load test the application
- [ ] Set up CDN for assets

## Getting Help

- 📖 Read [README.md](README.md) for full documentation
- 🛠️ Check [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed setup
- 🏗️ Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- 💬 Check error logs in terminal
- 🔍 Use browser DevTools for debugging

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:studio        # Open Prisma Studio

# Linting
npm run lint             # Check code quality
```

## Quick Architecture Overview

```
Next.js App
    ↓
NextAuth.js (Authentication)
    ↓
Prisma ORM
    ↓
MySQL Database
    ↓
Multi-Tenant Data Isolation
```

**External Services:**
- Paystack → Payments
- SendGrid/Mailgun → Emails
- Termii → SMS
- WhatsApp → Messaging

## File Structure Overview

```
invoice-saas/
├── app/              # Next.js pages & API routes
├── components/       # React components
├── lib/              # Utilities (auth, payment, email, etc.)
├── prisma/           # Database schema & migrations
├── middleware/       # Tenant isolation logic
└── public/           # Static assets
```

## Development Tips

1. **Use Prisma Studio** to view/edit database:
   ```bash
   npm run db:studio
   ```

2. **Check logs** in terminal for errors

3. **Use DevTools** to debug frontend

4. **Test with Paystack test cards**:
   - Success: 4084 0840 8408 4081
   - Failed: 4084 0000 0000 0408

5. **Hot reload** works automatically in dev mode

## Support

For detailed documentation on specific features, see:
- [README.md](README.md) - Main documentation
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Detailed setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

**You're all set!** Start building your invoicing business. 🚀
