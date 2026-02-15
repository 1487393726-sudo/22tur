'use client';

/**
 * AI Assistant Analysis Dashboard
 * Displays project analysis results and recommendations
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';

interface AnalysisResults {
  taskOptimization?: any;
  progressPrediction?: any;
  riskAnalysis?: any;
  resourceAllocation?: any;
}

function AnalysisDashboardContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      loadAnalysis();
    }
  }, [projectId]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai-assistant/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to load analysis');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  if (!projectId) {
    return (
      <div className="p-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Project ID is required</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadAnalysis} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Analysis Dashboard</h1>
          <p className="text-gray-600 mt-2">AI-powered insights and recommendations</p>
        </div>
        <Button onClick={loadAnalysis} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Progress Card */}
            {results?.progressPrediction && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(results.progressPrediction.completionProbability * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Est. {results.progressPrediction.estimatedCompletionDate.split('T')[0]}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Risk Score Card */}
            {results?.riskAnalysis && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(results.riskAnalysis.overallRiskScore * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {results.riskAnalysis.criticalRisks.length} critical risks
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Utilization Card */}
            {results?.resourceAllocation && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(results.resourceAllocation.workloadBalance * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    +{(results.resourceAllocation.expectedUtilizationImprovement * 100).toFixed(0)}% improvement
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Efficiency Card */}
            {results?.taskOptimization && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {results.taskOptimization.expectedEfficiencyGain.toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {results.taskOptimization.estimatedTimeToComplete} weeks to complete
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Key Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Key Recommendations</CardTitle>
              <CardDescription>Top actions to improve project outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {results?.progressPrediction?.recommendations?.slice(0, 3).map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Optimization</CardTitle>
              <CardDescription>Priority adjustments and efficiency improvements</CardDescription>
            </CardHeader>
            <CardContent>
              {results?.taskOptimization?.suggestions ? (
                <div className="space-y-3">
                  {results.taskOptimization.suggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{suggestion.taskId}</p>
                        <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{suggestion.currentPriority}</Badge>
                        <span className="text-gray-400">→</span>
                        <Badge>{suggestion.suggestedPriority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No task optimization data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Identified risks and mitigation strategies</CardDescription>
            </CardHeader>
            <CardContent>
              {results?.riskAnalysis?.risks ? (
                <div className="space-y-3">
                  {results.riskAnalysis.risks.slice(0, 5).map((risk: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{risk.type}</p>
                          <p className="text-xs text-gray-600">{risk.description}</p>
                        </div>
                        <Badge
                          variant={risk.severity > 0.7 ? 'destructive' : 'secondary'}
                        >
                          {(risk.severity * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-700 mt-2">
                        <strong>Mitigation:</strong> {risk.mitigationStrategy}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No risk data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Team workload and optimization suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {results?.resourceAllocation?.suggestions ? (
                <div className="space-y-3">
                  {results.resourceAllocation.suggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{suggestion.memberName}</p>
                        <div className="flex gap-2">
                          <span className="text-xs text-gray-600">
                            {suggestion.currentWorkload}%
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-xs font-medium">
                            {suggestion.suggestedWorkload}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No resource allocation data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalysisDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <AnalysisDashboardContent />
    </Suspense>
  );
}
