/**
 * FadeInView Component Tests
 * Tests for the fade-in animation wrapper component
 * Requirements: 4.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FadeInView } from '../FadeInView';

// Mock window.matchMedia before any imports
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props} data-testid="motion-div">
        {children}
      </div>
    )),
  },
  useInView: jest.fn(() => true),
}));

// Mock the variants module
jest.mock('@/lib/animations/variants', () => ({
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
}));

// Mock the transitions module
jest.mock('@/lib/animations/transitions', () => ({
  getMobileOptimizedTransition: jest.fn((transition) => transition),
}));

describe('FadeInView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset matchMedia to default behavior
    (window.matchMedia as jest.Mock).mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      render(
        <FadeInView>
          <div>Test Content</div>
        </FadeInView>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <FadeInView className="custom-class">
          <div>Test Content</div>
        </FadeInView>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveClass('custom-class');
    });

    it('should render multiple children', () => {
      render(
        <FadeInView>
          <div>First Child</div>
          <div>Second Child</div>
        </FadeInView>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('Animation Configuration', () => {
    it('should accept delay prop', () => {
      const { container } = render(
        <FadeInView delay={0.5}>
          <div>Delayed Content</div>
        </FadeInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept duration prop', () => {
      const { container } = render(
        <FadeInView duration={1.0}>
          <div>Slow Fade Content</div>
        </FadeInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept threshold prop', () => {
      const { container } = render(
        <FadeInView threshold={0.5}>
          <div>Half Visible Content</div>
        </FadeInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept once prop', () => {
      const { container } = render(
        <FadeInView once={false}>
          <div>Repeating Animation</div>
        </FadeInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should use default values when props are not provided', () => {
      const { container } = render(
        <FadeInView>
          <div>Default Config</div>
        </FadeInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Prefers Reduced Motion Support', () => {
    it('should skip animation when prefers-reduced-motion is enabled', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { container } = render(
        <FadeInView>
          <div>Reduced Motion Content</div>
        </FadeInView>
      );

      // Should render a plain div instead of motion.div
      const plainDiv = container.querySelector('div');
      expect(plainDiv).toBeInTheDocument();
      expect(screen.getByText('Reduced Motion Content')).toBeInTheDocument();
    });

    it('should apply animation when prefers-reduced-motion is disabled', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <FadeInView>
          <div>Animated Content</div>
        </FadeInView>
      );

      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('should preserve className when reduced motion is enabled', () => {
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      const { container } = render(
        <FadeInView className="test-class">
          <div>Content</div>
        </FadeInView>
      );

      const div = container.querySelector('.test-class');
      expect(div).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<FadeInView>{null}</FadeInView>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle zero delay', () => {
      const { container } = render(
        <FadeInView delay={0}>
          <div>No Delay</div>
        </FadeInView>
      );
      expect(screen.getByText('No Delay')).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      const { container } = render(
        <FadeInView duration={0}>
          <div>Instant</div>
        </FadeInView>
      );
      expect(screen.getByText('Instant')).toBeInTheDocument();
    });

    it('should handle threshold of 0', () => {
      const { container } = render(
        <FadeInView threshold={0}>
          <div>Immediate Trigger</div>
        </FadeInView>
      );
      expect(screen.getByText('Immediate Trigger')).toBeInTheDocument();
    });

    it('should handle threshold of 1', () => {
      const { container } = render(
        <FadeInView threshold={1}>
          <div>Full Visibility Required</div>
        </FadeInView>
      );
      expect(screen.getByText('Full Visibility Required')).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      render(
        <FadeInView>
          <div>
            <span>Nested</span>
            <div>
              <p>Deeply Nested</p>
            </div>
          </div>
        </FadeInView>
      );

      expect(screen.getByText('Nested')).toBeInTheDocument();
      expect(screen.getByText('Deeply Nested')).toBeInTheDocument();
    });
  });

  describe('Integration with Framer Motion', () => {
    it('should pass correct variants to motion.div', () => {
      const { useInView } = require('framer-motion');
      useInView.mockReturnValue(true);

      render(
        <FadeInView>
          <div>Content</div>
        </FadeInView>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveAttribute('initial', 'hidden');
      expect(motionDiv).toHaveAttribute('animate', 'visible');
    });

    it('should use useInView hook with correct options', () => {
      const { useInView } = require('framer-motion');
      useInView.mockReturnValue(false);

      render(
        <FadeInView threshold={0.3} once={false}>
          <div>Content</div>
        </FadeInView>
      );

      expect(useInView).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          once: false,
          amount: 0.3,
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with screen readers', () => {
      render(
        <FadeInView>
          <button aria-label="Click me">Button</button>
        </FadeInView>
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should preserve semantic HTML structure', () => {
      render(
        <FadeInView>
          <article>
            <h1>Title</h1>
            <p>Content</p>
          </article>
        </FadeInView>
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});
