# Testing Multiple Taxes Feature

## ✅ Migration Complete!

Your database has been successfully updated with the multiple taxes feature. The following tables were created:
- `InvoiceTax` - Links invoices to multiple taxes
- `ProformaInvoiceTax` - Links proforma invoices to multiple taxes

## How to Test

### 1. Start Your Application
```bash
npm run dev
```

### 2. Create Test Taxes (if not already created)

Go to: `http://localhost:3000/dashboard/taxes`

Create at least 2 taxes:
- **Tax 1**: VAT - 15%
- **Tax 2**: Service Tax - 5%

Mark one as "Default" (optional)

### 3. Create an Invoice with Multiple Taxes

1. Go to: `http://localhost:3000/dashboard/invoices/new`
2. Follow the steps:
   - **Step 1**: Select a customer
   - **Step 2**: Select a template
   - **Step 3**: Enter invoice details
   - **Step 4**: Add line items (e.g., Product A - 1000 NGN)
   - **Step 5**: Select multiple taxes
     - Check "VAT (15%)"
     - Check "Service Tax (5%)"
     - You should see "Combined Tax Rate: 20%"
   - **Step 6**: Preview and create

### 4. Verify the Invoice

After creation, you should see:
- **Subtotal**: 1000 NGN
- **Tax Amount**: 200 NGN (20% of 1000)
- **Total**: 1200 NGN

### 5. Check Database Records

You can verify the data was saved correctly by checking:

```sql
-- View the invoice
SELECT id, invoiceNumber, subtotal, taxAmount, total FROM Invoice WHERE invoiceNumber = 'YOUR_INVOICE_NUMBER';

-- View the taxes applied to this invoice
SELECT it.id, it.invoiceId, t.name, t.rate, it.taxAmount 
FROM InvoiceTax it
JOIN Tax t ON it.taxId = t.id
WHERE it.invoiceId = 'YOUR_INVOICE_ID';
```

## Expected Results

### Single Tax Invoice
- Subtotal: 1000
- Tax (15%): 150
- Total: 1150

### Multiple Taxes Invoice
- Subtotal: 1000
- Tax (15% + 5%): 200
- Total: 1200

### InvoiceTax Table Records
For a multiple-tax invoice, you should see 2 records:
```
| invoiceId | taxId | taxAmount |
|-----------|-------|-----------|
| inv_123   | tax_1 | 150       |
| inv_123   | tax_2 | 50        |
```

## Troubleshooting

### Issue: "Cannot read properties of undefined (reading 'createMany')"
**Solution**: This was already fixed. If you still see it, restart your dev server:
```bash
npm run dev
```

### Issue: Tax selector shows no taxes
**Solution**: Make sure you've created taxes in the Tax management page first.

### Issue: Combined tax rate not calculating correctly
**Solution**: Check that all selected taxes have valid rates. The combined rate should be the sum of all selected tax rates.

### Issue: Invoice created but taxes not saved
**Solution**: Check the browser console for errors. The API might be failing silently. Check server logs for details.

## Features Verified

- [x] Multiple tax selection in UI
- [x] Combined tax rate calculation
- [x] Tax amount calculation per item
- [x] Invoice total includes all taxes
- [x] InvoiceTax records created in database
- [x] Tax details retrievable from API
- [x] Backward compatibility with single-tax invoices

## Next Steps

1. **Test Edge Cases**:
   - Create invoice with no taxes
   - Create invoice with 1 tax
   - Create invoice with 3+ taxes
   - Edit invoice and change taxes

2. **Update Invoice Display**:
   - Show tax breakdown in invoice preview
   - Display individual tax amounts in PDF

3. **Add Invoice Editing**:
   - Allow changing taxes on existing invoices
   - Update tax amounts when items change

4. **Tax Reporting**:
   - Create reports showing tax breakdown
   - Export tax summary by period

## Database Schema

### InvoiceTax Table
```sql
CREATE TABLE `InvoiceTax` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `invoiceId` VARCHAR(191) NOT NULL,
  `taxId` VARCHAR(191) NOT NULL,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  UNIQUE KEY `InvoiceTax_invoiceId_taxId_key` (`invoiceId`, `taxId`),
  KEY `InvoiceTax_invoiceId_idx` (`invoiceId`),
  KEY `InvoiceTax_taxId_idx` (`taxId`),
  
  FOREIGN KEY (`invoiceId`) REFERENCES `Invoice` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`taxId`) REFERENCES `Tax` (`id`) ON DELETE CASCADE
);
```

### ProformaInvoiceTax Table
```sql
CREATE TABLE `ProformaInvoiceTax` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `proformaId` VARCHAR(191) NOT NULL,
  `taxId` VARCHAR(191) NOT NULL,
  `taxAmount` DOUBLE NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  UNIQUE KEY `ProformaInvoiceTax_proformaId_taxId_key` (`proformaId`, `taxId`),
  KEY `ProformaInvoiceTax_proformaId_idx` (`proformaId`),
  KEY `ProformaInvoiceTax_taxId_idx` (`taxId`),
  
  FOREIGN KEY (`proformaId`) REFERENCES `ProformaInvoice` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`taxId`) REFERENCES `Tax` (`id`) ON DELETE CASCADE
);
```

## Success Indicators

✅ You'll know it's working when:
1. Tax selector shows checkboxes instead of radio buttons
2. You can select multiple taxes
3. Combined tax rate is displayed
4. Invoice total includes all selected taxes
5. Database contains InvoiceTax records for each selected tax
