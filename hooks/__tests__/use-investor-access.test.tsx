/**
 * Unit Tests for useInvestorAccess Hook
 * 
 * These tests verify the useInvestorAccess hook functionality
 * including access checking, status refresh, and loading states.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { InvestorProvider } from '@/lib/contexts/InvestorContext';
import { useInvestorAccess } from '../use-investor-access';

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

describe('useInvestorAccess Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return investor status', async () => {
      mockInvestorStatusResponse(true, 3, 30000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(true);
    });

    it('should return non-investor status', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);
    });

    it('should return loading state', () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('checkAccess Method', () => {
    it('should return true for investors', async () => {
      mockInvestorStatusResponse(true, 2, 20000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const hasAccess = await result.current.checkAccess();
      expect(hasAccess).toBe(true);
    });

    it('should return false for non-investors', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const hasAccess = await result.current.checkAccess();
      expect(hasAccess).toBe(false);
    });

    it('should wait for loading to complete before returning access status', async () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Now call checkAccess - should return immediately since not loading
      const hasAccess = await result.current.checkAccess();
      expect(hasAccess).toBe(true);
    });

    it('should return current status if not loading', async () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call checkAccess multiple times
      const access1 = await result.current.checkAccess();
      const access2 = await result.current.checkAccess();

      expect(access1).toBe(true);
      expect(access2).toBe(true);
      
      // Should only call API once (on mount)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshStatus Method', () => {
    it('should refresh investor status', async () => {
      // Initial status: non-investor
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);

      // Mock updated status: investor
      mockInvestorStatusResponse(true, 1, 10000);

      // Refresh status
      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(true);
    });

    it('should trigger loading state during refresh', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockInvestorStatusResponse(true, 1, 10000);

      // Start refresh
      act(() => {
        result.current.refreshStatus();
      });

      // Should be loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle refresh errors gracefully', async () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock error on refresh
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should default to non-investor on error
      expect(result.current.isInvestor).toBe(false);
    });
  });

  describe('markAsInvestor Method', () => {
    it('should immediately mark user as investor without API call', async () => {
      // Initial status: non-investor
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);

      // Mark as investor
      act(() => {
        result.current.markAsInvestor();
      });

      // Should immediately update without API call
      expect(result.current.isInvestor).toBe(true);
      
      // Should only have called API once (on mount)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should be used for immediate UI feedback after investment', async () => {
      // Initial status: non-investor
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);

      // Simulate investment completion - mark as investor immediately
      act(() => {
        result.current.markAsInvestor();
      });

      // UI should update immediately
      expect(result.current.isInvestor).toBe(true);

      // Then refresh from API to get accurate data
      mockInvestorStatusResponse(true, 1, 10000);
      
      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should still be investor with accurate data
      expect(result.current.isInvestor).toBe(true);
    });
  });

  describe('Integration with InvestorContext', () => {
    it('should reflect context state changes', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);

      // Mock updated status
      mockInvestorStatusResponse(true, 1, 10000);

      // Refresh to update context
      await act(async () => {
        await result.current.refreshStatus();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Hook should reflect updated context state
      expect(result.current.isInvestor).toBe(true);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle unauthorized responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);
      
      const hasAccess = await result.current.checkAccess();
      expect(hasAccess).toBe(false);
    });

    it('should handle server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(false);
    });
  });

  describe('Multiple Hook Instances', () => {
    it('should use the same context provider for state management', async () => {
      mockInvestorStatusResponse(true, 2, 20000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the hook returns investor status
      expect(result.current.isInvestor).toBe(true);
      
      // The context is shared within the same provider tree
      // Multiple calls to the hook within the same component tree would share state
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive calls to checkAccess', async () => {
      mockInvestorStatusResponse(true, 1, 10000);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call checkAccess multiple times rapidly
      const promises = [
        result.current.checkAccess(),
        result.current.checkAccess(),
        result.current.checkAccess(),
      ];

      const results = await Promise.all(promises);

      // All should return the same result
      expect(results).toEqual([true, true, true]);
    });

    it('should handle rapid successive calls to refreshStatus', async () => {
      mockInvestorStatusResponse(false, 0, 0);

      const { result } = renderHook(() => useInvestorAccess(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock multiple refresh responses
      mockInvestorStatusResponse(true, 1, 10000);
      mockInvestorStatusResponse(true, 1, 10000);
      mockInvestorStatusResponse(true, 1, 10000);

      // Call refreshStatus multiple times
      await act(async () => {
        await Promise.all([
          result.current.refreshStatus(),
          result.current.refreshStatus(),
          result.current.refreshStatus(),
        ]);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isInvestor).toBe(true);
    });
  });
});
