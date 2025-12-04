# Multiple Taxes Implementation

## Overview
This implementation allows users to apply multiple taxes to a single invoice. Previously, only one tax could be applied per invoice. Now users can select multiple taxes, and the system will calculate the combined tax amount.

## Changes Made

### 1. Database Schema Updates (`prisma/schema.prisma`)

#### New Models
- **InvoiceTax**: Junction table linking invoices to multiple taxes
  - `invoiceId`: Reference to Invoice
  - `taxId`: Reference to Tax
  - `taxAmount`: Calculated tax amount for this specific tax
  - Unique constraint on (invoiceId, taxId) to prevent duplicate tax assignments

- **ProformaInvoiceTax**: Junction table for proforma invoices (future support)
  - Similar structure to InvoiceTax

#### Updated Models
- **Invoice**: Added `invoiceTaxes` relationship to InvoiceTax
- **ProformaInvoice**: Added `proformaInvoiceTaxes` relationship to ProformaInvoiceTax
- **Tax**: Updated relationships to use junction tables

### 2. Frontend Components

#### TaxSelector Component (`components/invoice/TaxSelector.tsx`)
**Changes:**
- Changed from radio buttons (single selection) to checkboxes (multiple selection)
- Updated props: `selectedTaxId` → `selectedTaxIds` (array)
- Updated callback: `onSelect(taxId, rate)` → `onSelect(taxIds, rates)` (arrays)
- Added "Selected Taxes Summary" section showing:
  - All selected taxes with their rates
  - Combined tax rate calculation
  - Individual remove buttons for each tax
  - "Clear All" button
- Improved UI with visual feedback for selected taxes

#### Invoice Creation Page (`app/dashboard/invoices/new/page.tsx`)
**Changes:**
- Updated state management:
  - `taxId` → `taxIds` (array)
  - `taxRate` → `taxRates` (array)
- Updated `handleTaxSelect` function to:
  - Accept arrays of tax IDs and rates
  - Calculate combined tax rate
  - Apply combined rate to all line items
- Updated form submission to include `taxIds` in invoice data

### 3. API Endpoint Updates

#### Invoice Creation API (`app/api/invoices/route.ts`)
**Changes:**
- Updated validation schema to accept `taxIds` array
- Enhanced transaction to:
  - Create InvoiceTax records for each selected tax
  - Calculate individual tax amounts per tax
  - Include invoiceTaxes in response with tax details
- Improved error handling and logging

## How It Works

### User Flow
1. User creates a new invoice and reaches the "Tax" step
2. User can now select multiple taxes using checkboxes
3. Selected taxes are displayed in a summary section showing:
   - Tax name and rate
   - Combined total rate
   - Individual remove buttons
4. User can clear all taxes or remove individual ones
5. Combined tax rate is applied to all line items
6. Invoice is created with all selected taxes stored in InvoiceTax junction table

### Tax Calculation
- **Combined Tax Rate**: Sum of all selected tax rates
- **Tax Amount per Item**: (Item Subtotal × Combined Tax Rate) / 100
- **Total Tax Amount**: Sum of all item tax amounts
- **Invoice Total**: Subtotal + Total Tax Amount

### Database Storage
- Invoice record stores total `taxAmount`
- InvoiceTax records store individual tax amounts for each tax
- This allows for detailed tax reporting and breakdown

## Backward Compatibility

The implementation maintains backward compatibility:
- Existing invoices with single tax continue to work
- The old `taxId` and `tax` fields on Invoice model remain for legacy support
- New invoices use the InvoiceTax junction table
- Both systems can coexist during migration period

## Future Enhancements

1. **Invoice Display**: Update invoice preview and PDF templates to show tax breakdown
2. **Invoice Editing**: Implement ability to edit taxes on existing invoices
3. **Proforma Invoices**: Extend multiple tax support to proforma invoices
4. **Tax Reporting**: Add reports showing tax breakdown by invoice
5. **Tax Rules**: Implement conditional tax rules (e.g., apply tax only to certain items)
6. **Tax Exemptions**: Add ability to exempt specific items from taxes

## Testing Checklist

- [ ] Create invoice with no taxes
- [ ] Create invoice with single tax
- [ ] Create invoice with multiple taxes
- [ ] Verify tax amounts are calculated correctly
- [ ] Verify combined tax rate is displayed
- [ ] Verify invoice total includes all taxes
- [ ] Test removing individual taxes
- [ ] Test clearing all taxes
- [ ] Verify database stores all tax relationships
- [ ] Test invoice retrieval with tax details

## Files Modified

1. `prisma/schema.prisma` - Database schema
2. `components/invoice/TaxSelector.tsx` - Tax selection UI
3. `app/dashboard/invoices/new/page.tsx` - Invoice creation page
4. `app/api/invoices/route.ts` - Invoice API endpoint

## Migration Notes

To apply these changes to your database:

```bash
# Generate migration
npx prisma migrate dev --name add_multiple_taxes

# Or apply existing migration
npx prisma migrate deploy
```

The migration will:
- Create InvoiceTax table
- Create ProformaInvoiceTax table
- Add invoiceTaxes relationship to Invoice
- Add proformaInvoiceTaxes relationship to ProformaInvoice
