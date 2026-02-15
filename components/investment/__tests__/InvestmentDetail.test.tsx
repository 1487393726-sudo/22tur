/**
 * Unit tests for InvestmentDetail component
 * 
 * Tests the integration of all sub-components and investment summary display.
 * Validates requirements 6.2, 6.3, 7.1, 7.3, 7.4, 8.2, 8.4, 9.1, 9.2, 9.3
 */

import { render, screen, within, fireEvent } from '@testing-library/react';
import { InvestmentDetail, InvestmentRecord, ProjectDetail } from '../InvestmentDetail';
import { DevelopmentStage } from '../DevelopmentStageTimeline';
import { FinancialPerformance } from '../FinancialPerformanceCard';
import { TeamMember } from '../TeamMemberCard';

// Mock the sub-components to test integration
jest.mock('../DevelopmentStageTimeline', () => ({
  DevelopmentStageTimeline: ({ currentStage, stageHistory }: any) => (
    <div data-testid="development-stage-timeline">
      <div data-testid="current-stage">{currentStage?.stageName || 'None'}</div>
      <div data-testid="stage-history-count">{stageHistory.length}</div>
    </div>
  ),
}));

jest.mock('../FinancialPerformanceCard', () => ({
  FinancialPerformanceCard: ({ financialData, investmentAmount }: any) => (
    <div data-testid="financial-performance-card">
      <div data-testid="financial-profit">{financialData.profit}</div>
      <div data-testid="financial-investment-amount">{investmentAmount}</div>
    </div>
  ),
}));

jest.mock('../TeamMemberCard', () => ({
  TeamMemberCard: ({ teamMembers }: any) => (
    <div data-testid="team-member-card">
      <div data-testid="team-member-count">{teamMembers.length}</div>
    </div>
  ),
}));

