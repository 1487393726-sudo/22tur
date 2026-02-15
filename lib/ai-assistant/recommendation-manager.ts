/**
 * Recommendation Manager
 * Manages AI recommendations including saving, applying, and rating
 * **Property 6: 建议执行原子性**
 */

import { prisma } from '@/lib/prisma';
import { Recommendation } from './types';

export interface RecommendationFilter {
  type?: string;
  status?: string;
  priority?: string;
  minRating?: number;
}

/**
 * Save a recommendation
 * @param projectId - Project ID
 * @param recommendation - Recommendation to save
 * @returns Saved recommendation
 */
export async function saveRecommendation(
  projectId: string,
  recommendation: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Recommendation> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expire after 30 days

    const saved = await prisma.recommendation.create({
      data: {
        projectId,
        type: recommendation.type,
        title: recommendation.title,
        description: recommendation.description,
        reasoning: recommendation.reasoning,
        expectedBenefit: recommendation.expectedBenefit,
        priority: recommendation.priority,
        status: 'pending',
        expiresAt,
      },
    });

    return {
      id: saved.id,
      projectId: saved.projectId,
      type: saved.type as any,
      title: saved.title,
      description: saved.description,
      reasoning: saved.reasoning,
      expectedBenefit: saved.expectedBenefit || undefined,
      priority: saved.priority as any,
      status: saved.status as any,
      rating: saved.rating || undefined,
      feedback: saved.feedback || undefined,
      createdAt: saved.createdAt,
      appliedAt: saved.appliedAt || undefined,
      expiresAt: saved.expiresAt || undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to save recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get recommendations for a project
 * @param projectId - Project ID
 * @param filter - Filter options
 * @param limit - Maximum number of recommendations
 * @returns Array of recommendations
 */
export async function getRecommendations(
  projectId: string,
  filter?: RecommendationFilter,
  limit: number = 50
): Promise<Recommendation[]> {
  try {
    const where: any = { projectId };

    if (filter?.type) {
      where.type = filter.type;
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.priority) {
      where.priority = filter.priority;
    }

    const recommendations = await prisma.recommendation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return recommendations.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      type: r.type as any,
      title: r.title,
      description: r.description,
      reasoning: r.reasoning,
      expectedBenefit: r.expectedBenefit || undefined,
      priority: r.priority as any,
      status: r.status as any,
      rating: r.rating || undefined,
      feedback: r.feedback || undefined,
      createdAt: r.createdAt,
      appliedAt: r.appliedAt || undefined,
      expiresAt: r.expiresAt || undefined,
    }));
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

/**
 * Get a specific recommendation
 * @param recommendationId - Recommendation ID
 * @returns Recommendation or null
 */
export async function getRecommendation(
  recommendationId: string
): Promise<Recommendation | null> {
  try {
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return null;
    }

    return {
      id: recommendation.id,
      projectId: recommendation.projectId,
      type: recommendation.type as any,
      title: recommendation.title,
      description: recommendation.description,
      reasoning: recommendation.reasoning,
      expectedBenefit: recommendation.expectedBenefit || undefined,
      priority: recommendation.priority as any,
      status: recommendation.status as any,
      rating: recommendation.rating || undefined,
      feedback: recommendation.feedback || undefined,
      createdAt: recommendation.createdAt,
      appliedAt: recommendation.appliedAt || undefined,
      expiresAt: recommendation.expiresAt || undefined,
    };
  } catch (error) {
    console.error('Failed to get recommendation:', error);
    return null;
  }
}

/**
 * Apply a recommendation (atomic operation)
 * @param recommendationId - Recommendation ID
 * @returns Updated recommendation
 */
