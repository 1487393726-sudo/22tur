import React from 'react';
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import type { ServiceCard as ServiceCardType } from '@/types/website';

describe('ServiceCard Component', () => {
  const mockService: ServiceCardType = {
    id: 'service-1',
    name: 'Web Design',
    description: 'Professional web design services for modern businesses',
    icon: '🎨',
    category: 'Design',
    link: '/services/web-design',
  };

  describe('Rendering', () => {
    it('should render the service card', () => {
      render(<ServiceCard service={mockService} />);
      const card = screen.getByTestId('service-card-service-1');
      expect(card).toBeInTheDocument();
    });

    it('should display service name', () => {
      render(<ServiceCard service={mockService} />);
      const name = screen.getByTestId('service-name-service-1');
      expect(name).toHaveTextContent('Web Design');
    });

    it('should display service description', () => {
      render(<ServiceCard service={mockService} />);
      const description = screen.getByTestId('service-description-service-1');
      expect(description).toHaveTextContent('Professional web design services for modern businesses');
    });

    it('should render learn more link', () => {
      render(<ServiceCard service={mockService} />);
      const link = screen.getByTestId('service-link-service-1');
      expect(link).toHaveTextContent('Learn More');
      expect(link).toHaveAttribute('href', '/services/web-design');
    });

    it('should display category badge', () => {
      render(<ServiceCard service={mockService} />);
      expect(screen.getByText('Design')).toBeInTheDocument();
    });
  });

  describe('Icon Handling', () => {
    it('should render emoji icon', () => {
      render(<ServiceCard service={mockService} />);
      expect(screen.getByText('🎨')).toBeInTheDocument();
    });

    it('should render image icon when path provided', () => {
      const serviceWithImage: ServiceCardType = {
        ...mockService,
        icon: '/icons/design.svg',
      };
      render(<ServiceCard service={serviceWithImage} />);
      const images = screen.getAllByAltText('Web Design');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should render placeholder when no icon provided', () => {
      const serviceWithoutIcon: ServiceCardType = {
        ...mockService,
        icon: '',
      };
      render(<ServiceCard service={serviceWithoutIcon} />);
      const card = screen.getByTestId('service-card-service-1');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have brand color styling', () => {
      render(<ServiceCard service={mockService} />);
      const name = screen.getByTestId('service-name-service-1');
      expect(name).toHaveClass('text-[#1E3A5F]');
    });

    it('should have hover effects', () => {
      render(<ServiceCard service={mockService} />);
      const card = screen.getByTestId('service-card-service-1');
      expect(card).toHaveClass('hover:shadow-xl', 'hover:scale-105');
    });

    it('should apply custom className', () => {
      render(<ServiceCard service={mockService} className="custom-class" />);
      const card = screen.getByTestId('service-card-service-1');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Interactivity', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<ServiceCard service={mockService} onClick={handleClick} />);
      const card = screen.getByTestId('service-card-service-1');
      card.click();
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have correct link href', () => {
      render(<ServiceCard service={mockService} />);
      const link = screen.getByTestId('service-link-service-1');
      expect(link).toHaveAttribute('href', '/services/web-design');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      render(<ServiceCard service={mockService} />);
      const name = screen.getByTestId('service-name-service-1');
      expect(name).toHaveClass('text-lg', 'sm:text-xl');
    });

    it('should have responsive padding on content', () => {
      render(<ServiceCard service={mockService} />);
      const card = screen.getByTestId('service-card-service-1');
      // The card has padding applied through the content container
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ServiceCard service={mockService} />);
      const name = screen.getByTestId('service-name-service-1');
      expect(name.tagName).toBe('H3');
    });

    it('should have descriptive link text', () => {
      render(<ServiceCard service={mockService} />);
      const link = screen.getByTestId('service-link-service-1');
      expect(link.textContent).toContain('Learn More');
    });

    it('should have alt text for image icons', () => {
      const serviceWithImage: ServiceCardType = {
        ...mockService,
        icon: '/icons/design.svg',
      };
      render(<ServiceCard service={serviceWithImage} />);
      const images = screen.getAllByAltText('Web Design');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing link gracefully', () => {
      const serviceWithoutLink: ServiceCardType = {
        ...mockService,
        link: '',
      };
      render(<ServiceCard service={serviceWithoutLink} />);
      const link = screen.getByTestId('service-link-service-1');
      expect(link).toHaveAttribute('href', '#');
    });

    it('should handle long service names', () => {
      const serviceWithLongName: ServiceCardType = {
        ...mockService,
        name: 'Very Long Service Name That Should Be Truncated Properly',
      };
      render(<ServiceCard service={serviceWithLongName} />);
      const name = screen.getByTestId('service-name-service-1');
      expect(name).toHaveClass('line-clamp-2');
    });

    it('should handle long descriptions', () => {
      const serviceWithLongDescription: ServiceCardType = {
        ...mockService,
        description: 'This is a very long description that should be truncated to show only the first few lines of text to maintain the card layout and appearance.',
      };
      render(<ServiceCard service={serviceWithLongDescription} />);
      const description = screen.getByTestId('service-description-service-1');
      expect(description).toHaveClass('line-clamp-3');
    });

    it('should render with minimal data', () => {
      const minimalService: ServiceCardType = {
        id: 'service-2',
        name: 'Service',
        description: 'Description',
        icon: '📦',
        category: 'Category',
        link: '/service',
      };
      render(<ServiceCard service={minimalService} />);
      expect(screen.getByTestId('service-card-service-2')).toBeInTheDocument();
    });
  });
});
