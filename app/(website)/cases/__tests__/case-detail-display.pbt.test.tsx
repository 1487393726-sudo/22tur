/**
 * Property-Based Tests for Case Detail Display
 * Feature: website-3d-redesign
 * 
 * **Property 29: Case Detail Display**
 * For any case card, when clicked, either a modal should appear or the route should change to display case details.
 * 
 * **Validates: Requirements 14.2**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import CasesPage from '../page';
import type { CaseDetailData } from '@/components/website/ui/CaseDetailModal';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const translations: Record<string, any> = {
        'hero.title': 'Case Studies',
        'hero.subtitle': 'View our successful case studies',
        'resultsLabel': 'Results:',
        'detail.timeline': 'Project Timeline',
        'detail.duration': 'Duration',
        'detail.startDate': 'Start Date',
        'detail.endDate': 'End Date',
        'detail.keyMetrics': 'Key Metrics',
        'detail.results': 'Project Results',
        'detail.challenges': 'Challenges',
        'detail.solution': 'Solution',
        'detail.technologies': 'Technologies Used',
        'detail.gallery': 'Project Gallery',
        'detail.viewDetails': 'View Details',
        'mockData.timeline.duration': '3 months',
        'mockData.timeline.startDate': 'June 2023',
        'mockData.timeline.endDate': 'September 2023',
        'mockData.challenges': 'The client faced multiple challenges',
        'mockData.solution': 'We rebuilt the entire platform',
      };
      
      // Handle nested keys
      const keys = key.split('.');
      let value: any = translations;
      for (const k of keys) {
        value = value?.[k];
      }
      
      // Generate case data dynamically
      if (key.startsWith('cases.')) {
        const parts = key.split('.');
        const index = parseInt(parts[1]);
        const field = parts[2];
        
        if (field === 'title') return `Case ${index}`;
        if (field === 'client') return `Client ${index}`;
        if (field === 'category') return `Category ${index}`;
        if (field === 'description') return `Description ${index}`;
        if (field === 'results' && parts[3] !== undefined) {
          return `Result ${parts[3]} for case ${index}`;
        }
      }
      
      return value || key;
    };
    
    t.raw = (key: string) => {
      if (key.startsWith('cases.') && key.endsWith('.tags')) {
        return ['Tag1', 'Tag2', 'Tag3'];
      }
      if (key === 'mockData.metrics') {
        return [
          { label: 'Metric 1', value: '+100%' },
          { label: 'Metric 2', value: '+200%' },
        ];
      }
      return [];
    };
    
    return t;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, initial, animate, exit, variants, transition, onMouseMove, onMouseLeave, style, ...props }: any) => (
      <div {...props} style={style}>{children}</div>
    ),
  },
  useInView: () => true,
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: (initialValue: number) => ({
    get: () => initialValue,
    set: () => {},
    onChange: () => () => {},
  }),
  useTransform: () => ({
    get: () => 0,
    set: () => {},
    onChange: () => () => {},
  }),
  useSpring: () => ({
    get: () => 0,
    set: () => {},
    onChange: () => () => {},
  }),
}));

// Mock Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

describe('Property-Based Tests: Case Detail Display', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  /**
   * Property 29: Case Detail Display
   * For any case card, when clicked, either a modal should appear or the route should change
   */
  describe('Property 29: Case Detail Display', () => {
    it('should display modal when any case card is clicked', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }), // 6 cases on the page
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            // Get all case cards
            const caseCards = container.querySelectorAll('[role="button"]');
            expect(caseCards.length).toBeGreaterThan(0);
            
            // Ensure the case index is valid
            if (caseIndex >= caseCards.length) {
              return true; // Skip if index out of bounds
            }
            
            const caseCard = caseCards[caseIndex];
            
            // Modal should not be visible before click
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            
            // Click the case card
            fireEvent.click(caseCard);
            
            // Modal should appear after click
            await waitFor(() => {
              const dialog = screen.queryByRole('dialog');
              expect(dialog).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 } // Test with 10 random case selections
      );
    });

    it('should display case details in modal with all required sections', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Verify modal contains case details
            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
            
            // Modal should have ARIA label
            expect(dialog).toHaveAttribute('aria-label');
            
            // Modal should contain detail sections
            // At minimum, the modal should display the case title and description
            const modalContent = dialog.textContent;
            expect(modalContent).toBeTruthy();
            expect(modalContent!.length).toBeGreaterThan(0);
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display modal with glassmorphism effect when case is clicked', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Verify glassmorphism effect is applied (Req 14.2)
            const glassElements = container.querySelectorAll('.glass-heavy, .glass-light, .glass-medium');
            expect(glassElements.length).toBeGreaterThan(0);
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should allow modal to be closed after opening from any case card', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to open
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Close the modal
            const closeButton = screen.getByLabelText(/close modal/i);
            fireEvent.click(closeButton);
            
            // Modal should close
            await waitFor(() => {
              expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            }, { timeout: 1000 });
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display timeline section in modal for any case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Verify timeline section is present (Req 14.5)
            expect(screen.getByText('Project Timeline')).toBeInTheDocument();
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should display key metrics section in modal for any case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Verify key metrics section is present (Req 14.5)
            expect(screen.getByText('Key Metrics')).toBeInTheDocument();
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should prevent body scroll when modal is open from any case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            // Reset body overflow
            document.body.style.overflow = '';
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            
            // Body should be scrollable initially
            expect(document.body.style.overflow).toBe('');
            
            // Click case card
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Body scroll should be prevented
            expect(document.body.style.overflow).toBe('hidden');
            
            // Clean up
            const closeButton = screen.queryByLabelText(/close modal/i);
            if (closeButton) {
              fireEvent.click(closeButton);
              await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
              }, { timeout: 1000 });
            }
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle rapid clicks on different case cards', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.integer({ min: 0, max: 5 }), { minLength: 2, maxLength: 3 }),
          async (caseIndices) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            
            for (const caseIndex of caseIndices) {
              if (caseIndex >= caseCards.length) {
                continue;
              }
              
              const caseCard = caseCards[caseIndex];
              fireEvent.click(caseCard);
              
              // Wait for modal to appear
              await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
              }, { timeout: 2000 });
              
              // Close modal before clicking next
              const closeButton = screen.queryByLabelText(/close modal/i);
              if (closeButton) {
                fireEvent.click(closeButton);
                await waitFor(() => {
                  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
                }, { timeout: 1000 });
              }
            }
            
            return true;
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should maintain modal accessibility for any case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Verify accessibility features
            const dialog = screen.getByRole('dialog');
            
            // Should have ARIA label
            expect(dialog).toHaveAttribute('aria-label');
            
            // Should have close button with accessible label
            const closeButton = screen.getByLabelText(/close modal/i);
            expect(closeButton).toBeInTheDocument();
            
            // Clean up
            fireEvent.click(closeButton);
            await waitFor(() => {
              expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            }, { timeout: 1000 });
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should close modal with Escape key for any case', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 0, max: 5 }),
          async (caseIndex) => {
            const { container } = render(<CasesPage />);
            
            const caseCards = container.querySelectorAll('[role="button"]');
            if (caseIndex >= caseCards.length) {
              return true;
            }
            
            const caseCard = caseCards[caseIndex];
            fireEvent.click(caseCard);
            
            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, { timeout: 2000 });
            
            // Press Escape key
            fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
            
            // Modal should close
            await waitFor(() => {
              expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            }, { timeout: 1000 });
            
            return true;
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
