import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Footer } from './Footer';
import type { Footer as FooterType } from '@/types/website';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock footer data
const mockFooterData: FooterType = {
  companyInfo: {
    name: 'Professional Services',
    description: 'We provide expert solutions for your business needs.',
    logo: '/logo.svg',
  },
  sections: [
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Cases', href: '/cases' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
  ],
  contactInfo: {
    email: 'contact@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
    businessHours: [
      {
        day: 'Monday',
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false,
      },
    ],
  },
  socialLinks: [
    {
      platform: 'facebook',
      url: 'https://facebook.com',
      icon: 'facebook',
      label: 'Facebook',
    },
    {
      platform: 'twitter',
      url: 'https://twitter.com',
      icon: 'twitter',
      label: 'Twitter',
    },
  ],
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  newsletter: {
    title: 'Subscribe to Our Newsletter',
    description: 'Get the latest updates delivered to your inbox.',
    placeholder: 'Enter your email',
  },
  copyright: '© 2024 Professional Services. All rights reserved.',
};

describe('Footer Component', () => {
  describe('Rendering', () => {
    it('should render footer element', () => {
      render(<Footer data={mockFooterData} />);
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should render company info section', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-company-info')).toBeInTheDocument();
      expect(screen.getByText('Professional Services')).toBeInTheDocument();
      expect(
        screen.getByText('We provide expert solutions for your business needs.')
      ).toBeInTheDocument();
    });

    it('should render company logo', () => {
      render(<Footer data={mockFooterData} />);
      const logo = screen.getByTestId('footer-logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.svg');
      expect(logo).toHaveAttribute('alt', 'Professional Services');
    });

    it('should not render logo if not provided', () => {
      const dataWithoutLogo = { ...mockFooterData, companyInfo: { ...mockFooterData.companyInfo, logo: undefined } };
      render(<Footer data={dataWithoutLogo} />);
      expect(screen.queryByTestId('footer-logo')).not.toBeInTheDocument();
    });

    it('should render all footer sections', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-section-0')).toBeInTheDocument();
      expect(screen.getByTestId('footer-section-1')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('should render all footer links', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-link-Company-About Us')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Company-Services')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Company-Cases')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Support-Contact Us')).toBeInTheDocument();
      expect(screen.getByTestId('footer-link-Support-FAQ')).toBeInTheDocument();
    });

    it('should render contact info section', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-contact-info')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render email link', () => {
      render(<Footer data={mockFooterData} />);
      const emailLink = screen.getByTestId('footer-email');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:contact@example.com');
      expect(emailLink).toHaveTextContent('contact@example.com');
    });

    it('should render phone link', () => {
      render(<Footer data={mockFooterData} />);
      const phoneLink = screen.getByTestId('footer-phone');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+1 (555) 123-4567');
      expect(phoneLink).toHaveTextContent('+1 (555) 123-4567');
    });

    it('should render address', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-address')).toHaveTextContent(
        '123 Business Street, City, State 12345'
      );
    });

    it('should render copyright information', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-copyright')).toHaveTextContent(
        '© 2024 Professional Services. All rights reserved.'
      );
    });

    it('should render all legal links', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-legal-link-Privacy Policy')).toBeInTheDocument();
      expect(screen.getByTestId('footer-legal-link-Terms of Service')).toBeInTheDocument();
    });

    it('should render social media links', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-social-links')).toBeInTheDocument();
      expect(screen.getByTestId('footer-social-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('footer-social-twitter')).toBeInTheDocument();
    });

    it('should render social links with correct attributes', () => {
      render(<Footer data={mockFooterData} />);
      const facebookLink = screen.getByTestId('footer-social-facebook');
      expect(facebookLink).toHaveAttribute('href', 'https://facebook.com');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(facebookLink).toHaveAttribute('aria-label', 'Facebook');
    });
  });

  describe('Newsletter Subscription', () => {
    it('should render newsletter section', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-newsletter')).toBeInTheDocument();
      expect(screen.getByText('Subscribe to Our Newsletter')).toBeInTheDocument();
      expect(
        screen.getByText('Get the latest updates delivered to your inbox.')
      ).toBeInTheDocument();
    });

    it('should render newsletter form', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-newsletter-form')).toBeInTheDocument();
      expect(screen.getByTestId('footer-newsletter-input')).toBeInTheDocument();
      expect(screen.getByTestId('footer-newsletter-button')).toBeInTheDocument();
    });

    it('should render newsletter input with correct placeholder', () => {
      render(<Footer data={mockFooterData} />);
      const input = screen.getByTestId('footer-newsletter-input');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
    });

    it('should not render newsletter section if not provided', () => {
      const dataWithoutNewsletter = { ...mockFooterData, newsletter: undefined };
      render(<Footer data={dataWithoutNewsletter} />);
      expect(screen.queryByTestId('footer-newsletter')).not.toBeInTheDocument();
    });

    it('should show error when email is empty', async () => {
      render(<Footer data={mockFooterData} />);
      const button = screen.getByTestId('footer-newsletter-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('footer-newsletter-error')).toHaveTextContent(
          'Email is required'
        );
      });
    });

    it('should show error for invalid email format', () => {
      render(<Footer data={mockFooterData} />);
      const form = screen.getByTestId('footer-newsletter-form');
      const input = screen.getByTestId('footer-newsletter-input');

      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.submit(form);

      const error = screen.getByTestId('footer-newsletter-error');
      expect(error).toHaveTextContent('Please enter a valid email address');
    });

    it('should accept valid email format', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(void 0);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should clear error when user starts typing', async () => {
      render(<Footer data={mockFooterData} />);
      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('footer-newsletter-error')).toBeInTheDocument();
      });

      fireEvent.change(input, { target: { value: 'test@example.com' } });

      await waitFor(() => {
        expect(screen.queryByTestId('footer-newsletter-error')).not.toBeInTheDocument();
      });
    });

    it('should show success message after successful submission', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('footer-newsletter-success')).toHaveTextContent(
          'Thank you for subscribing!'
        );
      });
    });

    it('should clear email input after successful submission', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input') as HTMLInputElement;
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should disable button while submitting', async () => {
      const mockSubmit = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
          })
      );
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      expect(button).toBeDisabled();

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should show error message on submission failure', async () => {
      const mockSubmit = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock<Promise<void>, [string]>;
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByTestId('footer-newsletter-error')).toHaveTextContent(
            'Network error'
          );
        },
        { timeout: 2000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      render(<Footer data={mockFooterData} />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('should have aria-label on newsletter input', () => {
      render(<Footer data={mockFooterData} />);
      const input = screen.getByTestId('footer-newsletter-input');
      expect(input).toHaveAttribute('aria-label', 'Newsletter email');
    });

    it('should have aria-label on social links', () => {
      render(<Footer data={mockFooterData} />);
      const facebookLink = screen.getByTestId('footer-social-facebook');
      expect(facebookLink).toHaveAttribute('aria-label', 'Facebook');
    });

    it('should have role alert on error messages', async () => {
      render(<Footer data={mockFooterData} />);
      const button = screen.getByTestId('footer-newsletter-button');
      fireEvent.click(button);

      await waitFor(() => {
        const error = screen.getByTestId('footer-newsletter-error');
        expect(error).toHaveAttribute('role', 'alert');
      });
    });

    it('should have role status on success messages', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        const success = screen.getByTestId('footer-newsletter-success');
        expect(success).toHaveAttribute('role', 'status');
      });
    });

    it('should have sr-only text for social icons', () => {
      render(<Footer data={mockFooterData} />);
      const srText = screen.getAllByText('Facebook');
      expect(srText.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive grid layout', () => {
      render(<Footer data={mockFooterData} />);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('bg-slate-900', 'text-white');
    });

    it('should have responsive padding', () => {
      render(<Footer data={mockFooterData} />);
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      // Check for responsive classes in parent divs
      const mainContent = footer.querySelector('[class*="max-w-7xl"]');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should have correct href for footer links', () => {
      render(<Footer data={mockFooterData} />);
      const aboutLink = screen.getByTestId('footer-link-Company-About Us');
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should have correct href for legal links', () => {
      render(<Footer data={mockFooterData} />);
      const privacyLink = screen.getByTestId('footer-legal-link-Privacy Policy');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should have correct href for social links', () => {
      render(<Footer data={mockFooterData} />);
      const twitterLink = screen.getByTestId('footer-social-twitter');
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
    });
  });

  describe('Empty States', () => {
    it('should handle empty sections array', () => {
      const dataWithEmptySections = { ...mockFooterData, sections: [] };
      render(<Footer data={dataWithEmptySections} />);
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should handle empty social links array', () => {
      const dataWithoutSocial = { ...mockFooterData, socialLinks: [] };
      render(<Footer data={dataWithoutSocial} />);
      expect(screen.getByTestId('footer-social-links')).toBeInTheDocument();
    });

    it('should handle empty legal links array', () => {
      const dataWithoutLegal = { ...mockFooterData, legalLinks: [] };
      render(<Footer data={dataWithoutLegal} />);
      expect(screen.getByTestId('footer-bottom')).toBeInTheDocument();
    });
  });

  describe('Data Validation', () => {
    it('should display all provided footer sections', () => {
      const dataWithMultipleSections = {
        ...mockFooterData,
        sections: [
          ...mockFooterData.sections,
          {
            title: 'Resources',
            links: [
              { label: 'Blog', href: '/blog' },
              { label: 'Docs', href: '/docs' },
            ],
          },
        ],
      };
      render(<Footer data={dataWithMultipleSections} />);
      expect(screen.getByText('Resources')).toBeInTheDocument();
    });

    it('should display all provided social links', () => {
      const dataWithMoreSocial = {
        ...mockFooterData,
        socialLinks: [
          ...mockFooterData.socialLinks,
          {
            platform: 'linkedin' as const,
            url: 'https://linkedin.com',
            icon: 'linkedin',
            label: 'LinkedIn',
          },
        ],
      };
      render(<Footer data={dataWithMoreSocial} />);
      expect(screen.getByTestId('footer-social-linkedin')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onNewsletterSubmit with email when form is submitted', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'user@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith('user@example.com');
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onNewsletterSubmit if email is invalid', async () => {
      const mockSubmit = jest.fn();
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled();
      });
    });

    it('should handle submission without onNewsletterSubmit callback', async () => {
      render(<Footer data={mockFooterData} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('footer-newsletter-success')).toBeInTheDocument();
      });
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email formats', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'first+last@example.com',
      ];

      for (const email of validEmails) {
        const input = screen.getByTestId('footer-newsletter-input') as HTMLInputElement;
        const button = screen.getByTestId('footer-newsletter-button');

        fireEvent.change(input, { target: { value: email } });
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockSubmit).toHaveBeenCalledWith(email);
        });

        // Reset for next iteration
        mockSubmit.mockClear();
        fireEvent.change(input, { target: { value: '' } });
      }
    });

    it('should reject invalid email formats', () => {
      render(<Footer data={mockFooterData} />);

      const form = screen.getByTestId('footer-newsletter-form');
      const input = screen.getByTestId('footer-newsletter-input');

      fireEvent.change(input, { target: { value: 'invalid-email' } });
      fireEvent.submit(form);

      const error = screen.getByTestId('footer-newsletter-error');
      expect(error).toHaveTextContent('Please enter a valid email address');
    });
  });

  describe('Button States', () => {
    it('should show correct button text when not submitting', () => {
      render(<Footer data={mockFooterData} />);
      const button = screen.getByTestId('footer-newsletter-button');
      expect(button).toHaveTextContent('Subscribe');
    });

    it('should show loading text while submitting', async () => {
      const mockSubmit = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100);
          })
      );
      render(<Footer data={mockFooterData} onNewsletterSubmit={mockSubmit} />);

      const input = screen.getByTestId('footer-newsletter-input');
      const button = screen.getByTestId('footer-newsletter-button');

      fireEvent.change(input, { target: { value: 'test@example.com' } });
      fireEvent.click(button);

      expect(button).toHaveTextContent('Subscribing...');

      await waitFor(() => {
        expect(button).toHaveTextContent('Subscribe');
      });
    });
  });

  describe('Bottom Footer Section', () => {
    it('should render bottom footer section', () => {
      render(<Footer data={mockFooterData} />);
      expect(screen.getByTestId('footer-bottom')).toBeInTheDocument();
    });

    it('should display copyright and legal links in bottom section', () => {
      render(<Footer data={mockFooterData} />);
      const bottom = screen.getByTestId('footer-bottom');
      expect(bottom).toHaveTextContent('© 2024 Professional Services. All rights reserved.');
      expect(bottom).toHaveTextContent('Privacy Policy');
      expect(bottom).toHaveTextContent('Terms of Service');
    });
  });
});
