import { TemplateProps } from './types';

export default function ElegantPurple({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-purple-50 to-white p-12 shadow-lg print:shadow-none relative">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-12">
          <div className="border-4 border-green-600 text-green-600 font-bold text-5xl px-6 py-3 rounded-lg opacity-40">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Elegant Header */}
      <div className="text-center mb-10">
        {invoice.companyLogo ? (
          <img src={invoice.companyLogo} alt="Logo" className="h-16 mx-auto mb-4" />
        ) : (
          <h1 className="text-5xl font-light tracking-wide text-purple-900 mb-2">{invoice.companyName}</h1>
        )}
        <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-light tracking-widest text-purple-800">INVOICE</h2>
        <p className="text-purple-600 font-semibold text-lg mt-2">{invoice.invoiceNumber}</p>
      </div>

      {/* Company Info */}
      {(invoice.companyEmail || invoice.companyPhone || invoice.companyAddress) && (
        <div className="text-center text-sm text-gray-600 mb-8">
          {invoice.companyEmail && <span>{invoice.companyEmail}</span>}
          {invoice.companyEmail && invoice.companyPhone && <span className="mx-2">•</span>}
          {invoice.companyPhone && <span>{invoice.companyPhone}</span>}
          {invoice.companyAddress && (
            <div className="mt-1">
              <span>{invoice.companyAddress}</span>
              {invoice.companyCity && <span>, {invoice.companyCity}</span>}
              {invoice.companyState && <span>, {invoice.companyState}</span>}
              {invoice.companyPostalCode && <span> {invoice.companyPostalCode}</span>}
            </div>
          )}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-white border-l-4 border-purple-500 p-6 rounded-r shadow-sm">
          <h3 className="text-purple-700 font-semibold text-sm uppercase tracking-wide mb-4">Bill To</h3>
          <p className="font-semibold text-gray-900 text-lg">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700 mt-1">{invoice.customer.company}</p>}
          {invoice.customer.email && <p className="text-sm text-gray-600 mt-2">{invoice.customer.email}</p>}
          {invoice.customer.address && (
            <div className="mt-3 text-sm text-gray-600">
              <p>{invoice.customer.address}</p>
              <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p>{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Invoice Date</p>
            <p className="text-gray-900 font-medium">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Due Date</p>
            <p className="text-gray-900 font-medium">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-xs text-purple-600 uppercase tracking-wide mb-1">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              isPaid ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-purple-300">
            <th className="text-left py-4 px-2 text-sm font-semibold text-purple-900 uppercase tracking-wide">Description</th>
            <th className="text-center py-4 px-2 text-sm font-semibold text-purple-900 uppercase tracking-wide w-20">Qty</th>
            <th className="text-right py-4 px-2 text-sm font-semibold text-purple-900 uppercase tracking-wide w-32">Rate</th>
            <th className="text-right py-4 px-2 text-sm font-semibold text-purple-900 uppercase tracking-wide w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className="border-b border-purple-100">
              <td className="py-4 px-2 text-gray-900">{item.description}</td>
              <td className="py-4 px-2 text-center text-gray-700">{item.quantity}</td>
              <td className="py-4 px-2 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 px-2 text-right text-gray-900 font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-96">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between py-2 text-gray-700">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2 text-gray-700">
                <span>Tax</span>
                <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="border-t-2 border-purple-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-light text-purple-900 uppercase tracking-wide">Total</span>
                <span className="text-2xl font-bold text-purple-700">{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="border-t border-purple-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoice.notes && (
              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="text-purple-700 font-semibold text-sm uppercase tracking-wide mb-2">Notes</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="text-purple-700 font-semibold text-sm uppercase tracking-wide mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm font-light italic">Thank you for your business</p>
      </div>
    </div>
  );
}
