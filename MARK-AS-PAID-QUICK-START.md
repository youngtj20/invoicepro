# Mark Invoice as Paid - Quick Start Guide

## What's New?

Users can now mark invoices as paid with a single click, and the system will:
1. ✅ Update invoice payment status to PAID
2. ✅ Display a green "PAID" stamp on the invoice
3. ✅ Automatically generate a receipt
4. ✅ Record payment details and audit trail

## How to Use

### Step 1: Open an Invoice
Navigate to **Dashboard → Invoices** and click on any invoice to view its details.

### Step 2: Mark as Paid
On the invoice detail page, you'll see a green **"Mark as Paid"** button in the top right area.

Click the button to open the payment details form.

### Step 3: Enter Payment Details
Fill in the payment information:
- **Payment Method** (required): Select from dropdown
  - Bank Transfer
  - Cash
  - Check
  - Credit Card
  - Debit Card
  - Mobile Money
  - Paystack
  - Other
- **Payment Reference** (optional): Transaction ID, check number, etc.
- **Payment Date** (optional): Defaults to today
- **Notes** (optional): Any additional information

### Step 4: Confirm
Click **"Mark as Paid"** button in the modal to complete the action.

## What Happens After?

✅ Invoice status changes to **PAID**
✅ Green **"PAID"** stamp appears on the invoice
✅ Receipt is automatically generated
✅ Payment details are recorded
✅ Audit log is updated
✅ "Mark as Paid" button disappears (invoice is now paid)

## Visual Indicators

### Payment Stamps:
- 🟢 **PAID** (Green) - Invoice has been paid
- 🔴 **UNPAID** (Red) - Invoice is awaiting payment (default)
- 🟡 **PARTIALLY PAID** (Yellow) - Invoice has partial payment

### Where to See Stamps:
1. **Invoice Detail Page**: Top right, next to status badge
2. **Invoice List**: New "Payment" column shows stamp for each invoice

## Features

✨ **Automatic Receipt Generation**
- Receipt is created automatically with sequential numbering
- Contains payment method and reference information

📋 **Audit Trail**
- All payment actions are logged
- Track who marked invoice as paid and when

🔒 **Data Integrity**
- Prevents marking already-paid invoices
- Validates all required information
- Uses database transactions for consistency

📱 **Mobile Friendly**
- Works seamlessly on desktop and mobile
- Responsive payment form
- Touch-friendly buttons

## Common Scenarios

### Scenario 1: Customer Paid via Bank Transfer
1. Click "Mark as Paid"
2. Select "Bank Transfer" as payment method
3. Enter transaction reference (e.g., "TXN-2024-001")
4. Click "Mark as Paid"
5. Invoice is now marked as paid with receipt generated

### Scenario 2: Customer Paid in Cash
1. Click "Mark as Paid"
2. Select "Cash" as payment method
3. Leave reference blank (optional)
4. Add note: "Cash received in person"
5. Click "Mark as Paid"
6. Invoice is now marked as paid

### Scenario 3: Check Payment
1. Click "Mark as Paid"
2. Select "Check" as payment method
3. Enter check number in reference field
4. Set payment date to when check was received
5. Click "Mark as Paid"
6. Invoice is now marked as paid

## Troubleshooting

### "Cannot mark invoice as paid" error
- Invoice might already be marked as paid
- Check if payment status shows "PAID" (green stamp)
- Try refreshing the page

### Payment method not showing
- Ensure you've selected a payment method from the dropdown
- It's a required field

### Receipt not appearing
- Receipt is created automatically in the background
- Check the Receipts section in your dashboard
- It will have a sequential number (REC-0001, REC-0002, etc.)

## Tips & Best Practices

💡 **Always Enter Payment Method**
- Required field for tracking payment source
- Helps with accounting and reconciliation

💡 **Use Payment Reference**
- Enter transaction ID, check number, or reference
- Makes it easy to match with bank statements

💡 **Add Notes When Needed**
- Document any special conditions
- Useful for future reference

💡 **Check Invoice List**
- Payment column shows status at a glance
- Quickly identify paid vs unpaid invoices

## What Gets Recorded?

When you mark an invoice as paid, the system records:
- ✅ Invoice ID and number
- ✅ Payment status (PAID)
- ✅ Payment date/time
- ✅ Payment method
- ✅ Payment reference
- ✅ Payment notes
- ✅ User who marked it as paid
- ✅ Timestamp of action
- ✅ Auto-generated receipt number

## Next Steps

After marking an invoice as paid:
1. **View Receipt**: Check the Receipts section for the auto-generated receipt
2. **Download PDF**: Download invoice PDF with payment status
3. **Send Confirmation**: Send receipt to customer if needed
4. **Track Payment**: Monitor payment in your accounting records

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full documentation in `MARK-AS-PAID-FEATURE.md`
3. Contact support with invoice number and payment details

---

**Version**: 1.0
**Last Updated**: 2024
**Status**: Ready for Production
