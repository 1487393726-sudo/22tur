/**
 * Property-Based Tests for PartnerHoverPopup Component
 * 
 * Feature: website-3d-redesign
 * Tests Property 24 from the design document
 * 
 * Property 24: Hover Popup Display
 * 
 * Validates: Requirements 10.3
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { PartnerHoverPopup } from '../PartnerHoverPopup';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, style, initial, animate, exit, transition, ...props }, ref) => (
      <div 
        ref={ref} 
        {...props}
        data-animated="true"
        data-initial-opacity={initial?.opacity}
        data-animate-opacity={animate?.opacity}
        data-exit-opacity={exit?.opacity}
        style={style}
      >
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Arbitraries for generating test data
const stringArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);
const yearArbitrary = fc.integer({ min: 1990, max: 2024 }).map(y => y.toString());
const employeeCountArbitrary = fc.oneof(
  fc.integer({ min: 1, max: 50 }).map(n => `${n}`),
  fc.integer({ min: 50, max: 500 }).map(n => `${n}+`),
  fc.integer({ min: 500, max: 10000 }).map(n => `${n.toLocaleString()}+`)
);
const revenueArbitrary = fc.oneof(
  fc.integer({ min: 1, max: 100 }).map(n => `$${n}M`),
  fc.integer({ min: 100, max: 1000 }).map(n => `$${n}M`),
  fc.integer({ min: 1, max: 10 }).map(n => `$${n}B`)
);
const ratingArbitrary = fc.double({ min: 1.0, max: 5.0, noNaN: true }).map(n => 
  Math.round(n * 10) / 10
);
const localeArbitrary = fc.constantFrom('zh', 'en');

const partnerDataArbitrary = fc.record({
  name: stringArbitrary,
  nameZh: stringArbitrary,
  industry: stringArbitrary,
  industryZh: stringArbitrary,
  location: stringArbitrary,
  locationZh: stringArbitrary,
  partnerSince: yearArbitrary,
  employees: employeeCountArbitrary,
  revenue: revenueArbitrary,
  rating: ratingArbitrary,
  description: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
  descriptionZh: fc.string({ minLength: 10, maxLength: 200 }).filter(s => s.trim().length > 0),
});

describe('PartnerHoverPopup Component - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock viewport dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('Property 24: Hover Popup Display', () => {
    /**
     * **Validates: Requirements 10.3**
     * 
     * For any element with hover popup functionality, when a hover event is triggered,
     * a popup element should become visible (display or opacity change).
     */
    it('should display popup when hover event is triggered on any partner data', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            expect(trigger).toBeInTheDocument();

            // Initially, popup should not be visible
            const partnerName = locale === 'en' ? partner.name : partner.nameZh;
            expect(screen.queryByText(partnerName)).not.toBeInTheDocument();

            // Trigger hover event
            fireEvent.mouseEnter(trigger);

            // Popup should become visible
            await waitFor(() => {
              expect(screen.getByText(partnerName)).toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should hide popup when mouse leaves for all partner data', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            const partnerName = locale === 'en' ? partner.name : partner.nameZh;

            // Hover to show popup
            fireEvent.mouseEnter(trigger);
            await waitFor(() => {
              expect(screen.queryByText(partnerName)).toBeInTheDocument();
            }, { timeout: 500 });

            // Mouse leave to hide popup
            fireEvent.mouseLeave(trigger);

            // Popup should be hidden
            await waitFor(() => {
              expect(screen.queryByText(partnerName)).not.toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should display popup with correct locale-specific content', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              // Check name
              const expectedName = locale === 'en' ? partner.name : partner.nameZh;
              expect(screen.getByText(expectedName)).toBeInTheDocument();

              // Check industry
              const expectedIndustry = locale === 'en' ? partner.industry : partner.industryZh;
              expect(screen.getByText(expectedIndustry)).toBeInTheDocument();

              // Check location
              const expectedLocation = locale === 'en' ? partner.location : partner.locationZh;
              expect(screen.getByText(expectedLocation)).toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should apply glass effect styling to popup', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              const popup = container.querySelector('.glass-medium');
              expect(popup).toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should apply animation properties to popup', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              const animatedPopup = container.querySelector('[data-animated="true"]');
              expect(animatedPopup).toBeInTheDocument();
              
              // Check animation properties
              expect(animatedPopup?.getAttribute('data-initial-opacity')).toBe('0');
              expect(animatedPopup?.getAttribute('data-animate-opacity')).toBe('1');
              expect(animatedPopup?.getAttribute('data-exit-opacity')).toBe('0');
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should position popup with fixed positioning', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              const popup = container.querySelector('[style*="position: fixed"]');
              expect(popup).toBeInTheDocument();
              
              // Should have z-index for proper layering
              expect(popup?.getAttribute('style')).toContain('z-index');
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should render children correctly regardless of popup state', () => {
      fc.assert(
        fc.property(
          partnerDataArbitrary,
          localeArbitrary,
          (partner, locale) => {
            const { container, getByText, unmount } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Child</div>
              </PartnerHoverPopup>
            );

            // Children should always be rendered
            const childContainer = container.querySelector('[class*="relative"]');
            expect(childContainer).toBeInTheDocument();
            expect(getByText('Test Child')).toBeInTheDocument();
            
            // Clean up after each test
            unmount();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply pointer-events-none to popup to prevent interference', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              const popup = container.querySelector('[class*="pointer-events-none"]');
              expect(popup).toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should have consistent popup width across all partner data', async () => {
      await fc.assert(
        fc.asyncProperty(
          partnerDataArbitrary,
          localeArbitrary,
          async (partner, locale) => {
            const { container } = render(
              <PartnerHoverPopup partner={partner} locale={locale}>
                <div>Test Card</div>
              </PartnerHoverPopup>
            );

            const trigger = container.querySelector('[class*="relative"]') as HTMLElement;
            fireEvent.mouseEnter(trigger);

            await waitFor(() => {
              // Popup should have fixed width class (w-80)
              const popup = container.querySelector('[class*="w-80"]');
              expect(popup).toBeInTheDocument();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
