import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';

const markPaidSchema = z.object({
  paymentMethod: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

// POST /api/invoices/[id]/mark-paid - Mark invoice as paid and generate receipt
export async function POST(
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
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if already paid
    if (invoice.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Invoice is already marked as paid' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = markPaidSchema.parse(body);

    // Generate receipt number
    const receiptCount = await prisma.receipt.count({
      where: { tenantId: tenant.id },
    });
    const receiptNumber = `REC-${String(receiptCount + 1).padStart(4, '0')}`;

    // Update invoice and create receipt in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update invoice status
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paymentStatus: 'PAID',
          paidAt: validatedData.paidAt ? new Date(validatedData.paidAt) : new Date(),
          status: 'SENT', // Keep status as SENT, only update paymentStatus
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // Create receipt
      const receipt = await tx.receipt.create({
        data: {
          tenantId: tenant.id,
          receiptNumber,
          customerId: invoice.customerId,
          amount: invoice.total,
          currency: invoice.currency,
          paymentMethod: validatedData.paymentMethod,
          reference: validatedData.reference,
          notes: validatedData.notes,
          issueDate: validatedData.paidAt ? new Date(validatedData.paidAt) : new Date(),
        },
        include: {
          customer: true,
        },
      });

      // Create audit log for invoice
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: session.user.id,
          action: 'INVOICE_MARKED_PAID',
          entityType: 'INVOICE',
          entityId: invoiceId,
          invoiceId: invoiceId,
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
            paymentMethod: validatedData.paymentMethod,
            receiptNumber: receiptNumber,
          },
        },
      });

      // Create audit log for receipt
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: session.user.id,
          action: 'RECEIPT_CREATED_AUTO',
          entityType: 'RECEIPT',
          entityId: receipt.id,
          metadata: {
            receiptNumber: receipt.receiptNumber,
            amount: receipt.amount,
            invoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customer.name,
          },
        },
      });

      return { invoice: updatedInvoice, receipt };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Error marking invoice as paid:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to mark invoice as paid' },
      { status: 500 }
    );
  }
}
