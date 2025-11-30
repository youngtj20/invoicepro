# PDF Invoice Stamping Feature - Implementation Summary

## Overview
This feature adds payment status stamps to generated PDF invoices. The stamps are displayed diagonally across the invoice to clearly indicate the payment status at a glance.

## Features Implemented

### 1. **Payment Status Stamps**
The PDF generator now displays color-coded stamps based on invoice payment status:

#### PAID Stamp (Green)
- **Color**: Green (#059669)
- **Border**: 6px solid green
- **Text**: "PAID"
- **Opacity**: 30% (semi-transparent)
- **Rotation**: 12 degrees diagonal
- **Position**: Top-right area of invoice

#### UNPAID Stamp (Red)
- **Color**: Red (#DC2626)
- **Border**: 6px solid red
- **Text**: "UNPAID"
- **Opacity**: 30% (semi-transparent)
- **Rotation**: 12 degrees diagonal
- **Position**: Top-right area of invoice
- **Default**: Shown on all invoices by default

#### PARTIALLY_PAID Stamp (Yellow/Amber)
- **Color**: Amber (#F59E0B)
- **Border**: 6px solid amber
- **Text**: "PARTIALLY PAID"
- **Opacity**: 30% (semi-transparent)
- **Rotation**: 12 degrees diagonal
- **Position**: Top-right area of invoice

### 2. **Automatic Stamp Selection**
The stamp is automatically selected based on the invoice's `paymentStatus` field:
- If `paymentStatus === 'PAID'` → Green PAID stamp
- If `paymentStatus === 'PARTIALLY_PAID'` → Yellow PARTIALLY PAID stamp
- If `paymentStatus === 'UNPAID'` or undefined → Red UNPAID stamp (default)

### 3. **Receipt PDF Stamping**
Receipts always display the green "PAID" stamp since they represent completed payments.

## Technical Implementation

### Updated Files

#### `lib/pdf-generator.tsx`
**Changes Made:**
1. Added `paymentStatus` field to `InvoiceData` interface
2. Created three stamp styles:
   - `paidStamp` - Green styling
   - `unpaidStamp` - Red styling
   - `partiallyPaidStamp` - Yellow styling
3. Added helper functions:
   - `getStampStyle(paymentStatus)` - Returns appropriate style
   - `getStampText(paymentStatus)` - Returns appropriate text
4. Updated `InvoicePDF` component to render dynamic stamps
5. Kept `ReceiptPDF` with static PAID stamp

### Stamp Styling Details

```typescript
// Stamp Style Properties
{
  position: 'absolute',      // Positioned absolutely on page
  top: 150,                  // 150px from top
  right: 100,                // 100px from right
  transform: 'rotate(12deg)', // 12 degree rotation
  border: '6 solid #COLOR',  // 6px solid border
  color: '#COLOR',           // Text color
  fontSize: 48,              // Large font size
  fontWeight: 'bold',        // Bold text
  padding: '20 40',          // Padding around text
  opacity: 0.3,              // 30% opacity (semi-transparent)
}
```

## Usage

### For Invoice PDFs
The stamp is automatically applied when generating invoice PDFs. The `paymentStatus` field from the invoice data determines which stamp is displayed.

```typescript
// Example invoice data
const invoiceData = {
  invoiceNumber: 'INV-001',
  paymentStatus: 'PAID', // Determines stamp color
  // ... other fields
};

// PDF is generated with appropriate stamp
const pdf = <InvoicePDF invoice={invoiceData} />;
```

### For Receipt PDFs
Receipts always show the green PAID stamp:

```typescript
const receiptData = {
  receiptNumber: 'REC-001',
  // ... other fields
};

// PDF is generated with PAID stamp
const pdf = <ReceiptPDF receipt={receiptData} />;
```

## Visual Examples

### PAID Invoice
- Green diagonal stamp reading "PAID"
- Indicates invoice has been fully paid
- Appears on invoices with `paymentStatus === 'PAID'`

### UNPAID Invoice
- Red diagonal stamp reading "UNPAID"
- Indicates invoice is awaiting payment
- Default stamp for new invoices
- Appears on invoices with `paymentStatus === 'UNPAID'` or undefined

### PARTIALLY PAID Invoice
- Yellow/Amber diagonal stamp reading "PARTIALLY PAID"
- Indicates partial payment has been received
- Appears on invoices with `paymentStatus === 'PARTIALLY_PAID'`

## Color Scheme

| Status | Color | Hex Code | RGB |
|--------|-------|----------|-----|
| PAID | Green | #059669 | rgb(5, 150, 105) |
| UNPAID | Red | #DC2626 | rgb(220, 38, 38) |
| PARTIALLY_PAID | Amber | #F59E0B | rgb(245, 158, 11) |

## Stamp Positioning

The stamps are positioned in the top-right area of the invoice:
- **Top**: 150px from page top
- **Right**: 100px from page right
- **Rotation**: 12 degrees (diagonal)
- **Opacity**: 30% (semi-transparent to not obscure content)

This positioning ensures:
- Stamps are visible and prominent
- Stamps don't obscure critical invoice information
- Professional appearance with diagonal rotation
- Consistent placement across all invoices

## Integration with Mark as Paid Feature

When an invoice is marked as paid:
1. `paymentStatus` is updated to `PAID`
2. Next PDF generation will show green PAID stamp
3. Receipt is automatically generated with PAID stamp
4. Both documents clearly indicate payment status

## Browser/PDF Viewer Compatibility

The stamps use standard PDF styling that works across:
- All modern PDF viewers
- Browser PDF viewers
- Desktop PDF applications
- Mobile PDF readers

## Customization Options

To customize stamps, modify these in `lib/pdf-generator.tsx`:

### Change Stamp Colors
```typescript
paidStamp: {
  border: '6 solid #YOUR_COLOR',
  color: '#YOUR_COLOR',
  // ...
}
```

### Change Stamp Position
```typescript
paidStamp: {
  top: 150,    // Adjust vertical position
  right: 100,  // Adjust horizontal position
  // ...
}
```

### Change Stamp Rotation
```typescript
paidStamp: {
  transform: 'rotate(12deg)', // Change rotation angle
  // ...
}
```

### Change Stamp Opacity
```typescript
paidStamp: {
  opacity: 0.3, // Change transparency (0-1)
  // ...
}
```

### Change Stamp Font Size
```typescript
paidStamp: {
  fontSize: 48, // Change text size
  // ...
}
```

## Testing

### Test Cases

1. **PAID Invoice PDF**
   - Create invoice
   - Mark as paid
   - Download PDF
   - Verify green PAID stamp appears

2. **UNPAID Invoice PDF**
   - Create invoice
   - Download PDF without marking as paid
   - Verify red UNPAID stamp appears

3. **PARTIALLY PAID Invoice PDF**
   - Create invoice
   - Mark as partially paid (if implemented)
   - Download PDF
   - Verify yellow PARTIALLY PAID stamp appears

4. **Receipt PDF**
   - Mark invoice as paid
   - Download receipt PDF
   - Verify green PAID stamp appears

## Performance Considerations

- Stamps are rendered as part of PDF generation
- No additional API calls required
- Minimal performance impact
- Stamps are static (not animated)
- Works efficiently with large invoices

## Accessibility

- Stamps use color coding for visual indication
- Text labels ("PAID", "UNPAID", etc.) provide text-based indication
- Semi-transparent design doesn't obscure critical information
- Works with all PDF accessibility features

## Future Enhancements

1. **Custom Stamp Text**: Allow users to customize stamp text
2. **Stamp Position**: Make stamp position configurable
3. **Stamp Styling**: Allow custom colors and fonts
4. **Multiple Stamps**: Support multiple stamps on single invoice
5. **Conditional Stamps**: Add stamps based on other criteria
6. **Watermarks**: Convert stamps to watermarks for different effect
7. **Localization**: Support stamp text in multiple languages

## Troubleshooting

### Stamp Not Appearing
- Verify `paymentStatus` field is set correctly
- Check PDF viewer supports absolute positioning
- Ensure opacity is not set to 0

### Stamp Obscuring Content
- Adjust `top` and `right` values
- Increase `opacity` value to make more transparent
- Change stamp position

### Stamp Text Not Visible
- Check `color` and `border` values
- Verify `fontSize` is large enough
- Ensure `fontWeight` is set to 'bold'

## Files Modified

1. **lib/pdf-generator.tsx**
   - Added `paymentStatus` to `InvoiceData` interface
   - Added three stamp styles
   - Added helper functions for stamp selection
   - Updated `InvoicePDF` component

## Related Features

- **Mark as Paid**: Updates `paymentStatus` field
- **Receipt Generation**: Auto-generated when invoice marked as paid
- **Payment Stamps (UI)**: Visual indicators in web interface
- **Invoice List**: Shows payment status in table

## Documentation

- See `MARK-AS-PAID-FEATURE.md` for payment marking feature
- See `MARK-AS-PAID-QUICK-START.md` for user guide
- See `lib/pdf-generator.tsx` for implementation details

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Production
