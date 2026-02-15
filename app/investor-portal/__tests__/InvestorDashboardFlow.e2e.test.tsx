/**
 * End-to-End Test: Investor Dashboard Flow
 * Requirements: 6.1, 6.2, 6.3, 7.1, 8.2, 9.1, 10.1, 10.4
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from 'next-auth/react';
import { InvestorProvider } from '@/lib/contexts/InvestorContext';
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext';
import InvestorDashboard from '@/app/investor-portal/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/investor-portal',
  useSearchParams: () => new URLSearchParams(),
}));

global.fetch = jest.fn();

describe('E2E: Investor Dashboard Flow', () => {
  const mockSession = { user: { id: 'investor-123', email: 'investor@example.com', name: 'Test Investor', role: 'CLIENT' as const }, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/investments/status')) return Promise.resolve({ ok: true, json: async () => ({ isInvestor: true, totalInvestments: 2, totalInvested: 50000 }) });
      if (url.includes('/api/investments/portfolio')) return Promise.resolve({ ok: true, json: async () => ({ totalInvested: 50000, currentValue: 57500, totalReturn: 7500, returnPercentage: 15.0, investments: [] }) });
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  test('Investor can access portfolio page', async () => {
    render(<SessionProvider session={mockSession}><InvestorProvider><PortfolioProvider><InvestorDashboard /></PortfolioProvider></InvestorProvider></SessionProvider>);
    await waitFor(() => expect(screen.getByText(/Portfolio Overview/i)).toBeInTheDocument());
  });
});
