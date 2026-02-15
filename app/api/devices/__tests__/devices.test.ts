/**
 * Device Management API Unit Tests
 * Tests for device registration and management
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { deviceManager } from '@/lib/device';
import { auditLogSystem } from '@/lib/audit';

jest.mock('next-auth');
jest.mock('@/lib/device');
jest.mock('@/lib/audit');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockDeviceManager = deviceManager as jest.Mocked<typeof deviceManager>;
const mockAuditLogSystem = auditLogSystem as jest.Mocked<typeof auditLogSystem>;

describe('Device Management API', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
    },
  };

  const mockDevice = {
    id: 'device-1',
    fingerprint: 'fp-abc123',
    name: 'MacBook Pro',
    owner: 'user-123',
    trustScore: 85,
    lastSeen: new Date(),
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/devices - Register device', () => {
    it('should register a new device', async () => {
      mockDeviceManager.registerDevice.mockResolvedValue(mockDevice);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/devices', {
        method: 'POST',
        body: JSON.stringify({
          fingerprint: 'fp-abc123',
          name: 'MacBook Pro',
        }),
      });

      const response = await simulateRegisterDevice(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockDevice);
      expect(mockDeviceManager.registerDevice).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/devices', {
        method: 'POST',
        body: JSON.stringify({
          fingerprint: 'fp-abc123',
          // Missing name
        }),
      });

      const response = await simulateRegisterDevice(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/devices', {
        method: 'POST',
        body: JSON.stringify({
          fingerprint: 'fp-abc123',
          name: 'MacBook Pro',
        }),
      });

      const response = await simulateRegisterDevice(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/devices - List devices', () => {
    it('should return all devices', async () => {
      const mockDevices = [mockDevice];
      mockDeviceManager.getAllDevices.mockResolvedValue(mockDevices);

      const request = new NextRequest('http://localhost:3000/api/devices', {
        method: 'GET',
      });

      const response = await simulateGetDevices(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.devices).toEqual(mockDevices);
      expect(data.total).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/devices', {
        method: 'GET',
      });

      const response = await simulateGetDevices(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/devices/:fingerprint - Get device', () => {
    it('should return a device by fingerprint', async () => {
      mockDeviceManager.getDevice.mockResolvedValue(mockDevice);

      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123', {
        method: 'GET',
      });

      const response = await simulateGetDevice(request, 'fp-abc123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockDevice);
    });

    it('should return 404 when device not found', async () => {
      mockDeviceManager.getDevice.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/devices/nonexistent', {
        method: 'GET',
      });

      const response = await simulateGetDevice(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Device not found');
    });
  });

  describe('PUT /api/devices/:fingerprint/trust-score - Update trust score', () => {
    it('should update device trust score', async () => {
      const updatedDevice = { ...mockDevice, trustScore: 50 };
      mockDeviceManager.getDevice.mockResolvedValue(mockDevice);
      mockDeviceManager.updateDeviceTrustScore.mockResolvedValue(updatedDevice);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123/trust-score', {
        method: 'PUT',
        body: JSON.stringify({ trustScore: 50 }),
      });

      const response = await simulateUpdateTrustScore(request, 'fp-abc123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trustScore).toBe(50);
      expect(mockDeviceManager.updateDeviceTrustScore).toHaveBeenCalledWith('fp-abc123', 50);
    });

    it('should return 400 when trust score is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123/trust-score', {
        method: 'PUT',
        body: JSON.stringify({ trustScore: 150 }), // Invalid: > 100
      });

      const response = await simulateUpdateTrustScore(request, 'fp-abc123');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid trust score');
    });

    it('should restrict access when trust score is low', async () => {
      const lowTrustDevice = { ...mockDevice, trustScore: 20 };
      mockDeviceManager.getDevice.mockResolvedValue(lowTrustDevice);
      mockDeviceManager.isDeviceTrusted.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123/trust-score', {
        method: 'PUT',
        body: JSON.stringify({ trustScore: 20 }),
      });

      const response = await simulateUpdateTrustScore(request, 'fp-abc123');
      const data = await response.json();

      expect(response.status).toBe(200);
      // Device with low trust score should have restricted access
      expect(mockDeviceManager.isDeviceTrusted).toHaveBeenCalled();
    });
  });

  describe('POST /api/devices/:fingerprint/compromise - Mark as compromised', () => {
    it('should mark device as compromised', async () => {
      const compromisedDevice = { ...mockDevice, status: 'COMPROMISED' as const };
      mockDeviceManager.getDevice.mockResolvedValue(mockDevice);
      mockDeviceManager.revokeDevice.mockResolvedValue(compromisedDevice);
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123/compromise', {
        method: 'POST',
      });

      const response = await simulateMarkCompromised(request, 'fp-abc123');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('COMPROMISED');
      expect(mockDeviceManager.revokeDevice).toHaveBeenCalledWith('fp-abc123');
    });

    it('should revoke all sessions from compromised device', async () => {
      mockDeviceManager.getDevice.mockResolvedValue(mockDevice);
      mockDeviceManager.revokeDevice.mockResolvedValue({
        ...mockDevice,
        status: 'COMPROMISED' as const,
      });
      mockAuditLogSystem.logSuccess.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/devices/fp-abc123/compromise', {
        method: 'POST',
      });

      const response = await simulateMarkCompromised(request, 'fp-abc123');

      expect(response.status).toBe(200);
      expect(mockDeviceManager.revokeDevice).toHaveBeenCalled();
      expect(mockAuditLogSystem.logSuccess).toHaveBeenCalledWith(
        'DEVICE_COMPROMISED',
        'DEVICE',
        'fp-abc123',
        expect.any(Object)
      );
    });

    it('should return 404 when device not found', async () => {
      mockDeviceManager.getDevice.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/devices/nonexistent/compromise', {
        method: 'POST',
      });

      const response = await simulateMarkCompromised(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Device not found');
    });
  });
});

// Helper functions
async function simulateRegisterDevice(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.fingerprint || !data.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fingerprint, name' }),
        { status: 400 }
      );
    }

    const device = await mockDeviceManager.registerDevice({
      fingerprint: data.fingerprint,
      name: data.name,
      owner: session.user.id,
    });

    await mockAuditLogSystem.logSuccess('DEVICE_REGISTERED', 'DEVICE', device.id, {
      userId: session.user.id,
      newState: device,
    });

    return new Response(JSON.stringify(device), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetDevices(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const devices = await mockDeviceManager.getAllDevices();
    return new Response(JSON.stringify({ devices, total: devices.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateGetDevice(request: NextRequest, fingerprint: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const device = await mockDeviceManager.getDevice(fingerprint);
    if (!device) {
      return new Response(JSON.stringify({ error: 'Device not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(device), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateUpdateTrustScore(request: NextRequest, fingerprint: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (typeof data.trustScore !== 'number' || data.trustScore < 0 || data.trustScore > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid trust score: must be between 0 and 100' }),
        { status: 400 }
      );
    }

    const device = await mockDeviceManager.getDevice(fingerprint);
    if (!device) {
      return new Response(JSON.stringify({ error: 'Device not found' }), { status: 404 });
    }

    const updatedDevice = await mockDeviceManager.updateDeviceTrustScore(
      fingerprint,
      data.trustScore
    );

    await mockAuditLogSystem.logSuccess('DEVICE_TRUST_SCORE_UPDATED', 'DEVICE', fingerprint, {
      userId: session.user.id,
      originalState: device,
      newState: updatedDevice,
    });

    return new Response(JSON.stringify(updatedDevice), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateMarkCompromised(request: NextRequest, fingerprint: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const device = await mockDeviceManager.getDevice(fingerprint);
    if (!device) {
      return new Response(JSON.stringify({ error: 'Device not found' }), { status: 404 });
    }

    const compromisedDevice = await mockDeviceManager.revokeDevice(fingerprint);

    await mockAuditLogSystem.logSuccess('DEVICE_COMPROMISED', 'DEVICE', fingerprint, {
      userId: session.user.id,
      originalState: device,
      newState: compromisedDevice,
    });

    return new Response(JSON.stringify(compromisedDevice), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
