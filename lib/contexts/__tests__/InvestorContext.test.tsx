/**
 * Unit Tests for InvestorContext
 * 
 * These tests verify specific examples and edge cases for the InvestorContext
 * and useInvestorAccess hook.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { InvestorProvider, useInvestorContext } from '../InvestorContext';

// Mock fetch globally
global.fetch = jest.fn();

/**
 * Helper function to create a wrapper with InvestorProvider
 */
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <InvestorProvider>{children}</InvestorProvider>;
  };
}

/**
 * Helper to mock API response
 */
function mockInvestorStatusResponse(
  isInvestor: boolean,
  totalInvestments: number,
  totalInvested: number
) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({
      isInvestor,
      totalInvestments,
      totalInvested,
    }),
  });
}

describe('InvestorContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Status Fetch', () => {
    it('should fetch investor status on mount', async () => {
      mockInvestorStatusResponse(true, 5, 50000);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.state.isLoading).toBe(true);

      // Wait for status check to complete
      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Verify API was called
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/investments/status',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );

      // Verify state was updated
      expect(result.current.state.isInvestor).toBe(true);
      expect(result.current.state.investmentCount).toBe(5);
      expect(result.current.state.totalInvested).toBe(50000);
      expect(result.current.state.lastChecked).not.toBeNull();
    });

    it('should handle non-investor status correctly', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(false);
      expect(result.current.state.investmentCount).toBe(0);
      expect(result.current.state.totalInvested).toBe(0);
    });

    it('should handle 401 unauthorized response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(false);
      expect(result.current.state.investmentCount).toBe(0);
      expect(result.current.state.totalInvested).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Should default to non-investor on error
      expect(result.current.state.isInvestor).toBe(false);
      expect(result.current.state.investmentCount).toBe(0);
    });

    it('should handle server errors (500) gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(false);
    });
  });

  describe('Status Refresh', () => {
    it('should refresh status when refreshStatus is called', async () => {
      // Initial status: non-investor
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(false);

      // Mock updated status: investor
      mockInvestorStatusResponse(true, 1, 10000);

      // Refresh status
      await act(async () => {
        await result.current.actions.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Verify updated status
      expect(result.current.state.isInvestor).toBe(true);
      expect(result.current.state.investmentCount).toBe(1);
      expect(result.current.state.totalInvested).toBe(10000);
    });

    it('should set loading state during refresh', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Mock slow API response
      mockInvestorStatusResponse(true, 1, 10000);

      // Start refresh
      act(() => {
        result.current.actions.refreshStatus();
      });

      // Should be loading
      expect(result.current.state.isLoading).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });
    });
  });

  describe('Mark As Investor', () => {
    it('should immediately mark user as investor', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(false);

      // Mark as investor
      act(() => {
        result.current.actions.markAsInvestor();
      });

      // Should immediately update
      expect(result.current.state.isInvestor).toBe(true);
      expect(result.current.state.investmentCount).toBeGreaterThanOrEqual(1);
      expect(result.current.state.lastChecked).not.toBeNull();
    });

    it('should update lastChecked timestamp when marking as investor', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      const beforeTimestamp = result.current.state.lastChecked;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      act(() => {
        result.current.actions.markAsInvestor();
      });

      const afterTimestamp = result.current.state.lastChecked;

      expect(afterTimestamp).not.toBeNull();
      expect(afterTimestamp!.getTime()).toBeGreaterThan(beforeTimestamp!.getTime());
    });

    it('should preserve existing investment count if already > 0', async () => {
      mockInvestorStatusResponse(true, 5, 50000);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.investmentCount).toBe(5);

      act(() => {
        result.current.actions.markAsInvestor();
      });

      // Should preserve the count
      expect(result.current.state.investmentCount).toBe(5);
    });

    it('should set investment count to at least 1 when marking as investor', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.investmentCount).toBe(0);

      act(() => {
        result.current.actions.markAsInvestor();
      });

      expect(result.current.state.investmentCount).toBe(1);
    });
  });

  describe('Check Status', () => {
    it('should allow manual status check', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Mock updated status
      mockInvestorStatusResponse(true, 2, 20000);

      // Manual check
      await act(async () => {
        await result.current.actions.checkStatus();
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isInvestor).toBe(true);
      expect(result.current.state.investmentCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error checking investor status:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle malformed API responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}), // Missing required fields
      });

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      // Should handle gracefully with defaults
      expect(result.current.state.isInvestor).toBe(false);
      expect(result.current.state.investmentCount).toBe(0);
      expect(result.current.state.totalInvested).toBe(0);
    });
  });

  describe('Context Usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useInvestorContext());
      }).toThrow('useInvestorContext must be used within an InvestorProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Loading States', () => {
    it('should start with loading state true', () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should set loading to false after successful fetch', async () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isLoading).toBe(false);
    });

    it('should set loading to false after failed fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useInvestorContext(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.state.isLoading).toBe(false);
      });

      expect(result.current.state.isLoading).toBe(false);
    });
  });
});
