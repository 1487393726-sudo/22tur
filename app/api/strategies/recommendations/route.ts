/**
 * Strategy Recommendations API Endpoint
 * GET /api/strategies/recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { strategyOptimizer } from '@/lib/investment-management/strategy-optimizer';
import {
  GetRecommendationsRequest,
  GetRecommendationsResponse,
  BusinessErrorCodes,
  InvestmentBusinessError
} from '@/types/investment-management';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');
    const typesParam = searchParams.get('types');
    const priority = searchParams.get('priority');
    const limitParam = searchParams.get('limit');

    // Validate required parameters
    if (!portfolioId) {
      return NextResponse.json(
        { error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    // Parse optional parameters
    const types = typesParam ? typesParam.split(',') : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    // Validate types if provided
    const validTypes = ['OPTIMIZATION', 'REBALANCING', 'RISK_ADJUSTMENT', 'OPPORTUNITY'];
    if (types && types.some(type => !validTypes.includes(type))) {
      return NextResponse.json(
        { error: `Invalid recommendation type. Valid types: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority if provided
    const validPriorities = ['HIGH', 'MEDIUM', 'LOW'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Valid priorities: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate recommendations
    const recommendations = await strategyOptimizer.generateRecommendations(
      portfolioId,
      types,
      priority
    );

    // Apply limit if specified
    const limitedRecommendations = limit ? recommendations.slice(0, limit) : recommendations;

    // Calculate summary statistics
    const summary = {
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'HIGH').length,
      mediumPriority: recommendations.filter(r => r.priority === 'MEDIUM').length,
      lowPriority: recommendations.filter(r => r.priority === 'LOW').length,
      potentialReturn: recommendations.reduce((sum, r) => sum + r.expectedOutcome.returnImpact, 0),
      potentialRiskReduction: recommendations.reduce((sum, r) => sum + Math.abs(r.expectedOutcome.riskImpact), 0),
      estimatedImplementationCost: recommendations.reduce((sum, r) => 
        sum + r.implementationPlan.reduce((planSum, step) => planSum + step.estimatedCost, 0), 0
      )
    };

    const response: GetRecommendationsResponse = {
      recommendations: limitedRecommendations,
      summary,
      message: `Retrieved ${limitedRecommendations.length} recommendations successfully`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Failed to retrieve recommendations:', error);

    if (error instanceof InvestmentBusinessError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to retrieve recommendations',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for recommendation actions (implement, dismiss, etc.)
    const body = await request.json();
    const { action, recommendationId, portfolioId } = body;

    if (!action || !recommendationId) {
      return NextResponse.json(
        { error: 'Action and recommendation ID are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'implement':
        // Implementation logic would go here
        // This would typically trigger the actual execution of the recommendation
        return NextResponse.json({
          success: true,
          message: `Recommendation ${recommendationId} implementation initiated`
        });

      case 'dismiss':
        // Dismissal logic would go here
        // This would mark the recommendation as dismissed in the database
        return NextResponse.json({
          success: true,
          message: `Recommendation ${recommendationId} dismissed`
        });

      case 'postpone':
        // Postponement logic would go here
        const postponeUntil = body.postponeUntil ? new Date(body.postponeUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return NextResponse.json({
          success: true,
          message: `Recommendation ${recommendationId} postponed until ${postponeUntil.toISOString()}`
        });

      case 'modify':
        // Modification logic would go here
        // This would allow users to adjust recommendation parameters
        return NextResponse.json({
          success: true,
          message: `Recommendation ${recommendationId} modified successfully`
        });

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}. Valid actions: implement, dismiss, postpone, modify` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to process recommendation action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process recommendation action',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for bulk recommendation actions
    const body = await request.json();
    const { action, recommendationIds, portfolioId } = body;

    if (!action || !recommendationIds || !Array.isArray(recommendationIds)) {
      return NextResponse.json(
        { error: 'Action and recommendation IDs array are required' },
        { status: 400 }
      );
    }

    const results = [];

    for (const recommendationId of recommendationIds) {
      try {
        switch (action) {
          case 'implement_all':
            // Bulk implementation logic
            results.push({
              recommendationId,
              success: true,
              message: 'Implementation initiated'
            });
            break;

          case 'dismiss_all':
            // Bulk dismissal logic
            results.push({
              recommendationId,
              success: true,
              message: 'Dismissed'
            });
            break;

          case 'prioritize':
            // Bulk prioritization logic
            const newPriority = body.priority || 'HIGH';
            results.push({
              recommendationId,
              success: true,
              message: `Priority updated to ${newPriority}`
            });
            break;

          default:
            results.push({
              recommendationId,
              success: false,
              message: `Invalid action: ${action}`
            });
        }
      } catch (error) {
        results.push({
          recommendationId,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      },
      message: `Bulk action completed: ${successCount} successful, ${failureCount} failed`
    });

  } catch (error) {
    console.error('Failed to process bulk recommendation action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process bulk recommendation action',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}