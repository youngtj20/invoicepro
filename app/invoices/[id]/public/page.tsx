'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

interface Tenant {
  companyName: string;
  logo: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string | null;
  status: string;
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  currency: string;
  paymentLink: string | null;
  customer: Customer;
  tenant: Tenant;
  items: InvoiceItem[];
}

const paymentStatusConfig = {
  UNPAID: { label: 'Unpaid', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PARTIALLY_PAID: { label: 'Partially Paid', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  PAID: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/invoices/${invoiceId}/public`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoice');
      }

      setInvoice(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!invoice) return;

    try {
      setIsGeneratingLink(true);
      setError('');

      // Check if payment link already exists
      if (invoice.paymentLink) {
        window.open(invoice.paymentLink, '_blank');
        return;
      }

      // Generate new payment link
      const response = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate payment link');
      }

      // Open payment link in new tab
      window.open(data.paymentLink, '_blank');

      // Refresh invoice to get updated payment link
      await fetchInvoice();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="error" className="mb-4">
            {error || 'Invoice not found'}
          </Alert>
        </div>
      </div>
    );
  }

  const StatusIcon = paymentStatusConfig[invoice.paymentStatus].icon;
  const isPaid = invoice.paymentStatus === 'PAID';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {invoice.invoiceNumber}
                </h1>
                <p className="text-sm text-gray-600">
                  From {invoice.tenant.companyName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg ${
                  paymentStatusConfig[invoice.paymentStatus].color
                }`}
              >
                <StatusIcon className="w-4 h-4" />
                {paymentStatusConfig[invoice.paymentStatus].label}
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {!isPaid && (
              <Button
                onClick={handlePayNow}
                isLoading={isGeneratingLink}
                className="flex-1 sm:flex-none"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {invoice.paymentLink ? 'Pay Now' : 'Generate Payment Link'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Company Info & Invoice Info */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200 flex-wrap gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
              {invoice.tenant.logo && (
                <img
                  src={invoice.tenant.logo}
                  alt={invoice.tenant.companyName}
                  className="h-12 mb-3"
                />
              )}
              <p className="text-gray-900 font-semibold">
                {invoice.tenant.companyName}
              </p>
              {invoice.tenant.address && (
                <div className="text-sm text-gray-600 mt-2">
                  <p>{invoice.tenant.address}</p>
                  <p>
                    {[
                      invoice.tenant.city,
                      invoice.tenant.state,
                      invoice.tenant.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {invoice.tenant.country && <p>{invoice.tenant.country}</p>}
                </div>
              )}
              {invoice.tenant.email && (
                <p className="text-sm text-gray-600 mt-2">{invoice.tenant.email}</p>
              )}
              {invoice.tenant.phone && (
                <p className="text-sm text-gray-600">{invoice.tenant.phone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Invoice Number</p>
              <p className="text-lg font-semibold text-gray-900">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          {/* Bill To & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                Bill To:
              </h3>
              <div className="text-gray-900">
                <p className="font-medium">{invoice.customer.name}</p>
                {invoice.customer.company && <p>{invoice.customer.company}</p>}
                {invoice.customer.email && (
                  <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                )}
                {invoice.customer.address && (
                  <div className="mt-2 text-sm">
                    <p>{invoice.customer.address}</p>
                    <p>
                      {[
                        invoice.customer.city,
                        invoice.customer.state,
                        invoice.customer.postalCode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {invoice.customer.country && <p>{invoice.customer.country}</p>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Issue Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>
              {invoice.dueDate && (
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(invoice.dueDate)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 w-20">
                    Qty
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 w-32">
                    Unit Price
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700 w-32">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{item.description}</td>
                    <td className="py-3 text-right text-gray-900">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-900">
                      {formatCurrency(item.price, invoice.currency)}
                    </td>
                    <td className="py-3 text-right text-gray-900">
                      {formatCurrency(item.amount, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span className="font-medium">
                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              {invoice.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {invoice.notes}
                  </p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                    Terms & Conditions
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {invoice.terms}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>This is an official invoice from {invoice.tenant.companyName}</p>
        </div>
      </div>
    </div>
  );
}
