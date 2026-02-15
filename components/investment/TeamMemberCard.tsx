import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Briefcase,
  Award,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

/**
 * Team member information
 * As defined in the design document section 8
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertiseLevel: 'junior' | 'mid' | 'senior' | 'lead';
  contributionScore: number;
  performanceRating: number;
}

/**
 * TeamMemberCard component props
 */
export interface TeamMemberCardProps {
  teamMembers: TeamMember[];
}

/**
 * TeamMemberCard Component
 * 
 * Displays team member information for a project investment.
 * Implements requirements 9.1, 9.2, 9.3, 9.5 from the design specification.
 * 
 * Display Elements:
 * - List of all team members assigned to the project (Requirement 9.1)
 * - Name, role, and expertise level for each member (Requirement 9.2)
 * - Contribution metrics and performance ratings (Requirement 9.3)
 * - Team composition summary by role (Requirement 9.5)
 * 
 * @param {TeamMemberCardProps} props - Component props
 * @returns {JSX.Element} Rendered team member card
 */
export function TeamMemberCard({
  teamMembers,
}: TeamMemberCardProps): JSX.Element {
  // Get expertise level configuration
  const getExpertiseLevelConfig = (level: TeamMember['expertiseLevel']) => {
    switch (level) {
      case 'lead':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          badgeVariant: 'default' as const,
          label: 'Lead',
        };
      case 'senior':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeVariant: 'default' as const,
          label: 'Senior',
        };
      case 'mid':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeVariant: 'secondary' as const,
          label: 'Mid-Level',
        };
      case 'junior':
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeVariant: 'outline' as const,
          label: 'Junior',
        };
    }
  };

  // Get performance rating configuration
  const getPerformanceConfig = (rating: number) => {
    if (rating >= 4.5) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Excellent',
      };
    } else if (rating >= 3.5) {
      return {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        label: 'Good',
      };
    } else if (rating >= 2.5) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        label: 'Average',
      };
    } else {
      return {
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        label: 'Needs Improvement',
      };
    }
  };

  // Calculate team composition by role - Requirement 9.5
  const teamComposition = teamMembers.reduce((acc, member) => {
    const role = member.role;
    if (!acc[role]) {
      acc[role] = 0;
    }
    acc[role]++;
    return acc;
  }, {} as Record<string, number>);

  // Sort roles by count (descending)
  const sortedRoles = Object.entries(teamComposition).sort(
    ([, countA], [, countB]) => countB - countA
  );

  // Calculate average metrics
  const averageContribution = teamMembers.length > 0
    ? teamMembers.reduce((sum, member) => sum + member.contributionScore, 0) / teamMembers.length
    : 0;

  const averagePerformance = teamMembers.length > 0
    ? teamMembers.reduce((sum, member) => sum + member.performanceRating, 0) / teamMembers.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'} working on this project
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Team Composition Summary - Requirement 9.5 */}
        {sortedRoles.length > 0 && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-slate-600" />
              <h3 className="text-sm font-semibold">Team Composition</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedRoles.map(([role, count]) => (
                <div key={role} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                  <span className="text-sm font-medium truncate">{role}</span>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Average Metrics */}
        {teamMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Average Contribution Score */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Avg. Contribution</span>
                <span className="font-bold text-xl text-blue-900">
                  {averageContribution.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Average Performance Rating */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="p-2 rounded-lg bg-green-100">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm text-muted-foreground">Avg. Performance</span>
                <span className="font-bold text-xl text-green-900">
                  {averagePerformance.toFixed(1)}/5.0
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Team Members List - Requirements 9.1, 9.2, 9.3 */}
        {teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No team members assigned yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Team Members</h3>
            <div className="space-y-3">
              {teamMembers.map((member) => {
                const expertiseConfig = getExpertiseLevelConfig(member.expertiseLevel);
                const performanceConfig = getPerformanceConfig(member.performanceRating);

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    {/* Member Header - Requirement 9.2 */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Avatar placeholder */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
                          {member.name.split(' ').length > 1
                            ? member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                            : member.name.slice(0, 2).toUpperCase()
                          }
                        </div>
                        
                        <div className="flex flex-col min-w-0 flex-1">
                          <h4 className="font-semibold text-base truncate">
                            {member.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Level Badge - Requirement 9.2 */}
                      <Badge variant={expertiseConfig.badgeVariant} className="shrink-0">
                        {expertiseConfig.label}
                      </Badge>
                    </div>

                    {/* Member Metrics - Requirement 9.3 */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Contribution Score */}
                      <div className={`p-3 rounded-lg ${expertiseConfig.bgColor} border ${expertiseConfig.borderColor}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Contribution</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-bold ${expertiseConfig.color}`}>
                            {member.contributionScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">/100</span>
                        </div>
                      </div>

                      {/* Performance Rating */}
                      <div className={`p-3 rounded-lg ${performanceConfig.bgColor}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Performance</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-bold ${performanceConfig.color}`}>
                            {member.performanceRating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">/5.0</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(member.performanceRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {teamMembers.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Team of <span className="font-semibold">{teamMembers.length}</span> members
              {' • '}
              <span className="font-semibold">{sortedRoles.length}</span> {sortedRoles.length === 1 ? 'role' : 'roles'}
              {' • '}
              Avg. performance: <span className="font-semibold text-green-600">
                {averagePerformance.toFixed(1)}/5.0
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
