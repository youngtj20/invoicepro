import { TemplateProps } from './types';

export default function LuxuryGold({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 shadow-2xl print:shadow-none relative text-white">
      {/* Gold Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-10">
          <div className="border-8 border-yellow-400 text-yellow-400 font-bold text-6xl px-8 py-4 opacity-40">
            PAID
          </div>
        </div>
      )}

      {/* Decorative Gold Corner */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-yellow-400"></div>
        <div className="absolute top-4 right-4 w-24 h-24 border-t-2 border-r-2 border-yellow-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-yellow-600">
          <div className="flex justify-between items-start">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4 brightness-200" />
              ) : (
                <h1 className="text-4xl font-bold text-yellow-400 mb-2 tracking-wide">
                  {invoice.companyName}
                </h1>
              )}
              <div className="text-gray-300 text-sm space-y-1">
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
              <h2 className="text-5xl font-bold text-yellow-400 mb-4 tracking-wider">INVOICE</h2>
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 px-6 py-3 rounded-lg shadow-xl border border-yellow-500">
                <p className="text-sm text-yellow-100">Invoice Number</p>
                <p className="text-xl font-bold text-white">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border-2 border-yellow-600 shadow-lg">
            <h3 className="text-sm font-bold text-yellow-400 uppercase mb-3 tracking-wide">Bill To:</h3>
            <div>
              <p className="font-bold text-lg text-white">{invoice.customer.name}</p>
              {invoice.customer.company && <p className="text-gray-300">{invoice.customer.company}</p>}
              {invoice.customer.email && <p className="text-sm mt-2 text-gray-400">{invoice.customer.email}</p>}
              {invoice.customer.address && (
                <div className="mt-3 text-sm text-gray-400">
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
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
              <p className="text-sm text-gray-400 mb-1">Invoice Date</p>
              <p className="font-semibold text-white text-lg">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
              <p className="text-sm text-gray-400 mb-1">Due Date</p>
              <p className="font-semibold text-white text-lg">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600">
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <p className={`inline-block px-3 py-1 rounded-full font-semibold ${
                isPaid ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-lg overflow-hidden border-2 border-yellow-600">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800">
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                  <td className="py-4 px-4 text-gray-200">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-200">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-200">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-yellow-400">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="flex justify-between py-2 text-gray-300">
              <span>Subtotal:</span>
              <span className="font-semibold text-white">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2 text-gray-300">
                <span>Tax:</span>
                <span className="font-semibold text-white">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 mt-2 rounded-lg font-bold text-xl shadow-xl border-2 border-yellow-500">
              <span>TOTAL:</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-yellow-600">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-bold text-yellow-400 uppercase mb-2 tracking-wide">Notes</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-bold text-yellow-400 uppercase mb-2 tracking-wide">Terms & Conditions</h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-yellow-600 text-center">
          <p className="text-yellow-400 font-semibold text-lg tracking-wide">Thank you for your business!</p>
          <p className="text-gray-400 text-sm mt-2">Premium Service • Exceptional Quality</p>
        </div>
      </div>
    </div>
  );
}
