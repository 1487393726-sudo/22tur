/**
 * Risk Analyzer
 * Identifies and analyzes project risks
 * **Property 4: 风险识别完整性**
 */

import { ProjectContext, RiskAnalysis, Risk } from '../types';
import { getOpenAIProvider } from '../openai-integration';
import { getEffectiveAIConfig } from '../config-manager';

/**
 * Analyze project risks
 * @param projectId - Project ID
 * @param context - Project context
 * @returns Risk analysis result
 */
export async function analyzeRisks(
  projectId: string,
  context: ProjectContext
): Promise<RiskAnalysis> {
  try {
    // Get AI config
    const aiConfig = await getEffectiveAIConfig(projectId);

    // Build analysis prompt
    const prompt = buildRiskAnalysisPrompt(context);

    // Get LLM provider
    const llmProvider = getOpenAIProvider();

    // Send request to LLM
    const response = await llmProvider.sendRequest({
      prompt,
      systemPrompt: getRiskAnalysisSystemPrompt(),
      temperature: 0.7,
      maxTokens: aiConfig.maxTokens,
      model: aiConfig.modelName,
    });

    // Parse LLM response
    const risks = parseRisks(response.content);

    // Calculate overall risk score
    const overallRiskScore = calculateOverallRiskScore(risks);

    // Identify critical risks
    const criticalRisks = risks.filter((r) => r.severity >= 0.7);

    // Generate mitigation strategies
    const mitigationStrategies = generateMitigationStrategies(risks);

    return {
      projectId,
      risks,
      overallRiskScore,
      criticalRisks,
      mitigationStrategies,
    };
  } catch (error) {
    console.error('Failed to analyze risks:', error);
    throw new Error(
      `Risk analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build risk analysis prompt
 */
function buildRiskAnalysisPrompt(context: ProjectContext): string {
  const taskSummary = context.tasks
    .map((t) => `- [${t.status}] ${t.title} (Priority: ${t.priority})`)
    .join('\n');

  const teamSummary = context.team
    .map((m) => `- ${m.name} (${m.role}, Availability: ${m.availability}%)`)
    .join('\n');

  return `Analyze the following project for potential risks:

Project: ${context.projectName}
Status: ${context.status}
Start Date: ${context.startDate?.toISOString().split('T')[0] || 'N/A'}
End Date: ${context.endDate?.toISOString().split('T')[0] || 'N/A'}
Budget: ${context.budget || 'N/A'}
Team Size: ${context.teamSize}

Tasks:
${taskSummary}

Team:
${teamSummary}

Please identify:
1. Technical risks
2. Resource risks
3. Schedule risks
4. Budget risks
5. External risks

For each risk, provide:
- Type and description
- Probability (0-1)
- Impact (0-1)
- Mitigation strategy

Format your response as JSON:
{
  "risks": [
    {
      "type": "risk type",
      "description": "description",
      "probability": 0.5,
      "impact": 0.7,
      "mitigation": "mitigation strategy"
    }
  ]
}`;
}

/**
 * Get system prompt for risk analysis
 */
function getRiskAnalysisSystemPrompt(): string {
  return `You are an expert project risk management consultant.

When analyzing project risks, consider:
1. Technical complexity and unknowns
2. Resource availability and skills
3. Schedule constraints and dependencies
4. Budget limitations
5. External factors and market conditions
6. Team experience and capacity
7. Scope creep potential

Provide comprehensive risk assessment with realistic probability and impact estimates.`;
}

/**
 * Parse risks from LLM response
 */
function parseRisks(response: string): Risk[] {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateDefaultRisks();
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const risks = parsed.risks || [];

    return risks.map((r: any, idx: number) => ({
      id: `risk-${idx}`,
      type: r.type || 'Unknown',
      description: r.description || 'No description',
      probability: Math.min(1, Math.max(0, r.probability || 0.5)),
      impact: Math.min(1, Math.max(0, r.impact || 0.5)),
      severity: (r.probability || 0.5) * (r.impact || 0.5),
      mitigationStrategy: r.mitigation || 'Monitor and assess',
    }));
  } catch (error) {
    console.error('Failed to parse risks:', error);
    return generateDefaultRisks();
  }
}

/**
 * Generate default risks if parsing fails
 */
function generateDefaultRisks(): Risk[] {
  return [
    {
      id: 'risk-1',
      type: 'Schedule',
      description: 'Potential delays in task completion',
      probability: 0.4,
      impact: 0.6,
      severity: 0.24,
      mitigationStrategy: 'Monitor progress closely and adjust timeline as needed',
    },
    {
      id: 'risk-2',
      type: 'Resource',
      description: 'Team member availability issues',
      probability: 0.3,
      impact: 0.7,
      severity: 0.21,
      mitigationStrategy: 'Cross-train team members and maintain resource buffer',
    },
  ];
}

/**
 * Calculate overall risk score (0-1)
 */
function calculateOverallRiskScore(risks: Risk[]): number {
  if (risks.length === 0) return 0;

  const totalSeverity = risks.reduce((sum, r) => sum + r.severity, 0);
  const averageSeverity = totalSeverity / risks.length;

  // Weight by number of risks
  const riskCount = risks.length;
  const countWeight = Math.min(1, riskCount / 10); // Max weight at 10 risks

  return Math.min(1, averageSeverity * (0.7 + countWeight * 0.3));
}

/**
 * Generate mitigation strategies
 */
function generateMitigationStrategies(risks: Risk[]): string[] {
  const strategies: string[] = [];

  // Group risks by type
  const risksByType = new Map<string, Risk[]>();
  risks.forEach((r) => {
    if (!risksByType.has(r.type)) {
      risksByType.set(r.type, []);
    }
    risksByType.get(r.type)!.push(r);
  });

  // Generate strategies for each type
  risksByType.forEach((typeRisks, type) => {
    const highSeverityRisks = typeRisks.filter((r) => r.severity >= 0.5);

    if (highSeverityRisks.length > 0) {
      const mitigations = highSeverityRisks
        .map((r) => r.mitigationStrategy)
        .filter((m) => m);

      mitigations.forEach((m) => {
        if (!strategies.includes(m)) {
          strategies.push(m);
        }
      });
    }
  });

  // Add general strategies
  if (strategies.length === 0) {
    strategies.push('Establish regular risk review meetings');
    strategies.push('Maintain contingency buffer in schedule and budget');
    strategies.push('Document assumptions and dependencies');
  }

  return strategies.slice(0, 5); // Return top 5 strategies
}

/**
 * Identify risk categories
 */
export function identifyRiskCategories(risks: Risk[]): Record<string, Risk[]> {
  const categories: Record<string, Risk[]> = {};

  risks.forEach((risk) => {
    if (!categories[risk.type]) {
      categories[risk.type] = [];
    }
    categories[risk.type].push(risk);
  });

  return categories;
}

/**
 * Calculate risk exposure
 */
export function calculateRiskExposure(risks: Risk[]): number {
  return risks.reduce((sum, r) => sum + r.probability * r.impact, 0);
}

/**
 * Prioritize risks by severity
 */
export function prioritizeRisks(risks: Risk[]): Risk[] {
  return [...risks].sort((a, b) => b.severity - a.severity);
}

/**
 * Generate risk report
 */
export function generateRiskReport(analysis: RiskAnalysis): string {
  const lines: string[] = [
    `# Risk Analysis Report`,
    `Project: ${analysis.projectId}`,
    `Overall Risk Score: ${(analysis.overallRiskScore * 100).toFixed(1)}%`,
    ``,
    `## Critical Risks (${analysis.criticalRisks.length})`,
  ];

  analysis.criticalRisks.forEach((risk) => {
    lines.push(`- ${risk.type}: ${risk.description}`);
    lines.push(`  Severity: ${(risk.severity * 100).toFixed(1)}%`);
  });

  lines.push(``, `## Mitigation Strategies`);
  analysis.mitigationStrategies.forEach((strategy) => {
    lines.push(`- ${strategy}`);
  });

  return lines.join('\n');
}
