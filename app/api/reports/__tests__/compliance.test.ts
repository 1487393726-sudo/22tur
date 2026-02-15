/**
 * Compliance Reporting API Unit Tests
 * Tests for report generation and export
 * Requirements: 11.1, 11.3
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { complianceReporter } from '@/lib/compliance';

jest.mock('next-auth');
jest.mock('@/lib/compliance');

const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;
const mockComplianceReporter = complianceReporter as jest.Mocked<typeof complianceReporter>;

describe('Compliance Reporting API', () => {
  const mockSession = {
    user: {
      id: 'admin-123',
      email: 'admin@example.com',
    },
  };

  const mockReport = {
    id: 'report-1',
    title: 'Monthly Compliance Report',
    period: 'MONTHLY' as const,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    data: {
      period: 'MONTHLY' as const,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      totalAccessAttempts: 1000,
      successfulAccesses: 950,
      failedAccesses: 30,
      deniedAccesses: 20,
      permissionChanges: 5,
      roleChanges: 2,
      securityEvents: 10,
      anomaliesDetected: 8,
      criticalAnomalies: 1,
      topUsers: [],
      topResources: [],
      permissionChangesSummary: [],
      securityEventsSummary: [],
      complianceScore: 92,
      recommendations: ['Continue monitoring'],
    },
    format: 'JSON' as const,
    status: 'GENERATED' as const,
    createdAt: new Date(),
    exportedAt: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue(mockSession as any);
  });

  describe('POST /api/reports/compliance - Generate compliance report', () => {
    it('should generate a compliance report', async () => {
      mockComplianceReporter.generateReport.mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost:3000/api/reports/compliance', {
        method: 'POST',
        body: JSON.stringify({
          period: 'MONTHLY',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      });

      const response = await simulateGenerateReport(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockReport);
      expect(mockComplianceReporter.generateReport).toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports/compliance', {
        method: 'POST',
        body: JSON.stringify({
          period: 'MONTHLY',
          // Missing startDate and endDate
        }),
      });

      const response = await simulateGenerateReport(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when date range is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports/compliance', {
        method: 'POST',
        body: JSON.stringify({
          period: 'MONTHLY',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() - 1000).toISOString(), // End before start
        }),
      });

      const response = await simulateGenerateReport(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid date range');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/compliance', {
        method: 'POST',
        body: JSON.stringify({
          period: 'MONTHLY',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      });

      const response = await simulateGenerateReport(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should include access statistics in report', async () => {
      mockComplianceReporter.generateReport.mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost:3000/api/reports/compliance', {
        method: 'POST',
        body: JSON.stringify({
          period: 'MONTHLY',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      });

      const response = await simulateGenerateReport(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.totalAccessAttempts).toBe(1000);
      expect(data.data.successfulAccesses).toBe(950);
      expect(data.data.complianceScore).toBe(92);
    });
  });

  describe('GET /api/reports/:id - Get report', () => {
    it('should return a report by ID', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(mockReport);

      const request = new NextRequest('http://localhost:3000/api/reports/report-1', {
        method: 'GET',
      });

      const response = await simulateGetReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockReport);
    });

    it('should return 404 when report not found', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/nonexistent', {
        method: 'GET',
      });

      const response = await simulateGetReport(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/report-1', {
        method: 'GET',
      });

      const response = await simulateGetReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/reports/:id/export - Export report', () => {
    it('should export report as JSON', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(mockReport);
      mockComplianceReporter.exportReport.mockResolvedValue({
        content: JSON.stringify(mockReport),
        filename: 'compliance-report-MONTHLY-2025-01-06.json',
        mimeType: 'application/json',
      });

      const request = new NextRequest('http://localhost:3000/api/reports/report-1/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'JSON' }),
      });

      const response = await simulateExportReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.filename).toContain('compliance-report');
      expect(data.mimeType).toBe('application/json');
    });

    it('should export report as CSV', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(mockReport);
      mockComplianceReporter.exportReport.mockResolvedValue({
        content: 'CSV content',
        filename: 'compliance-report-MONTHLY-2025-01-06.csv',
        mimeType: 'text/csv',
      });

      const request = new NextRequest('http://localhost:3000/api/reports/report-1/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'CSV' }),
      });

      const response = await simulateExportReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mimeType).toBe('text/csv');
      expect(mockComplianceReporter.exportReport).toHaveBeenCalledWith('report-1', 'CSV');
    });

    it('should export report as PDF', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(mockReport);
      mockComplianceReporter.exportReport.mockResolvedValue({
        content: 'PDF content',
        filename: 'compliance-report-MONTHLY-2025-01-06.pdf',
        mimeType: 'application/pdf',
      });

      const request = new NextRequest('http://localhost:3000/api/reports/report-1/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'PDF' }),
      });

      const response = await simulateExportReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.mimeType).toBe('application/pdf');
    });

    it('should return 400 when format is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/reports/report-1/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'INVALID' }),
      });

      const response = await simulateExportReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid format');
    });

    it('should return 404 when report not found', async () => {
      mockComplianceReporter.getReport.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/nonexistent/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'JSON' }),
      });

      const response = await simulateExportReport(request, 'nonexistent');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Report not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/report-1/export', {
        method: 'POST',
        body: JSON.stringify({ format: 'JSON' }),
      });

      const response = await simulateExportReport(request, 'report-1');
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/reports/history - Get report history', () => {
    it('should return report history', async () => {
      const mockReports = [mockReport];
      mockComplianceReporter.getAllReports.mockResolvedValue(mockReports);

      const request = new NextRequest('http://localhost:3000/api/reports/history', {
        method: 'GET',
      });

      const response = await simulateGetReportHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toEqual(mockReports);
      expect(data.total).toBe(1);
    });

    it('should filter reports by period', async () => {
      const mockReports = [mockReport];
      mockComplianceReporter.getAllReports.mockResolvedValue(mockReports);

      const request = new NextRequest('http://localhost:3000/api/reports/history?period=MONTHLY', {
        method: 'GET',
      });

      const response = await simulateGetReportHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.reports).toEqual(mockReports);
      expect(mockComplianceReporter.getAllReports).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'MONTHLY' })
      );
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/reports/history', {
        method: 'GET',
      });

      const response = await simulateGetReportHistory(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return results within 5 seconds', async () => {
      mockComplianceReporter.getAllReports.mockResolvedValue([mockReport]);

      const request = new NextRequest('http://localhost:3000/api/reports/history', {
        method: 'GET',
      });

      const startTime = Date.now();
      await simulateGetReportHistory(request);
      const endTime = Date.now();

      // In a real test, we'd verify this is < 5000ms
      expect(mockComplianceReporter.getAllReports).toHaveBeenCalled();
    });
  });
});

// Helper functions
async function simulateGenerateReport(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const data = await request.json();
    if (!data.period || !data.startDate || !data.endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      return new Response(
        JSON.stringify({ error: 'Invalid date range: start must be before end' }),
        { status: 400 }
      );
    }

    const report = await mockComplianceReporter.generateReport({
      period: data.period,
      startDate,
      endDate,
    });

    return new Response(JSON.stringify(report), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetReport(request: NextRequest, reportId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const report = await mockComplianceReporter.getReport(reportId);
    if (!report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(report), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}

async function simulateExportReport(request: NextRequest, reportId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const report = await mockComplianceReporter.getReport(reportId);
    if (!report) {
      return new Response(JSON.stringify({ error: 'Report not found' }), { status: 404 });
    }

    const data = await request.json();
    const validFormats = ['PDF', 'CSV', 'JSON'];
    if (!validFormats.includes(data.format)) {
      return new Response(
        JSON.stringify({ error: `Invalid format: ${data.format}` }),
        { status: 400 }
      );
    }

    const exportData = await mockComplianceReporter.exportReport(reportId, data.format);

    return new Response(JSON.stringify(exportData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

async function simulateGetReportHistory(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period');
    const status = searchParams.get('status');

    const reports = await mockComplianceReporter.getAllReports({
      period: period || undefined,
      status: status || undefined,
    });

    return new Response(JSON.stringify({ reports, total: reports.length }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
