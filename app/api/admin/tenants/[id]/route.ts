import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/admin';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateTenantSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
});

// GET /api/admin/tenants/[id] - Get single tenant details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    await requireAdmin();

    const { id: tenantId } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            invoices: true,
            customers: true,
            items: true,
            receipts: true,
            payments: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get additional stats
    const [totalRevenue, paidInvoices, draftInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          tenantId,
          paymentStatus: 'PAID',
        },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: {
          tenantId,
          paymentStatus: 'PAID',
        },
      }),
      prisma.invoice.count({
        where: {
          tenantId,
          status: 'DRAFT',
        },
      }),
    ]);

    return NextResponse.json({
      ...tenant,
      stats: {
        totalRevenue: totalRevenue._sum.total || 0,
        paidInvoices,
        draftInvoices,
      },
    });
  } catch (error: any) {
    console.error('Error fetching tenant:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/tenants/[id] - Update tenant (suspend/activate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await requireAdmin();

    const { id: tenantId } = await params;

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateTenantSchema.parse(body);

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: validatedData,
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    // Log action in audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'TENANT_STATUS_CHANGED',
        entityType: 'TENANT',
        entityId: tenantId,
        metadata: {
          oldStatus: existingTenant.status,
          newStatus: validatedData.status,
          companyName: tenant.companyName,
        },
      },
    });

    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Error updating tenant:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update tenant' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tenants/[id] - Delete tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await requireAdmin();

    const { id: tenantId } = await params;

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Delete tenant (cascade will handle related records)
    await prisma.tenant.delete({
      where: { id: tenantId },
    });

    // Log action in audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'TENANT_DELETED',
        entityType: 'TENANT',
        entityId: tenantId,
        metadata: {
          companyName: tenant.companyName,
        },
      },
    });

    return NextResponse.json({ message: 'Tenant deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting tenant:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete tenant' },
      { status: 500 }
    );
  }
}
