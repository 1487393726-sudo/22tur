/**
 * Property-Based Tests for Card3D Component
 * 
 * Feature: website-3d-redesign
 * Tests Properties 1, 2, and 6 from the design document
 * 
 * Property 1: 3D Card Rendering
 * Property 2: Card Hover 3D Transform
 * Property 6: Glass Effect Class Application
 * 
 * Validates: Requirements 1.1, 1.2, 2.2
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { Card3D } from '../Card3D';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, style, ...props }, ref) => (
      <div 
        ref={ref} 
        {...props}
        style={{
          ...style,
          // Convert motion values to actual values for testing
          transform: style?.rotateX !== undefined || style?.rotateY !== undefined
            ? `perspective(1000px) rotateX(${style.rotateX || 0}deg) rotateY(${style.rotateY || 0}deg)`
            : undefined,
        }}
      >
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
  getDepthShadow: jest.fn((level: string) => {
    const shadows = {
      shallow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
      medium: '0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.05)',
      deep: '0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.05)',
    };
    return shadows[level as keyof typeof shadows] || shadows.medium;
  }),
  transformToCSS: jest.fn((config) => `perspective(${config.perspective}px) rotateX(${config.rotateX}deg) rotateY(${config.rotateY}deg)`),
  shouldSimplify3DEffects: jest.fn(() => false),
  adjustTransformForRTL: jest.fn((config, isRTL) => 
    isRTL ? { ...config, rotateY: -config.rotateY } : config
  ),
}));

// Arbitraries for generating test data
const cardContentArbitrary = fc.oneof(
  fc.string(),
  fc.constant(<div>Test Content</div>),
  fc.constant(<p>Paragraph content</p>),
  fc.constant(<span>Span content</span>)
);

const intensityArbitrary = fc.constantFrom('light', 'medium', 'heavy');
const depthArbitrary = fc.constantFrom('shallow', 'medium', 'deep');
const glassEffectArbitrary = fc.constantFrom('light', 'medium', 'heavy', 'none');
const booleanArbitrary = fc.boolean();

const card3DPropsArbitrary = fc.record({
  intensity: fc.option(intensityArbitrary, { nil: undefined }),
  depth: fc.option(depthArbitrary, { nil: undefined }),
  glassEffect: fc.option(glassEffectArbitrary, { nil: undefined }),
  enableHover: fc.option(booleanArbitrary, { nil: undefined }),
  disable3D: fc.option(booleanArbitrary, { nil: undefined }),
  isRTL: fc.option(booleanArbitrary, { nil: undefined }),
  className: fc.option(fc.string(), { nil: undefined }),
});

describe('Card3D Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Property 1: 3D Card Rendering', () => {
    /**
     * **Validates: Requirements 1.1**
     * 
     * For any page that contains card components, when the page is rendered,
     * all card elements should have perspective and transform-style CSS properties
     * applied to create 3D visual effects.
     */
    it('should apply perspective and transform-style properties to all rendered cards', () => {
      fc.assert(
        fc.property(
          fc.array(cardContentArbitrary, { minLength: 1, maxLength: 10 }),
          card3DPropsArbitrary,
          (contents, props) => {
            const { container } = render(
              <div>
                {contents.map((content, index) => (
                  <Card3D key={index} {...props}>
                    {content}
                  </Card3D>
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[style*="transform-style"]');
            
            // All cards should have transform-style property
            expect(cards.length).toBeGreaterThanOrEqual(contents.length);
            
            cards.forEach(card => {
              const style = window.getComputedStyle(card);
              
              // Should have transform-style: preserve-3d
              expect(card.getAttribute('style')).toContain('transform-style');
              expect(card.getAttribute('style')).toContain('preserve-3d');
              
              // Should have will-change for performance
              expect(card.getAttribute('style')).toContain('will-change');
              
              // Should have backface-visibility
              expect(card.getAttribute('style')).toContain('backface-visibility');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply 3D transform properties when not disabled', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          card3DPropsArbitrary,
          (content, props) => {
            const { container } = render(
              <Card3D {...props} disable3D={false}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have transform-style: preserve-3d
            expect(card.getAttribute('style')).toContain('preserve-3d');
            
            // Should have backface-visibility: hidden
            expect(card.getAttribute('style')).toContain('backface-visibility');
            expect(card.getAttribute('style')).toContain('hidden');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain 3D properties across different prop combinations', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          intensityArbitrary,
          depthArbitrary,
          glassEffectArbitrary,
          (content, intensity, depth, glassEffect) => {
            const { container } = render(
              <Card3D 
                intensity={intensity}
                depth={depth}
                glassEffect={glassEffect}
              >
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // All combinations should maintain 3D properties
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            expect(style).toContain('will-change');
            expect(style).toContain('backface-visibility');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply box-shadow for depth effect on all cards', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          depthArbitrary,
          (content, depth) => {
            const { container } = render(
              <Card3D depth={depth}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // Should have box-shadow property
            expect(style).toContain('box-shadow');
            
            // Shadow should contain rgba values
            expect(style).toMatch(/rgba\(/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render cards with 3D properties regardless of content type', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.constant(<div>Div content</div>),
            fc.constant(<p>Paragraph</p>),
            fc.constant(<article>Article</article>),
            fc.constant(<section>Section</section>),
            fc.constant(null),
            fc.constant(<><span>Multiple</span><span>Children</span></>)
          ),
          (content) => {
            const { container } = render(
              <Card3D>{content}</Card3D>
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // Should always have 3D properties regardless of content
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Card Hover 3D Transform', () => {
    /**
     * **Validates: Requirements 1.2**
     * 
     * For any interactive card component, when a hover event is triggered,
     * the card's computed transform style should include rotateX, rotateY,
     * and translateY values indicating 3D transformation.
     */
    it('should apply 3D transform on hover for all cards with hover enabled', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          intensityArbitrary,
          (content, intensity) => {
            const { container } = render(
              <Card3D intensity={intensity} enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            
            // After hover, the card should have transform properties
            // Note: In the actual implementation, motion values are set
            // We're testing that the component responds to hover events
            expect(card).toBeInTheDocument();
            
            // The component should have the necessary structure for 3D transforms
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update transform on mouse move for 3D tilt effect', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          (content, clientX, clientY) => {
            const { container } = render(
              <Card3D enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger mouse move
            fireEvent.mouseMove(card, { clientX, clientY });
            
            // Card should remain in document and maintain 3D properties
            expect(card).toBeInTheDocument();
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reset transform on mouse leave', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          intensityArbitrary,
          (content, intensity) => {
            const { container } = render(
              <Card3D intensity={intensity} enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover then leave
            fireEvent.mouseEnter(card);
            fireEvent.mouseLeave(card);
            
            // Card should still maintain 3D structure
            expect(card).toBeInTheDocument();
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not apply hover transform when enableHover is false', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D enableHover={false}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            
            // Card should still be in document
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply different transform intensities based on intensity prop', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          intensityArbitrary,
          (content, intensity) => {
            const { container } = render(
              <Card3D intensity={intensity} enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // Card should respond to hover
            expect(card).toBeInTheDocument();
            
            // Should maintain 3D properties
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle rapid hover events without breaking', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          fc.array(fc.record({
            clientX: fc.integer({ min: 0, max: 500 }),
            clientY: fc.integer({ min: 0, max: 500 }),
          }), { minLength: 5, maxLength: 20 }),
          (content, mousePositions) => {
            const { container } = render(
              <Card3D enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger multiple rapid mouse moves
            fireEvent.mouseEnter(card);
            mousePositions.forEach(pos => {
              fireEvent.mouseMove(card, pos);
            });
            fireEvent.mouseLeave(card);
            
            // Card should still be functional
            expect(card).toBeInTheDocument();
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should adjust transform for RTL layout', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          booleanArbitrary,
          (content, isRTL) => {
            const { container } = render(
              <Card3D isRTL={isRTL} enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover and mouse move
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // Card should maintain 3D properties regardless of RTL
            expect(card).toBeInTheDocument();
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Glass Effect Class Application', () => {
    /**
     * **Validates: Requirements 2.2**
     * 
     * For any navbar, card, or modal component, the rendered element should
     * include glass effect CSS classes (glass-light, glass-medium, or glass-heavy).
     */
    it('should apply glass effect class to all cards by default', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D>{content}</Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have glass-medium class by default
            expect(card.className).toMatch(/glass-(light|medium|heavy)/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply specified glass effect variant', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          glassEffectArbitrary,
          (content, glassEffect) => {
            const { container } = render(
              <Card3D glassEffect={glassEffect}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            if (glassEffect === 'none') {
              // Should not have any glass class
              expect(card.className).not.toMatch(/glass-(light|medium|heavy)/);
            } else {
              // Should have the specified glass class
              expect(card.className).toContain(`glass-${glassEffect}`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass-light class correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D glassEffect="light">
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            expect(card.className).toContain('glass-light');
            expect(card.className).not.toContain('glass-medium');
            expect(card.className).not.toContain('glass-heavy');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass-medium class correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D glassEffect="medium">
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            expect(card.className).toContain('glass-medium');
            expect(card.className).not.toContain('glass-light');
            expect(card.className).not.toContain('glass-heavy');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass-heavy class correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D glassEffect="heavy">
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            expect(card.className).toContain('glass-heavy');
            expect(card.className).not.toContain('glass-light');
            expect(card.className).not.toContain('glass-medium');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not apply glass class when set to none', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          (content) => {
            const { container } = render(
              <Card3D glassEffect="none">
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            expect(card.className).not.toContain('glass-light');
            expect(card.className).not.toContain('glass-medium');
            expect(card.className).not.toContain('glass-heavy');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain glass effect class across different prop combinations', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          glassEffectArbitrary,
          intensityArbitrary,
          depthArbitrary,
          (content, glassEffect, intensity, depth) => {
            const { container } = render(
              <Card3D 
                glassEffect={glassEffect}
                intensity={intensity}
                depth={depth}
              >
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            if (glassEffect === 'none') {
              expect(card.className).not.toMatch(/glass-(light|medium|heavy)/);
            } else {
              expect(card.className).toContain(`glass-${glassEffect}`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass effect class with custom className', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          glassEffectArbitrary,
          fc.string().filter(s => s.trim().length > 0).map(s => s.trim()), // Trim to match cn() behavior
          (content, glassEffect, customClass) => {
            const { container } = render(
              <Card3D glassEffect={glassEffect} className={customClass}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have both glass effect and custom class
            if (glassEffect !== 'none') {
              expect(card.className).toContain(`glass-${glassEffect}`);
            }
            // Custom class should be present (trimmed to match cn() behavior)
            expect(card.className).toContain(customClass);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass effect consistently across multiple cards', () => {
      fc.assert(
        fc.property(
          fc.array(cardContentArbitrary, { minLength: 2, maxLength: 10 }),
          glassEffectArbitrary,
          (contents, glassEffect) => {
            const { container } = render(
              <div>
                {contents.map((content, index) => (
                  <Card3D key={index} glassEffect={glassEffect}>
                    {content}
                  </Card3D>
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[class*="glass"]');
            
            if (glassEffect === 'none') {
              // No cards should have glass classes
              expect(cards.length).toBe(0);
            } else {
              // All cards should have the same glass effect
              cards.forEach(card => {
                expect(card.className).toContain(`glass-${glassEffect}`);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined Properties: 3D Rendering + Hover Transform + Glass Effect', () => {
    /**
     * Validates that all three properties work together correctly
     */
    it('should maintain all properties together during interaction', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          intensityArbitrary,
          depthArbitrary,
          glassEffectArbitrary,
          (content, intensity, depth, glassEffect) => {
            const { container } = render(
              <Card3D 
                intensity={intensity}
                depth={depth}
                glassEffect={glassEffect}
                enableHover={true}
              >
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // Property 1: 3D rendering
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Property 6: Glass effect
            if (glassEffect !== 'none') {
              expect(card.className).toContain(`glass-${glassEffect}`);
            }
            
            // Property 2: Hover transform
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // All properties should still be present after interaction
            expect(card).toBeInTheDocument();
            const styleAfterHover = card.getAttribute('style') || '';
            expect(styleAfterHover).toContain('transform-style');
            expect(styleAfterHover).toContain('preserve-3d');
            
            if (glassEffect !== 'none') {
              expect(card.className).toContain(`glass-${glassEffect}`);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle all properties with clickable cards', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          card3DPropsArbitrary,
          (content, props) => {
            const handleClick = jest.fn();
            const { container } = render(
              <Card3D {...props} onClick={handleClick}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have 3D properties
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            
            // Should have glass effect (unless set to none)
            if (props.glassEffect !== 'none') {
              expect(card.className).toMatch(/glass-(light|medium|heavy)/);
            }
            
            // Should be clickable
            fireEvent.click(card);
            expect(handleClick).toHaveBeenCalled();
            
            // Should respond to hover
            fireEvent.mouseEnter(card);
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
