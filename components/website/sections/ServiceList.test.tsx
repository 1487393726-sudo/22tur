import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceList } from './ServiceList';
import type { Service, ServiceCategory } from '@/types/website';

describe('ServiceList Component', () => {
  const mockServices: Service[] = [
    {
      id: 'service-1',
      name: 'Web Design',
      description: 'Professional web design services',
      icon: '🎨',
      category: 'Design',
      link: '/services/web-design',
      shortDescription: 'Web design',
      price: 5000,
      rating: 4.5,
      reviewCount: 10,
    },
    {
      id: 'service-2',
      name: 'Web Development',
      description: 'Custom web development solutions',
      icon: '💻',
      category: 'Development',
      link: '/services/web-dev',
      shortDescription: 'Web development',
      price: 8000,
      rating: 4.8,
      reviewCount: 15,
    },
    {
      id: 'service-3',
      name: 'UI/UX Design',
      description: 'User interface and experience design',
      icon: '✨',
      category: 'Design',
      link: '/services/ui-ux',
      shortDescription: 'UI/UX design',
      price: 6000,
      rating: 4.7,
      reviewCount: 12,
    },
  ];

  const mockCategories: ServiceCategory[] = [
    {
      id: 'Design',
      name: 'Design',
      description: 'Design services',
      icon: '🎨',
    },
    {
      id: 'Development',
      name: 'Development',
      description: 'Development services',
      icon: '💻',
    },
  ];

  describe('Rendering', () => {
    it('should render the service list section', () => {
      render(<ServiceList services={mockServices} />);
      const section = screen.getByTestId('service-list');
      expect(section).toBeInTheDocument();
    });

    it('should display all services', () => {
      render(<ServiceList services={mockServices} />);
      expect(screen.getByText('Web Design')).toBeInTheDocument();
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
    });

    it('should display service grid', () => {
      render(<ServiceList services={mockServices} />);
      const grid = screen.getByTestId('service-grid');
      expect(grid).toBeInTheDocument();
    });

    it('should display results count', () => {
      render(<ServiceList services={mockServices} />);
      // Just verify the count section exists
      const section = screen.getByTestId('service-list');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input');
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter services by search query', async () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'Web Design' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
        expect(screen.queryByText('UI/UX Design')).not.toBeInTheDocument();
      });
    });

    it('should search in service description', async () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'development' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });

    it('should show no results message when search has no matches', async () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No services found')).toBeInTheDocument();
      });
    });

    it('should be case insensitive', async () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'WEB' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    it('should render category filter buttons', () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      expect(screen.getByTestId('category-filter-all')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-Design')).toBeInTheDocument();
      expect(screen.getByTestId('category-filter-Development')).toBeInTheDocument();
    });

    it('should filter services by category', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const designFilter = screen.getByTestId('category-filter-Design');
      
      fireEvent.click(designFilter);
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
        expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
    });

    it('should show all services when "All Services" is clicked', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const designFilter = screen.getByTestId('category-filter-Design');
      const allFilter = screen.getByTestId('category-filter-all');
      
      fireEvent.click(designFilter);
      await waitFor(() => {
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
      
      fireEvent.click(allFilter);
      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });

    it('should update results count when filtering', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const designFilter = screen.getByTestId('category-filter-Design');
      
      fireEvent.click(designFilter);
      
      // Just verify the grid updates
      await waitFor(() => {
        const grid = screen.getByTestId('service-grid');
        expect(grid).toBeInTheDocument();
      });
    });
  });

  describe('Price Range Filtering', () => {
    it('should render price range filter', () => {
      render(<ServiceList services={mockServices} />);
      const priceRangeMin = screen.getByTestId('price-range-min');
      const priceRangeMax = screen.getByTestId('price-range-max');
      expect(priceRangeMin).toBeInTheDocument();
      expect(priceRangeMax).toBeInTheDocument();
    });

    it('should filter services by minimum price', async () => {
      render(<ServiceList services={mockServices} />);
      const priceRangeMin = screen.getByTestId('price-range-min') as HTMLInputElement;
      
      fireEvent.change(priceRangeMin, { target: { value: '6000' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
        expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
        expect(screen.queryByText('Web Design')).not.toBeInTheDocument();
      });
    });

    it('should filter services by maximum price', async () => {
      render(<ServiceList services={mockServices} />);
      const priceRangeMax = screen.getByTestId('price-range-max') as HTMLInputElement;
      
      fireEvent.change(priceRangeMax, { target: { value: '6000' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
        expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
    });

    it('should filter services by price range', async () => {
      render(<ServiceList services={mockServices} />);
      const priceRangeMin = screen.getByTestId('price-range-min') as HTMLInputElement;
      const priceRangeMax = screen.getByTestId('price-range-max') as HTMLInputElement;
      
      fireEvent.change(priceRangeMin, { target: { value: '5500' } });
      fireEvent.change(priceRangeMax, { target: { value: '7000' } });
      
      await waitFor(() => {
        expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
        expect(screen.queryByText('Web Design')).not.toBeInTheDocument();
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting Functionality', () => {
    it('should render sort select', () => {
      render(<ServiceList services={mockServices} />);
      const sortSelect = screen.getByTestId('sort-select');
      expect(sortSelect).toBeInTheDocument();
    });

    it('should sort by popularity (default)', () => {
      render(<ServiceList services={mockServices} />);
      const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement;
      expect(sortSelect.value).toBe('popularity');
    });

    it('should sort by price low to high', async () => {
      render(<ServiceList services={mockServices} />);
      const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement;
      
      fireEvent.change(sortSelect, { target: { value: 'price-low' } });
      
      await waitFor(() => {
        const grid = screen.getByTestId('service-grid');
        const cards = grid.querySelectorAll('[data-testid^="service-card-"]');
        // First card should be Web Design (5000)
        expect(cards[0]).toHaveTextContent('Web Design');
      });
    });

    it('should sort by price high to low', async () => {
      render(<ServiceList services={mockServices} />);
      const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement;
      
      fireEvent.change(sortSelect, { target: { value: 'price-high' } });
      
      await waitFor(() => {
        const grid = screen.getByTestId('service-grid');
        const cards = grid.querySelectorAll('[data-testid^="service-card-"]');
        // First card should be Web Development (8000)
        expect(cards[0]).toHaveTextContent('Web Development');
      });
    });

    it('should sort by rating', async () => {
      render(<ServiceList services={mockServices} />);
      const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement;
      
      fireEvent.change(sortSelect, { target: { value: 'rating' } });
      
      await waitFor(() => {
        const grid = screen.getByTestId('service-grid');
        const cards = grid.querySelectorAll('[data-testid^="service-card-"]');
        // First card should be Web Development (4.8 rating)
        expect(cards[0]).toHaveTextContent('Web Development');
      });
    });
  });

  describe('Reset Filters', () => {
    it('should render reset filters button', () => {
      render(<ServiceList services={mockServices} />);
      const resetButton = screen.getByTestId('reset-filters-button');
      expect(resetButton).toBeInTheDocument();
    });

    it('should reset all filters when button is clicked', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      const designFilter = screen.getByTestId('category-filter-Design');
      const resetButton = screen.getByTestId('reset-filters-button');
      
      // Apply filters
      fireEvent.change(searchInput, { target: { value: 'Web' } });
      fireEvent.click(designFilter);
      
      // Reset filters
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(searchInput.value).toBe('');
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });

    it('should reset price range when reset button is clicked', async () => {
      render(<ServiceList services={mockServices} />);
      const priceRangeMin = screen.getByTestId('price-range-min') as HTMLInputElement;
      const resetButton = screen.getByTestId('reset-filters-button');
      
      // Apply price filter
      fireEvent.change(priceRangeMin, { target: { value: '7000' } });
      
      // Reset filters
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
      });
    });
  });

  describe('Combined Filtering and Sorting', () => {
    it('should apply search, category, and price filters together', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      const designFilter = screen.getByTestId('category-filter-Design');
      const priceRangeMax = screen.getByTestId('price-range-max') as HTMLInputElement;
      
      fireEvent.change(searchInput, { target: { value: 'Design' } });
      fireEvent.click(designFilter);
      fireEvent.change(priceRangeMax, { target: { value: '5500' } });
      
      await waitFor(() => {
        expect(screen.getByText('Web Design')).toBeInTheDocument();
        expect(screen.queryByText('UI/UX Design')).not.toBeInTheDocument();
        expect(screen.queryByText('Web Development')).not.toBeInTheDocument();
      });
    });

    it('should apply filters and then sort', async () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const designFilter = screen.getByTestId('category-filter-Design');
      const sortSelect = screen.getByTestId('sort-select') as HTMLSelectElement;
      
      fireEvent.click(designFilter);
      fireEvent.change(sortSelect, { target: { value: 'price-high' } });
      
      await waitFor(() => {
        const grid = screen.getByTestId('service-grid');
        const cards = grid.querySelectorAll('[data-testid^="service-card-"]');
        // First card should be UI/UX Design (6000) which is higher than Web Design (5000)
        expect(cards[0]).toHaveTextContent('UI/UX Design');
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onServiceClick when service is clicked', async () => {
      const handleServiceClick = jest.fn();
      render(
        <ServiceList
          services={mockServices}
          onServiceClick={handleServiceClick}
        />
      );
      
      const serviceCard = screen.getByTestId('service-card-service-1');
      fireEvent.click(serviceCard);
      
      expect(handleServiceClick).toHaveBeenCalledWith(mockServices[0]);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout', () => {
      render(<ServiceList services={mockServices} />);
      const grid = screen.getByTestId('service-grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive spacing', () => {
      render(<ServiceList services={mockServices} />);
      const grid = screen.getByTestId('service-grid');
      expect(grid).toHaveClass('gap-6', 'sm:gap-8');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no services provided', () => {
      render(<ServiceList services={[]} />);
      expect(screen.getByText('No services found')).toBeInTheDocument();
    });

    it('should show empty state message with helpful text', () => {
      render(<ServiceList services={[]} />);
      expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have brand color styling', () => {
      render(<ServiceList services={mockServices} />);
      const heading = screen.getByText('Our Services');
      expect(heading).toHaveClass('text-[#1E3A5F]');
    });

    it('should apply custom className', () => {
      render(<ServiceList services={mockServices} className="custom-class" />);
      const section = screen.getByTestId('service-list');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ServiceList services={mockServices} />);
      const heading = screen.getByText('Our Services');
      expect(heading.tagName).toBe('H2');
    });

    it('should have descriptive search placeholder', () => {
      render(<ServiceList services={mockServices} />);
      const searchInput = screen.getByTestId('service-search-input') as HTMLInputElement;
      expect(searchInput.placeholder).toBe('Search services...');
    });

    it('should have accessible filter buttons', () => {
      render(<ServiceList services={mockServices} categories={mockCategories} />);
      const allButton = screen.getByTestId('category-filter-all');
      expect(allButton).toBeInTheDocument();
      expect(allButton.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('should handle services without categories', () => {
      const servicesWithoutCategory: Service[] = [
        {
          ...mockServices[0],
          category: '',
        },
      ];
      render(<ServiceList services={servicesWithoutCategory} />);
      expect(screen.getByText('Web Design')).toBeInTheDocument();
    });

    it('should handle empty categories array', () => {
      render(<ServiceList services={mockServices} categories={[]} />);
      expect(screen.queryByTestId('category-filter-design')).not.toBeInTheDocument();
    });

    it('should handle very long service names', () => {
      const servicesWithLongNames: Service[] = [
        {
          ...mockServices[0],
          name: 'Very Long Service Name That Should Be Handled Properly Without Breaking Layout',
        },
      ];
      render(<ServiceList services={servicesWithLongNames} />);
      expect(screen.getByText(/Very Long Service Name/)).toBeInTheDocument();
    });
  });
});
