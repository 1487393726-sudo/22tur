/**
 * Authentication and Authorization Middleware
 * Handles permission verification and access control
 * **Property 8: 对话隐私隔离**
 */

import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * Verify user has access to project
 */
export async function verifyProjectAccess(
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return !!member;
  } catch (error) {
    console.error('Failed to verify project access:', error);
    return false;
  }
}

/**
 * Verify user has access to conversation
 */
export async function verifyConversationAccess(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return false;
    }

    // User must be the conversation creator or project member
    if (conversation.userId === userId) {
      return true;
    }

    return verifyProjectAccess(conversation.projectId, userId);
  } catch (error) {
    console.error('Failed to verify conversation access:', error);
    return false;
  }
}

/**
 * Verify user has access to recommendation
 */
export async function verifyRecommendationAccess(
  recommendationId: string,
  userId: string
): Promise<boolean> {
  try {
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return false;
    }

    return verifyProjectAccess(recommendation.projectId, userId);
  } catch (error) {
    console.error('Failed to verify recommendation access:', error);
    return false;
  }
}

/**
 * Get user from session
 */
export async function getUserFromSession() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    return user;
  } catch (error) {
    console.error('Failed to get user from session:', error);
    return null;
  }
}

/**
 * Verify user is project admin
 */
export async function verifyProjectAdmin(
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return member?.role === 'ADMIN' || member?.role === 'MANAGER';
  } catch (error) {
    console.error('Failed to verify project admin:', error);
    return false;
  }
}

/**
 * Check if user can apply recommendation
 */
export async function canApplyRecommendation(
  recommendationId: string,
  userId: string
): Promise<boolean> {
  try {
    // User must have access to the recommendation
    const hasAccess = await verifyRecommendationAccess(recommendationId, userId);
    if (!hasAccess) {
      return false;
    }

    // Get recommendation and check project admin status
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      return false;
    }

    // Must be project admin or member
    return verifyProjectAccess(recommendation.projectId, userId);
  } catch (error) {
    console.error('Failed to check apply permission:', error);
    return false;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 10000) // Limit length
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Rate limit check
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(key: string): { remaining: number; resetTime: number } | null {
  const limit = rateLimitMap.get(key);

  if (!limit) {
    return null;
  }

  const now = Date.now();
  if (now > limit.resetTime) {
    rateLimitMap.delete(key);
    return null;
  }

  return {
    remaining: Math.max(0, 100 - limit.count),
    resetTime: limit.resetTime,
  };
}
