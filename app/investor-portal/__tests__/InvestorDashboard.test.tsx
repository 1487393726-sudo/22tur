import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvestorDashboardPage from '../page';
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext';
import { InvestorProvider } from '@/lib/contexts/InvestorContext';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/investor-portal',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock fetch globally
global.fetch = jest.fn();

/**
 * Test Suite: InvestorDashboard Page Component
 * 
 * Tests the main investor dashboard page component that integrates:
 * - PortfolioOverviewCard
 * - InvestmentDetail components
 * - SuccessfulProjectsTable
 * - Data fetching and state management
 * 
 * Requirements tested:
 * - 6.1, 6.2, 6.3: Display all investments with details
 * - 6.4, 6.5, 6.6: Portfolio overview calculations
 * - 10.1-10.5: Successful projects display
 */
describe('InvestorDashboard Page Component', () => {
  const mockPortfolioData = {
    totalInvested: 10000,
    currentValue: 12000,
    totalReturn: 2000,
    returnPercentage: 20,
    investments: [
      {
        id: 'inv-1',
        projectId: 'proj-1',
        projectName: 'Tech Startup',
        amount: 5000,
        investmentDate: '2024-01-01',
        currentValue: 6000,
        returnAmount: 1000,
        returnPercentage: 20,
        status: 'active' as const,
      },
      {
        id: 'inv-2',
        projectId: 'proj-2',
        projectName: 'Green Energy',
        amount: 5000,
        investmentDate: '2024-02-01',
        currentValue: 6000,
        returnAmount: 1000,
        returnPercentage: 20,
        status: 'active' as const,
      },
    ],
  };

  const mockInvestmentDetails = {
    investment: {
      id: 'inv-1',
      projectId: 'proj-1',
      userId: 'user-1',
      amount: 5000,
      investmentDate: new Date('2024-01-01'),
      currentValue: 6000,
      returnAmount: 1000,
      returnPercentage: 20,
      status: 'active' as const,
    },
    project: {
      id: 'proj-1',
      name: 'Tech Startup',
      description: 'A promising tech startup',
      category: 'Technology',
      currentStage: {
        name: 'Development',
        startDate: new Date('2024-01-01'),
        expectedEndDate: new Date('2024-12-31'),
        status: 'in_progress' as const,
      },
      stageHistory: [],
      financialPerformance: {
        revenue: 100000,
        expenses: 80000,
        profit: 20000,
        profitMargin: 20,
        revenueBreakdown: [],
        expenseBreakdown: [],
      },
      teamMembers: [],
    },
  };

  const mockSuccessfulProjects = {
    projects: [
      {
        id: 'proj-success-1',
        name: 'Completed Project',
        category: 'Technology',
        completionDate: new Date('2023-12-31'),
        investmentAmount: 5000,
        finalReturn: 2000,
        returnPercentage: 40,
        revenueGenerated: 150000,
        userAdoption: 10000,
      },
    ],
    total: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  /**
   * Test: Investor status check and portfolio fetch
   * Requirement: 6.1 - Display all investments
   */
  it('should check investor status and fetch portfolio data on mount', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
    });

    // Verify fetch calls
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/investments/status',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/investments/portfolio',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });

  /**
   * Test: Display portfolio overview
   * Requirements: 6.4, 6.5, 6.6 - Portfolio calculations
   */
  it('should display portfolio overview with correct calculations', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });

    // Check total invested - Requirement 6.4
    expect(screen.getByText('$10,000.00')).toBeInTheDocument();

    // Check current value - Requirement 6.5
    expect(screen.getByText('$12,000.00')).toBeInTheDocument();

    // Check total return and percentage - Requirement 6.6
    expect(screen.getByText('+$2,000.00')).toBeInTheDocument();
    expect(screen.getByText('+20.00%')).toBeInTheDocument();
  });

  /**
   * Test: Display investment list
   * Requirements: 6.1, 6.2, 6.3 - Investment records display
   */
  it('should display all investments with required fields', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('My Investments')).toBeInTheDocument();
    });

    // Check project names - Requirement 6.2
    expect(screen.getByText('Tech Startup')).toBeInTheDocument();
    expect(screen.getByText('Green Energy')).toBeInTheDocument();

    // Check investment amounts - Requirement 6.2
    const investedLabels = screen.getAllByText(/Invested:/);
    expect(investedLabels).toHaveLength(2);

    // Check investment dates - Requirement 6.2
    const dateLabels = screen.getAllByText(/Date:/);
    expect(dateLabels).toHaveLength(2);

    // Check status badges - Requirement 6.3
    const activeStatuses = screen.getAllByText('Active');
    expect(activeStatuses.length).toBeGreaterThan(0);
  });

  /**
   * Test: Expand investment to show details
   * Requirements: 7.1, 8.2, 9.1 - Detailed investment information
   */
  it('should fetch and display investment details when expanded', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvestmentDetails,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tech Startup')).toBeInTheDocument();
    });

    // Click to expand investment
    const expandButton = screen.getAllByRole('button')[1]; // First investment button
    fireEvent.click(expandButton);

    // Wait for details to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/investments/inv-1/details',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
    });

    // Check that InvestmentDetail component is rendered
    await waitFor(() => {
      expect(screen.getByText('Development Progress')).toBeInTheDocument();
    });
  });

  /**
   * Test: Display successful projects table
   * Requirement: 10.1 - Successful projects display
   */
  it('should display successful projects table', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Successful Projects')).toBeInTheDocument();
    });

    // The SuccessfulProjectsTable component should be rendered
    // It will make its own fetch call for successful projects
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/investments/successful-projects'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });

  /**
   * Test: Handle empty portfolio
   * Requirement: 6.1 - Handle edge case of no investments
   */
  it('should display empty state when user has no investments', async () => {
    const emptyPortfolio = {
      totalInvested: 0,
      currentValue: 0,
      totalReturn: 0,
      returnPercentage: 0,
      investments: [],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 0, totalInvested: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyPortfolio,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Investments Yet')).toBeInTheDocument();
    });

    expect(screen.getByText(/Start building your portfolio/)).toBeInTheDocument();
    expect(screen.getByText('Explore Investments')).toBeInTheDocument();
  });

  /**
   * Test: Handle API errors
   * Requirement: Error handling for data fetching
   */
  it('should display error state when portfolio fetch fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Portfolio')).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch portfolio/)).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  /**
   * Test: Refresh portfolio data
   * Requirement: Data refresh functionality
   */
  it('should refresh portfolio data when refresh button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify additional fetch call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(4); // status + portfolio + successful + refresh
    });
  });

  /**
   * Test: Navigate to investment portal
   * Requirement: Navigation functionality
   */
  it('should navigate to investment portal when explore button is clicked', async () => {
    const emptyPortfolio = {
      totalInvested: 0,
      currentValue: 0,
      totalReturn: 0,
      returnPercentage: 0,
      investments: [],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 0, totalInvested: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyPortfolio,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Investments Yet')).toBeInTheDocument();
    });

    // Click explore investments button
    const exploreButton = screen.getByText('Explore Investments');
    fireEvent.click(exploreButton);

    // Verify navigation
    expect(mockPush).toHaveBeenCalledWith('/investment-portal');
  });

  /**
   * Test: Loading state display
   * Requirement: User feedback during data loading
   */
  it('should display loading state while fetching data', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    // Check for loading skeletons
    await waitFor(() => {
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test: Collapse expanded investment
   * Requirement: UI interaction for investment details
   */
  it('should collapse investment details when clicked again', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 10000 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolioData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessfulProjects,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvestmentDetails,
      });

    render(
      <InvestorProvider>
        <InvestorDashboardPage />
      </InvestorProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Tech Startup')).toBeInTheDocument();
    });

    // Expand investment
    const expandButton = screen.getAllByRole('button')[1];
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.getByText('Development Progress')).toBeInTheDocument();
    });

    // Collapse investment
    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(screen.queryByText('Development Progress')).not.toBeInTheDocument();
    });
  });
});
