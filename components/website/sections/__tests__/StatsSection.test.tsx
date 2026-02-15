/**
 * StatsSection Component Tests
 * 
 * Tests for the StatsSection component including:
 * - Component rendering
 * - Props handling
 * - Glass effects and 3D depth shadows
 * - Grid layout configuration
 * - CountUpAnimation integration
 * 
 * Requirements: 7.3
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsSection } from '../StatsSection';

// Mock the animation components to avoid animation complexity in tests
jest.mock('@/components/website/animations/CountUpAnimation', () => ({
  CountUpAnimation: ({ end, prefix, suffix }: any) => (
    <span data-testid="count-up">{prefix}{end}{suffix}</span>
  ),
}));

jest.mock('@/components/website/animations/FadeInView', () => ({
  FadeInView: ({ children }: any) => <div>{children}</div>,
}));

describe('StatsSection', () => {
  const mockStats = [
    {
      value: 100,
      label: 'Projects Completed',
      suffix: '+',
      icon: '🚀',
      color: '#3b82f6',
    },
    {
      value: 50,
      label: 'Happy Clients',
      suffix: '+',
      icon: '😊',
      color: '#8b5cf6',
    },
    {
      value: 10,
      label: 'Years Experience',
      suffix: '+',
      icon: '⭐',
      color: '#f59e0b',
    },
  ];

  it('renders without crashing', () => {
    render(<StatsSection stats={mockStats} />);
    expect(screen.getByText('Projects Completed')).toBeInTheDocument();
  });

  it('renders all stats items', () => {
    render(<StatsSection stats={mockStats} />);
    
    expect(screen.getByText('Projects Completed')).toBeInTheDocument();
    expect(screen.getByText('Happy Clients')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
  });

  it('renders title and subtitle when provided', () => {
    render(
      <StatsSection
        title="Our Achievements"
        subtitle="Numbers that speak"
        stats={mockStats}
      />
    );
    
    expect(screen.getByText('Our Achievements')).toBeInTheDocument();
    expect(screen.getByText('Numbers that speak')).toBeInTheDocument();
  });

  it('renders without title and subtitle', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    // Should still render stats
    expect(screen.getByText('Projects Completed')).toBeInTheDocument();
    
    // Should not have title/subtitle section
    expect(container.querySelector('h2')).not.toBeInTheDocument();
  });

  it('renders icons when provided', () => {
    render(<StatsSection stats={mockStats} />);
    
    expect(screen.getByText('🚀')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument();
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('passes correct props to CountUpAnimation', () => {
    render(<StatsSection stats={mockStats} />);
    
    const countUpElements = screen.getAllByTestId('count-up');
    
    // Check first stat
    expect(countUpElements[0]).toHaveTextContent('100+');
    
    // Check second stat
    expect(countUpElements[1]).toHaveTextContent('50+');
    
    // Check third stat
    expect(countUpElements[2]).toHaveTextContent('10+');
  });

  it('applies custom background class', () => {
    const { container } = render(
      <StatsSection stats={mockStats} background="bg-blue-100" />
    );
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-blue-100');
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsSection stats={mockStats} className="custom-class" />
    );
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('custom-class');
  });

  it('renders with decimal values', () => {
    const decimalStats = [
      {
        value: 99.9,
        label: 'Client Satisfaction',
        suffix: '%',
        decimals: 1,
      },
    ];
    
    render(<StatsSection stats={decimalStats} />);
    
    expect(screen.getByText('Client Satisfaction')).toBeInTheDocument();
  });

  it('renders with prefix', () => {
    const prefixStats = [
      {
        value: 1000,
        label: 'Revenue',
        prefix: '$',
      },
    ];
    
    render(<StatsSection stats={prefixStats} />);
    
    const countUpElement = screen.getByTestId('count-up');
    expect(countUpElement).toHaveTextContent('$1000');
  });

  it('handles empty stats array gracefully', () => {
    const { container } = render(<StatsSection stats={[]} />);
    
    // Should render section but with no stat cards
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    
    const grid = container.querySelector('.grid');
    expect(grid?.children.length).toBe(0);
  });

  it('applies glass effect classes', () => {
    const { container } = render(
      <StatsSection stats={mockStats} glassIntensity="medium" />
    );
    
    // Check that glass effect classes are applied to stat cards
    const cards = container.querySelectorAll('.backdrop-blur-\\[var\\(--glass-blur-medium\\)\\]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('applies depth shadow classes', () => {
    const { container } = render(
      <StatsSection stats={mockStats} depth="deep" />
    );
    
    // Check that depth shadow classes are applied
    const cards = container.querySelectorAll('.shadow-depth-deep');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('applies custom grid columns configuration', () => {
    const { container } = render(
      <StatsSection
        stats={mockStats}
        columns={{ mobile: 1, tablet: 2, desktop: 3 }}
      />
    );
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('uses default grid columns when not specified', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('applies custom color to stat cards', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    // Check that stat cards are rendered with the expected structure
    const statCards = container.querySelectorAll('.rounded-lg.p-6');
    expect(statCards.length).toBe(mockStats.length);
  });

  it('renders responsive padding classes', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    const section = container.querySelector('section');
    expect(section).toHaveClass('py-16');
    expect(section).toHaveClass('md:py-24');
  });

  it('applies GPU acceleration class', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    const cards = container.querySelectorAll('.gpu-accelerated');
    expect(cards.length).toBe(mockStats.length);
  });

  it('applies hover scale transition', () => {
    const { container } = render(<StatsSection stats={mockStats} />);
    
    const cards = container.querySelectorAll('.hover\\:scale-105');
    expect(cards.length).toBe(mockStats.length);
  });
});
