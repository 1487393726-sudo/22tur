import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectCard, ProjectSummary } from '../project-card';

describe('ProjectCard Component', () => {
  // Mock project data for testing
  const mockProject: ProjectSummary = {
    id: 'proj-123',
    name: 'Green Energy Initiative',
    description: 'A sustainable energy project focused on solar power generation in rural areas.',
    category: 'Renewable Energy',
    fundingGoal: 500000,
    currentFunding: 350000,
    operationalDuration: 730, // 2 years in days
    minimumInvestment: 1000,
    riskLevel: 'medium',
    expectedReturn: 12.5,
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Requirement 4.2: Display funding progress', () => {
    it('should display funding progress bar with correct percentage', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      // Check progress percentage is displayed
      expect(screen.getByText('70.0%')).toBeInTheDocument();
      
      // Check current funding and goal are displayed
      expect(screen.getByText(/\$350,000 raised/)).toBeInTheDocument();
      expect(screen.getByText(/\$500,000 goal/)).toBeInTheDocument();
    });

    it('should cap funding progress at 100% when overfunded', () => {
      const overfundedProject = {
        ...mockProject,
        currentFunding: 600000, // More than goal
      };
      
      render(<ProjectCard project={overfundedProject} onClick={mockOnClick} />);
      
      // Progress should be capped at 100%
      expect(screen.getByText('100.0%')).toBeInTheDocument();
    });

    it('should display 0% progress when no funding', () => {
      const noFundingProject = {
        ...mockProject,
        currentFunding: 0,
      };
      
      render(<ProjectCard project={noFundingProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('Requirement 4.3: Display operational duration', () => {
    it('should display operational duration in months', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      // 730 days = ~24 months
      expect(screen.getByText(/24 months/)).toBeInTheDocument();
    });

    it('should display singular "month" for 30 days or less', () => {
      const shortProject = {
        ...mockProject,
        operationalDuration: 30,
      };
      
      render(<ProjectCard project={shortProject} onClick={mockOnClick} />);
      
      expect(screen.getByText(/1 month/)).toBeInTheDocument();
    });

    it('should round duration to nearest month', () => {
      const project45Days = {
        ...mockProject,
        operationalDuration: 45, // Should round to 2 months
      };
      
      render(<ProjectCard project={project45Days} onClick={mockOnClick} />);
      
      expect(screen.getByText(/2 months/)).toBeInTheDocument();
    });
  });

  describe('Requirement 4.4: Display project information', () => {
    it('should display project name', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('Green Energy Initiative')).toBeInTheDocument();
    });

    it('should display project description', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText(/sustainable energy project/)).toBeInTheDocument();
    });

    it('should display project category', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('Renewable Energy')).toBeInTheDocument();
    });

    it('should truncate long descriptions with line-clamp', () => {
      const longDescProject = {
        ...mockProject,
        description: 'A'.repeat(500), // Very long description
      };
      
      const { container } = render(
        <ProjectCard project={longDescProject} onClick={mockOnClick} />
      );
      
      // Check that line-clamp-3 class is applied
      const description = container.querySelector('.line-clamp-3');
      expect(description).toBeInTheDocument();
    });
  });

  describe('Requirement 4.5: Display risk level and expected return', () => {
    it('should display low risk indicator with correct styling', () => {
      const lowRiskProject = {
        ...mockProject,
        riskLevel: 'low' as const,
      };
      
      render(<ProjectCard project={lowRiskProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('Low Risk')).toBeInTheDocument();
    });

    it('should display medium risk indicator with correct styling', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('Medium Risk')).toBeInTheDocument();
    });

    it('should display high risk indicator with correct styling', () => {
      const highRiskProject = {
        ...mockProject,
        riskLevel: 'high' as const,
      };
      
      render(<ProjectCard project={highRiskProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('High Risk')).toBeInTheDocument();
    });

    it('should display expected return percentage', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByText('Expected Return')).toBeInTheDocument();
    });

    it('should display minimum investment amount', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('$1,000')).toBeInTheDocument();
      expect(screen.getByText('Minimum Investment')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick handler when View Details button is clicked', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: /view details/i });
      fireEvent.click(button);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should have hover effects on card', () => {
      const { container } = render(
        <ProjectCard project={mockProject} onClick={mockOnClick} />
      );
      
      const card = container.firstChild;
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('Currency Formatting', () => {
    it('should format large amounts correctly', () => {
      const largeAmountProject = {
        ...mockProject,
        fundingGoal: 1500000,
        currentFunding: 1250000,
        minimumInvestment: 50000,
      };
      
      render(<ProjectCard project={largeAmountProject} onClick={mockOnClick} />);
      
      expect(screen.getByText(/\$1,250,000 raised/)).toBeInTheDocument();
      expect(screen.getByText(/\$1,500,000 goal/)).toBeInTheDocument();
      expect(screen.getByText('$50,000')).toBeInTheDocument();
    });

    it('should format small amounts correctly', () => {
      const smallAmountProject = {
        ...mockProject,
        fundingGoal: 10000,
        currentFunding: 5000,
        minimumInvestment: 100,
      };
      
      render(<ProjectCard project={smallAmountProject} onClick={mockOnClick} />);
      
      expect(screen.getByText(/\$5,000 raised/)).toBeInTheDocument();
      expect(screen.getByText(/\$10,000 goal/)).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero expected return', () => {
      const zeroReturnProject = {
        ...mockProject,
        expectedReturn: 0,
      };
      
      render(<ProjectCard project={zeroReturnProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle very high expected return', () => {
      const highReturnProject = {
        ...mockProject,
        expectedReturn: 150.75,
      };
      
      render(<ProjectCard project={highReturnProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('150.75%')).toBeInTheDocument();
    });

    it('should handle very short operational duration', () => {
      const shortDurationProject = {
        ...mockProject,
        operationalDuration: 1, // 1 day
      };
      
      render(<ProjectCard project={shortDurationProject} onClick={mockOnClick} />);
      
      // Should round to 0 months
      expect(screen.getByText(/0 months/)).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      const noDescProject = {
        ...mockProject,
        description: '',
      };
      
      render(<ProjectCard project={noDescProject} onClick={mockOnClick} />);
      
      // Component should still render without errors
      expect(screen.getByText('Green Energy Initiative')).toBeInTheDocument();
    });

    it('should handle special characters in project name', () => {
      const specialCharsProject = {
        ...mockProject,
        name: 'Project & Co. "Innovation" <2024>',
      };
      
      render(<ProjectCard project={specialCharsProject} onClick={mockOnClick} />);
      
      expect(screen.getByText('Project & Co. "Innovation" <2024>')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      render(<ProjectCard project={mockProject} onClick={mockOnClick} />);
      
      const button = screen.getByRole('button', { name: /view details/i });
      expect(button).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      const { container } = render(
        <ProjectCard project={mockProject} onClick={mockOnClick} />
      );
      
      // Check for heading
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Green Energy Initiative');
    });
  });
});