export async function applyRecommendation(recommendationId: string): Promise<Recommendation> {
  try {
    // Atomic update
    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: 'applied',
        appliedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      type: updated.type as any,
      title: updated.title,
      description: updated.description,
      reasoning: updated.reasoning,
      expectedBenefit: updated.expectedBenefit || undefined,
      priority: updated.priority as any,
      status: updated.status as any,
      rating: updated.rating || undefined,
      feedback: updated.feedback || undefined,
      createdAt: updated.createdAt,
      appliedAt: updated.appliedAt || undefined,
      expiresAt: updated.expiresAt || undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to apply recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Reject a recommendation
 * @param recommendationId - Recommendation ID
 * @returns Updated recommendation
 */
export async function rejectRecommendation(recommendationId: string): Promise<Recommendation> {
  try {
    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        status: 'rejected',
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      type: updated.type as any,
      title: updated.title,
      description: updated.description,
      reasoning: updated.reasoning,
      expectedBenefit: updated.expectedBenefit || undefined,
      priority: updated.priority as any,
      status: updated.status as any,
      rating: updated.rating || undefined,
      feedback: updated.feedback || undefined,
      createdAt: updated.createdAt,
      appliedAt: updated.appliedAt || undefined,
      expiresAt: updated.expiresAt || undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to reject recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Rate a recommendation
 * @param recommendationId - Recommendation ID
 * @param rating - Rating (1-5)
 * @param feedback - Optional feedback
 * @returns Updated recommendation
 */
export async function rateRecommendation(
  recommendationId: string,
  rating: number,
  feedback?: string
): Promise<Recommendation> {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updated = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: {
        rating,
        feedback: feedback || null,
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      type: updated.type as any,
      title: updated.title,
      description: updated.description,
      reasoning: updated.reasoning,
      expectedBenefit: updated.expectedBenefit || undefined,
      priority: updated.priority as any,
      status: updated.status as any,
      rating: updated.rating || undefined,
      feedback: updated.feedback || undefined,
      createdAt: updated.createdAt,
      appliedAt: updated.appliedAt || undefined,
      expiresAt: updated.expiresAt || undefined,
    };
  } catch (error) {
    throw new Error(
      `Failed to rate recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Delete a recommendation
 * @param recommendationId - Recommendation ID
 */
export async function deleteRecommendation(recommendationId: string): Promise<void> {
  try {
    await prisma.recommendation.delete({
      where: { id: recommendationId },
    });
  } catch (error) {
    throw new Error(
      `Failed to delete recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get recommendations by type
 * @param projectId - Project ID
 * @param type - Recommendation type
 * @returns Array of recommendations
 */
export async function getRecommendationsByType(
  projectId: string,
  type: string
): Promise<Recommendation[]> {
  return getRecommendations(projectId, { type });
}

/**
 * Get pending recommendations
 * @param projectId - Project ID
 * @returns Array of pending recommendations
 */
export async function getPendingRecommendations(projectId: string): Promise<Recommendation[]> {
  return getRecommendations(projectId, { status: 'pending' });
}

/**
 * Get applied recommendations
 * @param projectId - Project ID
 * @returns Array of applied recommendations
 */
export async function getAppliedRecommendations(projectId: string): Promise<Recommendation[]> {
  return getRecommendations(projectId, { status: 'applied' });
}

/**
 * Get high-priority recommendations
 * @param projectId - Project ID
 * @returns Array of high-priority recommendations
 */
export async function getHighPriorityRecommendations(projectId: string): Promise<Recommendation[]> {
  return getRecommendations(projectId, { priority: 'HIGH' });
}

/**
 * Calculate recommendation effectiveness
 * @param projectId - Project ID
 * @returns Effectiveness score (0-1)
 */
export async function calculateRecommendationEffectiveness(projectId: string): Promise<number> {
  try {
    const recommendations = await getRecommendations(projectId);

    if (recommendations.length === 0) {
      return 0;
    }

    const ratedRecommendations = recommendations.filter((r) => r.rating !== undefined);

    if (ratedRecommendations.length === 0) {
      return 0;
    }

    const averageRating = ratedRecommendations.reduce((sum, r) => sum + (r.rating || 0), 0) / ratedRecommendations.length;

    return averageRating / 5; // Normalize to 0-1
  } catch (error) {
    console.error('Failed to calculate recommendation effectiveness:', error);
    return 0;
  }
}

/**
 * Clean up expired recommendations
 * @param projectId - Project ID
 */
export async function cleanupExpiredRecommendations(projectId: string): Promise<number> {
  try {
    const result = await prisma.recommendation.deleteMany({
      where: {
        projectId,
        expiresAt: {
          lt: new Date(),
        },
        status: 'pending',
      },
    });

    return result.count;
  } catch (error) {
    console.error('Failed to cleanup expired recommendations:', error);
    return 0;
  }
}
