'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['PRODUCT', 'SERVICE']),
  unit: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  taxable: z.boolean().optional().default(true),
  sku: z.string().optional(),
  category: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface Item extends Omit<ItemFormData, 'price'> {
  id: string;
  price: number;
  createdAt: string;
  _count: {
    invoiceItems: number;
  };
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  const itemType = watch('type');

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/items/${itemId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch item');
      }

      setItem(data);
      // Convert price to string for form
      reset({
        ...data,
        price: data.price.toString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Convert price string to number
      const submitData = {
        ...data,
        price: parseFloat(data.price),
      };

      const response = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update item');
      }

      setItem(result);
      setIsEditing(false);
      reset({
        ...result,
        price: result.price.toString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete item');
      }

      router.push('/dashboard/items');
    } catch (err: any) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (item) {
      reset({
        ...item,
        price: item.price.toString(),
      });
    }
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Alert variant="error">Item not found</Alert>
        <Link href="/dashboard/items">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/items"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Items
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{item?.name}</h1>
            <p className="text-gray-600 mt-1">
              Created {item && formatDate(item.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Item
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {item?.name}? This action cannot
              be undone.
              {item && item._count.invoiceItems > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This item is used in {item._count.invoiceItems} invoice(s)
                  and cannot be deleted.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                disabled={item ? item._count.invoiceItems > 0 : false}
              >
                Delete Item
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Item Details / Edit Form */}
      {isEditing ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow p-6 space-y-6"
        >
          {/* Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Item
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Item Name"
                type="text"
                placeholder="e.g., Website Design, Logo Package"
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
                        itemType === 'PRODUCT'
                          ? 'text-primary-600'
                          : 'text-gray-600'
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
                        itemType === 'SERVICE'
                          ? 'text-primary-600'
                          : 'text-gray-600'
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
                  <p className="mt-1 text-sm text-red-600">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Pricing Information
            </h3>
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
              />

              <Input
                label="Unit"
                type="text"
                placeholder="e.g., hour, piece, kg"
                error={errors.unit?.message}
                {...register('unit')}
                disabled={isSubmitting}
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
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU / Code"
                type="text"
                placeholder="e.g., PROD-001"
                error={errors.sku?.message}
                {...register('sku')}
                disabled={isSubmitting}
              />

              <Input
                label="Category"
                type="text"
                placeholder="e.g., Design, Development"
                error={errors.category?.message}
                {...register('category')}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Item Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-gray-900 font-medium">
                    {item?.type === 'PRODUCT' ? 'Product' : 'Service'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-gray-900 font-medium">
                    NGN {item?.price.toLocaleString()}
                    {item?.unit && (
                      <span className="text-gray-500"> / {item.unit}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SKU / Code</p>
                  <p className="text-gray-900 font-medium">
                    {item?.sku || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-gray-900 font-medium">
                    {item?.category || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxable</p>
                  <p className="text-gray-900 font-medium">
                    {item?.taxable ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              {item?.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {item.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Usage Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {item?._count.invoiceItems || 0}
                  </p>
                  <p className="text-sm text-gray-600">Times Used in Invoices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
