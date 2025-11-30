# Testing Guide - Invoice SaaS Platform

## Overview

This document provides comprehensive testing procedures for the Invoice SaaS platform, covering user flows, edge cases, and device compatibility.

## Prerequisites

Before testing, ensure you have:
- [ ] Database seeded with test data
- [ ] Test user accounts (regular user and super admin)
- [ ] Payment gateway in test mode (Paystack test keys)
- [ ] SMS/Email services configured (test mode if available)

## Test Accounts Setup

### Create Test Accounts

```sql
-- Super Admin Account
INSERT INTO User (email, name, password, role) VALUES
('admin@test.com', 'Test Admin', '[hashed_password]', 'SUPER_ADMIN');

-- Regular Tenant User
INSERT INTO User (email, name, password, role, tenantId) VALUES
('user@test.com', 'Test User', '[hashed_password]', 'TENANT_USER', '[tenant_id]');
```

## Critical User Flows

### 1. Sign Up & Onboarding Flow

**Test Steps:**
1. Navigate to sign-up page
2. Fill in registration form:
   - Email: test-[timestamp]@example.com
   - Password: secure password (min 8 chars)
   - Company name
   - Full name
3. Submit form
4. Verify email validation (if enabled)
5. Complete onboarding:
   - Select industry
   - Set currency
   - Configure company details
   - Upload logo (optional)
6. Redirected to dashboard

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Password strength indicator works
- ✅ Email uniqueness check works
- ✅ Tenant created successfully
- ✅ User assigned to tenant
- ✅ Default subscription plan assigned
- ✅ Welcome email sent (if configured)
- ✅ Dashboard loads with empty states

**Edge Cases:**
- [ ] Duplicate email registration
- [ ] Weak password attempt
- [ ] SQL injection in form fields
- [ ] XSS attempts in company name
- [ ] Network interruption during signup

---

### 2. Customer Management Flow

**Test Steps:**
1. Navigate to Customers page
2. Click "Add Customer"
3. Fill customer form:
   - Name
   - Email
   - Phone (optional)
   - Address details
4. Save customer
5. View customer list
6. Edit existing customer
7. Delete customer (with confirmation)

**Expected Results:**
- ✅ Empty state shown when no customers
- ✅ Customer created successfully
- ✅ Customer appears in list
- ✅ Search functionality works
- ✅ Pagination works (if >10 customers)
- ✅ Edit saves changes
- ✅ Delete shows confirmation dialog
- ✅ Delete cascades to invoices (or prevents deletion)

**Edge Cases:**
- [ ] Duplicate customer email (should allow or warn)
- [ ] Invalid email format
- [ ] Invalid phone format
- [ ] Special characters in name
- [ ] Very long customer name (>255 chars)
- [ ] Delete customer with pending invoices

---

### 3. Invoice Creation & Sending Flow

**Test Steps:**
1. Navigate to Invoices page
2. Click "Create Invoice"
3. Select customer
4. Add line items:
   - Select from items list or create new
   - Set quantity and price
   - Add discount (optional)
5. Select tax rate (if applicable)
6. Choose template
7. Set due date
8. Add notes
9. Save as draft
10. Send invoice via:
    - Email
    - SMS (if customer has phone)
    - WhatsApp link

**Expected Results:**
- ✅ Customer dropdown populated
- ✅ Item search works
- ✅ Quick item creation works
- ✅ Calculations correct (subtotal, tax, discount, total)
- ✅ Template preview works
- ✅ Invoice number auto-generated
- ✅ Draft saved successfully
- ✅ Email sends with PDF attachment
- ✅ SMS sends with invoice link
- ✅ WhatsApp link generated correctly
- ✅ Invoice status updated to "SENT"

**Edge Cases:**
- [ ] Invoice with no items
- [ ] Invoice with 0 quantity
- [ ] Negative discount
- [ ] Discount > subtotal
- [ ] Invalid due date (past date)
- [ ] Send to customer without email/phone
- [ ] Very large invoice (100+ items)
- [ ] Special characters in notes
- [ ] Network failure during send

---

### 4. Payment & Receipt Flow

**Test Steps:**
1. Customer receives invoice
2. Customer views public invoice page
3. Customer clicks "Pay Now"
4. Redirected to Paystack payment page
5. Complete payment with test card:
   - Card: 4084084084084081
   - CVV: 408
   - Expiry: Any future date
   - PIN: 0000
   - OTP: 123456
