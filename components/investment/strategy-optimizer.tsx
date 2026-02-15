"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Shield,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import {
  OptimizationObjective,
  OptimizationResult,
  StrategyRecommendation,
  StrategyConstraints,
  AllocationRecommendation,
  ImprovementMetrics
} from '@/types/investment-management';

interface StrategyOptimizerProps {
  portfolioId: string;
  onOptimizationComplete: (result: OptimizationResult) => void;
  onError: (error: Error) => void;
}

export function StrategyOptimizer({ 
  portfolioId, 
  onOptimizationComplete, 
  onError 
}: StrategyOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [objective, setObjective] = useState<OptimizationObjective>(OptimizationObjective.MAXIMIZE_SHARPE);
  const [constraints, setConstraints] = useState<Partial<StrategyConstraints>>({
    maxPositionSize: 0.3,
    minPositionSize: 0.01,
    maxSectorConcentration: 0.4,
    liquidityRequirement: 0.1,
    riskBudget: 0.25
  });
  const [targetReturn, setTargetReturn] = useState<number>(0.08);
  const [targetRisk, setTargetRisk] = useState<number>(0.15);
  const [rebalancingBudget, setRebalancingBudget] = useState<number>(10000);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([]);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    try {
      const requestBody = {
        portfolioId,
        objective,
        constraints,
        targetReturn: objective === OptimizationObjective.TARGET_RETURN ? targetReturn : undefined,
        targetRisk: objective === OptimizationObjective.TARGET_RISK ? targetRisk : undefined,
        rebalancingBudget
      };

      const response = await fetch('/api/strategies/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Optimization failed');
      }

      const data = await response.json();
      setOptimizationResult(data.optimization);
      setRecommendations(data.recommendations);
      onOptimizationComplete(data.optimization);
    } catch (error) {
      console.error('Optimization error:', error);
      onError(error instanceof Error ? error : new Error('Unknown optimization error'));
    } finally {
      setIsOptimizing(false);
    }
  };

  const getObjectiveIcon = (obj: OptimizationObjective) => {
    switch (obj) {
      case OptimizationObjective.MAXIMIZE_RETURN:
        return TrendingUp;
      case OptimizationObjective.MINIMIZE_RISK:
        return Shield;
      case OptimizationObjective.MAXIMIZE_SHARPE:
        return Target;
      case OptimizationObjective.TARGET_RETURN:
        return DollarSign;
      case OptimizationObjective.TARGET_RISK:
        return Activity;
      default:
        return BarChart3;
    }
  };

  const getObjectiveDescription = (obj: OptimizationObjective) => {
    switch (obj) {
      case OptimizationObjective.MAXIMIZE_RETURN:
        return "Optimize for highest expected returns";
      case OptimizationObjective.MINIMIZE_RISK:
        return "Optimize for lowest portfolio risk";
      case OptimizationObjective.MAXIMIZE_SHARPE:
        return "Optimize for best risk-adjusted returns";
      case OptimizationObjective.TARGET_RETURN:
        return "Achieve specific return target with minimum risk";
      case OptimizationObjective.TARGET_RISK:
        return "Maximize returns within risk budget";
      default:
        return "Select optimization objective";
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Optimization Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Optimization</h3>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-4 h-4" />
            Advanced Settings
          </button>
        </div>

        {/* Optimization Objective */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Optimization Objective
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(OptimizationObjective).map((obj) => {
              const Icon = getObjectiveIcon(obj);
              const isSelected = objective === obj;
              
              return (
                <button
                  key={obj}
                  onClick={() => setObjective(obj)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {obj.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {getObjectiveDescription(obj)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Values */}
        {(objective === OptimizationObjective.TARGET_RETURN || objective === OptimizationObjective.TARGET_RISK) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Target Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objective === OptimizationObjective.TARGET_RETURN && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Annual Return
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={targetReturn}
                      onChange={(e) => setTargetReturn(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter as decimal (e.g., 0.08 for 8%)
                  </p>
                </div>
              )}
              
              {objective === OptimizationObjective.TARGET_RISK && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Risk Level
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.01"
                      value={targetRisk}
                      onChange={(e) => setTargetRisk(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Activity className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter as decimal (e.g., 0.15 for 15% volatility)
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {showAdvancedSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-4">Advanced Constraints</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Position Size
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={constraints.maxPositionSize}
                  onChange={(e) => setConstraints(prev => ({
                    ...prev,
                    maxPositionSize: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Position Size
                </label>
                <input
                  type="number"
                  min="0.001"
                  max="0.5"
                  step="0.001"
                  value={constraints.minPositionSize}
                  onChange={(e) => setConstraints(prev => ({
                    ...prev,
                    minPositionSize: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Sector Concentration
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={constraints.maxSectorConcentration}
                  onChange={(e) => setConstraints(prev => ({
                    ...prev,
                    maxSectorConcentration: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liquidity Requirement
                </label>
                <input
                  type="number"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={constraints.liquidityRequirement}
                  onChange={(e) => setConstraints(prev => ({
                    ...prev,
                    liquidityRequirement: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Budget
                </label>
                <input
                  type="number"
                  min="0.05"
                  max="1"
                  step="0.01"
                  value={constraints.riskBudget}
                  onChange={(e) => setConstraints(prev => ({
                    ...prev,
                    riskBudget: parseFloat(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rebalancing Budget
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={rebalancingBudget}
                  onChange={(e) => setRebalancingBudget(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Optimize Button */}
        <button
          onClick={handleOptimize}
          disabled={isOptimizing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Optimizing Portfolio...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Optimize Portfolio
            </>
          )}
        </button>
      </div>

      {/* Optimization Results */}
      {optimizationResult && (
        <div className="space-y-6">
          {/* Improvement Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Expected Return</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatPercentage(optimizationResult.expectedReturn)}
                </p>
                <p className="text-sm text-green-700">
                  +{formatPercentage(optimizationResult.improvementMetrics.returnImprovement)} improvement
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Expected Risk</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatPercentage(optimizationResult.expectedRisk)}
                </p>
                <p className="text-sm text-blue-700">
                  -{formatPercentage(optimizationResult.improvementMetrics.riskReduction)} reduction
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-white600" />
                  <span className="font-medium text-white900">Sharpe Ratio</span>
                </div>
                <p className="text-2xl font-bold text-white900">
                  {optimizationResult.expectedSharpe.toFixed(2)}
                </p>
                <p className="text-sm text-white700">
                  +{optimizationResult.improvementMetrics.sharpeImprovement.toFixed(2)} improvement
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Rebalancing Cost</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(optimizationResult.rebalancingCost)}
                </p>
                <p className="text-sm text-orange-700">
                  Transaction costs
                </p>
              </div>
            </div>

            {/* Allocation Changes */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Recommended Allocation Changes</h4>
              <div className="space-y-3">
                {optimizationResult.optimizedAllocation
                  .filter(alloc => alloc.action !== 'HOLD')
                  .map((allocation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          allocation.action === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{allocation.investmentName}</p>
                          <p className="text-sm text-gray-600">{allocation.sector}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {allocation.action} {formatCurrency(Math.abs(allocation.transactionAmount))}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatPercentage(allocation.currentWeight)} → {formatPercentage(allocation.recommendedWeight)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Recommendations</h3>
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          recommendation.priority === 'HIGH' ? 'bg-red-500' :
                          recommendation.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                          <p className="text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        recommendation.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Expected Return Impact:</span>
                        <p className="text-green-600">+{formatPercentage(recommendation.expectedOutcome.returnImpact)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Risk Impact:</span>
                        <p className="text-blue-600">{formatPercentage(recommendation.expectedOutcome.riskImpact)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time Horizon:</span>
                        <p className="text-gray-600">{recommendation.expectedOutcome.timeHorizon}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}