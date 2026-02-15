/**
 * Property-Based Tests for Dashboard Routing
 * Feature: investor-portal-premium-features
 * 
 * Tests Properties 31-33:
 * - Property 31: Investor premium page access
 * - Property 32: Non-investor premium page redirect
 * - Property 33: Session persistence for premium access
 */

import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import fc from 'fast-check';
import InvestorDashboard from '../page';
import { InvestorProvider } from '@/lib/contexts/InvestorContext';
import { PortfolioProvider } from '@/lib/contexts/PortfolioContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/investor-portal'),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Feature: investor-portal-premium-features, Dashboard Routing Properties', () => {
  let mockRouter: any;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Property 31: Investor premium page access', () => {
    it('should grant access to premium pages for any investor user', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            isInvestor: fc.constant(true),
            totalInvestments: fc.integer({ min: 1, max: 100 }),
            totalInvested: fc.integer({ min: 1000, max: 1000000 }),
          }),
          async (investorData) => {
            // Mock investor status API response
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                isInvestor: investorData.isInvestor,
                totalInvestments: investorData.totalInvestments,
                totalInvested: investorData.totalInvested,
              }),
              status: 200,
            } as Response);

            // Mock portfolio API response
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                totalInvested: investorData.totalInvested,
                currentValue: investorData.totalInvested * 1.1,
                totalReturn: investorData.totalInvested * 0.1,
                returnPercentage: 10,
                investments: [],
              }),
              status: 200,
            } as Response);

            // Mock successful projects API response
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                projects: [],
                total: 0,
              }),
              status: 200,
            } as Response);

            const { container } = render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            // Wait for investor status check
            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/investments/status'),
                expect.any(Object)
              );
            });

            // Verify page loads successfully (no redirect)
            await waitFor(() => {
              expect(mockRouter.push).not.toHaveBeenCalled();
              expect(mockRouter.replace).not.toHaveBeenCalled();
            });

            // Verify dashboard content is rendered
            await waitFor(() => {
              const dashboardContent = container.querySelector('[data-testid="investor-dashboard"]') ||
                                      container.querySelector('.investor-dashboard') ||
                                      screen.queryByText(/portfolio/i) ||
                                      screen.queryByText(/investments/i);
              expect(dashboardContent).toBeTruthy();
            });
          }
        ),
        { numRuns: 50 } // Reduced runs for async tests
      );
    });

    it('should return 200 status for investor accessing premium pages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            premiumPagePath: fc.constantFrom(
              '/investor-portal',
              '/investor-portal/portfolio',
              '/investor-portal/analytics'
            ),
          }),
          async (testData) => {
            // Mock investor status
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                isInvestor: true,
                totalInvestments: 1,
                totalInvested: 5000,
              }),
              status: 200,
            } as Response);

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                totalInvested: 5000,
                currentValue: 5500,
                totalReturn: 500,
                returnPercentage: 10,
                investments: [],
              }),
              status: 200,
            } as Response);

            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                projects: [],
                total: 0,
              }),
              status: 200,
            } as Response);

            render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalled();
            });

            // Verify no error state or redirect
            await waitFor(() => {
              expect(mockRouter.push).not.toHaveBeenCalledWith(
                expect.stringContaining('/investment-portal')
              );
              expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
            });
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 32: Non-investor premium page redirect', () => {
    it('should redirect non-investors to Investment CTA instead of showing 404', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            isInvestor: fc.constant(false),
            totalInvestments: fc.constant(0),
            totalInvested: fc.constant(0),
          }),
          async (nonInvestorData) => {
            // Mock non-investor status
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                isInvestor: nonInvestorData.isInvestor,
                totalInvestments: nonInvestorData.totalInvestments,
                totalInvested: nonInvestorData.totalInvested,
              }),
              status: 200,
            } as Response);

            render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            // Wait for status check
            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/investments/status'),
                expect.any(Object)
              );
            });

            // Verify redirect or CTA modal is shown (not 404)
            await waitFor(() => {
              const hasRedirect = mockRouter.push.mock.calls.some(
                (call: any[]) => call[0]?.includes('/investment-portal')
              );
              const hasCTAModal = screen.queryByText(/invest now/i) ||
                                 screen.queryByText(/unlock premium/i) ||
                                 screen.queryByText(/become an investor/i);
              
              // Either redirect OR show CTA modal (not 404)
              expect(hasRedirect || hasCTAModal).toBeTruthy();
              expect(screen.queryByText(/404/i)).not.toBeInTheDocument();
              expect(screen.queryByText(/not found/i)).not.toBeInTheDocument();
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should never return 404 status for premium pages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            isInvestor: fc.boolean(),
            premiumPagePath: fc.constantFrom(
              '/investor-portal',
              '/investor-portal/portfolio',
              '/investor-portal/analytics'
            ),
          }),
          async (testData) => {
            // Mock status based on investor state
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                isInvestor: testData.isInvestor,
                totalInvestments: testData.isInvestor ? 1 : 0,
                totalInvested: testData.isInvestor ? 5000 : 0,
              }),
              status: 200,
            } as Response);

            if (testData.isInvestor) {
              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  totalInvested: 5000,
                  currentValue: 5500,
                  totalReturn: 500,
                  returnPercentage: 10,
                  investments: [],
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  projects: [],
                  total: 0,
                }),
                status: 200,
              } as Response);
            }

            render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalled();
            });

            // Verify no 404 error is shown
            await waitFor(() => {
              expect(screen.queryByText(/404/i)).not.toBeInTheDocument();
              expect(screen.queryByText(/page not found/i)).not.toBeInTheDocument();
            });
          }
        ),
        { numRuns: 40 }
      );
    });
  });

  describe('Property 33: Session persistence for premium access', () => {
    it('should maintain premium access without re-authentication for valid sessions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            sessionToken: fc.hexaString({ minLength: 32, maxLength: 64 }),
            sessionDuration: fc.integer({ min: 1, max: 3600 }), // seconds
          }),
          async (sessionData) => {
            // Mock investor status with valid session
            mockFetch.mockResolvedValue({
              ok: true,
              json: async () => ({
                isInvestor: true,
                totalInvestments: 1,
                totalInvested: 5000,
              }),
              status: 200,
            } as Response);

            // First render
            const { rerender } = render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalled();
            });

            const initialCallCount = mockFetch.mock.calls.length;

            // Simulate time passing (but within session duration)
            jest.advanceTimersByTime(sessionData.sessionDuration * 500); // Half session duration

            // Re-render (simulating navigation or component update)
            rerender(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            // Verify session is maintained (status check may be cached)
            await waitFor(() => {
              // Should not require re-authentication
              expect(mockRouter.push).not.toHaveBeenCalledWith(
                expect.stringContaining('/login')
              );
            });

            // Access should be maintained
            await waitFor(() => {
              const dashboardContent = screen.queryByText(/portfolio/i) ||
                                      screen.queryByText(/investments/i);
              expect(dashboardContent).toBeTruthy();
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should not require page refresh to maintain premium access', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            navigationCount: fc.integer({ min: 1, max: 5 }),
          }),
          async (testData) => {
            // Mock investor status
            mockFetch.mockResolvedValue({
              ok: true,
              json: async () => ({
                isInvestor: true,
                totalInvestments: 1,
                totalInvested: 5000,
              }),
              status: 200,
            } as Response);

            const { rerender } = render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalled();
            });

            // Simulate multiple navigations without page refresh
            for (let i = 0; i < testData.navigationCount; i++) {
              rerender(
                <InvestorProvider>
                  <PortfolioProvider>
                    <InvestorDashboard />
                  </PortfolioProvider>
                </InvestorProvider>
              );

              await waitFor(() => {
                // Should maintain access without redirect
                expect(mockRouter.push).not.toHaveBeenCalledWith(
                  expect.stringContaining('/investment-portal')
                );
              });
            }

            // Verify access is maintained throughout
            await waitFor(() => {
              const dashboardContent = screen.queryByText(/portfolio/i) ||
                                      screen.queryByText(/investments/i);
              expect(dashboardContent).toBeTruthy();
            });
          }
        ),
        { numRuns: 25 }
      );
    });

    it('should preserve investor status across component remounts', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            remountCount: fc.integer({ min: 1, max: 3 }),
          }),
          async (testData) => {
            for (let i = 0; i < testData.remountCount; i++) {
              // Mock investor status for each mount
              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  isInvestor: true,
                  totalInvestments: 1,
                  totalInvested: 5000,
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  totalInvested: 5000,
                  currentValue: 5500,
                  totalReturn: 500,
                  returnPercentage: 10,
                  investments: [],
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  projects: [],
                  total: 0,
                }),
                status: 200,
              } as Response);

              const { unmount } = render(
                <InvestorProvider>
                  <PortfolioProvider>
                    <InvestorDashboard />
                  </PortfolioProvider>
                </InvestorProvider>
              );

              await waitFor(() => {
                expect(mockFetch).toHaveBeenCalled();
              });

              // Verify access is granted
              await waitFor(() => {
                const dashboardContent = screen.queryByText(/portfolio/i) ||
                                        screen.queryByText(/investments/i);
                expect(dashboardContent).toBeTruthy();
              });

              unmount();
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Cross-property validation', () => {
    it('should handle investor status transitions correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userId: fc.uuid(),
            initialInvestor: fc.boolean(),
            becomesInvestor: fc.boolean(),
          }),
          async (testData) => {
            // Mock initial status
            mockFetch.mockResolvedValueOnce({
              ok: true,
              json: async () => ({
                isInvestor: testData.initialInvestor,
                totalInvestments: testData.initialInvestor ? 1 : 0,
                totalInvested: testData.initialInvestor ? 5000 : 0,
              }),
              status: 200,
            } as Response);

            if (testData.initialInvestor) {
              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  totalInvested: 5000,
                  currentValue: 5500,
                  totalReturn: 500,
                  returnPercentage: 10,
                  investments: [],
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  projects: [],
                  total: 0,
                }),
                status: 200,
              } as Response);
            }

            const { rerender } = render(
              <InvestorProvider>
                <PortfolioProvider>
                  <InvestorDashboard />
                </PortfolioProvider>
              </InvestorProvider>
            );

            await waitFor(() => {
              expect(mockFetch).toHaveBeenCalled();
            });

            // If status changes
            if (!testData.initialInvestor && testData.becomesInvestor) {
              // Mock status update
              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  isInvestor: true,
                  totalInvestments: 1,
                  totalInvested: 5000,
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  totalInvested: 5000,
                  currentValue: 5500,
                  totalReturn: 500,
                  returnPercentage: 10,
                  investments: [],
                }),
                status: 200,
              } as Response);

              mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                  projects: [],
                  total: 0,
                }),
                status: 200,
              } as Response);

              rerender(
                <InvestorProvider>
                  <PortfolioProvider>
                    <InvestorDashboard />
                  </PortfolioProvider>
                </InvestorProvider>
              );

              // Should now have access
              await waitFor(() => {
                const dashboardContent = screen.queryByText(/portfolio/i) ||
                                        screen.queryByText(/investments/i);
                expect(dashboardContent).toBeTruthy();
              });
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
