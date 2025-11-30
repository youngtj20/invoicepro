'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  TrendingUp,
  Users,
  FileText,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { LoadingPage } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  trialDays: number;
  maxInvoices: number;
  maxCustomers: number;
  maxItems: number;
  canUsePremiumTemplates: boolean;
  canCustomizeTemplates: boolean;
  canUseReporting: boolean;
  canExportData: boolean;
  canRemoveBranding: boolean;
  canUseWhatsApp: boolean;
  canUseSMS: boolean;
}

interface Usage {
  used: number;
  limit: number;
  percentage: number;
  unlimited: boolean;
}

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    plan: Plan;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEndsAt: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    daysRemaining: number;
    periodType: 'trial' | 'billing';
  };
  usage: {
    invoices: Usage;
    customers: Usage;
    items: Usage;
  };
}

export default function SubscriptionPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [subscriptionRes, plansRes] = await Promise.all([
        fetch('/api/subscription'),
        fetch('/api/plans'),
      ]);

      if (!subscriptionRes.ok) {
        throw new Error('Failed to fetch subscription');
      }

      if (!plansRes.ok) {
        throw new Error('Failed to fetch plans');
      }

      const subscriptionData = await subscriptionRes.json();
      const plansData = await plansRes.json();

      setSubscriptionData(subscriptionData);
      setAvailablePlans(plansData.plans);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error loading subscription', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setIsUpgrading(true);
      setError('');

      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate upgrade');
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      setError(err.message);
      toast.error('Upgrade failed', err.message);
      setIsUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      setError('');

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription canceled', data.message);
      setShowCancelModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
      toast.error('Cancellation failed', err.message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setError('');

      const response = await fetch('/api/subscription/cancel', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      toast.success('Subscription reactivated', data.message);
      fetchData();
    } catch (err: any) {
      setError(err.message);
      toast.error('Reactivation failed', err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: any }> = {
      TRIALING: { color: 'bg-blue-100 text-blue-800', label: 'Trial', icon: Clock },
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      PAST_DUE: { color: 'bg-yellow-100 text-yellow-800', label: 'Past Due', icon: AlertTriangle },
      CANCELED: { color: 'bg-red-100 text-red-800', label: 'Canceled', icon: XCircle },
      INCOMPLETE: { color: 'bg-gray-100 text-gray-800', label: 'Incomplete', icon: Clock },
    };

    const { color, label, icon: Icon } = config[status] || config.INCOMPLETE;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-600';
    if (percentage >= 75) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (isLoading) {
    return <LoadingPage text="Loading subscription details..." />;
  }

  if (!subscriptionData) {
    return (
      <div className="space-y-6">
        <Alert variant="error">
          No subscription found. Please contact support.
        </Alert>
      </div>
    );
  }

  const { subscription, usage } = subscriptionData;
  const currentPlan = subscription.plan;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and view usage statistics
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Cancellation Notice */}
      {subscription.cancelAtPeriodEnd && (
        <Alert variant="warning">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">Subscription Scheduled for Cancellation</p>
              <p className="text-sm mt-1">
                Your subscription will end on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You'll
                still have access to all features until then.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReactivate}
              className="ml-4"
            >
              Reactivate
            </Button>
          </div>
        </Alert>
      )}

      {/* Current Plan Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
              {getStatusBadge(subscription.status)}
            </div>
            <p className="text-gray-600 mt-1">{currentPlan.description}</p>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-4xl font-bold text-gray-900">
                {currentPlan.currency} {currentPlan.price.toLocaleString()}
              </span>
              <span className="text-gray-600">
                / {currentPlan.billingPeriod.toLowerCase()}
              </span>
            </div>

            {/* Period Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {subscription.periodType === 'trial' ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Trial ends in <strong>{subscription.daysRemaining} days</strong> on{' '}
                    {new Date(subscription.trialEndsAt!).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    Renews in <strong>{subscription.daysRemaining} days</strong> on{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 ml-6">
            <Button variant="outline" disabled>
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Billing
            </Button>
            {!subscription.cancelAtPeriodEnd && (
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="text-red-600 hover:text-red-700"
              >
                Cancel Subscription
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invoices */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Invoices</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.invoices.unlimited ? (
                  'Unlimited'
                ) : (
                  <>
                    {usage.invoices.used} / {usage.invoices.limit}
                  </>
                )}
              </span>
            </div>
            {!usage.invoices.unlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    usage.invoices.percentage
                  )}`}
                  style={{ width: `${Math.min(usage.invoices.percentage, 100)}%` }}
                ></div>
              </div>
            )}
            {usage.invoices.unlimited && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Zap className="w-4 h-4" />
                <span>Unlimited invoices</span>
              </div>
            )}
          </div>

          {/* Customers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Customers</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.customers.unlimited ? (
                  'Unlimited'
                ) : (
                  <>
                    {usage.customers.used} / {usage.customers.limit}
                  </>
                )}
              </span>
            </div>
            {!usage.customers.unlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    usage.customers.percentage
                  )}`}
                  style={{ width: `${Math.min(usage.customers.percentage, 100)}%` }}
                ></div>
              </div>
            )}
            {usage.customers.unlimited && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Zap className="w-4 h-4" />
                <span>Unlimited customers</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Items</span>
              </div>
              <span className="text-sm text-gray-600">
                {usage.items.unlimited ? (
                  'Unlimited'
                ) : (
                  <>
                    {usage.items.used} / {usage.items.limit}
                  </>
                )}
              </span>
            </div>
            {!usage.items.unlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(
                    usage.items.percentage
                  )}`}
                  style={{ width: `${Math.min(usage.items.percentage, 100)}%` }}
                ></div>
              </div>
            )}
            {usage.items.unlimited && (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Zap className="w-4 h-4" />
                <span>Unlimited items</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
          <span className="text-sm text-gray-600">Upgrade to unlock more features</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlans.map((plan) => {
            const isCurrent = plan.id === currentPlan.id;
            const isUpgrade = plan.price > currentPlan.price;

            return (
              <div
                key={plan.id}
                className={`border-2 rounded-lg p-6 ${
                  isCurrent
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-300 transition-colors'
                }`}
              >
                {isCurrent && (
                  <span className="inline-block px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full mb-3">
                    Current Plan
                  </span>
                )}

                <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                <p className="text-sm text-gray-600 mt-1 mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.currency} {plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/ {plan.billingPeriod.toLowerCase()}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.maxInvoices === -1
                        ? 'Unlimited'
                        : plan.maxInvoices.toLocaleString()}{' '}
                      invoices
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.maxCustomers === -1
                        ? 'Unlimited'
                        : plan.maxCustomers.toLocaleString()}{' '}
                      customers
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.maxItems === -1
                        ? 'Unlimited'
                        : plan.maxItems.toLocaleString()}{' '}
                      items
                    </span>
                  </li>
                  {plan.canUseWhatsApp && (
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>WhatsApp notifications</span>
                    </li>
                  )}
                  {plan.canUseSMS && (
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>SMS notifications</span>
                    </li>
                  )}
                  {plan.canUseReporting && (
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Advanced reporting</span>
                    </li>
                  )}
                  {plan.canRemoveBranding && (
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Remove branding</span>
                    </li>
                  )}
                </ul>

                {isCurrent ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isUpgrading}
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isUpgrading ? 'Processing...' : 'Upgrade'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Contact Sales
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <DeleteConfirmModal
          isOpen={showCancelModal}
          title="Cancel Subscription"
          message={`Are you sure you want to cancel your ${currentPlan.name} subscription? You'll still have access until ${new Date(
            subscription.currentPeriodEnd
          ).toLocaleDateString()}.`}
          isDeleting={isCanceling}
          onConfirm={handleCancelSubscription}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
