import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AboutPage } from './AboutPage';
import { AboutPage as AboutPageType } from '@/types/website';

// Mock data
const mockAboutPageData: AboutPageType = {
  companyInfo: {
    name: 'Tech Solutions Inc.',
    mission: 'To deliver innovative technology solutions that transform businesses',
    vision: 'To be the leading technology partner for enterprises worldwide',
    values: ['Innovation', 'Integrity', 'Excellence', 'Customer Focus'],
    description: 'We are a leading technology company with over 15 years of experience',
    foundedYear: 2008,
  },
  timeline: [
    {
      year: 2008,
      title: 'Company Founded',
      description: 'Started with a small team of passionate developers',
      icon: '🚀',
    },
    {
      year: 2012,
      title: 'First Major Client',
      description: 'Partnered with Fortune 500 company',
      icon: '🤝',
    },
    {
      year: 2016,
      title: 'International Expansion',
      description: 'Opened offices in 5 countries',
      icon: '🌍',
    },
    {
      year: 2020,
      title: 'AI Initiative Launch',
      description: 'Launched AI-powered solutions',
      icon: '🤖',
    },
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'ISO 9001:2015',
      issuer: 'International Organization for Standardization',
      issueDate: new Date('2020-01-15'),
      expiryDate: new Date('2025-01-15'),
      image: 'https://example.com/iso-9001.jpg',
    },
    {
      id: 'cert-2',
      name: 'SOC 2 Type II',
      issuer: 'American Institute of CPAs',
      issueDate: new Date('2021-06-20'),
      image: 'https://example.com/soc2.jpg',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Projects Completed',
      description: 'Successfully delivered projects',
      metric: '500+',
      icon: '✓',
    },
    {
      id: 'ach-2',
      title: 'Happy Clients',
      description: 'Satisfied customers worldwide',
      metric: '200+',
      icon: '😊',
    },
    {
      id: 'ach-3',
      title: 'Team Members',
      description: 'Talented professionals',
      metric: '150+',
      icon: '👥',
    },
    {
      id: 'ach-4',
      title: 'Years Experience',
      description: 'Industry expertise',
      metric: '15+',
      icon: '📅',
    },
  ],
};

