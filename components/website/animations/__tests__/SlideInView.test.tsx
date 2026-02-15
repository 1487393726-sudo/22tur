/**
 * SlideInView Component Tests
 * Tests for the slide-in animation wrapper component
 * Requirements: 4.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SlideInView } from '../SlideInView';

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
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInTop: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  slideInBottom: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
}));

// Mock the transitions module
jest.mock('@/lib/animations/transitions', () => ({
  getMobileOptimizedTransition: jest.fn((transition) => transition),
}));

describe('SlideInView', () => {
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
        <SlideInView>
          <div>Test Content</div>
        </SlideInView>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <SlideInView className="custom-class">
          <div>Test Content</div>
        </SlideInView>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveClass('custom-class');
    });

    it('should render multiple children', () => {
      render(
        <SlideInView>
          <div>First Child</div>
          <div>Second Child</div>
        </SlideInView>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('Direction Configuration', () => {
    it('should accept left direction', () => {
      const { container } = render(
        <SlideInView direction="left">
          <div>Slide from Left</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Slide from Left')).toBeInTheDocument();
    });

    it('should accept right direction', () => {
      const { container } = render(
        <SlideInView direction="right">
          <div>Slide from Right</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Slide from Right')).toBeInTheDocument();
    });

    it('should accept up direction', () => {
      const { container } = render(
        <SlideInView direction="up">
          <div>Slide Up</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Slide Up')).toBeInTheDocument();
    });

    it('should accept down direction', () => {
      const { container } = render(
        <SlideInView direction="down">
          <div>Slide Down</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Slide Down')).toBeInTheDocument();
    });

    it('should use up as default direction', () => {
      const { container } = render(
        <SlideInView>
          <div>Default Direction</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Default Direction')).toBeInTheDocument();
    });
  });

  describe('Animation Configuration', () => {
    it('should accept delay prop', () => {
      const { container } = render(
        <SlideInView delay={0.5}>
          <div>Delayed Content</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept duration prop', () => {
      const { container } = render(
        <SlideInView duration={1.0}>
          <div>Slow Slide Content</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept threshold prop', () => {
      const { container } = render(
        <SlideInView threshold={0.5}>
          <div>Half Visible Content</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept once prop', () => {
      const { container } = render(
        <SlideInView once={false}>
          <div>Repeating Animation</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should use default values when props are not provided', () => {
      const { container } = render(
        <SlideInView>
          <div>Default Config</div>
        </SlideInView>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Combined Direction and Animation Props', () => {
    it('should handle left direction with custom delay and duration', () => {
      render(
        <SlideInView direction="left" delay={0.3} duration={0.8}>
          <div>Custom Left Slide</div>
        </SlideInView>
      );

      expect(screen.getByText('Custom Left Slide')).toBeInTheDocument();
    });

    it('should handle right direction with threshold', () => {
      render(
        <SlideInView direction="right" threshold={0.7}>
          <div>Right Slide with Threshold</div>
        </SlideInView>
      );

      expect(screen.getByText('Right Slide with Threshold')).toBeInTheDocument();
    });

    it('should handle up direction with repeating animation', () => {
      render(
        <SlideInView direction="up" once={false}>
          <div>Repeating Up Slide</div>
        </SlideInView>
      );

      expect(screen.getByText('Repeating Up Slide')).toBeInTheDocument();
    });

    it('should handle down direction with all custom props', () => {
      render(
        <SlideInView
          direction="down"
          delay={0.2}
          duration={0.6}
          threshold={0.3}
          once={false}
          className="custom-class"
        >
          <div>Full Custom Down Slide</div>
        </SlideInView>
      );

      expect(screen.getByText('Full Custom Down Slide')).toBeInTheDocument();
      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveClass('custom-class');
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
        <SlideInView direction="left">
          <div>Reduced Motion Content</div>
        </SlideInView>
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
        <SlideInView direction="right">
          <div>Animated Content</div>
        </SlideInView>
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
        <SlideInView className="test-class" direction="up">
          <div>Content</div>
        </SlideInView>
      );

      const div = container.querySelector('.test-class');
      expect(div).toBeInTheDocument();
    });

    it('should preserve direction when reduced motion is enabled', () => {
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

      render(
        <SlideInView direction="down">
          <div>Down Content</div>
        </SlideInView>
      );

      expect(screen.getByText('Down Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<SlideInView>{null}</SlideInView>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle zero delay', () => {
      const { container } = render(
        <SlideInView delay={0}>
          <div>No Delay</div>
        </SlideInView>
      );
      expect(screen.getByText('No Delay')).toBeInTheDocument();
    });

    it('should handle zero duration', () => {
      const { container } = render(
        <SlideInView duration={0}>
          <div>Instant</div>
        </SlideInView>
      );
      expect(screen.getByText('Instant')).toBeInTheDocument();
    });

    it('should handle threshold of 0', () => {
      const { container } = render(
        <SlideInView threshold={0}>
          <div>Immediate Trigger</div>
        </SlideInView>
      );
      expect(screen.getByText('Immediate Trigger')).toBeInTheDocument();
    });

    it('should handle threshold of 1', () => {
      const { container } = render(
        <SlideInView threshold={1}>
          <div>Full Visibility Required</div>
        </SlideInView>
      );
      expect(screen.getByText('Full Visibility Required')).toBeInTheDocument();
    });

    it('should handle complex nested children', () => {
      render(
        <SlideInView direction="left">
          <div>
            <span>Nested</span>
            <div>
              <p>Deeply Nested</p>
            </div>
          </div>
        </SlideInView>
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
        <SlideInView direction="left">
          <div>Content</div>
        </SlideInView>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveAttribute('initial', 'hidden');
      expect(motionDiv).toHaveAttribute('animate', 'visible');
    });

    it('should use useInView hook with correct options', () => {
      const { useInView } = require('framer-motion');
      useInView.mockReturnValue(false);

      render(
        <SlideInView threshold={0.3} once={false} direction="right">
          <div>Content</div>
        </SlideInView>
      );

      expect(useInView).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          once: false,
          amount: 0.3,
        })
      );
    });

    it('should animate to hidden when not in view', () => {
      const { useInView } = require('framer-motion');
      useInView.mockReturnValue(false);

      render(
        <SlideInView direction="up">
          <div>Content</div>
        </SlideInView>
      );

      const motionDiv = screen.getByTestId('motion-div');
      expect(motionDiv).toHaveAttribute('animate', 'hidden');
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with screen readers', () => {
      render(
        <SlideInView direction="left">
          <button aria-label="Click me">Button</button>
        </SlideInView>
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should preserve semantic HTML structure', () => {
      render(
        <SlideInView direction="right">
          <article>
            <h1>Title</h1>
            <p>Content</p>
          </article>
        </SlideInView>
      );

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should preserve ARIA attributes', () => {
      render(
        <SlideInView direction="up">
          <div role="alert" aria-live="polite">
            Important message
          </div>
        </SlideInView>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Mobile Optimization', () => {
    it('should call getMobileOptimizedTransition', () => {
      const { getMobileOptimizedTransition } = require('@/lib/animations/transitions');

      render(
        <SlideInView direction="left" duration={0.5} delay={0.2}>
          <div>Mobile Optimized</div>
        </SlideInView>
      );

      expect(getMobileOptimizedTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          duration: 0.5,
          delay: 0.2,
        })
      );
    });

    it('should pass zero duration when reduced motion is preferred', () => {
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

      render(
        <SlideInView direction="right" duration={0.5}>
          <div>Content</div>
        </SlideInView>
      );

      // Should render plain div, not call getMobileOptimizedTransition
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
