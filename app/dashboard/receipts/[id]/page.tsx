'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Send,
  MoreVertical,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import SendReceiptModal from '@/components/receipt/SendReceiptModal';

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

interface Receipt {
  id: string;
  receiptNumber: string;
  issueDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  reference: string | null;
  status: string;
  notes: string | null;
  customer: Customer;
  tenant: Tenant;
  invoiceId: string | null;
  createdAt: string;
}

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  useEffect(() => {
    fetchReceipt();
  }, [receiptId]);

  const fetchReceipt = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/receipts/${receiptId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch receipt');
      }

      setReceipt(data);
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

      const response = await fetch(`/api/receipts/${receiptId}/pdf`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate PDF');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${receipt?.receiptNumber || 'receipt'}.pdf`;
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

      const response = await fetch(`/api/receipts/${receiptId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete receipt');
      }

      router.push('/dashboard/receipts');
    } catch (err: any) {
      setError(err.message);
      setDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!receipt && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert variant="error">Receipt not found</Alert>
        <Link href="/dashboard/receipts">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Receipts
          </Button>
        </Link>
      </div>
    );
  }

  if (!receipt) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/receipts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Receipts
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {receipt.receiptNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Created {formatDate(receipt.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded border-2 border-green-300 bg-green-50 text-green-700">
              <CheckCircle className="w-4 h-4" />
              PAID
            </span>

            <Button onClick={() => setShowSendModal(true)} variant="primary">
              <Send className="w-4 h-4 mr-2" />
              Send Receipt
            </Button>

            <Button onClick={handleDownloadPDF} isLoading={isDownloading} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {receipt.invoiceId && (
                      <Link
                        href={`/dashboard/invoices/${receipt.invoiceId}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowActions(false)}
                      >
                        View Invoice
                      </Link>
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

      {/* Receipt Preview */}
      <div className="bg-white rounded-lg shadow p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">RECEIPT</h2>
            <p className="text-gray-600">{receipt.tenant.companyName}</p>
            {receipt.tenant.email && <p className="text-sm text-gray-600">{receipt.tenant.email}</p>}
            {receipt.tenant.phone && <p className="text-sm text-gray-600">{receipt.tenant.phone}</p>}
            {receipt.tenant.address && (
              <p className="text-sm text-gray-600 mt-2">
                {receipt.tenant.address}
                {receipt.tenant.city && `, ${receipt.tenant.city}`}
                {receipt.tenant.state && `, ${receipt.tenant.state}`}
                {receipt.tenant.postalCode && ` ${receipt.tenant.postalCode}`}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Receipt Number</p>
            <p className="text-lg font-semibold text-gray-900">
              {receipt.receiptNumber}
            </p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-700 uppercase mb-3">
              Received From:
            </h3>
            <div className="text-gray-900">
              <p className="font-medium">{receipt.customer.name}</p>
              {receipt.customer.company && <p>{receipt.customer.company}</p>}
              {receipt.customer.email && (
                <p className="text-sm text-gray-600">{receipt.customer.email}</p>
              )}
              {receipt.customer.address && (
                <div className="mt-2 text-sm">
                  <p>{receipt.customer.address}</p>
                  <p>
                    {[
                      receipt.customer.city,
                      receipt.customer.state,
                      receipt.customer.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {receipt.customer.country && <p>{receipt.customer.country}</p>}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Receipt Date:</span>
                <span className="font-medium">{formatDate(receipt.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="font-medium">{receipt.paymentMethod}</span>
              </div>
              {receipt.reference && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reference:</span>
                  <span className="font-medium">{receipt.reference}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="mb-8">
          <table className="w-full">
            <thead className="bg-primary-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-4">Payment Received</td>
                <td className="px-4 py-4 text-right font-semibold">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-1/2">
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between rounded">
              <span className="font-bold text-lg">TOTAL PAID:</span>
              <span className="font-bold text-xl">
                {formatCurrency(receipt.amount, receipt.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {receipt.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-primary-600 uppercase mb-2">
              Notes:
            </h3>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {receipt.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-primary-600 text-center text-sm text-gray-600">
          <p>Thank you for your payment!</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Receipt
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete receipt {receipt.receiptNumber}? This
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
                Delete Receipt
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Receipt Modal */}
      {receipt && (
        <SendReceiptModal
          isOpen={showSendModal}
          receiptId={receipt.id}
          receiptNumber={receipt.receiptNumber}
          customerEmail={receipt.customer.email}
          customerPhone={receipt.customer.phone}
          customerName={receipt.customer.name}
          onClose={() => setShowSendModal(false)}
          onSuccess={() => {
            // Optionally show success message
            setShowSendModal(false);
          }}
        />
      )}
    </div>
  );
}
