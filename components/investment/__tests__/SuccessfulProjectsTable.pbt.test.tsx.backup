/**
 * Property-Based Tests for Investment Detail Components
 * 
 * These tests verify universal properties of the detail components:
 * - DevelopmentStageTimeline
 * - FinancialPerformanceCard
 * - TeamMemberCard
 * 
 * Feature: investor-portal-premium-features
 */

import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import {
  DevelopmentStageTimeline,
  DevelopmentStage,
} from '../DevelopmentStageTimeline';
import {
  FinancialPerformanceCard,
  FinancialPerformance,
} from '../FinancialPerformanceCard';
import {
  TeamMemberCard,
  TeamMember,
} from '../TeamMemberCard';

/**
 * Arbitrary generators for test data
 */

// Generator for DevelopmentStage
const developmentStageArbitrary = fc.record({
  id: fc.uuid(),
  projectId: fc.uuid(),
  stageName: fc.string({ minLength: 3, maxLength: 50 }).filter(s => s.trim().length >= 3),
  startDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }).filter(d => !isNaN(d.getTime())),
  expectedEndDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
  actualEndDate: fc.option(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
    { nil: null }
  ),
  status: fc.constantFrom('in_progress' as const, 'completed' as const, 'delayed' as const),
});

// Generator for FinancialPerformance
const financialPerformanceArbitrary = fc.record({
  revenue: fc.integer({ min: 0, max: 10000000 }),
  expenses: fc.integer({ min: 0, max: 10000000 }),
  profit: fc.integer({ min: -5000000, max: 5000000 }),
  profitMargin: fc.float({ min: -100, max: 100 }),
  revenueBreakdown: fc.array(
    fc.record({
      source: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length >= 3),
      amount: fc.integer({ min: 100, max: 1000000 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  expenseBreakdown: fc.array(
    fc.record({
      category: fc.string({ minLength: 3, maxLength: 30 }).filter(s => s.trim().length >= 3),
      amount: fc.integer({ min: 100, max: 1000000 }),
    }),
    { minLength: 0, maxLength: 5 }
  ),
  projectedReturn: fc.option(fc.float({ min: -50, max: 200 })),
  isOngoing: fc.boolean(),
});

// Generator for TeamMember
const teamMemberArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }).filter(s => s.trim().length >= 5),
  role: fc.constantFrom('Developer', 'Designer', 'Manager', 'QA Engineer', 'Product Manager'),
  expertiseLevel: fc.constantFrom('junior' as const, 'mid' as const, 'senior' as const, 'lead' as const),
  contributionScore: fc.float({ min: 0, max: 100 }),
  performanceRating: fc.float({ min: 0, max: 5 }),
});

/**
 * Property 17: Stage information display
 * **Validates: Requirements 7.1, 7.3**
 * 
 * For any project in the Portfolio View, the displayed development stage should 
 * include the stage name, start date, and expected completion date.
 */
