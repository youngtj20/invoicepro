'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface LineItem {
  id: string;
  itemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  taxable: boolean;
}

interface LineItemTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  defaultTaxRate?: number;
  defaultTaxId?: string;
}

export default function LineItemTable({
  items,
  onChange,
  defaultTaxRate = 0,
  defaultTaxId,
}: LineItemTableProps) {
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items?limit=100');
      const data = await response.json();
      if (response.ok) {
        setAvailableItems(data.items);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addLineItem = (item?: Item) => {
    const newItem: LineItem = {
      id: generateId(),
      itemId: item?.id,
      description: item?.name || '',
      quantity: 1,
      unitPrice: item?.price || 0,
      taxId: item?.taxable ? defaultTaxId : undefined,
      taxRate: item?.taxable ? defaultTaxRate : 0,
      taxAmount: 0,
      total: 0,
    };

    newItem.taxAmount = calculateTaxAmount(newItem);
    newItem.total = calculateTotal(newItem);

    onChange([...items, newItem]);
    setShowItemSelector(false);
    setItemSearch('');
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // Recalculate tax and total when quantity or unit price changes
        if (field === 'quantity' || field === 'unitPrice') {
          updated.taxAmount = calculateTaxAmount(updated);
          updated.total = calculateTotal(updated);
        } else if (field === 'taxRate') {
          updated.taxAmount = calculateTaxAmount(updated);
          updated.total = calculateTotal(updated);
        }

        return updated;
      }
      return item;
    });

    onChange(updatedItems);
  };

  const removeLineItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const calculateTaxAmount = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    return (subtotal * item.taxRate) / 100;
  };

  const calculateTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    return subtotal + calculateTaxAmount(item);
  };

  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowItemSelector(!showItemSelector)}
          >
            <Search className="w-4 h-4 mr-2" />
            Browse Items
          </Button>
          <Button size="sm" onClick={() => addLineItem()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom
          </Button>
        </div>
      </div>

      {/* Item Selector */}
      {showItemSelector && (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <input
            type="text"
            placeholder="Search items..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addLineItem(item)}
                className="w-full p-3 text-left border border-gray-200 rounded bg-white hover:bg-gray-50 transition"
              >
                <p className="font-medium text-gray-900">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600">
                    {item.description || 'No description'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    NGN {item.price.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-center text-gray-500 py-4">No items found</p>
            )}
          </div>
        </div>
      )}

      {/* Line Items Table */}
      {items.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 mb-4">No line items added yet</p>
          <Button onClick={() => addLineItem()}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/5">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
                    Tax %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">
                    Total
                  </th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(item.id, 'description', e.target.value)
                        }
                        placeholder="Item description"
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.taxRate}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      NGN {item.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeLineItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Item #{index + 1}
                  </span>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, 'description', e.target.value)
                      }
                      placeholder="Item description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.taxRate}
                      onChange={(e) =>
                        updateLineItem(
                          item.id,
                          'taxRate',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Item Total:
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        NGN {item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
