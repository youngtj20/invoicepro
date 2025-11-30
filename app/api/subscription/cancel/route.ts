import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/middleware/tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/subscription/cancel - Cancel subscription at period end
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (subscription.status === 'CANCELED') {
      return NextResponse.json(
        { error: 'Subscription is already canceled' },
        { status: 400 }
      );
    }

    // Update subscription to cancel at period end
    const updatedSubscription = await prisma.subscription.update({
      where: { tenantId: tenant.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
      include: { plan: true },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        action: 'SUBSCRIPTION_CANCELED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        metadata: {
          planName: subscription.plan.name,
          cancelAtPeriodEnd: true,
          periodEnd: subscription.currentPeriodEnd,
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Your subscription will be canceled at the end of the current billing period (${new Date(
        subscription.currentPeriodEnd
      ).toLocaleDateString()}).`,
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscription/cancel - Reactivate canceled subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { plan: true },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      );
    }

    // Reactivate subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { tenantId: tenant.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      include: { plan: true },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        action: 'SUBSCRIPTION_REACTIVATED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        metadata: {
          planName: subscription.plan.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: 'Your subscription has been reactivated.',
    });
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reactivate subscription' },
      { status: 500 }
    );
  }
}
