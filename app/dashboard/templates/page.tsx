'use client';

import { useEffect, useState } from 'react';
import { Eye, Lock, Check, Palette } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isPremium: boolean;
  isActive: boolean;
}

export default function TemplatesPage() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch both templates and subscription data
      const [templatesRes, subscriptionRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/subscription'),
      ]);

      if (!templatesRes.ok) {
        throw new Error('Failed to fetch templates');
      }

      const templatesData = await templatesRes.json();
      setTemplates(templatesData.templates);

      // Check subscription for premium access
      if (subscriptionRes.ok) {
        const subscriptionData = await subscriptionRes.json();
        setHasPremiumAccess(subscriptionData.subscription?.plan?.canUsePremiumTemplates || false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openPreview = (slug: string) => {
    window.open(`/templates/preview/${slug}`, '_blank', 'width=1000,height=800');
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Templates</h1>
            <p className="text-gray-600 mt-1">Browse and preview beautiful invoice templates</p>
          </div>
        </div>
      </div>

      {/* Premium Notice */}
      {!hasPremiumAccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Preview All Templates</h3>
              <p className="text-sm text-yellow-800 mb-2">
                You can preview all templates for free! Upgrade to Pro to use premium templates in your invoices.
              </p>
              <a
                href="/dashboard/subscription"
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Palette className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => {
            const isPremiumTemplate = template.isPremium && !hasPremiumAccess;

            return (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-300"
              >
                {/* Template Preview Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Palette className="w-16 h-16 text-gray-400" />
                  
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 shadow-lg">
                        <span className="w-2 h-2 bg-yellow-600 rounded-full mr-1.5"></span>
                        PRO
                      </span>
                    </div>
                  )}

                  {/* Preview Available Badge */}
                  {isPremiumTemplate && (
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                    {isPremiumTemplate && (
                      <Lock className="w-4 h-4 text-yellow-600 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                    {template.description || 'No description available'}
                  </p>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Preview Button - Always Available */}
                    <button
                      onClick={() => openPreview(template.slug)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      Preview Template
                    </button>

                    {/* Upgrade Notice for Premium Templates */}
                    {isPremiumTemplate && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">To use in invoices:</p>
                        <a
                          href="/dashboard/subscription"
                          className="text-xs text-yellow-600 hover:text-yellow-700 font-medium underline"
                        >
                          Upgrade to Pro
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Templates</p>
              <p className="text-2xl font-bold text-blue-900">{templates.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Free Templates</p>
              <p className="text-2xl font-bold text-green-900">
                {templates.filter((t) => !t.isPremium).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Premium Templates</p>
              <p className="text-2xl font-bold text-yellow-900">
                {templates.filter((t) => t.isPremium).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
