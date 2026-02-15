"use client";

/**
 * Investment Strategy Builder Component
 * Task 7.2: Strategy formulation tool interface
 * 
 * Requirements: 6.3 - Strategy suggestions and risk assessment tools
 */

import { useState, useCallback } from 'react';
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  PieChart,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
  Calculator,
  BarChart3,
  Info
} from 'lucide-react';

interface AssetAllocation {
  stocks: number;
  bonds: number;
  alternatives: number;
  cash: number;
}

interface StrategyFormData {
  name: string;
  description: string;
  targetReturn: number;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  timeHorizon: number;
  assetAllocation: AssetAllocation;
}

interface StrategyBuilderProps {
  advisorId: string;
  clientId: string;
  onStrategySave?: (strategy: any) => void;
  className?: string;
}

export function StrategyBuilder({
  advisorId,
  clientId,
  onStrategySave,
  className = ''
}: StrategyBuilderProps) {
  const [formData, setFormData] = useState<StrategyFormData>({
    name: '',
    description: '',
    targetReturn: 8.0,
    riskTolerance: 'MEDIUM',
    timeHorizon: 12,
    assetAllocation: {
      stocks: 60,
      bonds: 30,
      alternatives: 5,
      cash: 5
    }
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRiskAssessment, setShowRiskAssessment] = useState(false);

  // Predefined allocation templates
  const allocationTemplates = {
    conservative: { stocks: 30, bonds: 60, alternatives: 5, cash: 5 },
    moderate: { stocks: 60, bonds: 30, alternatives: 5, cash: 5 },
    aggressive: { stocks: 80, bonds: 10, alternatives: 8, cash: 2 }
  };

  // Risk tolerance descriptions
  const riskDescriptions = {
    LOW: {
      title: '保守型',
      description: '优先保本，接受较低收益以换取资本安全',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    MEDIUM: {
      title: '平衡型',
      description: '在风险和收益之间寻求平衡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    HIGH: {
      title: '积极型',
      description: '追求高收益，能承受较大波动',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '策略名称不能为空';
    }

    if (!formData.description.trim()) {
      newErrors.description = '策略描述不能为空';
    }

    if (formData.targetReturn < 0 || formData.targetReturn > 50) {
      newErrors.targetReturn = '目标收益率应在0-50%之间';
    }

    if (formData.timeHorizon < 1 || formData.timeHorizon > 120) {
      newErrors.timeHorizon = '投资期限应在1-120个月之间';
    }

    const totalAllocation = Object.values(formData.assetAllocation).reduce((sum, val) => sum + val, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
      newErrors.assetAllocation = '资产配置总和必须等于100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form field changes
  const handleFieldChange = (field: keyof StrategyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle asset allocation changes
  const handleAllocationChange = (asset: keyof AssetAllocation, value: number) => {
    setFormData(prev => ({
      ...prev,
      assetAllocation: {
        ...prev.assetAllocation,
        [asset]: Math.max(0, Math.min(100, value))
      }
    }));
    
    // Clear allocation error
    if (errors.assetAllocation) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.assetAllocation;
        return newErrors;
      });
    }
  };

  // Apply allocation template
  const applyTemplate = (template: keyof typeof allocationTemplates) => {
    setFormData(prev => ({
      ...prev,
      assetAllocation: { ...allocationTemplates[template] }
    }));
  };

  // Calculate risk score based on allocation
  const calculateRiskScore = useCallback(() => {
    const { stocks, alternatives } = formData.assetAllocation;
    const riskScore = (stocks * 0.8 + alternatives * 1.2) / 100 * 10;
    return Math.min(10, Math.max(1, riskScore));
  }, [formData.assetAllocation]);

  // Get risk assessment
  const getRiskAssessment = useCallback(() => {
    const riskScore = calculateRiskScore();
    const { targetReturn, riskTolerance } = formData;
    
    const assessments = [];
    
    // Risk-return alignment
    if (riskTolerance === 'LOW' && targetReturn > 10) {
      assessments.push({
        type: 'warning',
        message: '目标收益率与保守型风险偏好不匹配，建议降低收益预期'
      });
    }
    
    if (riskTolerance === 'HIGH' && targetReturn < 8) {
      assessments.push({
        type: 'info',
        message: '积极型投资者可以考虑更高的收益目标'
      });
    }
    
    // Allocation warnings
    if (formData.assetAllocation.stocks > 80) {
      assessments.push({
        type: 'warning',
        message: '股票配置过高，建议适当分散风险'
      });
    }
    
    if (formData.assetAllocation.cash > 20) {
      assessments.push({
        type: 'info',
        message: '现金配置较高，可能影响长期收益'
      });
    }
    
    return {
      riskScore,
      assessments
    };
  }, [formData, calculateRiskScore]);

  // Save strategy
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch('/api/advisor/strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advisorId,
          clientId,
          ...formData,
          status: 'DRAFT'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onStrategySave?.(result.data);
        // Reset form or show success message
        alert('策略保存成功！');
      } else {
        throw new Error(result.message || 'Failed to save strategy');
      }
    } catch (err) {
      console.error('Error saving strategy:', err);
      alert('保存策略失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      targetReturn: 8.0,
      riskTolerance: 'MEDIUM',
      timeHorizon: 12,
      assetAllocation: {
        stocks: 60,
        bonds: 30,
        alternatives: 5,
        cash: 5
      }
    });
    setErrors({});
  };

  const totalAllocation = Object.values(formData.assetAllocation).reduce((sum, val) => sum + val, 0);
  const riskAssessment = getRiskAssessment();

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-white600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">投资策略制定</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRiskAssessment(!showRiskAssessment)}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Calculator className="h-4 w-4 mr-1" />
              风险评估
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              策略名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="输入策略名称"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              投资期限 (月) *
            </label>
            <input
              type="number"
              value={formData.timeHorizon}
              onChange={(e) => handleFieldChange('timeHorizon', parseInt(e.target.value) || 0)}
              min="1"
              max="120"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.timeHorizon ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.timeHorizon && (
              <p className="mt-1 text-sm text-red-600">{errors.timeHorizon}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            策略描述 *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="描述投资策略的目标、理念和执行方式"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Target Return and Risk Tolerance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标年化收益率 (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.targetReturn}
                onChange={(e) => handleFieldChange('targetReturn', parseFloat(e.target.value) || 0)}
                min="0"
                max="50"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.targetReturn ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.targetReturn && (
              <p className="mt-1 text-sm text-red-600">{errors.targetReturn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              风险偏好 *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(riskDescriptions).map(([key, desc]) => (
                <button
                  key={key}
                  onClick={() => handleFieldChange('riskTolerance', key)}
                  className={`p-3 text-center border rounded-lg transition-colors ${
                    formData.riskTolerance === key
                      ? `${desc.bgColor} ${desc.borderColor} ${desc.color}`
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">{desc.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Allocation */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              资产配置 *
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                总计: {totalAllocation.toFixed(1)}%
              </span>
              {Math.abs(totalAllocation - 100) > 0.01 && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>

          {/* Allocation Templates */}
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">快速模板:</div>
            <div className="flex space-x-2">
              <button
                onClick={() => applyTemplate('conservative')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                保守型
              </button>
              <button
                onClick={() => applyTemplate('moderate')}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                平衡型
              </button>
              <button
                onClick={() => applyTemplate('aggressive')}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                积极型
              </button>
            </div>
          </div>

          {/* Allocation Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData.assetAllocation).map(([asset, value]) => (
              <div key={asset}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-600 capitalize">
                    {asset === 'stocks' && '股票'}
                    {asset === 'bonds' && '债券'}
                    {asset === 'alternatives' && '另类投资'}
                    {asset === 'cash' && '现金'}
                  </label>
                  <span className="text-sm font-medium">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleAllocationChange(asset as keyof AssetAllocation, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          </div>

          {errors.assetAllocation && (
            <p className="mt-2 text-sm text-red-600">{errors.assetAllocation}</p>
          )}
        </div>

        {/* Risk Assessment Panel */}
        {showRiskAssessment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-900">风险评估结果</h3>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700">风险评分:</span>
                <span className="font-medium text-blue-900">
                  {riskAssessment.riskScore.toFixed(1)}/10
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(riskAssessment.riskScore / 10) * 100}%` }}
                />
              </div>
            </div>

            {riskAssessment.assessments.length > 0 && (
              <div className="space-y-2">
                {riskAssessment.assessments.map((assessment, index) => (
                  <div
                    key={index}
                    className={`flex items-start text-sm ${
                      assessment.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                    }`}
                  >
                    {assessment.type === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{assessment.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(errors).length > 0}
              className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存策略
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}