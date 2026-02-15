/**
 * AI Assistant Recommendations API
 * Handles recommendation CRUD and management operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getRecommendations,
  getRecommendation,
  saveRecommendation,
  applyRecommendation,
  rejectRecommendation,
  rateRecommendation,
  deleteRecommendation,
} from '@/lib/ai-assistant/recommendation-manager';

/**
 * GET /api/ai-assistant/recommendations
 * Get recommendations for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const recommendationId = searchParams.get('recommendationId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (recommendationId) {
      // Get specific recommendation
      const recommendation = await getRecommendation(recommendationId);
      if (!recommendation) {
        return NextResponse.json(
          { error: 'Recommendation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(recommendation);
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Get recommendations with filters
    const recommendations = await getRecommendations(projectId, {
      type: type || undefined,
      status: status || undefined,
      priority: priority || undefined,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('GET /api/ai-assistant/recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/recommendations
 * Create a new recommendation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      type,
      title,
      description,
      reasoning,
      expectedBenefit,
      priority,
    } = body;

    if (!projectId || !type || !title || !description || !reasoning) {
      return NextResponse.json(
        {
          error:
            'projectId, type, title, description, and reasoning are required',
        },
        { status: 400 }
      );
    }

    const recommendation = await saveRecommendation(projectId, {
      type: type as any,
      title,
      description,
      reasoning,
      expectedBenefit,
      priority: priority || 'MEDIUM',
      status: 'pending',
    });

    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    console.error('POST /api/ai-assistant/recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai-assistant/recommendations
 * Update recommendation (apply, reject, rate)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recommendationId, action, rating, feedback } = body;

    if (!recommendationId || !action) {
      return NextResponse.json(
        { error: 'recommendationId and action are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'apply':
        result = await applyRecommendation(recommendationId);
        break;
      case 'reject':
        result = await rejectRecommendation(recommendationId);
        break;
      case 'rate':
        if (rating === undefined) {
          return NextResponse.json(
            { error: 'rating is required for rate action' },
            { status: 400 }
          );
        }
        result = await rateRecommendation(recommendationId, rating, feedback);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/ai-assistant/recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai-assistant/recommendations
 * Delete a recommendation
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('recommendationId');

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'recommendationId is required' },
        { status: 400 }
      );
    }

    await deleteRecommendation(recommendationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/ai-assistant/recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recommendation' },
      { status: 500 }
    );
  }
}
