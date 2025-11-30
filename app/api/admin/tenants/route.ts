import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/tenants - List all tenants with filters
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search by company name
    if (search) {
      where.companyName = {
        contains: search,
      };
    }

    // Filter by status
    if (status && ['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      where.status = status;
    }

    // Get tenants and total count
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: {
            include: {
              plan: {
                select: {
                  name: true,
                  price: true,
                  currency: true,
                },
              },
            },
          },
          _count: {
            select: {
              users: true,
              invoices: true,
              customers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenants:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}
