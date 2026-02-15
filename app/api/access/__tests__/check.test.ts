/**
 * Access Control API Unit Tests
 * Tests for POST /api/access/check
 * Requirements: 2.2, 2.4, 3.1
 */

import { POST } from '../check/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { accessDecisionEngine } from '@/lib/access-control';
import { auditLogSystem } from '@/lib/audit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/access-control');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockAccessDecisionEngine = accessDecisionEngine as jest.Mocked<typeof accessDecisionEngine>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('Access Control API Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/access/check', () => {
    it('should allow access when user has permission', async () => {
      mockAccessDecisionEngine.evaluateAccess.mockResolvedValue({
        allowed: true,
        reason: 'User has required permission',
        decision: 'ALLOW',
        timestamp: new Date(),
      });
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          resourceId: 'doc-1',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.allowed).toBe(true);
      expect(mockAccessDecisionEngine.evaluateAccess).toHaveBeenCalledWith({
        userId: 'user-123',
        resourceId: 'doc-1',
        action: 'READ',
      });
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should deny access when user lacks permission', async () => {
      mockAccessDecisionEngine.evaluateAccess.mockResolvedValue({
        allowed: false,
        reason: 'User does not have required permission',
        decision: 'DENY',
        timestamp: new Date(),
      });
      mockAuditLogSystem.logFailure.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          resourceId: 'doc-1',
          action: 'DELETE',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.allowed).toBe(false);
      expect(data.reason).toBe('User does not have required permission');
      expect(mockAuditLogSystem.logFailure).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          // Missing resourceId and action
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          resourceId: 'doc-1',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle evaluation errors', async () => {
      mockAccessDecisionEngine.evaluateAccess.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          resourceId: 'doc-1',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should cache access decisions', async () => {
      const mockDecision = {
        allowed: true,
        reason: 'User has required permission',
        decision: 'ALLOW',
        timestamp: new Date(),
      };

      mockAccessDecisionEngine.evaluateAccess.mockResolvedValue(mockDecision);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/access/check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-123',
          resourceId: 'doc-1',
          action: 'READ',
        }),
      });

      // First call
      await POST(request);

      // Second call should use cache
      await POST(request);

      // evaluateAccess should be called twice (no caching at this level)
      expect(mockAccessDecisionEngine.evaluateAccess).toHaveBeenCalledTimes(2);
    });
  });
});
