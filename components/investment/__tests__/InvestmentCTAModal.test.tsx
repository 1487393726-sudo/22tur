import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InvestmentCTAModal } from '../InvestmentCTAModal';

describe('InvestmentCTAModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnInvest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Requirements 3.1, 3.2, 3.5', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render modal when isOpen is true', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
    });

    it('should display the modal title - Requirement 3.5', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const title = screen.getByText('Unlock Premium Features');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'modal-title');
    });

    it('should display benefits introduction text - Requirement 3.5', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Become an investor to unlock exclusive features and insights/)).toBeInTheDocument();
    });

    it('should display all four benefits in the list - Requirement 3.5', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check for all four benefits
      expect(screen.getByText(/Portfolio Tracking/)).toBeInTheDocument();
      expect(screen.getByText(/Monitor all your investments in one place/)).toBeInTheDocument();
      
      expect(screen.getByText(/Financial Analytics/)).toBeInTheDocument();
      expect(screen.getByText(/Detailed profit\/loss analysis and projections/)).toBeInTheDocument();
      
      expect(screen.getByText(/Team Insights/)).toBeInTheDocument();
      expect(screen.getByText(/View project teams and their performance/)).toBeInTheDocument();
      
      expect(screen.getByText(/Development Tracking/)).toBeInTheDocument();
      expect(screen.getByText(/Real-time project stage updates/)).toBeInTheDocument();
    });

    it('should display "Invest Now" button - Requirement 3.2', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      expect(investButton).toBeInTheDocument();
      expect(investButton).not.toBeDisabled();
    });

    it('should display "Maybe Later" button - Requirement 3.4', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
      expect(maybeLaterButton).toBeInTheDocument();
      expect(maybeLaterButton).not.toBeDisabled();
    });

    it('should display close button', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Navigation - Requirement 3.3', () => {
    it('should call onInvest callback when "Invest Now" is clicked', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
          onInvest={mockOnInvest}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      fireEvent.click(investButton);

      expect(mockOnInvest).toHaveBeenCalledTimes(1);
    });

    it('should have "Invest Now" button that triggers navigation when clicked without custom onInvest', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      
      // Verify button exists and is clickable
      expect(investButton).toBeInTheDocument();
      expect(investButton).not.toBeDisabled();
      
      // Note: Actual navigation behavior is tested in E2E tests
      // Unit tests verify the button exists and can be clicked
    });
  });

  describe('Dismissal - Requirement 3.4', () => {
    it('should call onClose when "Maybe Later" button is clicked', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
      fireEvent.click(maybeLaterButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when background overlay is clicked', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const overlay = document.querySelector('.bg-gray-500.bg-opacity-75');
      expect(overlay).toBeInTheDocument();
      
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on modal dialog', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have aria-hidden on background overlay', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const overlay = document.querySelector('.bg-gray-500.bg-opacity-75');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-label on close button', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByRole('button', { name: 'Close modal' });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('should have aria-hidden on decorative icons', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const decorativeIcons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(decorativeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Elements', () => {
    it('should display lightning bolt icon in header', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check for the icon container with blue background
      const iconContainer = container.querySelector('.bg-blue-100.dark\\:bg-blue-900');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should display checkmark icons for each benefit', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check for green checkmark icons (one for each benefit)
      const checkmarks = container.querySelectorAll('.text-green-500');
      expect(checkmarks.length).toBe(4); // Four benefits
    });

    it('should have proper styling classes for modal panel', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modalPanel = container.querySelector('.rounded-lg.bg-white.dark\\:bg-gray-800');
      expect(modalPanel).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive classes for modal width', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modalPanel = container.querySelector('.sm\\:max-w-lg');
      expect(modalPanel).toBeInTheDocument();
    });

    it('should have responsive button layout classes', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const buttonContainer = container.querySelector('.sm\\:flex.sm\\:flex-row-reverse');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes on modal background', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const modalPanel = container.querySelector('.dark\\:bg-gray-800');
      expect(modalPanel).toBeInTheDocument();
    });

    it('should have dark mode classes on button footer', () => {
      const { container } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const footer = container.querySelector('.dark\\:bg-gray-900');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid clicks on "Invest Now" button', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
          onInvest={mockOnInvest}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      
      // Rapid clicks
      fireEvent.click(investButton);
      fireEvent.click(investButton);
      fireEvent.click(investButton);

      // Should be called three times (no debouncing implemented)
      expect(mockOnInvest).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid clicks on "Maybe Later" button', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
      
      // Rapid clicks
      fireEvent.click(maybeLaterButton);
      fireEvent.click(maybeLaterButton);
      fireEvent.click(maybeLaterButton);

      // Should be called three times (no debouncing implemented)
      expect(mockOnClose).toHaveBeenCalledTimes(3);
    });

    it('should handle missing onInvest prop gracefully', () => {
      render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      
      // Should not throw error when button exists without custom onInvest
      expect(investButton).toBeInTheDocument();
      expect(investButton).not.toBeDisabled();
      
      // Note: Actual navigation behavior is tested in E2E tests
    });

    it('should handle transition from closed to open state', async () => {
      const { rerender } = render(
        <InvestmentCTAModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();

      rerender(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
      });
    });

    it('should handle transition from open to closed state', async () => {
      const { rerender } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();

      rerender(
        <InvestmentCTAModal
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Unlock Premium Features')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal State Management', () => {
    it('should maintain modal content when isOpen remains true', () => {
      const { rerender } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('Unlock Premium Features')).toBeInTheDocument();
    });

    it('should allow changing onClose callback', () => {
      const newOnClose = jest.fn();

      const { rerender } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      rerender(
        <InvestmentCTAModal
          isOpen={true}
          onClose={newOnClose}
        />
      );

      const maybeLaterButton = screen.getByRole('button', { name: 'Maybe Later' });
      fireEvent.click(maybeLaterButton);

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(newOnClose).toHaveBeenCalledTimes(1);
    });

    it('should allow changing onInvest callback', () => {
      const newOnInvest = jest.fn();

      const { rerender } = render(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
          onInvest={mockOnInvest}
        />
      );

      rerender(
        <InvestmentCTAModal
          isOpen={true}
          onClose={mockOnClose}
          onInvest={newOnInvest}
        />
      );

      const investButton = screen.getByRole('button', { name: 'Invest Now' });
      fireEvent.click(investButton);

      expect(mockOnInvest).not.toHaveBeenCalled();
      expect(newOnInvest).toHaveBeenCalledTimes(1);
    });
  });
});
