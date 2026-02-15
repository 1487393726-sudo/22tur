/**
 * Permission API Unit Tests - [id] Route
 * Tests for GET /api/permissions/:id, PUT /api/permissions/:id, DELETE /api/permissions/:id
 * Requirements: 1.1, 1.4, 1.5
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

describe('Permission API [id] Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
    },
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

  describe('GET /api/permissions/:id', () => {
    it('should return a permission by ID', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockPermission);
      expect(mockPermissionEngine.getPermission).toHaveBeenCalledWith('perm-1');
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/nonexistent', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Permission not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'GET',
      });

      const response = await GET(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/permissions/:id', () => {
    it('should update a permission', async () => {
      const updatedPermission = {
        ...mockPermission,
        description: 'Updated description',
      };

      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);
      mockPermissionEngine.updatePermission.mockResolvedValue(updatedPermission);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated description',
        }),
      });

      const response = await PUT(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedPermission);
      expect(mockPermissionEngine.updatePermission).toHaveBeenCalledWith('perm-1', {
        description: 'Updated description',
      });
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated description',
        }),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Permission not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'PUT',
        body: JSON.stringify({
          description: 'Updated description',
        }),
      });

      const response = await PUT(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle update errors', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);
      mockPermissionEngine.updatePermission.mockRejectedValue(
        new Error('Permission name already exists')
      );

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'existing-permission',
        }),
      });

      const response = await PUT(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Permission name already exists');
    });
  });

  describe('DELETE /api/permissions/:id', () => {
    it('should delete a permission', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);
      mockPermissionEngine.deletePermission.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Permission deleted successfully');
      expect(mockPermissionEngine.deletePermission).toHaveBeenCalledWith('perm-1');
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 404 when permission not found', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Permission not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle deletion errors', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);
      mockPermissionEngine.deletePermission.mockRejectedValue(
        new Error('Cannot delete permission in use')
      );

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'perm-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete permission in use');
    });

    it('should log deletion with original state', async () => {
      mockPermissionEngine.getPermission.mockResolvedValue(mockPermission);
      mockPermissionEngine.deletePermission.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/permissions/perm-1', {
        method: 'DELETE',
      });

      await DELETE(request, { params: { id: 'perm-1' } });

      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalledWith(
        'PERMISSION_DELETED',
        'PERMISSION',
        'perm-1',
        expect.objectContaining({
          userId: 'user-123',
          originalState: mockPermission,
        })
      );
    });
  });
});
