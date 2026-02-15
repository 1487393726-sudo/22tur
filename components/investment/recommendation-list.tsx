"use client";

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  Target,
  Lightbulb,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import {
  StrategyRecommendation,
  ImplementationStep,
  RecommendationRisk
} from '@/types/investment-management';

interface RecommendationListProps {
  recommendations: StrategyRecommendation[];
  onImplement: (recommendation: StrategyRecommendation) => void;
  onDismiss: (recommendationId: string) => void;
}

export function RecommendationList({ 
  recommendations, 
  onImplement, 
  onDismiss 
}: RecommendationListProps) {
  const [filteredRecommendations, setFilteredRecommendations] = useState<StrategyRecommendation[]>(recommendations);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    filterRecommendations();
  }, [recommendations, selectedPriority, selectedType]);

  const filterRecommendations = () => {
    let filtered = [...recommendations];

    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter(rec => rec.priority === selectedPriority);
    }

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(rec => rec.recommendationType === selectedType);
    }

    // Sort by priority and expected return impact
    filtered.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      return b.expectedOutcome.returnImpact - a.expectedOutcome.returnImpact;
    });

    setFilteredRecommendations(filtered);
  };

  const toggleExpanded = (recommendationId: string) => {
    const newExpanded = new Set(expandedRecommendations);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedRecommendations(newExpanded);
  };

  const handleImplement = async (recommendation: StrategyRecommendation) => {
    setIsLoading(true);
    try {
      await onImplement(recommendation);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'OPTIMIZATION':
        return Target;
      case 'REBALANCING':
        return TrendingUp;
      case 'RISK_ADJUSTMENT':
        return Shield;
      case 'OPPORTUNITY':
        return Lightbulb;
      default:
        return Info;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-red-600';
      case 'MEDIUM':
        return 'text-yellow-600';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
        <p className="text-gray-600">
          Your portfolio is well-optimized. Check back later for new opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Strategy Recommendations</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>{filteredRecommendations.length} of {recommendations.length} recommendations</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="OPTIMIZATION">Optimization</option>
              <option value="REBALANCING">Rebalancing</option>
              <option value="RISK_ADJUSTMENT">Risk Adjustment</option>
              <option value="OPPORTUNITY">Opportunity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => {
          const Icon = getRecommendationIcon(recommendation.recommendationType);
          const isExpanded = expandedRecommendations.has(recommendation.id);
          const priorityColor = getPriorityColor(recommendation.priority);
          const riskColor = getRiskLevelColor(recommendation.riskAssessment.level);

          return (
            <div key={recommendation.id} className="bg-white rounded-lg shadow-sm border">
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{recommendation.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColor}`}>
                          {recommendation.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{recommendation.description}</p>
                      <p className="text-sm text-gray-700">{recommendation.rationale}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(recommendation.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Return Impact</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      +{formatPercentage(recommendation.expectedOutcome.returnImpact)}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Risk Impact</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {formatPercentage(recommendation.expectedOutcome.riskImpact)}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-white600" />
                      <span className="text-sm font-medium text-white900">Time Horizon</span>
                    </div>
                    <p className="text-lg font-bold text-white900">
                      {recommendation.expectedOutcome.timeHorizon}
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Confidence</span>
                    </div>
                    <p className="text-lg font-bold text-orange-900">
                      {(recommendation.expectedOutcome.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleImplement(recommendation)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Implement
                  </button>

                  <button
                    onClick={() => onDismiss(recommendation.id)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    Valid until {formatDate(recommendation.validUntil)}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Implementation Plan */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Implementation Plan</h5>
                      <div className="space-y-3">
                        {recommendation.implementationPlan.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                              {step.order}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{step.action}</p>
                              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Cost: {formatCurrency(step.estimatedCost)}</span>
                                <span>Time: {step.estimatedTime}</span>
                                <span className={`font-medium ${getRiskLevelColor(step.riskLevel)}`}>
                                  Risk: {step.riskLevel}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Risk Assessment</h5>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${getRiskLevelColor(recommendation.riskAssessment.level)}`} />
                            <span className="font-medium text-gray-900">Risk Level: </span>
                            <span className={`font-medium ${getRiskLevelColor(recommendation.riskAssessment.level)}`}>
                              {recommendation.riskAssessment.level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            Probability of Success: {(recommendation.riskAssessment.probabilityOfSuccess * 100).toFixed(0)}%
                          </p>
                        </div>

                        <div>
                          <h6 className="font-medium text-gray-900 mb-2">Risk Factors</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recommendation.riskAssessment.factors.map((factor, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h6 className="font-medium text-gray-900 mb-2">Mitigation Strategies</h6>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {recommendation.riskAssessment.mitigation.map((strategy, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {strategy}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h6 className="font-medium text-yellow-900 mb-1">Worst Case Scenario</h6>
                          <p className="text-sm text-yellow-800">
                            {recommendation.riskAssessment.worstCaseScenario}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}