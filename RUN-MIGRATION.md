# Run These Commands Now

The schema has been fixed. Run these commands in order:

## Step 1: Generate Prisma Client
```bash
npx prisma generate
```

## Step 2: Create and Apply Migration
```bash
npx prisma migrate dev --name add_multiple_taxes_support
```

## Step 3: Verify
```bash
npx prisma db push
```

## If you still get errors, try:

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Reinstall
npm install

# Generate client
npx prisma generate

# Run migration
npx prisma migrate dev --name add_multiple_taxes_support
```

## What was fixed:

The Tax model now includes the opposite relation fields:
- `invoices: Invoice[]` - for legacy single-tax support
- `proformaInvoices: ProformaInvoice[]` - for legacy single-tax support
- `invoiceTaxes: InvoiceTax[]` - for new multiple-tax support
- `proformaInvoiceTaxes: ProformaInvoiceTax[]` - for new multiple-tax support

This allows Prisma to properly validate the schema and create the migration.
