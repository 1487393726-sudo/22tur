import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import {
  DevelopmentStageTimeline,
  DevelopmentStage,
} from "./DevelopmentStageTimeline";
import {
  FinancialPerformanceCard,
  FinancialPerformance,
} from "./FinancialPerformanceCard";
import { TeamMemberCard, TeamMember } from "./TeamMemberCard";

/**
 * Investment record information
 * As defined in the design document section 8
 */
export interface InvestmentRecord {
  id: string;
  projectId: string;
  userId: string;
  amount: number;
  investmentDate: Date;
  currentValue: number;
  returnAmount: number;
  returnPercentage: number;
  status: 'active' | 'completed' | 'failed';
}

/**
 * Project detail information
 * As defined in the design document section 8
 */
export interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  currentStage: DevelopmentStage | null;
  stageHistory: DevelopmentStage[];
  financialPerformance: FinancialPerformance;
  teamMembers: TeamMember[];
}

/**
 * InvestmentDetail component props
 */
export interface InvestmentDetailProps {
  investment: InvestmentRecord;
  project: ProjectDetail;
}

/**
 * InvestmentDetail Component
 * 
 * Displays comprehensive information about a single investment.
 * Integrates all sub-components: DevelopmentStageTimeline, FinancialPerformanceCard, and TeamMemberCard.
 * Implements requirements 6.2, 6.3, 7.1, 7.3, 7.4, 8.2, 8.4, 9.1, 9.2, 9.3 from the design specification.
 * 
 * Display Elements:
 * - Investment summary (amount, date, current value) - Requirements 6.2, 6.3
 * - Development stage timeline - Requirements 7.1, 7.3, 7.4
 * - Financial performance metrics - Requirements 8.2, 8.4
 * - Team member information - Requirements 9.1, 9.2, 9.3
 * - Expandable sections for detailed information
 * 
 * @param {InvestmentDetailProps} props - Component props
 * @returns {JSX.Element} Rendered investment detail component
 */
export function InvestmentDetail({
  investment,
  project,
}: InvestmentDetailProps): JSX.Element {
  // State for expandable sections
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const [isFinancialExpanded, setIsFinancialExpanded] = useState(true);
  const [isTeamExpanded, setIsTeamExpanded] = useState(false);

  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage values
  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  // Determine return status
  const isPositiveReturn = investment.returnAmount >= 0;
  const returnConfig = isPositiveReturn
    ? {
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      }
    : {
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };

  // Get status badge configuration
  const getStatusConfig = (status: InvestmentRecord['status']) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          label: 'Active',
          color: 'text-blue-600',
        };
      case 'completed':
        return {
          variant: 'default' as const,
          label: 'Completed',
          color: 'text-green-600',
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          label: 'Failed',
          color: 'text-red-600',
        };
    }
  };

  const statusConfig = getStatusConfig(investment.status);

  return (
    <div className="space-y-6">
      {/* Investment Summary Card - Requirements 6.2, 6.3 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold mb-2">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{project.category}</Badge>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>
            </div>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-3">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent>
          {/* Investment Metrics Grid - Requirements 6.2, 6.3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Investment Amount */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="p-2 rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Investment Amount</span>
                <span className="font-bold text-xl text-blue-900">
                  {formatCurrency(investment.amount)}
                </span>
              </div>
            </div>

            {/* Investment Date */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="p-2 rounded-lg bg-slate-100">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Investment Date</span>
                <span className="font-bold text-lg text-slate-900">
                  {formatDate(investment.investmentDate)}
                </span>
              </div>
            </div>

            {/* Current Value */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Current Value</span>
                <span className="font-bold text-xl text-purple-900">
                  {formatCurrency(investment.currentValue)}
                </span>
              </div>
            </div>

            {/* Return */}
            <div className={`flex items-start gap-3 p-4 rounded-lg ${returnConfig.bgColor} border ${returnConfig.borderColor}`}>
              <div className={`p-2 rounded-lg ${isPositiveReturn ? 'bg-green-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-5 w-5 ${returnConfig.textColor}`} />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Return</span>
                <span className={`font-bold text-xl ${returnConfig.textColor}`}>
                  {formatCurrency(investment.returnAmount)}
                </span>
                <span className={`text-sm font-medium ${returnConfig.textColor}`}>
                  {formatPercentage(investment.returnPercentage)}
                </span>
              </div>
            </div>
          </div>

          {/* Investment Summary Text */}
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700">
                You invested <span className="font-semibold">{formatCurrency(investment.amount)}</span> on{' '}
                <span className="font-semibold">{formatDate(investment.investmentDate)}</span>.
                {' '}Your investment is currently valued at{' '}
                <span className="font-semibold">{formatCurrency(investment.currentValue)}</span>,
                {' '}representing a{' '}
                <span className={`font-semibold ${returnConfig.textColor}`}>
                  {formatPercentage(investment.returnPercentage)}
                </span>
                {' '}{isPositiveReturn ? 'gain' : 'loss'}.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Stage Timeline Section - Requirements 7.1, 7.3, 7.4 */}
      <Collapsible
        open={isTimelineExpanded}
        onOpenChange={setIsTimelineExpanded}
      >
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
              >
                <CardTitle className="text-xl font-semibold">
                  Development Progress
                </CardTitle>
                {isTimelineExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <DevelopmentStageTimeline
                currentStage={project.currentStage}
                stageHistory={project.stageHistory}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Financial Performance Section - Requirements 8.2, 8.4 */}
      <Collapsible
        open={isFinancialExpanded}
        onOpenChange={setIsFinancialExpanded}
      >
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
              >
                <CardTitle className="text-xl font-semibold">
                  Financial Performance
                </CardTitle>
                {isFinancialExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <FinancialPerformanceCard
                financialData={project.financialPerformance}
                investmentAmount={investment.amount}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Team Members Section - Requirements 9.1, 9.2, 9.3 */}
      <Collapsible
        open={isTeamExpanded}
        onOpenChange={setIsTeamExpanded}
      >
        <Card>
          <CardHeader className="pb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
              >
                <CardTitle className="text-xl font-semibold">
                  Project Team
                </CardTitle>
                {isTeamExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <TeamMemberCard teamMembers={project.teamMembers} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
