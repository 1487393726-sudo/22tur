'use client';

import React, { useState, useCallback } from 'react';
import { Footer as FooterType } from '@/types/website';

interface FooterProps {
  data: FooterType;
  onNewsletterSubmit?: (email: string) => Promise<void>;
}

/**
 * Footer Component
 * Displays company information, quick links, social media, contact info, and newsletter signup
 * Supports responsive design across all breakpoints
 * Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 */
export const Footer: React.FC<FooterProps> = ({ data, onNewsletterSubmit }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  // Handle newsletter subscription
  const handleNewsletterSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setNewsletterError(null);
      setNewsletterSuccess(false);

      if (!newsletterEmail.trim()) {
        setNewsletterError('Email is required');
        return;
      }

      if (!validateEmail(newsletterEmail)) {
        setNewsletterError('Please enter a valid email address');
        return;
      }

      setIsSubmittingNewsletter(true);

      try {
        if (onNewsletterSubmit) {
          await onNewsletterSubmit(newsletterEmail);
        }
        setNewsletterSuccess(true);
        setNewsletterEmail('');
        // Clear success message after 3 seconds
        setTimeout(() => setNewsletterSuccess(false), 3000);
      } catch (error) {
        setNewsletterError(
          error instanceof Error ? error.message : 'Failed to subscribe to newsletter'
        );
      } finally {
        setIsSubmittingNewsletter(false);
      }
    },
    [newsletterEmail, validateEmail, onNewsletterSubmit]
  );

  // Handle newsletter email input change
  const handleNewsletterEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewsletterEmail(e.target.value);
      if (newsletterError) {
        setNewsletterError(null);
      }
    },
    [newsletterError]
  );

  return (
    <footer
      className="footer"
      data-testid="footer"
      role="contentinfo"
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info Section */}
          <div className="lg:col-span-2" data-testid="footer-company-info">
            <div className="mb-4">
              {data.companyInfo.logo && (
                <img
                  src={data.companyInfo.logo}
                  alt={data.companyInfo.name}
                  className="h-8 w-auto mb-4"
                  data-testid="footer-logo"
                />
              )}
              <h3 className="text-lg font-bold text-white mb-2">
                {data.companyInfo.name}
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {data.companyInfo.description}
            </p>

            {/* Newsletter Subscription */}
            {data.newsletter && (
              <div data-testid="footer-newsletter">
                <h4 className="text-sm font-semibold text-white mb-2">
                  {data.newsletter.title}
                </h4>
                <p className="text-slate-300 text-xs mb-3">
                  {data.newsletter.description}
                </p>
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-2"
                  data-testid="footer-newsletter-form"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={handleNewsletterEmailChange}
                    placeholder={data.newsletter.placeholder}
                    className="flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    disabled={isSubmittingNewsletter}
                    data-testid="footer-newsletter-input"
                    aria-label="Newsletter email"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNewsletter}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                    data-testid="footer-newsletter-button"
                  >
                    {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
                {newsletterError && (
                  <p
                    className="text-red-400 text-xs mt-2"
                    data-testid="footer-newsletter-error"
                    role="alert"
                  >
                    {newsletterError}
                  </p>
                )}
                {newsletterSuccess && (
                  <p
                    className="text-green-400 text-xs mt-2"
                    data-testid="footer-newsletter-success"
                    role="status"
                  >
                    Thank you for subscribing!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Sections (Links) */}
          {data.sections.map((section, index) => (
            <div key={`footer-section-${index}`} data-testid={`footer-section-${index}`}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={`footer-link-${index}-${linkIndex}`}>
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-white text-sm transition-colors"
                      data-testid={`footer-link-${section.title}-${link.label}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info Section */}
          <div data-testid="footer-contact-info">
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${data.contactInfo.email}`}
                  className="text-slate-300 hover:text-white transition-colors"
                  data-testid="footer-email"
                >
                  {data.contactInfo.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${data.contactInfo.phone}`}
                  className="text-slate-300 hover:text-white transition-colors"
                  data-testid="footer-phone"
                >
                  {data.contactInfo.phone}
                </a>
              </li>
              <li className="text-slate-300" data-testid="footer-address">
                {data.contactInfo.address}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div
        className="border-t border-slate-800 bg-slate-950 py-8"
        data-testid="footer-bottom"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Copyright and Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 text-sm">
              <p className="text-slate-400" data-testid="footer-copyright">
                {data.copyright}
              </p>
              <div className="flex gap-4">
                {data.legalLinks.map((link, index) => (
                  <a
                    key={`legal-link-${index}`}
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors"
                    data-testid={`footer-legal-link-${link.label}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Social Media Links */}
            <div
              className="flex items-center justify-center md:justify-end gap-4"
              data-testid="footer-social-links"
            >
              {data.socialLinks.map((social, index) => (
                <a
                  key={`social-link-${index}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                  aria-label={social.label}
                  data-testid={`footer-social-${social.platform}`}
                  title={social.label}
                >
                  <span className="sr-only">{social.label}</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {/* Generic social icon - in real implementation, use specific icons per platform */}
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
