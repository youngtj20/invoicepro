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

// GET /api/taxes - List all taxes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    const taxes = await prisma.tax.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: [
        { isDefault: 'desc' }, // Default tax first
        { createdAt: 'asc' },
      ],
    });

    return NextResponse.json({ taxes });
  } catch (error: any) {
    console.error('Error fetching taxes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch taxes' },
      { status: 500 }
    );
  }
}

// POST /api/taxes - Create new tax
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    const body = await request.json();
    const validatedData = taxSchema.parse(body);

    // If this tax is being set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.tax.updateMany({
        where: {
          tenantId: tenant.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const tax = await prisma.tax.create({
      data: {
        ...validatedData,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json(tax, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tax:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create tax' },
      { status: 500 }
    );
  }
}
