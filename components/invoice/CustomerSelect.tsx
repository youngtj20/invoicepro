'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, User } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
}

interface CustomerSelectProps {
  selectedCustomerId: string | null;
  onSelect: (customerId: string) => void;
  onCreateNew: () => void;
}

export default function CustomerSelect({
  selectedCustomerId,
  onSelect,
  onCreateNew,
}: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const params = new URLSearchParams({
        limit: '100',
        ...(search && { search }),
      });

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch customers');
      }

      setCustomers(data.customers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Select Customer</h3>
        <Button variant="outline" size="sm" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
      </div>

      {/* Selected Customer */}
      {selectedCustomer && (
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                {selectedCustomer.email && (
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                )}
                {selectedCustomer.company && (
                  <p className="text-sm text-gray-600">{selectedCustomer.company}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect('')}
            >
              Change
            </Button>
          </div>
        </div>
      )}

      {/* Customer Search and List */}
      {!selectedCustomerId && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Customer List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 mb-4">
                {search ? 'No customers found' : 'No customers yet'}
              </p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Customer
              </Button>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => onSelect(customer.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    {customer.email && (
                      <p className="text-sm text-gray-600 truncate">
                        {customer.email}
                      </p>
                    )}
                    {customer.company && (
                      <p className="text-sm text-gray-500">{customer.company}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
