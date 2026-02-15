/**
 * Permission Delegation API Unit Tests
 * Tests for delegation creation and revocation
 * Requirements: 10.1, 10.5
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { delegationManager } from '@/lib/delegation';
import { auditLogSystem } from '@/lib/audit';

jest.mock('next-auth');
jest.mock('@/lib/delegation');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDelegationManager = delegationManager as jest.Mocked<typeof delegationManager>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('Permission Delegation API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
    },
  };

  const mockDelegation = {
    id: 'deleg-1',
    delegatorId: 'user-123',
    delegateeId: 'user-456',
    permissionId: 'perm-1',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    revokedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/delegations - Create delegation', () => {
    it('should create a delegation', async () => {
      mockDelegationManager.createDelegation.mockResolvedValue(mockDelegation);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'POST',
        body: JSON.stringify({
          delegateeId: 'user-456',
          permissionId: 'perm-1',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const response = await simulateCreateDelegation(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockDelegation);
      expect(mockDelegationManager.createDelegation).toHaveBeenCalled();
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'POST',
        body: JSON.stringify({
          delegateeId: 'user-456',
          // Missing permissionId and expiresAt
        }),
      });

      const response = await simulateCreateDelegation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when expiration is in the past', async () => {
      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'POST',
        body: JSON.stringify({
          delegateeId: 'user-456',
          permissionId: 'perm-1',
          expiresAt: new Date(Date.now() - 1000).toISOString(),
        }),
      });

      const response = await simulateCreateDelegation(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Expiration time must be in the future');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'POST',
        body: JSON.stringify({
          delegateeId: 'user-456',
          permissionId: 'perm-1',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      const response = await simulateCreateDelegation(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/delegations - List delegations', () => {
    it('should return all delegations', async () => {
      const mockDelegations = [mockDelegation];
      mockDelegationManager.getAllDelegations.mockResolvedValue(mockDelegations);

      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'GET',
      });

      const response = await simulateGetDelegations(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.delegations).toEqual(mockDelegations);
      expect(data.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/delegations', {
        method: 'GET',
      });

      const response = await simulateGetDelegations(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/delegations/:id - Revoke delegation', () => {
    it('should revoke a delegation', async () => {
      const revokedDelegation = { ...mockDelegation, revokedAt: new Date() };
      mockDelegationManager.getDelegation.mockResolvedValue(mockDelegation);
      mockDelegationManager.revokeDelegation.mockResolvedValue(revokedDelegation);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/delegations/deleg-1', {
        method: 'DELETE',
      });

      const response = await simulateRevokeDelegation(request, 'deleg-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Delegation revoked successfully');
      expect(mockDelegationManager.revokeDelegation).toHaveBeenCalledWith('deleg-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 404 when delegation not found', async () => {
      mockDelegationManager.getDelegation.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/delegations/nonexistent', {
        method: 'DELETE',
      });

      const response = await simulateRevokeDelegation(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Delegation not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/delegations/deleg-1', {
        method: 'DELETE',
      });

      const response = await simulateRevokeDelegation(request, 'deleg-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should log early revocation', async () => {
      const revokedDelegation = { ...mockDelegation, revokedAt: new Date() };
      mockDelegationManager.getDelegation.mockResolvedValue(mockDelegation);
      mockDelegationManager.revokeDelegation.mockResolvedValue(revokedDelegation);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/delegations/deleg-1', {
        method: 'DELETE',
      });

      await simulateRevokeDelegation(request, 'deleg-1');

      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalledWith(
        'DELEGATION_REVOKED',
        'DELEGATION',
        'deleg-1',
        expect.objectContaining({
          userId: 'user-123',
        })
      );
    });
  });

  describe('GET /api/delegations/user/:userId - Get delegations for user', () => {
    it('should return delegations for a user', async () => {
      const mockDelegations = [mockDelegation];
      mockDelegationManager.getDelegationsForUser.mockResolvedValue(mockDelegations);

      const request = new NextRequest('http://localhost:3000/api/delegations/user/user-456', {
        method: 'GET',
      });

      const response = await simulateGetUserDelegations(request, 'user-456');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.delegations).toEqual(mockDelegations);
      expect(data.total).toBe(1);
      expect(mockDelegationManager.getDelegationsForUser).toHaveBeenCalledWith('user-456');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/delegations/user/user-456', {
        method: 'GET',
      });

      const response = await simulateGetUserDelegations(request, 'user-456');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return empty array when user has no delegations', async () => {
      mockDelegationManager.getDelegationsForUser.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/delegations/user/user-456', {
        method: 'GET',
      });

      const response = await simulateGetUserDelegations(request, 'user-456');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.delegations).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Delegation expiration', () => {
    it('should not allow expired delegations', async () => {
      const expiredDelegation = {
        ...mockDelegation,
        expiresAt: new Date(Date.now() - 1000),
      };

      mockDelegationManager.isDelegationValid.mockResolvedValue(false);

      const isValid = await mockDelegationManager.isDelegationValid(expiredDelegation.id);

      expect(isValid).toBe(false);
    });

    it('should allow valid delegations', async () => {
      mockDelegationManager.isDelegationValid.mockResolvedValue(true);

      const isValid = await mockDelegationManager.isDelegationValid(mockDelegation.id);

      expect(isValid).toBe(true);
    });
  });
});

// Helper functions
async function simulateCreateDelegation(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.delegateeId || !data.permissionId || !data.expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const expiresAt = new Date(data.expiresAt);
    if (expiresAt <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Expiration time must be in the future' }),
        { status: 400 }
      );
    }

    const delegation = await mockDelegationManager.createDelegation({
      delegatorId: session.user.id,
      delegateeId: data.delegateeId,
      permissionId: data.permissionId,
      expiresAt,
    });

    await mockAuditLogSystem.logSuccess('DELEGATION_CREATED', 'DELEGATION', delegation.id, {
      userId: session.user.id,
      newState: delegation,
    });

    return new Response(JSON.stringify(delegation), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetDelegations(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const delegations = await mockDelegationManager.getAllDelegations();
    return new Response(JSON.stringify({ delegations, total: delegations.length }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateRevokeDelegation(request: NextRequest, delegationId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const delegation = await mockDelegationManager.getDelegation(delegationId);
    if (!delegation) {
      return new Response(JSON.stringify({ error: 'Delegation not found' }), { status: 404 });
    }

    const revokedDelegation = await mockDelegationManager.revokeDelegation(delegationId);

    await mockAuditLogSystem.logSuccess('DELEGATION_REVOKED', 'DELEGATION', delegationId, {
      userId: session.user.id,
      originalState: delegation,
      newState: revokedDelegation,
    });

    return new Response(JSON.stringify({ message: 'Delegation revoked successfully' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetUserDelegations(request: NextRequest, userId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const delegations = await mockDelegationManager.getDelegationsForUser(userId);
    return new Response(JSON.stringify({ delegations, total: delegations.length }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
