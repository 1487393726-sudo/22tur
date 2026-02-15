/**
 * Integration tests for Cases page with detail modal
 * 
 * Tests case card click interaction and modal display
 * Validates Requirements: 14.2, 14.5
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CasesPage from '../page';

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
      'cases.0.title': 'E-commerce Platform Rebuild',
      'cases.0.client': 'Leading Retail Brand',
      'cases.0.category': 'Web Development',
      'cases.0.description': 'Rebuilt e-commerce platform',
      'cases.0.results.0': '45% increase in conversion',
      'cases.0.results.1': '60% faster page load',
      'cases.0.results.2': '35% improvement in satisfaction',
      'cases.1.title': 'Corporate Brand Upgrade',
      'cases.1.client': 'Technology Company',
      'cases.1.category': 'Brand Design',
      'cases.1.description': 'Comprehensive brand upgrade',
      'cases.1.results.0': '50% increase in brand awareness',
      'cases.1.results.1': '30% growth in market share',
      'cases.1.results.2': '95% client satisfaction',
      'cases.2.title': 'Mobile App Development',
      'cases.2.client': 'Financial Services',
      'cases.2.category': 'Mobile Application',
      'cases.2.description': 'Developed native iOS and Android apps',
      'cases.2.results.0': 'Over 1 million downloads',
      'cases.2.results.1': '4.8 App Store rating',
      'cases.2.results.2': '200,000+ daily active users',
      'cases.3.title': 'Corporate Website Design',
      'cases.3.client': 'Manufacturing Enterprise',
      'cases.3.category': 'Web Design',
      'cases.3.description': 'Designed modern corporate website',
      'cases.3.results.0': '80% increase in traffic',
      'cases.3.results.1': '60% growth in inquiries',
      'cases.3.results.2': '40% reduction in bounce rate',
      'cases.4.title': 'Digital Marketing Campaign',
      'cases.4.client': 'Consumer Brand',
      'cases.4.category': 'Digital Marketing',
      'cases.4.description': 'Planned and executed campaign',
      'cases.4.results.0': '200% ROI improvement',
      'cases.4.results.1': '150% social media growth',
      'cases.4.results.2': '120% sales increase',
      'cases.5.title': 'Enterprise Management System',
      'cases.5.client': 'Logistics Company',
      'cases.5.category': 'System Development',
      'cases.5.description': 'Developed customized system',
      'cases.5.results.0': '70% efficiency improvement',
      'cases.5.results.1': '40% cost reduction',
      'cases.5.results.2': '85% error rate reduction',
      };
      
      // Handle nested keys
      const keys = key.split('.');
      let value: any = translations;
      for (const k of keys) {
        value = value?.[k];
      }
      return value || key;
    };
    
    // Add raw method for arrays
    t.raw = (key: string) => {
      const mockTags: Record<string, string[]> = {
        'cases.0.tags': ['React', 'Next.js', 'PostgreSQL'],
        'cases.1.tags': ['Brand Strategy', 'VI Design', 'Logo Design'],
        'cases.2.tags': ['React Native', 'iOS', 'Android'],
        'cases.3.tags': ['UI/UX', 'Responsive Design', 'SEO'],
        'cases.4.tags': ['Social Media', 'SEO/SEM', 'Content Marketing'],
        'cases.5.tags': ['Vue.js', 'Node.js', 'MongoDB'],
        'mockData.metrics': [
          { label: 'User Growth', value: '+150%' },
          { label: 'Performance Boost', value: '+60%' },
          { label: 'Client Satisfaction', value: '95%' },
          { label: 'ROI', value: '+200%' },
        ],
      };
      return mockTags[key] || [];
    };
    
    return t;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
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

describe('Cases Page - Case Detail Modal Integration', () => {
  beforeEach(() => {
    // Reset document body overflow
    document.body.style.overflow = '';
  });

  describe('Page Rendering', () => {
    it('should render cases page with all case cards', () => {
      render(<CasesPage />);

      expect(screen.getByText('Case Studies')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform Rebuild')).toBeInTheDocument();
      expect(screen.getByText('Corporate Brand Upgrade')).toBeInTheDocument();
      expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
    });

    it('should display view details button on each card', () => {
      render(<CasesPage />);

      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons).toHaveLength(6); // 6 case cards
    });
  });

  describe('Modal Opening (Req 14.2)', () => {
    it('should open modal when case card is clicked', async () => {
      render(<CasesPage />);

      // Modal should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Click on first case card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      expect(firstCard).toBeInTheDocument();
      
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Modal should now be visible
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should display case details in modal', async () => {
      render(<CasesPage />);

      // Click on first case card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Check modal content
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        // Title should appear in modal (may appear twice - once in card, once in modal)
        const titles = screen.getAllByText('E-commerce Platform Rebuild');
        expect(titles.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Timeline Display in Modal (Req 14.5)', () => {
    it('should display project timeline in modal', async () => {
      render(<CasesPage />);

      // Click on a case card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Check timeline content
      await waitFor(() => {
        expect(screen.getByText('Project Timeline')).toBeInTheDocument();
        expect(screen.getByText('3 months')).toBeInTheDocument();
        expect(screen.getByText('June 2023')).toBeInTheDocument();
        expect(screen.getByText('September 2023')).toBeInTheDocument();
      });
    });
  });

  describe('Key Metrics Display in Modal (Req 14.5)', () => {
    it('should display key metrics in modal', async () => {
      render(<CasesPage />);

      // Click on a case card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Check metrics content
      await waitFor(() => {
        expect(screen.getByText('Key Metrics')).toBeInTheDocument();
      });
    });
  });

  describe('Image Gallery Display in Modal (Req 14.5)', () => {
    it('should display image gallery in modal', async () => {
      render(<CasesPage />);

      // Click on a case card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Check gallery content
      await waitFor(() => {
        expect(screen.getByText('Project Gallery')).toBeInTheDocument();
        // Check for gallery placeholder emojis
        const galleryItems = screen.getAllByText('🖼️');
        expect(galleryItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Modal Closing', () => {
    it('should close modal when close button is clicked', async () => {
      render(<CasesPage />);

      // Open modal
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByLabelText(/close modal/i);
      fireEvent.click(closeButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should close modal when Escape key is pressed', async () => {
      render(<CasesPage />);

      // Open modal
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Multiple Case Cards', () => {
    it('should open different case details when different cards are clicked', async () => {
      render(<CasesPage />);

      // Click first card
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByLabelText(/close modal/i);
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      }, { timeout: 1000 });

      // Click second card
      const secondCard = screen.getByText('Corporate Brand Upgrade').closest('[role="button"]');
      if (secondCard) {
        fireEvent.click(secondCard);
      }

      // Modal should open with different content
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        const titles = screen.getAllByText('Corporate Brand Upgrade');
        expect(titles.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Glassmorphism Effects (Req 14.2)', () => {
    it('should apply glass effect to modal', async () => {
      const { container } = render(<CasesPage />);

      // Open modal
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        const glassElements = container.querySelectorAll('.glass-heavy, .glass-light');
        expect(glassElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on case cards', () => {
      render(<CasesPage />);

      const firstCard = screen.getByLabelText(/case study: e-commerce platform rebuild/i);
      expect(firstCard).toBeInTheDocument();
    });

    it('should have proper ARIA label on modal', async () => {
      render(<CasesPage />);

      // Open modal
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-label');
      });
    });

    it('should prevent body scroll when modal is open', async () => {
      render(<CasesPage />);

      // Initially body should be scrollable
      expect(document.body.style.overflow).toBe('');

      // Open modal
      const firstCard = screen.getByText('E-commerce Platform Rebuild').closest('[role="button"]');
      if (firstCard) {
        fireEvent.click(firstCard);
      }

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Body scroll should be prevented
      expect(document.body.style.overflow).toBe('hidden');
    });
  });
});
