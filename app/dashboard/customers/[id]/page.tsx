'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Edit2, Trash2, Save, X, FileText } from 'lucide-react';
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  dueDate: string;
  createdAt: string;
}

interface Customer extends CustomerFormData {
  id: string;
  createdAt: string;
  invoices: Invoice[];
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
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
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/customers/${customerId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customer');
      }

      setCustomer(data);
      reset(data); // Populate form with customer data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update customer');
      }

      setCustomer(result);
      setIsEditing(false);
      reset(result);
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

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete customer');
      }

      router.push('/dashboard/customers');
    } catch (err: any) {
      setError(err.message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (customer) reset(customer); // Reset form to original customer data
    setError('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Alert variant="error">Customer not found</Alert>
        <Link href="/dashboard/customers">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {customer?.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Customer since {customer && formatDate(customer.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
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
              Delete Customer
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {customer?.name}? This action cannot be undone.
              {customer && customer.invoices.length > 0 && (
                <span className="block mt-2 text-red-600 font-medium">
                  This customer has {customer.invoices.length} invoice(s) and cannot be deleted.
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
                disabled={customer ? customer.invoices.length > 0 : false}
              >
                Delete Customer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details / Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Customer
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
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Address Information
            </h3>
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
            <h3 className="text-md font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
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
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">
                    {customer?.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900 font-medium">
                    {customer?.phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">WhatsApp</p>
                  <p className="text-gray-900 font-medium">
                    {customer?.whatsapp || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="text-gray-900 font-medium">
                    {customer?.company || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            {(customer?.address || customer?.city || customer?.state || customer?.country) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Address
                </h2>
                <div className="text-gray-900">
                  {customer?.address && <p>{customer.address}</p>}
                  <p>
                    {[customer?.city, customer?.state, customer?.postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {customer?.country && <p>{customer.country}</p>}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(customer?.taxId || customer?.notes) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>
                {customer?.taxId && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Tax ID / Business Number</p>
                    <p className="text-gray-900 font-medium">{customer.taxId}</p>
                  </div>
                )}
                {customer?.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Invoices ({customer?.invoices?.length || 0})
              </h2>
              {customer && customer.invoices && customer.invoices.length > 0 ? (
                <div className="space-y-3">
                  {customer.invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            NGN {invoice.total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No invoices yet</p>
                  <Link
                    href={`/dashboard/invoices/new?customerId=${customerId}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                  >
                    Create first invoice
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">
                Customer Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {customer?.invoices.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Invoices</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {customer?.invoices.filter((inv) => inv.status === 'PAID')
                      .length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Paid Invoices</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    NGN{' '}
                    {customer?.invoices
                      .reduce((sum, inv) => sum + inv.total, 0)
                      .toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
