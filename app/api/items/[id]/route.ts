import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireTenant } from '@/middleware/tenant';

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['PRODUCT', 'SERVICE']),
  unit: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  taxable: z.boolean().optional().default(true),
  sku: z.string().optional(),
  category: z.string().optional(),
});

// GET /api/items/[id] - Get single item
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
    const { id: itemId } = await params;

    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        tenantId: tenant.id,
      },
      include: {
        _count: {
          select: {
            invoiceItems: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PATCH /api/items/[id] - Update item
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
    const { id: itemId } = await params;

    // Check if item exists and belongs to tenant
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        tenantId: tenant.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = itemSchema.parse(body);

    // Check if SKU is unique (if changed)
    if (validatedData.sku && validatedData.sku !== existingItem.sku) {
      const skuExists = await prisma.item.findFirst({
        where: {
          tenantId: tenant.id,
          sku: validatedData.sku,
          NOT: { id: itemId },
        },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: 'An item with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: validatedData,
      include: {
        _count: {
          select: {
            invoiceItems: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating item:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete item
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
    const { id: itemId } = await params;

    // Check if item exists and belongs to tenant
    const existingItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        tenantId: tenant.id,
      },
      include: {
        _count: {
          select: {
            invoiceItems: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Prevent deletion if item is used in invoices
    if (existingItem._count.invoiceItems > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete item. It is used in ${existingItem._count.invoiceItems} invoice(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete item' },
      { status: 500 }
    );
  }
}
