# Verify PDF Stamping Fix - Testing Guide

## Quick Verification (5 minutes)

### Step 1: Create a Test Invoice
```
1. Go to Dashboard → Invoices
2. Click "Create Invoice"
3. Fill in details:
   - Customer: Any customer
   - Items: Add any item
   - Amount: Any amount
4. Click "Create Invoice"
```

### Step 2: Download Unpaid Invoice PDF
```
1. Click on the invoice you just created
2. Click "Download PDF"
3. Open the PDF
4. Verify: Red "UNPAID" stamp appears in top-right area ✅
```

### Step 3: Mark Invoice as Paid
```
1. On invoice detail page
2. Click green "Mark as Paid" button
3. Fill in payment details:
   - Payment Method: Select any method
   - Reference: Enter any reference (optional)
   - Date: Today's date
4. Click "Mark as Paid" button
5. Wait for success message
```

### Step 4: Download Paid Invoice PDF
```
1. Click "Download PDF"
2. Open the PDF
3. Verify: Green "PAID" stamp appears in top-right area ✅
```

### Step 5: Verify Stamp Changed
```
Compare the two PDFs:
- First PDF: Red "UNPAID" stamp
- Second PDF: Green "PAID" stamp
- Stamps should be different ✅
```

## Expected Results

### Before Marking as Paid
```
PDF Shows:
- Red "UNPAID" stamp
- Diagonal rotation
- Top-right area
- Semi-transparent
```

### After Marking as Paid
```
PDF Shows:
- Green "PAID" stamp
- Diagonal rotation
- Top-right area
- Semi-transparent
```

## Detailed Testing

### Test 1: New Invoice (UNPAID)
```
Expected: Red "UNPAID" stamp
Steps:
1. Create invoice
2. Download PDF immediately
3. Check stamp color and text
Result: ✅ Red "UNPAID" stamp
```

### Test 2: Mark as Paid
```
Expected: Green "PAID" stamp
Steps:
1. Click "Mark as Paid"
2. Fill payment details
3. Submit form
4. Download PDF
5. Check stamp color and text
Result: ✅ Green "PAID" stamp
```

### Test 3: Multiple Invoices
```
Expected: Each invoice shows correct stamp
Steps:
1. Create Invoice A
2. Create Invoice B
3. Create Invoice C
4. Mark Invoice A as paid
5. Mark Invoice C as paid
6. Download PDFs for all three
7. Verify:
   - Invoice A: Green "PAID" ✅
   - Invoice B: Red "UNPAID" ✅
   - Invoice C: Green "PAID" ✅
```

### Test 4: Stamp Appearance
```
Expected: Professional diagonal stamp
Steps:
1. Download any PDF
2. Check stamp properties:
   - Position: Top-right area ✅
   - Rotation: Diagonal (12 degrees) ✅
   - Opacity: Semi-transparent ✅
   - Border: Colored border ✅
   - Text: Bold and clear ✅
```

### Test 5: Different PDF Viewers
```
Expected: Stamp appears in all viewers
Test with:
- Chrome PDF Viewer ✅
- Firefox PDF Viewer ✅
- Adobe Reader ✅
- Preview (Mac) ✅
- Windows PDF Viewer ✅
- Mobile PDF Viewer ✅
```

## Verification Checklist

### Stamp Appearance
- [ ] Red "UNPAID" stamp on new invoices
- [ ] Green "PAID" stamp after marking as paid
- [ ] Yellow "PARTIALLY PAID" stamp (if applicable)
- [ ] Stamp is diagonal (rotated)
- [ ] Stamp is semi-transparent
- [ ] Stamp has colored border
- [ ] Stamp text is bold and clear
- [ ] Stamp positioned in top-right area

### Stamp Behavior
- [ ] Stamp changes when invoice marked as paid
- [ ] Stamp correct for each invoice
- [ ] Multiple invoices show correct stamps
- [ ] Stamp appears on first download after payment
- [ ] Stamp persists on subsequent downloads

### PDF Quality
- [ ] PDF content not obscured by stamp
- [ ] Invoice details readable
- [ ] All invoice information present
- [ ] Formatting unchanged
- [ ] Layout unchanged

### Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile
- [ ] Works with Adobe Reader

## Troubleshooting

### Issue: Stamp Still Shows UNPAID After Marking as Paid

**Solution:**
1. Clear browser cache
2. Refresh the page
3. Download PDF again
4. Check invoice status shows "PAID" in UI

**If still not working:**
1. Check database: `SELECT paymentStatus FROM Invoice WHERE id = 'xxx'`
2. Verify paymentStatus is "PAID"
3. Check PDF route includes paymentStatus field
4. Restart application

### Issue: Stamp Not Appearing at All

**Solution:**
1. Try different PDF viewer
2. Check browser console for errors
3. Verify PDF generated successfully
4. Check PDF file size (should be normal)

**If still not working:**
1. Check PDF generator code
2. Verify stamp styles defined
3. Check React PDF library version
4. Check for JavaScript errors

### Issue: Wrong Stamp Color

**Solution:**
1. Verify invoice paymentStatus in database
2. Check stamp style colors in pdf-generator.tsx
3. Clear cache and download again

**If still not working:**
1. Check color hex codes
2. Verify CSS/styling applied
3. Check PDF viewer color support

### Issue: Stamp Obscuring Content

**Solution:**
1. Stamp is semi-transparent (30% opacity)
2. Should not obscure important content
3. If obscuring, adjust position in pdf-generator.tsx

**If still not working:**
1. Increase opacity value
2. Change stamp position
3. Adjust stamp size

## Performance Check

### Expected Performance
- PDF generation: < 2 seconds
- Download: Instant
- No lag or delays
- Smooth user experience

### If Slow
1. Check server resources
2. Check database performance
3. Check network speed
4. Check PDF library version

## Database Verification

### Check Invoice Payment Status
```sql
SELECT 
  id,
  invoiceNumber,
  paymentStatus,
  status,
  paidAt
FROM Invoice
WHERE id = 'YOUR_INVOICE_ID';
```

**Expected Output:**
```
id: xxx
invoiceNumber: INV-001
paymentStatus: PAID
status: SENT
paidAt: 2024-01-15 10:30:00
```

### Check Multiple Invoices
```sql
SELECT 
  invoiceNumber,
  paymentStatus,
  paidAt
FROM Invoice
ORDER BY createdAt DESC
LIMIT 10;
```

## Browser Console Check

### Check for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Download PDF
4. Check for any error messages
5. Should see no errors

### Expected Console Output
```
✅ No errors
✅ No warnings
✅ PDF generated successfully
```

## Final Verification

### Checklist Before Confirming Fix
- [ ] Red UNPAID stamp on new invoices
- [ ] Green PAID stamp after marking as paid
- [ ] Stamp appears in all PDF viewers
- [ ] Stamp doesn't obscure content
- [ ] Multiple invoices show correct stamps
- [ ] No errors in console
- [ ] PDF downloads successfully
- [ ] Stamp persists on multiple downloads

### Sign-Off
Once all checks pass:
```
✅ PDF Stamping Fix Verified
✅ Ready for Production
✅ All Tests Passed
```

## Quick Test Script

### Manual Testing (10 minutes)
```
1. Create Invoice A (2 min)
   - Download PDF
   - Verify red UNPAID stamp

2. Mark Invoice A as Paid (2 min)
   - Fill payment details
   - Submit form

3. Download Paid PDF (2 min)
   - Verify green PAID stamp
   - Compare with first PDF

4. Create Invoice B (2 min)
   - Download PDF
   - Verify red UNPAID stamp

5. Verify Results (2 min)
   - Invoice A: Green PAID ✅
   - Invoice B: Red UNPAID ✅
```

## Support

If verification fails:
1. Check PDF-STAMPING-FIX.md for details
2. Review PDF-STAMPING-FEATURE.md for implementation
3. Check app/api/invoices/[id]/pdf/route.ts
4. Check lib/pdf-generator.tsx
5. Contact support with invoice ID

---

**Version**: 1.0
**Date**: 2024
**Status**: Ready for Testing
