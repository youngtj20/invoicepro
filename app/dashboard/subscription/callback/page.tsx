'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';

export default function SubscriptionCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('error');
      setMessage('No payment reference found');
      return;
    }

    try {
      const response = await fetch(`/api/subscription/verify?reference=${reference}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage('Your subscription has been upgraded successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Payment verification failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred during verification');
    }
  };

  if (status === 'loading') {
    return (
      <LoadingPage text="Verifying your payment..." />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => router.push('/dashboard/subscription')} className="w-full">
              View Subscription
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => router.push('/dashboard/subscription')} className="w-full">
                Back to Subscription
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
