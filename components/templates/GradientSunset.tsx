import { TemplateProps } from './types';

export default function GradientSunset({ invoice }: TemplateProps) {
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
      {/* Gradient Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 opacity-10 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 opacity-10 rounded-full blur-3xl -ml-40 -mb-40"></div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-10">
          <div className="border-8 border-green-500 text-green-500 font-bold text-6xl px-8 py-4 opacity-30">
            PAID
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header with Gradient */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4" />
              ) : (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
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
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg">
                <p className="text-sm opacity-90">Invoice Number</p>
                <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full"></div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent uppercase mb-3">
              Bill To:
            </h3>
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
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Invoice Date</p>
              <p className="font-semibold text-gray-800 text-lg">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
              <p className="text-sm text-gray-600 mb-1">Due Date</p>
              <p className="font-semibold text-gray-800 text-lg">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-orange-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className={`inline-block px-3 py-1 rounded-full font-semibold ${
                isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                  <td className="py-4 px-4 text-gray-800">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-800">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-800">{formatCurrency(item.total)}</td>
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
            <div className="flex justify-between py-4 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white px-4 mt-2 rounded-lg font-bold text-xl shadow-lg">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-gray-200">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent uppercase mb-2">
                  Notes
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent uppercase mb-2">
                  Terms & Conditions
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-border text-center">
          <p className="text-gray-600 font-medium">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
