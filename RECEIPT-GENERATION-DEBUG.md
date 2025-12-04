# Receipt Generation Debugging Guide

## Issue
Receipt is not being generated when marking an invoice as paid.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Mark an invoice as paid
4. Look for these logs:
   ```
   Marking invoice as paid: { invoiceId: "...", paymentMethod: "..." }
   Mark paid response: { status: 200, data: { invoice: {...}, receipt: {...} } }
   ```

**If you see status 200 with receipt data:**
- ✅ API is working correctly
- ✅ Receipt is being created in database
- Issue is likely in the UI display

**If you see an error status:**
- ❌ API request failed
- Check the error message in the response

### Step 2: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Mark an invoice as paid
4. Look for request to `/api/invoices/[id]/mark-paid`
5. Click on it and check:
   - **Status**: Should be 200
   - **Response**: Should include receipt object with receiptNumber

### Step 3: Check Server Logs
Look at your server console/terminal for these logs:
```
Mark paid request: { invoiceId: "...", paymentMethod: "...", invoiceTemplateId: "..." }
Generated receipt number: REC-0001
```

**If you see these logs:**
- ✅ API endpoint is being called
- ✅ Receipt number is being generated
- Check if receipt is actually in database

**If you don't see these logs:**
- ❌ API endpoint is not being called
- Check network request status

### Step 4: Check Database Directly
Run this query to verify receipt was created:

```sql
-- Check if receipt exists
SELECT id, receiptNumber, customerId, amount, templateId, createdAt 
FROM Receipt 
WHERE tenantId = 'YOUR_TENANT_ID'
ORDER BY createdAt DESC 
LIMIT 5;

-- Check if invoice is marked as paid
SELECT id, invoiceNumber, paymentStatus, paidAt 
FROM Invoice 
WHERE id = 'YOUR_INVOICE_ID';
```

**Expected results:**
- Receipt should exist with receiptNumber like "REC-0001"
- Invoice should have paymentStatus = "PAID"
- Invoice should have paidAt timestamp

### Step 5: Check Receipts Page
1. Go to Receipts section in dashboard
2. Look for the newly created receipt
3. Check if it appears in the list

**If receipt appears:**
- ✅ Receipt was created successfully
- Issue is likely in the modal/page refresh

**If receipt doesn't appear:**
- ❌ Receipt was not created
- Go back to Step 4 to verify database

## Common Issues & Solutions

### Issue 1: API Returns 500 Error
**Symptom:** Network tab shows status 500

**Solution:**
1. Check server logs for error message
2. Verify invoice exists and belongs to tenant
3. Verify customer exists
4. Check if templateId is valid (if invoice has template)

### Issue 2: Receipt Created But Not Showing
**Symptom:** Database has receipt, but not visible in UI

**Solution:**
1. Refresh the page (F5)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check if receipt is filtered out (check filters on receipts page)
4. Verify you're looking at correct tenant

### Issue 3: Modal Closes But No Receipt
**Symptom:** Modal closes successfully but no receipt created

**Solution:**
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify payment method was selected
4. Try again with different payment method

### Issue 4: Invoice Not Marked as Paid
**Symptom:** Invoice still shows as UNPAID after marking

**Solution:**
1. Refresh the page
2. Check database to verify paymentStatus was updated
3. Check if there's a permission issue
4. Try marking a different invoice

## Quick Test

To verify the entire flow works:

1. **Create a test invoice:**
   - Customer: Any customer
   - Template: Any template
   - Items: At least one item
   - Status: DRAFT or SENT

2. **Mark as paid:**
   - Click "Mark as Paid"
   - Select payment method: "Bank Transfer"
   - Reference: "TEST-123"
   - Click "Mark as Paid"

3. **Verify:**
   - Check browser console for success logs
   - Check network tab for 200 response
   - Go to Receipts page
   - Look for receipt with number "REC-XXXX"
   - Verify receipt has same template as invoice

## Logs to Check

### Browser Console (F12 → Console)
```
✅ Marking invoice as paid: { invoiceId: "...", paymentMethod: "..." }
✅ Mark paid response: { status: 200, data: { invoice: {...}, receipt: {...} } }
```

### Server Console
```
✅ Mark paid request: { invoiceId: "...", paymentMethod: "...", invoiceTemplateId: "..." }
✅ Generated receipt number: REC-0001
```

### Network Tab (F12 → Network)
```
✅ POST /api/invoices/[id]/mark-paid
✅ Status: 200
✅ Response includes receipt object
```

## If Still Not Working

1. **Collect information:**
   - Browser console logs (screenshot)
   - Network tab response (screenshot)
   - Server logs (copy/paste)
   - Database query results (copy/paste)

2. **Check for:**
   - JavaScript errors in console
   - Network request failures
   - Database errors in server logs
   - Permission/authorization issues

3. **Try:**
   - Different browser
   - Incognito/Private mode
   - Different invoice
   - Different payment method

## Success Indicators

✅ Browser console shows success logs  
✅ Network tab shows 200 status  
✅ Server logs show receipt number generated  
✅ Database has receipt record  
✅ Receipts page shows new receipt  
✅ Receipt has same template as invoice  
✅ Invoice shows as PAID  

If all these are true, receipt generation is working correctly!
