'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from 'lucide-react';

interface MetricsData {
  overview: {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    deletedTenants: number;
    totalUsers: number;
    totalInvoices: number;
    totalCustomers: number;
    totalRevenue: number;
  };
  subscriptions: {
    active: number;
    trialing: number;
    canceled: number;
    pastDue: number;
    byPlan: { planName: string; count: number }[];
  };
  revenue: {
    mrr: number;
    totalRevenue: number;
    byPlan: { planName: string; revenue: number }[];
  };
  growth: {
    recentSignups: number;
    newTenantsLast7Days: number;
    newInvoicesLast7Days: number;
  };
  payments: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
    successRate: number;
  };
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/metrics');

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tenants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.overview.totalTenants}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.overview.activeTenants} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.overview.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Across all tenants
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.overview.totalInvoices}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                +{metrics.growth.newInvoicesLast7Days} last 7 days
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.overview.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From paid invoices
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Revenue
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Recurring Revenue (MRR)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(metrics.revenue.mrr)}
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">By Plan</p>
              <div className="space-y-2">
                {metrics.revenue.byPlan.map((item) => (
                  <div key={item.planName} className="flex justify-between">
                    <span className="text-sm text-gray-600">{item.planName}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Subscription Status
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {metrics.subscriptions.active}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Trialing</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {metrics.subscriptions.trialing}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Canceled</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {metrics.subscriptions.canceled}
              </span>
            </div>

            {metrics.subscriptions.pastDue > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Past Due</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {metrics.subscriptions.pastDue}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Growth & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Growth Metrics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">New Tenants (7 days)</span>
                <span className="text-lg font-bold text-gray-900">
                  {metrics.growth.newTenantsLast7Days}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (metrics.growth.newTenantsLast7Days / metrics.overview.totalTenants) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">New Invoices (7 days)</span>
                <span className="text-lg font-bold text-gray-900">
                  {metrics.growth.newInvoicesLast7Days}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (metrics.growth.newInvoicesLast7Days / metrics.overview.totalInvoices) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Statistics
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Payments</span>
              <span className="text-lg font-bold text-gray-900">
                {metrics.payments.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Successful</span>
              <span className="text-lg font-bold text-green-600">
                {metrics.payments.successful}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="text-lg font-bold text-red-600">
                {metrics.payments.failed}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-lg font-bold text-yellow-600">
                {metrics.payments.pending}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Success Rate</span>
                <span className="text-xl font-bold text-gray-900">
                  {metrics.payments.successRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${metrics.payments.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription Distribution by Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {metrics.subscriptions.byPlan.map((item) => (
            <div
              key={item.planName}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <p className="text-sm text-gray-600">{item.planName}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
              <p className="text-xs text-gray-500 mt-1">subscriptions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
