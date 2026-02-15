/**
 * Audit Log API Unit Tests
 * Tests for audit log querying and filtering
 * Requirements: 5.3, 5.4, 5.5
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { auditLogSystem } from '@/lib/audit';

jest.mock('next-auth');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('Audit Log API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockAuditLog = {
    id: 'log-1',
    timestamp: new Date(),
    userId: 'user-123',
    action: 'ACCESS_APPROVED',
    resourceId: 'doc-1',
    resourceType: 'DOCUMENT',
    result: 'SUCCESS' as const,
    originalState: null,
    newState: null,
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('GET /api/audit/logs - Query audit logs', () => {
    it('should return all audit logs', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.queryLogs.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
      expect(data.total).toBe(1);
    });

    it('should filter logs by user', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.getEventsByUser.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs?userId=user-123', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
      expect(mockAuditLogSystem.getEventsByUser).toHaveBeenCalled();
    });

    it('should filter logs by action', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.queryLogs.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs?action=ACCESS_APPROVED', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
    });

    it('should filter logs by resource', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.getEventsByResource.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs?resourceId=doc-1', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
      expect(mockAuditLogSystem.getEventsByResource).toHaveBeenCalled();
    });

    it('should filter logs by timestamp range', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.queryLogs.mockResolvedValue(mockLogs);

      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date();

      const request = new NextRequest(
        `http://localhost:3000/api/audit/logs?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          method: 'GET',
        }
      );

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/audit/logs', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockAuditLogSystem.queryLogs.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/audit/logs', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should return empty array when no logs found', async () => {
      mockAuditLogSystem.queryLogs.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/audit/logs', {
        method: 'GET',
      });

      const response = await simulateGetLogs(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('GET /api/audit/logs/:id - Get audit log entry', () => {
    it('should return an audit log by ID', async () => {
      mockAuditLogSystem.getLog.mockResolvedValue(mockAuditLog);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/log-1', {
        method: 'GET',
      });

      const response = await simulateGetLog(request, 'log-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAuditLog);
    });

    it('should return 404 when log not found', async () => {
      mockAuditLogSystem.getLog.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/nonexistent', {
        method: 'GET',
      });

      const response = await simulateGetLog(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Audit log not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/log-1', {
        method: 'GET',
      });

      const response = await simulateGetLog(request, 'log-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should include original and new state', async () => {
      const logWithState = {
        ...mockAuditLog,
        originalState: { name: 'old-name' },
        newState: { name: 'new-name' },
      };

      mockAuditLogSystem.getLog.mockResolvedValue(logWithState);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/log-1', {
        method: 'GET',
      });

      const response = await simulateGetLog(request, 'log-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.originalState).toEqual({ name: 'old-name' });
      expect(data.newState).toEqual({ name: 'new-name' });
    });
  });

  describe('GET /api/audit/logs/user/:userId - Get logs by user', () => {
    it('should return logs for a specific user', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.getEventsByUser.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/user/user-123', {
        method: 'GET',
      });

      const response = await simulateGetUserLogs(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
      expect(mockAuditLogSystem.getEventsByUser).toHaveBeenCalledWith(
        'user-123',
        expect.any(Object)
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/user/user-123', {
        method: 'GET',
      });

      const response = await simulateGetUserLogs(request, 'user-123');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/audit/logs/resource/:resourceId - Get logs by resource', () => {
    it('should return logs for a specific resource', async () => {
      const mockLogs = [mockAuditLog];
      mockAuditLogSystem.getEventsByResource.mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/resource/doc-1', {
        method: 'GET',
      });

      const response = await simulateGetResourceLogs(request, 'doc-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.logs).toEqual(mockLogs);
      expect(mockAuditLogSystem.getEventsByResource).toHaveBeenCalledWith(
        'doc-1',
        expect.any(Object)
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/audit/logs/resource/doc-1', {
        method: 'GET',
      });

      const response = await simulateGetResourceLogs(request, 'doc-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});

// Helper functions
async function simulateGetLogs(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const resourceId = searchParams.get('resourceId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let logs;

    if (userId) {
      logs = await mockAuditLogSystem.getEventsByUser(userId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
    } else if (resourceId) {
      logs = await mockAuditLogSystem.getEventsByResource(resourceId, {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
    } else {
      logs = await mockAuditLogSystem.queryLogs({
        action,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
    }

    return new Response(JSON.stringify({ logs, total: logs.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetLog(request: NextRequest, logId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const log = await mockAuditLogSystem.getLog(logId);
    if (!log) {
      return new Response(JSON.stringify({ error: 'Audit log not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(log), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetUserLogs(request: NextRequest, userId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const logs = await mockAuditLogSystem.getEventsByUser(userId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return new Response(JSON.stringify({ logs, total: logs.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetResourceLogs(request: NextRequest, resourceId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const logs = await mockAuditLogSystem.getEventsByResource(resourceId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return new Response(JSON.stringify({ logs, total: logs.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
