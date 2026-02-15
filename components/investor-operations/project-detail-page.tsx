/**
 * 
 * Investment Project Detail Page Component
 * 
 * ?
 * - 
 * - 
 * - 
 * - 
 * - 
 * - 
 */

"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Building2,
  Globe,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Briefcase,
  UserCheck,
  UserX,
  Clock,
  Phone,
  GraduationCap,
  CreditCard,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import {
  ProjectPhase,
  ProjectType,
  IndustryType,
  ExpenseCategory,
  TenureCategory,
  EmployeeStatus,
} from "@/types/investor-operations-monitoring";


// 
interface ProjectDetailData {
  id: string;
  name: string;
  nameEn: string;
  type: ProjectType;
  industry: IndustryType;
  address?: string;
  platform?: string;
  currentPhase: ProjectPhase;
  phaseProgress: number;
  investedAmount: number;
  shareholdingRatio: number;
  startDate: Date;
  operatingStartDate?: Date;
  dailyOperations: {
    date: Date;
    revenue: number;
    expenses: number;
    profit: number;
    customerCount: number;
  };
  expenseBreakdown: Array<{
    category: ExpenseCategory;
    amount: number;
    description: string;
  }>;
  annualExpenses: {
    rent: number;
    utilities: number;
    taxes: number;
    insurance: number;
    maintenance: number;
  };
  employeeStats: {
    totalCount: number;
    activeCount: number;
    onLeaveCount: number;
    vacantPositions: number;
    vacantPositionNames: string[];
  };
  dailyAttendance: {
    onDuty: number;
    onLeave: number;
    absent: number;
  };
  employees: Array<EmployeeDetail>;
  salaryTransparency: {
    totalLaborCost: number;
    averageSalary: number;
    salaryComposition: {
      baseSalary: number;
      bonus: number;
      allowance: number;
      overtimePay: number;
    };
    socialInsurance: {
      pension: number;
      medical: number;
      unemployment: number;
      workInjury: number;
      maternity: number;
      housingFund: number;
    };
  };
  profitLossAnalysis: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    profitMargin: number;
    roi: number;
    estimatedPaybackMonths: number;
    monthlyTrend: Array<{
      month: string;
      revenue: number;
      expenses: number;
      profit: number;
    }>;
  };
}

interface EmployeeDetail {
  id: string;
  name: string;
  gender: string;
  age: number;
  position: string;
  department: string;
  education: string;
  hireDate: Date;
  tenure: TenureCategory;
  phone: string;
  emergencyContact: string;
  address: string;
  idLast4: string;
  recruitmentChannel: string;
  status: EmployeeStatus;
  salary: {
    baseSalary: number;
    bonus: number;
    allowance: number;
    overtimePay: number;
  };
  trainingRecords: string[];
}

interface ProjectDetailPageProps {
  projectId: string;
}

type TabType = 'overview' | 'operations' | 'expenses' | 'employees' | 'salary' | 'profitLoss';


