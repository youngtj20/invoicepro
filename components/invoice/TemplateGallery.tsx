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

      {templates.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No templates available</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map((template, index) => {
                const isLocked = template.isPremium && !canUsePremium;
                const isSelected = template.id === selectedTemplateId;

                return (
                  <tr
                    key={template.id}
                    className={`transition ${
                      isSelected
                        ? 'bg-primary-50 hover:bg-primary-100'
                        : 'hover:bg-gray-50'
                    } ${isLocked ? 'opacity-60' : ''}`}
                  >
                    {/* Template Name & Preview */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          {template.previewImage ? (
                            <img
                              src={template.previewImage}
                              alt={template.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          {isSelected && (
                            <p className="text-xs text-primary-600 font-semibold">
                              ✓ Selected
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description || 'No description'}
                      </p>
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4 text-center">
                      {template.isPremium ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                          PRO
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                          Free
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => !isLocked && onSelect(template.id)}
                        disabled={isLocked}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition ${
                          isSelected
                            ? 'bg-primary-600 text-white hover:bg-primary-700'
                            : isLocked
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isLocked ? (
                          <span>Locked</span>
                        ) : isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
