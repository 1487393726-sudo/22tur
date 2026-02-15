/**
 * Property-Based Tests for PremiumFeatureGate and InvestmentCTAModal
 * 
 * These tests verify universal properties of the gating behavior
 * using property-based testing with fast-check.
 * 
 * Feature: investor-portal-premium-features
 * 
 * Properties tested:
 * - Property 5: Premium feature click triggers CTA modal
 * - Property 6: CTA navigation behavior
 * - Property 7: CTA modal dismissal
 */

import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import { PremiumFeatureGate } from '../PremiumFeatureGate';
import { InvestmentCTAModal } from '../InvestmentCTAModal';
import { useInvestorAccess } from '@/hooks/use-investor-access';

// Mock the useInvestorAccess hook
jest.mock('@/hooks/use-investor-access');

const mockUseInvestorAccess = useInvestorAccess as jest.MockedFunction<typeof useInvestorAccess>;

describe('Feature: investor-portal-premium-features, Property 5: Premium feature click triggers CTA modal', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 3.1**
   * 
   * Property 5: Premium feature click triggers CTA modal
   * For any non-investor user, clicking on any premium feature component 
   * should trigger the display of the Investment CTA modal.
   * 
   * This test verifies that:
   * 1. Non-investors see a clickable trigger instead of premium content
   * 2. Clicking the trigger opens the Investment CTA modal
   * 3. The modal displays with all required content
   */
  it('should trigger CTA modal when non-investor clicks on any premium feature', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Premium Dashboard',
          'Investment Analytics',
          'Portfolio Tracker',
          'Financial Reports',
          'Team Insights'
        ),
        async (premiumFeatureName) => {
          // Mock non-investor status
          mockUseInvestorAccess.mockReturnValue({
            isInvestor: false,
            isLoading: false,
            checkAccess: jest.fn(),
            refreshStatus: jest.fn(),
          });

          // Render PremiumFeatureGate with showInvestmentCTA enabled
          const { unmount } = render(
            <PremiumFeatureGate showInvestmentCTA={true}>
              <div>{premiumFeatureName}</div>
            </PremiumFeatureGate>
          );

          try {
            // Verify premium content is not visible
            expect(screen.queryByText(premiumFeatureName)).not.toBeInTheDocument();

            // Find and click the trigger
            const trigger = screen.getByRole('button', { name: 'Access premium feature' });
            expect(trigger).toBeInTheDocument();
            
            fireEvent.click(trigger);

            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
            });

            // Verify modal content is displayed
            expect(screen.getByText(/Become an investor to unlock exclusive features/)).toBeInTheDocument();
            expect(screen.getByText(/Portfolio Tracking/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Invest Now' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Maybe Later' })).toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Additional test: Verify keyboard interaction triggers modal
   * 
   * This test verifies that keyboard users can also trigger the modal
   * using Enter or Space keys for accessibility.
   */
  it('should trigger CTA modal when non-investor uses keyboard on premium feature', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          featureName: fc.constantFrom('Dashboard', 'Analytics', 'Reports'),
          keyPress: fc.constantFrom('Enter', ' '),
        }),
        async (scenario) => {
          // Mock non-investor status
          mockUseInvestorAccess.mockReturnValue({
            isInvestor: false,
            isLoading: false,
            checkAccess: jest.fn(),
            refreshStatus: jest.fn(),
          });

          const { unmount } = render(
            <PremiumFeatureGate showInvestmentCTA={true}>
              <div>{scenario.featureName}</div>
            </PremiumFeatureGate>
          );

          try {
            // Find and use keyboard on the trigger
            const trigger = screen.getByRole('button', { name: 'Access premium feature' });
            fireEvent.keyDown(trigger, { key: scenario.keyPress });

            // Wait for modal to appear
            await waitFor(() => {
              expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Negative test: Verify investors don't see the trigger
   * 
   * This test verifies that investors see the premium content directly
   * without any trigger or modal.
   */
  it('should not show CTA trigger for investors accessing premium features', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          featureName: fc.constantFrom('Dashboard', 'Analytics', 'Portfolio', 'Reports'),
          investmentCount: fc.integer({ min: 1, max: 100 }),
        }),
        async (scenario) => {
          // Mock investor status
          mockUseInvestorAccess.mockReturnValue({
            isInvestor: true,
            isLoading: false,
            checkAccess: jest.fn(),
            refreshStatus: jest.fn(),
          });

          const { unmount } = render(
            <PremiumFeatureGate showInvestmentCTA={true}>
              <div>{scenario.featureName}</div>
            </PremiumFeatureGate>
          );

          try {
            // Verify premium content is visible
            expect(screen.getByText(scenario.featureName)).toBeInTheDocument();

            // Verify no trigger exists
            expect(screen.queryByRole('button', { name: 'Access premium feature' })).not.toBeInTheDocument();
            
            // Verify modal is not displayed
            expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Feature: investor-portal-premium-features, Property 6: CTA navigation behavior', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 3.3**
   * 
   * Property 6: CTA navigation behavior
   * For any non-investor user, clicking the "Invest Now" button in the 
   * Investment CTA modal should navigate to the Investment Portal page.
   * 
   * This test verifies that:
   * 1. The "Invest Now" button is present in the modal
   * 2. Clicking the button triggers the navigation callback
   * 3. The navigation behavior is consistent across all scenarios
   */
  it('should navigate to investment portal when "Invest Now" is clicked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async (userId) => {
          const mockOnInvest = jest.fn();
          const mockOnClose = jest.fn();

          // Render modal in open state
          const { unmount } = render(
            <InvestmentCTAModal
              isOpen={true}
              onClose={mockOnClose}
              onInvest={mockOnInvest}
            />
          );

          try {
            // Verify modal is displayed
            expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();

            // Find and click "Invest Now" button
            const investButton = screen.getByRole('button', { name: 'Invest Now' });
            expect(investButton).toBeInTheDocument();
            expect(investButton).not.toBeDisabled();

            fireEvent.click(investButton);

            // Verify navigation callback was triggered
            expect(mockOnInvest).toHaveBeenCalledTimes(1);
            
            // Verify close callback was not triggered
            expect(mockOnClose).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Test: Verify default navigation behavior without custom callback
   * 
   * This test verifies that when no custom onInvest callback is provided,
   * the button still exists and is clickable (actual navigation tested in E2E).
   */
  it('should have functional "Invest Now" button even without custom callback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async () => {
          const mockOnClose = jest.fn();

          // Render modal without custom onInvest
          const { unmount } = render(
            <InvestmentCTAModal
              isOpen={true}
              onClose={mockOnClose}
            />
          );

          try {
            // Find "Invest Now" button
            const investButton = screen.getByRole('button', { name: 'Invest Now' });
            
            // Verify button is functional
            expect(investButton).toBeInTheDocument();
            expect(investButton).not.toBeDisabled();
            
            // Button should be clickable (actual navigation is tested in E2E)
            fireEvent.click(investButton);
            
            // Close should not be called when clicking Invest Now
            expect(mockOnClose).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Feature: investor-portal-premium-features, Property 7: CTA modal dismissal', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * **Validates: Requirements 3.4**
   * 
   * Property 7: CTA modal dismissal
   * For any user viewing the Investment CTA modal, they should be able to 
   * dismiss the modal and return to their current page state.
   * 
   * This test verifies that:
   * 1. The modal can be dismissed via "Maybe Later" button
   * 2. Dismissal triggers the onClose callback
   */
  it('should dismiss modal when "Maybe Later" button is clicked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async () => {
          const mockOnClose = jest.fn();
          const mockOnInvest = jest.fn();

          const { unmount } = render(
            <InvestmentCTAModal
              isOpen={true}
              onClose={mockOnClose}
              onInvest={mockOnInvest}
            />
          );

          try {
            // Find and click "Maybe Later" button
            const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
            expect(maybeLaterButton).toBeInTheDocument();
            
            fireEvent.click(maybeLaterButton);

            // Verify close callback was triggered
            expect(mockOnClose).toHaveBeenCalledTimes(1);
            
            // Verify invest callback was not triggered
            expect(mockOnInvest).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Test: Verify modal dismissal via close button
   */
  it('should dismiss modal when close button is clicked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async () => {
          const mockOnClose = jest.fn();

          const { unmount } = render(
            <InvestmentCTAModal
              isOpen={true}
              onClose={mockOnClose}
            />
          );

          try {
            // Find and click close button
            const closeButton = screen.getByRole('button', { name: 'Close modal' });
            expect(closeButton).toBeInTheDocument();
            
            fireEvent.click(closeButton);

            // Verify close callback was triggered
            expect(mockOnClose).toHaveBeenCalledTimes(1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Test: Verify modal dismissal via background overlay
   */
  it('should dismiss modal when background overlay is clicked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async () => {
          const mockOnClose = jest.fn();

          const { container, unmount } = render(
            <InvestmentCTAModal
              isOpen={true}
              onClose={mockOnClose}
            />
          );

          try {
            // Find and click background overlay
            const overlay = container.querySelector('.bg-gray-500.bg-opacity-75');
            expect(overlay).toBeInTheDocument();
            
            if (overlay) {
              fireEvent.click(overlay);
            }

            // Verify close callback was triggered
            expect(mockOnClose).toHaveBeenCalledTimes(1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Feature: investor-portal-premium-features, Edge Cases and Invariants', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  /**
   * Invariant: Modal should never be visible when isOpen is false
   */
  it('should never display modal content when isOpen is false', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        async () => {
          const mockOnClose = jest.fn();

          const { container, unmount } = render(
            <InvestmentCTAModal
              isOpen={false}
              onClose={mockOnClose}
            />
          );

          try {
            // Verify modal is not rendered
            expect(container.firstChild).toBeNull();
            expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Invariant: Premium content should never be visible to non-investors
   */
  it('should never show premium content to non-investors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          featureName: fc.constantFrom('Dashboard', 'Analytics', 'Portfolio'),
          showInvestmentCTA: fc.boolean(),
        }),
        async (scenario) => {
          // Mock non-investor status
          mockUseInvestorAccess.mockReturnValue({
            isInvestor: false,
            isLoading: false,
            checkAccess: jest.fn(),
            refreshStatus: jest.fn(),
          });

          const { unmount } = render(
            <PremiumFeatureGate showInvestmentCTA={scenario.showInvestmentCTA}>
              <div>{scenario.featureName}</div>
            </PremiumFeatureGate>
          );

          try {
            // Verify premium content is never visible
            expect(screen.queryByText(scenario.featureName)).not.toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Invariant: Premium content should always be visible to investors
   */
  it('should always show premium content to investors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          featureName: fc.constantFrom('Dashboard', 'Analytics', 'Portfolio'),
          showInvestmentCTA: fc.boolean(),
        }),
        async (scenario) => {
          // Mock investor status
          mockUseInvestorAccess.mockReturnValue({
            isInvestor: true,
            isLoading: false,
            checkAccess: jest.fn(),
            refreshStatus: jest.fn(),
          });

          const { unmount } = render(
            <PremiumFeatureGate showInvestmentCTA={scenario.showInvestmentCTA}>
              <div>{scenario.featureName}</div>
            </PremiumFeatureGate>
          );

          try {
            // Verify premium content is always visible
            expect(screen.getByText(scenario.featureName)).toBeInTheDocument();
            
            // Verify no modal trigger exists
            expect(screen.queryByRole('button', { name: 'Access premium feature' })).not.toBeInTheDocument();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
