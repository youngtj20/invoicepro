import { TemplateProps } from './types';

export default function MidnightDark({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 shadow-2xl print:shadow-none relative text-white overflow-hidden">
      {/* Neon Glow Effects */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Paid Stamp */}
      {isPaid && (
        <div className="absolute top-20 right-20 transform rotate-12 z-20">
          <div className="border-8 border-cyan-400 text-cyan-400 font-bold text-6xl px-8 py-4 opacity-50 shadow-lg shadow-cyan-500/50">
            PAID
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-purple-500 shadow-lg shadow-purple-500/20">
          <div className="flex justify-between items-start">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Company Logo" className="h-16 mb-4 brightness-200" />
              ) : (
                <h1 className="text-4xl font-bold mb-2 tracking-wide">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    {invoice.companyName}
                  </span>
                </h1>
              )}
              <div className="text-gray-300 text-sm space-y-1">
                {invoice.companyEmail && <p className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                  {invoice.companyEmail}
                </p>}
                {invoice.companyPhone && <p className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
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
              <h2 className="text-5xl font-bold mb-4 tracking-wider">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  INVOICE
                </span>
              </h2>
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-600 px-6 py-3 rounded-lg shadow-xl shadow-purple-500/30 border border-purple-400">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform -skew-x-12"></div>
                <div className="relative">
                  <p className="text-sm text-purple-100">Invoice Number</p>
                  <p className="text-xl font-bold text-white">{invoice.invoiceNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="relative bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-lg border border-purple-500 shadow-lg shadow-purple-500/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500"></div>
            <h3 className="text-sm font-bold text-purple-400 uppercase mb-3 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              Bill To
            </h3>
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
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-4 rounded-lg border border-purple-500 shadow-md shadow-purple-500/10">
              <p className="text-sm text-purple-300 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Invoice Date
              </p>
              <p className="font-semibold text-white text-lg">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-4 rounded-lg border border-cyan-500 shadow-md shadow-cyan-500/10">
              <p className="text-sm text-cyan-300 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
                Due Date
              </p>
              <p className="font-semibold text-white text-lg">{formatDate(invoice.dueDate)}</p>
            </div>
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-4 rounded-lg border border-pink-500 shadow-md shadow-pink-500/10">
              <p className="text-sm text-pink-300 mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                Status
              </p>
              <p className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${
                isPaid 
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                  : 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/50'
              }`}>
                {invoice.status}
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8 rounded-lg overflow-hidden border border-purple-500 shadow-xl shadow-purple-500/20">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white">
                <th className="text-left py-4 px-4 font-semibold">Description</th>
                <th className="text-center py-4 px-4 font-semibold w-24">Qty</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Unit Price</th>
                <th className="text-right py-4 px-4 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 bg-opacity-50 backdrop-blur-sm">
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 hover:bg-opacity-50 transition-colors">
                  <td className="py-4 px-4 text-gray-200">{item.description}</td>
                  <td className="py-4 px-4 text-center text-gray-200">{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-gray-200">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 px-4 text-right font-semibold text-cyan-400">{formatCurrency(item.total)}</td>
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
            <div className="relative overflow-hidden mt-2">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl"></div>
              <div className="relative flex justify-between py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 px-4 rounded-lg font-bold text-xl shadow-2xl shadow-purple-500/50 border border-purple-400">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-purple-500 shadow-lg shadow-purple-500/10">
            {invoice.notes && (
              <div className="bg-slate-800 bg-opacity-30 backdrop-blur-sm p-4 rounded-lg border border-purple-500">
                <h4 className="text-sm font-bold text-purple-400 uppercase mb-2 tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Notes
                </h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-slate-800 bg-opacity-30 backdrop-blur-sm p-4 rounded-lg border border-cyan-500">
                <h4 className="text-sm font-bold text-cyan-400 uppercase mb-2 tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                  Terms & Conditions
                </h4>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-purple-500 text-center shadow-lg shadow-purple-500/10">
          <p className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text font-semibold text-lg tracking-wide mb-2">
            Thank you for your business!
          </p>
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
