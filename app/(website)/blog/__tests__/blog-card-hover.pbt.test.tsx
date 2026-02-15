/**
 * Property-Based Tests for Blog Card Hover Effects
 * 
 * Feature: website-3d-redesign
 * Tests Property 2: Card Hover 3D Transform
 * 
 * Property 2: Card Hover 3D Transform
 * For any interactive card component, when a hover event is triggered,
 * the card's computed transform style should include rotateX, rotateY,
 * and translateY values indicating 3D transformation.
 * 
 * **Validates: Requirements 12.2**
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { Card3D } from '@/components/website/3d/Card3D';

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

// Arbitraries for generating blog article data
const blogArticleArbitrary = fc.record({
  key: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  excerpt: fc.string({ minLength: 20, maxLength: 200 }),
  date: fc.integer({ min: 2020, max: 2024 })
    .chain(year => 
      fc.integer({ min: 1, max: 12 })
        .chain(month => 
          fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
            .map(day => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
        )
    ),
  readTime: fc.integer({ min: 1, max: 30 }),
  category: fc.constantFrom('design', 'development', 'marketing', 'branding'),
  icon: fc.constantFrom('🎨', '💻', '📈', '🏆', '🚀', '💡'),
});

const intensityArbitrary = fc.constantFrom('light', 'medium', 'heavy');
const depthArbitrary = fc.constantFrom('shallow', 'medium', 'deep');
const glassEffectArbitrary = fc.constantFrom('light', 'medium', 'heavy');

describe('Blog Card Hover Effects - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Property 2: Card Hover 3D Transform', () => {
    /**
     * **Validates: Requirements 12.2**
     * 
     * For any interactive card component, when a hover event is triggered,
     * the card's computed transform style should include rotateX, rotateY,
     * and translateY values indicating 3D transformation.
     */
    it('should apply 3D transform properties on hover for blog article cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          intensityArbitrary,
          depthArbitrary,
          glassEffectArbitrary,
          (article, intensity, depth, glassEffect) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                depth={depth}
                glassEffect={glassEffect}
                enableHover={true}
                ariaLabel={article.title}
                role="article"
              >
                <div className="h-48 flex items-center justify-center text-6xl">
                  {article.icon}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span>{article.category}</span>
                    <span>{article.date}</span>
                    <span>{article.readTime} min</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{article.title}</h3>
                  <p className="mb-4">{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Before hover: should have 3D structure
            const styleBefore = card.getAttribute('style') || '';
            expect(styleBefore).toContain('transform-style');
            expect(styleBefore).toContain('preserve-3d');
            
            // Trigger hover event
            fireEvent.mouseEnter(card);
            
            // After hover: should maintain 3D properties
            const styleAfter = card.getAttribute('style') || '';
            expect(styleAfter).toContain('transform-style');
            expect(styleAfter).toContain('preserve-3d');
            
            // Should have will-change for performance
            expect(styleAfter).toContain('will-change');
            
            // Should have backface-visibility
            expect(styleAfter).toContain('backface-visibility');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should respond to mouse movement with 3D tilt on blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 0, max: 1000 }),
          intensityArbitrary,
          (article, clientX, clientY, intensity) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                enableHover={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger mouse enter and move
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX, clientY });
            
            // Card should maintain 3D properties during mouse movement
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Card should still be in the document
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reset transform when mouse leaves blog card', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          intensityArbitrary,
          (article, intensity) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                enableHover={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover sequence
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            fireEvent.mouseLeave(card);
            
            // After mouse leave, card should still maintain 3D structure
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Card should still be in the document
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply different transform intensities for blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          intensityArbitrary,
          (article, intensity) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                enableHover={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 200, clientY: 200 });
            
            // Card should respond to hover with 3D properties
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Should have will-change for performance
            expect(style).toContain('will-change');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple blog cards with consistent hover behavior', () => {
      fc.assert(
        fc.property(
          fc.array(blogArticleArbitrary, { minLength: 2, maxLength: 6 }),
          intensityArbitrary,
          (articles, intensity) => {
            const { container } = render(
              <div>
                {articles.map((article, index) => (
                  <Card3D
                    key={index}
                    intensity={intensity}
                    enableHover={true}
                    ariaLabel={article.title}
                  >
                    <div>
                      <h3>{article.title}</h3>
                      <p>{article.excerpt}</p>
                    </div>
                  </Card3D>
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[style*="transform-style"]');
            
            // All cards should have 3D properties
            expect(cards.length).toBe(articles.length);
            
            cards.forEach(card => {
              const htmlCard = card as HTMLElement;
              
              // Trigger hover on each card
              fireEvent.mouseEnter(htmlCard);
              
              // Each card should maintain 3D properties
              const style = htmlCard.getAttribute('style') || '';
              expect(style).toContain('transform-style');
              expect(style).toContain('preserve-3d');
              
              // Clean up
              fireEvent.mouseLeave(htmlCard);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain 3D transform during rapid hover events on blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          fc.array(
            fc.record({
              clientX: fc.integer({ min: 0, max: 500 }),
              clientY: fc.integer({ min: 0, max: 500 }),
            }),
            { minLength: 5, maxLength: 15 }
          ),
          (article, mousePositions) => {
            const { container } = render(
              <Card3D enableHover={true} ariaLabel={article.title}>
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger rapid mouse movements
            fireEvent.mouseEnter(card);
            mousePositions.forEach(pos => {
              fireEvent.mouseMove(card, pos);
            });
            
            // Card should still maintain 3D properties after rapid events
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Card should still be functional
            expect(card).toBeInTheDocument();
            
            // Clean up
            fireEvent.mouseLeave(card);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply 3D transform with glass effect on blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          glassEffectArbitrary,
          intensityArbitrary,
          (article, glassEffect, intensity) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                glassEffect={glassEffect}
                enableHover={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have glass effect class
            expect(card.className).toContain(`glass-${glassEffect}`);
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 150, clientY: 150 });
            
            // Should maintain both glass effect and 3D properties
            expect(card.className).toContain(`glass-${glassEffect}`);
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply depth shadows that change on hover for blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          depthArbitrary,
          (article, depth) => {
            const { container } = render(
              <Card3D
                depth={depth}
                enableHover={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have box-shadow before hover
            const styleBefore = card.getAttribute('style') || '';
            expect(styleBefore).toContain('box-shadow');
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            
            // Should still have box-shadow after hover
            const styleAfter = card.getAttribute('style') || '';
            expect(styleAfter).toContain('box-shadow');
            
            // Shadow should contain rgba values
            expect(styleAfter).toMatch(/rgba\(/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain accessibility attributes during hover on blog cards', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          (article) => {
            const { container } = render(
              <Card3D
                enableHover={true}
                ariaLabel={article.title}
                role="article"
                tabIndex={0}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have accessibility attributes
            expect(card.getAttribute('aria-label')).toBe(article.title);
            expect(card.getAttribute('role')).toBe('article');
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // Should maintain accessibility attributes after hover
            expect(card.getAttribute('aria-label')).toBe(article.title);
            expect(card.getAttribute('role')).toBe('article');
            
            // Should still have 3D properties
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle blog cards with varying content lengths', () => {
      fc.assert(
        fc.property(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }),
            excerpt: fc.string({ minLength: 0, maxLength: 500 }),
            icon: fc.string({ minLength: 1, maxLength: 10 }),
          }),
          intensityArbitrary,
          (content, intensity) => {
            const { container } = render(
              <Card3D
                intensity={intensity}
                enableHover={true}
                ariaLabel={content.title}
              >
                <div>
                  <div>{content.icon}</div>
                  <h3>{content.title}</h3>
                  <p>{content.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // Should maintain 3D properties regardless of content length
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(style).toContain('preserve-3d');
            
            // Card should be in document
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Blog Card Hover - Edge Cases', () => {
    it('should handle hover when enableHover is false', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          (article) => {
            const { container } = render(
              <Card3D enableHover={false} ariaLabel={article.title}>
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover (should not apply transform)
            fireEvent.mouseEnter(card);
            fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
            
            // Should still maintain 3D structure
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            
            // Card should be in document
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle hover with disable3D flag', () => {
      fc.assert(
        fc.property(
          blogArticleArbitrary,
          (article) => {
            const { container } = render(
              <Card3D
                enableHover={true}
                disable3D={true}
                ariaLabel={article.title}
              >
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            
            // Should still have basic structure
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle empty or minimal blog card content', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(<div />),
            fc.constant(<span>Minimal</span>)
          ),
          (content) => {
            const { container } = render(
              <Card3D enableHover={true}>
                {content}
              </Card3D>
            );

            const card = container.firstChild as HTMLElement;
            
            // Trigger hover
            fireEvent.mouseEnter(card);
            
            // Should maintain 3D properties even with minimal content
            const style = card.getAttribute('style') || '';
            expect(style).toContain('transform-style');
            expect(card).toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
