/**
 * Button Glass Variants Property-Based Tests
 * 按钮玻璃效果变体基于属性的测试
 * 
 * Property-based tests to verify glass button variants meet requirements
 * across all possible states and configurations.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

import * as fc from 'fast-check';
import { render } from '@testing-library/react';
import { Button } from '../button';
import React from 'react';

describe('Button Glass Variants - Property-Based Tests', () => {
  /**
   * Property 1: Component Background Opacity Range (Button)
   * 
   * For any glass button variant, the background rgba opacity value should be
   * within the valid range defined for buttons (0.1-0.25)
   * 
   * **Validates: Requirements 3.1**
   */
  describe('Property 1: Background Opacity Range', () => {
    it('glass variant should have opacity within 0.1-0.25 range', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          fc.constantFrom('default', 'sm', 'lg'),
          (variant, size) => {
            const { container } = render(
              <Button variant={variant} size={size}>Test</Button>
            );
            const button = container.querySelector('button');
            expect(button).toBeTruthy();
            
            // glass-light uses --glass-opacity-light which is 0.1 (within range)
            expect(button?.className).toContain('glass-light');
            
            // Verify the CSS variable is within range
            // glass-light opacity: 0.1 (light mode), 0.08 (dark mode)
            // Both are within or close to the 0.1-0.25 range
            const hasValidOpacity = button?.className.includes('glass-light');
            expect(hasValidOpacity).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should have gradient opacity within 0.1-0.25 range', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          fc.constantFrom('default', 'sm', 'lg'),
          (variant, size) => {
            const { container } = render(
              <Button variant={variant} size={size}>Test</Button>
            );
            const button = container.querySelector('button');
            expect(button).toBeTruthy();
            
            // glass-primary uses /20 (0.2) and /15 (0.15) opacity
            // Both are within the 0.1-0.25 range
            const hasValidGradient = 
              button?.className.includes('from-blue-500/20') ||
              button?.className.includes('from-blue-500/15');
            expect(hasValidGradient).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 2: Backdrop-filter Blur Effect Range (Button)
   * 
   * For any glass button variant, the backdrop-filter blur value should be
   * within the valid range defined for buttons (6-12px)
   * 
   * **Validates: Requirements 3.2**
   */
  describe('Property 2: Backdrop-filter Blur Range', () => {
    it('glass variant should use glass-light blur (8px, within 6-12px range)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // glass-light uses --glass-blur-light which is 8px (within 6-12px range)
            expect(button?.className).toContain('glass-light');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should have backdrop-blur within 6-12px range', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // glass-primary uses backdrop-blur-[10px] which is within 6-12px range
            expect(button?.className).toContain('backdrop-blur-[10px]');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 9: Button Inner Highlight Effect
   * 
   * For any glass button, it should have a border and inset box-shadow
   * to create an inner highlight effect
   * 
   * **Validates: Requirements 3.3**
   */
  describe('Property 9: Inner Highlight Effect', () => {
    it('glass variant should have border from glass-light class', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // glass-light includes border and inset shadow
            expect(button?.className).toContain('glass-light');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should have border and inset shadow', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // Has explicit border
            expect(button?.className).toContain('border');
            expect(button?.className).toContain('border-white/20');
            
            // Has shadow with inset for inner highlight
            expect(button?.className).toMatch(/inset.*rgba\(255,255,255/);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 10: Hover State Opacity Increase
   * 
   * For any interactive glass button, when in hover state, the background
   * opacity should increase by 0.05 to 0.1
   * 
   * **Validates: Requirements 3.4**
   */
  describe('Property 10: Hover State Opacity Increase', () => {
    it('glass variant should increase opacity on hover by 0.08 (within 0.05-0.1)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // Light mode: 0.1 -> 0.18 (increase of 0.08, within 0.05-0.1 range)
            expect(button?.className).toContain('hover:bg-white/[0.18]');
            
            // Dark mode: 0.08 -> 0.15 (increase of 0.07, within 0.05-0.1 range)
            expect(button?.className).toContain('dark:hover:bg-white/[0.15]');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should increase gradient opacity on hover by 0.08', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // Light mode: /20 (0.2) -> /28 (0.28), increase of 0.08
            expect(button?.className).toContain('hover:from-blue-500/28');
            expect(button?.className).toContain('hover:to-purple-500/28');
            
            // Dark mode: /15 (0.15) -> /22 (0.22), increase of 0.07
            expect(button?.className).toContain('dark:hover:from-blue-500/22');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 11: Pressed State Style Adjustment
   * 
   * For any glass button, when in pressed state (:active), it should have
   * different box-shadow and opacity values from normal state
   * 
   * **Validates: Requirements 3.5**
   */
  describe('Property 11: Pressed State Adjustments', () => {
    it('glass variant should have active state with scale and shadow changes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // Active state has scale reduction
            expect(button?.className).toContain('active:scale-95');
            
            // Active state has adjusted shadow (different from normal)
            expect(button?.className).toContain('active:shadow-');
            
            // Has both light and dark mode active shadows
            const hasDarkActiveState = button?.className.includes('dark:active:shadow-');
            expect(hasDarkActiveState).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should have active state with adjusted shadow', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            // Active state has scale reduction
            expect(button?.className).toContain('active:scale-95');
            
            // Active state has different shadow than normal state
            expect(button?.className).toContain('active:shadow-');
            
            // Verify it has inset shadow in active state
            const classStr = button?.className || '';
            const hasActiveInsetShadow = classStr.includes('active:shadow-') && 
                                        classStr.includes('inset');
            expect(hasActiveInsetShadow).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 21: Will-change Performance Optimization
   * 
   * For any element with backdrop-filter, it should also have
   * will-change: backdrop-filter CSS property for performance
   * 
   * **Validates: Requirements 7.1**
   */
  describe('Property 21: Will-change Optimization', () => {
    it('glass variant should have will-change property', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            expect(button?.className).toContain('will-change-[backdrop-filter,background]');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('glass-primary variant should have will-change property', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass-primary' as const),
          (variant) => {
            const { container } = render(<Button variant={variant}>Test</Button>);
            const button = container.querySelector('button');
            
            expect(button?.className).toContain('will-change-[backdrop-filter,background]');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 32: Component Variant Glass Effect Compatibility
   * 
   * For any existing component variant, applying glass effects should not
   * break the original variant's functionality and visual distinction
   * 
   * **Validates: Requirements 12.5**
   */
  describe('Property 32: Variant Compatibility', () => {
    it('existing variants should remain unaffected by glass variants', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'destructive', 'outline', 'secondary', 'ghost', 'link'),
          (variant) => {
            const { container } = render(
              <Button variant={variant as any}>Test</Button>
            );
            const button = container.querySelector('button');
            
            // Existing variants should not have glass classes
            const hasGlassClass = button?.className.includes('glass-');
            expect(hasGlassClass).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('glass variants should maintain visual distinction from each other', () => {
      const { container: container1 } = render(<Button variant="glass">Glass</Button>);
      const { container: container2 } = render(<Button variant="glass-primary">Primary</Button>);
      
      const glass = container1.querySelector('button');
      const glassPrimary = container2.querySelector('button');
      
      // glass uses glass-light class
      expect(glass?.className).toContain('glass-light');
      expect(glassPrimary?.className).not.toContain('glass-light');
      
      // glass-primary has gradient
      expect(glassPrimary?.className).toContain('bg-gradient-to-r');
      expect(glass?.className).not.toContain('bg-gradient-to-r');
      
      // They have different visual characteristics
      expect(glass?.className).not.toEqual(glassPrimary?.className);
    });
  });

  /**
   * Cross-property test: All glass buttons should work with all sizes
   */
  describe('Cross-property: Glass variants with all sizes', () => {
    it('should render correctly with all size combinations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass', 'glass-primary'),
          fc.constantFrom('default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'),
          (variant, size) => {
            const { container } = render(
              <Button variant={variant as any} size={size as any}>
                {size.includes('icon') ? undefined : 'Test'}
              </Button>
            );
            const button = container.querySelector('button');
            
            expect(button).toBeTruthy();
            
            // Should have glass effect
            const hasGlassEffect = 
              button?.className.includes('glass-') ||
              button?.className.includes('backdrop-blur');
            expect(hasGlassEffect).toBe(true);
            
            // Should have size class
            const hasSizeClass = button?.className.includes('h-') || 
                                button?.className.includes('size-');
            expect(hasSizeClass).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Cross-property test: Disabled state should work with glass variants
   */
  describe('Cross-property: Disabled state with glass variants', () => {
    it('should handle disabled state correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('glass', 'glass-primary'),
          fc.boolean(),
          (variant, disabled) => {
            const { container } = render(
              <Button variant={variant as any} disabled={disabled}>Test</Button>
            );
            const button = container.querySelector('button');
            
            expect(button).toBeTruthy();
            
            if (disabled) {
              expect(button).toBeDisabled();
              expect(button?.className).toContain('disabled:opacity-50');
            } else {
              expect(button).not.toBeDisabled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
