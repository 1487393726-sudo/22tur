/**
 * Property-Based Tests for Contact Form Submission Status
 * 
 * Feature: website-3d-redesign
 * Property 28: Form Submission Status
 * 
 * **Validates: Requirements 13.4**
 * 
 * For any form submission, when the submit action is triggered, a status indicator
 * (loading, success, or error) should be displayed with animation.
 * 
 * NOTE: Tests optimized for speed with 10 examples per property
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import ContactPage from '../page';

// Mock next-intl with all required translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'hero.title': 'Contact Us',
      'hero.subtitle': 'Get in touch',
      'info.title': 'Contact Information',
      'info.subtitle': 'Reach out to us',
      'info.email.title': 'Email',
      'info.email.value': 'test@example.com',
      'info.phone.title': 'Phone',
      'info.phone.value': '+1234567890',
      'info.address.title': 'Address',
      'info.address.value': 'Test Address',
      'hours.title': 'Business Hours',
      'hours.subtitle': 'When we work',
      'hours.weekdays': 'Mon-Fri',
      'hours.weekdaysTime': '9-5',
      'hours.weekend': 'Sat-Sun',
      'hours.weekendTime': 'Closed',
      'hours.responseTime': 'Response:',
      'hours.responseTimeValue': '24h',
      'form.title': 'Send Message',
      'form.subtitle': 'Contact us',
      'form.fields.name.label': 'Name',
      'form.fields.name.placeholder': 'Enter name',
      'form.fields.email.label': 'Email',
      'form.fields.email.placeholder': 'Enter email',
      'form.fields.phone.label': 'Phone',
      'form.fields.phone.placeholder': 'Enter phone',
      'form.fields.subject.label': 'Subject',
      'form.fields.subject.placeholder': 'Enter subject',
      'form.fields.message.label': 'Message',
      'form.fields.message.placeholder': 'Enter message',
      'form.validation.nameRequired': 'Name is required',
      'form.validation.emailRequired': 'Email is required',
      'form.validation.emailInvalid': 'Invalid email',
      'form.validation.subjectRequired': 'Subject is required',
      'form.validation.messageRequired': 'Message is required',
      'form.validation.messageMinLength': 'Message too short',
      'form.submit': 'Submit',
      'form.submitting': 'Submitting...',
      'form.success.title': 'Thank You!',
      'form.success.message': 'We will get back to you soon',
      'form.success.button': 'Send Another Message',
      'form.error.title': 'Oops!',
      'form.error.message': 'Something went wrong',
      'form.error.button': 'Try Again',
    };
    return translations[key] || key;
  },
}));

// Mock language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock 3D components
jest.mock('@/components/website/3d/Card3D', () => ({
  Card3D: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('@/components/website/3d/CardGrid3D', () => ({
  CardGrid3D: ({ children }: any) => <div>{children}</div>,
}));

// Mock animation components
jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/website/animations/SlideInView', () => ({
  SlideInView: ({ children }: any) => <div>{children}</div>,
}));

// Arbitraries for generating valid form data
const safeCharFilter = (s: string) => !/[{}\[\]<>\/\\]/.test(s);

const validNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0 && safeCharFilter(s));

const validEmailArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z0-9]+$/.test(s)),
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z0-9]+$/.test(s)),
  fc.constantFrom('com', 'org', 'net', 'edu', 'io')
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const validSubjectArbitrary = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0 && safeCharFilter(s));

const validMessageArbitrary = fc.string({ minLength: 10, maxLength: 500 })
  .filter(s => s.trim().length >= 10 && safeCharFilter(s));

const validFormDataArbitrary = fc.record({
  name: validNameArbitrary,
  email: validEmailArbitrary,
  subject: validSubjectArbitrary,
  message: validMessageArbitrary,
});

describe('Contact Form Submission Status - Property-Based Tests', () => {
  describe('Property 28: Form Submission Status', () => {
    /**
     * **Validates: Requirements 13.4**
     * 
     * For any form submission, when the submit action is triggered, a status indicator
     * (loading, success, or error) should be displayed with animation.
     */

    it('should display loading status immediately when form is submitted with any valid data', async () => {
      await fc.assert(
        fc.asyncProperty(
          validFormDataArbitrary,
          async (formData) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            // Fill form with valid data
            await user.type(screen.getByLabelText(/Name/), formData.name);
            await user.type(screen.getByLabelText(/Email/), formData.email);
            await user.type(screen.getByLabelText(/Subject/), formData.subject);
            await user.type(screen.getByLabelText(/Message/), formData.message);
            
            // Submit form
            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);
            
            // Loading status should be displayed immediately
            await waitFor(() => {
              // Check for loading spinner (SVG with animate-spin class)
              const spinner = document.querySelector('svg.animate-spin');
              expect(spinner).toBeInTheDocument();
              
              // Check for "Submitting..." text
              expect(screen.getByText('Submitting...')).toBeInTheDocument();
              
              // Submit button should be disabled during submission
              expect(submitButton).toBeDisabled();
            }, { timeout: 500 });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    }, 30000);

    it('should display success status with animation after successful submission', async () => {
      await fc.assert(
        fc.asyncProperty(
          validFormDataArbitrary,
          async (formData) => {
            // Mock Math.random to always succeed (> 0.1)
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.5);
            
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            // Fill form with valid data
            await user.type(screen.getByLabelText(/Name/), formData.name);
            await user.type(screen.getByLabelText(/Email/), formData.email);
            await user.type(screen.getByLabelText(/Subject/), formData.subject);
            await user.type(screen.getByLabelText(/Message/), formData.message);
            
            // Submit form
            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);
            
            // Success status should be displayed after submission
            await waitFor(() => {
              // Check for success icon (green background)
              const successIcon = document.querySelector('.bg-green-100');
              expect(successIcon).toBeInTheDocument();
              
              // Check for success title
              expect(screen.getByText('Thank You!')).toBeInTheDocument();
              
              // Check for success message
              expect(screen.getByText('We will get back to you soon')).toBeInTheDocument();
              
              // Check for "Send Another Message" button
              expect(screen.getByText('Send Another Message')).toBeInTheDocument();
            }, { timeout: 3000 });
            
            // Restore Math.random
            Math.random = originalRandom;
            unmount();
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);

    it('should display error status with animation when submission fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          validFormDataArbitrary,
          async (formData) => {
            // Mock Math.random to always fail (<= 0.1)
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.05);
            
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            // Fill form with valid data
            await user.type(screen.getByLabelText(/Name/), formData.name);
            await user.type(screen.getByLabelText(/Email/), formData.email);
            await user.type(screen.getByLabelText(/Subject/), formData.subject);
            await user.type(screen.getByLabelText(/Message/), formData.message);
            
            // Submit form
            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);
            
            // Error status should be displayed after submission
            await waitFor(() => {
              // Check for error icon (red background)
              const errorIcon = document.querySelector('.bg-red-100');
              expect(errorIcon).toBeInTheDocument();
              
              // Check for error title
              expect(screen.getByText('Oops!')).toBeInTheDocument();
              
              // Check for error message
              expect(screen.getByText('Something went wrong')).toBeInTheDocument();
              
              // Check for "Try Again" button
              expect(screen.getByText('Try Again')).toBeInTheDocument();
            }, { timeout: 3000 });
            
            // Restore Math.random
            Math.random = originalRandom;
            unmount();
          }
        ),
        { numRuns: 5 }
      );
    }, 30000);

    it('should display success icon with scale-in animation class', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Success icon should have animation class
      await waitFor(() => {
        const successIcon = document.querySelector('.animate-scale-in');
        expect(successIcon).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should display error icon with scale-in animation class', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Error icon should have animation class
      await waitFor(() => {
        const errorIcon = document.querySelector('.animate-scale-in');
        expect(errorIcon).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should display checkmark icon with animation in success state', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Checkmark icon should have animation class
      await waitFor(() => {
        const checkmark = document.querySelector('.animate-check-mark');
        expect(checkmark).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should hide form and show success message after successful submission', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Form should be hidden and success message shown
      await waitFor(() => {
        // Form fields should not be visible
        expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Email/)).not.toBeInTheDocument();
        
        // Success message should be visible
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should hide form and show error message after failed submission', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Form should be hidden and error message shown
      await waitFor(() => {
        // Form fields should not be visible
        expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Email/)).not.toBeInTheDocument();
        
        // Error message should be visible
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should allow user to return to form from success state', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Click "Send Another Message" button
      const sendAnotherButton = screen.getByText('Send Another Message');
      fireEvent.click(sendAnotherButton);
      
      // Form should be visible again
      await waitFor(() => {
        expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should allow user to return to form from error state', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Click "Try Again" button
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      
      // Form should be visible again
      await waitFor(() => {
        expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should transition through all three states: idle -> loading -> success', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Initial state: idle (form visible)
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Loading state: spinner visible
      await waitFor(() => {
        expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      }, { timeout: 500 });
      
      // Success state: success message visible
      await waitFor(() => {
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
        expect(document.querySelector('.bg-green-100')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should transition through all three states: idle -> loading -> error', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Initial state: idle (form visible)
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Loading state: spinner visible
      await waitFor(() => {
        expect(document.querySelector('svg.animate-spin')).toBeInTheDocument();
        expect(screen.getByText('Submitting...')).toBeInTheDocument();
      }, { timeout: 500 });
      
      // Error state: error message visible
      await waitFor(() => {
        expect(screen.getByText('Oops!')).toBeInTheDocument();
        expect(document.querySelector('.bg-red-100')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });
  });

  describe('Requirement 13.4: Form Submission Status Display', () => {
    it('should display loading spinner during submission', async () => {
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // Loading spinner should be visible
      await waitFor(() => {
        const spinner = document.querySelector('svg.animate-spin');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('animate-spin');
      }, { timeout: 500 });
      
      unmount();
    });

    it('should disable submit button during submission', async () => {
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      expect(submitButton).not.toBeDisabled();
      
      fireEvent.click(submitButton);
      
      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      }, { timeout: 500 });
      
      unmount();
    });

    it('should display animated success state with all required elements', async () => {
      // Mock Math.random to always succeed
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
      
      // Success state should have all required elements
      await waitFor(() => {
        // Success icon with animation
        expect(document.querySelector('.bg-green-100.animate-scale-in')).toBeInTheDocument();
        
        // Checkmark with animation
        expect(document.querySelector('.animate-check-mark')).toBeInTheDocument();
        
        // Success title
        expect(screen.getByText('Thank You!')).toBeInTheDocument();
        
        // Success message
        expect(screen.getByText('We will get back to you soon')).toBeInTheDocument();
        
        // Action button
        expect(screen.getByText('Send Another Message')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });

    it('should display animated error state with all required elements', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.05);
      
      const { unmount } = render(<ContactPage />);
      const user = userEvent.setup();
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
      
      // Error state should have all required elements
      await waitFor(() => {
        // Error icon with animation
        expect(document.querySelector('.bg-red-100.animate-scale-in')).toBeInTheDocument();
        
        // Error title
        expect(screen.getByText('Oops!')).toBeInTheDocument();
        
        // Error message
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        
        // Action button
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // Restore Math.random
      Math.random = originalRandom;
      unmount();
    });
  });
});
