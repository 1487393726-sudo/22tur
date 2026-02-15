/**
 * Property-Based Tests for PortfolioContext
 * 
 * These tests verify universal properties of the portfolio calculation system
 * using property-based testing with fast-check.
 * 
 * Feature: investor-portal-premium-features
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import fc from 'fast-check';
import { PortfolioProvider, usePortfolioContext, InvestmentSummary } from '../PortfolioContext';

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

/**
 * Helper to mock unauthorized response
 */
function mockUnauthorizedResponse() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 403,
  });
}

/**
 * Arbitrary generator for InvestmentSummary
 */
const investmentSummaryArbitrary = fc.record({
  id: fc.uuid(),
  projectId: fc.uuid(),
  projectName: fc.string({ minLength: 5, maxLength: 50 }),
  amount: fc.integer({ min: 100, max: 100000 }),
  investmentDate: fc.integer({ min: new Date('2020-01-01').getTime(), max: Date.now() })
    .map(timestamp => new Date(timestamp).toISOString()),
  currentValue: fc.integer({ min: 50, max: 150000 }),
  returnAmount: fc.integer({ min: -50000, max: 50000 }),
  returnPercentage: fc.float({ min: -100, max: 500 }),
  status: fc.constantFrom('active' as const, 'completed' as const, 'failed' as const),
});

describe('Feature: investor-portal-premium-features, Property 12: Portfolio completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 6.1**
   * 
   * Property 12: Portfolio completeness
   * For any investor, the Portfolio View should display all of their investment 
   * records without omitting any.
   * 
   * This test verifies that when the portfolio is fetched, all investments
   * returned by the API are present in the context state.
   */
  it('should display all investment records without omitting any', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(investmentSummaryArbitrary, { minLength: 1, maxLength: 20 }),
        async (investments) => {
          // Mock API response with all investments
          mockPortfolioResponse(investments);

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify all investments are present
          expect(result.current.state.investments).toHaveLength(investments.length);
          
          // Verify each investment is present by ID
          const investmentIds = result.current.state.investments.map(inv => inv.id);
          investments.forEach(investment => {
            expect(investmentIds).toContain(investment.id);
          });

          // Verify no duplicates
          const uniqueIds = new Set(investmentIds);
          expect(uniqueIds.size).toBe(investments.length);
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Additional test: Empty portfolio should display zero investments
   */
  it('should handle empty portfolios correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant([]),
        async (investments) => {
          // Mock API response with empty portfolio
          mockPortfolioResponse(investments);

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify empty portfolio
          expect(result.current.state.investments).toHaveLength(0);
          expect(result.current.state.summary?.totalInvested).toBe(0);
          expect(result.current.state.summary?.currentValue).toBe(0);
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});

describe('Feature: investor-portal-premium-features, Property 13: Investment record required fields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 6.2, 6.3**
   * 
   * Property 13: Investment record required fields
   * For any investment record displayed in the Portfolio View, it should show 
   * the project name, investment amount, investment date, and current development stage.
   * 
   * This test verifies that all investment records contain the required fields.
   */
  it('should include all required fields for each investment record', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(investmentSummaryArbitrary, { minLength: 1, maxLength: 20 }),
        async (investments) => {
          // Mock API response
          mockPortfolioResponse(investments);

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify each investment has required fields
          result.current.state.investments.forEach(investment => {
            // Requirement 6.2: project name, investment amount, investment date
            expect(investment.projectName).toBeDefined();
            expect(typeof investment.projectName).toBe('string');
            expect(investment.projectName.length).toBeGreaterThan(0);
            
            expect(investment.amount).toBeDefined();
            expect(typeof investment.amount).toBe('number');
            expect(investment.amount).toBeGreaterThan(0);
            
            expect(investment.investmentDate).toBeDefined();
            expect(typeof investment.investmentDate).toBe('string');
            
            // Requirement 6.3: current development stage (represented by status)
            expect(investment.status).toBeDefined();
            expect(['active', 'completed', 'failed']).toContain(investment.status);

            // Additional required fields
            expect(investment.id).toBeDefined();
            expect(investment.projectId).toBeDefined();
            expect(investment.currentValue).toBeDefined();
            expect(typeof investment.currentValue).toBe('number');
          });
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  /**
   * Test that investment records have valid data types
   */
  it('should have correct data types for all investment fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(investmentSummaryArbitrary, { minLength: 1, maxLength: 10 }),
        async (investments) => {
          // Mock API response
          mockPortfolioResponse(investments);

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify data types
          result.current.state.investments.forEach(investment => {
            expect(typeof investment.id).toBe('string');
            expect(typeof investment.projectId).toBe('string');
            expect(typeof investment.projectName).toBe('string');
            expect(typeof investment.amount).toBe('number');
            expect(typeof investment.investmentDate).toBe('string');
            expect(typeof investment.currentValue).toBe('number');
            expect(typeof investment.returnAmount).toBe('number');
            expect(typeof investment.returnPercentage).toBe('number');
            expect(typeof investment.status).toBe('string');
          });
        }
      ),
      { numRuns: 30 }
    );
  }, 60000);
});

describe('Feature: investor-portal-premium-features, Portfolio Calculation Properties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test that portfolio summary calculations are consistent with investments
   * 
   * This verifies that the summary totals match the sum of individual investments.
   */
  it('should calculate portfolio summary correctly from investments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(investmentSummaryArbitrary, { minLength: 1, maxLength: 20 }),
        async (investments) => {
          // Mock API response
          mockPortfolioResponse(investments);

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Calculate expected values
          const expectedTotalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
          const expectedCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
          const expectedTotalReturn = expectedCurrentValue - expectedTotalInvested;
          const expectedReturnPercentage = expectedTotalInvested > 0 
            ? (expectedTotalReturn / expectedTotalInvested) * 100 
            : 0;

          // Verify summary calculations
          expect(result.current.state.summary?.totalInvested).toBe(expectedTotalInvested);
          expect(result.current.state.summary?.currentValue).toBe(expectedCurrentValue);
          expect(result.current.state.summary?.totalReturn).toBe(expectedTotalReturn);
          
          // Allow small floating point differences for percentage
          if (result.current.state.summary?.returnPercentage !== undefined) {
            expect(Math.abs(
              result.current.state.summary.returnPercentage - expectedReturnPercentage
            )).toBeLessThan(0.01);
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});

describe('Feature: investor-portal-premium-features, Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test that unauthorized access is handled correctly
   */
  it('should handle unauthorized access gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null),
        async () => {
          // Mock unauthorized response
          mockUnauthorizedResponse();

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify error state
          expect(result.current.state.summary).toBeNull();
          expect(result.current.state.investments).toHaveLength(0);
          expect(result.current.state.error).toBeTruthy();
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
        fc.constant(null),
        async () => {
          // Mock network error
          (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

          const { result } = renderHook(() => usePortfolioContext(), {
            wrapper: createWrapper(),
          });

          // Fetch portfolio
          await act(async () => {
            await result.current.actions.fetchPortfolio();
          });

          // Wait for fetch to complete
          await waitFor(() => {
            expect(result.current.state.isLoading).toBe(false);
          }, { timeout: 3000 });

          // Verify error state
          expect(result.current.state.error).toBeTruthy();
          expect(result.current.state.summary).toBeNull();
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
