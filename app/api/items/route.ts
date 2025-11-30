import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireTenant, checkResourceLimit } from '@/middleware/tenant';

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

// GET /api/items - List all items with search and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: tenant.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (type && (type === 'PRODUCT' || type === 'SERVICE')) {
      where.type = type;
    }

    // Get items and total count
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Check resource limits
    const { allowed, limit, current } = await checkResourceLimit('items', tenant);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Item limit reached. Your ${tenant.subscription?.plan.name} plan allows ${limit} items. You currently have ${current}.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = itemSchema.parse(body);

    // Check if SKU is unique (if provided)
    if (validatedData.sku) {
      const existingItem = await prisma.item.findFirst({
        where: {
          tenantId: tenant.id,
          sku: validatedData.sku,
        },
      });

      if (existingItem) {
        return NextResponse.json(
          { error: 'An item with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    const item = await prisma.item.create({
      data: {
        ...validatedData,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating item:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create item' },
      { status: 500 }
    );
  }
}
