/**
 * Compliance Reporting System
 * Generates comprehensive compliance reports with access statistics and security events
 */

import { prisma } from '@/lib/prisma';
import { auditLogSystem } from '@/lib/audit';

export interface ComplianceReportData {
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  totalAccessAttempts: number;
  successfulAccesses: number;
  failedAccesses: number;
  deniedAccesses: number;
  permissionChanges: number;
  roleChanges: number;
  securityEvents: number;
  anomaliesDetected: number;
  criticalAnomalies: number;
  topUsers: Array<{
    userId: string;
    accessCount: number;
    failureCount: number;
  }>;
  topResources: Array<{
    resourceId: string;
    accessCount: number;
    denialCount: number;
  }>;
  permissionChangesSummary: Array<{
    action: string;
    count: number;
  }>;
  securityEventsSummary: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
  complianceScore: number;
  recommendations: string[];
}

export interface ComplianceReport {
  id: string;
  title: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate: Date;
  endDate: Date;
  data: ComplianceReportData;
  format: 'PDF' | 'CSV' | 'JSON';
  status: 'GENERATED' | 'EXPORTED' | 'ARCHIVED';
  createdAt: Date;
  exportedAt?: Date;
}

export class ComplianceReporter {
  /**
   * Generate compliance report
   */
  async generateReport(data: {
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    startDate: Date;
    endDate: Date;
  }): Promise<ComplianceReport> {
    // Collect all data for the report
    const reportData = await this.collectReportData(data.startDate, data.endDate);

    // Create report in database
    const report = await prisma.complianceReport.create({
      data: {
        title: `${data.period} Compliance Report - ${data.startDate.toISOString().split('T')[0]} to ${data.endDate.toISOString().split('T')[0]}`,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        data: JSON.stringify(reportData),
        format: 'JSON',
        status: 'GENERATED',
      },
    });

    return this.mapReport(report);
  }

  /**
   * Get report by ID
   */
  async getReport(id: string): Promise<ComplianceReport | null> {
    const report = await prisma.complianceReport.findUnique({
      where: { id },
    });

    return report ? this.mapReport(report) : null;
  }

  /**
   * Get all reports
   */
  async getAllReports(filters?: {
    period?: string;
    status?: string;
    limit?: number;
  }): Promise<ComplianceReport[]> {
    const where: any = {};

    if (filters?.period) {
      where.period = filters.period;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const reports = await prisma.complianceReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ?? 100,
    });

