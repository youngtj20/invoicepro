import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/middleware/admin';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
  trialDays: z.number().int().nonnegative().default(0),
  maxInvoices: z.number().int().default(-1), // -1 means unlimited
  maxCustomers: z.number().int().default(-1),
  maxItems: z.number().int().default(-1),
  maxUsers: z.number().int().default(-1),
  features: z.object({
    customBranding: z.boolean().default(false),
    advancedReporting: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    prioritySupport: z.boolean().default(false),
    multiCurrency: z.boolean().default(false),
    recurringInvoices: z.boolean().default(false),
    smsNotifications: z.boolean().default(false),
    whatsappNotifications: z.boolean().default(false),
    premiumTemplates: z.boolean().default(false),
  }).optional(),
});

// GET /api/admin/plans - List all plans
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    await requireAdmin();

    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: { price: 'asc' },
    });

    // Get active subscription count for each plan and map field names
    const plansWithStats = await Promise.all(
      plans.map(async (plan) => {
        const activeSubscriptions = await prisma.subscription.count({
          where: {
            planId: plan.id,
            status: { in: ['ACTIVE', 'TRIALING'] },
          },
        });

        return {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          billingPeriod: plan.billingPeriod,
          trialDays: plan.trialDays,
          maxInvoices: plan.maxInvoices,
          maxCustomers: plan.maxCustomers,
          maxItems: plan.maxItems,
          // Map database field names to frontend names
          customBranding: plan.canRemoveBranding,
          advancedReporting: plan.canUseReporting,
          apiAccess: plan.canExportData,
          prioritySupport: false, // Not in schema
          multiCurrency: false, // Not in schema
          recurringInvoices: false, // Not in schema
          smsNotifications: plan.canUseSMS,
          whatsappNotifications: plan.canUseWhatsApp,
          premiumTemplates: plan.canUsePremiumTemplates,
          activeSubscriptions,
          totalSubscriptions: plan._count.subscriptions,
        };
      })
    );

    return NextResponse.json({ plans: plansWithStats });
  } catch (error: any) {
    console.error('Error fetching plans:', error);

    if (error.message.includes('Access denied')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/admin/plans - Create a new plan
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const admin = await requireAdmin();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPlanSchema.parse(body);

    // Check if plan with same name already exists
    const existingPlan = await prisma.plan.findFirst({
      where: { name: validatedData.name },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'A plan with this name already exists' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Create plan - map frontend field names to database field names
    const plan = await prisma.plan.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        billingPeriod: validatedData.billingPeriod,
        trialDays: validatedData.trialDays,
        maxInvoices: validatedData.maxInvoices,
        maxCustomers: validatedData.maxCustomers,
        maxItems: validatedData.maxItems,
        canRemoveBranding: validatedData.features?.customBranding || false,
        canUseReporting: validatedData.features?.advancedReporting || false,
        canExportData: validatedData.features?.apiAccess || false,
        canUseSMS: validatedData.features?.smsNotifications || false,
        canUseWhatsApp: validatedData.features?.whatsappNotifications || false,
        canUsePremiumTemplates: validatedData.features?.premiumTemplates || false,
      },
    });

    // Log action in audit log
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: 'PLAN_CREATED',
        entityType: 'PLAN',
        entityId: plan.id,
        metadata: {
          planName: plan.name,
          price: plan.price,
          billingPeriod: plan.billingPeriod,
        },
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    console.error('Error creating plan:', error);

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
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    );
  }
}
