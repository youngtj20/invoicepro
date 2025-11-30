import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/admin';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).optional(),
  trialDays: z.number().int().nonnegative().optional(),
  maxInvoices: z.number().int().optional(),
  maxCustomers: z.number().int().optional(),
  maxItems: z.number().int().optional(),
  maxUsers: z.number().int().optional(),
  features: z.object({
    customBranding: z.boolean().optional(),
    advancedReporting: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
    prioritySupport: z.boolean().optional(),
    multiCurrency: z.boolean().optional(),
    recurringInvoices: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    whatsappNotifications: z.boolean().optional(),
    premiumTemplates: z.boolean().optional(),
  }).optional(),
});

// GET /api/admin/plans/[id] - Get single plan details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    await requireAdmin();

    const { id: planId } = await params;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        subscriptions: {
          include: {
            tenant: {
              select: {
                id: true,
                companyName: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Get subscription stats
    const [activeSubscriptions, trialingSubscriptions, canceledSubscriptions] = await Promise.all([
      prisma.subscription.count({
        where: { planId, status: 'ACTIVE' },
      }),
      prisma.subscription.count({
        where: { planId, status: 'TRIALING' },
      }),
      prisma.subscription.count({
        where: { planId, status: 'CANCELED' },
      }),
    ]);

    // Calculate revenue from this plan
    let totalRevenue = 0;
    plan.subscriptions.forEach(sub => {
      if (sub.status === 'ACTIVE' || sub.status === 'TRIALING') {
        totalRevenue += plan.billingPeriod === 'MONTHLY' ? plan.price : plan.price / 12;
      }
    });

    return NextResponse.json({
      ...plan,
      stats: {
        activeSubscriptions,
        trialingSubscriptions,
        canceledSubscriptions,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error('Error fetching plan:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/plans/[id] - Update plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await requireAdmin();

    const { id: planId } = await params;

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePlanSchema.parse(body);

    // Check if name is being changed and if it conflicts
    if (validatedData.name && validatedData.name !== existingPlan.name) {
      const nameConflict = await prisma.plan.findFirst({
        where: {
          name: validatedData.name,
          id: { not: planId },
        },
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A plan with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      billingPeriod: validatedData.billingPeriod,
      trialDays: validatedData.trialDays,
      maxInvoices: validatedData.maxInvoices,
      maxCustomers: validatedData.maxCustomers,
      maxItems: validatedData.maxItems,
    };

    // Add features if provided - map frontend names to database field names
    if (validatedData.features) {
      updateData.canRemoveBranding = validatedData.features.customBranding;
      updateData.canUseReporting = validatedData.features.advancedReporting;
      updateData.canExportData = validatedData.features.apiAccess;
      updateData.canUseSMS = validatedData.features.smsNotifications;
      updateData.canUseWhatsApp = validatedData.features.whatsappNotifications;
      updateData.canUsePremiumTemplates = validatedData.features.premiumTemplates;
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update plan
    const plan = await prisma.plan.update({
      where: { id: planId },
      data: updateData,
    });

    // Log action in audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'PLAN_UPDATED',
        entityType: 'PLAN',
        entityId: planId,
        metadata: {
          planName: plan.name,
          changes: validatedData,
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error updating plan:', error);

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
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/plans/[id] - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await requireAdmin();

    const { id: planId } = await params;

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        planId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { error: `Cannot delete plan with ${activeSubscriptions} active subscription(s). Cancel subscriptions first.` },
        { status: 400 }
      );
    }

    // Delete plan (cascade will handle subscriptions if they exist but are not active)
    await prisma.plan.delete({
      where: { id: planId },
    });

    // Log action in audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'PLAN_DELETED',
        entityType: 'PLAN',
        entityId: planId,
        metadata: {
          planName: plan.name,
          price: plan.price,
          subscriptionCount: plan._count.subscriptions,
        },
      },
    });

    return NextResponse.json({ message: 'Plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting plan:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
