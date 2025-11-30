'use client';

import { LineItem } from './LineItemTable';

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

interface InvoicePreviewProps {
  customer: Customer | null;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  terms: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  companyName?: string;
}

export default function InvoicePreview({
  customer,
  invoiceNumber,
  invoiceDate,
  dueDate,
  items,
  notes,
  terms,
  subtotal,
  taxAmount,
  total,
  companyName = 'Your Company',
}: InvoicePreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
          <p className="text-gray-600">{companyName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
          <p className="text-lg font-semibold text-gray-900">{invoiceNumber || '—'}</p>
        </div>
      </div>

      {/* Bill To & Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">
            Bill To:
          </h3>
          {customer ? (
            <div className="text-gray-900">
              <p className="font-medium">{customer.name}</p>
              {customer.company && <p>{customer.company}</p>}
              {customer.email && (
                <p className="text-sm text-gray-600">{customer.email}</p>
              )}
              {customer.address && (
                <div className="mt-2 text-sm">
                  <p>{customer.address}</p>
                  <p>
                    {[customer.city, customer.state, customer.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {customer.country && <p>{customer.country}</p>}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">No customer selected</p>
          )}
        </div>

        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">Invoice Date</p>
            <p className="font-medium text-gray-900">
              {invoiceDate ? formatDate(invoiceDate) : '—'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-medium text-gray-900">
              {dueDate ? formatDate(dueDate) : '—'}
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
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                  No items added
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-right text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-900">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-gray-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span className="font-medium">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(notes || terms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
          {notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                Notes
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">
                Terms & Conditions
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
