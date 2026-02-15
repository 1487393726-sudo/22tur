/**
 * Property-Based Tests for Contact Form Validation
 * 
 * Feature: website-3d-redesign
 * Property 27: Form Validation Feedback
 * 
 * **Validates: Requirements 13.3**
 * 
 * For any form input field, when invalid data is entered, a validation error
 * message should be displayed immediately.
 * 
 * NOTE: Tests optimized for speed with 10 examples per property
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import ContactPage from '../page';

// Mock next-intl with validation messages
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

// Arbitraries for generating test data
// Filter out special characters that userEvent interprets as keyboard commands: {}, [], <>, /
const safeCharFilter = (s: string) => !/[{}\[\]<>\/\\]/.test(s);

const validNameArbitrary = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => s.trim().length > 0 && safeCharFilter(s));

const validSubjectArbitrary = fc.string({ minLength: 1, maxLength: 100 })
  .filter(s => s.trim().length > 0 && safeCharFilter(s));

const validMessageArbitrary = fc.string({ minLength: 10, maxLength: 500 })
  .filter(s => s.trim().length >= 10 && safeCharFilter(s));

const shortMessageArbitrary = fc.string({ minLength: 1, maxLength: 9 })
  .filter(s => s.trim().length > 0 && s.trim().length < 10 && safeCharFilter(s));

// Email arbitraries
const validEmailArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z0-9]+$/.test(s)),
  fc.string({ minLength: 1, maxLength: 15 }).filter(s => /^[a-z0-9]+$/.test(s)),
  fc.constantFrom('com', 'org', 'net', 'edu', 'io')
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const invalidEmailArbitrary = fc.oneof(
  fc.string({ minLength: 1, maxLength: 30 }).filter(s => !s.includes('@') && safeCharFilter(s)),
  fc.string({ minLength: 1, maxLength: 30 }).map(s => `${s.replace(/[@.]/g, '')}@`).filter(safeCharFilter),
  fc.constant('invalid-email'),
  fc.constant('test@'),
  fc.constant('@test.com')
);

describe('Contact Form Validation - Property-Based Tests', () => {
  describe('Property 27: Form Validation Feedback', () => {
    /**
     * **Validates: Requirements 13.3**
     * 
     * For any form input field, when invalid data is entered,
     * a validation error message should be displayed immediately.
     */

    it('should display error when name field is left empty', async () => {
      const { unmount } = render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Focus and blur without entering value (simulates user leaving field empty)
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      unmount();
    });

    it('should not display error for any valid name input', async () => {
      await fc.assert(
        fc.asyncProperty(
          validNameArbitrary,
          async (validName) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const nameInput = screen.getByLabelText(/Name/);
            
            await user.type(nameInput, validName);
            fireEvent.blur(nameInput);
            
            await waitFor(() => {
              expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error for any invalid email format', async () => {
      await fc.assert(
        fc.asyncProperty(
          invalidEmailArbitrary,
          async (invalidEmail) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const emailInput = screen.getByLabelText(/Email/);
            
            await user.clear(emailInput);
            await user.type(emailInput, invalidEmail);
            fireEvent.blur(emailInput);
            
            await waitFor(() => {
              const hasError = 
                screen.queryByText('Invalid email') !== null ||
                screen.queryByText('Email is required') !== null;
              expect(hasError).toBe(true);
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should not display error for any valid email format', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArbitrary,
          async (validEmail) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const emailInput = screen.getByLabelText(/Email/);
            
            await user.clear(emailInput);
            await user.type(emailInput, validEmail);
            fireEvent.blur(emailInput);
            
            await waitFor(() => {
              expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should not display error for any valid subject input', async () => {
      await fc.assert(
        fc.asyncProperty(
          validSubjectArbitrary,
          async (validSubject) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const subjectInput = screen.getByLabelText(/Subject/);
            
            await user.type(subjectInput, validSubject);
            fireEvent.blur(subjectInput);
            
            await waitFor(() => {
              expect(screen.queryByText('Subject is required')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display error for any message shorter than 10 characters', async () => {
      await fc.assert(
        fc.asyncProperty(
          shortMessageArbitrary,
          async (shortMessage) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const messageInput = screen.getByLabelText(/Message/);
            
            await user.type(messageInput, shortMessage);
            fireEvent.blur(messageInput);
            
            await waitFor(() => {
              expect(screen.getByText('Message too short')).toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should not display error for any valid message (10+ characters)', async () => {
      await fc.assert(
        fc.asyncProperty(
          validMessageArbitrary,
          async (validMessage) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const messageInput = screen.getByLabelText(/Message/);
            
            await user.type(messageInput, validMessage);
            fireEvent.blur(messageInput);
            
            await waitFor(() => {
              expect(screen.queryByText('Message too short')).not.toBeInTheDocument();
              expect(screen.queryByText('Message is required')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should clear error when user corrects any invalid input', async () => {
      await fc.assert(
        fc.asyncProperty(
          invalidEmailArbitrary,
          validEmailArbitrary,
          async (invalidEmail, validEmail) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const emailInput = screen.getByLabelText(/Email/);
            
            // Enter invalid email
            await user.type(emailInput, invalidEmail);
            fireEvent.blur(emailInput);
            
            // Wait for error to appear
            await waitFor(() => {
              const hasError = 
                screen.queryByText('Invalid email') !== null ||
                screen.queryByText('Email is required') !== null;
              expect(hasError).toBe(true);
            });
            
            // Clear and enter valid email
            await user.clear(emailInput);
            await user.type(emailInput, validEmail);
            
            // Error should be cleared
            await waitFor(() => {
              expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should apply aria-invalid attribute when field has validation error', async () => {
      const { unmount } = render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Leave field empty
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
      
      unmount();
    });

    it('should apply aria-describedby to link error messages', async () => {
      const { unmount } = render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Leave field empty
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
      
      unmount();
    });

    it('should apply visual error styling (red border) when field is invalid', async () => {
      const { unmount } = render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Leave field empty
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-red-500');
      });
      
      unmount();
    });

    it('should validate all required fields on form submission', async () => {
      const { unmount } = render(<ContactPage />);
      
      // Submit form without filling any fields
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      // All required field errors should be displayed
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Subject is required')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
      
      unmount();
    });

    it('should allow form submission with any combination of valid inputs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: validNameArbitrary,
            email: validEmailArbitrary,
            subject: validSubjectArbitrary,
            message: validMessageArbitrary,
          }),
          async (validFormData) => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            // Fill form with valid data
            await user.type(screen.getByLabelText(/Name/), validFormData.name);
            await user.type(screen.getByLabelText(/Email/), validFormData.email);
            await user.type(screen.getByLabelText(/Subject/), validFormData.subject);
            await user.type(screen.getByLabelText(/Message/), validFormData.message);
            
            // Submit form
            const submitButton = screen.getByRole('button', { name: /Submit/i });
            fireEvent.click(submitButton);
            
            // Form should be submitted without errors
            await waitFor(() => {
              expect(consoleSpy).toHaveBeenCalledWith(
                'Form submitted:',
                expect.objectContaining({
                  name: validFormData.name,
                  email: validFormData.email,
                  subject: validFormData.subject,
                  message: validFormData.message,
                })
              );
            });
            
            consoleSpy.mockRestore();
            unmount();
          }
        ),
        { numRuns: 5 }
      );
    }, 15000);

    it('should not show validation error for optional phone field with any input', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 30 }).filter(safeCharFilter),
          async (phoneValue) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const phoneInput = screen.getByLabelText(/Phone/);
            
            await user.type(phoneInput, phoneValue);
            fireEvent.blur(phoneInput);
            
            // Wait a bit to ensure no error appears
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Phone field should never show required error
            expect(screen.queryByText(/phone.*required/i)).not.toBeInTheDocument();
            
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  describe('Requirement 13.3: Real-time Validation Feedback', () => {
    it('should provide immediate feedback after blur for empty fields', async () => {
      const { unmount } = render(<ContactPage />);
      
      const fields = [
        { input: screen.getByLabelText(/Name/), error: 'Name is required' },
        { input: screen.getByLabelText(/Email/), error: 'Email is required' },
        { input: screen.getByLabelText(/Subject/), error: 'Subject is required' },
        { input: screen.getByLabelText(/Message/), error: 'Message is required' },
      ];
      
      for (const field of fields) {
        fireEvent.focus(field.input);
        fireEvent.blur(field.input);
        
        await waitFor(() => {
          expect(screen.getByText(field.error)).toBeInTheDocument();
        });
      }
      
      unmount();
    });

    it('should update validation state in real-time as user types corrections', async () => {
      await fc.assert(
        fc.asyncProperty(
          shortMessageArbitrary,
          validMessageArbitrary,
          async (shortMsg, validMsg) => {
            const { unmount } = render(<ContactPage />);
            const user = userEvent.setup();
            
            const messageInput = screen.getByLabelText(/Message/);
            
            // Enter short message
            await user.type(messageInput, shortMsg);
            fireEvent.blur(messageInput);
            
            await waitFor(() => {
              expect(screen.getByText('Message too short')).toBeInTheDocument();
            });
            
            // Clear and type valid message
            await user.clear(messageInput);
            await user.type(messageInput, validMsg);
            
            // Error should clear in real-time
            await waitFor(() => {
              expect(screen.queryByText('Message too short')).not.toBeInTheDocument();
            });
            
            unmount();
          }
        ),
        { numRuns: 5 }
      );
    }, 15000);
  });
});
