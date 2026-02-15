import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroBanner } from './HeroBanner';
import type { HeroBanner as HeroBannerType } from '@/types/website';

describe('HeroBanner Component', () => {
  const mockHeroBannerData: HeroBannerType = {
    title: 'Welcome to Our Services',
    subtitle: 'Professional solutions for your business needs',
    ctaButton: {
      text: 'Get Started',
      href: '/contact',
      variant: 'primary',
    },
    ctaButtonSecondary: {
      text: 'Learn More',
      href: '/about',
      variant: 'secondary',
    },
  };

  describe('Rendering', () => {
    it('should render the hero banner section', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const section = screen.getByTestId('hero-banner');
      expect(section).toBeInTheDocument();
    });

    it('should display the title', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const title = screen.getByTestId('hero-title');
      expect(title).toHaveTextContent('Welcome to Our Services');
    });

    it('should display the subtitle', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const subtitle = screen.getByTestId('hero-subtitle');
      expect(subtitle).toHaveTextContent('Professional solutions for your business needs');
    });

    it('should render primary CTA button', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton).toHaveTextContent('Get Started');
      expect(primaryButton).toHaveAttribute('href', '/contact');
    });

    it('should render secondary CTA button when provided', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const secondaryButton = screen.getByTestId('hero-cta-secondary');
      expect(secondaryButton).toHaveTextContent('Learn More');
      expect(secondaryButton).toHaveAttribute('href', '/about');
    });

    it('should not render secondary button when not provided', () => {
      const dataWithoutSecondary: HeroBannerType = {
        ...mockHeroBannerData,
        ctaButtonSecondary: undefined,
      };
      render(<HeroBanner data={dataWithoutSecondary} />);
      const secondaryButton = screen.queryByTestId('hero-cta-secondary');
      expect(secondaryButton).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const title = screen.getByTestId('hero-title');
      expect(title).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl');
    });

    it('should have responsive button layout', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const buttonContainer = screen.getByTestId('hero-buttons');
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('should have responsive padding on content', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const contentContainer = screen.getByTestId('hero-content');
      expect(contentContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('Styling', () => {
    it('should have brand color background', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const section = screen.getByTestId('hero-banner');
      expect(section).toHaveClass('bg-gradient-to-br', 'from-[#1E3A5F]');
    });

    it('should have proper text colors', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const title = screen.getByTestId('hero-title');
      expect(title).toHaveClass('text-white');
    });

    it('should apply custom className', () => {
      render(<HeroBanner data={mockHeroBannerData} className="custom-class" />);
      const section = screen.getByTestId('hero-banner');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Button Functionality', () => {
    it('primary button should have correct href', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton).toHaveAttribute('href', '/contact');
    });

    it('secondary button should have correct href', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const secondaryButton = screen.getByTestId('hero-cta-secondary');
      expect(secondaryButton).toHaveAttribute('href', '/about');
    });

    it('buttons should have hover effects', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton).toHaveClass('hover:bg-gray-100', 'hover:shadow-xl');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const title = screen.getByTestId('hero-title');
      expect(title.tagName).toBe('H1');
    });

    it('should have descriptive button text', () => {
      render(<HeroBanner data={mockHeroBannerData} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton.textContent).toBeTruthy();
      expect(primaryButton.textContent).not.toBe('');
    });

    it('should have alt text for background image when provided', () => {
      const dataWithImage: HeroBannerType = {
        ...mockHeroBannerData,
        backgroundImage: '/hero-bg.jpg',
      };
      render(<HeroBanner data={dataWithImage} />);
      // Image component should be rendered with alt text
      const images = screen.getAllByAltText('Hero background');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty button text gracefully', () => {
      const dataWithEmptyText: HeroBannerType = {
        ...mockHeroBannerData,
        ctaButton: {
          ...mockHeroBannerData.ctaButton,
          text: '',
        },
      };
      render(<HeroBanner data={dataWithEmptyText} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton).toBeInTheDocument();
    });

    it('should handle missing href gracefully', () => {
      const dataWithoutHref: HeroBannerType = {
        ...mockHeroBannerData,
        ctaButton: {
          ...mockHeroBannerData.ctaButton,
          href: undefined,
        },
      };
      render(<HeroBanner data={dataWithoutHref} />);
      const primaryButton = screen.getByTestId('hero-cta-primary');
      expect(primaryButton).toHaveAttribute('href', '#');
    });

    it('should render with minimal data', () => {
      const minimalData: HeroBannerType = {
        title: 'Title',
        subtitle: 'Subtitle',
        ctaButton: {
          text: 'Button',
        },
      };
      render(<HeroBanner data={minimalData} />);
      expect(screen.getByTestId('hero-title')).toBeInTheDocument();
      expect(screen.getByTestId('hero-subtitle')).toBeInTheDocument();
      expect(screen.getByTestId('hero-cta-primary')).toBeInTheDocument();
    });
  });
});
