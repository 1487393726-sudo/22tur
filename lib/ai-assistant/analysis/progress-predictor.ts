/**
 * Progress Predictor
 * Predicts project completion date and identifies risk factors
 * **Property 3: 进度预测准确性**
 */

import { ProjectContext, ProgressPrediction } from '../types';
import { getOpenAIProvider } from '../openai-integration';
import { getEffectiveAIConfig } from '../config-manager';

/**
 * Predict project progress and completion date
 * @param projectId - Project ID
 * @param context - Project context
 * @returns Progress prediction
 */
export async function predictProgress(
  projectId: string,
  context: ProjectContext
): Promise<ProgressPrediction> {
  try {
    // Calculate basic metrics
    const completionRate = calculateCompletionRate(context);
    const velocity = calculateVelocity(context);
    const remainingTasks = context.tasks.filter((t) => t.status !== 'COMPLETED').length;

    // Estimate completion date
    const estimatedDays = remainingTasks > 0 ? Math.ceil(remainingTasks / velocity) : 0;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);

    // Get AI config
    const aiConfig = await getEffectiveAIConfig(projectId);

    // Build analysis prompt
    const prompt = buildProgressPredictionPrompt(context, completionRate, velocity);

    // Get LLM provider
    const llmProvider = getOpenAIProvider();

    // Send request to LLM
    const response = await llmProvider.sendRequest({
      prompt,
      systemPrompt: getProgressPredictionSystemPrompt(),
      temperature: 0.7,
      maxTokens: aiConfig.maxTokens,
      model: aiConfig.modelName,
    });

    // Parse LLM response
    const analysis = parseProgressAnalysis(response.content);

    // Calculate confidence
    const confidence = calculateConfidence(completionRate, velocity, context);
    const completionProbability = calculateCompletionProbability(
      estimatedCompletionDate,
      context.endDate,
      confidence
    );

    return {
      projectId,
      estimatedCompletionDate,
      confidence,
      completionProbability,
      riskFactors: analysis.riskFactors,
      recommendations: analysis.recommendations,
    };
  } catch (error) {
    console.error('Failed to predict progress:', error);
    throw new Error(
      `Progress prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build progress prediction prompt
 */
function buildProgressPredictionPrompt(
  context: ProjectContext,
  completionRate: number,
  velocity: number
): string {
  const completedTasks = context.tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasks = context.tasks.length;
  const remainingTasks = totalTasks - completedTasks;

  return `Analyze the project progress and predict completion:

Project: ${context.projectName}
Status: ${context.status}
Total Tasks: ${totalTasks}
Completed: ${completedTasks}
Remaining: ${remainingTasks}
Completion Rate: ${(completionRate * 100).toFixed(1)}%
Velocity: ${velocity.toFixed(2)} tasks/week

Historical Data:
- Average Completion Time: ${context.historicalData?.averageCompletionTime || 'N/A'} days
- Velocity Trend: ${context.historicalData?.velocityTrend?.join(', ') || 'N/A'}

Please provide:
1. Risk factors that could impact completion
2. Recommendations to accelerate progress
3. Confidence level in the prediction

Format your response as JSON:
{
  "riskFactors": ["risk1", "risk2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "confidenceFactors": "explanation of confidence level"
}`;
}

/**
 * Get system prompt for progress prediction
 */
function getProgressPredictionSystemPrompt(): string {
  return `You are an expert project management AI assistant specializing in progress forecasting.

When predicting project progress, consider:
1. Historical velocity and trends
2. Task complexity and dependencies
3. Team capacity and availability
4. External risks and blockers
5. Scope changes and unknowns

Provide realistic predictions with clear risk assessment.`;
}

/**
 * Parse progress analysis from LLM response
 */
function parseProgressAnalysis(response: string): {
  riskFactors: string[];
  recommendations: string[];
} {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        riskFactors: ['Unable to analyze risks'],
        recommendations: ['Continue monitoring progress'],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      riskFactors: parsed.riskFactors || [],
      recommendations: parsed.recommendations || [],
    };
  } catch (error) {
    console.error('Failed to parse progress analysis:', error);
    return {
      riskFactors: ['Analysis pending'],
      recommendations: ['Continue monitoring progress'],
    };
  }
}

/**
 * Calculate completion rate
 */
function calculateCompletionRate(context: ProjectContext): number {
  if (context.tasks.length === 0) return 0;
  const completed = context.tasks.filter((t) => t.status === 'COMPLETED').length;
  return completed / context.tasks.length;
}

/**
 * Calculate project velocity (tasks per week)
 */
function calculateVelocity(context: ProjectContext): number {
  if (!context.historicalData || context.historicalData.velocityTrend.length === 0) {
    return 1; // Default to 1 task per week
  }

  const trend = context.historicalData.velocityTrend;
  const average = trend.reduce((a, b) => a + b, 0) / trend.length;
  return Math.max(0.5, average); // Minimum 0.5 tasks per week
}

/**
 * Calculate prediction confidence (0-1)
 */
function calculateConfidence(
  completionRate: number,
  velocity: number,
  context: ProjectContext
): number {
  let confidence = 0.5; // Base confidence

  // Increase confidence if we have good historical data
  if (context.historicalData && context.historicalData.velocityTrend.length >= 4) {
    confidence += 0.2;
  }

  // Increase confidence if we have good completion rate
  if (completionRate > 0.3) {
    confidence += 0.15;
  }

  // Increase confidence if velocity is stable
  if (velocity > 0.5) {
    confidence += 0.15;
  }

  return Math.min(1, confidence);
}

/**
 * Calculate probability of completing by deadline
 */
function calculateCompletionProbability(
  estimatedDate: Date,
  deadline: Date | undefined,
  confidence: number
): number {
  if (!deadline) {
    return confidence; // No deadline, use confidence as probability
  }

  const daysUntilDeadline = Math.floor(
    (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilEstimated = Math.floor(
    (estimatedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilEstimated <= daysUntilDeadline) {
    return Math.min(1, confidence + 0.2); // On track or ahead
  }

  const daysLate = daysUntilEstimated - daysUntilDeadline;
  const delayPenalty = Math.min(0.5, daysLate * 0.05); // 5% penalty per day late
  return Math.max(0, confidence - delayPenalty);
}

/**
 * Identify critical path tasks
 */
export function identifyCriticalPathTasks(context: ProjectContext): string[] {
  const incompleteTasks = context.tasks.filter((t) => t.status !== 'COMPLETED');
  
  // Sort by due date and priority
  const sorted = incompleteTasks.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  });

  // Return top 5 critical tasks
  return sorted.slice(0, 5).map((t) => t.id);
}

/**
 * Calculate burn-down rate
 */
export function calculateBurnDownRate(context: ProjectContext): number {
  if (!context.historicalData || context.historicalData.totalTasks === 0) {
    return 0;
  }

  const completedTasks = context.historicalData.completedTasks;
  const totalTasks = context.historicalData.totalTasks;
  const avgCompletionTime = context.historicalData.averageCompletionTime;

  if (avgCompletionTime === 0) return 0;

  return completedTasks / avgCompletionTime; // Tasks per day
}
