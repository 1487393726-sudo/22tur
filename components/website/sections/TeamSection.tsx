'use client';

import React, { useState, useMemo } from 'react';
import type { TeamMember } from '@/types/website';

interface TeamSectionProps {
  members: TeamMember[];
  onMemberClick?: (memberId: string) => void;
  className?: string;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
  members,
  onMemberClick,
  className = '',
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Extract unique departments from members
  const departments = useMemo(() => {
    const uniqueDepartments = Array.from(new Set(members.map((m) => m.department)));
    return uniqueDepartments.sort();
  }, [members]);

  // Filter members by selected department
  const filteredMembers = useMemo(() => {
    if (!selectedDepartment) {
      return members;
    }
    return members.filter((m) => m.department === selectedDepartment);
  }, [members, selectedDepartment]);

  const handleMemberClick = (memberId: string) => {
    onMemberClick?.(memberId);
  };

  const handleDepartmentFilter = (department: string | null) => {
    setSelectedDepartment(department);
  };

  return (
    <section
      className={`w-full py-12 md:py-16 lg:py-20 bg-light ${className}`}
      data-testid="team-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Team
          </h2>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Meet our talented team of professionals dedicated to delivering excellence and
            innovation.
          </p>
        </div>

        {/* Department Filter */}
        {departments.length > 0 && (
          <div className="mb-12" data-testid="department-filter">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleDepartmentFilter(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedDepartment === null
                    ? 'btn-primary'
                    : 'bg-light text-primary border border-border-light hover:border-primary'
                }`}
                data-testid="filter-all"
              >
                All Departments
              </button>
              {departments.map((department) => (
                <button
                  key={department}
                  onClick={() => handleDepartmentFilter(department)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedDepartment === department
                      ? 'btn-primary'
                      : 'bg-light text-primary border border-border-light hover:border-primary'
                  }`}
                  data-testid={`filter-${department}`}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members Grid */}
        {filteredMembers.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-testid="members-grid"
          >
            {filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onMemberClick={handleMemberClick}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12"
            data-testid="empty-state"
          >
            <p className="text-secondary text-lg">
              No team members found for the selected department.
            </p>
          </div>
        )}

        {/* Results Count */}
        {filteredMembers.length > 0 && (
          <div className="text-center mt-8" data-testid="results-count">
            <p className="text-secondary">
              Showing {filteredMembers.length} of {members.length} team members
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

interface TeamMemberCardProps {
  member: TeamMember;
  onMemberClick: (memberId: string) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onMemberClick }) => {
  const [showSocial, setShowSocial] = useState(false);

  const handleClick = () => {
    onMemberClick(member.id);
  };

  return (
    <div
      className="team-member rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full"
      onClick={handleClick}
      onMouseEnter={() => setShowSocial(true)}
      onMouseLeave={() => setShowSocial(false)}
      data-testid={`member-card-${member.id}`}
    >
      {/* Avatar */}
      <div className="relative w-full h-64 bg-neutral-200 overflow-hidden">
        <img
          src={member.avatar}
          alt={member.name}
          className="w-full h-full object-cover"
        />
        {/* Social Links Overlay */}
        {member.socialLinks && member.socialLinks.length > 0 && (
          <div
            className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4 transition-opacity ${
              showSocial ? 'opacity-100' : 'opacity-0'
            }`}
            data-testid={`social-overlay-${member.id}`}
          >
            {member.socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-light hover:text-secondary-400 transition-colors"
                aria-label={`${link.platform} profile`}
                data-testid={`social-link-${member.id}-${link.platform}`}
              >
                <span className="text-2xl">{link.icon}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Name */}
        <h3 className="team-member-name text-xl font-bold mb-1">
          {member.name}
        </h3>

        {/* Position */}
        <p className="text-primary font-semibold text-sm mb-2">
          {member.position}
        </p>

        {/* Department Badge */}
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 bg-neutral-100 text-primary text-xs font-medium rounded-full"
            data-testid={`department-badge-${member.id}`}
          >
            {member.department}
          </span>
        </div>

        {/* Bio */}
        <p className="text-secondary text-sm line-clamp-3">
          {member.bio}
        </p>
      </div>
    </div>
  );
};

export default TeamSection;
