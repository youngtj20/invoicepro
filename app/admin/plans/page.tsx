'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  CreditCard,
  Users,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  trialDays: number;
  maxInvoices: number;
  maxCustomers: number;
  maxItems: number;
  maxUsers: number;
  customBranding: boolean;
  advancedReporting: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  multiCurrency: boolean;
  recurringInvoices: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  premiumTemplates: boolean;
  activeSubscriptions: number;
  totalSubscriptions: number;
}

interface PlanFormData {
  name: string;
  description: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY';
  trialDays: number;
  maxInvoices: number;
  maxCustomers: number;
  maxItems: number;
  maxUsers: number;
  features: {
    customBranding: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    multiCurrency: boolean;
    recurringInvoices: boolean;
    smsNotifications: boolean;
    whatsappNotifications: boolean;
    premiumTemplates: boolean;
  };
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    price: 0,
    billingPeriod: 'MONTHLY',
    trialDays: 14,
    maxInvoices: -1,
    maxCustomers: -1,
    maxItems: -1,
    maxUsers: -1,
    features: {
      customBranding: false,
      advancedReporting: false,
      apiAccess: false,
      prioritySupport: false,
      multiCurrency: false,
      recurringInvoices: false,
      smsNotifications: false,
      whatsappNotifications: false,
      premiumTemplates: false,
    },
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/plans');

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data.plans);
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price || 0,
        billingPeriod: plan.billingPeriod,
        trialDays: plan.trialDays || 0,
        maxInvoices: plan.maxInvoices || -1,
        maxCustomers: plan.maxCustomers || -1,
        maxItems: plan.maxItems || -1,
        maxUsers: plan.maxUsers || -1,
        features: {
          customBranding: !!plan.customBranding,
          advancedReporting: !!plan.advancedReporting,
          apiAccess: !!plan.apiAccess,
          prioritySupport: !!plan.prioritySupport,
          multiCurrency: !!plan.multiCurrency,
          recurringInvoices: !!plan.recurringInvoices,
          smsNotifications: !!plan.smsNotifications,
          whatsappNotifications: !!plan.whatsappNotifications,
          premiumTemplates: !!plan.premiumTemplates,
        },
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        billingPeriod: 'MONTHLY',
        trialDays: 14,
        maxInvoices: -1,
        maxCustomers: -1,
        maxItems: -1,
        maxUsers: -1,
        features: {
          customBranding: false,
          advancedReporting: false,
          apiAccess: false,
          prioritySupport: false,
          multiCurrency: false,
          recurringInvoices: false,
          smsNotifications: false,
          whatsappNotifications: false,
          premiumTemplates: false,
        },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : '/api/admin/plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save plan');
      }

      await fetchPlans();
      closeModal();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete plan');
      }

      await fetchPlans();
    } catch (err: any) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  )}
                </div>
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    / {plan.billingPeriod.toLowerCase()}
                  </span>
                </div>
                {plan.trialDays > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.trialDays} day free trial
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Limits</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Invoices: {plan.maxInvoices === -1 ? 'Unlimited' : plan.maxInvoices}</p>
                  <p>Customers: {plan.maxCustomers === -1 ? 'Unlimited' : plan.maxCustomers}</p>
                  <p>Items: {plan.maxItems === -1 ? 'Unlimited' : plan.maxItems}</p>
                  <p>Users: {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                <div className="space-y-1">
                  {plan.customBranding && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Custom Branding
                    </div>
                  )}
                  {plan.advancedReporting && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Advanced Reporting
                    </div>
                  )}
                  {plan.apiAccess && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      API Access
                    </div>
                  )}
                  {plan.prioritySupport && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Priority Support
                    </div>
                  )}
                  {plan.multiCurrency && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Multi-Currency
                    </div>
                  )}
                  {plan.recurringInvoices && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Recurring Invoices
                    </div>
                  )}
                  {plan.smsNotifications && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      SMS Notifications
                    </div>
                  )}
                  {plan.whatsappNotifications && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      WhatsApp
                    </div>
                  )}
                  {plan.premiumTemplates && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600 mr-2" />
                      Premium Templates
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{plan.activeSubscriptions} active / {plan.totalSubscriptions} total subscriptions</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => openModal(plan)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => deletePlan(plan.id)}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No plans found. Create your first plan to get started.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? 'Edit Plan' : 'Create Plan'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Period *
                  </label>
                  <select
                    required
                    value={formData.billingPeriod}
                    onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value as 'MONTHLY' | 'YEARLY' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Limits (-1 for unlimited)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Invoices</label>
                    <input
                      type="number"
                      value={formData.maxInvoices}
                      onChange={(e) => setFormData({ ...formData, maxInvoices: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Customers</label>
                    <input
                      type="number"
                      value={formData.maxCustomers}
                      onChange={(e) => setFormData({ ...formData, maxCustomers: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Items</label>
                    <input
                      type="number"
                      value={formData.maxItems}
                      onChange={(e) => setFormData({ ...formData, maxItems: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Users</label>
                    <input
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, [key]: e.target.checked }
                        })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
