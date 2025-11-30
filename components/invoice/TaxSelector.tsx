'use client';

import { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';

interface Tax {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

interface TaxSelectorProps {
  selectedTaxId: string | null;
  onSelect: (taxId: string | null, taxRate: number) => void;
}

export default function TaxSelector({
  selectedTaxId,
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

      // Auto-select default tax if none selected
      const defaultTax = data.taxes.find((t: Tax) => t.isDefault);
      if (!selectedTaxId && defaultTax) {
        onSelect(defaultTax.id, defaultTax.rate);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTax = taxes.find((t) => t.id === selectedTaxId);

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
          {/* No Tax Option */}
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition">
            <input
              type="radio"
              name="tax"
              checked={selectedTaxId === null}
              onChange={() => onSelect(null, 0)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <div className="ml-3 flex-1">
              <p className="font-medium text-gray-900">No Tax</p>
              <p className="text-sm text-gray-600">
                Don't apply tax to this invoice
              </p>
            </div>
            <span className="text-lg font-semibold text-gray-900">0%</span>
          </label>

          {/* Tax Options */}
          {taxes.map((tax) => (
            <label
              key={tax.id}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedTaxId === tax.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tax"
                checked={selectedTaxId === tax.id}
                onChange={() => onSelect(tax.id, tax.rate)}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
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
                <p className="text-sm text-gray-600">
                  Applied to all taxable items
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Percent className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-semibold text-gray-900">
                  {tax.rate}%
                </span>
              </div>
            </label>
          ))}

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
