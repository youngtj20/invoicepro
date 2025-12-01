import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { requireTenant, checkResourceLimit } from '@/middleware/tenant';
import { z } from 'zod';

// GET /api/invoices - List all invoices with filters, search, and pagination
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
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customerId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: tenant.id,
    };

    // Search by invoice number
    if (search) {
      where.invoiceNumber = {
        contains: search,
      };
    }

    // Filter by status
    if (status && ['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'CANCELED'].includes(status)) {
      where.status = status;
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

    // Get invoices and total count
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

const invoiceItemSchema = z.object({
  itemId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  taxRate: z.number().min(0).max(100).optional(),
  taxAmount: z.number().min(0).optional(),
  total: z.number().min(0, 'Total must be positive'),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'OVERDUE', 'CANCELED']).default('DRAFT'),
  templateId: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
});

// POST /api/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Check resource limits
    const { allowed, limit, current } = await checkResourceLimit('invoices', tenant);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Invoice limit reached. Your ${tenant.subscription?.plan.name} plan allows ${limit} invoices. You currently have ${current}.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Received invoice data:', JSON.stringify(body, null, 2));
    const validatedData = invoiceSchema.parse(body);

    // Determine templateId: if not provided, fall back to tenant defaultTemplateId
    let resolvedTemplateId: string | undefined = validatedData.templateId;
    if (!resolvedTemplateId) {
      // Ensure we have latest tenant defaultTemplateId
      const tenantWithDefault = await prisma.tenant.findUnique({
        where: { id: tenant.id },
        select: { defaultTemplateId: true },
      });
      if (tenantWithDefault?.defaultTemplateId) {
        resolvedTemplateId = tenantWithDefault.defaultTemplateId;
      }
    }

    console.log('DEBUG Invoice Creation:', {
      requestTemplateId: validatedData.templateId,
      tenantDefaultTemplateId: tenant.defaultTemplateId,
      resolvedTemplateId,
    });

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

    // Check if invoice number is unique
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId: tenant.id,
        invoiceNumber: validatedData.invoiceNumber,
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      );
    }

    // Create invoice with items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          tenantId: tenant.id,
          customerId: validatedData.customerId,
          invoiceNumber: validatedData.invoiceNumber,
          issueDate: new Date(validatedData.invoiceDate),
          dueDate: new Date(validatedData.dueDate),
          status: validatedData.status,
          templateId: resolvedTemplateId,
          notes: validatedData.notes,
          terms: validatedData.terms,
          subtotal: validatedData.subtotal,
          taxAmount: validatedData.taxAmount,
          total: validatedData.total,
        },
      });

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: validatedData.items.map((item) => ({
          invoiceId: newInvoice.id,
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          amount: item.total,
        })),
      });

      return tx.invoice.findUnique({
        where: { id: newInvoice.id },
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

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);

    if (error instanceof z.ZodError) {
      console.error('Validation error details:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
