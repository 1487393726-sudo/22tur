'use client';

/**
 * Risk Monitoring Dashboard Component
 * 
 * Provides comprehensive risk monitoring and visualization including:
 * - Real-time risk metrics display
 * - Risk level indicators and alerts
 * - Historical risk trend analysis
 * - Stress test results visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Activity,
  RefreshCw,
  Download
} from 'lucide-react';
import { RiskAssessment, RiskLevel, StressTestResult } from '@/types/investment-management';

interface RiskMonitoringDashboardProps {
  portfolioId: string;
  className?: string;
}

interface RiskData {
  currentRisk: RiskAssessment;
  historicalRisk: RiskAssessment[];
  stressTestResults: StressTestResult[];
  isLoading: boolean;
  lastUpdated: Date;
}

const RISK_COLORS = {
  'VERY_LOW': '#10B981',
  'LOW': '#84CC16', 
  'MEDIUM': '#F59E0B',
  'HIGH': '#EF4444',
  'CRITICAL': '#DC2626'
};

const RISK_LABELS = {
  'VERY_LOW': 'Very Low',
  'LOW': 'Low',
  'MEDIUM': 'Medium', 
  'HIGH': 'High',
  'CRITICAL': 'Critical'
};

export function RiskMonitoringDashboard({ 
  portfolioId, 
  className = '' 
}: RiskMonitoringDashboardProps) {
  const [riskData, setRiskData] = useState<RiskData>({
    currentRisk: null as any,
    historicalRisk: [],
    stressTestResults: [],
    isLoading: true,
    lastUpdated: new Date()
  });

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('3M');

  useEffect(() => {
    loadRiskData();
  }, [portfolioId]);

  const loadRiskData = async () => {
    try {
      setRiskData(prev => ({ ...prev, isLoading: true }));

      // Load current risk assessment
      const riskResponse = await fetch(`/api/portfolios/${portfolioId}/risk?includeHistory=true`);
      const riskResult = await riskResponse.json();

      if (riskResult.success) {
        setRiskData(prev => ({
          ...prev,
          currentRisk: riskResult.data.currentRisk,
          historicalRisk: riskResult.data.historicalAssessments || [],
          lastUpdated: new Date(),
          isLoading: false
        }));
      }

      // Load stress test results
      await loadStressTestResults();

    } catch (error) {
      console.error('Failed to load risk data:', error);
      setRiskData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadStressTestResults = async () => {
    try {
      // Get predefined scenarios
      const scenariosResponse = await fetch('/api/risk-assessments/stress-test');
      const scenariosResult = await scenariosResponse.json();

      if (scenariosResult.success) {
        // Run stress tests
        const stressTestResponse = await fetch('/api/risk-assessments/stress-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId,
            scenarios: scenariosResult.data.scenarios.slice(0, 3) // Test first 3 scenarios
          })
        });

        const stressTestResult = await stressTestResponse.json();
        if (stressTestResult.success) {
          setRiskData(prev => ({
            ...prev,
            stressTestResults: stressTestResult.data.stressTestResults
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load stress test results:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRiskData();
    setRefreshing(false);
  };

  const handleRunStressTest = async () => {
    await loadStressTestResults();
  };

  const getRiskLevelIcon = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case 'VERY_LOW':
      case 'LOW':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'MEDIUM':
        return <Activity className="h-5 w-5 text-yellow-500" />;
      case 'HIGH':
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatRiskTrendData = () => {
    return riskData.historicalRisk.map((assessment, index) => ({
      date: new Date(assessment.assessmentDate).toLocaleDateString(),
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel
    })).reverse();
  };

  const formatStressTestData = () => {
    return riskData.stressTestResults.map(result => ({
      scenario: result.scenarioName,
      loss: result.lossPercentage,
      passes: result.passesThreshold
    }));
  };

  if (riskData.isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risk Monitoring</h2>
          <p className="text-gray-600">
            Last updated: {riskData.lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskData.currentRisk && (riskData.currentRisk.riskLevel === 'HIGH' || riskData.currentRisk.riskLevel === 'CRITICAL') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Risk Alert:</strong> Your portfolio risk level is {RISK_LABELS[riskData.currentRisk.riskLevel]}. 
            Consider reviewing your investment allocation.
          </AlertDescription>
        </Alert>
      )}

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Level</p>
                <div className="flex items-center mt-2">
                  {riskData.currentRisk && getRiskLevelIcon(riskData.currentRisk.riskLevel)}
                  <span className="ml-2 text-lg font-semibold">
                    {riskData.currentRisk ? RISK_LABELS[riskData.currentRisk.riskLevel] : 'N/A'}
                  </span>
                </div>
              </div>
              <Badge 
                variant="secondary"
                style={{ 
                  backgroundColor: riskData.currentRisk ? RISK_COLORS[riskData.currentRisk.riskLevel] : '#gray',
                  color: 'white'
                }}
              >
                {riskData.currentRisk?.riskScore.toFixed(1) || 'N/A'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Value at Risk (95%)</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${riskData.currentRisk?.metrics?.valueAtRisk?.toLocaleString() || '0'}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volatility</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riskData.currentRisk?.metrics?.volatility ? 
                    `${(riskData.currentRisk.metrics.volatility * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riskData.currentRisk?.metrics?.sharpeRatio?.toFixed(2) || 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="stress">Stress Tests</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formatRiskTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="riskScore" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskData.currentRisk?.riskFactors?.map((factor, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize">
                      {factor.type.toLowerCase().replace('_', ' ')} Risk
                    </h3>
                    <Badge variant={factor.impact === 'HIGH' ? 'destructive' : 
                                  factor.impact === 'MEDIUM' ? 'default' : 'secondary'}>
                      {factor.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{factor.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${factor.severity * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Severity: {(factor.severity * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            )) || (
              <Card className="col-span-2">
                <CardContent className="p-6 text-center text-gray-500">
                  No significant risk factors identified
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stress" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Stress Test Results</h3>
            <Button onClick={handleRunStressTest} variant="outline" size="sm">
              Run New Test
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatStressTestData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scenario" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="loss" 
                    fill={(entry: any) => entry.passes ? '#10B981' : '#EF4444'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskData.stressTestResults.map((result, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{result.scenarioName}</h4>
                    <Badge variant={result.passesThreshold ? 'default' : 'destructive'}>
                      {result.passesThreshold ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    -{result.lossPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Loss: ${result.loss.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riskData.currentRisk?.recommendations?.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-8">
                    No specific recommendations at this time. Your portfolio risk appears to be well-managed.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}