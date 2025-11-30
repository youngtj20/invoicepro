'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Eye, Palette } from 'lucide-react';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

interface Template {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  isPremium: boolean;
  isActive: boolean;
}

interface TenantSettings {
  defaultTemplateId: string | null;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [settings, setSettings] = useState<TenantSettings>({ defaultTemplateId: null });
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTemplates();
    fetchSettings();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');

      const data = await response.json();
      setTemplates(data.templates);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings({ defaultTemplateId: data.defaultTemplateId });
      setSelectedTemplate(data.defaultTemplateId);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selectedTemplate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save template');
      }

      setSuccess('Default template saved successfully!');

      // Update local settings
      setSettings({ defaultTemplateId: selectedTemplate });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (templateSlug: string) => {
    // Open preview in new window
    window.open(`/templates/preview/${templateSlug}`, '_blank', 'width=800,height=1000');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Templates</h1>
            <p className="text-sm text-gray-600">Choose your default invoice template</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer overflow-hidden ${
              selectedTemplate === template.id
                ? 'border-primary-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleSelectTemplate(template.id)}
          >
            {/* Selected Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-3 right-3 z-10 bg-primary-500 text-white rounded-full p-1.5">
                <Check className="h-4 w-4" />
              </div>
            )}

            {/* Premium Badge */}
            {template.isPremium && (
              <div className="absolute top-3 left-3 z-10 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                PREMIUM
              </div>
            )}

            {/* Template Thumbnail */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
              {template.thumbnail ? (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Palette className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">{template.name}</p>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(template.slug);
                }}
                className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-2 border border-primary-200 rounded-lg hover:bg-primary-50 transition"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
            </div>

            {/* Current Default Badge */}
            {settings.defaultTemplateId === template.id && (
              <div className="absolute bottom-16 left-0 right-0 bg-green-500 text-white text-xs font-medium text-center py-1">
                Current Default
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedTemplate
                ? `Selected: ${templates.find((t) => t.id === selectedTemplate)?.name}`
                : 'No template selected'}
            </p>
            {selectedTemplate !== settings.defaultTemplateId && (
              <p className="text-xs text-orange-600 mt-1">
                You have unsaved changes
              </p>
            )}
          </div>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!selectedTemplate || selectedTemplate === settings.defaultTemplateId}
          >
            Save as Default
          </Button>
        </div>
      </div>
    </div>
  );
}
