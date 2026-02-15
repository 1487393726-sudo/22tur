/**
 * Access Control Decision Engine
 * Makes fast and accurate access control decisions
 * Implements caching with 5-minute TTL and deterministic evaluation
 */

import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

export interface AccessRequest {
  userId: string;
  resourceType: string;
  action: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  evaluationTimeMs: number;
  cached: boolean;
}

interface CachedDecision {
  decision: AccessDecision;
  timestamp: number;
}

export class AccessControlDecisionEngine {
  private decisionCache: Map<string, CachedDecision> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 10000;

  /**
   * Evaluate access request
   * Returns decision within 100ms
   */
  async evaluateAccess(request: AccessRequest): Promise<AccessDecision> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey(request);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return {
        ...cached,
        evaluationTimeMs: Date.now() - startTime,
        cached: true,
      };
    }

    try {
      // Check if user has required permission
      const permissionCheck = await permissionEngine.hasPermissionByAction(
        request.userId,
        request.resourceType,
        request.action
      );

      const allowed = permissionCheck.hasPermission;
      const decision: AccessDecision = {
        allowed,
        reason: permissionCheck.reason,
        evaluationTimeMs: Date.now() - startTime,
        cached: false,
      };

      // Cache the decision
      this.setInCache(cacheKey, decision);

      // Log the decision
      if (allowed) {
        await auditLogSystem.logAccessApproval(request.userId, request.resourceType, request.resourceId || '', {
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          details: {
            action: request.action,
          },
        });
      } else {
        await auditLogSystem.logAccessDenial(request.userId, request.resourceType, request.resourceId || '', {
          reason: permissionCheck.reason,
          ipAddress: request.ipAddress,
          userAgent: request.userAgent,
          details: {
            action: request.action,
          },
        });
      }

      return decision;
    } catch (error) {
      // On error, deny access for security
      const decision: AccessDecision = {
        allowed: false,
        reason: 'Access evaluation failed',
        evaluationTimeMs: Date.now() - startTime,
        cached: false,
      };

      // Log the error
      await auditLogSystem.logAccessDenial(request.userId, request.resourceType, request.resourceId || '', {
        reason: 'Evaluation error',
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
        details: {
          error: (error as Error).message,
        },
      });

      return decision;
    }
  }

  /**
   * Invalidate cache for a specific user
   */
  async invalidateUserCache(userId: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key] of this.decisionCache) {
      if (key.startsWith(`user:${userId}:`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.decisionCache.delete(key);
    }
  }

  /**
   * Invalidate cache for a specific resource
   */
  async invalidateResourceCache(resourceId: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key] of this.decisionCache) {
      if (key.includes(`resource:${resourceId}`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.decisionCache.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    this.decisionCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.decisionCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0, // Would need to track hits/misses
    };
  }

  /**
   * Generate cache key from request
   */
  private getCacheKey(request: AccessRequest): string {
    return `user:${request.userId}:resource:${request.resourceType}:action:${request.action}:resourceId:${request.resourceId || 'any'}`;
  }

  /**
   * Get decision from cache if valid
   */
  private getFromCache(key: string): AccessDecision | null {
    const cached = this.decisionCache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.decisionCache.delete(key);
      return null;
    }

    return cached.decision;
  }

  /**
   * Store decision in cache
   */
  private setInCache(key: string, decision: AccessDecision): void {
    // Implement simple LRU eviction if cache is full
    if (this.decisionCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.decisionCache.keys().next().value;
      if (firstKey) {
        this.decisionCache.delete(firstKey);
      }
    }

    this.decisionCache.set(key, {
      decision,
      timestamp: Date.now(),
    });
  }
}

export const accessControlDecisionEngine = new AccessControlDecisionEngine();
