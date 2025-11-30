'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Send,
  Download,
  MoreVertical,
  Filter,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import SendInvoiceModal from '@/components/invoice/SendInvoiceModal';
import PaymentStamp from '@/components/invoice/PaymentStamp';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'OVERDUE' | 'CANCELED';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  customer: Customer;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  VIEWED: { label: 'Viewed', color: 'bg-purple-100 text-purple-800' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  CANCELED: { label: 'Canceled', color: 'bg-gray-100 text-gray-800' },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sendInvoice, setSendInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [pagination.page, search, statusFilter, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoices');
      }

      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete invoice');
      }

      setDeleteConfirm(null);
      fetchInvoices();
    } catch (err: any) {
      setError(err.message);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `NGN ${amount.toLocaleString()}`;
  };

  const hasActiveFilters = statusFilter || startDate || endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your invoices
          </p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? 'border-primary-500' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full"></span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoices List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No invoices found
          </h3>
          <p className="text-gray-600 mb-6">
            {search || hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first invoice'}
          </p>
          {!search && !hasActiveFilters && (
            <Link href="/dashboard/invoices/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Invoice
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {invoice.customer.name}
                        </p>
                        {invoice.customer.email && (
                          <p className="text-sm text-gray-500">
                            {invoice.customer.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          statusConfig[invoice.status].color
                        }`}
                      >
                        {statusConfig[invoice.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PaymentStamp paymentStatus={invoice.paymentStatus} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === invoice.id ? null : invoice.id
                            )
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        {activeMenu === invoice.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                              <Link
                                href={`/dashboard/invoices/${invoice.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setActiveMenu(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </Link>
                              <Link
                                href={`/dashboard/invoices/${invoice.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setActiveMenu(null)}
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setActiveMenu(null);
                                  setSendInvoice(invoice);
                                }}
                              >
                                <Send className="w-4 h-4" />
                                Send
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  setActiveMenu(null);
                                  // TODO: Implement download functionality
                                  alert('Download functionality coming soon!');
                                }}
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </button>
                              <div className="border-t border-gray-200 my-1"></div>
                              <button
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => {
                                  setActiveMenu(null);
                                  setDeleteConfirm(invoice.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-lg shadow p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="font-medium text-primary-600 hover:text-primary-700"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="text-sm text-gray-900 font-medium mt-1">
                      {invoice.customer.name}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                      statusConfig[invoice.status].color
                    }`}
                  >
                    {statusConfig[invoice.status].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(invoice.invoiceDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === invoice.id ? null : invoice.id
                        )
                      }
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Mobile Action Menu */}
                {activeMenu === invoice.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute right-4 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setActiveMenu(null);
                          setSendInvoice(invoice);
                        }}
                      >
                        <Send className="w-4 h-4" />
                        Send
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setActiveMenu(null);
                          alert('Download functionality coming soon!');
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => {
                          setActiveMenu(null);
                          setDeleteConfirm(invoice.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} invoices
              </p>
              <div className="flex items-center gap-2">
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
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Invoice
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                isLoading={isDeleting}
              >
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {sendInvoice && (
        <SendInvoiceModal
          invoiceId={sendInvoice.id}
          invoiceNumber={sendInvoice.invoiceNumber}
          customerEmail={sendInvoice.customer.email}
          customerPhone={sendInvoice.customer.phone}
          customerName={sendInvoice.customer.name}
          isOpen={true}
          onClose={() => setSendInvoice(null)}
          onSuccess={() => {
            // Refresh invoices list to update status
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
}
