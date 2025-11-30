'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  Receipt,
  DollarSign,
  CreditCard,
  Ban,
  CheckCircle,
  Trash2,
} from 'lucide-react';

interface TenantDetail {
  id: string;
  companyName: string;
  email: string;
  status: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  createdAt: string;
  subscription?: {
    plan: {
      name: string;
      price: number;
      billingPeriod: string;
    };
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  _count: {
    invoices: number;
    customers: number;
    items: number;
    receipts: number;
    payments: number;
  };
  stats: {
    totalRevenue: number;
    paidInvoices: number;
    draftInvoices: number;
  };
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTenant();
  }, [tenantId]);

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tenants/${tenantId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tenant');
      }

      const data = await response.json();
      setTenant(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  const updateTenantStatus = async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!confirm(`Are you sure you want to ${status === 'ACTIVE' ? 'activate' : 'suspend'} this tenant?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tenant');
      }

      fetchTenant();
    } catch (err: any) {
      alert(err.message || 'Failed to update tenant');
    }
  };

  const deleteTenant = async () => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone!')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }

      router.push('/admin/tenants');
    } catch (err: any) {
      alert(err.message || 'Failed to delete tenant');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      SUSPENDED: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
      DELETED: { color: 'bg-gray-100 text-gray-800', label: 'Deleted' },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/tenants"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tenants
        </Link>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error || 'Tenant not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/tenants"
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {tenant.companyName}
            </h1>
            <p className="text-gray-600 mt-1">{tenant.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(tenant.status)}

          {tenant.status === 'ACTIVE' ? (
            <button
              onClick={() => updateTenantStatus('SUSPENDED')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Ban className="w-4 h-4" />
              <span>Suspend</span>
            </button>
          ) : tenant.status === 'SUSPENDED' ? (
            <button
              onClick={() => updateTenantStatus('ACTIVE')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Activate</span>
            </button>
          ) : null}

          <button
            onClick={deleteTenant}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(tenant.stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenant._count.invoices}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {tenant.stats.paidInvoices} paid
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenant._count.customers}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receipts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {tenant._count.receipts}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Receipt className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Company Info & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Company Information
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="text-sm font-medium text-gray-900">
                {tenant.companyName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{tenant.email}</p>
            </div>
            {tenant.phone && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{tenant.phone}</p>
              </div>
            )}
            {tenant.address && (
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-medium text-gray-900">
                  {tenant.address}
                  {tenant.city && `, ${tenant.city}`}
                  {tenant.state && `, ${tenant.state}`}
                  {tenant.postalCode && ` ${tenant.postalCode}`}
                  {tenant.country && `, ${tenant.country}`}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
          </div>
          {tenant.subscription ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-sm font-medium text-gray-900">
                  {tenant.subscription.plan.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(tenant.subscription.plan.price)} /{' '}
                  {tenant.subscription.plan.billingPeriod.toLowerCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  {tenant.subscription.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Period</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(tenant.subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                  {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active subscription</p>
          )}
        </div>
      </div>

      {/* Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({tenant.users.length})
            </h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tenant.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
