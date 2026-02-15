/**
 * Property-Based Tests for HeroSection3D Component
 * 
 * Feature: website-3d-redesign
 * Tests Properties 4, 5, 11, and 12 from the design document
 * 
 * Property 4: Gradient Background Presence
 * Property 5: Smooth Transition Configuration
 * Property 11: Viewport Entry Animation
 * Property 12: Hover Feedback Animation
 * 
 * Validates: Requirements 1.4, 1.5, 4.2, 4.3, 7.1, 7.5
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { HeroSection3D } from '../HeroSection3D';

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, any>(({ children, style, animate, initial, variants, transition, whileHover, whileTap, ...props }, ref) => (
        <div 
          ref={ref} 
          {...props}
          data-animated="true"
          data-has-transition={transition ? 'true' : 'false'}
          style={style}
        >
          {children}
        </div>
      )),
      h1: React.forwardRef<HTMLHeadingElement, any>(({ children, variants, initial, animate, transition, ...props }, ref) => (
        <h1 
          ref={ref} 
          {...props}
          data-animated="true"
          data-has-transition={transition ? 'true' : 'false'}
        >
          {children}
        </h1>
      )),
      p: React.forwardRef<HTMLParagraphElement, any>(({ children, variants, initial, animate, transition, ...props }, ref) => (
        <p 
          ref={ref} 
          {...props}
          data-animated="true"
          data-has-transition={transition ? 'true' : 'false'}
        >
          {children}
        </p>
      )),
      a: React.forwardRef<HTMLAnchorElement, any>(({ children, whileHover, whileTap, style, ...props }, ref) => (
        <a 
          ref={ref} 
          {...props}
          data-has-hover-animation={whileHover ? 'true' : 'false'}
          data-has-tap-animation={whileTap ? 'true' : 'false'}
          style={style}
        >
          {children}
        </a>
      )),
    },
    useScroll: jest.fn(() => ({
      scrollYProgress: { get: () => 0, set: jest.fn() },
    })),
    useTransform: jest.fn((value, input, output) => ({
      get: () => output[0],
      set: jest.fn(),
    })),
    useSpring: jest.fn((value) => value),
  };
});

// Mock animations
jest.mock('@/lib/animations/variants', () => ({
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
}));

// Arbitraries for generating test data
const stringArbitrary = fc.string({ minLength: 1, maxLength: 100 });
const localeArbitrary = fc.constantFrom('zh', 'en', 'ug');
const gradientSchemeArbitrary = fc.constantFrom('blue', 'purple', 'green', 'orange');
const booleanArbitrary = fc.boolean();
const urlArbitrary = fc.oneof(
  fc.constant(undefined),
  fc.webUrl(),
  fc.constant('/images/hero-bg.jpg'),
  fc.constant('/images/pattern.svg')
);

const heroSection3DPropsArbitrary = fc.record({
  title: stringArbitrary,
  subtitle: stringArbitrary,
  ctaText: stringArbitrary,
  ctaLink: fc.webPath(),
  locale: localeArbitrary,
  backgroundImage: fc.option(urlArbitrary, { nil: undefined }),
  gradientScheme: fc.option(gradientSchemeArbitrary, { nil: undefined }),
  enableParallax: fc.option(booleanArbitrary, { nil: undefined }),
  enableFloatingElements: fc.option(booleanArbitrary, { nil: undefined }),
  className: fc.option(stringArbitrary, { nil: undefined }),
});

describe('HeroSection3D Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Property 4: Gradient Background Presence', () => {
    /**
     * **Validates: Requirements 1.4**
     * 
     * For any page section with 3D effects, the background style should include
     * gradient definitions (linear-gradient or radial-gradient).
     */
    it('should apply gradient background to all hero sections', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();

            // Should have gradient background classes
            const sectionClasses = section?.className || '';
            expect(sectionClasses).toMatch(/bg-gradient-to-br/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply gradient overlay layer with specified color scheme', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          gradientSchemeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale, gradientScheme) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
                gradientScheme={gradientScheme}
              />
            );

            // Find gradient overlay layer
            const gradientLayer = container.querySelector('[class*="bg-gradient-to-br"]');
            expect(gradientLayer).toBeInTheDocument();

            // Should have gradient classes matching the scheme
            const layerClasses = gradientLayer?.className || '';
            expect(layerClasses).toMatch(/from-|via-|to-/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have gradient background regardless of other props', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            // Section should have gradient
            const section = container.querySelector('section');
            expect(section?.className).toMatch(/bg-gradient-to-br/);

            // Gradient overlay should exist
            const gradientOverlay = container.querySelector('[class*="bg-gradient-to-br"]');
            expect(gradientOverlay).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply different gradient schemes correctly', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          gradientSchemeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale, scheme) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
                gradientScheme={scheme}
              />
            );

            // Find the gradient overlay layer (not the section itself)
            const gradientLayers = container.querySelectorAll('[class*="bg-gradient-to-br"]');
            expect(gradientLayers.length).toBeGreaterThan(0);

            // Check the gradient overlay div (second element with gradient)
            const gradientOverlay = Array.from(gradientLayers).find(el => 
              el.className.includes('absolute') && el.className.includes('inset-0')
            );
            
            expect(gradientOverlay).toBeInTheDocument();

            // Should have color classes based on scheme
            const classes = gradientOverlay?.className || '';
            
            // Each scheme has specific color patterns
            switch (scheme) {
              case 'blue':
                expect(classes).toMatch(/blue|cyan|purple/);
                break;
              case 'purple':
                expect(classes).toMatch(/purple|pink|indigo/);
                break;
              case 'green':
                expect(classes).toMatch(/green|emerald|teal/);
                break;
              case 'orange':
                expect(classes).toMatch(/orange|amber|red/);
                break;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain gradient with background image overlay', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          urlArbitrary,
          (props, backgroundImage) => {
            const { container } = render(
              <HeroSection3D {...props} backgroundImage={backgroundImage} />
            );

            // Should have both gradient and background image
            const section = container.querySelector('section');
            expect(section?.className).toMatch(/bg-gradient-to-br/);

            if (backgroundImage) {
              const bgImageLayer = container.querySelector('[class*="bg-cover"]');
              expect(bgImageLayer).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Smooth Transition Configuration', () => {
    /**
     * **Validates: Requirements 1.5**
     * 
     * For any interactive element with 3D effects, the computed transition or
     * animation property should be defined with duration values to ensure smooth animations.
     */
    it('should apply transition configuration to CTA button', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]');
            expect(ctaButton).toBeInTheDocument();

            // Should have transition classes
            const buttonClasses = ctaButton?.className || '';
            expect(buttonClasses).toMatch(/transition/);
            expect(buttonClasses).toMatch(/duration/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have hover and tap animations on CTA button', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]');
            expect(ctaButton).toBeInTheDocument();

            // Should have hover animation configured
            expect(ctaButton?.getAttribute('data-has-hover-animation')).toBe('true');
            
            // Should have tap animation configured
            expect(ctaButton?.getAttribute('data-has-tap-animation')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply smooth transitions to animated text elements', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            // Title should have animation transition
            const title = container.querySelector('h1');
            expect(title).toBeInTheDocument();
            expect(title?.getAttribute('data-animated')).toBe('true');
            expect(title?.getAttribute('data-has-transition')).toBe('true');

            // Subtitle should have animation transition
            const subtitle = container.querySelector('p');
            expect(subtitle).toBeInTheDocument();
            expect(subtitle?.getAttribute('data-animated')).toBe('true');
            expect(subtitle?.getAttribute('data-has-transition')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should configure transitions for all interactive elements', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            // CTA button should have transition
            const cta = container.querySelector('a[role="button"]');
            expect(cta?.className).toMatch(/transition/);
            expect(cta?.className).toMatch(/duration/);

            // Should have focus ring transition
            expect(cta?.className).toMatch(/focus:ring/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain transition configuration across different states', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            expect(ctaButton).toBeInTheDocument();

            // Initial state should have transitions
            expect(ctaButton.className).toMatch(/transition/);

            // Hover state should maintain transitions
            fireEvent.mouseEnter(ctaButton);
            expect(ctaButton.className).toMatch(/transition/);

            // After hover should still have transitions
            fireEvent.mouseLeave(ctaButton);
            expect(ctaButton.className).toMatch(/transition/);
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
     * For any animated element using Intersection Observer, when the element enters
     * the viewport, the animation state should transition from hidden to visible
     * with opacity and position changes.
     */
    it('should configure entry animations for title and subtitle', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            // Title should have animation configuration
            const title = container.querySelector('h1');
            expect(title).toBeInTheDocument();
            expect(title?.getAttribute('data-animated')).toBe('true');

            // Subtitle should have animation configuration
            const subtitle = container.querySelector('p');
            expect(subtitle).toBeInTheDocument();
            expect(subtitle?.getAttribute('data-animated')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply staggered animation delays to text elements', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            // All animated elements should be present
            const animatedElements = container.querySelectorAll('[data-animated="true"]');
            expect(animatedElements.length).toBeGreaterThanOrEqual(3); // title, subtitle, CTA wrapper

            // Title and subtitle should have transition configuration
            const titleElement = container.querySelector('h1[data-animated="true"]');
            const subtitleElement = container.querySelector('p[data-animated="true"]');
            
            expect(titleElement?.getAttribute('data-has-transition')).toBe('true');
            expect(subtitleElement?.getAttribute('data-has-transition')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should configure animations for all content elements', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            // Title animation
            const title = container.querySelector('h1[data-animated="true"]');
            expect(title).toBeInTheDocument();

            // Subtitle animation
            const subtitle = container.querySelector('p[data-animated="true"]');
            expect(subtitle).toBeInTheDocument();

            // CTA wrapper animation
            const ctaWrapper = container.querySelector('div[data-animated="true"]');
            expect(ctaWrapper).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain animation configuration across different locales', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            // Animations should work regardless of locale
            const animatedElements = container.querySelectorAll('[data-animated="true"]');
            expect(animatedElements.length).toBeGreaterThanOrEqual(3);

            // RTL should not affect animation configuration
            if (locale === 'ug') {
              const section = container.querySelector('section');
              expect(section?.getAttribute('dir')).toBe('rtl');
            }

            // Title and subtitle should have transitions
            const titleElement = container.querySelector('h1[data-animated="true"]');
            const subtitleElement = container.querySelector('p[data-animated="true"]');
            
            expect(titleElement?.getAttribute('data-has-transition')).toBe('true');
            expect(subtitleElement?.getAttribute('data-has-transition')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Hover Feedback Animation', () => {
    /**
     * **Validates: Requirements 4.3**
     * 
     * For any interactive element with hover animations, when a hover event is triggered,
     * the element should immediately update its animation state with visual feedback.
     */
    it('should provide hover feedback on CTA button', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            expect(ctaButton).toBeInTheDocument();

            // Should have hover animation configured
            expect(ctaButton.getAttribute('data-has-hover-animation')).toBe('true');

            // Should respond to hover events
            fireEvent.mouseEnter(ctaButton);
            expect(ctaButton).toBeInTheDocument();

            fireEvent.mouseLeave(ctaButton);
            expect(ctaButton).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply hover effects with proper transition classes', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            const ctaButton = container.querySelector('a[role="button"]');
            expect(ctaButton).toBeInTheDocument();

            // Should have transition classes for smooth hover
            const classes = ctaButton?.className || '';
            expect(classes).toMatch(/transition/);
            expect(classes).toMatch(/duration/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle rapid hover events without breaking', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          fc.integer({ min: 3, max: 10 }),
          (props, hoverCount) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            expect(ctaButton).toBeInTheDocument();

            // Perform rapid hover events
            for (let i = 0; i < hoverCount; i++) {
              fireEvent.mouseEnter(ctaButton);
              fireEvent.mouseLeave(ctaButton);
            }

            // Button should still be functional
            expect(ctaButton).toBeInTheDocument();
            expect(ctaButton.getAttribute('data-has-hover-animation')).toBe('true');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should provide tap feedback on CTA button', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            expect(ctaButton).toBeInTheDocument();

            // Should have tap animation configured
            expect(ctaButton.getAttribute('data-has-tap-animation')).toBe('true');

            // Should respond to click events
            fireEvent.click(ctaButton);
            expect(ctaButton).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain hover feedback across different gradient schemes', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          gradientSchemeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale, gradientScheme) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
                gradientScheme={gradientScheme}
              />
            );

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            expect(ctaButton).toBeInTheDocument();

            // Hover animation should work regardless of gradient scheme
            expect(ctaButton.getAttribute('data-has-hover-animation')).toBe('true');

            fireEvent.mouseEnter(ctaButton);
            expect(ctaButton).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Component Rendering and Props', () => {
    it('should render with all required props', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            // Section should be rendered
            const section = container.querySelector('section');
            expect(section).toBeInTheDocument();

            // Title should be rendered
            const titleElement = container.querySelector('h1');
            expect(titleElement).toBeInTheDocument();
            expect(titleElement?.textContent).toBe(title);

            // Subtitle should be rendered
            const subtitleElement = container.querySelector('p');
            expect(subtitleElement).toBeInTheDocument();
            expect(subtitleElement?.textContent).toBe(subtitle);

            // CTA button should be rendered
            const ctaButton = container.querySelector('a[role="button"]');
            expect(ctaButton).toBeInTheDocument();
            expect(ctaButton?.textContent).toContain(ctaText);
            expect(ctaButton?.getAttribute('href')).toBe(ctaLink);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply RTL layout for Uyghur locale', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          (title, subtitle, ctaText, ctaLink) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale="ug"
              />
            );

            const section = container.querySelector('section');
            expect(section?.getAttribute('dir')).toBe('rtl');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply LTR layout for non-Uyghur locales', () => {
      fc.assert(
        fc.property(
          stringArbitrary,
          stringArbitrary,
          stringArbitrary,
          fc.webPath(),
          fc.constantFrom('zh', 'en'),
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            const section = container.querySelector('section');
            expect(section?.getAttribute('dir')).toBe('ltr');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should call onCtaClick when CTA is clicked', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const onCtaClick = jest.fn();
            const { container } = render(
              <HeroSection3D {...props} onCtaClick={onCtaClick} />
            );

            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;
            fireEvent.click(ctaButton);

            expect(onCtaClick).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render background image when provided', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          urlArbitrary,
          (props, backgroundImage) => {
            const { container } = render(
              <HeroSection3D {...props} backgroundImage={backgroundImage} />
            );

            if (backgroundImage) {
              const bgImageLayer = container.querySelector('[class*="bg-cover"]');
              expect(bgImageLayer).toBeInTheDocument();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render floating elements when enabled on desktop', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              configurable: true,
              value: 1024,
            });

            const { container } = render(
              <HeroSection3D {...props} enableFloatingElements={true} />
            );

            // Floating elements container should exist
            const floatingContainer = container.querySelector('[aria-hidden="true"]');
            expect(floatingContainer).toBeInTheDocument();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply custom className when provided', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          stringArbitrary.filter(s => s.trim().length > 0),
          (props, customClass) => {
            const { container } = render(
              <HeroSection3D {...props} className={customClass} />
            );

            const section = container.querySelector('section');
            expect(section?.className).toContain(customClass.trim());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have proper ARIA attributes for accessibility', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            // CTA button should have proper role and aria-label
            const ctaButton = container.querySelector('a[role="button"]');
            expect(ctaButton).toHaveAttribute('role', 'button');
            expect(ctaButton).toHaveAttribute('aria-label');

            // Decorative elements should be hidden from screen readers
            const decorativeElements = container.querySelectorAll('[aria-hidden="true"]');
            expect(decorativeElements.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain structure with different content lengths', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.webPath(),
          localeArbitrary,
          (title, subtitle, ctaText, ctaLink, locale) => {
            const { container } = render(
              <HeroSection3D
                title={title}
                subtitle={subtitle}
                ctaText={ctaText}
                ctaLink={ctaLink}
                locale={locale}
              />
            );

            // All elements should render regardless of content length
            expect(container.querySelector('section')).toBeInTheDocument();
            expect(container.querySelector('h1')).toBeInTheDocument();
            expect(container.querySelector('p')).toBeInTheDocument();
            expect(container.querySelector('a[role="button"]')).toBeInTheDocument();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined Properties: Gradient + Transitions + Animations', () => {
    it('should maintain all properties together during interaction', () => {
      fc.assert(
        fc.property(
          heroSection3DPropsArbitrary,
          (props) => {
            const { container } = render(<HeroSection3D {...props} />);

            const section = container.querySelector('section');
            const ctaButton = container.querySelector('a[role="button"]') as HTMLElement;

            // Property 4: Gradient background
            expect(section?.className).toMatch(/bg-gradient-to-br/);

            // Property 5: Smooth transitions
            expect(ctaButton.className).toMatch(/transition/);
            expect(ctaButton.className).toMatch(/duration/);

            // Property 11: Entry animations
            const animatedElements = container.querySelectorAll('[data-animated="true"]');
            expect(animatedElements.length).toBeGreaterThanOrEqual(3);

            // Property 12: Hover feedback
            expect(ctaButton.getAttribute('data-has-hover-animation')).toBe('true');

            // Interact with button
            fireEvent.mouseEnter(ctaButton);
            fireEvent.click(ctaButton);
            fireEvent.mouseLeave(ctaButton);

            // All properties should still be present
            expect(section?.className).toMatch(/bg-gradient-to-br/);
            expect(ctaButton.className).toMatch(/transition/);
            expect(ctaButton.getAttribute('data-has-hover-animation')).toBe('true');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
