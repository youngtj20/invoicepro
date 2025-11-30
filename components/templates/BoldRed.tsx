import { TemplateProps } from './types';

export default function BoldRed({ invoice }: TemplateProps) {
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
        <div className="absolute top-16 right-16 transform rotate-[-12deg]">
          <div className="border-8 border-green-600 text-green-600 font-bold text-6xl px-8 py-4 rounded opacity-30">
            PAID
          </div>
        </div>
      )}

      {/* Bold Red Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 -mx-12 -mt-12 mb-10">
        <div className="flex items-center justify-between">
          <div>
            {invoice.companyLogo ? (
              <img src={invoice.companyLogo} alt="Logo" className="h-16 mb-3 brightness-0 invert" />
            ) : (
              <h1 className="text-4xl font-black uppercase tracking-tight">{invoice.companyName}</h1>
            )}
            <div className="text-red-100 text-sm mt-2">
              {invoice.companyEmail && <div>{invoice.companyEmail}</div>}
              {invoice.companyPhone && <div>{invoice.companyPhone}</div>}
              {invoice.companyAddress && (
                <div className="mt-1">
                  {invoice.companyAddress}
                  {invoice.companyCity && `, ${invoice.companyCity}`}
                  {invoice.companyState && `, ${invoice.companyState}`}
                  {invoice.companyPostalCode && ` ${invoice.companyPostalCode}`}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-5xl font-black uppercase">INVOICE</h2>
            <p className="text-2xl font-bold mt-2 text-red-100">{invoice.invoiceNumber}</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <div className="bg-red-50 border-l-8 border-red-600 p-6">
            <h3 className="text-red-800 font-black text-sm uppercase mb-4 tracking-wider">Billed To</h3>
            <p className="font-bold text-gray-900 text-xl mb-1">{invoice.customer.name}</p>
            {invoice.customer.company && <p className="text-gray-800 font-semibold">{invoice.customer.company}</p>}
            {invoice.customer.email && <p className="text-gray-600 mt-2">{invoice.customer.email}</p>}
            {invoice.customer.address && (
              <div className="mt-3 text-gray-600">
                <p>{invoice.customer.address}</p>
                <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
                {invoice.customer.country && <p>{invoice.customer.country}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b-4 border-red-600">
            <span className="font-black text-red-800 uppercase text-sm">Invoice Date</span>
            <span className="text-gray-900 font-bold text-lg">{formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b-4 border-red-600">
            <span className="font-black text-red-800 uppercase text-sm">Due Date</span>
            <span className="text-gray-900 font-bold text-lg">{formatDate(invoice.dueDate)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b-4 border-red-600">
            <span className="font-black text-red-800 uppercase text-sm">Status</span>
            <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
              isPaid ? 'bg-green-600 text-white' : 'bg-red-100 text-red-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="bg-red-600 text-white">
            <th className="text-left py-4 px-4 font-black uppercase text-sm tracking-wide">Description</th>
            <th className="text-center py-4 px-4 font-black uppercase text-sm tracking-wide w-24">Qty</th>
            <th className="text-right py-4 px-4 font-black uppercase text-sm tracking-wide w-36">Unit Price</th>
            <th className="text-right py-4 px-4 font-black uppercase text-sm tracking-wide w-36">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index} className={`border-b-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-red-100`}>
              <td className="py-4 px-4 text-gray-900 font-medium">{item.description}</td>
              <td className="py-4 px-4 text-center text-gray-800 font-bold">{item.quantity}</td>
              <td className="py-4 px-4 text-right text-gray-800">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 px-4 text-right text-gray-900 font-bold text-lg">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96">
          <div className="flex justify-between py-3 px-4 bg-gray-50">
            <span className="font-bold text-gray-700 uppercase">Subtotal</span>
            <span className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between py-3 px-4 bg-white">
              <span className="font-bold text-gray-700 uppercase">Tax</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-5 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white mt-2">
            <span className="font-black text-xl uppercase tracking-wide">Total Due</span>
            <span className="font-black text-3xl">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-12 pt-8 border-t-4 border-red-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoice.notes && (
              <div>
                <h4 className="font-black text-red-800 text-sm uppercase mb-3 tracking-wider">Notes</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="font-black text-red-800 text-sm uppercase mb-3 tracking-wider">Terms & Conditions</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <div className="w-24 h-2 bg-red-600 mx-auto mb-3"></div>
        <p className="text-gray-500 font-bold uppercase text-sm tracking-wider">Thank You For Your Business</p>
      </div>
    </div>
  );
}
