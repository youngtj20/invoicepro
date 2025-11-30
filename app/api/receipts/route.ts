import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant } from '@/middleware/tenant';
import { PaystackService } from '@/lib/paystack';
import { z } from 'zod';

// Validation schema
const createReceiptSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
  notes: z.string().optional(),
  issueDate: z.string().optional(),
});

// GET /api/receipts - List all receipts with filters, search, and pagination
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
    const customerId = searchParams.get('customerId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: tenant.id,
    };

    // Search by receipt number
    if (search) {
      where.receiptNumber = {
        contains: search,
      };
    }

    // Filter by customer
    if (customerId) {
      where.customerId = customerId;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) {
        where.issueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.issueDate.lte = new Date(endDate);
      }
    }

    // Get receipts and total count
    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.receipt.count({ where }),
    ]);

    return NextResponse.json({
      receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

// POST /api/receipts - Create a new receipt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createReceiptSchema.parse(body);

    // Verify customer belongs to tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: validatedData.customerId,
        tenantId: tenant.id,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Generate receipt number
    const receiptCount = await prisma.receipt.count({
      where: { tenantId: tenant.id },
    });
    const receiptNumber = `REC-${String(receiptCount + 1).padStart(4, '0')}`;

    // Generate payment reference if not provided
    const paymentReference = validatedData.reference || PaystackService.generateReference('REC');

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        tenantId: tenant.id,
        receiptNumber,
        customerId: validatedData.customerId,
        amount: validatedData.amount,
        currency: tenant.currency,
        paymentMethod: validatedData.paymentMethod,
        reference: paymentReference,
        notes: validatedData.notes,
        issueDate: validatedData.issueDate ? new Date(validatedData.issueDate) : new Date(),
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
        action: 'RECEIPT_CREATED',
        entityType: 'RECEIPT',
        entityId: receipt.id,
        metadata: {
          receiptNumber: receipt.receiptNumber,
          amount: receipt.amount,
          customerName: customer.name,
        },
      },
    });

    return NextResponse.json(receipt, { status: 201 });
  } catch (error: any) {
    console.error('Error creating receipt:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create receipt' },
      { status: 500 }
    );
  }
}
