'use client';

import { useState, useEffect } from 'react';
import { Check, FileText } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string | null;
  isPremium: boolean;
  previewImage: string | null;
}

interface TemplateGalleryProps {
  selectedTemplateId: string | null;
  onSelect: (templateId: string) => void;
  canUsePremium?: boolean;
}

export default function TemplateGallery({
  selectedTemplateId,
  onSelect,
  canUsePremium = false,
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/templates');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch templates');
      }

      setTemplates(data.templates);

      // Auto-select first template if none selected
      if (!selectedTemplateId && data.templates.length > 0) {
        onSelect(data.templates[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Choose Template</h3>

      {!canUsePremium && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Upgrade to Pro to unlock premium templates
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isLocked = template.isPremium && !canUsePremium;
          const isSelected = template.id === selectedTemplateId;

          return (
            <button
              key={template.id}
              onClick={() => !isLocked && onSelect(template.id)}
              disabled={isLocked}
              className={`relative p-4 border-2 rounded-lg text-left transition ${
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-2 left-2">
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    PRO
                  </span>
                </div>
              )}

              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Template Info */}
              <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
              {template.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              )}

              {/* Locked Overlay */}
              {isLocked && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="inline-block p-3 bg-gray-800 text-white rounded-lg text-sm font-medium">
                      Upgrade to Pro
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No templates available</p>
        </div>
      )}
    </div>
  );
}
