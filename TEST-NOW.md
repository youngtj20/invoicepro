# 🧪 Test Your New Authentication System

## Prerequisites Checklist

Before testing, ensure you've done these steps:

- [x] npm install completed
- [ ] Database created
- [ ] .env configured
- [ ] Database migrated
- [ ] Database seeded

If not, follow these steps first:

## Quick Setup (If Not Done)

### 1. Generate NextAuth Secret

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
```

Copy the output and add to `.env` (line 6):
```env
NEXTAUTH_SECRET="paste-your-secret-here"
```

### 2. Create Database & Run Migrations

**In MySQL:**
```sql
CREATE DATABASE invoice_saas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Then run:**
```bash
npm run db:migrate
```

When prompted for migration name, type: `init`

### 3. Seed Initial Data

```bash
npm run db:seed
```

This creates:
- 2 subscription plans (Free & Pro)
- 10 invoice templates
- System configuration
- Admin user (admin@invoicepro.com / admin123)

---

## 🚀 Start Testing (5 Minutes)

### Step 1: Start the Server

```bash
npm run dev
```

Wait for:
```
✓ Ready in 3.2s
○ Local:   http://localhost:3000
```

### Step 2: Test the Landing Page

1. Open browser: **http://localhost:3000**
2. You should see:
   - InvoicePro logo
   - "Professional Invoicing Made Simple" heading
   - "Start Free Trial" buttons
   - Features section
   - Pricing table

✅ **Landing page works!**

### Step 3: Test Sign Up

1. Click "Start Free Trial" (or go to http://localhost:3000/auth/signup)
2. Fill in the form:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** password123
   - **Confirm Password:** password123
3. Click "Create Account"
4. Watch the button show "Loading..."
5. Should redirect to `/onboarding`

✅ **Sign up works!**

### Step 4: Test Onboarding (Step 1)

You should see:
- "Welcome, Test User!" heading
- Progress indicator (Step 1 of 2)
- Trial banner: "7-day free trial"
- Form fields:
  - Company Name
  - Phone Number

1. Fill in:
   - **Company Name:** Test Company
   - **Phone:** +234 800 000 0000
2. Click "Continue"
3. Should see Step 2

✅ **Onboarding Step 1 works!**

### Step 5: Test Onboarding (Step 2)

You should see:
- Progress indicator (Step 2 of 2)
- Form fields for location
- "Back" and "Complete Setup" buttons

1. Fill in:
   - **Address:** 123 Business Street
   - **City:** Lagos
   - **State:** Lagos State
   - **Country:** Nigeria (default)
   - **Currency:** Nigerian Naira (default)
2. Click "Complete Setup"
3. Watch for API call
4. Should redirect to `/dashboard`

✅ **Onboarding Step 2 works!**

### Step 6: Test Dashboard

You should see:
- "Welcome to Test Company!" heading
- Trial banner: "🎉 You're on a Pro trial" (7 days remaining)
- Three stat cards (all showing 0)
- "Getting Started" checklist
- Subscription section showing "Pro" plan with "TRIALING" status

✅ **Dashboard works!**

### Step 7: Verify in Database

Open Prisma Studio:

```bash
npm run db:studio
```

Browser opens at http://localhost:5555

**Check the User table:**
- Should see "Test User" with email "test@example.com"
- `tenantId` should be filled in

**Check the Tenant table:**
- Should see "Test Company"
- `slug` should be "test-company"
- Status: ACTIVE

**Check the Subscription table:**
- Should see one subscription
- planId: links to Pro plan
- status: TRIALING
- trialEndsAt: 7 days from now

**Check the AuditLog table:**
- Should see "tenant.created" action
- Contains metadata about company creation

✅ **Database is correct!**

### Step 8: Test Sign In

1. Open new incognito window (or sign out)
2. Go to http://localhost:3000/auth/signin
3. Enter:
   - **Email:** test@example.com
   - **Password:** password123
4. Click "Sign In"
5. Should redirect to `/dashboard`
6. Should see your company dashboard

✅ **Sign in works!**

### Step 9: Test Error Page

1. Go to: http://localhost:3000/auth/error?error=CredentialsSignin
2. Should see:
   - Error icon
   - "Sign In Failed" title
   - Error description
   - "Try Again" button

✅ **Error page works!**

---

## 🎯 Success Criteria

If all the above tests passed, you have successfully:

- ✅ Built complete authentication system
- ✅ Created signup flow with validation
- ✅ Implemented 2-step onboarding wizard
- ✅ Auto-created tenant with Pro trial
- ✅ Built dashboard with trial tracking
- ✅ Created reusable UI components
- ✅ Integrated with database properly

---

## 🐛 Troubleshooting

### "Can't connect to database"

**Solution:**
```bash
# Check MySQL is running
net start MySQL80

# Verify DATABASE_URL in .env is correct
```

### "NEXTAUTH_SECRET not set"

**Solution:**
- Generate secret (see above)
- Add to `.env` file
- Restart dev server

### "Plan not found" error during onboarding

**Solution:**
```bash
# Run seed script
npm run db:seed
```

### Signup redirects to signin

**Reason:** Email already exists

**Solution:**
- Use different email
- Or delete user from database via Prisma Studio

### Page shows blank/error

**Solution:**
- Check terminal for errors
- Check browser console (F12)
- Ensure all files were created correctly

---

## 📸 What You Should See

### Landing Page
- Gradient blue background
- Clean, modern design
- Call-to-action buttons
- Pricing comparison

### Sign Up Page
- White card on blue gradient
- Google sign up button
- Email/password form
- "Already have account?" link

### Onboarding Page
- Progress indicator (1 → 2)
- Trial banner at top
- Multi-step form
- "Continue" then "Complete Setup" buttons

### Dashboard Page
- Header with logo and user name
- Trial countdown banner
- Stats cards (0 values for now)
- Getting started checklist
- Subscription information

---

## 🎉 You're All Set!

Your authentication and onboarding system is **fully functional**!

### What You Can Do Now:

1. **Create multiple test accounts** to verify signup works repeatedly
2. **Test the trial countdown** by changing dates in database
3. **Explore Prisma Studio** to see how data is structured
4. **Start building** the next features (customers, invoices)

### Next Steps:

Follow **NEXT-STEPS.md** → Week 2 to build:
- Customer management (CRUD)
- Item management (CRUD)
- Dashboard navigation
- Logout functionality

---

## 💬 Common Questions

**Q: Can I use a different email?**
A: Yes, each signup requires a unique email.

**Q: How do I reset the test data?**
A: Delete records in Prisma Studio or run: `npx prisma migrate reset`

**Q: When does the trial expire?**
A: 7 days from account creation. Check `Subscription.trialEndsAt` in Prisma Studio.

**Q: Can I sign up with Google?**
A: Yes, but you need to configure Google OAuth first (see SETUP-GUIDE.md)

**Q: Where is the logout button?**
A: Coming in Week 2 with the full dashboard layout!

---

**Everything working?** Great! Now continue building features by following **NEXT-STEPS.md**.

**Having issues?** Check the troubleshooting section or review the error messages carefully.

Good luck! 🚀
