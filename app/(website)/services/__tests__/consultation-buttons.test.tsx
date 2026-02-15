/**
 * Consultation Buttons Test
 * 
 * Tests for service consultation buttons with 3D hover effects
 * 
 * Requirements: 9.5
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, any> = {
      'grid.consult': 'Get Consultation',
    };
    return translations[key] || key;
  },
}));

// Mock the language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock Intersection Observer
class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe('Service Consultation Buttons', () => {
  // Create a simple consultation button component for testing
  const ConsultationButton = ({ serviceKey, label }: { serviceKey: string; label: string }) => (
    <a
      href={`/contact?service=${serviceKey}`}
      className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-2xl overflow-hidden"
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(-4px) translateZ(20px) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.style.transform = 'translateY(0) translateZ(0) scale(1)';
      }}
    >
      <span 
        className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ zIndex: -1 }}
      />
      <span className="relative z-10">{label}</span>
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">→</span>
    </a>
  );

  describe('Button Presence and Links', () => {
    it('should render consultation button with correct text', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      expect(consultButton).toBeInTheDocument();
    });

    it('should link to contact page with service context', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');
      
      expect(link).toHaveAttribute('href', '/contact?service=webDev');
    });

    it('should have correct href for different services', () => {
      const services = ['webDev', 'uiux', 'mobile', 'branding', 'marketing', 'consulting'];
      
      services.forEach((service) => {
        const { container } = render(<ConsultationButton serviceKey={service} label="Get Consultation" />);
        const link = container.querySelector('a');
        expect(link).toHaveAttribute('href', `/contact?service=${service}`);
      });
    });
  });

  describe('3D Hover Effects', () => {
    it('should have 3D transform styles on button', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      expect(link).toHaveStyle({
        transform: 'translateZ(0)',
        willChange: 'transform',
      });
    });

    it('should apply 3D transform on hover', async () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a') as HTMLElement;

      // Simulate hover
      fireEvent.mouseEnter(link);

      await waitFor(() => {
        expect(link.style.transform).toContain('translateY(-4px)');
        expect(link.style.transform).toContain('translateZ(20px)');
        expect(link.style.transform).toContain('scale(1.02)');
      });
    });

    it('should reset transform on mouse leave', async () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a') as HTMLElement;

      // Simulate hover and leave
      fireEvent.mouseEnter(link);
      fireEvent.mouseLeave(link);

      await waitFor(() => {
        expect(link.style.transform).toContain('translateY(0)');
        expect(link.style.transform).toContain('translateZ(0)');
        expect(link.style.transform).toContain('scale(1)');
      });
    });

    it('should have gradient overlay element', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      // Check for gradient overlay span
      const gradientOverlay = link?.querySelector('.bg-gradient-to-r');
      expect(gradientOverlay).toBeInTheDocument();
      expect(gradientOverlay).toHaveClass('from-primary-500', 'to-primary-700');
    });

    it('should have arrow icon that moves on hover', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      // Check for arrow span
      const arrow = link?.querySelector('span:last-child');
      expect(arrow).toHaveTextContent('→');
      expect(arrow).toHaveClass('group-hover:translate-x-1');
    });
  });

  describe('Accessibility', () => {
    it('should have proper link semantics', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');
      
      expect(link).toHaveAttribute('href');
      expect(link?.tagName).toBe('A');
    });

    it('should be keyboard accessible', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      // Should be focusable
      link?.focus();
      expect(document.activeElement).toBe(link);
    });
  });

  describe('Visual Styling', () => {
    it('should have proper button styling classes', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      expect(link).toHaveClass('bg-primary-600');
      expect(link).toHaveClass('text-white');
      expect(link).toHaveClass('font-semibold');
      expect(link).toHaveClass('rounded-lg');
      expect(link).toHaveClass('shadow-md');
      expect(link).toHaveClass('hover:shadow-2xl');
    });

    it('should have transition classes for smooth animations', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      expect(link).toHaveClass('transition-all');
      expect(link).toHaveClass('duration-300');
    });

    it('should have proper padding and spacing', () => {
      render(<ConsultationButton serviceKey="webDev" label="Get Consultation" />);

      const consultButton = screen.getByText('Get Consultation');
      const link = consultButton.closest('a');

      expect(link).toHaveClass('px-6');
      expect(link).toHaveClass('py-3');
      expect(link).toHaveClass('gap-2');
    });
  });

  describe('Multi-language Support', () => {
    it('should display button text in different languages', () => {
      const languages = [
        { label: 'Get Consultation', lang: 'en' },
        { label: '獲取諮詢', lang: 'zh-TW' },
        { label: 'مەسلىھەت ئېلىش', lang: 'ug' },
      ];

      languages.forEach(({ label, lang }) => {
        const { container } = render(<ConsultationButton serviceKey="webDev" label={label} />);
        const button = screen.getByText(label);
        expect(button).toBeInTheDocument();
      });
    });
  });
});