export function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [projectData, setProjectData] = useState<ProjectDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    fetchProjectDetail();
  }, [projectId]);

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/detail`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch project detail');
      }
      
      setProjectData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN');
  };

  const getPhaseLabel = (phase: ProjectPhase) => {
    const labels: Record<ProjectPhase, { zh: string; en: string }> = {
      [ProjectPhase.DESIGN]: { zh: '设计阶段', en: 'Design Phase' },
      [ProjectPhase.RENOVATION]: { zh: '装修阶段', en: 'Renovation Phase' },
      [ProjectPhase.PRE_OPENING]: { zh: '筹备阶段', en: 'Pre-Opening' },
      [ProjectPhase.OPERATING]: { zh: '运营中', en: 'Operating' },
    };
    return locale === 'en' ? labels[phase].en : labels[phase].zh;
  };

  const getIndustryLabel = (industry: IndustryType) => {
    const labels: Record<IndustryType, { zh: string; en: string }> = {
      [IndustryType.CATERING]: { zh: '', en: 'Catering' },
      [IndustryType.RETAIL]: { zh: '', en: 'Retail' },
      [IndustryType.SERVICE]: { zh: '', en: 'Service' },
      [IndustryType.TECHNOLOGY]: { zh: '', en: 'Technology' },
      [IndustryType.EDUCATION]: { zh: '', en: 'Education' },
      [IndustryType.HEALTHCARE]: { zh: '', en: 'Healthcare' },
      [IndustryType.OTHER]: { zh: '', en: 'Other' },
    };
    return locale === 'en' ? labels[industry].en : labels[industry].zh;
  };

  const getExpenseCategoryLabel = (category: ExpenseCategory) => {
    const labels: Record<ExpenseCategory, { zh: string; en: string }> = {
      [ExpenseCategory.RAW_MATERIALS]: { zh: '原材料', en: 'Raw Materials' },
      [ExpenseCategory.LABOR]: { zh: '人工', en: 'Labor' },
      [ExpenseCategory.RENT]: { zh: '租金', en: 'Rent' },
      [ExpenseCategory.UTILITIES]: { zh: '水电', en: 'Utilities' },
      [ExpenseCategory.MARKETING]: { zh: '营销', en: 'Marketing' },
      [ExpenseCategory.EQUIPMENT]: { zh: '设备', en: 'Equipment' },
      [ExpenseCategory.MAINTENANCE]: { zh: '维护', en: 'Maintenance' },
      [ExpenseCategory.OTHER]: { zh: '', en: 'Other' },
    };
    return locale === 'en' ? labels[category].en : labels[category].zh;
  };

  const tabs: { id: TabType; label: { zh: string; en: string }; icon: React.ElementType }[] = [
    { id: 'overview', label: { zh: '', en: 'Overview' }, icon: Building2 },
    { id: 'operations', label: { zh: '', en: 'Daily Operations' }, icon: BarChart3 },
    { id: 'expenses', label: { zh: '', en: 'Expenses' }, icon: CreditCard },
    { id: 'employees', label: { zh: '', en: 'Employees' }, icon: Users },
    { id: 'salary', label: { zh: '', en: 'Salary' }, icon: DollarSign },
    { id: 'profitLoss', label: { zh: '', en: 'Profit/Loss' }, icon: PieChart },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="purple-gradient-card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="purple-gradient-title text-xl font-semibold mb-2">
          {locale === 'en' ? 'Error Loading Project' : ''}
        </h3>
        <p className="purple-gradient-subtitle mb-4">{error}</p>
        <button onClick={fetchProjectDetail} className="purple-gradient-button">
          {locale === 'en' ? 'Retry' : ''}
        </button>
      </div>
    );
  }

  if (!projectData) {
    return null;
  }


  // 
  const renderOverview = () => (
    <div className="space-y-6">
      {/*  */}
      <div className="purple-gradient-card p-6">
        <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {locale === 'en' ? 'Basic Information' : ''}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Project Type' : ''}</p>
            <p className="purple-gradient-text font-medium flex items-center gap-2">
              {projectData.type === ProjectType.PHYSICAL ? (
                <><Building2 className="w-4 h-4" /> {locale === 'en' ? 'Physical' : '实体项目'}</>
              ) : (
                <><Globe className="w-4 h-4" /> {locale === 'en' ? 'Online' : '线上项目'}</>
              )}
            </p>
          </div>
          <div>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Industry' : ''}</p>
            <p className="purple-gradient-text font-medium">{getIndustryLabel(projectData.industry)}</p>
          </div>
          <div>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Current Phase' : ''}</p>
            <p className="purple-gradient-text font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {getPhaseLabel(projectData.currentPhase)}
            </p>
          </div>
          <div>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Shareholding' : ''}</p>
            <p className="purple-gradient-text font-medium">{projectData.shareholdingRatio}%</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 purple-gradient-icon" />
            <span className="purple-gradient-subtitle">
              {projectData.address || projectData.platform}
            </span>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="purple-gradient-stat text-center">
          <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{formatCurrency(projectData.investedAmount)}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Invested Amount' : ''}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <Calendar className="w-6 h-6 text-white mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{formatDate(projectData.startDate)}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Start Date' : '开始日期'}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-green-400">{projectData.profitLossAnalysis.roi.toFixed(1)}%</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'ROI' : '投资回报率'}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-white">{projectData.profitLossAnalysis.estimatedPaybackMonths}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Payback (months)' : '(?'}</p>
        </div>
      </div>

      {/*  */}
      <div className="purple-gradient-card p-6">
        <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {locale === 'en' ? "Today's Summary" : ''}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Revenue' : ''}</p>
            <p className="text-xl font-bold text-green-400">{formatCurrency(projectData.dailyOperations.revenue)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Expenses' : ''}</p>
            <p className="text-xl font-bold text-red-400">{formatCurrency(projectData.dailyOperations.expenses)}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Profit' : ''}</p>
            <p className={`text-xl font-bold ${projectData.dailyOperations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(projectData.dailyOperations.profit)}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Customers' : '客户数量'}</p>
            <p className="text-xl font-bold text-white">{projectData.dailyOperations.customerCount}</p>
          </div>
        </div>
      </div>
    </div>
  );


  // 
  const renderOperations = () => (
    <div className="space-y-6">
      <div className="purple-gradient-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="purple-gradient-title text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {locale === 'en' ? 'Daily Operations Data' : ''}
          </h3>
          <span className="purple-gradient-subtitle text-sm">
            {formatDate(projectData.dailyOperations.date)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(projectData.dailyOperations.revenue)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Daily Revenue' : ''}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{formatCurrency(projectData.dailyOperations.expenses)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Daily Expenses' : ''}</p>
          </div>
          <div className="text-center">
            <div className={`w-16 h-16 ${projectData.dailyOperations.profit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <DollarSign className={`w-8 h-8 ${projectData.dailyOperations.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
            </div>
            <p className={`text-2xl font-bold ${projectData.dailyOperations.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
              {formatCurrency(projectData.dailyOperations.profit)}
            </p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Daily Profit' : ''}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{projectData.dailyOperations.customerCount}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Customers' : ''}</p>
          </div>
        </div>
      </div>

      {/*  */}
      <div className="purple-gradient-card p-6">
        <h4 className="purple-gradient-title font-semibold mb-4">{locale === 'en' ? 'Profit Margin' : '利润率'}</h4>
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full rounded-full ${
              projectData.dailyOperations.profit >= 0 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${Math.min(Math.abs((projectData.dailyOperations.profit / projectData.dailyOperations.revenue) * 100), 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="purple-gradient-subtitle text-sm">0%</span>
          <span className={`font-semibold ${projectData.dailyOperations.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {((projectData.dailyOperations.profit / projectData.dailyOperations.revenue) * 100).toFixed(1)}%
          </span>
          <span className="purple-gradient-subtitle text-sm">100%</span>
        </div>
      </div>
    </div>
  );


  // 
  const renderExpenses = () => {
    const totalDailyExpenses = projectData.expenseBreakdown.reduce((sum, item) => sum + item.amount, 0);
    const totalAnnualExpenses = Object.values(projectData.annualExpenses).reduce((sum, val) => sum + val, 0);
    
    return (
      <div className="space-y-6">
        {/*  */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {locale === 'en' ? 'Daily Expense Breakdown' : ''}
          </h3>
          <div className="space-y-3">
            {projectData.expenseBreakdown.map((expense, index) => {
              const percentage = (expense.amount / totalDailyExpenses) * 100;
              return (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="purple-gradient-text font-medium">
                      {getExpenseCategoryLabel(expense.category)}
                    </span>
                    <span className="text-white font-semibold">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="purple-gradient-subtitle text-sm w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                  <p className="purple-gradient-subtitle text-sm mt-1">{expense.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
            <span className="purple-gradient-title font-semibold">{locale === 'en' ? 'Total Daily' : ''}</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalDailyExpenses)}</span>
          </div>
        </div>

        {/*  */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {locale === 'en' ? 'Annual Fixed Expenses' : ''}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Rent' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(projectData.annualExpenses.rent)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Utilities' : '水电费'}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(projectData.annualExpenses.utilities)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Taxes' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(projectData.annualExpenses.taxes)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Insurance' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(projectData.annualExpenses.insurance)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Maintenance' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(projectData.annualExpenses.maintenance)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
            <span className="purple-gradient-title font-semibold">{locale === 'en' ? 'Total Annual' : ''}</span>
            <span className="text-xl font-bold text-white">{formatCurrency(totalAnnualExpenses)}</span>
          </div>
        </div>
      </div>
    );
  };


  // 
  const renderEmployees = () => (
    <div className="space-y-6">
      {/*  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="purple-gradient-stat text-center">
          <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{projectData.employeeStats.totalCount}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Total Employees' : ''}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <UserCheck className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-400">{projectData.dailyAttendance.onDuty}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'On Duty' : ''}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{projectData.dailyAttendance.onLeave}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'On Leave' : ''}</p>
        </div>
        <div className="purple-gradient-stat text-center">
          <UserX className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-400">{projectData.employeeStats.vacantPositions}</p>
          <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Vacant Positions' : ''}</p>
        </div>
      </div>

      {/*  */}
      {projectData.employeeStats.vacantPositions > 0 && (
        <div className="purple-gradient-card p-4">
          <h4 className="purple-gradient-title font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            {locale === 'en' ? 'Vacant Positions' : ''}
          </h4>
          <div className="flex flex-wrap gap-2">
            {projectData.employeeStats.vacantPositionNames.map((name, index) => (
              <span key={index} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/*  */}
      <div className="purple-gradient-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="purple-gradient-title text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            {locale === 'en' ? 'Employee List' : ''}
          </h3>
          <button 
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="flex items-center gap-2 text-sm purple-gradient-subtitle hover:text-white transition-colors"
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSensitiveData ? (locale === 'en' ? 'Hide Details' : '') : (locale === 'en' ? 'Show Details' : '')}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Name' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Gender' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Age' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Position' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Education' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Hire Date' : ''}</th>
                <th className="text-left py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Phone' : ''}</th>
                <th className="text-center py-3 px-2 purple-gradient-subtitle text-sm font-medium">{locale === 'en' ? 'Action' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {projectData.employees.map((employee) => (
                <tr key={employee.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-2 text-white font-medium">{employee.name}</td>
                  <td className="py-3 px-2 purple-gradient-text">{employee.gender}</td>
                  <td className="py-3 px-2 purple-gradient-text">{employee.age}</td>
                  <td className="py-3 px-2 purple-gradient-text">{employee.position}</td>
                  <td className="py-3 px-2 purple-gradient-text">{employee.education}</td>
                  <td className="py-3 px-2 purple-gradient-text">{formatDate(employee.hireDate)}</td>
                  <td className="py-3 px-2 purple-gradient-text">{showSensitiveData ? employee.phone : '***'}</td>
                  <td className="py-3 px-2 text-center">
                    <button 
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 purple-gradient-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/*  */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEmployee(null)}>
          <div className="purple-gradient-card max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="purple-gradient-title text-xl font-semibold">{selectedEmployee.name}</h3>
                <button onClick={() => setSelectedEmployee(null)} className="p-1 hover:bg-white/10 rounded">
                  <UserX className="w-5 h-5 purple-gradient-icon" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Gender' : ''}</p><p className="text-white">{selectedEmployee.gender}</p></div>
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Age' : ''}</p><p className="text-white">{selectedEmployee.age}</p></div>
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Education' : ''}</p><p className="text-white">{selectedEmployee.education}</p></div>
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Position' : ''}</p><p className="text-white">{selectedEmployee.position}</p></div>
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Department' : ''}</p><p className="text-white">{selectedEmployee.department}</p></div>
                  <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Hire Date' : ''}</p><p className="text-white">{formatDate(selectedEmployee.hireDate)}</p></div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="purple-gradient-title font-semibold mb-2">{locale === 'en' ? 'Contact Info' : ''}</h4>
                  <div className="space-y-2">
                    <p className="purple-gradient-text flex items-center gap-2"><Phone className="w-4 h-4" /> {selectedEmployee.phone}</p>
                    <p className="purple-gradient-text"><span className="purple-gradient-subtitle">{locale === 'en' ? 'Emergency:' : ':'}</span> {selectedEmployee.emergencyContact}</p>
                    <p className="purple-gradient-text"><span className="purple-gradient-subtitle">{locale === 'en' ? 'Address:' : ':'}</span> {selectedEmployee.address}</p>
                    <p className="purple-gradient-text"><span className="purple-gradient-subtitle">{locale === 'en' ? 'ID Last 4:' : ':'}</span> {selectedEmployee.idLast4}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="purple-gradient-title font-semibold mb-2">{locale === 'en' ? 'Salary Details' : ''}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Base Salary' : ''}</p><p className="text-white">{formatCurrency(selectedEmployee.salary.baseSalary)}</p></div>
                    <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Bonus' : ''}</p><p className="text-white">{formatCurrency(selectedEmployee.salary.bonus)}</p></div>
                    <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Allowance' : ''}</p><p className="text-white">{formatCurrency(selectedEmployee.salary.allowance)}</p></div>
                    <div><p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Overtime' : '加班费'}</p><p className="text-white">{formatCurrency(selectedEmployee.salary.overtimePay)}</p></div>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="purple-gradient-title font-semibold mb-2">{locale === 'en' ? 'Training Records' : ''}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.trainingRecords.map((record, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-white rounded-full text-sm">{record}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  // 
  const renderSalary = () => {
    const { salaryTransparency } = projectData;
    const totalSalaryComp = salaryTransparency.salaryComposition.baseSalary + 
      salaryTransparency.salaryComposition.bonus + 
      salaryTransparency.salaryComposition.allowance + 
      salaryTransparency.salaryComposition.overtimePay;
    const totalInsurance = Object.values(salaryTransparency.socialInsurance).reduce((sum, val) => sum + val, 0);
    
    return (
      <div className="space-y-6">
        {/*  */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="purple-gradient-stat text-center">
            <DollarSign className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatCurrency(salaryTransparency.totalLaborCost)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Total Labor Cost' : '总人工成本'}</p>
          </div>
          <div className="purple-gradient-stat text-center">
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">{formatCurrency(salaryTransparency.averageSalary)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Average Salary' : ''}</p>
          </div>
          <div className="purple-gradient-stat text-center">
            <CreditCard className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatCurrency(totalInsurance)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Social Insurance' : ''}</p>
          </div>
        </div>

        {/*  */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            {locale === 'en' ? 'Salary Composition' : ''}
          </h3>
          <div className="space-y-3">
            {[
              { label: locale === 'en' ? 'Base Salary' : '', value: salaryTransparency.salaryComposition.baseSalary, color: 'blue' },
              { label: locale === 'en' ? 'Bonus' : '', value: salaryTransparency.salaryComposition.bonus, color: 'green' },
              { label: locale === 'en' ? 'Allowance' : '', value: salaryTransparency.salaryComposition.allowance, color: 'purple' },
              { label: locale === 'en' ? 'Overtime Pay' : '加班费', value: salaryTransparency.salaryComposition.overtimePay, color: 'yellow' },
            ].map((item, index) => {
              const percentage = (item.value / totalSalaryComp) * 100;
              return (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="purple-gradient-text font-medium">{item.label}</span>
                    <span className="text-white font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${item.color}-500 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="purple-gradient-subtitle text-sm w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 社保详情 */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {locale === 'en' ? 'Social Insurance Details' : '社保详情'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Pension' : '养老保险'}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.pension)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Medical' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.medical)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Unemployment' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.unemployment)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Work Injury' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.workInjury)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Maternity' : ''}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.maternity)}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="purple-gradient-subtitle text-sm mb-1">{locale === 'en' ? 'Housing Fund' : '住房公积金'}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(salaryTransparency.socialInsurance.housingFund)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // 
  const renderProfitLoss = () => {
    const { profitLossAnalysis } = projectData;
    const isProfit = profitLossAnalysis.totalProfit >= 0;
    
    return (
      <div className="space-y-6">
        {/*  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="purple-gradient-stat text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-green-400">{formatCurrency(profitLossAnalysis.totalRevenue)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Total Revenue' : ''}</p>
          </div>
          <div className="purple-gradient-stat text-center">
            <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-red-400">{formatCurrency(profitLossAnalysis.totalExpenses)}</p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Total Expenses' : ''}</p>
          </div>
          <div className="purple-gradient-stat text-center">
            <DollarSign className={`w-6 h-6 ${isProfit ? 'text-green-400' : 'text-red-400'} mx-auto mb-2`} />
            <p className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{formatCurrency(profitLossAnalysis.totalProfit)}
            </p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Total Profit' : ''}</p>
          </div>
          <div className="purple-gradient-stat text-center">
            <PieChart className="w-6 h-6 text-white mx-auto mb-2" />
            <p className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {profitLossAnalysis.profitMargin.toFixed(1)}%
            </p>
            <p className="purple-gradient-subtitle text-sm">{locale === 'en' ? 'Profit Margin' : '利润率'}</p>
          </div>
        </div>

        {/* ROI 分析 */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {locale === 'en' ? 'Investment Returns' : ''}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle 
                    cx="48" cy="48" r="40" fill="none" 
                    stroke={profitLossAnalysis.roi >= 0 ? '#22c55e' : '#ef4444'} 
                    strokeWidth="8"
                    strokeDasharray={`${Math.min(Math.abs(profitLossAnalysis.roi), 100) * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${profitLossAnalysis.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profitLossAnalysis.roi.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="purple-gradient-title font-semibold">{locale === 'en' ? 'ROI' : '投资回报率'}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-white/5 rounded-full">
                <div>
                  <p className="text-3xl font-bold text-white">{profitLossAnalysis.estimatedPaybackMonths}</p>
                  <p className="purple-gradient-subtitle text-xs">{locale === 'en' ? 'months' : '个月'}</p>
                </div>
              </div>
              <p className="purple-gradient-title font-semibold">{locale === 'en' ? 'Est. Payback' : ''}</p>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="purple-gradient-card p-6">
          <h3 className="purple-gradient-title text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {locale === 'en' ? 'Monthly Trend' : ''}
          </h3>
          <div className="space-y-4">
            {profitLossAnalysis.monthlyTrend.map((month, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="purple-gradient-title font-medium">{month.month}</span>
                  <span className={`font-semibold ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {month.profit >= 0 ? '+' : ''}{formatCurrency(month.profit)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="purple-gradient-subtitle">{locale === 'en' ? 'Revenue' : ''}</p>
                    <p className="text-green-400">{formatCurrency(month.revenue)}</p>
                  </div>
                  <div>
                    <p className="purple-gradient-subtitle">{locale === 'en' ? 'Expenses' : ''}</p>
                    <p className="text-red-400">{formatCurrency(month.expenses)}</p>
                  </div>
                  <div>
                    <p className="purple-gradient-subtitle">{locale === 'en' ? 'Margin' : '利润率'}</p>
                    <p className="text-white">{((month.profit / month.revenue) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


  //  Tab 
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'operations': return renderOperations();
      case 'expenses': return renderExpenses();
      case 'employees': return renderEmployees();
      case 'salary': return renderSalary();
      case 'profitLoss': return renderProfitLoss();
      default: return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/investor-portal" className="purple-gradient-subtitle hover:text-white transition-colors">
          {locale === 'en' ? 'Investor Portal' : '投资者门户'}
        </Link>
        <ChevronRight className="w-4 h-4 purple-gradient-icon" />
        <Link href="/investor-portal/operations" className="purple-gradient-subtitle hover:text-white transition-colors">
          {locale === 'en' ? 'Operations' : '运营管理'}
        </Link>
        <ChevronRight className="w-4 h-4 purple-gradient-icon" />
        <span className="text-white">{locale === 'en' ? projectData.nameEn : projectData.name}</span>
      </div>

      {/*  */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/investor-portal/operations" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 purple-gradient-icon" />
          </Link>
          <div>
            <h1 className="purple-gradient-title text-2xl md:text-3xl font-bold">
              {locale === 'en' ? projectData.nameEn : projectData.name}
            </h1>
            <p className="purple-gradient-subtitle flex items-center gap-2 mt-1">
              {projectData.type === ProjectType.PHYSICAL ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              {getIndustryLabel(projectData.industry)} ?{projectData.shareholdingRatio}% {locale === 'en' ? 'ownership' : ''}
            </p>
          </div>
        </div>
        <button onClick={fetchProjectDetail} className="purple-gradient-button flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          {locale === 'en' ? 'Refresh' : ''}
        </button>
      </div>

      {/* Tab  */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 purple-gradient-text hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'en' ? tab.label.en : tab.label.zh}</span>
            </button>
          );
        })}
      </div>

      {/* Tab  */}
      {renderTabContent()}
    </div>
  );
}

export default ProjectDetailPage;
