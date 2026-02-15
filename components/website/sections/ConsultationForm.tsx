'use client';

import React, { useState, useCallback } from 'react';
import { ConsultationForm as ConsultationFormType } from '@/types/website';

interface ConsultationFormProps {
  serviceType?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  serviceType?: string;
  message?: string;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  serviceType: initialServiceType,
  onSubmitSuccess,
  onSubmitError,
}) => {
  const [formData, setFormData] = useState<ConsultationFormType>({
    name: '',
    email: '',
    phone: '',
    serviceType: initialServiceType || '',
    message: '',
    preferredTime: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Support various phone formats: +1234567890, 123-456-7890, (123) 456-7890, 1234567890
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.serviceType.trim()) {
      newErrors.serviceType = 'Please select a service type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      preferredTime: value ? new Date(value) : undefined,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit consultation form');
      }

      setSubmitMessage({
        type: 'success',
        text: 'Thank you for your consultation request. We will contact you soon.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: initialServiceType || '',
        message: '',
        preferredTime: undefined,
      });

      onSubmitSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setSubmitMessage({
        type: 'error',
        text: errorMessage,
      });
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-light rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-2">Online Consultation</h2>
      <p className="text-secondary mb-6">
        Fill out the form below and we'll get back to you as soon as possible.
      </p>

      {submitMessage && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            submitMessage.type === 'success'
              ? 'bg-success/10 text-success border border-success'
              : 'bg-error/10 text-error border border-error'
          }`}
          role="alert"
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="form-label block text-sm font-medium mb-2">
            Name <span className="form-required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your full name"
            className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
              errors.name ? 'input.error' : ''
            }`}
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm form-error">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="form-label block text-sm font-medium mb-2">
            Email <span className="form-required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
              errors.email ? 'input.error' : ''
            }`}
            disabled={isSubmitting}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm form-error">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="form-label block text-sm font-medium mb-2">
            Phone Number <span className="form-required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
            className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
              errors.phone ? 'input.error' : ''
            }`}
            disabled={isSubmitting}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm form-error">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Service Type Field */}
        <div>
          <label htmlFor="serviceType" className="form-label block text-sm font-medium mb-2">
            Service Type <span className="form-required">*</span>
          </label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
              errors.serviceType ? 'input.error' : ''
            }`}
            disabled={isSubmitting}
            aria-invalid={!!errors.serviceType}
            aria-describedby={errors.serviceType ? 'serviceType-error' : undefined}
          >
            <option value="">Select a service type</option>
            <option value="web-design">Web Design</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-app">Mobile App Development</option>
            <option value="consulting">Consulting</option>
            <option value="other">Other</option>
          </select>
          {errors.serviceType && (
            <p id="serviceType-error" className="mt-1 text-sm form-error">
              {errors.serviceType}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="form-label block text-sm font-medium mb-2">
            Message <span className="form-required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Tell us about your project or inquiry..."
            rows={5}
            className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors resize-none ${
              errors.message ? 'input.error' : ''
            }`}
            disabled={isSubmitting}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p id="message-error" className="mt-1 text-sm form-error">
              {errors.message}
            </p>
          )}
        </div>

        {/* Preferred Time Field (Optional) */}
        <div>
          <label htmlFor="preferredTime" className="form-label block text-sm font-medium mb-2">
            Preferred Consultation Time (Optional)
          </label>
          <input
            type="datetime-local"
            id="preferredTime"
            name="preferredTime"
            value={
              formData.preferredTime
                ? formData.preferredTime.toISOString().slice(0, 16)
                : ''
            }
            onChange={handleDateChange}
            className="w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary hover:bg-primary-600 disabled:bg-neutral-400 py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Consultation Request'}
        </button>
      </form>
    </div>
  );
};

export default ConsultationForm;
