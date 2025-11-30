'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { LoadingTable } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { useToast } from '@/components/ui/Toast';

interface Tenant {
  id: string;
  companyName: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: string;
  subscription?: {
    plan: {
      name: string;
    };
    status: string;
  };
  _count: {
    users: number;
    invoices: number;
    customers: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<{ tenant: Tenant; status: 'ACTIVE' | 'SUSPENDED' } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTenants();
  }, [pagination.page, statusFilter]);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/tenants?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tenants');
      }

      const data = await response.json();
      setTenants(data.tenants);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load tenants');
      toast.error('Error loading tenants', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTenants();
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdate) return;

    try {
      setIsUpdatingStatus(true);
      setError('');

      const response = await fetch(`/api/admin/tenants/${statusUpdate.tenant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate.status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tenant status');
      }

      const action = statusUpdate.status === 'ACTIVE' ? 'activated' : 'suspended';
      toast.success(
        'Tenant status updated',
        `${statusUpdate.tenant.companyName} has been ${action}.`
      );
      setStatusUpdate(null);
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to update tenant');
      toast.error('Update failed', err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/admin/tenants/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tenant');
      }

      toast.success('Tenant deleted', `${deleteConfirm.companyName} has been deleted successfully.`);
      setDeleteConfirm(null);
      fetchTenants();
    } catch (err: any) {
      setError(err.message || 'Failed to delete tenant');
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      ACTIVE: { color: 'bg-green-100 text-green-800', label: 'Active' },
      SUSPENDED: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
      DELETED: { color: 'bg-gray-100 text-gray-800', label: 'Deleted' },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-600 mt-1">Manage all tenants in the system</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-colors"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Search
          </Button>
        </form>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <LoadingTable rows={5} />
        ) : tenants.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={search || statusFilter ? 'No tenants found' : 'No tenants yet'}
            description={
              search || statusFilter
                ? 'Try adjusting your search or filter criteria.'
                : 'Tenants will appear here when they sign up.'
            }
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {tenant.companyName}
                          </div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {tenant.subscription?.plan.name || 'No Plan'}
                        </div>
                        {tenant.subscription && (
                          <div className="text-xs text-gray-500">
                            {tenant.subscription.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{tenant._count.users} users</div>
                          <div className="text-gray-500">
                            {tenant._count.invoices} invoices
                          </div>
                          <div className="text-gray-500">
                            {tenant._count.customers} customers
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/tenants/${tenant.id}`}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {tenant.status === 'ACTIVE' ? (
                            <button
                              onClick={() => setStatusUpdate({ tenant, status: 'SUSPENDED' })}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Suspend tenant"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : tenant.status === 'SUSPENDED' ? (
                            <button
                              onClick={() => setStatusUpdate({ tenant, status: 'ACTIVE' })}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Activate tenant"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : null}

                          <button
                            onClick={() => setDeleteConfirm(tenant)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {tenant.companyName}
                      </h3>
                      <p className="text-sm text-gray-500">{tenant.email}</p>
                    </div>
                    {getStatusBadge(tenant.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Plan</p>
                      <p className="font-medium text-gray-900">
                        {tenant.subscription?.plan.name || 'No Plan'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium text-gray-900">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    {tenant._count.users} users • {tenant._count.invoices} invoices • {tenant._count.customers} customers
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <Link href={`/admin/tenants/${tenant.id}`}>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>

                    {tenant.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusUpdate({ tenant, status: 'SUSPENDED' })}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-4 h-4" />
                        Suspend
                      </Button>
                    ) : tenant.status === 'SUSPENDED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusUpdate({ tenant, status: 'ACTIVE' })}
                        className="flex items-center gap-2 text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Activate
                      </Button>
                    ) : null}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirm(tenant)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      {statusUpdate && (
        <DeleteConfirmModal
          isOpen={!!statusUpdate}
          title={`${statusUpdate.status === 'ACTIVE' ? 'Activate' : 'Suspend'} Tenant`}
          message={`Are you sure you want to ${
            statusUpdate.status === 'ACTIVE' ? 'activate' : 'suspend'
          } this tenant?`}
          itemName={statusUpdate.tenant.companyName}
          isDeleting={isUpdatingStatus}
          onConfirm={handleUpdateStatus}
          onCancel={() => setStatusUpdate(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          title="Delete Tenant"
          message="Are you sure you want to delete this tenant? This action cannot be undone and will delete all associated data."
          itemName={deleteConfirm.companyName}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
