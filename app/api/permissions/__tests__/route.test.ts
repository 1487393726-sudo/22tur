/**
 * Permission API Unit Tests
 * Tests for POST /api/permissions and GET /api/permissions
 * Requirements: 1.1, 1.4
 */

import { POST, GET } from '../route';
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

describe('Permission API Routes', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'admin@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/permissions', () => {
    it('should create a permission with valid data', async () => {
      const mockPermission = {
        id: 'perm-1',
        name: 'read:documents',
        description: 'Read documents',
        resourceType: 'DOCUMENT',
        action: 'READ',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPermissionEngine.createPermission.mockResolvedValue(mockPermission);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'read:documents',
          description: 'Read documents',
          resourceType: 'DOCUMENT',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockPermission);
      expect(mockPermissionEngine.createPermission).toHaveBeenCalledWith({
        name: 'read:documents',
        description: 'Read documents',
        resourceType: 'DOCUMENT',
        action: 'READ',
      });
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'read:documents',
          // Missing resourceType and action
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'read:documents',
          resourceType: 'DOCUMENT',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle permission creation errors', async () => {
      mockPermissionEngine.createPermission.mockRejectedValue(
        new Error('Permission already exists')
      );

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'POST',
        body: JSON.stringify({
          name: 'read:documents',
          resourceType: 'DOCUMENT',
          action: 'READ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Permission already exists');
    });

    it('should handle invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/permissions', () => {
    it('should return all permissions', async () => {
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

      mockPermissionEngine.getAllPermissions.mockResolvedValue(mockPermissions);

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toEqual(mockPermissions);
      expect(data.total).toBe(2);
      expect(mockPermissionEngine.getAllPermissions).toHaveBeenCalled();
    });

    it('should filter permissions by resource type', async () => {
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
      ];

      mockPermissionEngine.getPermissionsByResourceType.mockResolvedValue(mockPermissions);

      const request = new NextRequest(
        'http://localhost:3000/api/permissions?resourceType=DOCUMENT',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toEqual(mockPermissions);
      expect(data.total).toBe(1);
      expect(mockPermissionEngine.getPermissionsByResourceType).toHaveBeenCalledWith('DOCUMENT');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockPermissionEngine.getAllPermissions.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should return empty array when no permissions exist', async () => {
      mockPermissionEngine.getAllPermissions.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/permissions', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.permissions).toEqual([]);
      expect(data.total).toBe(0);
    });
  });
});
