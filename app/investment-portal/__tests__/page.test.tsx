/**
 * Unit Tests for ProjectInvestmentPage Component
 * 
 * Tests the main investment portal page functionality including:
 * - Project list display
 * - Search and filter controls
 * - Project selection and detail modal
 * - Investment submission
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ProjectInvestmentPage from '../page';
import { useInvestorAccess } from '@/hooks/use-investor-access';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-investor-access', () => ({
  useInvestorAccess: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('ProjectInvestmentPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockRefreshStatus = jest.fn();
  const mockMarkAsInvestor = jest.fn();

  const mockProjects = [
    {
      id: '1',
      name: 'Tech Startup Alpha',
      description: 'Revolutionary AI platform',
      category: 'Technology',
      fundingGoal: 100000,
      currentFunding: 50000,
      operationalDuration: 365,
      minimumInvestment: 1000,
      riskLevel: 'medium' as const,
      expectedReturn: 25,
      status: 'active',
    },
    {
      id: '2',
      name: 'Green Energy Project',
      description: 'Solar panel installation',
      category: 'Energy',
      fundingGoal: 200000,
      currentFunding: 150000,
      operationalDuration: 730,
      minimumInvestment: 5000,
      riskLevel: 'low' as const,
      expectedReturn: 15,
      status: 'active',
    },
    {
      id: '3',
      name: 'Real Estate Development',
      description: 'Luxury apartment complex',
      category: 'Real Estate',
      fundingGoal: 500000,
      currentFunding: 100000,
      operationalDuration: 1095,
      minimumInvestment: 10000,
      riskLevel: 'high' as const,
      expectedReturn: 40,
      status: 'active',
    },
  ];

  const mockProjectDetail = {
    ...mockProjects[0],
    currentStage: {
      id: 'stage-1',
      projectId: '1',
      stageName: 'Development',
      startDate: '2024-01-01T00:00:00.000Z',
      expectedEndDate: '2024-06-01T00:00:00.000Z',
      actualEndDate: null,
      status: 'in_progress' as const,
    },
    stageHistory: [
      {
        id: 'stage-0',
        projectId: '1',
        stageName: 'Planning',
        startDate: '2023-10-01T00:00:00.000Z',
        expectedEndDate: '2023-12-31T00:00:00.000Z',
        actualEndDate: '2023-12-31T00:00:00.000Z',
        status: 'completed' as const,
      },
    ],
    financialPerformance: {
      id: 'fin-1',
      projectId: '1',
      reportingPeriod: '2024-01-01T00:00:00.000Z',
      revenue: 50000,
      expenses: 30000,
      profit: 20000,
      profitMargin: 40,
      revenueBreakdown: [{ source: 'Sales', amount: 50000 }],
      expenseBreakdown: [{ category: 'Operations', amount: 30000 }],
    },
    teamMembers: [
      {
        id: 'member-1',
        projectId: '1',
        name: 'John Doe',
        role: 'Lead Developer',
        expertiseLevel: 'senior' as const,
        contributionScore: 95,
        performanceRating: 4.8,
        joinedDate: '2023-10-01T00:00:00.000Z',
        leftDate: null,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useInvestorAccess as jest.Mock).mockReturnValue({
      isInvestor: false,
      isLoading: false,
      checkAccess: jest.fn().mockResolvedValue(false),
      refreshStatus: mockRefreshStatus,
      markAsInvestor: mockMarkAsInvestor,
    });
  });

  describe('Initial Rendering and Data Loading', () => {
    it('should display loading state while fetching projects', () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ProjectInvestmentPage />);

      expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('should fetch and display projects on mount - Requirement 4.1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
        expect(screen.getByText('Green Energy Project')).toBeInTheDocument();
        expect(screen.getByText('Real Estate Development')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should display error message when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch projects/)).toBeInTheDocument();
      });
    });

    it('should redirect to login on 401 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should display empty state when no projects available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: [] }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('No projects found')).toBeInTheDocument();
        expect(
          screen.getByText('There are no investment projects available at this time')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Project Card Display - Requirements 4.2, 4.3, 4.4, 4.5', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should display project name and category', () => {
      expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should display funding progress - Requirement 4.2', () => {
      // Check for funding amounts
      expect(screen.getByText(/\$50,000 raised/)).toBeInTheDocument();
      expect(screen.getByText(/\$100,000 goal/)).toBeInTheDocument();
    });

    it('should display operational duration - Requirement 4.3', () => {
      // 365 days = 12 months
      expect(screen.getByText(/12 months/)).toBeInTheDocument();
    });

    it('should display minimum investment - Requirement 4.5', () => {
      expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
    });

    it('should display risk level - Requirement 4.4', () => {
      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });

    it('should display expected return', () => {
      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should filter projects by search query', async () => {
      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, description, or category/
      );

      fireEvent.change(searchInput, { target: { value: 'Tech' } });

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Green Energy Project')).not.toBeInTheDocument();
        expect(screen.queryByText('Real Estate Development')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when search has no results', async () => {
      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, description, or category/
      );

      fireEvent.change(searchInput, { target: { value: 'NonexistentProject' } });

      await waitFor(() => {
        expect(screen.getByText('No projects found')).toBeInTheDocument();
        expect(
          screen.getByText('Try adjusting your filters to see more results')
        ).toBeInTheDocument();
      });
    });

    it('should display active search filter badge', async () => {
      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, description, or category/
      );

      fireEvent.change(searchInput, { target: { value: 'Tech' } });

      await waitFor(() => {
        expect(screen.getByText(/Search: Tech/)).toBeInTheDocument();
      });
    });
  });

  describe('Category Filter', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should have category filter control', () => {
      const categoryTrigger = screen.getByTestId('category-filter');
      expect(categoryTrigger).toBeInTheDocument();
    });

    it('should display all categories in initial state', () => {
      // All three projects should be visible initially
      expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      expect(screen.getByText('Green Energy Project')).toBeInTheDocument();
      expect(screen.getByText('Real Estate Development')).toBeInTheDocument();
    });
  });

  describe('Risk Level Filter', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should have risk level filter control', () => {
      const riskTrigger = screen.getByTestId('risk-filter');
      expect(riskTrigger).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should sort projects by name (default)', () => {
      const projectCards = screen.getAllByRole('heading', { level: 3 });
      expect(projectCards[0]).toHaveTextContent('Green Energy Project');
      expect(projectCards[1]).toHaveTextContent('Real Estate Development');
      expect(projectCards[2]).toHaveTextContent('Tech Startup Alpha');
    });

    it('should have sort filter control', () => {
      const sortTrigger = screen.getByTestId('sort-filter');
      expect(sortTrigger).toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should clear all filters when clicking Clear all button', async () => {
      // Apply search filter
      const searchInput = screen.getByPlaceholderText(
        /Search projects by name, description, or category/
      );
      fireEvent.change(searchInput, { target: { value: 'Tech' } });

      await waitFor(() => {
        expect(screen.getByText(/Search: Tech/)).toBeInTheDocument();
      });

      // Click Clear all
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(screen.queryByText(/Search: Tech/)).not.toBeInTheDocument();
        // All projects should be visible again
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
        expect(screen.getByText('Green Energy Project')).toBeInTheDocument();
        expect(screen.getByText('Real Estate Development')).toBeInTheDocument();
      });
    });
  });

  describe('Project Detail Modal - Requirement 4.6', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ projects: mockProjects }),
        });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });
    });

    it('should open project detail modal when clicking View Details', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: mockProjectDetail }),
      });

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailsButtons[0]);

      // Wait for the fetch to be called - the first project in alphabetical order is "Green Energy Project" with id "2"
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/projects/2', expect.any(Object));
      }, { timeout: 3000 });
    });

    it('should display loading overlay while fetching project details', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Loading project details...')).toBeInTheDocument();
      });
    });
  });

  describe('Investment Submission - Requirement 4.7', () => {
    it('should submit investment and redirect to investor portal', async () => {
      // Mock projects list
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech Startup Alpha')).toBeInTheDocument();
      });

      // Mock project details
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ project: mockProjectDetail }),
      });

      // Click View Details
      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
      fireEvent.click(viewDetailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Mock investment submission
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          investment: { id: 'inv-1', amount: 5000 },
          message: 'Investment successful',
        }),
      });

      // Fill investment form
      const amountInput = screen.getByLabelText(/investment amount/i);
      fireEvent.change(amountInput, { target: { value: '5000' } });

      // Submit investment
      const investButton = screen.getByRole('button', { name: /invest now/i });
      fireEvent.click(investButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/investments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: '1',
            amount: 5000,
          }),
        });

        // Requirement 5.1, 12.1: Verify immediate status update
        expect(mockMarkAsInvestor).toHaveBeenCalled();
        // Also verify API refresh is called
        expect(mockRefreshStatus).toHaveBeenCalled();
        // Requirement 5.2: Verify redirect to portfolio
        expect(mockRouter.push).toHaveBeenCalledWith('/investor-portal');
      });
    });
  });

  describe('Results Count Display', () => {
    it('should display correct count of filtered projects', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: mockProjects }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 projects')).toBeInTheDocument();
      });
    });

    it('should display singular form for one project', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ projects: [mockProjects[0]] }),
      });

      render(<ProjectInvestmentPage />);

      await waitFor(() => {
        expect(screen.getByText('Showing 1 project')).toBeInTheDocument();
      });
    });
  });
});