6. Redirected back to success page
7. Webhook processes payment
8. Receipt auto-generated
9. Confirmation email sent

**Expected Results:**
- ✅ Public invoice page loads without auth
- ✅ Payment link generates correctly
- ✅ Paystack integration works
- ✅ Test payment succeeds
- ✅ Webhook signature verified
- ✅ Invoice marked as PAID
- ✅ Payment record created
- ✅ Receipt auto-generated with number
- ✅ Receipt PDF generated
- ✅ Confirmation email sent to customer
- ✅ Dashboard statistics updated

**Edge Cases:**
- [ ] Failed payment (declined card)
- [ ] Duplicate payment attempt
- [ ] Webhook received multiple times
- [ ] Invalid webhook signature
- [ ] Network timeout during payment
- [ ] Customer closes payment page
- [ ] Partial payment (not supported - should fail)

---

### 5. Subscription Upgrade Flow

**Test Steps:**
1. Navigate to Settings > Subscription
2. View current plan details
3. View usage statistics
4. Click "Upgrade" on higher plan
5. Review plan features
6. Click "Upgrade Now"
7. Redirected to Paystack payment
8. Complete payment
9. Webhook processes subscription
10. Verify new features enabled

**Expected Results:**
- ✅ Current plan displayed correctly
- ✅ Usage bars show correct percentages
- ✅ Plan comparison table accurate
- ✅ Upgrade button visible (not on highest plan)
- ✅ Payment processes successfully
- ✅ Subscription updated immediately
- ✅ New limits applied
- ✅ New features accessible
- ✅ Invoice generated for subscription
- ✅ Email confirmation sent

**Edge Cases:**
- [ ] Downgrade attempt (if allowed)
- [ ] Upgrade during trial period
- [ ] Prorated payment calculation
- [ ] Payment failure during upgrade
- [ ] Upgrade to same plan (should prevent)
- [ ] Concurrent upgrade attempts

---

### 6. Admin Operations Flow

**Test Steps:**
1. Sign in as super admin
2. Navigate to `/admin`
3. View system metrics
4. Navigate to Tenants
5. Search for tenant
6. Suspend a tenant
7. Verify tenant cannot access dashboard
8. Activate tenant
9. Verify tenant can access dashboard
10. Navigate to Plans
11. Create new plan
12. Edit existing plan
13. Attempt to delete plan with subscribers

**Expected Results:**
- ✅ Only SUPER_ADMIN can access
- ✅ Metrics calculated correctly
- ✅ MRR calculation accurate
- ✅ Tenant search works
- ✅ Suspend creates audit log
- ✅ Suspended tenant blocked from dashboard
- ✅ Activate restores access
- ✅ Plan created with all features
- ✅ Plan edit saves correctly
- ✅ Cannot delete plan with active subs
- ✅ All actions logged in audit log

**Edge Cases:**
- [ ] Regular user attempts `/admin` access
- [ ] Suspend tenant during active session
- [ ] Delete tenant with data
- [ ] Create plan with duplicate name
- [ ] Set negative plan price
- [ ] Delete default plan

---

## Edge Case Testing

### Data Validation

**Invalid Data Tests:**
- [ ] Empty required fields
- [ ] Email without @ symbol
- [ ] Phone with letters
- [ ] Negative numbers in amount fields
- [ ] Future dates in past-date fields
- [ ] Very long strings (>255 chars)
- [ ] SQL injection attempts: `'; DROP TABLE users; --`
- [ ] XSS attempts: `<script>alert('XSS')</script>`
- [ ] Unicode characters: 你好, émojis 🎉
- [ ] Null byte injection: `%00`

**Duplicate Data Tests:**
- [ ] Duplicate customer email
- [ ] Duplicate invoice number (should auto-increment)
- [ ] Duplicate user email (should reject)
- [ ] Duplicate plan name (should reject)
- [ ] Concurrent invoice creation (race condition)

### Concurrent Operations

**Test Scenarios:**
- [ ] Two users editing same invoice simultaneously
- [ ] User deletes customer while invoice being created
- [ ] Admin suspends tenant while user is creating invoice
- [ ] Webhook received while manual payment entry
- [ ] Multiple payment attempts for same invoice

### Network Failure Scenarios

