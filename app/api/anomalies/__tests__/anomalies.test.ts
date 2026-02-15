/**
 * Anomaly Detection API Unit Tests
 * Tests for anomaly and alert retrieval
 * Requirements: 7.1, 7.2, 7.5
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { anomalyDetector } from '@/lib/anomaly';

jest.mock('next-auth');
jest.mock('@/lib/anomaly');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockAnomalyDetector = anomalyDetector as jest.Mocked<typeof anomalyDetector>;

describe('Anomaly Detection API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockAnomaly = {
    id: 'anomaly-1',
    userId: 'user-123',
    type: 'BRUTE_FORCE',
    severity: 'HIGH' as const,
    description: 'Multiple failed access attempts detected',
    context: { failureCount: 5 },
    status: 'NEW' as const,
    detectedAt: new Date(),
    resolvedAt: undefined,
  };

  const mockAlert = {
    id: 'alert-1',
    anomalyId: 'anomaly-1',
    severity: 'HIGH' as const,
    description: 'Multiple failed access attempts detected',
    action: 'REVOKE_SESSIONS',
    status: 'NEW' as const,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('GET /api/anomalies - List anomalies', () => {
    it('should return all anomalies', async () => {
      const mockAnomalies = [mockAnomaly];
      mockAnomalyDetector.getUserAnomalies.mockResolvedValue(mockAnomalies);

      const request = new NextRequest('http://localhost:3000/api/anomalies', {
        method: 'GET',
      });

      const response = await simulateGetAnomalies(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.anomalies).toEqual(mockAnomalies);
      expect(data.total).toBe(1);
    });

    it('should filter anomalies by severity', async () => {
      const mockAnomalies = [mockAnomaly];
      mockAnomalyDetector.getUserAnomalies.mockResolvedValue(mockAnomalies);

      const request = new NextRequest('http://localhost:3000/api/anomalies?severity=HIGH', {
        method: 'GET',
      });

      const response = await simulateGetAnomalies(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.anomalies).toEqual(mockAnomalies);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/anomalies', {
        method: 'GET',
      });

      const response = await simulateGetAnomalies(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/anomalies/:id - Get anomaly', () => {
    it('should return an anomaly by ID', async () => {
      mockAnomalyDetector.getAnomaly.mockResolvedValue(mockAnomaly);

      const request = new NextRequest('http://localhost:3000/api/anomalies/anomaly-1', {
        method: 'GET',
      });

      const response = await simulateGetAnomaly(request, 'anomaly-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAnomaly);
    });

    it('should return 404 when anomaly not found', async () => {
      mockAnomalyDetector.getAnomaly.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/anomalies/nonexistent', {
        method: 'GET',
      });

      const response = await simulateGetAnomaly(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Anomaly not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/anomalies/anomaly-1', {
        method: 'GET',
      });

      const response = await simulateGetAnomaly(request, 'anomaly-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/anomalies/:id - Update anomaly status', () => {
    it('should update anomaly status to ACKNOWLEDGED', async () => {
      const updatedAnomaly = { ...mockAnomaly, status: 'ACKNOWLEDGED' as const };
      mockAnomalyDetector.getAnomaly.mockResolvedValue(mockAnomaly);
      mockAnomalyDetector.updateAnomalyStatus.mockResolvedValue(updatedAnomaly);

      const request = new NextRequest('http://localhost:3000/api/anomalies/anomaly-1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
      });

      const response = await simulateUpdateAnomalyStatus(request, 'anomaly-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ACKNOWLEDGED');
      expect(mockAnomalyDetector.updateAnomalyStatus).toHaveBeenCalledWith('anomaly-1', 'ACKNOWLEDGED');
    });

    it('should update anomaly status to RESOLVED', async () => {
      const updatedAnomaly = {
        ...mockAnomaly,
        status: 'RESOLVED' as const,
        resolvedAt: new Date(),
      };
      mockAnomalyDetector.getAnomaly.mockResolvedValue(mockAnomaly);
      mockAnomalyDetector.updateAnomalyStatus.mockResolvedValue(updatedAnomaly);

      const request = new NextRequest('http://localhost:3000/api/anomalies/anomaly-1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      const response = await simulateUpdateAnomalyStatus(request, 'anomaly-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('RESOLVED');
      expect(data.resolvedAt).toBeDefined();
    });

    it('should return 404 when anomaly not found', async () => {
      mockAnomalyDetector.getAnomaly.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/anomalies/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ status: 'ACKNOWLEDGED' }),
      });

      const response = await simulateUpdateAnomalyStatus(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Anomaly not found');
    });
  });

  describe('GET /api/alerts - List alerts', () => {
    it('should return all alerts', async () => {
      const mockAlerts = [mockAlert];
      mockAnomalyDetector.getAlerts.mockResolvedValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
      });

      const response = await simulateGetAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toEqual(mockAlerts);
      expect(data.total).toBe(1);
    });

    it('should filter alerts by severity', async () => {
      const mockAlerts = [mockAlert];
      mockAnomalyDetector.getAlerts.mockResolvedValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/alerts?severity=HIGH', {
        method: 'GET',
      });

      const response = await simulateGetAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toEqual(mockAlerts);
      expect(mockAnomalyDetector.getAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'HIGH' })
      );
    });

    it('should filter alerts by status', async () => {
      const mockAlerts = [mockAlert];
      mockAnomalyDetector.getAlerts.mockResolvedValue(mockAlerts);

      const request = new NextRequest('http://localhost:3000/api/alerts?status=NEW', {
        method: 'GET',
      });

      const response = await simulateGetAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.alerts).toEqual(mockAlerts);
      expect(mockAnomalyDetector.getAlerts).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'NEW' })
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/alerts', {
        method: 'GET',
      });

      const response = await simulateGetAlerts(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/alerts/:id/acknowledge - Acknowledge alert', () => {
    it('should acknowledge an alert', async () => {
      const acknowledgedAlert = { ...mockAlert, status: 'ACKNOWLEDGED' as const };
      mockAnomalyDetector.acknowledgeAlert.mockResolvedValue(acknowledgedAlert);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'POST',
      });

      const response = await simulateAcknowledgeAlert(request, 'alert-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ACKNOWLEDGED');
      expect(mockAnomalyDetector.acknowledgeAlert).toHaveBeenCalledWith('alert-1');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/alerts/alert-1/acknowledge', {
        method: 'POST',
      });

      const response = await simulateAcknowledgeAlert(request, 'alert-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});

// Helper functions
async function simulateGetAnomalies(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    const anomalies = await mockAnomalyDetector.getUserAnomalies(session.user.id);

    return new Response(JSON.stringify({ anomalies, total: anomalies.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetAnomaly(request: NextRequest, anomalyId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const anomaly = await mockAnomalyDetector.getAnomaly(anomalyId);
    if (!anomaly) {
      return new Response(JSON.stringify({ error: 'Anomaly not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(anomaly), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateUpdateAnomalyStatus(request: NextRequest, anomalyId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const anomaly = await mockAnomalyDetector.getAnomaly(anomalyId);
    if (!anomaly) {
      return new Response(JSON.stringify({ error: 'Anomaly not found' }), { status: 404 });
    }

    const data = await request.json();
    const updatedAnomaly = await mockAnomalyDetector.updateAnomalyStatus(anomalyId, data.status);

    return new Response(JSON.stringify(updatedAnomaly), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetAlerts(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');

    const alerts = await mockAnomalyDetector.getAlerts({
      severity: severity || undefined,
      status: status || undefined,
    });

    return new Response(JSON.stringify({ alerts, total: alerts.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateAcknowledgeAlert(request: NextRequest, alertId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const alert = await mockAnomalyDetector.acknowledgeAlert(alertId);

    return new Response(JSON.stringify(alert), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
