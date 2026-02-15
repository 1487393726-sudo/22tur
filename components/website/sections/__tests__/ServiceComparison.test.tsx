/**
 * ServiceComparison Component Tests
 * 
 * Tests for the service comparison functionality including:
 * - Service selection and deselection
 * - Maximum selection limit
 * - Comparison view display
 * - Feature comparison table
 * - Multi-language support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ServiceComparison, ServiceData } from '../ServiceComparison';

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock 3D components
jest.mock('@/components/website/3d/Card3D', () => ({
  Card3D: ({ children, onClick, className, ariaLabel }: any) => (
    <div
      className={className}
      onClick={onClick}
      role="button"
      aria-label={ariaLabel}
    >
      {children}
    </div>
  ),
}));

jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div>{children}</div>,
}));

// Mock translation function
const mockT = (key: string) => {
  const translations: Record<string, string> = {
    'comparison.title': 'Compare Services',
    'comparison.subtitle': 'Select services to compare',
    'comparison.selectHint': 'Selected {count} services',
    'comparison.select': 'Select',
    'comparison.selected': 'Selected',
    'comparison.compare': 'Compare Services',
    'comparison.clear': 'Clear Selection',
    'comparison.viewTitle': 'Service Comparison',
    'comparison.comparing': 'Comparing',
    'comparison.services': 'services',
    'comparison.back': 'Back',
    'comparison.features': 'Features',
    'comparison.remove': 'Remove',
    'comparison.feature': 'Feature',
    'comparison.contact': 'Contact Us',
    'comparison.startOver': 'Start Over',
  };
  return translations[key] || key;
};

// Sample service data
const mockServices: ServiceData[] = [
  {
    key: 'webDev',
    title: 'Web Development',
    description: 'Build websites',
    icon: '💻',
    color: '#3b82f6',
    features: ['Responsive Design', 'SEO', 'Performance', 'Security'],
  },
  {
    key: 'mobile',
    title: 'Mobile Apps',
    description: 'Build mobile apps',
    icon: '📱',
    color: '#10b981',
    features: ['Native Development', 'Cross-Platform', 'App Store', 'Maintenance'],
  },
  {
    key: 'uiux',
    title: 'UI/UX Design',
    description: 'Design interfaces',
    icon: '🎨',
    color: '#f59e0b',
    features: ['User Research', 'Prototyping', 'Visual Design', 'Testing'],
  },
];

describe('ServiceComparison', () => {
  it('renders the comparison title and subtitle', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    expect(screen.getByText('Compare Services')).toBeInTheDocument();
    expect(screen.getByText('Select services to compare')).toBeInTheDocument();
  });

  it('displays all available services', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    expect(screen.getByText('Web Development')).toBeInTheDocument();
    expect(screen.getByText('Mobile Apps')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  it('allows selecting a service', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    const webDevCard = screen.getByLabelText(/Web Development.*Select/);
    fireEvent.click(webDevCard);
    
    // Should show selected state
    expect(screen.getByLabelText(/Web Development.*Selected/)).toBeInTheDocument();
  });

  it('allows deselecting a service', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    const webDevCard = screen.getByLabelText(/Web Development.*Select/);
    
    // Select
    fireEvent.click(webDevCard);
    expect(screen.getByLabelText(/Web Development.*Selected/)).toBeInTheDocument();
    
    // Deselect
    fireEvent.click(screen.getByLabelText(/Web Development.*Selected/));
    expect(screen.getByLabelText(/Web Development.*Select/)).toBeInTheDocument();
  });

  it('enforces maximum selection limit', () => {
    render(<ServiceComparison services={mockServices} maxCompare={2} t={mockT} />);
    
    // Select first two services
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    
    // Try to select third service - should be disabled
    const uiuxCard = screen.getByLabelText(/UI\/UX Design.*Select/);
    expect(uiuxCard).toHaveClass('opacity-50');
  });

  it('shows compare button when services are selected', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Initially no compare button
    expect(screen.queryByText(/Compare Services \(/)).not.toBeInTheDocument();
    
    // Select a service
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    
    // Compare button should appear
    expect(screen.getByText(/Compare Services \(1\)/)).toBeInTheDocument();
  });

  it('requires at least 2 services to enable comparison', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select one service
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    
    const compareButton = screen.getByText(/Compare Services \(1\)/);
    expect(compareButton).toBeDisabled();
    
    // Select second service
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    
    const compareButton2 = screen.getByText(/Compare Services \(2\)/);
    expect(compareButton2).not.toBeDisabled();
  });

  it('shows comparison view when compare button is clicked', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select two services
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    
    // Click compare
    fireEvent.click(screen.getByText(/Compare Services \(2\)/));
    
    // Should show comparison view
    expect(screen.getByText('Service Comparison')).toBeInTheDocument();
    expect(screen.getByText(/Comparing 2 services/)).toBeInTheDocument();
  });

  it('displays feature comparison table', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select and compare
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    fireEvent.click(screen.getByText(/Compare Services \(2\)/));
    
    // Should show table with features
    expect(screen.getByText('Feature')).toBeInTheDocument();
    
    // Check that features appear in the table (use getAllByText for duplicates)
    const responsiveDesignElements = screen.getAllByText('Responsive Design');
    expect(responsiveDesignElements.length).toBeGreaterThan(0);
    
    const nativeDevelopmentElements = screen.getAllByText('Native Development');
    expect(nativeDevelopmentElements.length).toBeGreaterThan(0);
  });

  it('allows removing services from comparison view', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select and compare
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    fireEvent.click(screen.getByText(/Compare Services \(2\)/));
    
    // Remove one service
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);
    
    // Should still be in comparison view with 1 service
    expect(screen.getByText(/Comparing 1 services/)).toBeInTheDocument();
  });

  it('allows going back to selection view', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select and compare
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    fireEvent.click(screen.getByText(/Compare Services \(2\)/));
    
    // Click back button
    fireEvent.click(screen.getByText(/Back/));
    
    // Should be back to selection view
    expect(screen.getByText('Compare Services')).toBeInTheDocument();
    expect(screen.queryByText('Service Comparison')).not.toBeInTheDocument();
  });

  it('clears all selections when clear button is clicked', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select services
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    
    // Click clear
    fireEvent.click(screen.getByText('Clear Selection'));
    
    // All services should be deselected
    expect(screen.getByLabelText(/Web Development.*Select/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mobile Apps.*Select/)).toBeInTheDocument();
  });

  it('calls onComparisonChange callback when selection changes', () => {
    const onComparisonChange = jest.fn();
    render(
      <ServiceComparison
        services={mockServices}
        t={mockT}
        onComparisonChange={onComparisonChange}
      />
    );
    
    // Select a service
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    
    expect(onComparisonChange).toHaveBeenCalledWith([mockServices[0]]);
    
    // Select another service
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    
    expect(onComparisonChange).toHaveBeenCalledWith([
      mockServices[0],
      mockServices[1],
    ]);
  });

  it('displays selection count correctly', () => {
    render(<ServiceComparison services={mockServices} maxCompare={3} t={mockT} />);
    
    // Initially 0/3
    expect(screen.getByText(/Selected 0\/3 services/)).toBeInTheDocument();
    
    // Select one
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    expect(screen.getByText(/Selected 1\/3 services/)).toBeInTheDocument();
    
    // Select two
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    expect(screen.getByText(/Selected 2\/3 services/)).toBeInTheDocument();
  });

  it('shows contact button in comparison view', () => {
    render(<ServiceComparison services={mockServices} t={mockT} />);
    
    // Select and compare
    fireEvent.click(screen.getByLabelText(/Web Development.*Select/));
    fireEvent.click(screen.getByLabelText(/Mobile Apps.*Select/));
    fireEvent.click(screen.getByText(/Compare Services \(2\)/));
    
    // Should show contact button
    const contactLink = screen.getByText('Contact Us →');
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
  });
});
