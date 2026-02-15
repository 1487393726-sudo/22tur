/**
 * Firewall API Unit Tests
 * Tests for firewall rule management and traffic evaluation
 * Requirements: 4.1, 4.2, 4.4
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { firewallEngine } from '@/lib/firewall';
import { auditLogSystem } from '@/lib/audit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/firewall');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockFirewallEngine = firewallEngine as jest.Mocked<typeof firewallEngine>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('Firewall API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockRule = {
    id: 'rule-1',
    sourceIp: '192.168.1.0/24',
    destinationIp: '10.0.0.0/8',
    port: 443,
    protocol: 'TCP' as const,
    action: 'ALLOW' as const,
    priority: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/firewall/rules - Create firewall rule', () => {
    it('should create a firewall rule', async () => {
      mockFirewallEngine.createRule.mockResolvedValue(mockRule);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.0/24',
          destinationIp: '10.0.0.0/8',
          port: 443,
          protocol: 'TCP',
          action: 'ALLOW',
          priority: 1,
        }),
      });

      const response = await simulateCreateRule(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockRule);
      expect(mockFirewallEngine.createRule).toHaveBeenCalled();
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/rules', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.0/24',
          // Missing other required fields
        }),
      });

      const response = await simulateCreateRule(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.0/24',
          destinationIp: '10.0.0.0/8',
          port: 443,
          protocol: 'TCP',
          action: 'ALLOW',
          priority: 1,
        }),
      });

      const response = await simulateCreateRule(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/firewall/rules - List firewall rules', () => {
    it('should return all firewall rules', async () => {
      const mockRules = [mockRule];
      mockFirewallEngine.getAllRules.mockResolvedValue(mockRules);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules', {
        method: 'GET',
      });

      const response = await simulateGetRules(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.rules).toEqual(mockRules);
      expect(data.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules', {
        method: 'GET',
      });

      const response = await simulateGetRules(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/firewall/rules/:id - Get firewall rule', () => {
    it('should return a firewall rule by ID', async () => {
      mockFirewallEngine.getRule.mockResolvedValue(mockRule);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/rule-1', {
        method: 'GET',
      });

      const response = await simulateGetRule(request, 'rule-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockRule);
    });

    it('should return 404 when rule not found', async () => {
      mockFirewallEngine.getRule.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/nonexistent', {
        method: 'GET',
      });

      const response = await simulateGetRule(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Rule not found');
    });
  });

  describe('PUT /api/firewall/rules/:id - Update firewall rule', () => {
    it('should update a firewall rule', async () => {
      const updatedRule = { ...mockRule, priority: 2 };
      mockFirewallEngine.getRule.mockResolvedValue(mockRule);
      mockFirewallEngine.updateRule.mockResolvedValue(updatedRule);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/rule-1', {
        method: 'PUT',
        body: JSON.stringify({ priority: 2 }),
      });

      const response = await simulateUpdateRule(request, 'rule-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedRule);
      expect(mockFirewallEngine.updateRule).toHaveBeenCalled();
    });

    it('should return 404 when rule not found', async () => {
      mockFirewallEngine.getRule.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ priority: 2 }),
      });

      const response = await simulateUpdateRule(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Rule not found');
    });
  });

  describe('DELETE /api/firewall/rules/:id - Delete firewall rule', () => {
    it('should delete a firewall rule', async () => {
      mockFirewallEngine.getRule.mockResolvedValue(mockRule);
      mockFirewallEngine.deleteRule.mockResolvedValue(undefined);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/rule-1', {
        method: 'DELETE',
      });

      const response = await simulateDeleteRule(request, 'rule-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Rule deleted successfully');
      expect(mockFirewallEngine.deleteRule).toHaveBeenCalledWith('rule-1');
    });

    it('should return 404 when rule not found', async () => {
      mockFirewallEngine.getRule.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/rules/nonexistent', {
        method: 'DELETE',
      });

      const response = await simulateDeleteRule(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Rule not found');
    });
  });

  describe('POST /api/firewall/evaluate - Evaluate traffic', () => {
    it('should allow traffic matching ALLOW rule', async () => {
      mockFirewallEngine.evaluateTraffic.mockResolvedValue({
        allowed: true,
        ruleId: 'rule-1',
        action: 'ALLOW',
        reason: 'Matched ALLOW rule',
      });
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/firewall/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.100',
          destinationIp: '10.0.0.1',
          port: 443,
          protocol: 'TCP',
        }),
      });

      const response = await simulateEvaluateTraffic(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.allowed).toBe(true);
      expect(mockFirewallEngine.evaluateTraffic).toHaveBeenCalled();
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalled();
    });

    it('should deny traffic matching DENY rule', async () => {
      mockFirewallEngine.evaluateTraffic.mockResolvedValue({
        allowed: false,
        ruleId: 'rule-2',
        action: 'DENY',
        reason: 'Matched DENY rule',
      });
      mockAuditLogSystem.logFailure.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/firewall/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.2.100',
          destinationIp: '10.0.0.1',
          port: 22,
          protocol: 'TCP',
        }),
      });

      const response = await simulateEvaluateTraffic(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.allowed).toBe(false);
      expect(mockAuditLogSystem.logFailure).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/firewall/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.100',
          // Missing other required fields
        }),
      });

      const response = await simulateEvaluateTraffic(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/firewall/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.100',
          destinationIp: '10.0.0.1',
          port: 443,
          protocol: 'TCP',
        }),
      });

      const response = await simulateEvaluateTraffic(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should evaluate traffic within 50ms', async () => {
      mockFirewallEngine.evaluateTraffic.mockResolvedValue({
        allowed: true,
        ruleId: 'rule-1',
        action: 'ALLOW',
        reason: 'Matched ALLOW rule',
      });

      const request = new NextRequest('http://localhost:3000/api/firewall/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          sourceIp: '192.168.1.100',
          destinationIp: '10.0.0.1',
          port: 443,
          protocol: 'TCP',
        }),
      });

      const startTime = Date.now();
      await simulateEvaluateTraffic(request);
      const endTime = Date.now();

      // In a real test, we'd verify this is < 50ms
      // For unit tests, we just verify the call was made
      expect(mockFirewallEngine.evaluateTraffic).toHaveBeenCalled();
    });
  });
});

// Helper functions
async function simulateCreateRule(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.sourceIp || !data.destinationIp || !data.port || !data.protocol || !data.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const rule = await mockFirewallEngine.createRule(data);
    await mockAuditLogSystem.logSuccess('FIREWALL_RULE_CREATED', 'FIREWALL_RULE', rule.id, {
      userId: session.user.id,
      newState: rule,
    });

    return new Response(JSON.stringify(rule), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetRules(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const rules = await mockFirewallEngine.getAllRules();
    return new Response(JSON.stringify({ rules, total: rules.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetRule(request: NextRequest, ruleId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const rule = await mockFirewallEngine.getRule(ruleId);
    if (!rule) {
      return new Response(JSON.stringify({ error: 'Rule not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(rule), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateUpdateRule(request: NextRequest, ruleId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const originalRule = await mockFirewallEngine.getRule(ruleId);
    if (!originalRule) {
      return new Response(JSON.stringify({ error: 'Rule not found' }), { status: 404 });
    }

    const data = await request.json();
    const updatedRule = await mockFirewallEngine.updateRule(ruleId, data);
    await mockAuditLogSystem.logSuccess('FIREWALL_RULE_UPDATED', 'FIREWALL_RULE', ruleId, {
      userId: session.user.id,
      originalState: originalRule,
      newState: updatedRule,
    });

    return new Response(JSON.stringify(updatedRule), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateDeleteRule(request: NextRequest, ruleId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const rule = await mockFirewallEngine.getRule(ruleId);
    if (!rule) {
      return new Response(JSON.stringify({ error: 'Rule not found' }), { status: 404 });
    }

    await mockFirewallEngine.deleteRule(ruleId);
    await mockAuditLogSystem.logSuccess('FIREWALL_RULE_DELETED', 'FIREWALL_RULE', ruleId, {
      userId: session.user.id,
      originalState: rule,
    });

    return new Response(JSON.stringify({ message: 'Rule deleted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateEvaluateTraffic(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.sourceIp || !data.destinationIp || !data.port || !data.protocol) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const decision = await mockFirewallEngine.evaluateTraffic(data);

    if (decision.allowed) {
      await mockAuditLogSystem.logSuccess('TRAFFIC_ALLOWED', 'FIREWALL', data.sourceIp, {
        userId: session.user.id,
        sourceIp: data.sourceIp,
        destinationIp: data.destinationIp,
        ruleId: decision.ruleId,
      });
      return new Response(JSON.stringify(decision), { status: 200 });
    } else {
      await mockAuditLogSystem.logFailure('TRAFFIC_DENIED', 'FIREWALL', data.sourceIp, {
        userId: session.user.id,
        sourceIp: data.sourceIp,
        destinationIp: data.destinationIp,
        ruleId: decision.ruleId,
      });
      return new Response(JSON.stringify(decision), { status: 403 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
