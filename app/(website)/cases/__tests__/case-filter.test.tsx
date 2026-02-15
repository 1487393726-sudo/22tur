/**
 * Unit Tests for Case Filtering Functionality
 * Feature: website-3d-redesign
 * Task: 13.4 实现案例筛选功能
 * **Validates: Requirements 14.4**
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CasesPage from '../page';

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true, // Always return true for tests
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: any) => {
      const translations: Record<string, any> = {
        'hero.title': 'Case Studies',
        'hero.subtitle': 'View our successful case studies',
        'resultsLabel': 'Results:',
        'filters.category': 'Filter by Category',
        'filters.tag': 'Filter by Technology',
        'filters.all': 'All',
        'filters.showing': 'Showing {count} cases',
        'filters.noResults': 'No matching cases found',
        'filters.noResultsDescription': 'Try adjusting your filters or clear all filters',
        'filters.clearFilters': 'Clear Filters',
        'detail.viewDetails': 'View Details',
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
        'mockData.timeline.duration': '3 months',
        'mockData.timeline.startDate': 'June 2023',
        'mockData.timeline.endDate': 'September 2023',
        'mockData.challenges': 'Test challenges',
        'mockData.solution': 'Test solution',
      };

      // Handle array access for cases
      if (key.startsWith('cases.')) {
        const parts = key.split('.');
        const index = parseInt(parts[1], 10);
        const field = parts[2];
        const subField = parts[3];

        const cases = [
          {
            title: 'Case 1',
            client: 'Client 1',
            category: 'Web Development',
            description: 'Description 1',
            results: ['Result 1.1', 'Result 1.2', 'Result 1.3'],
            tags: ['React', 'Next.js', 'PostgreSQL'],
          },
          {
            title: 'Case 2',
            client: 'Client 2',
            category: 'Brand Design',
            description: 'Description 2',
            results: ['Result 2.1', 'Result 2.2', 'Result 2.3'],
            tags: ['Brand Strategy', 'VI Design', 'Logo Design'],
          },
          {
            title: 'Case 3',
            client: 'Client 3',
            category: 'Mobile Application',
            description: 'Description 3',
            results: ['Result 3.1', 'Result 3.2', 'Result 3.3'],
            tags: ['React Native', 'iOS', 'Android'],
          },
          {
            title: 'Case 4',
            client: 'Client 4',
            category: 'Web Design',
            description: 'Description 4',
            results: ['Result 4.1', 'Result 4.2', 'Result 4.3'],
            tags: ['UI/UX', 'Responsive Design', 'SEO'],
          },
          {
            title: 'Case 5',
            client: 'Client 5',
            category: 'Digital Marketing',
            description: 'Description 5',
            results: ['Result 5.1', 'Result 5.2', 'Result 5.3'],
            tags: ['Social Media', 'SEO/SEM', 'Content Marketing'],
          },
          {
            title: 'Case 6',
            client: 'Client 6',
            category: 'System Development',
            description: 'Description 6',
            results: ['Result 6.1', 'Result 6.2', 'Result 6.3'],
            tags: ['Vue.js', 'Node.js', 'MongoDB'],
          },
        ];

        if (index >= 0 && index < cases.length) {
          const caseData = cases[index];
          if (field === 'results' && subField !== undefined) {
            const resultIndex = parseInt(subField, 10);
            return caseData.results[resultIndex];
          }
          return caseData[field as keyof typeof caseData];
        }
      }

      // Handle interpolation for filters.showing
      if (key === 'filters.showing' && params) {
        return `Showing ${params.count} cases`;
      }

      return translations[key] || key;
    };

    t.raw = (key: string) => {
      if (key.startsWith('cases.')) {
        const parts = key.split('.');
        const index = parseInt(parts[1], 10);
        const field = parts[2];

        const cases = [
          { tags: ['React', 'Next.js', 'PostgreSQL'] },
          { tags: ['Brand Strategy', 'VI Design', 'Logo Design'] },
          { tags: ['React Native', 'iOS', 'Android'] },
          { tags: ['UI/UX', 'Responsive Design', 'SEO'] },
          { tags: ['Social Media', 'SEO/SEM', 'Content Marketing'] },
          { tags: ['Vue.js', 'Node.js', 'MongoDB'] },
        ];

        if (index >= 0 && index < cases.length && field === 'tags') {
          return cases[index].tags;
        }
      }

      if (key === 'mockData.metrics') {
        return [
          { label: 'User Growth', value: '+150%' },
          { label: 'Performance Boost', value: '+60%' },
          { label: 'Client Satisfaction', value: '95%' },
          { label: 'ROI', value: '+200%' },
        ];
      }

      return key;
    };

    return t;
  },
}));

describe('Case Filtering Functionality', () => {
  it('should render all cases initially', () => {
    render(<CasesPage />);
    
    expect(screen.getByText('Case Studies')).toBeInTheDocument();
    expect(screen.getByText('Showing 6 cases')).toBeInTheDocument();
  });

  it('should filter cases by category', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Click on Web Development category
    const webDevButton = screen.getByRole('button', { name: 'Web Development' });
    await user.click(webDevButton);

    // Should show only 1 case
    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });

    // Should show the Web Development case
    expect(screen.getByText('Case 1')).toBeInTheDocument();
    expect(screen.queryByText('Case 2')).not.toBeInTheDocument();
  });

  it('should filter cases by tag', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Click on React tag
    const reactButton = screen.getByRole('button', { name: 'React' });
    await user.click(reactButton);

    // Should show only 1 case (Case 1 has React tag)
    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });
  });

  it('should combine category and tag filters', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Select Web Development category
    const webDevButton = screen.getByRole('button', { name: 'Web Development' });
    await user.click(webDevButton);

    // Select React tag
    const reactButton = screen.getByRole('button', { name: 'React' });
    await user.click(reactButton);

    // Should show 1 case that matches both filters
    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });
  });

  it('should show no results message when no cases match', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Select Web Development category
    const webDevButton = screen.getByRole('button', { name: 'Web Development' });
    await user.click(webDevButton);

    // Select a tag that doesn't exist in Web Development
    const vueButton = screen.getByRole('button', { name: 'Vue.js' });
    await user.click(vueButton);

    // Should show no results message
    await waitFor(() => {
      expect(screen.getByText('No matching cases found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or clear all filters')).toBeInTheDocument();
    });
  });

  it('should clear filters when Clear Filters button is clicked', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Apply filters that result in no matches
    const webDevButton = screen.getByRole('button', { name: 'Web Development' });
    await user.click(webDevButton);

    const vueButton = screen.getByRole('button', { name: 'Vue.js' });
    await user.click(vueButton);

    // Wait for no results message
    await waitFor(() => {
      expect(screen.getByText('No matching cases found')).toBeInTheDocument();
    });

    // Click clear filters
    const clearButton = screen.getByRole('button', { name: 'Clear Filters' });
    await user.click(clearButton);

    // Should show all cases again
    await waitFor(() => {
      expect(screen.getByText('Showing 6 cases')).toBeInTheDocument();
    });
  });

  it('should update results count when filters change', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Initially shows all 6 cases
    expect(screen.getByText('Showing 6 cases')).toBeInTheDocument();

    // Filter by category
    const brandButton = screen.getByRole('button', { name: 'Brand Design' });
    await user.click(brandButton);

    // Should update count
    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });
  });

  it('should allow switching between filters', async () => {
    const user = userEvent.setup();
    render(<CasesPage />);

    // Select first category
    const webDevButton = screen.getByRole('button', { name: 'Web Development' });
    await user.click(webDevButton);

    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });

    // Select different category
    const brandButton = screen.getByRole('button', { name: 'Brand Design' });
    await user.click(brandButton);

    // Should show different count
    await waitFor(() => {
      expect(screen.getByText('Showing 1 cases')).toBeInTheDocument();
    });

    // Should show different case
    expect(screen.getByText('Case 2')).toBeInTheDocument();
    expect(screen.queryByText('Case 1')).not.toBeInTheDocument();
  });

  it('should show filter labels', () => {
    render(<CasesPage />);

    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    expect(screen.getByText('Filter by Technology')).toBeInTheDocument();
  });

  it('should show All button for both filters', () => {
    render(<CasesPage />);

    const allButtons = screen.getAllByRole('button', { name: 'All' });
    expect(allButtons).toHaveLength(2); // One for category, one for tag
  });
});
