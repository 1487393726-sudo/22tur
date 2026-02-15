'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'textarea';

export interface FormField {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  placeholder?: string;
  value?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: (value: any) => string | null;
  disabled?: boolean;
  rows?: number;
  help?: string;
}

export interface AdminFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

interface FieldError {
  [key: string]: string | null;
}

export function AdminForm({
  fields,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  className = '',
}: AdminFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.name] = field.value ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      // Check required
      if (field.required && !value) {
        return `${field.label} is required`;
      }

      // Check custom validation
      if (field.validation) {
        return field.validation(value);
      }

      // Check email format
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Invalid email format';
        }
      }

      // Check number
      if (field.type === 'number' && value) {
        if (isNaN(Number(value))) {
          return 'Must be a number';
        }
      }

      return null;
    },
    []
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FieldError = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      } else {
        newErrors[field.name] = null;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, formData, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      let newValue = value;
      if (type === 'checkbox') {
        newValue = checked;
      } else if (type === 'number') {
        newValue = value ? Number(value) : '';
      }

      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));

      // Real-time validation
      const field = fields.find(f => f.name === name);
      if (field && touched.has(name)) {
        const error = validateField(field, newValue);
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [fields, touched, validateField]
  );

  // Handle multiselect change
  const handleMultiselectChange = useCallback(
    (name: string, value: any) => {
      setFormData(prev => {
        const current = prev[name] || [];
        const newValue = current.includes(value)
          ? current.filter((v: any) => v !== value)
          : [...current, value];
        return {
          ...prev,
          [name]: newValue,
        };
      });

      // Real-time validation
      const field = fields.find(f => f.name === name);
      if (field && touched.has(name)) {
        const error = validateField(field, formData[name]);
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [fields, touched, formData, validateField]
  );

  // Handle blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched(prev => new Set([...prev, name]));

      const field = fields.find(f => f.name === name);
      if (field) {
        const error = validateField(field, formData[name]);
        setErrors(prev => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [fields, formData, validateField]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setSubmitSuccess(false);

      try {
        await onSubmit(formData);
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onSubmit]
  );

  const renderField = (field: FormField) => {
    const error = errors[field.name];
    const isTouched = touched.has(field.name);
    const showError = isTouched && error;

    const baseInputClass = `w-full px-3 py-2 bg-gray-700 text-white rounded border transition-colors ${
      showError
        ? 'border-red-500 focus:border-red-400'
        : 'border-gray-600 focus:border-gray-500'
    } focus:outline-none`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            rows={field.rows || 4}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={field.disabled || loading}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData[field.name] || []).includes(opt.value)}
                  onChange={() => handleMultiselectChange(field.name, opt.value)}
                  disabled={field.disabled || loading}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={formData[field.name] === opt.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={field.disabled || loading}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name={field.name}
              checked={formData[field.name] || false}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={field.disabled || loading}
              className="w-4 h-4"
            />
            <span className="text-gray-300">{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {submitSuccess && (
        <div className="p-4 bg-green-900 border border-green-700 rounded flex items-center gap-2 text-green-200">
          <CheckCircle size={20} />
          Form submitted successfully!
        </div>
      )}

      {fields.map(field => (
        <div key={field.name}>
          {field.type !== 'checkbox' && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}

          {renderField(field)}

          {field.help && (
            <p className="text-xs text-gray-400 mt-1">{field.help}</p>
          )}

          {errors[field.name] && touched.has(field.name) && (
            <div className="flex items-center gap-1 text-red-400 text-sm mt-1">
              <AlertCircle size={14} />
              {errors[field.name]}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || loading}
            className="px-6 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
}
