'use client';

import React, { useState } from 'react';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  addresses: Address[];
  onAdd: (address: Omit<Address, 'id'>) => Promise<void>;
  onEdit: (id: string, address: Omit<Address, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
}

export function AddressManager({
  addresses,
  onAdd,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id'>>({
    type: 'home',
    recipient: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipient.trim()) newErrors.recipient = 'Recipient name required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number required';
    if (!formData.province.trim()) newErrors.province = 'Province required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (!formData.detail.trim()) newErrors.detail = 'Address detail required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await onEdit(editingId, formData);
        setEditingId(null);
      } else {
        await onAdd(formData);
      }
      resetForm();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save' });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      recipient: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
    });
    setErrors({});
  };

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      type: address.type,
      recipient: address.recipient,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      isDefault: address.isDefault,
    });
  };

  const typeLabels = { home: 'Home', work: 'Work', other: 'Other' };

  return (
    <div className="space-y-6">
      {/* Address List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Saved Addresses
        </h3>
        {addresses.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">No addresses saved yet</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                      {typeLabels[address.type]}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(address.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {address.recipient}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {address.phone}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {address.province} {address.city} {address.district}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {address.detail}
                </p>
                {!address.isDefault && (
                  <button
                    onClick={() => onSetDefault(address.id)}
                    className="mt-2 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {editingId ? 'Edit Address' : 'Add New Address'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as Address['type'] })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Name"
              />
              {errors.recipient && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.recipient}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Phone"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                Province
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Province"
              />
              {errors.province && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.province}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="City"
              />
              {errors.city && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
                District
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="District"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Address Detail
            </label>
            <textarea
              value={formData.detail}
              onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Street address, building, etc."
              rows={3}
            />
            {errors.detail && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.detail}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {editingId ? 'Update Address' : 'Add Address'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
