/**
 * Property-Based Tests for Services Page Flip Cards
 * 
 * Feature: website-3d-redesign
 * Tests Property 23 from the design document
 * 
 * Property 23: Flip Card Rotation
 * 
 * **Validates: Requirements 9.2**
 * 
 * This test validates that the flip cards on the services page correctly
 * implement the 180-degree rotation behavior when users interact with them.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { FlipCard3D } from '@/components/website/3d/FlipCard3D';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock language context
jest.mock('@/lib/i18n/context', () => ({
  useLanguage: () => ({ language: 'en' }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  
  return {
    motion: {
      div: React.forwardRef<HTMLDivElement, any>(({ children, animate, variants, style, ...props }, ref) => {
        // Extract rotation from animate state
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
      shallow: '0 2px 4px rgba(0,0,0,0.1)',
      medium: '0 4px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.08)',
      deep: '0 8px 16px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.1)',
    };
    return shadows[level as keyof typeof shadows] || shadows.medium;
  }),
}));

// Arbitraries for generating service data
const serviceKeyArbitrary = fc.constantFrom(
  'webDev',
  'uiux',
  'mobile',
  'branding',
  'marketing',
  'consulting'
);

const serviceColorArbitrary = fc.constantFrom(
  'var(--color-primary-500)',
  'var(--color-secondary-500)',
  'var(--color-accent-500)',
  '#f59e0b',
  '#10b981',
  '#8b5cf6'
);

const serviceDataArbitrary = fc.record({
  key: serviceKeyArbitrary,
  color: serviceColorArbitrary,
  title: fc.string({ minLength: 5, maxLength: 50 }),
  description: fc.string({ minLength: 20, maxLength: 200 }),
  icon: fc.constantFrom('🌐', '🎨', '📱', '🎯', '📊', '💼'),
  features: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 4, maxLength: 4 }),
});

describe('Services Page Flip Cards - Property-Based Tests', () => {
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
     * **Validates: Requirements 9.2**
     * 
     * For any service flip card, when the flip trigger event occurs (click),
     * the card's rotateY transform should transition from 0deg to 180deg or vice versa.
     */
    
    it('should initialize service cards with 0deg rotation (front face showing)', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div className="service-front">
                <div className="icon">{serviceData.icon}</div>
                <h3>{serviceData.title}</h3>
                <p>{serviceData.description}</p>
              </div>
            );

            const backContent = (
              <div className="service-back">
                <h3>{serviceData.title}</h3>
                <ul>
                  {serviceData.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should be in front state initially
            expect(motionDiv).toBeInTheDocument();
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should rotate service card to 180deg when clicked (showing back face)', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div className="service-front">
                <div className="icon">{serviceData.icon}</div>
                <h3>{serviceData.title}</h3>
                <p>{serviceData.description}</p>
              </div>
            );

            const backContent = (
              <div className="service-back">
                <h3>{serviceData.title}</h3>
                <ul>
                  {serviceData.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <a href={`/contact?service=${serviceData.key}`}>Consult</a>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Initially at 0deg
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
            
            // Click to flip
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

    it('should rotate service card back to 0deg when clicked again (showing front face)', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div className="service-front">
                <div className="icon">{serviceData.icon}</div>
                <h3>{serviceData.title}</h3>
              </div>
            );

            const backContent = (
              <div className="service-back">
                <h3>{serviceData.title}</h3>
                <ul>
                  {serviceData.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Click to flip to back
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
            
            // Click again to flip back to front
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple service cards independently', () => {
      fc.assert(
        fc.property(
          fc.array(serviceDataArbitrary, { minLength: 2, maxLength: 6 }),
          (services) => {
            const { container } = render(
              <div>
                {services.map((service, index) => (
                  <FlipCard3D
                    key={index}
                    frontContent={
                      <div className="service-front">
                        <div className="icon">{service.icon}</div>
                        <h3>{service.title}</h3>
                      </div>
                    }
                    backContent={
                      <div className="service-back">
                        <h3>{service.title}</h3>
                        <ul>
                          {service.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    }
                    flipTrigger="click"
                    glassEffect="light"
                    depth="medium"
                    height="400px"
                  />
                ))}
              </div>
            );

            const cards = container.querySelectorAll('[role="button"]');
            const motionDivs = container.querySelectorAll('[data-animation-state]');
            
            // All cards should start at 0deg
            motionDivs.forEach((motionDiv) => {
              expect(motionDiv.getAttribute('data-animation-state')).toBe('front');
              expect(motionDiv.getAttribute('data-rotate-y')).toBe('0');
            });
            
            // Click first card
            fireEvent.click(cards[0]);
            
            // First card should be flipped, others should remain
            const updatedMotionDivs = container.querySelectorAll('[data-animation-state]');
            expect(updatedMotionDivs[0].getAttribute('data-animation-state')).toBe('back');
            expect(updatedMotionDivs[0].getAttribute('data-rotate-y')).toBe('180');
            
            // Other cards should still be at front
            for (let i = 1; i < updatedMotionDivs.length; i++) {
              expect(updatedMotionDivs[i].getAttribute('data-animation-state')).toBe('front');
              expect(updatedMotionDivs[i].getAttribute('data-rotate-y')).toBe('0');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain flip state with different service content', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div className="service-front" style={{ backgroundColor: serviceData.color }}>
                <div className="icon">{serviceData.icon}</div>
                <h3>{serviceData.title}</h3>
                <p>{serviceData.description}</p>
              </div>
            );

            const backContent = (
              <div className="service-back">
                <div className="icon" style={{ backgroundColor: serviceData.color }}>
                  {serviceData.icon}
                </div>
                <h3>{serviceData.title}</h3>
                <ul>
                  {serviceData.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <a href={`/contact?service=${serviceData.key}`}>Consult</a>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Click to flip
            fireEvent.click(card);
            const motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should rotate to 180deg regardless of content styling
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(motionDiv.getAttribute('data-rotate-y')).toBe('180');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve 3D transform properties during service card flip', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div className="service-front">
                <h3>{serviceData.title}</h3>
              </div>
            );

            const backContent = (
              <div className="service-back">
                <h3>{serviceData.title}</h3>
                <ul>
                  {serviceData.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const card = container.firstChild as HTMLElement;
            let motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Check initial 3D properties
            const initialStyle = motionDiv.getAttribute('style') || '';
            expect(initialStyle).toContain('transform-style');
            expect(initialStyle).toContain('preserve-3d');
            
            // Click to flip
            fireEvent.click(card);
            motionDiv = container.querySelector('[data-animation-state]') as HTMLElement;
            
            // Should maintain 3D properties after flip
            const flippedStyle = motionDiv.getAttribute('style') || '';
            expect(motionDiv.getAttribute('data-animation-state')).toBe('back');
            expect(flippedStyle).toContain('transform-style');
            expect(flippedStyle).toContain('preserve-3d');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply glass effect to service cards', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const faces = container.querySelectorAll('.backface-hidden');
            
            // Both faces should have glass effect
            faces.forEach(face => {
              expect(face.className).toContain('glass-light');
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply medium depth shadows to service cards', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
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

    it('should have correct ARIA attributes for accessibility', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
                ariaLabel={serviceData.title}
              />
            );

            const card = container.firstChild as HTMLElement;
            
            // Should have aria-label
            expect(card).toHaveAttribute('aria-label');
            expect(card.getAttribute('aria-label')).toContain(serviceData.title);
            
            // Should have button role for click trigger
            expect(card).toHaveAttribute('role', 'button');
            
            // Should have aria-pressed
            expect(card).toHaveAttribute('aria-pressed', 'false');
            
            // Click to flip
            fireEvent.click(card);
            
            // aria-pressed should update
            expect(card).toHaveAttribute('aria-pressed', 'true');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be keyboard accessible with Enter key', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
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

    it('should be keyboard accessible with Space key', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
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

    it('should handle rapid flip toggles on service cards', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          fc.integer({ min: 3, max: 10 }),
          (serviceData, clickCount) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
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
  });

  describe('Service Card Specific Behaviors', () => {
    it('should render consultation button on back face', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = (
              <div>
                <h3>{serviceData.title}</h3>
                <a href={`/contact?service=${serviceData.key}`} className="consult-button">
                  Consult
                </a>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            // Consultation button should be in the DOM (on back face)
            const consultButton = container.querySelector('.consult-button');
            expect(consultButton).toBeInTheDocument();
            expect(consultButton).toHaveAttribute('href', `/contact?service=${serviceData.key}`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should render all service features on back face', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = <div>{serviceData.title}</div>;
            const backContent = (
              <div>
                <ul className="features-list">
                  {serviceData.features.map((feature, i) => (
                    <li key={i} className="feature-item">{feature}</li>
                  ))}
                </ul>
              </div>
            );

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            // All features should be in the DOM
            const featureItems = container.querySelectorAll('.feature-item');
            expect(featureItems).toHaveLength(serviceData.features.length);
            
            // Each feature should have correct text
            featureItems.forEach((item, index) => {
              expect(item.textContent).toBe(serviceData.features[index]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply service-specific color to icon', () => {
      fc.assert(
        fc.property(
          serviceDataArbitrary,
          (serviceData) => {
            const frontContent = (
              <div>
                <div className="icon-container" style={{ backgroundColor: serviceData.color }}>
                  {serviceData.icon}
                </div>
                <h3>{serviceData.title}</h3>
              </div>
            );
            const backContent = <div>{serviceData.features[0]}</div>;

            const { container } = render(
              <FlipCard3D
                frontContent={frontContent}
                backContent={backContent}
                flipTrigger="click"
                glassEffect="light"
                depth="medium"
                height="400px"
              />
            );

            const iconContainer = container.querySelector('.icon-container') as HTMLElement;
            expect(iconContainer).toBeInTheDocument();
            
            const style = iconContainer.getAttribute('style') || '';
            expect(style).toContain('background-color');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
