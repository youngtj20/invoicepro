import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  console.log('=== getTenantId Debug ===');
  console.log('Session exists:', !!session);
  console.log('Session user:', session?.user);
  console.log('Session user tenantId:', session?.user?.tenantId);

  if (!session?.user?.tenantId) {
    // Try to fetch from database as fallback
    if (session?.user?.id) {
      console.log('Fetching tenantId from database for user:', session.user.id);
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tenantId: true },
      });
      console.log('Database user tenantId:', user?.tenantId);
      return user?.tenantId || null;
    }
    return null;
  }

  return session.user.tenantId;
}

export async function requireTenant() {
  const tenantId = await getTenantId();

  if (!tenantId) {
    throw new Error('Tenant not found. Please complete onboarding.');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  if (tenant.status !== 'ACTIVE') {
    throw new Error('Tenant account is suspended');
  }

  return tenant;
}

export async function checkSubscriptionFeature(
  feature: string,
  tenant?: Awaited<ReturnType<typeof requireTenant>>
): Promise<boolean> {
  if (!tenant) {
    tenant = await requireTenant();
  }

  const subscription = tenant.subscription;

  if (!subscription) {
    return false;
  }

  // Check if trial is active
  const now = new Date();
  const isTrialing = subscription.status === 'TRIALING' &&
                     subscription.trialEndsAt &&
                     subscription.trialEndsAt > now;

  // During trial, all pro features are available
  if (isTrialing) {
    return true;
  }

  // Check if subscription is active
  if (subscription.status !== 'ACTIVE') {
    return false;
  }

  const plan = subscription.plan;

  // Map features to plan properties
  const featureMap: Record<string, boolean> = {
    premiumTemplates: plan.canUsePremiumTemplates,
    customizeTemplates: plan.canCustomizeTemplates,
    reporting: plan.canUseReporting,
    exportData: plan.canExportData,
    removeBranding: plan.canRemoveBranding,
    whatsapp: plan.canUseWhatsApp,
    sms: plan.canUseSMS,
  };

  return featureMap[feature] ?? false;
}

export async function checkResourceLimit(
  resource: 'invoices' | 'customers' | 'items',
  tenant?: Awaited<ReturnType<typeof requireTenant>>
): Promise<{ allowed: boolean; limit: number; current: number }> {
  if (!tenant) {
    tenant = await requireTenant();
  }

  const subscription = tenant.subscription;

  if (!subscription) {
    return { allowed: false, limit: 0, current: 0 };
  }

  const plan = subscription.plan;

  const limitMap: Record<typeof resource, number> = {
    invoices: plan.maxInvoices,
    customers: plan.maxCustomers,
    items: plan.maxItems,
  };

  const limit = limitMap[resource];

  // -1 means unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, current: 0 };
  }

  // Count current usage
  let current = 0;
  switch (resource) {
    case 'invoices':
      current = await prisma.invoice.count({
        where: { tenantId: tenant.id },
      });
      break;
    case 'customers':
      current = await prisma.customer.count({
        where: { tenantId: tenant.id },
      });
      break;
    case 'items':
      current = await prisma.item.count({
        where: { tenantId: tenant.id },
      });
      break;
  }

  return {
    allowed: current < limit,
    limit,
    current,
  };
}
