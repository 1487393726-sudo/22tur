'use client';

import React, { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'alipay' | 'wechat';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

interface PaymentMethodManagerProps {
  methods: PaymentMethod[];
  onAdd: (method: Omit<PaymentMethod, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

export function PaymentMethodManager({
  methods,
  onAdd,
  onDelete,
  onSetDefault,
}: PaymentMethodManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    type: 'card' as const,
    name: '',
    lastFour: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeIcons: Record<string, string> = {
    card: '💳',
    alipay: '🔵',
    wechat: '🟢',
  };

  const typeLabels: Record<string, string> = {
    card: 'Bank Card',
    alipay: 'Alipay',
    wechat: 'WeChat Pay',
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.lastFour.trim()) newErrors.lastFour = 'Last 4 digits required';
    if (formData.type === 'card' && !/^\d{4}$/.test(formData.lastFour)) {
      newErrors.lastFour = 'Must be 4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onAdd({
        type: formData.type,
        name: formData.name,
        lastFour: formData.lastFour,
        isDefault: methods.length === 0,
      });
      setFormData({ type: 'card', name: '', lastFour: '' });
      setIsAdding(false);
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to add' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Payment Methods
        </h3>
        {methods.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No payment methods added</p>
        ) : (
          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[method.type]}</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {typeLabels[method.type]}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {method.name}
                      {method.type === 'card' && ` •••• ${method.lastFour}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {method.isDefault && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Default
                    </span>
                  )}
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => onSetDefault(method.id)}
                        className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(method.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Method Form */}
      {isAdding ? (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Add Payment Method
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Payment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as PaymentMethod['type'] })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="card">Bank Card</option>
                <option value="alipay">Alipay</option>
                <option value="wechat">WeChat Pay</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., My Visa Card"
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {formData.type === 'card' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  value={formData.lastFour}
                  onChange={(e) =>
                    setFormData({ ...formData, lastFour: e.target.value.slice(0, 4) })
                  }
                  maxLength={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="1234"
                />
                {errors.lastFour && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.lastFour}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Add Payment Method
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ type: 'card', name: '', lastFour: '' });
                  setErrors({});
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-2 rounded-lg font-medium border-2 border-dashed border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
        >
          + Add Payment Method
        </button>
      )}
    </div>
  );
}
