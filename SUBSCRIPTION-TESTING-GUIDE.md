# Subscription Management Testing Guide

**Purpose:** Step-by-step guide to test the subscription management system

---

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file contains:
```env
DATABASE_URL="mysql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
PAYSTACK_SECRET_KEY="sk_test_..."  # Use test key for development
```

### 2. Database Setup
Ensure you have:
- At least one active Plan in the database
- A Tenant with a Subscription
- The subscription has a valid planId

### 3. Sample Data
You can create test plans using the Admin Panel at `/admin/plans`

---

## Test Scenarios

### Scenario 1: View Subscription Page

**Steps:**
1. Login to the application
2. Navigate to `/dashboard/subscription` (or click "Subscription" in sidebar)
3. Verify the page loads without errors

**Expected Results:**
- ✅ Current plan displays with name, price, and billing period
- ✅ Status badge shows correct state (Trial/Active/Past Due/Canceled)
- ✅ Days remaining shows accurate countdown
- ✅ Usage statistics display with progress bars
- ✅ All available plans shown in comparison grid
- ✅ Current plan is highlighted with blue border
- ✅ Upgrade buttons visible on higher-tier plans

**Screenshots:**
```
┌─────────────────────────────────────────┐
│ Subscription                            │
├─────────────────────────────────────────┤
│ Professional Plan          [Active]     │
│ NGN 5,000 / monthly                    │
│ Renews in 15 days                      │
├─────────────────────────────────────────┤
│ Usage Statistics                        │
│ Invoices:   [████████░░] 45/100       │
│ Customers:  [███████░░░] 32/50        │
│ Items:      [█████░░░░░] 18/unlimited │
└─────────────────────────────────────────┘
```

---

### Scenario 2: Check Usage Statistics

**Steps:**
1. On subscription page, locate "Usage Statistics" section
2. Verify progress bars for Invoices, Customers, Items

**Expected Results:**
- ✅ Shows current usage vs limit
- ✅ Progress bar color:
  - Green: 0-74% usage
  - Yellow: 75-89% usage
  - Red: 90-100% usage
- ✅ Unlimited features show "Unlimited" with Zap icon
- ✅ Percentages calculated correctly

**Test Data:**
- Create invoices/customers/items to increase usage
- Verify progress bars update after page refresh

---

### Scenario 3: Plan Comparison

**Steps:**
1. Scroll to "Available Plans" section
2. Review all plan cards

**Expected Results:**
- ✅ All active plans displayed
- ✅ Current plan marked with "Current Plan" badge
- ✅ Features listed with checkmarks
- ✅ Price displayed correctly
- ✅ Button states:
  - Current plan: Disabled "Current Plan"
  - Higher tier: Blue "Upgrade" button
  - Lower tier: Disabled "Contact Sales"

---

### Scenario 4: Initiate Upgrade (Test Mode)

**Steps:**
1. Click "Upgrade" on a higher-tier plan
2. Wait for redirection to Paystack

**Expected Results:**
- ✅ Loading state shows "Processing..."
- ✅ Redirects to Paystack checkout page
- ✅ Paystack shows correct amount
- ✅ Callback URL is set to `/dashboard/subscription/callback`

**Paystack Test Page:**
```
┌─────────────────────────────────────────┐
│ Paystack Checkout                       │
├─────────────────────────────────────────┤
│ Amount: NGN 10,000.00                  │
│ Description: Plan Upgrade              │
│                                         │
│ Card Number: 4084 0840 8408 4081      │
│ Expiry: 12/25                          │
│ CVV: 123                               │
│ PIN: 0000                              │
│ OTP: 123456                            │
└─────────────────────────────────────────┘
```

---

### Scenario 5: Complete Payment (Success)

**Steps:**
1. On Paystack checkout, use test card:
   - **Card:** 4084084084084081
   - **Expiry:** Any future date
   - **CVV:** Any 3 digits
   - **PIN:** 0000
   - **OTP:** 123456
2. Complete payment
3. Wait for redirect to callback page

**Expected Results:**
- ✅ Redirects to `/dashboard/subscription/callback?reference=xxx`
- ✅ Shows loading spinner with "Verifying your payment..."
- ✅ Then shows success screen:
  - Green checkmark icon
  - "Payment Successful!" heading
  - Success message
  - "View Subscription" button

**Database Verification:**
```sql
-- Check subscription updated
SELECT * FROM Subscription WHERE tenantId = 'xxx';
-- Should show new planId, status = 'ACTIVE'

-- Check payment record created
SELECT * FROM Payment WHERE reference = 'xxx';
-- Should exist with status = 'success'

-- Check audit log
SELECT * FROM AuditLog WHERE action = 'SUBSCRIPTION_UPGRADED';
-- Should have entry with plan details
```

