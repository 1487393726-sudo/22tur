'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Investment Summary
 * Represents a summary of a single investment in the portfolio
 */
export interface InvestmentSummary {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  investmentDate: string;
  currentValue: number;
  returnAmount: number;
  returnPercentage: number;
  status: 'active' | 'completed' | 'failed';
}

/**
 * Portfolio Summary
 * Aggregated portfolio metrics and investment list
 */
export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  investments: InvestmentSummary[];
}

/**
 * Portfolio Context State
 * Manages the cached portfolio data for the investor dashboard
 */
export interface PortfolioContextState {
  summary: PortfolioSummary | null;
  investments: InvestmentSummary[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

/**
 * Portfolio Context Actions
 * Provides methods to fetch and refresh portfolio data
 */
export interface PortfolioContextActions {
  fetchPortfolio: () => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  updateInvestment: (investmentId: string) => Promise<void>;
}

/**
 * Combined Portfolio Context Value
 */
export interface PortfolioContextValue {
  state: PortfolioContextState;
  actions: PortfolioContextActions;
}

// Create the context with undefined default value
const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

/**
 * Portfolio Context Provider Props
 */
export interface PortfolioProviderProps {
  children: ReactNode;
}

/**
 * PortfolioProvider Component
 * 
 * Provides global portfolio data management for the investor dashboard.
 * Caches portfolio data and provides methods to refresh when needed.
 * 
 * @example
 * ```tsx
 * <PortfolioProvider>
 *   <InvestorDashboard />
 * </PortfolioProvider>
 * ```
 */
export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const [state, setState] = useState<PortfolioContextState>({
    summary: null,
    investments: [],
    isLoading: false,
    lastUpdated: null,
    error: null,
  });

  /**
   * Fetch portfolio data from the API
   * Retrieves portfolio summary and investment list
   */
  const fetchPortfolio = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/investments/portfolio', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If unauthorized, user is not an investor
        if (response.status === 401 || response.status === 403) {
          setState({
            summary: null,
            investments: [],
            isLoading: false,
            lastUpdated: new Date(),
            error: 'Unauthorized access. Please ensure you are logged in as an investor.',
          });
          return;
        }

        throw new Error(`Failed to fetch portfolio: ${response.status}`);
      }

      const data: PortfolioSummary = await response.json();

      setState({
        summary: data,
        investments: data.investments || [],
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio data',
        lastUpdated: new Date(),
      }));
    }
  }, []);

  /**
   * Refresh portfolio data
   * Forces a fresh fetch of portfolio data from the API
   */
  const refreshPortfolio = useCallback(async () => {
    await fetchPortfolio();
  }, [fetchPortfolio]);

  /**
   * Update a specific investment
   * Fetches updated data for a single investment and updates the portfolio
   * 
   * @param investmentId - The ID of the investment to update
   */
  const updateInvestment = useCallback(async (investmentId: string) => {
    try {
      const response = await fetch(`/api/investments/${investmentId}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch investment details: ${response.status}`);
      }

      const data = await response.json();
      const updatedInvestment = data.investment;

      // Update the investment in the state
      setState(prev => {
        const updatedInvestments = prev.investments.map(inv =>
          inv.id === investmentId ? { ...inv, ...updatedInvestment } : inv
        );

        // Recalculate summary if we have investments
        let updatedSummary = prev.summary;
        if (updatedInvestments.length > 0) {
          const totalInvested = updatedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
          const currentValue = updatedInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
          const totalReturn = currentValue - totalInvested;
          const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

          updatedSummary = {
            totalInvested,
            currentValue,
            totalReturn,
            returnPercentage,
            investments: updatedInvestments,
          };
        }

        return {
          ...prev,
          investments: updatedInvestments,
          summary: updatedSummary,
          lastUpdated: new Date(),
        };
      });
    } catch (error) {
      console.error('Error updating investment:', error);
      // Don't update error state for individual investment updates
      // to avoid disrupting the entire portfolio view
    }
  }, []);

  const actions: PortfolioContextActions = {
    fetchPortfolio,
    refreshPortfolio,
    updateInvestment,
  };

  const value: PortfolioContextValue = {
    state,
    actions,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

/**
 * usePortfolioContext Hook
 * 
 * Access the PortfolioContext from any component within the PortfolioProvider.
 * Throws an error if used outside of PortfolioProvider.
 * 
 * @returns {PortfolioContextValue} The portfolio context value with state and actions
 * @throws {Error} If used outside of PortfolioProvider
 * 
 * @example
 * ```tsx
 * function PortfolioOverview() {
 *   const { state, actions } = usePortfolioContext();
 *   
 *   useEffect(() => {
 *     actions.fetchPortfolio();
 *   }, []);
 *   
 *   if (state.isLoading) return <div>Loading...</div>;
 *   if (state.error) return <div>Error: {state.error}</div>;
 *   
 *   return <div>Total Invested: ${state.summary?.totalInvested}</div>;
 * }
 * ```
 */
export function usePortfolioContext(): PortfolioContextValue {
  const context = useContext(PortfolioContext);
  
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider');
  }
  
  return context;
}
