'use client';

import React, { useState } from 'react';

interface BasicInfo {
  name: string;
  email: string;
  phone: string;
}

interface BasicInfoFormProps {
  initialData: BasicInfo;
  onSubmit: (data: BasicInfo) => Promise<void>;
  isLoading?: boolean;
}

export function BasicInfoForm({
  initialData,
  onSubmit,
  isLoading = false,
}: BasicInfoFormProps) {
  const [formData, setFormData] = useState<BasicInfo>(initialData);
  const [errors, setErrors] = useState<Partial<BasicInfo>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<BasicInfo> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof BasicInfo]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ name: error instanceof Error ? error.message : 'Failed to update' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          className={`
            w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-slate-700
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            ${
              errors.name
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-600'
            }
            focus:outline-none focus:ring-2 focus:ring-teal-500
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          placeholder="Enter your full name"
        />
        {errors.name && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          className={`
            w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-slate-700
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            ${
              errors.email
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-600'
            }
            focus:outline-none focus:ring-2 focus:ring-teal-500
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
          className={`
            w-full px-4 py-2 rounded-lg border
            bg-white dark:bg-slate-700
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            ${
              errors.phone
                ? 'border-red-500 dark:border-red-400'
                : 'border-slate-300 dark:border-slate-600'
            }
            focus:outline-none focus:ring-2 focus:ring-teal-500
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          placeholder="Enter your phone number"
        />
        {errors.phone && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
        )}
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
          ✓ Information updated successfully
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full px-4 py-2 rounded-lg font-medium
          bg-teal-600 text-white
          hover:bg-teal-700 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
          dark:focus:ring-offset-slate-900
        `}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
