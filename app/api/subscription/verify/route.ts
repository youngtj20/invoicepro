import { NextRequest, NextResponse } from 'next/server';
import { requireTenant } from '@/middleware/tenant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/subscription/verify?reference=xxx - Verify payment and update subscription
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    if (!paystackResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 500 }
      );
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.data || paystackData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Get metadata from payment
    const metadata = paystackData.data.metadata;
    const planId = metadata.planId;

    if (!planId) {
      return NextResponse.json(
        { error: 'Invalid payment metadata' },
        { status: 400 }
      );
    }

    // Get the plan
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Calculate new period dates
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.billingPeriod === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { tenantId: tenant.id },
      data: {
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        trialEndsAt: null, // End trial if upgrading
      },
      include: {
        plan: true,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        tenantId: tenant.id,
        amount: paystackData.data.amount / 100, // Convert from kobo to naira
        currency: paystackData.data.currency,
        status: 'success',
        paymentMethod: 'paystack',
        reference: reference,
        metadata: {
          planName: plan.name,
          billingPeriod: plan.billingPeriod,
          paystackReference: paystackData.data.reference,
        },
      },
    });

    // Log in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        tenantId: tenant.id,
        action: 'SUBSCRIPTION_UPGRADED',
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        metadata: {
          planName: plan.name,
          amount: paystackData.data.amount / 100,
          reference,
        },
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
