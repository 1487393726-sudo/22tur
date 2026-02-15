'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioProvider, usePortfolioContext } from '@/lib/contexts/PortfolioContext';
import { PremiumFeatureGate } from '@/components/investment/PremiumFeatureGate';
import { PortfolioOverviewCard } from '@/components/investment/PortfolioOverviewCard';
import { InvestmentDetail, InvestmentRecord, ProjectDetail } from '@/components/investment/InvestmentDetail';
import { SuccessfulProjectsTable } from '@/components/investment/SuccessfulProjectsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * InvestorDashboard Component (Inner)
 * 
 * The main investor dashboard that displays portfolio overview, investment details,
 * and successful projects. This component is wrapped by PremiumFeatureGate to ensure
 * only investors can access it.
 * 
 * Implements requirements:
 * - 6.1, 6.2, 6.3: Display all investments with project name, amount, date, and stage
 * - 6.4, 6.5, 6.6: Portfolio overview with total invested, current value, and ROI
 * - 10.1, 10.2, 10.3, 10.4, 10.5: Successful projects table with filtering
 * 
 * @returns {JSX.Element} Rendered investor dashboard
 */
function InvestorDashboardInner(): JSX.Element {
  const router = useRouter();
  const { state, actions } = usePortfolioContext();
  const [expandedInvestments, setExpandedInvestments] = useState<Set<string>>(new Set());
  const [investmentDetails, setInvestmentDetails] = useState<Map<string, { investment: InvestmentRecord; project: ProjectDetail }>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Fetch portfolio data on mount
  useEffect(() => {
    actions.fetchPortfolio();
  }, [actions]);

  // Toggle investment detail expansion
  const toggleInvestmentExpansion = async (investmentId: string) => {
    const newExpanded = new Set(expandedInvestments);
    
    if (newExpanded.has(investmentId)) {
      // Collapse
      newExpanded.delete(investmentId);
      setExpandedInvestments(newExpanded);
    } else {
      // Expand and fetch details if not already loaded
      newExpanded.add(investmentId);
      setExpandedInvestments(newExpanded);

      if (!investmentDetails.has(investmentId)) {
        await fetchInvestmentDetails(investmentId);
      }
    }
  };

  // Fetch detailed information for a specific investment
  const fetchInvestmentDetails = async (investmentId: string) => {
    setLoadingDetails(prev => new Set(prev).add(investmentId));

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
      
      // Convert date strings to Date objects
      const investment: InvestmentRecord = {
        ...data.investment,
        investmentDate: new Date(data.investment.investmentDate),
      };

      const project: ProjectDetail = {
        ...data.project,
        currentStage: data.project.currentStage ? {
          ...data.project.currentStage,
          startDate: new Date(data.project.currentStage.startDate),
          expectedEndDate: new Date(data.project.currentStage.expectedEndDate),
          actualEndDate: data.project.currentStage.actualEndDate 
            ? new Date(data.project.currentStage.actualEndDate) 
            : undefined,
        } : null,
        stageHistory: data.project.stageHistory.map((stage: any) => ({
          ...stage,
          startDate: new Date(stage.startDate),
          expectedEndDate: new Date(stage.expectedEndDate),
          actualEndDate: stage.actualEndDate ? new Date(stage.actualEndDate) : undefined,
        })),
      };

      setInvestmentDetails(prev => new Map(prev).set(investmentId, { investment, project }));
    } catch (error) {
      console.error('Error fetching investment details:', error);
      // Remove from expanded if fetch failed
      setExpandedInvestments(prev => {
        const newSet = new Set(prev);
        newSet.delete(investmentId);
        return newSet;
      });
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(investmentId);
        return newSet;
      });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await actions.refreshPortfolio();
  };

  // Render loading state
  if (state.isLoading && !state.summary) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Portfolio Overview Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-48 w-full" />
          </div>

          {/* Investment List Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (state.error && !state.summary) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-red-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Failed to Load Portfolio
                  </h3>
                  <p className="text-red-700 mb-4">{state.error}</p>
                  <Button onClick={handleRefresh} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render empty state (no investments)
  if (state.summary && state.investments.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Investor Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Track your investment portfolio and performance
                </p>
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Empty State */}
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Investments Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your portfolio by exploring available investment opportunities.
                </p>
                <Button onClick={() => router.push('/investment-portal')}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Explore Investments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Render main dashboard with data
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header - Requirements 6.1 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Investor Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Track your investment portfolio and performance
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={state.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Portfolio Overview Section - Requirements 6.4, 6.5, 6.6 */}
        {state.summary && (
          <div className="mb-8">
            <PortfolioOverviewCard
              totalInvested={state.summary.totalInvested}
              currentValue={state.summary.currentValue}
              totalReturn={state.summary.totalReturn}
              returnPercentage={state.summary.returnPercentage}
            />
          </div>
        )}

        {/* Investment List Section - Requirements 6.1, 6.2, 6.3 */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                My Investments
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Click on any investment to view detailed information
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.investments.map((investment) => {
                const isExpanded = expandedInvestments.has(investment.id);
                const details = investmentDetails.get(investment.id);
                const isLoadingDetail = loadingDetails.has(investment.id);

                return (
                  <div key={investment.id} className="border rounded-lg overflow-hidden">
                    {/* Investment Summary - Requirements 6.2, 6.3 */}
                    <button
                      onClick={() => toggleInvestmentExpansion(investment.id)}
                      className="w-full p-4 bg-card hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {investment.projectName}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              investment.status === 'active' 
                                ? 'bg-blue-100 text-blue-700'
                                : investment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Invested:</span>
                              <span className="ml-2 font-medium">
                                ${investment.amount.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current Value:</span>
                              <span className="ml-2 font-medium">
                                ${investment.currentValue.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Return:</span>
                              <span className={`ml-2 font-medium ${
                                investment.returnAmount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {investment.returnAmount >= 0 ? '+' : ''}
                                ${investment.returnAmount.toLocaleString()} 
                                ({investment.returnPercentage >= 0 ? '+' : ''}
                                {investment.returnPercentage.toFixed(2)}%)
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Date:</span>
                              <span className="ml-2 font-medium">
                                {new Date(investment.investmentDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Investment Detail - Requirements 7.1, 7.3, 7.4, 8.2, 8.4, 9.1, 9.2, 9.3 */}
                    {isExpanded && (
                      <div className="border-t bg-muted/20 p-6">
                        {isLoadingDetail ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                              <p className="text-muted-foreground">Loading investment details...</p>
                            </div>
                          </div>
                        ) : details ? (
                          <InvestmentDetail
                            investment={details.investment}
                            project={details.project}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600">Failed to load investment details</p>
                            <Button
                              onClick={() => fetchInvestmentDetails(investment.id)}
                              variant="outline"
                              size="sm"
                              className="mt-4"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Retry
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Successful Projects Section - Requirements 10.1, 10.2, 10.3, 10.4, 10.5 */}
        <div className="mb-8">
          <SuccessfulProjectsTable userId="current-user" />
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to Grow Your Portfolio?</h3>
              <p className="text-muted-foreground mb-6">
                Explore new investment opportunities and diversify your holdings
              </p>
              <Button onClick={() => router.push('/investment-portal')} size="lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Explore Investments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * InvestorDashboard Page Component (Outer)
 * 
 * Main page component for the investor dashboard at /investor-portal.
 * Wraps the dashboard with necessary providers and access control.
 * 
 * This component:
 * 1. Wraps content with PortfolioProvider for state management
 * 2. Wraps content with PremiumFeatureGate for access control
 * 3. Renders the InvestorDashboardInner component
 * 
 * Implements requirements:
 * - 2.1, 2.2: Premium feature access control
 * - 6.1-6.6: Portfolio display and calculations
 * - 10.1-10.5: Successful projects display
 * 
 * @returns {JSX.Element} Rendered investor dashboard page
 */
export default function InvestorDashboardPage(): JSX.Element {
  return (
    <PortfolioProvider>
      <PremiumFeatureGate showInvestmentCTA={true}>
        <InvestorDashboardInner />
      </PremiumFeatureGate>
    </PortfolioProvider>
  );
}
