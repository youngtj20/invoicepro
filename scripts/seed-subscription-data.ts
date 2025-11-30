/**
 * Seed Subscription Data Script
 *
 * This script creates:
 * 1. Default plans (Free, Starter, Professional, Enterprise)
 * 2. Default subscriptions for all existing tenants
 *
 * Run with: npx tsx scripts/seed-subscription-data.ts
 */

import { PrismaClient, BillingPeriod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting subscription data seeding...\n');

  // 1. Create Plans
  console.log('📦 Creating plans...');

  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Perfect for getting started',
      price: 0,
      currency: 'NGN',
      billingPeriod: BillingPeriod.MONTHLY,
      trialDays: 7,
      maxInvoices: 10,
      maxCustomers: 25,
      maxItems: 50,
      canUsePremiumTemplates: false,
      canCustomizeTemplates: false,
      canUseReporting: false,
      canExportData: false,
      canRemoveBranding: false,
      canUseWhatsApp: false,
      canUseSMS: false,
      isActive: true,
      isDefault: true,
    },
    {
      name: 'Starter',
      slug: 'starter',
      description: 'For growing businesses',
      price: 9999, // 99.99 NGN (stored in kobo)
      currency: 'NGN',
      billingPeriod: BillingPeriod.MONTHLY,
      trialDays: 14,
      maxInvoices: 100,
      maxCustomers: 100,
      maxItems: 200,
      canUsePremiumTemplates: true,
      canCustomizeTemplates: false,
      canUseReporting: true,
      canExportData: true,
      canRemoveBranding: false,
      canUseWhatsApp: false,
      canUseSMS: false,
      isActive: true,
      isDefault: false,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'For established businesses',
      price: 29999, // 299.99 NGN
      currency: 'NGN',
      billingPeriod: BillingPeriod.MONTHLY,
      trialDays: 14,
      maxInvoices: -1, // Unlimited
      maxCustomers: -1,
      maxItems: -1,
      canUsePremiumTemplates: true,
      canCustomizeTemplates: true,
      canUseReporting: true,
      canExportData: true,
      canRemoveBranding: true,
      canUseWhatsApp: true,
      canUseSMS: true,
      isActive: true,
      isDefault: false,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For large organizations',
      price: 99999, // 999.99 NGN
      currency: 'NGN',
      billingPeriod: BillingPeriod.MONTHLY,
      trialDays: 30,
      maxInvoices: -1,
      maxCustomers: -1,
      maxItems: -1,
      canUsePremiumTemplates: true,
      canCustomizeTemplates: true,
      canUseReporting: true,
      canExportData: true,
      canRemoveBranding: true,
      canUseWhatsApp: true,
      canUseSMS: true,
      isActive: true,
      isDefault: false,
    },
  ];

  const createdPlans = [];
  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { slug: planData.slug },
      update: planData,
      create: planData,
    });
    createdPlans.push(plan);
    console.log(`  ✅ ${plan.name} plan created/updated (${plan.currency} ${plan.price / 100})`);
  }

  console.log(`\n✅ ${createdPlans.length} plans created/updated\n`);

  // 2. Get default plan (Free)
  const defaultPlan = createdPlans.find(p => p.isDefault) || createdPlans[0];

  // 3. Create subscriptions for all tenants without one
  console.log('🔑 Creating subscriptions for tenants...');

  const tenants = await prisma.tenant.findMany({
    include: {
      subscription: true,
    },
  });

  let subscriptionsCreated = 0;
  let subscriptionsExisting = 0;

  for (const tenant of tenants) {
    if (tenant.subscription) {
      console.log(`  ⏭️  ${tenant.companyName} already has a subscription`);
      subscriptionsExisting++;
      continue;
    }

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + defaultPlan.trialDays);

    // Calculate period dates
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planId: defaultPlan.id,
        status: 'TRIALING',
        trialEndsAt,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
    });

    console.log(`  ✅ ${tenant.companyName} - ${defaultPlan.name} plan (Trial ends: ${trialEndsAt.toLocaleDateString()})`);
    subscriptionsCreated++;
  }

  console.log(`\n✅ ${subscriptionsCreated} new subscriptions created`);
  console.log(`⏭️  ${subscriptionsExisting} tenants already had subscriptions\n`);

  // 4. Summary
  console.log('📊 Summary:');
  console.log(`  Plans: ${createdPlans.length}`);
  console.log(`  Tenants: ${tenants.length}`);
  console.log(`  New Subscriptions: ${subscriptionsCreated}`);
  console.log(`  Existing Subscriptions: ${subscriptionsExisting}`);

  console.log('\n✅ Subscription data seeding complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding subscription data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
