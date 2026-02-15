import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CaseShowcase from './CaseShowcase';
import type { Case } from '@/types/website';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
});

describe('CaseShowcase Component', () => {
  const mockCases: Case[] = [
    {
      id: 'case-1',
      title: 'E-commerce Platform Redesign',
      description: 'Complete redesign of an e-commerce platform to improve user experience',
      thumbnail: 'https://via.placeholder.com/400x300',
      industry: 'Retail',
      results: ['50% increase in sales', '30% improvement in conversion rate', 'Reduced bounce rate by 25%'],
      link: '/cases/case-1',
    },
    {
      id: 'case-2',
      title: 'SaaS Dashboard Development',
      description: 'Built a comprehensive analytics dashboard for a SaaS platform',
      thumbnail: 'https://via.placeholder.com/400x300',
      industry: 'Technology',
      results: ['Improved user engagement by 40%', 'Reduced page load time by 60%'],
      link: '/cases/case-2',
    },
    {
      id: 'case-3',
      title: 'Mobile Banking App',
      description: 'Developed a secure mobile banking application',
      thumbnail: 'https://via.placeholder.com/400x300',
      industry: 'Finance',
      results: ['100,000+ downloads', 'Maintained 4.8 star rating'],
      link: '/cases/case-3',
    },
    {
      id: 'case-4',
      title: 'Healthcare Portal',
      description: 'Created a patient management portal for healthcare providers',
      thumbnail: 'https://via.placeholder.com/400x300',
      industry: 'Healthcare',
      results: ['Reduced appointment no-shows by 35%', 'Improved patient satisfaction'],
      link: '/cases/case-4',
    },
    {
      id: 'case-5',
      title: 'Retail Analytics Platform',
      description: 'Built analytics platform for retail chain',
      thumbnail: 'https://via.placeholder.com/400x300',
      industry: 'Retail',
      results: ['Real-time inventory tracking', 'Optimized supply chain'],
      link: '/cases/case-5',
    },
  ];

  describe('Rendering', () => {
    test('should render case showcase section', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByTestId('case-showcase')).toBeInTheDocument();
    });

    test('should render heading', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByText('Success Cases')).toBeInTheDocument();
    });

    test('should render description', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(
        screen.getByText(/Explore our portfolio of successful projects/i)
      ).toBeInTheDocument();
    });

    test('should render all case cards', () => {
      render(<CaseShowcase cases={mockCases} />);
      mockCases.forEach((caseItem) => {
        expect(screen.getByText(caseItem.title)).toBeInTheDocument();
      });
    });

    test('should render case thumbnails', () => {
      render(<CaseShowcase cases={mockCases} />);
      const images = screen.getAllByAltText(/E-commerce Platform|SaaS Dashboard|Mobile Banking|Healthcare Portal|Retail Analytics/);
      expect(images.length).toBeGreaterThan(0);
    });

    test('should render industry badges', () => {
      render(<CaseShowcase cases={mockCases} />);
      // Check for industry badges specifically (not filter buttons)
      expect(screen.getByTestId('industry-badge-case-1')).toBeInTheDocument();
      expect(screen.getByTestId('industry-badge-case-2')).toBeInTheDocument();
      expect(screen.getByTestId('industry-badge-case-3')).toBeInTheDocument();
      expect(screen.getByTestId('industry-badge-case-4')).toBeInTheDocument();
    });

    test('should render case descriptions', () => {
      render(<CaseShowcase cases={mockCases} />);
      mockCases.forEach((caseItem) => {
        expect(screen.getByText(caseItem.description)).toBeInTheDocument();
      });
    });

    test('should render results for each case', () => {
      render(<CaseShowcase cases={mockCases} />);
      mockCases.forEach((caseItem) => {
        if (caseItem.results.length > 0) {
          expect(screen.getByText(caseItem.results[0])).toBeInTheDocument();
        }
      });
    });

    test('should render view case study links', () => {
      render(<CaseShowcase cases={mockCases} />);
      const links = screen.getAllByText('View Case Study');
      expect(links.length).toBe(mockCases.length);
    });

    test('should render with custom className', () => {
      render(<CaseShowcase cases={mockCases} className="custom-class" />);
      const section = screen.getByTestId('case-showcase');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Industry Filtering', () => {
    test('should render industry filter buttons', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByTestId('industry-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    test('should render all unique industries as filter buttons', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByTestId('filter-Retail')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Technology')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Finance')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Healthcare')).toBeInTheDocument();
    });

    test('should filter cases by industry when filter button is clicked', async () => {
      render(<CaseShowcase cases={mockCases} />);
      const retailFilter = screen.getByTestId('filter-Retail');

      fireEvent.click(retailFilter);

      await waitFor(() => {
        // Should show only Retail cases
        expect(screen.getByText('E-commerce Platform Redesign')).toBeInTheDocument();
        expect(screen.getByText('Retail Analytics Platform')).toBeInTheDocument();
        // Should not show other industries
        expect(screen.queryByText('SaaS Dashboard Development')).not.toBeInTheDocument();
        expect(screen.queryByText('Mobile Banking App')).not.toBeInTheDocument();
      });
    });

    test('should show all cases when "All Industries" filter is clicked', async () => {
      render(<CaseShowcase cases={mockCases} />);
      const retailFilter = screen.getByTestId('filter-Retail');
      const allFilter = screen.getByTestId('filter-all');

      fireEvent.click(retailFilter);
      await waitFor(() => {
        expect(screen.queryByText('SaaS Dashboard Development')).not.toBeInTheDocument();
      });

      fireEvent.click(allFilter);
      await waitFor(() => {
        expect(screen.getByText('SaaS Dashboard Development')).toBeInTheDocument();
      });
    });

    test('should highlight active filter button', async () => {
      render(<CaseShowcase cases={mockCases} />);
      const retailFilter = screen.getByTestId('filter-Retail');

      fireEvent.click(retailFilter);

      await waitFor(() => {
        expect(retailFilter).toHaveClass('bg-blue-600', 'text-white');
      });
    });

    test('should update results count when filtering', async () => {
      render(<CaseShowcase cases={mockCases} />);
      const retailFilter = screen.getByTestId('filter-Retail');

      fireEvent.click(retailFilter);

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 5 cases')).toBeInTheDocument();
      });
    });

    test('should show empty state when no cases match filter', async () => {
      render(<CaseShowcase cases={[]} />);
      // Empty state should be shown when no cases are provided
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No cases found for the selected industry.')).toBeInTheDocument();
    });
  });

  describe('Case Card Interactions', () => {
    test('should call onCaseClick callback when case card is clicked', () => {
      const onCaseClick = jest.fn();
      render(<CaseShowcase cases={mockCases} onCaseClick={onCaseClick} />);

      const caseCard = screen.getByTestId('case-card-case-1');
      fireEvent.click(caseCard);

      expect(onCaseClick).toHaveBeenCalledWith('case-1');
    });

    test('should navigate to case link when clicked', () => {
      render(<CaseShowcase cases={mockCases} />);
      const link = screen.getByTestId('link-/cases/case-1');
      expect(link).toBeInTheDocument();
    });

    test('should display case results correctly', () => {
      render(<CaseShowcase cases={mockCases} />);
      mockCases.forEach((caseItem) => {
        if (caseItem.results.length > 0) {
          const resultsSection = screen.getByTestId(`results-${caseItem.id}`);
          expect(resultsSection).toBeInTheDocument();
          // Should show first 2 results
          expect(screen.getByTestId(`result-${caseItem.id}-0`)).toBeInTheDocument();
          if (caseItem.results.length > 1) {
            expect(screen.getByTestId(`result-${caseItem.id}-1`)).toBeInTheDocument();
          }
        }
      });
    });
  });

  describe('Empty State', () => {
    test('should render empty state when no cases provided', () => {
      render(<CaseShowcase cases={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No cases found for the selected industry.')).toBeInTheDocument();
    });

    test('should not render filter when no cases', () => {
      render(<CaseShowcase cases={[]} />);
      expect(screen.queryByTestId('industry-filter')).not.toBeInTheDocument();
    });

    test('should not render results count when no cases', () => {
      render(<CaseShowcase cases={[]} />);
      expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    test('should display results count', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByTestId('results-count')).toBeInTheDocument();
      expect(screen.getByText(`Showing ${mockCases.length} of ${mockCases.length} cases`)).toBeInTheDocument();
    });

    test('should update results count when filtering', async () => {
      render(<CaseShowcase cases={mockCases} />);
      const retailFilter = screen.getByTestId('filter-Retail');

      fireEvent.click(retailFilter);

      await waitFor(() => {
        const retailCases = mockCases.filter((c) => c.industry === 'Retail');
        expect(screen.getByText(`Showing ${retailCases.length} of ${mockCases.length} cases`)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive grid layout', () => {
      render(<CaseShowcase cases={mockCases} />);
      const grid = screen.getByTestId('cases-grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    test('should have responsive padding', () => {
      render(<CaseShowcase cases={mockCases} />);
      const section = screen.getByTestId('case-showcase');
      expect(section).toHaveClass('py-12', 'md:py-16', 'lg:py-20');
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<CaseShowcase cases={mockCases} />);
      const heading = screen.getByText('Success Cases');
      expect(heading.tagName).toBe('H2');
    });

    test('should have alt text for images', () => {
      render(<CaseShowcase cases={mockCases} />);
      mockCases.forEach((caseItem) => {
        const img = screen.getByAltText(caseItem.title);
        expect(img).toHaveAttribute('alt', caseItem.title);
      });
    });

    test('should have semantic HTML structure', () => {
      render(<CaseShowcase cases={mockCases} />);
      const section = screen.getByTestId('case-showcase');
      expect(section.tagName).toBe('SECTION');
    });

    test('should have descriptive button text', () => {
      render(<CaseShowcase cases={mockCases} />);
      expect(screen.getByTestId('filter-all')).toHaveTextContent('All Industries');
      expect(screen.getByTestId('filter-Retail')).toHaveTextContent('Retail');
    });
  });

  describe('Edge Cases', () => {
    test('should handle cases with no results', () => {
      const casesNoResults: Case[] = [
        {
          id: 'case-1',
          title: 'Test Case',
          description: 'Test description',
          thumbnail: 'https://via.placeholder.com/400x300',
          industry: 'Test',
          results: [],
          link: '/cases/case-1',
        },
      ];
      render(<CaseShowcase cases={casesNoResults} />);
      expect(screen.getByText('Test Case')).toBeInTheDocument();
    });

    test('should handle very long case titles', () => {
      const longTitleCases: Case[] = [
        {
          id: 'case-1',
          title: 'This is a very long case title that should be truncated properly without breaking the layout',
          description: 'Test description',
          thumbnail: 'https://via.placeholder.com/400x300',
          industry: 'Test',
          results: ['Result 1'],
          link: '/cases/case-1',
        },
      ];
      render(<CaseShowcase cases={longTitleCases} />);
      const title = screen.getByText(/This is a very long case title/);
      expect(title).toHaveClass('line-clamp-2');
    });

    test('should handle cases with many results', () => {
      const manyResultsCases: Case[] = [
        {
          id: 'case-1',
          title: 'Test Case',
          description: 'Test description',
          thumbnail: 'https://via.placeholder.com/400x300',
          industry: 'Test',
          results: ['Result 1', 'Result 2', 'Result 3', 'Result 4', 'Result 5'],
          link: '/cases/case-1',
        },
      ];
      render(<CaseShowcase cases={manyResultsCases} />);
      // Should only show first 2 results
      expect(screen.getByTestId('result-case-1-0')).toBeInTheDocument();
      expect(screen.getByTestId('result-case-1-1')).toBeInTheDocument();
      expect(screen.queryByTestId('result-case-1-2')).not.toBeInTheDocument();
    });

    test('should handle duplicate industries', () => {
      const duplicateIndustryCases: Case[] = [
        ...mockCases,
        {
          id: 'case-6',
          title: 'Another Retail Case',
          description: 'Another retail project',
          thumbnail: 'https://via.placeholder.com/400x300',
          industry: 'Retail',
          results: ['Result 1'],
          link: '/cases/case-6',
        },
      ];
      render(<CaseShowcase cases={duplicateIndustryCases} />);
      // Should only have one Retail filter button
      const retailButtons = screen.getAllByTestId('filter-Retail');
      expect(retailButtons).toHaveLength(1);
    });

    test('should handle special characters in case data', () => {
      const specialCharCases: Case[] = [
        {
          id: 'case-1',
          title: "O'Brien & Co.'s E-commerce Platform",
          description: 'Case with "quotes" and special chars: @#$%',
          thumbnail: 'https://via.placeholder.com/400x300',
          industry: 'Tech & Innovation',
          results: ['50% ↑ in sales', 'ROI: 300%+'],
          link: '/cases/case-1',
        },
      ];
      render(<CaseShowcase cases={specialCharCases} />);
      expect(screen.getByText(/O'Brien & Co.'s E-commerce Platform/)).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    test('should render cases in grid layout', () => {
      render(<CaseShowcase cases={mockCases} />);
      const grid = screen.getByTestId('cases-grid');
      const cards = within(grid).getAllByTestId(/case-card-/);
      expect(cards).toHaveLength(mockCases.length);
    });

    test('should maintain consistent card height', () => {
      render(<CaseShowcase cases={mockCases} />);
      const cards = screen.getAllByTestId(/case-card-/);
      cards.forEach((card) => {
        expect(card).toHaveClass('h-full');
      });
    });
  });

  describe('Hover Effects', () => {
    test('should have hover effects on case cards', () => {
      render(<CaseShowcase cases={mockCases} />);
      const card = screen.getByTestId('case-card-case-1');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    test('should have hover effects on images', () => {
      render(<CaseShowcase cases={mockCases} />);
      const images = screen.getAllByAltText(/E-commerce Platform|SaaS Dashboard|Mobile Banking|Healthcare Portal|Retail Analytics/);
      images.forEach((img) => {
        expect(img).toHaveClass('hover:scale-105');
      });
    });
  });
});
