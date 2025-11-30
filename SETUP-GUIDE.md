# InvoicePro - Complete Setup Guide

This guide will walk you through setting up the InvoicePro SaaS application from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [External Service Setup](#external-service-setup)
6. [Running the Application](#running-the-application)
7. [Creating Your First Admin](#creating-your-first-admin)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8+** - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts
- **Paystack Account** - [Sign up](https://paystack.com)
- **Email Service** (Choose one):
  - SendGrid - [Sign up](https://sendgrid.com)
  - Mailgun - [Sign up](https://mailgun.com)
- **SMS Service** (Choose one):
  - Termii - [Sign up](https://termii.com)
  - Africa's Talking - [Sign up](https://africastalking.com)
- **Google Cloud** (Optional for OAuth) - [Console](https://console.cloud.google.com)

## Installation

### Step 1: Navigate to Project Directory

```bash
cd "C:\Users\talk2\OneDrive\Desktop\invoice saas\invoice-saas"
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- Prisma ORM
- NextAuth.js
- Payment integrations
- Email/SMS libraries

## Database Setup

### Step 1: Create MySQL Database

Open MySQL command line or a GUI tool like MySQL Workbench and run:

```sql
CREATE DATABASE invoice_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Create Database User (Optional but recommended)

```sql
CREATE USER 'invoice_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON invoice_saas.* TO 'invoice_user'@'localhost';
FLUSH PRIVILEGES;
```

## Environment Configuration

### Step 1: Copy Environment Template

```bash
copy .env.example .env
```

### Step 2: Configure Database Connection

Edit `.env` and update the database URL:

```env
DATABASE_URL="mysql://invoice_user:strong_password_here@localhost:3306/invoice_saas"
```

**Format:** `mysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME`

### Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

**Or use online tool:** https://generate-secret.vercel.app/32

Copy the generated secret to `.env`:

```env
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Configure Application Settings

```env
APP_URL="http://localhost:3000"
APP_NAME="InvoicePro"
DEFAULT_TRIAL_DAYS="7"
```

## External Service Setup

### Paystack Setup (Required)

1. **Sign up at Paystack:**
   - Go to https://paystack.com
   - Create an account
   - Verify your business (for live mode)

2. **Get API Keys:**
   - Log in to Paystack Dashboard
   - Go to Settings → API Keys & Webhooks
   - Copy your Test keys (use Live keys in production)

3. **Configure in `.env`:**
   ```env
   PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxx"
   PAYSTACK_SECRET_KEY="sk_test_xxxxxxxxxxxxxxxxxxxxxx"
   ```

4. **Setup Webhook (After deployment):**
   - In Paystack Dashboard, go to Settings → API Keys & Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/paystack`
   - Copy the webhook secret
   - Add to `.env`:
     ```env
     PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"
     ```

### Email Setup (Required)

#### Option A: SendGrid

1. **Sign up at SendGrid:**
   - Go to https://sendgrid.com
   - Create a free account (100 emails/day)

2. **Create API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Select "Restricted Access"
   - Enable "Mail Send" permission
   - Copy the API key

3. **Verify Sender:**
   - Go to Settings → Sender Authentication
   - Verify a single sender email
   - Or authenticate your domain (recommended for production)

4. **Configure in `.env`:**
   ```env
   EMAIL_FROM="noreply@yourdomain.com"
   EMAIL_SERVER_HOST="smtp.sendgrid.net"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="apikey"
   EMAIL_SERVER_PASSWORD="SG.xxxxxxxxxxxxxxxxxxxxxx"
   ```

#### Option B: Mailgun

1. **Sign up at Mailgun:**
   - Go to https://mailgun.com
   - Create account

2. **Get SMTP Credentials:**
   - Go to Sending → Domain settings
   - Copy SMTP credentials

3. **Configure in `.env`:**
   ```env
   EMAIL_FROM="noreply@yourdomain.com"
   EMAIL_SERVER_HOST="smtp.mailgun.org"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="postmaster@yourdomain.mailgun.org"
   EMAIL_SERVER_PASSWORD="your-smtp-password"
   ```

### SMS Setup (Required for Pro features)

#### Option A: Termii (Recommended for Nigeria)

1. **Sign up at Termii:**
   - Go to https://termii.com
   - Create account
   - Complete verification

2. **Get API Key:**
   - Go to Settings → API Settings
   - Copy your API Key

3. **Create Sender ID:**
   - Go to Settings → Sender ID
   - Request a Sender ID (e.g., "YourBrand")
   - Wait for approval (usually 24-48 hours)

4. **Configure in `.env`:**
   ```env
   SMS_PROVIDER="termii"
   TERMII_API_KEY="your-api-key-here"
   TERMII_SENDER_ID="YourBrand"
   ```

#### Option B: Africa's Talking

1. **Sign up at Africa's Talking:**
   - Go to https://africastalking.com
   - Create account

2. **Get API Key:**
   - Go to Settings
   - Copy API Key

3. **Configure in `.env`:**
   ```env
   SMS_PROVIDER="africastalking"
   AT_API_KEY="your-api-key"
   AT_USERNAME="your-username"
   ```

### Google OAuth Setup (Optional)

1. **Go to Google Cloud Console:**
   - https://console.cloud.google.com

2. **Create New Project:**
   - Click "Select a project" → "New Project"
   - Name it "InvoicePro" and create

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
   - Click "Create"

5. **Configure in `.env`:**
   ```env
   GOOGLE_CLIENT_ID="123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
   ```

### WhatsApp Setup (Optional - Advanced)

#### Basic Mode (Default)
No configuration needed. The app will use `wa.me` links that open WhatsApp with pre-filled messages.

#### Advanced Mode (WhatsApp Business API)
1. **Choose a Provider:**
   - Termii (if they offer WhatsApp)
   - Yellow.ai
   - Twilio
   - 360Dialog

2. **Get API Credentials:**
   - Follow provider's setup instructions
   - Get API URL and token

3. **Configure in `.env`:**
   ```env
   WHATSAPP_API_ENABLED="true"
   WHATSAPP_API_URL="https://api.provider.com/whatsapp/send"
   WHATSAPP_API_TOKEN="your-api-token"
   ```

## Running the Application

### Step 1: Run Database Migrations

```bash
npm run db:migrate
```

This creates all database tables. When prompted for a migration name, enter: `init`

### Step 2: Seed Initial Data

```bash
npm run db:seed
```

This creates:
- 2 subscription plans (Free and Pro)
- 10 invoice templates
- System configuration
- Super admin user (email: admin@invoicepro.com, password: admin123)

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Creating Your First Admin

The seed script creates a default admin:
- **Email:** admin@invoicepro.com
- **Password:** admin123

### To Change Admin Password:

1. Log in with default credentials
2. Go to Settings → Account
3. Change password immediately

### To Create Additional Admins:

1. Use Prisma Studio:
   ```bash
   npm run db:studio
   ```

2. Navigate to the `User` table
3. Create new user with:
   - Email: your-email@domain.com
   - Password: (hash using bcrypt)
   - Role: SUPER_ADMIN
   - emailVerified: (current date)

## Verification Steps

### 1. Check Database Connection

```bash
npm run db:studio
```

This should open Prisma Studio at http://localhost:5555

### 2. Test Email Configuration

You can test email by trying to sign up or use the forgot password feature.

### 3. Test SMS Configuration

SMS can be tested when sending an invoice after you create a tenant account.

### 4. Test Paystack Integration

1. Create a tenant account
2. Try to upgrade to Pro plan
3. Use Paystack test cards: https://paystack.com/docs/payments/test-payments

## Production Deployment

### Environment Variables for Production

Update these in your production environment:

```env
# Update URLs
NEXTAUTH_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"

# Use live Paystack keys
PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxxxx"
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxxx"

# Production database
DATABASE_URL="mysql://user:password@production-host:3306/invoice_saas"
```

### Deployment Platforms

#### Vercel (Recommended for Next.js)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

4. Connect to a production database (PlanetScale, Railway, etc.)

#### Railway

1. Sign up at https://railway.app
2. Create new project
3. Add MySQL database
4. Deploy from GitHub
5. Add environment variables

#### DigitalOcean App Platform

1. Create new app from GitHub
2. Add MySQL managed database
3. Configure environment variables
4. Deploy

### Database for Production

**Recommended Options:**

1. **PlanetScale** (Serverless MySQL)
   - Free tier available
   - Automatic scaling
   - Branching support

2. **Railway** (Managed MySQL)
   - Simple setup
   - Good for small to medium apps

3. **AWS RDS** (Production-grade)
   - Highly reliable
   - Automatic backups

## Troubleshooting

### Database Connection Error

**Problem:** `Error: P1001: Can't reach database server`

**Solutions:**
- Check MySQL is running: `net start MySQL80`
- Verify DATABASE_URL format
- Check username/password
- Ensure database exists

### NextAuth Error

**Problem:** `[next-auth][error][NO_SECRET]`

**Solution:**
- Ensure NEXTAUTH_SECRET is set in `.env`
- Restart dev server after changing `.env`

### Prisma Client Error

**Problem:** `PrismaClient is unable to run in this browser environment`

**Solution:**
- Run `npx prisma generate`
- Restart dev server

### Email Not Sending

**Problem:** Emails not being received

**Solutions:**
- Check spam folder
- Verify SMTP credentials
- Test with a simple email client
- Check email service logs

### SMS Not Sending

**Problem:** SMS not being delivered

**Solutions:**
- Verify phone number format (include country code)
- Check SMS provider balance
- Ensure Sender ID is approved
- Check provider dashboard for errors

### Paystack Webhook Not Working

**Problem:** Payments not updating invoice status

**Solutions:**
- Ensure webhook URL is publicly accessible
- Check PAYSTACK_WEBHOOK_SECRET is correct
- View webhook logs in Paystack dashboard
- Test webhook with Paystack's test tool

## Support

For issues and questions:
1. Check this guide thoroughly
2. Review the main README.md
3. Check the Next.js and Prisma documentation
4. Review Paystack, SendGrid, and Termii documentation

## Next Steps

After successful setup:
1. ✅ Change admin password
2. ✅ Create a test tenant account
3. ✅ Test invoice creation
4. ✅ Test email delivery
5. ✅ Test payment flow
6. ✅ Configure custom domain
7. ✅ Set up SSL certificate
8. ✅ Configure backups
9. ✅ Set up monitoring
10. ✅ Launch!

---

**Congratulations!** Your InvoicePro SaaS platform is now set up and ready to use. 🎉
