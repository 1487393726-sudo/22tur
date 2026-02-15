/**
 * Property-Based Tests for FlipCard3D Component
 * 
 * Feature: website-3d-redesign
 * Tests Property 23 from the design document
 * 
 * Property 23: Flip Card Rotation
 * 
 * Validates: Requirements 9.2, 11.3
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { FlipCard3D } from '../FlipCard3D';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, any>(({ children, animate, variants, style, initial, ...props }, ref) => {
        // Extract rotation from animate state - this happens synchronously in tests
        const rotateY = animate === 'back' 
          ? (variants?.back?.rotateY || 180)
          : (variants?.front?.rotateY || 0);
        
        return (
          <div 
            ref={ref} 
            {...props}
            data-animation-state={animate}
            data-rotate-y={rotateY}
            style={{
              ...style,
              transform: `rotateY(${rotateY}deg)`,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            }}
          >
            {children}
          </div>
        );
      }),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

// Mock animations
jest.mock('@/lib/animations/variants', () => ({
  cardFlip: {
    front: { rotateY: 0 },
    back: { rotateY: 180 },
  },
}));

jest.mock('@/lib/animations/transitions', () => ({
  cardTransitions: {
    flip: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}));

// Mock 3d-transforms utilities
jest.mock('@/lib/utils/3d-transforms', () => ({
  getDepthShadow: jest.fn((level: string) => {
    const shadows = {
      shallow: '0 2px 4px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.05)',
      medium: '0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08), 0 12px 24px rgba(0,0,0,0.05)',
      deep: '0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.1), 0 24px 48px rgba(0,0,0,0.08), 0 32px 64px rgba(0,0,0,0.05)',
    };
    return shadows[level as keyof typeof shadows] || shadows.medium;
  }),
}));

// Arbitraries for generating test data
const cardContentArbitrary = fc.oneof(
  fc.string(),
  fc.constant(<div>Front Content</div>),
  fc.constant(<p>Front Paragraph</p>),
  fc.constant(<article>Front Article</article>),
  fc.constant(<section>Front Section</section>)
);

const backContentArbitrary = fc.oneof(
  fc.string(),
  fc.constant(<div>Back Content</div>),
  fc.constant(<p>Back Paragraph</p>),
  fc.constant(<article>Back Article</article>),
  fc.constant(<section>Back Section</section>)
);

const flipTriggerArbitrary = fc.constantFrom('hover', 'click');
const glassEffectArbitrary = fc.constantFrom('light', 'medium', 'heavy', 'none');
const depthArbitrary = fc.constantFrom('shallow', 'medium', 'deep');
const booleanArbitrary = fc.boolean();

const flipCard3DPropsArbitrary = fc.record({
  flipTrigger: fc.option(flipTriggerArbitrary, { nil: undefined }),
  glassEffect: fc.option(glassEffectArbitrary, { nil: undefined }),
  depth: fc.option(depthArbitrary, { nil: undefined }),
  initialFlipped: fc.option(booleanArbitrary, { nil: undefined }),
  disabled: fc.option(booleanArbitrary, { nil: undefined }),
  isRTL: fc.option(booleanArbitrary, { nil: undefined }),
  className: fc.option(fc.string(), { nil: undefined }),
});

describe('FlipCard3D Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Property 23: Flip Card Rotation', () => {
    /**
     * **Validates: Requirements 9.2, 11.3**
     * 
     * For any flip card component, when the flip trigger event occurs (click or hover),
     * the card's rotateY transform should transition from 0deg to 180deg or vice versa.
     */
    
    it('should initialize with 0deg rotation (front face)', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipCard3DPropsArbitrary,
          (frontContent, backContent, props) => {
            // Ensure not initially flipped
            const testProps = { ...props, initialFlipped: false };
            
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                {...testProps}
              />
            );

            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should be in front state
            expect(motionDiv).toBeInTheDocument();
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rotate to 180deg when flipped (back face)', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipCard3DPropsArbitrary,
          (frontContent, backContent, props) => {
            // Ensure initially flipped
            const testProps = { ...props, initialFlipped: true };
            
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                {...testProps}
              />
            );

            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should be in back state
            expect(motionDiv).toBeInTheDocument();
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            
            // Rotation should be 180 or -180 depending on RTL
            const rotation = motionDiv.getAttribute('data-rotate-y');
            const expectedRotation = testProps.isRTL ? '-180' : '180';
            expect(rotation).toBe(expectedRotation);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flip from 0deg to 180deg on click trigger', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container, rerender } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
            
            // Click to flip - this triggers a state change
            fireEvent.click(card);
            
            // Re-query after state change
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flip from 180deg back to 0deg on second click', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Click to flip to back
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            
            // Click again to flip back to front
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should flip to 180deg on hover trigger (mouse enter)', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="hover"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            
            // Hover to flip
            fireEvent.mouseEnter(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flip back to 0deg on hover trigger (mouse leave)', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="hover"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Hover to flip to back
            fireEvent.mouseEnter(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            
            // Leave to flip back to front
            fireEvent.mouseLeave(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should flip on Enter key press', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            
            // Press Enter to flip
            card.focus();
            fireEvent.keyDown(card, { key: 'Enter' });
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should flip on Space key press', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            
            // Press Space to flip
            card.focus();
            fireEvent.keyDown(card, { key: ' ' });
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not flip when disabled', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipTriggerArbitrary,
          (frontContent, backContent, flipTrigger) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger={flipTrigger}
                disabled={true}
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            
            // Try to flip with click
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Try to flip with hover
            fireEvent.mouseEnter(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Try to flip with keyboard
            card.focus();
            fireEvent.keyDown(card, { key: 'Enter' });
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should remain at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle rapid flip toggles correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          fc.integer({ min: 3, max: 10 }),
          (frontContent, backContent, clickCount) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Perform rapid clicks
            for (let i = 0; i < clickCount; i++) {
              fireEvent.click(card);
            }
            
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Final state should match the parity of clicks
            const expectedState = clickCount % 2 === 0 ? 'front' : 'back';
            const expectedRotation = clickCount % 2 === 0 ? '0' : '180';
            
            expect(motionDiv.getAttribute('data-animation-state')).toBe(expectedState);
            expect(motionDiv.getAttribute('data-rotate-y')).toBe(expectedRotation);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain rotation state across different prop combinations', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          glassEffectArbitrary,
          depthArbitrary,
          (frontContent, backContent, glassEffect, depth) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                glassEffect={glassEffect}
                depth={depth}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Click to flip
            fireEvent.click(card);
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg regardless of other props
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply RTL rotation (-180deg) when isRTL is true', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                isRTL={true}
                initialFlipped={true}
              />
            );

            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should be in back state with negative rotation for RTL
            expect(motionDiv).toBeInTheDocument();
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('-180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply standard rotation (180deg) when isRTL is false', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                isRTL={false}
                initialFlipped={true}
              />
            );

            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should be in back state with positive rotation for LTR
            expect(motionDiv).toBeInTheDocument();
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should work with controlled flip state', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          booleanArbitrary,
          (frontContent, backContent, isFlipped) => {
            const { container, rerender } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                isFlipped={isFlipped}
              />
            );

            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should match controlled state
            const expectedState = isFlipped ? 'back' : 'front';
            const expectedRotation = isFlipped ? '180' : '0';
            
            expect(motionDiv.getAttribute('data-animation-state')).toBe(expectedState);
            expect(motionDiv.getAttribute('data-rotate-y')).toBe(expectedRotation);
            
            // Change controlled state
            rerender(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                isFlipped={!isFlipped}
              />
            );
            
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should update to new state
            const newExpectedState = !isFlipped ? 'back' : 'front';
            const newExpectedRotation = !isFlipped ? '180' : '0';
            
            expect(motionDiv.getAttribute('data-animation-state')).toBe(newExpectedState);
            expect(motionDiv.getAttribute('data-rotate-y')).toBe(newExpectedRotation);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should call onFlipChange callback with correct state', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const onFlipChange = jest.fn();
            
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                onFlipChange={onFlipChange}
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Click to flip
            fireEvent.click(card);
            
            // Should call callback with true (flipped to back)
            expect(onFlipChange).toHaveBeenCalledWith(true);
            
            // Click again to flip back
            fireEvent.click(card);
            
            // Should call callback with false (flipped to front)
            expect(onFlipChange).toHaveBeenCalledWith(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain rotation with different content types', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.constant(<div>Div</div>),
            fc.constant(<p>Paragraph</p>),
            fc.constant(<article>Article</article>),
            fc.constant(<section>Section</section>),
            fc.constant(null),
            fc.constant(<><span>Multiple</span><span>Children</span></>)
          ),
          fc.oneof(
            fc.string(),
            fc.constant(<div>Back Div</div>),
            fc.constant(<p>Back Paragraph</p>),
            fc.constant(<article>Back Article</article>),
            fc.constant(<section>Back Section</section>),
            fc.constant(null),
            fc.constant(<><span>Back Multiple</span><span>Back Children</span></>)
          ),
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Click to flip
            fireEvent.click(card);
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg regardless of content type
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve 3D transform properties during flip', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                initialFlipped={false}
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Check initial 3D properties
            expect(motionDiv.getAttribute('style')).toContain('transform-style');
            expect(motionDiv.getAttribute('style')).toContain('preserve-3d');
            
            // Click to flip
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should maintain 3D properties after flip
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('style')).toContain('transform-style');
            expect(motionDiv.getAttribute('style')).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Additional Flip Card Properties', () => {
    it('should apply glass effect classes on both faces', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          glassEffectArbitrary,
          (frontContent, backContent, glassEffect) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                glassEffect={glassEffect}
              />
            );

            const faces = container.querySelectorAll('.backface-hidden');
            
            if (glassEffect === 'none') {
              // Should not have glass classes
              faces.forEach(face => {
                expect(face.className).not.toMatch(/glass-(light|medium|heavy)/);
              });
            } else {
              // Both faces should have glass effect
              faces.forEach(face => {
                expect(face.className).toContain(`glass-${glassEffect}`);
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply depth shadows on both faces', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          depthArbitrary,
          (frontContent, backContent, depth) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                depth={depth}
              />
            );

            const faces = container.querySelectorAll('.backface-hidden');
            
            // Both faces should have box-shadow
            faces.forEach(face => {
              const style = (face as HTMLElement).getAttribute('style') || '';
              expect(style).toContain('box-shadow');
              expect(style).toMatch(/rgba\(/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct ARIA attributes', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipTriggerArbitrary,
          booleanArbitrary,
          (frontContent, backContent, flipTrigger, isFlipped) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger={flipTrigger}
                initialFlipped={isFlipped}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have aria-label
            expect(card).toHaveAttribute('aria-label');
            expect(card.getAttribute('aria-label')).toContain('Flip card');
            
            // Should indicate current state
            const expectedState = isFlipped ? 'back' : 'front';
            expect(card.getAttribute('aria-label')).toContain(expectedState);
            
            // Should have aria-pressed for click trigger
            if (flipTrigger === 'click') {
              expect(card).toHaveAttribute('aria-pressed');
              expect(card.getAttribute('aria-pressed')).toBe(isFlipped.toString());
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have correct role attribute based on trigger', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipTriggerArbitrary,
          (frontContent, backContent, flipTrigger) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger={flipTrigger}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            if (flipTrigger === 'click') {
              // Should have button role for click trigger
              expect(card).toHaveAttribute('role', 'button');
            } else {
              // Should not have button role for hover trigger
              expect(card).not.toHaveAttribute('role', 'button');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be keyboard accessible', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          booleanArbitrary,
          (frontContent, backContent, disabled) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                disabled={disabled}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            if (disabled) {
              // Should not be focusable when disabled
              expect(card).toHaveAttribute('tabIndex', '-1');
            } else {
              // Should be focusable when enabled
              expect(card).toHaveAttribute('tabIndex', '0');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply custom className', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          fc.string().filter(s => s.trim().length > 0).map(s => s.trim()),
          (frontContent, backContent, customClass) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                className={customClass}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have custom class
            expect(card.className).toContain(customClass);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply custom width and height', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          fc.oneof(
            fc.integer({ min: 100, max: 1000 }),
            fc.constantFrom('100%', '50%', 'auto', '20rem')
          ),
          fc.oneof(
            fc.integer({ min: 100, max: 1000 }),
            fc.constantFrom('100%', '50%', 'auto', '20rem')
          ),
          (frontContent, backContent, width, height) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                width={width}
                height={height}
              />
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // Should have width and height styles
            expect(style).toContain('width');
            expect(style).toContain('height');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty content gracefully', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(null, undefined, ''),
          fc.constantFrom(null, undefined, ''),
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
              />
            );

            const card = container.firstChild as HTMLElement;
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should render without crashing
            expect(card).toBeInTheDocument();
            expect(motionDiv).toBeInTheDocument();
            
            // Should still be flippable
            fireEvent.click(card);
            const motionDivAfter = container.querySelector('[data-animation-state]') as HTMLElement;
            
            expect(motionDivAfter.getAttribute('data-animation-state')).toBe('back');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle very large content', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1000, maxLength: 5000 }),
          fc.string({ minLength: 1000, maxLength: 5000 }),
          (frontText, backText) => {
            const { container } = render(
              <FlipCard3D
                frontContent={<div>{frontText}</div>}
                backContent={<div>{backText}</div>}
              />
            );

            const card = container.firstChild as HTMLElement;
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should render without crashing
            expect(card).toBeInTheDocument();
            expect(motionDiv).toBeInTheDocument();
            
            // Should still be flippable
            fireEvent.click(card);
            const motionDivAfter = container.querySelector('[data-animation-state]') as HTMLElement;
            
            expect(motionDivAfter.getAttribute('data-animation-state')).toBe('back');
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle mobile viewport correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 375,
            });

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="hover"
              />
            );

            const card = container.firstChild as HTMLElement;
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Hover should not work on mobile
            fireEvent.mouseEnter(card);
            
            // Should remain in front state (mobile disables hover)
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle perspective container correctly', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          (frontContent, backContent) => {
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
              />
            );

            const card = container.firstChild as HTMLElement;
            const style = card.getAttribute('style') || '';
            
            // Should have perspective property
            expect(style).toContain('perspective');
            expect(style).toContain('1000px');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Integration with Other Properties', () => {
    it('should work correctly with all props combined', () => {
      fc.assert(
        fc.property(
          cardContentArbitrary,
          backContentArbitrary,
          flipCard3DPropsArbitrary,
          (frontContent, backContent, props) => {
            const onFlipChange = jest.fn();
            
            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                {...props}
                onFlipChange={onFlipChange}
              />
            );

            const card = container.firstChild as HTMLElement;
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should render correctly
            expect(card).toBeInTheDocument();
            expect(motionDiv).toBeInTheDocument();
            
            // If not disabled, should be flippable
            if (!props.disabled) {
              // Use appropriate trigger based on flipTrigger prop
              if (props.flipTrigger === 'hover') {
                fireEvent.mouseEnter(card);
              } else {
                // Default is click
                fireEvent.click(card);
              }
              expect(onFlipChange).toHaveBeenCalled();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
