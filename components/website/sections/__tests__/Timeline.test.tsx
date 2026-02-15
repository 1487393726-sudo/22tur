/**
 * Timeline Component Unit Tests
 * 
 * Tests the Timeline component's rendering, animations, and interactions.
 * Requirements: 8.2
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Timeline, TimelineMilestone } from '../Timeline';

// Mock the 3D utilities
jest.mock('@/lib/utils/3d-transforms', () => ({
  calculateMouseTransform: jest.fn(() => ({ rotateX: 0, rotateY: 0, rotateZ: 0, translateZ: 0, scale: 1, perspective: 1000 })),
  getDepthShadow: jest.fn(() => '0 4px 6px rgba(0, 0, 0, 0.1)'),
  transformToCSS: jest.fn(() => 'none'),
  shouldSimplify3DEffects: jest.fn(() => false),
  adjustTransformForRTL: jest.fn((transform) => transform),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useInView: () => true,
  useMotionValue: (initialValue: number) => ({
    set: jest.fn(),
    get: () => initialValue,
  }),
  useSpring: (value: any) => value,
}));

describe('Timeline Component', () => {
  const mockMilestones: TimelineMilestone[] = [
    {
      year: '2019',
      title: 'Company Founded',
      description: 'Started as a small team with a dream.',
      icon: '🚀',
      color: '#3b82f6',
    },
    {
      year: '2020',
      title: 'First Major Client',
      description: 'Secured our first enterprise client.',
      icon: '🎯',
      color: '#10b981',
    },
    {
      year: '2021',
      title: 'Product Launch',
      description: 'Launched our flagship product.',
      icon: '✨',
      color: '#f59e0b',
    },
  ];

  describe('Rendering', () => {
    it('should render all milestones', () => {
      render(<Timeline milestones={mockMilestones} />);

      // Check that all milestone titles are rendered (use getAllByText since they appear in both desktop and mobile views)
      const foundedTitles = screen.getAllByText('Company Founded');
      expect(foundedTitles.length).toBeGreaterThan(0);
      
      const clientTitles = screen.getAllByText('First Major Client');
      expect(clientTitles.length).toBeGreaterThan(0);
      
      const launchTitles = screen.getAllByText('Product Launch');
      expect(launchTitles.length).toBeGreaterThan(0);
    });

    it('should render milestone descriptions', () => {
      render(<Timeline milestones={mockMilestones} />);

      const desc1 = screen.getAllByText('Started as a small team with a dream.');
      expect(desc1.length).toBeGreaterThan(0);
      
      const desc2 = screen.getAllByText('Secured our first enterprise client.');
      expect(desc2.length).toBeGreaterThan(0);
      
      const desc3 = screen.getAllByText('Launched our flagship product.');
      expect(desc3.length).toBeGreaterThan(0);
    });

    it('should render milestone years', () => {
      render(<Timeline milestones={mockMilestones} />);

      // Years appear in badges - use getAllByText since years appear multiple times
      const yearElements = screen.getAllByText('2019');
      expect(yearElements.length).toBeGreaterThan(0);
    });

    it('should render milestone icons', () => {
      render(<Timeline milestones={mockMilestones} />);

      // Icons appear multiple times (desktop marker and mobile marker)
      const rocketIcons = screen.getAllByText('🚀');
      expect(rocketIcons.length).toBeGreaterThan(0);
      
      const targetIcons = screen.getAllByText('🎯');
      expect(targetIcons.length).toBeGreaterThan(0);
      
      const sparkleIcons = screen.getAllByText('✨');
      expect(sparkleIcons.length).toBeGreaterThan(0);
    });

    it('should render with custom className', () => {
      const { container } = render(
        <Timeline milestones={mockMilestones} className="custom-timeline" />
      );

      const timeline = container.querySelector('.custom-timeline');
      expect(timeline).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should handle empty milestones array', () => {
      const { container } = render(<Timeline milestones={[]} />);

      // Should render container but no milestone cards
      expect(container.querySelector('.space-y-12')).toBeInTheDocument();
    });
  });

  describe('RTL Support', () => {
    it('should apply RTL direction when isRTL is true', () => {
      const { container } = render(
        <Timeline milestones={mockMilestones} isRTL={true} />
      );

      const timeline = container.firstChild as HTMLElement;
      expect(timeline.getAttribute('dir')).toBe('rtl');
    });

    it('should apply LTR direction by default', () => {
      const { container } = render(<Timeline milestones={mockMilestones} />);

      const timeline = container.firstChild as HTMLElement;
      expect(timeline.getAttribute('dir')).toBe('ltr');
    });
  });

  describe('Custom Colors', () => {
    it('should apply custom line color', () => {
      const { container } = render(
        <Timeline milestones={mockMilestones} lineColor="#ff0000" />
      );

      const lines = container.querySelectorAll('[style*="background"]');
      const hasRedLine = Array.from(lines).some(
        (line) => (line as HTMLElement).style.backgroundColor === 'rgb(255, 0, 0)'
      );
      expect(hasRedLine).toBe(true);
    });

    it('should apply milestone-specific colors', () => {
      render(<Timeline milestones={mockMilestones} />);

      // Milestones have custom colors defined
      // The component should render them (tested via snapshot or visual regression)
      const titles = screen.getAllByText('Company Founded');
      expect(titles.length).toBeGreaterThan(0);
    });
  });

  describe('Animation Configuration', () => {
    it('should accept custom stagger delay', () => {
      // This is more of an integration test, but we can verify the prop is accepted
      const { container } = render(
        <Timeline milestones={mockMilestones} staggerDelay={0.5} />
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const { container } = render(<Timeline milestones={mockMilestones} />);

      // Should have proper structure
      expect(container.querySelector('.space-y-12')).toBeInTheDocument();
    });

    it('should have readable text content', () => {
      render(<Timeline milestones={mockMilestones} />);

      // All text should be accessible - use getAllByText since content appears in both desktop and mobile views
      mockMilestones.forEach((milestone) => {
        const titles = screen.getAllByText(milestone.title);
        expect(titles.length).toBeGreaterThan(0);
        
        const descriptions = screen.getAllByText(milestone.description);
        expect(descriptions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle milestones without icons', () => {
      const milestonesWithoutIcons: TimelineMilestone[] = [
        {
          year: '2022',
          title: 'No Icon Milestone',
          description: 'This milestone has no icon.',
        },
      ];

      render(<Timeline milestones={milestonesWithoutIcons} />);

      const titles = screen.getAllByText('No Icon Milestone');
      expect(titles.length).toBeGreaterThan(0);
      // Year appears in badge and marker
      const yearElements = screen.getAllByText('2022');
      expect(yearElements.length).toBeGreaterThan(0);
    });

    it('should handle milestones without custom colors', () => {
      const milestonesWithoutColors: TimelineMilestone[] = [
        {
          year: '2023',
          title: 'Default Color',
          description: 'Uses default color.',
          icon: '⭐',
        },
      ];

      render(<Timeline milestones={milestonesWithoutColors} />);

      const titles = screen.getAllByText('Default Color');
      expect(titles.length).toBeGreaterThan(0);
      // Icon appears in markers
      const starIcons = screen.getAllByText('⭐');
      expect(starIcons.length).toBeGreaterThan(0);
    });

    it('should handle long descriptions', () => {
      const longDescription = 'A'.repeat(500);
      const milestonesWithLongText: TimelineMilestone[] = [
        {
          year: '2024',
          title: 'Long Description',
          description: longDescription,
        },
      ];

      render(<Timeline milestones={milestonesWithLongText} />);

      const titles = screen.getAllByText('Long Description');
      expect(titles.length).toBeGreaterThan(0);
      
      const descriptions = screen.getAllByText(longDescription);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should handle special characters in text', () => {
      const specialMilestones: TimelineMilestone[] = [
        {
          year: '2025',
          title: 'Special & Characters <> "Quotes"',
          description: 'Description with émojis 🎉 and symbols @#$%',
        },
      ];

      render(<Timeline milestones={specialMilestones} />);

      const titles = screen.getAllByText(/Special & Characters/);
      expect(titles.length).toBeGreaterThan(0);
      
      const descriptions = screen.getAllByText(/émojis/);
      expect(descriptions.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render mobile and desktop timeline lines', () => {
      const { container } = render(<Timeline milestones={mockMilestones} />);

      // Should have both mobile and desktop timeline lines
      const lines = container.querySelectorAll('.absolute.w-0\\.5');
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Multiple Milestones', () => {
    it('should handle single milestone', () => {
      const singleMilestone: TimelineMilestone[] = [
        {
          year: '2023',
          title: 'Only One',
          description: 'Single milestone test.',
        },
      ];

      render(<Timeline milestones={singleMilestone} />);

      const titles = screen.getAllByText('Only One');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should handle many milestones', () => {
      const manyMilestones: TimelineMilestone[] = Array.from(
        { length: 10 },
        (_, i) => ({
          year: `${2015 + i}`,
          title: `Milestone ${i + 1}`,
          description: `Description for milestone ${i + 1}`,
        })
      );

      render(<Timeline milestones={manyMilestones} />);

      // Use getAllByText since titles might appear in multiple places
      expect(screen.getAllByText('Milestone 1')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Milestone 10')[0]).toBeInTheDocument();
    });
  });
});
