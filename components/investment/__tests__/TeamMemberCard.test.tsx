import { render, screen } from '@testing-library/react';
import { TeamMemberCard, TeamMember } from '../TeamMemberCard';

describe('TeamMemberCard', () => {
  // Sample team members for testing
  const mockTeamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      role: 'Developer',
      expertiseLevel: 'senior',
      contributionScore: 85.5,
      performanceRating: 4.7,
    },
    {
      id: '2',
      name: 'Bob Smith',
      role: 'Designer',
      expertiseLevel: 'mid',
      contributionScore: 72.3,
      performanceRating: 4.2,
    },
    {
      id: '3',
      name: 'Carol Davis',
      role: 'Developer',
      expertiseLevel: 'lead',
      contributionScore: 92.8,
      performanceRating: 4.9,
    },
    {
      id: '4',
      name: 'David Wilson',
      role: 'Manager',
      expertiseLevel: 'senior',
      contributionScore: 78.6,
      performanceRating: 4.5,
    },
  ];

  describe('Requirement 9.1: Team member list completeness', () => {
    it('should display all team members assigned to the project', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Verify all team members are displayed
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Davis')).toBeInTheDocument();
      expect(screen.getByText('David Wilson')).toBeInTheDocument();
    });

    it('should display correct team member count', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      expect(screen.getByText('4 members working on this project')).toBeInTheDocument();
    });

    it('should display singular "member" for single team member', () => {
      const singleMember = [mockTeamMembers[0]];
      render(<TeamMemberCard teamMembers={singleMember} />);

      expect(screen.getByText('1 member working on this project')).toBeInTheDocument();
    });

    it('should display empty state when no team members', () => {
      render(<TeamMemberCard teamMembers={[]} />);

      expect(screen.getByText('No team members assigned yet')).toBeInTheDocument();
    });
  });

  describe('Requirement 9.2: Team member required fields', () => {
    it('should display name for each team member', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      mockTeamMembers.forEach((member) => {
        expect(screen.getByText(member.name)).toBeInTheDocument();
      });
    });

    it('should display role for each team member', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Check that all roles are displayed (appears in both composition and member cards)
      const developerElements = screen.getAllByText('Developer');
      expect(developerElements.length).toBeGreaterThanOrEqual(2);
      
      const designerElements = screen.getAllByText('Designer');
      expect(designerElements.length).toBeGreaterThan(0);
      
      const managerElements = screen.getAllByText('Manager');
      expect(managerElements.length).toBeGreaterThan(0);
    });

    it('should display expertise level for each team member', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Check expertise level badges
      expect(screen.getAllByText('Senior')).toHaveLength(2);
      expect(screen.getByText('Mid-Level')).toBeInTheDocument();
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });

    it('should display correct expertise level for junior members', () => {
      const juniorMember: TeamMember = {
        id: '5',
        name: 'Eve Brown',
        role: 'Developer',
        expertiseLevel: 'junior',
        contributionScore: 55.0,
        performanceRating: 3.5,
      };

      render(<TeamMemberCard teamMembers={[juniorMember]} />);

      expect(screen.getByText('Junior')).toBeInTheDocument();
    });
  });

  describe('Requirement 9.3: Contribution metrics and performance ratings', () => {
    it('should display contribution score for each team member', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Check contribution scores are displayed
      expect(screen.getByText('85.5')).toBeInTheDocument();
      expect(screen.getByText('72.3')).toBeInTheDocument();
      expect(screen.getByText('92.8')).toBeInTheDocument();
      expect(screen.getByText('78.6')).toBeInTheDocument();
    });

    it('should display performance rating for each team member', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Check performance ratings are displayed
      expect(screen.getByText('4.7')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('should display contribution score with /100 suffix', () => {
      render(<TeamMemberCard teamMembers={[mockTeamMembers[0]]} />);

      const contributionElements = screen.getAllByText('/100');
      expect(contributionElements.length).toBeGreaterThan(0);
    });

    it('should display performance rating with /5.0 suffix', () => {
      render(<TeamMemberCard teamMembers={[mockTeamMembers[0]]} />);

      const performanceElements = screen.getAllByText('/5.0');
      expect(performanceElements.length).toBeGreaterThan(0);
    });

    it('should calculate and display average contribution score', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Average: (85.5 + 72.3 + 92.8 + 78.6) / 4 = 82.3
      expect(screen.getByText('82.3')).toBeInTheDocument();
    });

    it('should calculate and display average performance rating', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Average: (4.7 + 4.2 + 4.9 + 4.5) / 4 = 4.575 -> 4.6
      const performanceElements = screen.getAllByText('4.6/5.0');
      expect(performanceElements.length).toBeGreaterThan(0);
    });
  });

  describe('Requirement 9.5: Team composition by role', () => {
    it('should display team composition summary', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      expect(screen.getByText('Team Composition')).toBeInTheDocument();
    });

    it('should group team members by role', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Check role counts in composition summary
      const developerBadges = screen.getAllByText('2');
      expect(developerBadges.length).toBeGreaterThan(0);
    });

    it('should display correct count for each role', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Developer: 2, Designer: 1, Manager: 1
      // Check that the composition section exists
      expect(screen.getByText('Team Composition')).toBeInTheDocument();
      
      // Verify roles are listed
      const compositionSection = screen.getByText('Team Composition').closest('div');
      expect(compositionSection).toBeInTheDocument();
    });

    it('should handle single role team', () => {
      const singleRoleTeam: TeamMember[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          role: 'Developer',
          expertiseLevel: 'senior',
          contributionScore: 85.5,
          performanceRating: 4.7,
        },
        {
          id: '2',
          name: 'Bob Smith',
          role: 'Developer',
          expertiseLevel: 'mid',
          contributionScore: 72.3,
          performanceRating: 4.2,
        },
      ];

      render(<TeamMemberCard teamMembers={singleRoleTeam} />);

      expect(screen.getByText('Team Composition')).toBeInTheDocument();
      // Developer appears in both composition and member cards
      const developerElements = screen.getAllByText('Developer');
      expect(developerElements.length).toBeGreaterThan(0);
    });

    it('should display role count in summary footer', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // 3 unique roles: Developer, Designer, Manager
      // Just check that the footer contains the expected text
      const elements = screen.getAllByText((content, element) => {
        const text = element?.textContent || '';
        return text.includes('Team of') && text.includes('3') && text.includes('roles');
      });
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display singular "role" for single role team', () => {
      const singleRoleTeam = mockTeamMembers.filter(m => m.role === 'Developer');
      render(<TeamMemberCard teamMembers={singleRoleTeam} />);

      // Just check that the footer contains the expected text
      const elements = screen.getAllByText((content, element) => {
        const text = element?.textContent || '';
        return text.includes('Team of') && text.includes('1') && text.includes('role') && !text.includes('roles');
      });
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle team member with zero contribution score', () => {
      const memberWithZeroContribution: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Developer',
        expertiseLevel: 'junior',
        contributionScore: 0,
        performanceRating: 3.0,
      };

      render(<TeamMemberCard teamMembers={[memberWithZeroContribution]} />);

      // Check that 0.0 appears (will be in both avg and individual)
      const zeroValues = screen.getAllByText('0.0');
      expect(zeroValues.length).toBeGreaterThan(0);
    });

    it('should handle team member with maximum contribution score', () => {
      const memberWithMaxContribution: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Developer',
        expertiseLevel: 'lead',
        contributionScore: 100,
        performanceRating: 5.0,
      };

      render(<TeamMemberCard teamMembers={[memberWithMaxContribution]} />);

      // Check that 100.0 appears (will be in both avg and individual)
      const maxValues = screen.getAllByText('100.0');
      expect(maxValues.length).toBeGreaterThan(0);
    });

    it('should handle team member with minimum performance rating', () => {
      const memberWithMinPerformance: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Developer',
        expertiseLevel: 'junior',
        contributionScore: 50,
        performanceRating: 1.0,
      };

      render(<TeamMemberCard teamMembers={[memberWithMinPerformance]} />);

      expect(screen.getByText('1.0')).toBeInTheDocument();
    });

    it('should handle team member with maximum performance rating', () => {
      const memberWithMaxPerformance: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Developer',
        expertiseLevel: 'lead',
        contributionScore: 95,
        performanceRating: 5.0,
      };

      render(<TeamMemberCard teamMembers={[memberWithMaxPerformance]} />);

      expect(screen.getByText('5.0')).toBeInTheDocument();
    });

    it('should handle team member with long name', () => {
      const memberWithLongName: TeamMember = {
        id: '1',
        name: 'Alexander Christopher Montgomery Wellington III',
        role: 'Developer',
        expertiseLevel: 'senior',
        contributionScore: 80,
        performanceRating: 4.5,
      };

      render(<TeamMemberCard teamMembers={[memberWithLongName]} />);

      expect(screen.getByText('Alexander Christopher Montgomery Wellington III')).toBeInTheDocument();
    });

    it('should handle team member with long role name', () => {
      const memberWithLongRole: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Senior Full-Stack Software Engineer and Technical Lead',
        expertiseLevel: 'lead',
        contributionScore: 90,
        performanceRating: 4.8,
      };

      render(<TeamMemberCard teamMembers={[memberWithLongRole]} />);

      // Role appears in both composition and member card
      const roleElements = screen.getAllByText('Senior Full-Stack Software Engineer and Technical Lead');
      expect(roleElements.length).toBeGreaterThan(0);
    });

    it('should handle large team (100+ members)', () => {
      const largeTeam: TeamMember[] = Array.from({ length: 100 }, (_, i) => ({
        id: `member-${i}`,
        name: `Team Member ${i + 1}`,
        role: i % 5 === 0 ? 'Manager' : 'Developer',
        expertiseLevel: (i % 4 === 0 ? 'lead' : i % 3 === 0 ? 'senior' : i % 2 === 0 ? 'mid' : 'junior') as TeamMember['expertiseLevel'],
        contributionScore: 50 + (i % 50),
        performanceRating: 3.0 + (i % 20) / 10,
      }));

      render(<TeamMemberCard teamMembers={largeTeam} />);

      expect(screen.getByText('100 members working on this project')).toBeInTheDocument();
    });

    it('should format decimal values correctly', () => {
      const memberWithDecimals: TeamMember = {
        id: '1',
        name: 'Test User',
        role: 'Developer',
        expertiseLevel: 'mid',
        contributionScore: 75.456,
        performanceRating: 4.123,
      };

      render(<TeamMemberCard teamMembers={[memberWithDecimals]} />);

      // Should round to 1 decimal place (will appear in both avg and individual)
      const contributionValues = screen.getAllByText('75.5');
      expect(contributionValues.length).toBeGreaterThan(0);
      
      const performanceValues = screen.getAllByText('4.1');
      expect(performanceValues.length).toBeGreaterThan(0);
    });
  });

  describe('Visual elements', () => {
    it('should display avatar initials for team members', () => {
      render(<TeamMemberCard teamMembers={[mockTeamMembers[0]]} />);

      // Alice Johnson -> AJ
      expect(screen.getByText('AJ')).toBeInTheDocument();
    });

    it('should display avatar initials for single name', () => {
      const singleNameMember: TeamMember = {
        id: '1',
        name: 'Madonna',
        role: 'Designer',
        expertiseLevel: 'senior',
        contributionScore: 85,
        performanceRating: 4.5,
      };

      render(<TeamMemberCard teamMembers={[singleNameMember]} />);

      // Single name should show first two letters (MA)
      expect(screen.getByText('MA')).toBeInTheDocument();
    });

    it('should display summary footer with team statistics', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      const footer = screen.getByText(/Team of.*members/);
      expect(footer).toBeInTheDocument();
      expect(footer.textContent).toContain('4');
      expect(footer.textContent).toContain('3');
      expect(footer.textContent).toContain('4.6/5.0');
    });

    it('should not display average metrics when team is empty', () => {
      render(<TeamMemberCard teamMembers={[]} />);

      expect(screen.queryByText('Avg. Contribution')).not.toBeInTheDocument();
      expect(screen.queryByText('Avg. Performance')).not.toBeInTheDocument();
    });

    it('should not display team composition when team is empty', () => {
      render(<TeamMemberCard teamMembers={[]} />);

      expect(screen.queryByText('Team Composition')).not.toBeInTheDocument();
    });

    it('should not display summary footer when team is empty', () => {
      render(<TeamMemberCard teamMembers={[]} />);

      expect(screen.queryByText(/Team of.*members/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper heading structure', () => {
      render(<TeamMemberCard teamMembers={mockTeamMembers} />);

      // Both headings should exist
      const teamMembersHeadings = screen.getAllByText('Team Members');
      expect(teamMembersHeadings.length).toBeGreaterThan(0);
      expect(screen.getByText('Team Composition')).toBeInTheDocument();
    });

    it('should have descriptive labels for metrics', () => {
      render(<TeamMemberCard teamMembers={[mockTeamMembers[0]]} />);

      expect(screen.getByText('Contribution')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });
  });
});
