import { TemplateProps } from './types';

export default function OceanWave({ invoice }: TemplateProps) {
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
    <div className="bg-white p-12 shadow-lg print:shadow-none relative overflow-hidden">
      {/* Wave Background */}
      <div className="absolute top-0 left-0 right-0 h-64 opacity-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,80 L1200,0 L0,0 Z" fill="url(#oceanGradient)" />
          <defs>
            <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#0E7490" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-10">
          <div className="border-8 border-green-500 text-green-500 font-bold text-6xl px-8 py-4 opacity-30">
            PAID
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4" />
              ) : (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 bg-clip-text text-transparent mb-2">
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
              <h2 className="text-5xl font-bold text-gray-800 mb-4">INVOICE</h2>
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <div className="absolute inset-0 bg-white opacity-20 transform -skew-x-12"></div>
                <div className="relative">
                  <p className="text-sm opacity-90">Invoice Number</p>
                  <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 rounded-full shadow-md"></div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="relative bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-2xl border-2 border-cyan-200 shadow-md overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
            <h3 className="text-sm font-bold text-cyan-700 uppercase mb-3 relative z-10">Bill To:</h3>
            <div className="text-gray-800 relative z-10">
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
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-4 rounded-xl border-l-4 border-cyan-500 shadow-sm">
              <p className="text-sm text-cyan-700 mb-1 font-semibold">Invoice Date</p>
              <p className="font-semibold text-gray-800 text-lg">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border-l-4 border-teal-500 shadow-sm">
              <p className="text-sm text-teal-700 mb-1 font-semibold">Due Date</p>
              <p className="font-semibold text-gray-800 text-lg">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-teal-50 p-4 rounded-xl border-l-4 border-cyan-600 shadow-sm">
              <p className="text-sm text-cyan-700 mb-1 font-semibold">Status</p>
              <p className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${
                isPaid ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoice.items.map((item, index) => (
                <tr key={index} className={`border-b border-cyan-100 hover:bg-cyan-50 transition-colors ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <td className="py-4 px-4 text-gray-800">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-cyan-700">{formatCurrency(item.total)}</td>
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
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-500 opacity-20 transform -skew-x-12"></div>
              <div className="relative flex justify-between py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white px-4 mt-2 rounded-xl font-bold text-xl shadow-lg">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-cyan-200">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-bold text-cyan-700 uppercase mb-2">Notes</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-bold text-teal-700 uppercase mb-2">Terms & Conditions</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 text-center">
          <div className="inline-block">
            <p className="text-gray-700 font-medium mb-2">Thank you for your business!</p>
            <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
