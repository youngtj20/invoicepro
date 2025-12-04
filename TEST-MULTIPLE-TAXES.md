# Testing Multiple Taxes - Step by Step

## Quick Test

Follow these exact steps to test if multiple taxes work:

### Step 1: Create Invoice
1. Go to `/dashboard/invoices/new`
2. Select a customer
3. Select a template
4. Fill in invoice details
5. Add 1 line item (e.g., "Service" - 1000 NGN)
6. **Go to Tax step**
7. **Check BOTH checkboxes** for VAT and WHT
8. **Verify "Selected Taxes" shows both taxes**
9. **Verify "Combined Tax Rate" shows 20%**
10. Go to Preview
11. **Click "Create & Send"**

### Step 2: Check Browser Console
Open F12 → Console tab and look for:

```
Tax state updated: { taxIds: ['id1', 'id2'], taxRates: [15, 5] }
Submitting invoice with taxIds: ['id1', 'id2']
Invoice creation response: { ... invoiceTaxes: [ ... ] ... }
```

**If you see only 1 tax ID, the problem is in the frontend.**
**If you see 2 tax IDs but response shows only 1, the problem is in the API.**

### Step 3: Check Invoice Detail Page
1. After creation, you're redirected to the invoice detail page
2. **Scroll to the Totals section**
3. **You should see:**
   ```
   Subtotal: NGN 1,000.00
   VAT (15%): NGN 150.00
   WHT (5%): NGN 50.00
   ─────────────────────
   Total: NGN 1,200.00
   ```

### Step 4: Check Database (if you have access)
```sql
-- Find your invoice
SELECT id, invoiceNumber FROM Invoice ORDER BY createdAt DESC LIMIT 1;

-- Check taxes for that invoice
SELECT it.id, t.name, t.rate, it.taxAmount 
FROM InvoiceTax it
JOIN Tax t ON it.taxId = t.id
WHERE it.invoiceId = 'YOUR_INVOICE_ID'
ORDER BY t.name;
```

**Expected: 2 rows (one for VAT, one for WHT)**

## Troubleshooting

### Problem: Only VAT showing in "Selected Taxes"
- **Solution:** Make sure you're clicking the WHT checkbox too
- Check that both checkboxes are visually checked

### Problem: "Combined Tax Rate" shows 15% instead of 20%
- **Solution:** You didn't select WHT
- Click the WHT checkbox

### Problem: Both taxes selected, but only VAT on invoice
- **Check console logs** - are both tax IDs being sent?
- If yes, check server logs
- If no, there's a frontend issue

### Problem: Console shows both tax IDs, but invoice shows only VAT
- **Check server logs** - are both taxes being created?
- If yes, check if API response includes both
- If no, there's an API issue

## Expected Console Logs

### Frontend (Browser Console)
```
Tax state updated: { taxIds: ['tax_vat_id', 'tax_wht_id'], taxRates: [15, 5] }
Tax selection changed: { newTaxIds: ['tax_vat_id', 'tax_wht_id'], newTaxRates: [15, 5] }
Submitting invoice with taxIds: ['tax_vat_id', 'tax_wht_id']
Full invoice data: { ... taxIds: ['tax_vat_id', 'tax_wht_id'] ... }
Invoice creation response: { ... invoiceTaxes: [{ tax: { name: 'VAT', rate: 15 }, taxAmount: 150 }, { tax: { name: 'WHT', rate: 5 }, taxAmount: 50 }] ... }
```

### Backend (Server Console)
```
=== INVOICE CREATION START ===
taxIds from request: ['tax_vat_id', 'tax_wht_id']
Validated taxIds: ['tax_vat_id', 'tax_wht_id']
Creating invoice taxes for taxIds: ['tax_vat_id', 'tax_wht_id']
Found taxes: 2 [{ id: 'tax_vat_id', name: 'VAT', rate: 15 }, { id: 'tax_wht_id', name: 'WHT', rate: 5 }]
Creating invoice tax records: [{ invoiceId: 'inv_xxx', taxId: 'tax_vat_id', taxAmount: 150 }, { invoiceId: 'inv_xxx', taxId: 'tax_wht_id', taxAmount: 50 }]
Created invoice taxes: { count: 2 }
```

## If It Still Doesn't Work

1. **Take a screenshot** of the "Selected Taxes" section showing both taxes checked
2. **Copy the browser console logs** (F12 → Console → right-click → Save as)
3. **Copy the server logs** (from your terminal/console)
4. **Share these with me** so I can debug further

The logs will tell us exactly where the second tax is being lost.
