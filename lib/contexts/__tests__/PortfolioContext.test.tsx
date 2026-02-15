/**
 * Unit Tests for PortfolioContext
 * 
 * These tests verify specific examples and edge cases for the PortfolioContext
 * and usePortfolioContext hook.
 * 
 * Requirements: 6.1, 6.4, 6.5, 6.6
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { PortfolioProvider, usePortfolioContext, InvestmentSummary, PortfolioSummary } from '../PortfolioContext';

// Mock fetch globally
global.fetch = jest.fn();

/**
 * Helper function to create a wrapper with PortfolioProvider
 */
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <PortfolioProvider>{children}</PortfolioProvider>;
  };
}

/**
 * Helper to create mock investment data
 */
function createMockInvestment(overrides?: Partial<InvestmentSummary>): InvestmentSummary {
  return {
    id: 'inv-123',
    projectId: 'proj-456',
    projectName: 'Test Project',
    amount: 10000,
    investmentDate: '2024-01-01T00:00:00.000Z',
    currentValue: 12000,
    returnAmount: 2000,
    returnPercentage: 20,
    status: 'active',
    ...overrides,
  };
}

/**
 * Helper to mock portfolio API response
 */
function mockPortfolioResponse(investments: InvestmentSummary[]) {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = currentValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({
      totalInvested,
      currentValue,
      totalReturn,
      returnPercentage,
      investments,
    }),
  });
}

