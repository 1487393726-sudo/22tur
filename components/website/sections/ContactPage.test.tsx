import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContactPage } from './ContactPage';
import { ContactPage as ContactPageType } from '@/types/website';

// Mock data
const mockContactPageData: ContactPageType = {
  contactForm: {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  },
  contactInfo: {
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, Suite 100, City, State 12345',
    businessHours: [
      { day: 'Monday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Tuesday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Wednesday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Thursday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Friday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Saturday', openTime: '10:00 AM', closeTime: '04:00 PM', isClosed: false },
      { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
    ],
  },
  mapLocation: {
    latitude: 40.7128,
    longitude: -74.006,
    address: '123 Business Street, Suite 100, City, State 12345',
    businessHours: [
      { day: 'Monday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Tuesday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Wednesday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Thursday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Friday', openTime: '09:00 AM', closeTime: '06:00 PM', isClosed: false },
      { day: 'Saturday', openTime: '10:00 AM', closeTime: '04:00 PM', isClosed: false },
      { day: 'Sunday', openTime: '00:00', closeTime: '00:00', isClosed: true },
    ],
  },
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/example', icon: 'f', label: 'Facebook' },
    { platform: 'twitter', url: 'https://twitter.com/example', icon: '𝕏', label: 'Twitter' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/example', icon: 'in', label: 'LinkedIn' },
  ],
};

describe('ContactPage Component', () => {
  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('should display the main heading', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    it('should display the contact form', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('should display all form fields', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByTestId('name-input')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('phone-input')).toBeInTheDocument();
      expect(screen.getByTestId('subject-input')).toBeInTheDocument();
      expect(screen.getByTestId('message-input')).toBeInTheDocument();
    });

    it('should display contact information section', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
    });

    it('should display email address', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('contact@example.com')).toBeInTheDocument();
    });

    it('should display phone number', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    });

    it('should display address', () => {
      render(<ContactPage data={mockContactPageData} />);
      const addresses = screen.getAllByText('123 Business Street, Suite 100, City, State 12345');
      expect(addresses.length).toBeGreaterThan(0);
    });

    it('should display business hours', () => {
      render(<ContactPage data={mockContactPageData} />);
      const mondayElements = screen.getAllByText('Monday');
      expect(mondayElements.length).toBeGreaterThan(0);
      const hoursElements = screen.getAllByText('09:00 AM - 06:00 PM');
      expect(hoursElements.length).toBeGreaterThan(0);
    });

    it('should display map section', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Our Location')).toBeInTheDocument();
    });

    it('should display social links section', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });

    it('should display all social links', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByTestId('social-link-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-linkedin')).toBeInTheDocument();
    });
  });

  describe('Contact Information Display', () => {
    it('should display email as clickable link', () => {
      render(<ContactPage data={mockContactPageData} />);
      const emailLink = screen.getByRole('link', { name: 'contact@example.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@example.com');
    });

    it('should display phone as clickable link', () => {
      render(<ContactPage data={mockContactPageData} />);
      const phoneLink = screen.getByRole('link', { name: '+1 (555) 123-4567' });
      expect(phoneLink).toHaveAttribute('href', 'tel:+1 (555) 123-4567');
    });

    it('should display all business hours', () => {
      render(<ContactPage data={mockContactPageData} />);
      mockContactPageData.contactInfo.businessHours.forEach((hours) => {
        expect(screen.getAllByText(hours.day).length).toBeGreaterThan(0);
      });
    });

    it('should display closed status for closed days', () => {
      render(<ContactPage data={mockContactPageData} />);
      const closedElements = screen.getAllByText('Closed');
      expect(closedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
      });
    });

    it('should show error when email is empty', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument();
      });
    });

    it('should show error when phone is empty', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('phone-error')).toBeInTheDocument();
      });
    });

    it('should show error when phone is invalid', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const phoneInput = screen.getByTestId('phone-input');
      fireEvent.change(phoneInput, { target: { value: 'invalid phone' } });
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('phone-error')).toBeInTheDocument();
      });
    });

    it('should show error when subject is empty', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('subject-error')).toBeInTheDocument();
      });
    });

    it('should show error when message is empty', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('message-error')).toBeInTheDocument();
      });
    });

    it('should accept valid email formats', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should accept valid phone formats', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const phoneInput = screen.getByTestId('phone-input');
      fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } });
      expect(phoneInput).toHaveValue('+1 (555) 123-4567');
    });

    it('should clear error when user starts typing', async () => {
      render(<ContactPage data={mockContactPageData} />);
      const nameInput = screen.getByTestId('name-input');
      const submitButton = screen.getByTestId('submit-button');
      
      fireEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByTestId('name-error')).toBeInTheDocument();
      });

      fireEvent.change(nameInput, { target: { value: 'John' } });
      await waitFor(() => {
        expect(screen.queryByTestId('name-error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onFormSubmit with valid data', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          subject: 'Inquiry',
          message: 'Hello',
        });
      });
    });

    it('should show success message on successful submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });

    it('should clear form after successful submission', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect((screen.getByTestId('name-input') as HTMLInputElement).value).toBe('');
        expect((screen.getByTestId('email-input') as HTMLInputElement).value).toBe('');
      });
    });

    it('should show error message on submission failure', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Network error'));
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });
    });

    it('should disable submit button while submitting', async () => {
      const mockOnSubmit = jest.fn(
        () => new Promise<void>((resolve) => setTimeout(resolve, 100))
      );
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });

    it('should handle missing onFormSubmit callback', async () => {
      render(<ContactPage data={mockContactPageData} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument();
      });
    });
  });

  describe('Map Display', () => {
    it('should display map container', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('should display location details', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByTestId('location-address')).toBeInTheDocument();
      expect(screen.getByTestId('location-coordinates')).toBeInTheDocument();
    });

    it('should display coordinates correctly', () => {
      render(<ContactPage data={mockContactPageData} />);
      const coordinateElements = screen.getAllByText(/40\.7128.*-74\.006/);
      expect(coordinateElements.length).toBeGreaterThan(0);
    });

    it('should display get directions button', () => {
      render(<ContactPage data={mockContactPageData} />);
      const directionsButton = screen.getByTestId('get-directions-button');
      expect(directionsButton).toBeInTheDocument();
      expect(directionsButton).toHaveAttribute('target', '_blank');
    });

    it('should have correct Google Maps URL', () => {
      render(<ContactPage data={mockContactPageData} />);
      const directionsButton = screen.getByTestId('get-directions-button');
      expect(directionsButton).toHaveAttribute(
        'href',
        expect.stringContaining('maps.google.com')
      );
    });

    it('should not display map section when mapLocation is null', () => {
      const dataWithoutMap: ContactPageType = {
        ...mockContactPageData,
        mapLocation: null as any,
      };
      render(<ContactPage data={dataWithoutMap} />);
      expect(screen.queryByText('Our Location')).not.toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    it('should display all social links', () => {
      render(<ContactPage data={mockContactPageData} />);
      mockContactPageData.socialLinks.forEach((link) => {
        expect(screen.getByTestId(`social-link-${link.platform}`)).toBeInTheDocument();
      });
    });

    it('should have correct social link URLs', () => {
      render(<ContactPage data={mockContactPageData} />);
      const facebookLink = screen.getByTestId('social-link-facebook');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/example');
    });

    it('should open social links in new tab', () => {
      render(<ContactPage data={mockContactPageData} />);
      const facebookLink = screen.getByTestId('social-link-facebook');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not display social links section when empty', () => {
      const dataWithoutSocial: ContactPageType = {
        ...mockContactPageData,
        socialLinks: [],
      };
      render(<ContactPage data={dataWithoutSocial} />);
      expect(screen.queryByText('Follow Us')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<ContactPage data={mockContactPageData} />);
      const mainGrid = container.querySelector('.grid');
      expect(mainGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
    });

    it('should have responsive map grid', () => {
      const { container } = render(<ContactPage data={mockContactPageData} />);
      const mapGrid = container.querySelectorAll('.grid')[1];
      expect(mapGrid).toHaveClass('grid-cols-1', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      render(<ContactPage data={mockContactPageData} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Get in Touch');
    });

    it('should have proper alert roles for messages', () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      render(<ContactPage data={mockContactPageData} onFormSubmit={mockOnSubmit} />);

      fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByTestId('phone-input'), { target: { value: '+1 (555) 123-4567' } });
      fireEvent.change(screen.getByTestId('subject-input'), { target: { value: 'Inquiry' } });
      fireEvent.change(screen.getByTestId('message-input'), { target: { value: 'Hello' } });

      fireEvent.click(screen.getByTestId('submit-button'));

      waitFor(() => {
        const alert = screen.getByTestId('success-message');
        expect(alert).toHaveAttribute('role', 'alert');
      });
    });

    it('should have aria-hidden for decorative icons', () => {
      const { container } = render(<ContactPage data={mockContactPageData} />);
      const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(decorativeElements.length).toBeGreaterThan(0);
    });

    it('should have screen reader text for social links', () => {
      render(<ContactPage data={mockContactPageData} />);
      const facebookLink = screen.getByTestId('social-link-facebook');
      expect(facebookLink).toHaveAttribute('title', 'Facebook');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email addresses', () => {
      render(<ContactPage data={mockContactPageData} />);
      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, {
        target: { value: 'verylongemailaddress@verylongdomainname.com' },
      });
      expect(emailInput).toHaveValue('verylongemailaddress@verylongdomainname.com');
    });

    it('should handle very long messages', () => {
      render(<ContactPage data={mockContactPageData} />);
      const messageInput = screen.getByTestId('message-input');
      const longMessage = 'A'.repeat(1000);
      fireEvent.change(messageInput, { target: { value: longMessage } });
      expect(messageInput).toHaveValue(longMessage);
    });

    it('should handle special characters in form fields', () => {
      render(<ContactPage data={mockContactPageData} />);
      const nameInput = screen.getByTestId('name-input');
      fireEvent.change(nameInput, { target: { value: "O'Brien & Sons" } });
      expect(nameInput).toHaveValue("O'Brien & Sons");
    });

    it('should handle multiple business hours', () => {
      render(<ContactPage data={mockContactPageData} />);
      mockContactPageData.contactInfo.businessHours.forEach((hours) => {
        expect(screen.getAllByText(hours.day).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Dark Mode', () => {
    it('should have dark mode classes', () => {
      const { container } = render(<ContactPage data={mockContactPageData} />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('dark:bg-gray-900');
    });
  });

  describe('Content Completeness', () => {
    it('should display all required sections', () => {
      render(<ContactPage data={mockContactPageData} />);
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Our Location')).toBeInTheDocument();
      expect(screen.getByText('Follow Us')).toBeInTheDocument();
    });
  });
});
