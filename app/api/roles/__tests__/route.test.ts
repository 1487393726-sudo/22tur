/**
 * Role API Unit Tests
 * Tests for POST /api/roles and GET /api/roles
 * Requirements: 2.1, 2.2
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

describe('Role API Routes', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/roles', () => {
    it('should create a role with valid data', async () => {
      mockPermissionEngine.createRole.mockResolvedValue(mockRole);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: 'admin',
          description: 'Administrator role',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockRole);
      expect(mockPermissionEngine.createRole).toHaveBeenCalledWith({
        name: 'admin',
        description: 'Administrator role',
      });
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Administrator role',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required field');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: 'admin',
          description: 'Administrator role',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle role creation errors', async () => {
      mockPermissionEngine.createRole.mockRejectedValue(
        new Error('Role already exists')
      );

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: 'admin',
          description: 'Administrator role',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Role already exists');
    });
  });

  describe('GET /api/roles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        mockRole,
        {
          id: 'role-2',
          name: 'user',
          description: 'User role',
          permissions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPermissionEngine.getAllRoles.mockResolvedValue(mockRoles);

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roles).toEqual(mockRoles);
      expect(data.total).toBe(2);
      expect(mockPermissionEngine.getAllRoles).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockPermissionEngine.getAllRoles.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should return empty array when no roles exist', async () => {
      mockPermissionEngine.getAllRoles.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/roles', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.roles).toEqual([]);
      expect(data.total).toBe(0);
    });
  });
});