---

### Scenario 6: Failed Payment

**Steps:**
1. Initiate upgrade
2. On Paystack, click "Cancel" or close window
3. OR use a card that will fail

**Expected Results:**
- ✅ Redirects to callback page
- ✅ Shows error screen:
  - Red X icon
  - "Payment Failed" heading
  - Error message
  - "Back to Subscription" and "Go to Dashboard" buttons
- ✅ Subscription remains unchanged in database

---

### Scenario 7: Cancel Subscription

**Steps:**
1. On subscription page, click "Cancel Subscription"
2. Review confirmation modal
3. Click "Delete" to confirm

**Expected Results:**
- ✅ Modal shows:
  - Warning icon
  - "Cancel Subscription" title
  - Plan name and end date in message
  - "Cancel" and "Delete" buttons
- ✅ After confirmation:
  - Success toast: "Subscription canceled"
  - Warning banner appears at top of page
  - "Reactivate" button visible
  - "Cancel Subscription" button hidden

**Database Verification:**
```sql
SELECT cancelAtPeriodEnd, canceledAt
FROM Subscription
WHERE tenantId = 'xxx';
-- Should show: cancelAtPeriodEnd = true, canceledAt = current timestamp
```

---

### Scenario 8: Reactivate Subscription

**Steps:**
1. With a canceled subscription, click "Reactivate"
2. Verify immediate reactivation

**Expected Results:**
- ✅ Success toast: "Subscription reactivated"
- ✅ Warning banner disappears
- ✅ "Cancel Subscription" button returns
- ✅ "Reactivate" button hidden

**Database Verification:**
```sql
SELECT cancelAtPeriodEnd, canceledAt
FROM Subscription
WHERE tenantId = 'xxx';
-- Should show: cancelAtPeriodEnd = false, canceledAt = null
```

---

### Scenario 9: Trial Period

**Steps:**
1. Create a subscription with status = 'TRIALING'
2. Set trialEndsAt to a future date
3. View subscription page

**Expected Results:**
- ✅ Status badge shows "Trial" (blue)
- ✅ Days remaining message: "Trial ends in X days"
- ✅ Shows trial end date
- ✅ All other features work normally

---

### Scenario 10: Past Due Subscription

**Steps:**
1. Set subscription status = 'PAST_DUE' in database
2. View subscription page

**Expected Results:**
- ✅ Status badge shows "Past Due" (yellow)
- ✅ Alert warning about payment issue (if implemented)
- ✅ Upgrade functionality still available

---

### Scenario 11: Unlimited Plan Features

**Steps:**
1. Upgrade to a plan with unlimited features (maxInvoices = -1)
2. View subscription page

**Expected Results:**
- ✅ No progress bar shown for unlimited features
- ✅ Shows "Unlimited" text with green Zap icon
- ✅ Plan comparison shows "Unlimited invoices"

---

### Scenario 12: Mobile Responsiveness

**Steps:**
1. Open subscription page on mobile device or resize browser
2. Test all interactions

**Expected Results:**
- ✅ Plan comparison grid stacks vertically
- ✅ Usage statistics remain readable
- ✅ All buttons remain accessible
- ✅ Modal fits screen properly
- ✅ Paystack checkout works on mobile

---

## API Endpoint Testing

### Test GET /api/subscription

**cURL:**
```bash
curl http://localhost:3000/api/subscription \
  -H "Cookie: next-auth.session-token=xxx"
```

**Expected Response:**
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "ACTIVE",
    "plan": { "name": "Professional", "price": 5000, ... },
    "daysRemaining": 15,
    "periodType": "billing"
  },
  "usage": {
    "invoices": { "used": 45, "limit": 100, "percentage": 45, "unlimited": false },
    "customers": { "used": 32, "limit": 50, "percentage": 64, "unlimited": false },
    "items": { "used": 18, "limit": -1, "percentage": 0, "unlimited": true }
  }
}
```

---

### Test GET /api/plans

**cURL:**
```bash
curl http://localhost:3000/api/plans
```

**Expected Response:**
```json
{
  "plans": [
    {
      "id": "plan_1",
      "name": "Starter",
      "price": 2000,
      "billingPeriod": "MONTHLY",
      ...
    },
    {
      "id": "plan_2",
      "name": "Professional",
      "price": 5000,
      ...
    }
  ]
}
```

---

### Test POST /api/subscription/upgrade

**cURL:**
```bash
curl -X POST http://localhost:3000/api/subscription/upgrade \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=xxx" \
  -d '{"planId":"plan_xxx"}'
