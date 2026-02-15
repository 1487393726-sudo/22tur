/**
 * Task Optimizer
 * Analyzes tasks and provides optimization recommendations
 * **Property 2: 建议理由完整性**
 */

import { ProjectContext, TaskOptimizationResult, TaskSuggestion } from '../types';
import { getOpenAIProvider } from '../openai-integration';
import { getEffectiveAIConfig } from '../config-manager';

/**
 * Analyze tasks and generate optimization suggestions
 * @param projectId - Project ID
 * @param context - Project context
 * @returns Task optimization result
 */
export async function analyzeTaskOptimization(
  projectId: string,
  context: ProjectContext
): Promise<TaskOptimizationResult> {
  try {
    // Get AI config
    const aiConfig = await getEffectiveAIConfig(projectId);

    // Build analysis prompt
    const prompt = buildTaskOptimizationPrompt(context);

    // Get LLM provider
    const llmProvider = getOpenAIProvider();

    // Send request to LLM
    const response = await llmProvider.sendRequest({
      prompt,
      systemPrompt: getTaskOptimizationSystemPrompt(),
      temperature: 0.7,
      maxTokens: aiConfig.maxTokens,
      model: aiConfig.modelName,
    });

    // Parse LLM response
    const suggestions = parseTaskSuggestions(response.content, context);

    // Calculate efficiency gain
    const currentPriority = calculateCurrentPriority(context.tasks);
    const suggestedPriority = calculateSuggestedPriority(suggestions);
    const efficiencyGain = ((suggestedPriority - currentPriority) / currentPriority) * 100;

    // Estimate time to complete
    const estimatedTime = estimateCompletionTime(context.tasks, suggestions);

    return {
      projectId,
      suggestions,
      expectedEfficiencyGain: Math.max(0, efficiencyGain),
      estimatedTimeToComplete: estimatedTime,
    };
  } catch (error) {
    console.error('Failed to analyze task optimization:', error);
    throw new Error(
      `Task optimization analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Build task optimization analysis prompt
 */
function buildTaskOptimizationPrompt(context: ProjectContext): string {
  const taskSummary = context.tasks
    .map(
      (t) =>
        `- [${t.status}] ${t.title} (Priority: ${t.priority}, Assignee: ${t.assignee || 'Unassigned'})`
    )
    .join('\n');

  return `Analyze the following project tasks and provide optimization recommendations:

Project: ${context.projectName}
Status: ${context.status}
Team Size: ${context.teamSize}

Tasks:
${taskSummary}

Please provide:
1. Priority adjustments for each task
2. Reasoning for each adjustment
3. Estimated hours for each task
4. Overall efficiency improvement potential

Format your response as JSON with the following structure:
{
  "suggestions": [
    {
      "taskId": "task-id",
      "currentPriority": "HIGH",
      "suggestedPriority": "MEDIUM",
      "reasoning": "explanation",
      "estimatedHours": 8
    }
  ],
  "overallAnalysis": "summary of optimization opportunities"
}`;
}

/**
 * Get system prompt for task optimization
 */
function getTaskOptimizationSystemPrompt(): string {
  return `You are an expert project manager AI assistant. Your role is to analyze project tasks and provide optimization recommendations.

When analyzing tasks, consider:
1. Task dependencies and critical path
2. Team capacity and skills
3. Task complexity and risk
4. Resource availability
5. Project timeline and deadlines

Provide clear, actionable recommendations with detailed reasoning.`;
}

/**
 * Parse task suggestions from LLM response
 */
function parseTaskSuggestions(
  response: string,
  context: ProjectContext
): TaskSuggestion[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return generateDefaultSuggestions(context);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const suggestions = parsed.suggestions || [];

    return suggestions.map((s: any) => ({
      taskId: s.taskId || '',
      currentPriority: s.currentPriority || 'MEDIUM',
      suggestedPriority: s.suggestedPriority || 'MEDIUM',
      reasoning: s.reasoning || 'No reasoning provided',
      estimatedHours: s.estimatedHours || 8,
    }));
  } catch (error) {
    console.error('Failed to parse task suggestions:', error);
    return generateDefaultSuggestions(context);
  }
}

/**
 * Generate default suggestions if parsing fails
 */
function generateDefaultSuggestions(context: ProjectContext): TaskSuggestion[] {
  return context.tasks.slice(0, 5).map((task) => ({
    taskId: task.id,
    currentPriority: task.priority,
    suggestedPriority: task.priority,
    reasoning: 'Task analysis pending',
    estimatedHours: 8,
  }));
}

/**
 * Calculate current priority score
 */
function calculateCurrentPriority(tasks: any[]): number {
  const priorityScores: Record<string, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return tasks.reduce((sum, task) => {
    return sum + (priorityScores[task.priority] || 2);
  }, 0);
}

/**
 * Calculate suggested priority score
 */
function calculateSuggestedPriority(suggestions: TaskSuggestion[]): number {
  const priorityScores: Record<string, number> = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return suggestions.reduce((sum, suggestion) => {
    return sum + (priorityScores[suggestion.suggestedPriority] || 2);
  }, 0);
}

/**
 * Estimate project completion time
 */
function estimateCompletionTime(
  tasks: any[],
  suggestions: TaskSuggestion[]
): number {
  const totalHours = suggestions.reduce((sum, s) => sum + s.estimatedHours, 0);
  const hoursPerDay = 8;
  const daysPerWeek = 5;

  return Math.ceil(totalHours / hoursPerDay / daysPerWeek);
}

/**
 * Calculate task dependencies
 */
export function calculateTaskDependencies(tasks: any[]): Map<string, string[]> {
  const dependencies = new Map<string, string[]>();

  tasks.forEach((task) => {
    if (task.dependencies && Array.isArray(task.dependencies)) {
      dependencies.set(task.id, task.dependencies);
    } else {
      dependencies.set(task.id, []);
    }
  });

  return dependencies;
}

/**
 * Calculate critical path
 */
export function calculateCriticalPath(
  tasks: any[],
  dependencies: Map<string, string[]>
): string[] {
  const criticalPath: string[] = [];
  const visited = new Set<string>();

  function dfs(taskId: string, path: string[]): string[] {
    if (visited.has(taskId)) {
      return path;
    }

    visited.add(taskId);
    path.push(taskId);

    const deps = dependencies.get(taskId) || [];
    if (deps.length === 0) {
      return path;
    }

    let longestPath = path;
    for (const dep of deps) {
      const newPath = dfs(dep, [...path]);
      if (newPath.length > longestPath.length) {
        longestPath = newPath;
      }
    }

    return longestPath;
  }

  for (const task of tasks) {
    const path = dfs(task.id, []);
    if (path.length > criticalPath.length) {
      criticalPath.splice(0, criticalPath.length, ...path);
    }
  }

  return criticalPath;
}
