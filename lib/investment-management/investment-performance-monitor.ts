/**
 * Investment Management Performance Monitor
 * Specialized performance monitoring for investment calculations and data operations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InvestmentMetrics {
  calculationResponseTime: number;
  dataRefreshTime: number;
  portfolioAnalysisTime: number;
  riskAssessmentTime: number;
  reportGenerationTime: number;
  optimizationTime: number;
  backtestTime: number;
  timestamp: Date;
}

export interface PerformanceAlert {
  id: string;
  type: 'SLOW_CALCULATION' | 'DATA_REFRESH_TIMEOUT' | 'HIGH_MEMORY_USAGE' | 'CONCURRENT_LIMIT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceThresholds {
  calculationResponseTime: number; // milliseconds
  dataRefreshTime: number; // milliseconds
  portfolioAnalysisTime: number; // milliseconds
  riskAssessmentTime: number; // milliseconds
  reportGenerationTime: number; // milliseconds
  optimizationTime: number; // milliseconds
  backtestTime: number; // milliseconds
  memoryUsagePercent: number; // percentage
  concurrentUsers: number; // number of users
}

export interface SystemResourceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  queueLength: number;
  timestamp: Date;
}

export interface InvestmentOperationMetrics {
  operationType: 'CALCULATION' | 'ANALYSIS' | 'OPTIMIZATION' | 'BACKTEST' | 'REPORT' | 'RISK_ASSESSMENT';
  portfolioId?: string;
  userId?: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  success: boolean;
  errorMessage?: string;
  inputSize: number; // Number of investments/data points processed
  outputSize: number; // Size of result data
  memoryPeak: number; // Peak memory usage during operation
}

export class InvestmentPerformanceMonitor {
  private metrics: InvestmentMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private resourceMetrics: SystemResourceMetrics[] = [];
  private operationMetrics: InvestmentOperationMetrics[] = [];
  private activeOperations: Map<string, { startTime: Date; type: string; metadata: any }> = new Map();
  
  // Default performance thresholds
  private thresholds: PerformanceThresholds = {
    calculationResponseTime: 1000, // 1 second
    dataRefreshTime: 5000, // 5 seconds
    portfolioAnalysisTime: 3000, // 3 seconds
    riskAssessmentTime: 2000, // 2 seconds
    reportGenerationTime: 10000, // 10 seconds
    optimizationTime: 30000, // 30 seconds
    backtestTime: 60000, // 60 seconds
    memoryUsagePercent: 80, // 80%
    concurrentUsers: 100 // 100 concurrent users
  };

  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];

  constructor(customThresholds?: Partial<PerformanceThresholds>) {
    if (customThresholds) {
      this.thresholds = { ...this.thresholds, ...customThresholds };
    }

    // Start resource monitoring
    this.startResourceMonitoring();
  }

  /**
   * Start monitoring an investment operation
   */
  startOperation(
    operationId: string,
    type: InvestmentOperationMetrics['operationType'],
    metadata: {
      portfolioId?: string;
      userId?: string;
      inputSize?: number;
    } = {}
  ): void {
    this.activeOperations.set(operationId, {
      startTime: new Date(),
      type,
      metadata
    });
  }

  /**
   * End monitoring an investment operation
   */
  endOperation(
    operationId: string,
    result: {
      success: boolean;
      errorMessage?: string;
      outputSize?: number;
    }
  ): InvestmentOperationMetrics | null {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found in active operations`);
      return null;
    }

    const endTime = new Date();
    const duration = endTime.getTime() - operation.startTime.getTime();

    const operationMetric: InvestmentOperationMetrics = {
      operationType: operation.type as InvestmentOperationMetrics['operationType'],
      portfolioId: operation.metadata.portfolioId,
      userId: operation.metadata.userId,
      startTime: operation.startTime,
      endTime,
      duration,
      success: result.success,
      errorMessage: result.errorMessage,
      inputSize: operation.metadata.inputSize || 0,
      outputSize: result.outputSize || 0,
      memoryPeak: this.getCurrentMemoryUsage()
    };

    this.operationMetrics.push(operationMetric);
    this.activeOperations.delete(operationId);

    // Check for performance alerts
    this.checkOperationPerformance(operationMetric);

    // Store metrics in database (async, don't wait)
    this.storeOperationMetrics(operationMetric).catch(console.error);

    return operationMetric;
  }

  /**
   * Record investment calculation performance
   */
  recordCalculationPerformance(
    calculationType: 'RETURN' | 'RISK' | 'OPTIMIZATION' | 'BACKTEST',
    duration: number,
    portfolioId?: string,
    success: boolean = true
  ): void {
    const timestamp = new Date();
    
    // Update metrics based on calculation type
    const currentMetrics = this.getCurrentMetrics();
    switch (calculationType) {
      case 'RETURN':
        currentMetrics.calculationResponseTime = duration;
        break;
      case 'RISK':
        currentMetrics.riskAssessmentTime = duration;
        break;
      case 'OPTIMIZATION':
        currentMetrics.optimizationTime = duration;
        break;
      case 'BACKTEST':
        currentMetrics.backtestTime = duration;
        break;
    }

    this.metrics.push({ ...currentMetrics, timestamp });

    // Check thresholds and generate alerts
    this.checkCalculationThresholds(calculationType, duration, portfolioId);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Record data refresh performance
   */
  recordDataRefreshPerformance(
    refreshType: 'PORTFOLIO' | 'MARKET_DATA' | 'RISK_DATA',
    duration: number,
    recordCount: number,
    success: boolean = true
  ): void {
    const timestamp = new Date();
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics.dataRefreshTime = duration;
    
    this.metrics.push({ ...currentMetrics, timestamp });

    // Check data refresh thresholds
    if (duration > this.thresholds.dataRefreshTime) {
      this.generateAlert({
        type: 'DATA_REFRESH_TIMEOUT',
        severity: duration > this.thresholds.dataRefreshTime * 2 ? 'HIGH' : 'MEDIUM',
        message: `${refreshType} data refresh took ${duration}ms (threshold: ${this.thresholds.dataRefreshTime}ms)`,
        threshold: this.thresholds.dataRefreshTime,
        currentValue: duration,
        timestamp
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentPerformanceMetrics(): {
    averageCalculationTime: number;
    averageDataRefreshTime: number;
    averageOptimizationTime: number;
    activeOperations: number;
    totalOperationsToday: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
  } {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayOperations = this.operationMetrics.filter(op => op.startTime >= todayStart);
    const recentMetrics = this.metrics.slice(-100); // Last 100 metrics

    const successfulOperations = todayOperations.filter(op => op.success);
    const errorRate = todayOperations.length > 0 
      ? (todayOperations.length - successfulOperations.length) / todayOperations.length 
      : 0;

    return {
      averageCalculationTime: this.calculateAverage(recentMetrics.map(m => m.calculationResponseTime)),
      averageDataRefreshTime: this.calculateAverage(recentMetrics.map(m => m.dataRefreshTime)),
      averageOptimizationTime: this.calculateAverage(recentMetrics.map(m => m.optimizationTime)),
      activeOperations: this.activeOperations.size,
      totalOperationsToday: todayOperations.length,
      errorRate: errorRate * 100,
      memoryUsage: this.getCurrentMemoryUsage(),
      cpuUsage: this.getCurrentCpuUsage()
    };
  }

  /**
   * Get performance alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(hours: number = 24): {
    calculationTimes: { timestamp: Date; value: number }[];
    dataRefreshTimes: { timestamp: Date; value: number }[];
    optimizationTimes: { timestamp: Date; value: number }[];
    errorRates: { timestamp: Date; value: number }[];
  } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    const recentOperations = this.operationMetrics.filter(op => op.startTime >= cutoff);

    // Group by hour
    const hourlyData = new Map<string, {
      calculations: number[];
      refreshes: number[];
      optimizations: number[];
      errors: number;
      total: number;
    }>();

    recentMetrics.forEach(metric => {
      const hour = new Date(metric.timestamp.getFullYear(), metric.timestamp.getMonth(), 
                           metric.timestamp.getDate(), metric.timestamp.getHours()).toISOString();
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { calculations: [], refreshes: [], optimizations: [], errors: 0, total: 0 });
      }
      
      const data = hourlyData.get(hour)!;
      data.calculations.push(metric.calculationResponseTime);
      data.refreshes.push(metric.dataRefreshTime);
      data.optimizations.push(metric.optimizationTime);
    });

    recentOperations.forEach(op => {
      const hour = new Date(op.startTime.getFullYear(), op.startTime.getMonth(), 
                           op.startTime.getDate(), op.startTime.getHours()).toISOString();
      
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { calculations: [], refreshes: [], optimizations: [], errors: 0, total: 0 });
      }
      
      const data = hourlyData.get(hour)!;
      data.total++;
      if (!op.success) data.errors++;
    });

    const calculationTimes: { timestamp: Date; value: number }[] = [];
    const dataRefreshTimes: { timestamp: Date; value: number }[] = [];
    const optimizationTimes: { timestamp: Date; value: number }[] = [];
    const errorRates: { timestamp: Date; value: number }[] = [];

    Array.from(hourlyData.entries()).sort().forEach(([hour, data]) => {
      const timestamp = new Date(hour);
      
      calculationTimes.push({
        timestamp,
        value: this.calculateAverage(data.calculations)
      });
      
      dataRefreshTimes.push({
        timestamp,
        value: this.calculateAverage(data.refreshes)
      });
      
      optimizationTimes.push({
        timestamp,
        value: this.calculateAverage(data.optimizations)
      });
      
      errorRates.push({
        timestamp,
        value: data.total > 0 ? (data.errors / data.total) * 100 : 0
      });
    });

    return {
      calculationTimes,
      dataRefreshTimes,
      optimizationTimes,
      errorRates
    };
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    issues: string[];
    recommendations: string[];
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'CRITICAL');
    const highAlerts = activeAlerts.filter(a => a.severity === 'HIGH');
    
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (criticalAlerts.length > 0) {
      issues.push(`${criticalAlerts.length} critical performance issues`);
      recommendations.push('Immediate attention required for critical alerts');
    }

    if (highAlerts.length > 0) {
      issues.push(`${highAlerts.length} high-priority performance issues`);
      recommendations.push('Review and address high-priority alerts');
    }

    const currentMetrics = this.getCurrentPerformanceMetrics();
    
    if (currentMetrics.errorRate > 5) {
      issues.push(`High error rate: ${currentMetrics.errorRate.toFixed(1)}%`);
      recommendations.push('Investigate and fix recurring errors');
    }

    if (currentMetrics.memoryUsage > 80) {
      issues.push(`High memory usage: ${currentMetrics.memoryUsage.toFixed(1)}%`);
      recommendations.push('Consider scaling up resources or optimizing memory usage');
    }

    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    if (criticalAlerts.length > 0) {
      status = 'CRITICAL';
    } else if (highAlerts.length > 0 || currentMetrics.errorRate > 5 || currentMetrics.memoryUsage > 80) {
      status = 'WARNING';
    }

    return { status, issues, recommendations };
  }

  // Private helper methods

  private getCurrentMetrics(): InvestmentMetrics {
    const latest = this.metrics[this.metrics.length - 1];
    return {
      calculationResponseTime: latest?.calculationResponseTime || 0,
      dataRefreshTime: latest?.dataRefreshTime || 0,
      portfolioAnalysisTime: latest?.portfolioAnalysisTime || 0,
      riskAssessmentTime: latest?.riskAssessmentTime || 0,
      reportGenerationTime: latest?.reportGenerationTime || 0,
      optimizationTime: latest?.optimizationTime || 0,
      backtestTime: latest?.backtestTime || 0,
      timestamp: new Date()
    };
  }

  private checkCalculationThresholds(
    calculationType: string,
    duration: number,
    portfolioId?: string
  ): void {
    let threshold: number;
    let alertType: PerformanceAlert['type'] = 'SLOW_CALCULATION';

    switch (calculationType) {
      case 'RETURN':
        threshold = this.thresholds.calculationResponseTime;
        break;
      case 'RISK':
        threshold = this.thresholds.riskAssessmentTime;
        break;
      case 'OPTIMIZATION':
        threshold = this.thresholds.optimizationTime;
        break;
      case 'BACKTEST':
        threshold = this.thresholds.backtestTime;
        break;
      default:
        threshold = this.thresholds.calculationResponseTime;
    }

    if (duration > threshold) {
      const severity: PerformanceAlert['severity'] = 
        duration > threshold * 3 ? 'CRITICAL' :
        duration > threshold * 2 ? 'HIGH' : 'MEDIUM';

      this.generateAlert({
        type: alertType,
        severity,
        message: `${calculationType} calculation took ${duration}ms (threshold: ${threshold}ms)${portfolioId ? ` for portfolio ${portfolioId}` : ''}`,
        threshold,
        currentValue: duration,
        timestamp: new Date()
      });
    }
  }

  private checkOperationPerformance(operation: InvestmentOperationMetrics): void {
    // Check for memory usage alerts
    if (operation.memoryPeak > this.thresholds.memoryUsagePercent) {
      this.generateAlert({
        type: 'HIGH_MEMORY_USAGE',
        severity: operation.memoryPeak > 90 ? 'CRITICAL' : 'HIGH',
        message: `${operation.operationType} operation used ${operation.memoryPeak}% memory`,
        threshold: this.thresholds.memoryUsagePercent,
        currentValue: operation.memoryPeak,
        timestamp: operation.endTime
      });
    }

    // Check for concurrent user limits
    if (this.activeOperations.size > this.thresholds.concurrentUsers) {
      this.generateAlert({
        type: 'CONCURRENT_LIMIT',
        severity: 'HIGH',
        message: `Concurrent operations limit exceeded: ${this.activeOperations.size}`,
        threshold: this.thresholds.concurrentUsers,
        currentValue: this.activeOperations.size,
        timestamp: new Date()
      });
    }
  }

  private generateAlert(alertData: Omit<PerformanceAlert, 'id' | 'resolved'>): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);

    // Notify callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });

    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  private startResourceMonitoring(): void {
    // Monitor system resources every 30 seconds
    setInterval(() => {
      const resourceMetric: SystemResourceMetrics = {
        cpuUsage: this.getCurrentCpuUsage(),
        memoryUsage: this.getCurrentMemoryUsage(),
        diskUsage: this.getCurrentDiskUsage(),
        networkLatency: this.getCurrentNetworkLatency(),
        activeConnections: this.getActiveConnections(),
        queueLength: this.getQueueLength(),
        timestamp: new Date()
      };

      this.resourceMetrics.push(resourceMetric);

      // Keep only last 2880 metrics (24 hours at 30-second intervals)
      if (this.resourceMetrics.length > 2880) {
        this.resourceMetrics = this.resourceMetrics.slice(-2880);
      }
    }, 30000);
  }

  private getCurrentMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return (usage.heapUsed / usage.heapTotal) * 100;
    }
    return 0;
  }

  private getCurrentCpuUsage(): number {
    // Simplified CPU usage estimation
    // In a real implementation, you'd use a proper system monitoring library
    return Math.random() * 100; // Mock value
  }

  private getCurrentDiskUsage(): number {
    // Mock disk usage
    return Math.random() * 100;
  }

  private getCurrentNetworkLatency(): number {
    // Mock network latency
    return Math.random() * 100;
  }

  private getActiveConnections(): number {
    // Mock active connections
    return Math.floor(Math.random() * 50);
  }

  private getQueueLength(): number {
    // Mock queue length
    return Math.floor(Math.random() * 10);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const validValues = values.filter(v => !isNaN(v) && v > 0);
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }

  private async storeOperationMetrics(metric: InvestmentOperationMetrics): Promise<void> {
    try {
      // Store metrics in database for historical analysis
      // This would typically use a time-series database or dedicated metrics storage
      console.log('Storing operation metrics:', {
        type: metric.operationType,
        duration: metric.duration,
        success: metric.success,
        timestamp: metric.startTime
      });
    } catch (error) {
      console.error('Failed to store operation metrics:', error);
    }
  }
}

// Export singleton instance
export const investmentPerformanceMonitor = new InvestmentPerformanceMonitor();

// Helper function to measure operation performance
export function measureInvestmentOperation<T>(
  operationType: InvestmentOperationMetrics['operationType'],
  operation: () => Promise<T>,
  metadata: {
    portfolioId?: string;
    userId?: string;
    inputSize?: number;
  } = {}
): Promise<T> {
  const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  investmentPerformanceMonitor.startOperation(operationId, operationType, metadata);
  
  return operation()
    .then(result => {
      investmentPerformanceMonitor.endOperation(operationId, {
        success: true,
        outputSize: typeof result === 'object' ? JSON.stringify(result).length : 0
      });
      return result;
    })
    .catch(error => {
      investmentPerformanceMonitor.endOperation(operationId, {
        success: false,
        errorMessage: error.message,
        outputSize: 0
      });
      throw error;
    });
}