import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireTenant } from '@/middleware/tenant';

const taxSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rate: z.number().min(0, 'Rate must be positive').max(100, 'Rate cannot exceed 100%'),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

// GET /api/taxes/[id] - Get single tax
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
    const { id: taxId } = await params;

    const tax = await prisma.tax.findFirst({
      where: {
        id: taxId,
        tenantId: tenant.id,
      },
    });

    if (!tax) {
      return NextResponse.json({ error: 'Tax not found' }, { status: 404 });
    }

    return NextResponse.json(tax);
  } catch (error: any) {
    console.error('Error fetching tax:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tax' },
      { status: 500 }
    );
  }
}

// PATCH /api/taxes/[id] - Update tax
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
    const { id: taxId } = await params;

    // Check if tax exists and belongs to tenant
    const existingTax = await prisma.tax.findFirst({
      where: {
        id: taxId,
        tenantId: tenant.id,
      },
    });

    if (!existingTax) {
      return NextResponse.json({ error: 'Tax not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = taxSchema.parse(body);

    // If this tax is being set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.tax.updateMany({
        where: {
          tenantId: tenant.id,
          isDefault: true,
          NOT: { id: taxId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedTax = await prisma.tax.update({
      where: { id: taxId },
      data: validatedData,
    });

    return NextResponse.json(updatedTax);
  } catch (error: any) {
    console.error('Error updating tax:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update tax' },
      { status: 500 }
    );
  }
}

// DELETE /api/taxes/[id] - Delete tax
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
    const { id: taxId } = await params;

    // Check if tax exists and belongs to tenant
    const existingTax = await prisma.tax.findFirst({
      where: {
        id: taxId,
        tenantId: tenant.id,
      },
    });

    if (!existingTax) {
      return NextResponse.json({ error: 'Tax not found' }, { status: 404 });
    }

    await prisma.tax.delete({
      where: { id: taxId },
    });

    return NextResponse.json({ message: 'Tax deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tax:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete tax' },
      { status: 500 }
    );
  }
}
