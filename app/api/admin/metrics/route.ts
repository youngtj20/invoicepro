import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/admin';
import prisma from '@/lib/prisma';

// GET /api/admin/metrics - Get system-wide metrics
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdmin();

    // Get counts
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      totalInvoices,
      totalCustomers,
      totalRevenue,
    ] = await Promise.all([
      // Total tenants
      prisma.tenant.count(),

      // Active tenants
      prisma.tenant.count({
        where: { status: 'ACTIVE' },
      }),

      // Suspended tenants
      prisma.tenant.count({
        where: { status: 'SUSPENDED' },
      }),

      // Total users
      prisma.user.count(),

      // Total invoices
      prisma.invoice.count(),

      // Total customers
      prisma.customer.count(),

      // Total revenue (sum of all paid invoices)
      prisma.invoice.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    // Get subscription stats
    const subscriptionStats = await prisma.subscription.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get trial stats
    const trialStats = await prisma.subscription.count({
      where: {
        status: 'TRIALING',
        trialEndsAt: { gt: new Date() },
      },
    });

    // Get plan distribution
    const planDistribution = await prisma.subscription.groupBy({
      by: ['planId'],
      _count: true,
    });

    // Get plans with names
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        currency: true,
      },
    });

    const planDistributionWithNames = planDistribution.map((dist) => {
      const plan = plans.find((p) => p.id === dist.planId);
      return {
        planId: dist.planId,
        planName: plan?.name || 'Unknown',
        count: dist._count,
        revenue: plan ? plan.price * dist._count : 0,
      };
    });

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignups = await prisma.tenant.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Get monthly recurring revenue (MRR)
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: {
          select: {
            price: true,
            billingPeriod: true,
          },
        },
      },
    });

    let mrr = 0;
    activeSubscriptions.forEach((sub) => {
      if (sub.plan.billingPeriod === 'MONTHLY') {
        mrr += sub.plan.price;
      } else if (sub.plan.billingPeriod === 'YEARLY') {
        mrr += sub.plan.price / 12; // Convert yearly to monthly
      }
    });

    // Get growth metrics (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newTenantsLast7Days, newInvoicesLast7Days] = await Promise.all([
      prisma.tenant.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.invoice.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    // Get payment stats
    const [totalPayments, successfulPayments, failedPayments, pendingPayments] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'success' } }),
      prisma.payment.count({ where: { status: 'failed' } }),
      prisma.payment.count({ where: { status: 'pending' } }),
    ]);

    const successRate = totalPayments > 0
      ? (successfulPayments / totalPayments) * 100
      : 0;

    // Get subscription status counts
    const activeSubscriptionsCount = subscriptionStats.find(s => s.status === 'ACTIVE')?._count || 0;
    const canceledSubscriptionsCount = subscriptionStats.find(s => s.status === 'CANCELED')?._count || 0;
    const pastDueSubscriptionsCount = subscriptionStats.find(s => s.status === 'PAST_DUE')?._count || 0;

    // Get deleted tenants count
    const deletedTenants = await prisma.tenant.count({
      where: { status: 'DELETED' },
    });

    return NextResponse.json({
      overview: {
        totalTenants,
        activeTenants,
        suspendedTenants,
        deletedTenants,
        totalUsers,
        totalInvoices,
        totalCustomers,
        totalRevenue: totalRevenue._sum.total || 0,
      },
      subscriptions: {
        active: activeSubscriptionsCount,
        trialing: trialStats,
        canceled: canceledSubscriptionsCount,
        pastDue: pastDueSubscriptionsCount,
        byPlan: planDistributionWithNames,
      },
      revenue: {
        mrr,
        totalRevenue: totalRevenue._sum.total || 0,
        byPlan: planDistributionWithNames,
      },
      growth: {
        recentSignups,
        newTenantsLast7Days,
        newInvoicesLast7Days,
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        successRate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin metrics:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
