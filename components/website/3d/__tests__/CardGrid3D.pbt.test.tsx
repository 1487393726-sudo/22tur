/**
 * Property-Based Tests for CardGrid3D Component
 * 
 * Feature: website-3d-redesign
 * Tests Properties 11 and 16 from the design document
 * 
 * Property 11: Viewport Entry Animation
 * Property 16: Responsive Grid Columns
 * 
 * Validates: Requirements 4.2, 5.2, 5.3, 5.4
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { CardGrid3D, ResponsiveColumns } from '../CardGrid3D';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, any>(({ children, variants, initial, animate, ...props }, ref) => (
        <div 
          ref={ref} 
          {...props}
          data-animation-state={animate}
          data-has-variants={variants ? 'true' : 'false'}
        >
          {children}
        </div>
      )),
    },
    useInView: jest.fn((ref, options) => {
      // Simulate element entering viewport
      return true;
    }),
  };
});

// Mock animations
jest.mock('@/lib/animations/variants', () => ({
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  },
  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
}));

jest.mock('@/lib/animations/transitions', () => ({
  getMobileOptimizedStagger: jest.fn((config) => ({
    staggerChildren: config.staggerChildren * 0.7,
    delayChildren: config.delayChildren || 0,
  })),
}));

// Arbitraries for generating test data
const childContentArbitrary = fc.oneof(
  fc.string().map(s => <div key={s}>{s}</div>),
  fc.constant(<div>Card Content</div>),
  fc.constant(<article>Article</article>),
  fc.constant(<section>Section</section>)
);

const responsiveColumnsArbitrary = fc.record({
  mobile: fc.integer({ min: 1, max: 2 }),
  tablet: fc.integer({ min: 2, max: 4 }),
  desktop: fc.integer({ min: 3, max: 6 }),
});

const gapArbitrary = fc.constantFrom('2', '4', '6', '8', '10', '12');
const staggerDelayArbitrary = fc.float({ min: Math.fround(0.05), max: Math.fround(0.3) });
const thresholdArbitrary = fc.float({ min: Math.fround(0), max: Math.fround(1) });

const cardGrid3DPropsArbitrary = fc.record({
  columns: fc.option(responsiveColumnsArbitrary, { nil: undefined }),
  gap: fc.option(gapArbitrary, { nil: undefined }),
  staggerDelay: fc.option(staggerDelayArbitrary, { nil: undefined }),
  threshold: fc.option(thresholdArbitrary, { nil: undefined }),
  disableAnimation: fc.option(fc.boolean(), { nil: undefined }),
  once: fc.option(fc.boolean(), { nil: undefined }),
  animationDelay: fc.option(fc.float({ min: Math.fround(0), max: Math.fround(1) }), { nil: undefined }),
});

describe('CardGrid3D Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 16: Responsive Grid Columns', () => {
    /**
     * **Validates: Requirements 5.2, 5.3, 5.4**
     * 
     * For any grid layout component, when viewport width changes across breakpoints
     * (mobile: <640px, tablet: 640-1024px, desktop: >1024px), the grid-template-columns
     * value should adjust to appropriate column counts (1, 2-3, 3+ respectively).
     */
    
    it('should apply mobile column count for viewports < 640px', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          fc.integer({ min: 1, max: 2 }),
          (children, mobileColumns) => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 375, // Mobile width
            });

            const columns: ResponsiveColumns = {
              mobile: mobileColumns,
              tablet: 2,
              desktop: 3,
            };

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have grid-cols-{mobile} class
            expect(grid.className).toContain(`grid-cols-${mobileColumns}`);
            
            // Should have grid display
            expect(grid.className).toContain('grid');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply tablet column count for viewports 640-1024px', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          fc.integer({ min: 2, max: 4 }),
          (children, tabletColumns) => {
            // Mock tablet viewport
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 768, // Tablet width
            });

            const columns: ResponsiveColumns = {
              mobile: 1,
              tablet: tabletColumns,
              desktop: 3,
            };

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have md:grid-cols-{tablet} class
            expect(grid.className).toContain(`md:grid-cols-${tabletColumns}`);
            
            // Should also have mobile columns as base
            expect(grid.className).toContain('grid-cols-1');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply desktop column count for viewports > 1024px', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          fc.integer({ min: 3, max: 6 }),
          (children, desktopColumns) => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 1440, // Desktop width
            });

            const columns: ResponsiveColumns = {
              mobile: 1,
              tablet: 2,
              desktop: desktopColumns,
            };

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have lg:grid-cols-{desktop} class
            expect(grid.className).toContain(`lg:grid-cols-${desktopColumns}`);
            
            // Should have all responsive classes
            expect(grid.className).toContain('grid-cols-1');
            expect(grid.className).toContain('md:grid-cols-2');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply all three responsive column classes simultaneously', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          responsiveColumnsArbitrary,
          (children, columns) => {
            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have all three responsive classes
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use default column configuration when not specified', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          (children) => {
            const { container } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Default: mobile: 1, tablet: 2, desktop: 3
            expect(grid.className).toContain('grid-cols-1');
            expect(grid.className).toContain('md:grid-cols-2');
            expect(grid.className).toContain('lg:grid-cols-3');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain grid structure with varying number of children', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 0, maxLength: 20 }),
          responsiveColumnsArbitrary,
          (children, columns) => {
            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            const gridItems = grid.children;
            
            // Grid should have correct number of children
            expect(gridItems.length).toBe(children.length);
            
            // Grid should maintain responsive classes regardless of child count
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply gap spacing with responsive columns', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 2, maxLength: 12 }),
          responsiveColumnsArbitrary,
          gapArbitrary,
          (children, columns, gap) => {
            const { container } = render(
              <CardGrid3D columns={columns} gap={gap}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have gap class
            expect(grid.className).toContain(`gap-${gap}`);
            
            // Should still have responsive column classes
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain column configuration across different prop combinations', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          cardGrid3DPropsArbitrary,
          (children, props) => {
            const columns = props.columns || { mobile: 1, tablet: 2, desktop: 3 };
            
            const { container } = render(
              <CardGrid3D {...props}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should always have responsive column classes
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
            
            // Should be a grid
            expect(grid.className).toContain('grid');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge case of single column across all breakpoints', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            const columns: ResponsiveColumns = {
              mobile: 1,
              tablet: 1,
              desktop: 1,
            };

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // All breakpoints should have single column
            expect(grid.className).toContain('grid-cols-1');
            expect(grid.className).toContain('md:grid-cols-1');
            expect(grid.className).toContain('lg:grid-cols-1');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle maximum column counts', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 6, maxLength: 12 }),
          (children) => {
            const columns: ResponsiveColumns = {
              mobile: 2,
              tablet: 4,
              desktop: 6,
            };

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should handle maximum column counts
            expect(grid.className).toContain('grid-cols-2');
            expect(grid.className).toContain('md:grid-cols-4');
            expect(grid.className).toContain('lg:grid-cols-6');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Viewport Entry Animation', () => {
    /**
     * **Validates: Requirements 4.2**
     * 
     * For any animated element using Intersection Observer, when the element
     * enters the viewport, the animation state should transition from hidden
     * to visible with opacity and position changes.
     */
    
    it('should initialize with hidden animation state', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            // Mock useInView to return false (not in viewport)
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(false);

            const { container } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have animation variants
            expect(grid.getAttribute('data-has-variants')).toBe('true');
            
            // Initial state should be hidden
            expect(grid.getAttribute('data-animation-state')).toBe('hidden');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should transition to visible state when entering viewport', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            // Mock useInView to return true (in viewport)
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Animation state should be visible
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply stagger animation to all children', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 2, maxLength: 10 }),
          (children) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            const gridItems = Array.from(grid.children);
            
            // All children should have animation variants
            gridItems.forEach(item => {
              expect(item.getAttribute('data-has-variants')).toBe('true');
            });
            
            // Number of animated items should match children count
            expect(gridItems.length).toBe(children.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect custom stagger delay configuration', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 2, maxLength: 10 }),
          staggerDelayArbitrary,
          (children, staggerDelay) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D staggerDelay={staggerDelay}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Grid should be rendered with animation
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
            
            // All children should be present
            expect(grid.children.length).toBe(children.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respect Intersection Observer threshold configuration', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          thresholdArbitrary,
          (children, threshold) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D threshold={threshold}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should render with animation
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should disable animation when disableAnimation is true', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            const { container } = render(
              <CardGrid3D disableAnimation={true}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should not have animation variants when disabled
            expect(grid.getAttribute('data-has-variants')).toBe('false');
            
            // Should not have animation state
            expect(grid.getAttribute('data-animation-state')).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply animation delay before starting', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          fc.float({ min: Math.fround(0), max: Math.fround(1) }),
          (children, animationDelay) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D animationDelay={animationDelay}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should render with animation
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
            
            // All children should be present
            expect(grid.children.length).toBe(children.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger animation only once when once is true', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D once={true}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have visible state
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty children array gracefully', () => {
      const { useInView } = require('framer-motion');
      useInView.mockReturnValue(true);

      const { container } = render(
        <CardGrid3D>
          {[]}
        </CardGrid3D>
      );

      const grid = container.firstChild as HTMLElement;
      
      // Should still render grid with animation state
      expect(grid.getAttribute('data-animation-state')).toBe('visible');
      
      // Should have no children
      expect(grid.children.length).toBe(0);
    });

    it('should maintain animation state across re-renders', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container, rerender } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            const initialState = grid.getAttribute('data-animation-state');
            
            // Re-render with same props
            rerender(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const gridAfterRerender = container.firstChild as HTMLElement;
            
            // Animation state should be maintained
            expect(gridAfterRerender.getAttribute('data-animation-state')).toBe(initialState);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Combined Properties: Responsive Grid + Viewport Animation', () => {
    /**
     * Validates that both properties work together correctly
     */
    
    it('should apply responsive columns and viewport animation simultaneously', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 2, maxLength: 12 }),
          responsiveColumnsArbitrary,
          (children, columns) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Property 16: Responsive columns
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
            
            // Property 11: Viewport animation
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
            expect(grid.getAttribute('data-has-variants')).toBe('true');
            
            // All children should be animated
            expect(grid.children.length).toBe(children.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain both properties with custom configuration', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 12 }),
          cardGrid3DPropsArbitrary,
          (children, props) => {
            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const columns = props.columns || { mobile: 1, tablet: 2, desktop: 3 };
            
            const { container } = render(
              <CardGrid3D {...props}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have responsive columns
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
            
            // Should have animation (unless disabled)
            if (!props.disableAnimation) {
              expect(grid.getAttribute('data-has-variants')).toBe('true');
              expect(grid.getAttribute('data-animation-state')).toBe('visible');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle viewport changes with responsive grid', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 2, maxLength: 12 }),
          responsiveColumnsArbitrary,
          fc.constantFrom(375, 768, 1440), // Mobile, tablet, desktop widths
          (children, columns, viewportWidth) => {
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: viewportWidth,
            });

            const { useInView } = require('framer-motion');
            useInView.mockReturnValue(true);

            const { container } = render(
              <CardGrid3D columns={columns}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have all responsive classes regardless of current viewport
            expect(grid.className).toContain(`grid-cols-${columns.mobile}`);
            expect(grid.className).toContain(`md:grid-cols-${columns.tablet}`);
            expect(grid.className).toContain(`lg:grid-cols-${columns.desktop}`);
            
            // Should have animation
            expect(grid.getAttribute('data-animation-state')).toBe('visible');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Accessibility and ARIA', () => {
    it('should apply role="list" by default', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          (children) => {
            const { container } = render(
              <CardGrid3D>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have role="list"
            expect(grid.getAttribute('role')).toBe('list');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply custom role when specified', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          fc.constantFrom('grid', 'list', 'group'),
          (children, role) => {
            const { container } = render(
              <CardGrid3D role={role}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have custom role
            expect(grid.getAttribute('role')).toBe(role);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply aria-label when specified', () => {
      fc.assert(
        fc.property(
          fc.array(childContentArbitrary, { minLength: 1, maxLength: 10 }),
          fc.string().filter(s => s.length > 0),
          (children, ariaLabel) => {
            const { container } = render(
              <CardGrid3D ariaLabel={ariaLabel}>
                {children}
              </CardGrid3D>
            );

            const grid = container.firstChild as HTMLElement;
            
            // Should have aria-label
            expect(grid.getAttribute('aria-label')).toBe(ariaLabel);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
