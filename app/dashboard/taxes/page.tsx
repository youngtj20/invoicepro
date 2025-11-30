'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Percent, X, Save, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const taxSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rate: z.string().min(1, 'Rate is required'),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

type TaxFormData = z.infer<typeof taxSchema>;

interface Tax {
  id: string;
  name: string;
  rate: number;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
  });

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/taxes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch taxes');
      }

      setTaxes(data.taxes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTax(null);
    reset({
      name: '',
      rate: '',
      description: '',
      isDefault: false,
    });
    setShowModal(true);
    setError('');
  };

  const openEditModal = (tax: Tax) => {
    setEditingTax(tax);
    reset({
      name: tax.name,
      rate: tax.rate.toString(),
      description: tax.description || '',
      isDefault: tax.isDefault,
    });
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTax(null);
    reset();
    setError('');
  };

  const onSubmit = async (data: TaxFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      // Convert rate string to number
      const submitData = {
        ...data,
        rate: parseFloat(data.rate),
      };

      const url = editingTax ? `/api/taxes/${editingTax.id}` : '/api/taxes';
      const method = editingTax ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${editingTax ? 'update' : 'create'} tax`);
      }

      closeModal();
      fetchTaxes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (taxId: string) => {
    try {
      setIsDeleting(true);
      setError('');

      const response = await fetch(`/api/taxes/${taxId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tax');
      }

      setDeleteConfirm(null);
      fetchTaxes();
    } catch (err: any) {
      setError(err.message);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Rates</h1>
          <p className="text-gray-600 mt-1">
            Manage tax rates for your invoices
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tax Rate
        </Button>
      </div>

      {/* Error Alert */}
      {error && !showModal && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Percent className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              About Tax Rates
            </h3>
            <p className="text-sm text-blue-700">
              Set your default tax rate that will be automatically applied to taxable items.
              You can create multiple tax rates for different scenarios (e.g., VAT, Sales Tax).
            </p>
          </div>
        </div>
      </div>

      {/* Taxes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : taxes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Percent className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tax rates configured
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by adding your first tax rate
          </p>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Tax Rate
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{tax.name}</p>
                        {tax.isDefault && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {tax.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {tax.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">
                      {tax.rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tax.isDefault ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                        Default
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tax.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(tax)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(tax.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTax ? 'Edit Tax Rate' : 'Add Tax Rate'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert in Modal */}
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Tax Name"
                type="text"
                placeholder="e.g., VAT, Sales Tax, GST"
                error={errors.name?.message}
                {...register('name')}
                required
                disabled={isSubmitting}
              />

              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g., 7.5"
                error={errors.rate?.message}
                {...register('rate')}
                required
                disabled={isSubmitting}
                helperText="Enter the percentage rate (e.g., 7.5 for 7.5%)"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Optional description..."
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

              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isDefault')}
                    disabled={isSubmitting}
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-700">
                      Set as default tax rate
                    </span>
                    <span className="block text-sm text-gray-500 mt-0.5">
                      This rate will be automatically applied to taxable items
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingTax ? 'Update Tax' : 'Create Tax'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Tax Rate
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this tax rate? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                isLoading={isDeleting}
              >
                Delete Tax
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
