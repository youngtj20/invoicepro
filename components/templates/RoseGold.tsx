import { TemplateProps } from './types';

export default function RoseGold({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 p-12 shadow-lg print:shadow-none relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-rose-200 to-transparent opacity-30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200 to-transparent opacity-30 rounded-full blur-3xl"></div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-10">
          <div className="border-8 border-green-500 text-green-500 font-bold text-6xl px-8 py-4 opacity-30">
            PAID
          </div>
        </div>
      )}

      <div className="relative z-10 bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl p-10 shadow-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4" />
              ) : (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-2">
                  {invoice.companyName}
                </h1>
              )}
              <div className="text-gray-600 text-sm space-y-1">
                {invoice.companyEmail && <p>{invoice.companyEmail}</p>}
                {invoice.companyPhone && <p>{invoice.companyPhone}</p>}
                {invoice.companyAddress && (
                  <div className="mt-2">
                    <p>{invoice.companyAddress}</p>
                    <p>
                      {[invoice.companyCity, invoice.companyState, invoice.companyPostalCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {invoice.companyCountry && <p>{invoice.companyCountry}</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent mb-4">
                INVOICE
              </h2>
              <div className="bg-gradient-to-br from-rose-100 to-amber-100 px-6 py-3 rounded-2xl border-2 border-rose-300 shadow-md">
                <p className="text-sm text-rose-700 font-semibold">Invoice Number</p>
                <p className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-1 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full"></div>
            <div className="flex-1 h-1 bg-gradient-to-r from-pink-300 to-amber-300 rounded-full"></div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl border-2 border-rose-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">→</span>
              </div>
              <h3 className="text-sm font-bold text-rose-700 uppercase">Bill To</h3>
            </div>
            <div className="text-gray-800">
              <p className="font-bold text-lg">{invoice.customer.name}</p>
              {invoice.customer.company && <p className="text-gray-600">{invoice.customer.company}</p>}
              {invoice.customer.email && <p className="text-sm mt-2">{invoice.customer.email}</p>}
              {invoice.customer.address && (
                <div className="mt-3 text-sm text-gray-600">
                  <p>{invoice.customer.address}</p>
                  <p>
                    {[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {invoice.customer.country && <p>{invoice.customer.country}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                <p className="text-sm text-rose-700 font-semibold">Invoice Date</p>
              </div>
              <p className="font-semibold text-gray-800 text-lg ml-4">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-amber-50 p-4 rounded-xl border border-pink-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <p className="text-sm text-pink-700 font-semibold">Due Date</p>
              </div>
              <p className="font-semibold text-gray-800 text-lg ml-4">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-rose-50 p-4 rounded-xl border border-amber-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <p className="text-sm text-amber-700 font-semibold">Status</p>
              </div>
              <p className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ml-4 ${
                isPaid ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-md border-2 border-rose-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-rose-300 via-pink-300 to-amber-300 text-gray-800">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoice.items.map((item, index) => (
                <tr key={index} className={`border-b border-rose-100 hover:bg-rose-50 transition-colors ${
                  index % 2 === 0 ? 'bg-rose-50 bg-opacity-30' : 'bg-white'
                }`}>
                  <td className="py-4 px-4 text-gray-800">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-rose-700">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2 text-gray-700">
                <span>Tax:</span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 text-white px-4 mt-2 rounded-2xl font-bold text-xl shadow-lg">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-rose-200">
            {invoice.notes && (
              <div className="bg-rose-50 bg-opacity-50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-rose-700 uppercase mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-amber-50 bg-opacity-50 p-4 rounded-xl">
                <h4 className="text-sm font-bold text-amber-700 uppercase mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 text-center">
          <p className="text-gray-700 font-medium mb-3">Thank you for your business!</p>
          <div className="flex justify-center gap-2">
            <div className="w-16 h-1 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-pink-300 to-amber-300 rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-amber-300 to-rose-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
