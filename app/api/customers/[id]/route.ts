import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireTenant } from '@/middleware/tenant';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/customers/[id] - Get single customer
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    const customer = await prisma.customer.findFirst({
      where: {
        id: (await params).id,
        tenantId: tenant.id,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            dueDate: true,
            total: true,
            status: true,
            paymentStatus: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('GET /api/customers/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH /api/customers/[id] - Update customer
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Check if customer exists and belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: (await params).id,
        tenantId: tenant.id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const validatedData = customerSchema.parse(body);

    // Update customer
    const customer = await prisma.customer.update({
      where: { id: (await params).id },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            dueDate: true,
            total: true,
            status: true,
            paymentStatus: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'customer.updated',
        entityType: 'Customer',
        entityId: customer.id,
        metadata: {
          customerName: customer.name,
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('PATCH /api/customers/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Check if customer exists and belongs to tenant
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: (await params).id,
        tenantId: tenant.id,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has invoices
    if (existingCustomer._count.invoices > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer with ${existingCustomer._count.invoices} invoices. Please delete or reassign the invoices first.`,
        },
        { status: 400 }
      );
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: (await params).id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.user.id,
        action: 'customer.deleted',
        entityType: 'Customer',
        entityId: (await params).id,
        metadata: {
          customerName: existingCustomer.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE /api/customers/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
