import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

/**
 * Financial performance data structure
 * As defined in the design document section 8
 */
export interface FinancialPerformance {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
  revenueBreakdown: { source: string; amount: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  projectedReturn?: number; // For ongoing projects
  isOngoing?: boolean;
}

/**
 * FinancialPerformanceCard component props
 */
export interface FinancialPerformanceCardProps {
  financialData: FinancialPerformance;
  investmentAmount?: number; // User's investment amount for calculating personal returns
}

/**
 * FinancialPerformanceCard Component
 * 
 * Displays financial performance metrics for a project investment.
 * Implements requirements 8.1, 8.2, 8.3, 8.4 from the design specification.
 * 
 * Display Elements:
 * - Profit/loss in currency and percentage (Requirement 8.1, 8.2)
 * - Revenue and expense breakdowns (Requirement 8.4)
 * - Charts for financial visualization (Requirement 8.4)
 * - Projected returns for ongoing projects (Requirement 8.3)
 * 
 * @param {FinancialPerformanceCardProps} props - Component props
 * @returns {JSX.Element} Rendered financial performance card
 */
export function FinancialPerformanceCard({
  financialData,
  investmentAmount,
}: FinancialPerformanceCardProps): JSX.Element {
  const {
    revenue,
    expenses,
    profit,
    profitMargin,
    revenueBreakdown,
    expenseBreakdown,
    projectedReturn,
    isOngoing = false,
  } = financialData;

  // Determine if profit is positive or negative
  const isProfit = profit >= 0;

  // Format currency values - Requirement 8.2
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  // Format percentage values - Requirement 8.2
  const formatPercentage = (percentage: number): string => {
    return `${Math.abs(percentage).toFixed(2)}%`;
  };

  // Profit/loss styling configuration
  const profitConfig = isProfit
    ? {
        textColor: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: <TrendingUp className="h-5 w-5" />,
        arrow: <ArrowUpRight className="h-4 w-4" />,
        label: "Profit",
      }
    : {
        textColor: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: <TrendingDown className="h-5 w-5" />,
        arrow: <ArrowDownRight className="h-4 w-4" />,
        label: "Loss",
      };

  // Prepare data for breakdown bar chart - Requirement 8.4
  const breakdownChartData = [
    {
      category: 'Revenue',
      amount: revenue,
      fill: 'hsl(142, 76%, 36%)', // green
    },
    {
      category: 'Expenses',
      amount: expenses,
      fill: 'hsl(0, 84%, 60%)', // red
    },
  ];

  // Chart configuration for revenue breakdown
  const revenueChartConfig = revenueBreakdown.reduce((acc, item, index) => {
    const colors = [
      'hsl(142, 76%, 36%)',
      'hsl(142, 70%, 45%)',
      'hsl(142, 65%, 55%)',
      'hsl(142, 60%, 65%)',
      'hsl(142, 55%, 75%)',
    ];
    acc[item.source] = {
      label: item.source,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  // Chart configuration for expense breakdown
  const expenseChartConfig = expenseBreakdown.reduce((acc, item, index) => {
    const colors = [
      'hsl(0, 84%, 60%)',
      'hsl(0, 80%, 65%)',
      'hsl(0, 75%, 70%)',
      'hsl(0, 70%, 75%)',
      'hsl(0, 65%, 80%)',
    ];
    acc[item.category] = {
      label: item.category,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  // Prepare pie chart data
  const revenuePieData = revenueBreakdown.map((item, index) => ({
    name: item.source,
    value: item.amount,
    fill: Object.values(revenueChartConfig)[index]?.color || 'hsl(142, 76%, 36%)',
  }));

  const expensePieData = expenseBreakdown.map((item, index) => ({
    name: item.category,
    value: item.amount,
    fill: Object.values(expenseChartConfig)[index]?.color || 'hsl(0, 84%, 60%)',
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Financial Performance</CardTitle>
          {isOngoing && (
            <Badge variant="secondary" className="ml-2">
              Ongoing Project
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Financial Metrics - Requirements 8.1, 8.2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Revenue</span>
              <span className="font-bold text-xl text-green-900">
                {formatCurrency(revenue)}
              </span>
            </div>
          </div>

          {/* Expenses */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="p-2 rounded-lg bg-red-100">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">Expenses</span>
              <span className="font-bold text-xl text-red-900">
                {formatCurrency(expenses)}
              </span>
            </div>
          </div>

          {/* Profit/Loss - Requirement 8.1, 8.2 */}
          <div className={`flex items-start gap-3 p-4 rounded-lg ${profitConfig.bgColor} border ${profitConfig.borderColor}`}>
            <div className={`p-2 rounded-lg ${isProfit ? 'bg-green-100' : 'bg-red-100'}`}>
              {profitConfig.icon}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm text-muted-foreground">{profitConfig.label}</span>
              <span className={`font-bold text-xl ${profitConfig.textColor}`}>
                {isProfit ? '+' : '-'}{formatCurrency(profit)}
              </span>
            </div>
          </div>
        </div>

        {/* Profit Margin Display - Requirement 8.2 */}
        <div className={`p-4 rounded-lg ${profitConfig.bgColor} border ${profitConfig.borderColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profitConfig.arrow}
              <span className="text-sm font-medium text-muted-foreground">
                Profit Margin
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${profitConfig.textColor}`}>
                {isProfit ? '+' : '-'}{formatPercentage(profitMargin)}
              </span>
            </div>
          </div>
        </div>

        {/* Projected Returns for Ongoing Projects - Requirement 8.3 */}
        {isOngoing && projectedReturn !== undefined && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">
                  Projected Return
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-blue-900">
                  {formatPercentage(projectedReturn)}
                </span>
                {investmentAmount && (
                  <span className="text-sm text-muted-foreground">
                    Est. {formatCurrency((investmentAmount * projectedReturn) / 100)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on current performance metrics and market conditions
            </p>
          </div>
        )}

        {/* Revenue vs Expenses Chart - Requirement 8.4 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Revenue vs Expenses</h3>
          <ChartContainer
            config={{
              revenue: { label: 'Revenue', color: 'hsl(142, 76%, 36%)' },
              expenses: { label: 'Expenses', color: 'hsl(0, 84%, 60%)' },
            }}
            className="h-[200px] w-full"
          >
            <BarChart data={breakdownChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {breakdownChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* Revenue Breakdown - Requirement 8.4 */}
        {revenueBreakdown.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Revenue Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="h-[200px]">
                <ChartContainer config={revenueChartConfig} className="h-full w-full">
                  <RechartsPieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                    <Pie
                      data={revenuePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => `${entry.name}: ${formatPercentage((entry.value / revenue) * 100)}`}
                    />
                  </RechartsPieChart>
                </ChartContainer>
              </div>

              {/* List View */}
              <div className="space-y-2">
                {revenueBreakdown.map((item, index) => {
                  const percentage = (item.amount / revenue) * 100;
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-green-50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: revenuePieData[index]?.fill }}
                        />
                        <span className="text-sm font-medium">{item.source}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(percentage)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Expense Breakdown - Requirement 8.4 */}
        {expenseBreakdown.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Expense Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pie Chart */}
              <div className="h-[200px]">
                <ChartContainer config={expenseChartConfig} className="h-full w-full">
                  <RechartsPieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                    <Pie
                      data={expensePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => `${entry.name}: ${formatPercentage((entry.value / expenses) * 100)}`}
                    />
                  </RechartsPieChart>
                </ChartContainer>
              </div>

              {/* List View */}
              <div className="space-y-2">
                {expenseBreakdown.map((item, index) => {
                  const percentage = (item.amount / expenses) * 100;
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-red-50">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: expensePieData[index]?.fill }}
                        />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercentage(percentage)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {isProfit ? (
              <>
                This project has generated a profit of{' '}
                <span className="font-semibold text-green-600">
                  {formatCurrency(profit)}
                </span>
                {' '}with a {formatPercentage(profitMargin)} profit margin.
              </>
            ) : (
              <>
                This project has incurred a loss of{' '}
                <span className="font-semibold text-red-600">
                  {formatCurrency(profit)}
                </span>
                {' '}with a {formatPercentage(profitMargin)} loss margin.
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
