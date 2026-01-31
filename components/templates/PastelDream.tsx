import { TemplateProps } from './types';

export default function PastelDream({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-12 shadow-lg print:shadow-none relative">
      {/* Soft Decorative Circles */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute top-40 right-40 w-32 h-32 bg-purple-200 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-pink-200 rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute bottom-40 left-40 w-36 h-36 bg-indigo-200 rounded-full opacity-20 blur-2xl"></div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-10">
          <div className="border-8 border-green-400 text-green-400 font-bold text-6xl px-8 py-4 opacity-30">
            PAID
          </div>
        </div>
      )}

      <div className="relative z-10 bg-white bg-opacity-70 backdrop-blur-sm rounded-3xl p-10 shadow-xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4" />
              ) : (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {invoice.companyName}
                </h1>
              )}
              <div className="text-gray-600 text-sm space-y-1">
                {invoice.companyEmail && <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                  {invoice.companyEmail}
                </p>}
                {invoice.companyPhone && <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-300 rounded-full"></span>
                  {invoice.companyPhone}
                </p>}
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
              <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-4">
                INVOICE
              </h2>
              <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-6 py-3 rounded-3xl border-2 border-purple-200 shadow-md">
                <p className="text-sm text-purple-600 font-medium">Invoice Number</p>
                <p className="text-xl font-bold text-gray-800">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-1 bg-blue-200 rounded-full"></div>
            <div className="flex-1 h-1 bg-purple-200 rounded-full"></div>
            <div className="flex-1 h-1 bg-pink-200 rounded-full"></div>
            <div className="flex-1 h-1 bg-indigo-200 rounded-full"></div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-3xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-purple-600 uppercase">Bill To</h3>
            </div>
            <div className="text-gray-800 ml-12">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                <p className="text-sm text-blue-600 font-semibold">Invoice Date</p>
              </div>
              <p className="font-semibold text-gray-800 text-lg ml-5">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                <p className="text-sm text-purple-600 font-semibold">Due Date</p>
              </div>
              <p className="font-semibold text-gray-800 text-lg ml-5">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-2xl border-2 border-pink-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
                <p className="text-sm text-pink-600 font-semibold">Status</p>
              </div>
              <p className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm ml-5 ${
                isPaid 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                  : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-3xl overflow-hidden shadow-md border-2 border-purple-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-gray-800">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoice.items.map((item, index) => (
                <tr key={index} className={`border-b border-purple-100 hover:bg-purple-50 transition-colors ${
                  index % 2 === 0 ? 'bg-blue-50 bg-opacity-30' : 'bg-white'
                }`}>
                  <td className="py-4 px-4 text-gray-800">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-purple-600">{formatCurrency(item.total)}</td>
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
            <div className="flex justify-between py-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 text-gray-800 px-4 mt-2 rounded-3xl font-bold text-xl shadow-lg">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-purple-200">
            {invoice.notes && (
              <div className="bg-blue-50 bg-opacity-60 p-5 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <h4 className="text-sm font-bold text-blue-600 uppercase">Notes</h4>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap ml-4">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-pink-50 bg-opacity-60 p-5 rounded-2xl border border-pink-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <h4 className="text-sm font-bold text-pink-600 uppercase">Terms & Conditions</h4>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap ml-4">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 text-center">
          <p className="text-gray-700 font-medium mb-3">Thank you for your business!</p>
          <div className="flex justify-center gap-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
            <div className="w-3 h-3 bg-pink-300 rounded-full"></div>
            <div className="w-3 h-3 bg-indigo-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
