# PDF Stamping - Quick Reference Guide

## What's New?

Invoice PDFs now display payment status stamps:
- 🟢 **PAID** (Green) - Invoice is fully paid
- 🔴 **UNPAID** (Red) - Invoice awaiting payment (default)
- 🟡 **PARTIALLY PAID** (Yellow) - Partial payment received

## How It Works

### Automatic Stamping
When you download an invoice PDF, the system automatically adds a stamp based on the invoice's payment status:

```
Invoice Payment Status → PDF Stamp
PAID                  → Green "PAID" stamp
UNPAID                → Red "UNPAID" stamp
PARTIALLY_PAID        → Yellow "PARTIALLY PAID" stamp
```

### Stamp Appearance
- **Position**: Top-right area of invoice
- **Rotation**: 12 degrees diagonal
- **Opacity**: 30% (semi-transparent)
- **Size**: Large and prominent
- **Style**: Bold text with colored border

## User Workflow

### 1. Create Invoice
```
Create Invoice → Default: UNPAID status
                → PDF shows red "UNPAID" stamp
```

### 2. Mark as Paid
```
Click "Mark as Paid" → Select payment method
                    → Invoice status changes to PAID
                    → Next PDF download shows green "PAID" stamp
```

### 3. Download PDF
```
Click "Download PDF" → PDF generated with appropriate stamp
                    → Green stamp if PAID
                    → Red stamp if UNPAID
                    → Yellow stamp if PARTIALLY PAID
```

## Stamp Colors & Meanings

| Stamp | Color | Meaning | Action |
|-------|-------|---------|--------|
| PAID | 🟢 Green | Invoice fully paid | No action needed |
| UNPAID | 🔴 Red | Awaiting payment | Send payment reminder |
| PARTIALLY PAID | 🟡 Yellow | Partial payment received | Follow up for remaining balance |

## Examples

### Example 1: New Invoice
```
1. Create invoice for $1,000
2. Download PDF
3. PDF shows red "UNPAID" stamp
4. Send to customer
```

### Example 2: Mark as Paid
```
1. Customer pays invoice
2. Click "Mark as Paid"
3. Select "Bank Transfer"
4. Enter transaction reference
5. Click "Mark as Paid"
6. Download PDF
7. PDF now shows green "PAID" stamp
```

### Example 3: Partial Payment
```
1. Customer pays $500 of $1,000 invoice
2. Mark as PARTIALLY_PAID (if implemented)
3. Download PDF
4. PDF shows yellow "PARTIALLY PAID" stamp
5. Follow up for remaining $500
```

## Stamp Details

### PAID Stamp (Green)
```
Color:     #059669 (Green)
Text:      "PAID"
Border:    6px solid green
Opacity:   30%
Rotation:  12 degrees
Position:  Top-right area
```

### UNPAID Stamp (Red)
```
Color:     #DC2626 (Red)
Text:      "UNPAID"
Border:    6px solid red
Opacity:   30%
Rotation:  12 degrees
Position:  Top-right area
```

### PARTIALLY PAID Stamp (Yellow)
```
Color:     #F59E0B (Amber/Yellow)
Text:      "PARTIALLY PAID"
Border:    6px solid amber
Opacity:   30%
Rotation:  12 degrees
Position:  Top-right area
```

## Features

✅ **Automatic**: Stamps applied automatically based on payment status
✅ **Color-Coded**: Easy visual identification of payment status
✅ **Professional**: Diagonal rotation for professional appearance
✅ **Non-Intrusive**: Semi-transparent design doesn't obscure content
✅ **Consistent**: Same stamp style across all invoices
✅ **Reliable**: Works with all PDF viewers

## Common Tasks

### Download Paid Invoice PDF
```
1. Go to invoice detail page
2. Verify status shows "PAID" (green stamp visible)
3. Click "Download PDF"
4. PDF opens with green "PAID" stamp
```

### Download Unpaid Invoice PDF
```
1. Go to invoice detail page
2. Verify status shows "UNPAID" (red stamp visible)
3. Click "Download PDF"
4. PDF opens with red "UNPAID" stamp
```

### Send Invoice to Customer
```
1. Create invoice
2. Download PDF (shows red "UNPAID" stamp)
3. Send PDF to customer
4. Customer sees payment status clearly
```

### Confirm Payment Received
```
1. Customer sends payment confirmation
2. Go to invoice detail page
3. Click "Mark as Paid"
4. Fill in payment details
5. Download PDF (now shows green "PAID" stamp)
6. Send to customer as confirmation
```

## Tips & Best Practices

💡 **Always Download After Marking as Paid**
- Ensures PDF has correct stamp
- Provides proof of payment status

💡 **Use Payment Reference**
- Helps match payments to invoices
- Useful for accounting records

💡 **Send Stamped PDF to Customer**
- Confirms payment status
- Professional documentation
- Reduces payment inquiries

💡 **Archive Stamped PDFs**
- Keep records with payment status
- Easy to verify payment history
- Useful for audits

## Troubleshooting

### Stamp Not Showing in PDF
- Refresh page and download again
- Check PDF viewer supports stamps
- Verify invoice payment status is set

### Wrong Stamp Color
- Verify invoice payment status
- Check if status was updated correctly
- Download PDF again

### Stamp Obscuring Content
- Stamp is semi-transparent (30% opacity)
- Should not obscure important information
- Contact support if content is hidden

## Integration Points

### With Mark as Paid Feature
- When invoice marked as paid
- `paymentStatus` updated to PAID
- Next PDF download shows green stamp

### With Receipt Generation
- Receipt always shows green PAID stamp
- Indicates payment has been received
- Professional payment confirmation

### With Invoice List
- Payment column shows status
- Matches PDF stamp color
- Quick visual reference

## PDF Viewer Compatibility

Works with:
- ✅ Chrome PDF Viewer
- ✅ Firefox PDF Viewer
- ✅ Safari PDF Viewer
- ✅ Adobe Reader
- ✅ Preview (Mac)
- ✅ Windows PDF Viewer
- ✅ Mobile PDF Viewers

## Performance

- ⚡ No additional load time
- ⚡ Stamps rendered during PDF generation
- ⚡ Works efficiently with large invoices
- ⚡ No impact on system performance

## Security

- 🔒 Stamps are part of PDF document
- 🔒 Cannot be removed without editing PDF
- 🔒 Provides proof of payment status
- 🔒 Audit trail maintained in system

## Customization

To customize stamps, contact your administrator:
- Change stamp colors
- Adjust stamp position
- Modify stamp text
- Change rotation angle
- Adjust opacity level

## Support

For issues:
1. Check troubleshooting section above
2. Verify invoice payment status
3. Try downloading PDF again
4. Contact support with invoice number

## Related Features

- **Mark as Paid**: Update invoice payment status
- **Receipt Generation**: Auto-generated when paid
- **Payment Stamps (UI)**: Visual indicators in web interface
- **Invoice List**: Shows payment status

## FAQ

**Q: Can I remove the stamp from PDF?**
A: No, stamps are part of the PDF document. They indicate payment status.

**Q: Why is my invoice showing UNPAID stamp?**
A: Invoice hasn't been marked as paid yet. Click "Mark as Paid" to change status.

**Q: Can I customize the stamp?**
A: Contact your administrator for customization options.

**Q: Does the stamp appear on receipts?**
A: Yes, receipts always show green "PAID" stamp.

**Q: Can I print the PDF with stamp?**
A: Yes, stamps print with the PDF document.

**Q: Is the stamp watermark?**
A: No, it's a semi-transparent overlay that doesn't obscure content.

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Use
