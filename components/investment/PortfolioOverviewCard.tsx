import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

/**
 * PortfolioOverviewCard component props
 * As defined in the design document section 7
 */
export interface PortfolioOverviewCardProps {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
}

/**
 * PortfolioOverviewCard Component
 * 
 * Displays aggregate portfolio metrics for an investor's dashboard.
 * Implements requirements 6.4, 6.5, 6.6 from the design specification.
 * 
 * Display Elements:
 * - Total invested amount (Requirement 6.4)
 * - Current portfolio value (Requirement 6.5)
 * - Total return amount and percentage (Requirement 6.6)
 * - Visual indicators for positive/negative returns
 * 
 * @param {PortfolioOverviewCardProps} props - Component props
 * @returns {JSX.Element} Rendered portfolio overview card
 */
export function PortfolioOverviewCard({
  totalInvested,
  currentValue,
  totalReturn,
  returnPercentage,
}: PortfolioOverviewCardProps): JSX.Element {
  // Determine if returns are positive or negative
  const isPositiveReturn = totalReturn >= 0;
  
  // Format currency values
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  // Format percentage values
  const formatPercentage = (percentage: number): string => {
    return `${Math.abs(percentage).toFixed(2)}%`;
  };

  // Return styling configuration
  const returnConfig = isPositiveReturn
    ? {
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <TrendingUp className="h-5 w-5" />,
        arrow: <ArrowUpRight className="h-4 w-4" />,
        label: "Gain",
      }
    : {
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <TrendingDown className="h-5 w-5" />,
        arrow: <ArrowDownRight className="h-4 w-4" />,
        label: "Loss",
      };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Portfolio Overview</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Grid of portfolio metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Invested - Requirement 6.4 */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className={`p-2 rounded-lg bg-blue-100`}>
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Total Invested</span>
              <span className="font-bold text-xl text-blue-900">
                {formatCurrency(totalInvested)}
              </span>
            </div>
          </div>

          {/* Current Value - Requirement 6.5 */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
            <div className={`p-2 rounded-lg bg-purple-100`}>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Current Value</span>
              <span className="font-bold text-xl text-purple-900">
                {formatCurrency(currentValue)}
              </span>
            </div>
          </div>

          {/* Total Return - Requirement 6.6 */}
          <div className={`flex items-start gap-3 p-4 rounded-lg ${returnConfig.bgColor} border ${returnConfig.borderColor}`}>
            <div className={`p-2 rounded-lg ${isPositiveReturn ? 'bg-green-100' : 'bg-red-100'}`}>
              {returnConfig.icon}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Total Return</span>
              <div className="flex items-baseline gap-2">
                <span className={`font-bold text-xl ${returnConfig.textColor}`}>
                  {isPositiveReturn ? '+' : '-'}{formatCurrency(totalReturn)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Return Percentage Display - Requirement 6.6 */}
        <div className={`p-4 rounded-lg ${returnConfig.bgColor} border ${returnConfig.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {returnConfig.arrow}
              <span className="text-sm font-medium text-muted-foreground">
                Return on Investment (ROI)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${returnConfig.textColor}`}>
                {isPositiveReturn ? '+' : '-'}{formatPercentage(returnPercentage)}
              </span>
              <span className={`text-sm font-medium ${returnConfig.textColor}`}>
                {returnConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Summary text */}
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {isPositiveReturn ? (
              <>
                Your portfolio has grown by{' '}
                <span className="font-semibold text-green-600">
                  {formatCurrency(totalReturn)}
                </span>
                {' '}since your initial investment.
              </>
            ) : (
              <>
                Your portfolio has decreased by{' '}
                <span className="font-semibold text-red-600">
                  {formatCurrency(totalReturn)}
                </span>
                {' '}since your initial investment.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
