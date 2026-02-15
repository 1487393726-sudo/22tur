import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TestimonialSection from './TestimonialSection';
import type { Testimonial } from '@/types/website';

describe('TestimonialSection Component', () => {
  const mockTestimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      content: 'This company provided exceptional service and delivered results beyond our expectations.',
      author: 'John Smith',
      company: 'Tech Corp',
      rating: 5,
      avatar: 'https://via.placeholder.com/64x64',
      videoUrl: 'https://example.com/video1',
    },
    {
      id: 'testimonial-2',
      content: 'Professional team, great communication, and outstanding quality. Highly recommended!',
      author: 'Sarah Johnson',
      company: 'Design Studio',
      rating: 5,
      avatar: 'https://via.placeholder.com/64x64',
    },
    {
      id: 'testimonial-3',
      content: 'The best investment we made for our business. Transformed our operations completely.',
      author: 'Michael Chen',
      company: 'Innovation Labs',
      rating: 4,
      avatar: 'https://via.placeholder.com/64x64',
    },
    {
      id: 'testimonial-4',
      content: 'Excellent support and continuous improvement. They truly care about client success.',
      author: 'Emily Davis',
      company: 'Growth Partners',
      rating: 5,
      avatar: 'https://via.placeholder.com/64x64',
    },
  ];

  describe('Rendering', () => {
    test('should render testimonial section', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId('testimonial-section')).toBeInTheDocument();
    });

    test('should render heading', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByText('What Our Clients Say')).toBeInTheDocument();
    });

    test('should render description', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(
        screen.getByText(/Hear from our satisfied clients/i)
      ).toBeInTheDocument();
    });

    test('should render first testimonial by default', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonials[0].company)).toBeInTheDocument();
    });

    test('should render testimonial content', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByText(new RegExp(mockTestimonials[0].content))).toBeInTheDocument();
    });

    test('should render author avatar', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const avatar = screen.getByAltText(mockTestimonials[0].author);
      expect(avatar).toHaveAttribute('src', mockTestimonials[0].avatar);
    });

    test('should render with custom className', () => {
      render(
        <TestimonialSection
          testimonials={mockTestimonials}
          className="custom-class"
        />
      );
      const section = screen.getByTestId('testimonial-section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Rating Display', () => {
    test('should render correct number of stars', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const stars = screen.getAllByTestId(/star-testimonial-1-/);
      expect(stars).toHaveLength(5);
    });

    test('should highlight filled stars based on rating', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const filledStars = screen.getAllByTestId(/star-testimonial-1-/).filter(
        (star) => star.className.includes('text-yellow-400')
      );
      expect(filledStars).toHaveLength(mockTestimonials[0].rating);
    });

    test('should display correct rating for different testimonials', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      // Click next to go to testimonial with 4 stars
      fireEvent.click(screen.getByTestId('next-button'));
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        const filledStars = screen.getAllByTestId(/star-testimonial-3-/).filter(
          (star) => star.className.includes('text-yellow-400')
        );
        expect(filledStars).toHaveLength(4);
      });
    });
  });

  describe('Navigation', () => {
    test('should render navigation buttons when multiple testimonials', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId('prev-button')).toBeInTheDocument();
      expect(screen.getByTestId('next-button')).toBeInTheDocument();
    });

    test('should not render navigation buttons for single testimonial', () => {
      render(<TestimonialSection testimonials={[mockTestimonials[0]]} />);
      expect(screen.queryByTestId('prev-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
    });

    test('should navigate to next testimonial', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[1].author)).toBeInTheDocument();
      });
    });

    test('should navigate to previous testimonial', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[1].author)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('prev-button'));
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
      });
    });

    test('should wrap around when navigating past last testimonial', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      // Navigate to last testimonial
      for (let i = 0; i < mockTestimonials.length; i++) {
        fireEvent.click(screen.getByTestId('next-button'));
      }
      
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
      });
    });

    test('should wrap around when navigating before first testimonial', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('prev-button'));
      
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[mockTestimonials.length - 1].author)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination Dots', () => {
    test('should render pagination dots', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId('pagination-dots')).toBeInTheDocument();
    });

    test('should render correct number of dots', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const dots = screen.getAllByTestId(/dot-/);
      expect(dots).toHaveLength(mockTestimonials.length);
    });

    test('should highlight active dot', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const activeDot = screen.getByTestId('dot-0');
      expect(activeDot).toHaveClass('bg-blue-600');
    });

    test('should navigate to testimonial when dot is clicked', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('dot-2'));
      
      await waitFor(() => {
        expect(screen.getByText(mockTestimonials[2].author)).toBeInTheDocument();
      });
    });

    test('should update active dot when navigating', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        const activeDot = screen.getByTestId('dot-1');
        expect(activeDot).toHaveClass('bg-blue-600');
      });
    });

    test('should not render dots for single testimonial', () => {
      render(<TestimonialSection testimonials={[mockTestimonials[0]]} />);
      expect(screen.queryByTestId('pagination-dots')).not.toBeInTheDocument();
    });
  });

  describe('Counter Display', () => {
    test('should display testimonial counter', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId('counter')).toBeInTheDocument();
      expect(screen.getByText('1 of 4')).toBeInTheDocument();
    });

    test('should update counter when navigating', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByText('2 of 4')).toBeInTheDocument();
      });
    });

    test('should not display counter for single testimonial', () => {
      render(<TestimonialSection testimonials={[mockTestimonials[0]]} />);
      expect(screen.queryByTestId('counter')).not.toBeInTheDocument();
    });
  });

  describe('Video Testimonials', () => {
    test('should render video link when available', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const videoLink = screen.getByTestId('video-link-testimonial-1');
      expect(videoLink).toBeInTheDocument();
      expect(videoLink).toHaveAttribute('href', mockTestimonials[0].videoUrl);
    });

    test('should not render video link when not available', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.queryByTestId('video-link-testimonial-2')).not.toBeInTheDocument();
      });
    });

    test('should open video in new tab', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const videoLink = screen.getByTestId('video-link-testimonial-1');
      expect(videoLink).toHaveAttribute('target', '_blank');
      expect(videoLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Empty State', () => {
    test('should render empty state when no testimonials', () => {
      render(<TestimonialSection testimonials={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No testimonials available at this time.')).toBeInTheDocument();
    });

    test('should not render carousel when no testimonials', () => {
      render(<TestimonialSection testimonials={[]} />);
      expect(screen.queryByTestId('carousel-container')).not.toBeInTheDocument();
    });

    test('should not render navigation when no testimonials', () => {
      render(<TestimonialSection testimonials={[]} />);
      expect(screen.queryByTestId('prev-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
    });
  });

  describe('Autoplay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    test('should autoplay by default', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText(mockTestimonials[1].author)).toBeInTheDocument();
    });

    test('should respect custom autoplay interval', () => {
      render(
        <TestimonialSection
          testimonials={mockTestimonials}
          autoplayInterval={3000}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      expect(screen.getByText(mockTestimonials[1].author)).toBeInTheDocument();
    });

    test('should not autoplay when disabled', () => {
      render(
        <TestimonialSection
          testimonials={mockTestimonials}
          autoplay={false}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });
      
      expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
    });

    test('should cycle through all testimonials', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      act(() => {
        jest.advanceTimersByTime(5000 * mockTestimonials.length);
      });
      
      expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const heading = screen.getByText('What Our Clients Say');
      expect(heading.tagName).toBe('H2');
    });

    test('should have alt text for avatars', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      // Only the current testimonial's avatar is rendered
      const avatar = screen.getByAltText(mockTestimonials[0].author);
      expect(avatar).toHaveAttribute('alt', mockTestimonials[0].author);
    });

    test('should have semantic HTML structure', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const section = screen.getByTestId('testimonial-section');
      expect(section.tagName).toBe('SECTION');
    });

    test('should have aria-labels for navigation buttons', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId('prev-button')).toHaveAttribute('aria-label');
      expect(screen.getByTestId('next-button')).toHaveAttribute('aria-label');
    });

    test('should have aria-labels for pagination dots', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const dots = screen.getAllByTestId(/dot-/);
      dots.forEach((dot) => {
        expect(dot).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive padding', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const section = screen.getByTestId('testimonial-section');
      expect(section).toHaveClass('py-12', 'md:py-16', 'lg:py-20');
    });

    test('should have responsive card padding', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const card = screen.getByTestId(`testimonial-card-${mockTestimonials[0].id}`);
      expect(card).toHaveClass('p-8', 'md:p-12');
    });

    test('should have responsive arrow positioning', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      const prevButton = screen.getByTestId('prev-button');
      expect(prevButton).toHaveClass('-translate-x-4', 'md:-translate-x-6');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long testimonial content', () => {
      const longTestimonials: Testimonial[] = [
        {
          id: 'testimonial-1',
          content: 'This is a very long testimonial that contains a lot of text and should be properly truncated without breaking the layout. '.repeat(5),
          author: 'John Smith',
          company: 'Tech Corp',
          rating: 5,
          avatar: 'https://via.placeholder.com/64x64',
        },
      ];
      render(<TestimonialSection testimonials={longTestimonials} />);
      const content = screen.getByText(new RegExp(longTestimonials[0].content.substring(0, 50)));
      expect(content).toHaveClass('line-clamp-4');
    });

    test('should handle testimonials with special characters', () => {
      const specialCharTestimonials: Testimonial[] = [
        {
          id: 'testimonial-1',
          content: "O'Brien & Co.'s service was \"exceptional\" - 100% recommended! @company #amazing",
          author: "O'Brien & Co.",
          company: 'Tech & Innovation',
          rating: 5,
          avatar: 'https://via.placeholder.com/64x64',
        },
      ];
      render(<TestimonialSection testimonials={specialCharTestimonials} />);
      expect(screen.getByText(/O'Brien & Co.'s service/)).toBeInTheDocument();
    });

    test('should handle testimonials with different rating values', async () => {
      const ratingTestimonials: Testimonial[] = [
        { ...mockTestimonials[0], id: 'test-1', rating: 1 },
        { ...mockTestimonials[0], id: 'test-2', rating: 2 },
        { ...mockTestimonials[0], id: 'test-3', rating: 3 },
        { ...mockTestimonials[0], id: 'test-4', rating: 4 },
        { ...mockTestimonials[0], id: 'test-5', rating: 5 },
      ];
      render(<TestimonialSection testimonials={ratingTestimonials} />);
      
      for (let i = 0; i < ratingTestimonials.length; i++) {
        const filledStars = screen.getAllByTestId(/star-test-/).filter(
          (star) => star.className.includes('text-yellow-400')
        );
        expect(filledStars).toHaveLength(ratingTestimonials[i].rating);
        
        if (i < ratingTestimonials.length - 1) {
          fireEvent.click(screen.getByTestId('next-button'));
          await waitFor(() => {
            // Wait for next testimonial to load
          });
        }
      }
    });

    test('should handle testimonials with very long author names', () => {
      const longNameTestimonials: Testimonial[] = [
        {
          id: 'testimonial-1',
          content: 'Great service!',
          author: 'This is a very long author name that should be displayed properly without breaking the layout',
          company: 'Tech Corp',
          rating: 5,
          avatar: 'https://via.placeholder.com/64x64',
        },
      ];
      render(<TestimonialSection testimonials={longNameTestimonials} />);
      expect(screen.getByText(/This is a very long author name/)).toBeInTheDocument();
    });
  });

  describe('Carousel Behavior', () => {
    test('should display correct testimonial card', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByTestId(`testimonial-card-${mockTestimonials[0].id}`)).toBeInTheDocument();
    });

    test('should update testimonial card when navigating', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('next-button'));
      
      await waitFor(() => {
        expect(screen.getByTestId(`testimonial-card-${mockTestimonials[1].id}`)).toBeInTheDocument();
      });
    });

    test('should maintain carousel state during navigation', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      fireEvent.click(screen.getByTestId('dot-2'));
      await waitFor(() => {
        expect(screen.getByText('3 of 4')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('next-button'));
      await waitFor(() => {
        expect(screen.getByText('4 of 4')).toBeInTheDocument();
      });
    });
  });

  describe('Author Information Display', () => {
    test('should display author name and company', () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      expect(screen.getByText(mockTestimonials[0].author)).toBeInTheDocument();
      expect(screen.getByText(mockTestimonials[0].company)).toBeInTheDocument();
    });

    test('should display author information consistently', async () => {
      render(<TestimonialSection testimonials={mockTestimonials} />);
      
      for (let i = 0; i < mockTestimonials.length; i++) {
        expect(screen.getByText(mockTestimonials[i].author)).toBeInTheDocument();
        expect(screen.getByText(mockTestimonials[i].company)).toBeInTheDocument();
        
        if (i < mockTestimonials.length - 1) {
          fireEvent.click(screen.getByTestId('next-button'));
          await waitFor(() => {
            // Wait for next testimonial
          });
        }
      }
    });
  });
});
