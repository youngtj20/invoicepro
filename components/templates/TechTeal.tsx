import { TemplateProps } from './types';

export default function TechTeal({ invoice }: TemplateProps) {
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
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-12 shadow-lg print:shadow-none relative font-mono">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-12">
          <div className="border-4 border-green-500 text-green-500 font-bold text-5xl px-6 py-3 rounded opacity-30">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Tech Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              {invoice.companyLogo ? (
                <img src={invoice.companyLogo} alt="Logo" className="h-14 mb-3 brightness-0 invert" />
              ) : (
                <h1 className="text-3xl font-bold tracking-tight mb-2">{invoice.companyName}</h1>
              )}
              <div className="text-teal-100 text-sm font-light space-y-1">
                {invoice.companyEmail && <div className="flex items-center gap-2">▸ {invoice.companyEmail}</div>}
                {invoice.companyPhone && <div className="flex items-center gap-2">▸ {invoice.companyPhone}</div>}
                {invoice.companyAddress && (
                  <div className="flex items-start gap-2 mt-2">
                    <span>▸</span>
                    <div>
                      <div>{invoice.companyAddress}</div>
                      <div>
                        {[invoice.companyCity, invoice.companyState, invoice.companyPostalCode].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm px-5 py-3 rounded-lg border-2 border-white/40">
                <p className="text-teal-100 text-xs font-bold uppercase tracking-widest mb-1">Invoice</p>
                <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md border-l-4 border-teal-500 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-100 rounded flex items-center justify-center">
              <span className="text-teal-600 font-bold">&gt;</span>
            </div>
            <h3 className="text-teal-700 font-bold text-xs uppercase tracking-wider">Bill To</h3>
          </div>
          <p className="font-bold text-gray-900 text-lg mb-1 font-sans">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700 font-semibold font-sans">{invoice.customer.company}</p>}
          {invoice.customer.email && (
            <p className="text-sm text-gray-600 mt-2 bg-teal-50 px-2 py-1 rounded inline-block">{invoice.customer.email}</p>
          )}
          {invoice.customer.address && (
            <div className="mt-3 text-sm text-gray-600 font-sans space-y-1">
              <p>{invoice.customer.address}</p>
              <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p>{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-teal-400">
            <p className="text-xs text-teal-700 font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="text-teal-500">&gt;</span> Invoice Date
            </p>
            <p className="text-gray-900 font-bold font-sans">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-cyan-400">
            <p className="text-xs text-cyan-700 font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="text-cyan-500">&gt;</span> Due Date
            </p>
            <p className="text-gray-900 font-bold font-sans">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-400">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="text-blue-500">&gt;</span> Status
            </p>
            <span className={`inline-block px-3 py-1 rounded font-bold text-sm font-sans ${
              isPaid ? 'bg-green-100 text-green-800' : 'bg-teal-100 text-teal-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border-2 border-teal-200">
        <div className="bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 border-b-4 border-teal-500">
          <p className="text-teal-800 font-bold text-sm">&gt; LINE_ITEMS</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
              <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-wider">Description</th>
              <th className="text-center py-4 px-4 font-bold uppercase text-xs tracking-wider w-20">Qty</th>
              <th className="text-right py-4 px-4 font-bold uppercase text-xs tracking-wider w-32">Rate</th>
              <th className="text-right py-4 px-4 font-bold uppercase text-xs tracking-wider w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="font-sans">
            {invoice.items.map((item, index) => (
              <tr key={index} className={`border-b ${index % 2 === 0 ? 'bg-teal-50/30' : 'bg-white'} border-teal-100`}>
                <td className="py-4 px-4 text-gray-900">
                  <span className="text-teal-500 mr-2">&gt;</span>
                  {item.description}
                </td>
                <td className="py-4 px-4 text-center text-gray-800 font-bold">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 px-4 text-right text-gray-900 font-bold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96 bg-white rounded-xl shadow-lg overflow-hidden border-2 border-teal-200">
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 px-4 py-2 border-b-4 border-teal-500">
            <p className="text-teal-800 font-bold text-sm">&gt; SUMMARY</p>
          </div>
          <div className="p-5 font-sans">
            <div className="flex justify-between py-3 text-gray-700 border-b border-teal-100">
              <span className="flex items-center gap-2">
                <span className="text-teal-500">&gt;</span>
                <span className="font-semibold">Subtotal</span>
              </span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-3 text-gray-700 border-b border-teal-100">
                <span className="flex items-center gap-2">
                  <span className="text-teal-500">&gt;</span>
                  <span className="font-semibold">Tax</span>
                </span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-4 mt-2">
              <span className="flex items-center gap-2 text-teal-700">
                <span className="text-teal-500 font-bold">&gt;&gt;</span>
                <span className="font-bold uppercase tracking-wide">Total</span>
              </span>
              <span className="text-2xl font-bold text-teal-700">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoice.notes && (
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
              <h4 className="text-teal-700 font-bold uppercase tracking-wide text-sm mb-3 flex items-center gap-2">
                <span className="text-teal-500">&gt;</span> Notes
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
              <h4 className="text-cyan-700 font-bold uppercase tracking-wide text-sm mb-3 flex items-center gap-2">
                <span className="text-cyan-500">&gt;</span> Terms & Conditions
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1 w-48 mx-auto mb-3 rounded-full"></div>
        <p className="text-teal-600 font-bold">&gt; Thank you for your business</p>
        <p className="text-teal-500 text-sm mt-1 font-light">&gt;&gt; Powered by innovation</p>
      </div>
    </div>
  );
}