describe('PortfolioContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Portfolio Data Fetching - Requirement 6.1', () => {
    it('should fetch portfolio data successfully', async () => {
      const mockInvestments = [
        createMockInvestment({ id: 'inv-1', amount: 10000, currentValue: 12000 }),
        createMockInvestment({ id: 'inv-2', amount: 20000, currentValue: 22000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      // Initially not loading (no auto-fetch)
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.summary).toBeNull();

      // Fetch portfolio
      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Verify API was called
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/investments/portfolio',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );

      // Verify state was updated
      expect(result.current.state.summary).not.toBeNull();
      expect(result.current.state.investments).toHaveLength(2);
      expect(result.current.state.lastUpdated).not.toBeNull();
      expect(result.current.state.error).toBeNull();
    });

    it('should handle empty portfolio', async () => {
      mockPortfolioResponse([]);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.investments).toHaveLength(0);
      expect(result.current.state.summary?.totalInvested).toBe(0);
      expect(result.current.state.summary?.currentValue).toBe(0);
    });

    it('should handle 401 unauthorized response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.summary).toBeNull();
      expect(result.current.state.investments).toHaveLength(0);
      expect(result.current.state.error).toContain('Unauthorized');
    });

    it('should handle 403 forbidden response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.error).toContain('Unauthorized');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.error).toBeTruthy();
      expect(result.current.state.summary).toBeNull();
    });

    it('should handle server errors (500) gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.error).toBeTruthy();
    });
  });

  describe('Portfolio Refresh - Requirement 6.1', () => {
    it('should refresh portfolio data', async () => {
      // Initial fetch
      const initialInvestments = [
        createMockInvestment({ id: 'inv-1', amount: 10000, currentValue: 12000 }),
      ];
      mockPortfolioResponse(initialInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.investments).toHaveLength(1);

      // Mock updated portfolio
      const updatedInvestments = [
        createMockInvestment({ id: 'inv-1', amount: 10000, currentValue: 15000 }),
        createMockInvestment({ id: 'inv-2', amount: 5000, currentValue: 6000 }),
      ];
      mockPortfolioResponse(updatedInvestments);

      // Refresh
      await act(async () => {
        await result.current.actions.refreshPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.investments).toHaveLength(2);
      expect(result.current.state.summary?.totalInvested).toBe(15000);
    });

    it('should set loading state during refresh', async () => {
      mockPortfolioResponse([]);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Mock slow API response
      mockPortfolioResponse([createMockInvestment()]);

      // Start refresh
      act(() => {
        result.current.actions.refreshPortfolio();
      });

      // Should be loading
      expect(result.current.state.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });
  });

  describe('Calculation Display - Requirements 6.4, 6.5, 6.6', () => {
    it('should calculate total invested correctly - Requirement 6.4', async () => {
      const mockInvestments = [
        createMockInvestment({ amount: 10000 }),
        createMockInvestment({ amount: 20000 }),
        createMockInvestment({ amount: 15000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.summary?.totalInvested).toBe(45000);
    });

    it('should calculate current value correctly - Requirement 6.5', async () => {
      const mockInvestments = [
        createMockInvestment({ amount: 10000, currentValue: 12000 }),
        createMockInvestment({ amount: 20000, currentValue: 22000 }),
        createMockInvestment({ amount: 15000, currentValue: 14000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.summary?.currentValue).toBe(48000);
    });

    it('should calculate ROI correctly - Requirement 6.6', async () => {
      const mockInvestments = [
        createMockInvestment({ amount: 10000, currentValue: 12000 }),
        createMockInvestment({ amount: 20000, currentValue: 24000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Total invested: 30000, Current value: 36000, Return: 6000, ROI: 20%
      expect(result.current.state.summary?.totalReturn).toBe(6000);
      expect(result.current.state.summary?.returnPercentage).toBe(20);
    });

    it('should handle negative returns correctly', async () => {
      const mockInvestments = [
        createMockInvestment({ amount: 10000, currentValue: 8000 }),
        createMockInvestment({ amount: 20000, currentValue: 18000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Total invested: 30000, Current value: 26000, Return: -4000, ROI: -13.33%
      expect(result.current.state.summary?.totalReturn).toBe(-4000);
      expect(result.current.state.summary?.returnPercentage).toBeCloseTo(-13.33, 1);
    });
  });

  describe('Update Investment', () => {
    it('should update a specific investment', async () => {
      const mockInvestments = [
        createMockInvestment({ id: 'inv-1', amount: 10000, currentValue: 12000 }),
        createMockInvestment({ id: 'inv-2', amount: 20000, currentValue: 22000 }),
      ];

      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Mock updated investment details
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          investment: {
            id: 'inv-1',
            amount: 10000,
            currentValue: 15000,
            returnAmount: 5000,
            returnPercentage: 50,
          },
        }),
      });

      // Update investment
      await act(async () => {
        await result.current.actions.updateInvestment('inv-1');
      });

      // Verify investment was updated
      const updatedInv = result.current.state.investments.find(inv => inv.id === 'inv-1');
      expect(updatedInv?.currentValue).toBe(15000);

      // Verify summary was recalculated
      expect(result.current.state.summary?.currentValue).toBe(37000); // 15000 + 22000
    });

    it('should handle update errors gracefully', async () => {
      const mockInvestments = [createMockInvestment()];
      mockPortfolioResponse(mockInvestments);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Mock error response
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

      // Update should not throw
      await act(async () => {
        await result.current.actions.updateInvestment('inv-1');
      });

      // State should remain unchanged
      expect(result.current.state.investments).toHaveLength(1);
    });
  });

  describe('Loading States', () => {
    it('should start with loading state false', () => {
      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.isLoading).toBe(false);
    });

    it('should set loading to true during fetch', () => {
      mockPortfolioResponse([]);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.actions.fetchPortfolio();
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should set loading to false after successful fetch', async () => {
      mockPortfolioResponse([]);

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isLoading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching portfolio:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should clear error on successful fetch', async () => {
      // First fetch fails
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePortfolioContext(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.error).toBeTruthy();

      // Second fetch succeeds
      mockPortfolioResponse([]);

      await act(async () => {
        await result.current.actions.fetchPortfolio();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.error).toBeNull();
    });
  });

  describe('Context Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => usePortfolioContext());
      }).toThrow('usePortfolioContext must be used within a PortfolioProvider');

      consoleErrorSpy.mockRestore();
    });
  });
});
