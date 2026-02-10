import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { id: invoiceId } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
        template: true,
        invoiceTaxes: {
          include: {
            tax: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
});

const updateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required').optional(),
  issueDate: z.string().min(1, 'Issue date is required').optional(),
  dueDate: z.string().min(1, 'Due date is required').optional(),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'CANCELED']).optional(),
  templateId: z.string().optional(),
  notes: z.string().nullable().transform(val => val || '').optional(),
  terms: z.string().nullable().transform(val => val || '').optional(),
  items: z.array(invoiceItemSchema).optional(),
  subtotal: z.coerce.number().min(0, 'Subtotal must be positive').optional(),
  taxAmount: z.coerce.number().min(0, 'Tax amount must be positive').optional(),
  total: z.coerce.number().min(0, 'Total must be positive').optional(),
});

// PATCH /api/invoices/[id] - Update invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { id: invoiceId } = await params;

    // Check if invoice exists and belongs to tenant
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prevent editing of paid invoices
    if (existingInvoice.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot edit paid invoices' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateInvoiceSchema.parse(body);

    // Check if invoice number is unique (if changed)
    if (validatedData.invoiceNumber && validatedData.invoiceNumber !== existingInvoice.invoiceNumber) {
      const duplicate = await prisma.invoice.findFirst({
        where: {
          tenantId: tenant.id,
          invoiceNumber: validatedData.invoiceNumber,
          NOT: { id: invoiceId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Invoice number already exists' },
          { status: 400 }
        );
      }
    }

    // Update invoice with items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Build update data object
      const updateData: any = {};

      if (validatedData.invoiceNumber) updateData.invoiceNumber = validatedData.invoiceNumber;
      if (validatedData.issueDate) updateData.issueDate = new Date(validatedData.issueDate);
      if (validatedData.dueDate) updateData.dueDate = new Date(validatedData.dueDate);
      if (validatedData.status) updateData.status = validatedData.status;
      if (validatedData.templateId !== undefined) updateData.templateId = validatedData.templateId;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      if (validatedData.terms !== undefined) updateData.terms = validatedData.terms;
      if (validatedData.subtotal !== undefined) updateData.subtotal = validatedData.subtotal;
      if (validatedData.taxAmount !== undefined) updateData.taxAmount = validatedData.taxAmount;
      if (validatedData.total !== undefined) updateData.total = validatedData.total;

      // Update invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: updateData,
      });

      // Update items if provided
      if (validatedData.items) {
        // Delete existing items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId },
        });

        // Create new items
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
      }

      return tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          items: {
            include: {
              item: true,
            },
          },
          template: true,
        },
      });
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { id: invoiceId } = await params;

    // Check if invoice exists and belongs to tenant
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prevent deletion of paid invoices
    if (existingInvoice.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoices' },
        { status: 400 }
      );
    }

    // Delete invoice (cascade will delete invoice items)
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
