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

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['PRODUCT', 'SERVICE'], {
    required_error: 'Please select a type',
  }),
  unit: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  taxable: z.boolean().optional().default(true),
  sku: z.string().optional(),
  category: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function NewItemPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      type: 'PRODUCT',
      taxable: true,
    },
  });

  const itemType = watch('type');

  const onSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Convert price string to number
      const submitData = {
        ...data,
        price: parseFloat(data.price),
      };

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create item');
      }

      router.push('/dashboard/items');
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
          href="/dashboard/items"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
        <p className="text-gray-600 mt-1">
          Create a new product or service for your invoices
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <Input
              label="Item Name"
              type="text"
              placeholder="e.g., Website Design, Logo Package, Consulting Hours"
              error={errors.name?.message}
              {...register('name')}
              required
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Describe what this item includes..."
                {...register('description')}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                  <input
                    type="radio"
                    value="PRODUCT"
                    {...register('type')}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div
                    className={`flex-1 ${
                      itemType === 'PRODUCT' ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Product</p>
                    <p className="text-sm">Physical or digital goods</p>
                  </div>
                  {itemType === 'PRODUCT' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full"></div>
                  )}
                </label>

                <label className="relative flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                  <input
                    type="radio"
                    value="SERVICE"
                    {...register('type')}
                    disabled={isSubmitting}
                    className="sr-only"
                  />
                  <div
                    className={`flex-1 ${
                      itemType === 'SERVICE' ? 'text-primary-600' : 'text-gray-600'
                    }`}
                  >
                    <p className="font-medium text-gray-900">Service</p>
                    <p className="text-sm">Professional services</p>
                  </div>
                  {itemType === 'SERVICE' && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full"></div>
                  )}
                </label>
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pricing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register('price')}
              required
              disabled={isSubmitting}
              helperText="Price in your default currency"
            />

            <Input
              label="Unit"
              type="text"
              placeholder="e.g., hour, piece, kg, month"
              error={errors.unit?.message}
              {...register('unit')}
              disabled={isSubmitting}
              helperText="Optional unit of measurement"
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('taxable')}
                disabled={isSubmitting}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                This item is taxable
              </span>
            </label>
            <p className="text-sm text-gray-500 ml-6">
              Tax will be calculated based on your tax settings
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU / Code"
              type="text"
              placeholder="e.g., PROD-001"
              error={errors.sku?.message}
              {...register('sku')}
              disabled={isSubmitting}
              helperText="Unique identifier (optional)"
            />

            <Input
              label="Category"
              type="text"
              placeholder="e.g., Design, Development, Consulting"
              error={errors.category?.message}
              {...register('category')}
              disabled={isSubmitting}
              helperText="For organizing items (optional)"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <Link href="/dashboard/items">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            Create Item
          </Button>
        </div>
      </form>
    </div>
  );
}
