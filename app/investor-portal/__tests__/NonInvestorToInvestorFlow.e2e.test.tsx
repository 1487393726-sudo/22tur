/**
 * End-to-End Test: Non-Investor to Investor Flow
 * 
 * Tests the complete journey from non-investor accessing premium feature
 * to becoming an investor and gaining premium access
 * 
 * Requirements: 2.1, 3.1, 3.3, 4.1, 5.1, 5.2, 6.1
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import { InvestorProvider } from '@/lib/contexts/InvestorContext';
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext';
import PremiumFeatureGate from '@/components/investment/PremiumFeatureGate';
import InvestorDashboard from '@/app/investor-portal/page';

// Mock next/navigation
const mockPush = jest.fn();
const mockRouter = jest.fn();
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

// Mock fetch
global.fetch = jest.fn();

describe('E2E: Non-Investor to Investor Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  const mockSession = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockProjects = [
    {
      id: 'proj-001',
      name: 'AI Healthcare Platform',
      description: 'Revolutionary AI-powered healthcare diagnostics',
      category: 'Healthcare',
      fundingGoal: 1000000,
      currentFunding: 750000,
      operationalDuration: 180,
      minimumInvestment: 1000,
      riskLevel: 'medium' as const,
      expectedReturn: 15.5,
    },
    {
      id: 'proj-002',
      name: 'Green Energy Storage',
      description: 'Next-generation battery technology',
      category: 'Energy',
      fundingGoal: 2000000,
      currentFunding: 1200000,
      operationalDuration: 365,
      minimumInvestment: 5000,
      riskLevel: 'high' as const,
      expectedReturn: 25.0,
    },
  ];

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    mockPush.mockClear();

    // Setup default fetch mock
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isInvestor: false,
            totalInvestments: 0,
            totalInvested: 0,
          }),
        });
      }
      if (url.includes('/api/projects')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            projects: mockProjects,
            total: mockProjects.length,
            hasMore: false,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Complete flow: Non-investor accesses premium feature, invests, gains access', async () => {
    // Step 1: Non-investor tries to access premium feature
    const { rerender } = render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={true}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 2: Verify Investment CTA modal is displayed
    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Portfolio tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial analytics/i)).toBeInTheDocument();
    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();

    // Step 3: Click "Invest Now" button
    const investNowButton = screen.getByRole('button', { name: /Invest Now/i });
    await user.click(investNowButton);

    // Step 4: Verify navigation to Investment Portal
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/investment-portal');
    });

    // Step 5: Simulate user completing investment
    // Update fetch mock to return investor status
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isInvestor: true,
            totalInvestments: 1,
            totalInvested: 5000,
          }),
        });
      }
      if (url.includes('/api/investments') && options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            investment: {
              id: 'inv-001',
              projectId: 'proj-001',
              userId: 'user-123',
              amount: 5000,
              investmentDate: new Date().toISOString(),
            },
            message: 'Investment successful',
          }),
        });
      }
      if (url.includes('/api/investments/portfolio')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            totalInvested: 5000,
            currentValue: 5250,
            totalReturn: 250,
            returnPercentage: 5.0,
            investments: [
              {
                id: 'inv-001',
                projectId: 'proj-001',
                projectName: 'AI Healthcare Platform',
                amount: 5000,
                investmentDate: new Date().toISOString(),
                currentValue: 5250,
                returnAmount: 250,
                returnPercentage: 5.0,
                status: 'active',
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    // Step 6: Re-render with updated investor status
    rerender(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={true}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 7: Verify premium content is now accessible
    await waitFor(() => {
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Unlock Premium Features/i)).not.toBeInTheDocument();

    // Step 8: Verify portfolio access
    rerender(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PortfolioProvider>
            <InvestorDashboard />
          </PortfolioProvider>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 9: Verify portfolio data is displayed
    await waitFor(() => {
      expect(screen.getByText(/Portfolio Overview/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/AI Healthcare Platform/i)).toBeInTheDocument();
    });
  });

  test('Non-investor dismisses Investment CTA modal', async () => {
    // Step 1: Non-investor tries to access premium feature
    render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={true}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 2: Verify Investment CTA modal is displayed
    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    // Step 3: Click "Maybe Later" button
    const maybeLaterButton = screen.getByRole('button', { name: /Maybe Later/i });
    await user.click(maybeLaterButton);

    // Step 4: Verify modal is dismissed
    await waitFor(() => {
      expect(screen.queryByText(/Unlock Premium Features/i)).not.toBeInTheDocument();
    });

    // Step 5: Verify premium content is still not accessible
    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();

    // Step 6: Verify no navigation occurred
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('Investment completion triggers automatic premium access', async () => {
    // Step 1: Start as non-investor
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isInvestor: false,
            totalInvestments: 0,
            totalInvested: 0,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { rerender } = render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={false}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 2: Verify premium content is not accessible
    await waitFor(() => {
      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    // Step 3: Simulate investment completion
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isInvestor: true,
            totalInvestments: 1,
            totalInvested: 1000,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    // Step 4: Re-render to trigger status refresh
    rerender(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={false}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 5: Verify premium access is granted automatically
    await waitFor(() => {
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });
  });

  test('Session persistence maintains premium access', async () => {
    // Step 1: Start as investor with valid session
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            isInvestor: true,
            totalInvestments: 2,
            totalInvested: 15000,
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    const { rerender } = render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={false}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 2: Verify premium access is granted
    await waitFor(() => {
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    // Step 3: Re-render (simulating page navigation)
    rerender(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={false}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 4: Verify premium access is maintained
    await waitFor(() => {
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    // Step 5: Verify status API is called (but cached)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/investments/status'),
      expect.any(Object)
    );
  });

  test('Error handling during investment flow', async () => {
    // Step 1: Non-investor tries to access premium feature
    render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={true}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 2: Verify Investment CTA modal is displayed
    await waitFor(() => {
      expect(screen.getByText(/Unlock Premium Features/i)).toBeInTheDocument();
    });

    // Step 3: Click "Invest Now" button
    const investNowButton = screen.getByRole('button', { name: /Invest Now/i });
    await user.click(investNowButton);

    // Step 4: Verify navigation to Investment Portal
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/investment-portal');
    });

    // Step 5: Simulate API error during status check
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({
            error: 'Internal Server Error',
            message: 'Failed to fetch investor status',
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    // Step 6: Re-render to trigger error
    const { rerender } = render(
      <SessionProvider session={mockSession}>
        <InvestorProvider>
          <PremiumFeatureGate showInvestmentCTA={false}>
            <div>Premium Content</div>
          </PremiumFeatureGate>
        </InvestorProvider>
      </SessionProvider>
    );

    // Step 7: Verify error handling (premium content not shown)
    await waitFor(() => {
      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });
  });
});