describe('InvestmentDetail Component', () => {
  // Helper function to create mock investment data
  const createMockInvestment = (overrides?: Partial<InvestmentRecord>): InvestmentRecord => ({
    id: 'inv-123',
    projectId: 'proj-456',
    userId: 'user-789',
    amount: 10000,
    investmentDate: new Date('2024-01-15'),
    currentValue: 12000,
    returnAmount: 2000,
    returnPercentage: 20,
    status: 'active',
    ...overrides,
  });

  // Helper function to create mock project data
  const createMockProject = (overrides?: Partial<ProjectDetail>): ProjectDetail => ({
    id: 'proj-456',
    name: 'Test Project',
    description: 'A test project for investment',
    category: 'Technology',
    currentStage: {
      id: 'stage-1',
      projectId: 'proj-456',
      stageName: 'Development',
      startDate: new Date('2024-01-01'),
      expectedEndDate: new Date('2024-06-01'),
      actualEndDate: null,
      status: 'in_progress',
    },
    stageHistory: [],
    financialPerformance: {
      revenue: 50000,
      expenses: 30000,
      profit: 20000,
      profitMargin: 40,
      revenueBreakdown: [{ source: 'Sales', amount: 50000 }],
      expenseBreakdown: [{ category: 'Operations', amount: 30000 }],
    },
    teamMembers: [],
    ...overrides,
  });

  describe('Investment Summary Display - Requirements 6.2, 6.3', () => {
    it('should display project name and category', () => {
      const investment = createMockInvestment();
      const project = createMockProject({
        name: 'AI Startup',
        category: 'Artificial Intelligence',
      });

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('AI Startup')).toBeInTheDocument();
      expect(screen.getByText('Artificial Intelligence')).toBeInTheDocument();
    });

    it('should display project description', () => {
      const investment = createMockInvestment();
      const project = createMockProject({
        description: 'Revolutionary AI platform for businesses',
      });

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Revolutionary AI platform for businesses')).toBeInTheDocument();
    });

    it('should display investment status badge', () => {
      const investment = createMockInvestment({ status: 'active' });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display completed status badge', () => {
      const investment = createMockInvestment({ status: 'completed' });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should display failed status badge', () => {
      const investment = createMockInvestment({ status: 'failed' });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('should display investment amount - Requirement 6.2', () => {
      const investment = createMockInvestment({ amount: 15000 });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText since amount appears in multiple places
      const amounts = screen.getAllByText('$15,000.00');
      expect(amounts.length).toBeGreaterThan(0);
    });

    it('should display investment date - Requirement 6.2', () => {
      const investment = createMockInvestment({
        investmentDate: new Date('2024-03-20'),
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText since date appears in multiple places
      const dates = screen.getAllByText('Mar 20, 2024');
      expect(dates.length).toBeGreaterThan(0);
    });

    it('should display current value - Requirement 6.3', () => {
      const investment = createMockInvestment({ currentValue: 18000 });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText since value appears in multiple places
      const values = screen.getAllByText('$18,000.00');
      expect(values.length).toBeGreaterThan(0);
    });

    it('should display positive return amount and percentage', () => {
      const investment = createMockInvestment({
        returnAmount: 5000,
        returnPercentage: 25,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
      
      // Use getAllByText since percentage appears in multiple places
      const percentages = screen.getAllByText('+25.00%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should display negative return amount and percentage', () => {
      const investment = createMockInvestment({
        amount: 10000,
        currentValue: 8000,
        returnAmount: -2000,
        returnPercentage: -20,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Negative return amount is displayed with minus sign
      expect(screen.getByText('-$2,000.00')).toBeInTheDocument();
      
      // Use getAllByText since percentage appears in multiple places
      const percentages = screen.getAllByText('-20.00%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should display investment summary text with gain', () => {
      const investment = createMockInvestment({
        amount: 10000,
        investmentDate: new Date('2024-01-15'),
        currentValue: 12000,
        returnPercentage: 20,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText(/You invested/)).toBeInTheDocument();
      expect(screen.getByText(/gain/)).toBeInTheDocument();
    });

    it('should display investment summary text with loss', () => {
      const investment = createMockInvestment({
        amount: 10000,
        currentValue: 8000,
        returnAmount: -2000,
        returnPercentage: -20,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText(/You invested/)).toBeInTheDocument();
      expect(screen.getByText(/loss/)).toBeInTheDocument();
    });
  });

  describe('Sub-component Integration', () => {
    it('should render DevelopmentStageTimeline component - Requirements 7.1, 7.3, 7.4', () => {
      const investment = createMockInvestment();
      const currentStage: DevelopmentStage = {
        id: 'stage-1',
        projectId: 'proj-456',
        stageName: 'Beta Testing',
        startDate: new Date('2024-02-01'),
        expectedEndDate: new Date('2024-04-01'),
        actualEndDate: null,
        status: 'in_progress',
      };
      const stageHistory: DevelopmentStage[] = [
        {
          id: 'stage-0',
          projectId: 'proj-456',
          stageName: 'Planning',
          startDate: new Date('2024-01-01'),
          expectedEndDate: new Date('2024-01-31'),
          actualEndDate: new Date('2024-01-31'),
          status: 'completed',
        },
      ];
      const project = createMockProject({
        currentStage,
        stageHistory,
      });

      render(<InvestmentDetail investment={investment} project={project} />);

      const timeline = screen.getByTestId('development-stage-timeline');
      expect(timeline).toBeInTheDocument();
      expect(within(timeline).getByTestId('current-stage')).toHaveTextContent('Beta Testing');
      expect(within(timeline).getByTestId('stage-history-count')).toHaveTextContent('1');
    });

    it('should render FinancialPerformanceCard component - Requirements 8.2, 8.4', () => {
      const investment = createMockInvestment({ amount: 10000 });
      const financialPerformance: FinancialPerformance = {
        revenue: 100000,
        expenses: 60000,
        profit: 40000,
        profitMargin: 40,
        revenueBreakdown: [
          { source: 'Product Sales', amount: 70000 },
          { source: 'Services', amount: 30000 },
        ],
        expenseBreakdown: [
          { category: 'Operations', amount: 40000 },
          { category: 'Marketing', amount: 20000 },
        ],
      };
      const project = createMockProject({ financialPerformance });

      render(<InvestmentDetail investment={investment} project={project} />);

      const financialCard = screen.getByTestId('financial-performance-card');
      expect(financialCard).toBeInTheDocument();
      expect(within(financialCard).getByTestId('financial-profit')).toHaveTextContent('40000');
      expect(within(financialCard).getByTestId('financial-investment-amount')).toHaveTextContent('10000');
    });

    it('should render TeamMemberCard component - Requirements 9.1, 9.2, 9.3', () => {
      const investment = createMockInvestment();
      const teamMembers: TeamMember[] = [
        {
          id: 'member-1',
          name: 'John Doe',
          role: 'Lead Developer',
          expertiseLevel: 'lead',
          contributionScore: 95,
          performanceRating: 4.8,
        },
        {
          id: 'member-2',
          name: 'Jane Smith',
          role: 'Designer',
          expertiseLevel: 'senior',
          contributionScore: 88,
          performanceRating: 4.5,
        },
      ];
      const project = createMockProject({ teamMembers });

      render(<InvestmentDetail investment={investment} project={project} />);

      // Team section is collapsed by default, need to expand it first
      const teamHeader = screen.getByText('Project Team');
      fireEvent.click(teamHeader);

      const teamCard = screen.getByTestId('team-member-card');
      expect(teamCard).toBeInTheDocument();
      expect(within(teamCard).getByTestId('team-member-count')).toHaveTextContent('2');
    });

    it('should pass correct props to sub-components', () => {
      const investment = createMockInvestment({ amount: 15000 });
      const currentStage: DevelopmentStage = {
        id: 'stage-1',
        projectId: 'proj-456',
        stageName: 'Production',
        startDate: new Date('2024-03-01'),
        expectedEndDate: new Date('2024-05-01'),
        actualEndDate: null,
        status: 'in_progress',
      };
      const project = createMockProject({
        currentStage,
        stageHistory: [],
        financialPerformance: {
          revenue: 80000,
          expenses: 50000,
          profit: 30000,
          profitMargin: 37.5,
          revenueBreakdown: [],
          expenseBreakdown: [],
        },
        teamMembers: [],
      });

      render(<InvestmentDetail investment={investment} project={project} />);

      // Verify timeline receives correct props
      const timeline = screen.getByTestId('development-stage-timeline');
      expect(within(timeline).getByTestId('current-stage')).toHaveTextContent('Production');

      // Verify financial card receives correct props
      const financialCard = screen.getByTestId('financial-performance-card');
      expect(within(financialCard).getByTestId('financial-profit')).toHaveTextContent('30000');
      expect(within(financialCard).getByTestId('financial-investment-amount')).toHaveTextContent('15000');
    });
  });

  describe('Expandable Sections', () => {
    it('should render all section headers', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Development Progress')).toBeInTheDocument();
      expect(screen.getByText('Financial Performance')).toBeInTheDocument();
      expect(screen.getByText('Project Team')).toBeInTheDocument();
    });

    it('should have timeline and financial sections expanded by default', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByTestId('development-stage-timeline')).toBeVisible();
      expect(screen.getByTestId('financial-performance-card')).toBeVisible();
    });

    it('should have team section collapsed by default', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Team section should not be visible initially (collapsed)
      const teamCard = screen.queryByTestId('team-member-card');
      expect(teamCard).toBeNull();
    });

    it('should toggle timeline section when clicked', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      const timelineHeader = screen.getByText('Development Progress');
      
      // Initially visible
      expect(screen.getByTestId('development-stage-timeline')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(timelineHeader);
      
      // After collapse, should not be in document
      expect(screen.queryByTestId('development-stage-timeline')).toBeNull();

      // Click to expand
      fireEvent.click(timelineHeader);
      
      // Should be visible again
      expect(screen.getByTestId('development-stage-timeline')).toBeInTheDocument();
    });

    it('should toggle financial section when clicked', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      const financialHeader = screen.getByText('Financial Performance');

      // Initially visible
      expect(screen.getByTestId('financial-performance-card')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(financialHeader);
      expect(screen.queryByTestId('financial-performance-card')).toBeNull();

      // Click to expand
      fireEvent.click(financialHeader);
      expect(screen.getByTestId('financial-performance-card')).toBeInTheDocument();
    });

    it('should toggle team section when clicked', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      const teamHeader = screen.getByText('Project Team');

      // Initially not visible
      expect(screen.queryByTestId('team-member-card')).toBeNull();

      // Click to expand
      fireEvent.click(teamHeader);
      expect(screen.getByTestId('team-member-card')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(teamHeader);
      expect(screen.queryByTestId('team-member-card')).toBeNull();
    });

    it('should show chevron icons for expandable sections', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      const { container } = render(<InvestmentDetail investment={investment} project={project} />);

      // Should have chevron icons (up for expanded, down for collapsed)
      const chevrons = container.querySelectorAll('svg');
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero investment amount', () => {
      const investment = createMockInvestment({
        amount: 0,
        currentValue: 0,
        returnAmount: 0,
        returnPercentage: 0,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Check for Investment Amount label and value
      const investmentAmountSection = screen.getByText('Investment Amount').closest('div');
      expect(investmentAmountSection).toHaveTextContent('$0.00');
      
      // Check for percentage using getAllByText
      const percentages = screen.getAllByText('+0.00%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should handle project with no current stage', () => {
      const investment = createMockInvestment();
      const project = createMockProject({
        currentStage: null,
        stageHistory: [],
      });

      render(<InvestmentDetail investment={investment} project={project} />);

      const timeline = screen.getByTestId('development-stage-timeline');
      expect(within(timeline).getByTestId('current-stage')).toHaveTextContent('None');
    });

    it('should handle project with no team members', () => {
      const investment = createMockInvestment();
      const project = createMockProject({ teamMembers: [] });

      render(<InvestmentDetail investment={investment} project={project} />);

      // Team section is collapsed by default, need to expand it first
      const teamHeader = screen.getByText('Project Team');
      fireEvent.click(teamHeader);

      const teamCard = screen.getByTestId('team-member-card');
      expect(within(teamCard).getByTestId('team-member-count')).toHaveTextContent('0');
    });

    it('should handle project with no description', () => {
      const investment = createMockInvestment();
      const project = createMockProject({ description: '' });

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.queryByText(/A test project/)).not.toBeInTheDocument();
    });

    it('should handle large investment amounts', () => {
      const investment = createMockInvestment({
        amount: 1000000,
        currentValue: 1500000,
        returnAmount: 500000,
        returnPercentage: 50,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText and check specific ones
      const amounts = screen.getAllByText('$1,000,000.00');
      expect(amounts.length).toBeGreaterThan(0);
      
      const currentValues = screen.getAllByText('$1,500,000.00');
      expect(currentValues.length).toBeGreaterThan(0);
      
      expect(screen.getByText('$500,000.00')).toBeInTheDocument();
    });

    it('should handle very small return percentages', () => {
      const investment = createMockInvestment({
        returnAmount: 10,
        returnPercentage: 0.01,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText since percentage appears in multiple places
      const percentages = screen.getAllByText('+0.01%');
      expect(percentages.length).toBeGreaterThan(0);
    });

    it('should handle negative return percentages correctly', () => {
      const investment = createMockInvestment({
        amount: 10000,
        currentValue: 5000,
        returnAmount: -5000,
        returnPercentage: -50,
      });
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      // Use getAllByText since percentage appears in multiple places
      const percentages = screen.getAllByText('-50.00%');
      expect(percentages.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const investment = createMockInvestment();
      const project = createMockProject({ name: 'Accessible Project' });

      render(<InvestmentDetail investment={investment} project={project} />);

      expect(screen.getByText('Accessible Project')).toBeInTheDocument();
      expect(screen.getByText('Development Progress')).toBeInTheDocument();
      expect(screen.getByText('Financial Performance')).toBeInTheDocument();
      expect(screen.getByText('Project Team')).toBeInTheDocument();
    });

    it('should have clickable section headers', () => {
      const investment = createMockInvestment();
      const project = createMockProject();

      render(<InvestmentDetail investment={investment} project={project} />);

      const timelineHeader = screen.getByText('Development Progress');
      expect(timelineHeader).toBeInTheDocument();

      fireEvent.click(timelineHeader);
      // Should not throw error
    });
  });
});
