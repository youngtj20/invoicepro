'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import LoadingSpinner, { LoadingTable } from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { useToast } from '@/components/ui/Toast';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  createdAt: string;
  _count: {
    invoices: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, search]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers');
      }

      setCustomers(data.customers);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.pages, // Map 'pages' to 'totalPages'
      });
    } catch (err: any) {
      setError(err.message);
      toast.error('Error loading customers', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/customers/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete customer');
      }

      toast.success('Customer deleted', `${deleteConfirm.name} has been deleted successfully.`);
      setDeleteConfirm(null);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">
            Manage your customer database
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Customer
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-2 max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or company..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <LoadingTable rows={5} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? 'No customers found' : 'No customers yet'}
            description={
              search
                ? 'Try adjusting your search terms to find what you\'re looking for.'
                : 'Get started by adding your first customer to the database.'
            }
            actionLabel={search ? undefined : 'Add Your First Customer'}
            actionHref={search ? undefined : '/dashboard/customers/new'}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoices
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {customer.email && (
                            <div className="text-gray-900">{customer.email}</div>
                          )}
                          {customer.phone && (
                            <div className="text-gray-500">{customer.phone}</div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.company || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer._count.invoices}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="Edit customer"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(customer)}
                            disabled={isDeleting}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                            title="Delete customer"
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
              {customers.map((customer) => (
                <div key={customer.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {customer.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="text-primary-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(customer)}
                        disabled={isDeleting}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {customer.email && (
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  )}
                  {customer.phone && (
                    <p className="text-sm text-gray-600">{customer.phone}</p>
                  )}
                  {customer.company && (
                    <p className="text-sm text-gray-500 mt-1">{customer.company}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {customer._count.invoices} invoices
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> customers
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          title="Delete Customer"
          message="Are you sure you want to delete this customer? This action cannot be undone."
          itemName={deleteConfirm.name}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
