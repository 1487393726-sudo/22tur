'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

/**
 * Investor Context State
 * Manages the global state for investor status and access control
 */
export interface InvestorContextState {
  isInvestor: boolean;
  isLoading: boolean;
  investmentCount: number;
  totalInvested: number;
  lastChecked: Date | null;
}

/**
 * Investor Context Actions
 * Provides methods to check and refresh investor status
 */
export interface InvestorContextActions {
  checkStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  markAsInvestor: () => void;
}

/**
 * Combined Investor Context Value
 */
export interface InvestorContextValue {
  state: InvestorContextState;
  actions: InvestorContextActions;
}

// Create the context with undefined default value
const InvestorContext = createContext<InvestorContextValue | undefined>(undefined);

/**
 * Investor Context Provider Props
 */
export interface InvestorProviderProps {
  children: ReactNode;
}

/**
 * InvestorProvider Component
 * 
 * Provides global investor status management for the application.
 * Automatically checks investor status on mount and provides methods
 * to refresh status when needed.
 * 
 * @example
 * ```tsx
 * <InvestorProvider>
 *   <App />
 * </InvestorProvider>
 * ```
 */
export function InvestorProvider({ children }: InvestorProviderProps) {
  const [state, setState] = useState<InvestorContextState>({
    isInvestor: false,
    isLoading: true,
    investmentCount: 0,
    totalInvested: 0,
    lastChecked: null,
  });

  /**
   * Check investor status from the API
   * Fetches current investor status and updates the context state
   */
  const checkStatus = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('/api/investments/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If unauthorized, user is not logged in - set as non-investor
        if (response.status === 401) {
          setState({
            isInvestor: false,
            isLoading: false,
            investmentCount: 0,
            totalInvested: 0,
            lastChecked: new Date(),
          });
          return;
        }

        throw new Error(`Failed to check investor status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        isInvestor: data.isInvestor || false,
        isLoading: false,
        investmentCount: data.totalInvestments || 0,
        totalInvested: data.totalInvested || 0,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('Error checking investor status:', error);
      
      // On error, set to non-investor state but mark as loaded
      setState({
        isInvestor: false,
        isLoading: false,
        investmentCount: 0,
        totalInvested: 0,
        lastChecked: new Date(),
      });
    }
  }, []);

  /**
   * Refresh investor status
   * Forces a fresh check of investor status from the API
   */
  const refreshStatus = useCallback(async () => {
    await checkStatus();
  }, [checkStatus]);

  /**
   * Mark user as investor
   * Used after successful investment to immediately update UI
   * without waiting for API call
   */
  const markAsInvestor = useCallback(() => {
    setState(prev => ({
      ...prev,
      isInvestor: true,
      investmentCount: Math.max(1, prev.investmentCount),
      lastChecked: new Date(),
    }));
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const actions: InvestorContextActions = {
    checkStatus,
    refreshStatus,
    markAsInvestor,
  };

  const value: InvestorContextValue = {
    state,
    actions,
  };

  return (
    <InvestorContext.Provider value={value}>
      {children}
    </InvestorContext.Provider>
  );
}

/**
 * useInvestorContext Hook
 * 
 * Access the InvestorContext from any component within the InvestorProvider.
 * Throws an error if used outside of InvestorProvider.
 * 
 * @returns {InvestorContextValue} The investor context value with state and actions
 * @throws {Error} If used outside of InvestorProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, actions } = useInvestorContext();
 *   
 *   if (state.isLoading) return <div>Loading...</div>;
 *   if (!state.isInvestor) return <div>Not an investor</div>;
 *   
 *   return <div>Welcome, investor!</div>;
 * }
 * ```
 */
export function useInvestorContext(): InvestorContextValue {
  const context = useContext(InvestorContext);
  
  if (context === undefined) {
    throw new Error('useInvestorContext must be used within an InvestorProvider');
  }
  
  return context;
}
