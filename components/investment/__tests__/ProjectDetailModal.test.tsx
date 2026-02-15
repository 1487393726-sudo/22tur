/**
 * Unit tests for ProjectDetailModal component
 * 
 * Tests requirements 4.6 and 4.7:
 * - Display comprehensive project information
 * - Show financial projections and historical performance
 * - Add investment form with amount input
 * - Implement investment submission logic
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectDetailModal, ProjectDetail } from '../ProjectDetailModal';

// Mock project data for testing
const mockProjectDetail: ProjectDetail = {
  id: 'proj-123',
  name: 'Green Energy Initiative',
  description: 'A sustainable energy project focused on solar power',
  category: 'Energy',
  fundingGoal: 500000,
  currentFunding: 250000,
  operationalDuration: 365,
  minimumInvestment: 1000,
  riskLevel: 'medium',
  expectedReturn: 15,
  currentStage: {
    id: 'stage-1',
    projectId: 'proj-123',
    stageName: 'Development',
    startDate: new Date('2024-01-01'),
    expectedEndDate: new Date('2024-06-01'),
    actualEndDate: null,
    status: 'in_progress',
  },
  stageHistory: [
    {
      id: 'stage-0',
      projectId: 'proj-123',
      stageName: 'Planning',
      startDate: new Date('2023-10-01'),
      expectedEndDate: new Date('2023-12-31'),
      actualEndDate: new Date('2023-12-30'),
      status: 'completed',
    },
    {
      id: 'stage-1',
      projectId: 'proj-123',
      stageName: 'Development',
      startDate: new Date('2024-01-01'),
      expectedEndDate: new Date('2024-06-01'),
      actualEndDate: null,
      status: 'in_progress',
    },
  ],
  financialPerformance: {
    id: 'fin-1',
    projectId: 'proj-123',
    reportingPeriod: new Date('2024-03-01'),
    revenue: 150000,
    expenses: 100000,
    profit: 50000,
    profitMargin: 33.33,
    revenueBreakdown: [
      { source: 'Product Sales', amount: 100000 },
      { source: 'Services', amount: 50000 },
    ],
    expenseBreakdown: [
      { category: 'Operations', amount: 60000 },
      { category: 'Marketing', amount: 40000 },
    ],
  },
  teamMembers: [
    {
      id: 'member-1',
      projectId: 'proj-123',
      name: 'John Doe',
      role: 'Project Manager',
      expertiseLevel: 'senior',
      contributionScore: 95.5,
      performanceRating: 4.8,
      joinedDate: new Date('2023-10-01'),
      leftDate: null,
    },
    {
      id: 'member-2',
      projectId: 'proj-123',
      name: 'Jane Smith',
      role: 'Lead Developer',
      expertiseLevel: 'lead',
      contributionScore: 98.2,
      performanceRating: 4.9,
      joinedDate: new Date('2023-10-15'),
      leftDate: null,
    },
  ],
};

describe('ProjectDetailModal', () => {
  const mockOnClose = jest.fn();
  const mockOnInvest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Display', () => {
    it('should not render when isOpen is false', () => {
      render(
        <ProjectDetailModal
          isOpen={false}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      expect(screen.queryByText('Green Energy Initiative')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      expect(screen.getByText('Green Energy Initiative')).toBeInTheDocument();
    });

    it('should show loading state when project is null', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={null}
          onInvest={mockOnInvest}
        />
      );

      // Check for loading spinner
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('Project Information Display - Requirement 4.6', () => {
    it('should display project name and description', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      expect(screen.getByText('Green Energy Initiative')).toBeInTheDocument();
      const descriptions = screen.getAllByText('A sustainable energy project focused on solar power');
      expect(descriptions.length).toBeGreaterThan(0);
    });

    it('should display project category and risk level badges', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const energyBadges = screen.getAllByText('Energy');
      expect(energyBadges.length).toBeGreaterThan(0);
      const riskBadges = screen.getAllByText('Medium Risk');
      expect(riskBadges.length).toBeGreaterThan(0);
    });

    it('should display funding progress with correct percentage', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      // 250000 / 500000 = 50%
      expect(screen.getByText('50.0%')).toBeInTheDocument();
      expect(screen.getByText('$250,000 raised')).toBeInTheDocument();
      expect(screen.getByText('$500,000 goal')).toBeInTheDocument();
    });

    it('should display key metrics correctly', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      expect(screen.getByText('15%')).toBeInTheDocument(); // Expected return
      expect(screen.getByText('12 months')).toBeInTheDocument(); // Duration (365/30)
      expect(screen.getByText('$1,000')).toBeInTheDocument(); // Min investment
      expect(screen.getByText('2')).toBeInTheDocument(); // Team size
    });
  });

  describe('Investment Form - Requirement 4.7', () => {
    it('should render investment form with amount input', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should display minimum investment requirement', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      expect(screen.getByText(/Minimum investment: \$1,000/)).toBeInTheDocument();
    });

    it('should validate investment amount is not empty', async () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid investment amount')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(mockOnInvest).not.toHaveBeenCalled();
    });

    it('should validate investment amount meets minimum', async () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '500' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText(/Minimum investment is \$1,000/)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(mockOnInvest).not.toHaveBeenCalled();
    });

    it('should validate investment amount does not exceed available funding', async () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      // Available funding is 500000 - 250000 = 250000
      fireEvent.change(input, { target: { value: '300000' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText(/Maximum investment available is \$250,000/)).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(mockOnInvest).not.toHaveBeenCalled();
    });

    it('should submit valid investment', async () => {
      mockOnInvest.mockResolvedValue(undefined);

      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5000' } });

      const submitButton = screen.getByRole('button', { name: /invest now/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnInvest).toHaveBeenCalledWith('proj-123', 5000);
      });

      // Modal should close after successful submission
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display error message on investment failure', async () => {
      mockOnInvest.mockRejectedValue(new Error('Insufficient funds'));

      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5000' } });

      const submitButton = screen.getByRole('button', { name: /invest now/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
      });

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should disable form during submission', async () => {
      mockOnInvest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const input = screen.getByLabelText(/investment amount/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '5000' } });

      const submitButton = screen.getByRole('button', { name: /invest now/i });
      fireEvent.click(submitButton);

      // Check that button shows loading state
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });

      // Check that input is disabled
      expect(input).toBeDisabled();
    });
  });

  describe('Modal Interactions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(
        <ProjectDetailModal
          isOpen={true}
          onClose={mockOnClose}
          project={mockProjectDetail}
          onInvest={mockOnInvest}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
