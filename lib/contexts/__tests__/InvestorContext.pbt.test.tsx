/**
 * Property-Based Tests for InvestorContext
 * 
 * These tests verify universal properties of the access control system
 * using property-based testing with fast-check.
 * 
 * Feature: investor-portal-premium-features
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import fc from 'fast-check';
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
function mockInvestorStatusResponse(isInvestor: boolean, totalInvestments: number, totalInvested: number) {
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

/**
 * Helper to mock unauthorized response
 */
function mockUnauthorizedResponse() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 401,
  });
}

describe('Feature: investor-portal-premium-features, Property 1: Non-investor access prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 2.1**
   * 
   * Property 1: Non-investor access prevention
   * For any non-investor user and any premium feature, attempting to access 
   * the premium feature should prevent access and display the Investment CTA modal.
   * 
   * This test verifies that users with zero investments are correctly identified
   * as non-investors and should be prevented from accessing premium features.
   */
  it('should classify users with zero investments as non-investors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          totalInvestments: fc.constant(0),
          totalInvested: fc.constant(0),
        }),
        async (user) => {
          // Mock API response for non-investor
          mockInvestorStatusResponse(false, user.totalInvestments, user.totalInvested);

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for the status check to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify non-investor status
          expect(result.current.state.isInvestor).toBe(false);
          expect(result.current.state.investmentCount).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

describe('Feature: investor-portal-premium-features, Property 2: Investor access grant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 2.2**
   * 
   * Property 2: Investor access grant
   * For any investor user and any premium feature, accessing the premium feature 
   * should grant immediate access without displaying prompts or modals.
   * 
   * This test verifies that users with at least one investment are correctly 
   * identified as investors and should be granted access to premium features.
   */
  it('should classify users with one or more investments as investors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          totalInvestments: fc.integer({ min: 1, max: 100 }),
          totalInvested: fc.integer({ min: 100, max: 1000000 }),
        }),
        async (user) => {
          // Mock API response for investor
          mockInvestorStatusResponse(true, user.totalInvestments, user.totalInvested);

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for the status check to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify investor status
          expect(result.current.state.isInvestor).toBe(true);
          expect(result.current.state.investmentCount).toBeGreaterThanOrEqual(1);
          expect(result.current.state.totalInvested).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

describe('Feature: investor-portal-premium-features, Property 3: Investment status transition updates permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 2.3, 5.1**
   * 
   * Property 3: Investment status transition updates permissions
   * For any user, when their investment status changes from non-investor to investor 
   * (by completing an investment), their access permissions should immediately update 
   * to grant premium access.
   * 
   * This test verifies that the markAsInvestor action immediately updates the user's
   * status without requiring a page refresh or API call.
   */
  it('should immediately update permissions when user transitions from non-investor to investor', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          initialInvestments: fc.constant(0),
          newInvestmentAmount: fc.integer({ min: 100, max: 100000 }),
        }),
        async (scenario) => {
          // Start as non-investor
          mockInvestorStatusResponse(false, scenario.initialInvestments, 0);

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for initial status check
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify initial non-investor status
          expect(result.current.state.isInvestor).toBe(false);
          expect(result.current.state.investmentCount).toBe(0);

          // Simulate investment completion by marking as investor
          await act(async () => {
            result.current.actions.markAsInvestor();
          });

          // Verify immediate status update (no API call needed)
          expect(result.current.state.isInvestor).toBe(true);
          expect(result.current.state.investmentCount).toBeGreaterThanOrEqual(1);
          
          // Verify lastChecked was updated
          expect(result.current.state.lastChecked).not.toBeNull();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  /**
   * Additional test: Verify refreshStatus updates permissions after investment
   * 
   * This test verifies that calling refreshStatus after an investment
   * fetches the updated status from the API.
   */
  it('should update permissions when refreshStatus is called after investment', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          newInvestmentAmount: fc.integer({ min: 100, max: 100000 }),
          totalInvestments: fc.integer({ min: 1, max: 10 }),
        }),
        async (scenario) => {
          // Start as non-investor
          mockInvestorStatusResponse(false, 0, 0);

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for initial status check
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify initial non-investor status
          expect(result.current.state.isInvestor).toBe(false);

          // Mock API response for investor status after investment
          mockInvestorStatusResponse(
            true,
            scenario.totalInvestments,
            scenario.newInvestmentAmount
          );

          // Refresh status to get updated investor status
          await act(async () => {
            await result.current.actions.refreshStatus();
          });

          // Wait for refresh to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify updated investor status
          expect(result.current.state.isInvestor).toBe(true);
          expect(result.current.state.investmentCount).toBeGreaterThanOrEqual(1);
          expect(result.current.state.totalInvested).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

describe('Feature: investor-portal-premium-features, Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test that unauthorized users are handled correctly
   */
  it('should handle unauthorized responses gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
        }),
        async () => {
          // Mock unauthorized response
          mockUnauthorizedResponse();

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for status check to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify non-investor status for unauthorized users
          expect(result.current.state.isInvestor).toBe(false);
          expect(result.current.state.investmentCount).toBe(0);
          expect(result.current.state.totalInvested).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);

  /**
   * Test that network errors are handled correctly
   */
  it('should handle network errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
        }),
        async () => {
          // Mock network error
          (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

          const { result } = renderHook(() => useInvestorContext(), {
            wrapper: createWrapper(),
          });

          // Wait for status check to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify safe fallback to non-investor status
          expect(result.current.state.isInvestor).toBe(false);
          expect(result.current.state.investmentCount).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
