'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PaymentCallbackPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  const invoiceId = params.id as string;
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setMessage('Payment reference is missing');
      return;
    }

    // Verify payment
    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/invoices/${invoiceId}/verify-payment?reference=${reference}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment verified successfully!');

          // Redirect to public invoice page after 2 seconds
          setTimeout(() => {
            router.push(`/invoices/${invoiceId}/public`);
          }, 2000);
        } else {
          setStatus('failed');
          setMessage(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('failed');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [invoiceId, reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting you to the invoice...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push(`/invoices/${invoiceId}/public`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Return to Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
