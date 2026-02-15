/**
 * Unit tests for CaseDetailModal component
 * 
 * Tests case detail modal rendering, content display, and interactions
 * Validates Requirements: 14.2, 14.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CaseDetailModal, type CaseDetailData } from '../CaseDetailModal';

describe('CaseDetailModal', () => {
  const mockTranslations = {
    timeline: 'Project Timeline',
    duration: 'Duration',
    startDate: 'Start Date',
    endDate: 'End Date',
    keyMetrics: 'Key Metrics',
    results: 'Project Results',
    challenges: 'Challenges',
    solution: 'Solution',
    technologies: 'Technologies Used',
    gallery: 'Project Gallery',
  };

  const mockCaseData: CaseDetailData = {
    title: 'E-commerce Platform Rebuild',
    client: 'Leading Retail Brand',
    category: 'Web Development',
    description: 'Rebuilt e-commerce platform for client',
    results: [
      '45% increase in conversion rate',
      '60% faster page load speed',
      '35% improvement in user satisfaction',
    ],
    tags: ['React', 'Next.js', 'PostgreSQL'],
    timeline: {
      duration: '3 months',
      startDate: 'June 2023',
      endDate: 'September 2023',
    },
    metrics: [
      { label: 'User Growth', value: '+150%' },
      { label: 'Performance Boost', value: '+60%' },
    ],
    challenges: 'The client faced multiple challenges',
    solution: 'We rebuilt the entire platform',
    images: ['1', '2', '3'],
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Modal Display', () => {
    it('should not render when isOpen is false', () => {
      render(
        <CaseDetailModal
          isOpen={false}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockCaseData.title)).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockCaseData.title)).toBeInTheDocument();
    });

    it('should not render when caseData is null', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={null}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Case Information Display', () => {
    beforeEach(() => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );
    });

    it('should display case title', () => {
      expect(screen.getByText(mockCaseData.title)).toBeInTheDocument();
    });

    it('should display client name', () => {
      expect(screen.getByText(mockCaseData.client)).toBeInTheDocument();
    });

    it('should display category badge', () => {
      expect(screen.getByText(mockCaseData.category)).toBeInTheDocument();
    });

    it('should display description', () => {
      expect(screen.getByText(mockCaseData.description)).toBeInTheDocument();
    });

    it('should display all results', () => {
      mockCaseData.results.forEach((result) => {
        expect(screen.getByText(result)).toBeInTheDocument();
      });
    });

    it('should display all tags', () => {
      mockCaseData.tags.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Display (Req 14.5)', () => {
    it('should display project timeline section', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockTranslations.timeline)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.timeline!.duration)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.timeline!.startDate)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.timeline!.endDate)).toBeInTheDocument();
    });

    it('should not display timeline section when timeline is undefined', () => {
      const caseWithoutTimeline = { ...mockCaseData, timeline: undefined };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithoutTimeline}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.timeline)).not.toBeInTheDocument();
    });
  });

  describe('Key Metrics Display (Req 14.5)', () => {
    it('should display key metrics section', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockTranslations.keyMetrics)).toBeInTheDocument();
      
      mockCaseData.metrics!.forEach((metric) => {
        expect(screen.getByText(metric.label)).toBeInTheDocument();
        expect(screen.getByText(metric.value)).toBeInTheDocument();
      });
    });

    it('should not display metrics section when metrics is undefined', () => {
      const caseWithoutMetrics = { ...mockCaseData, metrics: undefined };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithoutMetrics}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.keyMetrics)).not.toBeInTheDocument();
    });

    it('should not display metrics section when metrics array is empty', () => {
      const caseWithEmptyMetrics = { ...mockCaseData, metrics: [] };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithEmptyMetrics}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.keyMetrics)).not.toBeInTheDocument();
    });
  });

  describe('Challenges and Solution Display', () => {
    it('should display challenges section', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockTranslations.challenges)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.challenges!)).toBeInTheDocument();
    });

    it('should display solution section', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockTranslations.solution)).toBeInTheDocument();
      expect(screen.getByText(mockCaseData.solution!)).toBeInTheDocument();
    });

    it('should not display challenges when undefined', () => {
      const caseWithoutChallenges = { ...mockCaseData, challenges: undefined };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithoutChallenges}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.challenges)).not.toBeInTheDocument();
    });
  });

  describe('Image Gallery Display (Req 14.5)', () => {
    it('should display image gallery section', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(mockTranslations.gallery)).toBeInTheDocument();
      
      // Check that gallery items are rendered (using emoji as placeholder)
      const galleryItems = screen.getAllByText('🖼️');
      expect(galleryItems).toHaveLength(mockCaseData.images!.length);
    });

    it('should not display gallery when images is undefined', () => {
      const caseWithoutImages = { ...mockCaseData, images: undefined };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithoutImages}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.gallery)).not.toBeInTheDocument();
    });

    it('should not display gallery when images array is empty', () => {
      const caseWithEmptyImages = { ...mockCaseData, images: [] };
      
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={caseWithEmptyImages}
          translations={mockTranslations}
        />
      );

      expect(screen.queryByText(mockTranslations.gallery)).not.toBeInTheDocument();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      const closeButton = screen.getByLabelText(/close modal/i);
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA label', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute(
        'aria-label',
        `Case study details: ${mockCaseData.title}`
      );
    });
  });

  describe('Glassmorphism Effects (Req 14.2)', () => {
    it('should apply glass effect classes to modal', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      const dialog = screen.getByRole('dialog');
      const modalContent = dialog.querySelector('.glass-heavy');
      
      expect(modalContent).toBeInTheDocument();
    });

    it('should apply glass effect to timeline section', () => {
      const { container } = render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      const glassElements = container.querySelectorAll('.glass-light');
      expect(glassElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case with minimal data', () => {
      const minimalCase: CaseDetailData = {
        title: 'Minimal Case',
        client: 'Test Client',
        category: 'Test',
        description: 'Test description',
        results: ['Result 1'],
        tags: ['Tag1'],
      };

      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={minimalCase}
          translations={mockTranslations}
        />
      );

      expect(screen.getByText(minimalCase.title)).toBeInTheDocument();
      expect(screen.getByText(minimalCase.description)).toBeInTheDocument();
    });

    it('should handle case with all optional fields', () => {
      render(
        <CaseDetailModal
          isOpen={true}
          onClose={mockOnClose}
          caseData={mockCaseData}
          translations={mockTranslations}
        />
      );

      // All sections should be present
      expect(screen.getByText(mockTranslations.timeline)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.keyMetrics)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.challenges)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.solution)).toBeInTheDocument();
      expect(screen.getByText(mockTranslations.gallery)).toBeInTheDocument();
    });
  });
});
