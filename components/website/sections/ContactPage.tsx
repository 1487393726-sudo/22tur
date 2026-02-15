'use client';

import React, { useState, useCallback } from 'react';
import { ContactPage as ContactPageType, ContactForm as ContactFormType } from '@/types/website';

interface ContactPageProps {
  data: ContactPageType;
  onFormSubmit?: (formData: ContactFormType) => Promise<void>;
}

/**
 * ContactPage Component
 * Displays contact form, company location map, contact information, and social links
 * Supports responsive design across all breakpoints
 */
export const ContactPage: React.FC<ContactPageProps> = ({ data, onFormSubmit }) => {
  const [formData, setFormData] = useState<ContactFormType>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormType>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<ContactFormType> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error for this field when user starts typing
      if (errors[name as keyof ContactFormType]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(false);

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);

      try {
        if (onFormSubmit) {
          await onFormSubmit(formData);
        }
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : 'Failed to submit form. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, onFormSubmit]
  );

  return (
    <div className="w-full bg-light dark:bg-primary-900">
      {/* Contact Form and Info Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Form */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-light mb-2">
              Get in Touch
            </h1>
            <p className="text-secondary dark:text-neutral-300 mb-8">
              Have a question or want to work with us? We'd love to hear from you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              {/* Success Message */}
              {submitSuccess && (
                <div
                  className="p-4 bg-success/10 dark:bg-success/20 border border-success rounded-lg"
                  role="alert"
                  data-testid="success-message"
                >
                  <p className="text-success dark:text-success font-medium">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitError && (
                <div
                  className="p-4 bg-error/10 dark:bg-error/20 border border-error rounded-lg"
                  role="alert"
                  data-testid="error-message"
                >
                  <p className="text-error dark:text-error font-medium">{submitError}</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="form-label block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
                    errors.name ? 'input.error' : ''
                  }`}
                  placeholder="Your name"
                  data-testid="name-input"
                />
                {errors.name && (
                  <p className="mt-1 text-sm form-error" data-testid="name-error">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label block text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
                    errors.email ? 'input.error' : ''
                  }`}
                  placeholder="your@email.com"
                  data-testid="email-input"
                />
                {errors.email && (
                  <p className="mt-1 text-sm form-error" data-testid="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="form-label block text-sm font-medium mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
                    errors.phone ? 'input.error' : ''
                  }`}
                  placeholder="+1 (555) 000-0000"
                  data-testid="phone-input"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm form-error" data-testid="phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="form-label block text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors ${
                    errors.subject ? 'input.error' : ''
                  }`}
                  placeholder="What is this about?"
                  data-testid="subject-input"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm form-error" data-testid="subject-error">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="form-label block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-4 py-2 input rounded-lg focus:outline-none transition-colors resize-none ${
                    errors.message ? 'input.error' : ''
                  }`}
                  placeholder="Tell us more about your inquiry..."
                  data-testid="message-input"
                />
                {errors.message && (
                  <p className="mt-1 text-sm form-error" data-testid="message-error">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 btn-primary hover:bg-primary-600 disabled:bg-neutral-400 rounded-lg transition-colors"
                data-testid="submit-button"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Info Card */}
            <div className="bg-neutral-100 dark:bg-primary-800 rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-primary dark:text-light mb-6">
                Contact Information
              </h2>

              {/* Email */}
              <div className="mb-6" data-testid="contact-email">
                <h3 className="text-sm font-semibold text-secondary dark:text-neutral-400 uppercase mb-2">
                  Email
                </h3>
                <a
                  href={`mailto:${data.contactInfo.email}`}
                  className="text-lg text-primary dark:text-primary-300 hover:underline"
                >
                  {data.contactInfo.email}
                </a>
              </div>

              {/* Phone */}
              <div className="mb-6" data-testid="contact-phone">
                <h3 className="text-sm font-semibold text-secondary dark:text-neutral-400 uppercase mb-2">
                  Phone
                </h3>
                <a
                  href={`tel:${data.contactInfo.phone}`}
                  className="text-lg text-primary dark:text-primary-300 hover:underline"
                >
                  {data.contactInfo.phone}
                </a>
              </div>

              {/* Address */}
              <div className="mb-6" data-testid="contact-address">
                <h3 className="text-sm font-semibold text-secondary dark:text-neutral-400 uppercase mb-2">
                  Address
                </h3>
                <p className="text-primary dark:text-neutral-300">{data.contactInfo.address}</p>
              </div>

              {/* Business Hours */}
              <div data-testid="business-hours">
                <h3 className="text-sm font-semibold text-secondary dark:text-neutral-400 uppercase mb-3">
                  Business Hours
                </h3>
                <div className="space-y-2">
                  {data.contactInfo.businessHours.map((hours, index) => (
                    <div key={index} className="flex justify-between text-primary dark:text-neutral-300">
                      <span className="font-medium">{hours.day}</span>
                      <span>
                        {hours.isClosed ? (
                          <span className="text-error dark:text-error">Closed</span>
                        ) : (
                          `${hours.openTime} - ${hours.closeTime}`
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            {data.socialLinks.length > 0 && (
              <div className="bg-neutral-100 dark:bg-primary-800 rounded-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-primary dark:text-light mb-6">
                  Follow Us
                </h2>
                <div className="flex flex-wrap gap-4" data-testid="social-links">
                  {data.socialLinks.map((link) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-light transition-colors"
                      title={link.label}
                      data-testid={`social-link-${link.platform}`}
                    >
                      <span className="text-lg" aria-hidden="true">
                        {link.icon}
                      </span>
                      <span className="sr-only">{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {data.mapLocation && (
        <section className="py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8 bg-neutral-100 dark:bg-primary-800">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-light mb-8 text-center">
              Our Location
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Map Container */}
              <div className="lg:col-span-2">
                <div
                  className="w-full h-96 md:h-full rounded-lg overflow-hidden shadow-lg bg-neutral-200 dark:bg-primary-700"
                  data-testid="map-container"
                >
                  {/* Placeholder for map - in production, integrate with Google Maps or similar */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/30">
                    <div className="text-center">
                      <div className="text-4xl mb-2" aria-hidden="true">
                        📍
                      </div>
                      <p className="text-secondary dark:text-neutral-300">
                        Map integration would go here
                      </p>
                      <p className="text-sm text-secondary dark:text-neutral-400 mt-2">
                        Latitude: {data.mapLocation.latitude}, Longitude: {data.mapLocation.longitude}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-light dark:bg-primary-700 rounded-lg p-6 shadow-md h-fit">
                <h3 className="text-xl font-bold text-primary dark:text-light mb-4">
                  Location Details
                </h3>

                <div className="space-y-4">
                  <div data-testid="location-address">
                    <p className="text-sm text-secondary dark:text-neutral-400 font-medium">Address</p>
                    <p className="text-primary dark:text-light">{data.mapLocation.address}</p>
                  </div>

                  <div data-testid="location-coordinates">
                    <p className="text-sm text-secondary dark:text-neutral-400 font-medium">Coordinates</p>
                    <p className="text-primary dark:text-light text-sm">
                      {data.mapLocation.latitude.toFixed(4)}, {data.mapLocation.longitude.toFixed(4)}
                    </p>
                  </div>

                  <div data-testid="location-hours">
                    <p className="text-sm text-secondary dark:text-neutral-400 font-medium mb-2">
                      Hours
                    </p>
                    <div className="space-y-1 text-sm">
                      {data.mapLocation.businessHours.map((hours, index) => (
                        <div key={index} className="flex justify-between text-primary dark:text-neutral-300">
                          <span>{hours.day}</span>
                          <span>
                            {hours.isClosed ? (
                              <span className="text-error dark:text-error">Closed</span>
                            ) : (
                              `${hours.openTime} - ${hours.closeTime}`
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${data.mapLocation.latitude},${data.mapLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 btn-primary hover:bg-primary-600 rounded-lg transition-colors text-sm font-medium"
                    data-testid="get-directions-button"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ContactPage;
