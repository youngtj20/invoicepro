'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      setSuccess(true);
      reset();

      // Redirect to settings after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/settings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="text-sm text-gray-600">Update your account password</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            Password changed successfully! Redirecting to settings...
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Input
              id="currentPassword"
              type="password"
              label="Current Password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={isLoading || success}
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">New Password</h3>

            <div className="space-y-4">
              <Input
                id="newPassword"
                type="password"
                label="New Password"
                error={errors.newPassword?.message}
                {...register('newPassword')}
                placeholder="Enter new password (min. 8 characters)"
                autoComplete="new-password"
                disabled={isLoading || success}
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm New Password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={isLoading || success}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Different from your current password</li>
              <li>• Should be unique and secure</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={success}
            >
              Change Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
