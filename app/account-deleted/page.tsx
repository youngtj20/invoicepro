'use client';

import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function AccountDeletedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Account Deleted
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-6">
            <p className="text-center text-gray-600">
              This account has been permanently deleted and can no longer be accessed.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                What happened to my data?
              </h3>
              <p className="text-sm text-gray-700">
                All data associated with this account has been permanently removed from our systems in accordance with our data retention policy.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Want to start fresh?
              </h3>
              <p className="text-sm text-blue-800">
                You can create a new account at any time. Your previous account data cannot be recovered.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = '/auth/signup'}
              className="w-full"
            >
              Create New Account
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Additional Help */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Have questions?{' '}
          <a href="mailto:support@invoicepro.com" className="text-primary-600 hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
