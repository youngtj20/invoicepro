'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const onboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Nigeria'),
  currency: z.string().default('NGN'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      country: 'Nigeria',
      currency: 'NGN',
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Onboarding failed');
      }

      // Update session to include tenant info
      await update();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-primary-600 mb-4">InvoicePro</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {session?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Let's set up your company profile to get started
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline text-sm font-medium">Company Info</span>
            </div>
            <div className="w-16 h-1 bg-gray-300">
              <div
                className={`h-full transition-all ${
                  currentStep >= 2 ? 'bg-primary-600 w-full' : 'bg-gray-300 w-0'
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= 2
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline text-sm font-medium">Location</span>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Trial Banner */}
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 rounded-lg p-4 mb-6">
            <p className="text-center text-primary-900 font-medium">
              🎉 You're starting with a <strong>7-day free trial</strong> of Pro features!
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Company Information
                </h2>

                <Input
                  label="Company Name"
                  type="text"
                  placeholder="Acme Corporation"
                  error={errors.companyName?.message}
                  {...register('companyName')}
                  required
                  disabled={isLoading}
                  autoFocus
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  error={errors.phone?.message}
                  {...register('phone')}
                  disabled={isLoading}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Business Location
                </h2>

                <Input
                  label="Address"
                  type="text"
                  placeholder="123 Business Street"
                  error={errors.address?.message}
                  {...register('address')}
                  disabled={isLoading}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="City"
                    type="text"
                    placeholder="Lagos"
                    error={errors.city?.message}
                    {...register('city')}
                    disabled={isLoading}
                  />

                  <Input
                    label="State"
                    type="text"
                    placeholder="Lagos State"
                    error={errors.state?.message}
                    {...register('state')}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      {...register('country')}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="GHS">Ghanaian Cedi (GH₵)</option>
                      <option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="ZAR">South African Rand (R)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                    Back
                  </Button>
                  <Button type="submit" isLoading={isLoading}>
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          You can update these details later in your account settings
        </p>
      </div>
    </div>
  );
}
