'use client';

import { useState, useEffect } from 'react';
import { Percent, X } from 'lucide-react';

interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

interface TaxSelectorProps {
  selectedTaxIds: string[];
  onSelect: (taxIds: string[], taxRates: number[]) => void;
}

export default function TaxSelector({
  selectedTaxIds,
  onSelect,
}: TaxSelectorProps) {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleTaxToggle = (taxId: string, taxRate: number) => {
    let newTaxIds: string[];
    
    if (selectedTaxIds.includes(taxId)) {
      // Remove tax
      newTaxIds = selectedTaxIds.filter(id => id !== taxId);
    } else {
      // Add tax
      newTaxIds = [...selectedTaxIds, taxId];
    }

    // Get rates for selected taxes
    const newTaxRates = newTaxIds.map(id => {
      const tax = taxes.find(t => t.id === id);
      return tax?.rate || 0;
    });

    console.log('Tax selection changed:', { newTaxIds, newTaxRates });
    onSelect(newTaxIds, newTaxRates);
  };

  const handleRemoveAllTaxes = () => {
    onSelect([], []);
  };

  const selectedTaxes = taxes.filter(t => selectedTaxIds.includes(t.id));
  const totalTaxRate = selectedTaxes.reduce((sum, tax) => sum + tax.rate, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Tax Configuration</h3>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Selected Taxes Summary */}
          {selectedTaxes.length > 0 && (
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Selected Taxes</h4>
                <button
                  onClick={handleRemoveAllTaxes}
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {selectedTaxes.map((tax) => (
                  <div
                    key={tax.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-primary-100"
                  >
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary-600" />
                      <div>
                        <p className="font-medium text-gray-900">{tax.name}</p>
                        <p className="text-xs text-gray-600">{tax.rate}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTaxToggle(tax.id, tax.rate)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-primary-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Combined Tax Rate:</span>
                  <span className="text-lg font-bold text-primary-600">{totalTaxRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* No Tax Option */}
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
            <input
              type="radio"
              name="tax-none"
              checked={selectedTaxIds.length === 0}
              onChange={handleRemoveAllTaxes}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900">No Tax</p>
              <p className="text-sm text-gray-600">
                Don't apply any tax to this invoice
              </p>
            </div>
            <span className="text-lg font-semibold text-gray-900">0%</span>
          </label>

          {/* Available Tax Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Available Taxes (Select Multiple)</p>
            {taxes.map((tax) => (
              <label
                key={tax.id}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedTaxIds.includes(tax.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTaxIds.includes(tax.id)}
                  onChange={() => handleTaxToggle(tax.id, tax.rate)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{tax.name}</p>
                    {tax.isDefault && (
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        Default
                      </span>
                    )}
                  </div>
                  {tax.description && (
                    <p className="text-sm text-gray-600">{tax.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Percent className="w-5 h-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">
                    {tax.rate}%
                  </span>
                </div>
              </label>
            ))}
          </div>

          {taxes.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Percent className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No tax rates configured</p>
              <p className="text-sm text-gray-500">
                <a href="/dashboard/taxes" className="text-primary-600 hover:text-primary-700 underline">
                  Add tax rates
                </a>{' '}
                to enable tax calculation
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
