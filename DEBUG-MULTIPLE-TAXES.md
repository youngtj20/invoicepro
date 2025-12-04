# Debugging Multiple Taxes Issue

## Problem
Only one tax (VAT) is showing on the invoice, even though two taxes (VAT and WHT) are selected.

## Debugging Steps

### Step 1: Check Browser Console Logs
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Create a new invoice with 2 taxes (VAT and WHT)
4. Look for these logs:

```
Tax selection changed: { newTaxIds: ['tax_id_1', 'tax_id_2'], newTaxRates: [15, 5] }
Submitting invoice with taxIds: ['tax_id_1', 'tax_id_2']
Full invoice data: { ... taxIds: ['tax_id_1', 'tax_id_2'] ... }
Invoice creation response: { ... invoiceTaxes: [...] ... }
```

**What to check:**
- ✅ Are BOTH tax IDs in the `taxIds` array?
- ✅ Are BOTH tax rates showing?
- ✅ Does the response include `invoiceTaxes` with both taxes?

### Step 2: Check Server Logs
1. Look at your server console/terminal
2. You should see logs like:

```
=== INVOICE CREATION START ===
Received invoice data: { ... taxIds: ['tax_id_1', 'tax_id_2'] ... }
taxIds from request: ['tax_id_1', 'tax_id_2']
Validated taxIds: ['tax_id_1', 'tax_id_2']
Creating invoice taxes for taxIds: ['tax_id_1', 'tax_id_2']
Found taxes: 2 [{ id: 'tax_id_1', name: 'VAT', rate: 15 }, { id: 'tax_id_2', name: 'WHT', rate: 5 }]
Creating invoice tax records: [{ invoiceId: 'inv_123', taxId: 'tax_id_1', taxAmount: 150 }, { invoiceId: 'inv_123', taxId: 'tax_id_2', taxAmount: 50 }]
Created invoice taxes: { count: 2 }
```

**What to check:**
- ✅ Are BOTH tax IDs received from the frontend?
- ✅ Are BOTH taxes found in the database?
- ✅ Are BOTH InvoiceTax records being created?
- ✅ Does the count show 2?

### Step 3: Check Database Directly
Run this SQL query to verify the taxes were saved:

```sql
-- Find the invoice
SELECT id, invoiceNumber, subtotal, taxAmount, total 
FROM Invoice 
WHERE invoiceNumber = 'YOUR_INVOICE_NUMBER';

-- Check the taxes for that invoice
SELECT it.id, it.invoiceId, t.name, t.rate, it.taxAmount 
FROM InvoiceTax it
JOIN Tax t ON it.taxId = t.id
WHERE it.invoiceId = 'YOUR_INVOICE_ID'
ORDER BY t.name;
```

**Expected result:**
```
| id | invoiceId | name | rate | taxAmount |
|----|-----------|------|------|-----------|
| 1  | inv_123   | VAT  | 15   | 150       |
| 2  | inv_123   | WHT  | 5    | 50        |
```

### Step 4: Check Invoice Detail Page
1. After creating the invoice, go to the invoice detail page
2. Open browser console
3. Check if the invoice data includes `invoiceTaxes`:

```javascript
// In browser console, you can check the response
// Look for the Network tab and find the GET /api/invoices/[id] request
// Check the Response tab to see if invoiceTaxes is included
```

## Common Issues & Solutions

### Issue 1: Only one tax ID is being sent from frontend
**Symptom:** Console shows `taxIds: ['tax_id_1']` instead of `['tax_id_1', 'tax_id_2']`

**Solution:**
- Check if you're clicking both checkboxes in the Tax Selector
- Look at the "Selected Taxes" summary - it should show both taxes
- Check the "Combined Tax Rate" - it should show 20% (15% + 5%)

### Issue 2: Both tax IDs sent, but only one saved in database
**Symptom:** Server logs show both taxes found, but database only has one InvoiceTax record

**Solution:**
- Check for unique constraint violations in the database
- Run: `SELECT COUNT(*) FROM InvoiceTax WHERE invoiceId = 'YOUR_INVOICE_ID';`
- Should return 2, not 1

### Issue 3: Both taxes saved, but only one showing on invoice detail page
**Symptom:** Database has 2 InvoiceTax records, but invoice detail page only shows VAT

**Solution:**
- Check if the API is including `invoiceTaxes` in the response
- Look at Network tab → GET /api/invoices/[id] → Response
- Should include: `"invoiceTaxes": [{ tax: { name: "VAT", rate: 15 }, ... }, { tax: { name: "WHT", rate: 5 }, ... }]`

## Quick Checklist

- [ ] Both taxes are selected in the Tax Selector (checkboxes checked)
- [ ] "Selected Taxes" summary shows both taxes
- [ ] "Combined Tax Rate" shows 20% (15% + 5%)
- [ ] Browser console shows both tax IDs in `taxIds` array
- [ ] Server logs show "Found taxes: 2"
- [ ] Server logs show "Created invoice taxes: { count: 2 }"
- [ ] Database has 2 InvoiceTax records for the invoice
- [ ] API response includes `invoiceTaxes` array with 2 items
- [ ] Invoice detail page displays both taxes

## Next Steps

1. **Run through the debugging steps above**
2. **Share the console logs** (both browser and server)
3. **Share the database query results**
4. **Share the API response** (from Network tab)

This will help identify exactly where the second tax is being lost.

## Possible Root Causes

1. **Frontend:** Tax selector not sending both IDs
2. **API:** Not creating both InvoiceTax records
3. **Database:** Unique constraint preventing second record
4. **API Response:** Not including invoiceTaxes in response
5. **Frontend Display:** Not rendering all taxes from response

## Testing Manually

To test if the database layer works:

```javascript
// In your Node.js/API environment
const invoice = await prisma.invoice.findUnique({
  where: { id: 'YOUR_INVOICE_ID' },
  include: {
    invoiceTaxes: {
      include: { tax: true }
    }
  }
});

console.log(invoice.invoiceTaxes); // Should show 2 items
```

If this shows 2 items, the problem is in the frontend display.
If this shows 1 item, the problem is in the API creation logic.