    return reports.map((r) => this.mapReport(r));
  }

  /**
   * Export report
   */
  async exportReport(
    id: string,
    format: 'PDF' | 'CSV' | 'JSON'
  ): Promise<{
    content: string;
    filename: string;
    mimeType: string;
  }> {
    const report = await this.getReport(id);

    if (!report) {
      throw new Error(`Report with ID "${id}" not found`);
    }

    let content: string;
    let mimeType: string;

    switch (format) {
      case 'JSON':
        content = JSON.stringify(report.data, null, 2);
        mimeType = 'application/json';
        break;

      case 'CSV':
        content = this.generateCSV(report);
        mimeType = 'text/csv';
        break;

      case 'PDF':
        content = this.generatePDF(report);
        mimeType = 'application/pdf';
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Update report status
    await prisma.complianceReport.update({
      where: { id },
      data: {
        format,
        status: 'EXPORTED',
        exportedAt: new Date(),
      },
    });

    return {
      content,
      filename: `compliance-report-${report.period}-${report.startDate.toISOString().split('T')[0]}.${format.toLowerCase()}`,
      mimeType,
    };
  }

  /**
   * Collect all data for report
   */
  private async collectReportData(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReportData> {
    // Get access statistics
    const accessLogs = await auditLogSystem.queryLogs({
      action: 'ACCESS_APPROVED',
      startDate,
      endDate,
      limit: 10000,
    });

    const denialLogs = await auditLogSystem.queryLogs({
      action: 'ACCESS_DENIED',
      startDate,
      endDate,
      limit: 10000,
    });

    const allLogs = await auditLogSystem.queryLogs({
      startDate,
      endDate,
      limit: 10000,
    });

    // Get permission changes
    const permissionChanges = await auditLogSystem.queryLogs({
      action: 'PERMISSION_CREATED',
      startDate,
      endDate,
      limit: 10000,
    });

    const roleChanges = await auditLogSystem.queryLogs({
      action: 'ROLE_CREATED',
      startDate,
      endDate,
      limit: 10000,
    });

    // Get security events
    const anomalies = await prisma.anomaly.findMany({
      where: {
        detectedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate statistics
    const topUsers = this.getTopUsers(allLogs, 10);
    const topResources = this.getTopResources(allLogs, 10);
    const permissionChangesSummary = this.summarizeActions(permissionChanges);
    const securityEventsSummary = this.summarizeAnomalies(anomalies);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore({
      totalAccess: allLogs.length,
      successfulAccess: accessLogs.length,
      failedAccess: denialLogs.length,
      anomalies: anomalies.length,
      criticalAnomalies: anomalies.filter((a) => a.severity === 'CRITICAL').length,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      failureRate: denialLogs.length / allLogs.length,
      anomalyCount: anomalies.length,
      criticalAnomalies: anomalies.filter((a) => a.severity === 'CRITICAL').length,
      permissionChanges: permissionChanges.length,
    });

    return {
      period: 'MONTHLY',
      startDate,
      endDate,
      totalAccessAttempts: allLogs.length,
      successfulAccesses: accessLogs.length,
      failedAccesses: allLogs.filter((l) => l.result === 'FAILURE').length,
      deniedAccesses: denialLogs.length,
      permissionChanges: permissionChanges.length,
      roleChanges: roleChanges.length,
      securityEvents: anomalies.length,
      anomaliesDetected: anomalies.length,
      criticalAnomalies: anomalies.filter((a) => a.severity === 'CRITICAL').length,
      topUsers,
      topResources,
      permissionChangesSummary,
      securityEventsSummary,
      complianceScore,
      recommendations,
    };
  }

  /**
   * Get top users by access count
   */
  private getTopUsers(
    logs: any[],
    limit: number
  ): Array<{
    userId: string;
    accessCount: number;
    failureCount: number;
  }> {
    const userStats = new Map<
      string,
      { accessCount: number; failureCount: number }
    >();

    for (const log of logs) {
      if (!log.userId) continue;

      const stats = userStats.get(log.userId) || {
        accessCount: 0,
        failureCount: 0,
      };

      stats.accessCount++;
      if (log.result === 'FAILURE') {
        stats.failureCount++;
      }

      userStats.set(log.userId, stats);
    }

    return Array.from(userStats.entries())
      .map(([userId, stats]) => ({
        userId,
        ...stats,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Get top resources by access count
   */
  private getTopResources(
    logs: any[],
    limit: number
  ): Array<{
    resourceId: string;
    accessCount: number;
    denialCount: number;
  }> {
    const resourceStats = new Map<
      string,
      { accessCount: number; denialCount: number }
    >();

    for (const log of logs) {
      if (!log.resourceId) continue;

      const stats = resourceStats.get(log.resourceId) || {
        accessCount: 0,
        denialCount: 0,
      };

      stats.accessCount++;
      if (log.action === 'ACCESS_DENIED') {
        stats.denialCount++;
      }

      resourceStats.set(log.resourceId, stats);
    }

    return Array.from(resourceStats.entries())
      .map(([resourceId, stats]) => ({
        resourceId,
        ...stats,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Summarize actions
   */
  private summarizeActions(
    logs: any[]
  ): Array<{
    action: string;
    count: number;
  }> {
    const summary = new Map<string, number>();

    for (const log of logs) {
      const count = summary.get(log.action) || 0;
      summary.set(log.action, count + 1);
    }

    return Array.from(summary.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Summarize anomalies
   */
  private summarizeAnomalies(
    anomalies: any[]
  ): Array<{
    type: string;
    count: number;
    severity: string;
  }> {
    const summary = new Map<string, { count: number; severity: string }>();

    for (const anomaly of anomalies) {
      const key = anomaly.type;
      const existing = summary.get(key) || { count: 0, severity: anomaly.severity };
      existing.count++;
      summary.set(key, existing);
    }

    return Array.from(summary.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(stats: {
    totalAccess: number;
    successfulAccess: number;
    failedAccess: number;
    anomalies: number;
    criticalAnomalies: number;
  }): number {
    let score = 100;

    // Deduct for failed accesses
    const failureRate = stats.failedAccess / (stats.totalAccess || 1);
    score -= failureRate * 20;

    // Deduct for anomalies
    score -= Math.min(stats.anomalies * 2, 30);

    // Deduct for critical anomalies
    score -= stats.criticalAnomalies * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(stats: {
    failureRate: number;
    anomalyCount: number;
    criticalAnomalies: number;
    permissionChanges: number;
  }): string[] {
    const recommendations: string[] = [];

    if (stats.failureRate > 0.1) {
      recommendations.push(
        'High failure rate detected. Review access control policies and user permissions.'
      );
    }

    if (stats.anomalyCount > 10) {
      recommendations.push(
        'Multiple anomalies detected. Investigate unusual access patterns and consider implementing additional security measures.'
      );
    }

    if (stats.criticalAnomalies > 0) {
      recommendations.push(
        'Critical security anomalies detected. Immediate investigation and response required.'
      );
    }

    if (stats.permissionChanges > 50) {
      recommendations.push(
        'Frequent permission changes detected. Review permission management processes and ensure proper authorization.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating normally. Continue monitoring for security events.');
    }

    return recommendations;
  }

  /**
   * Generate CSV export
   */
  private generateCSV(report: ComplianceReport): string {
    const lines: string[] = [];

    lines.push('Compliance Report');
    lines.push(`Period,${report.period}`);
    lines.push(`Start Date,${report.startDate.toISOString()}`);
    lines.push(`End Date,${report.endDate.toISOString()}`);
    lines.push('');

    lines.push('Access Statistics');
    lines.push(`Total Access Attempts,${report.data.totalAccessAttempts}`);
    lines.push(`Successful Accesses,${report.data.successfulAccesses}`);
    lines.push(`Failed Accesses,${report.data.failedAccesses}`);
    lines.push(`Denied Accesses,${report.data.deniedAccesses}`);
    lines.push('');

    lines.push('Security Events');
    lines.push(`Anomalies Detected,${report.data.anomaliesDetected}`);
    lines.push(`Critical Anomalies,${report.data.criticalAnomalies}`);
    lines.push('');

    lines.push('Compliance Score');
    lines.push(`Score,${report.data.complianceScore}`);
    lines.push('');

    lines.push('Top Users');
    lines.push('User ID,Access Count,Failure Count');
    for (const user of report.data.topUsers) {
      lines.push(`${user.userId},${user.accessCount},${user.failureCount}`);
    }
    lines.push('');

    lines.push('Recommendations');
    for (const rec of report.data.recommendations) {
      lines.push(`"${rec}"`);
    }

    return lines.join('\n');
  }

  /**
   * Generate PDF export (simplified - returns JSON representation)
   */
  private generatePDF(report: ComplianceReport): string {
    // In production, use a library like pdfkit or puppeteer
    // For now, return a formatted string
    return JSON.stringify(report, null, 2);
  }

  /**
   * Map database report to ComplianceReport interface
   */
  private mapReport(report: any): ComplianceReport {
    return {
      id: report.id,
      title: report.title,
      period: report.period,
      startDate: report.startDate,
      endDate: report.endDate,
      data: JSON.parse(report.data),
      format: report.format,
      status: report.status,
      createdAt: report.createdAt,
      exportedAt: report.exportedAt,
    };
  }
}

export const complianceReporter = new ComplianceReporter();