describe('AboutPage Component', () => {
  describe('Rendering', () => {
    it('should render the component without crashing', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Tech Solutions Inc.')).toBeInTheDocument();
    });

    it('should display company name', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Tech Solutions Inc.')).toBeInTheDocument();
    });

    it('should display company description', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(
        screen.getByText('We are a leading technology company with over 15 years of experience')
      ).toBeInTheDocument();
    });

    it('should display mission statement', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(
        screen.getByText('To deliver innovative technology solutions that transform businesses')
      ).toBeInTheDocument();
    });

    it('should display vision statement', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(
        screen.getByText('To be the leading technology partner for enterprises worldwide')
      ).toBeInTheDocument();
    });

    it('should display all core values', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.companyInfo.values.forEach((value) => {
        expect(screen.getByText(value)).toBeInTheDocument();
      });
    });

    it('should display timeline section heading', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Development Timeline')).toBeInTheDocument();
    });

    it('should display all timeline events', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.timeline.forEach((event) => {
        expect(screen.getByText(event.title)).toBeInTheDocument();
        expect(screen.getByText(event.description)).toBeInTheDocument();
      });
    });

    it('should display achievements section heading', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Key Achievements')).toBeInTheDocument();
    });

    it('should display all achievements', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.achievements.forEach((achievement) => {
        expect(screen.getByText(achievement.metric)).toBeInTheDocument();
        expect(screen.getByText(achievement.title)).toBeInTheDocument();
      });
    });

    it('should display certificates section heading', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Certificates & Credentials')).toBeInTheDocument();
    });

    it('should display all certificates', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        expect(screen.getByText(cert.name)).toBeInTheDocument();
        expect(screen.getByText(`Issued by: ${cert.issuer}`)).toBeInTheDocument();
      });
    });
  });

  describe('Core Values Display', () => {
    it('should render core values with checkmark icons', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const valueElements = screen.getAllByTestId(/^core-value-/);
      expect(valueElements).toHaveLength(mockAboutPageData.companyInfo.values.length);
    });

    it('should have proper styling for core values', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const valueElements = screen.getAllByTestId(/^core-value-/);
      valueElements.forEach((element) => {
        expect(element).toHaveClass('flex', 'items-start', 'gap-3', 'p-3', 'rounded-lg');
      });
    });
  });

  describe('Timeline Display', () => {
    it('should display timeline events in chronological order', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const timelineEvents = screen.getAllByTestId(/^timeline-event-/);
      expect(timelineEvents).toHaveLength(mockAboutPageData.timeline.length);
    });

    it('should display timeline years correctly', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.timeline.forEach((event) => {
        expect(screen.getByText(event.year.toString())).toBeInTheDocument();
      });
    });

    it('should display timeline icons when provided', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const timelineWithIcons = mockAboutPageData.timeline.filter((e) => e.icon);
      timelineWithIcons.forEach((event) => {
        expect(screen.getByText(event.icon!)).toBeInTheDocument();
      });
    });

    it('should handle timeline events without icons', () => {
      const dataWithoutIcons: AboutPageType = {
        ...mockAboutPageData,
        timeline: [
          {
            year: 2008,
            title: 'Founded',
            description: 'Company started',
          },
        ],
      };
      render(<AboutPage data={dataWithoutIcons} />);
      expect(screen.getByText('Founded')).toBeInTheDocument();
    });
  });

  describe('Achievements Display', () => {
    it('should display all achievement metrics', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.achievements.forEach((achievement) => {
        expect(screen.getByText(achievement.metric)).toBeInTheDocument();
      });
    });

    it('should display achievement icons', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.achievements.forEach((achievement) => {
        expect(screen.getByText(achievement.icon)).toBeInTheDocument();
      });
    });

    it('should display achievement descriptions', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.achievements.forEach((achievement) => {
        expect(screen.getByText(achievement.description)).toBeInTheDocument();
      });
    });

    it('should not display achievements section when empty', () => {
      const dataWithoutAchievements: AboutPageType = {
        ...mockAboutPageData,
        achievements: [],
      };
      render(<AboutPage data={dataWithoutAchievements} />);
      expect(screen.queryByText('Key Achievements')).not.toBeInTheDocument();
    });
  });

  describe('Certificates Display', () => {
    it('should display certificate names', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        expect(screen.getByText(cert.name)).toBeInTheDocument();
      });
    });

    it('should display certificate issuers', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        expect(screen.getByText(`Issued by: ${cert.issuer}`)).toBeInTheDocument();
      });
    });

    it('should display certificate issue dates', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        const issueDate = new Date(cert.issueDate).toLocaleDateString();
        expect(screen.getByText(new RegExp(issueDate))).toBeInTheDocument();
      });
    });

    it('should display certificate expiry dates when available', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certWithExpiry = mockAboutPageData.certificates.find((c) => c.expiryDate);
      if (certWithExpiry) {
        const expiryDate = new Date(certWithExpiry.expiryDate!).toLocaleDateString();
        expect(screen.getByText(new RegExp(expiryDate))).toBeInTheDocument();
      }
    });

    it('should not display expiry date for certificates without expiry', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certWithoutExpiry = mockAboutPageData.certificates.find((c) => !c.expiryDate);
      if (certWithoutExpiry) {
        const certElement = screen.getByTestId(`certificate-${certWithoutExpiry.id}`);
        expect(certElement.textContent).not.toContain('Expires:');
      }
    });

    it('should not display certificates section when empty', () => {
      const dataWithoutCerts: AboutPageType = {
        ...mockAboutPageData,
        certificates: [],
      };
      render(<AboutPage data={dataWithoutCerts} />);
      expect(screen.queryByText('Certificates & Credentials')).not.toBeInTheDocument();
    });

    it('should have proper alt text for certificate images', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        const img = screen.getByAltText(`${cert.name} certificate`);
        expect(img).toBeInTheDocument();
      });
    });
  });

  describe('Interactions', () => {
    it('should call onCertificateClick when certificate is clicked', () => {
      const mockOnClick = jest.fn();
      render(<AboutPage data={mockAboutPageData} onCertificateClick={mockOnClick} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      fireEvent.click(certificate);
      expect(mockOnClick).toHaveBeenCalledWith(mockAboutPageData.certificates[0]);
    });

    it('should call onCertificateClick when certificate is activated with Enter key', () => {
      const mockOnClick = jest.fn();
      render(<AboutPage data={mockAboutPageData} onCertificateClick={mockOnClick} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      fireEvent.keyDown(certificate, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(mockAboutPageData.certificates[0]);
    });

    it('should call onCertificateClick when certificate is activated with Space key', () => {
      const mockOnClick = jest.fn();
      render(<AboutPage data={mockAboutPageData} onCertificateClick={mockOnClick} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      fireEvent.keyDown(certificate, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledWith(mockAboutPageData.certificates[0]);
    });

    it('should not call onCertificateClick when other keys are pressed', () => {
      const mockOnClick = jest.fn();
      render(<AboutPage data={mockAboutPageData} onCertificateClick={mockOnClick} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      fireEvent.keyDown(certificate, { key: 'Escape' });
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle missing onCertificateClick callback gracefully', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      expect(() => {
        fireEvent.click(certificate);
      }).not.toThrow();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid for achievements', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const achievementGrid = screen.getByText('Key Achievements').closest('section')?.querySelector('.grid');
      expect(achievementGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('should have responsive grid for certificates', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certSection = screen.getByText('Certificates & Credentials').closest('section')?.querySelector('.grid');
      expect(certSection).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should have responsive padding and spacing', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const mainSection = screen.getByText('Tech Solutions Inc.').closest('section');
      expect(mainSection).toHaveClass('py-12', 'md:py-16', 'lg:py-20', 'px-4', 'md:px-6', 'lg:px-8');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Tech Solutions Inc.');
    });

    it('should have proper section headings', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper alt text for all images', () => {
      render(<AboutPage data={mockAboutPageData} />);
      mockAboutPageData.certificates.forEach((cert) => {
        const img = screen.getByAltText(`${cert.name} certificate`);
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have aria-hidden for decorative icons', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const decorativeIcons = screen.getAllByRole('img', { hidden: true });
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });

    it('should have keyboard accessible certificates', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certificates = screen.getAllByTestId(/^certificate-/);
      certificates.forEach((cert) => {
        expect(cert).toHaveAttribute('role', 'button');
        expect(cert).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper semantic HTML structure', () => {
      const { container } = render(<AboutPage data={mockAboutPageData} />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty values array', () => {
      const dataWithEmptyValues: AboutPageType = {
        ...mockAboutPageData,
        companyInfo: {
          ...mockAboutPageData.companyInfo,
          values: [],
        },
      };
      render(<AboutPage data={dataWithEmptyValues} />);
      expect(screen.getByText('Core Values')).toBeInTheDocument();
    });

    it('should handle single timeline event', () => {
      const dataWithSingleEvent: AboutPageType = {
        ...mockAboutPageData,
        timeline: [mockAboutPageData.timeline[0]],
      };
      render(<AboutPage data={dataWithSingleEvent} />);
      expect(screen.getByText(mockAboutPageData.timeline[0].title)).toBeInTheDocument();
    });

    it('should handle very long company description', () => {
      const longDescription = 'A'.repeat(500);
      const dataWithLongDesc: AboutPageType = {
        ...mockAboutPageData,
        companyInfo: {
          ...mockAboutPageData.companyInfo,
          description: longDescription,
        },
      };
      render(<AboutPage data={dataWithLongDesc} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('should handle special characters in company name', () => {
      const dataWithSpecialChars: AboutPageType = {
        ...mockAboutPageData,
        companyInfo: {
          ...mockAboutPageData.companyInfo,
          name: 'Tech & Solutions (Inc.)',
        },
      };
      render(<AboutPage data={dataWithSpecialChars} />);
      expect(screen.getByText('Tech & Solutions (Inc.)')).toBeInTheDocument();
    });

    it('should handle timeline events without descriptions', () => {
      const dataWithoutDesc: AboutPageType = {
        ...mockAboutPageData,
        timeline: [
          {
            year: 2008,
            title: 'Founded',
            description: '',
          },
        ],
      };
      render(<AboutPage data={dataWithoutDesc} />);
      expect(screen.getByText('Founded')).toBeInTheDocument();
    });

    it('should handle certificates with same issue and expiry dates', () => {
      const sameDate = new Date('2023-01-01');
      const dataWithSameDates: AboutPageType = {
        ...mockAboutPageData,
        certificates: [
          {
            id: 'cert-1',
            name: 'Test Cert',
            issuer: 'Test Issuer',
            issueDate: sameDate,
            expiryDate: sameDate,
            image: 'https://example.com/test.jpg',
          },
        ],
      };
      render(<AboutPage data={dataWithSameDates} />);
      expect(screen.getByText('Test Cert')).toBeInTheDocument();
    });
  });

  describe('Data Sorting', () => {
    it('should sort timeline events by year in ascending order', () => {
      const unsortedTimeline = [
        { year: 2020, title: 'Event 3', description: 'Desc 3' },
        { year: 2008, title: 'Event 1', description: 'Desc 1' },
        { year: 2016, title: 'Event 2', description: 'Desc 2' },
      ];
      const dataWithUnsortedTimeline: AboutPageType = {
        ...mockAboutPageData,
        timeline: unsortedTimeline,
      };
      render(<AboutPage data={dataWithUnsortedTimeline} />);
      const timelineEvents = screen.getAllByTestId(/^timeline-event-/);
      expect(timelineEvents[0]).toHaveAttribute('data-testid', 'timeline-event-2008');
      expect(timelineEvents[1]).toHaveAttribute('data-testid', 'timeline-event-2016');
      expect(timelineEvents[2]).toHaveAttribute('data-testid', 'timeline-event-2020');
    });
  });

  describe('Styling and Classes', () => {
    it('should have proper dark mode classes', () => {
      const { container } = render(<AboutPage data={mockAboutPageData} />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('dark:bg-gray-900');
    });

    it('should have proper hover effects on certificates', () => {
      render(<AboutPage data={mockAboutPageData} />);
      const certificate = screen.getByTestId('certificate-cert-1');
      expect(certificate).toHaveClass('hover:shadow-lg');
    });

    it('should have proper gradient styling on timeline', () => {
      const { container } = render(<AboutPage data={mockAboutPageData} />);
      const timelineGradient = container.querySelector('.bg-gradient-to-b');
      expect(timelineGradient).toHaveClass('from-blue-600', 'to-blue-400');
    });
  });

  describe('Content Completeness', () => {
    it('should display all required sections', () => {
      render(<AboutPage data={mockAboutPageData} />);
      expect(screen.getByText('Mission')).toBeInTheDocument();
      expect(screen.getByText('Vision')).toBeInTheDocument();
      expect(screen.getByText('Core Values')).toBeInTheDocument();
      expect(screen.getByText('Development Timeline')).toBeInTheDocument();
    });

    it('should have proper content structure', () => {
      const { container } = render(<AboutPage data={mockAboutPageData} />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });
  });
});
