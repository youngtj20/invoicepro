import { TemplateProps } from './types';

export default function FreshOrange({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-white p-12 shadow-lg print:shadow-none relative">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-12">
          <div className="border-4 border-green-600 text-green-600 font-bold text-5xl px-6 py-3 rounded-full opacity-40">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Fresh Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between">
          <div>
            {invoice.companyLogo ? (
              <img src={invoice.companyLogo} alt="Logo" className="h-16 mb-4" />
            ) : (
              <h1 className="text-4xl font-bold text-orange-600 mb-2">{invoice.companyName}</h1>
            )}
            <div className="flex items-center gap-2 flex-wrap text-sm text-gray-600 mt-2">
              {invoice.companyEmail && (
                <span className="bg-white px-3 py-1 rounded-full border border-orange-200">{invoice.companyEmail}</span>
              )}
              {invoice.companyPhone && (
                <span className="bg-white px-3 py-1 rounded-full border border-orange-200">{invoice.companyPhone}</span>
              )}
            </div>
            {invoice.companyAddress && (
              <div className="text-sm text-gray-600 mt-2 bg-white/60 px-3 py-2 rounded-lg inline-block">
                <div>{invoice.companyAddress}</div>
                <div>
                  {[invoice.companyCity, invoice.companyState, invoice.companyPostalCode].filter(Boolean).join(', ')}
                </div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl shadow-lg">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-1">Invoice</h2>
              <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-orange-600 font-bold text-sm uppercase tracking-wide mb-4">Billed To</h3>
          <p className="font-bold text-gray-900 text-lg mb-1">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700">{invoice.customer.company}</p>}
          {invoice.customer.email && (
            <p className="text-sm text-gray-600 mt-2 bg-orange-50 px-2 py-1 rounded inline-block">{invoice.customer.email}</p>
          )}
          {invoice.customer.address && (
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>{invoice.customer.address}</p>
              <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p>{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Invoice Date</p>
                <p className="text-gray-900 font-semibold">{formatDate(invoice.invoiceDate)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">📅</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Due Date</p>
                <p className="text-gray-900 font-semibold">{formatDate(invoice.dueDate)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">⏰</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-lg">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="text-left py-4 px-4 font-bold text-sm uppercase tracking-wide">Description</th>
              <th className="text-center py-4 px-4 font-bold text-sm uppercase tracking-wide w-24">Qty</th>
              <th className="text-right py-4 px-4 font-bold text-sm uppercase tracking-wide w-32">Rate</th>
              <th className="text-right py-4 px-4 font-bold text-sm uppercase tracking-wide w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-orange-50/30' : 'bg-white'} border-orange-100`}>
                <td className="py-4 px-4 text-gray-900">{item.description}</td>
                <td className="py-4 px-4 text-center text-gray-800 font-semibold">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-4 text-right text-gray-900 font-bold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96 bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between py-3 text-gray-700">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-3 text-gray-700 border-t border-orange-100">
                <span className="font-semibold">Tax</span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold uppercase tracking-wide">Total</span>
              <span className="text-3xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoice.notes && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-400">
              <h4 className="text-orange-600 font-bold text-sm uppercase tracking-wide mb-3">Notes</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-400">
              <h4 className="text-orange-600 font-bold text-sm uppercase tracking-wide mb-3">Terms & Conditions</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-1 bg-orange-500 rounded"></div>
          <div className="w-12 h-1 bg-orange-400 rounded"></div>
          <div className="w-8 h-1 bg-orange-500 rounded"></div>
        </div>
        <p className="text-orange-600 font-semibold">Thank you for your business!</p>
      </div>
    </div>
  );
}
