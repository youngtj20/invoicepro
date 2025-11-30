import { TemplateProps } from './types';

export default function MinimalistGray({ invoice }: TemplateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `${invoice.currency || 'NGN'} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="bg-white p-12 shadow-lg print:shadow-none relative font-sans">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-12">
          <div className="border-2 border-gray-400 text-gray-400 font-medium text-5xl px-6 py-3 opacity-30">
            PAID
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <div className="flex items-start justify-between mb-16 pb-8 border-b border-gray-300">
        <div>
          {invoice.companyLogo ? (
            <img src={invoice.companyLogo} alt="Logo" className="h-12 mb-4" />
          ) : (
            <h1 className="text-3xl font-light text-gray-800 mb-2">{invoice.companyName}</h1>
          )}
          {(invoice.companyEmail || invoice.companyPhone) && (
            <div className="text-sm text-gray-500 space-y-1">
              {invoice.companyEmail && <div>{invoice.companyEmail}</div>}
              {invoice.companyPhone && <div>{invoice.companyPhone}</div>}
            </div>
          )}
          {invoice.companyAddress && (
            <div className="text-sm text-gray-500 mt-2">
              <div>{invoice.companyAddress}</div>
              <div>
                {[invoice.companyCity, invoice.companyState, invoice.companyPostalCode].filter(Boolean).join(', ')}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">Invoice</h2>
          <p className="text-2xl font-light text-gray-800">{invoice.invoiceNumber}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-16 mb-16">
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Bill To</h3>
          <p className="text-gray-900 font-medium mb-1">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700 text-sm">{invoice.customer.company}</p>}
          {invoice.customer.email && <p className="text-gray-600 text-sm mt-2">{invoice.customer.email}</p>}
          {invoice.customer.address && (
            <div className="mt-3 text-sm text-gray-600 space-y-0.5">
              <p>{invoice.customer.address}</p>
              <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p>{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Invoice Date</p>
            <p className="text-gray-800">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
            <p className="text-gray-800">{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider ${
              isPaid ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Qty</th>
            <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Rate</th>
            <th className="text-right py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-200">
              <td className="py-4 text-gray-900">{item.description}</td>
              <td className="py-4 text-right text-gray-700">{item.quantity}</td>
              <td className="py-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 text-right text-gray-900 font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-80">
          <div className="flex justify-between py-3 text-gray-700">
            <span className="text-sm font-medium">Subtotal</span>
            <span className="text-sm">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-3 text-gray-700">
              <span className="text-sm font-medium">Tax</span>
              <span className="text-sm">{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="border-t-2 border-gray-800 mt-3 pt-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
              <span className="text-3xl font-light text-gray-900">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-16 pt-8 border-t border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {invoice.notes && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Notes</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Terms & Conditions</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-16 text-center">
        <p className="text-xs text-gray-400 font-light tracking-wide">Thank you for your business</p>
      </div>
    </div>
  );
}
