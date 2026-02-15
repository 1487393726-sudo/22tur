/**
 * CTASection Component Unit Tests
 * 
 * Tests for the CTA section component with glass morphism and 3D effects
 * Requirements: 7.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CTASection } from '../CTASection';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock FadeInView component
jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right-icon">→</span>,
  Sparkles: () => <span data-testid="sparkles-icon">✨</span>,
}));

describe('CTASection', () => {
  const defaultProps = {
    title: 'Ready to Get Started?',
    description: 'Contact us and let us help you bring your ideas to life',
    buttons: [
      {
        text: 'Contact Us',
        href: '/contact',
        variant: 'primary' as const,
        showArrow: true,
      },
      {
        text: 'View Services',
        href: '/services',
        variant: 'outline' as const,
      },
    ],
  };

  describe('Rendering', () => {
    it('should render title and description', () => {
      render(<CTASection {...defaultProps} />);
      
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      expect(screen.getByText('Contact us and let us help you bring your ideas to life')).toBeInTheDocument();
    });

    it('should render all buttons', () => {
      render(<CTASection {...defaultProps} />);
      
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('View Services')).toBeInTheDocument();
    });

    it('should render arrow icon when showArrow is true', () => {
      render(<CTASection {...defaultProps} />);
      
      const arrowIcons = screen.getAllByTestId('arrow-right-icon');
      expect(arrowIcons.length).toBeGreaterThan(0);
    });

    it('should render sparkles when showSparkles is true', () => {
      render(<CTASection {...defaultProps} showSparkles={true} />);
      
      const sparkles = screen.getAllByTestId('sparkles-icon');
      expect(sparkles.length).toBeGreaterThan(0);
    });

    it('should not render sparkles when showSparkles is false', () => {
      render(<CTASection {...defaultProps} showSparkles={false} />);
      
      const sparkles = screen.queryAllByTestId('sparkles-icon');
      expect(sparkles.length).toBe(0);
    });
  });

  describe('Button Variants', () => {
    it('should render primary button with correct classes', () => {
      render(<CTASection {...defaultProps} />);
      
      const primaryButton = screen.getByText('Contact Us').closest('a');
      expect(primaryButton).toHaveClass('bg-white', 'text-primary-900');
    });

    it('should render outline button with correct classes', () => {
      render(<CTASection {...defaultProps} />);
      
      const outlineButton = screen.getByText('View Services').closest('a');
      expect(outlineButton).toHaveClass('border-2', 'border-white', 'text-white');
    });

    it('should render secondary button variant', () => {
      const props = {
        ...defaultProps,
        buttons: [
          {
            text: 'Secondary Button',
            href: '/test',
            variant: 'secondary' as const,
          },
        ],
      };
      
      render(<CTASection {...props} />);
      
      const secondaryButton = screen.getByText('Secondary Button').closest('a');
      expect(secondaryButton).toHaveClass('bg-primary-900', 'text-white');
    });
  });

  describe('Button Links', () => {
    it('should have correct href attributes', () => {
      render(<CTASection {...defaultProps} />);
      
      const contactButton = screen.getByText('Contact Us').closest('a');
      const servicesButton = screen.getByText('View Services').closest('a');
      
      expect(contactButton).toHaveAttribute('href', '/contact');
      expect(servicesButton).toHaveAttribute('href', '/services');
    });
  });

  describe('Click Handlers', () => {
    it('should call onClick handler when button is clicked', () => {
      const handleClick = jest.fn();
      const props = {
        ...defaultProps,
        buttons: [
          {
            text: 'Click Me',
            href: '#',
            variant: 'primary' as const,
            onClick: handleClick,
          },
        ],
      };
      
      render(<CTASection {...props} />);
      
      const button = screen.getByText('Click Me');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Gradient Schemes', () => {
    it('should apply primary gradient by default', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toHaveClass('from-primary-500', 'via-primary-600', 'to-primary-700');
    });

    it('should apply sunset gradient when specified', () => {
      const { container } = render(<CTASection {...defaultProps} gradientScheme="sunset" />);
      
      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toHaveClass('from-orange-500', 'via-pink-500', 'to-purple-600');
    });

    it('should apply ocean gradient when specified', () => {
      const { container } = render(<CTASection {...defaultProps} gradientScheme="ocean" />);
      
      const gradientDiv = container.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toHaveClass('from-blue-500', 'via-cyan-500', 'to-teal-600');
    });
  });

  describe('Glass Effect Intensity', () => {
    it('should apply light glass effect', () => {
      const { container } = render(<CTASection {...defaultProps} glassIntensity="light" />);
      
      const glassElement = container.querySelector('.bg-white\\/5');
      expect(glassElement).toBeInTheDocument();
    });

    it('should apply medium glass effect by default', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const glassElement = container.querySelector('.bg-white\\/10');
      expect(glassElement).toBeInTheDocument();
    });

    it('should apply heavy glass effect', () => {
      const { container } = render(<CTASection {...defaultProps} glassIntensity="heavy" />);
      
      const glassElement = container.querySelector('.bg-white\\/20');
      expect(glassElement).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive padding classes', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const contentDiv = container.querySelector('.p-8');
      expect(contentDiv).toHaveClass('md:p-12', 'lg:p-16');
    });

    it('should have responsive text size classes', () => {
      render(<CTASection {...defaultProps} />);
      
      const title = screen.getByText('Ready to Get Started?');
      expect(title).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
    });

    it('should have responsive button layout', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const buttonContainer = container.querySelector('.flex-col');
      expect(buttonContainer).toHaveClass('sm:flex-row');
    });
  });

  describe('Accessibility', () => {
    it('should render buttons as anchor tags for navigation', () => {
      render(<CTASection {...defaultProps} />);
      
      const buttons = screen.getAllByRole('link');
      expect(buttons.length).toBe(2);
    });

    it('should have proper heading hierarchy', () => {
      render(<CTASection {...defaultProps} />);
      
      const heading = screen.getByText('Ready to Get Started?');
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className', () => {
      const { container } = render(<CTASection {...defaultProps} className="custom-class" />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single button', () => {
      const props = {
        ...defaultProps,
        buttons: [
          {
            text: 'Single Button',
            href: '/single',
            variant: 'primary' as const,
          },
        ],
      };
      
      render(<CTASection {...props} />);
      
      expect(screen.getByText('Single Button')).toBeInTheDocument();
      expect(screen.queryByText('View Services')).not.toBeInTheDocument();
    });

    it('should handle empty button array gracefully', () => {
      const props = {
        ...defaultProps,
        buttons: [],
      };
      
      const { container } = render(<CTASection {...props} />);
      
      // Should still render title and description
      expect(screen.getByText('Ready to Get Started?')).toBeInTheDocument();
      
      // Button container should exist but be empty
      const buttonContainer = container.querySelector('.perspective-1000');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      const props = {
        ...defaultProps,
        title: 'This is a very long title that should still render properly and maintain good typography',
        description: 'This is a very long description that contains multiple sentences and should wrap properly on smaller screens while maintaining readability and good visual hierarchy throughout the entire content area.',
      };
      
      render(<CTASection {...props} />);
      
      expect(screen.getByText(props.title)).toBeInTheDocument();
      expect(screen.getByText(props.description)).toBeInTheDocument();
    });
  });

  describe('3D Effects', () => {
    it('should have perspective-1000 class for 3D effects', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const perspectiveContainer = container.querySelector('.perspective-1000');
      expect(perspectiveContainer).toBeInTheDocument();
    });

    it('should have shadow-depth-deep class for depth effect', () => {
      const { container } = render(<CTASection {...defaultProps} />);
      
      const depthElement = container.querySelector('.shadow-depth-deep');
      expect(depthElement).toBeInTheDocument();
    });
  });
});
