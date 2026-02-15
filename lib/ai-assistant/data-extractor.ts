/**
 * Data Extractor
 * Extracts project context and data for AI analysis
 * **Property 9: 上下文更新一致性**
 */

import { prisma } from '@/lib/prisma';
import {
  ProjectContext,
  TaskData,
  TeamMember,
  HistoricalData,
  RiskEvent,
} from './types';

/**
 * Extract complete project context
 * @param projectId - Project ID
 * @returns Complete project context
 */
export async function extractProjectContext(projectId: string): Promise<ProjectContext> {
  try {
    // Get project basic info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        department: true,
      },
    });

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Extract tasks
    const tasks = await extractTaskData(projectId);

    // Extract team
    const team = await extractTeamData(projectId);

    // Extract historical data
    const historicalData = await extractHistoricalData(projectId, 90);

    return {
      projectId,
      projectName: project.name,
      description: project.description || undefined,
      status: project.status,
      startDate: project.startDate || undefined,
      endDate: project.endDate || undefined,
      budget: project.budget || undefined,
      teamSize: team.length,
      tasks,
      team,
      historicalData,
    };
  } catch (error) {
    throw new Error(`Failed to extract project context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract task data from project
 * @param projectId - Project ID
 * @returns Array of task data
 */
export async function extractTaskData(projectId: string): Promise<TaskData[]> {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.username || undefined,
      dueDate: task.dueDate || undefined,
      estimatedHours: undefined, // Not in current schema
      actualHours: undefined, // Not in current schema
      dependencies: [], // Not in current schema
    }));
  } catch (error) {
    console.error('Failed to extract task data:', error);
    return [];
  }
}

/**
 * Extract team data from project
 * @param projectId - Project ID
 * @returns Array of team members
 */
export async function extractTeamData(projectId: string): Promise<TeamMember[]> {
  try {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: true,
      },
    });

    return members.map((member) => ({
      id: member.user.id,
      name: `${member.user.firstName} ${member.user.lastName}`,
      role: member.role,
      skills: [], // Not in current schema
      availability: 100, // Default to fully available
      workload: 50, // Default to 50%
    }));
  } catch (error) {
    console.error('Failed to extract team data:', error);
    return [];
  }
}

/**
 * Extract historical data from project
 * @param projectId - Project ID
 * @param days - Number of days to look back
 * @returns Historical data
 */
export async function extractHistoricalData(projectId: string, days: number = 90): Promise<HistoricalData> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get task statistics
    const allTasks = await prisma.task.findMany({
      where: { projectId },
    });

    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const totalTasks = allTasks.length;

    // Calculate average completion time (simplified)
    const avgCompletionTime = totalTasks > 0 ? Math.ceil(days / totalTasks) : 0;

    // Get expenses for velocity trend (simplified)
    const expenses = await prisma.expense.findMany({
      where: {
        projectId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate weekly velocity (simplified as expenses per week)
    const velocityTrend: number[] = [];
    for (let i = 0; i < Math.ceil(days / 7); i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekExpenses = expenses.filter(
        (e) => e.date >= weekStart && e.date < weekEnd
      );
      velocityTrend.push(weekExpenses.length);
    }

    return {
      completedTasks,
      totalTasks,
      averageCompletionTime: avgCompletionTime,
      velocityTrend,
      riskHistory: [],
    };
  } catch (error) {
    console.error('Failed to extract historical data:', error);
    return {
      completedTasks: 0,
      totalTasks: 0,
      averageCompletionTime: 0,
      velocityTrend: [],
      riskHistory: [],
    };
  }
}

/**
 * Format project context as string for LLM
 * @param context - Project context
 * @returns Formatted context string
 */
export function formatContextForLLM(context: ProjectContext): string {
  const lines: string[] = [
    `# Project: ${context.projectName}`,
    `Status: ${context.status}`,
    `Team Size: ${context.teamSize}`,
  ];

  if (context.description) {
    lines.push(`Description: ${context.description}`);
  }

  if (context.startDate) {
    lines.push(`Start Date: ${context.startDate.toISOString().split('T')[0]}`);
  }

  if (context.endDate) {
    lines.push(`End Date: ${context.endDate.toISOString().split('T')[0]}`);
  }

  if (context.budget) {
    lines.push(`Budget: $${context.budget}`);
  }

  lines.push(`\n## Tasks (${context.tasks.length})`);
  context.tasks.slice(0, 10).forEach((task) => {
    lines.push(`- [${task.status}] ${task.title} (Priority: ${task.priority})`);
  });

  if (context.tasks.length > 10) {
    lines.push(`... and ${context.tasks.length - 10} more tasks`);
  }

  lines.push(`\n## Team Members (${context.team.length})`);
  context.team.forEach((member) => {
    lines.push(`- ${member.name} (${member.role})`);
  });

  if (context.historicalData) {
    lines.push(`\n## Historical Data`);
    lines.push(`Completed Tasks: ${context.historicalData.completedTasks}/${context.historicalData.totalTasks}`);
    lines.push(`Average Completion Time: ${context.historicalData.averageCompletionTime} days`);
  }

  return lines.join('\n');
}

/**
 * Update project context in database
 * @param projectId - Project ID
 * @param context - Project context
 */
export async function updateProjectContext(projectId: string, context: ProjectContext): Promise<void> {
  try {
    const contextString = JSON.stringify(context);

    await prisma.projectContext.upsert({
      where: { projectId },
      update: {
        context: contextString,
        lastSync: new Date(),
      },
      create: {
        projectId,
        context: contextString,
      },
    });
  } catch (error) {
    console.error('Failed to update project context:', error);
  }
}

/**
 * Get cached project context
 * @param projectId - Project ID
 * @returns Cached project context or null
 */
export async function getCachedProjectContext(projectId: string): Promise<ProjectContext | null> {
  try {
    const cached = await prisma.projectContext.findUnique({
      where: { projectId },
    });

    if (!cached) {
      return null;
    }

    return JSON.parse(cached.context);
  } catch (error) {
    console.error('Failed to get cached project context:', error);
    return null;
  }
}
