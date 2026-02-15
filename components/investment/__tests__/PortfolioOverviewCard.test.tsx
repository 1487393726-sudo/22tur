/**
 * Unit Tests for PortfolioOverviewCard Component
 * 
 * These tests verify the display and calculation logic for the portfolio overview card.
 * 
 * Requirements: 6.4, 6.5, 6.6
 */

import { render, screen } from '@testing-library/react';
import { PortfolioOverviewCard } from '../PortfolioOverviewCard';

describe('PortfolioOverviewCard', () => {
  describe('Display Elements - Requirements 6.4, 6.5, 6.6', () => {
    it('should display total invested amount - Requirement 6.4', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });

    it('should display current value - Requirement 6.5', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('$60,000.00')).toBeInTheDocument();
    });

    it('should display total return amount and percentage - Requirement 6.6', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      expect(screen.getByText('Total Return')).toBeInTheDocument();
      expect(screen.getByText('+$10,000.00')).toBeInTheDocument();
      expect(screen.getByText('+20.00%')).toBeInTheDocument();
    });

    it('should display ROI label', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      expect(screen.getByText('Return on Investment (ROI)')).toBeInTheDocument();
    });

    it('should display portfolio overview title', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });
  });

  describe('Positive Returns Display', () => {
    it('should show positive indicators for gains', () => {
      const { container } = render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      // Check for positive return text
      expect(screen.getByText('+$10,000.00')).toBeInTheDocument();
      expect(screen.getByText('+20.00%')).toBeInTheDocument();
      expect(screen.getByText('Gain')).toBeInTheDocument();

      // Check for positive growth message
      expect(screen.getByText(/Your portfolio has grown by/i)).toBeInTheDocument();
      expect(screen.getByText(/since your initial investment/i)).toBeInTheDocument();
    });

    it('should format large positive returns correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={100000}
          currentValue={250000}
          totalReturn={150000}
          returnPercentage={150}
        />
      );

      expect(screen.getByText('+$150,000.00')).toBeInTheDocument();
      expect(screen.getByText('+150.00%')).toBeInTheDocument();
    });

    it('should format small positive returns correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={10000}
          currentValue={10500}
          totalReturn={500}
          returnPercentage={5}
        />
      );

      expect(screen.getByText('+$500.00')).toBeInTheDocument();
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
    });
  });

  describe('Negative Returns Display', () => {
    it('should show negative indicators for losses', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={40000}
          totalReturn={-10000}
          returnPercentage={-20}
        />
      );

      // Check for negative return text
      expect(screen.getByText('-$10,000.00')).toBeInTheDocument();
      expect(screen.getByText('-20.00%')).toBeInTheDocument();
      expect(screen.getByText('Loss')).toBeInTheDocument();

      // Check for negative loss message
      expect(screen.getByText(/Your portfolio has decreased by/i)).toBeInTheDocument();
      expect(screen.getByText(/since your initial investment/i)).toBeInTheDocument();
    });

    it('should format large negative returns correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={100000}
          currentValue={50000}
          totalReturn={-50000}
          returnPercentage={-50}
        />
      );

      expect(screen.getByText('-$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('-50.00%')).toBeInTheDocument();
    });

    it('should format small negative returns correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={10000}
          currentValue={9500}
          totalReturn={-500}
          returnPercentage={-5}
        />
      );

      expect(screen.getByText('-$500.00')).toBeInTheDocument();
      expect(screen.getByText('-5.00%')).toBeInTheDocument();
    });
  });

  describe('Zero Returns Display', () => {
    it('should handle zero returns correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={50000}
          totalReturn={0}
          returnPercentage={0}
        />
      );

      expect(screen.getByText('+$0.00')).toBeInTheDocument();
      expect(screen.getByText('+0.00%')).toBeInTheDocument();
      expect(screen.getByText('Gain')).toBeInTheDocument();
    });
  });

  describe('Currency Formatting', () => {
    it('should format currency with commas for thousands', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={1234567.89}
          currentValue={2345678.90}
          totalReturn={1111111.01}
          returnPercentage={89.87}
        />
      );

      expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
      expect(screen.getByText('$2,345,678.90')).toBeInTheDocument();
      expect(screen.getByText('+$1,111,111.01')).toBeInTheDocument();
    });

    it('should format currency with two decimal places', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={1000.5}
          currentValue={1500.75}
          totalReturn={500.25}
          returnPercentage={50.03}
        />
      );

      expect(screen.getByText('$1,000.50')).toBeInTheDocument();
      expect(screen.getByText('$1,500.75')).toBeInTheDocument();
      expect(screen.getByText('+$500.25')).toBeInTheDocument();
    });

    it('should handle zero values correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={0}
          currentValue={0}
          totalReturn={0}
          returnPercentage={0}
        />
      );

      // Multiple $0.00 values should be present (total invested, current value, total return)
      const zeroValues = screen.getAllByText('$0.00');
      expect(zeroValues.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Percentage Formatting', () => {
    it('should format percentage with two decimal places', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={10000}
          currentValue={12345.67}
          totalReturn={2345.67}
          returnPercentage={23.4567}
        />
      );

      expect(screen.getByText('+23.46%')).toBeInTheDocument();
    });

    it('should handle very small percentages', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={100000}
          currentValue={100010}
          totalReturn={10}
          returnPercentage={0.01}
        />
      );

      expect(screen.getByText('+0.01%')).toBeInTheDocument();
    });

    it('should handle very large percentages', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={1000}
          currentValue={10000}
          totalReturn={9000}
          returnPercentage={900}
        />
      );

      expect(screen.getByText('+900.00%')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large investment amounts', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={999999999.99}
          currentValue={1000000000.00}
          totalReturn={0.01}
          returnPercentage={0.000001}
        />
      );

      expect(screen.getByText('$999,999,999.99')).toBeInTheDocument();
      expect(screen.getByText('$1,000,000,000.00')).toBeInTheDocument();
    });

    it('should handle fractional cents correctly', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={10000.999}
          currentValue={12000.001}
          totalReturn={2000.002}
          returnPercentage={20.00002}
        />
      );

      // Should round to 2 decimal places
      expect(screen.getByText('$10,001.00')).toBeInTheDocument();
      expect(screen.getByText('$12,000.00')).toBeInTheDocument();
    });

    it('should handle negative total invested (edge case)', () => {
      // This shouldn't happen in practice, but test defensive rendering
      render(
        <PortfolioOverviewCard
          totalInvested={-1000}
          currentValue={500}
          totalReturn={1500}
          returnPercentage={-150}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });
  });

  describe('Visual Indicators', () => {
    it('should render with proper structure', () => {
      const { container } = render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      // Check that the component renders
      expect(container.querySelector('.overflow-hidden')).toBeInTheDocument();
    });

    it('should display all metric cards', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      // Should have 3 main metric cards
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Total Return')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper text content for screen readers', () => {
      render(
        <PortfolioOverviewCard
          totalInvested={50000}
          currentValue={60000}
          totalReturn={10000}
          returnPercentage={20}
        />
      );

      // All important text should be accessible
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Invested')).toBeInTheDocument();
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Total Return')).toBeInTheDocument();
      expect(screen.getByText('Return on Investment (ROI)')).toBeInTheDocument();
    });
  });
});
