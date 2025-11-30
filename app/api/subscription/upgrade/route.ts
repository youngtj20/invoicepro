import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/middleware/tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/subscription/upgrade - Initiate plan upgrade
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get the new plan
    const newPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!newPlan || !newPlan.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive plan' },
        { status: 400 }
      );
    }

    // Get current subscription
    const currentSubscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { plan: true },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Check if it's actually an upgrade (prevent downgrade for now)
    if (newPlan.price <= currentSubscription.plan.price) {
      return NextResponse.json(
        {
          error:
            'New plan must be an upgrade. Please contact support for downgrades.',
        },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Calculate amount based on billing period
    const amount = Math.round(newPlan.price * 100); // Convert to kobo (Paystack uses smallest currency unit)

    // Create Paystack transaction
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: tenant.email || session.user.email,
          amount,
          currency: newPlan.currency,
          reference: `upgrade-${tenant.id}-${Date.now()}`,
          callback_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription/callback`,
          metadata: {
            tenantId: tenant.id,
            planId: newPlan.id,
            userId: session.user.id,
            type: 'upgrade',
          },
        }),
      }
    );

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error('Paystack error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    const paystackData = await paystackResponse.json();

    // Log the upgrade attempt in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        action: 'SUBSCRIPTION_UPGRADE_INITIATED',
        entityType: 'SUBSCRIPTION',
        entityId: currentSubscription.id,
        metadata: {
          fromPlan: currentSubscription.plan.name,
          toPlan: newPlan.name,
          reference: paystackData.data.reference,
        },
      },
    });

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
    });
  } catch (error: any) {
    console.error('Error upgrading subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upgrade subscription' },
      { status: 500 }
    );
  }
}