```

**Expected Response:**
```json
{
  "authorizationUrl": "https://checkout.paystack.com/xxx",
  "reference": "upgrade-tenant123-1638360000000"
}
```

---

### Test GET /api/subscription/verify

**cURL:**
```bash
curl "http://localhost:3000/api/subscription/verify?reference=upgrade-xxx" \
  -H "Cookie: next-auth.session-token=xxx"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "planId": "plan_new",
    "status": "ACTIVE",
    ...
  }
}
```

---

### Test POST /api/subscription/cancel

**cURL:**
```bash
curl -X POST http://localhost:3000/api/subscription/cancel \
  -H "Cookie: next-auth.session-token=xxx"
```

**Expected Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "message": "Your subscription will be canceled at the end of the current billing period (12/31/2024)."
}
```

---

### Test DELETE /api/subscription/cancel (Reactivate)

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/subscription/cancel \
  -H "Cookie: next-auth.session-token=xxx"
```

**Expected Response:**
```json
{
  "success": true,
  "subscription": { ... },
  "message": "Your subscription has been reactivated."
}
```

---

## Error Testing

### Test 1: No Subscription Found
**Setup:** Delete subscription for tenant
**Expected:** 404 error with message "No subscription found"

### Test 2: Invalid Plan ID
**Setup:** POST upgrade with non-existent planId
**Expected:** 400 error with message "Invalid or inactive plan"

### Test 3: Downgrade Attempt
**Setup:** Try to upgrade to a cheaper plan
**Expected:** 400 error with message "New plan must be an upgrade"

### Test 4: Already Canceled
**Setup:** Try to cancel an already canceled subscription
**Expected:** 400 error with message "Subscription is already canceled"

### Test 5: Paystack API Failure
**Setup:** Use invalid Paystack key
**Expected:** 500 error with message "Failed to initialize payment"

### Test 6: Payment Verification Failure
**Setup:** Verify with invalid reference
**Expected:** 400 error with message "Payment not successful"

---

## Performance Testing

### Load Time
- [ ] Subscription page loads in < 2 seconds
- [ ] API responses in < 500ms
- [ ] Paystack redirect happens quickly
- [ ] Callback verification completes quickly

### Concurrent Users
- [ ] Multiple users can upgrade simultaneously
- [ ] No race conditions in subscription updates
- [ ] Payment records don't duplicate

---

## Security Testing

### Authentication
- [ ] Cannot access `/api/subscription` without session
- [ ] Cannot access subscription page when logged out
- [ ] Tenants can only see their own subscription

### Payment Security
- [ ] Paystack secret key not exposed to client
- [ ] Payment reference cannot be tampered with
- [ ] Metadata validation prevents plan switching

### Data Validation
- [ ] Invalid planId rejected
- [ ] Negative amounts rejected
- [ ] SQL injection attempts fail
- [ ] XSS attempts sanitized

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can navigate entire page with Tab key
- [ ] Can trigger upgrade with Enter key
- [ ] Modal can be closed with Escape key
- [ ] Focus states visible

### Screen Readers
- [ ] Status badges read correctly
- [ ] Progress bars announce percentage
- [ ] Buttons have descriptive labels
- [ ] Error messages are announced

---

## Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Checklist Summary

### Core Functionality
- [ ] View subscription details
- [ ] See usage statistics
- [ ] Compare available plans
- [ ] Initiate upgrade
- [ ] Complete payment successfully
- [ ] Handle payment failure
- [ ] Cancel subscription
- [ ] Reactivate subscription

### Edge Cases
- [ ] Trial period display
- [ ] Past due status
- [ ] Unlimited features
- [ ] No subscription found
- [ ] Invalid plan selection
- [ ] Downgrade prevention

### Integration
- [ ] Paystack test mode works
- [ ] Payment verification accurate
- [ ] Database updates correctly
- [ ] Audit logs created
- [ ] Toast notifications appear

### UI/UX
- [ ] Mobile responsive
- [ ] Loading states shown
- [ ] Error messages clear
- [ ] Success feedback provided
- [ ] Accessible to all users

---

## Known Issues / Limitations

1. **Downgrades Not Supported**
   - Currently shows "Contact Sales" for lower-tier plans
   - Future: Implement downgrade with proration

2. **Billing History Not Implemented**
   - Payment records created but not displayed
   - Future: Add billing history page

3. **Email Notifications**
   - No email sent on upgrade/cancel
   - Future: Implement email notifications

4. **Proration**
   - Mid-cycle upgrades charge full amount
   - Future: Implement prorated charges

---

## Reporting Bugs

When reporting issues, please include:
1. Steps to reproduce
2. Expected vs actual result
3. Browser and device
4. Screenshots/console errors
5. Database state (subscription, plan)

---

**Testing Status:** Ready for Testing ✅

All core functionality has been implemented and is ready for manual testing with Paystack test mode.
