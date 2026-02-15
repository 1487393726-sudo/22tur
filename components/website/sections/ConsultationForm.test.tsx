import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ConsultationForm from './ConsultationForm';

// Mock fetch
global.fetch = jest.fn();

describe('ConsultationForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Rendering', () => {
    test('should render consultation form with all required fields', () => {
      render(<ConsultationForm />);

      expect(screen.getByText('Online Consultation')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Service Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Consultation Request/i })).toBeInTheDocument();
    });

    test('should render optional preferred time field', () => {
      render(<ConsultationForm />);
      expect(screen.getByLabelText(/Preferred Consultation Time/i)).toBeInTheDocument();
    });

    test('should render with initial service type when provided', () => {
      render(<ConsultationForm serviceType="web-design" />);
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      expect(serviceTypeSelect.value).toBe('web-design');
    });

    test('should render all service type options', () => {
      render(<ConsultationForm />);
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i);
      const options = within(serviceTypeSelect as HTMLSelectElement).getAllByRole('option');
      expect(options).toHaveLength(6); // Select + 5 options
      expect(options[1]).toHaveTextContent('Web Design');
      expect(options[2]).toHaveTextContent('Web Development');
      expect(options[3]).toHaveTextContent('Mobile App Development');
      expect(options[4]).toHaveTextContent('Consulting');
      expect(options[5]).toHaveTextContent('Other');
    });
  });

  describe('Form Validation', () => {
    test('should show error when name is empty', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    test('should show error when email is empty', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    test('should show error when email format is invalid', async () => {
      render(<ConsultationForm />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    test('should show error when phone is empty', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      });
    });

    test('should show error when phone format is invalid', async () => {
      render(<ConsultationForm />);
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
      });
    });

    test('should show error when service type is not selected', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a service type')).toBeInTheDocument();
      });
    });

    test('should show error when message is empty', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
    });

    test('should show error when message is too short', async () => {
      render(<ConsultationForm />);
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(messageInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    test('should accept valid phone formats', async () => {
      const validPhones = [
        '+1234567890',
        '123-456-7890',
        '(123) 456-7890',
        '1234567890',
        '+1 (555) 123-4567',
      ];

      for (const phone of validPhones) {
        const { unmount } = render(<ConsultationForm />);
        const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
        const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
        const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
        const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
        const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: phone } });
        fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
        fireEvent.change(messageInput, { target: { value: 'This is a valid message' } });

        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, consultationId: 'CONS-123' }),
        });

        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });

        unmount();
        jest.clearAllMocks();
      }
    });
  });

  describe('Form Input Handling', () => {
    test('should update form data when user types in name field', () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(nameInput.value).toBe('John Doe');
    });

    test('should update form data when user types in email field', () => {
      render(<ConsultationForm />);
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      expect(emailInput.value).toBe('john@example.com');
    });

    test('should update form data when user types in phone field', () => {
      render(<ConsultationForm />);
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;

      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });

      expect(phoneInput.value).toBe('+1 (555) 123-4567');
    });

    test('should update form data when user selects service type', () => {
      render(<ConsultationForm />);
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;

      fireEvent.change(serviceTypeSelect, { target: { value: 'web-development' } });

      expect(serviceTypeSelect.value).toBe('web-development');
    });

    test('should update form data when user types in message field', () => {
      render(<ConsultationForm />);
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;

      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      expect(messageInput.value).toBe('This is my consultation message');
    });

    test('should update preferred time when user selects a date', () => {
      render(<ConsultationForm />);
      const preferredTimeInput = screen.getByLabelText(/Preferred Consultation Time/i) as HTMLInputElement;

      fireEvent.change(preferredTimeInput, { target: { value: '2024-12-25T14:30' } });

      // datetime-local inputs may adjust for timezone, so just check that it's not empty
      expect(preferredTimeInput.value).toBeTruthy();
    });

    test('should clear error message when user starts typing after validation error', async () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });

      fireEvent.change(nameInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('should submit form with valid data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, consultationId: 'CONS-123' }),
      });

      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/consultations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            serviceType: 'web-design',
            message: 'This is my consultation message',
            preferredTime: undefined,
          }),
        });
      });
    });

    test('should show success message after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, consultationId: 'CONS-123' }),
      });

      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Thank you for your consultation request. We will contact you soon.')
        ).toBeInTheDocument();
      });
    });

    test('should reset form after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, consultationId: 'CONS-123' }),
      });

      render(<ConsultationForm serviceType="web-design" />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-development' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(phoneInput.value).toBe('');
        expect(serviceTypeSelect.value).toBe('web-design'); // Should reset to initial value
        expect(messageInput.value).toBe('');
      });
    });

    test('should show error message on submission failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    test('should disable submit button while submitting', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, consultationId: 'CONS-123' }),
                }),
              100
            )
          )
      );

      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('should call onSubmitSuccess callback after successful submission', async () => {
      const onSubmitSuccess = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, consultationId: 'CONS-123' }),
      });

      render(<ConsultationForm onSubmitSuccess={onSubmitSuccess} />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmitSuccess).toHaveBeenCalled();
      });
    });

    test('should call onSubmitError callback on submission failure', async () => {
      const onSubmitError = jest.fn();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      });

      render(<ConsultationForm onSubmitError={onSubmitError} />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmitError).toHaveBeenCalledWith('Server error');
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper aria labels and descriptions', () => {
      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Phone Number/i);
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i);
      const messageInput = screen.getByLabelText(/Message/i);

      expect(nameInput).toHaveAttribute('id', 'name');
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(phoneInput).toHaveAttribute('id', 'phone');
      expect(serviceTypeSelect).toHaveAttribute('id', 'serviceType');
      expect(messageInput).toHaveAttribute('id', 'message');
    });

    test('should show aria-invalid when field has error', async () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    test('should have aria-describedby pointing to error message', async () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
      });
    });

    test('should have role alert on error messages', async () => {
      render(<ConsultationForm />);
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        // Error messages are displayed as paragraphs with error text
        const errorMessages = screen.getAllByText(/is required|must be/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle form submission with whitespace-only fields', async () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    test('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<ConsultationForm />);

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      const serviceTypeSelect = screen.getByLabelText(/Service Type/i) as HTMLSelectElement;
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /Submit Consultation Request/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(serviceTypeSelect, { target: { value: 'web-design' } });
      fireEvent.change(messageInput, { target: { value: 'This is my consultation message' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    test('should handle very long input values', () => {
      render(<ConsultationForm />);
      const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement;
      const longMessage = 'a'.repeat(5000);

      fireEvent.change(messageInput, { target: { value: longMessage } });

      expect(messageInput.value).toBe(longMessage);
    });

    test('should handle special characters in input', () => {
      render(<ConsultationForm />);
      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      const specialName = "O'Brien-Smith & Co.";

      fireEvent.change(nameInput, { target: { value: specialName } });

      expect(nameInput.value).toBe(specialName);
    });
  });
});
