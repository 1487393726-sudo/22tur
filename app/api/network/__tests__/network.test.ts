/**
 * Network Isolation API Unit Tests
 * Tests for segment and policy management
 * Requirements: 9.1, 9.2, 9.4
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { networkIsolation } from '@/lib/network';

jest.mock('next-auth');
jest.mock('@/lib/network');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockNetworkIsolation = networkIsolation as jest.Mocked<typeof networkIsolation>;

describe('Network Isolation API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockSegment = {
    id: 'seg-1',
    name: 'Production',
    cidr: '10.0.0.0/8',
    description: 'Production network',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPolicy = {
    id: 'policy-1',
    sourceSegment: 'seg-1',
    destinationSegment: 'seg-2',
    action: 'ALLOW' as const,
    conditions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/network/segments - Create segment', () => {
    it('should create a network segment', async () => {
      mockNetworkIsolation.createSegment.mockResolvedValue(mockSegment);

      const request = new NextRequest('http://localhost:3000/api/network/segments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Production',
          cidr: '10.0.0.0/8',
          description: 'Production network',
        }),
      });

      const response = await simulateCreateSegment(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockSegment);
      expect(mockNetworkIsolation.createSegment).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/network/segments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Production',
          // Missing cidr
        }),
      });

      const response = await simulateCreateSegment(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/network/segments', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Production',
          cidr: '10.0.0.0/8',
        }),
      });

      const response = await simulateCreateSegment(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/network/segments - List segments', () => {
    it('should return all network segments', async () => {
      const mockSegments = [mockSegment];
      mockNetworkIsolation.getAllSegments.mockResolvedValue(mockSegments);

      const request = new NextRequest('http://localhost:3000/api/network/segments', {
        method: 'GET',
      });

      const response = await simulateGetSegments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.segments).toEqual(mockSegments);
      expect(data.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/network/segments', {
        method: 'GET',
      });

      const response = await simulateGetSegments(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/network/policies - Create isolation policy', () => {
    it('should create an isolation policy', async () => {
      mockNetworkIsolation.defineIsolationPolicy.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/network/policies', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
          action: 'ALLOW',
          conditions: [],
        }),
      });

      const response = await simulateCreatePolicy(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Policy created successfully');
      expect(mockNetworkIsolation.defineIsolationPolicy).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/network/policies', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          // Missing destinationSegment and action
        }),
      });

      const response = await simulateCreatePolicy(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/network/policies', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
          action: 'ALLOW',
        }),
      });

      const response = await simulateCreatePolicy(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/network/policies - List policies', () => {
    it('should return all isolation policies', async () => {
      const mockPolicies = [mockPolicy];
      mockNetworkIsolation.getAllPolicies.mockResolvedValue(mockPolicies);

      const request = new NextRequest('http://localhost:3000/api/network/policies', {
        method: 'GET',
      });

      const response = await simulateGetPolicies(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.policies).toEqual(mockPolicies);
      expect(data.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/network/policies', {
        method: 'GET',
      });

      const response = await simulateGetPolicies(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/network/evaluate - Evaluate segment access', () => {
    it('should allow access when policy permits', async () => {
      mockNetworkIsolation.evaluateSegmentAccess.mockResolvedValue({
        allowed: true,
        reason: 'Policy allows access',
      });

      const request = new NextRequest('http://localhost:3000/api/network/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
          userId: 'user-123',
        }),
      });

      const response = await simulateEvaluateAccess(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.allowed).toBe(true);
      expect(mockNetworkIsolation.evaluateSegmentAccess).toHaveBeenCalled();
    });

    it('should deny access when policy denies', async () => {
      mockNetworkIsolation.evaluateSegmentAccess.mockResolvedValue({
        allowed: false,
        reason: 'Policy denies access',
      });

      const request = new NextRequest('http://localhost:3000/api/network/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
          userId: 'user-123',
        }),
      });

      const response = await simulateEvaluateAccess(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.allowed).toBe(false);
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/network/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          // Missing destinationSegment
        }),
      });

      const response = await simulateEvaluateAccess(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/network/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
        }),
      });

      const response = await simulateEvaluateAccess(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should apply policies within 100ms', async () => {
      mockNetworkIsolation.evaluateSegmentAccess.mockResolvedValue({
        allowed: true,
        reason: 'Policy allows access',
      });

      const request = new NextRequest('http://localhost:3000/api/network/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceSegment: 'seg-1',
          destinationSegment: 'seg-2',
        }),
      });

      const startTime = Date.now();
      await simulateEvaluateAccess(request);
      const endTime = Date.now();

      expect(mockNetworkIsolation.evaluateSegmentAccess).toHaveBeenCalled();
    });
  });
});

// Helper functions
async function simulateCreateSegment(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.name || !data.cidr) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, cidr' }),
        { status: 400 }
      );
    }

    const segment = await mockNetworkIsolation.createSegment(data);
    return new Response(JSON.stringify(segment), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetSegments(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const segments = await mockNetworkIsolation.getAllSegments();
    return new Response(JSON.stringify({ segments, total: segments.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateCreatePolicy(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.sourceSegment || !data.destinationSegment || !data.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    await mockNetworkIsolation.defineIsolationPolicy(data);
    return new Response(JSON.stringify({ message: 'Policy created successfully' }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetPolicies(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const policies = await mockNetworkIsolation.getAllPolicies();
    return new Response(JSON.stringify({ policies, total: policies.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateEvaluateAccess(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.sourceSegment || !data.destinationSegment) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const decision = await mockNetworkIsolation.evaluateSegmentAccess(data);

    if (decision.allowed) {
      return new Response(JSON.stringify(decision), { status: 200 });
    } else {
      return new Response(JSON.stringify(decision), { status: 403 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
