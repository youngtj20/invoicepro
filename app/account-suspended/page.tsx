'use client';

import { signOut } from 'next-auth/react';
import Button from '@/components/ui/Button';

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Account Suspended
          </h1>

          {/* Message */}
          <div className="space-y-4 mb-6">
            <p className="text-center text-gray-600">
              Your account has been suspended and you no longer have access to the dashboard.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">
                Why was my account suspended?
              </h3>
              <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                <li>Payment failure or overdue subscription</li>
                <li>Violation of terms of service</li>
                <li>Suspicious or fraudulent activity</li>
                <li>Administrative action</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                How to restore access?
              </h3>
              <p className="text-sm text-blue-800">
                Please contact our support team to resolve this issue and restore your account access.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-center">
              Contact Support
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:support@invoicepro.com" className="text-primary-600 hover:underline">
                  support@invoicepro.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+234 800 000 0000</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.href = 'mailto:support@invoicepro.com?subject=Account Suspended - Please Help'}
              className="w-full"
            >
              Email Support
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
          Need immediate assistance?{' '}
          <a href="https://help.invoicepro.com" className="text-primary-600 hover:underline">
            Visit our Help Center
          </a>
        </p>
      </div>
    </div>
  );
}
