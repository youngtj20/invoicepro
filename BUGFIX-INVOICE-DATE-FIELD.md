# Bug Fix: Invoice Date Field Name Mismatch

## Issue

The application was encountering a Prisma error when creating invoices:

```
Unknown argument `invoiceDate`. Available options are marked with ?.
```

## Root Cause

There was a mismatch between the field name used in the API routes and the actual Prisma schema:

- **API Routes used**: `invoiceDate`
- **Prisma Schema has**: `issueDate`

The `Invoice` model in `prisma/schema.prisma` defines the field as:

```prisma
model Invoice {
  ...
  issueDate       DateTime @default(now())
  dueDate         DateTime?
  ...
}
```

## Files Fixed

### 1. [app/api/invoices/route.ts](app/api/invoices/route.ts)

**Changes:**
- Line 53-59: Changed filter field from `invoiceDate` to `issueDate`
- Line 114: Changed schema validation from `invoiceDate` to `issueDate`
- Line 187: Changed database field from `invoiceDate` to `issueDate`

```typescript
// Before
where.invoiceDate = {};
where.invoiceDate.gte = new Date(startDate);
invoiceDate: z.string().min(1, 'Invoice date is required'),
invoiceDate: new Date(validatedData.invoiceDate),

// After
where.issueDate = {};
where.issueDate.gte = new Date(startDate);
issueDate: z.string().min(1, 'Issue date is required'),
issueDate: new Date(validatedData.issueDate),
```

### 2. [app/api/invoices/[id]/route.ts](app/api/invoices/[id]/route.ts)

**Changes:**
- Line 65: Changed schema validation from `invoiceDate` to `issueDate`
- Line 139: Changed database field from `invoiceDate` to `issueDate`

```typescript
// Before
invoiceDate: z.string().min(1, 'Invoice date is required').optional(),
...(validatedData.invoiceDate && { invoiceDate: new Date(validatedData.invoiceDate) }),

// After
issueDate: z.string().min(1, 'Issue date is required').optional(),
...(validatedData.issueDate && { issueDate: new Date(validatedData.issueDate) }),
```

### 3. [app/api/invoices/[id]/send/route.ts](app/api/invoices/[id]/send/route.ts)

**Changes:**
- Line 99: Map `issueDate` from database to `invoiceDate` for PDF generation
- Line 100: Added optional chaining for `dueDate` (since it's optional in schema)

```typescript
// Before
invoiceDate: invoice.invoiceDate.toISOString(),
dueDate: invoice.dueDate.toISOString(),

// After
invoiceDate: invoice.issueDate.toISOString(),
dueDate: invoice.dueDate?.toISOString() || '',
```

### 4. [app/api/invoices/[id]/pdf/route.ts](app/api/invoices/[id]/pdf/route.ts)

**Changes:**
- Line 47: Map `issueDate` from database to `invoiceDate` for PDF generation
- Line 48: Added optional chaining for `dueDate`

```typescript
// Before
invoiceDate: invoice.invoiceDate.toISOString(),
dueDate: invoice.dueDate.toISOString(),

// After
invoiceDate: invoice.issueDate.toISOString(),
dueDate: invoice.dueDate?.toISOString() || '',
```

## Why Not Change the Interface?

The file `components/templates/types.ts` still uses `invoiceDate` in the `InvoiceData` interface. This is intentional because:

1. **Separation of Concerns**: The interface defines the data structure for PDF generation, which is separate from the database schema
2. **User-Facing Naming**: "Invoice Date" is more user-friendly than "Issue Date"
3. **Mapping Layer**: The API routes act as a mapping layer, translating between database fields (`issueDate`) and display fields (`invoiceDate`)

## Testing

After this fix, the following operations should work correctly:

- ✅ Creating new invoices
- ✅ Updating existing invoices
- ✅ Filtering invoices by date range
- ✅ Sending invoices (PDF generation)
- ✅ Downloading invoice PDFs

## Prevention

To prevent similar issues in the future:

1. **Always check Prisma schema** before writing API routes
2. **Run `npx prisma generate`** after schema changes
3. **Use TypeScript types** from `@prisma/client` for type safety
4. **Test create/update operations** immediately after implementing

## Additional Notes

- The `dueDate` field is now properly handled as optional (`DateTime?` in schema)
- Added optional chaining (`?.`) to prevent runtime errors when `dueDate` is null
- All date filtering now uses the correct `issueDate` field