**Test Scenarios:**
- [ ] Form submission with network disconnect
- [ ] File upload interrupted
- [ ] Payment redirect with connection loss
- [ ] Webhook delivery failure and retry
- [ ] Email send failure and retry
- [ ] PDF generation timeout

### Boundary Value Testing

**Limits to Test:**
- [ ] Free plan: Exactly 10 invoices (11th should fail)
- [ ] Pro plan: 100+ invoices
- [ ] Invoice with 1 item
- [ ] Invoice with 100 items
- [ ] Item price: 0.01 (minimum)
- [ ] Item price: 9,999,999.99 (maximum)
- [ ] Discount: 0%
- [ ] Discount: 100%
- [ ] Quantity: 1
- [ ] Quantity: 10,000

---

## Device & Browser Testing

### Desktop Browsers

**Chrome (Latest)**
- [ ] Sign up flow
- [ ] Invoice creation
- [ ] Payment flow
- [ ] PDF generation
- [ ] Print invoice
- [ ] All dashboard pages

**Firefox (Latest)**
- [ ] Sign up flow
- [ ] Invoice creation
- [ ] Payment flow
- [ ] PDF generation
- [ ] Print invoice
- [ ] All dashboard pages

**Safari (Latest)**
- [ ] Sign up flow
- [ ] Invoice creation
- [ ] Payment flow
- [ ] PDF generation
- [ ] Print invoice
- [ ] All dashboard pages

**Edge (Latest)**
- [ ] Sign up flow
- [ ] Invoice creation
- [ ] Payment flow
- [ ] PDF generation
- [ ] Print invoice
- [ ] All dashboard pages

### Mobile Devices

**iOS Safari (iPhone)**
- [ ] Sign up flow
- [ ] Dashboard navigation
- [ ] Invoice creation (responsiveness)
- [ ] Invoice viewing
- [ ] Payment flow
- [ ] Touch interactions
- [ ] Form inputs with keyboard

**Android Chrome (Android Phone)**
- [ ] Sign up flow
- [ ] Dashboard navigation
- [ ] Invoice creation (responsiveness)
- [ ] Invoice viewing
- [ ] Payment flow
- [ ] Touch interactions
- [ ] Form inputs with keyboard

### Tablet

**iPad (Safari)**
- [ ] All flows in landscape mode
- [ ] All flows in portrait mode
- [ ] Touch interactions
- [ ] Split-screen multitasking

---

## Performance Testing

### Page Load Times

**Acceptable Limits:**
- Landing page: < 2 seconds
- Dashboard: < 3 seconds
- Invoice list: < 3 seconds
- Invoice detail: < 2 seconds
- PDF generation: < 5 seconds

**Test Scenarios:**
- [ ] First load (no cache)
- [ ] Repeat load (with cache)
- [ ] Slow 3G connection
- [ ] Fast 4G connection
- [ ] WiFi connection

### Database Query Performance

**Metrics to Monitor:**
- [ ] Invoice list query time: < 500ms
- [ ] Dashboard stats query: < 1s
- [ ] Admin metrics query: < 2s
- [ ] Search queries: < 300ms
- [ ] No N+1 query problems

### Large Dataset Testing

**Create Test Data:**
- 1,000 customers
- 10,000 invoices
- 5,000 items
- 500 receipts

**Test Performance:**
- [ ] List pagination speed
- [ ] Search performance
- [ ] Filter performance
- [ ] Dashboard load time
- [ ] Metrics calculation time

---

## Security Testing

### Authentication & Authorization

**Tests:**
- [ ] Cannot access dashboard without login
- [ ] Session expires after timeout
- [ ] Cannot access other tenant's data
- [ ] Cannot access admin panel as regular user
- [ ] Password reset flow secure
- [ ] Remember me functionality works
- [ ] CSRF tokens validated
- [ ] JWT tokens have expiry

### API Security

**Tests:**
- [ ] API requires authentication
- [ ] Rate limiting works (if implemented)
- [ ] Tenant isolation enforced
- [ ] File upload validates file types
- [ ] File upload has size limits
- [ ] SQL injection prevented
- [ ] XSS attacks sanitized
- [ ] CORS configured correctly

### Payment Security

**Tests:**
- [ ] Webhook signature verified
- [ ] Sensitive data not logged
- [ ] Payment amounts cannot be manipulated
- [ ] Replay attacks prevented
- [ ] SSL/TLS enforced on payment pages

---

## Accessibility Testing

### Keyboard Navigation

