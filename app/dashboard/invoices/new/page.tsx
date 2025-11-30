'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import CustomerSelect from '@/components/invoice/CustomerSelect';
import TemplateGallery from '@/components/invoice/TemplateGallery';
import LineItemTable, { LineItem } from '@/components/invoice/LineItemTable';
import TaxSelector from '@/components/invoice/TaxSelector';
import InvoicePreview from '@/components/invoice/InvoicePreview';

const STEPS = [
  { id: 1, name: 'Customer', description: 'Select or create customer' },
  { id: 2, name: 'Template', description: 'Choose invoice template' },
  { id: 3, name: 'Details', description: 'Invoice information' },
  { id: 4, name: 'Items', description: 'Add line items' },
  { id: 5, name: 'Tax', description: 'Configure tax' },
  { id: 6, name: 'Preview', description: 'Review and finalize' },
];

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [taxId, setTaxId] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    generateInvoiceNumber();
    setDefaultDates();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId);
    }
  }, [customerId]);

  const generateInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/invoices/generate-number');
      const data = await response.json();
      if (response.ok) {
        setInvoiceNumber(data.invoiceNumber);
      }
    } catch (err) {
      // Fallback to timestamp-based number
      setInvoiceNumber(`INV-${Date.now()}`);
    }
  };

  const setDefaultDates = () => {
    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);

    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setDueDate(dueDate.toISOString().split('T')[0]);
  };

  const fetchCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();
      if (response.ok) {
        setCustomer(data);
      }
    } catch (err) {
      console.error('Failed to fetch customer:', err);
    }
  };

  const handleTaxSelect = (id: string | null, rate: number) => {
    setTaxId(id);
    setTaxRate(rate);

    // Update all line items with new tax rate
    setLineItems((items) =>
      items.map((item) => {
        const taxAmount = (item.quantity * item.unitPrice * rate) / 100;
        const total = item.quantity * item.unitPrice + taxAmount;
        return { ...item, taxId: id || undefined, taxRate: rate, taxAmount, total };
      })
    );
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return customerId !== null;
      case 2:
        return templateId !== null;
      case 3:
        return invoiceNumber && invoiceDate && dueDate;
      case 4:
        return lineItems.length > 0;
      case 5:
        return true; // Tax is optional
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setError('');
    } else if (currentStep === 1 && !customerId) {
      setError('Please select a customer');
    } else if (currentStep === 2 && !templateId) {
      setError('Please select a template');
    } else if (currentStep === 4 && lineItems.length === 0) {
      setError('Please add at least one line item');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSaveAsDraft = async () => {
    await handleSubmit('DRAFT');
  };

  const handleFinalize = async () => {
    await handleSubmit('SENT');
  };

  const handleSubmit = async (status: 'DRAFT' | 'SENT') => {
    try {
      setIsSubmitting(true);
      setError('');

      const { subtotal, taxAmount, total } = calculateTotals();

      const invoiceData = {
        customerId: customerId!,
        invoiceNumber,
        invoiceDate,
        dueDate,
        status,
        templateId,
        notes,
        terms,
        items: lineItems.map((item) => ({
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxId: item.taxId,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          total: item.total,
        })),
        subtotal,
        taxAmount,
        total,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create invoice');
      }

      router.push(`/dashboard/invoices/${result.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-gray-600 mt-1">
          Follow the steps to create a professional invoice
        </p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    step.id === currentStep
                      ? 'bg-primary-600 text-white'
                      : step.id < currentStep
                      ? 'bg-primary-100 text-primary-600 cursor-pointer hover:bg-primary-200'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step.id}
                </button>
                <p
                  className={`text-xs mt-2 font-medium ${
                    step.id === currentStep
                      ? 'text-primary-600'
                      : 'text-gray-600'
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {currentStep === 1 && (
          <CustomerSelect
            selectedCustomerId={customerId}
            onSelect={setCustomerId}
            onCreateNew={() => router.push('/dashboard/customers/new')}
          />
        )}

        {currentStep === 2 && (
          <TemplateGallery
            selectedTemplateId={templateId}
            onSelect={setTemplateId}
            canUsePremium={true} // TODO: Get from subscription
          />
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Invoice Number"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Invoice Date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the customer..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Terms & Conditions
              </label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Add payment terms, conditions, etc..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <LineItemTable
            items={lineItems}
            onChange={setLineItems}
            defaultTaxRate={taxRate}
            defaultTaxId={taxId || undefined}
          />
        )}

        {currentStep === 5 && (
          <TaxSelector selectedTaxId={taxId} onSelect={handleTaxSelect} />
        )}

        {currentStep === 6 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Preview Invoice
            </h3>
            <InvoicePreview
              customer={customer}
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              dueDate={dueDate}
              items={lineItems}
              notes={notes}
              terms={terms}
              subtotal={subtotal}
              taxAmount={taxAmount}
              total={total}
            />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {currentStep === 6 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveAsDraft}
                  isLoading={isSubmitting}
                  disabled={!canGoNext()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={handleFinalize}
                  isLoading={isSubmitting}
                  disabled={!canGoNext()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Create & Send
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext() || isSubmitting}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
