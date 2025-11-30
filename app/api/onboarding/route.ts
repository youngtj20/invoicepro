import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const onboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Nigeria'),
  currency: z.string().default('NGN'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user already has a tenant
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { tenant: true },
    });

    if (existingUser?.tenantId) {
      return NextResponse.json(
        { error: 'You already have a company account' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = onboardingSchema.parse(body);

    // Generate unique slug from company name
    const baseSlug = validatedData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get the Pro plan for trial
    const proPlan = await prisma.plan.findUnique({
      where: { slug: 'pro' },
    });

    if (!proPlan) {
      return NextResponse.json(
        { error: 'Pro plan not found. Please run database seed.' },
        { status: 500 }
      );
    }

    // Create tenant with subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          companyName: validatedData.companyName,
          slug,
          phone: validatedData.phone,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          country: validatedData.country,
          currency: validatedData.currency,
          status: 'ACTIVE',
        },
      });

      // Create trial subscription
      const trialDays = proPlan.trialDays;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      const subscription = await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: proPlan.id,
          status: 'TRIALING',
          trialEndsAt,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
        },
      });

      // Link user to tenant
      await tx.user.update({
        where: { id: session.user.id },
        data: { tenantId: tenant.id },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: session.user.id,
          action: 'tenant.created',
          entityType: 'Tenant',
          entityId: tenant.id,
          metadata: {
            companyName: tenant.companyName,
            trialDays,
          },
        },
      });

      return { tenant, subscription };
    });

    return NextResponse.json({
      success: true,
      message: 'Company created successfully',
      tenant: result.tenant,
      subscription: result.subscription,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'An error occurred during onboarding' },
      { status: 500 }
    );
  }
}
