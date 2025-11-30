import { TemplateProps } from './types';

export default function ClassicGreen({ invoice }: TemplateProps) {
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
          <div className="border-4 border-green-600 text-green-600 font-bold text-5xl px-6 py-3 rounded-lg opacity-40">
            ✓ PAID
          </div>
        </div>
      )}

      {/* Classic Header */}
      <div className="text-center mb-12 pb-6 border-b-4 border-green-700">
        {invoice.companyLogo ? (
          <img src={invoice.companyLogo} alt="Logo" className="h-20 mx-auto mb-4" />
        ) : (
          <h1 className="text-4xl font-serif font-bold text-green-800 mb-2">{invoice.companyName}</h1>
        )}
        <div className="text-gray-600 text-sm">
          {invoice.companyEmail && <span>{invoice.companyEmail} | </span>}
          {invoice.companyPhone && <span>{invoice.companyPhone}</span>}
        </div>
        {invoice.companyAddress && (
          <div className="text-gray-600 text-sm mt-2">
            <span>{invoice.companyAddress}, </span>
            <span>{[invoice.companyCity, invoice.companyState, invoice.companyPostalCode].filter(Boolean).join(', ')}</span>
          </div>
        )}
        <h2 className="text-3xl font-serif font-bold text-green-800 mt-6">INVOICE</h2>
        <p className="text-green-700 font-semibold text-lg mt-2">{invoice.invoiceNumber}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <div className="bg-green-50 border-l-4 border-green-700 p-4">
            <h3 className="text-green-800 font-bold mb-3">BILLED TO:</h3>
            <p className="font-semibold text-gray-900">{invoice.customer.name}</p>
            {invoice.customer.company && <p className="text-gray-700">{invoice.customer.company}</p>}
            {invoice.customer.email && <p className="text-sm text-gray-600 mt-2">{invoice.customer.email}</p>}
            {invoice.customer.address && (
              <div className="mt-3 text-sm text-gray-600">
                <p>{invoice.customer.address}</p>
                <p>{[invoice.customer.city, invoice.customer.state, invoice.customer.postalCode].filter(Boolean).join(', ')}</p>
                {invoice.customer.country && <p>{invoice.customer.country}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-300 pb-2">
            <span className="text-gray-600 font-semibold">Invoice Date:</span>
            <span className="text-gray-900">{formatDate(invoice.invoiceDate)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-300 pb-2">
            <span className="text-gray-600 font-semibold">Due Date:</span>
            <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-300 pb-2">
            <span className="text-gray-600 font-semibold">Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-semibold ${
              isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border border-green-200">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="text-left py-3 px-4 font-semibold">DESCRIPTION</th>
            <th className="text-center py-3 px-4 font-semibold w-20">QTY</th>
            <th className="text-right py-3 px-4 font-semibold w-32">RATE</th>
            <th className="text-right py-3 px-4 font-semibold w-32">AMOUNT</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {invoice.items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-green-50' : 'bg-white'}>
              <td className="py-3 px-4 border-b border-green-100">{item.description}</td>
              <td className="py-3 px-4 text-center border-b border-green-100">{item.quantity}</td>
              <td className="py-3 px-4 text-right border-b border-green-100">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 px-4 text-right border-b border-green-100 font-semibold">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-96 border-2 border-green-700">
          <div className="flex justify-between p-3 border-b border-green-200">
            <span className="font-semibold">Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.taxAmount > 0 && (
            <div className="flex justify-between p-3 border-b border-green-200">
              <span className="font-semibold">Tax:</span>
              <span>{formatCurrency(invoice.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between p-4 bg-green-700 text-white font-bold text-xl">
            <span>TOTAL DUE:</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {(invoice.notes || invoice.terms) && (
        <div className="mt-10 pt-6 border-t-2 border-green-300">
          {invoice.notes && (
            <div className="mb-4">
              <h4 className="font-bold text-green-800 mb-2">NOTES:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h4 className="font-bold text-green-800 mb-2">TERMS & CONDITIONS:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
