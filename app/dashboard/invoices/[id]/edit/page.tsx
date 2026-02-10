'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import CustomerSelect from '@/components/invoice/CustomerSelect';
import LineItemTable, { LineItem } from '@/components/invoice/LineItemTable';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  customerId: string;
  customer: Customer;
  items: Array<{
    id: string;
    itemId: string;
    item: {
      id: string;
      name: string;
      description: string | null;
      unitPrice: number;
    };
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  terms: string | null;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customerId, setCustomerId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invoice');
      }

      setInvoice(data);
      setCustomerId(data.customerId);
      setInvoiceNumber(data.invoiceNumber);
      setInvoiceDate(data.issueDate.split('T')[0]);
      setDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');
      setNotes(data.notes || '');
      setTerms(data.terms || '');

      // Convert invoice items to line items format
      const items: LineItem[] = data.items.map((item: any) => {
        // InvoiceItem has: price (unit price), quantity, amount (line total)
        const unitPrice = item.price || 0;
        const quantity = item.quantity || 1;
        const lineSubtotal = quantity * unitPrice;
        
        return {
          id: item.id,
          itemId: item.itemId || null,
          description: item.description || '',
          quantity: quantity,
          unitPrice: unitPrice,
          taxId: item.taxId,
          taxRate: item.taxRate || 0,
          taxAmount: item.taxAmount || 0,
          total: lineSubtotal, // Store just the line subtotal (quantity * price)
        };
      });
      setLineItems(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      // Validation
      if (!customerId) {
        throw new Error('Please select a customer');
      }
      if (!invoiceDate) {
        throw new Error('Please enter an invoice date');
      }
      if (lineItems.length === 0) {
        throw new Error('Please add at least one line item');
      }

      // Calculate totals - subtotal is sum of (quantity * unitPrice) for each item
      const subtotal = lineItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      // Calculate total tax
      const totalTax = lineItems.reduce((sum, item) => {
        return sum + (item.taxAmount || 0);
      }, 0);
      
      const total = subtotal + totalTax;

      const payload = {
        invoiceNumber,
        issueDate: new Date(invoiceDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        notes: notes || '',
        terms: terms || '',
        subtotal: subtotal || 0,
        taxAmount: totalTax || 0,
        total: total || 0,
        items: lineItems.map((item) => ({
          itemId: item.itemId || undefined,
          description: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          amount: (item.quantity * item.unitPrice) || 0,
        })),
      };

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update invoice');
      }

      setSuccess('Invoice updated successfully!');

      // Redirect back to invoice detail page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/invoices/${invoiceId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-5xl mx-auto">
        <Alert variant="error">Invoice not found</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/invoices/${invoiceId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoice
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="text-gray-600 mt-1">{invoice.invoiceNumber}</p>
          </div>

          <Button onClick={handleSave} isLoading={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <CustomerSelect
            selectedCustomerId={customerId}
            onSelect={setCustomerId}
            onCreateNew={() => {}}
          />
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number *
            </label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Date *
            </label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Line Items *
          </label>
          <LineItemTable items={lineItems} onChange={setLineItems} />
        </div>

        {/* Notes & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Additional notes for the customer..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Payment terms and conditions..."
            />
          </div>
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                NGN {lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {lineItems.some(item => item.taxAmount > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">
                  NGN {lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>
                NGN {(lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + lineItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/invoices/${invoiceId}`}
          className="text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>

        <Button onClick={handleSave} isLoading={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
