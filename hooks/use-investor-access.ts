'use client';

import { useInvestorContext } from '@/lib/contexts/InvestorContext';

/**
 * Investor Access Hook Return Type
 * Provides investor status and access control methods
 */
export interface InvestorAccessHook {
  isInvestor: boolean;
  isLoading: boolean;
  checkAccess: () => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  markAsInvestor: () => void;
}

/**
 * useInvestorAccess Hook
 * 
 * Centralized hook for checking investor status and managing access control.
 * This hook consumes the InvestorContext and provides a simplified interface
 * for components that need to check investor access.
 * 
 * Features:
 * - Automatic status checking on mount
 * - Loading state management
 * - Error handling
 * - Status refresh mechanism
 * 
 * @returns {InvestorAccessHook} Object containing investor status and access methods
 * 
 * @example
 * ```tsx
 * function PremiumFeature() {
 *   const { isInvestor, isLoading, checkAccess } = useInvestorAccess();
 *   
 *   if (isLoading) {
 *     return <LoadingSpinner />;
 *   }
 *   
 *   if (!isInvestor) {
 *     return <InvestmentCTA />;
 *   }
 *   
 *   return <PremiumContent />;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * function InvestmentButton() {
 *   const { refreshStatus } = useInvestorAccess();
 *   
 *   const handleInvestment = async () => {
 *     await makeInvestment();
 *     await refreshStatus(); // Refresh status after investment
 *   };
 *   
 *   return <button onClick={handleInvestment}>Invest Now</button>;
 * }
 * ```
 */
export function useInvestorAccess(): InvestorAccessHook {
  const { state, actions } = useInvestorContext();

  /**
   * Check if user has investor access
   * Returns a promise that resolves to the current investor status
   * 
   * @returns {Promise<boolean>} Promise resolving to true if user is an investor
   */
  const checkAccess = async (): Promise<boolean> => {
    // If currently loading, wait for the check to complete
    if (state.isLoading) {
      await actions.checkStatus();
    }
    
    return state.isInvestor;
  };

  /**
   * Refresh investor status
   * Forces a fresh check of investor status from the API
   * 
   * @returns {Promise<void>} Promise that resolves when status is refreshed
   */
  const refreshStatus = async (): Promise<void> => {
    await actions.refreshStatus();
  };

  /**
   * Mark user as investor
   * Immediately updates the UI to reflect investor status
   * Used after successful investment for instant feedback
   * 
   * @returns {void}
   */
  const markAsInvestor = (): void => {
    actions.markAsInvestor();
  };

  return {
    isInvestor: state.isInvestor,
    isLoading: state.isLoading,
    checkAccess,
    refreshStatus,
    markAsInvestor,
  };
}