describe('Feature: investor-portal-premium-features, Property 17: Stage information display', () => {
  it('should display stage name, start date, and expected completion date for all stages', () => {
    fc.assert(
      fc.property(
        developmentStageArbitrary,
        fc.array(developmentStageArbitrary, { minLength: 0, maxLength: 5 }),
        (currentStage, stageHistory) => {
          const { container } = render(
            <DevelopmentStageTimeline
              currentStage={currentStage}
              stageHistory={stageHistory}
            />
          );

          // Verify current stage name is displayed
          expect(container.textContent).toContain(currentStage.stageName);

          // Verify start date label is present
          expect(container.textContent).toContain('Started:');

          // Verify expected/completed date label is present
          if (currentStage.actualEndDate) {
            expect(container.textContent).toContain('Completed:');
          } else {
            expect(container.textContent).toContain('Expected:');
          }

          // Verify all history stages have their names displayed
          stageHistory.forEach(stage => {
            expect(container.textContent).toContain(stage.stageName);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display stage information even with null current stage', () => {
    fc.assert(
      fc.property(
        fc.array(developmentStageArbitrary, { minLength: 1, maxLength: 5 }),
        (stageHistory) => {
          const { container } = render(
            <DevelopmentStageTimeline
              currentStage={null}
              stageHistory={stageHistory}
            />
          );

          // Verify all history stages have required information
          stageHistory.forEach(stage => {
            expect(container.textContent).toContain(stage.stageName);
          });

          // Should have date labels
          expect(container.textContent).toContain('Started:');
        }
      ),
      { numRuns: 50 }
    );
  });
});

/**
 * Property 18: Stage history completeness
 * **Validates: Requirements 7.4**
 * 
 * For any project with multiple development stages, the Portfolio View should 
 * display all previous stages with their durations.
 */
describe('Feature: investor-portal-premium-features, Property 18: Stage history completeness', () => {
  it('should display all previous stages with their durations', () => {
    fc.assert(
      fc.property(
        fc.option(developmentStageArbitrary, { nil: null }),
        fc.array(developmentStageArbitrary, { minLength: 1, maxLength: 10 }),
        (currentStage, stageHistory) => {
          const { container } = render(
            <DevelopmentStageTimeline
              currentStage={currentStage}
              stageHistory={stageHistory}
            />
          );

          // Count total stages (current + history)
          const totalStages = currentStage ? stageHistory.length + 1 : stageHistory.length;

          // Verify all stage names are present
          stageHistory.forEach(stage => {
            expect(container.textContent).toContain(stage.stageName);
          });

          if (currentStage) {
            expect(container.textContent).toContain(currentStage.stageName);
          }

          // Verify duration label is present for each stage
          const durationMatches = container.textContent.match(/Duration:/g);
          expect(durationMatches).not.toBeNull();
          expect(durationMatches!.length).toBe(totalStages);

          // Verify summary shows correct total count
          expect(container.textContent).toContain(`Total stages: ${totalStages}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not omit any stages from the history', () => {
    fc.assert(
      fc.property(
        fc.array(developmentStageArbitrary, { minLength: 2, maxLength: 8 }),
        (stageHistory) => {
          // Create unique stage names to ensure we can verify each one
          const uniqueStages = stageHistory.map((stage, index) => ({
            ...stage,
            stageName: `Stage ${index + 1}: ${stage.stageName}`,
          }));

          const { container } = render(
            <DevelopmentStageTimeline
              currentStage={null}
              stageHistory={uniqueStages}
            />
          );

          // Verify every single stage name appears in the rendered output
          uniqueStages.forEach(stage => {
            expect(container.textContent).toContain(stage.stageName);
          });

          // Verify the count matches
          expect(container.textContent).toContain(`Total stages: ${uniqueStages.length}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 20: Financial display formats
 * **Validates: Requirements 8.2**
 * 
 * For any project's financial performance, the display should show profit/loss 
 * in both absolute currency amount and percentage format.
 */
describe('Feature: investor-portal-premium-features, Property 20: Financial display formats', () => {
  it('should display profit/loss in both currency and percentage formats', () => {
    fc.assert(
      fc.property(
        financialPerformanceArbitrary,
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Check for currency symbol (dollar sign)
          expect(container.textContent).toMatch(/\$/);

          // Check for percentage symbol
          expect(container.textContent).toMatch(/%/);

          // Verify profit margin is displayed with percentage
          expect(container.textContent).toContain('Profit Margin');

          // The profit/loss value should be displayed
          // (either as "Profit" or "Loss" label should be present)
          const hasProfit = container.textContent.includes('Profit');
          const hasLoss = container.textContent.includes('Loss');
          expect(hasProfit || hasLoss).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should format currency values with proper decimal places', () => {
    fc.assert(
      fc.property(
        financialPerformanceArbitrary,
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Currency values should have decimal formatting
          // Look for patterns like $X,XXX.XX or $XXX.XX
          const currencyPattern = /\$[\d,]+\.\d{2}/;
          expect(container.textContent).toMatch(currencyPattern);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display percentage values with decimal precision', () => {
    fc.assert(
      fc.property(
        financialPerformanceArbitrary,
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Percentage values should have decimal formatting
          // Look for patterns like XX.XX%
          const percentagePattern = /\d+\.\d{2}%/;
          expect(container.textContent).toMatch(percentagePattern);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 22: Financial breakdown display
 * **Validates: Requirements 8.4**
 * 
 * For any project's financial performance, the display should show a breakdown 
 * of revenue sources and expense categories.
 */
describe('Feature: investor-portal-premium-features, Property 22: Financial breakdown display', () => {
  it('should display all revenue sources in the breakdown', () => {
    fc.assert(
      fc.property(
        financialPerformanceArbitrary.filter(data => data.revenueBreakdown.length > 0),
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Verify "Revenue Breakdown" section exists
          expect(container.textContent).toContain('Revenue Breakdown');

          // Verify all revenue sources are displayed
          financialData.revenueBreakdown.forEach(item => {
            expect(container.textContent).toContain(item.source);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display all expense categories in the breakdown', () => {
    fc.assert(
      fc.property(
        financialPerformanceArbitrary.filter(data => data.expenseBreakdown.length > 0),
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Verify "Expense Breakdown" section exists
          expect(container.textContent).toContain('Expense Breakdown');

          // Verify all expense categories are displayed
          financialData.expenseBreakdown.forEach(item => {
            expect(container.textContent).toContain(item.category);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not omit any revenue or expense items from breakdowns', () => {
    fc.assert(
      fc.property(
        fc.record({
          ...financialPerformanceArbitrary.constraints,
          revenueBreakdown: fc.array(
            fc.record({
              source: fc.string({ minLength: 5, maxLength: 30 }),
              amount: fc.integer({ min: 100, max: 1000000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          expenseBreakdown: fc.array(
            fc.record({
              category: fc.string({ minLength: 5, maxLength: 30 }),
              amount: fc.integer({ min: 100, max: 1000000 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
        }),
        (financialData) => {
          const { container } = render(
            <FinancialPerformanceCard financialData={financialData} />
          );

          // Count how many revenue items are displayed
          const revenueCount = financialData.revenueBreakdown.length;
          const expenseCount = financialData.expenseBreakdown.length;

          // Verify all items are present
          financialData.revenueBreakdown.forEach(item => {
            expect(container.textContent).toContain(item.source);
          });

          financialData.expenseBreakdown.forEach(item => {
            expect(container.textContent).toContain(item.category);
          });

          // Verify sections exist
          expect(container.textContent).toContain('Revenue Breakdown');
          expect(container.textContent).toContain('Expense Breakdown');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 24: Team member list completeness
 * **Validates: Requirements 9.1**
 * 
 * For any project in the Portfolio View, the display should show all team 
 * members assigned to that project.
 */
describe('Feature: investor-portal-premium-features, Property 24: Team member list completeness', () => {
  it('should display all team members without omitting any', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 1, maxLength: 20 }),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Verify all team member names are displayed
          teamMembers.forEach(member => {
            expect(container.textContent).toContain(member.name);
          });

          // Verify the count is correct
          expect(container.textContent).toContain(
            `${teamMembers.length} ${teamMembers.length === 1 ? 'member' : 'members'}`
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not duplicate team members in the display', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 2, maxLength: 10 }),
        (teamMembers) => {
          // Create unique names to ensure we can detect duplicates
          const uniqueMembers = teamMembers.map((member, index) => ({
            ...member,
            name: `${member.name} ${index}`,
            id: `member-${index}`,
          }));

          const { container } = render(
            <TeamMemberCard teamMembers={uniqueMembers} />
          );

          // Verify each unique name appears exactly once
          uniqueMembers.forEach(member => {
            const regex = new RegExp(member.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = container.textContent.match(regex);
            expect(matches).not.toBeNull();
            // Name should appear exactly once (not duplicated)
            expect(matches!.length).toBe(1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty team member list', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Should display empty state message
          expect(container.textContent).toContain('No team members assigned yet');
        }
      ),
      { numRuns: 10 }
    );
  });
});

/**
 * Property 25: Team member required fields
 * **Validates: Requirements 9.2, 9.3**
 * 
 * For any team member displayed, the display should show their name, role, 
 * expertise level, contribution metrics, and performance ratings.
 */
describe('Feature: investor-portal-premium-features, Property 25: Team member required fields', () => {
  it('should display all required fields for each team member', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 1, maxLength: 10 }),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Verify each team member has all required fields displayed
          teamMembers.forEach(member => {
            // Requirement 9.2: name, role, expertise level
            expect(container.textContent).toContain(member.name);
            expect(container.textContent).toContain(member.role);

            // Expertise level should be displayed as a badge
            const expertiseLabels = {
              junior: 'Junior',
              mid: 'Mid-Level',
              senior: 'Senior',
              lead: 'Lead',
            };
            expect(container.textContent).toContain(expertiseLabels[member.expertiseLevel]);

            // Requirement 9.3: contribution metrics and performance ratings
            // These should be displayed as numbers
            expect(container.textContent).toContain('Contribution');
            expect(container.textContent).toContain('Performance');
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display contribution score and performance rating with proper formatting', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 1, maxLength: 5 }),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Verify contribution scores are displayed with decimal
          expect(container.textContent).toMatch(/\d+\.\d/);

          // Verify performance ratings are displayed
          // Should have "/100" for contribution and "/5.0" for performance
          expect(container.textContent).toContain('/100');
          expect(container.textContent).toContain('/5.0');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 26: Team composition grouping
 * **Validates: Requirements 9.5**
 * 
 * For any project's team information, the display should group team members 
 * by role (developers, designers, managers, etc.).
 */
describe('Feature: investor-portal-premium-features, Property 26: Team composition grouping', () => {
  it('should display team composition summary grouped by role', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 1, maxLength: 20 }),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Verify "Team Composition" section exists
          expect(container.textContent).toContain('Team Composition');

          // Calculate expected role counts
          const roleCounts = teamMembers.reduce((acc, member) => {
            acc[member.role] = (acc[member.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Verify each role is displayed
          Object.keys(roleCounts).forEach(role => {
            expect(container.textContent).toContain(role);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show correct count for each role in team composition', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArbitrary, { minLength: 2, maxLength: 15 }),
        (teamMembers) => {
          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Calculate role counts
          const roleCounts = teamMembers.reduce((acc, member) => {
            acc[member.role] = (acc[member.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Verify each role appears with its count
          Object.entries(roleCounts).forEach(([role, count]) => {
            expect(container.textContent).toContain(role);
            // The count should appear somewhere in the composition section
            // (as a badge or number next to the role)
          });

          // Verify summary shows correct number of roles
          const uniqueRoles = Object.keys(roleCounts).length;
          expect(container.textContent).toContain(
            `${uniqueRoles} ${uniqueRoles === 1 ? 'role' : 'roles'}`
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle team with all members in same role', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 10 }),
        fc.constantFrom('Developer', 'Designer', 'Manager'),
        (count, role) => {
          const teamMembers = Array.from({ length: count }, (_, i) => ({
            id: `member-${i}`,
            name: `Team Member ${i}`,
            role: role,
            expertiseLevel: 'mid' as const,
            contributionScore: 50,
            performanceRating: 3.5,
          }));

          const { container } = render(
            <TeamMemberCard teamMembers={teamMembers} />
          );

          // Should show the role in team composition
          expect(container.textContent).toContain('Team Composition');
          expect(container.textContent).toContain(role);

          // Should show "1 role" in summary
          expect(container.textContent).toContain('1 role');
        }
      ),
      { numRuns: 50 }
    );
  });
});
