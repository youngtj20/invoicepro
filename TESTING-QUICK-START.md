# Quick Start Testing Guide - Subscription Management

## 🚀 Ready to Test Now!

Your subscription management system is **fully implemented and running**. Here's how to test it immediately:

---

## ✅ Current Status

- **Dev Server:** Running at http://localhost:3000
- **Compilation:** Success (no errors)
- **Database:** Connected and active
- **All Files:** Created and verified

---

## 🎯 Test in 3 Simple Steps

### Step 1: Access the Subscription Page
1. Open your browser
2. Go to http://localhost:3000
3. Log in with your test account
4. Click **"Subscription"** in the sidebar

**What you'll see:**
- Your current plan details
- Usage statistics (invoices, customers, items)
- Available plans to upgrade to
- Cancel/reactivate buttons

---

### Step 2: Test Basic Functionality (No Paystack needed)

**Things you can test right now without payment setup:**

✅ **View Current Subscription:**
- Check if your plan name displays
- Verify status badge (Trial/Active/etc.)
- See days remaining
- View period dates

✅ **Usage Statistics:**
- Invoice count and usage percentage
- Customer count and usage percentage
- Item count and usage percentage
- Progress bars with color coding

✅ **Plan Comparison:**
- All available plans displayed
- Feature lists visible
- Current plan highlighted
- Responsive layout on mobile

✅ **Cancel Subscription:**
- Click "Cancel Subscription" button
- Confirm in modal
- See warning banner appear
- Click "Reactivate Subscription"
- Verify banner disappears

---

### Step 3: Test Payment Flow (Requires Paystack keys)

**To test upgrades, you need Paystack test keys:**

#### A. Get Paystack Test Keys:
1. Go to https://dashboard.paystack.com/signup
2. Create a free test account
3. Navigate to Settings → API Keys & Webhooks
4. Copy your test keys:
   - Public Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

#### B. Update Environment:
Edit `.env` file and replace placeholders:
```env
PAYSTACK_PUBLIC_KEY="pk_test_YOUR_ACTUAL_KEY_HERE"
PAYSTACK_SECRET_KEY="sk_test_YOUR_ACTUAL_KEY_HERE"
```

#### C. Restart Server:
Stop the dev server (Ctrl+C) and run:
```bash
npm run dev
```

#### D. Test Upgrade Flow:
1. Click "Upgrade" on any higher-tier plan
2. You'll be redirected to Paystack checkout
3. Use **Paystack Test Card:**
   - Card: `4084 0840 8408 4081`
   - CVV: `408`
   - Expiry: Any future date (e.g., `12/26`)
   - PIN: `0000`
   - OTP: `123456`
4. Complete payment
5. You'll be redirected back with success message
6. Verify your subscription updated

---

## 📋 Quick Verification Checklist

Copy this checklist and mark items as you test:

```
Basic Functionality (No payment needed):
[ ] Subscription page loads without errors
[ ] Current plan displays correctly
[ ] Status badge shows correct state
[ ] Usage statistics visible and accurate
[ ] Progress bars render with correct percentages
[ ] Plan comparison grid displays all plans
[ ] Responsive on mobile (test with DevTools)
[ ] Cancel subscription shows warning banner
[ ] Reactivate subscription removes banner
[ ] Toast notifications appear for actions

Payment Flow (Requires Paystack keys):
[ ] Paystack keys configured in .env
[ ] Server restarted after configuration
[ ] Upgrade button redirects to Paystack
[ ] Test card payment completes successfully
[ ] Callback page shows success message
[ ] Subscription updates to new plan
[ ] Payment record created in database
[ ] Audit log entry created
[ ] New period dates calculated correctly
```

---

## 🐛 Common Issues & Solutions

### Issue: "Payment service not configured"
**Cause:** Paystack keys not set or still using placeholders
**Solution:**
1. Get real test keys from Paystack dashboard
2. Update `.env` file
3. Restart dev server

### Issue: Subscription page shows loading forever
**Cause:** Database doesn't have a subscription record for your tenant
**Solution:**
Check database: `SELECT * FROM Subscription WHERE tenantId = 'your-id';`
You should have a default trial subscription created during tenant setup.

