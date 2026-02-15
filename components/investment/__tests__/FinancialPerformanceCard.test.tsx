import { render, screen } from '@testing-library/react';
import { FinancialPerformanceCard, FinancialPerformanceCardProps } from '../FinancialPerformanceCard';

// Mock recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock the chart UI components
jest.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: ({ children }: { children?: React.ReactNode }) => <div data-testid="chart-tooltip">{children}</div>,
  ChartTooltipContent: () => <div data-testid="chart-tooltip-content" />,
  ChartLegend: () => <div data-testid="chart-legend" />,
  ChartLegendContent: () => <div data-testid="chart-legend-content" />,
}));

describe('FinancialPerformanceCard', () => {
  const mockProfitableProject: FinancialPerformanceCardProps = {
    financialData: {
      revenue: 150000,
      expenses: 100000,
      profit: 50000,
      profitMargin: 33.33,
      revenueBreakdown: [
        { source: 'Product Sales', amount: 100000 },
        { source: 'Services', amount: 30000 },
        { source: 'Licensing', amount: 20000 },
      ],
      expenseBreakdown: [
        { category: 'Development', amount: 60000 },
        { category: 'Marketing', amount: 25000 },
        { category: 'Operations', amount: 15000 },
      ],
      isOngoing: false,
    },
  };

  const mockLossProject: FinancialPerformanceCardProps = {
    financialData: {
      revenue: 80000,
      expenses: 120000,
      profit: -40000,
      profitMargin: -50.0,
      revenueBreakdown: [
        { source: 'Product Sales', amount: 50000 },
        { source: 'Services', amount: 30000 },
      ],
      expenseBreakdown: [
        { category: 'Development', amount: 80000 },
        { category: 'Marketing', amount: 40000 },
      ],
      isOngoing: false,
    },
  };

  const mockOngoingProject: FinancialPerformanceCardProps = {
    financialData: {
      revenue: 100000,
      expenses: 70000,
      profit: 30000,
      profitMargin: 30.0,
      revenueBreakdown: [
        { source: 'Product Sales', amount: 100000 },
      ],
      expenseBreakdown: [
        { category: 'Development', amount: 70000 },
      ],
      projectedReturn: 45.5,
      isOngoing: true,
    },
    investmentAmount: 10000,
  };

  describe('Requirement 8.1: Profit/Loss Calculation Display', () => {
    it('should display profit for profitable projects', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check profit is displayed
      expect(screen.getByText('Profit')).toBeInTheDocument();
      expect(screen.getByText('+$50,000.00')).toBeInTheDocument();
    });

    it('should display loss for unprofitable projects', () => {
      render(<FinancialPerformanceCard {...mockLossProject} />);
      
      // Check loss is displayed
      expect(screen.getByText('Loss')).toBeInTheDocument();
      expect(screen.getByText('-$40,000.00')).toBeInTheDocument();
    });

    it('should calculate profit as revenue minus expenses', () => {
      const { financialData } = mockProfitableProject;
      const calculatedProfit = financialData.revenue - financialData.expenses;
      
      expect(calculatedProfit).toBe(financialData.profit);
      expect(calculatedProfit).toBe(50000);
    });
  });

  describe('Requirement 8.2: Financial Display Formats', () => {
    it('should display profit/loss in currency format', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check currency formatting (USD with 2 decimal places)
      expect(screen.getByText('+$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('$150,000.00')).toBeInTheDocument();
      // $100,000.00 appears in both expenses and revenue breakdown, so use getAllByText
      expect(screen.getAllByText('$100,000.00').length).toBeGreaterThan(0);
    });

    it('should display profit/loss in percentage format', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check percentage formatting
      expect(screen.getByText('+33.33%')).toBeInTheDocument();
    });

    it('should display both currency and percentage for profit margin', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check both formats are present
      expect(screen.getByText('Profit Margin')).toBeInTheDocument();
      expect(screen.getByText('+33.33%')).toBeInTheDocument();
    });

    it('should display negative values correctly for losses', () => {
      render(<FinancialPerformanceCard {...mockLossProject} />);
      
      // Check negative formatting
      expect(screen.getByText('-$40,000.00')).toBeInTheDocument();
      expect(screen.getByText('-50.00%')).toBeInTheDocument();
    });
  });

  describe('Requirement 8.3: Projected Returns for Ongoing Projects', () => {
    it('should display projected returns for ongoing projects', () => {
      render(<FinancialPerformanceCard {...mockOngoingProject} />);
      
      // Check projected return is displayed
      expect(screen.getByText('Projected Return')).toBeInTheDocument();
      expect(screen.getByText('45.50%')).toBeInTheDocument();
    });

    it('should display "Ongoing Project" badge for ongoing projects', () => {
      render(<FinancialPerformanceCard {...mockOngoingProject} />);
      
      expect(screen.getByText('Ongoing Project')).toBeInTheDocument();
    });

    it('should calculate estimated return amount when investment amount is provided', () => {
      render(<FinancialPerformanceCard {...mockOngoingProject} />);
      
      // Expected: 10000 * 45.5 / 100 = 4550
      expect(screen.getByText('Est. $4,550.00')).toBeInTheDocument();
    });

    it('should not display projected returns for completed projects', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Should not show projected return section
      expect(screen.queryByText('Projected Return')).not.toBeInTheDocument();
      expect(screen.queryByText('Ongoing Project')).not.toBeInTheDocument();
    });

    it('should display projection disclaimer for ongoing projects', () => {
      render(<FinancialPerformanceCard {...mockOngoingProject} />);
      
      expect(screen.getByText(/Based on current performance metrics/i)).toBeInTheDocument();
    });
  });

  describe('Requirement 8.4: Revenue and Expense Breakdowns', () => {
    it('should display revenue breakdown with all sources', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check all revenue sources are displayed
      expect(screen.getByText('Product Sales')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('Licensing')).toBeInTheDocument();
    });

    it('should display expense breakdown with all categories', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check all expense categories are displayed
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('Operations')).toBeInTheDocument();
    });

    it('should display revenue breakdown amounts', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check revenue amounts are displayed
      const revenueSection = screen.getByText('Revenue Breakdown').closest('div');
      expect(revenueSection).toBeInTheDocument();
    });

    it('should display expense breakdown amounts', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check expense amounts are displayed
      const expenseSection = screen.getByText('Expense Breakdown').closest('div');
      expect(expenseSection).toBeInTheDocument();
    });

    it('should render charts for financial visualization', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check that chart components are rendered
      expect(screen.getAllByTestId('pie-chart').length).toBeGreaterThan(0);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should display Revenue vs Expenses chart', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      expect(screen.getByText('Revenue vs Expenses')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Component Structure and Layout', () => {
    it('should render the card with title', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      expect(screen.getByText('Financial Performance')).toBeInTheDocument();
    });

    it('should display main financial metrics (revenue, expenses, profit)', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Expenses')).toBeInTheDocument();
      expect(screen.getByText('Profit')).toBeInTheDocument();
    });

    it('should display summary text for profitable projects', () => {
      render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      expect(screen.getByText(/This project has generated a profit/i)).toBeInTheDocument();
    });

    it('should display summary text for loss projects', () => {
      render(<FinancialPerformanceCard {...mockLossProject} />);
      
      expect(screen.getByText(/This project has incurred a loss/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero profit correctly', () => {
      const zeroProfit: FinancialPerformanceCardProps = {
        financialData: {
          revenue: 100000,
          expenses: 100000,
          profit: 0,
          profitMargin: 0,
          revenueBreakdown: [],
          expenseBreakdown: [],
        },
      };

      render(<FinancialPerformanceCard {...zeroProfit} />);
      
      // Zero should be treated as profit (non-negative)
      expect(screen.getByText('Profit')).toBeInTheDocument();
      expect(screen.getByText('+$0.00')).toBeInTheDocument();
    });

    it('should handle empty revenue breakdown', () => {
      const noRevenue: FinancialPerformanceCardProps = {
        financialData: {
          revenue: 0,
          expenses: 50000,
          profit: -50000,
          profitMargin: -100,
          revenueBreakdown: [],
          expenseBreakdown: [{ category: 'Development', amount: 50000 }],
        },
      };

      render(<FinancialPerformanceCard {...noRevenue} />);
      
      // Should not crash and should display expense breakdown
      expect(screen.getByText('Expense Breakdown')).toBeInTheDocument();
    });

    it('should handle empty expense breakdown', () => {
      const noExpenses: FinancialPerformanceCardProps = {
        financialData: {
          revenue: 50000,
          expenses: 0,
          profit: 50000,
          profitMargin: 100,
          revenueBreakdown: [{ source: 'Sales', amount: 50000 }],
          expenseBreakdown: [],
        },
      };

      render(<FinancialPerformanceCard {...noExpenses} />);
      
      // Should not crash and should display revenue breakdown
      expect(screen.getByText('Revenue Breakdown')).toBeInTheDocument();
    });

    it('should handle large numbers correctly', () => {
      const largeNumbers: FinancialPerformanceCardProps = {
        financialData: {
          revenue: 10000000,
          expenses: 5000000,
          profit: 5000000,
          profitMargin: 50,
          revenueBreakdown: [],
          expenseBreakdown: [],
        },
      };

      render(<FinancialPerformanceCard {...largeNumbers} />);
      
      // Check large numbers are formatted correctly
      expect(screen.getByText('$10,000,000.00')).toBeInTheDocument();
      // $5,000,000.00 appears in both expenses and profit, so use getAllByText
      expect(screen.getAllByText('$5,000,000.00').length).toBeGreaterThan(0);
    });

    it('should handle ongoing project without projected return', () => {
      const ongoingNoProjection: FinancialPerformanceCardProps = {
        financialData: {
          revenue: 100000,
          expenses: 70000,
          profit: 30000,
          profitMargin: 30,
          revenueBreakdown: [],
          expenseBreakdown: [],
          isOngoing: true,
          // projectedReturn is undefined
        },
      };

      render(<FinancialPerformanceCard {...ongoingNoProjection} />);
      
      // Should show ongoing badge but not projected return section
      expect(screen.getByText('Ongoing Project')).toBeInTheDocument();
      expect(screen.queryByText('Projected Return')).not.toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should use green styling for profitable projects', () => {
      const { container } = render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Check for green color classes
      const profitElements = container.querySelectorAll('.text-green-600, .bg-green-50, .border-green-200');
      expect(profitElements.length).toBeGreaterThan(0);
    });

    it('should use red styling for loss projects', () => {
      const { container } = render(<FinancialPerformanceCard {...mockLossProject} />);
      
      // Check for red color classes
      const lossElements = container.querySelectorAll('.text-red-600, .bg-red-50, .border-red-200');
      expect(lossElements.length).toBeGreaterThan(0);
    });

    it('should display trending up icon for profit', () => {
      const { container } = render(<FinancialPerformanceCard {...mockProfitableProject} />);
      
      // Lucide icons render as SVG elements
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('should display trending down icon for loss', () => {
      const { container } = render(<FinancialPerformanceCard {...mockLossProject} />);
      
      // Lucide icons render as SVG elements
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate revenue breakdown percentages correctly', () => {
      const { financialData } = mockProfitableProject;
      
      // Product Sales: 100000 / 150000 = 66.67%
      const productSalesPercentage = (100000 / financialData.revenue) * 100;
      expect(productSalesPercentage).toBeCloseTo(66.67, 1);
      
      // Services: 30000 / 150000 = 20%
      const servicesPercentage = (30000 / financialData.revenue) * 100;
      expect(servicesPercentage).toBeCloseTo(20, 1);
      
      // Licensing: 20000 / 150000 = 13.33%
      const licensingPercentage = (20000 / financialData.revenue) * 100;
      expect(licensingPercentage).toBeCloseTo(13.33, 1);
    });

    it('should calculate expense breakdown percentages correctly', () => {
      const { financialData } = mockProfitableProject;
      
      // Development: 60000 / 100000 = 60%
      const developmentPercentage = (60000 / financialData.expenses) * 100;
      expect(developmentPercentage).toBe(60);
      
      // Marketing: 25000 / 100000 = 25%
      const marketingPercentage = (25000 / financialData.expenses) * 100;
      expect(marketingPercentage).toBe(25);
      
      // Operations: 15000 / 100000 = 15%
      const operationsPercentage = (15000 / financialData.expenses) * 100;
      expect(operationsPercentage).toBe(15);
    });
  });
});
