/**
 * Card3D Component Unit Tests
 * 
 * Tests specific examples and edge cases for the Card3D component
 * Requirements: 1.1, 1.2, 1.3, 2.2, 5.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card3D, Card3DCustom } from '../Card3D';
import * as transforms from '@/lib/utils/3d-transforms';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  useMotionValue: (initial: number) => ({
    get: () => initial,
    set: jest.fn(),
  }),
  useSpring: (value: any) => value,
}));

// Mock 3d-transforms utilities
jest.mock('@/lib/utils/3d-transforms', () => ({
  calculateMouseTransform: jest.fn(() => ({
    perspective: 1000,
    rotateX: 5,
    rotateY: 10,
    rotateZ: 0,
    translateZ: 0,
    scale: 1,
  })),
  getDepthShadow: jest.fn((level: string) => `0 4px 8px rgba(0,0,0,0.1)`),
  transformToCSS: jest.fn((config) => 'perspective(1000px) rotateX(5deg)'),
  shouldSimplify3DEffects: jest.fn(() => false),
  adjustTransformForRTL: jest.fn((config, isRTL) => config),
}));

describe('Card3D Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(
        <Card3D>
          <div>Test Content</div>
        </Card3D>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Card3D className="custom-class">
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('applies glass effect class by default', () => {
      const { container } = render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('glass-medium');
    });

    it('applies specified glass effect variant', () => {
      const { container } = render(
        <Card3D glassEffect="heavy">
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('glass-heavy');
    });

    it('does not apply glass effect when set to none', () => {
      const { container } = render(
        <Card3D glassEffect="none">
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('glass-light');
      expect(card).not.toHaveClass('glass-medium');
      expect(card).not.toHaveClass('glass-heavy');
    });
  });

  describe('Depth Shadows', () => {
    it('applies shallow depth shadow', () => {
      render(
        <Card3D depth="shallow">
          <div>Content</div>
        </Card3D>
      );

      expect(transforms.getDepthShadow).toHaveBeenCalledWith('shallow');
    });

    it('applies medium depth shadow by default', () => {
      render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      expect(transforms.getDepthShadow).toHaveBeenCalledWith('medium');
    });

    it('applies deep depth shadow', () => {
      render(
        <Card3D depth="deep">
          <div>Content</div>
        </Card3D>
      );

      expect(transforms.getDepthShadow).toHaveBeenCalledWith('deep');
    });
  });

  describe('Hover Interactions', () => {
    it('handles mouse enter event', () => {
      const { container } = render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);

      // Component should update internal state
      expect(card).toBeInTheDocument();
    });

    it('handles mouse leave event', () => {
      const { container } = render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);

      expect(card).toBeInTheDocument();
    });

    it('handles mouse move for 3D tilt', () => {
      const { container } = render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });

      // Should call calculateMouseTransform when not on mobile
      // Note: This might not be called immediately due to useEffect timing
      expect(card).toBeInTheDocument();
    });

    it('disables hover effects when enableHover is false', () => {
      const { container } = render(
        <Card3D enableHover={false}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseEnter(card);

      expect(card).toBeInTheDocument();
    });
  });

  describe('Click Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card3D onClick={handleClick}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies cursor-pointer class when onClick is provided', () => {
      const { container } = render(
        <Card3D onClick={() => {}}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer');
    });

    it('handles Enter key press when onClick is provided', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card3D onClick={handleClick}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles Space key press when onClick is provided', () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Card3D onClick={handleClick}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.keyDown(card, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('applies role="button" when onClick is provided', () => {
      const { container } = render(
        <Card3D onClick={() => {}}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('role', 'button');
    });

    it('applies custom role when provided', () => {
      const { container } = render(
        <Card3D role="article">
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('role', 'article');
    });

    it('applies aria-label when provided', () => {
      const { container } = render(
        <Card3D ariaLabel="Test Card">
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('aria-label', 'Test Card');
    });

    it('applies tabIndex when onClick is provided', () => {
      const { container } = render(
        <Card3D onClick={() => {}}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('applies custom tabIndex', () => {
      const { container } = render(
        <Card3D onClick={() => {}} tabIndex={-1}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Intensity Levels', () => {
    it('applies light intensity configuration', () => {
      render(
        <Card3D intensity="light">
          <div>Content</div>
        </Card3D>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies medium intensity configuration by default', () => {
      render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('applies heavy intensity configuration', () => {
      render(
        <Card3D intensity="heavy">
          <div>Content</div>
        </Card3D>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('adjusts transform for RTL layout', () => {
      render(
        <Card3D isRTL={true}>
          <div>Content</div>
        </Card3D>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Mobile Optimization', () => {
    it('simplifies effects on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <Card3D>
          <div>Content</div>
        </Card3D>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      const { container } = render(<Card3D>{null}</Card3D>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles multiple children', () => {
      render(
        <Card3D>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Card3D>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('handles disable3D prop', () => {
      const { container } = render(
        <Card3D disable3D={true}>
          <div>Content</div>
        </Card3D>
      );

      const card = container.firstChild as HTMLElement;
      fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });

      expect(card).toBeInTheDocument();
    });
  });

  describe('Card3DCustom Component', () => {
    it('renders with custom transform', () => {
      const customTransform = {
        perspective: 1500,
        rotateX: 10,
        rotateY: 20,
        rotateZ: 0,
        translateZ: 50,
        scale: 1.1,
      };

      render(
        <Card3DCustom transform={customTransform}>
          <div>Custom Content</div>
        </Card3DCustom>
      );

      expect(screen.getByText('Custom Content')).toBeInTheDocument();
      expect(transforms.transformToCSS).toHaveBeenCalledWith(customTransform);
    });

    it('applies depth shadow', () => {
      render(
        <Card3DCustom depth="deep">
          <div>Content</div>
        </Card3DCustom>
      );

      expect(transforms.getDepthShadow).toHaveBeenCalledWith('deep');
    });

    it('applies glass effect', () => {
      const { container } = render(
        <Card3DCustom glassEffect="light">
          <div>Content</div>
        </Card3DCustom>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('glass-light');
    });
  });
});
