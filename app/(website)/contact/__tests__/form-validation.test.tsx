import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Contact Form Validation', () => {
  describe('Required Field Validation', () => {
    it('shows error when name field is empty and blurred', async () => {
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Focus and blur without entering value
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('shows error when email field is empty and blurred', async () => {
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/Email/);
      
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('shows error when subject field is empty and blurred', async () => {
      render(<ContactPage />);
      
      const subjectInput = screen.getByLabelText(/Subject/);
      
      fireEvent.focus(subjectInput);
      fireEvent.blur(subjectInput);
      
      await waitFor(() => {
        expect(screen.getByText('Subject is required')).toBeInTheDocument();
      });
    });

    it('shows error when message field is empty and blurred', async () => {
      render(<ContactPage />);
      
      const messageInput = screen.getByLabelText(/Message/);
      
      fireEvent.focus(messageInput);
      fireEvent.blur(messageInput);
      
      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
    });

    it('does not show error for optional phone field when empty', async () => {
      render(<ContactPage />);
      
      const phoneInput = screen.getByLabelText(/Phone/);
      
      fireEvent.focus(phoneInput);
      fireEvent.blur(phoneInput);
      
      // Wait a bit to ensure no error appears
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });
  });

  describe('Email Format Validation', () => {
    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/Email/);
      
      await user.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
    });

    it('does not show error for valid email format', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/Email/);
      
      await user.type(emailInput, 'valid@example.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
      });
    });

    it('accepts various valid email formats', async () => {
      const user = userEvent.setup();
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'test123@test-domain.com',
      ];

      for (const email of validEmails) {
        const { unmount } = render(<ContactPage />);
        const emailInput = screen.getByLabelText(/Email/);
        
        await user.type(emailInput, email);
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
          expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
        });
        
        unmount();
      }
    });
  });

  describe('Message Length Validation', () => {
    it('shows error when message is less than 10 characters', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const messageInput = screen.getByLabelText(/Message/);
      
      await user.type(messageInput, 'Short');
      fireEvent.blur(messageInput);
      
      await waitFor(() => {
        expect(screen.getByText('Message too short')).toBeInTheDocument();
      });
    });

    it('does not show error when message is 10 or more characters', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const messageInput = screen.getByLabelText(/Message/);
      
      await user.type(messageInput, 'This is a valid message with enough characters');
      fireEvent.blur(messageInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Message too short')).not.toBeInTheDocument();
      });
    });
  });

  describe('Real-time Validation', () => {
    it('clears error when user corrects invalid input', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/Email/);
      
      // Enter invalid email
      await user.type(emailInput, 'invalid');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email')).toBeInTheDocument();
      });
      
      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
      });
    });

    it('shows error immediately after blur on touched field', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      // Type and delete to make field touched
      await user.type(nameInput, 'Test');
      await user.clear(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission Validation', () => {
    it('prevents submission when required fields are empty', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      render(<ContactPage />);
      
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Subject is required')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
      
      // Form should not be submitted
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Form submitted')
      );
      
      consoleSpy.mockRestore();
    });

    it('allows submission when all required fields are valid', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/Name/), 'John Doe');
      await user.type(screen.getByLabelText(/Email/), 'john@example.com');
      await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
      await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough characters');
      
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      
      // Button should be enabled before submission
      expect(submitButton).not.toBeDisabled();
      
      // Click submit button
      fireEvent.click(submitButton);
      
      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      
      // Should show loading spinner
      expect(screen.getByRole('button').querySelector('svg.animate-spin')).toBeInTheDocument();
      
      // Should show success state after submission (check for success icon and button)
      await waitFor(() => {
        // Success icon should be visible
        const successIcon = document.querySelector('.bg-green-100');
        expect(successIcon).toBeInTheDocument();
        
        // Success button should be visible
        const successButton = screen.getAllByRole('button').find(btn => 
          btn.className.includes('bg-primary-600') && !btn.disabled
        );
        expect(successButton).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Accessibility', () => {
    it('adds aria-invalid attribute to invalid fields', async () => {
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('adds aria-describedby to link error messages', async () => {
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
    });

    it('displays visual error indicators', async () => {
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(nameInput).toHaveClass('border-red-500');
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only input as empty', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/Name/);
      
      await user.type(nameInput, '   ');
      fireEvent.blur(nameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('trims whitespace when validating message length', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const messageInput = screen.getByLabelText(/Message/);
      
      // 5 characters + spaces = still too short
      await user.type(messageInput, '  test  ');
      fireEvent.blur(messageInput);
      
      await waitFor(() => {
        expect(screen.getByText('Message too short')).toBeInTheDocument();
      });
    });

    it('validates email with special characters correctly', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const emailInput = screen.getByLabelText(/Email/);
      
      await user.type(emailInput, 'user+tag@example.com');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
      });
    });
  });
});
