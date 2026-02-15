/**
 * AI Assistant Analysis API
 * Handles all analysis requests (task optimization, progress prediction, risk analysis, resource allocation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { extractProjectContext } from '@/lib/ai-assistant/data-extractor';
import { analyzeTaskOptimization } from '@/lib/ai-assistant/analysis/task-optimizer';
import { predictProgress } from '@/lib/ai-assistant/analysis/progress-predictor';
import { analyzeRisks } from '@/lib/ai-assistant/analysis/risk-analyzer';
import { analyzeResourceAllocation } from '@/lib/ai-assistant/analysis/resource-allocator';
import { saveRecommendation } from '@/lib/ai-assistant/recommendation-manager';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai-assistant/analysis
 * Run analysis on a project
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, analysisType } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Extract project context
    const context = await extractProjectContext(projectId);

    // Get user for logging
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const results: any = {};
    const startTime = Date.now();

    try {
      // Run requested analysis
      if (!analysisType || analysisType === 'task_optimization') {
        const taskOptimization = await analyzeTaskOptimization(projectId, context);
        results.taskOptimization = taskOptimization;

        // Save recommendations
        for (const suggestion of taskOptimization.suggestions) {
          await saveRecommendation(projectId, {
            type: 'task_optimization',
            title: `Optimize task: ${suggestion.taskId}`,
            description: `Adjust priority from ${suggestion.currentPriority} to ${suggestion.suggestedPriority}`,
            reasoning: suggestion.reasoning,
            expectedBenefit: `Estimated ${suggestion.estimatedHours} hours`,
            priority: suggestion.suggestedPriority as any,
            status: 'pending',
          });
        }
      }

      if (!analysisType || analysisType === 'progress_prediction') {
        const progressPrediction = await predictProgress(projectId, context);
        results.progressPrediction = progressPrediction;

        // Save recommendation if at risk
        if (progressPrediction.completionProbability < 0.7) {
          await saveRecommendation(projectId, {
            type: 'progress_prediction',
            title: 'Project completion at risk',
            description: `Estimated completion: ${progressPrediction.estimatedCompletionDate.toISOString().split('T')[0]}`,
            reasoning: `Risk factors: ${progressPrediction.riskFactors.join(', ')}`,
            expectedBenefit: 'Improve project timeline',
            priority: 'HIGH',
            status: 'pending',
          });
        }
      }

      if (!analysisType || analysisType === 'risk_analysis') {
        const riskAnalysis = await analyzeRisks(projectId, context);
        results.riskAnalysis = riskAnalysis;

        // Save recommendations for critical risks
        for (const risk of riskAnalysis.criticalRisks) {
          await saveRecommendation(projectId, {
            type: 'risk_analysis',
            title: `Critical risk: ${risk.type}`,
            description: risk.description,
            reasoning: `Severity: ${(risk.severity * 100).toFixed(1)}%`,
            expectedBenefit: risk.mitigationStrategy,
            priority: 'HIGH',
            status: 'pending',
          });
        }
      }

      if (!analysisType || analysisType === 'resource_allocation') {
        const resourceAllocation = await analyzeResourceAllocation(projectId, context);
        results.resourceAllocation = resourceAllocation;

        // Save recommendations
        for (const suggestion of resourceAllocation.suggestions) {
          if (suggestion.suggestedWorkload !== suggestion.currentWorkload) {
            await saveRecommendation(projectId, {
              type: 'resource_allocation',
              title: `Adjust workload for ${suggestion.memberName}`,
              description: `Change from ${suggestion.currentWorkload}% to ${suggestion.suggestedWorkload}%`,
              reasoning: suggestion.reasoning,
              expectedBenefit: `Improve team utilization`,
              priority: 'MEDIUM',
              status: 'pending',
            });
          }
        }
      }
    } catch (analysisError) {
      console.error('Analysis error:', analysisError);
      // Continue with partial results
    }

    const duration = Date.now() - startTime;

    // Log analysis call
    if (user) {
      await prisma.aICallLog.create({
        data: {
          projectId,
          userId: user.id,
          action: 'analysis',
          duration,
          status: 'success',
        },
      });
    }

    return NextResponse.json({
      projectId,
      analysisType: analysisType || 'all',
      results,
      duration,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('POST /api/ai-assistant/analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to run analysis' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-assistant/analysis
 * Get analysis results for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Get project context
    const context = await extractProjectContext(projectId);

    return NextResponse.json({
      projectId,
      context,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('GET /api/ai-assistant/analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