- [ ] All forms navigable with Tab
- [ ] Dropdowns accessible with keyboard
- [ ] Modals can be closed with Esc
- [ ] Submit with Enter key
- [ ] Focus indicators visible

### Screen Reader

- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] ARIA labels on icons
- [ ] Alt text on images

### Color Contrast

- [ ] Text meets WCAG AA standards
- [ ] Links distinguishable from text
- [ ] Error states clearly visible
- [ ] Status badges have sufficient contrast

---

## Integration Testing

### Email Service

**Tests:**
- [ ] Welcome email sent on signup
- [ ] Invoice email with PDF attachment
- [ ] Payment confirmation email
- [ ] Receipt email sent
- [ ] Email templates render correctly
- [ ] Unsubscribe link works (if applicable)

### SMS Service (Termii)

**Tests:**
- [ ] SMS sent for invoice notification
- [ ] Phone number validated
- [ ] SMS character limit respected
- [ ] Link shortening works
- [ ] Delivery status tracked

### Payment Gateway (Paystack)

**Tests:**
- [ ] Initialize transaction works
- [ ] Payment link generated
- [ ] Redirect to Paystack successful
- [ ] Webhook received and processed
- [ ] Payment status updated correctly
- [ ] Refunds work (if implemented)
- [ ] Test cards work in test mode

### WhatsApp Integration

**Tests:**
- [ ] wa.me link generated correctly
- [ ] Message pre-filled with invoice details
- [ ] Link opens WhatsApp app/web
- [ ] Phone number format correct

---

## Regression Testing Checklist

After any major changes, test:

- [ ] User authentication still works
- [ ] Invoice creation and sending
- [ ] Payment processing
- [ ] Receipt generation
- [ ] Dashboard statistics
- [ ] Subscription management
- [ ] Admin functionality
- [ ] Email notifications
- [ ] PDF generation
- [ ] Mobile responsiveness

---

## Bug Reporting Template

When reporting bugs, include:

```markdown
**Title:** Brief description

**Environment:**
- Browser: Chrome 120.0
- Device: MacBook Pro
- OS: macOS Sonoma
- User Role: Tenant User

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Enter...
4. Submit...

**Expected Behavior:**
The form should...

**Actual Behavior:**
Error message appears...

**Screenshots:**
[Attach screenshots]

**Console Errors:**
```
Error: ...
```

**Severity:** Critical / High / Medium / Low

**Frequency:** Always / Sometimes / Rare
```

---

## Performance Benchmarks

### Target Metrics

**Lighthouse Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Custom Metrics:**
- Time to Interactive: < 3.5s
- Server Response Time: < 200ms
- Total Page Size: < 2MB
- Number of Requests: < 50

---

## Automated Testing Setup

### Unit Tests (Recommended)

```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### E2E Tests (Recommended)

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Run E2E tests
npx playwright test
```

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can create invoice', async ({ page }) => {
  await page.goto('/dashboard/invoices');
  await page.click('text=Create Invoice');
  await page.fill('[name="customerId"]', 'customer-id');
  await page.click('text=Save');
  await expect(page).toHaveURL(/\/invoices\/INV-/);
});
```

---

## Continuous Testing

### Pre-Deployment Checklist

Before deploying to production:

- [ ] All critical user flows tested
- [ ] No console errors on any page
- [ ] All links working
- [ ] Forms validate correctly
- [ ] Payment integration tested
- [ ] Email sending tested
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Security scan passed
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] Backup strategy in place

---

## Post-Deployment Monitoring

### Metrics to Monitor

- [ ] Error rate (< 0.1%)
- [ ] Response time (< 500ms average)
- [ ] Uptime (> 99.9%)
- [ ] Payment success rate (> 95%)
- [ ] Email delivery rate (> 98%)
- [ ] User signups
- [ ] Active users
- [ ] Invoice creation rate

### Alerting Setup

Configure alerts for:
- Server errors (500s)
- Payment failures
- Email send failures
- High response times (> 3s)
- Database connection errors
- Disk space low
- Memory usage high

---

## Testing Sign-Off

Testing completed by: _______________
Date: _______________
Version tested: _______________

**Summary:**
- Total test cases: ___
- Passed: ___
- Failed: ___
- Blocked: ___

**Critical Issues:**
- None / [List issues]

**Recommendations:**
- [List any recommendations]

**Approval:**
- [ ] Ready for production deployment
- [ ] Requires fixes before deployment
