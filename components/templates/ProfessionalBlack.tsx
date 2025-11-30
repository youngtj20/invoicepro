import { TemplateProps } from './types';

export default function ProfessionalBlack({ invoice }: TemplateProps) {
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
        <div className="absolute top-16 right-16 transform rotate-12">
          <div className="border-4 border-gray-800 text-gray-800 font-bold text-5xl px-6 py-3 opacity-25">
            PAID
          </div>
        </div>
      )}

      {/* Professional Header */}
      <div className="border-b-4 border-black pb-8 mb-10">
        <div className="flex items-start justify-between">
          <div>
            {invoice.companyLogo ? (
              <img src={invoice.companyLogo} alt="Logo" className="h-16 mb-4" />
            ) : (
              <h1 className="text-4xl font-bold text-black tracking-tight">{invoice.companyName}</h1>
            )}
            <div className="text-sm text-gray-700 mt-3 space-y-1">
              {invoice.companyEmail && <div className="font-medium">{invoice.companyEmail}</div>}
              {invoice.companyPhone && <div className="font-medium">{invoice.companyPhone}</div>}
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
            <h2 className="text-5xl font-bold text-black mb-3">INVOICE</h2>
            <div className="bg-black text-white px-6 py-2 inline-block">
              <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <div className="border-l-8 border-black pl-6 py-4">
            <h3 className="text-black font-bold text-sm uppercase tracking-widest mb-4">Bill To</h3>
            <p className="font-bold text-gray-900 text-xl mb-2">{invoice.customer.name}</p>
            {invoice.customer.company && <p className="text-gray-800 font-semibold text-lg">{invoice.customer.company}</p>}
            {invoice.customer.email && <p className="text-gray-700 mt-2">{invoice.customer.email}</p>}
            {invoice.customer.address && (
              <div className="mt-4 text-gray-700 space-y-1">
                <p>{invoice.customer.address}</p>
                <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
                {invoice.customer.country && <p>{invoice.customer.country}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline pb-3 border-b-2 border-gray-900">
            <span className="font-bold text-black uppercase tracking-wide text-sm">Invoice Date</span>
            <span className="text-gray-900 font-semibold text-lg">{formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex justify-between items-baseline pb-3 border-b-2 border-gray-900">
            <span className="font-bold text-black uppercase tracking-wide text-sm">Due Date</span>
            <span className="text-gray-900 font-semibold text-lg">{formatDate(invoice.dueDate)}</span>
          </div>
          <div className="flex justify-between items-baseline pb-3 border-b-2 border-gray-900">
            <span className="font-bold text-black uppercase tracking-wide text-sm">Status</span>
            <span className={`px-4 py-2 font-bold text-sm uppercase tracking-wider ${
              isPaid ? 'bg-black text-white' : 'bg-gray-200 text-gray-900'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10 border-2 border-black">
        <thead>
          <tr className="bg-black text-white">
            <th className="text-left py-4 px-5 font-bold uppercase tracking-wide text-sm">Description</th>
            <th className="text-center py-4 px-5 font-bold uppercase tracking-wide text-sm w-24">Qty</th>
            <th className="text-right py-4 px-5 font-bold uppercase tracking-wide text-sm w-36">Unit Price</th>
            <th className="text-right py-4 px-5 font-bold uppercase tracking-wide text-sm w-36">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className={`border-b-2 border-gray-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <td className="py-4 px-5 text-gray-900 font-medium">{item.description}</td>
              <td className="py-4 px-5 text-center text-gray-900 font-bold">{item.quantity}</td>
              <td className="py-4 px-5 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 px-5 text-right text-gray-900 font-bold text-lg">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-96 border-4 border-black">
          <div className="p-5 bg-white">
            <div className="flex justify-between py-3 border-b-2 border-gray-300">
              <span className="font-bold text-gray-900 uppercase tracking-wide">Subtotal</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxAmount > 0 && (
              <div className="flex justify-between py-3">
                <span className="font-bold text-gray-900 uppercase tracking-wide">Tax</span>
                <span className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
          </div>
          <div className="bg-black text-white p-6">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold uppercase tracking-widest">Total</span>
              <span className="text-3xl font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="border-t-4 border-black pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {invoice.notes && (
              <div>
                <h4 className="text-black font-bold uppercase tracking-widest text-sm mb-4 pb-2 border-b-2 border-gray-300">
                  Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-black font-bold uppercase tracking-widest text-sm mb-4 pb-2 border-b-2 border-gray-300">
                  Terms & Conditions
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-12 text-center">
        <div className="w-32 h-1 bg-black mx-auto mb-4"></div>
        <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Thank You</p>
      </div>
    </div>
  );
}
