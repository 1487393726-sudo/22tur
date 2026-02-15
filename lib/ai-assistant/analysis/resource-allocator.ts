/**
 * Resource Allocator
 * Analyzes and optimizes resource allocation
 * **Property 5: 资源分配优化**
 */

import { ProjectContext, ResourceAllocationResult, AllocationSuggestion } from '../types';
import { getOpenAIProvider } from '../openai-integration';
import { getEffectiveAIConfig } from '../config-manager';

/**
 * Analyze resource allocation and generate suggestions
 * @param projectId - Project ID
 * @param context - Project context
 * @returns Resource allocation result
 */
export async function analyzeResourceAllocation(
  projectId: string,
  context: ProjectContext
): Promise<ResourceAllocationResult> {
  try {
    // Get AI config
    const aiConfig = await getEffectiveAIConfig(projectId);

    // Build analysis prompt
    const prompt = buildResourceAllocationPrompt(context);

    // Get LLM provider
    const llmProvider = getOpenAIProvider();

    // Send request to LLM
    const response = await llmProvider.sendRequest({
      prompt,
      systemPrompt: getResourceAllocationSystemPrompt(),
      temperature: 0.7,
      maxTokens: aiConfig.maxTokens,
      model: aiConfig.modelName,
    });

    // Parse LLM response
    const suggestions = parseAllocationSuggestions(response.content, context);

    // Calculate metrics
    const currentUtilization = calculateCurrentUtilization(context);
    const suggestedUtilization = calculateSuggestedUtilization(suggestions);
    const utilizationImprovement = suggestedUtilization - currentUtilization;

    const currentBalance = calculateWorkloadBalance(context.team);
    const suggestedBalance = calculateSuggestedBalance(suggestions);

    return {
      projectId,
      suggestions,
      expectedUtilizationImprovement: Math.max(0, utilizationImprovement),
      workloadBalance: suggestedBalance,
    };
  } catch (error) {
    console.error('Failed to analyze resource allocation:', error);
    throw new Error(
      `Resource allocation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build resource allocation prompt
 */
function buildResourceAllocationPrompt(context: ProjectContext): string {
  const teamSummary = context.team
    .map(
      (m) =>
        `- ${m.name} (${m.role}, Skills: ${m.skills.join(', ') || 'N/A'}, Availability: ${m.availability}%, Workload: ${m.workload}%)`
    )
    .join('\n');

  const taskSummary = context.tasks
    .map(
      (t) =>
        `- [${t.status}] ${t.title} (Priority: ${t.priority}, Assignee: ${t.assignee || 'Unassigned'}, Est. Hours: ${t.estimatedHours || 'N/A'})`
    )
    .join('\n');

  return `Analyze resource allocation and provide optimization recommendations:

Project: ${context.projectName}
Status: ${context.status}
Team Size: ${context.teamSize}

Team Members:
${teamSummary}

Tasks:
${taskSummary}

Please provide:
1. Optimal task assignments for each team member
2. Workload balancing recommendations
3. Skill matching analysis
4. Resource utilization improvements

Format your response as JSON:
{
  "suggestions": [
    {
      "memberId": "member-id",
      "memberName": "name",
      "currentWorkload": 75,
      "suggestedWorkload": 85,
      "suggestedTasks": ["task-id-1", "task-id-2"],
      "reasoning": "explanation"
    }
  ],
  "overallAnalysis": "summary of allocation optimization"
}`;
}

/**
 * Get system prompt for resource allocation
 */
function getResourceAllocationSystemPrompt(): string {
  return `You are an expert resource management consultant.

When analyzing resource allocation, consider:
1. Team member skills and expertise
2. Task requirements and complexity
3. Current workload and availability
4. Learning opportunities and growth
5. Team dynamics and collaboration
6. Bottlenecks and dependencies
7. Capacity planning

Provide balanced recommendations that optimize both efficiency and team satisfaction.`;
}

/**
 * Parse allocation suggestions from LLM response
 */
function parseAllocationSuggestions(
  response: string,
  context: ProjectContext
): AllocationSuggestion[] {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateDefaultSuggestions(context);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = parsed.suggestions || [];

    return suggestions.map((s: any) => ({
      memberId: s.memberId || '',
      memberName: s.memberName || 'Unknown',
      currentWorkload: s.currentWorkload || 50,
      suggestedWorkload: s.suggestedWorkload || 50,
      suggestedTasks: s.suggestedTasks || [],
      reasoning: s.reasoning || 'No reasoning provided',
    }));
  } catch (error) {
    console.error('Failed to parse allocation suggestions:', error);
    return generateDefaultSuggestions(context);
  }
}

/**
 * Generate default suggestions if parsing fails
 */
function generateDefaultSuggestions(context: ProjectContext): AllocationSuggestion[] {
  return context.team.map((member) => ({
    memberId: member.id,
    memberName: member.name,
    currentWorkload: member.workload,
    suggestedWorkload: member.workload,
    suggestedTasks: [],
    reasoning: 'Allocation analysis pending',
  }));
}

/**
 * Calculate current team utilization
 */
function calculateCurrentUtilization(context: ProjectContext): number {
  if (context.team.length === 0) return 0;

  const totalWorkload = context.team.reduce((sum, m) => sum + m.workload, 0);
  return totalWorkload / context.team.length;
}

/**
 * Calculate suggested utilization
 */
function calculateSuggestedUtilization(suggestions: AllocationSuggestion[]): number {
  if (suggestions.length === 0) return 0;

  const totalWorkload = suggestions.reduce((sum, s) => sum + s.suggestedWorkload, 0);
  return totalWorkload / suggestions.length;
}

/**
 * Calculate workload balance (0-1, where 1 is perfectly balanced)
 */
function calculateWorkloadBalance(team: any[]): number {
  if (team.length === 0) return 1;

  const workloads = team.map((m) => m.workload);
  const average = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / workloads.length;
  const stdDev = Math.sqrt(variance);

  // Convert standard deviation to balance score (0-1)
  // Lower std dev = better balance
  return Math.max(0, 1 - stdDev / 50); // Normalize by 50%
}

/**
 * Calculate suggested workload balance
 */
function calculateSuggestedBalance(suggestions: AllocationSuggestion[]): number {
  if (suggestions.length === 0) return 1;

  const workloads = suggestions.map((s) => s.suggestedWorkload);
  const average = workloads.reduce((a, b) => a + b, 0) / workloads.length;
  const variance = workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / workloads.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0, 1 - stdDev / 50);
}

/**
 * Calculate skill match score
 */
export function calculateSkillMatch(
  memberSkills: string[],
  taskRequirements: string[]
): number {
  if (taskRequirements.length === 0) return 1;

  const matches = taskRequirements.filter((req) =>
    memberSkills.some((skill) =>
      skill.toLowerCase().includes(req.toLowerCase())
    )
  ).length;

  return matches / taskRequirements.length;
}

/**
 * Find best team member for task
 */
export function findBestTeamMember(
  context: ProjectContext,
  taskRequirements: string[]
): any | null {
  let bestMember = null;
  let bestScore = -1;

  context.team.forEach((member) => {
    const skillMatch = calculateSkillMatch(member.skills, taskRequirements);
    const availabilityScore = member.availability / 100;
    const workloadScore = 1 - member.workload / 100;

    const totalScore = skillMatch * 0.5 + availabilityScore * 0.3 + workloadScore * 0.2;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMember = member;
    }
  });

  return bestMember;
}

/**
 * Generate resource report
 */
export function generateResourceReport(result: ResourceAllocationResult): string {
  const lines: string[] = [
    `# Resource Allocation Report`,
    `Project: ${result.projectId}`,
    `Utilization Improvement: ${(result.expectedUtilizationImprovement * 100).toFixed(1)}%`,
    `Workload Balance: ${(result.workloadBalance * 100).toFixed(1)}%`,
    ``,
    `## Allocation Suggestions`,
  ];

  result.suggestions.forEach((suggestion) => {
    lines.push(`### ${suggestion.memberName}`);
    lines.push(`Current Workload: ${suggestion.currentWorkload}%`);
    lines.push(`Suggested Workload: ${suggestion.suggestedWorkload}%`);
    lines.push(`Suggested Tasks: ${suggestion.suggestedTasks.length}`);
    lines.push(`Reasoning: ${suggestion.reasoning}`);
    lines.push('');
  });

  return lines.join('\n');
}