### Issue: No plans showing in comparison grid
**Cause:** No plans in database
**Solution:**
Run: `SELECT * FROM Plan WHERE isActive = 1;`
You should have default plans. If not, they need to be seeded.

### Issue: Usage percentages show 0% for everything
**Cause:** No test data exists
**Solution:**
Create some test:
- Invoices (go to /dashboard/invoices/new)
- Customers (go to /dashboard/customers)
- Items (go to /dashboard/items)
Then refresh subscription page.

---

## 🔍 Where to Look for Problems

### Browser Console (F12):
- Check for JavaScript errors
- Monitor network requests (Network tab)
- Verify API responses

### Server Logs:
- Watch terminal where `npm run dev` is running
- Look for Prisma query errors
- Check for API endpoint errors

### Database:
- Use Prisma Studio: `npx prisma studio`
- Or MySQL Workbench/command line
- Verify Subscription, Plan, Payment tables

---

## 📊 Test Data Examples

### Create Test Subscription Usage:

**Add Invoices:**
1. Go to http://localhost:3000/dashboard/invoices/new
2. Create 3-5 test invoices

**Add Customers:**
1. Go to http://localhost:3000/dashboard/customers
2. Create 3-5 test customers

**Add Items:**
1. Go to http://localhost:3000/dashboard/items
2. Create 3-5 test items

**Then:** Return to subscription page and see usage bars populate!

---

## 🎉 What Success Looks Like

### ✅ Everything Working:
- No console errors
- Subscription page loads in under 2 seconds
- All usage statistics display correctly
- Progress bars animate smoothly
- Plan grid is responsive on all screen sizes
- Cancel/reactivate works instantly
- Payment flow completes end-to-end (with Paystack keys)
- Database updates after each action
- Toast notifications appear for all actions

### 📸 Expected UI:
```
┌─────────────────────────────────────┐
│  Current Plan: Starter              │
│  Status: [Active] Trial             │
│  $9.99/month                        │
│  7 days remaining                   │
└─────────────────────────────────────┘

Usage Statistics:
┌─────────────────────────────────────┐
│ Invoices: 5/10 used (50%)           │
│ ████████████░░░░░░░░░░░░ 50%        │
│                                     │
│ Customers: 3/25 used (12%)          │
│ ████░░░░░░░░░░░░░░░░░░░░ 12%        │
│                                     │
│ Items: 8/50 used (16%)              │
│ ████░░░░░░░░░░░░░░░░░░░░ 16%        │
└─────────────────────────────────────┘

Available Plans:
┌──────────┬──────────┬──────────┐
│   Free   │ Starter  │   Pro    │
│   $0     │   $9.99  │  $29.99  │
│ [Current]│ [Upgrade]│ [Upgrade]│
└──────────┴──────────┴──────────┘
```

---

## 🚀 Start Testing Now!

**Quickest test (30 seconds):**
1. Open http://localhost:3000/dashboard/subscription
2. Verify page loads
3. Check if usage stats show your data
4. Click cancel → reactivate → see it work
5. Done! ✅

**Full test (5-10 minutes):**
1. Follow Step 1-3 above
2. Configure Paystack keys
3. Test upgrade with test card
4. Verify database updates
5. Check audit logs
6. Test on mobile
7. Done! ✅

---

## 📞 Need Help?

### Documentation:
- **Detailed Guide:** `SUBSCRIPTION-MANAGEMENT-IMPLEMENTATION.md`
- **Full Test Scenarios:** `SUBSCRIPTION-TESTING-GUIDE.md`
- **Verification Report:** `TESTING-VERIFICATION-REPORT.md`
- **Session Summary:** `SESSION-SUMMARY.md`

### Paystack Resources:
- Test Cards: https://paystack.com/docs/payments/test-payments
- API Docs: https://paystack.com/docs/api
- Dashboard: https://dashboard.paystack.com

---

**Happy Testing! 🎉**

The system is production-ready pending your manual verification.
