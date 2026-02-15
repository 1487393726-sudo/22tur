'use client';

/**
 * 投资者运营监控门户组件
 * Investor Operations Portal Component
 * 
 * 提供项目概览仪表板、快速导航和预警展示
 * 需求: 全系统集成
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  PieChart,
  UserCheck,
  ClipboardList,
  Building,
  Globe,
  X
} from 'lucide-react';
import { ProjectType, ProjectPhase, IndustryType } from '@/types/investor-operations-monitoring';

/**
 * 项目概览数据
 */
interface ProjectOverview {
  id: string;
  name: string;
  type: ProjectType;
  industry: IndustryType;
  phase: ProjectPhase;
  progress: number;
  profitLoss: number;
  profitLossRate: number;
  employeeCount: number;
  lastUpdated: Date;
}

/**
 * 预警信息
 */
interface Alert {
  id: string;
  type: 'loss' | 'capability' | 'delay' | 'turnover';
  severity: 'high' | 'medium' | 'low';
  projectId: string;
  projectName: string;
  message: string;
  createdAt: Date;
}

/**
 * 汇总统计
 */
interface SummaryStats {
  totalProjects: number;
  activeProjects: number;
  totalInvested: number;
  totalProfitLoss: number;
  avgROI: number;
  totalEmployees: number;
  alertCount: number;
}

