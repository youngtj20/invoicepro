import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/middleware/tenant';
import prisma from '@/lib/prisma';

// GET /api/subscription - Get current subscription details
export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();

    // Get subscription with plan details
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Get usage statistics
    const [invoiceCount, customerCount, itemCount] = await Promise.all([
      prisma.invoice.count({ where: { tenantId: tenant.id } }),
      prisma.customer.count({ where: { tenantId: tenant.id } }),
      prisma.item.count({ where: { tenantId: tenant.id } }),
    ]);

    // Calculate usage percentages
    const usage = {
      invoices: {
        used: invoiceCount,
        limit: subscription.plan.maxInvoices,
        percentage:
          subscription.plan.maxInvoices === -1
            ? 0
            : Math.round((invoiceCount / subscription.plan.maxInvoices) * 100),
        unlimited: subscription.plan.maxInvoices === -1,
      },
      customers: {
        used: customerCount,
        limit: subscription.plan.maxCustomers,
        percentage:
          subscription.plan.maxCustomers === -1
            ? 0
            : Math.round((customerCount / subscription.plan.maxCustomers) * 100),
        unlimited: subscription.plan.maxCustomers === -1,
      },
      items: {
        used: itemCount,
        limit: subscription.plan.maxItems,
        percentage:
          subscription.plan.maxItems === -1
            ? 0
            : Math.round((itemCount / subscription.plan.maxItems) * 100),
        unlimited: subscription.plan.maxItems === -1,
      },
    };

    // Calculate days remaining in trial or current period
    const now = new Date();
    let daysRemaining = 0;
    let periodType: 'trial' | 'billing' = 'billing';

    if (subscription.status === 'TRIALING' && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      daysRemaining = Math.max(
        0,
        Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
      periodType = 'trial';
    } else {
      const periodEnd = new Date(subscription.currentPeriodEnd);
      daysRemaining = Math.max(
        0,
        Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndsAt: subscription.trialEndsAt,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        canceledAt: subscription.canceledAt,
        daysRemaining,
        periodType,
      },
      usage,
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
