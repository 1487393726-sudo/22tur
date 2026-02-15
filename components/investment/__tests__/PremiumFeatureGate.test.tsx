import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PremiumFeatureGate } from '../PremiumFeatureGate';
import { useInvestorAccess } from '@/hooks/use-investor-access';

// Mock the useInvestorAccess hook
jest.mock('@/hooks/use-investor-access');

const mockUseInvestorAccess = useInvestorAccess as jest.MockedFunction<typeof useInvestorAccess>;

describe('PremiumFeatureGate Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner when isLoading is true', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: true,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      const { container } = render(
        <PremiumFeatureGate>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Check for loading spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });
  });

  describe('Investor Access - Requirements 2.2', () => {
    it('should render children when user is an investor', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: true,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('should render children without showing CTA modal for investors', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: true,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
      expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
    });
  });

  describe('Non-Investor Access - Requirements 2.1, 3.1', () => {
    it('should show default locked content when user is not an investor and showInvestmentCTA is true', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
      expect(screen.getByText('Click to learn how to unlock this feature')).toBeInTheDocument();
    });

    it('should show fallback content when provided and user is not an investor', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate 
          fallback={<div>Custom Fallback</div>}
          showInvestmentCTA={true}
        >
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
    });

    it('should render fallback without CTA when showInvestmentCTA is false', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate 
          fallback={<div>Custom Fallback</div>}
          showInvestmentCTA={false}
        >
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    it('should render nothing when no fallback provided and showInvestmentCTA is false', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      const { container } = render(
        <PremiumFeatureGate showInvestmentCTA={false}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Investment CTA Modal - Requirements 3.1, 3.3, 3.4', () => {
    it('should open modal when clicking on locked content', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });
    });

    it('should open modal when pressing Enter on locked content', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.keyDown(trigger, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });
    });

    it('should open modal when pressing Space on locked content', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.keyDown(trigger, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });
    });

    it('should display modal with benefits list', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
        expect(screen.getByText(/Portfolio Tracking/)).toBeInTheDocument();
        expect(screen.getByText(/Financial Analytics/)).toBeInTheDocument();
        expect(screen.getByText(/Team Insights/)).toBeInTheDocument();
        expect(screen.getByText(/Development Tracking/)).toBeInTheDocument();
      });
    });

    it('should close modal when clicking "Maybe Later" button', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Open modal
      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });

      // Close modal
      const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
      fireEvent.click(maybeLaterButton);

      await waitFor(() => {
        expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking close button', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Open modal
      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking background overlay', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Open modal
      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });

      // Close modal by clicking overlay
      const overlay = document.querySelector('.bg-gray-500.bg-opacity-75');
      if (overlay) {
        fireEvent.click(overlay);
      }

      await waitFor(() => {
        expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation - Requirement 3.3', () => {
    it('should have "Invest Now" button that attempts to navigate to investment portal', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Open modal
      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });

      // Verify Invest Now button exists
      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      expect(investButton).toBeInTheDocument();
      
      // The button click will attempt navigation (tested in E2E tests)
      // We verify the button exists and is clickable here
      expect(investButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on trigger', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      expect(trigger).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper ARIA attributes on modal', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      // Open modal
      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      fireEvent.click(trigger);

      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks on trigger without opening multiple modals', async () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      render(
        <PremiumFeatureGate showInvestmentCTA={true}>
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const trigger = screen.getByRole('button', { name: 'Access premium feature' });
      
      // Rapid clicks
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);

      await waitFor(() => {
        const modals = screen.getAllByText('Unlock Premium Features');
        expect(modals).toHaveLength(1);
      });
    });

    it('should handle custom fallback with interactive elements', () => {
      mockUseInvestorAccess.mockReturnValue({
        isInvestor: false,
        isLoading: false,
        checkAccess: jest.fn(),
        refreshStatus: jest.fn(),
      });

      const handleCustomClick = jest.fn();

      render(
        <PremiumFeatureGate 
          fallback={
            <button onClick={handleCustomClick}>Custom Action</button>
          }
          showInvestmentCTA={true}
        >
          <div>Premium Content</div>
        </PremiumFeatureGate>
      );

      const customButton = screen.getByText('Custom Action');
      fireEvent.click(customButton);

      expect(handleCustomClick).toHaveBeenCalledTimes(1);
    });
  });
});