export function InvestorOperationsPortal() {
  const { locale } = useLanguage();
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectPlanModal, setShowProjectPlanModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 模拟数据加载 - 实际应用中从API获取
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 模拟项目数据
      setProjects([
        {
          id: '1',
          name: '智慧餐饮连锁店',
          type: ProjectType.PHYSICAL,
          industry: IndustryType.CATERING,
          phase: ProjectPhase.OPERATING,
          progress: 100,
          profitLoss: 125000,
          profitLossRate: 15.5,
          employeeCount: 45,
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: '在线教育平台',
          type: ProjectType.ONLINE,
          industry: IndustryType.EDUCATION,
          phase: ProjectPhase.OPERATING,
          progress: 100,
          profitLoss: 280000,
          profitLossRate: 22.3,
          employeeCount: 32,
          lastUpdated: new Date()
        },
        {
          id: '3',
          name: '社区零售超市',
          type: ProjectType.PHYSICAL,
          industry: IndustryType.RETAIL,
          phase: ProjectPhase.PRE_OPENING,
          progress: 85,
          profitLoss: -45000,
          profitLossRate: -8.2,
          employeeCount: 28,
          lastUpdated: new Date()
        },
        {
          id: '4',
          name: '健康科技服务',
          type: ProjectType.ONLINE,
          industry: IndustryType.HEALTHCARE,
          phase: ProjectPhase.RENOVATION,
          progress: 60,
          profitLoss: 0,
          profitLossRate: 0,
          employeeCount: 15,
          lastUpdated: new Date()
        }
      ]);

      // 模拟预警数据
      setAlerts([
        {
          id: 'a1',
          type: 'loss',
          severity: 'high',
          projectId: '3',
          projectName: '社区零售超市',
          message: locale === 'en' 
            ? 'Continuous loss for 3 months, loss rate -8.2%'
            : '连续3个月亏损，亏损率-8.2%',
          createdAt: new Date()
        },
        {
          id: 'a2',
          type: 'delay',
          severity: 'medium',
          projectId: '4',
          projectName: '健康科技服务',
          message: locale === 'en'
            ? 'Renovation phase delayed by 2 weeks'
            : '装修阶段延期2周',
          createdAt: new Date()
        }
      ]);

      // 模拟统计数据
      setStats({
        totalProjects: 4,
        activeProjects: 2,
        totalInvested: 2500000,
        totalProfitLoss: 360000,
        avgROI: 14.4,
        totalEmployees: 120,
        alertCount: 2
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
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

  const getPhaseLabel = (phase: ProjectPhase) => {
    const labels = {
      [ProjectPhase.DESIGN]: locale === 'en' ? 'Design' : '设计阶段',
      [ProjectPhase.RENOVATION]: locale === 'en' ? 'Renovation' : '装修阶段',
      [ProjectPhase.PRE_OPENING]: locale === 'en' ? 'Pre-Opening' : '开业准备',
      [ProjectPhase.OPERATING]: locale === 'en' ? 'Operating' : '正式运营'
    };
    return labels[phase] || phase;
  };

  const getPhaseColor = (phase: ProjectPhase) => {
    const colors = {
      [ProjectPhase.DESIGN]: 'bg-blue-500/20 text-blue-300',
      [ProjectPhase.RENOVATION]: 'bg-yellow-500/20 text-yellow-300',
      [ProjectPhase.PRE_OPENING]: 'bg-purple-500/20 text-white',
      [ProjectPhase.OPERATING]: 'bg-green-500/20 text-green-300'
    };
    return colors[phase] || 'bg-gray-500/20 text-gray-300';
  };

  const getTypeIcon = (type: ProjectType) => {
    return type === ProjectType.PHYSICAL ? Building : Globe;
  };

  const getAlertIcon = (type: string) => {
    const icons = {
      loss: TrendingDown,
      capability: ClipboardList,
      delay: Clock,
      turnover: Users
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      low: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Activity className="w-8 h-8 text-white animate-pulse" />
      </div>
    );
  }

  // Handle case when there are no projects/investments
  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-8">
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {locale === 'en' ? 'No Investments Yet' : '暂无投资项目'}
            </h3>
            <p className="text-white/60 mb-6">
              {locale === 'en' 
                ? 'You don\'t have any investment projects yet. Start by exploring investment opportunities.'
                : '您还没有任何投资项目。请先浏览投资机会。'
              }
            </p>
            <div className="flex gap-3 justify-center">
              <Link 
                href="/investment-opportunities"
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {locale === 'en' ? 'Explore Opportunities' : '探索投资机会'}
              </Link>
              <button
                onClick={() => setShowProjectPlanModal(true)}
                className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                {locale === 'en' ? 'View Project Plans' : '查看项目计划'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Project Plan Modal */}
        {showProjectPlanModal && (
          <ProjectPlanModal 
            locale={locale}
            onClose={() => setShowProjectPlanModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard
            icon={Briefcase}
            label={locale === 'en' ? 'Total Projects' : '项目总数'}
            value={stats.totalProjects.toString()}
            color="blue"
          />
          <StatCard
            icon={Activity}
            label={locale === 'en' ? 'Active' : '运营中'}
            value={stats.activeProjects.toString()}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            label={locale === 'en' ? 'Invested' : '总投资'}
            value={formatCurrency(stats.totalInvested)}
            color="purple"
            small
          />
          <StatCard
            icon={TrendingUp}
            label={locale === 'en' ? 'Profit/Loss' : '盈亏'}
            value={formatCurrency(stats.totalProfitLoss)}
            color={stats.totalProfitLoss >= 0 ? 'green' : 'red'}
            small
          />
          <StatCard
            icon={BarChart3}
            label={locale === 'en' ? 'Avg ROI' : '平均ROI'}
            value={`${stats.avgROI.toFixed(1)}%`}
            color="yellow"
          />
          <StatCard
            icon={Users}
            label={locale === 'en' ? 'Employees' : '员工'}
            value={stats.totalEmployees.toString()}
            color="indigo"
          />
          <StatCard
            icon={AlertTriangle}
            label={locale === 'en' ? 'Alerts' : '预警'}
            value={stats.alertCount.toString()}
            color={stats.alertCount > 0 ? 'red' : 'green'}
          />
        </div>
      )}

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickNavCard
          href="/investor-portal/operations/lifecycle"
          icon={Briefcase}
          title={locale === 'en' ? 'Project Lifecycle' : '项目生命周期'}
          description={locale === 'en' ? 'Track phases & milestones' : '追踪阶段和里程碑'}
          color="blue"
        />
        <QuickNavCard
          href="/investor-portal/operations/profit-loss"
          icon={TrendingUp}
          title={locale === 'en' ? 'Profit & Loss' : '盈亏分析'}
          description={locale === 'en' ? 'Financial performance' : '财务表现分析'}
          color="green"
        />
        <QuickNavCard
          href="/investor-portal/operations/employees"
          icon={UserCheck}
          title={locale === 'en' ? 'Employees' : '员工透明化'}
          description={locale === 'en' ? 'Team composition' : '团队构成'}
          color="purple"
        />
        <button
          onClick={() => setShowProjectPlanModal(true)}
          className="group"
        >
          <div className="bg-white/10 hover:bg-white/15 rounded-lg p-4 transition-colors h-full">
            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30 rounded-lg flex items-center justify-center mb-3 transition-colors">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-white font-medium mb-1 text-left">
              {locale === 'en' ? 'Project Plans' : '项目计划'}
            </h3>
            <p className="text-sm text-white/60 text-left">
              {locale === 'en' ? 'View investment plans' : '查看投资计划'}
            </p>
          </div>
        </button>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              {locale === 'en' ? 'Active Alerts' : '活跃预警'}
            </CardTitle>
            <Link 
              href="/investor-portal/operations/alerts"
              className="text-sm text-white hover:text-gray-300 flex items-center gap-1"
            >
              {locale === 'en' ? 'View All' : '查看全部'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.projectName}</span>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm opacity-80">{alert.message}</p>
                    </div>
                    <Link
                      href={`/investor-portal/operations/projects/${alert.projectId}`}
                      className="text-sm hover:underline"
                    >
                      {locale === 'en' ? 'View' : '查看'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Projects Overview */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-white" />
            {locale === 'en' ? 'Projects Overview' : '项目概览'}
          </CardTitle>
          <Link 
            href="/investor-portal/operations/projects"
            className="text-sm text-white hover:text-gray-300 flex items-center gap-1"
          >
            {locale === 'en' ? 'View All' : '查看全部'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => {
              const TypeIcon = getTypeIcon(project.type);
              const isProfit = project.profitLoss >= 0;
              
              return (
                <Link
                  key={project.id}
                  href={`/investor-portal/operations/projects/${project.id}`}
                  className="block"
                >
                  <div className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{project.name}</h4>
                          <Badge className={getPhaseColor(project.phase)}>
                            {getPhaseLabel(project.phase)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{formatCurrency(project.profitLoss)}
                        </p>
                        <p className={`text-sm ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                          {isProfit ? '+' : ''}{project.profitLossRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>{locale === 'en' ? 'Progress' : '进度'}</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.employeeCount} {locale === 'en' ? 'employees' : '员工'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {locale === 'en' ? 'Updated today' : '今日更新'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project Plan Modal */}
      {showProjectPlanModal && (
        <ProjectPlanModal 
          locale={locale}
          onClose={() => setShowProjectPlanModal(false)}
        />
      )}
    </div>
  );
}

/**
 * 统计卡片组件
 */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color,
  small = false
}: { 
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
  small?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-white',
    indigo: 'bg-indigo-500/20 text-indigo-400'
  };

  return (
    <div className="bg-white/10 rounded-lg p-4 text-center">
      <div className={`w-10 h-10 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={`font-bold text-white ${small ? 'text-sm' : 'text-xl'}`}>{value}</p>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

/**
 * 快速导航卡片组件
 */
function QuickNavCard({
  href,
  icon: Icon,
  title,
  description,
  color
}: {
  href: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    green: 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30',
    purple: 'bg-purple-500/20 text-white group-hover:bg-purple-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 group-hover:bg-yellow-500/30'
  };

  return (
    <Link href={href} className="group">
      <div className="bg-white/10 hover:bg-white/15 rounded-lg p-4 transition-colors h-full">
        <div className={`w-12 h-12 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-3 transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-sm text-white/60">{description}</p>
      </div>
    </Link>
  );
}

export default InvestorOperationsPortal;

/**
 * 项目计划弹窗组件
 */
function ProjectPlanModal({ 
  locale, 
  onClose 
}: { 
  locale: string;
  onClose: () => void;
}) {
  const projectPlans = [
    {
      id: 1,
      name: locale === 'en' ? 'E-Commerce Platform' : '电商平台',
      description: locale === 'en' 
        ? 'Build a comprehensive online shopping platform with payment integration'
        : '构建集成支付功能的综合在线购物平台',
      minInvestment: 500000,
      expectedReturn: 25,
      duration: 24,
      status: 'AVAILABLE'
    },
    {
      id: 2,
      name: locale === 'en' ? 'Education Platform' : '教育平台',
      description: locale === 'en'
        ? 'Online learning platform with interactive courses and certifications'
        : '提供互动课程和认证的在线学习平台',
      minInvestment: 300000,
      expectedReturn: 20,
      duration: 18,
      status: 'AVAILABLE'
    },
    {
      id: 3,
      name: locale === 'en' ? 'Healthcare Services' : '医疗服务',
      description: locale === 'en'
        ? 'Telemedicine platform connecting patients with healthcare professionals'
        : '连接患者与医疗专业人士的远程医疗平台',
      minInvestment: 800000,
      expectedReturn: 30,
      duration: 36,
      status: 'AVAILABLE'
    },
    {
      id: 4,
      name: locale === 'en' ? 'Smart Retail' : '智能零售',
      description: locale === 'en'
        ? 'AI-powered retail management system for chain stores'
        : '为连锁店提供的人工智能零售管理系统',
      minInvestment: 600000,
      expectedReturn: 22,
      duration: 20,
      status: 'AVAILABLE'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-white/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {locale === 'en' ? 'Investment Project Plans' : '投资项目计划'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {projectPlans.map((plan) => (
            <div key={plan.id} className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-white/60">{plan.description}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {locale === 'en' ? 'Available' : '可投资'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <p className="text-xs text-white/60 mb-1">
                    {locale === 'en' ? 'Min Investment' : '最低投资'}
                  </p>
                  <p className="font-semibold text-white">{formatCurrency(plan.minInvestment)}</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">
                    {locale === 'en' ? 'Expected Return' : '预期回报'}
                  </p>
                  <p className="font-semibold text-green-400">+{plan.expectedReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">
                    {locale === 'en' ? 'Duration' : '投资期限'}
                  </p>
                  <p className="font-semibold text-white">{plan.duration} {locale === 'en' ? 'months' : '个月'}</p>
                </div>
                <div className="flex items-end">
                  <Link
                    href={`/investment-opportunities?plan=${plan.id}`}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium w-full text-center"
                  >
                    {locale === 'en' ? 'Invest Now' : '立即投资'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-card border-t border-white/10 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white/10 text-white px-6 py-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            {locale === 'en' ? 'Close' : '关闭'}
          </button>
          <Link
            href="/investment-opportunities"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {locale === 'en' ? 'View All Plans' : '查看全部计划'}
          </Link>
        </div>
      </div>
    </div>
  );
}
