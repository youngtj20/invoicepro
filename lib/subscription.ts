import prisma from './prisma';

export interface UsageStats {
  invoicesUsed: number;
  customersUsed: number;
  itemsUsed: number;
  invoicesLimit: number;
  customersLimit: number;
  itemsLimit: number;
  isInvoicesUnlimited: boolean;
  isCustomersUnlimited: boolean;
  isItemsUnlimited: boolean;
}

export class SubscriptionService {
  /**
   * Check if tenant has reached resource limit
   */
  static async checkResourceLimit(
    tenantId: string,
    resourceType: 'invoices' | 'customers' | 'items'
  ): Promise<{ allowed: boolean; reason?: string; limit?: number; current?: number }> {
    try {
      // Get tenant's subscription
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      });

      if (!subscription) {
        return {
          allowed: false,
          reason: 'No active subscription found',
        };
      }

      // Check if subscription is active
      if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
        return {
          allowed: false,
          reason: 'Subscription is not active',
        };
      }

      const plan = subscription.plan;
      let limit: number;
      let current: number;

      // Get limit based on resource type
      switch (resourceType) {
        case 'invoices':
          limit = plan.maxInvoices;
          if (limit === -1) {
            return { allowed: true }; // Unlimited
          }
          current = await prisma.invoice.count({ where: { tenantId } });
          break;

        case 'customers':
          limit = plan.maxCustomers;
          if (limit === -1) {
            return { allowed: true }; // Unlimited
          }
          current = await prisma.customer.count({ where: { tenantId } });
          break;

        case 'items':
          limit = plan.maxItems;
          if (limit === -1) {
            return { allowed: true }; // Unlimited
          }
          current = await prisma.item.count({ where: { tenantId } });
          break;

        default:
          return {
            allowed: false,
            reason: 'Invalid resource type',
          };
      }

      if (current >= limit) {
        return {
          allowed: false,
          reason: `You have reached your ${resourceType} limit (${limit})`,
          limit,
          current,
        };
      }

      return {
        allowed: true,
        limit,
        current,
      };
    } catch (error) {
      console.error('Error checking resource limit:', error);
      return {
        allowed: false,
        reason: 'Error checking subscription limits',
      };
    }
  }

  /**
   * Check if tenant has access to a feature
   */
  static async checkFeatureAccess(
    tenantId: string,
    feature:
      | 'canUsePremiumTemplates'
      | 'canCustomizeTemplates'
      | 'canUseReporting'
      | 'canExportData'
      | 'canRemoveBranding'
      | 'canUseWhatsApp'
      | 'canUseSMS'
  ): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      });

      if (!subscription) {
        return false;
      }

      // Check if subscription is active
      if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') {
        return false;
      }

      return subscription.plan[feature] || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Get usage statistics for a tenant
   */
  static async getUsageStats(tenantId: string): Promise<UsageStats | null> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      });

      if (!subscription) {
        return null;
      }

      const [invoicesUsed, customersUsed, itemsUsed] = await Promise.all([
        prisma.invoice.count({ where: { tenantId } }),
        prisma.customer.count({ where: { tenantId } }),
        prisma.item.count({ where: { tenantId } }),
      ]);

      return {
        invoicesUsed,
        customersUsed,
        itemsUsed,
        invoicesLimit: subscription.plan.maxInvoices,
        customersLimit: subscription.plan.maxCustomers,
        itemsLimit: subscription.plan.maxItems,
        isInvoicesUnlimited: subscription.plan.maxInvoices === -1,
        isCustomersUnlimited: subscription.plan.maxCustomers === -1,
        isItemsUnlimited: subscription.plan.maxItems === -1,
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }

  /**
   * Check if subscription is in trial period
   */
  static async isInTrial(tenantId: string): Promise<boolean> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
      });

      if (!subscription) {
        return false;
      }

      return (
        subscription.status === 'TRIALING' &&
        subscription.trialEndsAt !== null &&
        subscription.trialEndsAt > new Date()
      );
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Get days remaining in trial
   */
  static async getTrialDaysRemaining(tenantId: string): Promise<number> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
      });

      if (!subscription || !subscription.trialEndsAt) {
        return 0;
      }

      const now = new Date();
      const trialEnd = subscription.trialEndsAt;

      if (trialEnd <= now) {
        return 0;
      }

      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error('Error calculating trial days:', error);
      return 0;
    }
  }

  /**
   * Get subscription status with details
   */
  static async getSubscriptionStatus(tenantId: string) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { tenantId },
        include: { plan: true },
      });

      if (!subscription) {
        return null;
      }

      const isInTrial = await this.isInTrial(tenantId);
      const trialDaysRemaining = await this.getTrialDaysRemaining(tenantId);
      const usageStats = await this.getUsageStats(tenantId);

      return {
        subscription,
        isInTrial,
        trialDaysRemaining,
        usageStats,
        isActive: subscription.status === 'ACTIVE' || subscription.status === 'TRIALING',
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return null;
    }
  }
}

export default SubscriptionService;
