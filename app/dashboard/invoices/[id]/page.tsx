'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Send,
  Edit2,
  Trash2,
  MoreVertical,
  FileText,
  CreditCard,
  ExternalLink,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import SendInvoiceModal from '@/components/invoice/SendInvoiceModal';
import MarkPaidModal from '@/components/invoice/MarkPaidModal';
import PaymentStamp from '@/components/invoice/PaymentStamp';
import SendWhatsAppModal from '@/components/invoice/SendWhatsAppModal';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'VIEWED' | 'OVERDUE' | 'CANCELED';
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  paymentLink: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  terms: string | null;
  customer: Customer;
  items: InvoiceItem[];
  createdAt: string;
}

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-800' },
  VIEWED: { label: 'Viewed', color: 'bg-purple-100 text-purple-800' },
  OVERDUE: { label: 'Overdue', color: 'bg-red-100 text-red-800' },
  CANCELED: { label: 'Canceled', color: 'bg-gray-100 text-gray-800' },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isGeneratingPaymentLink, setIsGeneratingPaymentLink] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/invoices/${invoiceId}`);
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

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setError('');

      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoice?.invoiceNumber || 'invoice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
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

      router.push('/dashboard/invoices');
    } catch (err: any) {
      setError(err.message);
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    try {
      setIsGeneratingPaymentLink(true);
      setError('');

      const response = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate payment link');
      }

      // Refresh invoice to get updated payment link
      await fetchInvoice();

      // Open payment link in new tab
      if (data.paymentLink) {
        window.open(data.paymentLink, '_blank');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGeneratingPaymentLink(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `NGN ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert variant="error">Invoice not found</Alert>
        <Link href="/dashboard/invoices">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Created {formatDate(invoice.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                statusConfig[invoice.status].color
              }`}
            >
              {statusConfig[invoice.status].label}
            </span>

            <PaymentStamp paymentStatus={invoice.paymentStatus} size="md" />

            {invoice.paymentStatus !== 'PAID' && (
              <>
                <Button
                  variant="success"
                  onClick={() => setShowMarkPaidModal(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGeneratePaymentLink}
                  isLoading={isGeneratingPaymentLink}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {invoice.paymentLink ? 'View Payment Link' : 'Generate Payment Link'}
                </Button>
              </>
            )}

            <Button onClick={handleDownloadPDF} isLoading={isDownloading} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            <div className="relative z-50">
              <Button
                variant="outline"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href={`/dashboard/invoices/${invoiceId}/edit`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowActions(false)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Invoice
                    </Link>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowActions(false);
                        setShowSendModal(true);
                      }}
                    >
                      <Send className="w-4 h-4" />
                      Send via Email
                    </button>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowActions(false);
                        setShowWhatsAppModal(true);
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send via WhatsApp
                    </button>
                    {invoice.paymentStatus !== 'PAID' && (
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowActions(false);
                          handleGeneratePaymentLink();
                        }}
                      >
                        <CreditCard className="w-4 h-4" />
                        Generate Payment Link
                      </button>
                    )}
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        setShowActions(false);
                        setDeleteConfirm(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Invoice Preview */}
      <div className="bg-white rounded-lg shadow p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
            <p className="text-gray-600">Your Company Name</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Invoice Number</p>
            <p className="text-lg font-semibold text-gray-900">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
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
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.invoiceDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.dueDate)}
              </p>
            </div>
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
                <th className="text-right py-3 text-sm font-semibold text-gray-700 w-28">
                  Unit Price
                </th>
                <th className="text-right py-3 text-sm font-semibold text-gray-700 w-28">
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
                    {formatCurrency((item as any).price)}
                  </td>
                  <td className="py-3 text-right text-gray-900">
                    {formatCurrency((item as any).amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total)}</span>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Invoice
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete invoice {invoice.invoiceNumber}? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {invoice && (
        <SendInvoiceModal
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          customerEmail={invoice.customer.email}
          customerPhone={invoice.customer.phone}
          customerName={invoice.customer.name}
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          onSuccess={() => {
            // Refresh invoice data to update status
            fetchInvoice();
          }}
        />
      )}

      {/* Send WhatsApp Modal */}
      {invoice && (
        <SendWhatsAppModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          customerName={invoice.customer.name}
          customerPhone={invoice.customer.phone}
        />
      )}

      {/* Mark Paid Modal */}
      {invoice && (
        <MarkPaidModal
          isOpen={showMarkPaidModal}
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          invoiceAmount={invoice.total}
          onClose={() => setShowMarkPaidModal(false)}
          onSuccess={() => {
            // Refresh invoice data to update status
            fetchInvoice();
          }}
        />
      )}
    </div>
  );
}
