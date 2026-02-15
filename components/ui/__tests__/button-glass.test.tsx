/**
 * Button Glass Variants Unit Tests
 * 按钮玻璃效果变体单元测试
 * 
 * Tests the glass and glass-primary button variants including:
 * - Normal state rendering
 * - Hover state styles
 * - Active/pressed state styles
 * - Disabled state
 * - Dark mode variations
 * 
 * Validates Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button Glass Variants', () => {
  describe('glass variant', () => {
    it('should render with glass-light class', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('glass-light');
    });

    it('should have will-change property for performance optimization', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('will-change-[backdrop-filter,background]');
    });

    it('should have hover state with increased opacity', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      // Hover increases opacity: light mode 0.1 -> 0.18 (0.08 increase)
      expect(button.className).toContain('hover:bg-white/[0.18]');
    });

    it('should have active state with scale and shadow adjustments', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('active:scale-95');
      expect(button.className).toContain('active:shadow-');
    });

    it('should have dark mode hover state', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:hover:bg-white/[0.15]');
    });

    it('should render with all sizes', () => {
      const { rerender } = render(<Button variant="glass" size="sm">Small</Button>);
      let button = screen.getByRole('button');
      expect(button.className).toContain('h-8');

      rerender(<Button variant="glass" size="default">Default</Button>);
      button = screen.getByRole('button');
      expect(button.className).toContain('h-9');

      rerender(<Button variant="glass" size="lg">Large</Button>);
      button = screen.getByRole('button');
      expect(button.className).toContain('h-10');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button variant="glass" disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  describe('glass-primary variant', () => {
    it('should render with gradient background', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gradient-to-r');
      expect(button.className).toContain('from-blue-500/20');
      expect(button.className).toContain('to-purple-500/20');
    });

    it('should have backdrop-blur effect', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('backdrop-blur-[10px]');
    });

    it('should have border with appropriate opacity', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).toContain('border-white/20');
    });

    it('should have hover state with increased gradient opacity', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      // Hover increases gradient opacity: 20% -> 28% (0.08 increase)
      expect(button.className).toContain('hover:from-blue-500/28');
      expect(button.className).toContain('hover:to-purple-500/28');
    });

    it('should have text-white for contrast', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('text-white');
    });

    it('should have shadow with inset highlight', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('shadow-');
      // Shadow includes inset for inner highlight effect
      expect(button.className).toMatch(/inset.*rgba\(255,255,255/);
    });

    it('should have active state with adjusted shadow', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('active:scale-95');
      expect(button.className).toContain('active:shadow-');
    });

    it('should have dark mode gradient adjustments', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:from-blue-500/15');
      expect(button.className).toContain('dark:to-purple-500/15');
    });

    it('should have dark mode hover state', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:hover:from-blue-500/22');
      expect(button.className).toContain('dark:hover:to-purple-500/22');
    });

    it('should have will-change for performance', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('will-change-[backdrop-filter,background]');
    });
  });

  describe('existing variants compatibility', () => {
    it('should not affect default variant', () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-primary');
      expect(button.className).not.toContain('glass');
    });

    it('should not affect outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('border');
      expect(button.className).not.toContain('glass');
    });

    it('should not affect secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
      expect(button.className).not.toContain('glass');
    });

    it('should not affect ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-accent');
      expect(button.className).not.toContain('glass');
    });
  });

  describe('accessibility', () => {
    it('should maintain focus-visible styles with glass variant', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus-visible:border-ring');
      expect(button.className).toContain('focus-visible:ring-ring/50');
    });

    it('should maintain focus-visible styles with glass-primary variant', () => {
      render(<Button variant="glass-primary">Primary Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus-visible:border-ring');
      expect(button.className).toContain('focus-visible:ring-ring/50');
    });

    it('should be keyboard accessible', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('edge cases', () => {
    it('should handle empty children', () => {
      render(<Button variant="glass"></Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should handle custom className', () => {
      render(<Button variant="glass" className="custom-class">Glass</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
      expect(button.className).toContain('glass-light');
    });

    it('should handle asChild prop with glass variant', () => {
      render(
        <Button variant="glass" asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link.className).toContain('glass-light');
    });
  });
});
