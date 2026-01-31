'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string | null;
}

interface Transaction {
  id: string;
  type: 'invoice' | 'payment' | 'receipt';
  date: string;
  reference: string;
  customer: Customer | null;
  description: string;
  amount: number;
  status: string;
  paymentStatus: string;
  currency: string;
  metadata: any;
}

interface Summary {
  totalTransactions: number;
  totalInvoices: number;
  totalPayments: number;
  totalReceipts: number;
  totalRevenue: number;
  totalPending: number;
  totalPaid: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const typeConfig = {
  invoice: {
    label: 'Invoice',
    icon: FileText,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600',
  },
  payment: {
    label: 'Payment',
    icon: CreditCard,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600',
  },
  receipt: {
    label: 'Receipt',
    icon: Receipt,
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600',
  },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  VIEWED: { label: 'Viewed', color: 'bg-purple-100 text-purple-800' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  CANCELED: { label: 'Canceled', color: 'bg-gray-100 text-gray-800' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  success: { label: 'Success', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
};

const paymentStatusConfig = {
  UNPAID: { label: 'Unpaid', color: 'bg-red-100 text-red-800' },
  PARTIALLY_PAID: { label: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800' },
};

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalTransactions: 0,
    totalInvoices: 0,
    totalPayments: 0,
    totalReceipts: 0,
    totalRevenue: 0,
    totalPending: 0,
    totalPaid: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, startDate, endDate, typeFilter, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/reports/transactions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transactions');
      }

      setTransactions(data.transactions);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setTypeFilter('');
    setStatusFilter('');
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hasActiveFilters = startDate || endDate || typeFilter || statusFilter;

  const filteredTransactions = searchTerm
    ? transactions.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Reference', 'Customer', 'Description', 'Amount', 'Status', 'Payment Status'];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      typeConfig[t.type].label,
      t.reference,
      t.customer?.name || 'N/A',
      t.description,
      formatCurrency(t.amount, t.currency),
      t.status,
      t.paymentStatus,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Detailed transaction history and financial insights
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">
              {summary.totalPayments} payments
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {summary.totalInvoices} invoices
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Awaiting payment</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalTransactions}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">All time</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reference, customer, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Button */}
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

        {/* Advanced Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
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
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="invoice">Invoices</option>
                  <option value="payment">Payments</option>
                  <option value="receipt">Receipts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="VIEWED">Viewed</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="PAID">Paid</option>
                </select>
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

      {/* Transactions Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters || searchTerm
              ? 'Try adjusting your search or filters'
              : 'Transactions will appear here once you create invoices or receive payments'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const typeInfo = typeConfig[transaction.type];
                    const TypeIcon = typeInfo.icon;

                    return (
                      <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`w-4 h-4 ${typeInfo.iconColor}`} />
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-medium text-primary-600">
                            {transaction.reference}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.customer?.name || 'N/A'}
                            </p>
                            {transaction.customer?.email && (
                              <p className="text-sm text-gray-500">
                                {transaction.customer.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {statusConfig[transaction.status] && (
                              <span
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                  statusConfig[transaction.status].color
                                }`}
                              >
                                {statusConfig[transaction.status].label}
                              </span>
                            )}
                            {transaction.type === 'invoice' && paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig] && (
                              <span
                                className={`inline-block px-2 py-1 text-xs font-semibold rounded ml-1 ${
                                  paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig].color
                                }`}
                              >
                                {paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig].label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {transaction.type === 'invoice' && (
                            <Link
                              href={`/dashboard/invoices/${transaction.id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}
                          {transaction.type === 'receipt' && (
                            <Link
                              href={`/dashboard/receipts/${transaction.id}`}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredTransactions.map((transaction) => {
              const typeInfo = typeConfig[transaction.type];
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={`${transaction.type}-${transaction.id}`}
                  className="bg-white rounded-lg shadow p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className={`w-5 h-5 ${typeInfo.iconColor}`} />
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {transaction.reference}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">
                        {transaction.customer?.name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{formatDate(transaction.date)}</span>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Description:</p>
                      <p className="text-gray-900">{transaction.description}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex gap-2">
                      {statusConfig[transaction.status] && (
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            statusConfig[transaction.status].color
                          }`}
                        >
                          {statusConfig[transaction.status].label}
                        </span>
                      )}
                      {transaction.type === 'invoice' && paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig] && (
                        <span
                          className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig].color
                          }`}
                        >
                          {paymentStatusConfig[transaction.paymentStatus as keyof typeof paymentStatusConfig].label}
                        </span>
                      )}
                    </div>
                    {(transaction.type === 'invoice' || transaction.type === 'receipt') && (
                      <Link
                        href={`/dashboard/${transaction.type === 'invoice' ? 'invoices' : 'receipts'}/${transaction.id}`}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
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
                  <ChevronLeft className="w-4 h-4 mr-1" />
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
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
