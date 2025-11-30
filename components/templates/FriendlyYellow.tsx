import { TemplateProps } from './types';

export default function FriendlyYellow({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-12 shadow-lg print:shadow-none relative">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-[-12deg]">
          <div className="border-4 border-green-500 text-green-500 font-bold text-5xl px-6 py-3 rounded-2xl opacity-40">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Friendly Header */}
      <div className="text-center mb-10">
        {invoice.companyLogo ? (
          <img src={invoice.companyLogo} alt="Logo" className="h-20 mx-auto mb-4" />
        ) : (
          <h1 className="text-5xl font-bold text-yellow-600 mb-3">{invoice.companyName}</h1>
        )}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
          <span className="text-yellow-600 text-2xl">☀</span>
          <div className="w-16 h-1 bg-yellow-400 rounded-full"></div>
        </div>
        <h2 className="text-3xl font-bold text-yellow-700 mb-2">INVOICE</h2>
        <p className="text-yellow-600 font-bold text-xl">{invoice.invoiceNumber}</p>

        {(invoice.companyEmail || invoice.companyPhone || invoice.companyAddress) && (
          <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block shadow-sm">
            <div className="text-sm text-gray-700 space-y-1">
              {invoice.companyEmail && <div className="flex items-center justify-center gap-2">✉ {invoice.companyEmail}</div>}
              {invoice.companyPhone && <div className="flex items-center justify-center gap-2">📞 {invoice.companyPhone}</div>}
              {invoice.companyAddress && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  📍 {invoice.companyAddress}
                  {invoice.companyCity && `, ${invoice.companyCity}`}
                  {invoice.companyState && `, ${invoice.companyState}`}
                  {invoice.companyPostalCode && ` ${invoice.companyPostalCode}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-white rounded-3xl shadow-lg p-8 border-4 border-yellow-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">👤</div>
            <h3 className="text-yellow-700 font-bold text-sm uppercase tracking-wide">Bill To</h3>
          </div>
          <p className="font-bold text-gray-900 text-xl mb-2">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700 font-semibold text-lg">{invoice.customer.company}</p>}
          {invoice.customer.email && (
            <p className="text-sm text-gray-600 mt-3 bg-yellow-50 px-3 py-2 rounded-lg inline-block">
              ✉ {invoice.customer.email}
            </p>
          )}
          {invoice.customer.address && (
            <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg space-y-1">
              <p>📍 {invoice.customer.address}</p>
              <p className="pl-5">{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p className="pl-5">{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-8 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-700 font-bold uppercase tracking-wide mb-2">📅 Invoice Date</p>
                <p className="text-gray-900 font-bold text-lg">{formatDate(invoice.invoiceDate)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-8 border-amber-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wide mb-2">⏰ Due Date</p>
                <p className="text-gray-900 font-bold text-lg">{formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-5 border-l-8 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-700 font-bold uppercase tracking-wide mb-2">📊 Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                  isPaid ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'
                }`}>
                  {isPaid ? '✓ ' : ''}{invoice.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 border-4 border-yellow-300">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900">
              <th className="text-left py-4 px-5 font-bold uppercase tracking-wide text-sm">📝 Description</th>
              <th className="text-center py-4 px-5 font-bold uppercase tracking-wide text-sm w-24">🔢 Qty</th>
              <th className="text-right py-4 px-5 font-bold uppercase tracking-wide text-sm w-32">💰 Rate</th>
              <th className="text-right py-4 px-5 font-bold uppercase tracking-wide text-sm w-32">💵 Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={`border-b-2 ${index % 2 === 0 ? 'bg-yellow-50/50' : 'bg-white'} border-yellow-100`}>
                <td className="py-4 px-5 text-gray-900 font-medium">{item.description}</td>
                <td className="py-4 px-5 text-center text-gray-800 font-bold">{item.quantity}</td>
                <td className="py-4 px-5 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-5 text-right text-gray-900 font-bold text-lg">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96 bg-white rounded-3xl shadow-lg overflow-hidden border-4 border-yellow-300">
          <div className="p-6">
            <div className="flex justify-between py-3 text-gray-700">
              <span className="font-bold">Subtotal</span>
              <span className="font-bold text-lg">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-3 text-gray-700 border-t-2 border-yellow-100">
                <span className="font-bold">Tax</span>
                <span className="font-bold text-lg">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold uppercase tracking-wide">🎉 Total</span>
              <span className="text-3xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoice.notes && (
            <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-yellow-300">
              <h4 className="text-yellow-700 font-bold uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
                📌 Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="bg-white rounded-3xl shadow-lg p-6 border-4 border-yellow-300">
              <h4 className="text-yellow-700 font-bold uppercase tracking-wide text-sm mb-4 flex items-center gap-2">
                📋 Terms & Conditions
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
          <span className="text-2xl">😊</span>
          <div className="w-12 h-1 bg-yellow-400 rounded-full"></div>
        </div>
        <p className="text-yellow-700 font-bold text-lg">Thank you for your business!</p>
        <p className="text-yellow-600 text-sm mt-1">We appreciate working with you</p>
      </div>
    </div>
  );
}
