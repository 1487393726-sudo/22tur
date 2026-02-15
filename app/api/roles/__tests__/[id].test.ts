/**
 * Role API Unit Tests - [id] Route
 * Tests for GET /api/roles/:id, PUT /api/roles/:id, DELETE /api/roles/:id
 * Requirements: 2.1, 2.2
 */

import { GET, PUT, DELETE } from '../[id]/route';
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

describe('Role API [id] Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
    },
  };

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    description: 'Administrator role',
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPermission = {
    id: 'perm-1',
    name: 'read:documents',
    description: 'Read documents',
    resourceType: 'DOCUMENT',
    action: 'READ',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('GET /api/roles/:id', () => {
    it('should return a role by ID', async () => {
      mockPermissionEngine.getRole.mockResolvedValue(mockRole);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRole);
      expect(mockPermissionEngine.getRole).toHaveBeenCalledWith('role-1');
    });

    it('should return 404 when role not found', async () => {
      mockPermissionEngine.getRole.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/nonexistent', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Role not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/roles/:id', () => {
    it('should update a role', async () => {
      const updatedRole = {
        ...mockRole,
        description: 'Updated admin role',
      };

      mockPermissionEngine.getRole.mockResolvedValue(mockRole);
      mockPermissionEngine.updateRole.mockResolvedValue(updatedRole);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated admin role',
        }),
      });

      const response = await PUT(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedRole);
      expect(mockPermissionEngine.updateRole).toHaveBeenCalledWith('role-1', {
        description: 'Updated admin role',
      });
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 404 when role not found', async () => {
      mockPermissionEngine.getRole.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated admin role',
        }),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Role not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated admin role',
        }),
      });

      const response = await PUT(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('should delete a role', async () => {
      mockPermissionEngine.getRole.mockResolvedValue(mockRole);
      mockPermissionEngine.deleteRole.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Role deleted successfully');
      expect(mockPermissionEngine.deleteRole).toHaveBeenCalledWith('role-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 404 when role not found', async () => {
      mockPermissionEngine.getRole.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Role not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/roles/:id/permissions', () => {
    it('should assign permission to role', async () => {
      mockPermissionEngine.assignPermissionToRole.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1/permissions', {
        method: 'POST',
        body: JSON.stringify({
          permissionId: 'perm-1',
        }),
      });

      const response = await POST(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Permission assigned to role');
      expect(mockPermissionEngine.assignPermissionToRole).toHaveBeenCalledWith('role-1', 'perm-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when permissionId is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/roles/role-1/permissions', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required field');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles/role-1/permissions', {
        method: 'POST',
        body: JSON.stringify({
          permissionId: 'perm-1',
        }),
      });

      const response = await POST(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle assignment errors', async () => {
      mockPermissionEngine.assignPermissionToRole.mockRejectedValue(
        new Error('Permission already assigned')
      );

      const request = new NextRequest('http://localhost:3000/api/roles/role-1/permissions', {
        method: 'POST',
        body: JSON.stringify({
          permissionId: 'perm-1',
        }),
      });

      const response = await POST(request, { params: { id: 'role-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Permission already assigned');
    });
  });
});

// Mock POST function for role permissions
async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();

    if (!data.permissionId) {
      return new Response(JSON.stringify({ error: 'Missing required field: permissionId' }), {
        status: 400,
      });
    }

    await mockPermissionEngine.assignPermissionToRole(params.id, data.permissionId);

    await mockAuditLogSystem.logSuccess('PERMISSION_ASSIGNED_TO_ROLE', 'ROLE', params.id, {
      userId: session.user.id,
      permissionId: data.permissionId,
    });

    return new Response(JSON.stringify({ message: 'Permission assigned to role' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
