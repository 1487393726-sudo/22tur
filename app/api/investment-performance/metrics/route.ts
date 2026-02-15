/**
 * Investment Performance Metrics API Endpoint
 * GET /api/investment-performance/metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { investmentPerformanceMonitor } from '@/lib/investment-management/investment-performance-monitor';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin privileges for performance monitoring
    // In a real implementation, you'd check user roles/permissions
    const isAdmin = session.user.email?.includes('admin') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'current';
    const hours = parseInt(searchParams.get('hours') || '24', 10);

    switch (type) {
      case 'current':
        const currentMetrics = investmentPerformanceMonitor.getCurrentPerformanceMetrics();
        return NextResponse.json({
          metrics: currentMetrics,
          timestamp: new Date().toISOString(),
          message: 'Current performance metrics retrieved successfully'
        });

      case 'trends':
        const trends = investmentPerformanceMonitor.getPerformanceTrends(hours);
        return NextResponse.json({
          trends,
          period: `${hours} hours`,
          message: 'Performance trends retrieved successfully'
        });

      case 'alerts':
        const alerts = investmentPerformanceMonitor.getActiveAlerts();
        return NextResponse.json({
          alerts,
          count: alerts.length,
          message: 'Active alerts retrieved successfully'
        });

      case 'health':
        const health = investmentPerformanceMonitor.getSystemHealth();
        return NextResponse.json({
          health,
          message: 'System health status retrieved successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid metrics type. Valid types: current, trends, alerts, health' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to retrieve performance metrics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin privileges
    const isAdmin = session.user.email?.includes('admin') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'record_calculation':
        const { calculationType, duration, portfolioId, success } = data;
        investmentPerformanceMonitor.recordCalculationPerformance(
          calculationType,
          duration,
          portfolioId,
          success
        );
        return NextResponse.json({
          success: true,
          message: 'Calculation performance recorded successfully'
        });

      case 'record_data_refresh':
        const { refreshType, refreshDuration, recordCount, refreshSuccess } = data;
        investmentPerformanceMonitor.recordDataRefreshPerformance(
          refreshType,
          refreshDuration,
          recordCount,
          refreshSuccess
        );
        return NextResponse.json({
          success: true,
          message: 'Data refresh performance recorded successfully'
        });

      case 'resolve_alert':
        const { alertId } = data;
        investmentPerformanceMonitor.resolveAlert(alertId);
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });

      case 'update_thresholds':
        const { thresholds } = data;
        investmentPerformanceMonitor.updateThresholds(thresholds);
        return NextResponse.json({
          success: true,
          message: 'Performance thresholds updated successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Valid actions: record_calculation, record_data_refresh, resolve_alert, update_thresholds' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Failed to process performance metrics action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process performance metrics action',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}