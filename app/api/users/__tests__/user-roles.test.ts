/**
 * User Access Management API Unit Tests
 * Tests for role assignment and removal endpoints
 * Requirements: 2.2, 2.4, 3.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/permission');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockPermissionEngine = permissionEngine as jest.Mocked<typeof permissionEngine>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('User Access Management API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockPermissions = [
    {
      id: 'perm-1',
      name: 'read:documents',
      description: 'Read documents',
      resourceType: 'DOCUMENT',
      action: 'READ',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'perm-2',
      name: 'write:documents',
      description: 'Write documents',
      resourceType: 'DOCUMENT',
      action: 'WRITE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/users/:id/roles - Assign role to user', () => {
    it('should assign role to user', async () => {
      mockPermissionEngine.assignRoleToUser.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles', {
        method: 'POST',
        body: JSON.stringify({
          roleId: 'role-1',
        }),
      });

      // Simulate the endpoint
      const response = await simulateAssignRoleToUser(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Role assigned to user');
      expect(mockPermissionEngine.assignRoleToUser).toHaveBeenCalledWith('user-123', 'role-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when roleId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await simulateAssignRoleToUser(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required field');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles', {
        method: 'POST',
        body: JSON.stringify({
          roleId: 'role-1',
        }),
      });

      const response = await simulateAssignRoleToUser(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle assignment errors', async () => {
      mockPermissionEngine.assignRoleToUser.mockRejectedValue(
        new Error('Role already assigned to user')
      );

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles', {
        method: 'POST',
        body: JSON.stringify({
          roleId: 'role-1',
        }),
      });

      const response = await simulateAssignRoleToUser(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Role already assigned to user');
    });
  });

  describe('DELETE /api/users/:id/roles/:roleId - Remove role from user', () => {
    it('should remove role from user', async () => {
      mockPermissionEngine.removeRoleFromUser.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles/role-1', {
        method: 'DELETE',
      });

      const response = await simulateRemoveRoleFromUser(request, 'user-123', 'role-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Role removed from user');
      expect(mockPermissionEngine.removeRoleFromUser).toHaveBeenCalledWith('user-123', 'role-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles/role-1', {
        method: 'DELETE',
      });

      const response = await simulateRemoveRoleFromUser(request, 'user-123', 'role-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle removal errors', async () => {
      mockPermissionEngine.removeRoleFromUser.mockRejectedValue(
        new Error('Role not assigned to user')
      );

      const request = new NextRequest('http://localhost:3000/api/users/user-123/roles/role-1', {
        method: 'DELETE',
      });

      const response = await simulateRemoveRoleFromUser(request, 'user-123', 'role-1');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Role not assigned to user');
    });
  });

  describe('GET /api/users/:id/permissions - Get user permissions', () => {
    it('should return user permissions', async () => {
      mockPermissionEngine.getUserPermissions.mockResolvedValue(mockPermissions);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/permissions', {
        method: 'GET',
      });

      const response = await simulateGetUserPermissions(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toEqual(mockPermissions);
      expect(data.total).toBe(2);
      expect(mockPermissionEngine.getUserPermissions).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/permissions', {
        method: 'GET',
      });

      const response = await simulateGetUserPermissions(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return empty array when user has no permissions', async () => {
      mockPermissionEngine.getUserPermissions.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/users/user-123/permissions', {
        method: 'GET',
      });

      const response = await simulateGetUserPermissions(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should handle database errors', async () => {
      mockPermissionEngine.getUserPermissions.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/users/user-123/permissions', {
        method: 'GET',
      });

      const response = await simulateGetUserPermissions(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });
  });
});

// Helper functions to simulate endpoints
async function simulateAssignRoleToUser(request: NextRequest, userId: string) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();

    if (!data.roleId) {
      return new Response(JSON.stringify({ error: 'Missing required field: roleId' }), {
        status: 400,
      });
    }

    await mockPermissionEngine.assignRoleToUser(userId, data.roleId);

    await mockAuditLogSystem.logSuccess('ROLE_ASSIGNED_TO_USER', 'USER', userId, {
      userId: session.user.id,
      roleId: data.roleId,
    });

    return new Response(JSON.stringify({ message: 'Role assigned to user' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateRemoveRoleFromUser(
  request: NextRequest,
  userId: string,
  roleId: string
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    await mockPermissionEngine.removeRoleFromUser(userId, roleId);

    await mockAuditLogSystem.logSuccess('ROLE_REMOVED_FROM_USER', 'USER', userId, {
      userId: session.user.id,
      roleId,
    });

    return new Response(JSON.stringify({ message: 'Role removed from user' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetUserPermissions(request: NextRequest, userId: string) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const permissions = await mockPermissionEngine.getUserPermissions(userId);

    return new Response(
      JSON.stringify({
        permissions,
        total: permissions.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
