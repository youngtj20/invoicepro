import { TemplateProps } from './types';

export default function CorporateNavy({ invoice }: TemplateProps) {
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
    <div className="bg-white p-12 shadow-lg print:shadow-none relative">
      {isPaid && (
        <div className="absolute top-16 right-16 transform rotate-[-15deg]">
          <div className="border-6 border-green-600 text-green-600 font-bold text-5xl px-6 py-3 rounded opacity-30">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Corporate Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-10 -mx-12 -mt-12 mb-10">
        <div className="grid grid-cols-2 gap-8">
          <div>
            {invoice.companyLogo ? (
              <img src={invoice.companyLogo} alt="Logo" className="h-14 mb-4 brightness-0 invert" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">{invoice.companyName}</h1>
            )}
            <div className="text-slate-300 text-sm mt-3 space-y-1">
              {invoice.companyEmail && <div>{invoice.companyEmail}</div>}
              {invoice.companyPhone && <div>{invoice.companyPhone}</div>}
              {invoice.companyAddress && (
                <div className="mt-2">
                  <div>{invoice.companyAddress}</div>
                  <div>
                    {[invoice.companyCity, invoice.companyState, invoice.companyPostalCode].filter(Boolean).join(', ')}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-bold mb-3">INVOICE</h2>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 inline-block rounded">
              <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="bg-slate-50 p-6 rounded-lg">
          <h3 className="text-slate-700 font-bold text-xs uppercase tracking-wider mb-4 pb-2 border-b-2 border-slate-300">
            Bill To
          </h3>
          <p className="font-bold text-gray-900 text-lg mb-1">{invoice.customer.name}</p>
          {invoice.customer.company && <p className="text-gray-700 font-semibold">{invoice.customer.company}</p>}
          {invoice.customer.email && <p className="text-gray-600 text-sm mt-2">{invoice.customer.email}</p>}
          {invoice.customer.address && (
            <div className="mt-3 text-sm text-gray-600 space-y-0.5">
              <p>{invoice.customer.address}</p>
              <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
              {invoice.customer.country && <p>{invoice.customer.country}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Invoice Date</p>
            <p className="text-gray-900 font-semibold">{formatDate(invoice.invoiceDate)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Due Date</p>
            <p className="text-gray-900 font-semibold">{formatDate(invoice.dueDate)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Status</p>
            <span className={`inline-block px-4 py-1.5 rounded font-bold text-sm ${
              isPaid ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="text-left py-4 px-4 font-bold uppercase text-xs tracking-wider">Description</th>
            <th className="text-center py-4 px-4 font-bold uppercase text-xs tracking-wider w-24">Quantity</th>
            <th className="text-right py-4 px-4 font-bold uppercase text-xs tracking-wider w-36">Unit Price</th>
            <th className="text-right py-4 px-4 font-bold uppercase text-xs tracking-wider w-36">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className={`border-b-2 ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-slate-200`}>
              <td className="py-4 px-4 text-gray-900">{item.description}</td>
              <td className="py-4 px-4 text-center text-gray-800 font-semibold">{item.quantity}</td>
              <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 px-4 text-right text-gray-900 font-bold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-96 bg-slate-50 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between py-2 text-gray-700">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-2 text-gray-700 border-t border-slate-200">
                <span className="font-semibold">Tax</span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
          </div>
          <div className="bg-slate-800 text-white p-5">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold uppercase tracking-wide">Total Due</span>
              <span className="text-2xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="border-t-2 border-slate-300 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoice.notes && (
              <div className="bg-slate-50 p-5 rounded-lg">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                  Notes
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div className="bg-slate-50 p-5 rounded-lg">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">
                  Terms & Conditions
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="inline-block bg-slate-800 h-1 w-24 mb-3"></div>
        <p className="text-slate-600 text-sm font-semibold">Thank you for your business</p>
      </div>
    </div>
  );
}
