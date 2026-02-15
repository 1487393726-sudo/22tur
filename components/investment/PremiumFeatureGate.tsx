'use client';

import { useState, ReactNode } from 'react';
import { useInvestorAccess } from '@/hooks/use-investor-access';
import { InvestmentCTAModal } from './InvestmentCTAModal';

/**
 * PremiumFeatureGate Props
 * 
 * Props for the PremiumFeatureGate component that controls access to premium features
 */
export interface PremiumFeatureGateProps {
  /**
   * Content to display when user is an investor
   */
  children: ReactNode;
  
  /**
   * Optional fallback content to display when user is not an investor
   * If not provided and showInvestmentCTA is false, nothing will be rendered
   */
  fallback?: ReactNode;
  
  /**
   * Whether to show the Investment CTA modal when non-investor tries to access
   * Default: true
   */
  showInvestmentCTA?: boolean;
}

/**
 * PremiumFeatureGate Component
 * 
 * Wrapper component that conditionally renders content based on investor status.
 * This component uses the useInvestorAccess hook to check if the user is an investor
 * and controls access to premium features accordingly.
 * 
 * Features:
 * - Conditional rendering based on investor status
 * - Support for fallback content
 * - Support for Investment CTA modal trigger
 * - Handles loading states appropriately
 * 
 * Requirements: 2.1, 2.2
 * 
 * @example
 * ```tsx
 * // Basic usage - shows CTA modal for non-investors
 * <PremiumFeatureGate>
 *   <PremiumContent />
 * </PremiumFeatureGate>
 * ```
 * 
 * @example
 * ```tsx
 * // With custom fallback content
 * <PremiumFeatureGate 
 *   fallback={<div>Please invest to access this feature</div>}
 *   showInvestmentCTA={false}
 * >
 *   <PremiumContent />
 * </PremiumFeatureGate>
 * ```
 * 
 * @example
 * ```tsx
 * // With CTA modal enabled
 * <PremiumFeatureGate showInvestmentCTA={true}>
 *   <InvestorDashboard />
 * </PremiumFeatureGate>
 * ```
 */
export function PremiumFeatureGate({
  children,
  fallback,
  showInvestmentCTA = true,
}: PremiumFeatureGateProps): JSX.Element | null {
  const { isInvestor, isLoading } = useInvestorAccess();
  const [showModal, setShowModal] = useState(false);

  // Show loading state while checking investor status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  // If user is an investor, render the premium content
  if (isInvestor) {
    return <>{children}</>;
  }

  // User is not an investor
  // If showInvestmentCTA is true, show the modal trigger
  if (showInvestmentCTA) {
    return (
      <>
        {/* Trigger area that opens the CTA modal */}
        <div
          onClick={() => setShowModal(true)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowModal(true);
            }
          }}
          aria-label="Access premium feature"
        >
          {fallback || (
            <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Premium Feature
                </h3>
                <p className="text-sm">
                  Click to learn how to unlock this feature
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Investment CTA Modal */}
        {showModal && (
          <InvestmentCTAModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  // If showInvestmentCTA is false, just show the fallback or nothing
  return fallback ? <>{fallback}</> : null;
}
