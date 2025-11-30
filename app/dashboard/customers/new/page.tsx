'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create customer');
      }

      // Redirect to customers list
      router.push('/dashboard/customers');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600 mt-1">
          Create a new customer record for your invoices
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Customer Name"
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name')}
                required
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isSubmitting}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+234 800 000 0000"
              error={errors.phone?.message}
              {...register('phone')}
              disabled={isSubmitting}
            />

            <Input
              label="WhatsApp Number"
              type="tel"
              placeholder="+234 800 000 0000"
              helperText="For sending invoices via WhatsApp"
              error={errors.whatsapp?.message}
              {...register('whatsapp')}
              disabled={isSubmitting}
            />

            <Input
              label="Company Name"
              type="text"
              placeholder="Acme Corporation"
              error={errors.company?.message}
              {...register('company')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Street Address"
                type="text"
                placeholder="123 Business Street"
                error={errors.address?.message}
                {...register('address')}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="City"
              type="text"
              placeholder="Lagos"
              error={errors.city?.message}
              {...register('city')}
              disabled={isSubmitting}
            />

            <Input
              label="State/Province"
              type="text"
              placeholder="Lagos State"
              error={errors.state?.message}
              {...register('state')}
              disabled={isSubmitting}
            />

            <Input
              label="Country"
              type="text"
              placeholder="Nigeria"
              error={errors.country?.message}
              {...register('country')}
              disabled={isSubmitting}
            />

            <Input
              label="Postal Code"
              type="text"
              placeholder="100001"
              error={errors.postalCode?.message}
              {...register('postalCode')}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Tax ID / Business Number"
              type="text"
              placeholder="XX-XXXXXXX"
              helperText="VAT number, tax ID, or business registration number"
              error={errors.taxId?.message}
              {...register('taxId')}
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                placeholder="Add any notes about this customer..."
                {...register('notes')}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Link href="/dashboard/customers">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            Create Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
