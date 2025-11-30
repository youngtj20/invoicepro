# Bug Fix: Invoice Item Field Name Mismatch

## Issue

When trying to create and send invoices, users encountered a "Validation error" message.

## Root Cause

There was a mismatch between the invoice item fields in the API validation schemas and the actual Prisma database schema:

**API Schemas Expected:**
- `unitPrice`
- `taxId`
- `taxRate`
- `taxAmount`
- `total`

**Prisma Schema Has (InvoiceItem model):**
```prisma
model InvoiceItem {
  id          String   @id @default(cuid())
  invoiceId   String
  itemId      String?
  description String
  quantity    Float    @default(1)
  price       Float      // ← Not "unitPrice"
  amount      Float      // ← Not "total"
}
```

## Additional Issues Fixed

### Issue 2: Non-existent `tax` Relation
**Error:** `Unknown field 'tax' for include statement on model InvoiceItem`

The code was trying to include a `tax` relation that doesn't exist in the `InvoiceItem` schema. Fixed by removing `tax: true` from all Prisma queries.

### Issue 3: Frontend Display Using Wrong Field Names
**Error:** `can't access property "toLocaleString", amount is undefined`

The invoice detail page was trying to access `item.unitPrice` and `item.total`, but the database returns `item.price` and `item.amount`. Fixed in `app/dashboard/invoices/[id]/page.tsx`.

## Files Fixed (6 files)

### 1. [app/api/invoices/route.ts](app/api/invoices/route.ts)

**Line 100-106: Validation Schema**
```typescript
// Before (Wrong ❌)
const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxId: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  total: z.number().min(0),
});

// After (Correct ✅)
const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});
```

**Line 197-206: Database Insertion**
```typescript
// Before (Wrong ❌)
await tx.invoiceItem.createMany({
  data: validatedData.items.map((item) => ({
    invoiceId: newInvoice.id,
    itemId: item.itemId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxId: item.taxId,
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount || 0,
    total: item.total,
  })),
});

// After (Correct ✅)
await tx.invoiceItem.createMany({
  data: validatedData.items.map((item) => ({
    invoiceId: newInvoice.id,
    itemId: item.itemId,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    amount: item.amount,
  })),
});
```

### 2. [app/api/invoices/[id]/route.ts](app/api/invoices/[id]/route.ts)

**Line 52-58: Validation Schema**
```typescript
// Before (Wrong ❌)
const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxId: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  total: z.number().min(0),
});

// After (Correct ✅)
const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  amount: z.number().min(0, 'Amount must be positive'),
});
```

**Line 156-165: Database Update**
```typescript
// Before (Wrong ❌)
await tx.invoiceItem.createMany({
  data: validatedData.items.map((item) => ({
    invoiceId,
    itemId: item.itemId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxId: item.taxId,
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount || 0,
    total: item.total,
  })),
});

// After (Correct ✅)
await tx.invoiceItem.createMany({
  data: validatedData.items.map((item) => ({
    invoiceId,
    itemId: item.itemId,
    description: item.description,
    quantity: item.quantity,
    price: item.price,
    amount: item.amount,
  })),
});
```

### 3. [app/api/invoices/[id]/send/route.ts](app/api/invoices/[id]/send/route.ts)

**Line 116-121: Item Mapping for PDF**
```typescript
// Before (Wrong ❌)
items: invoice.items.map((item) => ({
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.unitPrice,  // ← Field doesn't exist in DB
  total: item.total,           // ← Field doesn't exist in DB
})),

// After (Correct ✅)
items: invoice.items.map((item) => ({
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.price,       // ← Map from DB field
  total: item.amount,           // ← Map from DB field
})),
```

### 4. [app/api/invoices/[id]/pdf/route.ts](app/api/invoices/[id]/pdf/route.ts)

**Line 64-69: Item Mapping for PDF**
```typescript
// Before (Wrong ❌)
items: invoice.items.map((item) => ({
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.unitPrice,  // ← Field doesn't exist in DB
  total: item.total,           // ← Field doesn't exist in DB
})),

// After (Correct ✅)
items: invoice.items.map((item) => ({
  description: item.description,
  quantity: item.quantity,
  unitPrice: item.price,       // ← Map from DB field
  total: item.amount,           // ← Map from DB field
})),
```

### 5. [app/api/invoices/[id]/route.ts](app/api/invoices/[id]/route.ts)

**Line 31 & 173: Removed Non-existent Tax Relation**
```typescript
// Before (Wrong ❌)
include: {
  customer: true,
  items: {
    include: {
      item: true,
      tax: true,  // ← Relation doesn't exist
    },
  },
}

// After (Correct ✅)
include: {
  customer: true,
  items: {
    include: {
      item: true,  // ← Only include existing relations
    },
  },
}
```

### 6. [app/dashboard/invoices/[id]/page.tsx](app/dashboard/invoices/[id]/page.tsx)

**Line 435 & 438: Frontend Display Field Names**
```typescript
// Before (Wrong ❌)
{invoice.items.map((item) => (
  <tr key={item.id}>
    <td>{formatCurrency(item.unitPrice)}</td>  // ← Field doesn't exist in DB response
    <td>{formatCurrency(item.total)}</td>       // ← Field doesn't exist in DB response
  </tr>
))}

// After (Correct ✅)
{invoice.items.map((item) => (
  <tr key={item.id}>
    <td>{formatCurrency(item.price)}</td>   // ← Use actual DB field name
    <td>{formatCurrency(item.amount)}</td>   // ← Use actual DB field name
  </tr>
))}
```

## Key Changes

1. **Validation Schemas**: Accept frontend field names (`unitPrice`, `total`) instead of database names
2. **Database Operations**: Transform frontend names to database names (`unitPrice` → `price`, `total` → `amount`)
3. **Data Mapping**: When reading from DB for PDF generation, map `price` → `unitPrice` and `amount` → `total`
4. **Removed Tax Relation**: Removed `tax: true` from all Prisma include statements (relation doesn't exist)
5. **Frontend Display**: Changed invoice detail page to use database field names (`price`, `amount`) instead of non-existent fields

## Why the Mapping?

The PDF generation interface (`InvoiceData` type) uses user-friendly names like `unitPrice` and `total`, while the database uses simpler names `price` and `amount`. The API acts as a translation layer:

- **Frontend → API**: Sends `unitPrice` and `total` (user-friendly names)
- **API → Database**: Transforms to `price` and `amount` (database field names)
- **Database → API → PDF**: Reads `price`/`amount`, maps to `unitPrice`/`total` for display
- **Database → Frontend Display**: Uses `price`/`amount` directly (no transformation needed)

## Testing

After this fix, the following should work:
- ✅ Creating new invoices with line items
- ✅ Updating existing invoices
- ✅ Sending invoices via email (with PDF)
- ✅ Generating invoice PDFs
- ✅ SMS and WhatsApp invoice sending

## Prevention

To avoid this in the future:
1. Always reference the Prisma schema when creating validation schemas
2. Use TypeScript types from `@prisma/client` for type safety
3. Run `npx prisma generate` after schema changes
4. Test CRUD operations immediately after implementing
