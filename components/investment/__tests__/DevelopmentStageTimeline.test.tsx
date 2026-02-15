import { render, screen } from '@testing-library/react';
import { DevelopmentStageTimeline, DevelopmentStage } from '../DevelopmentStageTimeline';

/**
 * Unit tests for DevelopmentStageTimeline component
 * Tests requirements 7.1, 7.3, 7.4 from the design specification
 */
describe('DevelopmentStageTimeline', () => {
  // Helper function to create mock stages
  const createMockStage = (
    overrides: Partial<DevelopmentStage> = {}
  ): DevelopmentStage => ({
    id: 'stage-1',
    projectId: 'project-1',
    stageName: 'Planning',
    startDate: new Date('2024-01-01'),
    expectedEndDate: new Date('2024-02-01'),
    actualEndDate: null,
    status: 'in_progress',
    ...overrides,
  });

  describe('Requirement 7.1: Display current development stage', () => {
    it('should display the current stage name in the header', () => {
      const currentStage = createMockStage({
        stageName: 'Development',
        status: 'in_progress',
      });

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Current Stage:/)).toBeInTheDocument();
      // Check that Development appears in the header section
      expect(container.textContent).toContain('Current Stage: Development');
    });

    it('should highlight the current stage with a "Current" badge', () => {
      const currentStage = createMockStage({
        stageName: 'Testing',
        status: 'in_progress',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('should display current stage status', () => {
      const currentStage = createMockStage({
        status: 'in_progress',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should handle null current stage', () => {
      render(
        <DevelopmentStageTimeline
          currentStage={null}
          stageHistory={[]}
        />
      );

      expect(screen.queryByText(/Current Stage:/)).not.toBeInTheDocument();
    });
  });

  describe('Requirement 7.3: Show stage name, start date, and expected completion date', () => {
    it('should display stage name', () => {
      const stage = createMockStage({
        stageName: 'Design Phase',
      });

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      // Check that the stage name appears in the document
      expect(container.textContent).toContain('Design Phase');
    });

    it('should display start date', () => {
      const stage = createMockStage({
        startDate: new Date('2024-03-15'),
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Started:/)).toBeInTheDocument();
      expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument();
    });

    it('should display expected completion date for in-progress stages', () => {
      const stage = createMockStage({
        expectedEndDate: new Date('2024-04-30'),
        actualEndDate: null,
        status: 'in_progress',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Expected:/)).toBeInTheDocument();
      expect(screen.getByText(/Apr 30, 2024/)).toBeInTheDocument();
    });

    it('should display actual completion date for completed stages', () => {
      const stage = createMockStage({
        actualEndDate: new Date('2024-04-25'),
        status: 'completed',
      });

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      // Check for "Completed:" label in the stage details (not in summary)
      const stageDetails = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
      expect(stageDetails?.textContent).toContain('Completed:');
      expect(container.textContent).toContain('Apr 25, 2024');
    });
  });

  describe('Requirement 7.4: Show stage history with durations', () => {
    it('should display all previous stages', () => {
      const currentStage = createMockStage({
        id: 'stage-3',
        stageName: 'Testing',
        startDate: new Date('2024-03-01'),
      });

      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          stageName: 'Planning',
          startDate: new Date('2024-01-01'),
          actualEndDate: new Date('2024-01-31'),
          status: 'completed',
        }),
        createMockStage({
          id: 'stage-2',
          stageName: 'Development',
          startDate: new Date('2024-02-01'),
          actualEndDate: new Date('2024-02-28'),
          status: 'completed',
        }),
      ];

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={stageHistory}
        />
      );

      // Check all stage names appear in the document
      expect(container.textContent).toContain('Planning');
      expect(container.textContent).toContain('Development');
      expect(container.textContent).toContain('Testing');
    });

    it('should display duration for each stage', () => {
      const stage = createMockStage({
        startDate: new Date('2024-01-01'),
        actualEndDate: new Date('2024-01-31'),
        status: 'completed',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
      expect(screen.getByText(/30 days/)).toBeInTheDocument();
    });

    it('should calculate duration correctly for single day', () => {
      const stage = createMockStage({
        startDate: new Date('2024-01-01'),
        actualEndDate: new Date('2024-01-01'),
        status: 'completed',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/0 days/)).toBeInTheDocument();
    });

    it('should display summary with stage counts', () => {
      const currentStage = createMockStage({
        id: 'stage-3',
        status: 'in_progress',
      });

      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          status: 'completed',
        }),
        createMockStage({
          id: 'stage-2',
          status: 'completed',
        }),
      ];

      render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={stageHistory}
        />
      );

      expect(screen.getByText(/Total stages:/)).toBeInTheDocument();
      expect(screen.getByText(/Completed:/)).toBeInTheDocument();
      expect(screen.getByText(/In Progress:/)).toBeInTheDocument();
      
      // Check for the specific counts in the summary section
      const summary = screen.getByText(/Total stages:/).closest('p');
      expect(summary?.textContent).toContain('3');
      expect(summary?.textContent).toContain('2');
      expect(summary?.textContent).toContain('1');
    });
  });

  describe('Visual timeline representation', () => {
    it('should display status indicator for completed stages', () => {
      const stage = createMockStage({
        status: 'completed',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display status indicator for in-progress stages', () => {
      const stage = createMockStage({
        status: 'in_progress',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display status indicator for delayed stages', () => {
      const stage = createMockStage({
        status: 'delayed',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('Delayed')).toBeInTheDocument();
      expect(screen.getByText(/behind schedule/)).toBeInTheDocument();
    });

    it('should display delayed count in summary when delayed stages exist', () => {
      const currentStage = createMockStage({
        id: 'stage-2',
        status: 'delayed',
      });

      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          status: 'completed',
        }),
      ];

      render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={stageHistory}
        />
      );

      expect(screen.getByText(/Delayed:/)).toBeInTheDocument();
      
      // Check for the delayed count in the summary section
      const summary = screen.getByText(/Delayed:/).closest('p');
      expect(summary?.textContent).toContain('Delayed:');
      expect(summary?.textContent).toMatch(/Delayed:\s*1/);
    });
  });

  describe('Edge cases', () => {
    it('should display empty state when no stages exist', () => {
      render(
        <DevelopmentStageTimeline
          currentStage={null}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/No development stages available yet/)).toBeInTheDocument();
    });

    it('should handle only history stages without current stage', () => {
      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          stageName: 'Completed Phase',
          status: 'completed',
        }),
      ];

      render(
        <DevelopmentStageTimeline
          currentStage={null}
          stageHistory={stageHistory}
        />
      );

      expect(screen.getByText('Completed Phase')).toBeInTheDocument();
      expect(screen.queryByText('Current')).not.toBeInTheDocument();
    });

    it('should sort stages by start date (newest first)', () => {
      const currentStage = createMockStage({
        id: 'stage-3',
        stageName: 'Latest Stage',
        startDate: new Date('2024-03-01'),
      });

      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          stageName: 'First Stage',
          startDate: new Date('2024-01-01'),
        }),
        createMockStage({
          id: 'stage-2',
          stageName: 'Second Stage',
          startDate: new Date('2024-02-01'),
        }),
      ];

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={currentStage}
          stageHistory={stageHistory}
        />
      );

      const stageNames = Array.from(
        container.querySelectorAll('h3')
      ).map(el => el.textContent);

      expect(stageNames[0]).toBe('Latest Stage');
      expect(stageNames[1]).toBe('Second Stage');
      expect(stageNames[2]).toBe('First Stage');
    });

    it('should handle stages with very long names', () => {
      const stage = createMockStage({
        stageName: 'This is a very long stage name that should be handled properly by the component',
      });

      const { container } = render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      // Check that the long name appears in the document
      expect(container.textContent).toContain('This is a very long stage name');
    });

    it('should handle multiple stages with same status', () => {
      const stageHistory = [
        createMockStage({
          id: 'stage-1',
          stageName: 'Stage 1',
          status: 'completed',
        }),
        createMockStage({
          id: 'stage-2',
          stageName: 'Stage 2',
          status: 'completed',
        }),
        createMockStage({
          id: 'stage-3',
          stageName: 'Stage 3',
          status: 'completed',
        }),
      ];

      render(
        <DevelopmentStageTimeline
          currentStage={null}
          stageHistory={stageHistory}
        />
      );

      const completedBadges = screen.getAllByText('Completed');
      expect(completedBadges).toHaveLength(3);
    });
  });

  describe('Date formatting', () => {
    it('should format dates consistently', () => {
      const stage = createMockStage({
        startDate: new Date('2024-12-25'),
        expectedEndDate: new Date('2024-12-31'),
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Dec 25, 2024/)).toBeInTheDocument();
      expect(screen.getByText(/Dec 31, 2024/)).toBeInTheDocument();
    });

    it('should handle dates from different years', () => {
      const stage = createMockStage({
        startDate: new Date('2023-12-01'),
        expectedEndDate: new Date('2024-01-31'),
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Dec 01, 2023/)).toBeInTheDocument();
      expect(screen.getByText(/Jan 31, 2024/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const stage = createMockStage();

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText('Development Timeline')).toBeInTheDocument();
    });

    it('should provide meaningful text for screen readers', () => {
      const stage = createMockStage({
        stageName: 'Testing Phase',
        status: 'in_progress',
      });

      render(
        <DevelopmentStageTimeline
          currentStage={stage}
          stageHistory={[]}
        />
      );

      expect(screen.getByText(/Current Stage:/)).toBeInTheDocument();
      expect(screen.getByText(/Started:/)).toBeInTheDocument();
      expect(screen.getByText(/Expected:/)).toBeInTheDocument();
      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    });
  });
});
