import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ServiceDetail } from './ServiceDetail';
import type { ServiceDetail as ServiceDetailType, Case, Testimonial } from '@/types/website';

describe('ServiceDetail Component', () => {
  const mockService: ServiceDetailType = {
    id: 'service-1',
    name: 'Web Design Service',
    description: 'Professional web design',
    shortDescription: 'Create stunning websites',
    icon: '🎨',
    category: 'Design',
    link: '/services/web-design',
    price: 5000,
    rating: 4.8,
    reviewCount: 25,
    fullDescription: 'Our web design service provides comprehensive solutions for creating beautiful and functional websites that engage your audience and drive conversions.',
    process: [
      {
        order: 1,
        title: 'Discovery',
        description: 'Understand your business goals and requirements',
        duration: '1 week',
      },
      {
        order: 2,
        title: 'Design',
        description: 'Create wireframes and visual designs',
        duration: '2 weeks',
      },
      {
        order: 3,
        title: 'Development',
        description: 'Build the website with clean code',
        duration: '3 weeks',
      },
      {
        order: 4,
        title: 'Launch',
        description: 'Deploy and optimize for production',
        duration: '1 week',
      },
    ],
    deliverables: [
      'Responsive website design',
      'Mobile-optimized version',
      'SEO optimization',
      'Performance optimization',
      'Documentation',
    ],
    timeline: '6-8 weeks',
    includes: [
      'Unlimited revisions',
      'Mobile responsive design',
      'SEO optimization',
      '3 months free support',
      'Analytics setup',
    ],
    excludes: [
      'Content writing',
      'Photography',
      'Video production',
      'Hosting fees',
    ],
    faqs: [
      {
        id: 'faq-1',
        question: 'How long does the design process take?',
        answer: 'The typical design process takes 6-8 weeks depending on project complexity and scope.',
      },
      {
        id: 'faq-2',
        question: 'Do you provide ongoing support?',
        answer: 'Yes, we provide 3 months of free support after launch, and ongoing support packages are available.',
      },
      {
        id: 'faq-3',
        question: 'Is the website mobile-friendly?',
        answer: 'Absolutely! All our websites are fully responsive and optimized for mobile devices.',
      },
    ],
  };

  const mockCases: Case[] = [
    {
      id: 'case-1',
      title: 'E-commerce Platform',
      description: 'Built a modern e-commerce platform',
      thumbnail: 'https://via.placeholder.com/300x200',
      industry: 'Retail',
      results: ['50% increase in sales', '30% improvement in UX'],
      link: '/cases/case-1',
    },
    {
      id: 'case-2',
      title: 'SaaS Dashboard',
      description: 'Designed a comprehensive SaaS dashboard',
      thumbnail: 'https://via.placeholder.com/300x200',
      industry: 'Technology',
      results: ['Improved user engagement', 'Reduced bounce rate'],
      link: '/cases/case-2',
    },
  ];

  const mockTestimonials: Testimonial[] = [
    {
      id: 'testimonial-1',
      content: 'Excellent service and professional team!',
      author: 'John Doe',
      company: 'Tech Corp',
      rating: 5,
      avatar: 'https://via.placeholder.com/50x50',
    },
    {
      id: 'testimonial-2',
      content: 'Great results and timely delivery.',
      author: 'Jane Smith',
      company: 'Design Studio',
      rating: 4,
      avatar: 'https://via.placeholder.com/50x50',
    },
  ];

  describe('Rendering', () => {
    it('should render the service detail section', () => {
      render(<ServiceDetail service={mockService} />);
      const section = screen.getByTestId('service-detail');
      expect(section).toBeInTheDocument();
    });

    it('should display service name', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Web Design Service')).toBeInTheDocument();
    });

    it('should display service category', () => {
      render(<ServiceDetail service={mockService} />);
      const categories = screen.getAllByText('Design');
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should display service short description', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Create stunning websites')).toBeInTheDocument();
    });

    it('should display service price', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText(/¥5,000/)).toBeInTheDocument();
    });

    it('should display service rating', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });

    it('should display review count', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('(25 reviews)')).toBeInTheDocument();
    });

    it('should display full description', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-description')).toBeInTheDocument();
      expect(screen.getByText(/Our web design service provides/)).toBeInTheDocument();
    });
  });

  describe('Process Steps', () => {
    it('should render process section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-process')).toBeInTheDocument();
    });

    it('should display all process steps', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Discovery')).toBeInTheDocument();
      const designSteps = screen.getAllByText('Design');
      expect(designSteps.length).toBeGreaterThan(0);
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Launch')).toBeInTheDocument();
    });

    it('should display step descriptions', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Understand your business goals and requirements')).toBeInTheDocument();
    });

    it('should display step durations', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getAllByText(/week/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/weeks/)[0]).toBeInTheDocument();
    });
  });

  describe('Includes and Excludes', () => {
    it('should render includes and excludes section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-includes-excludes')).toBeInTheDocument();
    });

    it('should display all included items', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Unlimited revisions')).toBeInTheDocument();
      expect(screen.getByText('Mobile responsive design')).toBeInTheDocument();
      const seoItems = screen.getAllByText('SEO optimization');
      expect(seoItems.length).toBeGreaterThan(0);
    });

    it('should display all excluded items', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Content writing')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
      expect(screen.getByText('Video production')).toBeInTheDocument();
    });
  });

  describe('Deliverables', () => {
    it('should render deliverables section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-deliverables')).toBeInTheDocument();
    });

    it('should display all deliverables', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('Responsive website design')).toBeInTheDocument();
      expect(screen.getByText('Mobile-optimized version')).toBeInTheDocument();
      expect(screen.getByText('Performance optimization')).toBeInTheDocument();
    });
  });

  describe('Timeline', () => {
    it('should render timeline section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-timeline')).toBeInTheDocument();
    });

    it('should display project timeline', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('6-8 weeks')).toBeInTheDocument();
    });
  });

  describe('FAQs', () => {
    it('should render FAQs section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-faqs')).toBeInTheDocument();
    });

    it('should display all FAQ questions', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('How long does the design process take?')).toBeInTheDocument();
      expect(screen.getByText('Do you provide ongoing support?')).toBeInTheDocument();
      expect(screen.getByText('Is the website mobile-friendly?')).toBeInTheDocument();
    });

    it('should expand FAQ when clicked', async () => {
      render(<ServiceDetail service={mockService} />);
      const faqButton = screen.getByTestId('faq-button-faq-1');
      
      fireEvent.click(faqButton);
      
      await waitFor(() => {
        const answer = screen.getByTestId('faq-answer-faq-1');
        expect(answer).toBeInTheDocument();
        expect(screen.getByText(/6-8 weeks depending on project complexity/)).toBeInTheDocument();
      });
    });

    it('should collapse FAQ when clicked again', async () => {
      render(<ServiceDetail service={mockService} />);
      const faqButton = screen.getByTestId('faq-button-faq-1');
      
      fireEvent.click(faqButton);
      await waitFor(() => {
        expect(screen.getByTestId('faq-answer-faq-1')).toBeInTheDocument();
      });
      
      fireEvent.click(faqButton);
      await waitFor(() => {
        expect(screen.queryByTestId('faq-answer-faq-1')).not.toBeInTheDocument();
      });
    });

    it('should only expand one FAQ at a time', async () => {
      render(<ServiceDetail service={mockService} />);
      const faqButton1 = screen.getByTestId('faq-button-faq-1');
      const faqButton2 = screen.getByTestId('faq-button-faq-2');
      
      fireEvent.click(faqButton1);
      await waitFor(() => {
        expect(screen.getByTestId('faq-answer-faq-1')).toBeInTheDocument();
      });
      
      fireEvent.click(faqButton2);
      await waitFor(() => {
        expect(screen.queryByTestId('faq-answer-faq-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('faq-answer-faq-2')).toBeInTheDocument();
      });
    });
  });

  describe('Related Cases', () => {
    it('should render related cases section when provided', () => {
      render(<ServiceDetail service={mockService} relatedCases={mockCases} />);
      expect(screen.getByTestId('related-cases')).toBeInTheDocument();
    });

    it('should display all related cases', () => {
      render(<ServiceDetail service={mockService} relatedCases={mockCases} />);
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(screen.getByText('SaaS Dashboard')).toBeInTheDocument();
    });

    it('should display case industry tags', () => {
      render(<ServiceDetail service={mockService} relatedCases={mockCases} />);
      expect(screen.getByText('Retail')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should not render related cases section when empty', () => {
      render(<ServiceDetail service={mockService} relatedCases={[]} />);
      expect(screen.queryByTestId('related-cases')).not.toBeInTheDocument();
    });
  });

  describe('Related Testimonials', () => {
    it('should render related testimonials section when provided', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={mockTestimonials} />);
      expect(screen.getByTestId('related-testimonials')).toBeInTheDocument();
    });

    it('should display all testimonials', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={mockTestimonials} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display testimonial companies', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={mockTestimonials} />);
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Design Studio')).toBeInTheDocument();
    });

    it('should display testimonial content', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={mockTestimonials} />);
      expect(screen.getByText(/Excellent service and professional team/)).toBeInTheDocument();
      expect(screen.getByText(/Great results and timely delivery/)).toBeInTheDocument();
    });

    it('should not render testimonials section when empty', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={[]} />);
      expect(screen.queryByTestId('related-testimonials')).not.toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('should render CTA section', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByTestId('service-cta')).toBeInTheDocument();
    });

    it('should display CTA heading', () => {
      render(<ServiceDetail service={mockService} />);
      expect(screen.getByText('准备好开始了吗?')).toBeInTheDocument();
    });

    it('should have consultation buttons', () => {
      render(<ServiceDetail service={mockService} />);
      const buttons = screen.getAllByText('立即咨询');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Buttons', () => {
    it('should render consultation button', () => {
      render(<ServiceDetail service={mockService} />);
      const consultationButton = screen.getByTestId('consultation-button');
      expect(consultationButton).toBeInTheDocument();
    });

    it('should render learn more button', () => {
      render(<ServiceDetail service={mockService} />);
      const learnMoreButton = screen.getByTestId('learn-more-button');
      expect(learnMoreButton).toBeInTheDocument();
    });

    it('should call onConsultationClick when consultation button is clicked', () => {
      const handleConsultationClick = jest.fn();
      render(
        <ServiceDetail
          service={mockService}
          onConsultationClick={handleConsultationClick}
        />
      );
      
      const consultationButton = screen.getByTestId('consultation-button');
      fireEvent.click(consultationButton);
      
      expect(handleConsultationClick).toHaveBeenCalled();
    });

    it('should call onConsultationClick when CTA button is clicked', () => {
      const handleConsultationClick = jest.fn();
      render(
        <ServiceDetail
          service={mockService}
          onConsultationClick={handleConsultationClick}
        />
      );
      
      const ctaButton = screen.getByTestId('cta-consultation-button');
      fireEvent.click(ctaButton);
      
      expect(handleConsultationClick).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should have brand color styling', () => {
      render(<ServiceDetail service={mockService} />);
      const heading = screen.getByText('Web Design Service');
      expect(heading).toHaveClass('font-bold');
    });

    it('should apply custom className', () => {
      render(<ServiceDetail service={mockService} className="custom-class" />);
      const section = screen.getByTestId('service-detail');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ServiceDetail service={mockService} />);
      const mainHeading = screen.getByText('Web Design Service');
      expect(mainHeading.tagName).toBe('H1');
    });

    it('should have descriptive button text', () => {
      render(<ServiceDetail service={mockService} />);
      const buttons = screen.getAllByText('立即咨询');
      expect(buttons.length).toBeGreaterThan(0);
      expect(screen.getByText('了解更多')).toBeInTheDocument();
    });

    it('should have alt text for images', () => {
      render(<ServiceDetail service={mockService} relatedCases={mockCases} />);
      const images = screen.getAllByAltText(/E-commerce Platform|SaaS Dashboard/);
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty process steps', () => {
      const serviceWithoutProcess = { ...mockService, process: [] };
      render(<ServiceDetail service={serviceWithoutProcess} />);
      expect(screen.queryByTestId('service-process')).not.toBeInTheDocument();
    });

    it('should handle empty deliverables', () => {
      const serviceWithoutDeliverables = { ...mockService, deliverables: [] };
      render(<ServiceDetail service={serviceWithoutDeliverables} />);
      expect(screen.queryByTestId('service-deliverables')).not.toBeInTheDocument();
    });

    it('should handle empty FAQs', () => {
      const serviceWithoutFAQs = { ...mockService, faqs: [] };
      render(<ServiceDetail service={serviceWithoutFAQs} />);
      expect(screen.queryByTestId('service-faqs')).not.toBeInTheDocument();
    });

    it('should handle very long service names', () => {
      const serviceWithLongName = {
        ...mockService,
        name: 'Very Long Service Name That Should Be Handled Properly Without Breaking Layout',
      };
      render(<ServiceDetail service={serviceWithLongName} />);
      expect(screen.getByText(/Very Long Service Name/)).toBeInTheDocument();
    });

    it('should handle high ratings', () => {
      const serviceWithHighRating = { ...mockService, rating: 5 };
      render(<ServiceDetail service={serviceWithHighRating} />);
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    it('should handle low ratings', () => {
      const serviceWithLowRating = { ...mockService, rating: 2.5 };
      render(<ServiceDetail service={serviceWithLowRating} />);
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout for cases', () => {
      render(<ServiceDetail service={mockService} relatedCases={mockCases} />);
      const grid = screen.getByTestId('related-cases').querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive grid layout for testimonials', () => {
      render(<ServiceDetail service={mockService} relatedTestimonials={mockTestimonials} />);
      const grid = screen.getByTestId('related-testimonials').querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });
  });
});
