'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: 'Server Configuration Error',
    description: 'There is a problem with the server configuration. Please contact support.',
  },
  AccessDenied: {
    title: 'Access Denied',
    description: 'You do not have permission to sign in.',
  },
  Verification: {
    title: 'Verification Failed',
    description: 'The verification token has expired or has already been used.',
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'Error occurred while trying to sign in with OAuth provider.',
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Error occurred during the OAuth callback process.',
  },
  OAuthCreateAccount: {
    title: 'OAuth Account Creation Error',
    description: 'Could not create OAuth account. Please try a different sign-in method.',
  },
  EmailCreateAccount: {
    title: 'Email Account Creation Error',
    description: 'Could not create email account. Please try again.',
  },
  Callback: {
    title: 'Callback Error',
    description: 'Error occurred during the authentication callback.',
  },
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'This email is already registered with a different sign-in method. Please use that method to sign in.',
  },
  EmailSignin: {
    title: 'Email Sign In Error',
    description: 'Could not send sign in email. Please try again.',
  },
  CredentialsSignin: {
    title: 'Sign In Failed',
    description: 'Invalid email or password. Please check your credentials and try again.',
  },
  SessionRequired: {
    title: 'Session Required',
    description: 'You must be signed in to access this page.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred. Please try again.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-primary-600">
            InvoicePro
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {errorInfo.title}
          </h1>

          {/* Error Alert */}
          <Alert variant="error" className="mb-6">
            {errorInfo.description}
          </Alert>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Error Code:</strong> {error}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              If this problem persists, please contact our support team.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full">Try Again</Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Need help?{' '}
            <Link href="/support" className="font-medium text-primary-600 hover:text-primary-500">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
