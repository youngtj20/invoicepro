import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { z } from 'zod';

// Validation schema for updates
const updateReceiptSchema = z.object({
  amount: z.number().positive().optional(),
  paymentMethod: z.string().min(1).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
  issueDate: z.string().optional(),
});

// GET /api/receipts/[id] - Get single receipt
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
    const { id: receiptId } = await params;

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        tenantId: tenant.id,
      },
      include: {
        customer: true,
        tenant: {
          select: {
            companyName: true,
            logo: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}

// PATCH /api/receipts/[id] - Update receipt
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
    const { id: receiptId } = await params;

    // Check if receipt exists and belongs to tenant
    const existingReceipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        tenantId: tenant.id,
      },
    });

    if (!existingReceipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateReceiptSchema.parse(body);

    // Update receipt
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        ...validatedData,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : undefined,
        updatedAt: new Date(),
      },
      include: {
        customer: true,
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'RECEIPT_UPDATED',
        entityType: 'RECEIPT',
        entityId: receiptId,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          changes: validatedData,
        },
      },
    });

    return NextResponse.json(receipt);
  } catch (error: any) {
    console.error('Error updating receipt:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update receipt' },
      { status: 500 }
    );
  }
}

// DELETE /api/receipts/[id] - Delete receipt
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
    const { id: receiptId } = await params;

    // Check if receipt exists and belongs to tenant
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        tenantId: tenant.id,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    // Delete receipt
    await prisma.receipt.delete({
      where: { id: receiptId },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'RECEIPT_DELETED',
        entityType: 'RECEIPT',
        entityId: receiptId,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          amount: receipt.amount,
        },
      },
    });

    return NextResponse.json({ message: 'Receipt deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting receipt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete receipt' },
      { status: 500 }
    );
  }
}
