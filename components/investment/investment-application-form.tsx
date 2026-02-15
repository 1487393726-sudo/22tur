"use client";

// Investment Application Form Component
// Phase 2, Task 2.1: Create investment application form component

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  TrendingUp,
  Shield,
  Calendar
} from 'lucide-react';
import { 
  CreateInvestmentApplicationRequest,
  InvestmentApplicationFormProps,
  ValidationResult
} from '@/types/investment-management';
import { validateInvestmentApplication } from '@/lib/investment-management/validation';

export function InvestmentApplicationForm({
  projectId,
  onSubmit,
  onCancel,
  loading = false
}: InvestmentApplicationFormProps) {
  const { locale } = useLanguage();
  const [formData, setFormData] = useState<CreateInvestmentApplicationRequest>({
    projectId: projectId || '',
    amount: 0,
    currency: 'CNY'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>(null);

  // Fetch project information
  useEffect(() => {
    if (projectId) {
      fetchProjectInfo(projectId);
    }
  }, [projectId]);

  const fetchProjectInfo = async (id: string) => {
    try {
      const response = await fetch(`/api/investment-projects/${id}`);
      if (response.ok) {
        const project = await response.json();
        setProjectInfo(project);
        setFormData(prev => ({ ...prev, projectId: id }));
      }
    } catch (error) {
      console.error('Error fetching project info:', error);
    }
  };

  const validateForm = (): ValidationResult => {
    const validation = validateInvestmentApplication(formData);
    
    // Convert validation errors to form errors
    const formErrors: Record<string, string> = {};
    validation.errors.forEach(error => {
      formErrors[error.field] = error.message;
    });
    
    setErrors(formErrors);
    return validation;
  };

  const handleInputChange = (field: keyof CreateInvestmentApplicationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    handleInputChange('amount', numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsValidating(true);
    const validation = validateForm();
    setIsValidating(false);

    if (validation.isValid) {
      onSubmit(formData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateExpectedReturn = () => {
    if (!projectInfo || !formData.amount) return 0;
    return formData.amount * (projectInfo.expectedReturn / 100);
  };

  const getAmountSuggestions = () => {
    if (!projectInfo) return [];
    
    const min = projectInfo.minInvestment || 10000;
    const max = projectInfo.maxInvestment || 1000000;
    
    return [
      min,
      Math.round(min * 2),
      Math.round(min * 5),
      Math.round(max * 0.5),
      max
    ].filter((amount, index, arr) => arr.indexOf(amount) === index && amount <= max);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            {locale === "en" ? "Investment Application" : "投资申请"}
          </h2>
          <p className="text-gray-300">
            {locale === "en" 
              ? "Submit your investment application for review"
              : "提交您的投资申请以供审核"
            }
          </p>
        </div>

        {/* Project Information */}
        {projectInfo && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              {locale === "en" ? "Project Information" : "项目信息"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  {locale === "en" ? "Project Name" : "项目名称"}
                </p>
                <p className="text-white font-medium">{projectInfo.title}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  {locale === "en" ? "Expected Return" : "预期收益"}
                </p>
                <p className="text-green-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {projectInfo.expectedReturn}%
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  {locale === "en" ? "Risk Level" : "风险等级"}
                </p>
                <p className="text-yellow-400 font-medium flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {projectInfo.riskLevel}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  {locale === "en" ? "Investment Range" : "投资范围"}
                </p>
                <p className="text-white font-medium">
                  {formatCurrency(projectInfo.minInvestment || 0)} - {formatCurrency(projectInfo.maxInvestment || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Investment Amount */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-white">
            {locale === "en" ? "Investment Amount" : "投资金额"}
            <span className="text-red-400 ml-1">*</span>
          </label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`
                w-full pl-10 pr-20 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                ${errors.amount ? 'border-red-500' : 'border-white/20'}
              `}
              placeholder={locale === "en" ? "Enter investment amount" : "输入投资金额"}
              min="0"
              step="1000"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value="CNY" className="bg-gray-800">CNY</option>
                <option value="USD" className="bg-gray-800">USD</option>
                <option value="EUR" className="bg-gray-800">EUR</option>
              </select>
            </div>
          </div>
          
          {errors.amount && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.amount}
            </p>
          )}

          {/* Amount Suggestions */}
          {projectInfo && (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                {locale === "en" ? "Quick Select:" : "快速选择："}
              </p>
              <div className="flex flex-wrap gap-2">
                {getAmountSuggestions().map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleInputChange('amount', amount)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expected Return Calculation */}
        {formData.amount > 0 && projectInfo && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="text-green-400 font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {locale === "en" ? "Expected Return" : "预期收益"}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300">
                  {locale === "en" ? "Investment Amount" : "投资金额"}
                </p>
                <p className="text-white font-medium">{formatCurrency(formData.amount)}</p>
              </div>
              <div>
                <p className="text-gray-300">
                  {locale === "en" ? "Expected Return" : "预期收益"}
                </p>
                <p className="text-green-400 font-medium">
                  +{formatCurrency(calculateExpectedReturn())}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-green-500/20">
              <p className="text-gray-300 text-xs">
                {locale === "en" 
                  ? "* Returns are projected and not guaranteed"
                  : "* 收益为预期收益，不保证实际收益"
                }
              </p>
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {locale === "en" ? "Important Information" : "重要信息"}
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• {locale === "en" 
              ? "Investment applications are subject to approval"
              : "投资申请需要经过审核批准"
            }</li>
            <li>• {locale === "en" 
              ? "Processing time is typically 3-5 business days"
              : "处理时间通常为3-5个工作日"
            }</li>
            <li>• {locale === "en" 
              ? "All investments carry risk of loss"
              : "所有投资都存在损失风险"
            }</li>
            <li>• {locale === "en" 
              ? "You will be notified of the application status via email"
              : "我们将通过邮件通知您申请状态"
            }</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors"
            disabled={loading}
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          
          <button
            type="submit"
            disabled={loading || isValidating || !formData.amount}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === "en" ? "Submitting..." : "提交中..."}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {locale === "en" ? "Submit Application" : "提交申请"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}