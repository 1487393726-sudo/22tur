import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import TeamSection from './TeamSection';
import type { TeamMember } from '@/types/website';

describe('TeamSection Component', () => {
  const mockMembers: TeamMember[] = [
    {
      id: 'member-1',
      name: 'John Smith',
      position: 'Chief Executive Officer',
      department: 'Executive',
      avatar: 'https://via.placeholder.com/400x400',
      bio: 'Visionary leader with 20+ years of experience in technology and business strategy.',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/johnsmith', icon: '🔗', label: 'LinkedIn' },
        { platform: 'twitter', url: 'https://twitter.com/johnsmith', icon: '𝕏', label: 'Twitter' },
      ],
    },
    {
      id: 'member-2',
      name: 'Sarah Johnson',
      position: 'Head of Design',
      department: 'Design',
      avatar: 'https://via.placeholder.com/400x400',
      bio: 'Creative designer passionate about user experience and innovative solutions.',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson', icon: '🔗', label: 'LinkedIn' },
      ],
    },
    {
      id: 'member-3',
      name: 'Michael Chen',
      position: 'Lead Developer',
      department: 'Engineering',
      avatar: 'https://via.placeholder.com/400x400',
      bio: 'Full-stack developer with expertise in modern web technologies.',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/michaelchen', icon: '🔗', label: 'LinkedIn' },
      ],
    },
    {
      id: 'member-4',
      name: 'Emily Davis',
      position: 'Product Manager',
      department: 'Product',
      avatar: 'https://via.placeholder.com/400x400',
      bio: 'Strategic product leader focused on delivering customer value.',
      socialLinks: [],
    },
    {
      id: 'member-5',
      name: 'David Wilson',
      position: 'Senior Developer',
      department: 'Engineering',
      avatar: 'https://via.placeholder.com/400x400',
      bio: 'Experienced backend engineer with a passion for scalable systems.',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/davidwilson', icon: '🔗', label: 'LinkedIn' },
      ],
    },
  ];

  describe('Rendering', () => {
    test('should render team section', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });

    test('should render heading', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByText('Our Team')).toBeInTheDocument();
    });

    test('should render description', () => {
      render(<TeamSection members={mockMembers} />);
      expect(
        screen.getByText(/Meet our talented team of professionals/i)
      ).toBeInTheDocument();
    });

    test('should render all team member cards', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        expect(screen.getByText(member.name)).toBeInTheDocument();
      });
    });

    test('should render member avatars', () => {
      render(<TeamSection members={mockMembers} />);
      const images = screen.getAllByAltText(/John Smith|Sarah Johnson|Michael Chen|Emily Davis|David Wilson/);
      expect(images.length).toBeGreaterThan(0);
    });

    test('should render member positions', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        expect(screen.getByText(member.position)).toBeInTheDocument();
      });
    });

    test('should render member bios', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        expect(screen.getByText(member.bio)).toBeInTheDocument();
      });
    });

    test('should render department badges', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        expect(screen.getByTestId(`department-badge-${member.id}`)).toBeInTheDocument();
      });
    });

    test('should render with custom className', () => {
      render(<TeamSection members={mockMembers} className="custom-class" />);
      const section = screen.getByTestId('team-section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('Department Filtering', () => {
    test('should render department filter buttons', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByTestId('department-filter')).toBeInTheDocument();
      expect(screen.getByTestId('filter-all')).toBeInTheDocument();
    });

    test('should render all unique departments as filter buttons', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByTestId('filter-Executive')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Design')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Engineering')).toBeInTheDocument();
      expect(screen.getByTestId('filter-Product')).toBeInTheDocument();
    });

    test('should filter members by department when filter button is clicked', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');

      fireEvent.click(engineeringFilter);

      await waitFor(() => {
        // Should show only Engineering members
        expect(screen.getByText('Michael Chen')).toBeInTheDocument();
        expect(screen.getByText('David Wilson')).toBeInTheDocument();
        // Should not show other departments
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument();
      });
    });

    test('should show all members when "All Departments" filter is clicked', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');
      const allFilter = screen.getByTestId('filter-all');

      fireEvent.click(engineeringFilter);
      await waitFor(() => {
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
      });

      fireEvent.click(allFilter);
      await waitFor(() => {
        expect(screen.getByText('John Smith')).toBeInTheDocument();
      });
    });

    test('should highlight active filter button', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');

      fireEvent.click(engineeringFilter);

      await waitFor(() => {
        expect(engineeringFilter).toHaveClass('bg-blue-600', 'text-white');
      });
    });

    test('should update results count when filtering', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');

      fireEvent.click(engineeringFilter);

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 5 team members')).toBeInTheDocument();
      });
    });

    test('should show empty state when no members match filter', async () => {
      render(<TeamSection members={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No team members found for the selected department.')).toBeInTheDocument();
    });
  });

  describe('Member Card Interactions', () => {
    test('should call onMemberClick callback when member card is clicked', () => {
      const onMemberClick = jest.fn();
      render(<TeamSection members={mockMembers} onMemberClick={onMemberClick} />);

      const memberCard = screen.getByTestId('member-card-member-1');
      fireEvent.click(memberCard);

      expect(onMemberClick).toHaveBeenCalledWith('member-1');
    });

    test('should show social links overlay on hover', async () => {
      render(<TeamSection members={mockMembers} />);
      const memberCard = screen.getByTestId('member-card-member-1');

      fireEvent.mouseEnter(memberCard);

      await waitFor(() => {
        const overlay = screen.getByTestId('social-overlay-member-1');
        expect(overlay).toHaveClass('opacity-100');
      });
    });

    test('should hide social links overlay on mouse leave', async () => {
      render(<TeamSection members={mockMembers} />);
      const memberCard = screen.getByTestId('member-card-member-1');

      fireEvent.mouseEnter(memberCard);
      await waitFor(() => {
        expect(screen.getByTestId('social-overlay-member-1')).toHaveClass('opacity-100');
      });

      fireEvent.mouseLeave(memberCard);
      await waitFor(() => {
        expect(screen.getByTestId('social-overlay-member-1')).toHaveClass('opacity-0');
      });
    });

    test('should render social media links', () => {
      render(<TeamSection members={mockMembers} />);
      const linkedinLink = screen.getByTestId('social-link-member-1-linkedin');
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johnsmith');
      expect(linkedinLink).toHaveAttribute('target', '_blank');
    });

    test('should not show social overlay for members without social links', () => {
      render(<TeamSection members={mockMembers} />);
      const memberCard = screen.getByTestId('member-card-member-4');

      fireEvent.mouseEnter(memberCard);

      // Should not have social overlay
      expect(screen.queryByTestId('social-overlay-member-4')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    test('should render empty state when no members provided', () => {
      render(<TeamSection members={[]} />);
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No team members found for the selected department.')).toBeInTheDocument();
    });

    test('should not render filter when no members', () => {
      render(<TeamSection members={[]} />);
      expect(screen.queryByTestId('department-filter')).not.toBeInTheDocument();
    });

    test('should not render results count when no members', () => {
      render(<TeamSection members={[]} />);
      expect(screen.queryByTestId('results-count')).not.toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    test('should display results count', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByTestId('results-count')).toBeInTheDocument();
      expect(screen.getByText(`Showing ${mockMembers.length} of ${mockMembers.length} team members`)).toBeInTheDocument();
    });

    test('should update results count when filtering', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');

      fireEvent.click(engineeringFilter);

      await waitFor(() => {
        const engineeringMembers = mockMembers.filter((m) => m.department === 'Engineering');
        expect(screen.getByText(`Showing ${engineeringMembers.length} of ${mockMembers.length} team members`)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('should have responsive grid layout', () => {
      render(<TeamSection members={mockMembers} />);
      const grid = screen.getByTestId('members-grid');
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    test('should have responsive padding', () => {
      render(<TeamSection members={mockMembers} />);
      const section = screen.getByTestId('team-section');
      expect(section).toHaveClass('py-12', 'md:py-16', 'lg:py-20');
    });
  });

  describe('Accessibility', () => {
    test('should have proper heading hierarchy', () => {
      render(<TeamSection members={mockMembers} />);
      const heading = screen.getByText('Our Team');
      expect(heading.tagName).toBe('H2');
    });

    test('should have alt text for images', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        const img = screen.getByAltText(member.name);
        expect(img).toHaveAttribute('alt', member.name);
      });
    });

    test('should have semantic HTML structure', () => {
      render(<TeamSection members={mockMembers} />);
      const section = screen.getByTestId('team-section');
      expect(section.tagName).toBe('SECTION');
    });

    test('should have descriptive button text', () => {
      render(<TeamSection members={mockMembers} />);
      expect(screen.getByTestId('filter-all')).toHaveTextContent('All Departments');
      expect(screen.getByTestId('filter-Engineering')).toHaveTextContent('Engineering');
    });

    test('should have aria-label for social links', () => {
      render(<TeamSection members={mockMembers} />);
      const linkedinLink = screen.getByTestId('social-link-member-1-linkedin');
      expect(linkedinLink).toHaveAttribute('aria-label', 'linkedin profile');
    });
  });

  describe('Edge Cases', () => {
    test('should handle members with no social links', () => {
      const membersNoSocial: TeamMember[] = [
        {
          id: 'member-1',
          name: 'Test Member',
          position: 'Test Position',
          department: 'Test',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'Test bio',
          socialLinks: [],
        },
      ];
      render(<TeamSection members={membersNoSocial} />);
      expect(screen.getByText('Test Member')).toBeInTheDocument();
    });

    test('should handle very long member names', () => {
      const longNameMembers: TeamMember[] = [
        {
          id: 'member-1',
          name: 'This is a very long member name that should be displayed properly',
          position: 'Test Position',
          department: 'Test',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'Test bio',
          socialLinks: [],
        },
      ];
      render(<TeamSection members={longNameMembers} />);
      expect(screen.getByText(/This is a very long member name/)).toBeInTheDocument();
    });

    test('should handle very long bios', () => {
      const longBioMembers: TeamMember[] = [
        {
          id: 'member-1',
          name: 'Test Member',
          position: 'Test Position',
          department: 'Test',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'This is a very long bio that should be truncated properly without breaking the layout. It contains multiple sentences and should be displayed with line clamping.',
          socialLinks: [],
        },
      ];
      render(<TeamSection members={longBioMembers} />);
      const bio = screen.getByText(/This is a very long bio/);
      expect(bio).toHaveClass('line-clamp-3');
    });

    test('should handle duplicate departments', () => {
      const duplicateDeptMembers: TeamMember[] = [
        ...mockMembers,
        {
          id: 'member-6',
          name: 'Another Engineer',
          position: 'Developer',
          department: 'Engineering',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'Another engineer',
          socialLinks: [],
        },
      ];
      render(<TeamSection members={duplicateDeptMembers} />);
      // Should only have one Engineering filter button
      const engineeringButtons = screen.getAllByTestId('filter-Engineering');
      expect(engineeringButtons).toHaveLength(1);
    });

    test('should handle special characters in member data', () => {
      const specialCharMembers: TeamMember[] = [
        {
          id: 'member-1',
          name: "O'Brien & Co.'s Manager",
          position: 'VP of "Operations"',
          department: 'Tech & Innovation',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'Expert in @technology & #innovation with 20+ years experience.',
          socialLinks: [],
        },
      ];
      render(<TeamSection members={specialCharMembers} />);
      expect(screen.getByText(/O'Brien & Co.'s Manager/)).toBeInTheDocument();
    });

    test('should handle members with many social links', () => {
      const manySocialMembers: TeamMember[] = [
        {
          id: 'member-1',
          name: 'Social Butterfly',
          position: 'Test Position',
          department: 'Test',
          avatar: 'https://via.placeholder.com/400x400',
          bio: 'Test bio',
          socialLinks: [
            { platform: 'linkedin', url: 'https://linkedin.com', icon: '🔗', label: 'LinkedIn' },
            { platform: 'twitter', url: 'https://twitter.com', icon: '𝕏', label: 'Twitter' },
            { platform: 'facebook', url: 'https://facebook.com', icon: '📘', label: 'Facebook' },
            { platform: 'wechat', url: 'https://wechat.com', icon: '💬', label: 'WeChat' },
          ],
        },
      ];
      render(<TeamSection members={manySocialMembers} />);
      const memberCard = screen.getByTestId('member-card-member-1');
      fireEvent.mouseEnter(memberCard);
      
      expect(screen.getByTestId('social-link-member-1-linkedin')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-member-1-twitter')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-member-1-facebook')).toBeInTheDocument();
      expect(screen.getByTestId('social-link-member-1-wechat')).toBeInTheDocument();
    });
  });

  describe('Grid Layout', () => {
    test('should render members in grid layout', () => {
      render(<TeamSection members={mockMembers} />);
      const grid = screen.getByTestId('members-grid');
      const cards = within(grid).getAllByTestId(/member-card-/);
      expect(cards).toHaveLength(mockMembers.length);
    });

    test('should maintain consistent card height', () => {
      render(<TeamSection members={mockMembers} />);
      const cards = screen.getAllByTestId(/member-card-/);
      cards.forEach((card) => {
        expect(card).toHaveClass('h-full');
      });
    });
  });

  describe('Hover Effects', () => {
    test('should have hover effects on member cards', () => {
      render(<TeamSection members={mockMembers} />);
      const card = screen.getByTestId('member-card-member-1');
      expect(card).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Social Links', () => {
    test('should render social links with correct attributes', () => {
      render(<TeamSection members={mockMembers} />);
      const memberCard = screen.getByTestId('member-card-member-1');
      fireEvent.mouseEnter(memberCard);

      const linkedinLink = screen.getByTestId('social-link-member-1-linkedin');
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johnsmith');
      expect(linkedinLink).toHaveAttribute('target', '_blank');
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('should display social link icons', () => {
      render(<TeamSection members={mockMembers} />);
      const memberCard = screen.getByTestId('member-card-member-1');
      fireEvent.mouseEnter(memberCard);

      const linkedinLink = screen.getByTestId('social-link-member-1-linkedin');
      expect(linkedinLink).toHaveTextContent('🔗');
    });
  });

  describe('Department Badge', () => {
    test('should display department badge for each member', () => {
      render(<TeamSection members={mockMembers} />);
      mockMembers.forEach((member) => {
        const badge = screen.getByTestId(`department-badge-${member.id}`);
        expect(badge).toHaveTextContent(member.department);
      });
    });

    test('should have consistent styling for department badges', () => {
      render(<TeamSection members={mockMembers} />);
      const badge = screen.getByTestId('department-badge-member-1');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700');
    });
  });

  describe('Member Information Display', () => {
    test('should display member name, position, and bio', () => {
      render(<TeamSection members={mockMembers} />);
      const member = mockMembers[0];
      
      expect(screen.getByText(member.name)).toBeInTheDocument();
      expect(screen.getByText(member.position)).toBeInTheDocument();
      expect(screen.getByText(member.bio)).toBeInTheDocument();
    });

    test('should display position in blue color', () => {
      render(<TeamSection members={mockMembers} />);
      const position = screen.getByText('Chief Executive Officer');
      expect(position).toHaveClass('text-blue-600');
    });
  });

  describe('Filter Button Styling', () => {
    test('should have correct styling for active filter button', async () => {
      render(<TeamSection members={mockMembers} />);
      const engineeringFilter = screen.getByTestId('filter-Engineering');

      fireEvent.click(engineeringFilter);

      await waitFor(() => {
        expect(engineeringFilter).toHaveClass('bg-blue-600', 'text-white');
      });
    });

    test('should have correct styling for inactive filter button', () => {
      render(<TeamSection members={mockMembers} />);
      const designFilter = screen.getByTestId('filter-Design');

      expect(designFilter).toHaveClass('bg-white', 'text-gray-700', 'border', 'border-gray-300');
    });
  });
});
