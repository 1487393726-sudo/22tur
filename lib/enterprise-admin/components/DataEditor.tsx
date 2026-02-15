'use client';

import React, { useState, useCallback } from 'react';
import { X, Save, Trash2 } from 'lucide-react';

export interface EditableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';
  required?: boolean;
  options?: { label: string; value: any }[];
  validation?: (value: any) => string | null;
}

export interface DataEditorProps {
  title: string;
  columns: EditableColumn[];
  initialData?: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isNew?: boolean;
}

export function DataEditor({
  title,
  columns,
  initialData = {},
  onSave,
  onDelete,
  onCancel,
  loading = false,
  isNew = true,
}: DataEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleChange = useCallback(
    (key: string, value: any) => {
      setFormData(prev => ({ ...prev, [key]: value }));
      // Clear error for this field when user starts editing
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    for (const column of columns) {
      const value = formData[column.key];

      // Check required
      if (column.required && (value === undefined || value === null || value === '')) {
        newErrors[column.key] = `${column.label} is required`;
        continue;
      }

      // Run custom validation
      if (column.validation && value) {
        const error = column.validation(value);
        if (error) {
          newErrors[column.key] = error;
        }
      }

      // Type-specific validation
      if (value) {
        switch (column.type) {
          case 'email':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              newErrors[column.key] = 'Invalid email address';
            }
            break;
          case 'number':
            if (isNaN(Number(value))) {
              newErrors[column.key] = 'Must be a number';
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              newErrors[column.key] = 'Invalid date';
            }
            break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [columns, formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  const renderField = (column: EditableColumn) => {
    const value = formData[column.key] ?? '';
    const error = errors[column.key];

    const baseClasses =
      'w-full px-3 py-2 bg-gray-700 text-white rounded border focus:outline-none transition-colors';
    const errorClasses = error ? 'border-red-500 focus:border-red-400' : 'border-gray-600 focus:border-gray-500';

    switch (column.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            placeholder={column.label}
            className={`${baseClasses} ${errorClasses} resize-none h-24`}
            disabled={loading || isSaving}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
            disabled={loading || isSaving}
          >
            <option value="">Select {column.label}</option>
            {column.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            placeholder={column.label}
            className={`${baseClasses} ${errorClasses}`}
            disabled={loading || isSaving}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            className={`${baseClasses} ${errorClasses}`}
            disabled={loading || isSaving}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            placeholder={column.label}
            className={`${baseClasses} ${errorClasses}`}
            disabled={loading || isSaving}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={e => handleChange(column.key, e.target.value)}
            placeholder={column.label}
            className={`${baseClasses} ${errorClasses}`}
            disabled={loading || isSaving}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onCancel}
            disabled={loading || isSaving || isDeleting}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {columns.map(column => (
            <div key={column.key}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {column.label}
                {column.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(column)}
              {errors[column.key] && (
                <p className="text-red-400 text-sm mt-1">{errors[column.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0">
          <div className="flex gap-2">
            {!isNew && onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading || isSaving || isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={loading || isSaving || isDeleting}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || isSaving || isDeleting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
