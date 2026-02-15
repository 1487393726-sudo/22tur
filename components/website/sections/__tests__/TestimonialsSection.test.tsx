/**
 * TestimonialsSection Component Tests
 * 
 * Unit tests for the TestimonialsSection component
 * Tests rendering, carousel navigation, auto-play, and accessibility
 * 
 * Requirements: 7.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestimonialsSection, Testimonial } from '../TestimonialsSection';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onDragEnd, ...props }: any) => (
      <div {...props} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <span data-testid="chevron-left">←</span>,
  ChevronRight: () => <span data-testid="chevron-right">→</span>,
  Star: ({ className }: { className?: string }) => (
    <span data-testid="star" className={className}>★</span>
  ),
  Quote: () => <span data-testid="quote">"</span>,
}));

// Mock Card3D component
jest.mock('@/components/website/3d/Card3D', () => ({
  Card3D: ({ children, className }: any) => (
    <div data-testid="card-3d" className={className}>
      {children}
    </div>
  ),
}));

// Mock FadeInView component
jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div data-testid="fade-in-view">{children}</div>,
}));

describe('TestimonialsSection', () => {
  const mockTestimonials: Testimonial[] = [
    {
      name: 'John Doe',
      role: 'CEO, Tech Company',
      content: 'Great service and excellent results!',
      rating: 5,
    },
    {
      name: 'Jane Smith',
      role: 'Product Manager',
      content: 'Highly professional and innovative team.',
      rating: 5,
    },
    {
      name: 'Bob Johnson',
      role: 'Marketing Director',
      content: 'Exceeded our expectations in every way.',
      rating: 4,
    },
  ];

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render section with title and subtitle', () => {
      render(
        <TestimonialsSection
          title="Customer Reviews"
          subtitle="What our clients say"
          testimonials={mockTestimonials}
        />
      );

      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
      expect(screen.getByText('What our clients say')).toBeInTheDocument();
    });

    it('should render without title and subtitle', () => {
      const { container } = render(
        <TestimonialsSection testimonials={mockTestimonials} />
      );

      expect(container.querySelector('h2')).not.toBeInTheDocument();
    });

    it('should render first testimonial by default', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('CEO, Tech Company')).toBeInTheDocument();
      expect(screen.getByText('"Great service and excellent results!"')).toBeInTheDocument();
    });

    it('should render star rating correctly', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const stars = screen.getAllByTestId('star');
      expect(stars).toHaveLength(5);
    });

    it('should render avatar when provided', () => {
      const testimonialsWithAvatar: Testimonial[] = [
        {
          ...mockTestimonials[0],
          avatar: '/avatar.jpg',
        },
      ];

      render(<TestimonialsSection testimonials={testimonialsWithAvatar} />);

      const avatar = screen.getByAltText('John Doe');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/avatar.jpg');
    });

    it('should render initial when no avatar provided', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      expect(screen.getByText('J')).toBeInTheDocument(); // First letter of name
    });

    it('should render company logo when provided', () => {
      const testimonialsWithLogo: Testimonial[] = [
        {
          ...mockTestimonials[0],
          companyLogo: '/logo.png',
        },
      ];

      render(<TestimonialsSection testimonials={testimonialsWithLogo} />);

      const logo = screen.getByAltText('Company');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/logo.png');
    });
  });

  describe('Navigation', () => {
    it('should render navigation arrows when showNavigation is true', () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          showNavigation={true}
        />
      );

      expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
      expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
    });

    it('should not render navigation arrows when showNavigation is false', () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          showNavigation={false}
        />
      );

      expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
    });

    it('should navigate to next testimonial when next button clicked', async () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const nextButton = screen.getByLabelText('Next testimonial');
      
      act(() => {
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should navigate to previous testimonial when prev button clicked', async () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const prevButton = screen.getByLabelText('Previous testimonial');
      
      act(() => {
        fireEvent.click(prevButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('should not render navigation for single testimonial', () => {
      render(<TestimonialsSection testimonials={[mockTestimonials[0]]} />);

      expect(screen.queryByLabelText('Previous testimonial')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next testimonial')).not.toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should render pagination dots when showPagination is true', () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          showPagination={true}
        />
      );

      const dots = screen.getAllByRole('button', { name: /Go to testimonial/i });
      expect(dots).toHaveLength(3);
    });

    it('should not render pagination dots when showPagination is false', () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          showPagination={false}
        />
      );

      const dots = screen.queryAllByRole('button', { name: /Go to testimonial/i });
      expect(dots).toHaveLength(0);
    });

    it('should navigate to specific testimonial when dot clicked', async () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const thirdDot = screen.getByLabelText('Go to testimonial 3');
      
      act(() => {
        fireEvent.click(thirdDot);
      });

      await waitFor(() => {
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('should highlight active pagination dot', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const firstDot = screen.getByLabelText('Go to testimonial 1');
      expect(firstDot).toHaveAttribute('aria-current', 'true');
    });

    it('should not render pagination for single testimonial', () => {
      render(<TestimonialsSection testimonials={[mockTestimonials[0]]} />);

      const dots = screen.queryAllByRole('button', { name: /Go to testimonial/i });
      expect(dots).toHaveLength(0);
    });
  });

  describe('Auto-play', () => {
    it('should auto-advance to next testimonial after interval', async () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          autoPlayInterval={3000}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should not auto-play when autoPlayInterval is 0', async () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          autoPlayInterval={0}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still show first testimonial
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should pause auto-play on mouse enter', async () => {
      const { container } = render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          autoPlayInterval={3000}
        />
      );

      const carouselContainer = container.querySelector('.relative.max-w-4xl');
      
      act(() => {
        fireEvent.mouseEnter(carouselContainer!);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Should still show first testimonial (paused)
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should resume auto-play on mouse leave', async () => {
      const { container } = render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          autoPlayInterval={3000}
        />
      );

      const carouselContainer = container.querySelector('.relative.max-w-4xl');
      
      act(() => {
        fireEvent.mouseEnter(carouselContainer!);
        fireEvent.mouseLeave(carouselContainer!);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on navigation buttons', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      expect(screen.getByLabelText('Previous testimonial')).toBeInTheDocument();
      expect(screen.getByLabelText('Next testimonial')).toBeInTheDocument();
    });

    it('should have proper ARIA labels on pagination dots', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      expect(screen.getByLabelText('Go to testimonial 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to testimonial 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to testimonial 3')).toBeInTheDocument();
    });

    it('should have focus styles on interactive elements', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const nextButton = screen.getByLabelText('Next testimonial');
      expect(nextButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should support keyboard navigation', () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const nextButton = screen.getByLabelText('Next testimonial');
      nextButton.focus();
      
      expect(document.activeElement).toBe(nextButton);
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          className="custom-class"
        />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should apply custom background', () => {
      const { container } = render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          background="bg-blue-500"
        />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-blue-500');
    });

    it('should render Card3D with correct props', () => {
      render(
        <TestimonialsSection
          testimonials={mockTestimonials}
          glassIntensity="heavy"
          depth="deep"
        />
      );

      const card = screen.getByTestId('card-3d');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty testimonials array gracefully', () => {
      const { container } = render(<TestimonialsSection testimonials={[]} />);

      // Should not crash, but won't render any content
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should wrap around when navigating past last testimonial', async () => {
      render(<TestimonialsSection testimonials={mockTestimonials} />);

      const nextButton = screen.getByLabelText('Next testimonial');
      
      // Click next 3 times to wrap around
      act(() => {
        fireEvent.click(nextButton);
      });
      act(() => {
        fireEvent.click(nextButton);
      });
      act(() => {
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should handle testimonials with missing optional fields', () => {
      const minimalTestimonial: Testimonial[] = [
        {
          name: 'Test User',
          role: 'Tester',
          content: 'Test content',
          rating: 3,
        },
      ];

      render(<TestimonialsSection testimonials={minimalTestimonial} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByAltText('Test User')).not.toBeInTheDocument(); // No avatar
      expect(screen.queryByAltText('Company')).not.toBeInTheDocument(); // No logo
    });
  });
});
